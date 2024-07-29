const ExecUtil = require('../utils/ExecUtil');



class NodePoolDiscoveryService {
  static async getNodes(nodepool) {
    const result = await ExecUtil.executeCommand(`kubectl get nodes -o=jsonpath='{range .items[?(@.metadata.labels.cloud\\.google\\.com/gke-nodepool=="${nodepool.name}")]}{.metadata.name} {.spec.unschedulable}{"\\n"}{end}'`);
    // console.log(result);
    return this.mapResultToNodes(result);
  }

  static mapResultToNodes(result) {
    const resultFormatted = result.trim().split('\n');
    return resultFormatted.map(r => {
      const [name, isCordoned] = r.split(' ');
      return { name, isCordoned };
    });
  }
}

module.exports = NodePoolDiscoveryService;