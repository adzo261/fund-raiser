const path = require("path");

module.exports = {
  compilers: {
    solc: {
      version: "^0.8.13",
    }
  },
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777"
    }
  }
};