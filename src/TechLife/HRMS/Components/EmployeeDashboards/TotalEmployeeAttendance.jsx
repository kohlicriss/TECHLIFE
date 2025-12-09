import React, { useState, useMemo, useContext, useEffect } from 'react';
import axios from 'axios';
import { Context } from '../HrmsContext';

// helpers
const parseEffectiveHours = (effectiveHours) => {
  if (!effectiveHours) return 0;
  const s = String(effectiveHours).trim();
  // ISO duration like PT8H30M
  const match = s.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (match) {
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return hours * 60 + minutes;
  }
  // decimal hours like "8.5"
  if (!isNaN(Number(s))) {
    return Math.round(Number(s) * 60);
  }
  // hh:mm format
  const hhmm = s.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) return parseInt(hhmm[1], 10) * 60 + parseInt(hhmm[2], 10);
  return 0;
};
const formatMinutesToHHMM = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const IST_OFFSET_MINUTES = 5 * 60 + 30; // 330 minutes

// Parse time string into Date and shift to IST (dateRef = 'YYYY-MM-DD' used when timeStr is a time only)
const parseToISTDate = (timeStr, dateRef = null) => {
  if (!timeStr) return null;
  const raw = String(timeStr).trim();
  try {
    let d;
    let datePart = dateRef || new Date().toISOString().slice(0, 10);

    // 1. Handle full ISO-like strings (with date/time/T/Z)
    if (/\d{4}-\d{2}-\d{2}T/.test(raw) || raw.includes('Z')) {
      d = new Date(raw);
    } 
    // 2. Handle raw time strings like '05:43:02.079951'
    else if (/^\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(raw)) {
      // **FIX:** Treat the raw time (HH:mm:ss.ms) as UTC for the given date, then apply IST offset.
      // This ensures the +5:30 shift is applied correctly.
      let timeOnly = raw.split('.')[0]; // Use only HH:mm:ss part for construction
      d = new Date(`${datePart}T${timeOnly}Z`);
    } 
    // 3. Handle Date only string (YYYY-MM-DD)
    else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      d = new Date(raw);
    }
    // 4. Fallback attempt
    else {
      d = new Date(raw);
    }
    
    if (isNaN(d.getTime())) return null;
    
    // Shift time to IST by adding the offset
    return new Date(d.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
  } catch {
    return null;
  }
};

// convert/shift time string to IST display (adds 5:30 to UTC)
// dateRef should be YYYY-MM-DD used when timeStr is "HH:mm" only
const toISTTimeDisplay = (timeStr, dateRef = null) => {
  if (!timeStr) return 'N/A';
  const raw = String(timeStr).trim();
  try {
    const d = parseToISTDate(raw, dateRef);
    if (!d) return raw;
    // Use 'en-IN' for locale time string in IST
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return raw;
  }
};

// convert gross/effective value to display string (HH:MM)
const toHHMMDisplay = (value) => {
  const minutes = parseEffectiveHours(value || '');
  return minutes > 0 ? formatMinutesToHHMM(minutes) : 'N/A';
};

// GraphQL endpoint & query (Ensure no invisible characters here)
const GRAPHQL_URL = "https://hrms.anasolconsultancyservices.com/api/attendance/graphql";
const DETAILS_QUERY = `
query getDetailsBetweenDates($employeeId: String!, $startDate: Date!, $endDate: Date!) {
  getDetailsBetweenDates(employeeId: $employeeId, startDate: $startDate, endDate: $endDate) {
    date
    employeeId
    isPresent
    login
    logout
    effectiveHours
    grossHours
    mode
  }
}
`;

