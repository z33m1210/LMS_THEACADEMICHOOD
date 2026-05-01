import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MascotChamp from './MascotChamp';
import { Check, AlertCircle } from 'lucide-react';

const CelebrationToast = ({ show, message, type = 'success' }) => {
  const isError = type === 'error';
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className={`champ-toast glass-card ${isError ? 'toast-error' : ''}`}
        >
          <div className="toast-mascot">
            <MascotChamp size={60} />
          </div>
          <div className="toast-content">
            <div className="toast-header" style={{ color: isError ? '#e74c3c' : '#2ecc71' }}>
              {isError ? <AlertCircle size={16} /> : <Check size={16} />}
              <span>{isError ? 'Oops!' : 'Great job!'}</span>
            </div>
            <p className="toast-msg">{message || 'Your progress has been updated.'}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationToast;
