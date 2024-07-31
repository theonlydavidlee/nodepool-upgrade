const ClusterConnectionUtil = require('../utils/ClusterConnectionUtil');
const NodepoolOperationUtil = require('../utils/NodepoolOperationUtil');
const TransferWorkloadUtil = require('../utils/TransferWorkloadUtil');

class UpgradeService {
    static async completeUpgrade(payload) {
        if (!(payload && payload.data)) {
            throw new Error('Invalid payload');
        }

        const credentialsPath = '/Users/davidlee/tmp/credentials.json';

        if (!payload.data.project) {
            throw new Error('"googleProject" must be set e.g. [lao-multisite]');
        }

        if (!payload.data.location) {
            throw new Error('"location" must be set e.g. [us-central1]');
        }

        if (!payload.data.cluster) {
            throw new Error('"cluster" must be set e.g. [us-central1-1]');
        }

        if (!payload.data.nodepool) {
            throw new Error('"nodepool" must be set e.g. [int-pre-medium-disk-a]');
        }

        if (!(payload.data.workload && payload.data.workload.name && payload.data.workload.type)) {
            throw new Error('"workload" must be set e.g. [rsp-egress]');
        }

        const timeoutMinutes = 2;
        await ClusterConnectionUtil.connect(payload.data.location, payload.data.cluster, payload.data.project, credentialsPath);
        await NodepoolOperationUtil.waitForUpgradeReady(timeoutMinutes, payload.data.location, payload.data.cluster, payload.data.nodepool);
        await TransferWorkloadUtil.waitForWorkloadTransfer(timeoutMinutes, payload.data.nodepool, payload.data.workload.name, payload.data.workload.type);
        await NodepoolOperationUtil.waitForUpgradeComplete(timeoutMinutes, payload.data.location, payload.data.cluster, payload.data.nodepool);

        console.log('Upgrade completed successfully.');
    }
}

module.exports = UpgradeService;