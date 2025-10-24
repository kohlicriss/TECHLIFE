import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { publicinfoApi } from '../../../../axiosInstance';
import { FaUsers, FaTimes, FaSearch, FaChevronDown, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { IoCheckmarkCircle, IoWarning } from 'react-icons/io5';
import { X } from 'lucide-react';
import { Context } from '../HrmsContext';
import { motion, AnimatePresence } from 'framer-motion';

// Deep comparison function
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

// Custom Notification Component (unchanged)
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

    if (!isOpen) return null;

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

// No Changes Confirmation Modal (unchanged)
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

// ----------------------------------------------------------------------------------------------------------------------
// NEW COMPONENT: Paginated Employee List for Edit Modal
// This component manages its own infinite scrolling and fetching logic.
// ----------------------------------------------------------------------------------------------------------------------
const EmployeeListPaginatedForEdit = ({ employeeRoles, onSelectionChange, onRoleChange, theme, error }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const scrollAreaRef = useRef(null);
    const isFetchingRef = useRef(false);
    const PAGE_SIZE = 6;

    const loadEmployees = useCallback(async (page = 0, append = false) => {
        // Prevent fetching if already fetching or if no more data is expected on subsequent pages
        if (isFetchingRef.current || (page > 0 && !hasMoreData)) return;

        isFetchingRef.current = true;
        setLoading(true);

        if (!append) {
            setEmployees([]);
            setHasMoreData(true);
            setAllDataLoaded(false);
        }

        try {
            console.log(`[API CALL - EmployeeListPaginatedForEdit] Fetching employees: Page ${page}, Size ${PAGE_SIZE}`);
            const response = await publicinfoApi.get(`employee/${page}/${PAGE_SIZE}/employeeId/asc/employees`);
            const fetchedEmployees = response.data?.content || [];
            const newEmployees = Array.isArray(fetchedEmployees) ? fetchedEmployees : [];

            setEmployees(prev => append ? [...prev, ...newEmployees] : newEmployees);
            setCurrentPage(page);

            if (response.data?.last === true || newEmployees.length < PAGE_SIZE) {
                setHasMoreData(false);
                setAllDataLoaded(true);
            } else {
                setHasMoreData(true);
            }
        } catch (fetchError) {
            console.error('Error fetching employees with pagination:', fetchError);
            if (!append) setEmployees([]);
            setHasMoreData(false);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [hasMoreData]);

    const handleScroll = useCallback((e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;

        // Check if user scrolled near bottom (within 50px)
        if (scrollHeight > clientHeight && scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasMoreData && !loading && !isFetchingRef.current) {
                loadEmployees(currentPage + 1, true);
            }
        }
    }, [currentPage, hasMoreData, loading, loadEmployees]);

    // Initial load when component mounts
    useEffect(() => {
        if (employees.length === 0 && !loading) {
            loadEmployees(0, false);
        }
    }, [loadEmployees]);


    // Merge existing team roles with fetched employee data
    const employeesWithSelection = employees.map(emp => ({
        ...emp,
        isSelected: employeeRoles.hasOwnProperty(emp.employeeId),
        role: employeeRoles[emp.employeeId] || ''
    }));

    const renderLoading = (isInitial) => (
        <div className="text-center py-3 text-sm text-gray-500">
            {isInitial ? 'Loading employee directory...' : 'Loading more employees...'}
        </div>
    );

    return (
        <div 
            className={`max-h-80 overflow-y-auto p-2 border-2 rounded-lg sm:rounded-xl 
            ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
            ref={scrollAreaRef}
            onScroll={handleScroll}
        >
            {(loading && employees.length === 0) ? renderLoading(true) : employees.length === 0 && !loading ? (
                <div className="text-center py-3 text-sm text-gray-500">No employees found.</div>
            ) : (
                employeesWithSelection.map(emp => {
                    return (
                        <div key={emp.employeeId} className="py-2 border-b border-gray-200 dark:border-gray-600 last:border-0">
                            <label className="flex items-start cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={emp.isSelected}
                                    onChange={() => onSelectionChange(emp.employeeId)}
                                    className="mt-1 mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {emp.displayName || (emp.firstName + ' ' + emp.lastName)}
                                    </div>
                                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {emp.employeeId}
                                    </div>
                                    {emp.isSelected && (
                                        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={emp.role || ''}
                                                onChange={(e) => onRoleChange(emp.employeeId, e.target.value)}
                                                placeholder="Enter role (e.g., Backend)"
                                                className={`w-full px-3 py-1.5 text-sm border rounded-lg
                                                    ${theme === 'dark' 
                                                        ? 'bg-gray-600 border-gray-500 text-white' 
                                                        : 'bg-white border-gray-300 text-gray-800'}
                                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                                            />
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    );
                })
            )}

            {/* Pagination Loading Indicator */}
            {loading && employees.length > 0 && renderLoading(false)}
            
            {/* End of list indicator */}
            {allDataLoaded && employees.length > 0 && (
                <div className="text-center py-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-600 mt-2">
                    — All employees loaded —
                </div>
            )}
            
            {/* Show an error if fetch failed after initial load */}
             {error && <p className="text-red-500 text-xs mt-1 p-2">{error}</p>}
        </div>
    );
};


