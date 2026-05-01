import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Terminal, 
  Briefcase, 
  GraduationCap, 
  Edit3, 
  Bell, 
  Trophy,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MascotChamp from './MascotChamp';
import './Sidebar.scss';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [alerts, setAlerts] = useState({ notifications: false, submissions: false });

  // Navigation Logic based on Role
  const getMenuItems = (role) => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', route: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'User Management', route: '/admin/users', icon: Users },
          { name: 'Academic (Courses/Batches)', route: '/admin/courses', icon: BookOpen },
          { name: 'Action Logs', route: '/admin/logs', icon: Terminal },
          { name: 'Master Builder', route: '/admin/course-builder/new', icon: Edit3 },
        ];
      case 'TEACHER':
        return [
          { name: 'Dashboard', route: '/teacher/dashboard', icon: LayoutDashboard },
          { name: 'Batch Management', route: '/teacher/batches', icon: Briefcase },
          { name: 'Grading Desk', route: '/teacher/grading-desk', icon: GraduationCap, alertKey: 'submissions' },
        ];
      case 'STUDENT':
        return [
          { name: 'Dashboard', route: '/student/dashboard', icon: LayoutDashboard },
          { name: 'My Courses', route: '/student/dashboard', icon: BookOpen }, // Mapping to dashboard as it holds courses
          { name: 'Notifications', route: '/student/notifications', icon: Bell, alertKey: 'notifications' },
          { name: 'Wall of Fame', route: '/student/achievements', icon: Trophy },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems(user?.role);

  // Alert Polling Engine
  useEffect(() => {
    const checkAlerts = async () => {
      try {
        if (user?.role === 'STUDENT') {
          const res = await axios.get('http://localhost:5000/api/submissions/notifications');
          const hasUnread = res.data.some(n => !n.isRead);
          setAlerts(prev => ({ ...prev, notifications: hasUnread }));
        } else if (user?.role === 'TEACHER') {
          const res = await axios.get('http://localhost:5000/api/submissions/pending');
          setAlerts(prev => ({ ...prev, submissions: res.data.length > 0 }));
        }
      } catch (err) {
        console.error('Alert fetch error:', err);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`unified-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="logo-text">
            Academic <span>Hood</span>
          </div>
        )}
        <button 
          className="collapse-toggle" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.route} 
            className={({ isActive }) => `squishy-link ${isActive ? 'active' : ''}`}
          >
            <div className="icon-wrapper">
              <item.icon size={22} strokeWidth={2.5} />
              {item.alertKey && alerts[item.alertKey] && <div className="alert-dot"></div>}
            </div>
            {!isCollapsed && <span className="link-text">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="mascot-section">
          {!isCollapsed && (
            <div className="champ-greeting">
              <div className="speech-bubble">
                {user?.role === 'STUDENT' ? "Keep going, Champ!" : "Ready to lead?"}
              </div>
            </div>
          )}
          <MascotChamp size={isCollapsed ? 45 : 60} />
        </div>
        
        <button className="logout-btn squishy-link" onClick={handleLogout}>
          <LogOut size={22} strokeWidth={2.5} />
          {!isCollapsed && <span className="link-text">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
