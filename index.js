#!/usr/bin/env node

const program = require("commander");
const fs = require("fs");
const { spawn } = require("child_process");
const { TxOp, ContractMode, ContractType } = require("./constant");
const { IceTeaWeb3 } = require("icetea-web3");
const emoji = require("node-emoji");
const { logo, create } = require("./command");
const validate = require("./validate");
const { ecc } = require("icetea-common");

program
  .command("init <name>")
  .description("initialize a project")
  .option("-t, --type [type]", `project type (${Object.values(ContractType)})`)
  .action(async (name, options) => {
    const type = options.type || ContractType.RUST;
    logo();
    validate.include(type, Object.values(ContractType));
    await create("", name, type);
  });

program
  .command("unbox <github_url> <name>")
  .description("using a template from github")
  .action(async (github_url, name) => {
    logo();
    await create(github_url, name);
  });

program
  .command("compile")
  .description("compile project")
  .action(() => {
    const { type = ContractType.RUST } = require(`${process.cwd()}/icetea.js`);
    validate.include(type, Object.values(ContractType));
    if (type != ContractType.RUST) {
      console.log(
        `    ${emoji.get("pray")}   ${type} project does not require compile`
      );
      process.exit(0);
    }

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
      }
    });
  });

program
  .command("build")
  .description("build project")
  .action(() => {
    const { type = ContractType.RUST } = require(`${process.cwd()}/icetea.js`);
    validate.include(type, Object.values(ContractType));
    if (type != ContractType.RUST) {
      console.log(
        `    ${emoji.get("pray")}   ${type} project does not require build`
      );
      process.exit(0);
    }

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
      }
    });
  });

program
  .command("deploy")
  .description("deploy project")
  .action(async () => {
    const {
      type = ContractType.RUST,
      privateKey = "",
      url = "",
      parameters = [],
      value = 0,
      fee = 0
    } = require(`${process.cwd()}/icetea.js`);
    validate.include(type, Object.values(ContractType));

    let src, mode;
    const from = ecc.toPublicKey(privateKey);
    const tweb3 = new IceTeaWeb3(url);

    switch (type) {
      case ContractType.RUST:
        src = fs.readFileSync(
          `${process.cwd()}/pkg/hello_world_bg.wasm`,
          "base64"
        );
        mode = ContractMode.WASM;
        break;
      case ContractType.JS:
        src = fs.readFileSync(`${process.cwd()}/src/index.js`);
        mode = ContractMode.JS_RAW;
        break;
      case ContractType.DJS:
        src = fs.readFileSync(`${process.cwd()}/src/index.djs`);
        mode = ContractMode.JS_DECORATED;
        break;
      default:
        process.exit(1);
    }

    const data = {
      op: TxOp.DEPLOY_CONTRACT,
      mode,
      src,
      params: parameters
    };
    const result = await tweb3.sendTransactionCommit(
      { from, value, fee, data },
      privateKey
    );
    console.log(result);
    await tweb3.close();
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
