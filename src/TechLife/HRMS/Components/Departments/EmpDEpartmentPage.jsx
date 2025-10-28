import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { publicinfoApi } from '../../../../axiosInstance';
import { Users, Building2, Mail, Briefcase, User } from 'lucide-react';

const EmpDepartmentPage = () => {
  const { empID } = useParams();
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        const response = await publicinfoApi.get(
          `employee/0/20/employeeId/asc/${empID}/department/employees`
        );
        const deptData = response.data?.content?.[0];
        setDepartment({
          id: deptData?.departmentId,
          name: deptData?.departmentName,
        });
        setEmployees(deptData?.employeeList || []);
      } catch (err) {
        setError('Failed to load department or employees');
      } finally {
        setLoading(false);
      }
    };
    fetchDepartmentData();
  }, [empID]);

  const generateInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(/\s+/).filter(p => p.length > 0);
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
    return `${imagePath.replace(/^\//, "")}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh] text-gray-600">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent mx-auto mb-4" style={{ borderRadius: "100%", animation: "spin 1s linear infinite" }} />
        <span className="text-lg">Loading department data...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-[60vh] text-red-600">
      <span className="text-lg">{error}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Department Header */}
        {department ? (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-6 px-8 py-8 bg-white border border-blue-200 shadow-xl">
              <div className="p-5 bg-blue-100">
                <Building2 size={36} className="text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="text-4xl font-bold mb-3 text-blue-700">
                  {department.name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    <span><strong>{employees.length}</strong> Employee{employees.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span><strong>Department ID:</strong> {department.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 border-2 bg-white border-gray-200 text-gray-600 max-w-2xl mx-auto">
            <Building2 size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold mb-4">No Department Found</h3>
            <p>No department found for this employee.</p>
          </div>
        )}

        {/* Employees Section */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-blue-700">
            Team Members
          </h3>
          <p className="text-gray-600 mt-2">Employees in this department</p>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-20 border-2 bg-white border-gray-200 text-gray-600 max-w-2xl mx-auto">
            <Users size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold mb-4">No Employees Found</h3>
            <p>No employees found in this department.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {employees.map((emp) => {
              const imageUrl = getImageUrl(emp.employeeImage);
              return (
                <div
                  key={emp.employeeId}
                  className="p-6 flex flex-col gap-4 cursor-pointer group relative overflow-hidden border-2 bg-white border-gray-200 text-gray-900"
                  style={{
                    boxShadow: "0 8px 32px rgba(63,131,248,0.10), 0 2px 8px rgba(63,131,248,0.06)"
                  }}
                >
                  {/* Employee Avatar Section */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 transition-colors duration-300 relative z-10">
                    {imageUrl ? (
                      <div className="relative">
                        <img
                          src={imageUrl}
                          alt={emp.displayName || "Employee"}
                          className="w-16 h-16 object-cover shadow-lg"
                          onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                        />
                        <div className="w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg absolute inset-0 bg-blue-600 text-white hidden">
                          {generateInitials(emp.displayName)}
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center font-bold text-xl shadow-lg bg-blue-600 text-white">
                        {generateInitials(emp.displayName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold line-clamp-2 text-gray-800 group-hover:text-blue-700">
                        {emp.displayName || "N/A Name"}
                      </h3>
                      <p className="text-sm mt-1 text-gray-600">
                        ID: {emp.employeeId}
                      </p>
                    </div>
                  </div>

                  {/* Employee Details */}
                  <div className="flex flex-col gap-3 text-sm text-gray-700 relative z-10">
                    {emp.jobTitlePrimary && (
                      <div className="flex items-center gap-3 transition-all duration-200">
                        <div className="p-2 bg-blue-100 text-blue-600">
                          <Briefcase size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold">Position:</span>
                          <p className="truncate">{emp.jobTitlePrimary}</p>
                        </div>
                      </div>
                    )}

                    {emp.role && (
                      <div className="flex items-center gap-3 transition-all duration-200">
                        <div className="p-2 bg-purple-100 text-purple-600">
                          <User size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold">Role:</span>
                          <p className="truncate">{emp.role.replace('ROLE_', '')}</p>
                        </div>
                      </div>
                    )}
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
