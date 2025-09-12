import React, { useContext } from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { Context } from '../HrmsContext';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', isConfirming }) => {
    const { theme } = useContext(Context);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[250] p-4">
            <div className={`rounded-2xl w-full max-w-md shadow-xl flex flex-col ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                <div className="p-6 flex justify-between items-center border-b" style={{borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'}}>
                    <h3 className="text-xl font-bold flex items-center">
                        <FaExclamationTriangle className="text-yellow-400 mr-3" />
                        {title}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <FaTimes />
                    </button>
                </div>
                <div className="p-6">
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{message}</p>
                </div>
                <div className={`p-4 flex justify-end space-x-4 border-t ${theme === 'dark' ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <button 
                        onClick={onClose} 
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isConfirming}
                        className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center
                                    ${isConfirming ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {isConfirming ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <span>{confirmText}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;