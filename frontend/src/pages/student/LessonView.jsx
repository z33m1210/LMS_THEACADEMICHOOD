import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import LessonVictory from '../../components/LessonVictory';
import MascotChamp from '../../components/MascotChamp';
import ChampSpeech from '../../components/ChampSpeech';
import './LessonView.scss';

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [champMessage, setChampMessage] = useState('');

  const fetchLessonData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [lessonRes, subRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/content/lessons/${lessonId}`, config),
        axios.get(`http://localhost:5000/api/submissions/lesson/${lessonId}`, config)
      ]);
      setLesson(lessonRes.data);
      setSubmission(subRes.data);
      
      // Fetch progress specifically for this lesson
      const progressRes = await axios.get(`http://localhost:5000/api/academic/lesson-progress/${lessonId}`, config);
      setIsLessonCompleted(progressRes.data.isCompleted || false);
    } catch (err) {
      console.error('Error fetching lesson data:', err);
      // Fallback for demo if API fails
      setLesson({
        id: lessonId,
        title: 'Common Greetings in Business',
        content: 'In English, business greetings are essential for establishing professional rapport. From "Good morning" to "It is a pleasure to meet you", the tone must be right...',
        materials: [{ type: 'PDF', title: 'Vocabulary List.pdf' }],
        assignments: [{ id: 1, title: 'Write a 100-word business intro' }]
      });
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLessonData();
  }, [fetchLessonData]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignmentId', lesson?.assignments[0]?.id);

    if (submission && !window.confirm('Submitting a new version will replace your previous one. Continue?')) {
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/submissions/submit', formData, config);
      setChampMessage("Locked in! I'll get this to your teacher for review.");
      fetchLessonData();
      setTimeout(() => setChampMessage(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  }, [lesson, submission, fetchLessonData]);

  const handleCompleteLesson = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/academic/complete-lesson', { lessonId }, config);
      setIsLessonCompleted(true);
      setChampMessage("Legendary! You've mastered this lesson.");
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar']
    },
    maxSize: 5 * 1024 * 1024
  });

  if (loading) return <div className="loading-state"><MascotChamp size={100} className="loading-spin" /></div>;

  return (
    <div className="lesson-view-container">
      <nav className="lesson-nav">
        <button onClick={() => navigate('/student/dashboard')}>← Back to Map</button>
        <h2>{lesson?.title}</h2>
        <div className="champ-small">
          <MascotChamp size={40} />
        </div>
      </nav>

      <main className="lesson-content">
        <div className="content-card glass-panel">
          <p>{lesson?.content}</p>
          <div className="materials">
            {lesson?.materials?.map((m, i) => (
              <div key={i} className="material-link">📎 {m.originalName || m.title || 'Attached File'}</div>
            ))}
          </div>
        </div>

        {lesson?.assignments?.length > 0 && (
          <section className="submission-section">
            <div className="submission-card">
              <h3>{lesson.assignments[0].title}</h3>
              
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                {uploading ? (
                  <p>Uploading mission files...</p>
                ) : isDragActive ? (
                  <p>Drop your files here!</p>
                ) : submission ? (
                  <div className="active-submission-preview">
                    <p>Current Version: <strong>{submission.filePath.split(/[\\/]/).pop()}</strong></p>
                    <span className="file-info">Drag here to replace with a new version</span>
                  </div>
                ) : (
                  <div>
                    <p>Drag & drop your assignment here, or click to browse</p>
                    <span className="file-info">PDF, DOCX, ZIP, or RAR (Max 5MB)</span>
                  </div>
                )}
              </div>

              {submission && (
                <div className="submission-feedback-panel">
                  <div className="submission-status">
                    <div className="grade-info">
                      {submission.status === 'GRADED' ? (
                        <>Grade: <span className="grade-badge">{submission.grade}/100</span></>
                      ) : (
                        <span>Status: <span style={{color: 'var(--primary)'}}>Pending Review</span></span>
                      )}
                    </div>
                    {submission.filePath && (
                      <a href={`http://localhost:5000/${submission.filePath}`} target="_blank" rel="noreferrer" style={{color: 'var(--navy)', fontWeight: 700}}>
                        View Current Draft
                      </a>
                    )}
                  </div>
                  
                  {submission.status === 'GRADED' && submission.comments?.length > 0 && (
                    <div className="teacher-feedback" style={{ marginTop: '15px', padding: '15px', background: 'rgba(39, 174, 96, 0.1)', borderRadius: '10px', borderLeft: '4px solid #27ae60' }}>
                      <h4 style={{ margin: '0 0 5px', color: '#27ae60' }}>Feedback from Teacher:</h4>
                      <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--navy)' }}>"{submission.comments[0].message}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mascot-feedback" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <ChampSpeech text={champMessage} direction="right" />
              <MascotChamp size={80} />
            </div>
          </section>
        )}

        <div className="lesson-footer">
          <LessonVictory 
            onComplete={handleCompleteLesson} 
            isCompleted={isLessonCompleted}
          />
        </div>
      </main>
    </div>
  );
};

export default LessonView;
