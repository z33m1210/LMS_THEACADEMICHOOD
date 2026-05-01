import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import './LessonVictory.scss';

const LessonVictory = ({ onComplete, isCompleted }) => {
  const [show, setShow] = useState(false);

  const handleVictory = () => {
    if (isCompleted) return;
    
    setShow(true);
    
    // Confetti Burst
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#e67e22', '#2c3e50', '#ffffff', '#f1c40f']
    });

    // Sound effect (Mock)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audio.play().catch(() => console.log('Audio blocked by browser'));

    // Update state after 1 second so button changes while overlay is up
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 1000);

    setTimeout(() => {
      setShow(false);
    }, 4000);
  };

  return (
    <div className="victory-trigger">
      <motion.button
        className={`btn-victory ${isCompleted ? 'completed' : ''}`}
        whileHover={!isCompleted ? { scale: 1.05 } : {}}
        whileTap={!isCompleted ? { scale: 0.95 } : {}}
        onClick={handleVictory}
        disabled={isCompleted}
      >
        {isCompleted ? 'Already Complete' : 'Complete Lesson!'}
      </motion.button>

      <AnimatePresence>
        {show && (
          <motion.div 
            className="victory-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="trophy-container"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
              transition={{ type: 'spring', damping: 10 }}
            >
              🏆
            </motion.div>
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              CHAMPION!
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              You just leveled up your English!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonVictory;
