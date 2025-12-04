import {ClockIcon} from "@heroicons/react/24/outline";
import React, { useMemo, useState, Fragment, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Context } from "../HrmsContext";
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,ResponsiveContainer,Tooltip} from "recharts";
import axios from 'axios';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}
const TopOnTime = () => {
    const { theme } = useContext(Context);
    const todayISO = new Date().toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [stDate, setStDate] = useState(sevenDaysAgo);
    const [enDate, setEnDate] = useState(todayISO);
    const [items, setItems] = useState([]); // [{ id, count }] or [{ id, raw, durationReadable }]
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('ontime'); // 'ontime' | 'overtime'

    const parseISODuration = (iso) => {
        if (!iso || typeof iso !== 'string') return 'N/A';
        // match PT{hours}H{minutes}M{seconds}S — hours/minutes/seconds optional
        const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!m) return iso;
        const hours = parseInt(m[1] || '0', 10);
        const minutes = parseInt(m[2] || '0', 10);
        const seconds = parseInt(m[3] || '0', 10);
        const remHours = hours % 24;
        const parts = [];
        if (remHours) parts.push(`${remHours}h`);
        if (minutes) parts.push(`${minutes}m`);
        if (seconds) parts.push(`${seconds}s`);
        return parts.length ? parts.join(' ') : '0m';
    };

     const fetchTopOnTime = async (start = stDate, end = enDate, limit = 5) => {
        setLoading(true);
        setError(null);
        try {
            const url = "https://hrms.anasolconsultancyservices.com/api/attendance/top-ontime";
            const resp = await axios.get(url, { params: { start, end, limit } });
            const payload = resp?.data ?? {};
            if (payload && typeof payload === "object" && !Array.isArray(payload)) {
                const entries = Object.entries(payload).map(([id, count]) => ({ id, count: Number(count) || 0 }));
                entries.sort((a, b) => b.count - a.count);
                setItems(entries);
            } else {
                setItems([]);
            }
        } catch (err) {
            // verbose logging
            console.error("fetchTopOnTime error:", err);
            console.error("axios response:", err?.response);
            // readable message for UI
            const serverBody = err?.response?.data;
            const message = err?.response?.data?.message
                || (serverBody ? JSON.stringify(serverBody) : null)
                || err?.message
                || "Failed to load top on-time";
            setError(message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopOvertime = async (start = stDate, end = enDate, limit = 5) => {
        setLoading(true);
        setError(null);
        try {
            const url = "https://hrms.anasolconsultancyservices.com/api/attendance/top-overtime";
            const resp = await axios.get(url, { params: { start, end, limit } });
            const payload = resp?.data ?? {};
            if (payload && typeof payload === "object" && !Array.isArray(payload)) {
                const entries = Object.entries(payload).map(([id, raw]) => ({
                    id,
                    raw: String(raw),
                    durationReadable: parseISODuration(String(raw)),
                }));
                entries.sort((a, b) => {
                    const ah = parseInt((a.raw.match(/PT(\d+)H/) || [0,0])[1], 10) || 0;
                    const bh = parseInt((b.raw.match(/PT(\d+)H/) || [0,0])[1], 10) || 0;
                    return bh - ah;
                });
                setItems(entries);
            } else {
                setItems([]);
            }
        } catch (err) {
            // verbose logging
            console.error("fetchTopOvertime error:", err);
            console.error("axios response:", err?.response);
            // readable message for UI
            const serverBody = err?.response?.data;
            const message = err?.response?.data?.message
                || (serverBody ? JSON.stringify(serverBody) : null)
                || err?.message
                || "Failed to load top overtime";
            setError(message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // fetch based on current mode when dates or mode change
        if (mode === 'ontime') fetchTopOnTime(stDate, enDate, 5);
        else fetchTopOvertime(stDate, enDate, 5);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stDate, enDate, mode]);

    return (
        <motion.div
            className={` rounded-xl shadow-md p-2 w-full h-96 font-sans border border-gray-200  flex flex-col ${theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-stone-100 text-gray-900'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0.5, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="flex items-center justify-between mb-2">
                <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    <ClockIcon className="w-6 h-6 text-blue-500 inline-block mr-2" />
                    {mode === 'ontime' ? 'Top On-Time' : 'Top OverTime'}
                </h2>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setMode('ontime')}
                        className={`px-3 py-1 rounded text-sm ${mode === 'ontime' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        Top On-Time
                    </button>
                    <button
                        onClick={() => setMode('overtime')}
                        className={`px-3 py-1 rounded text-sm ${mode === 'overtime' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        Top OverTime
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2 mb-2">
                <input
                    type="date"
                    value={stDate}
                    onChange={(e) => setStDate(e.target.value)}
                    className="p-1 border rounded"
                />
                <input
                    type="date"
                    value={enDate}
                    onChange={(e) => setEnDate(e.target.value)}
                    className="p-1 border rounded"
                />
                <button
                    onClick={() => {
                        if (mode === 'ontime') fetchTopOnTime(stDate, enDate, 5);
                        else fetchTopOvertime(stDate, enDate, 5);
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    disabled={loading}
                >
                    Apply
                </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                {loading ? (
                    <div className="text-center py-6">Loading…</div>
                ) : error ? (
                    <div className="text-red-600 text-center py-4">Error: {String(error)}</div>
                ) : items.length === 0 ? (
                    <div className="text-gray-500 text-center py-6">No data for selected range.</div>
                ) : (
                    <AnimatePresence>
                        {items.map((it, idx) => (
                            <motion.div
                                key={it.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2, delay: idx * 0.03 }}
                                className={`flex items-center justify-between rounded-lg p-2 border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                            >
                                <div className="flex items-center">
                                    <motion.img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(it.id)}&background=DDD&color=333`}
                                        alt={it.id}
                                        className="w-10 h-10 rounded-full mr-3 object-cover"
                                    />
                                    <div>
                                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{it.id}</p>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {mode === 'ontime' ? 'On-time count' : `Overtime: ${it.durationReadable || it.raw}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800`}>
                                        {mode === 'ontime' ? it.count : (it.durationReadable || 'N/A')}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
};

const EmployeeBarChart = () => {
  const { theme } = useContext(Context);
  const todayISO = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [stDate, setStDate] = useState(sevenDaysAgo);
  const [enDate, setEnDate] = useState(todayISO);

  const [dataPoints, setDataPoints] = useState([]); // [{ date: '2025-10-14', employees: 6 }, ...]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const textColor = theme === 'dark' ? "#FFFFFF" : "#000000";
  const barColor = "#ADD8E6";

  const fetchOnTimeCounts = async (start = stDate, end = enDate) => {
    setLoading(true);
    setError(null);
    try {
      const url = "https://hrms.anasolconsultancyservices.com/api/attendance/numberOfOnTime";
      const resp = await axios.get(url, { params: { stDate: start, enDate: end } });
      const payload = resp?.data ?? {};

      let entries = [];
      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        entries = Object.entries(payload).map(([dateStr, count]) => {
          const d = new Date(dateStr);
          const display = !isNaN(d.getTime())
            ? d.toLocaleString("en-US", { day: "2-digit", month: "short" }) // "14 Oct"
            : dateStr;
          return { date: dateStr, label: display, employees: Number(count) || 0 };
        });
      } else if (Array.isArray(payload)) {
        // fallback array shape
        entries = payload.map(it => ({
          date: it.date || it.Date || "",
          label: it.date || it.Date || "",
          employees: Number(it.count ?? it.NoofEmployee ?? it.noOfEmployee ?? it.value) || 0,
        }));
      }

      // sort ascending by date
      entries.sort((a, b) => new Date(a.date) - new Date(b.date));
      setDataPoints(entries);
    } catch (err) {
      console.error("Failed to fetch on-time counts:", err?.response ?? err);
      setError(err?.response?.data ?? err?.message ?? "Failed to load data");
      setDataPoints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnTimeCounts(stDate, enDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className={` rounded-xl shadow-md p-2 w-full h-96 font-sans border border-gray-200  flex flex-col ${theme === 'dark' ? 'bg-gray-700 text-gray-200 ' : 'bg-stone-100 text-gray-800'}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0.5, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="mb-1">
        <h2 className="text-xl font-semibold">On-Time Employees</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2 mb-2">
        <input
          type="date"
          value={stDate}
          onChange={(e) => setStDate(e.target.value)}
          className="p-1 border rounded"
        />
        <input
          type="date"
          value={enDate}
          onChange={(e) => setEnDate(e.target.value)}
          className="p-1 border rounded"
        />
        <button
          onClick={() => fetchOnTimeCounts(stDate, enDate)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          disabled={loading}
        >
          Apply
        </button>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">Loading…</div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-600">Error: {String(error)}</div>
        ) : dataPoints.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">No data for selected range.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dataPoints.map((d) => ({ name: d.label, employees: d.employees }))}
              margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
              <YAxis label={{ value: "No. of Employees", angle: -90, position: "insideLeft" }} stroke={textColor} tick={{ fill: textColor }} hide />
              <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? "#63676cff" : "#fff", border: theme ? "1px solid #4B5563" : "1px solid #ccc" }} />
              <Bar dataKey="employees" fill={barColor} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

const EmployeeOvertimeChart = () => {
  const { theme } = useContext(Context);
  const todayISO = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [stDate, setStDate] = useState(sevenDaysAgo);
  const [enDate, setEnDate] = useState(todayISO);

  const [dataPoints, setDataPoints] = useState([]); // [{ date: '2025-10-14', employees: 8 }, ...]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const textColor = theme === "dark" ? "#FFFFFF" : "#000000";
  const barColor = "#B19CD9";

  const fetchOvertimeCounts = async (start = stDate, end = enDate) => {
    setLoading(true);
    setError(null);
    try {
      const url = "https://hrms.anasolconsultancyservices.com/api/attendance/numberOfOvertime";
      const resp = await axios.get(url, { params: { stDate: start, enDate: end } });
      // expected response: object mapping date -> count, e.g. { "2025-10-14": 8, "2025-10-13": 7, ... }
      const payload = resp?.data ?? {};
      let entries = [];
      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        entries = Object.entries(payload).map(([dateStr, count]) => {
          // safe parse to Date for sorting; keep original key for label if parse fails
          const d = new Date(dateStr);
          const display = !isNaN(d.getTime())
            ? d.toLocaleString("en-US", { day: "2-digit", month: "short" }) // e.g. "14 Oct"
            : dateStr;
          return { date: dateStr, label: display, employees: Number(count) || 0 };
        });
      } else if (Array.isArray(payload)) {
        // fallback: array of items { date: "...", count: N }
        entries = payload.map((it) => ({
          date: it.date || it.Date || "",
          label: it.date || it.Date || "",
          employees: Number(it.count ?? it.NoofEmployee ?? it.noOfEmployee ?? it.value) || 0,
        }));
      }

      // sort ascending by date
      entries.sort((a, b) => new Date(a.date) - new Date(b.date));
      setDataPoints(entries);
    } catch (err) {
      console.error("Failed to fetch overtime counts:", err?.response ?? err);
      setError(err?.response?.data ?? err?.message ?? "Failed to load data");
      setDataPoints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOvertimeCounts(stDate, enDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className={` rounded-xl shadow-md p-2 w-full h-96 font-sans border border-gray-200  flex flex-col ${theme === 'dark' ? 'bg-gray-700 text-gray-200 ' : 'bg-stone-100 text-gray-800'}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0.5, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
       <div className="mb-1">
        <h2 className="text-xl font-semibold">OverTime (No. of Employees)</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
        <input
          type="date"
          value={stDate}
          onChange={(e) => setStDate(e.target.value)}
          className="p-1 border rounded"
        />
        <input
          type="date"
          value={enDate}
          onChange={(e) => setEnDate(e.target.value)}
          className="p-1 border rounded"
        />
        <button
          onClick={() => fetchOvertimeCounts(stDate, enDate)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          disabled={loading}
        >
          Apply
        </button>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">Loading…</div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-600">Error: {String(error)}</div>
        ) : dataPoints.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">No data for selected range.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dataPoints.map((d) => ({ name: d.label, employees: d.employees }))}
              margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
              <YAxis label={{ value: "No. of Employees", angle: -90, position: "insideLeft" }} stroke={textColor} tick={{ fill: textColor }} hide />
              <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? "#63676cff" : "#fff", border: theme ? "1px solid #4B5563" : "1px solid #ccc" }} />
              <Bar dataKey="employees" fill={barColor} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};
// ...existing helpers...
const parseEffectiveHours = (effectiveHours) => {
  if (!effectiveHours) return 0;
  const match = ('' + effectiveHours).match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (match) {
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return hours * 60 + minutes;
  }
  if (!isNaN(Number(effectiveHours))) {
    return Math.round(Number(effectiveHours) * 60);
  }
  const hhmm = ('' + effectiveHours).match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) return parseInt(hhmm[1], 10) * 60 + parseInt(hhmm[2], 10);
  return 0;
};
const formatMinutesToHHMM = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const IST_OFFSET_MINUTES = 5 * 60 + 30;

// convert/shift time string to IST display (adds 5:30 to UTC)
const toISTTimeDisplay = (timeStr, dateRef = null) => {
  if (!timeStr) return 'N/A';
  const raw = String(timeStr).trim();
  if (raw === 'N/A') return 'N/A';
  try {
    let d;
    if (/\d{4}-\d{2}-\d{2}T/.test(raw) || raw.includes('Z')) {
      d = new Date(raw);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw) && dateRef === null) {
      d = new Date(raw);
    } else if (/^\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
      const datePart = dateRef || new Date().toISOString().slice(0,10);
      d = new Date(`${datePart}T${raw}${raw.includes('Z') ? '' : 'Z'}`);
    } else {
      d = new Date(raw);
    }
    if (isNaN(d.getTime())) return raw;
    const shifted = new Date(d.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
    return shifted.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return raw;
  }
};

// parse time into Date (shifted to IST) for duration calc
const parseToISTDate = (timeStr, dateRef = null) => {
  if (!timeStr) return null;
  const raw = String(timeStr).trim();
  try {
    let d;
    if (/\d{4}-\d{2}-\d{2}T/.test(raw) || raw.includes('Z')) {
      d = new Date(raw);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw) && dateRef === null) {
      d = new Date(raw);
    } else if (/^\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
      const datePart = dateRef || new Date().toISOString().slice(0,10);
      d = new Date(`${datePart}T${raw}${raw.includes('Z') ? '' : 'Z'}`);
    } else {
      d = new Date(raw);
    }
    if (isNaN(d.getTime())) return null;
    return new Date(d.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
  } catch {
    return null;
  }
};

const toHHMMDisplay = (value) => {
  const minutes = parseEffectiveHours(value || '');
  return minutes > 0 ? formatMinutesToHHMM(minutes) : 'N/A';
};

// GraphQL endpoint & query
const GRAPHQL_URL = "https://hrms.anasolconsultancyservices.com/api/attendance/graphql";
const ALL_EMPLOYEES_QUERY = `
  query GetAllEmployeeDetailsOnDates($date: Date!) {
    getAllEmployeeDetailsOnDates(date: $date) {
      date
      event
      employeeId
      isPresent
      login
      logout
      effectiveHours
      grossHours
      holiday
      mode
    }
  }
`;

// Component
const AttendanceTable = ({onBack}) => {
  // removed leaveType state per request
  const [sortBy, setSortBy] = useState('Recantly Added');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const {theme, userData}=useContext(Context);

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
    if (selectedMonth) {
      const m = new Date(`${selectedMonth} 1, ${year}`);
      if (!isNaN(m)) monthIndex = m.getMonth();
    }
    const start = new Date(year, monthIndex, 1);
    const end = new Date(year, monthIndex + 1, 0);
    const toISO = d => d.toISOString().slice(0,10);
    return { startISO: toISO(start), endISO: toISO(end) };
  };

  const formatToHHMMFromRaw = (timeStr, dateRef = null) => {
  if (!timeStr) return 'N/A';
  const raw = String(timeStr).trim();
  if (raw === 'N/A') return 'N/A';

  // If the raw string already contains HH:MM or HH:MM:SS, extract HH:MM
  const m = raw.match(/([0-2]?\d):([0-5]\d)(?::[0-5]\d)?/);
  if (m) {
    return `${String(m[1]).padStart(2, '0')}:${String(m[2]).padStart(2, '0')}`;
  }

  // Try the existing parser which returns an IST-shifted Date (if available)
  try {
    const d = parseToISTDate(raw, dateRef);
    if (d && !isNaN(d.getTime())) {
      // parseToISTDate returns a Date shifted to IST; use UTC fields to get IST values reliably
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mm = String(d.getUTCMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }
  } catch (e) {}

  // Fallback: try normal Date parse and shift by IST offset
  try {
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      const shifted = new Date(parsed.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
      const hh = String(shifted.getUTCHours()).padStart(2, '0');
      const mm = String(shifted.getUTCMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }
  } catch (e) {}

  return 'N/A';
};
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchDate = selectedDate || new Date().toISOString().slice(0,10);
        const variables = { date: fetchDate };

        const resp = await axios.post(GRAPHQL_URL, { query: ALL_EMPLOYEES_QUERY, variables }, {
          headers: { "Content-Type": "application/json" }
        });
        if (cancelled) return;
        if (resp?.data?.errors && resp.data.errors.length) {
          throw new Error(resp.data.errors.map(e => e.message).join('; '));
        }
        const data = resp?.data?.data?.getAllEmployeeDetailsOnDates || [];

        const normalized = data.map(item => {
          const dateForTime = /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : (() => {
            const parts = (item.date || '').split('-');
            if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
            return new Date().toISOString().slice(0,10);
          })();

          // compute login/logout IST dates for duration
         const loginIST = parseToISTDate(item.login, dateForTime);
          const logoutIST = parseToISTDate(item.logout, dateForTime);

          // total duration (base)
          let totalDurationMinutes = 0;
          if (loginIST && logoutIST && !isNaN(loginIST.getTime()) && !isNaN(logoutIST.getTime())) {
            totalDurationMinutes = Math.max(0, Math.floor((logoutIST - loginIST) / (1000 * 60)));
          } else {
            // fallback: try effectiveHours if available (in minutes)
            totalDurationMinutes = parseEffectiveHours(item.effectiveHours || '') || 0;
          }

          // Add IST offset minutes to durations and to effective/gross hours as requested
          totalDurationMinutes = Math.max(0, totalDurationMinutes + IST_OFFSET_MINUTES);

          const effectiveBase = parseEffectiveHours(item.effectiveHours || '');
          const effectiveMinutes = effectiveBase ? Math.max(0, effectiveBase + IST_OFFSET_MINUTES) : 0;

          const grossBase = parseEffectiveHours(item.grossHours || '');
          const grossMinutes = grossBase ? Math.max(0, grossBase + IST_OFFSET_MINUTES) : 0;

          return {
            ...item,
            date: item.date,
            loginDisplay: (() => {
  if (loginIST && !isNaN(loginIST.getTime())) {
    const hh = String(loginIST.getUTCHours()).padStart(2, '0');
    const mm = String(loginIST.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return formatToHHMMFromRaw(item.login, dateForTime);
})(),
logoutDisplay: (() => {
  if (logoutIST && !isNaN(logoutIST.getTime())) {
    const hh = String(logoutIST.getUTCHours()).padStart(2, '0');
    const mm = String(logoutIST.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return formatToHHMMFromRaw(item.logout, dateForTime);
})(),
            effectiveHoursDisplay: effectiveMinutes > 0 ? formatMinutesToHHMM(effectiveMinutes) : 'N/A',
            grossHoursDisplay: grossMinutes > 0 ? formatMinutesToHHMM(grossMinutes) : 'N/A',
            totalDurationMinutes,
            totalDurationHHMM: totalDurationMinutes > 0 ? formatMinutesToHHMM(totalDurationMinutes) : 'N/A',
            attended: (() => {
              const v = item.isPresent;
              if (v == null) return false;
              const s = String(v).toLowerCase();
              return ['present','p','yes','true','1'].includes(s);
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
  }, [selectedDate, userData]);

  // Filtering / sorting / pagination uses attendanceRecords state
  const filteredSorted = useMemo(() => {
    let result = [...attendanceRecords];

    // removed leaveType filtering per request

    switch (sortBy) {
      case 'Ascending':
        result.sort((a,b) => (a.employeeId||'').localeCompare(b.employeeId||''));
        break;
      case 'Descending':
        result.sort((a,b) => (b.employeeId||'').localeCompare(a.employeeId||''));
        break;
      case 'Last Month':
        break;
      case 'Last 7 days':
        result.sort((a,b) => new Date(b.date) - new Date(a.date));
        break;
      case 'This Month':
        break;
      case 'Recantly Added':
      default:
        result.sort((a,b) => new Date(b.date) - new Date(a.date));
        break;
    }

    return result;
  }, [attendanceRecords, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const pageItems = filteredSorted.slice((page-1)*pageSize, page*pageSize);

  const totalEmployees = useMemo(() => {
    const uniqueIds = new Set(attendanceRecords.map(item => item.employeeId));
    return uniqueIds.size;
  }, [attendanceRecords]);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className={`p-4 sm:p-8 ${theme==='dark'?'bg-gray-800':'bg-gray-50'} min-h-screen`}>
      <h1 className="text-3xl font-extrabold text-indigo-800 mb-6 border-b pb-2">
        <span role="img" aria-label="clock">⏰</span> Employee Attendance Tracker
      </h1>
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 ${theme==='dark'?'bg-gray-700':'bg-white'} rounded-xl shadow-lg border-l-4 border-indigo-500`}>
        <div className={`text-lg font-semibold ${theme==='dark'?'text-gray-100':'text-gray-700'} mb-4 sm:mb-0`}>
          Total Employees: <span className="text-indigo-600 text-2xl">{totalEmployees}</span>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
         {/* Single-date fetch control */}
         <div className="flex items-center space-x-2">
           <input type="date" value={selectedDate} onChange={(e)=>{ setSelectedDate(e.target.value); }} className="p-2 border border-gray-300 rounded-lg" />
           <button onClick={()=>setSelectedDate('')} className="px-3 py-2 bg-gray-200 rounded">Clear</button>
         </div>

          <select value={selectedMonth} onChange={(e)=>setSelectedMonth(e.target.value)} className={`p-2 border border-gray-300 rounded-lg text-sm ${theme==='dark'?'bg-gray-700 text-gray-50':'bg-white'}`}>
            <option value="">Select Month: All</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className={`p-2 border border-gray-300 rounded-lg text-sm ${theme==='dark'?'bg-gray-700 text-gray-50':'bg-white'}`}>
            <option value="Recantly Added">Sorted By: Recently Added</option>
            <option value="Ascending">EmployeeId: Ascending</option>
            <option value="Descending">EmployeeId: Descending</option>
            <option value="This Month">Date: This Month</option>
            <option value="Last Month">Date: Last Month</option>
            <option value="Last 7 days">Date: Last 7 days</option>
          </select>

          <select value={pageSize} onChange={(e)=>{setPageSize(Number(e.target.value)); setPage(1);}} className="p-2 border border-gray-300 rounded-lg text-sm bg-white">
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
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-indigo-500 hidden sm:table-cell">Mode</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-indigo-500 hidden sm:table-cell">Login</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-indigo-500 hidden sm:table-cell">Logout</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-indigo-500 hidden sm:table-cell">Total Duration</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-indigo-500 hidden sm:table-cell">Gross Hours</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-indigo-500 hidden sm:table-cell">Effective Hours</th>
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
                const grossHoursHHMM = record.grossHoursDisplay || 'N/A';
                const statusColor = record.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

                return (
                  <tr key={`${record.employeeId}-${record.date}`} className={`border-b transition-colors duration-200 ${theme==='dark'?'bg-gray-700 hover:bg-gray-600':'hover:bg-gray-200'}`}>
                    <td className={`py-4 px-4 ${theme==='dark'?' text-gray-50':'text-gray-700'} font-medium hidden sm:table-cell`}>{record.employeeId}</td>
                    <td className={`py-4 px-4 text-sm ${theme==='dark'?' text-gray-50':'text-gray-700'} hidden sm:table-cell`}>{record.date}</td>
                    <td className="py-4 px-4 text-sm text-gray-600 hidden sm:table-cell"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${record.mode === 'Office' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{record.mode}</span></td>
                    <td className={`py-4 px-4 text-sm ${theme==='dark'?' text-gray-50':'text-gray-700'} hidden sm:table-cell`}>{record.loginDisplay}</td>
                    <td className={`py-4 px-4 text-sm ${theme==='dark'?' text-gray-50':'text-gray-700'} hidden sm:table-cell`}>{record.logoutDisplay}</td>
                    <td className={`py-4 px-4 text-sm font-semibold ${theme==='dark'?' text-indigo-500':'text-indigo-700'} hidden sm:table-cell`}>{totalDurationHHMM}</td>
                    <td className={`py-4 px-4 text-sm ${theme==='dark'?' text-purple-300':'text-purple-700'} hidden sm:table-cell`}>{grossHoursHHMM}</td>
                    <td className={`py-4 px-4 text-sm font-bold ${theme==='dark'?' text-green-300':'text-green-700'} hidden sm:table-cell`}>{effectiveHoursHHMM}</td>
                    <td className="py-4 px-4 text-sm hidden sm:table-cell"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{record.attended ? 'Present' : 'Absent'}</span></td>

                    <td className="py-4 px-4 sm:hidden">
                      <div className="flex flex-col space-y-1">
                        <span className={`text-base font-bold ${theme==='dark'?' text-indigo-300':'text-indigo-700'}`}>{record.employeeId}</span>
                        <span className={`text-sm ${theme==='dark'?' text-gray-100':'text-gray-600'}`}>Date: {record.date} ({record.mode})</span>
                        <span className={`text-sm ${theme==='dark'?' text-gray-100':'text-gray-600'}`}>{record.loginDisplay} - {record.logoutDisplay}</span>
                        <div className="text-xs font-medium mt-1"><span className={`${theme==='dark'?' text-green-400':'text-green-700'}`}>Effective: {effectiveHoursHHMM}</span></div>
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
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
          <span className="px-3 py-1">Page {page} / {totalPages}</span>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
        </div>
      </div>

      <p className={`text-sm ${theme==='dark'?' text-gray-50':'text-gray-700'} mt-6 text-center`}>
        Data is displayed for <strong>{filteredSorted.length}</strong> attendance record(s) based on current filters.
      </p>
    </div>
  );
};




function AttendanceReports({ onBack }) {
    return (
        <div className="p-2 sm:p-4 min-h-screen font-sans">
            <div className="flex items-center justify-between mb-4">
            <button
                onClick={onBack}
                className="mb-4 px-4 py-2 bg-indigo-100 text-blue-600 rounded-lg font-semibold shadow hover:bg-indigo-200 transition"
            >
                ← Back to Dashboard
            </button>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3  gap-6 mb-8">
                <TopOnTime />
                <EmployeeBarChart/>
                <EmployeeOvertimeChart/>
            </div>

            <div className="w-full">
                <AttendanceTable  />
            </div>
        </div>
    );
};
export default AttendanceReports;