import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { publicinfoApi } from "../../../../axiosInstance";
import { Context } from "../HrmsContext";
import { Users, Mail, Briefcase } from "lucide-react";


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
        setDepartment({
          id: deptData?.departmentId,
          name: deptData?.departmentName
        });
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
      className={`h-[90vh] ${
        theme === "dark" ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      }`}
    >
      {/* Sticky Header */}
      <div
        className={`sticky top-0 z-30 px-2 ${
          theme === "dark" ? "bg-gray-900 border-b border-gray-800" : "bg-white border-b border-gray-200"
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 max-w-7xl mx-auto">
          {/* Center Section - Department Name & ID */}
          <div className="text-center flex-1">
            <h2 className={`${theme === "dark" ? "text-gray-100" : "text-gray-800"} text-2xl sm:text-3xl font-extrabold tracking-tight line-clamp-2`}>
              {department?.name || "Department"}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
              <p className={`text-xs sm:text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Team Members
              </p>
              <span className={`text-sm sm:text-base font-mono font-bold px-3 py-1.5 rounded-full ${
                theme === "dark"
                  ? "bg-blue-900/40 text-blue-300"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {department?.id}
              </span>
            </div>
          </div>

          {/* Right Section - Employee Count Badge */}
          <div
            className={`flex items-center gap-2 px-4 py-2 sm:py-3 flex-shrink-0 ${
              theme === "dark"
                ? "bg-blue-900/50 text-blue-300 border border-blue-700"
                : "bg-blue-100 text-blue-700 border border-blue-300"
            }`}
            style={{ borderRadius: "9999px" }}
          >
            <Users size={18} />
            <span className="font-semibold text-sm">
              {employees.length} Employee{employees.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 pb-8 pt-8 sm:pt-12 h-full overflow-y-auto">
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
            <h3 className="text-2xl font-bold mb-4">No Employees Found</h3>
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
                  className={`p-6 flex flex-col gap-4 cursor-pointer relative overflow-hidden border-2 rounded-xl ${
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
                  aria-label={`View profile of ${emp.displayName || "employee"}`}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") onCardClick(emp.employeeId);
                  }}
                >
                  {isCurrentUser && (
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-blue-600 text-white font-semibold text-xs rounded z-50 pointer-events-none">
                      You
                    </div>
                  )}

                  {/* Employee Avatar Section */}
                  <div
                    className={`flex items-center gap-4 mb-4 pb-4 border-b relative z-10 ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    {imageUrl ? (
                      <div className="relative">
                        <img
                          src={imageUrl}
                          alt={emp.displayName || "Employee"}
                          className="w-16 h-16 object-cover shadow-lg rounded-lg"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div
                          className={`w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg absolute inset-0 rounded-lg ${
                            theme === "dark" ? "bg-blue-700 text-blue-300" : "bg-blue-600 text-white"
                          } hidden`}
                        >
                          {generateInitials(emp.displayName)}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg rounded-lg ${
                          theme === "dark"
                            ? "bg-gradient-to-br from-blue-700 to-purple-700 text-blue-300"
                            : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                        }`}
                      >
                        {generateInitials(emp.displayName)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg font-bold line-clamp-2 ${
                          theme === "dark" ? "text-blue-200" : "text-gray-800"
                        }`}
                      >
                        {emp.displayName || "N/A Name"}
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
                    <div className="flex items-center gap-3 p-2 rounded-lg">
                      <div className={`p-2 ${theme === "dark" ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                        <Mail size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold">Email:</span>
                        <p className="truncate text-xs sm:text-sm">{emp.workEmail || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg">
                      <div className={`p-2 ${theme === "dark" ? "bg-purple-900/50 text-purple-400" : "bg-purple-100 text-purple-600"}`}>
                        <Briefcase size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold">Title:</span>
                        <p className="truncate text-xs sm:text-sm">{emp.jobTitlePrimary || "N/A"}</p>
                      </div>
                    </div>
                  </div>
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