const ExecUtil = require('./ExecUtil');
const RetryUtil = require('./RetryUtil');

class TransferWorkloadUtil {
  static async transfer(timeoutMinutes, nodepool, workload, type) {
    console.log(`Transferring [type=${type}] ${workload} on nodepool ${nodepool}; timeout = ${timeoutMinutes} minutes`);

    await RetryUtil.retry(async () => {
      // Execute command(s)
      await ExecUtil.executeCommand(`echo "Transfer workload"`);
      return true;
    }, timeoutMinutes);
  }
}

module.exports = TransferWorkloadUtil;