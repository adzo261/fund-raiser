const Fundraiser = artifacts.require("Fundraiser");

contract('Fundraiser', async (accounts) => {
  const _name = "Beneficiary Name";
  const _imageURL = "https://picsum.photos/200/300"; 
  const _description = "Beneficiary description";
  const _descriptionURL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
  const _beneficiary = accounts[1];

  it('should create a campaign', async () => {
    const fundraiserInstance = await Fundraiser.new();

    const beforeCampaignsCount = Number(await fundraiserInstance.campaignsCount());
    await fundraiserInstance.createCampaign(_name, 
      _imageURL, 
      _description, 
      _descriptionURL, 
      150,
      1500,
      500,
      _beneficiary);
    const afterCampaignsCount = Number(await fundraiserInstance.campaignsCount());

    assert.equal(beforeCampaignsCount + 1, afterCampaignsCount, "Campaign count not increased");
  });

  it('should have offset less than total campaigns', async () => {
    const fundraiserInstance = await Fundraiser.new();

    await fundraiserInstance.createCampaign(_name, 
      _imageURL, 
      _description, 
      _descriptionURL, 
      150,
      1500,
      500,
      _beneficiary);
    
    let error;
    try {
      await fundraiserInstance.getCampaigns(1, 4);
    } catch (err) {
      error = err;
      expect(error.message).to.include("Offset is greater than the number of campaigns");
    }
    assert(error, "Expected an error but did not get one");

  });
  
});
