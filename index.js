#!/usr/bin/env node

const program = require("commander");
const Git = require("nodegit");
const fs = require("fs");
const { spawn } = require("child_process");
const { TxOp, ContractMode } = require("./constant");
const { IceTeaWeb3 } = require("./tweb3");
const ecc = require("./icetea/helper/ecc");

program.command("init [name]").action(async name => {
  await Git.Clone("https://github.com/TradaTech/rustea", `./${name}`);
  return spawn("npm", ["install", "--prefix", `./${name}`], {
    stdio: "inherit"
  }).on("exit", function(error) {
    if (!error) {
      console.log(`cd ${name} and enjoy!`);
    }
  });
});

program.command("compile").action(() => {
  return spawn("cargo", ["build"], {
    stdio: "inherit"
  }).on("exit", function(error) {
    if (!error) {
      console.log(`compile completed!`);
    }
  });
});

program.command("build").action(() => {
  return spawn("npm", ["run", "build"], {
    stdio: "inherit"
  }).on("exit", function(error) {
    if (!error) {
      console.log(`build completed!`);
    }
  });
});

program.command("deploy").action(async () => {
  const { privateKey = "", url = "" } = require(`${process.cwd()}/icetea.js`);
  let src = fs.readFileSync("./pkg/hello_world_bg.wasm", "base64");
  const from = ecc.toPublicKey(privateKey);

  const tweb3 = new IceTeaWeb3(url);
  const data = {
    op: TxOp.DEPLOY_CONTRACT,
    mode: ContractMode.WASM,
    src
  };

  const result = await tweb3.sendTransactionCommit(
    { from, value: 0, fee: 0, data },
    privateKey
  );
  console.log(result);
  await tweb3.close();
});

program.parse(process.argv);
