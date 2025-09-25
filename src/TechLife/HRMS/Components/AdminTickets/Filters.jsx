import { useContext } from "react";
import { Context } from "../HrmsContext";

export default function Filters({ dateFilter, setDateFilter, searchTerm, setSearchTerm }) {
  const { theme } = useContext(Context);
  const isDark = theme === "dark";


  

  return (
    <div
      className={`p-4 border-b flex flex-col md:flex-row md:items-center gap-4 md:gap-6 shadow-sm transition-colors ${
        isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      
      <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
        <label
          className={`text-sm font-medium ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
          htmlFor="date-filter"
        >
          Date
        </label>
        <select
          id="date-filter"
          className={`border text-sm rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full md:w-auto ${
            isDark
              ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-700"
          }`}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option>All</option>
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Today</option>
        </select>
      </div>

    
      <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:flex-1">
        <label
          className={`text-sm font-medium ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
          htmlFor="search"
        >
          Search
        </label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search name, ID, issue, status, priority..."
          className={`border text-sm rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full ${
            isDark
              ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-700"
          }`}
        />
      </div>
    </div>
  );
}
