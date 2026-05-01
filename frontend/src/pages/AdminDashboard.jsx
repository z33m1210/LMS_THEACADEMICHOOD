import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import MascotChamp from '../components/MascotChamp';
import './AdminDashboard.scss';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, courses: 0, batches: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, courses, batches] = await Promise.all([
          axios.get('http://localhost:5000/api/users'),
          axios.get('http://localhost:5000/api/academic/courses'),
          axios.get('http://localhost:5000/api/academic/batches')
        ]);
        setStats({
          users: users.data.length,
          courses: courses.data.length,
          batches: batches.data.length
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-layout">
      <div className="gradient-mesh"></div>
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="welcome-section glass-card">
            <MascotChamp size={80} />
            <div className="text">
              <h1>Admin Command Center</h1>
              <p>Welcome back, {user?.name}. System status is optimal.</p>
            </div>
          </div>
        </header>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-accent" style={{ background: 'var(--primary)' }}></div>
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.users}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-accent" style={{ background: '#3498db' }}></div>
            <div className="stat-label">Active Courses</div>
            <div className="stat-value">{stats.courses}</div>
          </div>

          <div className="stat-card">
            <div className="stat-accent" style={{ background: '#27ae60' }}></div>
            <div className="stat-label">Scheduled Batches</div>
            <div className="stat-value">{stats.batches}</div>
          </div>
        </div>

        <div className="quick-actions-panel">
          <h3>Quick Actions & System Overview</h3>
          <p>
            From this portal, you can manage the academic hierarchy, oversee teacher assignments, and monitor student progress across all batches. 
            The system is designed for maximum efficiency with soft minimalism and glassmorphism components.
          </p>
          <div className="action-buttons">
            <button className="btn-squishy">System Audit</button>
            <button className="btn-squishy" style={{ background: 'var(--navy)' }}>Generate Report</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
