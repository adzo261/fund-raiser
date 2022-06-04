// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./Campaign.sol";

contract Fundraiser {
    Campaign[] private campaigns;
    uint256 constant maxLimit = 10;

    event CampaignCreated(Campaign campaign, address owner);

    function createCampaign(
        string memory _name,
        string memory _imageURL,
        string memory _description,
        string memory _descriptionURL,
        uint256 _goalAmount,
        uint256 _expiresIn,
        uint256 _refundPeriod,
        address payable _beneficiary
    ) public {
        Campaign campaign = new Campaign(_name, _imageURL, _description, _descriptionURL,_goalAmount, _expiresIn, _refundPeriod, _beneficiary, msg.sender);
        campaigns.push(campaign);
        emit CampaignCreated(campaign, msg.sender);
    }

    function campaignsCount() public view returns (uint256) {
        return campaigns.length;
    }

    function getCampaigns(uint256 limit, uint256 offset) public view returns (Campaign[] memory res) {
        require(offset < campaigns.length, "Offset is greater than the number of campaigns");

        uint256 size = campaignsCount() - offset;
        size = size < limit ? size : limit;
        size = size < maxLimit ? size : maxLimit;
        res = new Campaign[](size);

        for (uint256 i = 0; i < size; i++) {
            res[i] = campaigns[offset + i];
        }

        return res;  
    }

    function getCampaignAt(uint256 index) public view returns (Campaign res) {
        require(index < campaigns.length, "Index is greater than the number of campaigns");
        return campaigns[index];
    }

    

}