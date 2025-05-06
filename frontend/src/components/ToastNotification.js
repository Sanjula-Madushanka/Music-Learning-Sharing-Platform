import { useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

const ToastNotification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {type === 'success' ? (
        <FiCheck className="mr-2" />
      ) : (
        <FiX className="mr-2" />
      )}
      <span>{message}</span>
    </div>
  );
};

export default ToastNotification;