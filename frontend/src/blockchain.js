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
