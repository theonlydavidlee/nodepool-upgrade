const SleepUtil = require('./SleepUtil');

class RetryUtil {
  static async retry(func, timeoutMinutes) {
    const maxTimeMillis = Date.now() + (timeoutMinutes * 60 * 1000);
    const internalWaitMillis = 5000;

    while (Date.now() < maxTimeMillis) {
      try {
        return await func();
      } catch(error) {
        // console.log(`Sleep ${internalWaitMillis} millis`);
        await SleepUtil.sleepMillis(internalWaitMillis);
      }
    }
    throw new Error('Retry failed error [Timeout Exceeded]');
  }
}

module.exports = RetryUtil;