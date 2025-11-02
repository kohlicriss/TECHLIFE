import React, { useContext, useEffect, useState, Fragment } from "react";
import axios from "axios";

import { useParams } from "react-router-dom";
import { set } from "date-fns";


const BASE_URL = "https://hrms.anasolconsultancyservices.com/api/attendance";
const PersonDetailsAddDto = {
  id: null,
  employeeId: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  paid: 0.0,
  sick: 0.0,
  casual: 0.0,
  unpaid: 0.0,
  paidConsumed: 0.0,
  sickConsumed: 0.0,
  casualConsumed: 0.0,
  unpaidConsumed: 0.0,
  shiftName: '',
  weekEffectiveHours: 0,
  monthlyEffectiveHours: 0,
  monthlyOnTime: 0,
  monthlyOvertime: 'PT0H',
  latitude: 0,
  longitude: 0,
  timezone: 'Asia/Kolkata'
};

const AttendanceRequest = {
  employeeId: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  totalWorkingDays: 0,
  daysPresent: 0,
  unpaidLeaves: 0
};

const PersonalLeavesService = {
  // ➕ Add Leaves
  addLeaves: async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/personalleaves/add`, data);
      return response.data;
    } catch (error) {
      console.error("Error adding leaves:", error);
      throw error;
    }
  },

  // ✏️ Update Leaves
  updateLeaves: async (data, month, year) => {
    try {
      const response = await axios.post(`${BASE_URL}/updateLeaves/${month}/${year}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating leaves:", error);
      throw error;
    }
  },

  // ❌ Delete Leaves
  deleteLeaves: async (employeeId, month, year) => {
    try {
      const response = await axios.delete(`${BASE_URL}/deleteLeaves/${employeeId}/${month}/${year}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting leaves:", error);
      throw error;
    }
  },

  // 🔍 Get Leaves for a specific employee and month/year
  getLeaves: async (employeeId, month, year) => {
    try {
      const response = await axios.get(`${BASE_URL}/getLeaves/${employeeId}/${month}/${year}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching leaves:", error);
      throw error;
    }
  },

  // 📄 Get all leaves by employee with pagination
  getLeavesByEmployee: async (employeeId, page, size) => {
    try {
      const response = await axios.get(`${BASE_URL}/getLeaves/${employeeId}`, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employee leaves:", error);
      throw error;
    }
  },

  // 🧾 Attendance Report (All employees)
  attendanceReport: async (month, year, page, size) => {
    try {
      var page = page ;
      const response = await axios.get(`${BASE_URL}/getAllEmployeeLeaves/${month}/${year}`, {
        params: { page, size },
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance report:", error);
      throw error;
    }
  },
};

const AddEmployeeLeavesForm = ({ activeView, Data }) => {
  // console.log(Data);
  const isEdit = !!Data; // detect mode
  const [employee, setEmployee] = useState({ ...PersonDetailsAddDto });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // 🧭 Initialize data (prefill if editing)
  useEffect(() => {
    if (isEdit && Data) {
      setEmployee({ ...Data });
    }
  }, [Data]);

  // 🧭 Fetch user location automatically
  useEffect(() => {
    if (!isEdit && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setEmployee((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })),
        (err) => console.warn("Location access denied", err)
      );
    }
  }, [isEdit]);

  // 🧾 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      if (!employee.employeeId.trim()) {
        throw new Error("Employee ID is required");
      }

      if (isEdit) {
        await PersonalLeavesService.updateLeaves(employee, employee.month, employee.year);
        setSuccess("✅ Employee leaves updated successfully!");
      } else {
        await PersonalLeavesService.addLeaves(employee);
        setSuccess("✅ Employee leaves added successfully!");
      }

      if (!isEdit) setEmployee({ ...PersonDetailsAddDto });
    } catch (err) {
      setError("❌ Operation failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Reset form
  const handleReset = () => {
    setEmployee(isEdit ? { ...Data } : { ...PersonDetailsAddDto });
    setSuccess("");
    setError("");
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-6xl mx-auto mt-10 border border-gray-200 dark:border-gray-700 transition-colors">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
        {isEdit ? "Update Employee Leave Details" : "Add Employee Leave Details"}
      </h2>

      {success && (
        <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 p-3 rounded-lg mb-4 font-medium">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded-lg mb-4 font-medium">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {[
          { label: "Employee ID *", key: "employeeId", type: "text", required: true },
          { label: "Month", key: "month", type: "number", min: 1, max: 12 },
          { label: "Year", key: "year", type: "number", min: 2020, max: 2030 },
          { label: "Paid Leaves", key: "paid", type: "number", step: "0.1" },
          { label: "Sick Leaves", key: "sick", type: "number", step: "0.1" },
          { label: "Casual Leaves", key: "casual", type: "number", step: "0.1" },
          { label: "Unpaid Leaves", key: "unpaid", type: "number", step: "0.1" },
          { label: "Shift Name", key: "shiftName", type: "text" },
          { label: "Weekly Effective Hours", key: "weekEffectiveHours", type: "number" },
          { label: "Monthly Effective Hours", key: "monthlyEffectiveHours", type: "number" },
          { label: "Monthly On-Time Count", key: "monthlyOnTime", type: "number" },
          { label: "Monthly Overtime (ISO Duration e.g. PT5H)", key: "monthlyOvertime", type: "text" },
          { label: "Latitude", key: "latitude", type: "number" },
          { label: "Longitude", key: "longitude", type: "number" },
          { label: "Timezone", key: "timezone", type: "text" },
        ].map((field, idx) => (
          console.log(employee),
          console.log(employee[field.key]),
          <div key={idx}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
            </label>
            <input
              {...field}
              value={employee[field.key] ?? ""}
              onChange={(e) =>
                setEmployee((prev) => ({
                  ...prev,
                  [field.key]:
                    field.type === "number"
                      ? parseFloat(e.target.value)
                      : e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        ))}
      </form>

      {/* Buttons */}
      <div className="flex justify-center mt-8 space-x-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 
                     dark:bg-blue-500 dark:hover:bg-blue-600 text-white 
                     rounded-lg font-medium shadow-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 
                     disabled:opacity-50 transition"
        >
          {loading ? "Processing..." : isEdit ? "Update" : "Save"}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 
                     dark:bg-gray-700 dark:hover:bg-gray-600 text-white 
                     rounded-lg font-medium shadow-md 
                     focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// Main Component
const PersonalLeaves = () => {
  const { empId } = useParams();
  const [employeeId, setEmployeeId] = useState('');
  const [activeView, setActiveView] = useState('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState({ ...PersonDetailsAddDto });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    if (empId) setEmployeeId(empId);
  }, [empId]);

  useEffect(() => {
    loadEmployeeDetails(empId);
  }, [currentPage, filters]);

  const loadAllEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await PersonalLeavesService.attendanceReport(
        filters.month,
        filters.year,
        currentPage,
        pageSize
      );
      setEmployees(response || []);
    } catch (err) {
      setError('Failed to load employees: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeDetails = async (employeeId) => {
    setLoading(true);
    setError('');
    try {
      const response = await PersonalLeavesService.getLeavesByEmployee(employeeId, currentPage,
        pageSize);
      setEmployees(response || []);
    } catch (err) {
      setError('Failed to load employee details: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadAllEmployees();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await PersonalLeavesService.getLeavesByEmployee(
        searchTerm,
        currentPage,
        pageSize
      );
      setEmployees(response.data || []);
    } catch (err) {
      setError('Search failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeaves = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete these leaves?')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      await PersonalLeavesService.deleteLeaves(
        employeeId,
        filters.month,
        filters.year
      );
      setSuccess('Leaves deleted successfully!');
      loadAllEmployees();
    } catch (err) {
      setError('Failed to delete leaves: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployee = async (employeeId) => {
    setLoading(true);
    setError('');
    try {
      const employeeData = await PersonalLeavesService.getLeaves(
        employeeId,
        filters.month,
        filters.year
      );
      loadEmployeeDetails(employeeId);
      setCurrentEmployee(employeeData);
      setActiveView('view');
    } catch (err) {
      setError('Failed to load employee data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

    const handleUpdateDetails = async (employeeId) => {
    setLoading(true);
    setError('');
    try {
      const employeeData = await PersonalLeavesService.getLeaves(
        employeeId,
        filters.month,
        filters.year
      );
      setCurrentEmployee(employeeData);
      setActiveView('update');
    } catch (err) {
      setError('Failed to load employee data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  const handleSaveEmployee = async () => {
    try {
      await PersonalLeavesService.updateLeaves(currentEmployee, currentEmployee.month,
        currentEmployee.year);
      alert('Employee data updated successfully!');
      setActiveView('search');
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  };


  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Employee Leaves Management</h1>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          {['MyDetails', 'search'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveView(tab);
                clearMessages();
                if (tab === 'MyDetails') handleViewEmployee(empId);
                if (tab === 'search') loadAllEmployees();
              }}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeView === tab
                ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab === 'search' ? 'Search' :
                  'My details'}
            </button>
          ))}
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}
        {activeView === "add" && (
          <AddEmployeeLeavesForm />
        )};

        {activeView === "update" && (
          <AddEmployeeLeavesForm Data={currentEmployee} />)};

        {activeView === 'view' && currentEmployee && (
          <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 dark:border-gray-700 transition-all duration-500 hover:shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-6 border-gray-300 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                Employee Leave Details
              </h2>
              <span className="px-4 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 rounded-full shadow-sm">
                {currentEmployee.employeeId}
              </span>
            </div>

            {/* Basic Info Section */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 border-l-4 border-blue-500 pl-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Employee ID", value: currentEmployee.employeeId },
                  { label: "Month", value: currentEmployee.month },
                  { label: "Year", value: currentEmployee.year },
                ].map(({ label, value }, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-300 dark:border-gray-700 hover:scale-[1.01] transition-transform"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-base font-medium text-gray-800 dark:text-gray-100">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Summary */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 border-l-4 border-green-500 pl-2">
                Leave Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['paid', 'sick', 'casual', 'unpaid'].map((type) => (
                  <div
                    key={type}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-300 dark:border-gray-700 hover:scale-[1.01] transition-transform"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{type} Leaves</p>
                    <p className="text-base font-medium text-gray-800 dark:text-gray-100">
                      {currentEmployee[type]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Consumed Leaves */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 border-l-4 border-yellow-500 pl-2">
                Consumed Leaves
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['paidConsumed', 'sickConsumed', 'casualConsumed', 'unpaidConsumed'].map((type) => (
                  <div
                    key={type}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-300 dark:border-gray-700 hover:scale-[1.01] transition-transform"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {type.replace('Consumed', ' Consumed')}
                    </p>
                    <p className="text-base font-medium text-gray-800 dark:text-gray-100">
                      {currentEmployee[type]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shift Details */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 border-l-4 border-purple-500 pl-2">
                Shift & Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Shift Name", value: currentEmployee.shiftName },
                  { label: "Latitude", value: currentEmployee.latitude },
                  { label: "Longitude", value: currentEmployee.longitude },
                ].map(({ label, value }, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-300 dark:border-gray-700 hover:scale-[1.01] transition-transform"
                  >
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-base font-medium text-gray-800 dark:text-gray-100">
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        {(
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Search Employee Leaves</h2>
            <div className="flex space-x-3 mb-4">
              <input
                type="text"
                placeholder="Enter Employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button
                onClick={() => setActiveView('add')}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {'ADD Employee'}
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        {(
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-medium mb-3">Some Filters</h3>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 11 }, (_, i) => (
                    <option key={i} value={2020 + i}>
                      {2020 + i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Employees List */}
        {(
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Current Employee Details</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading employees...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No employees found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month/Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Working Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days Present
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unpaid Leaves
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employees.map((employee, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleViewEmployee(employee.employeeId)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {employee.employeeId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {employee.month}/{employee.year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {employee.totalWorkingDays}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {employee.daysPresent}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {employee.unpaidLeaves}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateDetails(employee.employeeId);
                                setActiveView('update');
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLeaves(employee.employeeId);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalLeaves;