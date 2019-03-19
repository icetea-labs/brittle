const path = require("path");
const fs = require("fs");
const { ecc } = require("icetea-common");
const { IceTeaWeb3 } = require("icetea-web3");
const { TxOp, ContractMode } = require("icetea-common");
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
    const from = ecc.toPublicKey(this.privateKey);
    const tweb3 = new IceTeaWeb3(this.url);
    const value = options.value || this.value;
    const fee = options.fee || this.fee;

    const data = {
      op: TxOp.DEPLOY_CONTRACT,
      mode,
      src,
      params
    };
    const result = await tweb3.sendTransactionCommit(
      { from, value, fee, data },
      this.privateKey
    );
    await tweb3.close();
    console.log(result);
    if (result && result.tags && result.tags["tx.to"]) {
      return { address: result.tags["tx.to"] };
    }
    throw new Error("Cannot get deployed contract address");
  }
};
