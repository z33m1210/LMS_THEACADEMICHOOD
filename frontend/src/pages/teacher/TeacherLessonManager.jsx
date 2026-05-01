import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  ArrowLeft, 
  BookOpen,
  GripVertical,
  Video,
  FileText,
  AlertCircle,
  CheckCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import MascotChamp from '../../components/MascotChamp';
import './TeacherLessonManager.scss';

const TeacherLessonManager = () => {
  const { user } = useAuth();
  const { id: batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatchAndCurriculum();
  }, [batchId]);

  const fetchBatchAndCurriculum = async () => {
    try {
      const token = localStorage.getItem('token');
      const batchRes = await axios.get(`http://localhost:5000/api/teacher/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const currentBatch = batchRes.data.batches.find(b => b.id === parseInt(batchId));
      setBatch(currentBatch);

      if (currentBatch) {
        const curriculumRes = await axios.get(`http://localhost:5000/api/academic/batches/${batchId}/curriculum`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurriculum(curriculumRes.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleAddLesson = async (sectionId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/academic/lessons`, {
        sectionId,
        title: 'New Lesson',
        content: '',
        orderIndex: 0
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      const newLesson = res.data;
      navigate(`/teacher/batches/${batchId}/lessons/${newLesson.id}/edit`);
    } catch (err) {
      alert('Error adding lesson');
    }
  };

  const handleUpdateOverride = async (type, id, updates) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'lesson' 
        ? 'http://localhost:5000/api/academic/batches/overrides/lesson'
        : 'http://localhost:5000/api/academic/batches/overrides/assignment';
      
      const payload = type === 'lesson'
        ? { batchId: parseInt(batchId), lessonId: id, ...updates }
        : { batchId: parseInt(batchId), assignmentId: id, ...updates };

      await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBatchAndCurriculum();
    } catch (err) {
      alert('Error saving override');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure? This deletes the global lesson blueprint.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/academic/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBatchAndCurriculum();
    } catch (err) {
      alert('Error deleting lesson');
    }
  };

  return (
    <div className="admin-layout">
      <div className="gradient-mesh"></div>
      <Sidebar />
      <main className="dashboard-main">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate(`/teacher/batches/${batchId}`)}>
            <ArrowLeft size={20} /> Back to Batch Detail
          </button>
          <div className="header-info">
            <div className="title-row">
              <h1>Batch Override Manager</h1>
            </div>
            <p>Customizing curriculum for <span className="highlight">{batch?.name}</span></p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <MascotChamp size={120} className="loading-spin" />
          </div>
        ) : (
          <div className="lesson-manager-container">
            {curriculum?.sections.map(section => (
              <div key={section.id} className="manager-section glass-card">
                <div className="section-header">
                  <div className="title">
                    <BookOpen size={20} />
                    <h3>{section.title}</h3>
                  </div>
                  <button className="btn-squishy primary" onClick={() => handleAddLesson(section.id)}>
                    <Plus size={18} /> Add Lesson
                  </button>
                </div>

                <div className="lesson-list">
                  {section.lessons.map(lesson => (
                    <LessonItem 
                      key={lesson.id} 
                      lesson={lesson} 
                      onDelete={handleDeleteLesson}
                      onEditDetails={(lessonId) => navigate(`/teacher/batches/${batchId}/lessons/${lessonId}/edit`)}
                      isAdmin={user?.role === 'ADMIN'}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const LessonItem = ({ lesson, onDelete, onEditDetails, isAdmin }) => {
  return (
    <div className="lesson-item-wrapper">
      <div className="lesson-item-row glass-card">
        <div className="drag-handle"><GripVertical size={18} /></div>
        <div className="lesson-content">
          <span className="lesson-title">{lesson.title}</span>
        </div>
        <div className="lesson-actions">
          <button className="btn-icon edit" onClick={() => onEditDetails(lesson.id)} title="Edit Details">
            <Edit2 size={18} />
          </button>
          {isAdmin && (
            <button className="btn-icon delete" onClick={() => onDelete(lesson.id)}><Trash2 size={18} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherLessonManager;
