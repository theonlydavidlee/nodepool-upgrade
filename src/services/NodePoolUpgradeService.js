const ClusterConnectionUtil = require('../utils/ClusterConnectionUtil');
const NodepoolOperationUtil = require('../utils/NodepoolOperationUtil');
const TransferWorkloadUtil = require('../utils/TransferWorkloadUtil');

class NodePoolUpgradeService {
    static async completeUpgrade(payload) {
        const workload = 'rsp-egress';
        const type = 'deployment';

        const maxNodepoolReadyTimeoutMinutes = 1;
        const maxNodepoolCompleteTimeoutMinutes = 30;
        const maxWorkloadTransferTimeoutMinutes = 90;

        if (!this.isValidPayload(payload)) {
            throw new Error('Invalid payload');
        }

        if (!payload.data.location) {
            throw new Error('"location" must be set e.g. [us-central1]');
        }
        const location = payload.data.location;

        if (!payload.data.cluster) {
            throw new Error('"cluster" must be set e.g. [us-central1-1]');
        }
        const cluster = payload.data.cluster;

        if (!payload.data.nodepool) {
            throw new Error('"nodepool" must be set e.g. [int-pre-medium-disk-a]');
        }
        const nodepool = payload.data.nodepool;

        await ClusterConnectionUtil.connect(location, cluster);
        await NodepoolOperationUtil.waitForUpgradeReady(maxNodepoolReadyTimeoutMinutes, location, cluster, nodepool);
        await TransferWorkloadUtil.transfer(maxWorkloadTransferTimeoutMinutes, nodepool, workload, type);
        await NodepoolOperationUtil.waitForUpgradeComplete(maxNodepoolCompleteTimeoutMinutes, location, cluster, nodepool);

        console.log('Upgrade completed successfully.');
    }

    static isValidPayload(payload) {
        return !!(payload && payload.data);
    }

    static mapToNodepoolObj(payload) {
        return {
            name: payload.data.nodepool,
            cluster: payload.data.cluster,
            location: payload.data.location
        };
    }
}

module.exports = NodePoolUpgradeService;