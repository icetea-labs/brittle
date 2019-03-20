const emoji = require("node-emoji");
const fs = require("fs");
const chalk = require("chalk");
const { ContractType } = require("./constant");

exports.emitError = msg => {
  console.log(`    ${emoji.get("x")}   ${msg}`);
  process.exit(1);
};

exports.mustProjectType = value => {
  const types = Object.values(ContractType);
  if (!types.includes(value)) {
    exports.emitError(`Allowed project type: [${types}] Your type: ${value}`);
  }
};

exports.getNetworkConfig = (network, isDeploy) => {
  const connectionPath = `${process.cwd()}/icetea.js`;
  const deployPath = `${process.cwd()}/deploy.js`;
  if (!fs.existsSync(connectionPath)) {
    exports.emitError(`Connection config file is not in ${connectionPath}`);
  }

  const connection = require(connectionPath);
  if (!connection.networks) {
    exports.emitError("Missing networks section in connection file");
  }
  const connectionResult = connection.networks[network];
  if (!connectionResult) {
    exports.emitError(
      `network ${chalk.cyan(network)} is not in networks section`
    );
  }
  if (!isDeploy) {
    return connectionResult;
  }

  if (!fs.existsSync(deployPath)) {
    exports.emitError(`Deploy file is not in ${deployPath}`);
  }
  const deploy = require(deployPath);
  return Object.assign(connectionResult, { deploy });
};
