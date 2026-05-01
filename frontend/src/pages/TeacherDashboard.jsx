import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, 
  BarChart3, 
  Calendar, 
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import MascotChamp from '../components/MascotChamp';
import GradingDesk from '../components/teacher/GradingDesk';
import './TeacherDashboard.scss';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ batches: [], pendingSubmissions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [gradedCountSession, setGradedCountSession] = useState(0);
  const [champMessage, setChampMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Dashboard only needs active context
      const res = await axios.get(`http://localhost:5000/api/teacher/dashboard?showArchived=false`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      
      // SLA Logic: Check if any submission is > 20 hours old
      const hasUrgent = res.data.pendingSubmissions.some(sub => {
        const hours = (new Date() - new Date(sub.createdAt)) / (1000 * 60 * 60);
        return hours > 20;
      });

      if (hasUrgent) {
        setChampMessage("3 submissions are approaching the 24h deadline!");
      } else {
        setChampMessage(`Ready to lead? ${res.data.pendingSubmissions.length} assignments waiting.`);
      }
    } catch (err) {
      console.error('Error fetching teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGradeSubmit = async (grade, comment) => {
    setSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/api/submissions/grade/${selectedSub.id}`, {
        grade,
        comment
      });
      setSelectedSub(null);
      setGradedCountSession(prev => prev + 1);
      
      if (gradedCountSession + 1 === 5) {
        setChampMessage("You've graded 5 missions today! Legend! 🏆");
      }

      fetchData();
    } catch (err) {
      alert('Error submitting grade');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-layout">
      <div className="gradient-mesh"></div>
      <Sidebar />
      <main className="dashboard-main">
        <header className="teacher-header">
          <div className="header-glass-card">
            <MascotChamp size={100} />
            <div className="welcome-text">
              <h1>Teacher Command Center</h1>
              <div className="champ-bubble-inline">
                {champMessage}
              </div>
            </div>
            <div className="quick-stats">
              <div className="stat-pill">
                <Clock size={16} /> {data.pendingSubmissions.length} Pending
              </div>
              <div className="stat-pill primary">
                <CheckCircle2 size={16} /> {gradedCountSession} Today
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="loading-container">
            <MascotChamp size={120} className="loading-spin" />
            <p>Syncing your academic world...</p>
          </div>
        ) : error ? (
          <div className="error-container glass-card">
             <MascotChamp size={100} />
             <h3>Oops! Something went wrong.</h3>
             <p>{error}</p>
             <button className="btn-squishy" onClick={fetchData}>Try Again</button>
          </div>
        ) : (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Ungraded Missions</h2>
              <div className="inbox-count">{data.pendingSubmissions.length}</div>
            </div>
            
            {data.pendingSubmissions.length > 0 ? (
              <div className="glass-card-table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Assignment</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pendingSubmissions.map(sub => (
                      <tr key={sub.id}>
                        <td>
                          <div className="student-profile">
                            <div className="avatar-small">{sub.student?.name?.charAt(0) || '?'}</div>
                            <span className="name">{sub.student?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="assignment-title">{sub.assignment?.title || 'No Title'}</td>
                        <td className="date-cell">{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <span className={`status-tag ${(new Date() - new Date(sub.createdAt)) / (1000 * 60 * 60) > 20 ? 'urgent' : 'pending'}`}>
                            {(new Date() - new Date(sub.createdAt)) / (1000 * 60 * 60) > 20 ? 'Urgent' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn-grade" onClick={() => setSelectedSub(sub)}>
                            Grade <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <GradingDesk submission={null} />
            )}
          </section>
        )}

        {selectedSub && (
          <GradingDesk 
            submission={selectedSub} 
            onGrade={handleGradeSubmit} 
            onCancel={() => setSelectedSub(null)}
            submitting={submitting}
          />
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
