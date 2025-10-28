
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
        <label className="text-sm font-medium text-gray-600 mb-1">
          {label}
        </label>
        {isEditing ? (
          <input
            type={type}
            name={name}
            value={localValue}
            onChange={handleChange}
            placeholder={placeholder}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        ) : (
          <div className="relative">
            <span className="px-3 py-2 bg-gray-50 rounded-md text-gray-800 block min-h-[42px] flex items-center">
              {value || "N/A"}
            </span>
            {showLPA && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Separate endpoints for payroll and employee details
  useEffect(() => {
    const fetchPayrollData = async () => {
      if (!token || !empId) {
        console.error('No empId found in URL');
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
        
        console.log('Payroll API Response:', payrollResponse.data);
        
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
        console.error('Error fetching payroll data:', err);
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
        `https://hrms.anasolconsultancyservices.com/api/payroll/employee/${empId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Employee details response:', employeeResponse.data);
      
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
      payslipElement.style.padding = '10px'; 
      payslipElement.style.backgroundColor = 'white';
      
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

      payslipElement.innerHTML = `
        <div style="font-family: 'Arial', sans-serif; max-width: 800px; margin: 0 auto;">
          <!-- Company Header -->
          <div style="background: linear-gradient(135deg, #1e40af, #3730a3); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">ANASOL CONSULTANCY SERVICES PVT LTD</div>
            <div style="font-size: 22px; opacity: 0.9; margin-bottom: 12px;">SALARY SLIP</div>
            <div style="background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 20px; display: inline-block; font-weight: bold;">
              ${formatPayPeriod(payslip)}
            </div>
          </div>

          <!-- Employee Information -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: 600; color: #4b5563;">Employee Name:</span>
                <span style="font-weight: 500; color: #1f2937;">${employee.empName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: 600; color: #4b5563;">Employee ID:</span>
                <span style="font-weight: 500; color: #1f2937;">${employee.employeeId}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: 600; color: #4b5563;">Designation:</span>
                <span style="font-weight: 500; color: #1f2937;">${employee.designation || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: 600; color: #4b5563;">Department:</span>
                <span style="font-weight: 500; color: #1f2937;">${employee.department || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="font-weight: 600; color: #4b5563;">Phone No:</span>
                <span style="font-weight: 500; color: #1f2937;">${employee.phoneNumber || 'N/A'}</span>
              </div>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: 600; color: #4b5563;">Bank A/C Name:</span>
                <span style="font-weight: 500; color: #1f2937;">${employee.empName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: 600; color: #4b5563;">PAN No:</span>
                <span style="font-weight: 500; color: #1f2937;">${employee.panNumber || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: 600; color: #4b5563;">PF No:</span>
                <span style="font-weight: 500; color: #1f2937;">${employee.pfnum || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <span style="font-weight: 600; color: #4b5563;">IFSC Code:</span>
                <span style="font-weight: 500; color: #1f2937;">${employee.ifsccode || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="font-weight: 600; color: #4b5563;">Email:</span>
                <span style="font-weight: 500; color: #1f2937;">${employee.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          <!-- Salary Details -->
          <div style="margin: 20px 0;">
            <div style="font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 12px; border-left: 4px solid #1e40af; padding-left: 10px;">SALARY DETAILS</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <!-- Earnings -->
              <div>
                <div style="font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 8px; border-left: 4px solid #1e40af; padding-left: 10px;">EARNINGS</div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                  <thead>
                    <tr style="background: linear-gradient(135deg, #1e40af, #3730a3); color: white;">
                      <th style="padding: 12px; text-align: left; font-weight: 600;">Description</th>
                      <th style="padding: 12px; text-align: right; font-weight: 600;">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 12px;">Basic Salary</td>
                      <td style="padding: 12px; text-align: right;">${formatCurrency(payslip.basicSalary || 0)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 12px;">HRA</td>
                      <td style="padding: 12px; text-align: right;">${formatCurrency(payslip.hraAmount || 0)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 12px;">Conveyance Allowance</td>
                      <td style="padding: 12px; text-align: right;">${formatCurrency(payslip.conveyanceAllowance || 0)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 12px;">Medical Allowance</td>
                      <td style="padding: 12px; text-align: right;">${formatCurrency(payslip.medicalAllowance || 0)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 12px;">Special Allowance</td>
                      <td style="padding: 12px; text-align: right;">${formatCurrency(payslip.specialAllowance || 0)}</td>
                    </tr>
                    ${payslip.bonusAmount > 0 ? `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 12px;">Bonus</td>
                      <td style="padding: 12px; text-align: right;">${formatCurrency(payslip.bonusAmount || 0)}</td>
                    </tr>
                    ` : ''}
                    <tr style="background: #dbeafe; font-weight: bold;">
                      <td style="padding: 12px;"><strong>GROSS EARNINGS</strong></td>
                      <td style="padding: 12px; text-align: right;"><strong>${formatCurrency(grossEarnings)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Deductions -->
              <div>
                <div style="font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 8px; border-left: 4px solid #1e40af; padding-left: 10px;">DEDUCTIONS</div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                  <thead>
                    <tr style="background: linear-gradient(135deg, #1e40af, #3730a3); color: white;">
                      <th style="padding: 12px; text-align: left; font-weight: 600;">Description</th>
                      <th style="padding: 12px; text-align: right; font-weight: 600;">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 12px;">Provident Fund</td>
                      <td style="padding: 12px; text-align: right;">${formatCurrency(payslip.providentFund || 0)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 12px;">Professional Tax</td>
                      <td style="padding: 12px; text-align: right;">${formatCurrency(payslip.professionalTax || 0)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 12px;">Income Tax</td>
                      <td style="padding: 12px; text-align: right;">${formatCurrency(payslip.incomeTax || 0)}</td>
                    </tr>
                    <tr style="background: #dbeafe; font-weight: bold;">
                      <td style="padding: 12px;"><strong>TOTAL DEDUCTIONS</strong></td>
                      <td style="padding: 12px; text-align: right;"><strong>${formatCurrency(totalDeductions)}</strong></td>
                    </tr>
                    <tr style="background: #dcfce7; font-weight: bold; color: #166534; font-size: 18px;">
                      <td style="padding: 12px;"><strong>NET SALARY</strong></td>
                      <td style="padding: 12px; text-align: right;"><strong>${formatCurrency(netSalary)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>#1016, 11th Floor, DSL Abacus IT Park, Uppal Hyderabad-500039</p>
            <p>Ph: 9632091726 | Email: hr@anasolconsultancy.com | www.anasol.com</p>
            <p style="margin-top: 8px; color: #9ca3af; font-style: italic;">
              This is a computer-generated document and does not require a signature
            </p>
          </div>
        </div>
      `;

      document.body.appendChild(payslipElement);

      const canvas = await html2canvas(payslipElement, {
        scale: 2,
        useCORS: true,
        logging: false
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
    setActiveField(null); // Reset active field when starting edit
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
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data && response.data.success) {
        setEmployee(editFormData);
        setIsEditing(false);
        alert('Employee details updated successfully!');
      } else {
        alert('Failed to update employee details');
      }
    } catch (err) {
      console.error('Error updating employee details:', err);
      alert(`Failed to update employee details: ${err.message}`);
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
          <div className="text-center py-8 text-gray-500">
            No employee details found.
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">My Details</h2>
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
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Personal Information</h3>
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
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Employment Details</h3>
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
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Bank & Salary Information</h3>
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
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select 
              className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select 
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              View My Details
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
            <span className="ml-4 text-gray-600">Loading payroll data...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        </div>
      );
    }

    if (!empId) {
      return (
        <div className="p-6">
          <div className="text-center py-8 text-red-600">
            Employee ID not available. Please check your login.
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
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
                <tr key={item.payrollId} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {getMonthFromPayroll(item)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
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
          <div className="text-center py-8 text-gray-500">
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
                         (selectedPayslip.specialAllowance || 0);

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

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Payslip - {formatPayPeriod(selectedPayslip)}
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>

          <div className="p-6">
            {/* Company Header */}
            <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">ANASOL CONSULTANCY SERVICES PVT LTD</div>
                  <div className="text-xl font-semibold opacity-90 mt-1">SALARY SLIP</div>
                  <div className="bg-white/20 px-4 py-1 rounded-full text-sm font-medium mt-2 inline-block">
                    {formatPayPeriod(selectedPayslip)}
                  </div>
                </div>
                <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold">
                  <img 
                    src="/assets/anasol-logo.png" 
                    alt="Anasol Logo" 
                    className="w-20 h-20 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Employee Name:</span>
                  <span className="font-medium">{employee.empName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Employee ID:</span>
                  <span className="font-medium">{employee.employeeId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Designation:</span>
                  <span className="font-medium">{employee.designation || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Department:</span>
                  <span className="font-medium">{employee.department || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-gray-600">Phone No:</span>
                  <span className="font-medium">{employee.phoneNumber || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Bank A/C Name:</span>
                  <span className="font-medium">{employee.empName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">PAN No:</span>
                  <span className="font-medium">{employee.panNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">PF No:</span>
                  <span className="font-medium">{employee.pfnum || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">IFSC Code:</span>
                  <span className="font-medium">{employee.ifsccode || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-gray-600">Email:</span>
                  <span className="font-medium">{employee.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Salary Details */}
            <h3 className="text-lg font-bold text-gray-800 mb-3">Salary Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Earnings */}
              <div>
                <h4 className="font-bold text-gray-700 mb-2 border-l-4 border-blue-600 pl-2">EARNINGS</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white">
                        <th className="px-3 py-2 font-semibold text-sm">Description</th>
                        <th className="px-3 py-2 font-semibold text-sm">Monthly Rate</th>
                        <th className="px-3 py-2 font-semibold text-sm">Current Month</th>
                        <th className="px-3 py-2 font-semibold text-sm">Arrear (+/-)</th>
                        <th className="px-3 py-2 font-semibold text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.map((earning, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-3 py-2 text-sm">{earning.description}</td>
                          <td className="px-3 py-2 text-sm text-right">{earning.monthlyRate}</td>
                          <td className="px-3 py-2 text-sm text-right">{earning.currentMonth}</td>
                          <td className="px-3 py-2 text-sm text-right">{earning.arrear}</td>
                          <td className="px-3 py-2 text-sm text-right font-medium">{earning.total}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 font-semibold">
                        <td colSpan="4" className="px-3 py-2 text-sm">GROSS EARNINGS</td>
                        <td className="px-3 py-2 text-sm text-right">{formatCurrency(grossEarnings + (selectedPayslip.bonusAmount || 0))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="font-bold text-gray-700 mb-2 border-l-4 border-blue-600 pl-2">DEDUCTIONS</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white">
                        <th className="px-3 py-2 font-semibold text-sm">Description</th>
                        <th className="px-3 py-2 font-semibold text-sm">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deductions.map((deduction, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-3 py-2 text-sm">{deduction.description}</td>
                          <td className="px-3 py-2 text-sm text-right">{deduction.amount}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 font-semibold">
                        <td className="px-3 py-2 text-sm">TOTAL DEDUCTIONS</td>
                        <td className="px-3 py-2 text-sm text-right">{formatCurrency(totalDeductions)}</td>
                      </tr>
                      <tr className="bg-green-50 font-bold text-green-700">
                        <td className="px-3 py-2">NET SALARY</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(selectedPayslip.netSalary)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-600 text-sm">
              <p>#1016, 11th Floor, DSL Abacus IT Park, Uppal Hyderabad-500039</p>
              <p>Ph: 9632091726 | Email: info@anasol.com | www.anasol.com</p>
              <p className="mt-2 text-gray-400">
                This is a computer-generated document and does not require a signature
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => handleDownloadPayslip(selectedPayslip)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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