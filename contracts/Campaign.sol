// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Campaign is Ownable {
    using SafeMath for uint256;

    struct Donation {
        uint256 id;
        address sender;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(address => Donation) public donations;

    string public name;
    string public imageURL;
    string public description;
    string public descriptionURL;
    uint256 public goalAmount;
    uint256 public expiresInDays;
    uint256 public refundPeriodInDays;
    address payable public beneficiary;
    uint256 public campaignStartTime;
    uint256 public totalAmountRaised;
    uint256 public numberOfDonations;


    event DonationReceived(uint256 id, address donor, uint256 amount, uint256 timestamp);
    event RefundReceived(address donor, uint256 amount);
    event Withdraw(address beneficiary, uint256 amount);

    constructor (
        string memory _name,
        string memory _imageURL,
        string memory _description,
        string memory _descriptionURL,
        uint256 _goalAmount,
        uint256 _expiresInDays,
        uint256 _refundPeriodInDays,
        address payable _beneficiary,
        address _custodian
    ) {
        name = _name;
        imageURL = _imageURL;
        description = _description;
        descriptionURL = _descriptionURL;
        beneficiary = _beneficiary;
        goalAmount = _goalAmount;
        expiresInDays = _expiresInDays;
        refundPeriodInDays = _refundPeriodInDays;
        campaignStartTime = block.timestamp;
        _transferOwnership(_custodian);
    }

    function setBeneficiary(address payable _beneficiary) public onlyOwner {
        beneficiary = _beneficiary;
    } 

    function donate(address _donor, uint256 _amount)  public payable notExpired canDonateOnce(_donor) {
        numberOfDonations++;
        totalAmountRaised += _amount;
        donations[_donor] = Donation(numberOfDonations, _donor, _amount, block.timestamp);
        emit DonationReceived(numberOfDonations, _donor, _amount, block.timestamp);
    }

    function getRefund(address payable _donor) public notExpired hasDonated(_donor) withinRefundPeriod(donations[_donor].timestamp) {
        uint256 _refundAmount = donations[_donor].amount;
        (bool sent, ) = _donor.call{value: _refundAmount}("");
        require (sent, "Refund transaction failed");
        emit RefundReceived(_donor, _refundAmount);
        delete donations[_donor];
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool sent, ) = beneficiary.call{value: balance}("");
        require (sent, "Withdrawal failed");
        emit Withdraw(beneficiary, balance);
    }


    modifier notExpired {
        require(
            block.timestamp  < campaignStartTime +  expiresInDays * 1 days,
            "Campaign has expired"
        );
        _;
    }

    modifier withinRefundPeriod(uint256 _donationTimestamp) {
        require(
            block.timestamp  < _donationTimestamp +  refundPeriodInDays * 1 days,
            "Refund period has ended"
        );
        _;
    }

    modifier canDonateOnce(address _donor) {
        require( 
            donations[_donor].id == 0,
            "Donor has already donated"
        );
        _;
    }

    modifier hasDonated(address _donor) {
        require( 
            donations[_donor].id != 0,
            "Donor hasn't donated"
        );
        _;
    }

}