#!/usr/bin/env node

const program = require("commander");
const { spawn } = require("child_process");
const { ContractType } = require("./constant");
const { IceTeaWeb3 } = require("icetea-web3");
const emoji = require("node-emoji");
const { logo, create } = require("./command");
const validate = require("./validate");
const { TxOp, ecc } = require("icetea-common");
const Deployer = require("./deployer");

program
  .command("init [name]")
  .description("initialize a project")
  .option("-t, --type [type]", `project type (${Object.values(ContractType)})`)
  .action(async (name, options) => {
    const type = options.type || ContractType.WASM;
    logo();
    validate.include(type, Object.values(ContractType));
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
        console.log(
          `    ${emoji.get("pray")}   only rust smart contract need compile`
        );
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
        console.log(
          `    ${emoji.get("pray")}   only rust smart contract need build`
        );
      }
    });
  });

program
  .command("deploy")
  .description("deploy project")
  .action(async () => {
    const {
      privateKey = "",
      url = "",
      value = 0,
      fee = 0
    } = require(`${process.cwd()}/icetea.js`);
    const deploy = require(`${process.cwd()}/deploy.js`);
    return deploy(new Deployer(privateKey, url, value, fee));
  });

program
  .command("call <mode> <address> <method> [parameters...]")
  .description("call contract")
  .action(async (mode, address, method, parameters = []) => {
    parameters = parameters.map(param =>
      typeof param === "number" ? param.toString() : param
    );
    const { privateKey = "", url = "" } = require(`${process.cwd()}/icetea.js`);
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
