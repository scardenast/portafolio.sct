import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Duration of the animation
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
    handleClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen && !isClosing) {
    return null;
  }

  const backdropAnimation = isClosing || !isOpen ? 'opacity-0' : 'opacity-100';
  const modalAnimation = isClosing || !isOpen ? 'opacity-0 scale-95' : 'opacity-100 scale-100';

  return (
    <div
      className={`fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 transition-opacity duration-300 ${backdropAnimation}`}
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bg-[#0c0c0c] border border-gray-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300 transform ${modalAnimation}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Cerrar modal"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-300 mt-4">{message}</p>
        </div>
        <div className="bg-black/50 px-6 py-4 flex justify-end items-center gap-4 border-t border-gray-800">
          <button
            onClick={handleClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors flex items-center justify-center disabled:bg-red-800 disabled:cursor-not-allowed"
          >
            {isConfirming ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Eliminando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
