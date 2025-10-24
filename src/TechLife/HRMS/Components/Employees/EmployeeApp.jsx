import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Context } from '../HrmsContext';
import { authApi, publicinfoApi } from '../../../../axiosInstance';
import {
    IoSearchOutline,
    IoLockClosed,
    IoMailOutline,
    IoLocationOutline,
    IoBriefcaseOutline,
    IoPersonOutline,
    IoBusinessOutline,
    IoFilterOutline,
    IoChatbubbleOutline,
    IoChevronDownOutline,
    IoGridOutline,
    IoListOutline,
    IoRefreshOutline,
    IoDocumentsOutline,
    IoInformationCircleOutline,
    IoAddCircleOutline,
    IoCloseCircleOutline,
    IoClose,
    IoArrowBack,
    IoArrowForward,
    IoWarning,
    IoCheckmarkCircle,
    IoIdCardOutline,
    IoPeopleOutline,
    IoTrashOutline,
    IoCloudUpload,
    IoCalendarOutline,
    IoFitness,
    IoGlobe,
    IoKeyOutline,
} from 'react-icons/io5';

const styles = `
  .preserve-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
  .hover\\:scale-105:hover {
    transform: scale(1.05);
  }
`;

try {
    if (!document.getElementById('custom-employee-styles')) {
        const styleSheet = document.createElement("style");
        styleSheet.id = 'custom-employee-styles';
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }
} catch (e) {
    console.warn("Could not inject custom styles:", e);
}


