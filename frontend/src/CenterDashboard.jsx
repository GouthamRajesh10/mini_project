import { useState } from 'react';
import './Dashboard.css';

export default function CenterDashboard({ onLogout }) {
  // Mock data representing papers received from the admin
  const [papers] = useState([
    {
      id: 1,
      title: "Mathematics Final - Set A",
      dateReceived: "2026-03-13",
      signatureStatus: "Valid Signature Attached"
    },
    {
      id: 2,
      title: "Physics Midterm - Advanced",
      dateReceived: "2026-03-12",
      signatureStatus: "Valid Signature Attached"
    }
  ]);

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = (id, title) => {
    setDownloadingId(id);

    // Mocking file download
    setTimeout(() => {
      setDownloadingId(null);
      alert(`Successfully downloaded securely signed PDF for: ${title}`);
    }, 1500);
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
              {papers.map(paper => (
                <div key={paper.id} className="paper-card">
                  <div className="paper-icon">📄</div>
                  <div className="paper-info">
                    <h4>{paper.title}</h4>
                    <p className="date">Received: {paper.dateReceived}</p>
                    <p className="badge-signature">✔️ {paper.signatureStatus}</p>
                  </div>
                  <button
                    className={`download-btn ${downloadingId === paper.id ? 'loading' : ''}`}
                    onClick={() => handleDownload(paper.id, paper.title)}
                    disabled={downloadingId === paper.id}
                  >
                    {downloadingId === paper.id ? 'Decrypting...' : 'Download PDF'}
                  </button>
                </div>
              ))}

              {papers.length === 0 && (
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
