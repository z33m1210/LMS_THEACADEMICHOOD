import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  ArrowLeft,
  LayoutGrid,
  Download,
  Mail,
  Edit3,
  Trash2,
  Plus,
  RotateCcw,
  Settings2,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  MoreVertical
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import MascotChamp from '../../components/MascotChamp';
import ChampSpeech from '../../components/ChampSpeech';
import ModuleCard from '../../components/ModuleCard';
import CelebrationToast from '../../components/CelebrationToast';
import { motion, AnimatePresence } from 'framer-motion';
import './BatchDetailPage.scss';

const BatchDetailPage = () => {
  const { id: batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [roster, setRoster] = useState([]);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('curriculum'); 
  const [saveFeedback, setSaveFeedback] = useState({}); // { moduleId: true }
  const [confirmDelete, setConfirmDelete] = useState(null); // moduleId
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetchBatchDetails();
  }, [batchId]);

  const fetchBatchDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const rosterRes = await axios.get(`http://localhost:5000/api/teacher/batches/${batchId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBatch({ name: rosterRes.data.batchName, courseName: rosterRes.data.courseName, id: rosterRes.data.batchId });
      setRoster(rosterRes.data.students);

      const curriculumRes = await axios.get(`http://localhost:5000/api/academic/batches/${batchId}/curriculum`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourseDetails(curriculumRes.data);
    } catch (err) {
      console.error('Error fetching batch details:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateModule = async (sectionId, updates) => {
    // Optimistic Update
    const originalSections = [...courseDetails.sections];
    const updatedSections = courseDetails.sections.map(s => 
      s.id === sectionId ? { ...s, ...updates, hasOverride: true } : s
    );
    setCourseDetails({ ...courseDetails, sections: updatedSections });

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/academic/batches/overrides/section', {
        batchId,
        sectionId,
        ...updates
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setSaveFeedback({ ...saveFeedback, [sectionId]: true });
      setTimeout(() => setSaveFeedback(prev => ({ ...prev, [sectionId]: false })), 2000);
    } catch (err) {
      console.error('Error updating section:', err);
      setCourseDetails({ ...courseDetails, sections: originalSections });
    }
  };

  const handleAddModule = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/academic/sections', {
        courseId: courseDetails.id,
        title: 'New Module',
        description: 'Module description goes here...',
        orderIndex: courseDetails.sections.length
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchBatchDetails();
    } catch (err) {
      alert('Error creating module');
    }
  };

  const handleDeleteModule = async (sectionId) => {
    if (!window.confirm('Are you sure? This deletes the global module and all its lessons.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/academic/sections/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBatchDetails();
    } catch (err) {
      alert('Error deleting module');
    }
  };

  const handleToggleVisibility = async (sectionId, currentHidden) => {
    const newHidden = !currentHidden;
    const originalSections = [...courseDetails.sections];
    const updatedSections = courseDetails.sections.map(s => 
      s.id === sectionId ? { ...s, isHidden: newHidden } : s
    );
    setCourseDetails({ ...courseDetails, sections: updatedSections });

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/academic/batches/overrides/section', {
        batchId,
        sectionId,
        isHidden: newHidden
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error('Error toggling visibility:', err);
      setCourseDetails({ ...courseDetails, sections: originalSections });
    }
  };

  const handleRestore = async (sectionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/academic/batches/overrides/section/${batchId}/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBatchDetails(); // Refresh from master
    } catch (err) {
      console.error('Error restoring section:', err);
    }
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 4000);
  };

  const downloadCSV = () => {
    if (!roster.length) return;
    const headers = ['Student Name', 'Email', 'Current Weighted Grade'];
    const rows = roster.map(s => [s.name, s.email, `${s.weightedGrade}%`]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `${batch.name}_Gradebook.csv`);
    link.click();
  };

  const sortedSections = useMemo(() => {
    if (!courseDetails) return [];
    return [...courseDetails.sections].sort((a, b) => {
      if (a.isHidden === b.isHidden) return 0;
      return a.isHidden ? 1 : -1;
    });
  }, [courseDetails]);

  return (
    <div className="admin-layout">
      <div className="gradient-mesh"></div>
      <Sidebar />
      <CelebrationToast show={showCelebration} message="Your progress has been updated!" />
      <main className="dashboard-main">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate('/teacher/batches')}>
            <ArrowLeft size={20} /> Back to Batches
          </button>
          <div className="header-info-row">
             <div className="title-group">
                <h1>{batch?.name}</h1>
                <p>{batch?.courseName}</p>
             </div>
             <div className="view-mode-tabs">
                <button 
                  className={`tab ${viewMode === 'curriculum' ? 'active' : ''}`}
                  onClick={() => setViewMode('curriculum')}
                >
                  <BookOpen size={18} /> Curriculum
                </button>
                <button 
                  className={`tab ${viewMode === 'roster' ? 'active' : ''}`}
                  onClick={() => setViewMode('roster')}
                >
                  <Users size={18} /> Roster & Gradebook
                </button>
              </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <MascotChamp size={120} className="loading-spin" />
          </div>
        ) : (
          <div className="detail-content-area">
            {viewMode === 'curriculum' ? (
              <div className="curriculum-view">

                {courseDetails?.sections.length === 0 ? (
                  <div className="empty-curriculum">
                    <div className="speech-wrapper">
                      <ChampSpeech text="A blank canvas! Let's build your first module." direction="left" />
                      <MascotChamp size={180} />
                    </div>
                    <button className="btn-squishy primary btn-create" onClick={() => navigate(`/teacher/batches/${batchId}/lessons`)}>
                      <Plus size={20} /> Add Your First Module
                    </button>
                  </div>
                ) : (
                  <motion.div layout className="module-grid">
                    {sortedSections.map(section => (
                      <ModuleCard 
                        key={section.id}
                        section={section}
                        onUpdate={(updates) => handleUpdateModule(section.id, updates)}
                        onToggleVisibility={() => handleToggleVisibility(section.id, section.isHidden)}
                        onManage={() => navigate(`/teacher/batches/${batchId}/modules/${section.id}`)}
                        onDelete={() => handleDeleteModule(section.id)}
                        saveFeedback={saveFeedback[section.id]}
                      />
                    ))}
                    <motion.div layout className="module-tile add-module-card" onClick={handleAddModule}>
                      <Plus size={40} />
                      <span>Add Module</span>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="roster-view">
                <div className="roster-header">
                  <h2>Student Performance</h2>
                  <button className="btn-squishy primary" onClick={downloadCSV}>
                    <Download size={18} /> Export Gradebook
                  </button>
                </div>
                
                <div className="glass-card-table-container">
                   <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Email</th>
                          <th style={{ textAlign: 'right' }}>Current Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roster.map(student => (
                          <tr key={student.id}>
                            <td>
                              <div className="student-profile">
                                <div className="avatar-small">{student.name.charAt(0)}</div>
                                <span className="name">{student.name}</span>
                              </div>
                            </td>
                            <td>
                              <div className="email-cell">
                                <Mail size={14} /> {student.email}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className={`grade-pill ${student.weightedGrade >= 80 ? 'high' : student.weightedGrade >= 50 ? 'med' : 'low'}`}>
                                {student.weightedGrade}%
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BatchDetailPage;
