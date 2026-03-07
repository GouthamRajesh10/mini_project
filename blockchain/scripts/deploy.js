const { ethers } = require("hardhat");

async function main() {
  const QuestionPaper = await ethers.getContractFactory("QuestionPaper");

  const contract = await QuestionPaper.deploy();

  await contract.deployed();

  console.log("Contract deployed at:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
