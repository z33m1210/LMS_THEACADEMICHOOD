import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Video, 
  FileText, 
  LayoutGrid, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import MascotChamp from '../../components/MascotChamp';
import ActivityEditor from '../../components/ActivityEditor';
import './BatchLessonEditor.scss';

const BatchLessonEditor = () => {
  const { batchId, lessonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  const [batchName, setBatchName] = useState('');

  useEffect(() => {
    fetchLessonData();
  }, [batchId, lessonId]);

  const fetchLessonData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch batch curriculum to get the specific lesson with its overrides
      const res = await axios.get(`http://localhost:5000/api/academic/batches/${batchId}/curriculum`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBatchName(res.data.name || 'Batch');
      
      // Find the lesson in the curriculum
      let targetLesson = null;
      res.data.sections.forEach(section => {
        const found = section.lessons.find(l => l.id === parseInt(lessonId));
        if (found) targetLesson = found;
      });

      if (targetLesson) {
        setLessonData({
          title: targetLesson.title || '',
          content: targetLesson.content || '',
          videoUrl: targetLesson.videoUrl || '',
          pdfUrl: targetLesson.pdfUrl || '',
          activities: targetLesson.activities.map(a => ({
            id: a.id,
            title: a.title,
            type: a.type,
            description: a.description || '',
            longContent: a.longContent || '',
            exerciseFileUrl: a.exerciseFileUrl || '',
            isHidden: a.isHidden || false
          }))
        });
      }
    } catch (err) {
      console.error('Error fetching lesson data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Save Lesson Override
      await axios.post('http://localhost:5000/api/academic/batches/overrides/lesson', {
        batchId: parseInt(batchId),
        lessonId: parseInt(lessonId),
        title: lessonData.title,
        content: lessonData.content,
        videoUrl: lessonData.videoUrl,
        pdfUrl: lessonData.pdfUrl
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Assignment weights decommissioned

      navigate(`/teacher/batches/${batchId}/lessons`);
    } catch (err) {
      alert('Error saving lesson details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <Sidebar />
        <main className="dashboard-main centered">
          <MascotChamp size={120} className="loading-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="gradient-mesh"></div>
      <Sidebar />
      <main className="dashboard-main">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate(`/teacher/batches/${batchId}/lessons`)}>
            <ArrowLeft size={20} /> Back to Curriculum
          </button>
          <div className="header-info">
            <h1>Edit Lesson Details</h1>
            <p>Batch: <span className="highlight">{batchName}</span></p>
          </div>
        </div>

        <div className="editor-container glass-card">
          <div className="editor-grid">
            {/* Left Side: Basic Info */}
            <div className="editor-section main-info">
              <div className="input-group">
                <label>Lesson Title</label>
                <input 
                  type="text" 
                  value={lessonData.title}
                  onChange={(e) => setLessonData({...lessonData, title: e.target.value})}
                  placeholder="e.g. Advanced Grammar & Composition"
                />
              </div>

              <div className="input-group">
                <label>Lesson Overview</label>
                <textarea 
                  value={lessonData.content}
                  onChange={(e) => setLessonData({...lessonData, content: e.target.value})}
                  placeholder="Describe the lesson objectives, materials, and flow..."
                  rows={5}
                />
              </div>

              <div className="activities-overrides">
                <h3>Activities Overrides</h3>
                {lessonData.activities.map((activity, idx) => (
                  <div key={activity.id} className="activity-override-card glass-card">
                    <div className="activity-header">
                      <span className="type-badge">{activity.type}</span>
                      <h4>{activity.title}</h4>
                    </div>
                    
                    {activity.type === 'PAGE' && (
                      <div className="input-group">
                        <label>Page Content (Rich Text)</label>
                        <ActivityEditor 
                          initialValue={activity.longContent} 
                          onChange={(content) => {
                            const newActs = [...lessonData.activities];
                            newActs[idx].longContent = content;
                            setLessonData({...lessonData, activities: newActs});
                          }} 
                        />
                      </div>
                    )}

                    <div className="input-group">
                      <label>Description Override</label>
                      <input 
                        type="text" 
                        value={activity.description} 
                        onChange={(e) => {
                          const newActs = [...lessonData.activities];
                          newActs[idx].description = e.target.value;
                          setLessonData({...lessonData, activities: newActs});
                        }}
                      />
                    </div>

                    {(activity.type === 'RESOURCE' || activity.type === 'ASSIGNMENT') && (
                      <div className="input-group">
                        <label>File/URL Override</label>
                        <input 
                          type="text" 
                          value={activity.exerciseFileUrl} 
                          onChange={(e) => {
                            const newActs = [...lessonData.activities];
                            newActs[idx].exerciseFileUrl = e.target.value;
                            setLessonData({...lessonData, activities: newActs});
                          }}
                        />
                      </div>
                    )}
                    
                    <button className="btn-save-override" onClick={async () => {
                      const token = localStorage.getItem('token');
                      await axios.post('http://localhost:5000/api/academic/batches/overrides/activity', {
                        batchId: parseInt(batchId),
                        activityId: activity.id,
                        title: activity.title,
                        description: activity.description,
                        longContent: activity.longContent,
                        exerciseFileUrl: activity.exerciseFileUrl,
                        isHidden: activity.isHidden
                      }, { headers: { Authorization: `Bearer ${token}` } });
                      alert('Activity saved!');
                    }}>
                      Save Activity Changes
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Resources & Weights */}
            <div className="editor-section side-info">
              <div className="resource-group">
                <h3><BookOpen size={18} /> Resources</h3>
                <div className="input-group">
                  <label><Video size={14} /> Video URL (Vimeo/YouTube)</label>
                  <input 
                    type="text" 
                    value={lessonData.videoUrl}
                    onChange={(e) => setLessonData({...lessonData, videoUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="input-group">
                  <label><FileText size={14} /> PDF Material URL</label>
                  <input 
                    type="text" 
                    value={lessonData.pdfUrl}
                    onChange={(e) => setLessonData({...lessonData, pdfUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="activities-list">
                <h3><LayoutGrid size={18} /> Module Path</h3>
                {lessonData.activities.length === 0 ? (
                  <p className="empty-msg">No activities in this lesson.</p>
                ) : (
                  lessonData.activities.map((act) => (
                    <div key={act.id} className="weight-input-row">
                      <div className={`asg-pill ${act.type.toLowerCase()}`}>
                        <CheckCircle size={14} />
                        <span>{act.title}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="editor-footer">
            <div className="info-msg">
              <AlertCircle size={16} />
              <span>Changes only apply to this batch cohort. The master course is safe.</span>
            </div>
            <button className="btn-squishy primary save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : <><Save size={20} /> Save Lesson Blueprint</>}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BatchLessonEditor;
