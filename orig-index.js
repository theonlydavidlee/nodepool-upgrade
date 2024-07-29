const { exec } = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const execCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
};

app.post('/', async (req, res) => {
    console.log(req.body);

    const { data } = req.body;



    if (data.includes('medium-disk')) {
        //parse the out the data...

        console.log('Received data indicating medium-disk: ', data);

        try {
            await execCommand('gcloud auth activate-service-account --key-file=/secrets/credentials.json');
            console.log('Activated service-account');

            await execCommand('gcloud container clusters get-credentials sandbox-test --region us-central1 --project resi-sandbox-1');
            console.log('Container credentials set');

            const nodesOutput = await execCommand('kubectl get nodes -o json');
            console.log(`Nodes List ${nodesOutput}`);

            const nodes = JSON.parse(nodesOutput).items;
            let cordonedNodes = nodes.filter(node => node.spec.taints && node.spec.taints.some(taint => taint.effect === 'NoSchedule'))
                .map(node => node.metadata.name);

            if (cordonedNodes.length === 0) {
                console.log('No cordoned nodes found');
                return res.status(200).send('No cordoned nodes found');
            }

            const podsOutput = await execCommand('kubectl get pods --all-namespaces -o json');
            console.log(`Pods and namespaces ${podsOutput}`);

            const pods = JSON.parse(podsOutput).items;
            let podsOnCordonedNodes = pods.filter(pod => cordonedNodes.includes(pod.spec.nodeName))
                .map(pod => ({
                    namespace: pod.metadata.namespace,
                    name: pod.metadata.name
                }));

            if (podsOnCordonedNodes.length === 0) {
                console.log('No pods found on the cordoned nodes');
                return res.status(200).send('No pods found on the cordoned nodes');
            }

            const namespaces = [...new Set(podsOnCordonedNodes.map(pod => pod.namespace))];
            await Promise.all(namespaces.map(namespace =>
                execCommand(`kubectl rollout restart --namespace=${namespace} deployment demo-springboot-app`)
                    .then(stdout => console.log(`kubectl command output for namespace ${namespace}: ${stdout}`))
                    .catch(stderr => console.error(`Error executing kubectl rollout restart for namespace ${namespace}: ${stderr}`))
            ));

            const checkPodsOnCordonedNodes = async () => {
                console.log('Checking pods on cordoned nodes...');
                const podsOutput = await execCommand('kubectl get pods --all-namespaces -o json');
                console.log(`Received pods and namespaces: ${podsOutput}`);

                const pods = JSON.parse(podsOutput).items;
                console.log('Parsed pods:', pods);

                let podsStillOnCordonedNodes = pods.filter(pod => cordonedNodes.includes(pod.spec.nodeName) && pod.metadata.labels.app === 'demo-springboot-app');

                if (podsStillOnCordonedNodes.length === 0) {
                    console.log('No pods found on the cordoned nodes, continuing with gcloud command.');
                    await execCommand('gcloud container node-pools complete-upgrade sandbox-medium-disk-a --location us-central1 --cluster sandbox-test --project resi-sandbox-1');
                    console.log('gcloud command output: Completed node pool upgrade');
                } else {
                    console.log('Pods still found on cordoned nodes, rechecking in 60 seconds...');
                    setTimeout(checkPodsOnCordonedNodes, 60000); // Retry after 60 seconds
                }
            };

            // Start the checking process
            checkPodsOnCordonedNodes();
            res.status(200).send('Processing started.');

        } catch (error) {
            console.error('Error:', error);
            res.status(500).send(`Error: ${error}`);
        }
    } else {
        res.status(400).send('No relevant data found.');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
