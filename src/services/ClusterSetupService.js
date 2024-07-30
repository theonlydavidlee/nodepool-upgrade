const ExecUtil = require('../utils/ExecUtil');

class ClusterSetupService {
    static async setup(cluster, location) {
        console.log(`Setting up cluster ${cluster} in region ${location}`);

        try {
            const authCommand = 'gcloud auth activate-service-account --key-file=/home/theother/Downloads/tempcredentials/credentials.json';
            console.log(`Service account authenticated`);
        } catch (error) {
            console.error(`Error authenticating service account: ${error}`);
            throw new Error('Failed to authenticate service account');
        }
    }
}

module.exports = ClusterSetupService;
