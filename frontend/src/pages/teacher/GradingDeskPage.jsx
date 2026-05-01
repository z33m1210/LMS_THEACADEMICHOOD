import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import GradingDesk from '../../components/teacher/GradingDesk';
import MascotChamp from '../../components/MascotChamp';
import './GradingDeskPage.scss';

const GradingDeskPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/submissions/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (grade, comment) => {
    if (!selectedSub) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/submissions/grade/${selectedSub.id}`, 
        { grade, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedSub(null);
      fetchPending();
    } catch (err) {
      console.error('Grading failed:', err);
      alert('Failed to post grade. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-layout">
      <div className="gradient-mesh"></div>
      <Sidebar />
      <main className="dashboard-main">
        <div className="page-header">
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900 }}>Academic Grading Desk</h1>
            <p style={{ margin: '5px 0 0', color: 'rgba(44, 62, 80, 0.6)', fontWeight: 600 }}>
              Review student missions and provide feedback
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <MascotChamp size={120} className="loading-spin" />
            <p>Gathering missions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <GradingDesk submission={null} /> 
        ) : (
          <div className="grading-queue-container">
            <div className="missions-grid">
               {submissions.map(sub => (
                 <div key={sub.id} className="mission-card glass-card" onClick={() => setSelectedSub(sub)}>
                    <div className="mission-header">
                      <div className="student-tag">
                         <div className="avatar">{sub.student?.name?.charAt(0)}</div>
                         <span>{sub.student?.name}</span>
                      </div>
                      <span className={`status ${(new Date() - new Date(sub.createdAt)) / (1000 * 60 * 60) > 20 ? 'urgent' : ''}`}>
                         {(new Date() - new Date(sub.createdAt)) / (1000 * 60 * 60) > 20 ? '🔥 Urgent' : 'Pending'}
                      </span>
                    </div>
                    <div className="mission-body">
                       <h3>{sub.assignment?.title}</h3>
                       <p>Submitted: {new Date(sub.createdAt).toLocaleString()}</p>
                    </div>
                    <button className="btn-squishy">Review & Grade</button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {selectedSub && (
          <GradingDesk 
            submission={selectedSub}
            onGrade={handleGrade}
            onCancel={() => setSelectedSub(null)}
            submitting={submitting}
          />
        )}
      </main>
    </div>
  );
};

export default GradingDeskPage;
