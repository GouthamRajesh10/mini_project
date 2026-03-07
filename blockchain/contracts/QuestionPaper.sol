// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract QuestionPaperRegistry{

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    struct OriginalPaper{
        string originalHash;
        uint256 timestamp;
    }

    struct CenterPaper{
        string centerId;
        string watermarkedHash;
        uint256 timestamp;
    }

    mapping(string => OriginalPaper) public originalPapers;
    mapping(string => mapping(string => CenterPaper)) public centerPapers;

    event OriginalPaperStored(
        string originalHash,
        uint256 timestamp
    );

    event CenterPaperStored(
        string originalHash,
        string centerId,
        string watermarkedHash,
        uint256 timestamp
    );

    modifier onlyAdmin(){
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    function storeOriginalPaper(string memory _originalHash) public onlyAdmin{
        
        originalPapers[_originalHash] = OriginalPaper(
            _originalHash,
            block.timestamp
        );

        emit OriginalPaperStored(
            _originalHash,
            block.timestamp
        );
    }

    function storeCenterPaper(
        string memory _originalHash,
        string memory _centerId,
        string memory _watermarkedHash
    ) public onlyAdmin {

        centerPapers[_originalHash][_centerId] = CenterPaper(
            _centerId,
            _watermarkedHash,
            block.timestamp
        );

        emit CenterPaperStored(
            _originalHash,
            _centerId,
            _watermarkedHash,
            block.timestamp
        );
    }

}