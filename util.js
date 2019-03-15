const ecc = require('eosjs-ecc')

module.exports = {
  toPublicKey: function (privateKey) {
    return ecc.privateToPublic(privateKey).slice(3)
  },
}