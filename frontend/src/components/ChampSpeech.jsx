import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ChampSpeech.scss';

const ChampSpeech = ({ text, direction = 'left' }) => {
  return (
    <AnimatePresence>
      {text && (
        <motion.div 
          className={`champ-speech-bubble ${direction === 'right' ? 'point-right' : ''}`}
          initial={{ opacity: 0, x: direction === 'right' ? 20 : -20, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          {text}
          <div className="bubble-arrow"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChampSpeech;
