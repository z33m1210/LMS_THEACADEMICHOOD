import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MascotChamp from '../../components/MascotChamp';
import ChampSpeech from '../../components/ChampSpeech';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import './CoursePath.scss';

const CoursePath = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState({});

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/academic/courses/${courseId}`);
      setCourse(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching course:', err);
      setLoading(false);
    }
  };

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getLessonStatus = (lesson) => {
    if (lesson.progress?.[0]?.isCompleted) return 'completed';
    return 'open';
  };

  // Find the first uncompleted lesson to pulse
  const nextLessonId = course?.sections
    .flatMap(s => s.lessons)
    .find(l => !l.progress?.[0]?.isCompleted)?.id;

  // Calculate Progress
  const totalLessons = course?.sections.reduce((acc, s) => acc + s.lessons.length, 0) || 0;
  const completedLessons = course?.sections.reduce((acc, s) => 
    acc + s.lessons.filter(l => l.progress?.[0]?.isCompleted).length, 0) || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const getChampMessage = () => {
    if (progressPercent === 0) return "Ready to start your journey? Let's crush the first module!";
    if (progressPercent === 100) return "Course complete! You're an absolute legend!";
    if (progressPercent > 80) return "Almost at the finish line! Keep that fire burning!";
    return `Module ${Math.floor(progressPercent / 20) + 1} crushed! Onto the next challenge!`;
  };

  if (loading) return <div className="loading">Loading Path...</div>;

  return (
    <div className="course-path-portal">
      {/* Course Banner */}
      <header className="course-banner">
        <div className="banner-left">
          <p>Level: {course?.level}</p>
          <h1>{course?.title}</h1>
        </div>
        <div className="banner-right">
          <div className="progress-label">
            <span>Overall Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          {progressPercent === 100 && (
            <motion.button 
              className="btn-squishy"
              style={{ marginTop: '10px', background: 'var(--hood-orange)', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/student/achievements')}
            >
              🎓 Claim Certificate
            </motion.button>
          )}
        </div>
      </header>

      <div className="path-layout">
        <main className="modules-container">
          {course?.sections.map((section, sIdx) => (
            <motion.div 
              key={section.id}
              className={`module-card ${collapsedSections[section.id] ? 'collapsed' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.1 }}
            >
              <div className="module-header" onClick={() => toggleSection(section.id)}>
                <div className="header-info">
                  <h3>Module {sIdx + 1}: {section.title}</h3>
                  <span>{section.lessons.length} Lessons • {section.lessons.filter(l => l.progress?.[0]?.isCompleted).length} Completed</span>
                </div>
                <div className="header-action">▾</div>
              </div>

              <div className="module-content">
                <div className="lesson-path">
                  {section.lessons.map((lesson, lIdx) => {
                    const status = getLessonStatus(lesson);
                    const isNext = lesson.id === nextLessonId;
                    const hasAssignment = lesson.assignments?.length > 0;
                    
                    return (
                      <div key={lesson.id} className="node-wrapper">
                        <motion.div 
                          className={`lesson-node ${status} ${isNext ? 'active' : ''}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/student/lesson/${lesson.id}`)}
                        >
                          <div className="icon-box">
                            {status === 'completed' ? '✓' : (hasAssignment ? '📝' : '📖')}
                          </div>
                          <div className="node-text">
                            <h4>{lesson.title}</h4>
                            <p>{hasAssignment ? 'Assignment Included' : 'Reading Material'}</p>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </main>

        <aside className="champ-sidebar">
          <div className="guide-bubble">
            <ChampSpeech text={getChampMessage()} direction="right" />
            <MascotChamp size={120} />
          </div>
          
          <div className="batch-card glass-panel" style={{ padding: '20px', width: '100%', borderRadius: '20px' }}>
            <h4 style={{ margin: '0 0 10px', color: 'var(--navy)' }}>Learning Batch</h4>
            <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>
              Batch: THE-HOOD-2024
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePath;
