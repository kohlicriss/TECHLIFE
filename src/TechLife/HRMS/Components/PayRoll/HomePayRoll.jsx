import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Context } from "../HrmsContext";
import {
  IoMenu,
  IoClose,
  IoAddCircleOutline,
  IoCalendarOutline,
  IoSearchOutline,

} from 'react-icons/io5';

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
  const [matchedArray,setMatchedArray]=useState([]);

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

      console.log('API Response:', response.data);

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
    navigate(`/payroll/employee/${employeeId}`);
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        employeeId: formDataRef.current.employeeId,
        empName: formDataRef.current.empName,
        email: formDataRef.current.email,
        phoneNumber: formDataRef.current.phoneNumber,
        designation: formDataRef.current.designation,
        department: formDataRef.current.department,
        annualSalary: parseFloat(formDataRef.current.annualSalary),
        jobType: formDataRef.current.jobType,
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

      console.log('Sending employee data:', employeeData);

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
        // Reset form data
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
      <div className={`fixed inset-0 z-50 lg:hidden ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] transform transition-transform duration-300 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } shadow-2xl`}>
          {/* Header */}
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

          {/* Action Buttons */}
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

  const groupEmployeesByDepartment = () => {
    const grouped = {};

    employees.forEach(employee => {
      const dept = employee.department || 'Unassigned';
      if (!grouped[dept]) {
        grouped[dept] = [];
      }
      grouped[dept].push(employee);
    });

    return grouped;
  };

  const getSeniorEmployees = (departmentEmployees) => {
    const sorted = departmentEmployees.sort((a, b) => {
      const levelOrder = { 'Senior': 3, 'Mid-Level': 2, 'Junior': 1, 'Lead': 4, 'Manager': 5 };
      return (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0);
    });

    return sorted.slice(0, 6);
  };

  const toggleDepartmentExpansion = (department) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [department]: !prev[department]
    }));
  };

  const departments = ['All', ...new Set(employees.map(emp => emp.department))];
  const groupedEmployees = groupEmployeesByDepartment();

  const filteredEmployees = employees.filter(emp => {
    const matchesDepartment = selectedDepartment === 'All' || emp.department === selectedDepartment;
    const matchesSearch = searchTerm === '' ||
      emp.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDepartment && matchesSearch;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'Senior': return 'bg-red-500';
      case 'Mid-Level': return 'bg-yellow-500';
      case 'Junior': return 'bg-green-500';
      case 'Lead': return 'bg-purple-500';
      case 'Manager': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

   const EmployeeCard = ({ employee, onDelete, onViewPayroll }) => {
    return (
      <div className={`rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative ${
        isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'
      }`}>
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <h3 className={`text-lg sm:text-xl font-semibold flex-1 pr-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {employee.empName}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${getLevelColor(employee.level)} whitespace-nowrap`}>
              {employee.level}
            </span>
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

        <p className={`font-medium mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{employee.designation}</p>
        <p className={`text-sm mb-3 sm:mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ID: {employee.employeeId}</p>

        <div className={`border-t pt-3 sm:pt-4 mt-3 sm:mt-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{employee.email}</div>
          <div className={`text-sm mb-2 sm:mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{employee.phoneNumber}</div>

          <div className="flex justify-between items-center">
            <span className={`font-semibold text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              Annual: ₹{((employee.annualSalary || 0) * 100000).toLocaleString()}
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
  };
  // Department Section Component
  const DepartmentSection = ({ department, employees }) => {
    const isExpanded = expandedDepartments[department];
    const displayEmployees = isExpanded ? employees : getSeniorEmployees(employees);

return (
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4 p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{department} Department</h2>
            <p className="text-blue-100 text-sm">
              {employees.length} employees • {employees.filter(e => e.level === 'Senior').length} Seniors
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayEmployees.map(employee => (
            <EmployeeCard key={employee.employeeId} employee={employee} onDelete={handleDeleteEmployee}
              onViewPayroll={handleViewPayroll} />
          ))}
        </div>

        {employees.length > 6 && (
          <div className="text-center mt-4 sm:mt-6">
            <button
              onClick={() => toggleDepartmentExpansion(department)}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              {isExpanded ? 'Show Less' : `View All ${employees.length} Employees`}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Create Employee Form Component
  const CreateEmployeeForm = () => {
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

          <form onSubmit={handleCreateEmployee} className="p-6" key={formKey}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold border-b pb-2 ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>Basic Information</h3>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Employee ID *</label>
                  <input
                    type="text"
                    name="employeeId"
                    defaultValue={formDataRef.current.employeeId}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Full Name *</label>
                  <input
                    type="text"
                    name="empName"
                    defaultValue={formDataRef.current.empName}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={formDataRef.current.email}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    defaultValue={formDataRef.current.phoneNumber}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold border-b pb-2 ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>Job Details</h3>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Designation *</label>
                  <input
                    type="text"
                    name="designation"
                    defaultValue={formDataRef.current.designation}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Department *</label>
                  <select
                    name="department"
                    defaultValue={formDataRef.current.department}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
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
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Job Type *</label>
                  <select
                    name="jobType"
                    defaultValue={formDataRef.current.jobType}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  >
                    <option value="">Select Job Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Level *</label>
                  <select
                    name="level"
                    defaultValue={formDataRef.current.level}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  >
                    <option value="">Select Level</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={formDataRef.current.startDate}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={`text-lg font-semibold border-b pb-2 ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>Salary & Bank</h3>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Annual Salary (LPA) *</label>
                  <input
                    type="number"
                    step="0.1"
                    name="annualSalary"
                    defaultValue={formDataRef.current.annualSalary}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Account Number *</label>
                  <input
                    type="number"
                    name="accountNumber"
                    defaultValue={formDataRef.current.accountNumber}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    defaultValue={formDataRef.current.bankName}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>IFSC Code *</label>
                  <input
                    type="text"
                    name="ifsccode"
                    defaultValue={formDataRef.current.ifsccode}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={`text-lg font-semibold border-b pb-2 ${isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'}`}>Government IDs</h3>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>PAN Number *</label>
                  <input
                    type="text"
                    name="panNumber"
                    defaultValue={formDataRef.current.panNumber}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Aadhar Number *</label>
                  <input
                    type="number"
                    name="aadharNumber"
                    defaultValue={formDataRef.current.aadharNumber}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>UAN Number *</label>
                  <input
                    type="text"
                    name="uanNumber"
                    defaultValue={formDataRef.current.uanNumber}
                    onChange={handleFormChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>PF Number</label>
                  <input
                    type="text"
                    name="pfnum"
                    defaultValue={formDataRef.current.pfnum}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        </div>
      );
    }
    // Search Input Component
const SearchInput = React.memo(({ searchTerm, setSearchTerm, isDark }) => {
  const [localValue, setLocalValue] = useState(searchTerm);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (searchTerm !== localValue) {
      setLocalValue(searchTerm);
    }
  }, [searchTerm]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setSearchTerm(newValue);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
        } w-4 h-4 sm:w-5 sm:h-5`} />
        <input
          id="search-input"
          type="text"
          placeholder="Search by name, role, or employee ID"
          value={localValue}
          onChange={handleChange}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
          }`}
        />
      </div>
    </div>
  );
});

    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header with Buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
          <div className="text-center lg:text-left flex-1">
            <h1 className={`text-2xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Employee Directory
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Employees across all departments
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

  {/* Use the separate SearchInput component */}
  <SearchInput 
    searchTerm={searchTerm} 
    setSearchTerm={setSearchTerm} 
    isDark={isDark} 
  />
</div>

        {Object.keys(groupedEmployees).length > 0 ? (
          Object.keys(groupedEmployees).map(department => (
            <DepartmentSection
              key={department}
              department={department}
              employees={groupedEmployees[department]}
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
              Try adjusting your search or filter criteria
            </p>
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