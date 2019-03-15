#!/usr/bin/env node

const program = require("commander");
const fs = require("fs");
const { spawn } = require("child_process");
const { TxOp, ContractMode, ecc } = require("icetea-common");
const { IceTeaWeb3 } = require("icetea-web3");
const emoji = require("node-emoji");
const { logo, create } = require("./command");
const { toPublicKey } = ecc;

program
  .command("init <name>")
  .description("initialize a project")
  .action(async name => {
    logo();
    await create("https://github.com/TradaTech/rustea", name);
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
  .description("try compile to wasm file")
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
      }
    });
  });

program
  .command("build")
  .description("export wasm file")
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
      }
    });
  });

program
  .command("deploy")
  .description("deploy wasm file to network")
  .action(async () => {
    const {
      privateKey = "",
      url = "",
      parameters = [],
      value = 0,
      fee = 0
    } = require(`${process.cwd()}/icetea.js`);
    let src = fs.readFileSync(`${process.cwd()}/pkg/hello_world_bg.wasm`, "base64");
    const from = toPublicKey(privateKey);

    const tweb3 = new IceTeaWeb3(url);
    const data = {
      op: TxOp.DEPLOY_CONTRACT,
      mode: ContractMode.WASM,
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
  .action(async (mode, address, method, parameters) => {
    parameters = parameters.map(param => typeof param === "number" ? param.toString(): param)
    const {
      privateKey = "",
      url = "",
    } = require(`${process.cwd()}/icetea.js`);
    const tweb3 = new IceTeaWeb3(url);
    const from = toPublicKey(privateKey);

    const data = {
      op: TxOp.CALL_CONTRACT,
      name: method,
      params: parameters
    };

    let result;
    switch(mode) {
      case 'update':
        result = await tweb3.sendTransactionCommit({ from, to: address, data }, privateKey);
        break;
      case 'view':
        result = await tweb3.callReadonlyContractMethod(address, method, parameters);
        break;
      case 'pure':
        result = await tweb3.callPureContractMethod(address, method, parameters);
        break;
    }
    console.log(result);
    await tweb3.close();
  });

program.parse(process.argv);
