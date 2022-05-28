const FundRaiser = artifacts.require("FundRaiser");

module.exports = function(deployer) {
  deployer.deploy(FundRaiser);
};
