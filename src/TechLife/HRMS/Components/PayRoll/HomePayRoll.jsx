import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Context } from "../HrmsContext";
import {
  IoMenu,
  IoClose,
  IoAddCircleOutline,
  IoCalendarOutline,
  IoSearchOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoChevronUpOutline,
  IoChevronDownOutline
} from 'react-icons/io5';

const SearchInput = React.memo(({ searchTerm, setSearchTerm, isDark }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const inputRef = useRef(null);

  // Update local state when prop changes (from outside)
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        setSearchTerm(localSearchTerm);
      }
    }, 800); //

    return () => clearTimeout(timer);
  }, [localSearchTerm, searchTerm, setSearchTerm]);

  const handleChange = (e) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    setSearchTerm('');
  
    inputRef.current?.focus();
  };

  return (
    <div className="flex-1">
      <label htmlFor="search-input" className={`block text-sm font-medium mb-2 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Search Employees
      </label>
      <div className="relative">
        <IoSearchOutline className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        } w-5 h-5`} />
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          placeholder="Search by name, role, or employee ID"
          value={localSearchTerm}
          onChange={handleChange}
          className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
          }`}
        />
        {localSearchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
              isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <IoClose className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});

const HomePayRoll = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("accessToken");
  const { theme } = useContext(Context);
  const isDark = theme === "dark";
  const [matchedArray, setMatchedArray] = useState([]);

  const formDataRef = useRef({
    employeeId: '',
    empName: '',
    email: '',
    phoneNumber: '',
    designation: '',
    department: '',
    jobType: '',
    level: '',
    startDate: '',
    annualSalary: '',
    stipend: '',
    accountNumber: '',
    ifsccode: '',
    bankName: '',
    pfnum: '',
    panNumber: '',
    aadharNumber: '',
    uanNumber: ''
  });

  const [formKey, setFormKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.get(
        'https://hrms.anasolconsultancyservices.com/api/payroll/jobdetails/getall',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.success) {
        setEmployees(response.data.data || []);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  // Navigation to payroll page
  const handleViewMonthly = () => {
    navigate('/payroll/employee');
  };



const handleViewPayroll = (employeeId) => {
  console.log('Navigating to employee payroll details with ID:', employeeId);
  if (!employeeId) {
    console.error('No employee ID provided');
    return;
  }
  
  navigate(`/payroll/employee/${employeeId}`);
};

 const handleCreateEmployee = async (e) => {
  e.preventDefault();
  try {
    // Get the current job type
    const jobType = formDataRef.current.jobType;
    const isIntern = jobType === 'Intern';
    
    // Handle stipend based on job type
    let stipendValue = null;
    if (isIntern) {
      if (!formDataRef.current.stipend || formDataRef.current.stipend.trim() === '') {
        alert('Stipend is required for intern positions');
        return;
      }
      stipendValue = parseFloat(formDataRef.current.stipend);
    } else {
      // For non-intern roles, set stipend to null if empty, otherwise parse it
      stipendValue = formDataRef.current.stipend && formDataRef.current.stipend.trim() !== '' 
        ? parseFloat(formDataRef.current.stipend) 
        : null;
    }

    const employeeData = {
      employeeId: formDataRef.current.employeeId,
      empName: formDataRef.current.empName,
      email: formDataRef.current.email,
      phoneNumber: formDataRef.current.phoneNumber,
      designation: formDataRef.current.designation,
      department: formDataRef.current.department,
      annualSalary: parseFloat(formDataRef.current.annualSalary) || 0,
      stipend: parseFloat(formDataRef.current.stipend) || 0,
      jobType: jobType,
      level: formDataRef.current.level,
      startDate: formDataRef.current.startDate,
      accountNumber: parseInt(formDataRef.current.accountNumber),
      ifsccode: formDataRef.current.ifsccode,
      bankName: formDataRef.current.bankName,
      pfnum: formDataRef.current.pfnum,
      panNumber: formDataRef.current.panNumber,
      aadharNumber: parseInt(formDataRef.current.aadharNumber),
      uanNumber: formDataRef.current.uanNumber
    };

    console.log('Sending employee data:', employeeData); // Debug log

    const response = await axios.post(
      'https://hrms.anasolconsultancyservices.com/api/payroll/jobdetails/create',
      employeeData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data && response.data.success) {
      alert('Employee created successfully!');
      setShowCreateForm(false);
      formDataRef.current = {
        employeeId: '',
        empName: '',
        email: '',
        phoneNumber: '',
        designation: '',
        department: '',
        jobType: '',
        level: '',
        startDate: '',
        annualSalary: '',
        stipend: '',
        accountNumber: '',
        ifsccode: '',
        bankName: '',
        pfnum: '',
        panNumber: '',
        aadharNumber: '',
        uanNumber: ''
      };
      setFormKey(prev => prev + 1);
      fetchEmployees();
    } else {
      alert('Failed to create employee: ' + (response.data?.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error creating employee:', err);
    const errorMessage = err.response?.data?.message || err.message;
    if (errorMessage.includes('already exists')) {
      alert(`Employee ID ${formDataRef.current.employeeId} already exists. Please use a different ID.`);
    } else {
      alert('Failed to create employee: ' + errorMessage);
    }
  }
};

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    formDataRef.current[name] = value;
  };

  const handleCreateEmployeeClick = () => {
    setShowCreateForm(true);
    setIsMobileMenuOpen(false);
  };

  const MobileSidebar = () => {
    if (!isMobileMenuOpen) return null;

    return (
      <div className={`fixed inset-0 z-50 lg:hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        <div className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] transform transition-transform duration-300 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-2xl`}>
          <div className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Quick Actions
            </h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {matchedArray.includes("GET_PAYROLL_MONTHLY") && (
              <button
                onClick={handleViewMonthly}
                className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                  isDark 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                } transform hover:scale-105`}
              >
                <IoCalendarOutline className="w-5 h-5" />
                <span>View Monthly</span>
              </button>
            )}

            {matchedArray.includes("CREATE_PAYROLL") && (
              <button
                onClick={handleCreateEmployeeClick}
                className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
                } transform hover:scale-105`}
              >
                <IoAddCircleOutline className="w-5 h-5" />
                <span>Create Employee</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteEmployee = async (employeeId, event) => {
    event.stopPropagation();

    if (window.confirm(`Are you sure you want to delete employee ${employeeId}?`)) {
      try {
        const response = await axios.delete(`https://hrms.anasolconsultancyservices.com/api/payroll/jobdetails/${employeeId}/delete`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data && response.data.success) {
          alert('Employee deleted successfully!');
          fetchEmployees();
        } else {
          alert('Failed to delete employee: ' + (response.data?.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error deleting employee:', err);
        alert('Failed to delete employee: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Memoized functions to prevent unnecessary re-renders
  const groupEmployeesByDepartment = useCallback(() => {
    const grouped = {};
    employees.forEach(employee => {
      const dept = employee.department || 'Unassigned';
      if (!grouped[dept]) {
        grouped[dept] = [];
      }
      grouped[dept].push(employee);
    });
    return grouped;
  }, [employees]);

  const getSeniorEmployees = useCallback((departmentEmployees) => {
    const sorted = departmentEmployees.sort((a, b) => {
      const levelOrder = { 'Senior': 3, 'Mid-Level': 2, 'Junior': 1, 'Lead': 4, 'Manager': 5 };
      return (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
    });
    return sorted.slice(0, 6);
  }, []);

  const toggleDepartmentExpansion = useCallback((department) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [department]: !prev[department]
    }));
  }, []);

  // Memoized values
  const departments = useMemo(() => 
    ['All', ...new Set(employees.map(emp => emp.department))], 
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (!emp) return false;
      
      const matchesDepartment = selectedDepartment === 'All' || emp.department === selectedDepartment;
      
      if (searchTerm.trim() === '') {
        return matchesDepartment;
      }
      
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        (emp.empName?.toLowerCase().includes(searchLower) || false) ||
        (emp.designation?.toLowerCase().includes(searchLower) || false) ||
        (emp.employeeId?.toLowerCase().includes(searchLower) || false);

      return matchesDepartment && matchesSearch;
    });
  }, [employees, selectedDepartment, searchTerm]);

  const groupedEmployeesWithSearch = useMemo(() => {
    const grouped = {};
    filteredEmployees.forEach(employee => {
      const dept = employee.department || 'Unassigned';
      if (!grouped[dept]) {
        grouped[dept] = [];
      }
      grouped[dept].push(employee);
    });
    return grouped;
  }, [filteredEmployees]);

  const getLevelColor = useCallback((level, jobType) => {  
  if (jobType === 'Intern') return 'bg-pink-500';  
  switch (level) {
    case 'Senior': return 'bg-red-500';
    case 'Mid-Level': return 'bg-yellow-500';
    case 'Junior': return 'bg-green-500';
    case 'Lead': return 'bg-purple-500';
    case 'Manager': return 'bg-indigo-500';
    default: return 'bg-gray-500';
  }
}, []);

