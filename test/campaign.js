const Campaign = artifacts.require("Campaign");
//const sinon = require("sinon");
/* 
_name
_imageURL
_description
_descriptionURL
_goalAmount
_expiresIn
_refundPeriod
_beneficiary
_custodian 
*/


contract('Campaign', async (accounts) => {
  const _name = "Beneficiary Name";
  const _imageURL = "https://picsum.photos/200/300"; 
  const _description = "Beneficiary description";
  const _descriptionURL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
  const _beneficiary = accounts[1];
  const _custodian = accounts[0];
  /* let clock;
  let currentTimeInSeconds
  beforeEach(function () {
    currentTimeInSeconds = Date.now()/100;
      clock = sinon.useFakeTimers();
  });

  afterEach(function () {
      clock.restore();
  }); */

  it('should donate only when campaign is not expired', async () => {
    const campaignInstance = await Campaign.new(
      _name, 
      _imageURL, 
      _description, 
      _descriptionURL, 
      150,
      1500,
      500,
      _beneficiary, 
      _custodian);

    
      let startTime = Number(await campaignInstance.campaignStartTime());
      //clock.tick(1600000);
      let res = await campaignInstance.donate(accounts[3], 20);
      let block = await web3.eth.getBlock(res.receipt.blockNumber);
      //Here we are checking not expired condition after block is mined, but in real world block won't be mined at all.
      //We do it this way here, because I haven't found a way to simulate time in ganache locally.
      assert.equal((block.timestamp + 1600) < (startTime + 1500), false, "Should be false since campaign is expired");
  });

});
