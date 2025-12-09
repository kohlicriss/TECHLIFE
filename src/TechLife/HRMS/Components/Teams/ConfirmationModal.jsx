import React, { useContext } from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { Context } from '../HrmsContext';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', isConfirming }) => {
    const { theme } = useContext(Context);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[250] p-2 sm:p-4">
            <div className={`rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-md shadow-xl flex flex-col ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                {/* Header */}
                <div className="p-4 sm:p-6 flex justify-between items-center border-b" style={{borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb'}}>
                    <h3 className="text-lg sm:text-xl font-bold flex items-center min-w-0 flex-1">
                        <FaExclamationTriangle className="text-yellow-400 mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="break-words">{title}</span>
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0 ml-2"
                    >
                        <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Message Content */}
                <div className="p-4 sm:p-6">
                    <p className={`text-sm sm:text-base break-words ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {message}
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className={`p-3 sm:p-4 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 border-t ${theme === 'dark' ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <button 
                        onClick={onClose} 
                        className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isConfirming}
                        className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center justify-center text-sm
                                    ${isConfirming ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {isConfirming ? (
                            <>
                                <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
