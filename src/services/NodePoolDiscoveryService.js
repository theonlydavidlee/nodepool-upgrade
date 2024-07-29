const ExecUtil = require('../utils/ExecUtil');

class NodePoolDiscoveryService {
  static async getNodes(workload, nodepool) {
    const result = await ExecUtil.executeCommand(`kubectl get -A pods -l app=${workload} -o jsonpath='{range .items[*]}{.metadata.name} {.metadata.namespace} {.spec.nodeName}{"\\n"}{end}'`, { encoding: 'utf-8' });
    const lines = result.trim().split('\n');
    const items = lines.map(line => {
      const [podName, namespace, nodeName] = line.split(' ');
      return { podName, namespace, nodeName };
    });

    let nodes = [];
    for (const i of items) {
      const np = await ExecUtil.executeCommand(`kubectl get node ${i.nodeName} -o jsonpath='{.metadata.labels.cloud\\.google\\.com/gke-nodepool}'`);
      if (np.trim() === nodepool) {
        const r1 = await ExecUtil.executeCommand(`kubectl get node ${i.nodeName} -o=jsonpath='{.spec.unschedulable}'`);
        nodes.push({ nodeName: i.nodeName, status: r1.trim() === 'true'?'cordoned':'active', podName: i.podName, namespace: i.namespace});
      }
    }

    return nodes;
  }
}

module.exports = NodePoolDiscoveryService;