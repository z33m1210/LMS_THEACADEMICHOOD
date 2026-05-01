import React from 'react';
import { motion } from 'framer-motion';

const MascotChamp = ({ size = 100, className = "" }) => {
  return (
    <motion.div 
      className={`champ-mascot ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      style={{ width: size, height: size, cursor: 'pointer' }}
    >
      <img 
        src="/assets/champ_mascot.png" 
        alt="Champ" 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
      />
    </motion.div>
  );
};

export default MascotChamp;
