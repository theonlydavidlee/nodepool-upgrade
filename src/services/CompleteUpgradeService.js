const TransferWorkloadService = require('./TransferWorkloadService');
const NodePoolOperationCompleteService = require('./NodePoolOperationCompleteService');

class CompleteUpgradeService {
    static async completeUpgrade(upgradeObj) {
        const { nodepool, cluster, location } = upgradeObj;
        const workload = 'rsp-egress'

        await TransferWorkloadService.transferWorkload(workload, nodepool);
        await NodePoolOperationCompleteService.completeUpgrade(nodepool, cluster, location);
        console.log('Upgrade completed successfully.');
    }
}

module.exports = CompleteUpgradeService;
