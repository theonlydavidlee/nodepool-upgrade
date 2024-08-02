const express = require('express');

const UpgradeService = require('./services/UpgradeService');

const app = express();
const PORT = parseInt(process.env.PORT) || 8080;

app.use(express.json());

app.post('/', async (req, res) => {
  const payload = req.body;
  const wrappedPayload = {data: payload};

  try {
    await UpgradeService.completeUpgrade(wrappedPayload);
    res.status(200).send({message: 'Request processed successfully.'});
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send({message: 'Internal Server Error'});
  }
});

app.get('/ping', async (req, res) => {
  res.status(200).send({message: 'Healthy'});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});