// --- Reusable Modal Component ---
const Modal = ({ children, onClose, title, type, theme }) => {
    let titleClass = "";
    let icon = null;

    if (type === "success") {
        titleClass = "text-green-600";
        icon = <IoCheckmarkCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />;
    } else if (type === "error") {
        titleClass = "text-red-600";
        icon = <IoWarning className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />;
    } else if (type === "confirm") {
        titleClass = "text-yellow-600";
        icon = <IoWarning className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />;
    } else if (type === "default") {
        titleClass = theme === 'dark' ? "text-white" : "text-gray-900";
        icon = <IoInformationCircleOutline className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-[1000] animate-fadeIn">
            <div className={`w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl animate-slideUp transform-gpu ${
                theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
                <div className="p-4 sm:p-6">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                        {icon && <span className="mr-2 sm:mr-3">{icon}</span>}
                        <h3 className={`text-lg sm:text-xl font-bold ${titleClass} ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                            {title}
                        </h3>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className={`ml-auto p-1 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'} transition-all`}
                            >
                                <IoClose className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Reusable Input Field Component ---
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
    multiple = false,
    accept,
    theme,
    maxLength,
    disabled = false 
}) => {
    const normalizedValue = value === null || value === undefined ? '' : value;

    const baseInputClass = `w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
        isError
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
            : theme === 'dark'
            ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
            : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
    } disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 disabled:cursor-not-allowed`;

    const textareaClass = `w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 resize-none h-24 sm:h-32 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
        isError
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
            : theme === 'dark'
            ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
            : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
    } disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 disabled:cursor-not-allowed`;

    const selectClass = `w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 appearance-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
        isError
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
            : theme === 'dark'
            ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
            : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
    } disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 disabled:cursor-not-allowed`;

    return (
        <div className="group relative" key={name}>
            <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
                {label}
                {required && <span className="text-red-500 ml-1 text-sm sm:text-base">*</span>}
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
                        value={normalizedValue}
                        onChange={onChange}
                        onBlur={onBlur}
                        className={selectClass}
                        required={required}
                        disabled={disabled}  
                    >
                        <option value="">Select {label.toLowerCase()}</option>
                        {options.map((option, index) => (
                            <option key={index} value={option.value || option}>
                                {option.label || option}
                            </option>
                        ))}
                    </select>
                    <div className={`absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>
            ) : type === 'textarea' ? (
                <textarea
                    name={name}
                    value={normalizedValue}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    className={textareaClass}
                    required={required}
                    rows={4}
                    maxLength={maxLength}
                    disabled={disabled} 
                />
            ) : type === 'file' ? (
                <div className={`relative border-2 border-dashed rounded-lg sm:rounded-xl transition-all duration-300 ${
                    isError
                        ? 'border-red-300 bg-red-50'
                        : theme === 'dark'
                        ? 'border-gray-600 bg-gray-800 hover:border-blue-400 hover:bg-blue-900/20'
                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}> {/* Added disabled styles */}
                    <input
                        type="file"
                        name={name}
                        accept={accept}
                        multiple={multiple}
                        onChange={onChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={disabled} 
                    />
                    <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
                        <IoCloudUpload className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <p className={`text-xs sm:text-sm font-medium mb-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                            Drop your file here, or <span className="text-blue-600">browse</span>
                        </p>
                        <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                            {accept || 'All file types supported'}
                        </p>
                    </div>
                </div>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={normalizedValue}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    className={baseInputClass}
                    required={required}
                    maxLength={maxLength}
                    disabled={disabled} // <-- UPDATED: Added disabled attribute
                />
            )}

            {isError && (
                <div className="mt-2 sm:mt-3 flex items-center space-x-2 text-red-600 animate-slideIn">
                    <IoWarning className="w-4 h-4 flex-shrink-0" />
                    <p className="text-xs sm:text-sm font-medium">{isError}</p>
                </div>
            )}
        </div>
    );
};


// --- Field Definitions for the Combined Form ---
const credentialsFormFields = [
    { label: "Full Name", name: "fullName", type: "text", required: true, hint: "Enter the full name for the user account." },
    { label: "Username", name: "username", type: "text", required: true, hint: "Must start with 'ACS' and match Employee ID (8-30 chars).", maxLength: 30 },
    { label: "Password", name: "password", type: "password", required: true, hint: "Temporary password (8-30 characters).", maxLength: 30 },
    { label: "Role", name: "role", type: "text", required: true, hint: "E.g., ROLE_ADMIN, ROLE_MANAGER, ROLE_EMPLOYEE, ROLE_HR." },
];

// UPDATED: Added employeeRole field
const employeeFormFields = [
    { label: "Employee ID", name: "employeeId", type: "text", required: true, hint: "Must start with 'ACS' and match Username (8-30 chars).", maxLength: 30 },
    { label: "First Name", name: "firstName", type: "text", required: true, hint: "Enter employee's first name." },
    { label: "Display Name", name: "displayName", type: "text", required: false, hint: "Name to display in the system (optional)." },
    { label: "Marital Status", name: "maritalStatus", type: "select", required: true, options: ["Single", "Married", "Divorced", "Widowed"], hint: "Select employee's marital status." },
    { label: "Department ID", name: "departmentId", type: "department-dropdown", required: true, hint: "Select department from the list." },
    {
        label: "Employee Role",
        name: "employeeRole",
        type: "text",
        required: false,
        hint: "This is set automatically from the User Credentials role.",
        disabled: true // Set to disabled
    },
];


const generateInitials = (name) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
};


const DepartmentDropdown = ({ value, onChange, theme, isError, hint }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const PAGE_SIZE = 10;

    const loadDepartments = useCallback(async (page = 0, reset = false) => {
        if (loading || (!hasMore && !reset)) return;

        setLoading(true);
        try {
            const response = await publicinfoApi.get(`employee/${page}/${PAGE_SIZE}/departmentId/asc/all/departments`);
            const newDepartments = response.data.content || [];

            setDepartments(prev => reset ? newDepartments : [...prev, ...newDepartments]);
            setCurrentPage(page);
            setHasMore(newDepartments.length === PAGE_SIZE);
        } catch (error) {
            console.error("Error fetching departments:", error);
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore]);

    useEffect(() => {
        if (isOpen && departments.length === 0) {
            loadDepartments(0, true);
        }
    }, [isOpen, loadDepartments, departments.length]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
            loadDepartments(currentPage + 1);
        }
    };

    const filteredDepartments = departments.filter(dept => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            dept.departmentId.toLowerCase().includes(searchLower) ||
            dept.departmentName.toLowerCase().includes(searchLower)
        );
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDisplayText = () => {
        if (!value) return 'Choose Department ID';
        const selectedDept = departments.find(dept => dept.departmentId === value);
        return selectedDept ? `${selectedDept.departmentId}(${selectedDept.departmentName})` : value;
    };

    return (
        <div className="group relative" ref={dropdownRef}>
            <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
                Department ID
                <span className="text-red-500 ml-1 text-sm sm:text-base">*</span>
            </label>

            {hint && (
                <p className={`text-xs mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                    {hint}
                </p>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-left
                        focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                        ${isError
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                            : theme === 'dark'
                            ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                            : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                        }`}
                >
                    <span className={value ? '' : 'text-gray-500'}>
                        {getDisplayText()}
                    </span>
                </button>

                <div className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <IoChevronDownOutline className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>

                {isOpen && (
                    <div className={`absolute z-50 w-full mt-1 border rounded-lg sm:rounded-xl shadow-lg max-h-64 ${
                        theme === 'dark'
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-white border-gray-300'
                    }`}>
                        <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                            <div className="relative">
                                <IoSearchOutline className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`} />
                                <input
                                    type="text"
                                    placeholder="Search departments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                                        theme === 'dark'
                                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                                            : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                                    }`}
                                />
                            </div>
                        </div>

                        <div
                            className="overflow-y-auto max-h-48"
                            onScroll={handleScroll}
                        >
                            {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((dept, index) => (
                                    <button
                                        key={`${dept.departmentId}-${index}`}
                                        type="button"
                                        onClick={() => {
                                            onChange(dept.departmentId);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 ${
                                            value === dept.departmentId
                                                ? theme === 'dark'
                                                    ? 'bg-blue-700 text-white'
                                                    : 'bg-blue-100 text-blue-800'
                                                : theme === 'dark'
                                                ? 'text-gray-200'
                                                : 'text-gray-800'
                                        }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold">
                                                {dept.departmentId}({dept.departmentName})
                                            </span>
                                            <span className={`text-xs mt-1 ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                                {dept.departmentDescription}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : !loading ? (
                                <div className={`px-4 py-8 text-center text-sm ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    {searchTerm ? 'No departments found matching your search.' : 'No departments available.'}
                                </div>
                            ) : null}

                            {loading && (
                                <div className="flex justify-center items-center py-4">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    <span className={`ml-2 text-sm ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Loading departments...</span>
                                </div>
                            )}

                            {!hasMore && departments.length > 0 && (
                                <div className={`text-center py-2 text-xs ${
                                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                    — End of results ({departments.length} departments) —
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isError && (
                <div className="mt-2 sm:mt-3 flex items-center space-x-2 text-red-600 animate-slideIn">
                    <IoWarning className="w-4 h-4 flex-shrink-0" />
                    <p className="text-xs sm:text-sm font-medium">{isError}</p>
                </div>
            )}
        </div>
    );
};

function EmployeeApp() {
    const navigate = useNavigate();
    const [employeeData, setEmployeeData] = useState(null);
    const [dynamicFilters, setDynamicFilters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const { userprofiledata, theme, userData } = useContext(Context);
    const { empID } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({});
    const [loggedPermissiondata, setLoggedPermissionData] = useState([]);
    const [matchedArray, setMatchedArray] = useState(null);
    const LoggedUserRole = userData?.roles[0] ? `ROLE_${userData?.roles[0]}` : null;

    const [flippedCard, setFlippedCard] = useState(null);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, employee: null });

    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState('');
    // UPDATED: Added employeeRole to initial state
    const initialFormData = {
        fullName: '',
        username: '',
        password: '',
        role: '',
        employeeId: '',
        firstName: '',
        displayName: '',
        maritalStatus: '',
        departmentId: '',
        employeeRole: '', // <-- Added
    };
    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState({});

    const [popup, setPopup] = useState({ show: false, message: '', type: '' });
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, employee: null });

    const [pageNumber, setPageNumber] = useState(0);
    const [pageSize, setPageSize] = useState(15);
    const [sortBy, setSortBy] = useState('employeeId');
    const [sortOrder, setSortOrder] = useState('asc');

    const [isTerminatedEmployeesModalOpen, setIsTerminatedEmployeesModalOpen] = useState(false);
    const [terminatedEmployeesData, setTerminatedEmployeesData] = useState([]);
    const [terminatedLoading, setTerminatedLoading] = useState(false);
    const [terminatedHasMore, setTerminatedHasMore] = useState(true);
    const [terminatedCurrentPage, setTerminatedCurrentPage] = useState(0);
    const [terminatedSearchTerm, setTerminatedSearchTerm] = useState('');
    const terminatedScrollRef = useRef(null);
    const [hasAccess, setHasAccess] = useState([]);

    const TERMINATED_PAGE_SIZE = 15;

    const userRole = userData?.roles?.[0]?.toUpperCase();
    const hasManagementAccess = ['ADMIN', 'MANAGER', 'HR'].includes(userRole);

    useEffect(() => {
        let fetchedData = async () => {
            try {
                let response = await authApi.get(`role-access/${LoggedUserRole}`);
                setLoggedPermissionData(response.data);
            } catch(error) {
                console.error("Error fetching role access data:", error);
            }
        }
        fetchedData();
    }, [LoggedUserRole]);

    useEffect(() => {
        if(loggedPermissiondata){
            setMatchedArray(loggedPermissiondata?.permissions)
        }
    }, [loggedPermissiondata]);

    useEffect(() => {
        setHasAccess(userData?.permissions)
    }, [userData])

    useEffect(() => {
        const handleOutsideClick = () => {
            if (contextMenu.visible) {
                setContextMenu({ ...contextMenu, visible: false });
            }
            if (flippedCard) {
                setFlippedCard(null);
            }
        };
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, [contextMenu, flippedCard]);

    const handleViewTeamsClick = (employee) => {
        if (employee) {
            navigate(`/my-teams/${empID}?fromContextMenu=true&targetEmployeeId=${employee.employeeId}`);
            setContextMenu({ ...contextMenu, visible: false });
            setFlippedCard(null);
        }
    };

    const handleChatClick = async (employee) => {
        if (employee) {
            navigate(`/chat/${empID}/with?id=${employee.employeeId}`, {
                state: {
                    newChatTarget: {
                        chatId: employee.employeeId,
                        name: employee.displayName,
                        profile: employee.employeeImage,
                        type: 'private',
                        isOnline: null,
                        lastMessage: '',
                        unreadMessageCount: 0,
                    }
                }
            });
            if (contextMenu.visible) {
                setContextMenu({ ...contextMenu, visible: false });
            }
            if (flippedCard) {
                setFlippedCard(null);
            }
        }
    };

    const handleViewProfileClick = (employee) => {
        if (employee) {
            navigate(`/employees/${empID}/public/${employee.employeeId}`);
            setContextMenu({ ...contextMenu, visible: false });
            setFlippedCard(null);
        }
    };

    const handleDocumentsClick = (employee) => {
        if (employee) {
            navigate(`/profile/${empID}/documents?fromContextMenu=true&targetEmployeeId=${employee.employeeId}`);
            setContextMenu({ ...contextMenu, visible: false });
            setFlippedCard(null);
        }
    };

    const handleAboutClick = (employee) => {
        if (employee) {
            navigate(`/profile/${empID}/about?fromContextMenu=true&targetEmployeeId=${employee.employeeId}`);
            setContextMenu({ ...contextMenu, visible: false });
            setFlippedCard(null);
        }
    };

    const handleDeleteClick = (employee) => {
        setDeleteConfirmation({ show: true, employee });
    };

   const confirmDelete = async () => {
        const { employee } = deleteConfirmation;
        if (!employee) return;
        const employeeIdToDelete = employee.employeeId.toLowerCase();

        try {
            // 1. Delete employee record from publicinfo service
            await publicinfoApi.delete(`employee/${employee.employeeId}`);

            // 2. Delete user credentials from auth service (New API call)
            // It automatically passes the employeeId as a path variable.
            await authApi.delete(`delete/${employeeIdToDelete}`);

            // Update local state and show success notification
            setEmployeeData(prevData => prevData.filter(emp => emp.employeeId !== employee.employeeId));
            setPopup({
                show: true,
                message: `Employee ${employee.displayName} and associated user credentials have been successfully deleted.`,
                type: 'success'
            });

        } catch (err) {
            console.error("Error deleting employee and user:", err);

            const errorMessage = err.response?.data?.message || 'The user service may have failed to delete credentials. Please verify the backend logs.';

            setPopup({
                show: true,
                message: `Failed to complete full deletion. ${errorMessage}`,
                type: 'error'
            });

        } finally {
            setDeleteConfirmation({ show: false, employee: null });
            setFlippedCard(null);
        }
    };

    const fetchAllEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const response = await publicinfoApi.get(`employee/${pageNumber}/${pageSize}/${sortBy}/${sortOrder}/employees`);
            setEmployeeData(response.data.content);
        } catch (err) {
            console.error("Error fetching employees:", err);
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize, sortBy, sortOrder]);


    useEffect(() => {
        fetchAllEmployees();
    }, [fetchAllEmployees]);

    useEffect(() => {
        if (employeeData) {
            const roles = [...new Set(employeeData.map(e => e.jobTitlePrimary).filter(Boolean))];
            const departments = [...new Set(employeeData.map(e => e.departmentId).filter(Boolean))];
            const locations = [...new Set(employeeData.map(e => e.location).filter(Boolean))];

            const newFilters = [
                { name: 'Role', options: ['All Roles', ...roles], icon: IoBriefcaseOutline },
                { name: 'Department', options: ['All Departments', ...departments], icon: IoBusinessOutline },
                { name: 'Location', options: ['All Locations', ...locations], icon: IoLocationOutline },
            ];
            setDynamicFilters(newFilters);

            const initialFilters = newFilters.reduce((acc, filter) => ({
                ...acc,
                [filter.name]: filter.options[0]
            }), {});
            setSelectedFilters(initialFilters);
        }
    }, [employeeData]);

    const filteredEmployees = employeeData ? employeeData.filter(employee => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const matchesSearch =
            (employee.displayName && employee.displayName.toLowerCase().includes(lowercasedSearchTerm)) ||
            (employee.workEmail && employee.workEmail.toLowerCase().includes(lowercasedSearchTerm)) ||
            (employee.employeeId && employee.employeeId.toLowerCase().includes(lowercasedSearchTerm));

        const matchesFilters = Object.entries(selectedFilters).every(([filterName, value]) => {
            if (!value || value.startsWith('All')) return true;
            switch (filterName) {
                case 'Role': return employee.jobTitlePrimary === value;
                case 'Department': return employee.departmentId === value;
                case 'Location': return employee.location === value;
                default: return true;
            }
        });

        return matchesSearch && matchesFilters;
    }) : [];

    const clearFilters = () => {
        setSearchTerm('');
        const clearedFilters = dynamicFilters.reduce((acc, filter) => ({
            ...acc,
            [filter.name]: filter.options[0]
        }), {});
        setSelectedFilters(clearedFilters);
    };

    // --- UNIFIED FORM LOGIC ---

    // UPDATED: Added logic to sync 'role' to 'employeeRole'
    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updatedData = { ...prev, [name]: value };

            if (name === 'fullName') {
                updatedData.firstName = value.split(' ')[0] || '';
                updatedData.displayName = value;
            }

            // Syncs the role field to employeeRole
            if (name === 'role') {
                updatedData.employeeRole = value;
            }

            return updatedData;
        });

        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };


    const handleDepartmentChange = (value) => {
        setFormData({ ...formData, departmentId: value });
        if (formErrors.departmentId) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.departmentId;
                return newErrors;
            });
        }
    };

    // MODIFIED: Added real-time onBlur validation
    const handleBlurValidation = (e) => {
        const { name, value } = e.target;
        let error = '';

        if (name === 'username' || name === 'employeeId') {
            if (value && !value.startsWith('ACS')) {
                error = "Incorrect format. Must start with 'ACS'.";
            } else if (value && (value.length < 8 || value.length > 30)) {
                error = "Must be between 8 and 30 characters.";
            }
        }

        if (name === 'password') {
            if (value && (value.length < 8 || value.length > 30)) {
                error = "Password must be 8-30 characters.";
            }
        }

        setFormErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[name] = error;
            } else {
                delete newErrors[name];
            }
            return newErrors;
        });
    };

    // MODIFIED: Updated validation rules including the match check
    const validateForm = (data) => {
        const errors = {};
        if (!data.fullName) errors.fullName = "Full name is required.";

        if (!data.username) errors.username = "Username is required.";
        else if (data.username.length < 8 || data.username.length > 30) errors.username = "Username must be 8-30 characters.";
        else if (!data.username.startsWith('ACS')) errors.username = "Username must start with 'ACS'.";

        if (!data.password) errors.password = "Password is required.";
        else if (data.password.length < 8 || data.password.length > 30) errors.password = "Password must be 8-30 characters.";

        if (!data.role) errors.role = "Role is required.";

        if (!data.employeeId) errors.employeeId = "Employee ID is required.";
        else if (data.employeeId.length < 8 || data.employeeId.length > 30) errors.employeeId = "Employee ID must be 8-30 characters.";
        else if (!data.employeeId.startsWith('ACS')) errors.employeeId = "Employee ID must start with 'ACS'.";

        // NEW: Check if username and employeeId match
        if (data.username && data.employeeId && data.username !== data.employeeId) {
            errors.username = "Username and Employee ID must match.";
            errors.employeeId = "Username and Employee ID must match.";
        }

        if (!data.firstName) errors.firstName = "First name is required.";
        if (!data.maritalStatus) errors.maritalStatus = "Marital status is required.";
        if (!data.departmentId) errors.departmentId = "Department ID is required.";

        return errors;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            return;
        }

        setIsUpdating(true);
        setFormErrors({});

        const credentialsDto = {
            fullName: formData.fullName,
            username: formData.username,
            password: formData.password,
            role: formData.role.toUpperCase(),
        };

        // Note: employeeRole is not sent in the DTO as it's derived/managed differently usually
        const employeeDto = {
            employeeId: formData.employeeId,
            firstName: formData.firstName,
            displayName: formData.displayName || formData.fullName,
            maritalStatus: formData.maritalStatus,
            departmentId: formData.departmentId,
            role: formData.role.toUpperCase(),
            // You might need to send formData.employeeRole here if your backend expects it explicitly
        };

        try {
            setSubmissionStatus('Creating User...');
            await authApi.post("/register", credentialsDto);

            setSubmissionStatus('Creating Employee...');
            await publicinfoApi.post('employee', employeeDto);

            setPopup({ show: true, message: 'Employee and user account created successfully!', type: 'success' });
            setIsAddEmployeeModalOpen(false);
            setFormData(initialFormData);
            fetchAllEmployees(); // Refresh employee list

        } catch (error) {
            console.error("Error creating employee:", error);
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please check the data and try again.';
            setFormErrors({ general: errorMessage });
            setPopup({ show: true, message: errorMessage, type: 'error' });
        } finally {
            setIsUpdating(false);
            setSubmissionStatus('');
        }
    };

    const handleFormClose = () => {
        setIsAddEmployeeModalOpen(false);
        setFormData(initialFormData);
        setFormErrors({});
    };

    // UPDATED: Destructure and pass 'disabled' prop
    const renderField = (field, currentErrors, handleChange, fieldValue) => {
        const { label, name, type, required, options = [], hint, maxLength, disabled = false } = field; // <-- Added disabled
        const isError = currentErrors[name];

        if (type === 'department-dropdown') {
            return (
                <DepartmentDropdown
                    key={name}
                    value={fieldValue}
                    onChange={handleChange}
                    theme={theme}
                    isError={isError}
                    hint={hint}
                />
            );
        }

       return (
            <InputField
                key={name}
                name={name}
                label={label}
                type={type}
                required={required}
                hint={hint}
                placeholder={`Enter ${label.toLowerCase()}...`}
                value={fieldValue}
                onChange={handleChange}
                onBlur={handleBlurValidation}
                isError={isError}
                options={options}
                theme={theme}
                maxLength={maxLength}
                disabled={disabled} // <-- Passed disabled prop
            />
        );
    };

    const renderAddEmployeeModal = () => {
        if (!isAddEmployeeModalOpen) return null;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] p-2 sm:p-4">
            <motion.div
                initial={{ y: -50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -50, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`rounded-2xl sm:rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp flex flex-col ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
            >
                {/* Fixed Header */}
                <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex-shrink-0`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="text-xl sm:text-2xl">
                                <IoAddCircleOutline />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Add New Employee</h2>
                                <p className="text-xs sm:text-sm opacity-90 mt-1">Provide user credentials and basic employee details.</p>
                            </div>
                        </div>
                        <button onClick={handleFormClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                            <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 md:p-8">
                        {/* Credentials Section */}
                        <div className="mb-6 sm:mb-8">
                            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            }`}>
                                <IoKeyOutline className="w-5 h-5 mr-2" />
                                User Credentials
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                                {credentialsFormFields.map(field => (
                                    <div key={field.name}>
                                        {renderField(field, formErrors, handleFormChange, formData[field.name])}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Employee Information Section */}
                        <div className="mb-6 sm:mb-8">
                            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                            }`}>
                                <IoPersonOutline className="w-5 h-5 mr-2" />
                                Employee Information
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                                {employeeFormFields.map(field => (
                                    <div key={field.name}>
                                        {renderField(field, formErrors, field.type === 'department-dropdown' ? handleDepartmentChange : handleFormChange, formData[field.name])}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {formErrors.general && (
                            <div className={`mt-4 sm:mt-6 p-3 sm:p-4 border-l-4 border-red-400 rounded-r-lg ${
                                theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                            }`}>
                                <div className="flex items-center">
                                    <IoWarning className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-3" />
                                    <p className={`font-medium text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
                                        {formErrors.general}
                                    </p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Fixed Footer */}
                <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t flex-shrink-0 ${
                    theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
                } flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4`}>
                    <button
                        type="button"
                        onClick={handleFormClose}
                        className={`px-6 sm:px-8 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 focus:ring-4 focus:ring-gray-500/20 text-sm sm:text-base ${
                            theme === 'dark'
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleFormSubmit} // Changed to trigger submit, not call directly
                        disabled={isUpdating}
                        className={`px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-purple-500/30 text-sm sm:text-base flex items-center justify-center space-x-2 ${
                            isUpdating ? 'cursor-not-allowed opacity-75' : ''
                        }`}
                    >
                        {isUpdating ? (
                            <>
                                <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>{submissionStatus || 'Saving...'}</span>
                            </>
                        ) : (
                            <>
                                <IoCheckmarkCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Create Employee</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
        );
    };


    // ... (rest of the component code: loadTerminatedEmployees, handleTerminateEmployees, etc.) ...
    // ... (This part remains unchanged from your original code) ...

        const loadTerminatedEmployees = useCallback(async (page = 0, reset = false) => {
        if (terminatedLoading || (!terminatedHasMore && !reset)) return;

        setTerminatedLoading(true);
        try {
            const response = await publicinfoApi.get(`employee/${page}/${TERMINATED_PAGE_SIZE}/employeeId/asc/terminated/employees`);
            const newEmployees = response.data.content || [];

            setTerminatedEmployeesData(prev => reset ? newEmployees : [...prev, ...newEmployees]);
            setTerminatedCurrentPage(page);
            setTerminatedHasMore(newEmployees.length === TERMINATED_PAGE_SIZE);
        } catch (error) {
            console.error("Error fetching terminated employees:", error);
            if (reset) {
                alert("Failed to fetch terminated employees. Check console for details.");
            }
        } finally {
            setTerminatedLoading(false);
        }
    }, [terminatedLoading, terminatedHasMore]);

    const handleTerminateEmployees = async () => {
        setTerminatedEmployeesData([]);
        setTerminatedCurrentPage(0);
        setTerminatedHasMore(true);
        setTerminatedSearchTerm('');
        setIsTerminatedEmployeesModalOpen(true);

        loadTerminatedEmployees(0, true);
    };

    const handleTerminatedScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && terminatedHasMore && !terminatedLoading) {
            loadTerminatedEmployees(terminatedCurrentPage + 1);
        }
    };

    const filteredTerminatedEmployees = terminatedEmployeesData.filter(employee => {
        if (!terminatedSearchTerm) return true;
        const searchLower = terminatedSearchTerm.toLowerCase();
        return (
            (employee.displayName && employee.displayName.toLowerCase().includes(searchLower)) ||
            (employee.employeeId && employee.employeeId.toLowerCase().includes(searchLower)) ||
            (employee.workEmail && employee.workEmail.toLowerCase().includes(searchLower))
        );
    });

    const renderTerminatedEmployeesModal = () => {
        if (!isTerminatedEmployeesModalOpen) return null;

        const baseApiUrl = "https://hrms.anasolconsultancyservices.com/api";

        const renderDataField = (label, value) => {
            if (Array.isArray(value)) {
                value = value.join(', ');
            }
            return (
                <div className="text-xs">
                    <span className="font-semibold">{label}:</span> {value || 'N/A'}
                </div>
            );
        };

        const renderLink = (label, path) => {
            if (!path) return null;
            const fullUrl = path.startsWith("http") ? path : `${baseApiUrl}/${path}`;
            return (
                <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-xs mt-1 inline-block"
                >
                    {label}
                </a>
            );
        };

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[200] p-2 sm:p-4">
                <motion.div
                    initial={{ y: -50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -50, opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className={`relative w-full max-w-sm sm:max-w-md lg:max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl rounded-xl sm:rounded-2xl ${
                        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    }`}
                >
                    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-700 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="text-lg sm:text-2xl">
                                    <IoTrashOutline />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg sm:text-xl font-bold break-words">Terminated Employees</h2>
                                    <p className="text-white/90 text-xs sm:text-sm break-words">
                                        List of employees who have left the company ({filteredTerminatedEmployees.length} found)
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsTerminatedEmployeesModalOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 group flex-shrink-0"
                            >
                                <IoClose className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-200" />
                            </button>
                        </div>
                    </div>

                    <div className={`px-4 sm:px-6 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="relative">
                            <IoSearchOutline className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <input
                                type="text"
                                placeholder="Search terminated employees..."
                                value={terminatedSearchTerm}
                                onChange={(e) => setTerminatedSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                                }`}
                            />
                        </div>
                    </div>

                    <div
                        ref={terminatedScrollRef}
                        className="overflow-y-auto max-h-[calc(95vh-180px)] p-4 sm:p-6"
                        onScroll={handleTerminatedScroll}
                    >
                        {filteredTerminatedEmployees.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTerminatedEmployees.map((employee, index) => (
                                    <motion.div
                                        key={`${employee.employeeId}-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: (index % TERMINATED_PAGE_SIZE) * 0.05 }}
                                        className={`p-4 rounded-lg border ${
                                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                                        } hover:shadow-lg transition-all duration-300`}
                                    >
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="flex-shrink-0">
                                                {employee.employeeImage ? (
                                                    <img
                                                        src={employee.employeeImage.startsWith("http")
                                                            ? employee.employeeImage
                                                            : `${baseApiUrl}/${employee.employeeImage}`
                                                        }
                                                        alt={`${employee.displayName || 'Employee'}'s profile`}
                                                        className="h-12 w-12 rounded-full object-cover border-2 border-red-300 shadow-md"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div
                                                    className={`h-12 w-12 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center text-white text-sm font-bold shadow-md ${
                                                        employee.employeeImage ? 'hidden' : 'flex'
                                                    }`}
                                                >
                                                    {generateInitials(employee.displayName || employee.employeeId || 'N/A')}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm truncate">{employee.displayName || 'N/A'}</h4>
                                                <p className="text-xs text-gray-500 truncate">{employee.employeeId}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            {renderDataField("Work Email", employee.workEmail)}
                                            {renderDataField("Work Number", employee.workNumber)}
                                            {renderDataField("Gender", employee.gender)}
                                            {renderDataField("Date of Joining", employee.dateOfJoining)}
                                            {renderDataField("Date of Leaving", employee.dateOfLeaving)}
                                            {renderDataField("Department", employee.departmentId)}
                                            {renderDataField("Projects", employee.projectId)}
                                            {renderDataField("Teams", employee.teamId)}
                                            {renderDataField("Aadhaar Number", employee.aadharNumber)}
                                            {renderDataField("PAN Number", employee.panNumber)}
                                            {renderDataField("Passport Number", employee.passportNumber)}

                                            {employee.degreeDocuments && Array.isArray(employee.degreeDocuments) && employee.degreeDocuments.map((doc, docIndex) => (
                                                <div key={docIndex}>
                                                    {renderLink(`Click for Degree Image ${docIndex + 1}`, doc)}
                                                </div>
                                            ))}

                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {renderLink("Employee Image", employee.employeeImage)}
                                                {renderLink("Aadhaar Image", employee.aadharImage)}
                                                {renderLink("PAN Image", employee.panImage)}
                                                {renderLink("Passport Image", employee.passportImage)}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : terminatedLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                                <span className="ml-3 text-sm">Loading terminated employees...</span>
                            </div>
                        ) : (
                            <p className="text-center text-sm italic text-gray-500 py-8">
                                {terminatedSearchTerm ? 'No terminated employees found matching your search.' : 'No terminated employees found.'}
                            </p>
                        )}

                        {terminatedLoading && terminatedEmployeesData.length > 0 && (
                            <div className="flex justify-center items-center py-4 mt-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                                <span className="ml-3 text-sm">Loading more...</span>
                            </div>
                        )}

                        {!terminatedHasMore && terminatedEmployeesData.length > 0 && (
                            <div className="text-center py-4 mt-4">
                                <p className="text-sm text-gray-500 italic">
                                    — End of results ({terminatedEmployeesData.length} total employees) —
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="text-center">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <IoPersonOutline className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                            </div>
                        </div>
                        <h2 className={`text-lg sm:text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Loading Employee Directory</h2>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Discovering your colleagues...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Display only the modal if it's open
    if (isAddEmployeeModalOpen) {
        return (
            <>
                {renderAddEmployeeModal()}
                {/* Optional: Render a blurred background or similar */}
                 <div className={`min-h-screen filter blur-sm ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}></div>
            </>
        );
    }

    return (
        <div className={`min-h-screen px-0 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
            <div className="max-w-7xl mx-auto">
               <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`rounded-none sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 shadow-lg border mb-4 sm:mb-6 mx-2 sm:mx-0 ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                >
                <div className="mb-3">
                    <div className="relative group max-w-full sm:max-w-sm md:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <IoSearchOutline className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                        </div>
                        <input
                            type="text"
                            className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-7 sm:pl-8 border rounded-md sm:rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none placeholder-gray-500 text-xs sm:text-sm ${
                                theme === 'dark'
                                    ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500 group-hover:border-blue-400'
                                    : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300 group-hover:border-blue-300'
                            }`}
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {dynamicFilters.map(filter => {
                            const IconComponent = filter.icon;
                            return (
                                <div key={filter.name} className="relative group min-w-0 flex-1 sm:flex-initial">
                                    <div className="absolute inset-y-0 left-0 pl-1.5 sm:pl-2 flex items-center pointer-events-none">
                                        <IconComponent className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                                    </div>
                                    <select
                                        className={`px-3 sm:px-4 py-2 sm:py-2.5 pl-6 sm:pl-7 pr-4 sm:pr-5 border rounded-md sm:rounded-lg transition-all duration-300 appearance-none cursor-pointer min-w-[100px] sm:min-w-[120px] text-xs truncate focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
                                            theme === 'dark'
                                                ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500 group-hover:border-blue-400'
                                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 group-hover:border-blue-300'
                                        }`}
                                        value={selectedFilters[filter.name] || filter.options[0]} // Ensure a value is selected
                                        onChange={(e) => setSelectedFilters({
                                            ...selectedFilters,
                                            [filter.name]: e.target.value,
                                        })}
                                    >
                                        {filter.options.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-1.5 sm:pr-2 flex items-center pointer-events-none">
                                        <IoChevronDownOutline className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                        <button
                            onClick={clearFilters}
                            className={`px-4 sm:px-5 py-1.5 sm:py-2 border rounded-md sm:rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-gray-500/20 text-xs flex items-center justify-center space-x-1.5 ${
                                theme === 'dark'
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                            }`}
                        >
                            <IoRefreshOutline className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span>Clear</span>
                        </button>

                        {matchedArray && matchedArray.includes("CREAT_USER") && (
                            <button
                                onClick={() => setIsAddEmployeeModalOpen(true)}
                                className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-md sm:rounded-lg hover:shadow-md transform hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 text-xs flex items-center justify-center space-x-1.5"
                            >
                                <IoAddCircleOutline className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span>Add</span>
                            </button>
                        )}

                        {matchedArray && matchedArray.includes("TERMINATE_EMPLOYEES_BTN") && (
                            <button
                                onClick={handleTerminateEmployees}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200 text-xs flex items-center justify-center space-x-1.5"
                            >
                                <IoTrashOutline className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span>Terminate</span>
                            </button>
                        )}

                        <div className={`flex rounded-md p-0.5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1 sm:p-1.5 rounded-sm transition-all duration-200 ${
                                    viewMode === 'grid'
                                        ? (theme === 'dark' ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                                        : (theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                                }`}
                            >
                                <IoGridOutline className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1 sm:p-1.5 rounded-sm transition-all duration-200 ${
                                    viewMode === 'list'
                                        ? (theme === 'dark' ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                                        : (theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                                }`}
                            >
                                <IoListOutline className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                        </div>
                    </div>
                </div>
                </motion.div>

                <div className="flex items-center justify-between mb-4 sm:mb-3 mx-4 sm:mx-0">
                    <h3 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {filteredEmployees.length} Employee{filteredEmployees.length !== 1 ? 's' : ''} Found
                    </h3>
                </div>

                {filteredEmployees.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center py-12 sm:py-16 px-4"
                    >
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                            <IoPersonOutline className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                        </div>
                        <h2 className={`text-lg sm:text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>No Employees Found</h2>
                        <p className={`text-sm sm:text-base mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Try adjusting your search terms or filters.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-blue-500/30 text-sm sm:text-base"
                        >
                            Clear All Filters
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className={viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mx-4 sm:mx-0'
                            : 'space-y-3 sm:space-y-4 mx-4 sm:mx-0'
                        }
                    >
                        <AnimatePresence>
                            {filteredEmployees.map((employee, index) => (
                                <motion.div
                                    key={employee.employeeId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className="relative"
                                    style={viewMode === 'grid' ? { perspective: '1000px' } : {}}
                                >
                                    {viewMode === 'grid' ? (
                                        <div
                                            className={`relative w-full h-72 sm:h-80 cursor-pointer transition-transform duration-700 preserve-3d ${
                                                flippedCard === employee.employeeId ? 'rotate-y-180' : ''
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (flippedCard === employee.employeeId) {
                                                     navigate(`/employees/${empID}/public/${employee.employeeId}`);
                                                } else {
                                                    setFlippedCard(employee.employeeId);
                                                }
                                            }}
                                            style={{ transformStyle: 'preserve-3d' }}
                                        >
                                            {/* Front Card */}
                                            <div
                                                className={`absolute inset-0 w-full h-full rounded-xl shadow-lg border cursor-pointer group backface-hidden transform-gpu transition-all duration-300 hover:shadow-xl ${
                                                    theme === 'dark'
                                                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50'
                                                        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-400/50'
                                                } hover:scale-105`}
                                                style={{ backfaceVisibility: 'hidden' }}
                                            >
                                               <div className="flex flex-col h-full p-3 sm:p-4 relative overflow-hidden">
                                                    {/* Background decoration */}
                                                    <div className="absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none">
                                                        <div className={`w-full h-full rounded-full ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'} transform translate-x-8 -translate-y-8`}></div>
                                                    </div>

                                                    {/* Profile Image Section */}
                                                    <div className="flex flex-col items-center text-center mb-3 z-10">
                                                        <div className="relative mb-2">
                                                            {employee.employeeImage ? (
                                                                <div className="relative">
                                                                    <img
                                                                        src={employee.employeeImage}
                                                                        alt={`${employee.displayName}'s profile picture`}
                                                                        className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover border-3 border-blue-400 shadow-lg group-hover:border-blue-500 transition-all duration-300 transform group-hover:scale-105"
                                                                    />
                                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                                                                </div>
                                                            ) : (
                                                                <div className="relative">
                                                                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm sm:text-lg font-bold shadow-lg group-hover:from-blue-600 group-hover:via-indigo-600 group-hover:to-purple-700 transition-all duration-300 transform group-hover:scale-105">
                                                                        {generateInitials(employee.displayName)}
                                                                    </div>
                                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Name and Job Title */}
                                                        <div className="w-full px-1">
                                                            <h3 className={`text-sm sm:text-base font-bold mb-1 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                                {employee.displayName}
                                                            </h3>
                                                            <p className={`text-xs font-semibold px-2 py-0.5 rounded-full truncate ${theme === 'dark' ? 'text-blue-300 bg-blue-900/40' : 'text-blue-700 bg-blue-100'}`}>
                                                                {employee.jobTitlePrimary || "Not Updated Job Title"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Employee Details Section - Fixed height container */}
                                                    <div className="flex-1 flex flex-col justify-end min-h-0">
                                                        <div className="space-y-1.5 px-1">
                                                            {/* Employee ID */}
                                                            <div className={`flex items-center space-x-2 p-1.5 rounded-lg overflow-hidden ${
                                                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                                            }`}>
                                                                <IoIdCardOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                                                                <span className="truncate font-mono text-xs min-w-0">{employee.employeeId}</span>
                                                            </div>

                                                            {/* Department */}
                                                            <div className={`flex items-center space-x-2 p-1.5 rounded-lg overflow-hidden ${
                                                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                                            }`}>
                                                                <IoBriefcaseOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                                                                <span className="truncate text-xs min-w-0">{employee.departmentId || 'N/A'}</span>
                                                            </div>

                                                            {/* Location */}
                                                            <div className={`flex items-center space-x-2 p-1.5 rounded-lg overflow-hidden ${
                                                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                                            }`}>
                                                                <IoLocationOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                                                                <span className="truncate text-xs min-w-0">{employee.location || 'N/A'}</span>
                                                            </div>

                                                            {/* Email */}
                                                            <div className={`flex items-center space-x-2 p-1.5 rounded-lg overflow-hidden ${
                                                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                                            }`}>
                                                                <IoMailOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
                                                                <span className="truncate text-xs min-w-0" title={employee.workEmail || 'N/A'}>
                                                                    {employee.workEmail || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Back Card */}
                                            <div
                                                className={`absolute inset-0 w-full h-full rounded-xl shadow-lg border backface-hidden rotate-y-180 ${
                                                    theme === 'dark'
                                                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                                                        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
                                                }`}
                                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                            >
                                                <div className="flex flex-col items-center justify-center h-full space-y-2 sm:space-y-3 p-4 sm:p-5">
                                                    <div className="text-center mb-3 sm:mb-4">
                                                        <h3 className={`text-base sm:text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                            Quick Actions
                                                        </h3>
                                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {employee.displayName}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-1 sm:space-y-2 w-full max-w-xs">
                                                         <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleChatClick(employee);
                                                            }}
                                                            className={`px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-blue-500/30 text-xs sm:text-sm w-full flex items-center justify-center space-x-2`}
                                                        >
                                                            <IoChatbubbleOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="font-medium">Start Chat</span>
                                                        </button>

                                                        {matchedArray && matchedArray.includes("GET_PUBLIC") && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewProfileClick(employee);
                                                                }}
                                                                className={`px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-green-500/30 text-xs sm:text-sm w-full flex items-center justify-center space-x-2`}
                                                            >
                                                                <IoPersonOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                <span className="font-medium">View Profile</span>
                                                            </button>
                                                        )}

                                                        { matchedArray && matchedArray.includes("EMPLOYEE_VIEW_DOCS") &&
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDocumentsClick(employee);
                                                                }}
                                                                className={`px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-yellow-500/30 text-xs sm:text-sm w-full flex items-center justify-center space-x-2`}
                                                            >
                                                                <IoDocumentsOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                <span className="font-medium">Documents</span>
                                                            </button>
                                                        }

                                                        { matchedArray && matchedArray.includes("VIEW_TEAM") &&
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewTeamsClick(employee);
                                                                }}
                                                                className={`px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-teal-500/30 text-xs sm:text-sm w-full flex items-center justify-center space-x-2`}
                                                            >
                                                                <IoPeopleOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                <span className="font-medium">View Teams</span>
                                                            </button>
                                                        }

                                                         { hasAccess.includes("DELETE_USER") && ( // Check permission
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClick(employee);
                                                                }}
                                                                className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 text-xs sm:text-sm w-full flex items-center justify-center space-x-2"
                                                            >
                                                                <IoTrashOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                <span className="font-medium">Terminate Employee</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // List View Item
                                        <motion.div
                                            whileHover={{ scale: 1.02, x: 10 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`rounded-xl p-3 sm:p-4 shadow-lg border cursor-pointer group transition-all duration-300 hover:shadow-xl ${
                                                theme === 'dark'
                                                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50'
                                                    : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:border-blue-400/50'
                                            }`}
                                            onClick={() => navigate(`/employees/${empID}/public/${employee.employeeId}`)}
                                        >
                                            <div className="flex items-center space-x-3 sm:space-x-4 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 opacity-10 pointer-events-none">
                                                    <div className={`w-full h-full rounded-full ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'} transform translate-x-8 sm:translate-x-10 -translate-y-8 sm:-translate-y-10`}></div>
                                                </div>

                                                <div className="flex-shrink-0 relative z-10">
                                                    {employee.employeeImage ? (
                                                        <div className="relative">
                                                            <img
                                                                src={employee.employeeImage}
                                                                alt={`${employee.displayName}'s profile picture`}
                                                                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover border-4 border-blue-200 shadow-lg group-hover:border-blue-400 transition-all duration-300 transform group-hover:scale-110"
                                                            />
                                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg group-hover:from-blue-600 group-hover:via-indigo-600 group-hover:to-purple-700 transition-all duration-300 transform group-hover:scale-110">
                                                                {generateInitials(employee.displayName)}
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 z-10">
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                                        <div className="min-w-0 flex-1 mb-2 sm:mb-0">
                                                            <h3 className={`text-sm sm:text-lg font-bold truncate mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                                {employee.displayName}
                                                            </h3>
                                                            <p className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${theme === 'dark' ? 'text-blue-300 bg-blue-900/40' : 'text-blue-700 bg-blue-100'}`}>
                                                                {employee.jobTitlePrimary || "Not Updated"}
                                                            </p>
                                                        </div>

                                                        {/* Quick Action Buttons for List View */}
                                                        <div className="flex items-center space-x-1 sm:space-x-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleChatClick(employee); }}
                                                                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white shadow-md hover:shadow-lg`}
                                                                title="Start Chat"
                                                            > <IoChatbubbleOutline className="w-3 h-3 sm:w-4 sm:h-4" /> </button>

                                                            {matchedArray && matchedArray.includes("GET_PUBLIC") && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleViewProfileClick(employee); }}
                                                                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white shadow-md hover:shadow-lg`}
                                                                title="View Profile"
                                                            > <IoPersonOutline className="w-3 h-3 sm:w-4 sm:h-4" /> </button>
                                                             )}
                                                             {matchedArray && matchedArray.includes("EMPLOYEE_VIEW_DOCS") && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDocumentsClick(employee); }}
                                                                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${theme === 'dark' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white shadow-md hover:shadow-lg`}
                                                                title="Documents"
                                                            > <IoDocumentsOutline className="w-3 h-3 sm:w-4 sm:h-4" /> </button>
                                                             )}
                                                            {/* Add Delete Button with permission check if needed */}
                                                             {hasAccess.includes("DELETE_USER") && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(employee); }}
                                                                    className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 transform hover:scale-110 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg`}
                                                                    title="Terminate Employee"
                                                                > <IoTrashOutline className="w-3 h-3 sm:w-4 sm:h-4" /> </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-2 text-xs mt-2">
                                                         <div className={`flex items-center space-x-1 p-1 sm:p-1.5 rounded-md overflow-hidden ${ theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600' }`}>
                                                            <IoIdCardOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                                                            <span className="truncate font-mono text-xs">{employee.employeeId}</span>
                                                        </div>
                                                        <div className={`flex items-center space-x-1 p-1 sm:p-1.5 rounded-md overflow-hidden ${ theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600' }`}>
                                                            <IoBriefcaseOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                                                            <span className="truncate">{employee.departmentId || 'N/A'}</span>
                                                        </div>
                                                        <div className={`flex items-center space-x-1 p-1 sm:p-1.5 rounded-md overflow-hidden ${ theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600' }`}>
                                                            <IoLocationOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                                                            <span className="truncate">{employee.location || 'N/A'}</span>
                                                        </div>
                                                        <div className={`flex items-center space-x-1 p-1 sm:p-1.5 rounded-md overflow-hidden ${ theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600' }`}>
                                                            <IoMailOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
                                                            <span className="truncate text-xs" title={employee.workEmail || 'N/A'}>{employee.workEmail || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Pagination Controls */}
                 <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 gap-4 mx-4 sm:mx-0">
                    <button
                        onClick={() => setPageNumber(prev => Math.max(0, prev - 1))}
                        disabled={pageNumber === 0}
                        className={`flex items-center space-x-2 px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm transition-all duration-200 ${
                            theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <IoArrowBack className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Previous</span>
                    </button>

                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Page {pageNumber + 1}
                        </span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(parseInt(e.target.value));
                                setPageNumber(0); // Reset to first page on size change
                            }}
                            className={`px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg text-xs sm:text-sm ${
                                theme === 'dark'
                                    ? 'bg-gray-700 text-white border-gray-600'
                                    : 'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                        >
                            <option value="15">15 per page</option>
                            <option value="30">30 per page</option>
                            <option value="50">50 per page</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setPageNumber(prev => prev + 1)}
                        disabled={filteredEmployees.length < pageSize} // Disable if fewer results than page size
                        className={`flex items-center space-x-2 px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm transition-all duration-200 ${
                            theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`} // Style disabled button
                    >
                         <span>{filteredEmployees.length < pageSize ? 'Last Page' : 'Next'}</span>
                            {filteredEmployees.length < pageSize ? (
                                <IoLockClosed className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                                <IoArrowForward className="w-3 h-3 sm:w-4 sm:h-4" />
                         )}
                    </button>
                </div>
            </div>

            {/* Modals */}
            {isTerminatedEmployeesModalOpen && renderTerminatedEmployeesModal()}

            {popup.show && (
                <Modal
                    onClose={() => setPopup({ show: false, message: '', type: '' })}
                    title={popup.type === 'success' ? 'Success' : 'Error'}
                    type={popup.type}
                    theme={theme}
                >
                    <p className={`mb-4 sm:mb-6 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{popup.message}</p>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setPopup({ show: false, message: '', type: '' })}
                            className={`${popup.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm`}
                        >
                            OK
                        </button>
                    </div>
                </Modal>
            )}

            {deleteConfirmation.show && (
                <Modal
                    onClose={() => setDeleteConfirmation({ show: false, employee: null })}
                    title="Confirm Termination"
                    type="confirm"
                    theme={theme}
                >
                    <p className={`mb-4 sm:mb-6 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Are you sure you want to Terminate employee <strong>{deleteConfirmation.employee?.displayName}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                        <button
                            onClick={() => setDeleteConfirmation({ show: false, employee: null })}
                            className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold transition-colors text-sm ${
                                theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="w-full sm:w-auto px-6 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors text-sm"
                        >
                            Terminate
                        </button>
                    </div>
                </Modal>
            )}

            {/* Custom styles for animations */}
             <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideIn { from { transform: translateX(-10px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-slideUp { animation: slideUp 0.4s ease-out; }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
                /* Ensure spin is defined if used */
                 @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}

export default EmployeeApp;