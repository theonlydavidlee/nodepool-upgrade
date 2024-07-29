class SleepUtil {
  static sleepMillis(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SleepUtil;