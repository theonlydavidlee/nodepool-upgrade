const NodePoolDiscoveryService = require('./NodePoolDiscoveryService');
const ExecUtil = require('../utils/ExecUtil');
const SleepUtil = require('../utils/SleepUtil');
const NodePoolOperationCompleteService = require('./NodePoolOperationCompleteService');

class TransferWorkloadService {
  static async transferWorkload(nodepool, workload, type, cluster) {
    let nodes = await NodePoolDiscoveryService.getNodes(nodepool);
    const namespace = await this.findFirstNamespace(workload, nodes);
    console.log(nodes);

    if (!namespace) {
      throw new Error('Failed to find namespace');
    }

    try {
      console.log(`Executing kubectl rollout restart for ${type}/${workload} in namespace ${namespace}`);
      await ExecUtil.executeCommand(`kubectl rollout restart --namespace ${namespace} ${type}/${workload}`);
    } catch (error) {
      console.error(`Error executing kubectl rollout restart: ${error.message}`);
      throw error;
    }

    await SleepUtil.sleepMillis(60000);

    try {
      console.log(`Executing kubectl rollout status for ${type}/${workload} in namespace ${namespace}`);
      await this.waitForRolloutCompletion(namespace, type, workload);
    } catch (error) {
      console.error(`Error executing kubectl rollout status: ${error.message}`);
      throw error;
    }

    while (!await this.isRolloutRestartComplete(workload, nodes)) {
      console.log('Workload is still running on the cordoned node. Sleeping for 60 seconds before re-checking.');
      await SleepUtil.sleepMillis(60000);
      nodes = await NodePoolDiscoveryService.getNodes(nodepool);
    }

    console.log(`Transfer workload ${workload} for nodepool ${nodepool.name} is complete`);
    await NodePoolOperationCompleteService.completeUpgrade(nodepool, cluster);
  }

  static async waitForRolloutCompletion(namespace, type, workload) {
    const maxAttempts = 12;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        await ExecUtil.executeCommand(`kubectl rollout status --namespace ${namespace} ${type}/${workload} --timeout=60s`);
        console.log(`Rollout status for ${type}/${workload} in namespace ${namespace} is complete.`);
        return;
      } catch (error) {
        attempts++;
        console.error(`Attempt ${attempts}/${maxAttempts} - Error waiting for rollout status: ${error.message}`);
        if (attempts >= maxAttempts) {
          throw new Error('Max attempts reached. Rollout status check failed.');
        }
      }
    }
  }

  static async getPodsByNode(name) {
    const result = await ExecUtil.executeCommand(`kubectl get pods -A --field-selector spec.nodeName=${name} -o=jsonpath='{range .items[*]}{.metadata.name} {.metadata.namespace}{"\\n"}{end}'`);
    const resultFormatted = result.trim().split('\n');
    return resultFormatted.map(r => {
      const [name, namespace] = r.split(' ');
      return { name, namespace };
    });
  }

  static async isRolloutRestartComplete(workload, nodes) {
    for (const node of nodes) {
      if (node.isCordoned !== 'true') {
        console.log(`Ignoring node ${node.name} since it is not cordoned.`);
        continue;
      }

      const pods = await this.getPodsByNode(node.name);
      for (const pod of pods) {
        if (pod.name.includes(workload)) {
          console.log(`Found ${pod.name} running on cordoned node, ${node.name}`);
          return false;
        }
      }
      return true;
    }
  }

  static async findFirstNamespace(workload, nodes) {
    for (const node of nodes) {
      const pods = await this.getPodsByNode(node.name);
      for (const pod of pods) {
        if (pod.name.includes(workload)) {
          return pod.namespace;
        }
      }
    }
  }
}

module.exports = TransferWorkloadService;
