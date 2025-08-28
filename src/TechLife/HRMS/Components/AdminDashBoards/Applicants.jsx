import React, { useState, useMemo } from 'react';
import { FaSortAlphaDown, FaSortAlphaUp, FaFilter } from 'react-icons/fa';

const applicants = [
  { candidateId: "C_01", name: 'John Doe', emailId: 'johndoe12@gmail.com', location: 'Hydrebad', job: 'Senior DevOps Engineer', image: 'https://randomuser.me/api/portraits/men/74.jpg', color: 'bg-teal-500', status: "sent" },
  { candidateId: "C_02", name: 'Ramesh', emailId: 'ramesh123@gmail.com', location: 'Bangalore', job: 'UI/UX Designer', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D', color: 'bg-blue-500', status: "scheduled" },
  { candidateId: "C_03", name: 'Raghunadh', emailId: 'raghu123@gmail.com', location: 'Chennai', job: 'Full Stack Developer', image: 'https://randomuser.me/api/portraits/men/9.jpg', color: 'bg-pink-500', status: "Interviewed" },
  { candidateId: "C_04", name: 'Anita', emailId: 'anita123@gmail.com', location: 'Hyderabad', job: 'Junior React Developer', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D', color: 'bg-purple-500', status: "offered" },
  { candidateId: "C_05", name: 'SriLekha', emailId: 'srilekha12@gmail.com', location: 'Mumbai', job: 'Data Scientist', image: 'https://randomuser.me/api/portraits/women/63.jpg', color: 'bg-green-500', status: "Hired" },
  { candidateId: "C_06", name: 'Rajesh', emailId: 'rajesh12@gmail.com', location: 'pure', job: 'BackEnd Developer', image: 'https://randomuser.me/api/portraits/men/79.jpg', color: 'bg-red-500', status: "Rejected" },
  { candidateId: "C_07", name: 'Suresh', emailId: 'suresh12@gmail.com', location: 'Kolkata', job: 'Python Developer', image: 'https://randomuser.me/api/portraits/men/19.jpg', color: 'bg-green-500', status: "Hired" },
  { candidateId: "C_08", name: 'Sandhya', emailId: 'sandhya12@gmail.com', location: 'Hyderabad', job: 'QA Tester', image: 'https://randomuser.me/api/portraits/women/32.jpg', color: 'bg-blue-500', status: "Scheduled" },
  { candidateId: "C_09", name: 'Naveen', emailId: 'naveen12@gmail.com', location: 'Bangalore', job: 'Automation Tester', image: 'https://randomuser.me/api/portraits/men/58.jpg', color: 'bg-brown-400', status: "App Received" },
  { candidateId: "C_10", name: 'Sagarika', emailId: 'sagarika12@gmail.com', location: 'Mumbai', job: 'Digital Manager', image: 'https://randomuser.me/api/portraits/women/27.jpg', color: 'bg-green-500', status: "Hired" },
];

const Applicants = ({onBack}) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Recently Added");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statuses = ["All", ...new Set(applicants.map(d => d.status))];

  const filteredAndSortedData = useMemo(() => {
    let data = [...applicants];
    if (statusFilter !== "All") {
      data = data.filter(item => item.status === statusFilter);
    }
    switch (sortOption) {
      case "Acsending":
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Descending":
        data.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Last Month":
        data.sort((a, b) => a.candidateId.localeCompare(b.candidateId));
        break;
      case "Recently Added":
      default:
        data.sort((a, b) => b.candidateId.localeCompare(a.candidateId));
        break;
    }
    return data;
  }, [statusFilter, sortOption]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hired': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      case 'offered': return 'bg-purple-500';
      case 'scheduled': return 'bg-blue-500';
      case 'Interviewed': return 'bg-pink-500';
      case 'sent': return 'bg-teal-500';
      case 'App Received': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-2">
      <header className="flex items-center justify-between">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-4xl ml-5 font-extrabold text-gray-900 mb-2">
           Candidate List
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
    <div className="bg-white shadow-lg rounded-xl p-6 col-span-full border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Candidate List
      </h2>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Status Filter Dropdown */}
        <div className="relative">
          <label className="text-sm font-semibold mr-2 text-gray-700">
            Status:
          </label>
          <div className="inline-block relative w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to page 1 on filter change
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

        {/* Sort Dropdown */}
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

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                CandidateId
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((applicant) => (
                <tr key={applicant.candidateId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {applicant.candidateId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-full mr-4" src={applicant.image} alt={applicant.name} />
                      {applicant.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {applicant.emailId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {applicant.job}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {applicant.location}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${getStatusColor(applicant.status)}`}>
                      {applicant.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No matching candidates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
          <span className="text-sm text-gray-700 mb-2 sm:mb-0">
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
    </div>
  );
};

export default Applicants;