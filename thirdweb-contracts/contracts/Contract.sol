// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaperVerification {
    struct Paper {
        bytes32 hash;
        address owner;
        uint timestamp;
        bytes32 previousHash;
        string ipfsHash; // Store IPFS hash or similar for file access
    }

    mapping(bytes32 => Paper) public papers;
    bytes32[] public paperHashes; // List of all paper hashes

    event PaperAdded(bytes32 hash, address owner, uint timestamp, string ipfsHash);
    event PaperUpdated(bytes32 hash, address owner, uint timestamp);

    function addPaper(bytes32 _hash, string memory _ipfsHash) public {
        require(papers[_hash].owner == address(0), "Paper already exists.");
        papers[_hash] = Paper(_hash, msg.sender, block.timestamp, bytes32(0), _ipfsHash);
        paperHashes.push(_hash);
        emit PaperAdded(_hash, msg.sender, block.timestamp, _ipfsHash);
    }

    function updatePaper(bytes32 _newHash, bytes32 _previousHash, string memory _ipfsHash) public {
        require(papers[_previousHash].owner == msg.sender, "Only the owner can update the paper.");
        papers[_newHash] = Paper(_newHash, msg.sender, block.timestamp, _previousHash, _ipfsHash);
        paperHashes.push(_newHash);
        emit PaperUpdated(_newHash, msg.sender, block.timestamp);
    }

    function getPapers() public view returns (bytes32[] memory) {
        return paperHashes;
    }

    function verifyPaper(bytes32 _hash) public view returns (bool, address, uint, bytes32, string memory) {
        if (papers[_hash].owner != address(0)) {
            return (true, papers[_hash].owner, papers[_hash].timestamp, papers[_hash].previousHash, papers[_hash].ipfsHash);
        } else {
            return (false, address(0), 0, bytes32(0), "");
        }
    }
}