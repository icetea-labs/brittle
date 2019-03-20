#!/usr/bin/env node

const program = require("commander");
const { spawn } = require("child_process");
const { ContractType } = require("./constant");
const { IceTeaWeb3 } = require("icetea-web3");
const emoji = require("node-emoji");
const { logo, create } = require("./command");
const { mustProjectType, emitError, getNetworkConfig } = require("./utils");
const { TxOp, ecc } = require("icetea-common");
const Deployer = require("./deployer");

program
  .command("init [name]")
  .description("initialize a project")
  .option("-t, --type [type]", `project type (${Object.values(ContractType)})`)
  .action(async (name, options) => {
    const type = options.type || ContractType.WASM;
    logo();
    mustProjectType(type);
    await create("", name, type);
  });

program
  .command("unbox <github_url> [name]")
  .description("using a template from github")
  .action(async (github_url, name) => {
    logo();
    await create(github_url, name);
  });

program
  .command("compile")
  .description("compile project")
  .action(() => {
    return spawn("cargo", ["build"], {
      stdio: "inherit"
    }).on("exit", function(error) {
      if (!error) {
        const lines = [
          "",
          `${emoji.get("hammer")}   Successfully compiled project`,
          ""
        ];
        lines.forEach(line => console.log(line));
      } else {
        emitError("Only rust smart contract need compile");
      }
    });
  });

program
  .command("build")
  .description("build project")
  .action(() => {
    return spawn("npm", ["run", "build"], {
      stdio: "inherit"
    }).on("exit", function(error) {
      if (!error) {
        const lines = [
          "",
          `${emoji.get("package")}   Successfully built project`,
          ""
        ];
        lines.forEach(line => console.log(line));
      } else {
        emitError("Only rust smart contract need build");
      }
    });
  });

program
  .command("deploy")
  .description("deploy project")
  .option("-n, --network [network]", `network`)
  .action(async options => {
    const network = options.network || "private";
    const {
      privateKey = "",
      url = "",
      value = 0,
      fee = 0,
      deploy
    } = getNetworkConfig(network, true);
    return deploy(new Deployer(privateKey, url, value, fee));
  });

program
  .command("call <mode> <address> <method> [parameters...]")
  .description("call contract")
  .option("-n, --network [network]", `network`)
  .action(async (mode, address, method, parameters = [], options) => {
    const network = options.network || "private";
    const { privateKey = "", url = "" } = getNetworkConfig(network, false);
    const tweb3 = new IceTeaWeb3(url);
    const from = ecc.toPublicKey(privateKey);

    const data = {
      op: TxOp.CALL_CONTRACT,
      name: method,
      params: parameters
    };

    let result;
    switch (mode) {
      case "update":
        result = await tweb3.sendTransactionCommit(
          { from, to: address, data },
          privateKey
        );
        break;
      case "view":
        result = await tweb3.callReadonlyContractMethod(
          address,
          method,
          parameters
        );
        break;
      case "pure":
        result = await tweb3.callPureContractMethod(
          address,
          method,
          parameters
        );
        break;
    }
    console.log(result);
    await tweb3.close();
  });

program.parse(process.argv);
