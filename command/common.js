const fs = require("fs");
const cp = require("child_process");

exports.exec = (cmd, opts) => {
  return new Promise((resolve, reject) => {
    cp.exec(cmd, opts, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

exports.mkdir = path => {
  return new Promise(function(resolve, reject) {
    if (fs.existsSync(path)) {
      return resolve(true);
    }
    fs.mkdir(path, err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};