// Component
const AttendanceTable = ({ onBack }) => {
  // leaveType removed as requested
  const [sortBy, setSortBy] = useState('Recantly Added');
  const [selectedMonth, setSelectedMonth] = useState('');
  const { theme, userData } = useContext(Context);

  // fetched attendance records
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // build start/end date for fetch based on selectedMonth or current month
  const buildRange = () => {
    const today = new Date();
    let year = today.getFullYear();
    let monthIndex = today.getMonth(); // 0-based
    
    // If a month is selected, find its index and use current year
    if (selectedMonth) {
      const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const index = monthNames.indexOf(selectedMonth);
      if(index !== -1) monthIndex = index;
    }
    
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0); // Day 0 of next month gives last day of current month
    const toISO = (d) => d.toISOString().slice(0, 10);
    return { startISO: toISO(start), endISO: toISO(end) };
  };

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use userData employeeId or fallback to a default one
        const employeeId = userData?.employeeId || "ACS00000001"; 
        const { startISO, endISO } = buildRange();
        const variables = { employeeId, startDate: startISO, endDate: endISO };

        const resp = await axios.post(GRAPHQL_URL, { query: DETAILS_QUERY, variables }, {
          headers: { "Content-Type": "application/json" }
        });

        if (cancelled) return;
        if (resp?.data?.errors && resp.data.errors.length) {
          throw new Error(resp.data.errors.map(e => e.message).join('; '));
        }
        const data = resp?.data?.data?.getDetailsBetweenDates || [];

        // normalize and compute durations
        const normalized = data.map((item) => {
          // dateForTime: prefer YYYY-MM-DD
          const dateForTime = /^\d{4}-\d{2}-\d{2}$/.test(item.date)
            ? item.date
            : new Date().toISOString().slice(0, 10); // Fallback to current date

          // parse login/logout to IST dates (Used for duration calculation)
          const loginIST = parseToISTDate(item.login, dateForTime);
          const logoutIST = parseToISTDate(item.logout, dateForTime);

          // compute minutes
          let totalDurationMinutes = 0;
          if (loginIST && logoutIST && !isNaN(loginIST.getTime()) && !isNaN(logoutIST.getTime())) {
            // Calculate difference in minutes between IST login and IST logout
            totalDurationMinutes = Math.max(0, Math.floor((logoutIST - loginIST) / (1000 * 60)));
          } else {
            // fallback to effectiveHours or grossHours
            const eff = parseEffectiveHours(item.effectiveHours || '');
            const gross = parseEffectiveHours(item.grossHours || '');
            totalDurationMinutes = eff || gross || 0;
          }

          const effectiveMinutes = parseEffectiveHours(item.effectiveHours || '');
          const grossMinutes = parseEffectiveHours(item.grossHours || '');

          return {
            ...item,
            date: item.date,
            // These are the IST-adjusted display values
            loginDisplay: toISTTimeDisplay(item.login, dateForTime), 
            logoutDisplay: toISTTimeDisplay(item.logout, dateForTime),
            effectiveHoursDisplay: toHHMMDisplay(item.effectiveHours),
            grossHoursDisplay: toHHMMDisplay(item.grossHours),
            totalDurationMinutes,
            totalDurationHHMM: totalDurationMinutes > 0 ? formatMinutesToHHMM(totalDurationMinutes) : 'N/A',
            effectiveMinutes,
            grossMinutes,
            attended: (() => {
              const v = item.isPresent;
              if (v == null) return false;
              const s = String(v).toLowerCase();
              return ['present', 'p', 'yes', 'true', '1'].includes(s);
            })()
          };
        });

        setAttendanceRecords(normalized);
        setPage(1);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load attendance');
        setAttendanceRecords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [selectedMonth, userData]);

  // Filtering / sorting / pagination uses attendanceRecords state
  const filteredSorted = useMemo(() => {
    let result = [...attendanceRecords];

    switch (sortBy) {
      case 'Ascending':
        result.sort((a, b) => (a.employeeId || '').localeCompare(b.employeeId || ''));
        break;
      case 'Descending':
        result.sort((a, b) => (b.employeeId || '').localeCompare(a.employeeId || ''));
        break;
      case 'Last 7 days':
      case 'Recantly Added':
      default:
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
    }

    // (Sorting logic for 'This Month', 'Last Month', etc., removed as it relies on fetch logic, 
    // but the default sorting is by date/Recantly Added)

    return result;
  }, [attendanceRecords, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const pageItems = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  const totalEmployees = useMemo(() => {
    const uniqueIds = new Set(attendanceRecords.map(item => item.employeeId));
    return uniqueIds.size;
  }, [attendanceRecords]);

  // totals for filtered set (sum of totalDuration and gross)
  const totals = useMemo(() => {
    const sumDur = filteredSorted.reduce((acc, r) => acc + (r.totalDurationMinutes || 0), 0);
    const sumGross = filteredSorted.reduce((acc, r) => acc + (r.grossMinutes || 0), 0);
    return {
      totalDurationMinutes: sumDur,
      totalDurationHHMM: sumDur > 0 ? formatMinutesToHHMM(sumDur) : '00:00',
      totalGrossMinutes: sumGross,
      totalGrossHHMM: sumGross > 0 ? formatMinutesToHHMM(sumGross) : '00:00'
    };
  }, [filteredSorted]);

  // months array for select
  const months = [
    "January","February","March","April","May","June","July","August","September","October","November","December"
  ];

  return (
    <div className={`p-4 sm:p-8 ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-50'} min-h-screen`}>
      <h1 className="text-3xl font-extrabold text-indigo-800 mb-6 border-b pb-2">
        <span role="img" aria-label="clock">⏰</span> Employee Attendance Tracker
      </h1>
      <button onClick={onBack} className="mb-4 px-4 py-2 bg-indigo-100 text-blue-600 rounded-lg font-semibold shadow hover:bg-indigo-200 transition">← Back to Dashboard</button>

      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-indigo-500`}>
        <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} mb-4 sm:mb-0`}>
          Total Employees: <span className="text-indigo-600 text-2xl">{totalEmployees}</span>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Leave dropdown removed as requested */}

          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={`p-2 border border-gray-300 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-50' : 'bg-white'}`}>
            <option value="">Select Month: All</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`p-2 border border-gray-300 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-50' : 'bg-white'}`}>
            <option value="Recantly Added">Sorted By: Recently Added</option>
            <option value="Ascending">EmployeeId: Ascending</option>
            <option value="Descending">EmployeeId: Descending</option>
            <option value="This Month">Date: This Month</option>
            <option value="Last Month">Date: Last Month</option>
            <option value="Last 7 days">Date: Last 7 days</option>
          </select>

          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="p-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option value={6}>6 / page</option>
            <option value={12}>12 / page</option>
            <option value={24}>24 / page</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto shadow-2xl rounded-xl">
        <table className="min-w-full bg-white border-collapse">
          <thead className="bg-indigo-600 text-white sticky top-0">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 hidden sm:table-cell">EmployeeId</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 hidden sm:table-cell">Date</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 hidden sm:table-cell">Mode</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 hidden sm:table-cell">Login (IST)</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 hidden sm:table-cell">Logout (IST)</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 hidden sm:table-cell">Total Duration</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 hidden sm:table-cell">Effective Hours</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-indigo-500 hidden sm:table-cell">Status</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-indigo-500 sm:hidden">Employee Details</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-8">Loading…</td></tr>
            ) : error ? (
              <tr><td colSpan={10} className="text-center py-8 text-red-600">{error}</td></tr>
            ) : pageItems.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-6 text-gray-500">No attendance records found for the selected filters.</td></tr>
            ) : pageItems.map(record => {
              const totalDurationHHMM = record.totalDurationHHMM || 'N/A';
              const effectiveHoursHHMM = record.effectiveHoursDisplay || 'N/A';
              const statusColor = record.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

              return (
                <tr key={`${record.employeeId}-${record.date}`} className={`border-b transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                  <td className={`py-4 px-4 ${theme === 'dark' ? ' text-gray-50' : 'text-gray-700'} font-medium hidden sm:table-cell`}>{record.employeeId}</td>
                  <td className={`py-4 px-4 text-sm ${theme === 'dark' ? ' text-gray-50' : 'text-gray-700'} hidden sm:table-cell`}>{record.date}</td>
                  <td className="py-4 px-4 text-sm text-gray-600 hidden sm:table-cell">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${record.mode === 'Office' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{record.mode}</span>
                  </td>
                  {/* **FIXED:** Use the IST converted display values */}
                  <td className={`py-4 px-4 text-sm ${theme === 'dark' ? ' text-gray-50' : 'text-gray-700'} hidden sm:table-cell`}>{record.loginDisplay}</td>
                  <td className={`py-4 px-4 text-sm ${theme === 'dark' ? ' text-gray-50' : 'text-gray-700'} hidden sm:table-cell`}>{record.logoutDisplay}</td>
                  
                  <td className={`py-4 px-4 text-sm font-semibold ${theme === 'dark' ? ' text-indigo-500' : 'text-indigo-700'} hidden sm:table-cell`}>{totalDurationHHMM}</td>
                  <td className={`py-4 px-4 text-sm font-bold ${theme === 'dark' ? ' text-green-300' : 'text-green-700'} hidden sm:table-cell`}>{effectiveHoursHHMM}</td>
                  <td className="py-4 px-4 text-sm hidden sm:table-cell">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{record.attended ? 'Present' : 'Absent'}</span>
                  </td>

                  <td className="py-4 px-4 sm:hidden">
                    <div className="flex flex-col space-y-1">
                      <span className={`text-base font-bold ${theme === 'dark' ? ' text-indigo-300' : 'text-indigo-700'}`}>{record.employeeId}</span>
                      <span className={`text-sm ${theme === 'dark' ? ' text-gray-100' : 'text-gray-600'}`}>Date: {record.date} ({record.mode})</span>
                      {/* **FIXED:** Use the IST converted display values */}
                      <span className={`text-sm ${theme === 'dark' ? ' text-gray-100' : 'text-gray-600'}`}>{record.loginDisplay} - {record.logoutDisplay}</span>
                      <div className="text-xs font-medium mt-1"><span className={`${theme === 'dark' ? ' text-green-400' : 'text-green-700'}`}>Effective: {effectiveHoursHHMM}</span></div>
                      <div className="text-xs font-medium mt-1"><span className={`${theme === 'dark' ? ' text-indigo-300' : 'text-indigo-700'}`}>Total: {totalDurationHHMM}</span></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* pagination controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Showing {pageItems.length} of {filteredSorted.length} records</div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
          <span className="px-3 py-1">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
        </div>
        
      </div>

      <p className={`text-sm ${theme === 'dark' ? ' text-gray-50' : 'text-gray-700'} mt-6 text-center`}>
        Data is displayed for <strong>{filteredSorted.length}</strong> attendance record(s) based on current filters.
      </p>
    </div>
  );
};

export default AttendanceTable;