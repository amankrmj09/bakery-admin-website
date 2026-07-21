import React from 'react';
import { useTheme } from '../../app/ThemeContext';

export const AuraBackground = () => {
  const { glass } = useTheme();

  if (!glass) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Red/Pink Aura */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full animate-blob" style={{ backgroundColor: 'rgba(244, 63, 94, 0.4)', filter: 'blur(100px)' }}></div>
      
      {/* Blue/Cyan Aura */}
      <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full animate-blob" style={{ backgroundColor: 'rgba(6, 182, 212, 0.4)', filter: 'blur(120px)', animationDelay: '2s' }}></div>
      
      {/* Yellow/Amber Aura */}
      <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full animate-blob" style={{ backgroundColor: 'rgba(245, 158, 11, 0.3)', filter: 'blur(150px)', animationDelay: '4s' }}></div>
    </div>
  );
};
