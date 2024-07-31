const ExecUtil = require('../utils/ExecUtil');

class ClusterConnectionUtil {
  static async connect(location, cluster, googleProject, credentialsPath) {
    console.log(`Connecting to cluster ${cluster} in ${location}`);

    console.log(`gcloud auth activate-service-account --key-file=${credentialsPath}`);
    //await ExecUtil.executeCommand(`gcloud auth activate-service-account --key-file=${credentialsPath}`);

    console.log(`gcloud container clusters get-credentials ${cluster} --region ${location} --project ${googleProject}`);
    //await ExecUtil.executeCommand(`gcloud container clusters get-credentials ${cluster} --region ${location} --project ${googleProject}`);
  }
}

module.exports = ClusterConnectionUtil;