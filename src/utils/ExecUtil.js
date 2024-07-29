const { exec } = require('child_process');

class ExecUtil {
  static executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${command}`, error);
          return reject(error);
        }
        console.log(`Command output: ${stdout}`);
        return resolve(stdout);
      });
    });
  }
}

module.exports = ExecUtil;