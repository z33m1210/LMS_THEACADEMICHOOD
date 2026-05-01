import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import ChampSpeech from '../../components/ChampSpeech';
import MascotChamp from '../../components/MascotChamp';
import { motion } from 'framer-motion';
import './StudentHome.scss';

const StudentHome = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    let result = courses.filter(c => 
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase())
    );

    if (filter === 'Completed') result = result.filter(c => c.progress === 100);
    if (filter === 'In Progress') result = result.filter(c => c.progress < 100 && c.progress > 0);

    setFilteredCourses(result);
  }, [search, filter, courses]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/student/my-courses');
      const mapped = res.data.map(c => ({
        ...c,
        category: c.category || 'General English',
        progress: c.progress, // Use actual progress from backend
        thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400'
      }));
      setCourses(mapped);
      setFilteredCourses(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-dashboard-layout">
      <div className="gradient-mesh"></div>
      <Sidebar />
      
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="welcome-section">
            <div className="text">
              <h1>Champion Your English</h1>
              <p>Great to see you again, {user?.name}! Champ has a new lesson for you.</p>
            </div>
            <div className="mascot-guide">
              <ChampSpeech text={`Ready to level up, ${user?.name.split(' ')[0]}?`} direction="right" />
              <MascotChamp size={120} />
            </div>
          </div>
        </header>

        <section className="dashboard-controls">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="What do you want to learn today?" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            {['All', 'In Progress', 'Completed'].map(f => (
              <button 
                key={f} 
                className={filter === f ? 'active' : ''} 
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="loading-state">
            <MascotChamp size={100} className="loading-spin" />
            <span>Loading your journey...</span>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="loading-state">
             <MascotChamp size={150} />
             <span>No courses yet! Champ is waiting for you to join a batch.</span>
             <button className="btn-squishy" style={{ marginTop: '20px' }}>Explore Courses</button>
          </div>
        ) : (
          <div className="course-grid-hanu">
            {filteredCourses.map((course, idx) => (
              <motion.div 
                key={`${course.id}-${course.batchId}`} 
                className="course-card-hanu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => window.location.href=`/student/course-path/${course.id}`}
              >
                <div className="card-thumb">
                  <img src={course.thumbnail} alt={course.title} />
                  <div className="category-badge">{course.category}</div>
                </div>
                <div className="card-content">
                  <h3 className="course-name">{course.title}</h3>
                  <span className="batch-info">{course.batchName}</span>
                  
                  <div className="progress-container-hanu">
                    <div className="progress-text">
                      <span>Course Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentHome;
