import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Context } from '../HrmsContext';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DetailField = React.memo(
  ({
    label,
    name,
    value,
    isEditing,
    onChange,
    type = "text",
    placeholder = "",
    showLPA = false
  }) => {
    const [localValue, setLocalValue] = useState(value || "");
    const timeoutRef = useRef(null);

    const { theme } = useContext(Context);
    const isDark = theme === "dark";

    
    useEffect(() => {
      if (value !== localValue) {
        setLocalValue(value || "");
      }
    }, [value]); 

    const handleChange = (e) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (onChange) {
          const syntheticEvent = {
            target: {
              name: name,
              value: newValue,
              type: type,
            },
          };
          onChange(syntheticEvent);
        }
      }, 2000);
    };

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <div className="flex flex-col">
        <label className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {label}
        </label>
        {isEditing ? (
          <input
            type={type}
            name={name}
            value={localValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-800'
            }`}
          />
        ) : (
          <div className="relative">
            <span className={`px-3 py-2 rounded-md block min-h-[42px] flex items-center ${
              isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-800'
            }`}>
              {value || "N/A"}
            </span>
            {showLPA && (
              <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                LPA
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);



const EmployeePayRoll = () => {
  const { empId } = useParams();
  
  console.log('Employee ID from URL (empId):', empId);

  const [filters, setFilters] = useState({
    month: '',
    year: ''
  });
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payrollData, setPayrollData] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  // Remove this line: const [activeField, setActiveField] = useState(null);
  const [activeField, setActiveField] = useState(null);

  const token = localStorage.getItem("accessToken");
  const { theme } = useContext(Context);
  const isDark = theme === "dark";

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

 
  useEffect(() => {
    const fetchPayrollData = async () => {
      if (!token || !empId) {
    
        setError('Employee ID not found in URL.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching data for employee ID:', empId);
        
        const payrollResponse = await axios.get(
          `https://hrms.anasolconsultancyservices.com/api/payroll/payroll/employee/${empId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        
        
        if (payrollResponse.data) {
          const payrollData = payrollResponse.data.data || 
                            payrollResponse.data.payroll || 
                            payrollResponse.data;
          
          setPayrollData(Array.isArray(payrollData) ? payrollData : []);
        } else {
          setPayrollData([]);
        }

        await fetchEmployeeDetails();

      } catch (err) {
       
        setError(`Failed to fetch payroll data: ${err.response?.data?.message || err.message}`);
        setPayrollData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, [empId]);

  const fetchEmployeeDetails = async () => {
  try {
    const employeeResponse = await axios.get(
      `http://localhost:8087/api/payroll/employee/${empId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    
    if (employeeResponse.data) {
      const employeeData = employeeResponse.data.data || employeeResponse.data;
      
      
      setEmployee(employeeData);
      setEditFormData(employeeData);
      
     
    } else {
      
      setEmployee(null);
    }
  } catch (err) {
    console.error('Error fetching employee details:', err);
  }
};

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleViewPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setIsModalOpen(true);
  };

const handleDownloadPayslip = async (payslip) => {
    try {
      if (!employee) {
        alert('Employee data not available');
        return;
      }

      const payslipElement = document.createElement('div');
      payslipElement.style.position = 'absolute';
      payslipElement.style.left = '-9999px';
      payslipElement.style.width = '800px';
      payslipElement.style.padding = '20px'; // Reduced padding
      payslipElement.style.backgroundColor = 'white';
      payslipElement.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      
      const grossEarnings = (payslip.basicSalary || 0) + 
                           (payslip.hraAmount || 0) + 
                           (payslip.conveyanceAllowance || 0) +
                           (payslip.medicalAllowance || 0) +
                           (payslip.specialAllowance || 0) +
                           (payslip.bonusAmount || 0);

      const totalDeductions = (payslip.providentFund || 0) + 
                             (payslip.professionalTax || 0) +
                             (payslip.incomeTax || 0);

      const netSalary = payslip.netSalary || (grossEarnings - totalDeductions);

      // Helper function to format numbers
      const formatNumber = (value, decimals = 1) => {
        const num = Number(value);
        if (isNaN(num)) return '0';
        
        if (num % 1 === 0) {
          return num.toString();
        }
        
        return num.toFixed(decimals);
      };

      // Format currency function
      const formatCurrency = (amount) => {
        return '₹' + (amount || 0).toLocaleString('en-IN');
      };

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
                  ${formatPayPeriod(payslip)}
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
                  <td style="padding: 6px 0; font-weight: 600;">${employee.empName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 500; color: #555;">Employee ID:</td>
                  <td style="padding: 6px 0;">${employee.employeeId}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 500; color: #555;">Designation:</td>
                  <td style="padding: 6px 0;">${employee.designation || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 500; color: #555;">Department:</td>
                  <td style="padding: 6px 0;">${employee.department || 'N/A'}</td>
                </tr>
              </table>
            </div>

            <div>
              <div style="font-size: 14px; font-weight: 600; color: #2c5aa0; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e0e0e0;">BANK & STATUTORY DETAILS</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <tr>
                  <td style="padding: 6px 0; font-weight: 500; color: #555; width: 40%;">Bank A/C Name:</td>
                  <td style="padding: 6px 0;">${employee.bankName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 500; color: #555;">PAN No:</td>
                  <td style="padding: 6px 0;">${employee.panNumber || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 500; color: #555;">PF No:</td>
                  <td style="padding: 6px 0;">${employee.pfnum || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: 500; color: #555;">IFSC Code:</td>
                  <td style="padding: 6px 0;">${employee.ifsccode || 'N/A'}</td>
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
                  <td style="padding: 10px; text-align: center; background: white; border: 1px solid #e0e0e0;">${formatNumber(payslip.totalWorkingDays || 0)}</td>
                  <td style="padding: 10px; text-align: center; background: white; border: 1px solid #e0e0e0;">${formatNumber(payslip.daysPresent || 0)}</td>
                  <td style="padding: 10px; text-align: center; background: white; border: 1px solid #e0e0e0;">${formatNumber(payslip.paidDays || 0)}</td>
                  <td style="padding: 10px; text-align: center; background: white; border: 1px solid #e0e0e0;">${formatNumber(payslip.lossOfPayDays || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bonus Information - Only show if bonus exists -->
          ${payslip.bonusAmount > 0 ? `
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
                  <td style="padding: 10px; text-align: center; background: white; border: 1px solid #e0e0e0; font-weight: 600; color: #28a745;">${formatCurrency(payslip.bonusAmount || 0)}</td>
                  <td style="padding: 10px; text-align: center; background: white; border: 1px solid #e0e0e0; font-weight: 600; color: #28a745;">${payslip.hikePercentage || 0}%</td>
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
                      <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(payslip.basicSalary || 0)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">HRA</td>
                      <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(payslip.hraAmount || 0)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Conveyance Allowance</td>
                      <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(payslip.conveyanceAllowance || 0)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Medical Allowance</td>
                      <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(payslip.medicalAllowance || 0)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Special Allowance</td>
                      <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(payslip.specialAllowance || 0)}</td>
                    </tr>
                    ${payslip.bonusAmount > 0 ? `
                    <tr>
                      <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Bonus</td>
                      <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(payslip.bonusAmount || 0)}</td>
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
                      <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(payslip.providentFund || 0)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Professional Tax</td>
                      <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(payslip.professionalTax || 0)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 10px; border-bottom: 1px solid #e0e0e0;">Income Tax</td>
                      <td style="padding: 10px 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">${formatCurrency(payslip.incomeTax || 0)}</td>
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

      document.body.appendChild(payslipElement);

      const canvas = await html2canvas(payslipElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(payslipElement);

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      const monthName = months[payslip.month - 1];
      const fileName = `Payslip_${employee.empName}_${monthName}_${payslip.year}.pdf`;
      
      pdf.save(fileName);
      
    } catch (err) {
      alert(`Failed to generate PDF payslip: ${err.message}`);
    }
  };

  const handleViewDetails = async () => {
    setShowDetails(true);
    if (!employee) {
      await fetchEmployeeDetails();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setActiveField(null); 
  };
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

const handleSave = async () => {
  try {
    setSaveLoading(true);
    
    const updateData = {
      empName: editFormData.empName,
      email: editFormData.email,
      phoneNumber: editFormData.phoneNumber,
      accountNumber: editFormData.accountNumber,
      bankName: editFormData.bankName,
      panNumber: editFormData.panNumber,
      aadharNumber: editFormData.aadharNumber,
      ifsccode: editFormData.ifsccode,
      pfnum: editFormData.pfnum,
      uanNumber: editFormData.uanNumber,
      department: editFormData.department,
      designation: editFormData.designation
    };

    console.log('Updating employee data:', updateData);

    const response = await axios.put(
      `https://hrms.anasolconsultancyservices.com/api/payroll/employee/${empId}/update`,
      updateData,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );



    if (response.data && response.data.success) {
    
      const updatedEmployee = response.data.employee;
      
      if (updatedEmployee) {
   
        setEmployee(updatedEmployee);
        setEditFormData(updatedEmployee);
      } else {
        
        console.log('No employee data in response, refetching...');
        await fetchEmployeeDetails();
      }
      
      setIsEditing(false);
      alert('Employee details updated successfully!');
    } else {
      alert('Failed to update employee details: ' + (response.data?.message || 'Unknown error'));
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    
    if (err.response?.status === 401) {
      alert('Admin access required to update employee details. Please check your permissions.');
    } else {
      alert(`Failed to update employee details: ${errorMessage}`);
    }
  } finally {
    setSaveLoading(false);
  }
};

  const handleCancel = () => {
    setIsEditing(false);
    setEditFormData(employee); 
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPayPeriod = (payrollItem) => {
    if (!payrollItem) return 'N/A';
    const month = payrollItem.month;
    const year = payrollItem.year;
    return `${months[month - 1]} ${year}`;
  };

  const getMonthFromPayroll = (payrollItem) => {
    if (!payrollItem) return '';
    return months[payrollItem.month - 1];
  };

  const getYearFromPayroll = (payrollItem) => {
    if (!payrollItem) return '';
    return payrollItem.year.toString();
  };

  const filteredData = Array.isArray(payrollData)
    ? payrollData.filter(item => {
        if (!item) return false;
        
        const itemMonth = item.month ? item.month.toString() : '';
        const itemYear = item.year ? item.year.toString() : '';

        console.log('Filtering item:', { itemMonth, itemYear, filters });

        if (filters.month && itemMonth !== filters.month) return false;
        if (filters.year && itemYear !== filters.year) return false;
        
        return true;
      })
    : [];

  console.log('Final filtered data count:', filteredData.length);

  const EmployeeDetails = () => {
    if (!employee) {
      return (
        <div className="p-6">
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No employee details found.
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>My Details</h2>
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Details
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className={`p-6 rounded-lg border shadow-sm ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${
              isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'
            }`}>Personal Information</h3>
            <div className="space-y-3">
              <DetailField 
                key="employeeId"
                label="Employee ID" 
                value={employee.employeeId} 
                isEditing={false}
              />
              <DetailField 
                key="empName"
                label="Full Name" 
                name="empName"
                value={isEditing ? editFormData.empName : employee.empName} 
                isEditing={isEditing}
                onChange={handleInputChange}
              />
              <DetailField 
                key="email"
                label="Email" 
                name="email"
                value={isEditing ? editFormData.email : employee.email} 
                isEditing={isEditing}
                onChange={handleInputChange}
                type="email"
              />
              <DetailField 
                key="phoneNumber"
                label="Phone Number" 
                name="phoneNumber"
                value={isEditing ? editFormData.phoneNumber : employee.phoneNumber} 
                isEditing={isEditing}
                onChange={handleInputChange}
                type="tel"
              />
              <DetailField 
                key="aadharNumber"
                label="Aadhar Number" 
                name="aadharNumber"
                value={isEditing ? editFormData.aadharNumber : employee.aadharNumber} 
                isEditing={isEditing}
                onChange={handleInputChange}
                type="number"
              />
              <DetailField 
                key="panNumber"
                label="PAN Number" 
                name="panNumber"
                value={isEditing ? editFormData.panNumber : employee.panNumber} 
                isEditing={isEditing}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Employment Details */}
          <div className={`p-6 rounded-lg border shadow-sm ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${
              isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'
            }`}>Employment Details</h3>
            <div className="space-y-3">
              <DetailField 
                key="department"
                label="Department" 
                name="department"
                value={isEditing ? editFormData.department : employee.department} 
                isEditing={isEditing}
                onChange={handleInputChange}
              />
              <DetailField 
                key="designation"
                label="Designation" 
                name="designation"
                value={isEditing ? editFormData.designation : employee.designation} 
                isEditing={isEditing}
                onChange={handleInputChange}
                placeholder="Enter designation"
              />
              <DetailField 
                key="jobType"
                label="Job Type" 
                value={employee.jobType} 
                isEditing={false}
              />
              <DetailField 
                key="intern"
                label="Intern" 
                value={employee.stipend} 
                isEditing={false}
              />
              <DetailField 
                key="level"
                label="Level" 
                value={employee.level} 
                isEditing={false}
              />
              <DetailField 
                key="startDate"
                label="Start Date" 
                value={employee.startDate ? new Date(employee.startDate).toLocaleDateString('en-IN') : 'N/A'} 
                isEditing={false}
              />
            </div>
          </div>

          {/* Bank & Salary Information */}
          <div className={`p-6 rounded-lg border shadow-sm ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 border-b pb-2 ${
              isDark ? 'text-white border-gray-700' : 'text-gray-800 border-gray-200'
            }`}>Bank & Salary Information</h3>
            <div className="space-y-3">
              <DetailField 
                key="bankName"
                label="Bank Name" 
                name="bankName"
                value={isEditing ? editFormData.bankName : employee.bankName} 
                isEditing={isEditing}
                onChange={handleInputChange}
              />
              <DetailField 
                key="accountNumber"
                label="Account Number" 
                name="accountNumber"
                value={isEditing ? editFormData.accountNumber : employee.accountNumber} 
                isEditing={isEditing}
                onChange={handleInputChange}
                type="number"
              />
              <DetailField 
                key="ifsccode"
                label="IFSC Code" 
                name="ifsccode"
                value={isEditing ? editFormData.ifsccode : employee.ifsccode} 
                isEditing={isEditing}
                onChange={handleInputChange}
              />
              <DetailField 
                key="pfnum"
                label="PF Number" 
                name="pfnum"
                value={isEditing ? editFormData.pfnum : employee.pfnum} 
                isEditing={isEditing}
                onChange={handleInputChange}
              />
              <DetailField 
                key="uanNumber"
                label="UAN Number" 
                name="uanNumber"
                value={isEditing ? editFormData.uanNumber : employee.uanNumber} 
                isEditing={isEditing}
                onChange={handleInputChange}
              />
              <DetailField 
                key="monthlySalary"
                label="Monthly Salary" 
                value={formatCurrency(employee.monthlySalary)} 
                isEditing={false}
              />
              <DetailField 
                key="annualSalary"
                label="Annual Salary" 
                value={formatCurrency(employee.annualSalary)} 
                isEditing={false}
                showLPA={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Filter Section Component
  const FilterSection = () => {
    const handleMonthChange = (e) => {
      handleFilterChange({ ...filters, month: e.target.value });
    };

    const handleYearChange = (e) => {
      handleFilterChange({ ...filters, year: e.target.value });
    };

    return (
      <div className={`p-6 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
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
        <div className="flex flex-wrap gap-4 items-center">
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Month
            </label>
            <select 
              className={`w-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
              onChange={handleMonthChange}
              value={filters.month}
            >
              <option value="">All Months</option>
              {months.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Year
            </label>
            <select 
              className={`w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-800'
              }`}
              onChange={handleYearChange}
              value={filters.year}
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex space-x-3">
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={handleViewDetails}
            >
              View  Details
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => handleFilterChange({ month: '', year: '' })}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PayrollTable = () => {
    if (loading) {
      return (
        <div className="p-6">
          
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading payroll data...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <div className={`text-center py-8 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </div>
        </div>
      );
    }

    if (!empId) {
      return (
        <div className="p-6">
          <div className={`text-center py-8 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            Employee ID not available. Please check your login.
          </div>
        </div>
      );
    }
   
const formatNumber = (value, decimals = 1) => {
  const num = Number(value);
  if (isNaN(num)) return '0';
 
  if (num % 1 === 0) {
    return num.toString();
  }
 
  return num.toFixed(decimals);
};

    return (
    <div className="p-6">
      
      <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
        Payroll History {employee && `- ${employee.empName}`}
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white">
              <th className="px-4 py-3 text-left font-semibold">Month</th>
              <th className="px-4 py-3 text-left font-semibold">Year</th>
              <th className="px-4 py-3 text-right font-semibold">Net Salary</th>
              <th className="px-4 py-3 text-right font-semibold">Bonus</th>
              
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.payrollId} className={`border-b ${
                isDark 
                  ? 'border-gray-700 hover:bg-gray-800' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <td className={`px-4 py-3 font-medium ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {getMonthFromPayroll(item)}
                </td>
                <td className={`px-4 py-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {getYearFromPayroll(item)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-green-600">
                  {formatCurrency(item.netSalary)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-orange-600">
                  {formatCurrency(item.bonusAmount || 0)}
                </td>
               
                <td className="px-4 py-3">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleViewPayslip(item)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadPayslip(item)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                    >
                      Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        {filteredData.length === 0 && !loading && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No payroll records found for the selected filters.
          </div>
        )}
      </div>
    );
  };

  // Payslip Modal Component
  const PayslipModal = () => {
    if (!selectedPayslip || !employee) return null;

   const grossEarnings = (selectedPayslip.basicSalary || 0) + 
                     (selectedPayslip.hraAmount || 0) + 
                     (selectedPayslip.conveyanceAllowance || 0) +
                     (selectedPayslip.medicalAllowance || 0) +
                     (selectedPayslip.specialAllowance || 0) +
                     (selectedPayslip.bonusAmount || 0); 

    const totalDeductions = (selectedPayslip.providentFund || 0) + 
                           (selectedPayslip.professionalTax || 0) +
                           (selectedPayslip.incomeTax || 0);

    const earnings = [
      { description: "BASIC", monthlyRate: formatCurrency(selectedPayslip.basicSalary), currentMonth: formatCurrency(selectedPayslip.basicSalary), arrear: "0", total: formatCurrency(selectedPayslip.basicSalary) },
      { description: "HRA", monthlyRate: formatCurrency(selectedPayslip.hraAmount), currentMonth: formatCurrency(selectedPayslip.hraAmount), arrear: "0", total: formatCurrency(selectedPayslip.hraAmount) },
      { description: "CONVEYANCE", monthlyRate: formatCurrency(selectedPayslip.conveyanceAllowance), currentMonth: formatCurrency(selectedPayslip.conveyanceAllowance), arrear: "0", total: formatCurrency(selectedPayslip.conveyanceAllowance) },
      { description: "MEDICAL", monthlyRate: formatCurrency(selectedPayslip.medicalAllowance), currentMonth: formatCurrency(selectedPayslip.medicalAllowance), arrear: "0", total: formatCurrency(selectedPayslip.medicalAllowance) },
      { description: "SPECIAL ALLOWANCE", monthlyRate: formatCurrency(selectedPayslip.specialAllowance), currentMonth: formatCurrency(selectedPayslip.specialAllowance), arrear: "0", total: formatCurrency(selectedPayslip.specialAllowance) }
    ];

    const deductions = [
      { description: "PROVIDENT FUND", amount: formatCurrency(selectedPayslip.providentFund) },
      { description: "PROFESSIONAL TAX", amount: formatCurrency(selectedPayslip.professionalTax) },
      { description: "INCOME TAX", amount: formatCurrency(selectedPayslip.incomeTax) }
    ];

    if (selectedPayslip.bonusAmount > 0) {
      earnings.push({
        description: "BONUS",
        monthlyRate: formatCurrency(selectedPayslip.bonusAmount),
        currentMonth: formatCurrency(selectedPayslip.bonusAmount),
        arrear: "0",
        total: formatCurrency(selectedPayslip.bonusAmount)
      });
    }
   
const formatNumber = (value, decimals = 1) => {
  const num = Number(value);
  if (isNaN(num)) return '0';
  
  
  if (num % 1 === 0) {
    return num.toString();
  }

  return num.toFixed(decimals);
};

 return (
 <div className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-md flex items-center justify-center p-4 z-50">
    <div className={`max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'
    }`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-purple-800 text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ANASOL CONSULTANCY SERVICES PVT LTD</h1>
            <h2 className="text-xl mt-2 opacity-90">SALARY SLIP</h2>
            <div className="mt-3 bg-white/20 px-4 py-1 rounded-full inline-block text-sm">
              {formatPayPeriod(selectedPayslip)}
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
          onClick={() => setIsModalOpen(false)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          ← Back to Employee List
        </button>
        <button 
          onClick={() => handleDownloadPayslip(selectedPayslip)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Download PDF
        </button>
      </div>

      {/* Pay Slip Content */}
      <div className="p-8 max-h-[70vh] overflow-y-auto">
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
                }`}>{employee.empName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Employee ID:</span>
                <span className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{employee.employeeId}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Designation:</span>
                <span className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{employee.designation || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Department:</span>
                <span className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{employee.department || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Phone No:</span>
                <span className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{employee.phoneNumber || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-sm border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-100'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 border-l-4 border-blue-500 pl-3 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>Bank & Tax Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Bank A/C Name:</span>
                <span className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{employee.bankName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>PAN No:</span>
                <span className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{employee.panNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>PF No:</span>
                <span className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{employee.pfnum || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>IFSC Code:</span>
                <span className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{employee.ifsccode || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>Email:</span>
                <span className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>{employee.email || 'N/A'}</span>
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
                  }`}>Total Working Days</th>
                  <th className={`border-b px-6 py-4 font-semibold ${
                    isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
                  }`}>Days Present</th>
                  <th className={`border-b px-6 py-4 font-semibold ${
                    isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
                  }`}>Paid Days</th>
                  <th className={`border-b px-6 py-4 font-semibold ${
                    isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-700'
                  }`}>Loss of Pay Days</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={`border-b px-6 py-4 text-center font-medium ${
                    isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                  }`}>{formatNumber(selectedPayslip.totalWorkingDays || 0)}</td>
                  <td className={`border-b px-6 py-4 text-center font-medium ${
                    isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                  }`}>{formatNumber(selectedPayslip.daysPresent || 0)}</td>
                  <td className={`border-b px-6 py-4 text-center font-medium ${
                    isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                  }`}>{formatNumber(selectedPayslip.paidDays || 0)}</td>
                  <td className={`border-b px-6 py-4 text-center font-medium ${
                    isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                  }`}>{formatNumber(selectedPayslip.lossOfPayDays || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bonus Information */}
        {selectedPayslip.bonusAmount > 0 && (
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
                    }`}>{formatCurrency(selectedPayslip.bonusAmount || 0)}</td>
                    <td className={`border-b px-6 py-4 text-center font-medium ${
                      isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                    }`}>{selectedPayslip.hikePercentage || 0}%</td>
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
                    {earnings.map((earning, index) => (
                      <tr key={index} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={`border-b px-4 py-3 ${
                          isDark ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-gray-700'
                        }`}>{earning.description}</td>
                        <td className={`border-b px-4 py-3 text-right font-medium ${
                          isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                        }`}>{earning.monthlyRate}</td>
                        <td className={`border-b px-4 py-3 text-right font-medium ${
                          isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                        }`}>{earning.currentMonth}</td>
                        <td className={`border-b px-4 py-3 text-right font-medium ${
                          isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                        }`}>{earning.arrear}</td>
                        <td className={`border-b px-4 py-3 text-right font-medium ${
                          isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'
                        }`}>{earning.total}</td>
                      </tr>
                    ))}
                    {selectedPayslip.bonusAmount > 0 && (
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
                        }`}>{formatCurrency(selectedPayslip.bonusAmount || 0)}</td>
                      </tr>
                    )}
                    <tr className={isDark ? 'bg-blue-900' : 'bg-blue-50'}>
                      <td className={`border-b px-4 py-3 font-semibold ${
                        isDark ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-800'
                      }`} colSpan="4">GROSS EARNINGS</td>
                      <td className={`border-b px-4 py-3 text-right font-semibold ${
                        isDark ? 'border-gray-600 text-blue-300' : 'border-gray-200 text-blue-800'
                      }`}>{formatCurrency(grossEarnings + (selectedPayslip.bonusAmount || 0))}</td>
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
                    {deductions.map((deduction, index) => (
                      <tr key={index} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={`border-b px-4 py-3 ${
                          isDark ? 'border-gray-700 text-gray-300' : 'border-gray-100 text-gray-700'
                        }`}>{deduction.description}</td>
                        <td className={`border-b px-4 py-3 text-right font-medium ${
                          isDark ? 'border-gray-700 text-red-400' : 'border-gray-100 text-red-600'
                        }`}>{deduction.amount}</td>
                      </tr>
                    ))}
                    <tr className={isDark ? 'bg-blue-900' : 'bg-blue-50'}>
                      <td className={`border-b px-4 py-3 font-semibold ${
                        isDark ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-800'
                      }`}>TOTAL DEDUCTIONS</td>
                      <td className={`border-b px-4 py-3 text-right font-semibold ${
                        isDark ? 'border-gray-600 text-red-400' : 'border-gray-200 text-red-700'
                      }`}>{formatCurrency(totalDeductions)}</td>
                    </tr>
                    {selectedPayslip.bonusAmount > 0 && (
                      <tr className={isDark ? 'bg-yellow-900' : 'bg-yellow-50'}>
                        <td className={`border-b px-4 py-3 font-semibold ${
                          isDark ? 'border-gray-600 text-yellow-300' : 'border-gray-200 text-yellow-800'
                        }`}>BONUS ADDED</td>
                        <td className={`border-b px-4 py-3 text-right font-semibold ${
                          isDark ? 'border-gray-600 text-yellow-300' : 'border-gray-200 text-yellow-800'
                        }`}>+ {formatCurrency(selectedPayslip.bonusAmount || 0)}</td>
                      </tr>
                    )}
                    <tr className={isDark ? 'bg-green-900' : 'bg-green-50'}>
                      <td className={`border-b px-4 py-3 font-bold ${
                        isDark ? 'border-gray-600 text-green-300' : 'border-gray-200 text-green-800'
                      }`}>NET SALARY</td>
                      <td className={`border-b px-4 py-3 text-right font-bold ${
                        isDark ? 'border-gray-600 text-green-300' : 'border-gray-200 text-green-800'
                      }`}>{formatCurrency(selectedPayslip.netSalary)}</td>
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
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white rounded-t-2xl mb-8">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              {employee ? (
                <div className="mt-2">
                  <p className="text-blue-200 text-sm">
                    <strong> Employee:</strong> {employee.empName} | ID: {employee.employeeId}
                  </p>
                  <p className="text-blue-200 text-sm">
                    <strong>Department:</strong> {employee.department || 'N/A'} | <strong>Designation:</strong> {employee.designation || 'N/A'}
                  </p>
                </div>
              ) : (
                <p className="text-blue-200 text-sm mt-1">
                  Loading employee {empId} details...
                </p>
              )}
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold">
              <img 
                src="/assets/anasol-logo.png" 
                alt="Anasol Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
        </header>
        {/* Main Content */}
        <div className={`rounded-2xl shadow-lg overflow-hidden ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          {showDetails ? <EmployeeDetails /> : (
            <>
              <FilterSection />
              <PayrollTable />
            </>
          )}
        </div>
      </div>

      {isModalOpen && <PayslipModal />}
    </div>
  );
};

export default EmployeePayRoll;