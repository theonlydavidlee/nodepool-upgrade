const ClusterSetupService = require('./ClusterSetupService');
const NodePoolReadyService = require('./NodePoolReadyService');
const TransferWorkloadService = require('./TransferWorkloadService');
const NodePoolOperationCompleteService = require('./NodePoolOperationCompleteService');

class UpgradeService {
    static async completeUpgrade(payload) {
        if (!this.isValidPayload(payload)) {
            throw new Error('Invalid payload');
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

        const nodepool = this.mapToNodepoolObj(payload);
        const workload = 'demo-springboot-app';
        const type = 'deployment';

        await ClusterSetupService.setup(payload.data.cluster, payload.data.location);
        await NodePoolReadyService.waitForNodePoolToBeReady(payload.data.nodepool, payload.data.cluster);    
        await TransferWorkloadService.transferWorkload(nodepool, workload, type);
        await NodePoolOperationCompleteService.completeUpgrade(nodepool);

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

module.exports = UpgradeService;