import React, { useState, useMemo } from 'react';
import { FaSortAlphaDown, FaSortAlphaUp, FaFilter } from 'react-icons/fa';

const openings = [
    { JobId:'J_01',Title: 'Senior DevOps Engineer', Openings: 2, Logo: '🛠️', Category: "DevOps", Location: "Hyderabad,India", Salary: "$8,00,000 - $12,00,000 per Annum", Date: "2023-10-01" },
    { JobId:'J_02',Title: 'Data Scientist', Openings: 3, Logo: '🐘', Category: "Data Science", Location: "Bangalore,India", Salary: "$7,00,000 - $10,00,000 per Annum", Date: "2023-10-05" },
    { JobId:'J_03',Title: 'Junior React Developer', Openings: 2, Logo: '⚛️', Category: "Software", Location: "Chennai,India", Salary: "$4,00,000 - $6,00,000 per Annum", Date: "2023-10-10" },
    { JobId:'J_04',Title: 'UI/UX Designer', Openings: 5, Logo: '⚙️', Category: "Design", Location: "Mumbai,India", Salary: "$3,00,000 - $5,00,000 per Annum", Date: "2023-10-20", },
    { JobId:'J_05',Title: 'Full Stack Developer', Openings: 4, Logo: '💻', Category: "Software", Location: "Delhi,India", Salary: "$5,00,000 - $7,00,000 per Annum", Date: "2023-10-25" },
    { JobId:'J_06',Title: 'BackEnd Developer', Openings: 1, Logo: '🌐', Category: "Software", Location: "pune,India", Salary: "$5,00,000 - $8,00,000 per Annum", Date: "2023-10-15" },
    { JobId:'J_07',Title: 'Python Developer', Openings: 5, Logo: '🐍', Category: "Software", Location: "Kolkata,India", Salary: "$4,00,000 - $9,00,000 per Annum", Date: "2023-10-20" },
    { JobId:'J_08',Title: 'QA Tester', Openings: 3, Logo: '🔍', Category: "Software", Location: "Hyderabad,India", Salary: "$4,00,000 - $5,00,000 per Annum", Date: "2023-10-22" },
    { JobId:'J_09',Title: 'Automation Tester', Openings: 1, Logo: '🤖 ', Category: "Software", Location: "Bangalore,India", Salary: "$8,00,000 - $9,00,000 per Annum", Date: "2023-10-10" },
    { JobId:'J_10',Title: 'Digital Manager', Openings: 2, Logo: '📊', Category: "Marketing", Location: "Mumbai,India", Salary: "$3,00,000 - $5,00,000 per Annum", Date: "2023-10-15" },
];

const JobsList = ({onBack}) => {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Recently Added");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories = ["All", ...new Set(openings.map(d => d.Category))];

  const filteredAndSortedData = useMemo(() => {
    let data = [...openings];

    // Filter by Category
    if (categoryFilter !== "All") {
      data = data.filter(item => item.Category === categoryFilter);
    }

    // Sort Data
    switch (sortOption) {
      case "Acsending":
        data.sort((a, b) => a.Title.localeCompare(b.Title));
        break;
      case "Descending":
        data.sort((a, b) => b.Title.localeCompare(a.Title));
        break;
      case "Last Month":
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        data = data.filter(item => new Date(item.Date) >= lastMonth);
        break;
      case "Recently Added":
      default:
        data.sort((a, b) => new Date(b.Date) - new Date(a.Date));
        break;
    }
    return data;
  }, [categoryFilter, sortOption]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-2">
      <header className="flex items-center justify-between">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-4xl ml-5 font-extrabold text-gray-900 mb-2">
            Jobs List
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
        Jobs List
      </h2>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Category Filter Dropdown */}
        <div className="relative">
          <label className="text-sm font-semibold mr-2 text-gray-700">
            Category:
          </label>
          <div className="inline-block relative w-48">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1); // Reset to page 1 on filter change
              }}
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
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
                JobId
              </th>  
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Openings
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Salary
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((job) => (
                <tr key={job.JobId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {job.JobId}
                  </td>  
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="mr-2 text-2xl">{job.Logo}</span>
                      {job.Title}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {job.Openings}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {job.Category}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {job.Location}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {job.Salary}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {job.Date}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No matching jobs found.
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

export default JobsList;