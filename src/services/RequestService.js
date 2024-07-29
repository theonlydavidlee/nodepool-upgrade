const CompleteUpgradeService = require('./CompleteUpgradeService');

class RequestService {
    static async handleRequest(data) {
        if (!this.isValidPayload(data)) {
            throw new Error('Invalid payload');
        }

        const upgradeObj = this.mapToUpgradeObj(data);
        await CompleteUpgradeService.completeUpgrade(upgradeObj);
    }

    static isValidPayload(data) {
        return !!(data && data.data && data.data.nodepool && data.data.nodepool.trim() !== '');
    }

    static mapToUpgradeObj(data) {
        return {
            nodepool: data.data.nodepool,
            cluster: data.data.cluster,
            location: data.data.location
        };
    }
}

module.exports = RequestService;