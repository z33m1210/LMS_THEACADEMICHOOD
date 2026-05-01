import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import MascotChamp from '../components/MascotChamp';
import { motion } from 'framer-motion';
import './student/StudentHome.scss';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/submissions/notifications');
        setNotifications(res.data);
        // Mark all as read when opening page
        await axios.put('http://localhost:5000/api/submissions/notifications/read');
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  return (
    <div className="student-dashboard-layout">
      <div className="gradient-mesh"></div>
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="welcome-section">
            <div className="text">
              <h1>Notification Center</h1>
              <p>Stay updated with your latest grades and teacher feedback.</p>
            </div>
            <MascotChamp size={80} />
          </div>
        </header>

        {loading ? (
          <div className="loading-state">
            <MascotChamp size={100} className="loading-spin" />
            <span>Retrieving your alerts...</span>
          </div>
        ) : (
          <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {notifications.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '100px' }}>
                <MascotChamp size={120} />
                <h3>All quiet for now!</h3>
                <p>Champ will alert you when your grades are in.</p>
              </div>
            ) : notifications.map((n, idx) => (
              <motion.div 
                key={n.id} 
                className="glass-card" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px', 
                  padding: '25px 40px',
                  borderLeft: n.isRead ? '6px solid rgba(0,0,0,0.05)' : '6px solid var(--primary)'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div style={{ fontSize: '1.5rem' }}>{n.type === 'GRADE' ? '📝' : '🔔'}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--navy)' }}>{n.message}</p>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                {!n.isRead && <div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '50%' }}></div>}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;
