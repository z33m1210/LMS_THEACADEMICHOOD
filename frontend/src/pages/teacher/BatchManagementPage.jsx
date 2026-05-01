import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Plus,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import MascotChamp from '../../components/MascotChamp';
import BatchCard from '../../components/teacher/BatchCard';
import './BatchManagementPage.scss';

const BatchManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ batches: [] });
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/teacher/dashboard?showArchived=${showArchived}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching batch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showArchived]);

  const handleBatchClick = (batch) => {
    navigate(`/teacher/batches/${batch.id}`);
  };

  return (
    <div className="admin-layout">
      <div className="gradient-mesh"></div>
      <Sidebar />
      <main className="dashboard-main">
        <header className="teacher-header">
          <div className="header-glass-card">
            <div className="header-title-section">
              <h1>Batch Management</h1>
              <p>Select a batch to manage curriculum and view performance.</p>
            </div>
            <div className="batch-view-controls">
              <label className="toggle-container">
                <input 
                  type="checkbox" 
                  checked={showArchived} 
                  onChange={() => setShowArchived(!showArchived)} 
                />
                <span className="slider"></span>
                <span className="label-text">Show Past Batches</span>
              </label>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="loading-container">
            <MascotChamp size={120} className="loading-spin" />
          </div>
        ) : (
          <section className="dashboard-section">
            <div className="batch-grid">
              {data.batches.map(batch => (
                <BatchCard key={batch.id} batch={batch} onClick={() => handleBatchClick(batch)} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default BatchManagementPage;
