const NodePoolDiscoveryService = require('./NodePoolDiscoveryService');
const ExecUtil = require('../utils/ExecUtil');

class TransferWorkloadService {
  static async transferWorkload(workload, nodepool) {
    const nodes = await NodePoolDiscoveryService.getNodes(workload, nodepool);
    console.log(nodes);

    // run rollout restart... workloads/namespace

    for (const node of nodes) {
      console.log(node);
      if (node.status === 'cordoned') {
        const command = `echo "Transferring pod ${node.podName}:${node.namespace} from node ${node.nodeName} in nodepool ${nodepool}"`;
        await ExecUtil.executeCommand(command);
      }
    }
  }
}

module.exports = TransferWorkloadService;