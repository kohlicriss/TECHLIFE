import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from '../HrmsContext';
import { authApi, publicinfoApi, payrollApi, payroll, attendanceApi } from '../../../../axiosInstance'; // ADDED attendanceApi
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-[1000]">
            <div className={`w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl ${
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
                                className={`ml-auto p-1 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
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

    const baseInputClass = `w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
        isError
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
            : theme === 'dark'
            ? 'border-gray-600 bg-gray-700 text-white'
            : 'border-gray-200 bg-white'
    } disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 disabled:cursor-not-allowed`;

    const textareaClass = `w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl resize-none h-24 sm:h-32 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
        isError
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
            : theme === 'dark'
            ? 'border-gray-600 bg-gray-700 text-white'
            : 'border-gray-200 bg-white'
    } disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:disabled:text-gray-400 disabled:cursor-not-allowed`;

    const selectClass = `w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl appearance-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
        isError
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
            : theme === 'dark'
            ? 'border-gray-600 bg-gray-700 text-white'
            : 'border-gray-200 bg-white'
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
                <div className={`relative border-2 border-dashed rounded-lg sm:rounded-xl ${
                    isError
                        ? 'border-red-300 bg-red-50'
                        : theme === 'dark'
                        ? 'border-gray-600 bg-gray-800'
                        : 'border-gray-300 bg-gray-50'
                } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
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
                    disabled={disabled}
                />
            )}

            {isError && (
                <div className="mt-2 sm:mt-3 flex items-center space-x-2 text-red-600">
                    <IoWarning className="w-4 h-4 flex-shrink-0" />
                    <p className="text-xs sm:text-sm font-medium">{isError}</p>
                </div>
            )}
        </div>
    );
};

// --- Field Definitions (UPDATED with Step 4) ---
const credentialsFormFields = [
    { label: "Full Name", name: "fullName", type: "text", required: true, hint: "Enter the full name for the user account." },
    { label: "Username", name: "username", type: "text", required: true, hint: "Must start with 'ACS' and match Employee ID (8-30 chars).", maxLength: 30 },
    { label: "Password", name: "password", type: "password", required: true, hint: "Temporary password (8-30 characters).", maxLength: 30 },
    { label: "Role", name: "role", type: "select", required: true, options: ["ROLE_HR", "ROLE_MANAGER", "ROLE_EMPLOYEE", "ROLE_ADMIN", "ROLE_TEAM_LEAD"], hint: "Select the role for the user account." },
];

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
        disabled: true
    },
];

const payrollFormFields = [
    { label: "Employee Name", name: "empNameDisplay", type: "text", required: true, hint: "Auto-filled from Employee Form.", disabled: true },
    { label: "Employee ID", name: "employeeIdDisplay", type: "text", required: true, hint: "Auto-filled from Employee Form.", disabled: true },
    { label: "Email", name: "email", type: "email", required: true, hint: "Employee email address." },
    { label: "Phone Number", name: "phoneNumber", type: "text", required: false, hint: "Contact phone number." },
    { label: "Annual Salary", name: "annualSalary", type: "number", required: true, hint: "Annual salary amount." },
    { label: "Account Number", name: "accountNumber", type: "text", required: true, hint: "Bank account number." },
    { label: "IFSC Code", name: "ifsccode", type: "text", required: true, hint: "IFSC code for bank." },
    { label: "Bank Name", name: "bankName", type: "text", required: true, hint: "Name of the bank." },
    { label: "PF Number", name: "pfnum", type: "text", required: false, hint: "Provident Fund number." },
    { label: "PAN Number", name: "panNumber", type: "text", required: true, hint: "Permanent Account Number." },
    { label: "Aadhar Number", name: "aadharNumber", type: "text", required: true, hint: "Aadhar ID number." },
    { label: "UAN Number", name: "uanNumber", type: "text", required: false, hint: "Universal Account Number." },
    // CHANGED: Department is now a DepartmentDropdown (same as Step 2)
    { label: "Department", name: "department", type: "department-dropdown", required: true, hint: "Select department from the list." },
    { label: "Designation", name: "designation", type: "text", required: true, hint: "Job designation." },
    // UPDATED: Added 'Intern' option
    { label: "Job Type", name: "JobType", type: "select", required: true, options: ["Full-time", "Part-time", "Contract", "Temporary", "Intern"], hint: "Select job type." },
    // CHANGED: Level is now a dropdown
    { label: "Level", name: "Level", type: "select", required: true, options: ["Senior", "Junior", "Medium"], hint: "Select job level." },
    { label: "Start Date", name: "startDate", type: "date", required: true, hint: "Employment start date." },
];

// NEW: Step 4 Fields (Leaves/Attendance)
const leavesFormFields = [
    { label: "Employee ID", name: "employeeIdDisplay4", type: "text", required: true, hint: "Auto-filled.", disabled: true },
    { label: "Shift Name", name: "shiftName", type: "text", required: true, hint: "E.g., Morning Shift, General Shift." },
    { label: "Month", name: "month", type: "number", required: true, hint: "1 (Jan) to 12 (Dec).", min: 1, max: 12 },
    { label: "Year", name: "year", type: "number", required: true, hint: "E.g., 2024.", min: 2020 },
    { label: "Paid Leaves", name: "paid", type: "number", required: true, hint: "Total paid leave days.", min: 0 },
    { label: "Sick Leaves", name: "sick", type: "number", required: true, hint: "Total sick leave days.", min: 0 },
    { label: "Casual Leaves", name: "casual", type: "number", required: true, hint: "Total casual leave days.", min: 0 },
    { label: "Unpaid Leaves", name: "unpaid", type: "number", required: true, hint: "Total unpaid leave days.", min: 0 },
    // ADDED: Visible and Disabled with Default values
    { name: "latitude", type: "text", label: "Latitude", required: true, disabled: true, hint: "Auto-filled from location." },
    { name: "longitude", type: "text", label: "Longitude", required: true, disabled: true, hint: "Auto-filled from location." },
    { name: "timezone", type: "text", label: "Timezone", required: true, disabled: true, hint: "Auto-filled ('Asia/Kolkata')." },
];

