const { exec } = require('child_process');

class ExecUtil {
  static executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          // Uncomment to view all errors when executing commands
          //console.error(`Error executing command: ${command}`, error);
          return reject(error);
        }
        // Uncomment to view all STDOUT when executing commands
        // console.log(`Command output: ${stdout}`);
        return resolve(stdout);
      });
    });
  }
}

module.exports = ExecUtil;