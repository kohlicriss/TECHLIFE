import { useState, useMemo } from 'react';
import { FaSortAlphaDown, FaSortAlphaUp, FaFilter } from 'react-icons/fa';
import { FaUsers, FaUserCheck, FaUserTimes, FaUserPlus } from 'react-icons/fa';
const Employeecard = () => {
  const DashboardCard = ({ title, value, icon, percentage }) => {
    const bgColorClass =
      title === 'Total Employee'
        ? 'bg-gray-800'
        : title === 'Active'
        ? 'bg-green-500'
        : title === 'InActive'
        ? 'bg-red-500'
        : title === 'New Joiners'
        ? 'bg-blue-500'
        : 'bg-gray-400';

    return (
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 flex items-center space-x-3 border border-gray-200">
        <div className={`p-2.5 rounded-full text-white flex items-center justify-center ${bgColorClass}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-gray-500 text-sm font-semibold">{title}</h3>
          <p className="text-gray-800 text-xl font-bold">{value}</p>
        </div>
        <div className={`bg-purple-100 text-purple-700 rounded-md px-2 py-1 text-xs font-medium`}>
          {percentage}
        </div>
      </div>
    );
  };

  // Main JSX structure, replacing the App component
  return (
    <div className="bg-gray-100  py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Employee"
          value="108"
          icon={<FaUsers size={20} />}
          percentage="+19.01%"
        />
        <DashboardCard
          title="Active"
          value="104"
          icon={<FaUserCheck size={20} />}
          percentage="+19.01%"
        />
        <DashboardCard
          title="InActive"
          value="04"
          icon={<FaUserTimes size={20} />}
          percentage="+19.01%"
        />
        <DashboardCard
          title="New Joiners"
          value="67"
          icon={<FaUserPlus size={20} />}
          percentage="+19.01%"
        />
      </div>
    </div>
  );
};
const EmployeeData = [
  { EmployeeId: "E_01", Name: "Ramesh", EmailId: "ramesh123@gmail.com", PhoneNo: 9912345642, Designation: "UX/UI Designer", Joining_Date: "2024-08-12", Status: "Active" },
  { EmployeeId: "E_02", Name: "Mahesh", EmailId: "mahesh123@gmail.com", PhoneNo: 6312345640, Designation: "React Developer", Joining_Date: "2024-09-24", Status: "Active" },
  { EmployeeId: "E_03", Name: "Chandu", EmailId: "chandu123@gmail.com", PhoneNo: 9812765642, Designation: "Full Stack Developer", Joining_Date: "2024-02-18", Status: "Active" },
  { EmployeeId: "E_04", Name: "Raju", EmailId: "raju123@gmail.com", PhoneNo: 9502345642, Designation: "Data Scientist", Joining_Date: "2024-09-17", Status: "Active" },
  { EmployeeId: "E_05", Name: "Ravi", EmailId: "ravi123@gmail.com", PhoneNo: 9212345642, Designation: "BackEnd Developer", Joining_Date: "2024-08-12", Status: "Inactive" },
  { EmployeeId: "E_06", Name: "Suresh", EmailId: "suresh123@gmail.com", PhoneNo: 9321345642, Designation: "Tester", Joining_Date: "2024-08-12", Status: "Active" },
  { EmployeeId: "E_07", Name: "Gayathri", EmailId: "gayathri123@gmail.com", PhoneNo: 905345642, Designation: "HR", Joining_Date: "2024-08-12", Status: "Inactive" },
  { EmployeeId: "E_08", Name: "Sandhya", EmailId: "sandhya123@gmail.com", PhoneNo: 9678345642, Designation: "Digital Manager", Joining_Date: "2024-08-12", Status: "Active" },
  { EmployeeId: "E_09", Name: "Meghanand", EmailId: "meghanandh12@gmail.com", PhoneNo: 9912365442, Designation: "QA Tester", Joining_Date: "2024-08-12", Status: "Inactive" },
  { EmployeeId: "E_10", Name: "Suhaas", EmailId: "suhaas123@gmail.com", PhoneNo: 9912345464, Designation: "Python Developer", Joining_Date: "2024-08-12", Status: "Active" },
];
const EmployeeTable = () => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [designationFilter, setDesignationFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Recently Added");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const formattedEmployeeData = useMemo(() => {
    return EmployeeData.map(emp => ({
      ...emp,
      Joining_Date: new Date(emp.Joining_Date).toISOString().split('T')[0]
    }));
  }, []);
  const designations = ["All", ...new Set(formattedEmployeeData.map(d => d.Designation))];
  const statuses = ["All", "Active", "Inactive"];
  const filteredAndSortedData = useMemo(() => {
    let data = [...formattedEmployeeData];
    if (statusFilter !== "All") {
      data = data.filter(item => item.Status === statusFilter);
    }
    if (designationFilter !== "All") {
      data = data.filter(item => item.Designation === designationFilter);
    }
    switch (sortOption) {
      case "Acsending":
        data.sort((a, b) => a.Name.localeCompare(b.Name));
        break;
      case "Descending":
        data.sort((a, b) => b.Name.localeCompare(a.Name));
        break;
      case "Last Month":
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        data = data.filter(item => new Date(item.Joining_Date) >= lastMonth);
        break;
      case "Recently Added":
      default:
        data.sort((a, b) => new Date(b.Joining_Date) - new Date(a.Joining_Date));
        break;
    }
    return data;
  }, [formattedEmployeeData, statusFilter, designationFilter, sortOption]);
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const renderStatus = (status) => {
    const bgColor = status === "Active" ? "bg-green-500" : "bg-red-500";
    return (
      <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${bgColor}`}>
        {status}
      </span>
    );
  };
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 col-span-full border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Employee List
      </h2>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative">
          <label className="text-sm font-semibold mr-2 text-gray-700">
            Status:
          </label>
          <div className="inline-block relative w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); 
              }}
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FaFilter />
            </div>
          </div>
        </div>
        <div className="relative">
          <label className="text-sm font-semibold mr-2 text-gray-700">
            Designation:
          </label>
          <div className="inline-block relative w-48">
            <select
              value={designationFilter}
              onChange={(e) => {
                setDesignationFilter(e.target.value);
                setCurrentPage(1); // Reset to page 1 on filter change
              }}
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            >
              {designations.map(designation => (
                <option key={designation} value={designation}>{designation}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FaFilter />
            </div>
          </div>
        </div>
        <div className="relative">
          <label className="text-sm font-semibold mr-2 text-gray-700">
            Sort by:
          </label>
          <div className="inline-block relative w-48">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            >
              <option value="Recently Added">Recently Added</option>
              <option value="Acsending">Acsending</option>
              <option value="Descending">Descending</option>
              <option value="Last Month">Last Month</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              {sortOption === "Acsending" ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Employee ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Phone No
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Designation
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Joining Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr key={row.EmployeeId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {row.EmployeeId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {row.Name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {row.EmailId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {row.PhoneNo}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {row.Designation}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {row.Joining_Date}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {renderStatus(row.Status)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
          <span className="text-sm  text-gray-700 mb-2 sm:mb-0">
            Page {currentPage} of {totalPages}
          </span>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};
 function EmployeeDetails({ onBack }) { 
  return (
    <div className="p-2">
      <header className="flex items-center justify-between">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-4xl ml-5 font-extrabold text-gray-900 mb-2">
            Employee Details
          </h1>
        </div>
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Back to Dashboard
        </button>
      </header>
            <div class="lg:col-span-2">
              <div class="w-full">
                  <Employeecard />
                  </div>
             </div>
             <div class="lg:col-span-2">
              <div class="w-full">
                  <EmployeeTable/>
                  </div>
             </div>
        </div>
      );
    };
export default EmployeeDetails;
