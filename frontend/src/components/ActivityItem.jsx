import React, { useState } from 'react';
import axios from 'axios';
import { 
  FileText, 
  FileDown, 
  MessageSquare, 
  ClipboardList, 
  EyeOff,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

const ActivityItem = ({ batchId, activity, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fullContent, setFullContent] = useState(null);

  const getIcon = () => {
    switch (activity.type) {
      case 'LABEL': return <FileText size={18} />;
      case 'PAGE': return <FileText size={18} />;
      case 'RESOURCE': return <FileDown size={18} />;
      case 'FORUM': return <MessageSquare size={18} />;
      case 'ASSIGNMENT': return <ClipboardList size={18} />;
      default: return <FileText size={18} />;
    }
  };

  const handleAction = async () => {
    if (activity.type === 'PAGE') {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/academic/batches/${batchId}/activities/${activity.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFullContent(res.data.longContent);
        setShowModal(true);
      } catch (err) {
        console.error('Error fetching activity details:', err);
      } finally {
        setLoading(false);
      }
    } else if (activity.type === 'RESOURCE' && activity.exerciseFileUrl) {
      window.open(activity.exerciseFileUrl, '_blank');
    }
  };

  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`activity-item-card glass-card ${activity.type.toLowerCase()}`}
        onClick={handleAction}
      >
        <div className="icon-wrapper">
          {getIcon()}
        </div>
        <div className="content-wrapper">
          <h4 className="title">{activity.title}</h4>
          {activity.description && <p className="desc">{activity.description}</p>}
        </div>
        <div className="status-wrapper">
          {activity.type === 'ASSIGNMENT' ? (
            <span className="assignment-badge">Graded</span>
          ) : (
            <button 
              className={`btn-complete ${activity.isCompleted ? 'done' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onComplete(activity.id);
              }}
            >
              {activity.isCompleted ? <CheckCircle2 size={18} /> : <div className="circle-hollow" />}
            </button>
          )}
        </div>
      </motion.div>

      {showModal && (
        <div className="glass-modal-overlay" onClick={() => setShowModal(false)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{activity.title}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body rich-content" dangerouslySetInnerHTML={{ __html: fullContent }} />
            <div className="modal-footer">
               <button className="btn-squishy primary" onClick={() => { onComplete(activity.id); setShowModal(false); }}>
                 Mark as Read
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ActivityItem;
