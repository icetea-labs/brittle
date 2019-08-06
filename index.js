#!/usr/bin/env node

const program = require("commander");
const { ContractType } = require("./constant");
const { IceTeaWeb3 } = require("icetea-web3");
const { logo, create, build } = require("./command");
const {
  mustProjectType,
  getNetworkConfig,
  getBuildOptions
} = require("./utils");
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
  .command("build")
  .description("build project")
  .option("-r, --remote", "remote build (only for wasm)")
  .option("-O, --optimize", "optimize (only for djs)")
  .action(options => {
    const buildOptions = getBuildOptions();
    return build(Object.assign(options, { buildOptions }) || {});
  });

program
  .command("deploy")
  .description("deploy project")
  .option("-n, --network [network]", "network")
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
  .option("-n, --network [network]", "network")
  .action(async (mode, address, method, parameters = [], options) => {
    const network = options.network || "private";
    const { privateKey = "", url = "" } = getNetworkConfig(network, false);
    const tweb3 = new IceTeaWeb3(url);
    tweb3.wallet.importAccount(privateKey);
    const contract = tweb3.contract(address);
    const methodFunc = contract.methods[method];
    // const from = ecc.toPublicKey(privateKey);
    // const data = {
    //   op: TxOp.CALL_CONTRACT,
    //   name: method,
    //   params: parameters
    // };

    let result;
    switch (mode) {
      case "update":
        result = await methodFunc(...parameters).sendCommit();
        break;
      case "view":
        result = await methodFunc(...parameters).call();
        break;
      case "pure":
        result = await methodFunc(...parameters).callPure();
        break;
    }
    console.log(result);
    await tweb3.close();
  });

program.parse(process.argv);