const EmployeeCard = useCallback(({ employee, onDelete, onViewPayroll }) => {
  const isIntern = employee.jobType === 'Intern';  // ← Check if intern
  
  return (
    <div className={`rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative ${
      isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'
    }`}>
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <h3 className={`text-lg sm:text-xl font-semibold flex-1 pr-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {employee.empName}
        </h3>
        <div className="flex items-center gap-2">
          {/* Show Intern badge if job type is Intern */}
          {isIntern && (
            <span className={`px-2 py-1 rounded-full text-white text-xs font-medium bg-pink-500 whitespace-nowrap`}>
              Intern
            </span>
          )}
          {/* Show level badge for non-interns */}
          {!isIntern && (
            <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${getLevelColor(employee.level, employee.jobType)} whitespace-nowrap`}>
              {employee.level}
            </span>
          )}
          <button
            onClick={(e) => onDelete(employee.employeeId, e)}
            className={`p-1 text-red-500 hover:text-red-700 rounded-full transition-colors flex-shrink-0 ${
              isDark ? 'hover:bg-red-900' : 'hover:bg-red-100'
            }`}
            title="Delete Employee"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <p className={`font-medium mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
        {employee.designation}
        {isIntern && <span className="text-sm ml-2 text-gray-500">(Intern)</span>}
      </p>
      <p className={`text-sm mb-3 sm:mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ID: {employee.employeeId}</p>

      <div className={`border-t pt-3 sm:pt-4 mt-3 sm:mt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{employee.email}</div>
        <div className={`text-sm mb-2 sm:mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{employee.phoneNumber}</div>

        <div className="flex justify-between items-center">
          <span className={`font-semibold text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            {/* Show stipend for interns, annual salary for others */}
            {isIntern ? (
              <>
                Monthly Stipend: ₹{(employee.stipend || 0).toLocaleString()}
              </>
            ) : (
              <>
                Annual: ₹{((employee.annualSalary || 0) * 100000).toLocaleString()}
              </>
            )}
          </span>
       
          <button
            onClick={() => onViewPayroll(employee.employeeId)}
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}, [isDark, getLevelColor]);

// Department Section Component
const DepartmentSection = useCallback(({ department, employees }) => {
  const isExpanded = expandedDepartments[department];
  const displayEmployees = isExpanded ? employees : getSeniorEmployees(employees);

  return (
    <div className="mb-8">
      <div className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-slate-800 rounded-r-lg shadow-sm mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg">
              <IoBusinessOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {department}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {employees.length} employees • {employees.filter(e => e.level === 'Senior').length} senior
              </p>
            </div>
          </div>
          
          
          
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Department</div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {displayEmployees.map(employee => (
          <EmployeeCard 
            key={employee.employeeId} 
            employee={employee} 
            onDelete={handleDeleteEmployee}
            onViewPayroll={handleViewPayroll} 
          />
        ))}
      </div>

      {employees.length > 6 && (
        <div className="text-center border-t dark:border-gray-700 pt-4">
          <button
            onClick={() => toggleDepartmentExpansion(department)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm hover:shadow-md"
          >
            {isExpanded ? (
              <>
                <IoChevronUpOutline className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                View All {employees.length} Employees
                <IoChevronDownOutline className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}, [expandedDepartments, getSeniorEmployees, toggleDepartmentExpansion, EmployeeCard]);

  // Create Employee Form Component
const CreateEmployeeForm = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [currentJobType, setCurrentJobType] = useState('');

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone) return 'Phone number is required';
    if (!phoneRegex.test(phone)) return 'Phone number must be 10 digits starting with 6, 7, 8, or 9';
    return '';
  };

  const validateAadharNumber = (aadhar) => {
    const aadharRegex = /^\d{12}$/;
    if (!aadhar) return 'Aadhar number is required';
    if (!aadharRegex.test(aadhar)) return 'Aadhar number must be exactly 12 digits';
    return '';
  };

  const validateEmployeeId = (empId) => {
    if (!empId) return 'Employee ID is required';
    if (empId.length < 3) return 'Employee ID must be at least 3 characters';
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'phoneNumber':
        return validatePhoneNumber(value);
      case 'aadharNumber':
        return validateAadharNumber(value);
      case 'employeeId':
        return validateEmployeeId(value);
      default:
        return '';
    }
  };
  const validateStipend = (stipend, jobType) => {
  if (jobType === 'Intern') {
    if (!stipend) return 'Stipend is required for interns';
    if (isNaN(stipend) || parseFloat(stipend) <= 0) return 'Stipend must be a positive number';
  }
  return '';
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    formDataRef.current[name] = value;

      if (name === 'jobType') {
    setCurrentJobType(value);
  }
    
    // Validate field if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  
  // Mark all fields as touched
  const allFields = ['employeeId', 'empName', 'email', 'phoneNumber', 'designation', 
                    'department', 'jobType', 'level', 'startDate', 'annualSalary',
                    'stipend', 'accountNumber', 'bankName', 'ifsccode', 'panNumber', 
                    'aadharNumber', 'uanNumber'];
  
  const newTouched = {};
  const newErrors = {};
  
  allFields.forEach(field => {
    newTouched[field] = true;
    newErrors[field] = validateField(field, formDataRef.current[field]);
  });
  
  // Special validation for stipend when job type is Intern
  if (currentJobType === 'Intern') {
    newErrors.stipend = validateStipend(formDataRef.current.stipend, currentJobType);
  }
  
  setTouched(newTouched);
  setErrors(newErrors);
  
  // Check if there are any errors
  const hasErrors = Object.values(newErrors).some(error => error !== '');
  
  if (!hasErrors) {
    handleCreateEmployee(e);
  } else {
    // Scroll to first error
    const firstErrorField = Object.keys(newErrors).find(field => newErrors[field]);
    const element = document.querySelector(`[name="${firstErrorField}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  }
};

  // Helper component for input fields with validation
  const FormField = ({ label, name, type = "text", required = true, placeholder = "", children }) => (
    <div>
      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label} {required && '*'}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          defaultValue={formDataRef.current[name]}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-800'
          } ${
            errors[name] && touched[name] 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : ''
          }`}
        />
      )}
      {errors[name] && touched[name] && (
        <p className="text-red-500 text-xs mt-1 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50">
      <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex justify-between items-center p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Create New Employee</h2>
          <button
            onClick={() => setShowCreateForm(false)}
            className={`text-2xl ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6" key={formKey}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold border-b pb-2 ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>Basic Information</h3>

              <FormField 
                label="Employee ID" 
                name="employeeId"
                placeholder="e.g., EMP001"
              />

              <FormField 
                label="Full Name" 
                name="empName"
                placeholder="Enter full name"
              />

              <FormField 
                label="Email" 
                name="email"
                type="email"
                placeholder="employee@company.com"
              />

              <FormField 
                label="Phone Number" 
                name="phoneNumber"
                type="tel"
                placeholder="9876543210"
              />
            </div>

            {/* Job Details */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold border-b pb-2 ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>Job Details</h3>

              <FormField 
                label="Designation" 
                name="designation"
                placeholder="Enter designation"
              />

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Department *</label>
                <select
                  name="department"
                  defaultValue={formDataRef.current.department}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  } ${
                    errors.department && touched.department 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : ''
                  }`}
                >
                  <option value="">Select Department</option>
                  <option value="HR">HR</option>
                  <option value="Admin">Admin</option>
                  <option value="IT">IT</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                </select>
                {errors.department && touched.department && (
                  <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Job Type *</label>
                <select
                  name="jobType"
                  defaultValue={formDataRef.current.jobType}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  } ${
                    errors.jobType && touched.jobType 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : ''
                  }`}
                >
                  <option value="">Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
                {errors.jobType && touched.jobType && (
                  <p className="text-red-500 text-xs mt-1">{errors.jobType}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Level *</label>
                <select
                  name="level"
                  defaultValue={formDataRef.current.level}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  } ${
                    errors.level && touched.level 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : ''
                  }`}
                >
                  <option value="">Select Level</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Manager">Manager</option>
                </select>
                {errors.level && touched.level && (
                  <p className="text-red-500 text-xs mt-1">{errors.level}</p>
                )}
              </div>

              <FormField 
                label="Start Date" 
                name="startDate"
                type="date"
              />
            </div>

            <div className="space-y-4">
              <h3 className={`text-lg font-semibold border-b pb-2 ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>Salary & Bank</h3>
              
             <FormField 
    label="Monthly Stipend" 
    name="stipend"
    type="number"
    step="0.01"
    placeholder="e.g., 15000"
    required={currentJobType === 'Intern'}
  />
  {currentJobType === 'Intern' && (
    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
      Stipend is required for intern positions
    </p>
  )}
  {currentJobType !== 'Intern' && currentJobType !== '' && (
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
      Stipend is optional for non-intern positions
    </p>
  )}
              <FormField 
                label="Annual Salary (LPA)" 
                name="annualSalary"
                type="number"
                step="0.1"
                placeholder="e.g., 6.0"
              />

              <FormField 
                label="Account Number" 
                name="accountNumber"
                type="number"
                placeholder="1234567890"
              />

              <FormField 
                label="Bank Name" 
                name="bankName"
                placeholder="Enter bank name"
              />

              <FormField 
                label="IFSC Code" 
                name="ifsccode"
                placeholder="e.g., SBIN0001234"
              />
            </div>

            <div className="space-y-4">
              <h3 className={`text-lg font-semibold border-b pb-2 ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>Government IDs</h3>

              <FormField 
                label="PAN Number" 
                name="panNumber"
                placeholder="e.g., ABCDE1234F"
              />

              <FormField 
                label="Aadhar Number" 
                name="aadharNumber"
                type="number"
                placeholder="123456789012"
              />

              <FormField 
                label="UAN Number" 
                name="uanNumber"
                placeholder="Enter UAN number"
              />

              <FormField 
                label="PF Number" 
                name="pfnum"
                required={false}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className={`flex justify-end space-x-3 mt-8 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={Object.values(errors).some(error => error !== '')}
            >
              Create Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
  

const Directory = () => {

    useEffect(() => {
    if (employees.length > 0) {
      console.log('Employees data:', employees);
      // Check specific intern employees
      const internEmployees = employees.filter(emp => emp.jobType === 'Intern');
      console.log('Intern employees:', internEmployees);
      internEmployees.forEach(emp => {
        console.log(`Employee ${emp.employeeId} - Stipend:`, emp.stipend, 'Type:', typeof emp.stipend);
      });
    }
  }, [employees]);
  
    if (loading) {
      return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading employees...</span>
          </div>
        </div>
      );
    }
    

    if (error) {
      return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className={`text-center py-8 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </div>
        </div>
      );
    }

    if (selectedDepartment !== 'All') {
      return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className={`text-2xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {selectedDepartment} Department
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {filteredEmployees.length} employees in {selectedDepartment}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => setSelectedDepartment('All')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                Back to All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredEmployees.map(employee => (
              <EmployeeCard
                key={employee.employeeId}
                employee={employee}
                onDelete={handleDeleteEmployee}
                onViewPayroll={handleViewPayroll}
              />
            ))}
          </div>
          

          {filteredEmployees.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                No employees found
              </h3>
              <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                No employees in {selectedDepartment} match "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header with Buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
          <div className="text-center lg:text-left flex-1">
            <h1 className={`text-2xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Employee Directory
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {employees.length} employees across all departments
              {searchTerm && ` • ${filteredEmployees.length} matching "${searchTerm}"`}
            </p>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden lg:flex gap-3">
            <button
              onClick={handleViewMonthly}
              className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2 text-sm sm:text-base"
            >
              <IoCalendarOutline className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>View Monthly</span>
            </button>
            <button
              onClick={handleCreateEmployeeClick}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 text-sm sm:text-base"
            >
              <IoAddCircleOutline className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Create Employee</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <IoMenu className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className={`flex flex-col lg:flex-row gap-4 mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg shadow-lg ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex-1">
            <label htmlFor="department-select" className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Filter by Department
            </label>
            <select
              id="department-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
              }`}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Use the memoized SearchInput component */}
          <SearchInput 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            isDark={isDark} 
          />
        </div>

        {/* Show departments with filtered employees */}
        {Object.keys(groupedEmployeesWithSearch).length > 0 ? (
          Object.keys(groupedEmployeesWithSearch).map(department => (
            <DepartmentSection
              key={department}
              department={department}
              employees={groupedEmployeesWithSearch[department]}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              No employees found
            </h3>
            <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
              {searchTerm ? `No employees match "${searchTerm}"` : 'Try adjusting your search or filter criteria'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <MobileSidebar />
      <Directory />
      {showCreateForm && <CreateEmployeeForm />}
    </div>
  );
};

export default HomePayRoll;