import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings2, 
  BookOpen, 
  LayoutGrid, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2,
  Edit3,
  ChevronRight,
  ClipboardList,
  FileText,
  FileDown,
  MessageSquare,
  Sparkles,
  GripVertical,
  Save,
  Monitor,
  User,
  CheckCircle2,
  Image as ImageIcon,
  UploadCloud,
  X,
  Info,
  Download,
  ClipboardCheck,
  Type
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import MascotChamp from '../../components/MascotChamp';
import ChampSpeech from '../../components/ChampSpeech';
import CelebrationToast from '../../components/CelebrationToast';
import ActivityEditor from '../../components/ActivityEditor';
import { motion, AnimatePresence } from 'framer-motion';
import './ModuleWorkspacePage.scss';

import mammoth from 'mammoth';

const ActivityNode = ({ activity, isStudentView, onEdit, onToggleHide, activeActivity, onRequestDelete }) => {
  const isLabel = activity.type === 'LABEL';
  
  if (isStudentView && activity.isHidden) return null;

  if (isLabel) {
    return (
      <div 
        className={`activity-tactical-card type-label ${activity.isHidden ? 'is-hidden' : ''}`}
        onClick={() => onEdit(activity)}
      >
        <div className="card-content">
          <div className="main-info">
            <div className="header-row">
              <span className="label-icon"><Sparkles size={16} /></span>
              <h4>{activity.title}</h4>
            </div>
            {activity.description && <p>{activity.description}</p>}
          </div>
        </div>
        {!isStudentView && (
          <div className="node-actions">
            <button onClick={(e) => { e.stopPropagation(); onToggleHide(activity); }}>
              {activity.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button className="delete" onClick={(e) => { e.stopPropagation(); onRequestDelete(activity.id); }}>
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div 
      layout
      whileHover={{ scale: 1.02 }}
      className={`activity-path-node ${activity.isHidden ? 'is-hidden' : ''} ${activity.hasOverride ? 'modified' : ''} ${activeActivity?.id === activity.id ? 'active' : ''}`}
      onClick={() => onEdit(activity)}
    >
      {!isStudentView && (
        <div className="node-drag">
          <GripVertical size={16} />
        </div>
      )}
      
      <div className="node-circle">
        {activity.type === 'PAGE' && <FileText size={20} />}
        {activity.type === 'RESOURCE' && <FileDown size={20} />}
        {activity.type === 'ASSIGNMENT' && <ClipboardCheck size={20} />}
        {activity.type === 'FORUM' && <MessageSquare size={20} />}
      </div>

      <div className="node-details">
        <h4>{activity.title}</h4>
        <span className="node-type-label">{activity.type}</span>
      </div>

      {!isStudentView && (
        <div className="node-actions">
          <button onClick={(e) => { e.stopPropagation(); onToggleHide(activity); }}>
            {activity.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button className="delete" onClick={(e) => { e.stopPropagation(); onRequestDelete(activity.id); }}>
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

const GhostNode = ({ onClick }) => (
  <div className="ghost-node-wrapper">
    <motion.button 
      className="ghost-node-btn"
      whileHover={{ scale: 1.2, rotate: 90 }}
      onClick={onClick}
    >
      <Plus size={16} />
    </motion.button>
  </div>
);

const ModuleWorkspacePage = () => {
  const { batchId, moduleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [batchName, setBatchName] = useState('');
  const [isStudentView, setIsStudentView] = useState(false);
  const [activeActivity, setActiveActivity] = useState(null); 
  const [saveStatus, setSaveStatus] = useState({}); 
  const [toastConfig, setToastConfig] = useState({ show: false, message: '', type: 'success' });
  const saveTimeout = useRef(null);

  useEffect(() => {
    fetchModuleData();
  }, [batchId, moduleId]);

  const fetchModuleData = async (background = false) => {
    if (!background) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/academic/batches/${batchId}/curriculum`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBatchName(res.data.name);
      const targetModule = res.data.sections.find(s => s.id === parseInt(moduleId));
      setModule(targetModule);
    } catch (err) {
      console.error('Error fetching module:', err);
    } finally {
      if (!background) setLoading(false);
    }
  };

  const handleOptimisticUpdate = (activityId, updates) => {
    const updatedModule = { ...module };
    updatedModule.lessons = updatedModule.lessons.map(lesson => ({
      ...lesson,
      activities: lesson.activities.map(a => 
        a.id === activityId ? { ...a, ...updates } : a
      )
    }));
    setModule(updatedModule);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const activity = updatedModule.lessons.flatMap(l => l.activities).find(a => a.id === activityId);
        await axios.post('http://localhost:5000/api/academic/batches/overrides/activity', {
          batchId,
          activityId,
          ...activity
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        setSaveStatus({ ...saveStatus, [activityId]: 'saved' });
        setTimeout(() => setSaveStatus(prev => ({ ...prev, [activityId]: null })), 2000);
      } catch (err) {
        console.error('Save failed', err);
      }
    }, 300);
  };

  const [editingLesson, setEditingLesson] = useState(null); // {id, title}
  const [addingToLesson, setAddingToLesson] = useState(null); // lessonId
  const [deleteConfirm, setDeleteConfirm] = useState(null); // activityId to delete
  const [lessonDeleteConfirm, setLessonDeleteConfirm] = useState(null); // lessonId to delete
  const [deleteFileConfirm, setDeleteFileConfirm] = useState(false); // boolean for current file

  useEffect(() => {
    if (addingToLesson) {
      setTimeout(() => {
        const picker = document.querySelector('.add-content-zone');
        if (picker) {
          picker.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [addingToLesson]);

  const handleAddLesson = async () => {
    try {
      const token = localStorage.getItem('token');
      const order = module.lessons ? module.lessons.length : 0;
      await axios.post('http://localhost:5000/api/academic/lessons', {
        sectionId: parseInt(moduleId),
        title: `New Lesson ${order + 1}`,
        orderIndex: order
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchModuleData(true);
    } catch (err) {
      console.error('Error creating lesson:', err);
    }
  };

  const handleDeleteLesson = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/academic/lessons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchModuleData(true);
      setLessonDeleteConfirm(null);
      showToast('Lesson deleted successfully');
    } catch (err) {
      console.error('Error deleting lesson:', err);
      showToast('Failed to delete lesson', 'error');
    }
  };

  const handleAddActivity = async (lessonId, type = 'PAGE', order = 0) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/academic/activities', {
        lessonId,
        title: `New ${type.toLowerCase()}`,
        type,
        orderIndex: order
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setAddingToLesson(null);
      fetchModuleData(true);
      setActiveActivity(res.data);
    } catch (err) {
      console.error('Error adding activity:', err);
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/academic/activities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchModuleData(true);
      if (activeActivity?.id === id) setActiveActivity(null);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting activity:', err);
    }
  };

  const handleSaveLessonName = async () => {
    if (!editingLesson || !editingLesson.title.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/academic/batches/overrides/lesson', {
        batchId: parseInt(batchId),
        lessonId: editingLesson.id,
        title: editingLesson.title
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setEditingLesson(null);
      fetchModuleData(true);
    } catch (err) {
      console.error('Error renaming lesson:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToastConfig({ show: true, message, type });
    setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 4000);
  };

  const handleTestChamp = () => {
    showToast('Great job! Your progress has been updated.', 'success');
  };

  if (loading) return (
    <div className="admin-layout">
      <Sidebar />
      <main className="dashboard-main centered">
        <MascotChamp size={100} className="loading-spin" />
      </main>
    </div>
  );

  if (!module) return (
    <div className="admin-layout">
      <Sidebar />
      <main className="dashboard-main centered">
         <div className="error-state">
            <MascotChamp size={120} />
            <h2>Oops! Module Not Found</h2>
            <p>We couldn't find the curriculum data for this module.</p>
            <button className="btn-squishy primary" onClick={() => navigate(`/teacher/batches/${batchId}`)}>
               Back to Batch
            </button>
         </div>
      </main>
    </div>
  );

  return (
    <div className="admin-layout">
      <div className="gradient-mesh"></div>
      <Sidebar />
      <CelebrationToast show={toastConfig.show} message={toastConfig.message} type={toastConfig.type} />
      
      <main className={`dashboard-main module-workspace ${isStudentView ? 'student-view' : ''}`}>
        <header className="workspace-sticky-header">
          <div className="breadcrumb-nav">
            <span onClick={() => navigate('/teacher/batches')}>Batches</span>
            <ChevronRight size={14} />
            <span onClick={() => navigate(`/teacher/batches/${batchId}`)}>{batchName}</span>
            <ChevronRight size={14} />
            <span className="current">{module.title}</span>
            {module.hasOverride && <span className="modified-badge">Modified</span>}
          </div>

          <div className="header-actions">
            <button 
              className={`toggle-view-btn ${isStudentView ? 'active' : ''}`}
              onClick={() => setIsStudentView(!isStudentView)}
            >
              {isStudentView ? <><Monitor size={18} /> Teacher Mode</> : <><User size={18} /> View as Student</>}
            </button>
            {!isStudentView && (
              <button className="btn-workspace primary" onClick={handleTestChamp}>
                <Sparkles size={18} /> Test Mascot
              </button>
            )}
          </div>
        </header>

        <div className="workspace-content-grid">
          <div className="curriculum-pipeline">
             <AnimatePresence mode='popLayout'>
              {module.lessons.map((lesson, lIdx) => (
                <motion.section 
                  layout
                  key={lesson.id} 
                  className="lesson-segment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
                >
                    <div className="lesson-segment-header">
                      <div className="number-ring">0{lIdx + 1}</div>
                      {editingLesson?.id === lesson.id ? (
                        <div className="lesson-title-edit">
                           <input 
                             autoFocus
                             value={editingLesson.title}
                             onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                             onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveLessonName();
                                if (e.key === 'Escape') setEditingLesson(null);
                             }}
                           />
                           <button className="btn-save-mini" onClick={handleSaveLessonName}><Save size={14} /></button>
                           <button className="btn-cancel-mini" onClick={() => setEditingLesson(null)}><X size={14} /></button>
                        </div>
                      ) : (
                        <>
                          <h3>{lesson.title}</h3>
                          {!isStudentView && (
                             <div className="lesson-actions">
                               <button 
                                 className="lesson-settings" 
                                 onClick={() => setEditingLesson({ id: lesson.id, title: lesson.title })}
                               >
                                 <Settings2 size={16} />
                               </button>
                               <button 
                                 className="lesson-delete" 
                                 onClick={() => setLessonDeleteConfirm(lesson.id)}
                               >
                                 <Trash2 size={16} />
                               </button>
                             </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="activities-path">
                      <div className="path-connector-line"></div>
                      
                      {lesson.activities.map((activity, aIdx) => (
                        <React.Fragment key={activity.id}>
                          <GhostNode onClick={() => setAddingToLesson({ lessonId: lesson.id, order: aIdx })} />
                          <ActivityNode 
                            activity={activity} 
                            isStudentView={isStudentView}
                            activeActivity={activeActivity}
                            onEdit={async (act) => {
                              if (isStudentView) return;
                              setActiveActivity(act);
                              try {
                                const token = localStorage.getItem('token');
                                const res = await axios.get(`http://localhost:5000/api/academic/batches/${batchId}/activities/${act.id}`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                setActiveActivity(res.data);
                              } catch (err) {
                                console.error('Error fetching full activity details:', err);
                              }
                            }}
                            onToggleHide={(act) => handleOptimisticUpdate(act.id, { isHidden: !act.isHidden })}
                            onRequestDelete={setDeleteConfirm}
                          />
                        </React.Fragment>
                      ))}
                      
                      <GhostNode onClick={() => setAddingToLesson({ lessonId: lesson.id, order: lesson.activities.length })} />

                      {!isStudentView && addingToLesson?.lessonId === lesson.id && (
                        <div className="add-content-zone interstitial">
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.9, y: 10 }}
                             animate={{ opacity: 1, scale: 1, y: 0 }}
                             transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }}
                             className="type-picker-grid"
                           >
                             <button className="type-item" onClick={() => handleAddActivity(lesson.id, 'LABEL', addingToLesson.order)}>
                               <Type size={20} />
                               <span>Label</span>
                             </button>
                             <button className="type-item" onClick={() => handleAddActivity(lesson.id, 'PAGE', addingToLesson.order)}>
                               <FileText size={20} />
                               <span>Page</span>
                             </button>
                             <button className="type-item" onClick={() => handleAddActivity(lesson.id, 'ASSIGNMENT', addingToLesson.order)}>
                               <ClipboardCheck size={20} />
                               <span>Assignment</span>
                             </button>
                             <button className="type-item" onClick={() => handleAddActivity(lesson.id, 'RESOURCE', addingToLesson.order)}>
                               <Download size={20} />
                               <span>Resource</span>
                             </button>
                             <button className="type-item" onClick={() => navigate('/teacher/feature-coming-soon')}>
                               <MessageSquare size={20} />
                               <span>Forum</span>
                             </button>
                             <button className="type-item cancel" onClick={() => setAddingToLesson(null)}>
                               <X size={20} />
                               <span>Cancel</span>
                             </button>
                           </motion.div>
                        </div>
                      )}
                    </div>
                </motion.section>
              ))}
            </AnimatePresence>
            
            {!isStudentView && (
              <div className="add-lesson-wrapper">
                <button 
                  onClick={handleAddLesson}
                  className="btn-add-lesson"
                >
                  <Plus size={20} />
                  Add New Lesson
                </button>
              </div>
            )}
          </div>

          <aside className="workspace-info-sidebar">
             <div className="workspace-card glass-card">
                <h3>Module Overview</h3>
                <p>{module.description || 'No description provided.'}</p>
                <div className="stats-row">
                   <div className="stat-box">
                      <span className="val">{module.lessons.length}</span>
                      <span className="lbl">Lessons</span>
                   </div>
                   <div className="stat-box">
                      <span className="val">{module.lessons.reduce((acc, l) => acc + l.activities.length, 0)}</span>
                      <span className="lbl">Activities</span>
                   </div>
                </div>
             </div>

             <div className="champ-corner">
                <MascotChamp size={160} />
                <ChampSpeech text={isStudentView ? "This is how your students see the course. Labels are full-width instructional blocks, while resources are compact grid items." : "Welcome back! All edits here use our Standard Average Model—meaning no complex weights, just clear progress tracking."} />
             </div>
          </aside>
        </div>

        <AnimatePresence>
          {activeActivity && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="side-editor-panel glass-card"
            >
              <div className="panel-header">
                 <div className="header-type-info">
                   <span className={`type-tag ${activeActivity.type.toLowerCase()}`}>{activeActivity.type}</span>
                   <h2>Edit {activeActivity.title}</h2>
                 </div>
                 <button className="close-btn" onClick={() => setActiveActivity(null)}><X size={24} /></button>
              </div>

              <div className="panel-body">
                {activeActivity.type === 'LABEL' ? (
                  <>
                    <div className="input-group">
                      <label>Label Title</label>
                      <input 
                        className="title-input"
                        value={activeActivity.title || ''} 
                        onChange={(e) => {
                          handleOptimisticUpdate(activeActivity.id, { title: e.target.value });
                          setActiveActivity(prev => ({...prev, title: e.target.value}));
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label>Online Class Link (Zoom / Google Meet)</label>
                      <input 
                        placeholder="https://zoom.us/j/123..."
                        value={activeActivity.exerciseFileUrl || ''} 
                        onChange={(e) => {
                          handleOptimisticUpdate(activeActivity.id, { exerciseFileUrl: e.target.value });
                          setActiveActivity(prev => ({...prev, exerciseFileUrl: e.target.value}));
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="input-group">
                      <label>Activity Title</label>
                      <input 
                        className="title-input"
                        value={activeActivity.title || ''} 
                        onChange={(e) => {
                          handleOptimisticUpdate(activeActivity.id, { title: e.target.value });
                          setActiveActivity(prev => ({...prev, title: e.target.value}));
                        }}
                      />
                      {saveStatus[activeActivity.id] === 'saved' && <span className="save-indicator"><CheckCircle2 size={12} /> Saved</span>}
                    </div>
                    <div className="input-group">
                      <label>Document Source</label>
                      
                      {activeActivity.exerciseFileUrl && (
                        <div className="current-file-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                             <FileText size={16} />
                             <span>Currently Syncing: <a href={activeActivity.exerciseFileUrl} target="_blank" rel="noopener noreferrer">{activeActivity.exerciseFileUrl.split('/').pop()}</a></span>
                           </div>
                           <button 
                             className="delete-file-btn"
                             title="Remove file"
                             onClick={() => setDeleteFileConfirm(true)}
                             style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.3s' }}
                             onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.1)'}
                             onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      )}

                      <div className="upload-dropzone lively-dropzone">
                        <input 
                          type="file" 
                          accept=".docx,.pdf"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            
                            if (file.name.endsWith('.docx')) {
                              const arrayBuffer = await file.arrayBuffer();
                              const result = await mammoth.convertToHtml({ arrayBuffer });
                              handleOptimisticUpdate(activeActivity.id, { longContent: result.value });
                              setActiveActivity(prev => ({...prev, longContent: result.value}));
                            } else {
                              handleOptimisticUpdate(activeActivity.id, { longContent: null });
                              setActiveActivity(prev => ({...prev, longContent: null}));
                            }

                            const formData = new FormData();
                            formData.append('image', file);
                            
                            try {
                              const token = localStorage.getItem('token');
                              const uploadRes = await axios.post('http://localhost:5000/api/assets/upload', formData, {
                                headers: { 
                                  Authorization: `Bearer ${token}`,
                                  'Content-Type': 'multipart/form-data'
                                }
                              });

                              const fileUrl = uploadRes.data.url;
                              handleOptimisticUpdate(activeActivity.id, { exerciseFileUrl: fileUrl });
                              setActiveActivity(prev => ({...prev, exerciseFileUrl: fileUrl}));
                            } catch (err) {
                              console.error('Upload failed', err);
                              const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to upload document.';
                              showToast(`Upload failed: ${errMsg}`, 'error');
                            }
                          }}
                        />
                        <UploadCloud size={32} />
                        <p>Drop DOCX or PDF here to Sync Content</p>
                      </div>
                    </div>

                    {activeActivity.longContent ? (
                       <div className="lively-preview-container glass-card">
                          <div className="preview-header">
                             <Sparkles size={16} /> Live Rendering Preview (DOCX)
                          </div>
                          <div 
                            className="preview-body"
                            dangerouslySetInnerHTML={{ __html: activeActivity.longContent }}
                          />
                       </div>
                    ) : activeActivity.exerciseFileUrl && activeActivity.exerciseFileUrl.endsWith('.pdf') ? (
                       <div className="lively-preview-container glass-card">
                          <div className="preview-header">
                             <FileText size={16} /> PDF Document Preview
                          </div>
                          <div className="preview-body pdf-preview" style={{ padding: 0, height: '500px' }}>
                             <object data={activeActivity.exerciseFileUrl} type="application/pdf" width="100%" height="100%">
                               <p>Unable to display PDF file. <a href={activeActivity.exerciseFileUrl}>Download instead</a>.</p>
                             </object>
                          </div>
                       </div>
                    ) : null}
                  </>
                )}
              </div>
              
              <div className="panel-footer">
                 <button className="btn-squishy primary" onClick={() => {
                    handleTestChamp();
                    setActiveActivity(null);
                 }}>
                    <Save size={18} /> Finish Editing
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Champ Deletion Confirmation - Centered Overlay */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="champ-confirm-overlay"
          >
            <div className="mascot-section">
              <div className="champ-greeting">
                <div className="speech-bubble">
                  <p>"Whoa! Are you sure about deleting this? It's a vital part of the learning journey!"</p>
                  <div className="action-buttons">
                    <button className="cancel" onClick={() => setDeleteConfirm(null)}>
                      Keep it
                    </button>
                    <button className="danger" onClick={() => handleDeleteActivity(deleteConfirm)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <div className="champ-mascot">
                <img alt="Champ" src="/assets/champ_mascot.png" />
              </div>
            </div>
          </motion.div>
        )}

        {lessonDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="champ-confirm-overlay"
          >
            <div className="mascot-section">
              <div className="champ-greeting">
                <div className="speech-bubble">
                  <p>"Deleting this lesson will remove all its activities. Are you absolutely sure?"</p>
                  <div className="action-buttons">
                    <button className="cancel" onClick={() => setLessonDeleteConfirm(null)}>
                      Keep it
                    </button>
                    <button className="danger" onClick={() => handleDeleteLesson(lessonDeleteConfirm)}>
                      Delete Lesson
                    </button>
                  </div>
                </div>
              </div>
              <div className="champ-mascot">
                <img alt="Champ" src="/assets/champ_mascot.png" />
              </div>
            </div>
          </motion.div>
        )}
        
        {deleteFileConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="champ-confirm-overlay"
            style={{ zIndex: 3000 }}
          >
            <div className="mascot-section">
              <div className="champ-greeting">
                <div className="speech-bubble">
                  <p>"Whoa! Are you sure about deleting this? It's a vital part of the learning journey!"</p>
                  <div className="action-buttons">
                    <button className="cancel" onClick={() => setDeleteFileConfirm(false)}>
                      Keep it
                    </button>
                    <button className="danger" onClick={() => {
                      handleOptimisticUpdate(activeActivity.id, { exerciseFileUrl: null, longContent: null });
                      setActiveActivity(prev => ({...prev, exerciseFileUrl: null, longContent: null}));
                      setDeleteFileConfirm(false);
                    }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <div className="champ-mascot">
                <img alt="Champ" src="/assets/champ_mascot.png" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModuleWorkspacePage;
