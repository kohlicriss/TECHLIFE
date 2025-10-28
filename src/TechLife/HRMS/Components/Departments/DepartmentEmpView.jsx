import React, { useEffect, useState,useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicinfoApi } from "../../../../axiosInstance";
import { User, Mail, Briefcase, ChevronLeft } from 'lucide-react';
import { Context } from "../HrmsContext";

const DepartmentEmpView = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(Context);

  const [employees, setEmployees] = useState([]);
  const [departmentName, setDepartmentName] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const depEmployeesfetch = async () => {
      try {
        const response = await publicinfoApi.get(
          `employee/0/10/employeeId/asc/department/${departmentId}/employees`
        );
        const departmentData = response.data.content?.[0];
        if (departmentData) {
          setDepartmentName(departmentData.departmentName);
          setEmployees(departmentData.employeeList || []);
        } else {
          setDepartmentName("Department Not Found");
          setEmployees([]);
        }
      } catch (err) {
        setError("Failed to load employee data for this department.");
      } finally {
        setLoading(false);
      }
    };
    depEmployeesfetch();
  }, [departmentId]);

  const generateInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(/\s+/).filter(p => p.length > 0);
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  if (loading) return (
    <div className={`flex items-center justify-center h-[60vh] ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
      <span className="text-lg">Loading employees...</span>
    </div>
  );

  if (error) return (
    <div className={`flex items-center justify-center h-[60vh] ${theme === "dark" ? "text-red-500" : "text-red-600"}`}>
      <span className="text-lg">{error}</span>
    </div>
  );

  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      
      {/* Sticky Back Button */}
      <div className={`sticky top-0 z-40 bg-inherit py-4 mb-8 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center font-semibold text-sm cursor-pointer 
            ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
          style={{ background: 'none', border: 'none' }}
          aria-label="Back to Departments"
        >
          <ChevronLeft size={18} className="mr-2" />
          Back to Departments
        </button>
      </div>
      
      <h2 className={`text-3xl font-bold mb-2 ${theme === "dark" ? "text-gray-200" : "text-blue-700"}`}>
        {departmentName}
      </h2>

      {/* Employee Cards */}
      {employees.length === 0 ? (
        <div className={`text-center py-16 rounded-xl border shadow text-lg
          ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-600"}`}>
          No active employees found in the <span className="font-bold">{departmentName}</span> department.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <div
              key={emp.employeeId}
              className={`rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 p-7 flex flex-col gap-3 cursor-pointer group border
                ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-100 text-gray-900"}`}
              onClick={() => navigate(`/employees/${emp.employeeId}/public/${emp.employeeId}`)}
              role="button"
              tabIndex={0}
              aria-label={`View profile of ${emp.employeeName || emp.displayName || "employee"}`}
              onKeyPress={(e) => { if (e.key === 'Enter') navigate(`/employees/${emp.employeeId}/public/${emp.employeeId}`); }}
            >
              {/* Employee Avatar */}
              <div className={`flex items-center gap-4 mb-2 pb-2 border-b transition-colors duration-200
                ${theme === "dark" ? "border-gray-700 group-hover:border-blue-500" : "border-gray-100 group-hover:border-blue-300"}`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl shadow-md transition-colors duration-150
                    ${theme === "dark" ? "bg-blue-700 text-blue-300 group-hover:bg-blue-600" : "bg-blue-600 text-white group-hover:bg-blue-700"}`}
                >
                  {generateInitials(emp.employeeName || emp.displayName)}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold transition-colors duration-200
                    ${theme === "dark" ? "text-gray-200 group-hover:text-blue-400" : "text-gray-800 group-hover:text-blue-700"}`}>
                    {emp.employeeName || emp.displayName || "N/A Name"}
                  </h3>
                </div>
              </div>

              {/* Employee Details */}
              <div className={`flex flex-col gap-2 text-sm pt-2 transition-colors duration-200
                ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
                <div className="flex items-center gap-2">
                  <User size={16} className={`${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />
                  <span className="font-medium">Employee ID:</span>
                  <span>{emp.employeeId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className={`${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />
                  <span className="font-medium">Email:</span>
                  <span>{emp.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className={`${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />
                  <span className="font-medium">Department:</span>
                  <span>{departmentName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentEmpView;
