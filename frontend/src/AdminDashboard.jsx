import { useState } from 'react';
import SHA256 from 'crypto-js/sha256';
import { connectToContract, verifyPaperOnBlockchain } from './blockchain';
import './Dashboard.css';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('upload');
  
  // Tab 1: Upload Original Status
  const [uploadHash, setUploadHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Tab 2: Distribute Status
  const [selectedCenter, setSelectedCenter] = useState('');
  const [distributeStatus, setDistributeStatus] = useState('');

  // Tab 3: Analysis Status
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handlers
  const handleUploadOriginal = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const text = await file.text();
      const hashValue = SHA256(text).toString();
      setUploadHash(hashValue);
      const contract = await connectToContract();
      await contract.storeOriginalPaper(hashValue);
      alert("Hash stored on blockchain!");
    } catch (err) {
      console.error(err);
      alert("Failed to store on blockchain. Check console.");
    }
    setIsUploading(false);
  };

  const handleDistribute = (e) => {
    e.preventDefault();
    setDistributeStatus('Processing...');
    
    // Mocking Backend Signature & Distribution Process
    setTimeout(() => {
      setDistributeStatus(`Successfully distributed to ${selectedCenter} with digital signature.`);
      setTimeout(() => setDistributeStatus(''), 5000);
    }, 1500);
  };

  const handleAnalyze = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const text = await file.text();
      const hashValue = SHA256(text).toString();
      
      // Call mock verification function
      const exists = await verifyPaperOnBlockchain(hashValue);
      setAnalysisResult({ hash: hashValue, valid: exists });
    } catch (err) {
      console.error(err);
      setAnalysisResult({ error: "Verification failed. Check console." });
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="dashboard-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Portal</h2>
        </div>
        <ul className="nav-links">
          <li className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}>
            Upload Original
          </li>
          <li className={activeTab === 'distribute' ? 'active' : ''} onClick={() => setActiveTab('distribute')}>
            Distribute to Centers
          </li>
          <li className={activeTab === 'analyze' ? 'active' : ''} onClick={() => setActiveTab('analyze')}>
            Analyze Paper
          </li>
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <div className="content-card">
          {activeTab === 'upload' && (
            <div className="tab-pane fade-in">
              <h3>Upload Original Question Paper</h3>
              <p className="description">Secure the original question paper hash on the blockchain.</p>
              
              <div className="upload-area">
                <input type="file" onChange={handleUploadOriginal} id="orig-upload" className="file-input" />
                <label htmlFor="orig-upload" className="upload-label">
                  {isUploading ? 'Uploading to Blockchain...' : 'Select File to Upload'}
                </label>
              </div>

              {uploadHash && (
                <div className="result-box success">
                  <strong>Generated Hash:</strong>
                  <p className="hash-text">{uploadHash}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'distribute' && (
            <div className="tab-pane fade-in">
              <h3>Distribute to Exam Centers</h3>
              <p className="description">Upload a paper and attach a unique digital signature for a specific center.</p>
              
              <form onSubmit={handleDistribute} className="dashboard-form">
                <div className="form-group">
                  <label>Select Exam Center</label>
                  <select 
                    required 
                    value={selectedCenter} 
                    onChange={(e) => setSelectedCenter(e.target.value)}
                    className="select-input"
                  >
                    <option value="">-- Select Center --</option>
                    <option value="Center A">Center A (Mumbai)</option>
                    <option value="Center B">Center B (Delhi)</option>
                    <option value="Center C">Center C (Bangalore)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Upload Paper for Signature</label>
                  <input type="file" required className="standard-file-input" />
                </div>

                <button type="submit" className="action-btn">
                  Generate Signature & Distribute
                </button>
              </form>

              {distributeStatus && (
                <div className="status-notification fade-in">
                  {distributeStatus}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analyze' && (
            <div className="tab-pane fade-in">
              <h3>Verify Uploaded Paper</h3>
              <p className="description">Upload a question paper to verify its authenticity against the blockchain.</p>
              
              <div className="upload-area">
                <input type="file" onChange={handleAnalyze} id="verify-upload" className="file-input" />
                <label htmlFor="verify-upload" className="upload-label analyzer">
                  {isAnalyzing ? 'Analyzing...' : 'Select File to Verify'}
                </label>
              </div>

              {analysisResult && (
                <div className={`result-box mt-4 ${analysisResult.valid ? 'success' : 'error'}`}>
                  {analysisResult.error ? (
                    <p>{analysisResult.error}</p>
                  ) : (
                    <>
                      <h4>{analysisResult.valid ? '✅ Highly Authentic' : '❌ Validation Failed'}</h4>
                      <p><strong>Computed Hash:</strong> <span className="hash-text small">{analysisResult.hash}</span></p>
                      <p className="verification-text">
                        {analysisResult.valid 
                          ? "This paper perfectly matches the original structure stored on the blockchain." 
                          : "This paper does NOT match any original hash on the blockchain. It may be modified or tampered with."}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
