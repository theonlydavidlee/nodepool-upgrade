const ExecUtil = require('./ExecUtil');
const RetryUtil = require('./RetryUtil');

class NodepoolOperationUtil {
  static async waitForUpgradeReady(timeoutMinutes, location, cluster, nodepool) {
    console.log(`Checking if nodepool ${nodepool} for cluster ${cluster} in ${location} is in Ready state; timeout = ${timeoutMinutes} minutes`);

    await RetryUtil.retry(async () => {
      // Execute command(s)
      await ExecUtil.executeCommand(`echo "Nodepool ready state"`);
      return false;
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