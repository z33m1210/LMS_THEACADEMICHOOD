import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import MascotChamp from '../../components/MascotChamp';
import './CourseBuilder.scss';

const CourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/academic/courses`);
      const current = res.data.find(c => c.id === parseInt(courseId));
      setCourse(current);
      // Mocking nested sections for UI demo
      setSections([
        { 
          id: 1, 
          title: 'Week 1: Foundations', 
          meetingLink: 'https://zoom.us/j/123', 
          meetingTime: 'Monday 10:00 AM',
          lessons: [
            { 
              id: 1, 
              title: 'Introduction to Grammar', 
              materials: [{ type: 'PDF', title: 'Guide.pdf' }],
              assignments: [
                { id: 1, title: 'Noun Basics', weight: 40 },
                { id: 2, title: 'Verb Mastery', weight: 60 }
              ]
            }
          ]
        }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalWeight = () => {
    let sum = 0;
    sections.forEach(s => {
      s.lessons.forEach(l => {
        l.assignments?.forEach(a => {
          sum += parseFloat(a.weight || 0);
        });
      });
    });
    return sum;
  };

  const totalWeight = calculateTotalWeight();
  const isWeightValid = totalWeight === 100;

  const handleSave = async () => {
    if (!isWeightValid) {
      alert(`Academic Restriction: Total assignment weight must be exactly 100%. Current: ${totalWeight}%`);
      return;
    }
    alert("Curriculum Saved Successfully!");
  };

  return (
    <div className="admin-layout">
      <div className="gradient-mesh"></div>
      <Sidebar />
      <main className="dashboard-main">
        <div className="page-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900 }}>Curriculum Builder</h1>
            <p style={{ margin: '5px 0 0', color: 'rgba(44, 62, 80, 0.6)', fontWeight: 600 }}>
               Building: <span style={{ color: 'var(--primary)' }}>{course?.title || 'Loading...'}</span>
            </p>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className={`weight-counter ${isWeightValid ? 'valid' : 'invalid'}`} style={{
              background: isWeightValid ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
              color: isWeightValid ? '#27ae60' : '#e74c3c',
              padding: '8px 16px',
              borderRadius: '30px',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              Weight: {totalWeight}%
              {!isWeightValid && <span title="Total must be 100% to save" style={{ cursor: 'help' }}>ⓘ</span>}
            </div>
            <button 
              className="btn-squishy primary" 
              onClick={handleSave} 
              disabled={!isWeightValid}
              style={{ opacity: isWeightValid ? 1 : 0.5 }}
            >
              Save Curriculum
            </button>
            <button className="btn-squishy">+ Add New Section</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <MascotChamp size={100} className="loading-spin" />
            <span>Assembling curriculum...</span>
          </div>
        ) : (
          <div className="builder-container">
            {sections.map(section => (
              <div key={section.id} className={`section-accordion ${activeSection === section.id ? 'open' : ''}`}>
                <div className="section-header" onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}>
                  <div className="title">
                    <span className="icon">{activeSection === section.id ? '📂' : '📁'}</span>
                    {section.title}
                  </div>
                  <div className="meta">
                    {section.meetingLink && <span className="meeting-badge">Live Class Linked</span>}
                    <span className="arrow" style={{ transform: activeSection === section.id ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </div>
                </div>

                {activeSection === section.id && (
                  <div className="section-content">
                    <div className="meeting-info">
                      <strong>Meeting Details:</strong> 
                      <a href={section.meetingLink} target="_blank" rel="noreferrer">Open Class Link</a>
                      <span>({section.meetingTime})</span>
                    </div>

                    <div className="lessons-list">
                      {section.lessons.map(lesson => (
                        <div key={lesson.id} className="lesson-item">
                          <div className="lesson-title">📖 {lesson.title}</div>
                          
                          <div className="assignments-list" style={{ marginLeft: '30px', marginBottom: '15px' }}>
                            {lesson.assignments?.map(asg => (
                              <div key={asg.id} className="assignment-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', marginBottom: '5px' }}>
                                <span>📝 {asg.title}</span>
                                <div className="weight-input">
                                  <input 
                                    type="number" 
                                    value={asg.weight} 
                                    style={{ width: '50px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                                    onChange={(e) => {
                                        const newSections = [...sections];
                                        const s = newSections.find(sec => sec.id === section.id);
                                        const l = s.lessons.find(less => less.id === lesson.id);
                                        const a = l.assignments.find(a => a.id === asg.id);
                                        a.weight = e.target.value;
                                        setSections(newSections);
                                    }}
                                  /> %
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="lesson-actions">
                            <button className="btn-text">+ Material</button>
                            <button className="btn-text">+ Assignment</button>
                          </div>
                        </div>
                      ))}
                      <button className="btn-dashed">
                         <span>+</span> Add New Lesson
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {sections.length === 0 && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '100px' }}>
                <MascotChamp size={150} />
                <h3 style={{ marginTop: '20px' }}>Curriculum is Empty</h3>
                <p style={{ color: 'rgba(44, 62, 80, 0.6)' }}>Start by adding your first section to this course.</p>
                <button className="btn-squishy" style={{ marginTop: '20px' }}>Create First Section</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseBuilder;
