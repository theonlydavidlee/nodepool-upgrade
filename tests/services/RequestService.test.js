const RequestService = require('../../src/services/NodePoolUpgradeService');
const CompleteUpgradeService = require('../../src/services/NodePoolUpgradeService');

jest.mock('../../src/services/NodePoolUpgradeService');

describe('RequestService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error if payload is invalid', async () => {
        const invalidPayload = { data: {} };

        await expect(RequestService.handleRequest(invalidPayload)).rejects.toThrow('Invalid payload');
    });

    test('should call CompleteUpgradeService.completeUpgrade with correct data', async () => {
        const validPayload = { data: { nodepool: 'test-nodepool' } };

        await RequestService.handleRequest(validPayload);

        expect(CompleteUpgradeService.completeUpgrade).toHaveBeenCalledWith({
            type: 'BlueGreen',
            nodepool: 'test-nodepool',
        });
    });

    test('isValidPayload should validate payload correctly', () => {
        expect(RequestService.isValidPayload({ data: { nodepool: 'test-nodepool' } })).toBe(true);
        expect(RequestService.isValidPayload({ data: { nodepool: '' } })).toBe(false);
        expect(RequestService.isValidPayload({ data: { nodepool: '  ' } })).toBe(false);
        expect(RequestService.isValidPayload({ data: {} })).toBe(false);
        expect(RequestService.isValidPayload({})).toBe(false);
    });

    test('mapToUpgradeObj should map payload correctly', () => {
        const payload = { data: { nodepool: 'test-nodepool' } };
        const expected = { type: 'BlueGreen', nodepool: 'test-nodepool' };

        expect(RequestService.mapToUpgradeObj(payload)).toEqual(expected);
    });
});
