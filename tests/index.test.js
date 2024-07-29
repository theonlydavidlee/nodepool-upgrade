const request = require('supertest');
const express = require('express');
const RequestService = require('../src/services/UpgradeService');

jest.mock('../src/services/UpgradeService');

const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
    const payload = req.body;
    const wrappedPayload = { data: payload };

    try {
        await RequestService.handleRequest(wrappedPayload);
        res.status(200).send({ message: 'Request processed successfully.' });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

describe('POST /', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return 200 for valid request', async () => {
        RequestService.handleRequest.mockResolvedValue();

        const response = await request(app)
            .post('/')
            .send({ nodepool: 'test-nodepool' })
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Request processed successfully.');
    });

    test('should return 500 for invalid request', async () => {
        RequestService.handleRequest.mockRejectedValue(new Error('Invalid payload'));

        const response = await request(app)
            .post('/')
            .send({})
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal Server Error');
    });
});
