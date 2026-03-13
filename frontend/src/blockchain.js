import { ethers } from "ethers";
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = [
  "function storeOriginalPaper(string memory _originalHash) public",
  "function originalPapers(string memory) public view returns (string memory,uint256)",
];

export async function connectToContract() {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const signer = await provider.getSigner(0);
  const contract = new ethers.Contract(contractAddress, abi, signer);
  return contract;
}

export async function verifyPaperOnBlockchain(hashValue) {
  try {
    const contract = await connectToContract();
    const result = await contract.originalPapers(hashValue);
    
    // As per usual simple string mapping patterns in Solidity:
    // If it exists, the returned string or hash won't be empty.
    // Ethers v6 returns an array/tuple if multiple return values exist.
    // By your ABI: returns (string memory,uint256)
    const storedHash = result[0];
    
    // If the returned hash matches the query, it exists
    return storedHash && storedHash === hashValue;
  } catch (err) {
    console.error("Error verifying paper:", err);
    return false;
  }
}
