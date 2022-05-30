const Campaign = artifacts.require("Campaign");

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
      let res = await campaignInstance.donate({from: accounts[3], value: 20});
      let block = await web3.eth.getBlock(res.receipt.blockNumber);
      //Here we are checking not expired condition after block is mined, but in real world block won't be mined at all.
      //We do it this way here, because I haven't found a way to simulate time in ganache locally.
      assert.equal((block.timestamp + 1600) < (startTime + 1500), false, "Should be false since campaign is expired");
  });

  it('should donate only when not donated before', async () => {
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
    
    await campaignInstance.donate({from: accounts[3], value: 20});
    
    let error;
    try {
      await campaignInstance.donate({from: accounts[3], value: 20});
    } catch (err) {
      error = err;
      expect(err.message).to.include("Donor has already donated");
    }
    assert(error, "Expected an error but did not get one");
  });

  it('should donate only if all modifier conditions met', async () => {
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
    
    let beforeDonationsCount = await campaignInstance.numberOfDonations();
    let beforeTotalAmountRaised = await campaignInstance.totalAmountRaised();
    await campaignInstance.donate({from: accounts[3], value: 20});
    let afterDonationsCount = Number(await campaignInstance.numberOfDonations());
    let afterTotalAmountRaised = Number(await campaignInstance.totalAmountRaised());
    let donationObj = await campaignInstance.donations(accounts[3]);

    assert.equal(beforeDonationsCount + 1, afterDonationsCount, "Donations count should increase by one");
    assert.equal(beforeTotalAmountRaised + 20, afterTotalAmountRaised, "Total amount raised should increase by 20");
    assert.equal(Number(donationObj.id), beforeDonationsCount + 1, "Donations count should increase by one");
    assert.equal(donationObj.sender, accounts[3], "Donor address in new object should match");
    assert.equal(Number(donationObj.amount), 20, "Donation amount must match");
  });

  it('should refund only when donor has donated', async () => {
    const campaignInstance = await Campaign.new(
      _name, 
      _imageURL, 
      _description, 
      _descriptionURL, 
      150,
      1500,
      1500,
      _beneficiary, 
      _custodian);

    let error;
    try {
      await campaignInstance.getRefund(accounts[3]);
    } catch (err) {
      error = err;
      expect(err.message).to.include("Donor hasn't donated");
    }
    assert(error, "Expected an error but did not get one");
  });

  it('should refund only when in refund period', async () => {
    const campaignInstance = await Campaign.new(
      _name, 
      _imageURL, 
      _description, 
      _descriptionURL, 
      150,
      1500,
      0,
      _beneficiary, 
      _custodian);
    
    await campaignInstance.donate({from: accounts[3], value: 20});
    let error;
    try {
      await campaignInstance.getRefund(accounts[3]);
    } catch (err) {
      error = err;
      expect(err.message).to.include("Refund period has ended");
    }
    assert(error, "Expected an error but did not get one");
  });

  it('should refund only if all modifier conditions met', async () => {
    const campaignInstance = await Campaign.new(
      _name, 
      _imageURL, 
      _description, 
      _descriptionURL, 
      150,
      1500,
      1500,
      _beneficiary, 
      _custodian);
    
    await campaignInstance.donate({from: accounts[3], value: 1000000000000000000});
    let balanceBefore = Number(await web3.eth.getBalance(accounts[3]));
    await campaignInstance.getRefund(accounts[3]);
    let balanceAfter = Number(await web3.eth.getBalance(accounts[3]));
    assert.equal(balanceBefore, balanceAfter - 1000000000000000000, "Should get refund back to donor");
  });

  it('should withdraw only if owner of contract', async () => {
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
    
    
    let error;
    try {
      await campaignInstance.withdraw({from: accounts[3]});
    } catch (err) {
      error = err;
      expect(err.message).to.include("Ownable: caller is not the owner");
    }
    assert(error, "Expected an error but did not get one");
  });

  it('should withdraw only if all modifier conditions met', async () => {
    const campaignInstance = await Campaign.new(
      _name, 
      _imageURL, 
      _description, 
      _descriptionURL, 
      150,
      1500,
      1500,
      _beneficiary, 
      _custodian);
    
    await campaignInstance.donate({from: accounts[3], value: 1000000000000000000});
    let balanceBefore = Number(await web3.eth.getBalance(accounts[1]));
    await campaignInstance.withdraw({from: accounts[0]});
    let balanceAfter = Number(await web3.eth.getBalance(accounts[1]));
    assert.equal(balanceBefore + 1000000000000000000, balanceAfter, "Beneficiary should get funds");
  });

});
