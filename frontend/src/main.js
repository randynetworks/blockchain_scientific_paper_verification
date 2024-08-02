import { BrowserProvider, Contract, keccak256, toUtf8Bytes } from "ethers";
import { ThirdwebStorage } from "@thirdweb-dev/storage";

const contractAddress = "0x01E3AC8fC07DF7eCe84f1e157479d1967AaC3c2A";
const contractABI = [
  {
    type: "event",
    name: "PaperAdded",
    inputs: [
      {
        type: "bytes32",
        name: "hash",
        indexed: false,
        internalType: "bytes32",
      },
      {
        type: "address",
        name: "owner",
        indexed: false,
        internalType: "address",
      },
      {
        type: "uint256",
        name: "timestamp",
        indexed: false,
        internalType: "uint256",
      },
      {
        type: "string",
        name: "ipfsHash",
        indexed: false,
        internalType: "string",
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: "event",
    name: "PaperUpdated",
    inputs: [
      {
        type: "bytes32",
        name: "hash",
        indexed: false,
        internalType: "bytes32",
      },
      {
        type: "address",
        name: "owner",
        indexed: false,
        internalType: "address",
      },
      {
        type: "uint256",
        name: "timestamp",
        indexed: false,
        internalType: "uint256",
      },
    ],
    outputs: [],
    anonymous: false,
  },
  {
    type: "function",
    name: "addPaper",
    inputs: [
      {
        type: "bytes32",
        name: "_hash",
        internalType: "bytes32",
      },
      {
        type: "string",
        name: "_ipfsHash",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getPapers",
    inputs: [],
    outputs: [
      {
        type: "bytes32[]",
        name: "",
        internalType: "bytes32[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "paperHashes",
    inputs: [
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        type: "bytes32",
        name: "",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "papers",
    inputs: [
      {
        type: "bytes32",
        name: "",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        type: "bytes32",
        name: "hash",
        internalType: "bytes32",
      },
      {
        type: "address",
        name: "owner",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "timestamp",
        internalType: "uint256",
      },
      {
        type: "bytes32",
        name: "previousHash",
        internalType: "bytes32",
      },
      {
        type: "string",
        name: "ipfsHash",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "updatePaper",
    inputs: [
      {
        type: "bytes32",
        name: "_newHash",
        internalType: "bytes32",
      },
      {
        type: "bytes32",
        name: "_previousHash",
        internalType: "bytes32",
      },
      {
        type: "string",
        name: "_ipfsHash",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "verifyPaper",
    inputs: [
      {
        type: "bytes32",
        name: "_hash",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        type: "bool",
        name: "",
        internalType: "bool",
      },
      {
        type: "address",
        name: "",
        internalType: "address",
      },
      {
        type: "uint256",
        name: "",
        internalType: "uint256",
      },
      {
        type: "bytes32",
        name: "",
        internalType: "bytes32",
      },
      {
        type: "string",
        name: "",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
];

let provider;
let signer;
let contract;

// Initialize Thirdweb Storage
const storage = new ThirdwebStorage({
  clientId: "bdb989dc0b0329e772d01933cb14e2cf", // You can get one from dashboard settings
});

// Connect to MetaMask
async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    // Request MetaMask to connect to your dApp
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Optionally switch network to BSC Testnet if not already connected
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (currentChainId !== '0x61') { // '0x61' is the chain ID for BSC Testnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x61',
                  chainName: 'BSC Testnet',
                  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://testnet.bscscan.com'],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add network", addError);
            return;
          }
        } else {
          console.error("Failed to switch network", switchError);
          return;
        }
      }
    }

    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new Contract(contractAddress, contractABI, signer);

    const address = await signer.getAddress();
    document.getElementById("walletAddress").innerText = `Connected: ${address}`;

    loadUploadedPapers();
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
}

// Load uploaded papers
async function loadUploadedPapers() {
  try {
    const paperHashes = await contract.getPapers();
    const paperListElement = document.getElementById("uploadedPapersList");
    paperListElement.innerHTML = ""; // Clear the list

    for (const hash of paperHashes) {
      const paperData = await contract.verifyPaper(hash);
      console.log(paperData)
      const paperElement = document.createElement("li");
      paperElement.innerHTML = `
        <strong>Hash:</strong> ${hash} <br />
        <strong>Owner:</strong> ${paperData[1]} <br />
        <strong>Timestamp:</strong> ${paperData[2]} <br />
        <a href="${paperData[4].replace("ipfs://", "https://ipfs.io/ipfs/")}" target="_blank" rel="noopener noreferrer">Download</a>
      `;
      paperListElement.appendChild(paperElement);
    }
  } catch (error) {
    console.error("Error loading papers:", error);
  }
}

// Upload a document
async function uploadPaper() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  try {
    const hash = await getFileHash(file);
    console.log("Document Hash for Upload:", hash);

    const ipfsHash = await uploadToIPFS(file);
    await contract.addPaper(hash, ipfsHash);
    alert("Document uploaded successfully.");

    loadUploadedPapers();
  } catch (error) {
    alert(error.reason)
  }
}

// Verify a document
async function verifyPaper() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file to verify.");
    return;
  }

  try {
    const hash = await getFileHash(file);
    console.log("Document Hash for Verification:", hash);

    const paperData = await contract.verifyPaper(hash);
    const resultElement = document.getElementById("verificationResult");
    if (paperData[0]) {
      resultElement.innerHTML = `
        <p>Exists: Yes</p>
        <p>Owner: ${paperData[1]}</p>
        <p>Timestamp: ${paperData[2]}</p>
      `;
    } else {
      resultElement.innerHTML = "<p>Document not found in the blockchain.</p>";
    }
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

// Calculate file hash
function getFileHash(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
      const hash = keccak256(toUtf8Bytes(fileContent));
      resolve(hash);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

// Upload file to IPFS using Thirdweb Storage
async function uploadToIPFS(file) {
  try {
    // Upload the file to IPFS
    const ipfsHash = await storage.upload(file);
    console.log("Uploaded to IPFS with hash:", ipfsHash);

    // Return the IPFS hash
    return ipfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("IPFS upload failed");
  }
}

document
  .getElementById("connectWalletButton")
  .addEventListener("click", connectWallet);
document.getElementById("uploadButton").addEventListener("click", uploadPaper);
document.getElementById("verifyButton").addEventListener("click", verifyPaper);