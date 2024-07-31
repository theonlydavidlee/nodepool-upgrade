class ClusterConnectionUtil {
  static async connect(location, cluster) {
    console.log(`Connecting to cluster ${cluster} in ${location}`);
  }
}

module.exports = ClusterConnectionUtil;