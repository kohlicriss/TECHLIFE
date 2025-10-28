import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicinfoApi } from "../../../../axiosInstance";
import { User, Mail, Briefcase, ChevronLeft, Users, ArrowRight } from "lucide-react";
import { Context } from "../HrmsContext";

const DepartmentEmpView = () => {
  const BASE_API_URL = "https://hrms.anasolconsultancyservices.com/api";
  const { departmentId, empID } = useParams();
  const navigate = useNavigate();
  const { theme } = useContext(Context);
  const [employees, setEmployees] = useState([]);
  const [departmentName, setDepartmentName] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOwnProfilePopup, setShowOwnProfilePopup] = useState(false);

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
      } catch {
        setError("Failed to load employee data for this department.");
      } finally {
        setLoading(false);
      }
    };
    depEmployeesfetch();
  }, [departmentId]);

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
    return `${BASE_API_URL}/${imagePath.replace(/^\//, "")}`;
  };

  const onCardClick = (employeeId) => {
    if (employeeId === empID) {
      setShowOwnProfilePopup(true);
      setTimeout(() => {
        setShowOwnProfilePopup(false);
      }, 2000);
    } else {
      navigate(`/employees/${employeeId}/public/${employeeId}`);
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
            style={{ borderRadius: "50%" }}
          />
          <span className="text-lg">Loading employees...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className={`flex items-center justify-center h-[60vh] ${theme === "dark" ? "text-red-500" : "text-red-600"}`}>
        <span className="text-lg">{error}</span>
      </div>
    );

  return (
    <div
      className={`max-w-7xl mx-auto px-4 py-8 min-h-screen ${
        theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}
    >
      {/* Sticky Header */}
      <div
        className={`sticky top-0 z-40 py-4 mb-8 backdrop-blur-md ${
          theme === "dark" ? "bg-gray-900/95" : "bg-gradient-to-br from-blue-50/95 to-indigo-50/95"
        }`}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center font-semibold text-sm cursor-pointer px-4 py-3 transition-all ${
              theme === "dark"
                ? "bg-gray-800 text-blue-400 hover:bg-gray-700 hover:text-blue-300"
                : "bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-md"
            }`}
            style={{ background: "none", border: "none" }}
            aria-label="Back to Departments"
          >
            <ChevronLeft size={20} className="mr-2" />
            Back to Departments
          </button>

          <div
            className={`flex items-center gap-2 px-4 py-2 ${
              theme === "dark"
                ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                : "bg-blue-100 text-blue-700 border border-blue-300"
            }`}
            style={{ borderRadius: "9999px" }}
          >
            <Users size={18} />
            <span className="font-semibold">
              {employees.length} Employee{employees.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Department Header */}
      <div className="text-center mb-12">
        <div
          className={`inline-flex items-center gap-4 px-8 py-6 ${
            theme === "dark"
              ? "bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600"
              : "bg-gradient-to-r from-white to-blue-100 border border-blue-200"
          } shadow-xl backdrop-blur-sm`}
        >
          <div className={`p-4 ${theme === "dark" ? "bg-blue-900/50" : "bg-blue-100"}`}>
            <Users size={32} className={theme === "dark" ? "text-blue-400" : "text-blue-600"} />
          </div>
          <div className="text-left">
            <h2
              className={`text-4xl font-bold mb-2 bg-gradient-to-r ${
                theme === "dark" ? "from-blue-400 to-purple-400" : "from-blue-600 to-indigo-600"
              } bg-clip-text text-transparent`}
            >
              {departmentName}
            </h2>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Meet the team members of this department
            </p>
          </div>
        </div>
      </div>

      {/* Popup for own profile */}
      {showOwnProfilePopup && (
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50 text-sm">
          This is your own Profile
        </div>
      )}

      {employees.length === 0 ? (
        <div
          className={`text-center py-20 border-2 shadow-lg text-lg max-w-2xl mx-auto ${
            theme === "dark" ? "bg-gray-800/50 border-gray-700 text-gray-400 backdrop-blur-sm" : "bg-white/70 border-gray-200 text-gray-600 backdrop-blur-sm"
          }`}
        >
          <Users size={64} className={`mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
          <h3 className="text-2xl font-bold mb-4">No Active Employees</h3>
          <p>
            No active employees found in the <span className="font-bold text-blue-500">{departmentName}</span> department.
          </p>
          <button
            onClick={() => navigate(-1)}
            className={`px-6 py-3 font-semibold transition-all ${
              theme === "dark" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
            } shadow-lg`}
          >
            Back to Departments
          </button>
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
                  theme === "dark"
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-gray-200"
                    : "bg-gradient-to-br from-white to-blue-50/70 border-gray-200/80 text-gray-900"
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
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-blue-600 text-white font-semibold text-xs rounded z-50 pointer-events-none">
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
                      <p className="truncate">{departmentName}</p>
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
  );
};

export default DepartmentEmpView;
