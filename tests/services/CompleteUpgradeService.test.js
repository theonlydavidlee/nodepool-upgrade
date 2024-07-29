const CompleteUpgradeService = require('../../src/services/CompleteUpgradeService');
const { exec } = require('child_process');

jest.mock('child_process', () => ({
    exec: jest.fn(),
}));

describe('CompleteUpgradeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('completeUpgrade should execute commands in sequence', async () => {
        exec.mockImplementation((command, callback) => callback(null, `Executed: ${command}`));

        const upgradeObj = { type: 'BlueGreen', nodepool: 'test-nodepool' };
        await CompleteUpgradeService.completeUpgrade(upgradeObj);

        expect(exec).toHaveBeenCalledTimes(3);
        expect(exec).toHaveBeenCalledWith('echo "Step 1: Discover nodes associated with nodepool: test-nodepool"', expect.any(Function));
        expect(exec).toHaveBeenCalledWith('echo "Step 2: Ensure transfer of sensitive workloads to Green nodes"', expect.any(Function));
        expect(exec).toHaveBeenCalledWith('echo "Step 3: Finish upgrade"', expect.any(Function));
    });

    test('executeCommand should resolve on success', async () => {
        exec.mockImplementation((command, callback) => callback(null, 'success'));

        const result = await CompleteUpgradeService.executeCommand('test-command');
        expect(result).toBe('success');
    });

    test('executeCommand should reject on error', async () => {
        exec.mockImplementation((command, callback) => callback(new Error('failure')));

        await expect(CompleteUpgradeService.executeCommand('test-command')).rejects.toThrow('failure');
    });
});
