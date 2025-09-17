import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Context } from "../HrmsContext";
import { publicinfoApi } from "../../../../axiosInstance";
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
  IoPeopleOutline,
  IoTrashOutline,
} from "react-icons/io5";

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
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[250] p-2 sm:p-4">
      <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md m-2 sm:m-4 border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center mb-3 sm:mb-4">
          {icon && <span className="mr-2 sm:mr-3">{icon}</span>}
          <h3 className={`text-lg sm:text-xl font-bold ${titleClass}`}>{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
};

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
  const { empID } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});

  // State for card flipping
  const [flippedCard, setFlippedCard] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, employee: null });

  // New state for modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    displayName: '',
    maritalStatus: '',
    employeeId: '',
    departmentId: '',
  });
  const [errors, setErrors] = useState({});

  // State for popups
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, employee: null });

  // New state for pagination
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [sortBy, setSortBy] = useState('employeeId');
  const [sortOrder, setSortOrder] = useState('asc');

  // Get the user's role and check permissions
  const userRole = userData?.roles?.[0]?.toUpperCase();
  const hasManagementAccess = ['ADMIN', 'MANAGER', 'HR'].includes(userRole);

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

  // Navigation handlers
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

    try {
      await publicinfoApi.delete(`employee/${employee.employeeId}`);
      setEmployeeData(prevData => prevData.filter(emp => emp.employeeId !== employee.employeeId));
      setPopup({ show: true, message: `Employee ${employee.displayName} has been deleted.`, type: 'success' });
    } catch (err) {
      console.error("Error deleting employee:", err);
      setPopup({ show: true, message: 'Failed to delete employee. Please try again.', type: 'error' });
    } finally {
      setDeleteConfirmation({ show: false, employee: null });
      setFlippedCard(null);
    }
  };

  useEffect(() => {
    const fetchAllEmployees = async () => {
      try {
        setLoading(true);
        const response = await publicinfoApi.get(`employee/${pageNumber}/${pageSize}/${sortBy}/${sortOrder}/employees`);
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

  // Form validation and submission
  const validateFormData = (data) => {
    const errors = {};
    if (!data.employeeId || !/^ACS\d{8}$/.test(data.employeeId)) {
      errors.employeeId = "Employee ID must start with 'ACS' followed by 8 digits.";
    }
    if (!data.firstName) {
      errors.firstName = "First name is required.";
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
      await publicinfoApi.post('employee', newEmployee);
      setPopup({ show: true, message: 'Employee created successfully!', type: 'success' });
      setIsFormOpen(false);
      
      // Refresh employee list
      const response = await publicinfoApi.get(`employee/${pageNumber}/${pageSize}/${sortBy}/${sortOrder}/employees`);
      setEmployeeData(response.data);
      setNewEmployee({
        firstName: '',
        middleName: '',
        lastName: '',
        displayName: '',
        maritalStatus: '',
        employeeId: '',
        departmentId: '',
      });
    } catch (error) {
      console.error("Error creating employee:", error);
      const errorMessage = error.response?.data?.message || 'Failed to create employee. Please check the provided data.';
      setErrors({ general: errorMessage });
      setPopup({ show: true, message: errorMessage, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const renderField = (label, name, type = 'text', required = false, options = []) => {
    const isError = errors[name];
    const fieldValue = newEmployee[name] || '';

    return (
      <div className="group relative" key={name}>
        <label className={`block text-xs sm:text-sm font-semibold mb-2 flex items-center ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          {label}
          {required && <span className="text-red-500 ml-1 text-sm">*</span>}
        </label>
        
        {type === 'select' ? (
          <div className="relative">
            <select 
              name={name}
              value={fieldValue} 
              onChange={handleFormChange} 
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg transition-all duration-300 appearance-none text-sm
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                ${isError 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                  : theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <option value="">Choose {label}</option>
              {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          </div>
        ) : (
          <input 
            type={type} 
            name={name}
            value={fieldValue} 
            onChange={handleFormChange} 
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg transition-all duration-300 text-sm
              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
              ${isError 
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                : theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            placeholder={`Enter ${label.toLowerCase()}...`} 
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

  const renderCreateEmployeeModal = () => {
    if (!isFormOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-2 sm:p-4">
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -50, opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`relative w-full max-w-sm sm:max-w-md lg:max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl rounded-xl sm:rounded-2xl ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="text-lg sm:text-2xl">
                  <IoAddCircleOutline />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold break-words">Create New Employee</h2>
                  <p className="text-white/90 text-xs sm:text-sm break-words">Fill in the details to add a new employee to the system.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 group flex-shrink-0"
              >
                <IoClose className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
            <form className="p-4 sm:p-6" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {renderField("Employee ID", "employeeId", "text", true)}
                {renderField("First Name", "firstName", "text", true)}
                {renderField("Middle Name", "middleName", "text")}
                {renderField("Last Name", "lastName", "text")}
                {renderField("Display Name", "displayName", "text")}
                {renderField("Marital Status", "maritalStatus", "select", false, ["Single", "Married", "Divorced", "Widowed"])}
                {renderField("Department ID", "departmentId", "text")}
              </div>
              {errors.general && (
                <div className={`mt-4 p-3 sm:p-4 border-l-4 border-red-400 rounded-r-lg ${
                  theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                }`}>
                  <div className="flex items-center">
                    <IoWarning className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-3" />
                    <p className={`font-medium text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>{errors.general}</p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 border-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                theme === 'dark' 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              onClick={handleFormSubmit}
              disabled={isUpdating}
              className={`w-full sm:w-auto px-6 sm:px-8 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 ${
                isUpdating ? 'cursor-not-allowed opacity-75' : ''
              }`}
            >
              {isUpdating ? (
                <>
                  <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
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

  return (
    <div className={`min-h-screen px-0 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`rounded-none sm:rounded-xl p-4 sm:p-6 shadow-lg border mb-6 sm:mb-8 mx-4 sm:mx-0 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative group max-w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoSearchOutline className={`h-4 w-4 sm:h-5 sm:w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                className={`w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-300 placeholder-gray-500 text-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300'
                }`}
                placeholder="Search by Name, Email, or Employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {dynamicFilters.map(filter => {
                const IconComponent = filter.icon;
                return (
                  <div key={filter.name} className="relative group min-w-0 flex-1 sm:flex-initial">
                    <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                      <IconComponent className={`h-3 w-3 sm:h-4 sm:w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <select
                      className={`pl-7 sm:pl-9 pr-6 sm:pr-8 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-300 appearance-none cursor-pointer min-w-[120px] sm:min-w-[140px] text-xs sm:text-sm truncate ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                      value={selectedFilters[filter.name]}
                      onChange={(e) => setSelectedFilters({
                        ...selectedFilters,
                        [filter.name]: e.target.value,
                      })}
                    >
                      {filter.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
                      <IoChevronDownOutline className={`h-3 w-3 sm:h-4 sm:w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={clearFilters}
                className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <IoRefreshOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Clear</span>
              </button>
              
              {hasManagementAccess && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
                >
                  <IoAddCircleOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Add Employee</span>
                </button>
              )}

              {/* View Mode Toggle */}
              <div className={`flex rounded-lg p-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 sm:p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? (theme === 'dark' ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                      : (theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                  }`}
                >
                  <IoGridOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 sm:p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? (theme === 'dark' ? 'bg-gray-600 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                      : (theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                  }`}
                >
                  <IoListOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 mx-4 sm:mx-0">
          <h3 className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {filteredEmployees.length} Employee{filteredEmployees.length !== 1 ? 's' : ''} Found
          </h3>
        </div>

        {/* Employee Cards/List */}
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
              <IoPersonOutline className={`w-8 h-8 sm:w-10 sm:h-10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
            </div>
            <h2 className={`text-lg sm:text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>No Employees Found</h2>
            <p className={`text-sm sm:text-base mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Try adjusting your search terms or filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
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
                    // GRID VIEW WITH 3D FLIP
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
                      {/* FRONT SIDE */}
                      <div 
                        className={`absolute inset-0 w-full h-full rounded-xl shadow-lg border cursor-pointer group backface-hidden transform-gpu transition-all duration-300 hover:shadow-xl ${
                          theme === 'dark' 
                            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50' 
                            : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-400/50'
                        } hover:scale-105`}
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <div className="flex flex-col items-center text-center h-full justify-center p-4 sm:p-5 relative overflow-hidden">
                          {/* Background Pattern */}
                          <div className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 opacity-10">
                            <div className={`w-full h-full rounded-full ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'} transform translate-x-10 sm:translate-x-12 -translate-y-10 sm:-translate-y-12`}></div>
                          </div>

                          {/* Profile Picture */}
                          <div className="relative mb-3 sm:mb-4 z-10">
                            {employee.employeeImage ? (
                              <div className="relative">
                                <img
                                  src={employee.employeeImage}
                                  alt={`${employee.displayName}'s profile picture`}
                                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border-4 border-gradient-to-r from-blue-400 to-indigo-500 shadow-xl group-hover:border-blue-400 transition-all duration-300 transform group-hover:scale-110"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-xl group-hover:from-blue-600 group-hover:via-indigo-600 group-hover:to-purple-700 transition-all duration-300 transform group-hover:scale-110">
                                  {generateInitials(employee.displayName)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                              </div>
                            )}
                          </div>

                          {/* Employee Info */}
                          <div className="w-full z-10">
                            <h3 className={`text-base sm:text-lg font-bold mb-2 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {employee.displayName}
                            </h3>
                            <p className="text-blue-600 font-semibold mb-3 text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                              {employee.jobTitlePrimary}
                            </p>

                            {/* Employee Details */}
                            <div className="space-y-1 sm:space-y-2 text-xs">
                              {/* Employee ID */}
                              <div className={`flex items-center justify-center space-x-2 p-1 sm:p-2 rounded-md ${
                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                              }`}>
                                <IoIdCardOutline className={`w-3 h-3 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                                <span className="truncate font-mono text-xs">{employee.employeeId}</span>
                              </div>

                              <div className={`flex items-center justify-center space-x-2 p-1 sm:p-2 rounded-md ${
                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                              }`}>
                                <IoBriefcaseOutline className={`w-3 h-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                                <span className="truncate">{employee.departmentId || 'N/A'}</span>
                              </div>

                              <div className={`flex items-center justify-center space-x-2 p-1 sm:p-2 rounded-md ${
                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                              }`}>
                                <IoLocationOutline className={`w-3 h-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                                <span className="truncate">{employee.location || 'N/A'}</span>
                              </div>

                              <div className={`flex items-center justify-center space-x-2 p-1 sm:p-2 rounded-md ${
                                theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
                              }`}>
                                <IoMailOutline className={`w-3 h-3 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
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
                            {/* Start Chat */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleChatClick(employee);
                              }}
                              className={`w-full flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm ${
                                theme === 'dark'
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg'
                              }`}
                            >
                              <IoChatbubbleOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="font-medium">Start Chat</span>
                            </button>

                            {hasManagementAccess && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProfileClick(employee);
                                }}
                                className={`w-full flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm ${
                                  theme === 'dark'
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg'
                                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                                }`}
                              >
                                <IoPersonOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="font-medium">View Profile</span>
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDocumentsClick(employee);
                              }}
                              className={`w-full flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm ${
                                theme === 'dark'
                                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg'
                                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg'
                              }`}
                            >
                              <IoDocumentsOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="font-medium">Documents</span>
                            </button>

                            {/* View Teams Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTeamsClick(employee);
                              }}
                              className={`w-full flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm ${
                                theme === 'dark'
                                  ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg'
                                  : 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg'
                              }`}
                            >
                              <IoPeopleOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="font-medium">View Teams</span>
                            </button>

                            {hasManagementAccess && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(employee);
                                }}
                                className={`w-full flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm ${
                                  theme === 'dark'
                                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg'
                                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg'
                                }`}
                              >
                                <IoTrashOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="font-medium">Delete Employee</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // LIST VIEW
                    <motion.div
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full rounded-xl shadow-lg border cursor-pointer group transition-all duration-300 hover:shadow-xl ${
                        theme === 'dark' 
                          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50' 
                          : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:border-blue-400/50'
                      }`}
                      onClick={() => navigate(`/employees/${empID}/public/${employee.employeeId}`)}
                    >
                      <div className="flex items-center p-3 sm:p-4 space-x-3 sm:space-x-4 relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 opacity-10">
                          <div className={`w-full h-full rounded-full ${theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'} transform translate-x-8 sm:translate-x-10 -translate-y-8 sm:-translate-y-10`}></div>
                        </div>

                        {/* Profile Image */}
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

                        {/* Employee Info */}
                        <div className="flex-1 min-w-0 z-10">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className={`text-sm sm:text-lg font-bold truncate mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {employee.displayName}
                              </h3>
                              <p className="text-blue-600 font-semibold mb-2 sm:mb-3 text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full inline-block">
                                {employee.jobTitlePrimary}
                              </p>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex items-center space-x-1 sm:space-x-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleChatClick(employee);
                                }}
                                className={`p-1 sm:p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                                  theme === 'dark' 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                } shadow-lg hover:shadow-xl`}
                                title="Start Chat"
                              >
                                <IoChatbubbleOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>

                              {hasManagementAccess && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewProfileClick(employee);
                                  }}
                                  className={`p-1 sm:p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                                    theme === 'dark' 
                                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                                      : 'bg-green-500 hover:bg-green-600 text-white'
                                  } shadow-lg hover:shadow-xl`}
                                  title="View Profile"
                                >
                                  <IoPersonOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDocumentsClick(employee);
                                }}
                                className={`p-1 sm:p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                                  theme === 'dark' 
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                                } shadow-lg hover:shadow-xl`}
                                title="Documents"
                              >
                                <IoDocumentsOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Employee Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 sm:gap-2 text-xs">
                            {/* Employee ID */}
                            <div className={`flex items-center space-x-1 p-1 sm:p-2 rounded-md ${
                              theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <IoIdCardOutline className={`w-3 h-3 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                              <span className="truncate font-mono text-xs">{employee.employeeId}</span>
                            </div>

                            <div className={`flex items-center space-x-1 p-1 sm:p-2 rounded-md ${
                              theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <IoBriefcaseOutline className={`w-3 h-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                              <span className="truncate">{employee.departmentId || 'N/A'}</span>
                            </div>

                            <div className={`flex items-center space-x-1 p-1 sm:p-2 rounded-md ${
                              theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <IoLocationOutline className={`w-3 h-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                              <span className="truncate">{employee.location || 'N/A'}</span>
                            </div>

                            <div className={`flex items-center space-x-1 p-1 sm:p-2 rounded-md ${
                              theme === 'dark' ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <IoMailOutline className={`w-3 h-3 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
                              <span className="truncate text-xs">{employee.workEmail || 'N/A'}</span>
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
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
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
              className={`px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-xs sm:text-sm ${
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
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>Next</span>
            <IoArrowForward className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {renderCreateEmployeeModal()}

      {/* Popup Messages */}
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
              className={`${popup.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold py-1 sm:py-2 px-4 sm:px-6 rounded-lg transition-colors text-sm`}
            >
              OK
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <Modal
          onClose={() => setDeleteConfirmation({ show: false, employee: null })}
          title="Confirm Deletion"
          type="confirm"
          theme={theme}
        >
          <p className={`mb-4 sm:mb-6 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Are you sure you want to delete employee <strong>{deleteConfirmation.employee?.displayName}</strong>? This action cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={() => setDeleteConfirmation({ show: false, employee: null })}
              className={`w-full sm:w-auto px-4 sm:px-6 py-1 sm:py-2 rounded-lg font-semibold transition-colors text-sm ${
                theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="w-full sm:w-auto px-4 sm:px-6 py-1 sm:py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors text-sm"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
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
