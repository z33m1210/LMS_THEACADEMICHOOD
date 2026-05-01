import React from 'react';
import { Calendar, BarChart3, ArrowRight, ExternalLink } from 'lucide-react';
import './BatchCard.scss';

const BatchCard = ({ batch, onClick }) => {
  return (
    <div className="batch-card" onClick={onClick}>
      <div className="card-accent"></div>
      <div className="card-top">
        <h3>{batch.name}</h3>
        <a 
          href={batch.meetingLink} 
          target="_blank" 
          rel="noreferrer"
          className="next-session-badge clickable"
          onClick={(e) => e.stopPropagation()}
          title="Join Session"
        >
          <Calendar size={14} /> {batch.nextSession}
          <ExternalLink size={12} className="link-icon" />
        </a>
      </div>
      <p className="course-subtitle">{batch.courseName}</p>
      
      <div className="batch-metrics">
        <div className="metric">
          <BarChart3 size={16} />
          <span>{batch.averageGrade}% Avg Grade</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-label">
          <span>Course Completion</span>
          <span>{batch.progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${batch.progress}%` }}></div>
        </div>
      </div>

      <div className="card-footer">
        <span>Manage Curriculum</span>
        <ArrowRight size={18} />
      </div>
    </div>
  );
};

export default BatchCard;
