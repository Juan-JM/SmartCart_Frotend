import React, { createContext, useState, useContext } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };
  
  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };
  
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
    </ToastContext.Provider>
  );
};