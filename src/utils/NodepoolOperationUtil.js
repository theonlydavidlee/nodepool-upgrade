const ExecUtil = require('./ExecUtil');
const RetryUtil = require('./RetryUtil');

class NodepoolOperationUtil {

  static async isNodePoolUpgradeReady(project, location, cluster, nodepool) {
    const readyPhase = 'NODE_POOL_SOAKING';

    let result;
    try{
      result = await ExecUtil.executeCommand(`gcloud container node-pools describe ${nodepool} --location ${location} --cluster ${cluster} --project ${project} --format json`);
    } catch(error) {
      console.error(`Failed to describe nodepool: ${error}`);
      return false;
    }

    const nodePoolJson = JSON.parse(result);
    // return nodePoolJson.updateInfo &&
    //   nodePoolJson.updateInfo.blueGreenInfo &&
    //   nodePoolJson.updateInfo.blueGreenInfo.phase === readyPhase;
    return true;
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

  static async isNodePoolUpgradeComplete(project, location, cluster, nodepool) {
    const statusRunning = 'RUNNING';

    let result;
    try{
      result = await ExecUtil.executeCommand(`gcloud container node-pools describe ${nodepool} --location ${location} --cluster ${cluster} --project ${project} --format json`);
    } catch(error) {
      console.error(`Failed to describe nodepool: ${error}`);
      return false;
    }

    const nodePoolJson = JSON.parse(result);
    // return nodePoolJson.status &&
    //   nodePoolJson.status.blueGreenInfo === statusRunning;
    // TODO check version
    return true;
  }

  static async waitForUpgradeComplete(timeoutMinutes, project, location, cluster, nodepool) {
    console.log(`Checking if nodepool ${nodepool} for cluster ${cluster} in ${location} is in Complete state; timeout = ${timeoutMinutes} minutes`);

    try {
      console.log(`gcloud container node-pools complete-upgrade ${nodepool} --project ${project} --location ${location} --cluster ${cluster}`);
      //await ExecUtil.executeCommand(`gcloud container node-pools complete-upgrade ${nodepool} --project ${project} --location ${location} --cluster ${cluster}`);
    } catch (error) {
      console.log(`Failed to execute: [gcloud container node-pools complete-upgrade ${nodepool} --project ${project} --location ${location} --cluster ${cluster}]`)
      throw error;
    }

    await RetryUtil.retry(async () => {
      const isNodePoolUpgradeComplete = await this.isNodePoolUpgradeComplete(project, location, cluster, nodepool);
      if (!isNodePoolUpgradeComplete) {
        throw new Error(`Failed to confirm nodepool is in upgrade complete phase`);
      }
    }, timeoutMinutes);
  }
}

module.exports = NodepoolOperationUtil;