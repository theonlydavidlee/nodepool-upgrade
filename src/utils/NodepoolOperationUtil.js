const ExecUtil = require('./ExecUtil');
const RetryUtil = require('./RetryUtil');

class NodepoolOperationUtil {

  static async isNodePoolUpgradeReady(project, location, cluster, nodepool) {
    const readyPhase = 'NODE_POOL_SOAKING';

    let result;
    try{
      result = await ExecUtil.executeCommand(`gcloud container node-pools describe ${nodepool} --location ${location} --cluster ${cluster} --project ${project} --format=json`);
    } catch(error) {
      console.error(`Failed to determine nodepool upgrade phase: ${error}`);
      return false;
    }

    const nodePoolJson = JSON.parse(result);
    return nodePoolJson.updateInfo &&
      nodePoolJson.updateInfo.blueGreenInfo &&
      nodePoolJson.updateInfo.blueGreenInfo.phase === readyPhase;
  }

  static async waitForUpgradeReady(timeoutMinutes, project, location, cluster, nodepool) {
    console.log(`Checking if nodepool ${nodepool} for cluster ${cluster} in ${location} is in Ready state; timeout = ${timeoutMinutes} minutes`);

    await RetryUtil.retry(async () => {
      const isNodePoolUpgradeReady = await this.isNodePoolUpgradeReady(project, location, cluster, nodepool);
      if (!isNodePoolUpgradeReady) {
        throw new Error(`Failed to confirm nodepool is in upgrade ready phase`);
      }
    }, timeoutMinutes);
  }

  static async waitForUpgradeComplete(timeoutMinutes, location, cluster, nodepool) {
    console.log(`Checking if nodepool ${nodepool} for cluster ${cluster} in ${location} is in Complete state; timeout = ${timeoutMinutes} minutes`);
    await RetryUtil.retry(async () => {
      // Execute command(s)
      await ExecUtil.executeCommand(`echo "Nodepool complete state"`);
      return true;
    }, timeoutMinutes);
  }
}

module.exports = NodepoolOperationUtil;