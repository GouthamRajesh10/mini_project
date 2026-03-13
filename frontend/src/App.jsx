import { useState } from "react";
import SHA256 from "crypto-js/sha256";
import { connectToContract } from "./blockchain";

function App() {
  const [hash, setHash] = useState("");

  async function uploadFile(event) {
    const file = event.target.files[0];
    const text = await file.text();
    const hashValue = SHA256(text).toString();
    setHash(hashValue);
    const contract = await connectToContract();
    await contract.storeOriginalPaper(hashValue);
    alert("Hash stored on blockchain!");
  }
  return (
    <div style={{ padding: "50px" }}>
      <h2>Upload Question Paper</h2>

      <input type="file" onChange={uploadFile} />

      <p>Generated Hash:</p>
      <p>{hash}</p>
    </div>
  );
}

export default App;
