const ExecUtil = require('../utils/ExecUtil');

class NodePoolOperationCompleteService {
  static async completeUpgrade(nodepool, cluster, region) {
    try {
      console.log('Executing gcloud container node-pools complete-upgrade command');
      await ExecUtil.executeCommand(`gcloud container node-pools complete-upgrade sandbox-medium-disk-a --location us-central1 --cluster sandbox-test --project resi-sandbox-1`);
      console.log('Node pool upgrade completed successfully.');
    } catch (error) {
      console.error(`Error completing node pool upgrade: ${error.message}`);
      throw error;
    }
  }
}

module.exports = NodePoolOperationCompleteService;
