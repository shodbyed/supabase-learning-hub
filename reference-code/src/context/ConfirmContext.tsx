import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import './context.css';

export const ConfirmContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  confirmMe: (_: string) => Promise.resolve(false),
});

export const ConfirmDialogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMessage, setShowMessage] = useState('');
  const resolveRef = useRef<(value: boolean) => void>();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const closeDialog = useCallback((result: boolean) => {
    setIsOpen(false);
    setShowMessage('');
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = undefined;
    }
  }, []);

  const confirmMe = (message: string): Promise<boolean> => {
    setIsOpen(true);
    setShowMessage(message);
    return new Promise(resolve => {
      resolveRef.current = resolve;
    });
  };

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog(false);
      }
    },
    [closeDialog],
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node;

      if (dialogRef.current && !dialogRef.current.contains(target)) {
        closeDialog(false);
      }
    },
    [closeDialog],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      window.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside, handleEscape]);

  const onCancel = () => {
    closeDialog(false);
  };
  const onConfirm = () => {
    closeDialog(true);
  };

  return (
    <ConfirmContext.Provider value={{ confirmMe }}>
      <dialog open={isOpen} className='dialog-container'>
        <div className='dialog-content'>{showMessage}</div>
        <div className='dialog-buttons'>
          <button className='small-button' onClick={onCancel}>
            Cancel
          </button>
          <button className='small-button' onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </dialog>
      {children}
    </ConfirmContext.Provider>
  );
};
