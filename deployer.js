const path = require("path");
const fs = require("fs");
const { IceteaWeb3 } = require("@iceteachain/web3");
const { ContractMode } = require("@iceteachain/common");
const { ContractType } = require("./constant");

function loadContract(filePath) {
  const extension = path.extname(filePath);
  switch (extension) {
    case `.${ContractType.WASM}`:
      return {
        src: fs.readFileSync(path.resolve(process.cwd(), filePath), "base64"),
        mode: ContractMode.WASM
      };
    case `.${ContractType.JS}`:
      return {
        src: fs.readFileSync(path.resolve(process.cwd(), filePath)),
        mode: ContractMode.JS_RAW
      };
    case `.${ContractType.DJS}`:
      return {
        src: fs.readFileSync(path.resolve(process.cwd(), filePath)),
        mode: ContractMode.JS_DECORATED
      };
    default:
      throw new Error(`Unsupported ${extension} file`);
  }
}

module.exports = class {
  constructor(privateKey, url, value, fee) {
    Object.assign(this, { privateKey, url, value, fee });
  }

  async deploy(filePath, params = [], options = {}) {
    let { src, mode } = loadContract(filePath);
    const tweb3 = new IceteaWeb3(this.url);
    tweb3.wallet.importAccount(this.privateKey);
    // const from = ecc.toPublicKey(this.privateKey);
    // const value = options.value || this.value;
    // const fee = options.fee || this.fee;
    // const data = {
    //   op: TxOp.DEPLOY_CONTRACT,
    //   mode,
    //   src,
    //   params
    // };
    // const result = await tweb3.sendTransactionCommit(
    //   { from, value, fee, data },
    //   this.privateKey
    // );
    let result;
    if (mode === ContractMode.WASM) {
      result = await tweb3.deployWasm(src, params, options);
    } else {
      result = await tweb3.deployJs(src, params, options);
    }
    await tweb3.close();
    console.log(result);
    if (result && result.address) {
      return { address: result.address };
    }
    throw new Error("Cannot get deployed contract address");
  }
};