const generateInitials = (name) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
};

// --- Department Dropdown Component (Needed for both Step 2 and Step 3) ---
const DepartmentDropdown = ({ value, onChange, theme, isError, hint, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    // Use local search term for the dropdown component
    const [localSearchTerm, setLocalSearchTerm] = useState('');
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
        if (!localSearchTerm) return true;
        const searchLower = localSearchTerm.toLowerCase();
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
                Department
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
                    className={`w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-left focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                        ${isError
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                            : theme === 'dark'
                            ? 'border-gray-600 bg-gray-700 text-white'
                            : 'border-gray-200 bg-white'
                        }`}
                >
                    <span className={value ? '' : 'text-gray-500'}>
                        {getDisplayText()}
                    </span>
                </button>

                <div className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <IoChevronDownOutline className={`w-4 h-4 sm:w-5 sm:h-5 ${
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
                                    value={localSearchTerm}
                                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
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
                                            // Pass the name of the form field being updated ('departmentId' or 'department')
                                            onChange(dept.departmentId, name); 
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm ${
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
                                    {localSearchTerm ? 'No departments found matching your search.' : 'No departments available.'}
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
                                <div className="text-center py-2 text-xs text-gray-500 dark:text-gray-500">
                                    — End of results ({departments.length} departments) —
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isError && (
                <div className="mt-2 sm:mt-3 flex items-center space-x-2 text-red-600">
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
    // FIXED: Corrected redundant declarations to ensure unique setters
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

    // Multi-step form states
    // FIXED: Used a unique setter for this state
    const [terminatedSearchTerm, setTerminatedSearchTerm] = useState(''); 
    const [currentStep, setCurrentStep] = useState(1); // 1: Credentials, 2: Employee, 3: Payroll, 4: Leaves (NEW)

    // NEW: Function to get current location
    const getCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    
                    setFormData(prev => ({
                        ...prev,
                        latitude: latitude,
                        longitude: longitude,
                        // Timezone is set initially via initialFormData, but updated here if available/necessary
                        // Keeping it explicitly set for the DTO requirement
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
                    }));
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    // Default to 0, 0 if permission is denied or location is unavailable
                    setFormData(prev => ({ ...prev, latitude: 0, longitude: 0 }));
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            setFormData(prev => ({ ...prev, latitude: 0, longitude: 0 }));
        }
    }, []);


    const initialFormData = {
        // User Credentials
        fullName: '',
        username: '',
        password: '',
        role: '',
        // Employee Information
        employeeId: '',
        firstName: '',
        displayName: '',
        maritalStatus: '',
        departmentId: '',
        employeeRole: '',
        // Payroll/Job Details
        empNameDisplay: '',
        employeeIdDisplay: '',
        email: '',
        phoneNumber: '',
        annualSalary: '',
        accountNumber: '',
        ifsccode: '',
        bankName: '',
        pfnum: '',
        panNumber: '',
        aadharNumber: '',
        uanNumber: '',
        department: '',
        designation: '',
        JobType: 'Full-time', // Default to existing option
        Level: 'Junior', // Default to an option
        startDate: '',
        empName: '',
        // NEW LEAVES FIELDS (Step 4)
        employeeIdDisplay4: '',
        month: new Date().getMonth() + 1, 
        year: new Date().getFullYear(), 
        paid: 0,
        sick: 0,
        casual: 0,
        unpaid: 0,
        shiftName: '',
        // These will be overridden by getCurrentLocation in useEffect
        latitude: 0, 
        longitude: 0, 
        timezone: 'Asia/Kolkata', 
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
    const terminatedScrollRef = useRef(null);
    const [hasAccess, setHasAccess] = useState([]);

    const TERMINATED_PAGE_SIZE = 15;

    const userRole = userData?.roles?.[0]?.toUpperCase();
    const hasManagementAccess = ['ADMIN', 'MANAGER', 'HR'].includes(userRole);

    // useEffect to fetch Geolocation on mount/when modal opens
    useEffect(() => {
        if (isAddEmployeeModalOpen) {
            getCurrentLocation();
        }
    }, [isAddEmployeeModalOpen, getCurrentLocation]);


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

    const handlePayRollClick = (employee) => {
        if (employee) {
            navigate(`/payroll/employee/${employee.employeeId}`);
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
            await publicinfoApi.delete(`employee/${employee.employeeId}`);
            await authApi.delete(`delete/${employeeIdToDelete}`);

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

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const updatedData = { ...prev, [name]: value };

            if (name === 'fullName') {
                updatedData.firstName = value.split(' ')[0] || '';
                updatedData.displayName = value;
                updatedData.empName = value;
                updatedData.empNameDisplay = value;
            }

            if (name === 'employeeId') {
                updatedData.employeeIdDisplay = value;
                updatedData.employeeIdDisplay4 = value; // NEW: Update for step 4
            }

            if (name === 'role') {
                updatedData.employeeRole = value;
            }

            // Ensure numeric fields are stored as numbers if possible, especially for leaves
            if (['month', 'year', 'paid', 'sick', 'casual', 'unpaid', 'annualSalary', 'latitude', 'longitude'].includes(name)) {
                // Parse float for all numeric fields (including the new latitude/longitude)
                updatedData[name] = value === '' ? '' : (name === 'month' || name === 'year' ? parseInt(value) : parseFloat(value));
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

    const handleDepartmentChange = (value, name) => {
        // This handler is used by the DepartmentDropdown which passes the name of the DTO field being updated.
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear validation errors for both department fields in Step 2 and Step 3
        if (formErrors.departmentId || formErrors.department) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.departmentId;
                delete newErrors.department;
                return newErrors;
            });
        }
    };

    const handleBlurValidation = (e) => {
        // Validation on blur is kept to provide instant feedback for the user
        const { name, value } = e.target;
        let error = '';

        // Strict validation rules (kept as per previous requirement)
        if (name === 'fullName') {
            if (!value.trim()) {
                error = "Full name is required.";
            } else if (value.trim().length < 2) {
                error = "Full name must be at least 2 characters.";
            } else if (!/^[a-zA-Z\s\'-]+$/.test(value)) {
                error = "Full name can only contain letters, spaces, hyphens, and apostrophes.";
            }
        }

        if (name === 'username' || name === 'employeeId') {
            if (value && !value.startsWith('ACS')) {
                error = "Incorrect format. Must start with 'ACS'.";
            } else if (value && (value.length < 8 || value.length > 30)) {
                error = "Must be between 8 and 30 characters.";
            } else if (value && !/^[A-Z0-9_]+$/.test(value)) {
                error = "Can only contain uppercase letters, numbers, and underscores.";
            }
        }

        if (name === 'password') {
            if (value && (value.length < 8 || value.length > 30)) {
                error = "Password must be 8-30 characters.";
            } else if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                error = "Password must contain uppercase, lowercase, and numbers.";
            }
        }

        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                error = "Invalid email format.";
            }
        }

        if (name === 'annualSalary') {
            if (value && (isNaN(value) || parseFloat(value) <= 0)) {
                error = "Annual salary must be a positive number.";
            }
        }

        if (name === 'panNumber') {
            if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
                error = "Invalid PAN format (e.g., ABCDE1234F).";
            }
        }

        if (name === 'aadharNumber') {
            if (value && (!/^[0-9]{12}$/.test(value))) {
                error = "Aadhar must be 12 digits.";
            }
        }

        if (name === 'phoneNumber') {
            if (value && (!/^[0-9]{10}$/.test(value))) {
                error = "Phone number must be 10 digits.";
            }
        }
        
        // NEW LEAVES/ATTENDANCE VALIDATION (Step 4)
        if (name === 'month') {
            const month = parseInt(value);
            if (value && (isNaN(month) || month < 1 || month > 12)) error = "Month must be between 1 and 12.";
        }
        if (name === 'year') {
            const year = parseInt(value);
            if (value && (isNaN(year) || year < 2020 || year > new Date().getFullYear() + 1)) error = "Invalid year.";
        }
        if (['paid', 'sick', 'casual', 'unpaid'].includes(name)) {
            const leaves = parseFloat(value);
            if (value && (isNaN(leaves) || leaves < 0)) error = "Leave days must be zero or a positive number.";
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

    /**
     * Executes ALL validation rules for a specific step (1, 2, or 3, 4)
     */
    const validateStep = (step) => {
        const errors = {};
        let fieldsToValidate = [];

        if (step === 1) {
            fieldsToValidate = [...credentialsFormFields.map(f => f.name)];
        } else if (step === 2) {
            fieldsToValidate = [...employeeFormFields.map(f => f.name).filter(name => name !== 'employeeRole')];
        } else if (step === 3) {
            fieldsToValidate = [...payrollFormFields.map(f => f.name).filter(name => !name.endsWith('Display'))];
        } else if (step === 4) { // NEW STEP 4
            // FIXED: Filtering the leavesFormFields array to get non-hidden and non-display field names for validation
            fieldsToValidate = leavesFormFields
                .filter(f => !f.hidden && !f.name.endsWith('Display4'))
                .map(f => f.name);
             // Also include the hidden fields for DTO validation if they are technically required, even if auto-filled (latitude, longitude, timezone)
             // We include them here just in case validation logic needs to check their formatted (numeric/string) state.
             fieldsToValidate.push('latitude', 'longitude', 'timezone');
        }

        const runValidation = (name, value, required = false) => {
            if (required && (!value && value !== 0 && value !== '0')) { // Check if value is truly empty for required fields
                return `${name} is required.`;
            }
            // All specific validation logic from handleBlurValidation is duplicated here for submission checks
            if (name === 'fullName') {
                if (value && value.trim().length < 2) return "Full name must be at least 2 characters.";
                if (value && !/^[a-zA-Z\s\'-]+$/.test(value)) return "Full name can only contain letters, spaces, hyphens, and apostrophes.";
            }
            if (name === 'username' || name === 'employeeId') {
                if (value && !value.startsWith('ACS')) return "Incorrect format. Must start with 'ACS'.";
                if (value && (value.length < 8 || value.length > 30)) return "Must be between 8 and 30 characters.";
                if (value && !/^[A-Z0-9_]+$/.test(value)) return "Can only contain uppercase letters, numbers, and underscores.";
            }
            if (name === 'password') {
                if (value && (value.length < 8 || value.length > 30)) return "Password must be 8-30 characters.";
                if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return "Password must contain uppercase, lowercase, and numbers.";
            }
            if (name === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) return "Invalid email format.";
            }
            if (name === 'annualSalary') {
                if (value && (isNaN(parseFloat(value)) || parseFloat(value) <= 0)) return "Annual salary must be a positive number.";
            }
            if (name === 'accountNumber') {
                if (value && value.length < 10) return "Account number must be at least 10 digits.";
            }
            if (name === 'ifsccode') {
                if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) return "Invalid IFSC format.";
            }
            if (name === 'panNumber') {
                if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) return "Invalid PAN format (e.g., ABCDE1234F).";
            }
            if (name === 'aadharNumber') {
                if (value && (!/^[0-9]{12}$/.test(value))) return "Aadhar must be 12 digits.";
            }
            if (name === 'phoneNumber') {
                if (value && (!/^[0-9]{10}$/.test(value))) return "Phone number must be 10 digits.";
            }

            // NEW LEAVES/ATTENDANCE VALIDATION (Step 4)
            if (name === 'month') {
                const month = parseInt(value);
                if (value && (isNaN(month) || month < 1 || month > 12)) return "Month must be between 1 and 12.";
            }
            if (name === 'year') {
                const year = parseInt(value);
                if (value && (isNaN(year) || year < 2020 || year > new Date().getFullYear() + 1)) return "Invalid year.";
            }
            if (['paid', 'sick', 'casual', 'unpaid'].includes(name)) {
                const leaves = parseFloat(value);
                if ((value !== '' && value !== null) && (isNaN(leaves) || leaves < 0)) return "Leave days must be zero or a positive number.";
            }
            
            if (name === 'shiftName') {
                if (!value.trim()) return "Shift Name is required.";
            }

            // Additional check for auto-filled location fields
            if ((name === 'latitude' || name === 'longitude') && isNaN(parseFloat(value))) {
                 return `${name} must be a valid number (auto-filled).`;
            }
            if (name === 'timezone' && !value) {
                return "Timezone is required (auto-filled).";
            }

            return '';
        };

        const allFields = [...credentialsFormFields, ...employeeFormFields, ...payrollFormFields, ...leavesFormFields].filter(f => !f.disabled);

        fieldsToValidate.forEach(name => {
            const field = allFields.find(f => f.name === name);
            // Treat auto-filled fields as required if they should be in the DTO
            const requiredCheck = field?.required || ['latitude', 'longitude', 'timezone'].includes(name); 
            const value = formData[name];
            const error = runValidation(name, value, requiredCheck);
            if (error) {
                errors[name] = error;
            }
        });

        // Cross-field validation (only applies if both fields are non-empty)
        if (formData.username && formData.employeeId && formData.username !== formData.employeeId) {
            errors.employeeId = "Employee ID must match Username from Step 1.";
        }
        
        return errors;
    };

    /**
     * Handles navigation when clicking the "Next" button.
     */
    const handleNextStep = async () => {
        // Auto-fill Employee ID if moving from Step 1 to Step 2
        if (currentStep === 1) {
             // Autopopulate Employee ID if username is filled and employeeId is empty
            if (formData.username && !formData.employeeId) {
                setFormData(prev => ({
                    ...prev,
                    employeeId: prev.username,
                    employeeIdDisplay: prev.username,
                    employeeIdDisplay4: prev.username, // NEW: Update for step 4
                }));
            }
        }
        
        setCurrentStep(prev => prev + 1);
    };

    /**
     * @description Enables direct jumping to any step without validation checks on forward movement.
     * @param {number} stepNumber - The target step number.
     */
    const handleStepClick = (stepNumber) => {
        setFormErrors({});
        setCurrentStep(stepNumber);
        
        // Auto-fill Employee ID if the user jumps to step 2 or 3 or 4 while on step 1
        if (stepNumber > 1 && currentStep === 1 && formData.username && !formData.employeeId) {
            setFormData(prev => ({
                ...prev,
                employeeId: prev.username,
                employeeIdDisplay: prev.username,
                employeeIdDisplay4: prev.username, // NEW: Update for step 4
            }));
        }
    }

    const handlePreviousStep = () => {
        setCurrentStep(prev => prev - 1);
        setFormErrors({});
    };

    const fetchTerminatedEmployeeIds = async () => {
        // This is still needed for the final submission check only.
        let allIds = new Set();
        let page = 0;
        let hasMorePages = true;
        const pageSize = 1000;

        while (hasMorePages) {
            try {
                const response = await publicinfoApi.get(`employee/${page}/${pageSize}/employeeId/asc/terminated/employees`);
                const newEmployees = response.data.content || [];

                newEmployees.forEach(emp => {
                    if (emp.employeeId) {
                        allIds.add(emp.employeeId);
                    }
                });

                if (newEmployees.length < pageSize || response.data.last === true) {
                    hasMorePages = false;
                } else {
                    page++;
                }
            } catch (error) {
                console.error("Error fetching all terminated employee IDs:", error);
                hasMorePages = false;
            }
        }
        return allIds;
    };

    /**
     * Handles the final form submission. Runs validation for ALL steps.
     */
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        let allErrors = {};

        // Run validation for ALL four steps here
        const step1Errors = validateStep(1);
        const step2Errors = validateStep(2);
        const step3Errors = validateStep(3);
        const step4Errors = validateStep(4); // NEW STEP 4 VALIDATION

        allErrors = { ...step1Errors, ...step2Errors, ...step3Errors, ...step4Errors }; // COMBINE ALL ERRORS

        // Additional check for terminated IDs (must be done on final submit)
        if (Object.keys(allErrors).length === 0) {
            const terminatedIds = await fetchTerminatedEmployeeIds();
            const idToCheck = formData.employeeId || formData.username;

            if (terminatedIds.has(idToCheck)) {
                allErrors.employeeId = "ID already in use by a terminated employee.";
                setPopup({ show: true, message: `Employee ID ${idToCheck} is already in use.`, type: 'error' });
                setCurrentStep(2); // Jump back to the affected step
            }
        }

        if (Object.keys(allErrors).length > 0) {
            setFormErrors(allErrors);
            // Optional: Jump to the first step with an error for better UX
            if (Object.keys(step1Errors).length > 0) setCurrentStep(1);
            else if (Object.keys(step2Errors).length > 0) setCurrentStep(2);
            else if (Object.keys(step3Errors).length > 0) setCurrentStep(3);
            else if (Object.keys(step4Errors).length > 0) setCurrentStep(4); // NEW STEP 4 JUMP

            return;
        }

        // --- SUBMISSION LOGIC (Only runs if NO errors found) ---
        setIsUpdating(true);
        setFormErrors({});
        setSubmissionStatus('Creating User...');

        try {
            // Step 1: Create User Credentials
            const credentialsDto = {
                fullName: formData.fullName,
                username: formData.username,
                password: formData.password,
                role: formData.role.toUpperCase(),
            };

            await authApi.post("/register", credentialsDto);

            // Step 2: Create Employee
            setSubmissionStatus('Creating Employee...');
            const employeeDto = {
                employeeId: formData.employeeId,
                firstName: formData.firstName,
                displayName: formData.displayName || formData.fullName,
                maritalStatus: formData.maritalStatus,
                departmentId: formData.departmentId,
                role: formData.role.toUpperCase(),
            };

            await publicinfoApi.post('employee', employeeDto);

            // Step 3: Create Payroll/Job Details
            setSubmissionStatus('Creating Payroll Details...');
            const payrollDto = {
                employeeId: formData.employeeId,
                empName: formData.empName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                annualSalary: parseFloat(formData.annualSalary),
                accountNumber: formData.accountNumber,
                ifsccode: formData.ifsccode,
                bankName: formData.bankName,
                pfnum: formData.pfnum,
                panNumber: formData.panNumber,
                aadharNumber: formData.aadharNumber,
                uanNumber: formData.uanNumber,
                department: formData.department,
                designation: formData.designation,
                JobType: formData.JobType,
                Level: formData.Level,
                startDate: formData.startDate,
            };
            // Ensure numeric fields are correctly formatted before post
            payrollDto.annualSalary = parseFloat(payrollDto.annualSalary);


            await payroll.post('payroll/jobdetails/create', payrollDto);
            
            // Step 4: Add Personal Leave/Attendance Details (NEW)
            setSubmissionStatus('Adding Leave/Attendance Details...');
            
            const leavesDto = {
                employeeId: formData.employeeId,
                month: formData.month,
                year: formData.year,
                paid: formData.paid,
                sick: formData.sick,
                casual: formData.casual,
                unpaid: formData.unpaid,
                shiftName: formData.shiftName,
                latitude: formData.latitude,
                longitude: formData.longitude,
                timezone: formData.timezone,
            };
            
            // Ensure numeric fields are correctly formatted before post
            leavesDto.month = parseInt(leavesDto.month);
            leavesDto.year = parseInt(leavesDto.year);
            leavesDto.paid = parseFloat(leavesDto.paid);
            leavesDto.sick = parseFloat(leavesDto.sick);
            leavesDto.casual = parseFloat(leavesDto.casual);
            leavesDto.unpaid = parseFloat(leavesDto.unpaid);
            leavesDto.latitude = parseFloat(leavesDto.latitude);
            leavesDto.longitude = parseFloat(leavesDto.longitude);
            
            // Using attendanceApi and required endpoint
            await attendanceApi.post('personalleaves/add', leavesDto); 

            setPopup({ show: true, message: 'Employee onboarding completed successfully!', type: 'success' });
            setIsAddEmployeeModalOpen(false);
            setFormData(initialFormData);
            setCurrentStep(1);
            fetchAllEmployees();

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
        setCurrentStep(1);
    };

    /**
     * New handler to print ONLY the fourth form's specific payload to the console
     */
    const handlePrintPayload = () => {
        const payload = {
            employeeId: formData.employeeId,
            month: formData.month,
            year: formData.year,
            paid: formData.paid,
            sick: formData.sick,
            casual: formData.casual,
            unpaid: formData.unpaid,
            shiftName: formData.shiftName,
            latitude: formData.latitude,
            longitude: formData.longitude,
            timezone: formData.timezone,
        };

        console.log("--- DEBUG: Leaves/Attendance Payload ---");
        console.log(JSON.stringify(payload, null, 2));
        console.log("---------------------------------------------------------");
        setPopup({ show: true, message: "Leaves/Attendance payload printed to console for debugging.", type: 'default' });
    };

    const renderField = (field, currentErrors, handleChange, fieldValue) => {
        const { label, name, type, required, options = [], hint, maxLength, disabled = false, hidden = false } = field;
        const isError = currentErrors[name];

        if (hidden) return null; // Skip rendering for hidden fields

        // Use DepartmentDropdown component for Department fields (in Step 2 and Step 3)
        if (type === 'department-dropdown') {
            const currentOnChange = (value) => handleDepartmentChange(value, name);
            const departmentValue = formData[name]; // Get the value from the respective state field (departmentId or department)
            
            return (
                <DepartmentDropdown
                    key={name}
                    name={name}
                    value={departmentValue}
                    onChange={currentOnChange} 
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
                onChange={handleFormChange} 
                onBlur={handleBlurValidation} 
                isError={isError}
                options={options}
                theme={theme}
                maxLength={maxLength}
                disabled={disabled}
            />
        );
    };

    const renderAddEmployeeModal = () => {
        if (!isAddEmployeeModalOpen) return null;

        const getStepTitle = (step) => {
            if (step === 1) return "User Credentials";
            if (step === 2) return "Employee Information";
            if (step === 3) return "Payroll & Job Details";
            if (step === 4) return "Leave/Attendance"; // NEW STEP 4
        };

        const getStepIcon = (step) => {
            if (step === 1) return <IoKeyOutline className="w-5 h-5 mr-2" />;
            if (step === 2) return <IoPersonOutline className="w-5 h-5 mr-2" />;
            if (step === 3) return <IoBriefcaseOutline className="w-5 h-5 mr-2" />;
            if (step === 4) return <IoCalendarOutline className="w-5 h-5 mr-2" />; // NEW STEP 4
        };

        const getStepColor = (step) => {
            if (step === 1) return "from-blue-500 to-purple-600";
            if (step === 2) return "from-purple-500 to-pink-600";
            if (step === 3) return "from-green-500 to-teal-600";
            if (step === 4) return "from-cyan-500 to-blue-500"; // NEW STEP 4
        };

        const steps = [1, 2, 3, 4]; // ADDED 4TH STEP

        // Determine if a step is considered "completed" (visually, without strict validation check as requested)
        const isStepVisuallyCompleted = (step) => step < currentStep;


        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] p-2 sm:p-4">
                <div
                    className={`rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    }`}
                >
                    {/* Header */}
                    <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-r ${getStepColor(currentStep)} text-white flex-shrink-0`}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className="text-xl sm:text-2xl">
                                    {getStepIcon(currentStep)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Add New Employee</h2>
                                    <p className="text-xs sm:text-sm opacity-90 mt-1">Step {currentStep} of {steps.length}: {getStepTitle(currentStep)}</p>
                                </div>
                            </div>
                            <button onClick={handleFormClose} className="p-2 hover:bg-white/20 rounded-lg">
                                <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Step Navigation Bar (Clickable) */}
                    <div className={`flex justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-b ${
                        theme === 'dark' ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50'
                    }`}>
                        {steps.map(step => {
                            const isCompleted = isStepVisuallyCompleted(step);

                            return (
                                <button
                                    key={step}
                                    type="button"
                                    onClick={() => handleStepClick(step)}
                                    // Always enabled as requested
                                    className={`flex-1 p-2 mx-1 sm:mx-2 text-sm sm:text-base font-semibold transition-all duration-300 rounded-lg flex items-center justify-center space-x-2 cursor-pointer ${
                                        step === currentStep
                                            ? `text-white ${getStepColor(step)} shadow-md`
                                            : isCompleted
                                                ? 'text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300'
                                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    } hover:bg-gray-100 dark:hover:bg-gray-700`}
                                >
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                        step === currentStep
                                            ? 'border-white bg-transparent'
                                            : isCompleted
                                                ? 'border-green-500 bg-green-500 text-white'
                                                : 'border-gray-400 dark:border-gray-500'
                                    }`}>
                                        {step}
                                    </span>
                                    <span className="hidden sm:inline">{getStepTitle(step).split('/')[0]}</span>
                                    {isCompleted && <IoCheckmarkCircle className="w-4 h-4 text-white" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Form Content - Fixed Height with Scrollable Content */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                {/* Step 1: User Credentials */}
                                {currentStep === 1 && (
                                    <div>
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
                                )}

                                {/* Step 2: Employee Information */}
                                {currentStep === 2 && (
                                    <div>
                                        <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                                            theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                                        }`}>
                                            <IoPersonOutline className="w-5 h-5 mr-2" />
                                            Employee Information
                                        </h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                                            {employeeFormFields.map(field => (
                                                <div key={field.name}>
                                                    {/* Handlers adjusted to send correct context to renderField */}
                                                    {renderField(field, formErrors, field.type === 'department-dropdown' ? handleDepartmentChange : handleFormChange, formData[field.name])}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Payroll & Job Details */}
                                {currentStep === 3 && (
                                    <div className="p-4 sm:p-6 rounded-lg border-2 border-green-500/50 bg-green-50 dark:bg-green-900/20">
                                        <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                                            theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                        }`}>
                                            <IoBriefcaseOutline className="w-5 h-5 mr-2" />
                                            Payroll & Job Details
                                        </h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                                            {payrollFormFields.map(field => (
                                                <div key={field.name}>
                                                    {/* Handlers adjusted to send correct context to renderField */}
                                                    {renderField(field, formErrors, field.type === 'department-dropdown' ? handleDepartmentChange : handleFormChange, formData[field.name])}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* NEW: Step 4: Leaves/Attendance */}
                                {currentStep === 4 && (
                                    <div className="p-4 sm:p-6 rounded-lg border-2 border-cyan-500/50 bg-cyan-50 dark:bg-cyan-900/20">
                                        <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                                            theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                                        }`}>
                                            <IoCalendarOutline className="w-5 h-5 mr-2" />
                                            Leave/Attendance Details
                                        </h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                                            {leavesFormFields.filter(f => !f.hidden).map(field => ( // Filter out hidden fields
                                                <div key={field.name}>
                                                    {renderField(field, formErrors, handleFormChange, formData[field.name])}
                                                </div>
                                            ))}
                                            {/* Render hidden fields with default values for DTO consistency */}
                                            {leavesFormFields.filter(f => f.hidden).map(field => (
                                                <input key={field.name} type="hidden" name={field.name} value={formData[field.name]} />
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                    </div>

                    {/* Footer with Action Buttons */}
                    <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t flex-shrink-0 ${
                        theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'bg-gray-200 bg-gray-50/50'
                    } flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4`}>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={handleFormClose}
                                className={`px-6 sm:px-8 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base ${
                                    theme === 'dark'
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                                }`}
                            >
                                Cancel
                            </button>

                            {/* New Debug Button only visible on Step 4 */}
                            {currentStep === 4 && (
                                <button
                                    type="button"
                                    onClick={handlePrintPayload}
                                    className={`px-6 sm:px-8 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 ${
                                        theme === 'dark'
                                            ? 'border-yellow-600 text-yellow-400 hover:bg-yellow-900/30'
                                            : 'border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                                    }`}
                                >
                                    <IoInformationCircleOutline className="w-4 h-4" />
                                    <span>Debug Payload</span>
                                </button>
                            )}

                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePreviousStep}
                                    className={`px-6 sm:px-8 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 ${
                                        theme === 'dark'
                                            ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                                    }`}
                                >
                                    <IoArrowBack className="w-4 h-4" />
                                    <span>Previous</span>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            {currentStep < 4 ? ( // Updated step limit to 4
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className={`px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base flex items-center justify-center space-x-2`}
                                >
                                    <span>Next</span>
                                    <IoArrowForward className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    onClick={handleFormSubmit}
                                    disabled={isUpdating}
                                    className={`px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base flex items-center justify-center space-x-2 ${
                                        isUpdating ? 'cursor-not-allowed opacity-75' : ''
                                    }`}
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>{submissionStatus || 'Creating...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <IoCheckmarkCircle className="w-4 h-4" />
                                            <span>Create Employee</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
        setTerminatedSearchTerm(''); // FIXED: Using the correct setter
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
                <div
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
                                className="p-2 hover:bg-white/20 rounded-full flex-shrink-0"
                            >
                                <IoClose className="w-4 h-4 sm:w-5 sm:h-5" />
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
                                onChange={(e) => setTerminatedSearchTerm(e.target.value)} // FIXED: Using the correct setter
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none ${
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
                                    <div
                                        key={`${employee.employeeId}-${index}`}
                                        className={`p-4 rounded-lg border ${
                                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                                        } shadow-md`}
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

                                        <div className="space-y-1 max-h-40 overflow-y-auto">
                                            {renderDataField("Work Email", employee.workEmail)}
                                            {renderDataField("Work Number", employee.workNumber)}
                                            {renderDataField("Gender", employee.gender)}
                                            {renderDataField("Date of Joining", employee.dateOfJoining)}
                                            {renderDataField("Date of Leaving", employee.dateOfLeaving)}
                                            {renderDataField("Department", employee.departmentId)}
                                            {renderDataField("Projects", employee.projectId)}
                                            {renderDataField("Teams", employee.teamId)}
                                        </div>
                                    </div>
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
                </div>
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

    if (isAddEmployeeModalOpen) {
        return (
            <>
                {renderAddEmployeeModal()}
                <div className={`min-h-screen absolute inset-0 filter blur-sm ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}></div>
            </>
        );
    }

    return (
        <div className={`min-h-screen px-0 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Search and Filters Bar */}
                <div
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
                                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-7 sm:pl-8 border rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none placeholder-gray-500 text-xs sm:text-sm ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-gray-50 border-gray-200 text-gray-800'
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
                                            className={`px-3 sm:px-4 py-2 sm:py-2.5 pl-6 sm:pl-7 pr-4 sm:pr-5 border rounded-md sm:rounded-lg appearance-none cursor-pointer min-w-[100px] sm:min-w-[120px] text-xs truncate focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
                                                theme === 'dark'
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700'
                                            }`}
                                            value={selectedFilters[filter.name] || filter.options[0]}
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
                                className={`px-4 sm:px-5 py-1.5 sm:py-2 border rounded-md sm:rounded-lg font-medium text-xs flex items-center justify-center space-x-1.5 ${
                                    theme === 'dark'
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                                }`}
                            >
                                <IoRefreshOutline className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span>Clear</span>
                            </button>

                            {matchedArray && matchedArray.includes("EMPLOYEES_ADD") && (
                                <button
                                    onClick={() => setIsAddEmployeeModalOpen(true)}
                                    className="px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-md sm:rounded-lg shadow-md text-xs flex items-center justify-center space-x-1.5"
                                >
                                    <IoAddCircleOutline className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    <span>Add</span>
                                </button>
                            )}

                            {matchedArray && matchedArray.includes("EMPLOYEES_TERMINATE") && (
                                <button
                                    onClick={handleTerminateEmployees}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md text-xs flex items-center justify-center space-x-1.5"
                                >
                                    <IoTrashOutline className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    <span>Terminate</span>
                                </button>
                            )}

                            <div className={`flex rounded-md p-0.5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1 sm:p-1.5 rounded-sm ${
                                        viewMode === 'grid'
                                            ? (theme === 'dark' ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                                            : (theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                                    }`}
                                >
                                    <IoGridOutline className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1 sm:p-1.5 rounded-sm ${
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
                </div>

                <div className="flex items-center justify-between mb-4 sm:mb-3 mx-4 sm:mx-0">
                    <h3 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {filteredEmployees.length} Employee{filteredEmployees.length !== 1 ? 's' : ''} Found
                    </h3>
                </div>

                {filteredEmployees.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 px-4">
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
                            className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base"
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div
                        className={viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mx-4 sm:mx-0'
                            : 'space-y-3 sm:space-y-4 mx-4 sm:mx-0'
                        }
                    >
                        {filteredEmployees.map((employee, index) => {
                            const isOwnProfile = employee.employeeId === empID;

                            return (
                                <div key={employee.employeeId} className="relative">
                                    {viewMode === 'grid' ? (
                                        <div
                                            className={`w-full h-72 rounded-xl shadow-lg border cursor-pointer ${
                                                theme === 'dark'
                                                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                                                    : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFlippedCard(prev => prev === employee.employeeId ? null : employee.employeeId);
                                            }}
                                        >
                                            {flippedCard === employee.employeeId ? (
                                                // Back Card - Scrollable Options
                                                <div className="flex flex-col h-72 p-4 sm:p-5">
                                                    {isOwnProfile ? (
                                                        <div className="text-center space-y-4 w-full flex-1 flex flex-col items-center justify-center">
                                                            <IoPersonOutline className={`w-10 h-10 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                                                            <h3 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                                                                This is Your Profile
                                                            </h3>
                                                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                Use the main navigation links to manage your information.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="text-center mb-3 sm:mb-4 pb-3 border-b border-gray-500/30">
                                                                <h3 className={`text-base sm:text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                                    Card Options
                                                                </h3>
                                                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                    Actions for {employee.displayName}
                                                                </p>
                                                            </div>

                                                            <div className="overflow-y-auto flex-1 space-y-1 sm:space-y-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleChatClick(employee);
                                                                    }}
                                                                    className={`px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg text-xs sm:text-sm w-full flex items-center justify-center space-x-2`}
                                                                >
                                                                    <IoChatbubbleOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    <span>Start Chat</span>
                                                                </button>

                                                                {matchedArray && matchedArray.includes("GET_PUBLIC") && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleViewProfileClick(employee);
                                                                        }}
                                                                        className={`px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg text-xs sm:text-sm w-full flex items-center justify-center space-x-2`}
                                                                    >
                                                                        <IoPersonOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                        <span>View Profile</span>
                                                                    </button>
                                                                )}

                                                                {matchedArray && matchedArray.includes("EMPLOYEE_VIEW_DOCS") &&
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDocumentsClick(employee);
                                                                        }}
                                                                        className={`px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg text-xs sm:text-sm w-full flex items-center justify-center space-x-2`}
                                                                    >
                                                                        <IoDocumentsOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                        <span>Documents</span>
                                                                    </button>
                                                                }

                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handlePayRollClick(employee);
                                                                    }}
                                                                    className={`px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg text-xs sm:text-sm w-full flex items-center justify-center space-x-2`}
                                                                >
                                                                    <IoPeopleOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    <span>View Payroll</span>
                                                                </button>

                                                                {matchedArray.includes("EMPLOYEES_EMPLOYEE_TERMINATE_EMPLOYEE") && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteClick(employee);
                                                                        }}
                                                                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs sm:text-sm w-full flex items-center justify-center space-x-2"
                                                                    >
                                                                        <IoTrashOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                        <span>Terminate</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                // Front Card
                                                <div className="flex flex-col h-full p-3 sm:p-4 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none">
                                                        <div className={`w-full h-full rounded-full ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'} transform translate-x-8 -translate-y-8`}></div>
                                                    </div>

                                                    <div className="flex flex-col items-center text-center mb-3 z-10">
                                                        <div className="relative mb-2">
                                                            {employee.employeeImage ? (
                                                                <div className="relative">
                                                                    <img
                                                                        src={employee.employeeImage}
                                                                        alt={`${employee.displayName}'s profile picture`}
                                                                        className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover border-3 border-blue-400 shadow-lg"
                                                                    />
                                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                                                                </div>
                                                            ) : (
                                                                <div className="relative">
                                                                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm sm:text-lg font-bold shadow-lg">
                                                                        {generateInitials(employee.displayName)}
                                                                    </div>
                                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="w-full px-1">
                                                            <h3 className={`text-sm sm:text-base font-bold mb-1 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                                {employee.displayName}
                                                            </h3>
                                                            <p className={`text-xs font-semibold px-2 py-0.5 rounded-full truncate ${theme === 'dark' ? 'text-blue-300 bg-blue-900/40' : 'text-blue-700 bg-blue-100'}`}>
                                                                {employee.jobTitlePrimary || "Not Updated Job Title"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 flex flex-col justify-end min-h-0">
                                                        <div className="space-y-1 px-1">
                                                            <div className={`flex items-center space-x-2 p-1.5 rounded-lg overflow-hidden ${
                                                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                                            }`}>
                                                                <IoIdCardOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                                                                <span className="truncate font-mono text-xs min-w-0">{employee.employeeId}</span>
                                                            </div>

                                                            <div className={`flex items-center space-x-2 p-1.5 rounded-lg overflow-hidden ${
                                                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                                            }`}>
                                                                <IoBriefcaseOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                                                                <span className="truncate text-xs min-w-0">{employee.departmentId || 'N/A'}</span>
                                                            </div>

                                                            <div className={`flex items-center space-x-2 p-1.5 rounded-lg overflow-hidden ${
                                                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                                            }`}>
                                                                <IoLocationOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                                                                <span className="truncate text-xs min-w-0">{employee.location || 'N/A'}</span>
                                                            </div>

                                                            <div className={`flex items-center space-x-2 p-1.5 rounded-lg overflow-hidden ${
                                                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                                            }`}>
                                                                <IoMailOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
                                                                <span className="truncate text-xs min-w-0" title={employee.workEmail || 'N/A'}>{employee.workEmail || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // List View Item
                                        <div
                                            className={`rounded-xl p-3 sm:p-4 shadow-lg border cursor-pointer ${
                                                isOwnProfile
                                                    ? 'border-green-500 ring-2 ring-green-500/50'
                                                    : (theme === 'dark'
                                                        ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700'
                                                        : 'bg-gradient-to-r from-white to-gray-50 border-gray-200'
                                                    )
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
                                                                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover border-4 border-blue-200 shadow-lg"
                                                            />
                                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-lg">
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
                                                                {isOwnProfile && (
                                                                    <span className={`ml-2 text-xs font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>(Your Profile)</span>
                                                                )}
                                                            </h3>
                                                            <p className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${theme === 'dark' ? 'text-blue-300 bg-blue-900/40' : 'text-blue-700 bg-blue-100'}`}>
                                                                {employee.jobTitlePrimary || "Not Updated"}
                                                            </p>
                                                        </div>

                                                        {!isOwnProfile && (
                                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleChatClick(employee); }}
                                                                    className={`p-1.5 sm:p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white shadow-md`}
                                                                >
                                                                    <IoChatbubbleOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                </button>

                                                                {matchedArray && matchedArray.includes("GET_PUBLIC") && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleViewProfileClick(employee); }}
                                                                        className={`p-1.5 sm:p-2 rounded-lg ${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white shadow-md`}
                                                                    >
                                                                        <IoPersonOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    </button>
                                                                )}

                                                                {matchedArray && matchedArray.includes("EMPLOYEE_VIEW_DOCS") && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleDocumentsClick(employee); }}
                                                                        className={`p-1.5 sm:p-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white shadow-md`}
                                                                    >
                                                                        <IoDocumentsOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    </button>
                                                                )}

                                                                {matchedArray.includes("EMPLOYEES_EMPLOYEE_TERMINATE_EMPLOYEE") && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(employee); }}
                                                                        disabled={isOwnProfile}
                                                                        className={`p-1.5 sm:p-2 rounded-lg text-white shadow-md ${isOwnProfile ? 'opacity-50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                                                                    >
                                                                        <IoTrashOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-2 text-xs mt-2">
                                                        <div className={`flex items-center space-x-1 p-1 sm:p-1.5 rounded-md overflow-hidden ${
                                                            theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            <IoIdCardOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                                                            <span className="truncate font-mono text-xs">{employee.employeeId}</span>
                                                        </div>
                                                        <div className={`flex items-center space-x-1 p-1 sm:p-1.5 rounded-md overflow-hidden ${
                                                            theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            <IoBriefcaseOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                                                            <span className="truncate">{employee.departmentId || 'N/A'}</span>
                                                        </div>
                                                        <div className={`flex items-center space-x-1 p-1 sm:p-1.5 rounded-md overflow-hidden ${
                                                            theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            <IoLocationOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                                                            <span className="truncate">{employee.location || 'N/A'}</span>
                                                        </div>
                                                        <div className={`flex items-center space-x-1 p-1 sm:p-1.5 rounded-md overflow-hidden ${
                                                            theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            <IoMailOutline className={`w-3 h-3 flex-shrink-0 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
                                                            <span className="truncate text-xs" title={employee.workEmail || 'N/A'}>{employee.workEmail || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 gap-4 mx-4 sm:mx-0">
                    <button
                        onClick={() => setPageNumber(prev => Math.max(0, prev - 1))}
                        disabled={pageNumber === 0}
                        className={`flex items-center space-x-2 px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm ${
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
                                setPageNumber(0);
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
                        disabled={filteredEmployees.length < pageSize}
                        className={`flex items-center space-x-2 px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm ${
                            theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                    title={popup.type === 'success' ? 'Success' : popup.type === 'default' ? 'Information' : 'Error'}
                    type={popup.type}
                    theme={theme}
                >
                    <p className={`mb-4 sm:mb-6 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{popup.message}</p>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setPopup({ show: false, message: '', type: '' })}
                            className={`${popup.type === 'success' ? 'bg-green-600 hover:bg-green-700' : popup.type === 'default' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold py-2 px-6 rounded-lg text-sm`}
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
                            className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold text-sm ${
                                theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="w-full sm:w-auto px-6 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 text-sm"
                        >
                            Terminate
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

export default EmployeeApp;