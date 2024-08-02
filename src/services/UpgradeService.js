const ClusterConnectionUtil = require('../utils/ClusterConnectionUtil');
const NodepoolOperationUtil = require('../utils/NodepoolOperationUtil');
const TransferWorkloadUtil = require('../utils/TransferWorkloadUtil');

class UpgradeService {
    static async completeUpgrade(payload) {
        if (!(payload && payload.data)) {
            throw new Error('Invalid payload');
        }

        const credentialsPath = '/secrets/credentials.json';

        if (!payload.data.project) {
            throw new Error('"project" must be set e.g. [lao-multisite]');
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

        if (!payload.data.version) {
            throw new Error('"version" must be set e.g. [1.28.10-gke.1075001]');
        }

        if (!(payload.data.workload && payload.data.workload.name && payload.data.workload.type && payload.data.workload.namespace)) {
            throw new Error('"workload" must be set e.g. [rsp-egress]');
        }

        console.log(`Complete nodepool upgrade nodepool:${payload.data.nodepool}; version:${payload.data.version}`);
        console.log(`project:${payload.data.project}; location:${payload.data.location}; cluster:${payload.data.cluster}`);
        console.log(`workload: ${payload.data.workload.type}/${payload.data.workload.name}:${payload.data.workload.namespace}`);

        try {
            await ClusterConnectionUtil.connect(payload.data.project, payload.data.location, payload.data.cluster, credentialsPath);
        } catch(error) {
            console.log(`Failed to setup service account and connect to the cluster`);
            throw error;
        }

        try {
            await NodepoolOperationUtil.waitForUpgradeReady(5, payload.data.project, payload.data.location, payload.data.cluster, payload.data.nodepool);
        } catch(error) {
            console.log(`Failed to detect upgrade is ready to proceed`);
            throw error;
        }

        try {
            await TransferWorkloadUtil.waitForWorkloadTransfer(180, payload.data.nodepool, payload.data.workload.name, payload.data.workload.type, payload.data.workload.namespace);
        } catch(error) {
            console.log(`Failed to detect workload transfer`);
            throw error;
        }

        try {
            await NodepoolOperationUtil.waitForUpgradeComplete(5, payload.data.project, payload.data.location, payload.data.cluster, payload.data.nodepool, payload.data.version);
        } catch (error) {
            console.log(`Failed to detect nodepool upgrade is complete`);
            throw error;
        }

        console.log('Nodepool upgrade completed successfully');
    }
}

module.exports = UpgradeService;