import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { publicinfoApi, authApi } from '../../../../axiosInstance';
import { FaUsers, FaPlus, FaUserShield, FaTimes, FaChevronDown, FaChevronUp, FaTrash, FaEye, FaSearch, FaChevronLeft, FaChevronRight, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'; 
import { IoCheckmarkCircle, IoWarning, IoAddCircleOutline, IoKeyOutline } from 'react-icons/io5';
import { X } from 'lucide-react';
import { Context } from '../HrmsContext';
import ConfirmationModal from './ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';

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
            default:
                return theme === 'dark' ? 'text-white' : 'text-gray-800';
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[200] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
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
            </div>
        </div>
    );
};

// --- Reusable Input Field Component (Copied Styling) ---
const InputField = ({
    name,
    label,
    type = 'text',
    required = false,
    hint,
    placeholder,
    value,
    onChange,
    onBlur,
    isError,
    options = [],
    theme
}) => {
    const baseInputClass = `w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg transition-all duration-300 text-sm
        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
        isError
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
            : theme === 'dark'
            ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`;

    return (
        <div className="group relative" key={name}>
            <label className={`block text-xs sm:text-sm font-semibold mb-2 flex items-center ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
                {label}
                {required && <span className="text-red-500 ml-1 text-sm">*</span>}
            </label>

            {hint && (
                <p className={`text-xs mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                    {hint}
                </p>
            )}

            {type === 'select' ? (
                <div className="relative">
                    <select
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={`${baseInputClass} appearance-none`}
                        required={required}
                    >
                        <option value="">Choose {label}</option>
                        {options.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <FaChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                        }`} />
                    </div>
                </div>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={baseInputClass}
                    placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
                    required={required}
                />
            )}

            {isError && (
                <div className="mt-1 sm:mt-2 flex items-center space-x-2 text-red-600">
                    <IoWarning className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <p className="text-xs sm:text-sm font-medium">{isError}</p>
                </div>
            )}
        </div>
    );
};
// --- End Reusable Input Field Component ---

// Utility Hook for Outside Click
const useOutsideClick = (handler, ignoreRefs = []) => {
    const ref = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isIgnored = ignoreRefs.some(
                (r) => r.current && r.current.contains(event.target)
            );
            if (ref.current && !ref.current.contains(event.target) && !isIgnored) {
                handler(event);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handler, ignoreRefs]);
    return ref;
};

// Project Dropdown with Infinite Scroll
const ProjectDropdown = ({ value, onChange, theme, error, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    
    // Pagination States
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const PAGE_SIZE = 10; 
    
    const isFetchingRef = useRef(false);
    const scrollAreaRef = useRef(null);
    const dropdownRef = useOutsideClick(() => setIsOpen(false), [scrollAreaRef]);

    // Load projects for the current page
    const loadProjects = useCallback(async (page = 0, append = false) => {
        if (isFetchingRef.current || (page > 0 && !hasMoreData && !searchTerm)) return; // Prevent unnecessary re-fetches

        isFetchingRef.current = true;
        setLoading(true);
        
        try {
            console.log(`[API CALL - ProjectDropdown] Fetching projects: Page ${page}, Size ${PAGE_SIZE}`);
            // Note: SearchTerm functionality would require adapting the backend endpoint to support search. 
            // For now, this loads pages sequentially.
            const response = await publicinfoApi.get(`employee/${page}/${PAGE_SIZE}/projectId/asc/projects`);
            console.log(`[API SUCCESS - ProjectDropdown] Projects fetched for page ${page}:`, response.data);
            
            const fetchedProjects = response.data?.content || [];
            const newProjects = Array.isArray(fetchedProjects) ? fetchedProjects : [];
            
            setProjects(prev => append ? [...prev, ...newProjects] : newProjects);
            
            setCurrentPage(page);
            setTotalPages(response.data?.totalPages || 1);
            
            if (response.data?.last === true || newProjects.length < PAGE_SIZE) {
                setHasMoreData(false);
                setAllDataLoaded(true);
            } else {
                setHasMoreData(true);
            }
        } catch (error) {
            console.error('[API ERROR - ProjectDropdown] Error fetching projects:', error.response?.data || error.message);
            if (!append) {
                setProjects([]);
                setTotalPages(1);
            }
            setHasMoreData(false);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [hasMoreData, searchTerm]); // Added searchTerm dependency for future API adaptation

    // Handle scroll event for infinite loading
    const handleScroll = useCallback((e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        
        // Check if user scrolled near bottom (within 50px)
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasMoreData && !loading && !isFetchingRef.current && !searchTerm) {
                loadProjects(currentPage + 1, true);
            }
        }
    }, [currentPage, hasMoreData, loading, loadProjects, searchTerm]);

    // FIX: Only load initially if opened and list is empty
    useEffect(() => {
        if (isOpen && projects.length === 0 && !loading && !searchTerm) {
            loadProjects(0, false); 
        }
    }, [isOpen, loadProjects, projects.length, loading, searchTerm]);
    
    // FIX: Clear state when closing or starting a new search
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setProjects([]);
            setAllDataLoaded(false);
        }
    }, [isOpen]);

    const handleSelect = (project) => {
        onChange({ value: project.projectId, label: `${project.projectId}(${project.title})` });
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    const safeProjects = Array.isArray(projects) ? projects : [];

    const filteredProjects = safeProjects.filter(proj => 
        proj.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.projectId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <div 
                onClick={toggleDropdown} 
                // Adjusted styling to match InputField
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-between text-sm 
                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
                    error ? 'border-red-300 bg-red-50' : (theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500' : 'border-gray-200 bg-white hover:border-gray-300')
                } ${disabled ? 'opacity-50' : ''}`}
            >
                <span className={!value ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : ''}>
                    {value ? value.label : 'Select project...'}
                </span>
                <FaChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>} 
            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        className={`absolute top-full left-0 right-0 mt-2 border rounded-lg shadow-lg z-50 ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        }`}
                    >
                        <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search projects..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${
                                        theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`} 
                                />
                            </div>
                        </div>
                        <div 
                            className="max-h-60 overflow-y-auto" 
                            ref={scrollAreaRef}
                            onScroll={handleScroll}
                        >
                            {/* Display projects filtered by the local list */}
                            {filteredProjects.length > 0 ? (
                                filteredProjects.map(project => {
                                    const isSelected = value?.value === project.projectId;
                                    return (
                                        <div 
                                            key={project.projectId} 
                                            onClick={() => handleSelect(project)} 
                                            className={`p-3 cursor-pointer flex items-center justify-between ${
                                                isSelected ? 'bg-blue-50 dark:bg-blue-900/50' : `hover:${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'}`
                                            }`}
                                        >
                                            <div className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                                                <div className="font-medium text-sm">{project.projectId}({project.title})</div>
                                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Client: {project.client} • Status: {project.projectStatus}
                                                </div>
                                            </div>
                                            {isSelected && <IoCheckmarkCircle className="w-5 h-5 text-blue-500" />}
                                        </div>
                                    );
                                })
                            ) : searchTerm ? (
                                <div className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    No projects matching "{searchTerm}"
                                </div>
                            ) : loading && projects.length === 0 ? (
                                <div className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Loading projects...
                                </div>
                            ) : (
                                <div className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    No projects found.
                                </div>
                            )}
                            
                            {/* Loading indicator for infinite scroll */}
                            {loading && projects.length > 0 && (
                                <div className={`p-2 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Loading more projects...
                                </div>
                            )}
                        </div>
                        
                        {allDataLoaded && projects.length > 0 && (
                            <div className={`p-2 border-t text-center text-xs font-medium ${theme === 'dark' ? 'text-gray-500 border-gray-600' : 'text-gray-400 border-gray-200'}`}>
                                🎯 All projects loaded
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Employee Dropdown with Infinite Scroll
const EmployeeDropdown = ({ value, onChange, theme, error, disabled, isMulti = false, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    
    // Pagination States
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const PAGE_SIZE = 15;
    
    const isFetchingRef = useRef(false);
    const scrollAreaRef = useRef(null);
    const dropdownRef = useOutsideClick(() => setIsOpen(false), [scrollAreaRef]);
    
    // Load employees for the current page
    const loadEmployees = useCallback(async (page = 0, append = false) => {
        if (isFetchingRef.current || (page > 0 && !hasMoreData && !searchTerm)) return; // Prevent unnecessary re-fetches

        isFetchingRef.current = true;
        setLoading(true);
        
        try {
            console.log(`[API CALL - EmployeeDropdown] Fetching employees: Page ${page}, Size ${PAGE_SIZE}`);
             // Note: SearchTerm functionality would require adapting the backend endpoint to support search. 
            // For now, this loads pages sequentially.
            const response = await publicinfoApi.get(`employee/${page}/${PAGE_SIZE}/employeeId/asc/employees`);
            console.log(`[API SUCCESS - EmployeeDropdown] Employees fetched for page ${page}:`, response.data);
            
            const responseData = response.data || {};
            const fetchedEmployees = responseData.content || []; 
            const newEmployees = Array.isArray(fetchedEmployees) ? fetchedEmployees : [];
            
            setEmployees(prev => append ? [...prev, ...newEmployees] : newEmployees);
            
            setCurrentPage(page);
            setTotalPages(responseData.totalPages || 1);
            
            // Check if we've reached the end using responseData.last
            if (responseData.last === true || newEmployees.length < PAGE_SIZE) {
                setHasMoreData(false);
                setAllDataLoaded(true);
            } else {
                setHasMoreData(true);
            }
        } catch (error) {
            console.error('[API ERROR - EmployeeDropdown] Error fetching employees:', error.response?.data || error.message);
            if (!append) {
                setEmployees([]);
                setTotalPages(1);
            }
            setHasMoreData(false);
        } finally {
            setLoading(false);
            isFetchingRef.current = false; 
        }
    }, [hasMoreData, searchTerm]); // Added searchTerm dependency for future API adaptation

    // Handle scroll event for infinite loading
    const handleScroll = useCallback((e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        
        // Check if user scrolled near bottom (within 50px)
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (hasMoreData && !loading && !isFetchingRef.current && !searchTerm) {
                loadEmployees(currentPage + 1, true);
            }
        }
    }, [currentPage, hasMoreData, loading, loadEmployees, searchTerm]);

    // FIX: Only load initially if opened and list is empty
    useEffect(() => {
        if (isOpen && employees.length === 0 && !loading && !searchTerm) {
            loadEmployees(0, false);
        }
    }, [isOpen, loadEmployees, employees.length, loading, searchTerm]);
    
     // FIX: Clear state when closing or starting a new search
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setEmployees([]);
            setAllDataLoaded(false);
        }
    }, [isOpen]);

    const handleSelect = (employee) => {
        const employeeLabel = `${employee.displayName || employee.firstName + ' ' + employee.lastName} (${employee.employeeId})`;
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            const isSelected = currentValues.some(item => item.value === employee.employeeId);
            if (isSelected) {
                onChange(currentValues.filter(item => item.value !== employee.employeeId));
            } else {
                onChange([...currentValues, { value: employee.employeeId, label: employeeLabel }]);
            }
        } else {
            onChange({ value: employee.employeeId, label: employeeLabel });
            setIsOpen(false);
        }
    };

    const toggleDropdown = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    const safeEmployees = Array.isArray(employees) ? employees : [];
    
    const filteredEmployees = safeEmployees.filter(emp => {
        const displayName = emp.displayName || (emp.firstName + ' ' + emp.lastName);
        return (
            displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const renderSelectedValue = () => {
        const defaultPlaceholder = placeholder || (isMulti ? 'Select team members...' : 'Select a team lead...');
        
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            if (currentValues.length === 0) return <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{defaultPlaceholder}</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {currentValues.map(item => (
                        <div key={item.value} className={`text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                            {item.label}
                        </div>
                    ))}
                </div>
            );
        } else {
            if (!value) return <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{defaultPlaceholder}</span>;
            return <span>{value.label}</span>;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={toggleDropdown} 
                // Adjusted styling to match InputField
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-between text-sm 
                    focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
                    error ? 'border-red-300 bg-red-50' : (theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500' : 'border-gray-200 bg-white hover:border-gray-300')
                } ${disabled ? 'opacity-50' : ''}`}
            >
                <div className="flex-1">{renderSelectedValue()}</div>
                <FaChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
             {error && <p className="text-red-500 text-xs mt-1">{error}</p>} 
            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`absolute top-full left-0 right-0 mt-2 border rounded-lg shadow-lg z-50 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`} />
                            </div>
                        </div>
                        <div 
                            className="max-h-60 overflow-y-auto" 
                            ref={scrollAreaRef}
                            onScroll={handleScroll}
                        >
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map(employee => {
                                    const isSelected = isMulti ? (Array.isArray(value) && value.some(item => item.value === employee.employeeId)) : value?.value === employee.employeeId;
                                    const displayName = employee.displayName || (employee.firstName + ' ' + employee.lastName);
                                    return (
                                        <div key={employee.employeeId} onClick={() => handleSelect(employee)} className={`p-3 cursor-pointer flex items-center justify-between ${isSelected ? 'bg-blue-50 dark:bg-blue-900/50' : `hover:${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'}`}`}>
                                            <div className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                                                <div className="font-medium text-sm">{displayName}</div>
                                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{employee.employeeId}</div>
                                            </div>
                                            {isSelected && <IoCheckmarkCircle className="w-5 h-5 text-blue-500" />}
                                        </div>
                                    );
                                })
                            ) : searchTerm ? (
                                <div className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    No employees matching "{searchTerm}"
                                </div>
                            ) : loading && employees.length === 0 ? (
                                <div className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Loading employees...
                                </div>
                            ) : (
                                <div className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    No employees found.
                                </div>
                            )}
                            
                            {loading && employees.length > 0 && (
                                <div className={`p-2 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Loading more employees...
                                </div>
                            )}
                        </div>
                        
                        {allDataLoaded && employees.length > 0 && (
                            <div className={`p-2 border-t text-center text-xs font-medium ${theme === 'dark' ? 'text-gray-500 border-gray-600' : 'text-gray-400 border-gray-200'}`}>
                                👥 All employees loaded
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Loading and Error Components
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="text-center p-6 sm:p-8 bg-red-100 text-red-700 rounded-lg">
        <h3 className="font-bold text-base sm:text-lg">Oops! Something went wrong.</h3>
        <p className="text-sm sm:text-base">{message}</p>
    </div>
);

// Main AllTeams Component
const AllTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [expandedTeams, setExpandedTeams] = useState(new Set()); 
    const [searchTerm, setSearchTerm] = useState('');
    const [matchedArray, setMatchedArray] = useState(null);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false); 
    const [displayMode, setDisplayMode] = useState('MY_TEAMS'); 
    const [adminallteams, setAdminAllTeams] = useState([]);

    // Form state
    const [teamName, setTeamName] = useState('');
    const [teamLead, setTeamLead] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Notification state
    const [notification, setNotification] = useState({
        isOpen: false,
        type: '',
        title: '',
        message: ''
    });

    const { userData, theme } = useContext(Context);
    const userRoles = userData?.roles || [];
    const canModifyTeam = userRoles.includes('ADMIN') || userRoles.includes('HR') || userRoles.includes('MANAGER');
    const canCreateTeam = userRoles.includes('ADMIN') || userRoles.includes('HR');

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const fromContextMenu = searchParams.get('fromContextMenu') === 'true';
    const targetEmployeeId = searchParams.get('targetEmployeeId');

    const employeeIdToFetch = fromContextMenu && targetEmployeeId ? targetEmployeeId : userData?.employeeId;

    const loggedinuserRole = userData?.roles[0] 
        ? `ROLE_${userData.roles[0]}` 
        : null;

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

    const toggleTeamExpansion = (teamId) => {
        const newExpandedTeams = new Set(expandedTeams);
        if (newExpandedTeams.has(teamId)) {
            newExpandedTeams.delete(teamId);
        } else {
            newExpandedTeams.add(teamId);
        }
        setExpandedTeams(newExpandedTeams);
    };

    const isTeamExpanded = (teamId) => expandedTeams.has(teamId);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            
            if (!employeeIdToFetch) {
                setError("Employee ID not found. Please login again.");
                return;
            }

            console.log(`[API CALL - fetchTeams] Fetching teams for employee: ${employeeIdToFetch}`);
            const response = await publicinfoApi.get(`employee/team/${employeeIdToFetch}`);
            console.log('[API SUCCESS - fetchTeams] Teams fetched:', response.data);
            
            const teamsArray = Array.isArray(response.data) ? response.data : [response.data];
            setTeams(teamsArray || []);
            setError(null);
        } catch (err) {
            console.error('[API ERROR - fetchTeams] Error fetching teams:', err.response?.data || err.message);
            setError(`Could not fetch teams data for employee ${employeeIdToFetch}.`);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminAllTeams = async () => {
        if (!matchedArray || !matchedArray.includes("ADMIN_FETCHING_ALLTEAMS")) {
            setAdminAllTeams([]);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setAdminAllTeams([]);
        
        try {
            console.log("[API CALL - fetchAdminAllTeams] Fetching all teams for admin view.");
            let response = await publicinfoApi.get(
                "employee/0/19/teamId/asc/teams"
            );
            
            const teamsData = response.data.content;
            setAdminAllTeams(teamsData);
            console.log("Admin Fetched Teams (ALL_TEAMS view) ✅", teamsData);
            setError(null);
        } catch (error) {
            console.error("[API ERROR - fetchAdminAllTeams] Error From Admin Fetching All Teams ❌", error.response?.data || error.message);
            setAdminAllTeams([]); 
            setError('Failed to load all teams directory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(loggedinuserRole) {
            let fetchForPermissionArray = async () => {
                try {
                    console.log(`[API CALL - fetchForPermissionArray] Fetching role access for role: ${loggedinuserRole}`);
                    let response = await authApi.get(`role-access/${loggedinuserRole}`);
                    console.log('[API SUCCESS - fetchForPermissionArray] Role permissions fetched:', response.data);
                    setMatchedArray(response?.data?.permissions);
                } catch (error) {
                    console.error("[API ERROR - fetchForPermissionArray] Error from Fetching Error matching Objects:", error.response?.data || error.message);
                }
            }
            fetchForPermissionArray();
        }
    },[loggedinuserRole]);

    useEffect(() => {
        if (displayMode === 'MY_TEAMS') {
            fetchTeams();
        } else if (displayMode === 'ALL_TEAMS') {
            fetchAdminAllTeams();
        }
    }, [displayMode, canCreateTeam, employeeIdToFetch, matchedArray]);
    
    const currentDataSource = displayMode === 'MY_TEAMS' ? teams : adminallteams;

    const filteredCurrentTeams = (Array.isArray(currentDataSource) ? currentDataSource : []).filter(team =>
        team.teamName && team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const validateForm = () => {
        const errors = {};
        if (!teamName.trim()) errors.teamName = "Team Name is required.";
        if (!teamLead) errors.teamLead = "Team Lead is required.";
        if (teamMembers.length === 0) errors.teamMembers = "At least one Team Member is required.";
        if (!selectedProject) errors.selectedProject = "Project selection is required.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setFormErrors({});

        const newTeamData = {
            teamName,
            teamDescription: "Default Description",
            employeeIds: [teamLead?.value, ...teamMembers.map(member => member.value)].filter(Boolean),
            projectId: selectedProject?.value
        };

        try {
            console.log('[API CALL - handleCreateTeam] Creating new team with data:', newTeamData);
            await publicinfoApi.post('employee/team', newTeamData);
            console.log('[API SUCCESS - handleCreateTeam] Team created successfully.');
            
            if (displayMode === 'MY_TEAMS') {
                await fetchTeams();
            }

            setIsCreateModalOpen(false);
            setTeamName('');
            setTeamLead(null);
            setTeamMembers([]);
            setSelectedProject(null);
            showNotification('success', 'Team Created Successfully!', 'The new team has been created successfully.');
        } catch (err) {
            console.error('[API ERROR - handleCreateTeam] Failed to create team:', err.response?.data || err.message);
            setFormErrors({ general: err.response?.data?.message || 'Failed to create team. Please check the data and try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (team) => {
        setSelectedTeam(team);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedTeam) return;

        setIsSubmitting(true);
        
        try {
            console.log(`[API CALL - confirmDelete] Deleting team with ID: ${selectedTeam.teamId}`);
            await publicinfoApi.delete(`employee/${selectedTeam.teamId}/team`);
            console.log('[API SUCCESS - confirmDelete] Team deleted successfully.');
            
            if (displayMode === 'MY_TEAMS') {
                setTeams(teams.filter(t => t.teamId !== selectedTeam.teamId));
            } else if (displayMode === 'ALL_TEAMS') {
                setAdminAllTeams(adminallteams.filter(t => t.teamId !== selectedTeam.teamId));
            }
            
            setIsDeleteModalOpen(false);
            setSelectedTeam(null);
            showNotification('success', 'Team Deleted Successfully!', 'The team has been deleted successfully.');
        } catch (err) {
            console.error('[API ERROR - confirmDelete] Failed to delete team:', err.response?.data || err.message);
            showNotification('error', 'Delete Failed', 'Failed to delete team. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCreateTeamModal = () => {
        if (!isCreateModalOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-2 sm:p-4">
                <div className={`rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-md lg:max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-500 to-indigo-700 text-white relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl flex-shrink-0">
                                    <FaUsers className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words">Create New Team</h2>
                                    <p className="text-white/90 text-xs sm:text-sm break-words">Organize employees into a new team.</p>
                                </div>
                            </div>
                            <button onClick={() => {
                                setIsCreateModalOpen(false);
                                setTeamName('');
                                setTeamLead(null);
                                setTeamMembers([]);
                                setSelectedProject(null);
                                setFormErrors({});
                            }} className="p-2 sm:p-3 hover:bg-white/20 rounded-full transition-all group flex-shrink-0">
                                <FaTimes className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-grow">
                        <form className="p-4 sm:p-6 md:p-8" onSubmit={handleCreateTeam}>
                            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                
                                {/* Team Name - Uses InputField */}
                                <div>
                                    <InputField
                                        name="teamName"
                                        label="Team Name"
                                        type="text"
                                        required={true}
                                        placeholder="e.g., Development Team"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        isError={formErrors.teamName}
                                        theme={theme}
                                    />
                                </div>

                                {/* Project - Uses ProjectDropdown */}
                                <div>
                                    <label className={`block text-xs sm:text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                        Project <span className="text-red-500">*</span>
                                    </label>
                                    <ProjectDropdown 
                                        value={selectedProject} 
                                        onChange={setSelectedProject} 
                                        theme={theme} 
                                        error={formErrors.selectedProject} 
                                    />
                                    {formErrors.selectedProject && <p className="text-red-500 text-xs mt-1">{formErrors.selectedProject}</p>}
                                </div>

                                {/* Team Lead - Uses EmployeeDropdown (Single) */}
                                <div>
                                    <label className={`block text-xs sm:text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                        Team Lead <span className="text-red-500">*</span>
                                    </label>
                                    <EmployeeDropdown 
                                        value={teamLead} 
                                        onChange={setTeamLead} 
                                        theme={theme} 
                                        error={formErrors.teamLead} 
                                        isMulti={false}
                                    />
                                    {formErrors.teamLead && <p className="text-red-500 text-xs mt-1">{formErrors.teamLead}</p>}
                                </div>
                                
                                {/* Team Members - Uses EmployeeDropdown (Multi) */}
                                <div>
                                    <label className={`block text-xs sm:text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                        Team Members <span className="text-red-500">*</span>
                                    </label>
                                    <EmployeeDropdown 
                                        value={teamMembers} 
                                        onChange={setTeamMembers} 
                                        theme={theme} 
                                        error={formErrors.teamMembers} 
                                        isMulti={true} 
                                    />
                                    {formErrors.teamMembers && <p className="text-red-500 text-xs mt-1">{formErrors.teamMembers}</p>}
                                </div>
                            </div>
                            
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
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setTeamName('');
                                setTeamLead(null);
                                setTeamMembers([]);
                                setSelectedProject(null);
                                setFormErrors({});
                            }} 
                            className={`w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 border-2 rounded-lg font-semibold transition-all text-sm ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleCreateTeam} 
                            disabled={isSubmitting} 
                            className={`w-full sm:w-auto px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-lg
                                            hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2 text-sm
                                            ${isSubmitting ? 'cursor-not-allowed opacity-75' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 sm:h-5 sm:w-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Create Team</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleMyTeamsClick = () => {
        setDisplayMode('MY_TEAMS');
        setIsRightSidebarOpen(false);
    };

    const handleAllTeamsClick = () => {
        setDisplayMode('ALL_TEAMS');
        setIsRightSidebarOpen(false);
        fetchAdminAllTeams();
    };

    const renderContent = () => {
        const isMyTeamsMode = displayMode === 'MY_TEAMS';
        const teamTitle = isMyTeamsMode ? 'My Teams' : 'All Teams';

        if (loading) {
            return <LoadingSpinner />;
        }

        if (error && isMyTeamsMode) {
            return <ErrorDisplay message={error} />;
        }
        
        const teamsToRenderAfterSearch = (Array.isArray(currentDataSource) ? currentDataSource : []).filter(team =>
            team.teamName && team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (teamsToRenderAfterSearch.length === 0) {
            return (
                <div className="text-center py-12 sm:py-16 px-4">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                        <FaUsers className={`w-8 h-8 sm:w-10 sm:h-10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <h2 className={`text-lg sm:text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {searchTerm ? `No Teams Found matching "${searchTerm}"` : `${teamTitle} Not Available`}
                    </h2>
                    <p className={`text-sm sm:text-base mb-4 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {isMyTeamsMode
                            ? 'You are not part of any teams yet. Ask your manager to add you.'
                            : 'No teams are currently listed in the directory or unable to fetch directory data.'
                        }
                    </p>
                </div>
            );
        }
        
        return (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mx-4 sm:mx-0">
                    {teamsToRenderAfterSearch.map((team, index) => {
                        const teamId = team.teamId || index;
                        const isExpanded = isTeamExpanded(teamId);
                        
                        const leadOrManager = team.employees?.find(emp => emp.jobTitlePrimary === 'TEAM_LEAD' || emp.jobTitlePrimary === 'MANAGER');
                        const otherMembers = team.employees?.filter(emp => emp !== leadOrManager) || [];
                        
                        const membersToShow = isExpanded ? otherMembers : otherMembers.slice(0, 4);
                        const hasMoreMembers = otherMembers.length > 4;
                        
                        const membersToDisplay = leadOrManager ? [leadOrManager, ...membersToShow] : membersToShow;
                        const teamLead = leadOrManager?.jobTitlePrimary === 'TEAM_LEAD' ? leadOrManager : null;

                        return (
                            <div key={teamId} className={`rounded-none sm:rounded-lg shadow-lg overflow-hidden border transition-shadow duration-300 flex flex-col ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:shadow-blue-500/20' : 'bg-white border-gray-200 hover:shadow-xl'}`}>
                                <div className="p-4 sm:p-5">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <h2 className={`text-lg sm:text-xl font-bold break-words ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                {team.teamName}
                                            </h2>
                                            {leadOrManager && (
                                                <div className={`flex items-center text-sm sm:text-md mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    <FaUserShield className="mr-2 text-green-500 flex-shrink-0" />
                                                    <strong>{leadOrManager.jobTitlePrimary}:</strong><span className="ml-1 break-words">{leadOrManager.displayName || leadOrManager.firstName + ' ' + leadOrManager.lastName}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0">
                                            <Link to={`/teams/${teamId}`} title="View Details" className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
                                                <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </Link>
                                            {matchedArray?.includes("TEAM_DELETE_BTN") && !fromContextMenu && (
                                                <button onClick={() => handleDeleteClick(team)} title="Delete Team" className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                                    <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-4 sm:px-5 py-3 sm:py-4 border-t mt-auto ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    <h3 className={`font-semibold mb-2 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Members ({team.employees?.length || 0})
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-1 sm:gap-2">
                                            {membersToDisplay?.map(member => {
                                                        const displayName = member.displayName || (member.firstName + ' ' + member.lastName);
                                                        const isYou = member.employeeId === employeeIdToFetch;
                                                        const isLead = member.jobTitlePrimary === 'TEAM_LEAD' || member.jobTitlePrimary === 'MANAGER';
                                                        
                                                        let tagClass;
                                                        if (isYou) {
                                                            tagClass = theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
                                                        } else if (isLead) {
                                                            tagClass = theme === 'dark' ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-800';
                                                        } else {
                                                            tagClass = theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800';
                                                        }

                                                        return (
                                                            <span key={member.employeeId} className={`text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full break-words ${tagClass}`}>
                                                                {displayName}
                                                                {isYou && ' (You)'}
                                                                {isLead && !isYou && ` (${member.jobTitlePrimary})`}
                                                            </span>
                                                        );
                                                    })}
                                        </div>
                                        {hasMoreMembers && (
                                            <button
                                                onClick={() => toggleTeamExpansion(teamId)}
                                                className="flex items-center space-x-1 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                            >
                                                {isExpanded ? (
                                                    <><span>Show Less</span><FaChevronUp className="w-3 h-3" /></>
                                                ) : (
                                                    <><span>+{otherMembers.length - 4} more</span><FaChevronDown className="w-3 h-3" /></>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        );
    };

    const hasAdminPermissions = matchedArray && matchedArray.includes("ADMIN_FETCHING_ALLTEAMS");

    return (
        <div className={`relative flex min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            
            {hasAdminPermissions && !isRightSidebarOpen && (
                <button
                    onClick={() => setIsRightSidebarOpen(true)}
                    className="fixed right-0 top-1/2 -translate-y-1/2 p-2 rounded-l-lg bg-indigo-600 text-white shadow-lg z-50 hover:bg-indigo-700 transition-colors"
                    aria-label="Open Navigation Sidebar"
                    title="Open Navigation"
                >
                    <FaChevronLeft size={24} />
                </button>
            )}

            <div className={`flex-1 transition-all duration-300 ${isRightSidebarOpen ? 'lg:mr-60' : 'mr-0'}`}>
                <div className={`px-0 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8`}>
                    {fromContextMenu && targetEmployeeId && (
                        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 mx-4 sm:mx-0 rounded-none sm:rounded-xl border-l-4 border-blue-500 shadow-md flex items-center space-x-3 ${theme === 'dark' ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                            <FaEye className="flex-shrink-0" />
                            <p className="font-semibold text-sm sm:text-base break-words">
                                🔍 Viewing teams for employee: <span className="font-mono">{targetEmployeeId}</span>
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-4 mx-4 sm:mx-0">
                        <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            <FaUsers className="mr-2 sm:mr-3 text-blue-500" /> 
                            {displayMode === 'MY_TEAMS' ? 'My Teams' : (fromContextMenu ? 'Employee Teams' : 'All Teams')}
                        </h1>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Search by team name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-8 sm:pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'}`}
                                />
                                <FaSearch className={`absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>
                            {matchedArray?.includes("CREATE_TEAM") && !fromContextMenu && (
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="w-full sm:w-auto bg-black text-white px-4 sm:px-5 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center shadow-md text-sm"
                                >
                                    <FaPlus className="mr-2" /> Create Team
                                </button>
                            )}
                        </div>
                    </div>

                    {renderContent()}

                    {renderCreateTeamModal()}
                    
                    <ConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={confirmDelete}
                        title="Delete Team"
                        message={`Are you sure you want to delete the team "${selectedTeam?.teamName}"? This action cannot be undone.`}
                        confirmText="Delete"
                        isConfirming={isSubmitting}
                    />
                </div>
            </div>

            {hasAdminPermissions && (
                <aside
                    className={`fixed top-16 right-0 h-[calc(100vh-4rem)] border-l transition-all duration-300 z-50 flex flex-col ${
                        isRightSidebarOpen ? 'w-60 translate-x-0' : 'w-0 translate-x-full'
                    } ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                >
                    {isRightSidebarOpen && (
                        <button
                            onClick={() => setIsRightSidebarOpen(false)}
                            className="absolute -left-12 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors z-50 hidden md:block"
                            aria-label="Close Navigation Sidebar"
                            title="Close Navigation"
                        >
                            <FaChevronRight size={24} />
                        </button>
                    )}

                    <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Navigation</h3>
                        <button
                            onClick={() => setIsRightSidebarOpen(false)}
                            className={`p-1 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                            title="Close Sidebar"
                        >
                            <FaTimes size={18} />
                        </button>
                    </div>
                    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                        <button
                            onClick={handleMyTeamsClick}
                            className={`w-full text-left py-2 px-3 rounded-lg font-medium flex items-center transition-colors ${
                                displayMode === 'MY_TEAMS'
                                    ? 'bg-blue-600 text-white'
                                    : theme === 'dark'
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    : 'text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <FaUsers className="mr-2" size={16} />
                            My Teams
                        </button>
                        <button
                            onClick={handleAllTeamsClick}
                            className={`w-full text-left py-2 px-3 rounded-lg font-medium flex items-center transition-colors ${
                                displayMode === 'ALL_TEAMS'
                                    ? 'bg-blue-600 text-white'
                                    : theme === 'dark'
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    : 'text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <FaUsers className="mr-2" size={16} />
                            All Teams
                        </button>
                    </nav>
                </aside>
            )}

            {isRightSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsRightSidebarOpen(false)}
                />
            )}

            {/* Custom Notification */}
            <CustomNotification
                isOpen={notification.isOpen}
                onClose={closeNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                theme={theme}
            />
        </div>
    );
};

export default AllTeams;
