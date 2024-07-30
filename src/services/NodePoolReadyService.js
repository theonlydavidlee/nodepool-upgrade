const ExecUtil = require('../utils/ExecUtil');

class NodePoolReadyService {
  static async waitForNodePoolToBeReady(nodepool, cluster) {
    const isNodePoolInSoakingPhase = async () => {
      try {
        const result = await ExecUtil.executeCommand(`gcloud container node-pools describe ${nodepool} --location us-central1 --cluster ${cluster} --project resi-sandbox-1 --format=json`);
        const nodePool = JSON.parse(result);
        return nodePool.updateInfo &&
               nodePool.updateInfo.blueGreenInfo &&
               nodePool.updateInfo.blueGreenInfo.phase === 'NODE_POOL_SOAKING';
      } catch (error) {
        console.error(`Error checking node pool phase: ${error}`);
        return false;
      }
    };

    const checkSoakingPhase = async (callback) => {
      const nodePoolInSoakingPhase = await isNodePoolInSoakingPhase();
      if (nodePoolInSoakingPhase) {
        console.log('Node pool is in NODE_POOL_SOAKING phase.');
        callback(true);
      } else {
        console.log('Node pool is not in NODE_POOL_SOAKING phase, rechecking in 60 seconds...');
        setTimeout(() => checkSoakingPhase(callback), 60000); // Retry after 60 seconds
      }
    };

    return new Promise((resolve) => {
      checkSoakingPhase(resolve);
    });
  }
}

module.exports = NodePoolReadyService;
