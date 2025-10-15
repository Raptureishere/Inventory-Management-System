import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
  durationMs?: number;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: number) => void;
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-sky-600',
  warning: 'bg-amber-600',
};

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timeout = setTimeout(() => onClose(toast.id), toast.durationMs ?? 3000);
    return () => clearTimeout(timeout);
  }, [toast, onClose]);

  return (
    <div className={`text-white px-4 py-3 rounded-lg shadow-lg flex items-start space-x-3 ${typeStyles[toast.type]}`}>
      <div className="flex-1 text-sm">
        {toast.message}
      </div>
      <button onClick={() => onClose(toast.id)} className="text-white/90 hover:text-white">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
};


