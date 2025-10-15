import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ToastContainer, ToastData, ToastType } from './Toast';
import ConfirmDialog from './ConfirmDialog';

interface UIContextValue {
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  confirm: (message: string, options?: { title?: string; confirmText?: string; cancelText?: string }) => Promise<boolean>;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export const useUI = (): UIContextValue => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [confirmState, setConfirmState] = useState<{ open: boolean; message: string; title?: string; confirmText?: string; cancelText?: string; resolve?: (v: boolean) => void }>({ open: false, message: '' });

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', durationMs?: number) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, message, type, durationMs }]);
  }, []);

  const confirm = useCallback((message: string, options?: { title?: string; confirmText?: string; cancelText?: string }) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ open: true, message, title: options?.title, confirmText: options?.confirmText, cancelText: options?.cancelText, resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) confirmState.resolve(true);
    setConfirmState({ open: false, message: '' });
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) confirmState.resolve(false);
    setConfirmState({ open: false, message: '' });
  }, [confirmState]);

  const value = useMemo(() => ({ showToast, confirm }), [showToast, confirm]);

  return (
    <UIContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <ConfirmDialog
        isOpen={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </UIContext.Provider>
  );
};


