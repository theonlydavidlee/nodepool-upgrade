const express = require('express');
const NodePoolUpgradeService = require('./services/NodePoolUpgradeService');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.post('/', async (req, res) => {
  const payload = req.body;

  const wrappedPayload = {data: payload};

  try {
    await NodePoolUpgradeService.completeUpgrade(wrappedPayload);
    res.status(200).send({message: 'Request processed successfully.'});
  } catch (error) {

    // TODO If InvalidPayloadError then return HTTP 400 instead of 500

    console.error('Error processing request:', error);
    res.status(500).send({message: 'Internal Server Error'});
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});