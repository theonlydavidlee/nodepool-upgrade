const ExecUtil = require('./ExecUtil');
const RetryUtil = require('./RetryUtil');

class NodepoolOperationUtil {

  static async isNodePoolPhaseDraining(project, location, cluster, nodepool) {
    const phase = 'DRAINING_BLUE_POOL';

    let result;
    try{
      result = await ExecUtil.executeCommand(`gcloud container node-pools describe ${nodepool} --location ${location} --cluster ${cluster} --project ${project} --format json`);
    } catch(error) {
      console.error(`Failed to describe nodepool: ${error}`);
      return false;
    }

    const nodePoolJson = JSON.parse(result);
    console.log(`Checking if nodepool is in [DRAINING_BLUE_POOL] phase; found phase=[${nodePoolJson.updateInfo?.blueGreenInfo?.phase}]`);
    return nodePoolJson.updateInfo && nodePoolJson.updateInfo.blueGreenInfo && nodePoolJson.updateInfo.blueGreenInfo.phase === phase;
  }

  static async waitForUpgradeReady(timeoutMinutes, project, location, cluster, nodepool) {
    console.log(`Checking if nodepool ${nodepool} for cluster ${cluster} in ${location} is in DRAINING_BLUE_POOL phase; timeout = ${timeoutMinutes} minutes`);

    await RetryUtil.retry(async () => {
      const isNodePoolPhaseDraining = await this.isNodePoolPhaseDraining(project, location, cluster, nodepool);
      if (!isNodePoolPhaseDraining) {
        throw new Error(`Failed to confirm nodepool phase is draining`);
      }
    }, timeoutMinutes);
  }

  static async isNodePoolPhaseSoaking(project, location, cluster, nodepool) {
    const phase = 'NODE_POOL_SOAKING';

    let result;
    try{
      result = await ExecUtil.executeCommand(`gcloud container node-pools describe ${nodepool} --location ${location} --cluster ${cluster} --project ${project} --format json`);
    } catch(error) {
      console.error(`Failed to describe nodepool: ${error}`);
      return false;
    }

    const nodePoolJson = JSON.parse(result);
    console.log(`Checking if nodepool is in [NODE_POOL_SOAKING] phase; found phase=[${nodePoolJson.updateInfo?.blueGreenInfo?.phase}]`);
    return nodePoolJson.updateInfo && nodePoolJson.updateInfo.blueGreenInfo && nodePoolJson.updateInfo.blueGreenInfo.phase === phase;
  }

  static async isNodePoolUpgradeComplete(project, location, cluster, nodepool, version) {
    const status = 'RUNNING';

    let result;
    try{
      result = await ExecUtil.executeCommand(`gcloud container node-pools describe ${nodepool} --location ${location} --cluster ${cluster} --project ${project} --format json`);
    } catch(error) {
      console.error(`Failed to describe nodepool: ${error}`);
      return false;
    }

    const nodePoolJson = JSON.parse(result);
    console.log(`Checking if nodepool upgrade is complete; expecting version=[${version}]; found status=[${nodePoolJson.status}] and version=[${nodePoolJson.version}]`);
    return nodePoolJson.status && nodePoolJson.version && nodePoolJson.status === status  && nodePoolJson.version === version;
  }

  static async waitForUpgradeComplete(timeoutMinutes, project, location, cluster, nodepool, version) {
    console.log(`Checking if nodepool ${nodepool} for cluster ${cluster} in ${location} is ready to complete; timeout = ${timeoutMinutes * 2} minutes`);

    await RetryUtil.retry(async () => {
      const isNodePoolPhaseSoaking = await this.isNodePoolPhaseSoaking(project, location, cluster, nodepool);
      if (!isNodePoolPhaseSoaking) {
        throw new Error(`Failed to confirm nodepool phase is soaking`);
      }
    }, timeoutMinutes);

    try {
      // Uncomment this console log and comment the subsequent ExecUtil command to mock out actual complete command
      // console.log(`gcloud container node-pools complete-upgrade ${nodepool} --project ${project} --location ${location} --cluster ${cluster}`);
      await ExecUtil.executeCommand(`gcloud container node-pools complete-upgrade ${nodepool} --project ${project} --location ${location} --cluster ${cluster}`);
    } catch (error) {
      console.log(`Failed to execute: [gcloud container node-pools complete-upgrade ${nodepool} --project ${project} --location ${location} --cluster ${cluster}]`)
      throw error;
    }

    await RetryUtil.retry(async () => {
      const isNodePoolUpgradeComplete = await this.isNodePoolUpgradeComplete(project, location, cluster, nodepool, version);
      if (!isNodePoolUpgradeComplete) {
        throw new Error(`Failed to confirm nodepool is in upgrade complete state`);
      }
    }, timeoutMinutes);
  }
}

module.exports = NodepoolOperationUtil;