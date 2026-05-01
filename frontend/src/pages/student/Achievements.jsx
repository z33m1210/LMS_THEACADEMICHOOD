import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MascotChamp from '../../components/MascotChamp';
import ChampSpeech from '../../components/ChampSpeech';
import { motion } from 'framer-motion';
import './Achievements.scss';

const Achievements = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/achievements/my-certificates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(res.data);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (cert) => {
    // Mock download logic
    alert(`Downloading certificate for "${cert.course.title}" with score ${cert.averageGrade}/100...`);
    
    // Create a dummy blob and trigger download
    const blob = new Blob([`Certificate for ${cert.course.title}. Score: ${cert.averageGrade}/100`], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate_${cert.course.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) return <div className="loading-state"><MascotChamp size={100} className="loading-spin" /></div>;

  return (
    <div className="achievements-container">
      <header className="achievements-header">
        <h1>Your Achievements</h1>
        <div className="mascot-guide">
          <ChampSpeech text="Look at those trophies! You're becoming a true English Champion!" direction="right" />
          <MascotChamp size={120} />
        </div>
      </header>

      <main className="certificates-grid">
        {certificates.length === 0 ? (
          <div className="empty-state glass-panel">
            <p>No certificates earned yet. Complete a course to see them here!</p>
            <button className="btn-squishy" onClick={() => window.location.href='/student/dashboard'}>Go to Lessons</button>
          </div>
        ) : (
          certificates.map((cert, idx) => (
            <motion.div 
              key={cert.id}
              className="certificate-card glass-panel"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="cert-icon">🎓</div>
              <div className="cert-info">
                <h3>{cert.course.title}</h3>
                <p>Final Score: <span className="score-badge">{cert.averageGrade}/100</span></p>
                <p className="date">Earned on: {new Date(cert.issuedAt).toLocaleDateString()}</p>
              </div>
              <button className="btn-squishy btn-download" onClick={() => handleDownload(cert)}>
                Download PDF
              </button>
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
};

export default Achievements;
