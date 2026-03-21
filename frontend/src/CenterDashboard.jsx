import { useState, useEffect } from 'react';
import './Dashboard.css';

export default function CenterDashboard({ onLogout }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/centre/papers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPapers(data);
      } else {
        console.error('Failed to fetch papers:', data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, title) => {
    setDownloadingId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/centre/download-paper/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert(`Successfully downloaded securely signed PDF for: ${title}`);
    } catch (err) {
      console.error(err);
      alert("Failed to download.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="dashboard-layout center-theme">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Exam Center</h2>
          <span className="badge">Active</span>
        </div>
        <ul className="nav-links">
          <li className="active">Received Papers</li>
        </ul>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        <div className="content-card">
          <div className="tab-pane fade-in">
            <h3>Secure Papers Inbox</h3>
            <p className="description">View and download digitally signed question papers assigned to your center.</p>

            <div className="papers-grid">
              {loading ? (
                <p>Loading papers...</p>
              ) : papers.map(paper => (
                <div key={paper._id} className="paper-card">
                  <div className="paper-icon">📄</div>
                  <div className="paper-info">
                    <h4>{paper.originalName}</h4>
                    <p className="date">Received: {new Date(paper.uploadAt).toLocaleDateString()}</p>
                    <p className="badge-signature">✔️ Valid Signature Attached</p>
                  </div>
                  <button
                    className={`download-btn ${downloadingId === paper._id ? 'loading' : ''}`}
                    onClick={() => handleDownload(paper._id, paper.originalName)}
                    disabled={downloadingId === paper._id}
                  >
                    {downloadingId === paper._id ? 'Decrypting...' : 'Download PDF'}
                  </button>
                </div>
              ))}

              {!loading && papers.length === 0 && (
                <div className="empty-state">
                  <p>No papers received yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
