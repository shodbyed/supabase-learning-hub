import React from 'react';
import './modal.css';

type ModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
};

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {onClose && (
          <button className="modal-close-button" onClick={onClose}>
            X
          </button>
        )}
        {children}
      </div>
    </div>
  );
};
