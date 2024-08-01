const ExecUtil = require('./ExecUtil');
const RetryUtil = require('./RetryUtil');
const SleepUtil = require('./SleepUtil');

class TransferWorkloadUtil {

  static async getNodepoolNodes(nodepool) {
    let result;
    try {
      result = await ExecUtil.executeCommand(`kubectl get nodes -o=jsonpath='{range .items[?(@.metadata.labels.cloud\\.google\\.com/gke-nodepool=="${nodepool}")]}{.metadata.name} {.spec.unschedulable}{"\\n"}{end}'`);
    } catch (error) {
      console.log(`Failed to get nodes assigned to nodepool ${nodepool}`);
      throw error;
    }

    const resultFormatted = result.trim().split('\n');

    return resultFormatted.map(r => {
      const values = r.split(' ');

      if (values.length <= 0) {
        throw new Error('Failed to parse node details; .metadata.name & .spec.unschedulable');
      }

      const name = values[0].trim();
      const isCordoned = values[1] ? Boolean(values[1].trim()) : false;

      return { name, isCordoned };
    });
  }

  static async getPodsByNode(node) {
    let result;
    try {
      result = await ExecUtil.executeCommand(`kubectl get pods -A --field-selector spec.nodeName=${node} -o=jsonpath='{range .items[*]}{.metadata.name} {.metadata.namespace}{"\\n"}{end}'`);
    } catch (error) {
      console.log(`Failed to get pods assigned to node ${node}`);
      throw error;
    }

    const resultFormatted = result.trim().split('\n');

    return resultFormatted.map(r => {
      const values = r.split(' ');

      if (values.length !== 2) {
        throw new Error('Failed to parse pod details; .metadata.name & .metadata.namespace');
      }

      const name = values[0].trim();
      const namespace = values[1].trim();

      return { name, namespace };
    });
  }

  static async isWorkloadTransferComplete(workload, nodes) {
    for (const node of nodes) {
      if (!node.isCordoned) {
        console.log(`Ignoring node ${node.name} since it is not cordoned.`);
        continue;
      }

      let pods;
      try {
        pods = await this.getPodsByNode(node.name);
      } catch(error) {
        console.log(`Failed to getPodsByNode()`)
      }

      for (const pod of pods) {
        if (pod.name.includes(workload)) {
          console.log(`Found ${pod.name} running on cordoned node, ${node.name}`);
          return false;
        }
      }
    }
    return true;
  }

  static async waitForWorkloadTransfer(timeoutMinutes, nodepool, workload, type, namespace) {
    console.log(`Transferring [type=${type}] ${workload} on nodepool ${nodepool}; timeout = ${timeoutMinutes} minutes`);

    let nodes = await this.getNodepoolNodes(nodepool);
    try {
      console.log(`kubectl rollout restart --namespace ${namespace} ${type}/${workload}`);
      //await ExecUtil.executeCommand(`kubectl rollout restart --namespace ${namespace} ${type}/${workload}`);
    } catch (error) {
      console.log(`Failed to execute: [kubectl rollout restart --namespace ${namespace} ${type}/${workload}]`)
      throw error;
    }
    await SleepUtil.sleepMillis(5000);

    await RetryUtil.retry(async () => {
      await ExecUtil.executeCommand(`kubectl rollout status --namespace ${namespace} ${type}/${workload} --timeout=30s`);

      try {
        nodes = await this.getNodepoolNodes(nodepool);
      } catch (error) {
        console.log(`Failed to refresh nodes.`);
      }

      const isWorkloadTransferComplete = await this.isWorkloadTransferComplete(workload, nodes);
      if (!isWorkloadTransferComplete) {
        throw new Error(`Failed to confirm workload transferred from cordoned nodes`);
      }
      }, timeoutMinutes);
  }
}

module.exports = TransferWorkloadUtil;