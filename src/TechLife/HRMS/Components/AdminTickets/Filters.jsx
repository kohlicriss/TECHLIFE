export default function Filters({ dateFilter, setDateFilter, searchTerm, setSearchTerm }) {
  return (
    <div className="p-4 bg-white border-b flex flex-col md:flex-row md:items-center gap-4 md:gap-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
        <label className="text-sm font-medium text-gray-700" htmlFor="date-filter">
          Date
        </label>
        <select
          id="date-filter"
          className="border border-gray-300 text-sm rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full md:w-auto"
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
        <label className="text-sm font-medium text-gray-700" htmlFor="search">
          Search
        </label>
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search name, ID, issue, status, priority..."
          className="border border-gray-300 text-sm rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full"
        />
      </div>
    </div>
  );
}
