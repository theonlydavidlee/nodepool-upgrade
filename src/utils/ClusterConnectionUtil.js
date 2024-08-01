const ExecUtil = require('../utils/ExecUtil');

class ClusterConnectionUtil {
  static async connect(project, location, cluster, credentialsPath) {
    console.log(`Connecting to cluster ${cluster} in ${location}`);

    await ExecUtil.executeCommand(`gcloud auth activate-service-account --key-file=${credentialsPath}`);
    await ExecUtil.executeCommand(`gcloud container clusters get-credentials ${cluster} --region ${location} --project ${project}`);
  }
}

module.exports = ClusterConnectionUtil;