import { useState } from 'react';
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
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('questionPaper', file);

      const response = await fetch('/api/admin/upload-paper', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setUploadHash(data.hash);
      alert("Hash stored on blockchain via Backend!");
    } catch (err) {
      console.error(err);
      alert("Failed to store on backend. Check console: " + err.message);
    }
    setIsUploading(false);
  };

  const handleDistribute = async (e) => {
    e.preventDefault();
    const file = document.getElementById('distribute-file').files[0];
    if (!file || !selectedCenter) return;
    
    setDistributeStatus('Processing & Cryptographically Signing...');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('questionPaper', file);
      formData.append('centerId', selectedCenter);

      const response = await fetch('/api/admin/distribute-paper', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Distribution failed');
      }

      setDistributeStatus(`Successfully signed for ${selectedCenter}! Verified Hash stored on Blockchain.`);
    } catch (err) {
      console.error(err);
      setDistributeStatus(`Distribution failed: ${err.message}`);
    }
  };

  const handleAnalyze = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      // Use Web Crypto API to hash the raw binary of the PDF (matches Node's crypto buffer)
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashValue = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/verify-hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hash: hashValue })
      });
      
      const data = await response.json();
      setAnalysisResult({ hash: hashValue, valid: data.valid, type: data.type, message: data.message });
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
                    <option value="centre1">Center A (Mumbai)</option>
                    <option value="centre2">Center B (Delhi)</option>
                    <option value="centre3">Center C (Bangalore)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Upload Paper for Signature</label>
                  <input type="file" id="distribute-file" required className="standard-file-input" />
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
                      {analysisResult.valid && <p><strong>Paper Type:</strong> {analysisResult.type}</p>}
                      <p className="verification-text">
                        {analysisResult.valid 
                          ? "This paper perfectly matches the structure stored securely on the blockchain." 
                          : (analysisResult.message || "This paper does NOT match any original hash on the blockchain. It may be modified or tampered with.")}
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
