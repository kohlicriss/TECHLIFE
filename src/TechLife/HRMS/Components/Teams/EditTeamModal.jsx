import React, { useState, useEffect, useContext, useCallback } from 'react';
import { publicinfoApi } from '../../../../axiosInstance';
import { FaUsers, FaTimes, FaSearch, FaChevronDown, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { IoCheckmarkCircle, IoWarning } from 'react-icons/io5';
import { X } from 'lucide-react';
import { Context } from '../HrmsContext';
import { motion, AnimatePresence } from 'framer-motion';

// Deep comparison function for form change detection
const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (obj1 === null || obj2 === null) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;
    
    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
    
    if (Array.isArray(obj1)) {
        if (obj1.length !== obj2.length) return false;
        for (let i = 0; i < obj1.length; i++) {
            if (!deepEqual(obj1[i], obj2[i])) return false;
        }
        return true;
    }
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!deepEqual(obj1[key], obj2[key])) return false;
    }
    return true;
};

// Custom Notification Component
const CustomNotification = ({ isOpen, onClose, type, title, message, theme }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            if (type === 'success' || type === 'error') {
                const timer = setTimeout(() => {
                    handleClose();
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [isOpen, type]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
    };

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="w-6 h-6 text-green-500" />;
            case 'error':
                return <FaExclamationTriangle className="w-6 h-6 text-red-500" />;
            case 'info':
                return <FaInfoCircle className="w-6 h-6 text-blue-500" />;
            case 'warning':
                return <IoWarning className="w-6 h-6 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getTitleClass = () => {
        switch (type) {
            case 'success':
                return 'text-green-600 dark:text-green-400';
            case 'error':
                return 'text-red-600 dark:text-red-400';
            case 'info':
                return 'text-blue-600 dark:text-blue-400';
            case 'warning':
                return 'text-yellow-600 dark:text-yellow-400';
            default:
                return theme === 'dark' ? 'text-white' : 'text-gray-800';
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[300] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`p-6 rounded-3xl shadow-2xl w-full max-w-md m-4 border transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center mb-4">
                    {getIcon()}
                    <h3 className={`text-xl font-bold ml-3 ${getTitleClass()}`}>{title}</h3>
                    {type !== "success" && type !== "error" && (
                        <button onClick={handleClose} className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X size={20} />
                        </button>
                    )}
                </div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
                {(type === 'success' || type === 'error') && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleClose}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                type === 'success' 
                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                        >
                            OK
                        </button>
                    </div>
                )}
                {type === 'warning' && (
                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                handleClose();
                                // This will be handled by the parent component
                            }}
                            className="px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        >
                            Continue Anyway
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// No Changes Confirmation Modal
const NoChangesModal = ({ isOpen, onClose, onContinue, theme }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
    };

    const handleContinue = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
            onContinue();
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[250] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`p-6 rounded-3xl shadow-2xl w-full max-w-md m-4 border transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center mb-4">
                    <IoWarning className="w-6 h-6 text-yellow-500" />
                    <h3 className={`text-xl font-bold ml-3 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        No Changes Detected
                    </h3>
                </div>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    No changes have been made to the form. Please make some changes before submitting, or cancel to close the form.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                            theme === 'dark' 
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Make Changes
                    </button>
                    <button
                        onClick={handleContinue}
                        className="px-4 py-2 rounded-lg font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    >
                        Submit Anyway
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Employee Dropdown with Infinite Scroll ---
const EmployeeDropdown = ({ value, onChange, theme, error, disabled, isMulti = false, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    
    const PAGE_SIZE = 15;

    const loadEmployees = useCallback(async (page = 0, reset = false) => {
        if (loading || (!hasMore && !reset)) return;
        
        setLoading(true);
        try {
            const response = await publicinfoApi.get(`employee/${page}/${PAGE_SIZE}/employeeId/asc/employees`);
            const newEmployees = response.data.content || [];
            
            setEmployees(prev => reset ? newEmployees : [...prev, ...newEmployees]);
            setCurrentPage(page);
            setHasMore(newEmployees.length === PAGE_SIZE);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore]);

    useEffect(() => {
        if (isOpen) {
            loadEmployees(0, true);
        }
    }, [isOpen]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
            loadEmployees(currentPage + 1);
        }
    };

    const handleSelect = (employee) => {
        const selectedValue = { value: employee.employeeId, label: `${employee.displayName} (${employee.employeeId})` };
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            const isSelected = currentValues.some(item => item.value === selectedValue.value);
            if (isSelected) {
                onChange(currentValues.filter(item => item.value !== selectedValue.value));
            } else {
                onChange([...currentValues, selectedValue]);
            }
        } else {
            onChange(selectedValue);
            setIsOpen(false);
        }
    };
    
    const handleRemove = (selectedValue) => {
        if (isMulti) {
            onChange(value.filter(item => item.value !== selectedValue.value));
        }
    };

    const toggleDropdown = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    const currentSelectedIds = Array.isArray(value) ? value.map(v => v.value) : (value ? [value.value] : []);

    const filteredEmployees = employees.filter(emp => 
        (emp.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !currentSelectedIds.includes(emp.employeeId)
    );

    const renderSelectedValue = () => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            if (currentValues.length === 0) return <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{placeholder}</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {currentValues.map(item => (
                        <div key={item.value} className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                            <span>{item.label}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleRemove(item); }} className="ml-2 text-red-500 hover:text-red-700">
                                <FaTimes />
                            </button>
                        </div>
                    ))}
                </div>
            );
        } else {
            if (!value) return <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{placeholder}</span>;
            return <span>{value.label}</span>;
        }
    };

    return (
        <div className="relative">
            <div onClick={toggleDropdown} className={`w-full p-3 border-2 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-between ${error ? 'border-red-300' : (theme === 'dark' ? 'border-gray-600' : 'border-gray-200')} ${disabled ? 'opacity-50' : ''}`}>
                <div className="flex-1">{renderSelectedValue()}</div>
                <FaChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-lg z-50 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`} />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto" onScroll={handleScroll}>
                            {filteredEmployees.map(employee => (
                                <div key={employee.employeeId} onClick={() => handleSelect(employee)} className={`p-3 cursor-pointer hover:${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'}`}>
                                    <div className="font-medium">{employee.displayName}</div>
                                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{employee.employeeId}</div>
                                </div>
                            ))}
                            {loading && <div className="p-4 text-center text-sm">Loading...</div>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const EditTeamModal = ({ team, isOpen, onClose, onTeamUpdated, employees }) => {
    const { theme } = useContext(Context);

    // Form state
    const [teamName, setTeamName] = useState('');
    const [teamMembers, setTeamMembers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    
    // Original form data for change tracking
    const [originalFormData, setOriginalFormData] = useState({
        teamName: '',
        teamMembers: []
    });
    
    // Form change tracking
    const [isDirty, setIsDirty] = useState(false);
    const [showNoChangesModal, setShowNoChangesModal] = useState(false);
    
    // Notification state
    const [notification, setNotification] = useState({
        isOpen: false,
        type: '',
        title: '',
        message: ''
    });

    // Custom notification handlers
    const showNotification = (type, title, message) => {
        setNotification({
            isOpen: true,
            type,
            title,
            message
        });
    };

    const closeNotification = () => {
        setNotification({
            isOpen: false,
            type: '',
            title: '',
            message: ''
        });
    };

    // Initialize form data and original data
    useEffect(() => {
        if (team) {
            const teamNameValue = team.teamName || '';
            const currentMembers = team.employees?.map(emp => ({
                value: emp.employeeId,
                label: `${emp.displayName} (${emp.employeeId})`
            })) || [];
            
            setTeamName(teamNameValue);
            setTeamMembers(currentMembers);
            
            // Set original data for comparison
            const originalData = {
                teamName: teamNameValue,
                teamMembers: currentMembers
            };
            setOriginalFormData(originalData);
            setIsDirty(false);
            
            console.log('Original form data set:', originalData);
        }
    }, [team]);

    // Check for form changes
    useEffect(() => {
        const currentFormData = {
            teamName,
            teamMembers
        };
        
        const hasChanges = !deepEqual(currentFormData, originalFormData);
        setIsDirty(hasChanges);
        
        console.log('Form change detection:', {
            current: currentFormData,
            original: originalFormData,
            hasChanges,
            isDirty: hasChanges
        });
    }, [teamName, teamMembers, originalFormData]);
    
    if (!isOpen) return null;

    const validateForm = () => {
        const errors = {};
        if (!teamName.trim()) errors.teamName = "Team Name is required.";
        if (teamMembers.length === 0) errors.teamMembers = "At least one Team Member is required.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const proceedWithSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setFormErrors({});
        
        const projectIdToSend = (team && team.projects && team.projects.length > 0) 
                                  ? team.projects[0] 
                                  : "PRO1001"; 

        if (!projectIdToSend) {
            setFormErrors({ general: 'Error: Project ID is missing. Cannot update the team.' });
            setIsSubmitting(false);
            return;
        }

        const updatedTeamData = {
            teamId: team.teamId,
            teamName,
            teamDescription: team.teamDescription || "",
            employeeIds: teamMembers.map(member => member.value),
            projectId: projectIdToSend
        };

        console.log("Update Team Payload:", updatedTeamData);

        try {
            await publicinfoApi.put(`employee/team/employee/${team.teamId}`, updatedTeamData);
            onTeamUpdated();
            onClose();
            showNotification('success', 'Team Updated Successfully!', 'The team details have been updated successfully.');
        } catch (err) {
            console.error("Error updating team:", err);
            setFormErrors({ general: err.response?.data?.message || 'Failed to update team. Please check the data and try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTeam = async (e) => {
        e.preventDefault();
        
        // Check if form has changes
        if (!isDirty) {
            console.log('No changes detected, showing modal');
            setShowNoChangesModal(true);
            return;
        }
        
        // Proceed with submit if changes are detected
        await proceedWithSubmit();
    };

    const handleNoChangesModalContinue = async () => {
        console.log('User chose to continue anyway');
        await proceedWithSubmit();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-2 sm:p-4">
                <div className={`rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    {/* Header */}
                    <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-500 to-indigo-700 text-white relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl flex-shrink-0">
                                    <FaUsers className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words">Edit Team</h2>
                                    <p className="text-white/90 text-xs sm:text-sm break-words">Update the details for {team.teamName}.</p>
                                    {/* Form status indicator */}
                                    <div className="mt-1 flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${isDirty ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                                        <span className="text-white/80 text-xs">
                                            {isDirty ? 'Modified' : 'No changes'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 sm:p-3 hover:bg-white/20 rounded-full transition-all group flex-shrink-0">
                                <FaTimes className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="overflow-y-auto flex-grow">
                        <form className="p-4 sm:p-6 md:p-8" onSubmit={handleUpdateTeam}>
                            <div className="space-y-4 sm:space-y-6">
                                {/* Team Name Field */}
                                <div>
                                    <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                        Team Name <span className="text-red-500">*</span>
                                        {!deepEqual(teamName, originalFormData.teamName) && (
                                            <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(Modified)</span>
                                        )}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={teamName} 
                                        onChange={(e) => setTeamName(e.target.value)}
                                        className={`w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                                            ${formErrors.teamName ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' :
                                            !deepEqual(teamName, originalFormData.teamName) ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' :
                                            theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                        placeholder="e.g., Development Team"
                                    />
                                    {formErrors.teamName && (
                                        <div className="mt-2 flex items-center space-x-2 text-red-600">
                                            <IoWarning className="w-4 h-4 flex-shrink-0" />
                                            <p className="text-xs sm:text-sm font-medium">{formErrors.teamName}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Team Members Field */}
                                <div>
                                    <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                        Team Members <span className="text-red-500">*</span>
                                        {!deepEqual(teamMembers, originalFormData.teamMembers) && (
                                            <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(Modified)</span>
                                        )}
                                    </label>
                                    <EmployeeDropdown
                                        value={teamMembers}
                                        onChange={setTeamMembers}
                                        theme={theme}
                                        error={formErrors.teamMembers}
                                        isMulti={true}
                                        placeholder="Select team members..."
                                    />
                                    {formErrors.teamMembers && (
                                        <div className="mt-2 flex items-center space-x-2 text-red-600">
                                            <IoWarning className="w-4 h-4 flex-shrink-0" />
                                            <p className="text-xs sm:text-sm font-medium">{formErrors.teamMembers}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* General Error Message */}
                            {formErrors.general && (
                                <div className={`mt-4 sm:mt-6 p-3 sm:p-4 border-l-4 border-red-400 rounded-r-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                                    <div className="flex items-center">
                                        <IoWarning className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-3 flex-shrink-0" />
                                        <p className={`font-medium text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>{formErrors.general}</p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className={`w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl font-semibold transition-all text-sm ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleUpdateTeam} 
                            disabled={isSubmitting} 
                            className={`w-full sm:w-auto px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-lg sm:rounded-xl
                                         hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2 text-sm
                                         ${isSubmitting ? 'cursor-not-allowed opacity-75' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 sm:h-5 sm:h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Update Team</span>
                                    {isDirty && <span className="ml-1 text-xs bg-white/20 px-2 py-1 rounded-full">*</span>}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* No Changes Modal */}
            <NoChangesModal
                isOpen={showNoChangesModal}
                onClose={() => setShowNoChangesModal(false)}
                onContinue={handleNoChangesModalContinue}
                theme={theme}
            />

            {/* Custom Notification */}
            <CustomNotification
                isOpen={notification.isOpen}
                onClose={closeNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                theme={theme}
            />
        </>
    );
};

export default EditTeamModal;
