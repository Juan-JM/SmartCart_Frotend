import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div 
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-md shadow-lg z-50 animate-fade-in-up`}
    >
      {message}
    </div>
  );
};

export default Toast;