import React from 'react';
import { motion } from 'framer-motion';

const ActionIconButton = ({ 
  icon: Icon, 
  onClick, 
  title, 
  colorClass = "text-primary-600 bg-primary-50 hover:bg-primary-100", 
  disabled = false 
}) => {
  return (
    <div className="relative group inline-block mr-2 last:mr-0">
      <motion.button
        type="button"
        disabled={disabled}
        onClick={onClick}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        className={`p-2 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}
        aria-label={title}
      >
        <Icon className="w-4 h-4" />
      </motion.button>
      {title && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {title}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

export default ActionIconButton;
