const ExecUtil = require('../utils/ExecUtil');

class NodePoolOperationCompleteService {
  static completeUpgrade(nodepool, cluster, region) {
    const command = `echo "Completing upgrade for nodepool ${nodepool} in cluster ${cluster}, region ${region}"`;
    return ExecUtil.executeCommand(command);
  }
}

module.exports = NodePoolOperationCompleteService;