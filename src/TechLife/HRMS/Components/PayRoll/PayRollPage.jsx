import React, { useState, useRef, useCallback, useEffect , useContext} from 'react';
import { Context } from '../HrmsContext';
import axios from 'axios';
 import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate} from 'react-router-dom';

// API Service Functions - Updated with correct endpoints

const API_BASE_URL = 'https://hrms.anasolconsultancyservices.com/api/payroll';

const token=localStorage.getItem("accessToken");



const payrollApi = {
  // Add new employee
  addEmployee: async (employeeData) => {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
         Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
      },
      body: JSON.stringify(employeeData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add employee');
    }
    
    return response.json();
  },

  // Add attendance
  addAttendance: async (attendanceData) => {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: {
         Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
      },
      body: JSON.stringify(attendanceData),
    });
    if (!response.ok) throw new Error('Failed to add attendance');
    return response.json();
  },
 

  // Calculate payroll
  calculatePayroll: async (calculationData) => {
    const response = await fetch(`${API_BASE_URL}/payroll/calculate`, {
      method: 'POST',
      headers: {
         Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
      },
      body: JSON.stringify(calculationData),
    });
    if (!response.ok) throw new Error('Failed to calculate payroll');
    return response.json();
  },

 
  getPayrollByEmployeeAndMonth: async (employeeId, month, year) => {
    const response = await axios.get(`${API_BASE_URL}/employees/${employeeId}/salary/${month}/${year}`,
      {
        headers : {Authorization : `Bearer ${token}`}
      }
    );
    return response.data.data; 
  },

  updatePayrollComponents: async (payrollId, updateData) => {
    const response = await axios.put(
      `${API_BASE_URL}/admin/payroll/${payrollId}/update`,
      updateData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  
  recalculateSalary: async (payrollId) => {
    const response = await axios.post(
      `${API_BASE_URL}/payroll/recalculate/${payrollId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },


  getEmployeeSalaryByMonth: async (employeeId, month, year) => {
    const response = await axios.get(
      `${API_BASE_URL}/employees/${employeeId}/salary/${month}/${year}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = response.data?.data;
    if (Array.isArray(data)) return data;
    if (data) return [data];
    return [];
  },

  
  getEmployeeFullData: async (employeeId) => {
    const response = await axios.get(
      `${API_BASE_URL}/employees/fulldata/${employeeId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data?.data || {};
  },

  
  getAllEmployees: async () => {
    const response = await axios.get(`${API_BASE_URL}/employee`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = response.data?.data;
    return Array.isArray(data) ? data : [];
  },

  
  updateEmployee: async (employeeId, employeeData) => {
    const response = await axios.put(
      `${API_BASE_URL}/employee/${employeeId}`,
      employeeData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  
  updatePayrollWithBonus: async (payrollId, bonusData) => {
    const response = await axios.put(
      `${API_BASE_URL}/admin/payroll/${payrollId}/update`,
      bonusData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data?.data || response.data;
  },

  
  deleteEmployee: async (employeeId) => {
    const response = await axios.delete(`${API_BASE_URL}/employee/${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};


// Helper function to convert month name to number
const getMonthNumber = (monthName) => {
  const months = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
    'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
  };
  return months[monthName];
};

  

// Helper function to transform frontend employee data to backend format
const transformEmployeeToBackend = (frontendData) => {
  return {
    employeeId: frontendData.employeeId,
    empName: frontendData.employeeName,
    email: frontendData.email,
    phoneNumber: frontendData.phoneNumber,
    annualSalary: frontendData.annualSalary,
    accountNumber: frontendData.accountNumber,
    ifsccode: frontendData.ifsccode,
    bankName: frontendData.bankName,
    pfnum: frontendData.pfnum,
    panNumber: frontendData.panNumber,
    aadharNumber: frontendData.aadharNumber,
    uanNumber: frontendData.uanNumber,
    department: frontendData.department,
    designation: frontendData.designation
  };
};


// Helper function to transform backend employee data to frontend format
const transformEmployeeToFrontend = (backendData) => {
  if (!backendData) {
    return getDefaultEmployeeData();
  }

  console.log('Transform function input:', backendData);

  // Determine if this is payroll data or employee data
  const isPayrollData = backendData.payrollId !== undefined;
  const payrollData = isPayrollData ? backendData : null;
  const employeeData = backendData.employee || backendData;

  // Calculate default values based on annual salary
  const annualSalary = employeeData.annualSalary || 0;
  const monthlySalary = annualSalary ? (annualSalary * 100000 / 12) : 0;

  // Use payroll data if available, otherwise calculate defaults
  const grossEarnings = payrollData?.grossEarnings || (monthlySalary > 0 ? monthlySalary : 0);
  const totalDeductions = payrollData?.totalDeductions || (monthlySalary > 0 ? Math.round(monthlySalary * 0.12) + 200 : 0);
  const netSalary = payrollData?.netSalary || (grossEarnings - totalDeductions);
  const bonusAmount = payrollData?.bonusAmount || 0;
  const hikePercentage = payrollData?.hikePercentage || 0;

   

  // console.log('Calculated values:', {
  //   annualSalary,
  //   monthlySalary,
  //   grossEarnings,
  //   totalDeductions,
  //   netSalary,
  //   isPayrollData: !!payrollData
  // });
  

  return {
    id: employeeData.id || employeeData.employeeId,
    employeeId: employeeData.employeeId,
    employeeName: employeeData.empName || employeeData.employeeName,
    email: employeeData.email || '',
    phoneNumber: employeeData.phoneNumber || '',
    annualSalary: annualSalary,
    accountNumber: employeeData.accountNumber || '',
    ifsccode: employeeData.IFSCcode || employeeData.ifsccode || '',
    bankName: employeeData.bankName || '',
    pfnum: employeeData.PFnum || employeeData.pfnum || '',
    panNumber: employeeData.panNumber || '',
    aadharNumber: employeeData.aadharNumber || '',
    uanNumber: employeeData.uanNumber || '',
    department: employeeData.department || '',
    designation: employeeData.designation || '',
    
    // Payroll specific fields
    bankAccountName: employeeData.empName || employeeData.employeeName,
    phoneNo: employeeData.phoneNumber || '',
    panNo: employeeData.panNumber || '',
   // pfnum: employeeData.PFnum || employeeData.pfnum || '',
    

standardDays: Number(payrollData?.standardDays) || 
              Number(payrollData?.totalWorkingDays) || 
              Number(payrollData?.workingDays) ||
              Number(payrollData?.attendance?.standardDays) || 
              26,
payableDays: Number(payrollData?.payableDays) || 
             Number(payrollData?.paidDays) || 
             Number(payrollData?.attendance?.payableDays) || 
             26,
lossOfPayDays: Number(payrollData?.lossOfPayDays) || 
               Number(payrollData?.lopDays) ||
               Number(payrollData?.attendance?.lossOfPayDays) || 
               0,
lopReversalDays: Number(payrollData?.lopReversalDays) || 
                 Number(payrollData?.attendance?.lopReversalDays) || 
                 0,
arrearDays: Number(payrollData?.arrearDays) || 
            Number(payrollData?.attendance?.arrearDays) || 
            0,
    // Bonus and hike
    bonus: bonusAmount,
    hike: hikePercentage,
    
    // Earnings - use payroll data or calculate defaults
    earnings: payrollData ? [
      { 
        name: 'BASIC', 
        monthlyRate: payrollData.basicSalary || 0, 
        currentMonth: payrollData.basicSalary || 0, 
        arrear: 0, 
        total: payrollData.basicSalary || 0 
      },
      { 
        name: 'HRA', 
        monthlyRate: payrollData.hraAmount || 0, 
        currentMonth: payrollData.hraAmount || 0, 
        arrear: 0, 
        total: payrollData.hraAmount || 0 
      },
      { 
        name: 'CONVEYANCE', 
        monthlyRate: payrollData.conveyanceAllowance || 0, 
        currentMonth: payrollData.conveyanceAllowance || 0, 
        arrear: 0, 
        total: payrollData.conveyanceAllowance || 0 
      },
      { 
        name: 'MEDICAL', 
        monthlyRate: payrollData.medicalAllowance || 0, 
        currentMonth: payrollData.medicalAllowance || 0, 
        arrear: 0, 
        total: payrollData.medicalAllowance || 0 
      },
      { 
        name: 'SPECIAL ALLOWANCE', 
        monthlyRate: payrollData.specialAllowance || 0, 
        currentMonth: payrollData.specialAllowance || 0, 
        arrear: 0, 
        total: payrollData.specialAllowance || 0 
      }
    ] : (monthlySalary > 0 ? [
      { 
        name: 'BASIC', 
        monthlyRate: Math.round(monthlySalary * 0.5), 
        currentMonth: Math.round(monthlySalary * 0.5), 
        arrear: 0, 
        total: Math.round(monthlySalary * 0.5) 
      },
      { 
        name: 'HRA', 
        monthlyRate: Math.round(monthlySalary * 0.4), 
        currentMonth: Math.round(monthlySalary * 0.4), 
        arrear: 0, 
        total: Math.round(monthlySalary * 0.4) 
      },
      { 
        name: 'SPECIAL ALLOWANCE', 
        monthlyRate: Math.round(monthlySalary * 0.1), 
        currentMonth: Math.round(monthlySalary * 0.1), 
        arrear: 0, 
        total: Math.round(monthlySalary * 0.1) 
      }
    ] : []),
    
    // Deductions - use payroll data or calculate defaults
    deductions: payrollData ? [
      { name: 'PROVIDENT FUND', amount: payrollData.providentFund || 0 },
      { name: 'PROFESSIONAL TAX', amount: payrollData.professionalTax || 0 },
      { name: 'INCOME TAX', amount: payrollData.incomeTax || 0 }
    ] : (monthlySalary > 0 ? [
      { name: 'PROVIDENT FUND', amount: Math.round(monthlySalary * 0.12) },
      { name: 'PROFESSIONAL TAX', amount: 200 }
    ] : []),
    
    // Use calculated/actual values
    grossEarnings: grossEarnings,
    totalDeductions: totalDeductions,
    netSalary: netSalary,
    
    // Include payroll ID for updates
    payrollId: payrollData?.payrollId
  };
};

// Helper function for default employee data
const getDefaultEmployeeData = () => {
  return {
    id: 'unknown',
    employeeId: 'unknown',
    employeeName: 'Unknown Employee',
    email: '',
    phoneNumber: '',
    annualSalary: 0,
    accountNumber: '',
    ifsccode: '',
    bankName: '',
    pfnum: '',
    panNumber: '',
    aadharNumber: '',
    uanNumber: '',
    department: '',
    designation: '',
    bankAccountName: 'Unknown Employee',
    phoneNo: '',
    panNo: '',
    pfNo: '',
    standardDays: 26,
    payableDays: 26,
    lossOfPayDays: 0,
    lopReversalDays: 0,
    arrearDays: 0,
    bonus: 0,
    hike: 0,
    earnings: [],
    deductions: [],
    grossEarnings: 0,
    totalDeductions: 0,
    netSalary: 0
  };
};

// Helper function for default earnings calculation
const getDefaultEarnings = (annualSalary) => {
  const monthlySalary = annualSalary ? (annualSalary * 100000 / 12) : 0;
  return [
    { 
      name: 'BASIC', 
      monthlyRate: Math.round(monthlySalary * 0.5), 
      currentMonth: Math.round(monthlySalary * 0.5), 
      arrear: 0, 
      total: Math.round(monthlySalary * 0.5) 
    },
    { 
      name: 'HRA', 
      monthlyRate: Math.round(monthlySalary * 0.4), 
      currentMonth: Math.round(monthlySalary * 0.4), 
      arrear: 0, 
      total: Math.round(monthlySalary * 0.4) 
    },
    { 
      name: 'SPECIAL ALLOWANCE', 
      monthlyRate: Math.round(monthlySalary * 0.1), 
      currentMonth: Math.round(monthlySalary * 0.1), 
      arrear: 0, 
      total: Math.round(monthlySalary * 0.1) 
    }
  ];
};

// Helper function for default deductions calculation
const getDefaultDeductions = (annualSalary) => {
  const monthlySalary = annualSalary ? (annualSalary * 100000 / 12) : 0;
   
  return [
    { name: 'PROVIDENT FUND', amount: Math.round(monthlySalary * 0.12) },
    { name: 'PROFESSIONAL TAX', amount: 200 }
  ];
};
// Access Denied Component
const AccessDenied = () => {
  const { theme } = useContext(Context); // ✅ Move this INSIDE the component
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6 ${
      isDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access the payroll management system. 
          This page is restricted to ADMIN users only.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading payroll system...</p>
    </div>
  </div>
);

// const AddEmployeeForm = ({ isAdding, newEmployee, onEmployeeChange, onSave, onCancel, loading }) => { 
//   const { theme } = useContext(Context);
//   const isDark = theme === "dark";

//   if (!isAdding) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//       <div className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
//         isDark ? 'bg-gray-800' : 'bg-white'
//       }`}>
//         <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
//           <h2 className="text-2xl font-bold">Add New Employee</h2>
//           <p className="opacity-90">Fill in the employee details below</p>
//         </div>
        
//         <div className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Personal Information */}
//             <div className="md:col-span-2">
//               <h3 className={`text-lg font-semibold mb-4 border-l-4 border-green-500 pl-3 ${
//                 isDark ? 'text-white' : 'text-gray-800'
//               }`}>Personal Information</h3>
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>Employee ID *</label>
//               <input
//                 type="text"
//                 value={newEmployee.employeeId}
//                 onChange={(e) => onEmployeeChange('employeeId', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="e.g., ACS00000001"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>Employee Name *</label>
//               <input
//                 type="text"
//                 value={newEmployee.employeeName}
//                 onChange={(e) => onEmployeeChange('employeeName', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="Full name"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>Email *</label>
//               <input
//                 type="email"
//                 value={newEmployee.email}
//                 onChange={(e) => onEmployeeChange('email', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="email@company.com"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>Phone Number</label>
//               <input
//                 type="tel"
//                 value={newEmployee.phoneNumber}
//                 onChange={(e) => onEmployeeChange('phoneNumber', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="9876543210"
//               />
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>Designation</label>
//               <input
//                 type="text"
//                 value={newEmployee.designation}
//                 onChange={(e) => onEmployeeChange('designation', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="e.g., Software Engineer"
//               />
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>Department</label>
//               <input
//                 type="text"
//                 value={newEmployee.department}
//                 onChange={(e) => onEmployeeChange('department', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="e.g., Engineering"
//               />
//             </div>

//             {/* Salary Information */}
//             <div className="md:col-span-2">
//               <h3 className={`text-lg font-semibold mb-4 border-l-4 border-green-500 pl-3 ${
//                 isDark ? 'text-white' : 'text-gray-800'
//               }`}>Salary Information</h3>
//             </div>
            
//             <div className="md:col-span-2">
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>Annual Salary (LPA)</label>
//               <input
//                 type="number"
//                 value={newEmployee.annualSalary}
//                 onChange={(e) => onEmployeeChange('annualSalary', e.target.value === '' ? '' : Number(e.target.value))}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="6.0"
//                 step="0.1"
//                 min="0"
//               />
//             </div>

//             {/* Bank Details */}
//             <div className="md:col-span-2">
//               <h3 className={`text-lg font-semibold mb-4 border-l-4 border-green-500 pl-3 ${
//                 isDark ? 'text-white' : 'text-gray-800'
//               }`}>Bank Details</h3>
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>Account Number</label>
//               <input
//                 type="text"
//                 value={newEmployee.accountNumber}
//                 onChange={(e) => onEmployeeChange('accountNumber', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="9861376290"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>IFSC Code</label>
//               <input
//                 type="text"
//                 value={newEmployee.ifsccode}
//                 onChange={(e) => onEmployeeChange('ifsccode', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="SBIN0001234"
//               />
//             </div>
            
//             <div className="md:col-span-2">
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>Bank Name</label>
//               <input
//                 type="text"
//                 value={newEmployee.bankName}
//                 onChange={(e) => onEmployeeChange('bankName', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="State Bank of India"
//               />
//             </div>

//             {/* Government Identifiers */}
//             <div className="md:col-span-2">
//               <h3 className={`text-lg font-semibold mb-4 border-l-4 border-green-500 pl-3 ${
//                 isDark ? 'text-white' : 'text-gray-800'
//               }`}>Government Identifiers</h3>
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>PF Number</label>
//               <input
//                 type="text"
//                 value={newEmployee.pfnum}
//                 onChange={(e) => onEmployeeChange('pfnum', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="PF123456"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>PAN Number</label>
//               <input
//                 type="text"
//                 value={newEmployee.panNumber}
//                 onChange={(e) => onEmployeeChange('panNumber', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="ABCDE1234F"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>Aadhar Number</label>
//               <input
//                 type="text"
//                 value={newEmployee.aadharNumber}
//                 onChange={(e) => onEmployeeChange('aadharNumber', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="123412341234"
//               />
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-2 ${
//                 isDark ? 'text-gray-300' : 'text-gray-700'
//               }`}>UAN Number</label>
//               <input
//                 type="text"
//                 value={newEmployee.uanNumber}
//                 onChange={(e) => onEmployeeChange('uanNumber', e.target.value)}
//                 className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
//                   isDark 
//                     ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
//                     : 'bg-white border-gray-300 text-gray-800'
//                 }`}
//                 placeholder="UAN123456789"
//               />
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className={`flex gap-4 justify-end pt-6 mt-6 border-t ${
//             isDark ? 'border-gray-700' : 'border-gray-200'
//           }`}>
//             <button
//               onClick={onCancel}
//               disabled={loading}
//               className={`px-6 py-2 border rounded-lg transition-colors font-medium disabled:opacity-50 ${
//                 isDark 
//                   ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
//                   : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//               }`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={onSave}
//               disabled={loading}
//               className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                   Adding...
//                 </>
//               ) : (
//                 'Add Employee'
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// Edit Form Component
const EditEmployeeForm = ({ editingEmployee, onInputChange, onSaveEdit, onCancelEdit, loading }) => {
  const { theme } = useContext(Context);
  const isDark = theme === "dark";

  if (!editingEmployee) return null;

  return (
   <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold">Edit Employee - {editingEmployee.employeeName}</h2>
          <p className="opacity-90">Update employee details, bonus, and hike information</p>
        </div>
        
        <div className="p-6">
          {/* Personal Information */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Employee Name</label>
                <input
                  type="text"
                  value={editingEmployee.employeeName}
                  onChange={(e) => onInputChange('employeeName', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Employee ID</label>
                <input
                  type="text"
                  value={editingEmployee.employeeId}
                  readOnly
                  className={`w-full border rounded-lg px-4 py-2 ${
                    isDark 
                      ? 'bg-gray-600 border-gray-600 text-gray-400' 
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Email</label>
                <input
                  type="email"
                  value={editingEmployee.email}
                  onChange={(e) => onInputChange('email', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Phone Number</label>
                <input
                  type="tel"
                  value={editingEmployee.phoneNo}
                  onChange={(e) => onInputChange('phoneNo', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Annual Salary (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingEmployee.annualSalary}
                  onChange={(e) => onInputChange('annualSalary', parseFloat(e.target.value))}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Bonus Amount (₹)</label>
                <input
                  type="number"
                  value={editingEmployee.bonus || 0}
                  onChange={(e) => onInputChange('bonus', Number(e.target.value))}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Enter bonus amount"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Hike Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingEmployee.hike || 0}
                  onChange={(e) => onInputChange('hike', Number(e.target.value))}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="Enter hike percentage"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Account Number</label>
                <input
                  type="text"
                  value={editingEmployee.accountNumber}
                  onChange={(e) => onInputChange('accountNumber', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>IFSC Code</label>
                <input
                  type="text"
                  value={editingEmployee.ifsccode} 
                  onChange={(e) => onInputChange('ifsccode', e.target.value)} 
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Bank Name</label>
                <input
                  type="text"
                  value={editingEmployee.bankName}
                  onChange={(e) => onInputChange('bankName', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Government Identifiers */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>Government Identifiers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>PF Number</label>
                <input
                  type="text"
                  value={editingEmployee.pfnum} 
                  onChange={(e) => onInputChange('pfnum', e.target.value)} 
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>PAN Number</label>
                <input
                  type="text"
                  value={editingEmployee.panNumber}
                  onChange={(e) => onInputChange('panNumber', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Aadhar Number</label>
                <input
                  type="text"
                  value={editingEmployee.aadharNumber}
                  onChange={(e) => onInputChange('aadharNumber', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>UAN Number</label>
                <input
                  type="text"
                  value={editingEmployee.uanNumber}
                  onChange={(e) => onInputChange('uanNumber', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-4 justify-end pt-4 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onCancelEdit}
              className={`px-6 py-2 border rounded-lg transition-colors font-medium ${
                isDark 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onSaveEdit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PayRollPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { userData } = useContext(Context);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
     const [employees, setEmployees] = useState([]);
     const navigate=useNavigate();
     const { theme } = useContext(Context);
  const isDark = theme === "dark";

    
const [newEmployee, setNewEmployee] = useState({
  employeeId: '',
  employeeName: '',
  email: '',
  phoneNumber: '',
  designation: '',        
  department: '',         
  annualSalary: 0,
  accountNumber: '',
  ifsccode: '',           
  bankName: '',
  pfnum: '',           
  panNumber: '',
  aadharNumber: '',
  uanNumber: ''
});

  const [employeesData, setEmployeesData] = useState([]);
  const paySlipRef = useRef(null);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2023', '2024', '2025'];





  // Move useCallback to the top
  const handleNewEmployeeChange = useCallback((field, value) => {
    setNewEmployee(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setEditingEmployee(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Role-based access control
  const hasAdminAccess = () => {
    if (!userData) return false;
    
    if (Array.isArray(userData.roles)) {
      return userData.roles.includes('ADMIN');
    }
    
    return userData.roles === 'ADMIN';
  };

  // Load employees data on component mount and when month/year changes
  useEffect(() => {
    fetchEmployeesData();
  }, [selectedMonth, selectedYear]);

 const fetchEmployeesData = async () => {
  try {
    setApiLoading(true);
    const employees = await payrollApi.getAllEmployees();
    
    console.log('Raw employees from API:', employees);

    const employeesArray = Array.isArray(employees) ? employees : [];
    
    const employeesWithPayroll = await Promise.all(
      employeesArray.map(async (employee) => {
        try {
          const monthNumber = getMonthNumber(selectedMonth);
          
          console.log(`Fetching payroll for ${employee.employeeId}, ${monthNumber}, ${selectedYear}`);
          
          const payrollResponse = await payrollApi.getPayrollByEmployeeAndMonth(
            employee.employeeId, 
            monthNumber, 
            parseInt(selectedYear)
          );
          
          console.log(`Payroll API response for ${employee.employeeId}:`, payrollResponse);
          
          // Check if payroll response has data and merge properly
          if (payrollResponse && payrollResponse.payrollId) {
            console.log(`Merging payroll data for ${employee.employeeId}`);
            
            // Create base employee data
            const baseEmployeeData = transformEmployeeToFrontend(employee);
            
            // Create payroll data with employee info included
            const payrollWithEmployee = {
              ...payrollResponse,
              employee: {
                ...employee,
                ...baseEmployeeData
              }
            };
            
            // Transform the combined data
            const attendanceData = transformEmployeeToFrontend(payrollWithEmployee);
            
            console.log(`Combined data for ${employee.employeeId}:`, attendanceData);
            return attendanceData;
          } else {
           
            console.log(`No payroll data for ${employee.employeeId}, using employee data only`);
            return transformEmployeeToFrontend(employee);
          }
          
        } catch (error) {
          console.warn(`No payroll data found for ${employee.employeeId}:`, error.message);
          
          const employeeData = transformEmployeeToFrontend(employee);
          console.log(`Employee data without payroll for ${employee.employeeId}:`, employeeData);
          return employeeData;
        }
      })
    );
    
    console.log('Final employees data to set:', employeesWithPayroll);
    setEmployeesData(employeesWithPayroll);
    setApiLoading(false);
  } catch (error) {
    console.error('Error fetching employees:', error);
    setEmployeesData([]);
    setApiLoading(false);
    alert('Failed to load employee data. Please try again.');
  }
};

  
  if (!userData) {
    return <LoadingSpinner />;
  }

  
  if (!hasAdminAccess()) {
    return <AccessDenied />;
  }

  const handleAddEmployee = () => {
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewEmployee({
      employeeId: '',
      employeeName: '', 
      email: '',
      phoneNumber: '',
      designation: '',
      department: '',
      annualSalary: 0,
      accountNumber: '',
      ifsccode: '', 
      bankName: '',
      pfnum: '', 
      panNumber: '',
      aadharNumber: '',
      uanNumber: ''
    });
  };

  const handleSaveNewEmployee = async () => {
    if (!newEmployee.employeeId || !newEmployee.employeeName || !newEmployee.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Transform data to backend format
      const backendEmployeeData = transformEmployeeToBackend(newEmployee);
      
      console.log('Sending data to backend:', backendEmployeeData);
      
      // Call the API to add employee
      const response = await payrollApi.addEmployee(backendEmployeeData);
      console.log('Response from backend:', response);
      
      // After successful addition, calculate payroll for current month
      const monthNumber = getMonthNumber(selectedMonth);
      try {
        await payrollApi.calculatePayroll({
          employeeId: newEmployee.employeeId,
          month: monthNumber,
          year: parseInt(selectedYear)
        });
      } catch (calcError) {
        console.warn('Payroll calculation failed:', calcError);
        // Continue even if payroll calculation fails
      }

      // Refresh the employees list
      await fetchEmployeesData();
      
      setIsAdding(false);
      setNewEmployee({
        employeeId: '',
        employeeName: '',
        email: '',
        phoneNumber: '',
        designation: '',
        department: '',
        annualSalary: 0,
        accountNumber: '',
        ifsccode: '',
        bankName: '',
        pfnum: '',
        panNumber: '',
        aadharNumber: '',
        uanNumber: ''
      });
      
      alert('Employee added successfully!');
    } catch (error) {
      console.error('Error adding employee:', error);
      console.error('Error details:', error.message); 
      alert(`Failed to add employee: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

const handleDownloadPayslip = async (employee, data = {}) => {
  try {
    console.log('Starting payslip download for:', employee.employeeId);
    
    // Fetch the latest payroll data for the selected month/year
    const monthNumber = getMonthNumber(selectedMonth);
    let payrollData;
    let employeeData = employee;

    try {
      payrollData = await payrollApi.getPayrollByEmployeeAndMonth(
        employee.employeeId, 
        monthNumber, 
        parseInt(selectedYear)
      );
      console.log('Payroll API response:', payrollData);
    } catch (error) {
      console.warn('No payroll data found, using employee data only:', error.message);
      payrollData = null;
    }

    // Use payroll data if available, otherwise use employee data with calculations
    const finalData = payrollData ? {
      ...employee,
      ...payrollData
    } : employee;

    console.log('Final data for payslip:', finalData);

   
    const basicSalary = finalData.basicSalary || 0;
    const hraAmount = finalData.hraAmount || finalData.hra || 0;
    const conveyanceAllowance = finalData.conveyanceAllowance || 0;
    const medicalAllowance = finalData.medicalAllowance || 0;
    const specialAllowance = finalData.specialAllowance || 0;
    
    const providentFund = finalData.providentFund || 0;
    const professionalTax = finalData.professionalTax || 0;
    const incomeTax = finalData.incomeTax || 0;

    const bonusAmount = finalData.bonusAmount || finalData.bonus || 0;
    const hikePercentage = finalData.hikePercentage || finalData.hike || 0;

    // Attendance data
    const totalWorkingDays = finalData.totalWorkingDays || finalData.standardDays || 23;
    const daysPresent = finalData.daysPresent || finalData.payableDays || 20;
    const paidDays = finalData.paidDays || finalData.payableDays || 20;
    const lossOfPayDays = finalData.lossOfPayDays || finalData.lopDays || 2;

    // Calculate totals
    const grossEarnings = basicSalary + hraAmount + conveyanceAllowance + medicalAllowance + specialAllowance + bonusAmount;
    const totalDeductions = providentFund + professionalTax + incomeTax;
    const netSalary = grossEarnings - totalDeductions;

    console.log('Calculated values for PDF:', {
      basicSalary, hraAmount, conveyanceAllowance, medicalAllowance, specialAllowance,
      providentFund, professionalTax, incomeTax, bonusAmount, grossEarnings, totalDeductions, netSalary
    });

    // Helper function for pay period formatting
    const formatPayPeriod = () => {
      return `${selectedMonth} ${selectedYear}`;
    };

    // Create a temporary div to render the payslip HTML for PDF conversion
    const payslipElement = document.createElement('div');
    payslipElement.style.position = 'absolute';
    payslipElement.style.left = '-9999px';
    payslipElement.style.width = '800px';
    payslipElement.style.padding = '20px';
    payslipElement.style.backgroundColor = 'white';
    payslipElement.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';

    // Use your EXACT styling template
    payslipElement.innerHTML = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; color: #333; line-height: 1.3; font-size: 20px;">
        <!-- Company Header -->
        <div style="border-bottom: 2px solid #2c5aa0; padding: 20px 0 10px 0; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <div style="font-size: 20px; font-weight: 600; color: #2c5aa0; letter-spacing: 0.5px;">ANASOL CONSULTANCY SERVICES PVT LTD</div>
              <div style="font-size: 12px; color: #666; margin-top: 3px;">
                #1016, 11th Floor, DSL Abacus IT Park, Uppal Hyderabad-500039
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; font-weight: 600; color: #2c5aa0; margin-bottom: 3px;">SALARY SLIP</div>
              <div style="font-size: 12px; color: #d9534f; font-weight: 500; background: #f8f9fa; padding: 3px 10px; border-radius: 3px; display: inline-block;">
                ${formatPayPeriod()}
              </div>
            </div>
          </div>
        </div>

        <!-- Employee Information -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 14px; font-weight: 600; color: #2c5aa0; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e0e0e0;">EMPLOYEE DETAILS</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="padding: 6px 0; font-weight: 500; color: #555; width: 40%;">Employee Name:</td>
                <td style="padding: 6px 0; font-weight: 600;">${finalData.employeeName || finalData.empName || ''}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 500; color: #555;">Employee ID:</td>
                <td style="padding: 6px 0;">${finalData.employeeId || ''}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 500; color: #555;">Designation:</td>
                <td style="padding: 6px 0;">${finalData.designation || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 500; color: #555;">Department:</td>
                <td style="padding: 6px 0;">${finalData.department || 'N/A'}</td>
              </tr>
            </table>
          </div>

          <div>
            <div style="font-size: 14px; font-weight: 600; color: #2c5aa0; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e0e0e0;">BANK & STATUTORY DETAILS</div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="padding: 6px 0; font-weight: 500; color: #555; width: 40%;">Bank A/C Name:</td>
                <td style="padding: 6px 0;">${finalData.employeeName || finalData.empName || ''}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 500; color: #555;">PAN No:</td>
                <td style="padding: 6px 0;">${finalData.panNumber || finalData.panNo || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 500; color: #555;">PF No:</td>
                <td style="padding: 6px 0;">${finalData.pfnum || finalData.pfNo || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 500; color: #555;">IFSC Code:</td>
                <td style="padding: 6px 0;">${finalData.ifsccode || 'N/A'}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Attendance Information -->
        <div style="margin: 20px 0;">
          <div style="font-size: 14px; font-weight: 600; color: #2c5aa0; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e0e0e0;">ATTENDANCE SUMMARY</div>
          <table style="width: 100%; border-collapse: collapse; background: #f8f9fa; border-radius: 4px; overflow: hidden; font-size: 12px;">
            <thead>
              <tr style="background: #2c5aa0; color: white;">
                <th style="padding: 10px; text-align: center; font-weight: 600;">Total Working Days</th>
                <th style="padding: 10px; text-align: center; font-weight: 600;">Days Present</th>
                <th style="padding: 10px; text-align: center; font-weight: 600;">Paid Days</th>
                <th style="padding: 10px; text-align: center; font-weight: 600;">Loss of Pay Days</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; text-align: center; background: white; border: 1px solid #e0e0e0;">${formatNumber(totalWorkingDays)}</td>
                <td style="padding: 10px; text-align: center; background: white; border: 1px solid #e0e0e0;">${formatNumber(daysPresent)}</td>
                <td style="padding: 10px; text-align: center; background: white; border: 1px solid #e0e0e0;">${formatNumber(paidDays)}</td>
                <td style="padding: 10px; text-align: center; background: white; border: 1px solid #e0e0e0;">${formatNumber(lossOfPayDays)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Bonus Information - Only show if bonus exists -->
        ${bonusAmount > 0 ? `
        <div style="margin: 12px 0;">
          <div style="font-size: 14px; font-weight: 600; color: #2c5aa0; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e0e0e0;">ADDITIONAL COMPENSATION</div>
          <table style="width: 100%; border-collapse: collapse; background: #f8f9fa; border-radius: 4px; overflow: hidden; font-size: 12px;">
            <thead>
              <tr style="background: #28a745; color: white;">
                <th style="padding: 10px; text-align: center; font-weight: 600;">Bonus Amount</th>
                <th style="padding: 10px; text-align: center; font-weight: 600;">Hike Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; text-align: center; background: white; border: 1px solid #e0e0e0; font-weight: 600; color: #28a745;">${formatCurrency(bonusAmount)}</td>
                <td style="padding: 10px; text-align: center; background: white; border: 1px solid #e0e0e0; font-weight: 600; color: #28a745;">${hikePercentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Salary Details -->
        <div style="margin: 20px 0;">
          <div style="font-size: 14px; font-weight: 600; color: #2c5aa0; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e0e0e0;">SALARY BREAKUP</div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- Earnings -->
            <div>
              <div style="font-size: 20px; font-weight: 600; color: #2c5aa0; margin-bottom: 10px; background: #f8f9fa; padding: 6px 10px; border-radius: 3px;">EARNINGS</div>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0; font-size: 12px;">
                <tbody>
                  <tr>
                    <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Basic Salary</td>
                    <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(basicSalary)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">HRA</td>
                    <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(hraAmount)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Conveyance Allowance</td>
                    <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(conveyanceAllowance)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Medical Allowance</td>
                    <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(medicalAllowance)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Special Allowance</td>
                    <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(specialAllowance)}</td>
                  </tr>
                  ${bonusAmount > 0 ? `
                  <tr>
                    <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Bonus</td>
                    <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(bonusAmount)}</td>
                  </tr>
                  ` : ''}
                  <tr style="background: #e9ecef; font-weight: 600;">
                    <td style="padding: 10px;">Gross Earnings</td>
                    <td style="padding: 10px; text-align: right;">${formatCurrency(grossEarnings)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Deductions -->
            <div>
              <div style="font-size: 20px; font-weight: 600; color: #2c5aa0; margin-bottom: 10px; background: #f8f9fa; padding: 6px 10px; border-radius: 3px;">DEDUCTIONS</div>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0; font-size: 12px;">
                <tbody>
                  <tr>
                    <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Provident Fund</td>
                    <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(providentFund)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Professional Tax</td>
                    <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(professionalTax)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Income Tax</td>
                    <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(incomeTax)}</td>
                  </tr>
                  <tr style="background: #e9ecef; font-weight: 600;">
                    <td style="padding: 10px;">Total Deductions</td>
                    <td style="padding: 10px; text-align: right;">${formatCurrency(totalDeductions)}</td>
                  </tr>
                  <tr style="background: #d4edda; font-weight: 700; color: #155724; border: 2px solid #c3e6cb;">
                    <td style="padding: 12px 10px; font-size: 20px;">NET SALARY PAYABLE</td>
                    <td style="padding: 12px 10px; text-align: right; font-size: 20px;">${formatCurrency(netSalary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 11px;">
          <div style="margin-bottom: 5px;">
            <strong>ANASOL CONSULTANCY SERVICES PVT LTD</strong> | 
            #1016, 11th Floor, DSL Abacus IT Park, Uppal Hyderabad-500039 |
            Ph: 9632091726 | Email: hr@anasolconsultancy.com | www.anasol.com
          </div>
          <div style="color: #999; font-style: italic;">
            This is a system generated document and does not require signature
          </div>
        </div>
      </div>
    `;

    // Add to document
    document.body.appendChild(payslipElement);

    // Convert to PDF
    const canvas = await html2canvas(payslipElement, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      width: payslipElement.offsetWidth,
      height: payslipElement.offsetHeight
    });

    // Remove temporary element
    document.body.removeChild(payslipElement);

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; 
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add new pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    const fileName = `Payslip_${finalData.employeeName || finalData.empName}_${selectedMonth}_${selectedYear}.pdf`;
    pdf.save(fileName);
    
    console.log('PDF payslip downloaded successfully:', fileName);
    
  } catch (error) {
    console.error('Error downloading payslip:', error);
    console.error('Error details:', error.message);
    alert('Failed to download payslip: ' + error.message);
  }
};


// Helper function to format numbers with optional decimals
const formatNumber = (value, decimals = 1) => {
  const num = Number(value);
  return isNaN(num) ? '0.0' : num.toFixed(decimals);
};



// Currency formatting function with proper Indian formatting
const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '0.00';
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};



// Helper function to generate HTML content
const generatePayslipHTML = (data, options) => {
  const { selectedMonth, selectedYear, grossEarnings, totalDeductions, bonusAmount, netSalary } = options;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Pay Slip - ${data.employeeName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    body { 
      font-family: 'Inter', sans-serif; 
      margin: 0; 
      padding: 20px;
      background-color: white;
    }
    .container { 
      max-width: 800px; 
      margin: 0 auto; 
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid #e0e6ff;
    }
    .company-header { 
      background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
      color: white; 
      padding: 30px;
      position: relative;
    }
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .company-info {
      flex: 1;
    }
    .company-name { 
      font-size: 28px; 
      font-weight: 700; 
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .salary-slip-title { 
      font-size: 24px; 
      font-weight: 600;
      opacity: 0.9;
    }
    .month-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      margin-top: 10px;
      display: inline-block;
    }
    .employee-info { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 25px; 
      padding: 30px; 
      background: #f8faff;
    }
    .info-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e0e6ff;
    }
    .info-row { 
      margin-bottom: 12px; 
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label { 
      font-weight: 600; 
      color: #475569;
      font-size: 14px;
    }
    .info-value { 
      font-weight: 500;
      color: #1e293b;
      text-align: right;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #1e293b;
      padding: 0 30px;
      position: relative;
    }
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 30px;
      width: 50px;
      height: 3px;
      background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
      border-radius: 2px;
    }
    .attendance-table, .earnings-table, .deductions-table, .bonus-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 20px 0; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .attendance-table th, .attendance-table td, 
    .earnings-table th, .earnings-table td,
    .deductions-table th, .deductions-table td,
    .bonus-table th, .bonus-table td { 
      border: 1px solid #e2e8f0; 
      padding: 16px; 
      text-align: center; 
    }
    .attendance-table th, .earnings-table th, .deductions-table th, .bonus-table th { 
      background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
      color: white; 
      font-weight: 600;
      font-size: 14px;
      border: none;
    }
    .attendance-table td, .earnings-table td, .deductions-table td, .bonus-table td {
      background: white;
      font-weight: 500;
      color: #475569;
    }
    .earnings-section { 
      padding: 0 30px;
      margin-bottom: 30px;
    }
    .salary-details-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
    }
    .subsection-title {
      font-weight: 700;
      margin-bottom: 16px;
      color: #1e293b;
      font-size: 16px;
      padding-left: 8px;
      border-left: 4px solid #1e40af;
    }
    .bg-blue-50 {
      background: #dbeafe;
    }
    .bg-green-50 {
      background: #dcfce7;
    }
    .bg-yellow-50 {
      background: #fef9c3;
    }
    .font-semibold {
      font-weight: 600;
    }
    .font-bold {
      font-weight: 700;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .highlight-row {
      font-size: 15px;
      color: #1e293b;
    }
    .net-salary-row {
      font-size: 16px;
      color: #065f46;
    }
    .footer { 
      text-align: center; 
      padding: 25px; 
      background: #f8fafc;
      margin-top: 30px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 14px;
      font-weight: 500;
    }
    .footer p {
      margin: 4px 0;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 80px;
      font-weight: 900;
      color: rgba(30, 64, 175, 0.03);
      pointer-events: none;
      z-index: 0;
    }
    @media print {
      body { 
        background-color: white;
        margin: 0;
        padding: 0;
      }
      .container {
        box-shadow: none;
        margin: 0;
        max-width: none;
        border: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Watermark -->
    <div class="watermark">ANASOL</div>
    
    <!-- Company Header -->
    <div class="company-header">
      <div class="header-content">
        <div class="company-info">
          <div class="company-name">ANASOL CONSULTANCY SERVICES PVT LTD</div>
          <div class="salary-slip-title">SALARY SLIP</div>
          <div class="month-badge">${selectedMonth} ${selectedYear}</div>
        </div>
        <div class="logo-container">
          <!-- Logo placeholder -->
          <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">LOGO</div>
        </div>
      </div>
    </div>

    <!-- Employee Information -->
    <div class="employee-info">
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Employee Name:</span>
          <span class="info-value">${data.employeeName || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Employee ID:</span>
          <span class="info-value">${data.employeeId || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Designation:</span>
          <span class="info-value">${data.designation || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Department:</span>
          <span class="info-value">${data.department || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone No:</span>
          <span class="info-value">${data.phoneNo || data.phoneNumber || 'N/A'}</span>
        </div>
      </div>
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Bank A/C Name:</span>
          <span class="info-value">${data.bankAccountName || data.employeeName || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">PAN No:</span>
          <span class="info-value">${data.panNo || data.panNumber || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">PF No:</span>
          <span class="info-value">${data.pfNo || data.pfnum || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">IFSC Code:</span>
          <span class="info-value">${data.ifsccode || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${data.email || 'N/A'}</span>
        </div>
      </div>
    </div>

    <!-- Attendance Information -->
    <div class="section-title">Attendance Information</div>
    <div style="padding: 0 30px;">
      <table class="attendance-table">
        <thead>
          <tr>
            <th>Standard Days</th>
            <th>Payable Days</th>
            <th>Loss of Pay Days</th>
            <th>LOP Reversal Days</th>
            <th>Arrear Days</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${data.standardDays || 0}</td>
            <td>${data.payableDays || 0}</td>
            <td>${data.lossOfPayDays || 0}</td>
            <td>${data.lopReversalDays || 0}</td>
            <td>${data.arrearDays || 0}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bonus Information -->
    ${bonusAmount > 0 ? `
    <div class="section-title">Additional Compensation</div>
    <div style="padding: 0 30px;">
      <table class="bonus-table">
        <thead>
          <tr>
            <th>Bonus Amount</th>
            <th>Hike Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>₹${bonusAmount.toLocaleString()}</td>
            <td>${data.hike || 0}%</td>
          </tr>
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Salary Details -->
    <div class="section-title">Salary Details</div>
    <div class="earnings-section">
      <div class="salary-details-grid">
        <!-- Earnings -->
        <div>
          <div class="subsection-title">EARNINGS</div>
          <table class="earnings-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Monthly Rate</th>
                <th>Current Month</th>
                <th>Arrear (+/-)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(data.earnings || []).map(earning => `
                <tr>
                  <td>${earning.name || 'N/A'}</td>
                  <td class="text-right">₹${(earning.monthlyRate || 0).toLocaleString()}</td>
                  <td class="text-right">₹${(earning.currentMonth || 0).toLocaleString()}</td>
                  <td class="text-right">${earning.arrear || 0}</td>
                  <td class="text-right">₹${(earning.total || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
              ${bonusAmount > 0 ? `
                <tr class="bg-yellow-50">
                  <td>BONUS</td>
                  <td class="text-right">-</td>
                  <td class="text-right">-</td>
                  <td class="text-right">-</td>
                  <td class="text-right">₹${bonusAmount.toLocaleString()}</td>
                </tr>
              ` : ''}
              <tr class="bg-blue-50 font-semibold highlight-row">
                <td colspan="4">GROSS EARNINGS</td>
                <td class="text-right">₹${grossEarnings.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Deductions -->
        <div>
          <div class="subsection-title">DEDUCTIONS</div>
          <table class="deductions-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(data.deductions || []).map(deduction => `
                <tr>
                  <td>${deduction.name || 'N/A'}</td>
                  <td class="text-right">₹${(deduction.amount || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
              <tr class="bg-blue-50 font-semibold highlight-row">
                <td>TOTAL DEDUCTIONS</td>
                <td class="text-right">₹${totalDeductions.toLocaleString()}</td>
              </tr>
              ${bonusAmount > 0 ? `
                <tr class="bg-yellow-50 font-semibold">
                  <td>BONUS ADDED</td>
                  <td class="text-right">+ ₹${bonusAmount.toLocaleString()}</td>
                </tr>
              ` : ''}
              <tr class="bg-green-50 font-bold net-salary-row">
                <td>NET SALARY</td>
                <td class="text-right">₹${netSalary.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>#1016, 11th Floor, DSL Abacus IT Park, Uppal Hyderabad-500039</p>
      <p>Ph: 9632091726 | Email: info@anasol.com | www.anasol.com</p>
      <p style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
        This is a computer-generated document and does not require a signature
      </p>
    </div>
  </div>
</body>
</html>`;
};

  const handleDownloadExcel = async () => {
    try {
      // Create CSV content from actual data
      const headers = ['Employee ID', 'Employee Name', 'Designation', 'Department', 'Gross Earnings', 'Bonus', 'Total Deductions', 'Net Salary'];
      
      const csvContent = [
        headers.join(','),
        ...employeesWithSalary.map(employee => [
          employee.employeeId,
          `"${employee.employeeName}"`,
          `"${employee.designation}"`,
          `"${employee.department}"`,
          employee.grossEarnings,
          employee.bonusAmount,
          employee.totalDeductions,
          employee.netSalary
        ].join(','))
      ].join('\n');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Employee_Salary_Summary_${selectedMonth}_${selectedYear}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Failed to download Excel sheet. Please try again.');
    }
  };

  const handleView = async (employee) => {
  try {
    
    const monthNumber = getMonthNumber(selectedMonth);
    const year = parseInt(selectedYear);
    
    let payrollData;
    try {
      payrollData = await payrollApi.getPayrollByEmployeeAndMonth(
        employee.employeeId, 
        monthNumber, 
        year
      );
      console.log('Payroll data found:', payrollData);
    } catch (payrollError) {
      console.warn('No payroll data found, using employee data only:', payrollError.message);
      payrollData = null;
    }

    // Combine employee data with payroll data
    let fullEmployeeData;
    
    if (payrollData && payrollData.payrollId) {
     
      fullEmployeeData = {
        ...employee,
        ...transformEmployeeToFrontend({
          ...payrollData,
          employee: employee
        })
      };
      console.log('Merged data with payroll:', fullEmployeeData);
    } else {
      // If no payroll data, use the employee data with calculated values
      fullEmployeeData = transformEmployeeToFrontend(employee);
      console.log('Using employee data with calculations:', fullEmployeeData);
    }

    setSelectedEmployee(fullEmployeeData);
    
  } catch (error) {
    console.error('Error fetching employee details:', error);
    // Fallback to basic employee data with transformations
    const fallbackData = transformEmployeeToFrontend(employee);
    setSelectedEmployee(fallbackData);
  }
};

  const handleBackToList = () => {
    setSelectedEmployee(null);
    setIsEditing(false);
    setEditingEmployee(null);
  };

  const handleEdit = (employee) => {
    setEditingEmployee({...employee});
    setIsEditing(true);
  };
  

const handleSaveEdit = async () => {
  if (editingEmployee) {
    try {
      setLoading(true);
      
      const monthNumber = getMonthNumber(selectedMonth);
      const year = parseInt(selectedYear);
      
      console.log(`Fetching payroll for: ${editingEmployee.employeeId}, ${monthNumber}, ${year}`);
      
      let payrollData;
      try {
        payrollData = await payrollApi.getPayrollByEmployeeAndMonth(
          editingEmployee.employeeId, 
          monthNumber, 
          year
        );
        
        console.log('Full payroll response:', payrollData);
        
      } catch (error) {
        console.error('Error fetching payroll:', error);
        alert('No payroll record found. Please generate payroll for this employee first.');
        return;
      }
      
      const payrollId = payrollData.payrollId;
      console.log('Extracted payroll ID:', payrollId);
      
      if (!payrollId) {
        console.error('No payroll ID found in response. Available keys:', Object.keys(payrollData));
        alert('Could not find payroll ID. Please check the payroll data.');
        return;
      }

      try {
        // USE THE CORRECT UPDATE ENDPOINT
        await payrollApi.updatePayrollComponents(payrollId, {
           bonusAmount: editingEmployee.bonus || 0,
          hikePercentage: editingEmployee.hike || 0,
          basicSalary: editingEmployee.basicSalary,
          hraAmount: editingEmployee.hra,
          conveyanceAllowance: editingEmployee.conveyanceAllowance,
          medicalAllowance: editingEmployee.medicalAllowance,
          specialAllowance: editingEmployee.specialAllowance,
          otherAllowances: editingEmployee.otherAllowances,
          providentFund: editingEmployee.providentFund,
          professionalTax: editingEmployee.professionalTax,
          incomeTax: editingEmployee.incomeTax,
          otherDeductions: editingEmployee.otherDeductions
        });

        // Refresh data
        setTimeout(async () => {
          await fetchEmployeesData();
        }, 500);
        
        setIsEditing(false);
        setEditingEmployee(null);
        alert('Employee payroll updated successfully!');
        
      } catch (updateError) {
        console.error('Error updating payroll:', updateError);
        console.error('Error response:', updateError.response?.data);
        alert('Failed to update payroll. Please try again.');
      }
      
    } catch (error) {
      console.error('Error in handleSaveEdit:', error);
      alert('Failed to update employee. Please try again.');
    } finally {
      setLoading(false);
    }
  }
};

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingEmployee(null);
  };

  // Fix the employeesWithSalary calculation with safe defaults
  // Fix the employeesWithSalary calculation with safe defaults
const employeesWithSalary = (employeesData || []).map((employee, index) => {
  // Use actual backend data if available, otherwise calculate
  const grossEarnings = employee.grossEarnings || 
                       employee.earnings?.reduce((sum, item) => sum + (item?.total || 0), 0) || 0;
  
  const totalDeductions = employee.totalDeductions || 
                         employee.deductions?.reduce((sum, item) => sum + (item?.amount || 0), 0) || 0;
  
  const bonusAmount = employee.bonus || 0;
  const netSalary = employee.netSalary || (grossEarnings - totalDeductions + bonusAmount);
  
  return {
    id: employee?.id || employee?.employeeId || `emp-${index}`,
    employeeId: employee?.employeeId || `unknown-${index}`,
    employeeName: employee?.employeeName || 'Unknown Employee',
    designation: employee?.designation || '-',
    department: employee?.department || '-',
    email: employee?.email || '-',
    phoneNumber: employee?.phoneNumber || '-',
    annualSalary: employee?.annualSalary || 0,
    // Include all other employee properties
    ...employee,
    grossEarnings,
    totalDeductions,
    bonusAmount,
    netSalary,
    // Ensure earnings and deductions are always arrays
    earnings: employee.earnings || [],
    deductions: employee.deductions || []
  };
});

const filteredEmployeesWithSalary = employeesWithSalary.filter(employee => {
  if (!searchTerm.trim()) return true; 
  const searchLower = searchTerm.toLowerCase().trim();
  
  return (
    (employee.employeeName?.toLowerCase().includes(searchLower) || false) ||
    (employee.designation?.toLowerCase().includes(searchLower) || false) ||
    (employee.employeeId?.toLowerCase().includes(searchLower) || false) ||
    (employee.email?.toLowerCase().includes(searchLower) || false) ||
    (employee.department?.toLowerCase().includes(searchLower) || false)
  );
});

  // If an employee is selected, show their payslip
  if (selectedEmployee && !isEditing) {
    const paySlipData = selectedEmployee;
    const grossEarnings = paySlipData.grossEarnings || 0;
    const totalDeductions = paySlipData.totalDeductions || 0;
    const bonusAmount = paySlipData.bonusAmount || 0;
    const netSalary = paySlipData.netSalary || 0;

    

    return (
        <div className={`min-h-screen p-6 ${
        isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'
      }`}>
        <div className={`max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-purple-800 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">ANASOL CONSULTANCY SERVICES PVT LTD</h1>
                <h2 className="text-xl mt-2 opacity-90">SALARY SLIP</h2>
                <div className="mt-3 bg-white/20 px-4 py-1 rounded-full inline-block text-sm">
                  {selectedMonth} {selectedYear}
                </div>
              </div>
              <div className="w-24 h-24 bg-white/20 rounded-xl flex items-center justify-center">
                <img 
                  src="/assets/anasol-logo.png" 
                  alt="Anasol Logo" 
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className={`p-4 border-b flex justify-between items-center ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <button 
              onClick={handleBackToList}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              ← Back to Employee List
            </button>
            <button 
              onClick={() => handleEdit(selectedEmployee)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              Edit Salary
            </button>
          </div>

          {/* Pay Slip Content */}
          <div ref={paySlipRef} className="p-8">
            {/* Employee Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-xl shadow-sm border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-100'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>Personal Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className={`font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Employee Name:</span>
                    <span className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>{paySlipData.employeeName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className={`font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Employee ID:</span>
                    <span className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>{paySlipData.employeeId}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className={`font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Designation:</span>
                    <span className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>{paySlipData.designation}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className={`font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Department:</span>
                    <span className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>{paySlipData.department}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>Phone No:</span>
                    <span className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>{paySlipData.phoneNo}</span>
                  </div>
                </div>
              </div>

             <div className={`p-6 rounded-xl shadow-sm border ${
  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'
}`}>
  <h3 className={`text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3 ${
    isDark ? 'text-gray-200' : 'text-gray-800'
  }`}>Bank & Tax Information</h3>
  <div className="space-y-3">
    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
      <span className={`font-medium ${
        isDark ? 'text-gray-300' : 'text-gray-600'
      }`}>Bank A/C Name:</span>
      <span className={`font-semibold ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>{paySlipData.bankAccountName}</span>
    </div>
    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
      <span className={`font-medium ${
        isDark ? 'text-gray-300' : 'text-gray-600'
      }`}>PAN No:</span>
      <span className={`font-semibold ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>{paySlipData.panNo}</span>
    </div>
    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
      <span className={`font-medium ${
        isDark ? 'text-gray-300' : 'text-gray-600'
      }`}>PF No:</span>
      <span className={`font-semibold ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>{paySlipData.pfNo}</span>
    </div>
    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
      <span className={`font-medium ${
        isDark ? 'text-gray-300' : 'text-gray-600'
      }`}>IFSC Code:</span>
      <span className={`font-semibold ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>{paySlipData.ifsccode}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className={`font-medium ${
        isDark ? 'text-gray-300' : 'text-gray-600'
      }`}>Email:</span>
      <span className={`font-semibold ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>{paySlipData.email}</span>
    </div>
  </div>
</div>
</div>

            {/* Attendance Information */}
            <div className="mb-8">
  <h3 className={`text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3 ${
    isDark ? 'text-gray-200' : 'text-gray-800'
  }`}>Attendance Information</h3>
  <div className={`overflow-x-auto rounded-xl shadow-sm border ${
    isDark ? 'border-gray-600' : 'border-gray-200'
  }`}>
    <table className={`min-w-full ${
      isDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      <thead>
        <tr className={`${
          isDark 
            ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
            : 'bg-gradient-to-r from-gray-50 to-blue-50'
        }`}>
          <th className={`border-b px-6 py-4 font-semibold ${
            isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
          }`}>Standard Days</th>
          <th className={`border-b px-6 py-4 font-semibold ${
            isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
          }`}>Payable Days</th>
          <th className={`border-b px-6 py-4 font-semibold ${
            isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
          }`}>Loss of Pay Days</th>
          <th className={`border-b px-6 py-4 font-semibold ${
            isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
          }`}>LOP Reversal Days</th>
          <th className={`border-b px-6 py-4 font-semibold ${
            isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
          }`}>Arrear Days</th>
        </tr>
      </thead>
     
<tbody>
  <tr>
    <td className={`border-b px-6 py-4 text-center font-medium ${
      isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
    }`}>{formatNumber(paySlipData.standardDays)}</td>
    <td className={`border-b px-6 py-4 text-center font-medium ${
      isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
    }`}>{formatNumber(paySlipData.payableDays)}</td>
    <td className={`border-b px-6 py-4 text-center font-medium ${
      isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
    }`}>{formatNumber(paySlipData.lossOfPayDays)}</td>
    <td className={`border-b px-6 py-4 text-center font-medium ${
      isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
    }`}>{formatNumber(paySlipData.lopReversalDays)}</td>
    <td className={`border-b px-6 py-4 text-center font-medium ${
      isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
    }`}>{formatNumber(paySlipData.arrearDays)}</td>
  </tr>
</tbody>
    </table>
  </div>
</div>


            {/* Bonus Information */}
            {bonusAmount > 0 && (
  <div className="mb-8">
    <h3 className={`text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3 ${
      isDark ? 'text-gray-200' : 'text-gray-800'
    }`}>Additional Compensation</h3>
    <div className={`overflow-x-auto rounded-xl shadow-sm border ${
      isDark ? 'border-gray-600' : 'border-gray-200'
    }`}>
      <table className={`min-w-full ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <thead>
          <tr className={`${
            isDark 
              ? 'bg-gradient-to-r from-yellow-900 to-orange-900' 
              : 'bg-gradient-to-r from-yellow-50 to-orange-50'
          }`}>
            <th className={`border-b px-6 py-4 font-semibold ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
            }`}>Bonus Amount</th>
            <th className={`border-b px-6 py-4 font-semibold ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
            }`}>Hike Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={`border-b px-6 py-4 text-center font-bold ${
              isDark ? 'border-gray-700 text-yellow-400' : 'border-gray-100 text-yellow-700'
            }`}>₹{bonusAmount.toLocaleString()}</td>
            <td className={`border-b px-6 py-4 text-center font-medium ${
              isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
            }`}>{paySlipData.hike || 0}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
)}


            {/* Salary Details */}
          <div className="mb-8">
  <h3 className={`text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3 ${
    isDark ? 'text-gray-200' : 'text-gray-800'
  }`}>Salary Details</h3>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Earnings */}
    <div className="lg:col-span-2">
      <h4 className={`font-semibold mb-3 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>EARNINGS</h4>
      <div className={`overflow-x-auto rounded-xl shadow-sm border ${
        isDark ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <table className={`min-w-full ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <thead>
            <tr className={`${
              isDark 
                ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
                : 'bg-gradient-to-r from-gray-50 to-blue-50'
            }`}>
              <th className={`border-b px-4 py-3 font-semibold ${
                isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
              }`}>Description</th>
              <th className={`border-b px-4 py-3 font-semibold text-right ${
                isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
              }`}>Monthly Rate</th>
              <th className={`border-b px-4 py-3 font-semibold text-right ${
                isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
              }`}>Current Month</th>
              <th className={`border-b px-4 py-3 font-semibold text-right ${
                isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
              }`}>Arrear (+/-)</th>
              <th className={`border-b px-4 py-3 font-semibold text-right ${
                isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
              }`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(paySlipData.earnings || []).map((earning, index) => (
              <tr key={index} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className={`border-b px-4 py-3 ${
                  isDark ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-gray-700'
                }`}>{earning.name}</td>
                <td className={`border-b px-4 py-3 text-right font-medium ${
                  isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                }`}>₹{(earning.monthlyRate || 0).toLocaleString()}</td>
                <td className={`border-b px-4 py-3 text-right font-medium ${
                  isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                }`}>₹{(earning.currentMonth || 0).toLocaleString()}</td>
                <td className={`border-b px-4 py-3 text-right font-medium ${
                  isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                }`}>{earning.arrear || 0}</td>
                <td className={`border-b px-4 py-3 text-right font-medium ${
                  isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                }`}>₹{(earning.total || 0).toLocaleString()}</td>
              </tr>
            ))}
            {bonusAmount > 0 && (
              <tr className={isDark ? 'bg-yellow-900 hover:bg-yellow-800' : 'bg-yellow-50 hover:bg-yellow-100'}>
                <td className={`border-b px-4 py-3 font-semibold ${
                  isDark ? 'border-gray-600 text-yellow-300' : 'border-gray-100 text-yellow-800'
                }`}>BONUS</td>
                <td className={`border-b px-4 py-3 text-right font-medium ${
                  isDark ? 'border-gray-600 text-yellow-300' : 'border-gray-100 text-yellow-800'
                }`}>-</td>
                <td className={`border-b px-4 py-3 text-right font-medium ${
                  isDark ? 'border-gray-600 text-yellow-300' : 'border-gray-100 text-yellow-800'
                }`}>-</td>
                <td className={`border-b px-4 py-3 text-right font-medium ${
                  isDark ? 'border-gray-600 text-yellow-300' : 'border-gray-100 text-yellow-800'
                }`}>-</td>
                <td className={`border-b px-4 py-3 text-right font-bold ${
                  isDark ? 'border-gray-600 text-yellow-300' : 'border-gray-100 text-yellow-800'
                }`}>₹{bonusAmount.toLocaleString()}</td>
              </tr>
            )}
            <tr className={isDark ? 'bg-blue-900' : 'bg-blue-50'}>
              <td className={`border-b px-4 py-3 font-semibold ${
                isDark ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-800'
              }`} colSpan="4">GROSS EARNINGS</td>
              <td className={`border-b px-4 py-3 text-right font-semibold ${
                isDark ? 'border-gray-600 text-blue-300' : 'border-gray-200 text-blue-800'
              }`}>₹{grossEarnings.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

                {/* Deductions */}
                <div>
      <h4 className={`font-semibold mb-3 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>DEDUCTIONS</h4>
      <div className={`overflow-x-auto rounded-xl shadow-sm border ${
        isDark ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <table className={`min-w-full ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <thead>
            <tr className={`${
              isDark 
                ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
                : 'bg-gradient-to-r from-gray-50 to-blue-50'
            }`}>
              <th className={`border-b px-4 py-3 font-semibold ${
                isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
              }`}>Description</th>
              <th className={`border-b px-4 py-3 font-semibold text-right ${
                isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
              }`}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(paySlipData.deductions || []).map((deduction, index) => (
              <tr key={index} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className={`border-b px-4 py-3 ${
                  isDark ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-gray-700'
                }`}>{deduction.name}</td>
                <td className={`border-b px-4 py-3 text-right font-medium ${
                  isDark ? 'border-gray-700 text-red-400' : 'border-gray-100 text-red-600'
                }`}>₹{(deduction.amount || 0).toLocaleString()}</td>
              </tr>
            ))}
            <tr className={isDark ? 'bg-blue-900' : 'bg-blue-50'}>
              <td className={`border-b px-4 py-3 font-semibold ${
                isDark ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-800'
              }`}>TOTAL DEDUCTIONS</td>
              <td className={`border-b px-4 py-3 text-right font-semibold ${
                isDark ? 'border-gray-600 text-red-400' : 'border-gray-200 text-red-700'
              }`}>₹{totalDeductions.toLocaleString()}</td>
            </tr>
            {bonusAmount > 0 && (
              <tr className={isDark ? 'bg-yellow-900' : 'bg-yellow-50'}>
                <td className={`border-b px-4 py-3 font-semibold ${
                  isDark ? 'border-gray-600 text-yellow-300' : 'border-gray-200 text-yellow-800'
                }`}>BONUS ADDED</td>
                <td className={`border-b px-4 py-3 text-right font-semibold ${
                  isDark ? 'border-gray-600 text-yellow-300' : 'border-gray-200 text-yellow-800'
                }`}>+ ₹{bonusAmount.toLocaleString()}</td>
              </tr>
            )}
            <tr className={isDark ? 'bg-green-900' : 'bg-green-50'}>
              <td className={`border-b px-4 py-3 font-bold ${
                isDark ? 'border-gray-600 text-green-300' : 'border-gray-200 text-green-800'
              }`}>NET SALARY</td>
              <td className={`border-b px-4 py-3 text-right font-bold ${
                isDark ? 'border-gray-600 text-green-300' : 'border-gray-200 text-green-800'
              }`}>₹{netSalary.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

            {/* Footer */}
           <div className={`mt-8 pt-6 border-t text-center text-sm ${
  isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
}`}>
              <p>#1016, 11th Floor, DSL Abacus IT Park, Uppal Hyderabad-500039 | Ph: 9632091726</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Add Employee Form Modal */}
      {/* <AddEmployeeForm
        isAdding={isAdding}
        newEmployee={newEmployee}
        onEmployeeChange={handleNewEmployeeChange}
        onSave={handleSaveNewEmployee}
        onCancel={handleCancelAdd}
        loading={loading}
      /> */}
      
      {/* Edit Form Modal */}
      {isEditing && (
        <EditEmployeeForm
          editingEmployee={editingEmployee}
          onInputChange={handleInputChange}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          loading={loading}
        />
      )}
      <div className={`max-w-7xl mx-auto rounded-2xl shadow-xl overflow-hidden border ${
  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'
}`}>
  <div className="container mx-auto px-4 pt-6">
      <button
        onClick={() => window.history.back()}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          isDark 
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back</span>
      </button>
    </div>

        {/* <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">ANASOL CONSULTANCY SERVICES PVT LTD</h1>
              <p className="text-blue-100">Admin Payroll Management</p>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center">
              <img 
                src="/assets/anasol-logo.png" 
                alt="Anasol Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
        </div> */}

        {/* Filters and Action Buttons */}
      <div className={`p-6 border-b ${
  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
}`}>
  <div className="flex flex-wrap gap-4 items-center justify-between">
    <div className="flex flex-wrap gap-4">
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>Month</label>
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'border-gray-300 text-gray-900'
          }`}
        >
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>Year</label>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className={`border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'border-gray-300 text-gray-900'
          }`}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label htmlFor="search-input" className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Search Employees
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Search by name, role, or employee ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            isDark 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'border-gray-300 text-gray-900'
          }`}
        />
      </div>
    </div>
    <div className="flex gap-4">
      {/* <button 
        onClick={handleAddEmployee}
        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-medium flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Employee
      </button> */}
      <button 
        onClick={handleDownloadExcel}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-medium"
      >
        Download Excel Sheet
      </button>
    </div>
  </div>
</div>


        {/* Employee Salary Table */}
       <div className={`p-6 ${
  isDark ? 'bg-gray-800' : 'bg-white'
}`}>
  <h3 className={`text-2xl font-bold mb-6 ${
    isDark ? 'text-gray-200' : 'text-gray-800'
  }`}>Employee Salary Summary - {selectedMonth} {selectedYear}</h3>
  
  {apiLoading ? (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className={`ml-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading employee data...</span>
    </div>
  ) : (
    <div className={`overflow-x-auto rounded-xl shadow-sm border ${
      isDark ? 'border-gray-600' : 'border-gray-200'
    }`}>
      <table className={`min-w-full ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <thead>
          <tr className={`${
            isDark 
              ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
              : 'bg-gradient-to-r from-gray-50 to-blue-50'
          }`}>
            <th className={`border-b px-6 py-4 text-left font-semibold ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
            }`}>Employee ID</th>
            <th className={`border-b px-6 py-4 text-left font-semibold ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
            }`}>Employee Name</th>
            <th className={`border-b px-6 py-4 text-left font-semibold ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
            }`}>Designation</th>
            <th className={`border-b px-6 py-4 text-left font-semibold ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
            }`}>Department</th>
            <th className={`border-b px-6 py-4 text-right font-semibold ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
            }`}>Gross Earnings</th>
            <th className={`border-b px-6 py-4 text-right font-semibold ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
            }`}>Bonus</th>
            <th className={`border-b px-6 py-4 text-right font-semibold ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
            }`}>Deductions</th>
            <th className={`border-b px-6 py-4 text-right font-semibold ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
            }`}>Net Salary</th>
            <th className={`border-b px-6 py-4 text-center font-semibold ${
              isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
            }`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployeesWithSalary.length > 0 ? (
    filteredEmployeesWithSalary.map(employee => (
              <tr key={employee.id} className={`transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
              }`}>
                <td className={`border-b px-6 py-4 font-medium ${
                  isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                }`}>{employee.employeeId}</td>
                <td className={`border-b px-6 py-4 font-semibold ${
                  isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-800'
                }`}>{employee.employeeName}</td>
                <td className={`border-b px-6 py-4 ${
                  isDark ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-gray-700'
                }`}>{employee.designation}</td>
                <td className={`border-b px-6 py-4 ${
                  isDark ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-gray-700'
                }`}>{employee.department}</td>
                <td className={`border-b px-6 py-4 text-right font-medium ${
                  isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                }`}>
                  ₹{employee.grossEarnings.toLocaleString()}
                </td>
                <td className={`border-b px-6 py-4 text-right font-medium ${
                  isDark ? 'border-gray-700 text-yellow-400' : 'border-gray-100 text-yellow-600'
                }`}>
                  {employee.bonusAmount > 0 ? `₹${employee.bonusAmount.toLocaleString()}` : '-'}
                </td>
                <td className={`border-b px-6 py-4 text-right font-medium ${
                  isDark ? 'border-gray-700 text-red-400' : 'border-gray-100 text-red-600'
                }`}>
                  ₹{employee.totalDeductions.toLocaleString()}
                </td>
                <td className={`border-b px-6 py-4 text-right font-bold ${
                  isDark ? 'border-gray-700 text-green-400' : 'border-gray-100 text-green-700'
                }`}>
                  ₹{employee.netSalary.toLocaleString()}
                </td>
                <td className={`border-b px-6 py-4 ${
                  isDark ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={() => handleView(employee)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      View
                    </button>
                     
                    <button 
                      onClick={() => handleEdit(employee)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                     
                    <button 
                      onClick={() => handleDownloadPayslip(employee)}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium text-sm"
                    >
                      Download
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
             <tr>
      <td colSpan="9" className={`px-6 py-8 text-center ${
        isDark ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {searchTerm ? `No employees found matching "${searchTerm}"` : 'No employees found. Add some employees to get started.'}
      </td>
    </tr>
          )}
        </tbody>
      </table>
    </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayRollPage;