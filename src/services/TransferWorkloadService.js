const NodePoolDiscoveryService = require('./NodePoolDiscoveryService');
const ExecUtil = require('../utils/ExecUtil');
const SleepUtil = require('../utils/SleepUtil');

class TransferWorkloadService {
  static async transferWorkload(nodepool, workload, type) {
    let nodes = await NodePoolDiscoveryService.getNodes(nodepool);
    const namespace = await this.findFirstNamespace(workload, nodes);
    console.log(nodes);
    // console.log(namespace);

    if (!namespace) {
      throw new Error('Failed to find namespace');
    }
    await ExecUtil.executeCommand(`kubectl rollout --namespace ${namespace} restart ${type}/${workload}`);

    await SleepUtil.sleepMillis(5000);
    await ExecUtil.executeCommand(`kubectl rollout --namespace ${namespace} status ${type}/${workload} --timeout=60s`);

    // TODO Add overall timeout to prevent running forever
    while (!await this.isRolloutRestartComplete(workload, nodes)) {
      console.log('Sleep (5000 ms) before re-checking rollout restart')
      await SleepUtil.sleepMillis(5000);
      nodes = await NodePoolDiscoveryService.getNodes(nodepool);
    }
    console.log(`Transfer workload ${workload} for nodepool ${nodepool.name} is complete`);
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
            // We could check the status.phase to see if this pod is in one of our expected status "Terminating"
            // kubectl get pod -n int rsp-egress-6c694584d8-tzjmb -o=jsonpath='{.status.phase}'
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
      // console.log(pods);
      for (const pod of pods) {
        if (pod.name.includes(workload)) {
          // console.log(pod);
          return pod.namespace;
        }
      }
    }
  }
}

module.exports = TransferWorkloadService;