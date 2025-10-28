import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicinfoApi } from "../../../../axiosInstance";
import { Context } from "../HrmsContext";
import { Users, Building2, Mail, Briefcase, User,ArrowRight } from "lucide-react";

const EmpDepartmentPage = () => {
  const { theme } = useContext(Context);
  const { empID } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOwnProfilePopup, setShowOwnProfilePopup] = useState(false);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        const response = await publicinfoApi.get(
          `employee/0/20/employeeId/asc/${empID}/department/employees`
        );
        const deptData = response.data?.content?.[0];
        setDepartment({ id: deptData?.departmentId, name: deptData?.departmentName });
        setEmployees(deptData?.employeeList || []);
      } catch {
        setError("Failed to load department or employees");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartmentData();
  }, [empID]);

  const generateInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(/\s+/).filter((p) => p.length > 0);
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
    return `${imagePath.replace(/^\//, "")}`;
  };

  const onCardClick = (employeeId) => {
    if (employeeId === empID) {
      setShowOwnProfilePopup(true);
      setTimeout(() => setShowOwnProfilePopup(false), 2000);
    } else {
      navigate(`/employees/${empID}/public/${employeeId}`);
    }
  };

  if (loading)
    return (
      <div className={`flex items-center justify-center h-[60vh] ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        <div className="text-center">
          <div
            className={`w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent mx-auto mb-4 ${
              theme === "dark" ? "border-t-blue-400" : "border-t-blue-600"
            }`}
            style={{ borderRadius: "50%", animation: "spin 1s linear infinite" }}
          />
          <span className="text-lg">Loading department data...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className={`flex items-center justify-center h-[60vh] ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
        <span className="text-lg">{error}</span>
      </div>
    );

  return (
    <div
      className={`${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 to-indigo-50"} min-h-screen py-8 px-4`}
    >
      <div className="max-w-7xl mx-auto">
        {department ? (
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-6 px-8 py-8 border shadow-xl
              ${theme === "dark" ? "bg-gray-800 border-blue-900 text-gray-200" : "bg-white border-blue-200 text-gray-900"}`}>
              <div className={`p-5 ${theme === "dark" ? "bg-blue-950" : "bg-blue-100"}`}>
                <Building2 size={36} className={theme === "dark" ? "text-blue-400" : "text-blue-600"} />
              </div>
              <div className="text-left">
                <h2 className={`text-4xl font-bold mb-3 ${theme === "dark" ? "text-blue-100" : "text-blue-700"}`}>
                  {department.name}
                </h2>
                <div className={`flex items-center gap-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    <span>
                      <strong>{employees.length}</strong> Employee{employees.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      <strong>Department ID:</strong> {department.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`text-center py-20 border-2 max-w-2xl mx-auto ${
              theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <Building2 size={64} className={`mx-auto mb-4 ${theme === "dark" ? "text-gray-700" : "text-gray-400"}`} />
            <h3 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-700"}`}>No Department Found</h3>
            <p>No department found for this employee.</p>
          </div>
        )}

        {/* Popup for own profile */}
        {showOwnProfilePopup && (
          <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50 text-sm">
            This is your own Profile
          </div>
        )}

        {employees.length === 0 ? (
          <div
            className={`text-center py-20 border-2 max-w-2xl mx-auto ${
              theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <Users size={64} className={`mx-auto mb-4 ${theme === "dark" ? "text-gray-700" : "text-gray-400"}`} />
            <h3 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-700"}`}>No Employees Found</h3>
            <p>No employees found in this department.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {employees.map((emp) => {
              const isCurrentUser = emp.employeeId === empID;
              const imageUrl = getImageUrl(emp.employeeImage);
              return (
                <div
                  key={emp.employeeId}
                  className={`p-6 flex flex-col gap-4 cursor-pointer group relative overflow-hidden border-2 ${
                    theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-gradient-to-br from-white to-blue-50/70 border-gray-200/80 text-gray-900"
                  }`}
                  style={{
                    boxShadow:
                      theme === "dark"
                        ? "0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(255,255,255,0.05)"
                        : "0 8px 32px rgba(63,131,248,0.12), 0 2px 8px rgba(63,131,248,0.08)",
                  }}
                  onClick={() => onCardClick(emp.employeeId)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View profile of ${emp.employeeName || emp.displayName || "employee"}`}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") onCardClick(emp.employeeId);
                  }}
                >
                  {isCurrentUser && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-blue-600 text-white font-semibold text-xs rounded">
                      You
                    </div>
                  )}

                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-blue-900/20 to-purple-900/20"
                        : "bg-gradient-to-br from-blue-100/50 to-indigo-100/50"
                    }`}
                  />

                  {/* View Profile Arrow */}
                  <div
                    className={`absolute top-4 right-4 p-2 ${
                      theme === "dark" ? "bg-blue-700/80 text-blue-300" : "bg-blue-500/80 text-white"
                    } backdrop-blur-sm rounded-full`}
                  >
                    <ArrowRight size={16} />
                  </div>

                  {/* Employee Avatar Section */}
                  <div
                    className={`flex items-center gap-4 mb-4 pb-4 border-b transition-colors duration-300 relative z-10 ${
                      theme === "dark" ? "border-gray-700 group-hover:border-blue-500" : "border-gray-200 group-hover:border-blue-300"
                    }`}
                  >
                    {imageUrl ? (
                      <div className="relative">
                        <img
                          src={imageUrl}
                          alt={emp.employeeName || emp.displayName || "Employee"}
                          className="w-16 h-16 object-cover shadow-lg transition-all duration-300 group-hover:shadow-xl"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div
                          className={`w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg absolute inset-0 transition-colors duration-300 ${
                            theme === "dark" ? "bg-blue-700 text-blue-300 group-hover:bg-blue-600" : "bg-blue-600 text-white group-hover:bg-blue-700"
                          } hidden`}
                        >
                          {generateInitials(emp.employeeName || emp.displayName)}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg transition-colors duration-300 ${
                          theme === "dark"
                            ? "bg-gradient-to-br from-blue-700 to-purple-700 text-blue-300 group-hover:from-blue-600 group-hover:to-purple-600"
                            : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white group-hover:from-blue-700 group-hover:to-indigo-700"
                        }`}
                      >
                        {generateInitials(emp.employeeName || emp.displayName)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg font-bold transition-colors duration-300 line-clamp-2 ${
                          theme === "dark" ? "text-blue-200 group-hover:text-blue-400" : "text-gray-800 group-hover:text-blue-700"
                        }`}
                      >
                        {emp.employeeName || emp.displayName || "N/A Name"}
                      </h3>
                      <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        Employee ID: {emp.employeeId}
                      </p>
                    </div>
                  </div>

                  {/* Employee Details */}
                  <div
                    className={`flex flex-col gap-3 text-sm relative z-10 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 transition-all duration-200">
                      <div className={`p-2 ${theme === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                        <Mail size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold">Email:</span>
                        <p className="truncate">{emp.email || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 transition-all duration-200">
                      <div className={`p-2 ${theme === "dark" ? "bg-purple-900/50 text-purple-400" : "bg-purple-100 text-purple-600"}`}>
                        <Briefcase size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold">Department:</span>
                        <p className="truncate">{department?.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom gradient border effect */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 ${
                      theme === "dark" ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-gradient-to-r from-blue-400 to-indigo-500"
                    } scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpDepartmentPage;
