import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MascotChamp from '../components/MascotChamp';
import ChampSpeech from '../components/ChampSpeech';
import '../styles/auth.scss';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (storedUser.role === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="gradient-mesh"></div>
      
      <div className="login-container">
        <div className="champ-side">
          <MascotChamp size={280} />
          <ChampSpeech text="Ready to level up your English?" />
        </div>

        <div className="login-card">
          <div className="logo">The Academic <span>Hood</span></div>
          <h2>English Center LMS</h2>
          
          {error && <div className="error-msg">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="admin@academichood.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            
            <button type="submit" className="login-btn">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
