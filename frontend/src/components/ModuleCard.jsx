import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Eye, 
  EyeOff, 
  Trash2, 
  Check, 
  BookOpen, 
  ChevronDown, 
  Settings2,
  FileText,
  Play,
  FileDown,
  MessageSquare,
  ClipboardList
} from 'lucide-react';

const ActivityItem = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'LABEL': return <FileText size={16} />;
      case 'PAGE': return <FileText size={16} />;
      case 'RESOURCE': return <FileDown size={16} />;
      case 'FORUM': return <MessageSquare size={16} />;
      case 'ASSIGNMENT': return <ClipboardList size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  return (
    <div className={`activity-pill ${activity.type.toLowerCase()}`}>
      <span className="activity-icon">{getIcon()}</span>
      <span className="activity-title">{activity.title}</span>
      {activity.isHidden && <EyeOff size={14} className="hidden-indicator" />}
    </div>
  );
};

const ModuleCard = ({ 
  section, 
  onUpdate, 
  onToggleVisibility, 
  onManage, 
  onDelete,
  saveFeedback 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(section.title);

  const totalActivities = section.lessons.reduce((acc, l) => acc + (l.activities?.length || 0), 0);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (tempTitle !== section.title) {
      onUpdate({ title: tempTitle });
    }
  };

  return (
    <motion.div 
      layout
      className={`module-tile glass-card ${section.isHidden ? 'is-hidden' : ''}`}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="tile-main" onClick={() => setIsExpanded(!isExpanded)}>
        {saveFeedback && (
          <div className="save-toast">
            <Check size={14} /> Saved
          </div>
        )}

        <div className="tile-header">
          <div className="title-group" onClick={(e) => e.stopPropagation()}>
            {isEditingTitle ? (
              <input 
                autoFocus
                className="tile-title-input"
                value={tempTitle}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                onChange={(e) => setTempTitle(e.target.value)}
              />
            ) : (
              <h3 className="tile-title" onClick={() => setIsEditingTitle(true)}>
                {section.title}
                <Edit3 size={14} className="edit-hint" />
              </h3>
            )}
          </div>

          <div className="tile-badges">
            {section.hasOverride && (
              <span className="badge modified" title="Customized for this batch">
                <Settings2 size={12} /> Modified
              </span>
            )}
            {section.isHidden && (
              <span className="badge hidden">
                <EyeOff size={12} /> Hidden
              </span>
            )}
          </div>
        </div>

        <div className="tile-stats">
          <div className="stat">
            <BookOpen size={14} />
            <span>{section.lessons.length} Lessons</span>
          </div>
          <div className="stat">
            <ClipboardList size={14} />
            <span>{totalActivities} Activities</span>
          </div>
          <motion.div 
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="expand-icon"
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="tile-expansion"
          >
            <div className="expansion-inner">
              <p className="tile-desc">{section.description || "No description provided."}</p>
              
              <div className="lesson-previews">
                {section.lessons.map(lesson => (
                  <div key={lesson.id} className="lesson-row">
                    <div className="lesson-info">
                      <span className="lesson-dot"></span>
                      <span className="lesson-title">{lesson.title}</span>
                    </div>
                    <div className="activity-list">
                      {lesson.activities?.map(activity => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="tile-actions">
                <button className="btn-squishy primary" onClick={(e) => { e.stopPropagation(); onManage(); }}>
                  <Edit3 size={16} /> Edit Curriculum
                </button>
                <button 
                  className={`btn-squishy ${section.isHidden ? 'success' : 'secondary'}`} 
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
                >
                  {section.isHidden ? <><Eye size={16} /> Restore Visibility</> : <><EyeOff size={16} /> Hide Module</>}
                </button>
                <button className="btn-squishy danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModuleCard;
