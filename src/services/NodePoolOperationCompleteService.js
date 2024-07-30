const ExecUtil = require('../utils/ExecUtil');
const NodePoolReadyService = require('./NodePoolReadyService');

class NodePoolOperationCompleteService {
  static async completeUpgrade(nodepool, cluster, region) {
    console.log('Waiting for node pool to be in NODE_POOL_SOAKING phase...');
    const nodePoolReady = await NodePoolReadyService.waitForNodePoolToBeReady(nodepool, cluster);
    
    if (nodePoolReady) {
      console.log('Node pool is in NODE_POOL_SOAKING phase. Completing the upgrade...');
      try {
        const result = await ExecUtil.executeCommand(`gcloud container node-pools complete-upgrade ${nodepool} --location ${region} --cluster ${cluster} --project resi-sandbox-1`);
        console.log('Completed node pool upgrade', result);
      } catch (error) {
        console.error('Error completing node pool upgrade:', error);
      }
    }
  }
}

module.exports = NodePoolOperationCompleteService;
