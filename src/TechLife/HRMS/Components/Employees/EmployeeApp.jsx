import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Context } from "../HrmsContext";
import { publicinfoApi, chatApi } from "../../../../axiosInstance"; // Added chatApi import
import {
    IoSearchOutline,
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
    IoPeopleOutline
} from "react-icons/io5";

const generateInitials = (name) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
};

function EmployeeApp() {
    const navigate = useNavigate();
    const [employeeData, setEmployeeData] = useState(null);
    const [dynamicFilters, setDynamicFilters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const { userprofiledata, theme, userData } = useContext(Context);
    console.log(userData)
    const { empID } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilters, setSelectedFilters] = useState({});

    // State for card flipping
    const [flippedCard, setFlippedCard] = useState(null);
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        employee: null,
    });

    // New state for modal
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        employeeId: "",
        firstName: "",
        middleName: "",
        lastName: "",
        displayName: "",
        maritalStatus: "",
        bloodGroup: "",
        physicallyHandicapped: "",
        nationality: "",
        gender: "",
        dateOfBirth: "",
        employeeImage: "",
        workEmail: "",
        personalEmail: "",
        mobileNumber: "",
        workNumber: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        district: "",
        dateOfJoining: "",
        dateOfLeaving: "",
        jobTitlePrimary: "",
        jobTitleSecondary: "",
        inProbation: "",
        probationStartDate: "",
        probationEndDate: "",
        probationPolicy: "",
        workingType: "",
        timeType: "",
        contractStatus: "",
        contractStartDate: "",
        location: "",
        Skills: [],
        departmentId: "",
    });
    const [errors, setErrors] = useState({});

    // New state for pagination, with sortBy and sortOrder set to default values
    const [pageNumber, setPageNumber] = useState(0);
    const [pageSize, setPageSize] = useState(15);
    const [sortBy, setSortBy] = useState('employeeId');
    const [sortOrder, setSortOrder] = useState('asc');

    // Get the user's role from userData and check if they have management access
    const userRole = userData?.roles?.[0]?.toUpperCase();
    const hasManagementAccess = ["ADMIN", "MANAGER", "HR"].includes(userRole);

    useEffect(() => {
        const handleOutsideClick = () => {
            if (contextMenu.visible) {
                setContextMenu({ ...contextMenu, visible: false });
            }
            if (flippedCard) {
                setFlippedCard(null);
            }
        };
        window.addEventListener("click", handleOutsideClick);
        return () => {
            window.removeEventListener("click", handleOutsideClick);
        };
    }, [contextMenu, flippedCard]);

    const handleViewTeamsClick = (employee) => {
        if (employee) {
            navigate(`/my-teams/${empID}?fromContextMenu=true&targetEmployeeId=${employee.employeeId}`);
        }
        setContextMenu({ ...contextMenu, visible: false });
        setFlippedCard(null);
    };

    const handleContextMenu = (e, employee) => {
        e.preventDefault();
        setFlippedCard(null);
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            employee: employee,
        });
    };

    const handleChatClick = async (employee) => {
        if (employee) {
            const chatPayload = {
                sender: empID,
                receiver: employee.employeeId,
                content: "Hello, how are you?",
                type:"private"
            };
    
            console.log("Starting chat with payload:", chatPayload);
    
            try {
                // const response = await chatApi.post('/chat/send', chatPayload);
                // console.log("Chat started successfully:", response.data);
                navigate(`/chat/${empID}/with?id=${employee.employeeId}`);
            } catch (err) {
                console.error("Error starting chat:", err);
                alert("Could not start the chat. Please try again later.");
            }
        }
        setContextMenu({ ...contextMenu, visible: false });
        setFlippedCard(null);
    };

    const handleViewProfileClick = (employee) => {
        if (employee) {
            navigate(`/profile/${empID}/profile?fromContextMenu=true&targetEmployeeId=${employee.employeeId}`);
        }
        setContextMenu({ ...contextMenu, visible: false });
        setFlippedCard(null);
    };

    const handleDocumentsClick = (employee) => {
        if (employee) {
            navigate(`/profile/${empID}/documents?fromContextMenu=true&targetEmployeeId=${employee.employeeId}`);
        }
        setContextMenu({ ...contextMenu, visible: false });
        setFlippedCard(null);
    };

    const handleAboutClick = (employee) => {
        if (employee) {
            alert(`Viewing about details for ${employee.displayName || employee.name}...`);
        }
        setContextMenu({ ...contextMenu, visible: false });
        setFlippedCard(null);
    };

    // Updated useEffect to use pagination state
    useEffect(() => {
        const fetchAllEmployees = async () => {
            try {
                setLoading(true);
                // API call with pagination parameters
                const response = await publicinfoApi.get(
                    `employee/${pageNumber}/${pageSize}/${sortBy}/${sortOrder}/employees`
                );
                console.log("Employees Data from API:", response.data);
                setEmployeeData(response.data);
            } catch (err) {
                console.error("Error fetching employees:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllEmployees();
    }, [pageNumber, pageSize, sortBy, sortOrder]);

    useEffect(() => {
        if (employeeData) {
            const roles = [...new Set(employeeData.map(e => e.jobTitlePrimary).filter(Boolean))];
            const departments = [...new Set(employeeData.map(e => e.departmentId).filter(Boolean))];
            const locations = [...new Set(employeeData.map(e => e.location).filter(Boolean))];
            const newFilters = [
                { name: "Role", options: ["All Roles", ...roles], icon: IoBriefcaseOutline },
                { name: "Department", options: ["All Departments", ...departments], icon: IoBusinessOutline },
                { name: "Location", options: ["All Locations", ...locations], icon: IoLocationOutline },
            ];
            setDynamicFilters(newFilters);
            const initialFilters = newFilters.reduce(
                (acc, filter) => ({ ...acc, [filter.name]: filter.options[0] }),
                {}
            );
            setSelectedFilters(initialFilters);
        }
    }, [employeeData]);

    const filteredEmployees = employeeData
        ? employeeData.filter((employee) => {
            const matchesSearch =
                (employee.displayName && employee.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (employee.workEmail && employee.workEmail.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesFilters = Object.entries(selectedFilters).every(
                ([filterName, value]) => {
                    if (!value || value.startsWith("All")) return true;
                    switch (filterName) {
                        case "Role":
                            return employee.jobTitlePrimary === value;
                        case "Department":
                            return employee.departmentId === value;
                        case "Location":
                            return employee.location === value;
                        default:
                            return true;
                    }
                }
            );
            return matchesSearch && matchesFilters;
        })
        : [];

    const clearFilters = () => {
        setSearchTerm("");
        const clearedFilters = dynamicFilters.reduce(
            (acc, filter) => ({ ...acc, [filter.name]: filter.options[0] }),
            {}
        );
        setSelectedFilters(clearedFilters);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee({
            ...newEmployee,
            [name]: value,
        });
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateFormData = (data) => {
        const errors = {};
        if (!data.employeeId || !/^ACS\d{8}$/.test(data.employeeId)) {
            errors.employeeId = "Employee ID must start with 'ACS' followed by 8 digits.";
        }
        if (!data.firstName) {
            errors.firstName = "First name is required.";
        }
        if (data.workEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.workEmail)) {
            errors.workEmail = "Invalid work email format.";
        }
        return errors;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        const validationErrors = validateFormData(newEmployee);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsUpdating(false);
            return;
        }
        try {
            await publicinfoApi.post('/employee', newEmployee);
            alert('Employee created successfully!');
            setIsFormOpen(false);
            // Optionally, refresh the employee list
            const response = await publicinfoApi.get(
                `employee/${pageNumber}/${pageSize}/${sortBy}/${sortOrder}/employees`
            );
            setEmployeeData(response.data);
            setNewEmployee({
                employeeId: "", firstName: "", middleName: "", lastName: "",
                displayName: "", maritalStatus: "", bloodGroup: "", physicallyHandicapped: "",
                nationality: "", gender: "", dateOfBirth: "", employeeImage: "",
                workEmail: "", personalEmail: "", mobileNumber: "", workNumber: "",
                street: "", city: "", state: "", zip: "", country: "", district: "",
                dateOfJoining: "", dateOfLeaving: "", jobTitlePrimary: "", jobTitleSecondary: "",
                inProbation: "", probationStartDate: "", probationEndDate: "", probationPolicy: "",
                workingType: "", timeType: "", contractStatus: "", contractStartDate: "",
                location: "", Skills: [], departmentId: "",
            });
        } catch (error) {
            console.error('Error creating employee:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create employee. Please check the provided data.';
            setErrors({ general: errorMessage });
        } finally {
            setIsUpdating(false);
        }
    };
    
    const renderField = (label, name, type = "text", required = false, options = []) => {
        const isError = errors[name];
        const fieldValue = newEmployee[name] || "";

        return (
            <div className="group relative" key={name}>
                <label className={`block text-sm font-semibold mb-2 flex items-center ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                    {label}
                    {required && <span className="text-red-500 ml-1 text-base">*</span>}
                </label>

                {type === "select" ? (
                    <div className="relative">
                        <select
                            name={name}
                            value={fieldValue}
                            onChange={handleFormChange}
                            className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 appearance-none text-sm
                                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                                ${isError
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                : theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                            }`}
                        >
                            <option value="">Choose {label}</option>
                            {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                ) : type === "date" ? (
                    <input
                        type="date"
                        name={name}
                        value={fieldValue}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 text-sm
                            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                            ${isError
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                : theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                            }`}
                    />
                ) : type === "textarea" ? (
                    <textarea
                        name={name}
                        value={fieldValue}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 resize-none h-24 text-sm
                            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                            ${isError
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                : theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                            }`}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        required={required}
                    />
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={fieldValue}
                        onChange={handleFormChange}
                        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 text-sm
                            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                            ${isError
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                                : theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                            }`}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        required={required}
                    />
                )}
                {isError && (
                    <div className="mt-2 flex items-center space-x-2 text-red-600 animate-slideIn">
                        <IoWarning className="w-4 h-4 flex-shrink-0" />
                        <p className="text-xs font-medium">{isError}</p>
                    </div>
                )}
            </div>
        );
    };

    const renderCreateEmployeeModal = () => {
        if (!isFormOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fadeIn">
                <motion.div
                    initial={{ y: -50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -50, opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className={`relative w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl rounded-2xl ${
                        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    }`}
                >
                    <div className={`px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="text-2xl"><IoAddCircleOutline /></div>
                                <div>
                                    <h2 className="text-xl font-bold">Create New Employee</h2>
                                    <p className="text-white/90 text-sm">Fill in the details to add a new employee to the system.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 group" aria-label="Close">
                                <IoClose className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                        <form className="p-6" onSubmit={handleFormSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {renderField("Employee ID", "employeeId", "text", true)}
                                {renderField("First Name", "firstName", "text", true)}
                                {renderField("Middle Name", "middleName", "text")}
                                {renderField("Last Name", "lastName", "text")}
                                {renderField("Display Name", "displayName", "text")}
                                {renderField("Marital Status", "maritalStatus", "select", false, ["Single", "Married", "Divorced", "Widowed"])}
                                {renderField("Blood Group", "bloodGroup", "select", false, ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])}
                                {renderField("Physically Handicapped", "physicallyHandicapped", "select", false, ["Yes", "No"])}
                                {renderField("Nationality", "nationality", "text")}
                                {renderField("Gender", "gender", "select", false, ["Male", "Female", "Other", "Prefer not to say"])}
                                {renderField("Date of Birth", "dateOfBirth", "date")}
                                {renderField("Employee Image URL", "employeeImage", "text")}
                                {renderField("Work Email", "workEmail", "email")}
                                {renderField("Personal Email", "personalEmail", "email")}
                                {renderField("Mobile Number", "mobileNumber", "text")}
                                {renderField("Work Number", "workNumber", "text")}
                                {renderField("Street", "street", "text")}
                                {renderField("City", "city", "text")}
                                {renderField("State", "state", "text")}
                                {renderField("Zip", "zip", "text")}
                                {renderField("Country", "country", "text")}
                                {renderField("District", "district", "text")}
                                {renderField("Date of Joining", "dateOfJoining", "date")}
                                {renderField("Date of Leaving", "dateOfLeaving", "date")}
                                {renderField("Primary Job Title", "jobTitlePrimary", "text")}
                                {renderField("Secondary Job Title", "jobTitleSecondary", "text")}
                                {renderField("In Probation", "inProbation", "text")}
                                {renderField("Probation Start Date", "probationStartDate", "date")}
                                {renderField("Probation End Date", "probationEndDate", "date")}
                                {renderField("Probation Policy", "probationPolicy", "text")}
                                {renderField("Working Type", "workingType", "select", false, ["Full-time", "Part-time", "Contractor", "Intern"])}
                                {renderField("Time Type", "timeType", "select", false, ["Day shift", "Night shift", "Flexible hours"])}
                                {renderField("Contract Status", "contractStatus", "select", false, ["Active", "Expired", "Terminated"])}
                                {renderField("Contract Start Date", "contractStartDate", "date")}
                                {renderField("Location", "location", "text")}
                                {renderField("Skills (comma-separated)", "Skills", "text")}
                                {renderField("Department ID", "departmentId", "text")}
                            </div>
                            {errors.general && (
                                <div className={`mt-4 p-4 border-l-4 border-red-400 rounded-r-lg animate-slideIn ${
                                    theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                                }`}>
                                    <div className="flex items-center">
                                        <IoWarning className="w-5 h-5 text-red-400 mr-3" />
                                        <p className={`font-medium text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>{errors.general}</p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                    <div className={`px-6 py-4 border-t flex justify-end space-x-3 ${
                        theme === 'dark'
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            className={`px-6 py-2.5 border-2 rounded-lg font-semibold text-sm transition-all duration-200 focus:ring-4 focus:ring-gray-500/20 ${
                                theme === 'dark'
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleFormSubmit}
                            disabled={isUpdating}
                            className={`px-8 py-2.5 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg text-sm
                                         hover:shadow-lg transform hover:scale-105 transition-all duration-200
                                         focus:ring-4 focus:ring-blue-500/30 flex items-center space-x-2
                                         ${isUpdating ? 'cursor-not-allowed opacity-75' : ''}`}
                        >
                            {isUpdating ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow"></div>
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <IoCheckmarkCircle className="w-4 h-4" />
                                    <span>Create Employee</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${
                theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
                }`}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <IoPersonOutline className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                        <h2 className={`text-xl font-bold mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}>Loading Employee Directory</h2>
                        <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>Discovering your colleagues...</p>
                        <div className="flex justify-center space-x-1 mt-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`}
                                    style={{ animationDelay: `${i * 0.2}s` }}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${
            theme === 'dark'
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`rounded-xl p-6 shadow-lg border mb-8 ${
                        theme === 'dark'
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                        }`}
                >
                    {/* First Row - Search Bar */}
                    <div className="mb-4">
                        <div className="relative group max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IoSearchOutline className={`h-5 w-5 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                    }`} />
                            </div>
                            <input
                                type="text"
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-300 placeholder-gray-500 text-sm ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500 group-hover:border-blue-400'
                                        : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300 group-hover:border-blue-300'
                                    }`}
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Second Row - Filters and Actions */}
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                        <div className="flex flex-wrap gap-3">
                            {dynamicFilters.map((filter) => {
                                const IconComponent = filter.icon;
                                return (
                                    <div key={filter.name} className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <IconComponent className={`h-4 w-4 ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <select
                                            className={`pl-9 pr-8 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-300 appearance-none cursor-pointer min-w-[140px] text-sm ${
                                                theme === 'dark'
                                                    ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500 group-hover:border-blue-400'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 group-hover:border-blue-300'
                                                }`}
                                            value={selectedFilters[filter.name] || ""}
                                            onChange={(e) =>
                                                setSelectedFilters({
                                                    ...selectedFilters,
                                                    [filter.name]: e.target.value,
                                                })
                                            }
                                        >
                                            {filter.options.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <IoChevronDownOutline className={`h-4 w-4 ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                                }`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={clearFilters}
                                className={`flex items-center space-x-2 px-4 py-2.5 border-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                                    }`}
                            >
                                <IoRefreshOutline className="w-4 h-4" />
                                <span>Clear</span>
                            </button>
                            {hasManagementAccess && (
                                <button
                                    onClick={() => setIsFormOpen(true)}
                                    className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
                                >
                                    <IoAddCircleOutline className="w-4 h-4" />
                                    <span>Add Employee</span>
                                </button>
                            )}
                            <div className={`flex rounded-lg p-1 ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                }`}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all duration-200 ${
                                        viewMode === 'grid'
                                            ? theme === 'dark'
                                                ? 'bg-gray-600 text-blue-400 shadow-sm'
                                                : 'bg-white text-blue-600 shadow-sm'
                                            : theme === 'dark'
                                                ? 'text-gray-400 hover:text-gray-200'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <IoGridOutline className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all duration-200 ${
                                        viewMode === 'list'
                                            ? theme === 'dark'
                                                ? 'bg-gray-600 text-blue-400 shadow-sm'
                                                : 'bg-white text-blue-600 shadow-sm'
                                            : theme === 'dark'
                                                ? 'text-gray-400 hover:text-gray-200'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <IoListOutline className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                        {filteredEmployees.length} Employee{filteredEmployees.length !== 1 ? 's' : ''} Found
                    </h3>
                </div>

                {/* Employee Cards/List */}
                {filteredEmployees.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className={
                            viewMode === 'grid'
                                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                : "space-y-4"
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
                                    className={`relative ${viewMode === 'list' ? '' : ''}`}
                                    style={viewMode === 'grid' ? { perspective: '1000px' } : {}}
                                >
                                    {viewMode === 'grid' ? (
                                        /* GRID VIEW WITH 3D FLIP */
                                        <div
                                            className={`relative w-full h-80 cursor-pointer transition-transform duration-700 preserve-3d ${
                                                flippedCard === employee.employeeId ? 'rotate-y-180' : ''
                                            }`}
                                            onMouseEnter={() => setFlippedCard(employee.employeeId)}
                                            onMouseLeave={() => setFlippedCard(null)}
                                            onContextMenu={(e) => handleContextMenu(e, employee)}
                                            style={{
                                                transformStyle: 'preserve-3d'
                                            }}
                                        >
                                            {/* FRONT SIDE */}
                                            <div
                                                className={`absolute inset-0 w-full h-full rounded-xl shadow-lg border cursor-pointer group backface-hidden transform-gpu transition-all duration-300 hover:shadow-xl ${
                                                    theme === 'dark'
                                                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50'
                                                        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-400/50'
                                                } hover:scale-105`}
                                                onClick={() => navigate(`/employees/${empID}/public/${employee.employeeId}`)}
                                                style={{
                                                    backfaceVisibility: 'hidden'
                                                }}
                                            >
                                                <div className="flex flex-col items-center text-center h-full justify-center p-5 relative overflow-hidden">
                                                    {/* Background Pattern */}
                                                    <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                                                        <div className={`w-full h-full rounded-full ${
                                                            theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                                                        } transform translate-x-12 -translate-y-12`}></div>
                                                    </div>

                                                    <div className="relative mb-4 z-10">
                                                        {employee.employeeImage ? (
                                                            <div className="relative">
                                                                <img
                                                                    src={employee.employeeImage}
                                                                    alt={`${employee.displayName}'s profile picture`}
                                                                    className="h-20 w-20 rounded-xl object-cover border-4 border-gradient-to-r from-blue-400 to-indigo-500 shadow-xl group-hover:border-blue-400 transition-all duration-300 transform group-hover:scale-110"
                                                                />
                                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                                                            </div>
                                                        ) : (
                                                            <div className="relative">
                                                                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl group-hover:from-blue-600 group-hover:via-indigo-600 group-hover:to-purple-700 transition-all duration-300 transform group-hover:scale-110">
                                                                    {generateInitials(employee.displayName)}
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="w-full z-10">
                                                        <h3 className={`text-lg font-bold mb-2 truncate ${
                                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                            }`}>
                                                            {employee.displayName}
                                                        </h3>
                                                        <p className="text-blue-600 font-semibold mb-3 text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                                            {employee.jobTitlePrimary}
                                                        </p>

                                                        <div className="space-y-2 text-xs">
                                                            {/* Employee ID */}
                                                            <div className={`flex items-center justify-center space-x-2 p-2 rounded-md ${
                                                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                                                }`}>
                                                                <IoIdCardOutline className={`w-3 h-3 ${
                                                                    theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
                                                                    }`} />
                                                                <span className="truncate font-mono text-xs">{employee.employeeId}</span>
                                                            </div>
                                                            <div className={`flex items-center justify-center space-x-2 p-2 rounded-md ${
                                                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                                                }`}>
                                                                <IoBriefcaseOutline className={`w-3 h-3 ${
                                                                    theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                                                                    }`} />
                                                                <span className="truncate">{employee.departmentId || 'N/A'}</span>
                                                            </div>
                                                            <div className={`flex items-center justify-center space-x-2 p-2 rounded-md ${
                                                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                                                }`}>
                                                                <IoLocationOutline className={`w-3 h-3 ${
                                                                    theme === 'dark' ? 'text-green-400' : 'text-green-500'
                                                                    }`} />
                                                                <span className="truncate">{employee.location || 'N/A'}</span>
                                                            </div>
                                                            <div className={`flex items-center justify-center space-x-2 p-2 rounded-md ${
                                                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                                                                }`}>
                                                                <IoMailOutline className={`w-3 h-3 ${
                                                                    theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                                                                    }`} />
                                                                <span className="truncate text-xs">{employee.workEmail || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BACK SIDE */}
                                            <div
                                                className={`absolute inset-0 w-full h-full rounded-xl shadow-lg border backface-hidden rotate-y-180 ${
                                                    theme === 'dark'
                                                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                                                        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
                                                }`}
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    transform: 'rotateY(180deg)'
                                                }}
                                            >
                                                <div className="flex flex-col items-center justify-center h-full space-y-3 p-5">
                                                    <div className="text-center mb-4">
                                                        <h3 className={`text-lg font-bold mb-2 ${
                                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                            }`}>
                                                            Quick Actions
                                                        </h3>
                                                        <p className={`text-sm ${
                                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                            }`}>
                                                            {employee.displayName}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2 w-full max-w-xs">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleChatClick(employee);
                                                            }}
                                                            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm ${
                                                                theme === 'dark'
                                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                                                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg'
                                                                }`}
                                                        >
                                                            <IoChatbubbleOutline className="w-4 h-4" />
                                                            <span className="font-medium">Start Chat</span>
                                                        </button>

                                                        {hasManagementAccess && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleViewProfileClick(employee);
                                                                    }}
                                                                    className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm ${
                                                                        theme === 'dark'
                                                                            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg'
                                                                            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                                                                        }`}
                                                                >
                                                                    <IoPersonOutline className="w-4 h-4" />
                                                                    <span className="font-medium">View Profile</span>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDocumentsClick(employee);
                                                                    }}
                                                                    className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm ${
                                                                        theme === 'dark'
                                                                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg'
                                                                            : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg'
                                                                        }`}
                                                                >
                                                                    <IoDocumentsOutline className="w-4 h-4" />
                                                                    <span className="font-medium">Documents</span>
                                                                </button>
                                                                {/* View Teams Button - Updated Route */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleViewTeamsClick(employee);
                                                                    }}
                                                                    className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm ${
                                                                        theme === 'dark'
                                                                            ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg'
                                                                            : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg'
                                                                        }`}
                                                                >
                                                                    <IoPeopleOutline className="w-4 h-4" />
                                                                    <span className="font-medium">View Teams</span>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* IMPROVED LIST VIEW */
                                        <motion.div
                                            whileHover={{ scale: 1.02, x: 10 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full rounded-xl shadow-lg border cursor-pointer group transition-all duration-300 hover:shadow-xl ${
                                                theme === 'dark'
                                                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50'
                                                    : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:border-blue-400/50'
                                                }`}
                                            onClick={() => navigate(`/employees/${empID}/public/${employee.employeeId}`)}
                                            onContextMenu={(e) => handleContextMenu(e, employee)}
                                        >
                                            <div className="flex items-center p-4 space-x-4 relative overflow-hidden">
                                                {/* Background Pattern */}
                                                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                                                    <div className={`w-full h-full rounded-full ${
                                                        theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                                                    } transform translate-x-10 -translate-y-10`}></div>
                                                </div>

                                                {/* Profile Image */}
                                                <div className="flex-shrink-0 relative z-10">
                                                    {employee.employeeImage ? (
                                                        <div className="relative">
                                                            <img
                                                                src={employee.employeeImage}
                                                                alt={`${employee.displayName}'s profile picture`}
                                                                className="h-12 w-12 rounded-xl object-cover border-4 border-blue-200 shadow-lg group-hover:border-blue-400 transition-all duration-300 transform group-hover:scale-110"
                                                            />
                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:from-blue-600 group-hover:via-indigo-600 group-hover:to-purple-700 transition-all duration-300 transform group-hover:scale-110">
                                                                {generateInitials(employee.displayName)}
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Employee Info */}
                                                <div className="flex-1 min-w-0 z-10">
                                                    <div className="flex items-start justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className={`text-lg font-bold truncate mb-1 ${
                                                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                                }`}>
                                                                {employee.displayName}
                                                            </h3>
                                                            <p className="text-blue-600 font-semibold mb-3 text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full inline-block">
                                                                {employee.jobTitlePrimary}
                                                            </p>
                                                            
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                                                {/* Employee ID */}
                                                                <div className={`flex items-center space-x-1 p-2 rounded-md ${
                                                                    theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    <IoIdCardOutline className={`w-3 h-3 ${
                                                                        theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
                                                                        }`} />
                                                                    <span className="truncate font-mono text-xs">{employee.employeeId}</span>
                                                                </div>
                                                                <div className={`flex items-center space-x-1 p-2 rounded-md ${
                                                                    theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    <IoBriefcaseOutline className={`w-3 h-3 ${
                                                                        theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                                                                        }`} />
                                                                    <span className="truncate">{employee.departmentId || 'N/A'}</span>
                                                                </div>
                                                                <div className={`flex items-center space-x-1 p-2 rounded-md ${
                                                                    theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    <IoLocationOutline className={`w-3 h-3 ${
                                                                        theme === 'dark' ? 'text-green-400' : 'text-green-500'
                                                                        }`} />
                                                                    <span className="truncate">{employee.location || 'N/A'}</span>
                                                                </div>
                                                                <div className={`flex items-center space-x-1 p-2 rounded-md ${
                                                                    theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    <IoMailOutline className={`w-3 h-3 ${
                                                                        theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                                                                        }`} />
                                                                    <span className="truncate text-xs">{employee.workEmail || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Quick Action Buttons */}
                                                        <div className="flex items-center space-x-2 ml-4">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleChatClick(employee);
                                                                }}
                                                                className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                                                                    theme === 'dark'
                                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                                } shadow-lg hover:shadow-xl`}
                                                                title="Start Chat"
                                                            >
                                                                <IoChatbubbleOutline className="w-4 h-4" />
                                                            </button>

                                                            {hasManagementAccess && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleViewProfileClick(employee);
                                                                        }}
                                                                        className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                                                                            theme === 'dark'
                                                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                                                        } shadow-lg hover:shadow-xl`}
                                                                        title="View Profile"
                                                                    >
                                                                        <IoPersonOutline className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDocumentsClick(employee);
                                                                        }}
                                                                        className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                                                                            theme === 'dark'
                                                                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                                                                : 'bg-purple-500 hover:bg-purple-600 text-white'
                                                                        } shadow-lg hover:shadow-xl`}
                                                                        title="Documents"
                                                                    >
                                                                        <IoDocumentsOutline className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
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
                ) : (
                    <div className="text-center py-16">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                            <IoPersonOutline className={`w-10 h-10 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                }`} />
                        </div>
                        <h2 className={`text-xl font-bold mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}>No Employees Found</h2>
                        <p className={`text-base mb-4 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            Try adjusting your search terms or filters.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-8">
                    <button
                        onClick={() => setPageNumber(prev => Math.max(0, prev - 1))}
                        disabled={pageNumber === 0}
                        className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <IoArrowBack className="w-4 h-4" />
                        <span>Previous</span>
                    </button>
                    <div className="flex items-center space-x-4">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Page {pageNumber + 1}
                        </span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(parseInt(e.target.value));
                                setPageNumber(0);
                            }}
                            className={`px-3 py-2 border rounded-lg text-sm ${
                                theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                        >
                            <option value={15}>15 per page</option>
                            <option value={30}>30 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setPageNumber(prev => prev + 1)}
                        className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <span>Next</span>
                        <IoArrowForward className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {renderCreateEmployeeModal()}

            {/* RIGHT-CLICK CONTEXT MENU */}
            <AnimatePresence>
                {contextMenu.visible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className={`fixed z-50 border-2 rounded-lg shadow-2xl py-2 min-w-[140px] ${
                            theme === 'dark'
                                ? 'bg-gray-800 border-gray-600'
                                : 'bg-white border-gray-200'
                            }`}
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button
                            onClick={() => handleChatClick(contextMenu.employee)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center space-x-2 ${
                                theme === 'dark'
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                        >
                            <IoChatbubbleOutline className="w-4 h-4" />
                            <span>Start Chat</span>
                        </button>

                        {hasManagementAccess && (
                            <>
                                <div className={`h-px mx-4 my-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                <button
                                    onClick={() => handleViewProfileClick(contextMenu.employee)}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center space-x-2 ${
                                        theme === 'dark'
                                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    <IoPersonOutline className="w-4 h-4" />
                                    <span>View Profile</span>
                                </button>
                                <button
                                    onClick={() => handleDocumentsClick(contextMenu.employee)}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center space-x-2 ${
                                        theme === 'dark'
                                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    <IoDocumentsOutline className="w-4 h-4" />
                                    <span>Documents</span>
                                </button>
                                <button
                                    onClick={() => handleAboutClick(contextMenu.employee)}
                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center space-x-2 ${
                                        theme === 'dark'
                                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    <IoInformationCircleOutline className="w-4 h-4" />
                                    <span>About</span>
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CSS FOR 3D FLIP EFFECT */}
            <style jsx>{`
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideIn { from { transform: translateX(-10px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-slideUp { animation: slideUp 0.4s ease-out; }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
                .animate-spin-slow {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default EmployeeApp;