// Main Modal Component
const EditTeamModal = ({ team, isOpen, onClose, onTeamUpdated }) => {
    const { theme } = useContext(Context);
    // Removed useEmployeeList - data fetching is now handled by EmployeeListPaginatedForEdit

    const [teamName, setTeamName] = useState('');
    const [employeeRoles, setEmployeeRoles] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [originalFormData, setOriginalFormData] = useState({
        teamName: '',
        employeeRoles: {}
    });
    const [isDirty, setIsDirty] = useState(false);
    const [showNoChangesModal, setShowNoChangesModal] = useState(false);
    const [notification, setNotification] = useState({
        isOpen: false,
        type: '',
        title: '',
        message: ''
    });

    const showNotification = (type, title, message) => {
        setNotification({ isOpen: true, type, title, message });
    };

    const closeNotification = () => {
        setNotification({ isOpen: false, type: '', title: '', message: '' });
    };

    useEffect(() => {
        if (team) {
            const teamNameValue = team.teamName || '';
            
            // Map initial team employees to the {employeeId: role} format
            const initialRoles = team.employees?.reduce((acc, emp) => {
                acc[emp.employeeId] = emp.role || '';
                return acc;
            }, {}) || {};

            setTeamName(teamNameValue);
            setEmployeeRoles(initialRoles);

            setOriginalFormData({
                teamName: teamNameValue,
                employeeRoles: { ...initialRoles }
            });
            setIsDirty(false);
        }
    }, [team]);

    useEffect(() => {
        const current = { teamName, employeeRoles };
        setIsDirty(!deepEqual(current, originalFormData));
    }, [teamName, employeeRoles, originalFormData]);

    if (!isOpen) return null;

    const validateForm = () => {
        const errors = {};
        if (!teamName.trim()) errors.teamName = "Team Name is required.";

        const selectedIds = Object.keys(employeeRoles);
        if (selectedIds.length === 0) {
            errors.teamMembers = "At least one Team Member is required.";
        } else {
            const hasEmptyRole = selectedIds.some(id => !employeeRoles[id]?.trim());
            if (hasEmptyRole) {
                errors.teamMembers = "All selected members must have a role.";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const toggleEmployeeSelection = (employeeId) => {
        setEmployeeRoles(prev => {
            const newRoles = { ...prev };
            if (newRoles.hasOwnProperty(employeeId)) {
                delete newRoles[employeeId];
            } else {
                // When selecting a new member, initialize their role.
                newRoles[employeeId] = team.employees?.find(e => e.employeeId === employeeId)?.role || '';
            }
            return newRoles;
        });
    };

    const handleRoleChange = (employeeId, role) => {
        setEmployeeRoles(prev => ({
            ...prev,
            [employeeId]: role
        }));
    };

    const proceedWithSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setFormErrors({});

        // Assuming projectId is either in the first project object or defaults to a mock ID
        const projectIdToSend = (team?.projects?.[0]?.projectId) || "PRO1001";
        if (!projectIdToSend) {
            setFormErrors({ general: 'Error: Project ID is missing.' });
            setIsSubmitting(false);
            return;
        }

        const payload = {
            teamId: team.teamId,
            teamName: teamName.trim(),
            teamDescription: team.teamDescription || "",
            projectId: projectIdToSend,
            employeeRoles
        };
        
        console.log("Submitting updated team payload:", payload);

        try {
            await publicinfoApi.put(`employee/team/employee/${team.teamId}`, payload);
            onTeamUpdated();
            onClose();
            showNotification('success', 'Team Updated Successfully!', 'The team details have been updated.');
        } catch (err) {
            console.error("Error updating team:", err.response?.data || err.message);
            setFormErrors({ general: err.response?.data?.message || 'Failed to update team. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTeam = (e) => {
        e.preventDefault();
        if (!isDirty) {
            setShowNoChangesModal(true);
            return;
        }
        proceedWithSubmit();
    };

    const handleNoChangesModalContinue = () => {
        setShowNoChangesModal(false);
        proceedWithSubmit();
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
                                    <p className="text-white/90 text-xs sm:text-sm break-words">Update the details for **{team.teamName}**.</p>
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

                                {/* Team Members with Paginated Scroll List */}
                                <div>
                                    <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                        Team Members <span className="text-red-500">*</span>
                                        {!deepEqual(employeeRoles, originalFormData.employeeRoles) && (
                                            <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(Modified)</span>
                                        )}
                                    </label>
                                    <EmployeeListPaginatedForEdit
                                        employeeRoles={employeeRoles}
                                        onSelectionChange={toggleEmployeeSelection}
                                        onRoleChange={handleRoleChange}
                                        theme={theme}
                                        error={formErrors.teamMembers}
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
                                    <div className="h-4 w-4 sm:h-5 sm:w-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
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

            <NoChangesModal
                isOpen={showNoChangesModal}
                onClose={() => setShowNoChangesModal(false)}
                onContinue={handleNoChangesModalContinue}
                theme={theme}
            />

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
