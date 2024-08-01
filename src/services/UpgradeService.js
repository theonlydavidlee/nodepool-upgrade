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

        if (!(payload.data.workload && payload.data.workload.name && payload.data.workload.type && payload.data.workload.namespace)) {
            throw new Error('"workload" must be set e.g. [rsp-egress]');
        }

        const timeoutMinutes = 2;
        try {
            await ClusterConnectionUtil.connect(payload.data.location, payload.data.cluster, payload.data.project, credentialsPath);
        } catch(error) {
            console.log(`Failed to setup service account and connect to the cluster`);
            throw error;
        }

        try {
            await NodepoolOperationUtil.waitForUpgradeReady(timeoutMinutes, payload.data.project, payload.data.location, payload.data.cluster, payload.data.nodepool);
        } catch(error) {
            console.log(`Failed to detect upgrade is ready to proceed`);
            throw error;
        }

        try {
            await TransferWorkloadUtil.waitForWorkloadTransfer(timeoutMinutes, payload.data.nodepool, payload.data.workload.name, payload.data.workload.type, payload.data.workload.namespace);
        } catch(error) {
            console.log(`Failed to detect workload transfer`);
            throw error;
        }

        try {
            await NodepoolOperationUtil.waitForUpgradeComplete(timeoutMinutes, payload.data.project, payload.data.location, payload.data.cluster, payload.data.nodepool);
        } catch (error) {
            console.log(`Failed to detect nodepool upgrade is complete`);
            throw error;
        }

        console.log('Nodepool upgrade completed successfully');
    }
}

module.exports = UpgradeService;