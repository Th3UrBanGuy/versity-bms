
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../store';

export const ToastContainer = () => {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-[90vw] sm:max-w-sm">
      <AnimatePresence>
        {notifications.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
            className={`
              pointer-events-auto w-full p-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-xl
              ${note.type === 'success' ? 'bg-white/90 border-green-200 text-green-900' : ''}
              ${note.type === 'error' ? 'bg-white/90 border-red-200 text-red-900' : ''}
              ${note.type === 'info' ? 'bg-white/90 border-blue-200 text-blue-900' : ''}
            `}
          >
            <div className={`p-2 rounded-xl flex-shrink-0 ${
              note.type === 'success' ? 'bg-green-100 text-green-600' : 
              note.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {note.type === 'success' && <CheckCircle size={20} />}
              {note.type === 'error' && <AlertCircle size={20} />}
              {note.type === 'info' && <Info size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate sm:whitespace-normal">{note.message}</p>
            </div>
            <button 
              onClick={() => removeNotification(note.id)}
              className="p-1.5 hover:bg-black/5 rounded-full transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
