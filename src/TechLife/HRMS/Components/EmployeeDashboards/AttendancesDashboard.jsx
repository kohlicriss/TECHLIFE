import React, { useState, useEffect, useMemo, useContext, useCallback, useRef } from "react";
import { Context } from "../HrmsContext";
import { CalendarDaysIcon, ClockIcon, ArrowLeftIcon, BriefcaseIcon, ChartBarIcon, ChartPieIcon, XCircleIcon, } from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, } from "recharts";
import { LineChart, Line, } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from 'axios';
import { useParams } from "react-router-dom";
import { SidebarOpen } from "lucide-react";
import { FaBuilding, FaHome } from "react-icons/fa"
import AttendanceReports from "./AttendanceReports";
import { authApi, dashboardApi, publicinfoApi } from "../../../../axiosInstance";
import { IoPersonOutline } from "react-icons/io5";
import AttendanceTable from "./TotalEmployeeAttendance";
import { LiaFileAlt } from "react-icons/lia";
import { Calendar, Clock, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Edit, X } from "lucide-react";



const PIE_COLORS = ["#4F46E5", "#F97316"];
const BAR_COLORS = { work: "#4F46E5", break: "#F97316" };
const STANDARD_WORKDAY_HOURS = 8;
const IST_OFFSET_MINUTES = 5 * 60 + 30;

const pad2 = (n) => String(n).padStart(2, '0');

const tryNormalizeTo24 = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  // If contains AM/PM, let Date parse it (works with "hh:mm AM/PM" or "hh:mm:ss AM/PM")
  if (/[AP]M$/i.test(timeStr.trim())) {
    const d = new Date(`2000-01-01 ${timeStr}`);
    if (isNaN(d)) return null;
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }
  // Matches "HH:MM" or "H:MM" or "HH:MM:SS"
  const hhmmMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hhmmMatch) {
    return `${pad2(Number(hhmmMatch[1]))}:${pad2(Number(hhmmMatch[2]))}`;
  }
  // Try ISO datetime parse -> extract hours/minutes
  const maybeDate = new Date(timeStr);
  if (!isNaN(maybeDate)) {
    return `${pad2(maybeDate.getHours())}:${pad2(maybeDate.getMinutes())}`;
  }
  return null;
};
const formatHHMMTo12h = (hhmm) => {
  if (!hhmm) return 'N/A';
  const [hStr, mStr] = hhmm.split(':');
  const hh = Number(hStr);
  const mm = Number(mStr || '0');
  if (Number.isNaN(hh) || Number.isNaN(mm)) return hhmm;
  const period = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${period}`;
};

const addMinutesToTimeString = (timeStr, minutesToAdd = IST_OFFSET_MINUTES) => {
  const normalized = tryNormalizeTo24(timeStr);
  if (!normalized) return timeStr;
  const [hh, mm] = normalized.split(':').map(Number);
  const totalMin = (hh * 60 + mm + minutesToAdd + 24 * 60) % (24 * 60);
  const nh = Math.floor(totalMin / 60);
  const nm = totalMin % 60;
  return `${pad2(nh)}:${pad2(nm)}`;
};

// Apply offset for "13:00 - 14:00" style ranges
const shiftRange = (rangeStr) => {
  if (!rangeStr || typeof rangeStr !== 'string') return rangeStr;
  const parts = rangeStr.split(' - ').map(p => p.trim());
  if (parts.length !== 2) return rangeStr;
  const s = addMinutesToTimeString(parts[0]);
  const e = addMinutesToTimeString(parts[1]);
  return `${s} - ${e}`;
};

// Apply offset to schedule object (Start_time, End_time, Break_hour)
const applyOffsetToSchedule = (schedule) => {
  if (!schedule) return schedule;
  const res = { ...schedule };
  if (res.Start_time) res.Start_time = addMinutesToTimeString(res.Start_time);
  if (res.End_time) res.End_time = addMinutesToTimeString(res.End_time);
  if (Array.isArray(res.Break_hour)) {
    res.Break_hour = res.Break_hour.map(b => {
      if (!b) return b;
      const newB = { ...b };
      if (newB.Time) newB.Time = shiftRange(newB.Time);
      return newB;
    });
  } else if (res.Break_hour && typeof res.Break_hour === 'string') {
    res.Break_hour = shiftRange(res.Break_hour);
  }
  return res;
};
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



// Parse time string into Date and shift to IST (dateRef = 'YYYY-MM-DD' used when timeStr is 'HH:mm')
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
      const datePart = dateRef || new Date().toISOString().slice(0, 10);
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
const parseToDateSafe = (timeStr, dateRef = null) => {
  if (!timeStr) return null;
  const raw = String(timeStr).trim();
  // ISO-like or full datetime
  if (/\d{4}-\d{2}-\d{2}T/.test(raw) || raw.includes('Z')) {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  // YYYY-MM-DD date only
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T00:00:00Z`);
    return isNaN(d.getTime()) ? null : d;
  }
  // HH:mm or HH:mm:ss -> attach dateRef (or today) and treat as local time
  const hhmm = tryNormalizeTo24(raw);
  if (hhmm) {
    const datePart = dateRef || new Date().toISOString().slice(0, 10);
    const d = new Date(`${datePart}T${hhmm}:00`);
    return isNaN(d.getTime()) ? null : d;
  }
  // Fallback
  const any = new Date(raw);
  return isNaN(any.getTime()) ? null : any;
};

// convert/shift time string to IST display (adds 5:30 to UTC)
// dateRef should be YYYY-MM-DD used when timeStr is "HH:mm" only
const toISTTimeDisplay = (timeStr, dateRef = null) => {
  if (!timeStr) return 'N/A';
  const raw = String(timeStr).trim();
  const hhmm = tryNormalizeTo24(raw);
  if (hhmm && !/[TtZz]/.test(raw)) {
    const shifted = addMinutesToTimeString(hhmm, IST_OFFSET_MINUTES);
    return formatHHMMTo12h(shifted);
  }
  const parsed = parseToDateSafe(raw, dateRef);
  if (!parsed) return raw;
  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }).format(parsed);
  } catch {
    return parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
};
const toHHMMDisplay = (value) => {
  const minutes = parseEffectiveHours(value || '');
  return minutes > 0 ? formatMinutesToHHMM(minutes) : 'N/A';
};
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
// Mock Data
const ATTENDANCE_DATA = [
  { date: '17-10-2025', employeeId: 'EMP001', effectiveHour: '8.5', isPresent: 'Present', login: '09:00', logout: '17:30' },
  { date: '16-10-2025', employeeId: 'EMP001', effectiveHour: 'N/A', isPresent: 'Absent', login: 'N/A', logout: 'N/A' },
  { date: '15-10-2025', employeeId: 'EMP001', effectiveHour: 'N/A', isPresent: 'Holiday', login: 'N/A', logout: 'N/A' },
];


const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


const toIsoDate = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  // Converts DD-MM-YYYY to YYYY-MM-DD for date input
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateString;
};

const toStandardDate = (isoDateString) => {
  if (!isoDateString) return '';
  const parts = isoDateString.split('-');
  // Converts YYYY-MM-DD to DD-MM-YYYY for display/storage
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return isoDateString;
};

/**
 * @param {string} query
 * @param {object} variables 
 * @returns {Promise<object>}
 */
const executeGraphQL = async (query, variables = {}) => {
  try {
    // use dashboardApi so baseURL and auth headers are applied consistently
    const resp = await dashboardApi.post("/attendance/graphql", { query, variables }, {
      headers: { "Content-Type": "application/json" }
    });
    // axios response shape: resp.data => { data, errors }
    if (resp?.data?.errors && resp.data.errors.length) {
      const msg = resp.data.errors.map(e => e.message).join("; ");
      const err = new Error(msg);
      err.graphql = resp.data.errors;
      throw err;
    }
    return resp?.data?.data ?? null;
  } catch (err) {
    // surface helpful debug info
    console.error("executeGraphQL error:", err?.message || err, err?.response?.data || err);
    throw err;
  }
};
const GRAPHQL_URL = process.env.REACT_APP_HRMS_GRAPHQL_URL || "https://hrms.anasolconsultancyservices.com/api/attendance/graphql";
const graphqlRequest = async (query, variables = {}) => {
  const url = GRAPHQL_URL;
  try {
    const client = (dashboardApi && typeof dashboardApi.post === "function") ? dashboardApi : axios;
    const token = (() => {
      try { return localStorage.getItem('accessToken'); } catch { return null; }
    })();
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const resp = await client.post(url, { query, variables }, { headers });
    if (resp?.data?.errors && resp.data.errors.length) {
      const msg = resp.data.errors.map(e => e.message).join("; ");
      const err = new Error(msg);
      err.graphql = resp.data.errors;
      console.error("GraphQL response errors:", resp.data.errors);
      throw err;
    }
    return resp?.data?.data ?? null;
  } catch (err) {
    console.error("Error executing GraphQL operation:", err?.message || err, {
      url,
      query: typeof query === "string" ? query.replace(/\s+/g, " ").slice(0, 200) + "..." : query,
      variables,
      responseData: err?.response?.data
    });
    throw err;
  }
};
const DayDetailsModal = ({ dayData, eventsOnThisDay: propEvents = [], onClose }) => {
  const { userData } = useContext(Context);
  const employeeId = userData?.employeeId;
  const [attendanceData, setAttendanceData] = useState(null);
  const [eventsOnThisDay, setEventsOnThisDay] = useState(propEvents);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dateString = dayData?.dateString || '';

  // helper: add IST offset (5:30) to an effectiveHours value and return HH:MM string
  const addIstToEffective = (effValue) => {
    try {
      const baseMinutes = parseEffectiveHours(effValue || '');
      if (!baseMinutes) return 'N/A';

      const adjusted = baseMinutes;

      return formatMinutesToHHMM(adjusted);
    } catch {
      return 'N/A';
    }
  };

  // NEW helper: shift given time by IST_OFFSET_MINUTES and return localized 12-hour string
  // *** REPLACED WITH CORRECTED LOGIC ***
  const shiftTimeToISTDisplay = (timeStr, dateIso = null) => {
    if (!timeStr || timeStr === 'N/A') return 'N/A';



    const baseDateString = dateIso || new Date().toISOString().slice(0, 10);

    let d = new Date(`${baseDateString}T${timeStr}`);



    if (isNaN(d.getTime())) {
      try {
        const parts = timeStr.split(':');
        let h = parseInt(parts[0], 10) || 0;
        let m = parseInt(parts[1], 10) || 0;



        d = new Date(baseDateString);
        d.setHours(h, m, 0, 0);
      } catch {
        return timeStr;
      }
    }

    // Explicitly add 330 minutes (5 hours 30 minutes) as requested

    d.setMinutes(d.getMinutes() + IST_OFFSET_MINUTES);



    // Format to 12-hour IST display
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  // *** END OF REPLACEMENT ***

  useEffect(() => {
    let mounted = true;
    if (!dateString || !employeeId) {
      // when using passed-in attendance, also convert times to IST and adjust effective hour
      const src = dayData?.attendance ?? null;
      if (src) {
        const dateIso = toIsoDate(dateString) || undefined;
        // USE shiftTimeToISTDisplay so times are explicitly +5:30
        const loginIst = shiftTimeToISTDisplay(src.login ?? src.loginTime ?? 'N/A', dateIso);
        const logoutIst = shiftTimeToISTDisplay(src.logout ?? src.logoutTime ?? 'N/A', dateIso);
        const effAdj = addIstToEffective(src.effectiveHour ?? src.effectiveHours ?? src.effectiveHour);
        setAttendanceData({
          ...src,
          login: loginIst,
          logout: logoutIst,
          effectiveHour: effAdj
        });
      } else {
        setAttendanceData(null);
      }
      setEventsOnThisDay(propEvents || []);
      setLoading(false);
      return;
    }
    const QUERY = `
     query getDetailsBetweenDates($employeeId: String!, $startDate: Date!, $endDate: Date!) {
        getDetailsBetweenDates(employeeId: $employeeId, startDate: $startDate, endDate: $endDate) {
          date
          event
          description
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
    const load = async () => {
      setLoading(true);
      try {
        const iso = toIsoDate(dateString);
        const variables = { employeeId, startDate: iso, endDate: iso };
        const data = await graphqlRequest(QUERY, variables);
        if (!mounted) return;
        const items = data?.getDetailsBetweenDates || [];
        const dayItem = items.find(i => i.date === dateString || i.date === iso) || null;

        if (dayItem) {

          const loginIst = shiftTimeToISTDisplay(dayItem.login ?? 'N/A', iso);
          const logoutIst = shiftTimeToISTDisplay(dayItem.logout ?? 'N/A', iso);
          const effAdj = addIstToEffective(dayItem.effectiveHours ?? dayItem.effectiveHour);
          setAttendanceData({
            employeeId: dayItem.employeeId || employeeId,
            date: dayItem.date || dateString,
            effectiveHour: effAdj,
            isPresent: dayItem.isPresent ?? 'N/A',
            login: loginIst,
            logout: logoutIst,
            holiday: dayItem.holiday ?? false,
            mode: dayItem.mode ?? null
          });
        } else {
          const src = dayData?.attendance ?? { isPresent: 'N/A', login: 'N/A', logout: 'N/A', date: dateString };
          const srcIso = toIsoDate(src.date || dateString);
          setAttendanceData({
            ...src,
            login: shiftTimeToISTDisplay(src.login ?? 'N/A', srcIso),
            logout: shiftTimeToISTDisplay(src.logout ?? 'N/A', srcIso),
            effectiveHour: addIstToEffective(src.effectiveHour ?? src.effectiveHours),
            holiday: src.holiday ?? false
          });
        }
        const mappedEvents = items
          .filter(it => it.event || it.description || (typeof it.holiday !== 'undefined'))
          .map(it => ({
            event: it.event || 'Event',
            description: it.description || '',
            startDate: it.startDate || it.date,
            endDate: it.endDate || it.date,
            holiday: Boolean(it.holiday)
          }));
        const propEventsList = propEvents || [];
        const anyHolidayFromMapped = mappedEvents.some(ev => ev.holiday)
        const anyHolidayFromProp = propEventsList.some(ev => ev && (ev.holiday === true || String(ev.holiday).toLowerCase() === 'true'));
        const anyHoliday = anyHolidayFromMapped || anyHolidayFromProp;
        if (anyHoliday) {
          setEventsOnThisDay(mappedEvents.length ? mappedEvents : propEventsList);
          setAttendanceData(prev => ({
            ...(prev || {}),
            holiday: true,
            isPresent: prev && prev.isPresent ? prev.isPresent : 'Holiday'
          }));
        } else {
          setEventsOnThisDay(mappedEvents.length ? mappedEvents : propEventsList);
        }





        setError(null);

      } catch (err) {
        console.error("DayDetailsModal fetch failed:", err);
        setError(err.message || "Failed to load details");
        const src = dayData?.attendance ?? null;
        if (src) {
          const srcIso = toIsoDate(src.date || dateString);
          setAttendanceData({
            ...src,
            login: shiftTimeToISTDisplay(src.login ?? 'N/A', srcIso),
            logout: shiftTimeToISTDisplay(src.logout ?? 'N/A', srcIso),
            effectiveHour: addIstToEffective(src.effectiveHour ?? src.effectiveHours)
          });
        } else {
          setAttendanceData(null);
        }
        setEventsOnThisDay(propEvents || []);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [dateString, userData?.employeeId]);
  if (!dayData || dayData.type === 'blank') return null;
  if (loading) {
    return (
      <div className="absolute inset-0 flex justify-center items-center z-50 p-4 bg-white/50 bg-opacity-40 backdrop-blur-sm">
        <div className="bg-white/90 px-6 py-4 rounded-lg shadow-lg text-indigo-700 font-semibold">Loading Day Details…</div>
      </div>
    );
  }
  const displayAttendance = attendanceData || (dayData?.attendance ?? { isPresent: 'N/A', login: 'N/A', logout: 'N/A', date: dateString });
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${displayAttendance?.date || dateString}`}
      className="absolute inset-0 flex justify-center items-center z-50 p-4 bg-white/50 bg-opacity-40 backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="md:col-span-2 flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="text-lg font-bold text-indigo-700">Details — {MONTHS ? MONTHS[new Date().getMonth()] : ''} <span className="text-base font-medium text-gray-600"> {displayAttendance?.date || dateString}</span></h3>
              <p className="text-xs text-gray-500">Employee: <span className="font-medium text-gray-700">{displayAttendance?.employeeId || employeeId || "N/A"}</span></p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close details" className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {/* Left: Attendance summary */}
        <section className="p-5 border-r md:border-r md:border-gray-100 bg-white">
          <h4 className="text-sm font-semibold text-indigo-600 mb-3">Attendance</h4>
          <div className="space-y-3 text-sm text-gray-700">

            <div className="flex justify-between items-center">

              <span className="text-gray-500">Status</span>
              {(() => {
                const raw = displayAttendance?.isPresent;
                const holidayFlag = displayAttendance?.holiday === true || String(raw || '').toLowerCase().includes('holiday');
                const s = String(raw || '').trim().toLowerCase();
                const isPresent = ['present', 'p', 'yes', 'true', '1'].includes(s);
                const isAbsent = ['absent', 'a', 'no', 'false', '0'].includes(s);
                const badgeClass = holidayFlag
                  ? 'bg-yellow-100 text-yellow-800'
                  : isPresent
                    ? 'bg-green-100 text-green-800'
                    : isAbsent
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800';
                const label = holidayFlag ? 'Holiday' : (isPresent ? 'Present' : (isAbsent ? 'Absent' : (displayAttendance?.isPresent || 'N/A')));
                return <span className={`ml-2 font-semibold px-2 py-0.5 rounded-full text-xs ${badgeClass}`}>{label}</span>;
              })()}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Login</span>
              <span className="font-medium">{displayAttendance?.login || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Logout</span>
              <span className="font-medium">{displayAttendance?.logout || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Effective Hours</span>
              <span className="font-medium">{displayAttendance?.effectiveHour || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mode</span>
              <span className="font-medium">{displayAttendance?.mode || '-'}</span>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">Notes</p>
              {error ? (
                <p className="text-xs text-red-600 mt-1">{error}</p>
              ) : (
                <p className="text-xs text-gray-600 mt-1">This view shows converted IST times and any event notes for the selected day.</p>
              )}
            </div>
          </div>
          <div className="mt-6">
            <button onClick={onClose} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              Got it
            </button>
          </div>
        </section>
        <aside className="p-5 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-teal-700">Events ({eventsOnThisDay.length})</h4>
            <span className="text-xs text-gray-500">{eventsOnThisDay.length > 0 ? `${Math.min(eventsOnThisDay.length, 99)}` : '—'}</span>
          </div>
          {eventsOnThisDay.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <p className="text-sm text-gray-500 italic">No events scheduled for this day.</p>
              <p className="text-xs text-gray-400 mt-2">You can add events from the calendar.</p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
              {eventsOnThisDay.map((event, idx) => (
                <li key={idx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">{event.event}</span>
                        {event.holiday && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Holiday</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{event.description || 'No description'}</p>
                      {event.startDate !== event.endDate && (
                        <p className="text-xs text-teal-600 mt-2">Multi-day: {event.startDate} — {event.endDate}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400 ml-3">
                      <span>{event.startDate}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
};
const EventFormModal = ({ onSubmit, selectedDate, onClose }) => {
  const { userData } = useContext(Context);
  const employeeId = userData?.employeeId;
  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(toIsoDate(selectedDate.start) || '');
  const [endDate, setEndDate] = useState(toIsoDate(selectedDate.end) || '');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [loading, setLoading] = useState(false);



  const MUTATION = `

    mutation AddCalendarEntries($input: CalendarInput!) {

      addCalendarEntries(input: $input) {

        date

        description

        holiday

      }

    }

  `;



  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    try {
      const input = {
        startDate: startDate, // YYYY-MM-DD
        endDate: endDate,
        event: eventTitle,
        description,
        holiday: !!isHalfDay
      };
      const variables = { input };
      const data = await graphqlRequest(MUTATION, variables);
      const added = data?.addCalendarEntries || [];
      const newEvents = added.map(a => ({
        event: eventTitle,
        description: a.description || description,
        startDate: toStandardDate(a.date || startDate),
        endDate: toStandardDate(a.date || endDate),
        holiday: a.holiday ?? isHalfDay
      }));
      onSubmit(newEvents.length ? newEvents[0] : {
        event: eventTitle,
        description,
        startDate: toStandardDate(startDate),
        endDate: toStandardDate(endDate),
        holiday: isHalfDay
      });
      onClose();
    } catch (err) {
      console.error("EventFormModal mutation failed:", err);
      const graphqlMessage = err?.graphql?.length ? err.graphql.map(g => g.message).join("; ") : null;
      const serverMessage = err?.response?.data?.message || err?.message;
      alert("Failed to save event: " + (graphqlMessage || serverMessage || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="absolute inset-0 flex justify-center items-center z-50 p-4 bg-white/50 bg-opacity-40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <h2 className="text-2xl font-bold text-indigo-700 mb-3 border-b pb-2 flex items-center">
          <Calendar className="mr-2" /> {loading ? 'Saving...' : 'Add/Edit Event'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="mb-2">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="startDate">Start Date</label>
            <input id="startDate" name="startDate" type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="endDate">End Date</label>
            <input id="endDate" name="endDate" type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="eventTitle">Event Title</label>
          <input id="eventTitle" name="event" type="text" placeholder="e.g., Team Meeting" value={eventTitle} onChange={e => setEventTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div className="flex items-center pt-6 mb-2">
          <input id="holiday" type="checkbox" checked={isHalfDay} onChange={e => setIsHalfDay(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600" />
          <label htmlFor="holiday" className="ml-2 block text-sm font-medium cursor-pointer">Is Holiday?</label>
        </div>
        <div className="mb-3">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="description">Description</label>
          <textarea id="description" name="description" rows="3" placeholder="Details about the event..." value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
        </div>
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg">{loading ? 'Submitting...' : 'Submit'}</button>
        </div>
      </form>
    </div>
  );
};
const EventListModal = ({ currentYear, currentMonth, onClose }) => {
  const { userData } = useContext(Context);
  const employeeId = userData?.employeeId;
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const QUERY = ` query getDetailsBetweenDates($employeeId: String!, $startDate: Date!, $endDate: Date!) { getDetailsBetweenDates(employeeId: $employeeId, startDate: $startDate, endDate: $endDate) { date description holiday event } }`;
  const ROWS_PER_PAGE = 3;
  const [page, setPage] = useState(1);
  useEffect(() => {
    let mounted = true;
    const fetchMonthlyEvents = async () => {
      setLoading(true);
      try {
        const start = new Date(currentYear, currentMonth, 1);
        const end = new Date(currentYear, currentMonth + 1, 0);
        const startISO = start.toISOString().slice(0, 10);
        const endISO = end.toISOString().slice(0, 10);
        const variables = { employeeId, startDate: startISO, endDate: endISO };
        const data = await graphqlRequest(QUERY, variables);
        if (!mounted) return;
        const fetched = data?.getDetailsBetweenDates || [];
        const mapped = fetched.map(f => ({
          event: f.event || 'Event',
          description: f.description || '',
          startDate: f.startDate || f.date,
          endDate: f.endDate || f.date,
          holiday: f.holiday ?? false
        }));
        setEventsList(mapped);
        setError(null);
        setPage(1); 
       } catch (err) {
        console.error("EventListModal fetch failed:", err);
        setError(err.message || "Failed to fetch event list");
        setEventsList([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchMonthlyEvents();
    return () => { mounted = false; };
  }, [currentYear, currentMonth, userData?.employeeId]);
  const totalPages = Math.max(1, Math.ceil(eventsList.length / ROWS_PER_PAGE));
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const pageItems = eventsList.slice(startIndex, startIndex + ROWS_PER_PAGE);
  if (loading) {
    return (
      <div className="p-4 absolute inset-0 flex justify-center items-center z-50 bg-white/50 bg-opacity-40 backdrop-blur-sm">
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-400 border-t-transparent mx-auto mb-3"></div>
          <div className="text-lg font-semibold text-teal-700">Loading Events...</div>
        </div>
      </div>
    );
  }
  return (
    // Non-overlay modal: render inline so it stays inside App layout
    <div className=" absolute inset-0 flex justify-center items-center z-50 bg-white/50 bg-opacity-40 backdrop-blur-sm">

      <div className="bg-white max-h-[60vh] overflow-y-auto w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-2 sm:p-6 relative ">

        <div className="flex justify-between items-center border-b-4 border-teal-300 pb-3 mb-4">
          <h2 className="text-2xl font-extrabold text-teal-600 flex items-center">
            <Calendar className="mr-3 w-6 h-6" /> Events for {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        {error ? (
          <p className="text-red-600 text-center py-6">{error}</p>
        ) : eventsList.length === 0 ? (
          <p className="text-gray-500 text-lg text-center py-10">No events added for this month yet. 🎉</p>
        ) : (
          <div className="space-y-4">
            {pageItems.map((event, index) => (
              <div key={`${event.startDate}-${startIndex + index}`} className="border border-teal-200 rounded-xl p-4 shadow-sm transition duration-200 bg-teal-50">
                <p className="text-lg font-bold text-teal-700 mb-1 border-b border-teal-100 pb-1">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Date: {event.startDate} {event.startDate !== event.endDate && (`- ${event.endDate}`)}
                </p>
                <p className="text-xl font-semibold text-gray-800 mb-2">{event.event}</p>
                <p className="text-gray-600 italic border-l-4 border-teal-400 pl-3">{event.description}</p>
              </div>
            ))}
            {/* pagination controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} - {Math.min(startIndex + ROWS_PER_PAGE, eventsList.length)} of {eventsList.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm">Page {page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition duration-150">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function App({ attendanceRecords: externalAttendanceRecords = [] }) {

  const [currentDate, setCurrentDate] = useState(new Date());

  const [events, setEvents] = useState([]);

  const [selectedDateForForm, setSelectedDateForForm] = useState({ start: null, end: null });

  const [showEventForm, setShowEventForm] = useState(false);

  const [showEventsList, setShowEventsList] = useState(false);

  const [showDayDetails, setShowDayDetails] = useState(null);

  const [isEditing, setIsEditing] = useState(false);



  const currentYear = currentDate.getFullYear();

  const currentMonth = currentDate.getMonth();



  const getEventsForDate = useCallback((dateString) => {

    const targetDate = new Date(dateString.split('-').reverse().join('-'));

    targetDate.setHours(0, 0, 0, 0);



    return events.filter(event => {

      const eventStart = new Date(event.startDate.split('-').reverse().join('-'));

      const eventEnd = new Date(event.endDate.split('-').reverse().join('-'));



      eventStart.setHours(0, 0, 0, 0);

      eventEnd.setHours(0, 0, 0, 0);



      return targetDate >= eventStart && targetDate <= eventEnd;

    });

  }, [events]);



  const calendarDays = useMemo(() => {

    const totalDays = getDaysInMonth(currentYear, currentMonth);

    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const days = [];



    for (let i = 0; i < firstDay; i++) {

      days.push({ key: `blank-${i}`, type: 'blank' });

    }



    for (let day = 1; day <= totalDays; day++) {

      const dateString = `${String(day).padStart(2, '0')}-${String(currentMonth + 1).padStart(2, '0')}-${currentYear}`;

      const matchedRecord = (externalAttendanceRecords || []).find(r => {

        if (!r || !r.date) return false;



        if (/^\d{2}-\d{2}-\d{4}$/.test(r.date) && r.date === dateString) return true;



        if (/^\d{4}-\d{2}-\d{2}$/.test(r.date)) {

          const asDisplay = toStandardDate(r.date);

          return asDisplay === dateString;

        }



        return String(r.date) === dateString;

      });



      // build attendance object expected by DayBox / DayDetailsModal

      let attendance = { isPresent: 'N/A', login: 'N/A', logout: 'N/A', effectiveHour: 'N/A', date: dateString };



      if (matchedRecord) {

        attendance = {

          date: dateString,

          employeeId: matchedRecord.employeeId ?? matchedRecord.employee_id ?? matchedRecord.employeeId,

          // prefer normalized display fields if present (loginDisplay/logoutDisplay), otherwise try raw fields

          login: matchedRecord.loginDisplay ?? matchedRecord.login ?? matchedRecord.login_time ?? 'N/A',

          logout: matchedRecord.logoutDisplay ?? matchedRecord.logout ?? matchedRecord.logout_time ?? 'N/A',

          // effective/gross; prefer already formatted HH:MM displays

          effectiveHour: matchedRecord.effectiveHoursDisplay ?? matchedRecord.effectiveHour ?? (matchedRecord.effectiveMinutes ? formatMinutesToHHMM(matchedRecord.effectiveMinutes) : 'N/A'),

          isPresent: matchedRecord.isPresent ?? (matchedRecord.attended ? 'Present' : (matchedRecord.holiday ? 'Holiday' : 'Absent')),

          holiday: matchedRecord.holiday ?? false,

          mode: matchedRecord.mode ?? null

        };

      }



      days.push({

        date: dateString,

        type: 'day',

        day: day,

        dateString,

        attendance

      });

    }

    return days;

  }, [currentYear, currentMonth, externalAttendanceRecords]);

  const changeMonth = useCallback((amount) => {

    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + amount, 1));

    setShowDayDetails(null);

    setShowEventForm(false);

    setShowEventsList(false);

  }, []);



  const handleDayClick = (dayData) => {

    if (dayData.type === 'blank') return;



    if (isEditing) {

      setSelectedDateForForm({ start: dayData.dateString, end: dayData.dateString });

      setShowEventForm(true);

      setIsEditing(false);

    } else {

      const eventsOnThisDay = getEventsForDate(dayData.dateString);

      setShowDayDetails({ ...dayData, eventsOnThisDay });

    }

  };



  const handleFormSubmit = (newEvent) => {

    // Add event to local state and close the form

    setEvents(prevEvents => [...prevEvents, newEvent]);

    setShowEventForm(false);

  };



  // Calendar Day Box Component (Unchanged logic)

  const DayBox = ({ dayData }) => {

    if (dayData.type === 'blank') {

      return <div className="p-2 border border-gray-100 bg-gray-50 min-h-[20px] sm:min-h-[40px]"></div>;

    }
    const { day, dateString, attendance } = dayData;
    // Normalize status so DayBox colors match DayDetailsModal behaviour
    const normalizeStatus = (att) => {

      if (!att) return 'unknown';

      // holiday flag takes precedence

      if (att.holiday === true || String(att.holiday).toLowerCase() === 'true') return 'holiday';



      const candidates = [att.isPresent, att.status, att.present, att.attended];

      let v = candidates.find(c => typeof c !== 'undefined' && c !== null);

      if (typeof v === 'boolean') return v ? 'present' : 'absent';

      if (v == null) {

        // try effectiveHour/gross heuristics

        const eff = parseEffectiveHours(att.effectiveHour ?? att.effectiveHours ?? '');

        if (eff && eff > 0) return 'present';

        return 'unknown';

      }

      const s = String(v).trim().toLowerCase();

      if (!s) return 'unknown';

      if (['present', 'p', 'yes', 'true', '1'].includes(s)) return 'present';

      if (['absent', 'a', 'no', 'false', '0'].includes(s)) return 'absent';

      if (s.includes('holiday') || s === 'h') return 'holiday';

      return 'unknown';

    };
    const eventsOnThisDay = getEventsForDate(dateString);
    const hasEvents = eventsOnThisDay.length > 0;
    // If any event on this day is marked as holiday, treat the day as holiday
    const hasHolidayEvent = eventsOnThisDay.some(ev => ev && (ev.holiday === true || String(ev.holiday).toLowerCase() === 'true'));
    // Determine effective status giving precedence to holiday event
    const status = hasHolidayEvent ? 'holiday' : normalizeStatus(attendance);
    const isToday = dateString === new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    // map status to Tailwind classes + icon
    let bgClass = 'bg-white';
    let borderClass = 'border-gray-300';
    let icon = null;
    let textClass = 'text-gray-900';
    if (status === 'present') {

      bgClass = 'bg-green-50 hover:bg-green-200';

      borderClass = 'border-green-500 border-2';

      icon = <CheckCircle className="w-2 h-2 text-green-700" />;

      textClass = 'text-green-800';

    } else if (status === 'absent') {

      bgClass = 'bg-red-50 hover:bg-red-200';

      borderClass = 'border-red-500 border-2';

      icon = <AlertTriangle className="w-2 h-2 text-red-700" />;

      textClass = 'text-red-800';

    } else if (status === 'holiday') {

      bgClass = 'bg-yellow-50 hover:bg-yellow-200';

      borderClass = 'border-yellow-500 border-2';

      icon = <Calendar className="w-2 h-2 text-yellow-700" />;

      textClass = 'text-yellow-800';

    } else {

      bgClass = 'bg-gray-50 hover:bg-gray-100';

      borderClass = hasEvents ? 'border-indigo-500 border-2' : 'border-gray-300';

    }
    const todayRingClass = isToday ? 'ring-4 ring-indigo-400 font-bold' : '';
    const editingClass = isEditing ? 'cursor-crosshair ring-2 ring-pink-500' : '';
    return (

      <div

        className={`relative group p-2 sm:p-3 border transition-all duration-200 cursor-pointer ${bgClass} ${borderClass} ${todayRingClass} ${editingClass} shadow-sm min-h-[50px] sm:min-h-[70px] flex flex-col justify-start`}

        onClick={() => handleDayClick(dayData)}

      >

        <div className="flex justify-between items-start mb-1">

          <span className={`text-lg sm:text-xl ${isToday ? 'text-indigo-700' : textClass}`}>{day}</span>

          <div className='flex-shrink-0'>{icon}</div>

        </div>



        {hasEvents && (

          <div className='mt-auto'>

            <p className={`text-xs text-indigo-700 font-semibold truncate ${eventsOnThisDay.length > 1 ? 'border-t border-indigo-300 pt-1' : ''}`}>

              {eventsOnThisDay.length} {eventsOnThisDay.length > 1 ? 'Events' : 'Event'}

            </p>

          </div>

        )}

      </div>

    );

  };



  return (

    <div className="p-4 sm:p-8">

      <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-4 sm:p-6 relative">



        {/* Modals are now calling the standalone components */}

        {showEventForm && (

          <EventFormModal

            onSubmit={handleFormSubmit}

            selectedDate={selectedDateForForm}

            onClose={() => setShowEventForm(false)}

          />

        )}

        {showEventsList && (

          <EventListModal

            onClose={() => setShowEventsList(false)}

            currentYear={currentYear}

            currentMonth={currentMonth}

            setEvents={setEvents} // Pass setEvents to update App state with fresh data

          />

        )}

        {showDayDetails && (

          <DayDetailsModal

            dayData={showDayDetails}

            eventsOnThisDay={showDayDetails.eventsOnThisDay}

            onClose={() => setShowDayDetails(null)}

          />

        )}



        {/* Main Content (Blurred when modal is open) */}

        <div className={`${(showEventForm || showEventsList || showDayDetails) ? 'pointer-events-none opacity-50' : ''}`}>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-4">

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-4 sm:mb-0">

              {MONTHS[currentMonth]} <span className="text-indigo-600">{currentYear}</span>

            </h1>



            <div className="flex space-x-2 sm:space-x-4">

              {/* New Edit Button */}

              <button

                onClick={() => setIsEditing(prev => !prev)}

                className={`flex items-center px-3 py-2 sm:px-4 sm:py-2 text-white font-semibold text-sm rounded-lg shadow-md transition duration-150 transform hover:scale-105 ${isEditing ? 'bg-indigo-700 hover:bg-indigo-800 ring-2 ring-pink-300' : 'bg-indigo-500 hover:bg-indigo-600'}`}

              >

                <Edit className="w-4 h-4 mr-1 sm:mr-2" /> {isEditing ? 'Cancel Edit' : 'Edit '}

              </button>



              <button

                onClick={() => setShowEventsList(true)}

                className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-pink-500 text-white font-semibold text-sm rounded-lg shadow-md hover:bg-pink-600 transition duration-150 transform hover:scale-105"

              >

                <Calendar className="w-4 h-4 mr-1 sm:mr-2" /> Events

              </button>



              <button

                onClick={() => changeMonth(-1)}

                className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition duration-150"

              >

                <ChevronLeft className="w-5 h-5" />

              </button>

              <button

                onClick={() => changeMonth(1)}

                className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition duration-150"

              >

                <ChevronRight className="w-5 h-5" />

              </button>

            </div>

          </div>



          {/* Days of Week Header */}

          <div className="grid grid-cols-7 gap-1 mb-1">

            {DAYS_OF_WEEK.map(day => (

              <div key={day} className="text-center font-semibold text-xs sm:text-sm text-indigo-700 p-2 bg-indigo-100 rounded">

                {day}

              </div>

            ))}

          </div>



          {/* Calendar Grid */}

          <div className="grid grid-cols-7 gap-1">

            {calendarDays.map((day, index) => (

              <DayBox key={day.key || day.dateString || `day-${index}`} dayData={day} />

            ))}

          </div>

        </div>

      </div>

    </div>

  );

}

const calculateHours = (login, logout) => {
  // If either missing, return 0
  if (!login || !logout) return 0;

  // Shift both times by IST offset
  const shiftedLogin = tryNormalizeTo24(login) ? addMinutesToTimeString(login) : null;
  const shiftedLogout = tryNormalizeTo24(logout) ? addMinutesToTimeString(logout) : null;
  if (!shiftedLogin || !shiftedLogout) return 0;

  const loginDate = new Date(`2000-01-01T${shiftedLogin}:00`);
  const logoutDate = new Date(`2000-01-01T${shiftedLogout}:00`);
  let diffHours = (logoutDate - loginDate) / (1000 * 60 * 60);
  if (diffHours < 0) diffHours += 24; // cross-midnight
  return diffHours > 0 ? diffHours : 0;
};

const formatClockTime = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const FilterButtonGroup = ({ options, selectedOption, onSelect, className = "" }) => {
  const { theme } = useContext(Context);
  return (
    <div className={`flex gap-2 sm:gap-3 flex-wrap ${className}`}>
      {options.map((option) => (
        <motion.button
          key={option}
          onClick={() => onSelect(option)}
          className={`px-3 py-2  rounded-lg border text-sm sm:text-base font-semibold     
                ${selectedOption === option ? "bg-indigo-600 text-white shadow-md" : "bg-white text-gray-700 border-gray-300"}
                ${theme === 'dark' ? (selectedOption === option ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-800 text-gray-300 border-gray-600') : ''}
                hover:bg-indigo-500 hover:text-white transition-colors duration-200 ease-in-out`}
          aria-pressed={selectedOption === option}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {option}
        </motion.button>
      ))}
    </div>
  )
};
//const dates = ["All", "11", "12", "13", "14", "15"];
//const rawTableData = [
//    { employee_id: "E_01", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
//    { employee_id: "E_01", date: "2025-06-29", login_time: null, logout_time: null },
//    { employee_id: "E_01", date: "2025-06-28", login_time: "10:00 AM", logout_time: "08:00 PM" },
//    { employee_id: "E_01", date: "2025-06-27", login_time: "10:00 AM", logout_time: "08:00 PM" },
//    { employee_id: "E_01", date: "2025-06-26", login_time: null, logout_time: null },
//    { employee_id: "E_01", date: "2025-06-25", login_time: "10:00 AM", logout_time: "08:00 PM" },
//    { employee_id: "E_01", date: "2025-06-24", login_time: "10:00 AM", logout_time: "08:00 PM" },
//    { employee_id: "E_01", date: "2025-06-23", login_time: "10:00 AM", logout_time: "07:00 PM" },
//];
//const rawPieData = [
//    { EmployeeId: "ACS000001", Date: "11", Month: "Aug", Year: "2025", Working_hour: 8.3, Break_hour: 1.7 },
//    { EmployeeId: "ACS000001", Date: "12", Month: "Aug", Year: "2025", Working_hour: 8.4, Break_hour: 1.6 },
//    { EmployeeId: "ACS000001", Date: "13", Month: "Aug", Year: "2025", Working_hour: 8.2, Break_hour: 1.8 },
//    { EmployeeId: "ACS000001", Date: "14", Month: "Aug", Year: "2025", Working_hour: 9.0, Break_hour: 1.0 },
//    { EmployeeId: "ACS000001", Date: "15", Month: "Aug", Year: "2025", Working_hour: 8.0, Break_hour: 2.0 },
//];
//const barChartData = [
//    { EmployeeId: "ACS000001", Date: "11", Month: "Aug", Year: "2025", Working_hour: 8.3, Break_hour: 1.7 },
//    { EmployeeId: "ACS000001", Date: "12", Month: "Aug", Year: "2025", Working_hour: 8.4, Break_hour: 1.6 },
//    { EmployeeId: "ACS000001", Date: "13", Month: "Aug", Year: "2025", Working_hour: 8.2, Break_hour: 1.8 },
//    { EmployeeId: "ACS000001", Date: "14", Month: "Aug", Year: "2025", Working_hour: 9.0, Break_hour: 1.0 },
//    { EmployeeId: "ACS000001", Date: "15", Month: "Aug", Year: "2025", Working_hour: 8.0, Break_hour: 2.0 },
//];
//const Data = [
//    { EmployeeId: "ACS000001", Date: "11", Month: "Aug", Year: "2025", Start_time: "10:00", End_time: "20:00", Break_hour: [{ Time: "13:00 - 14:00", hour: 1.0 }, { Time: "16:30 - 17:00", hours: 0.5 }, { Time: "18:40 - 19:00", hours: 0.2 }] },
//    { EmployeeId: "ACS000001", Date: "12", Month: "Aug", Year: "2025", Start_time: "10:00", End_time: "20:00", Break_hour: [{ Time: "13:00 - 14:00", hour: 1.0 }, { Time: "16:40 - 17:10", hours: 0.5 }, { Time: "19:20 - 19:40", hours: 0.2 }] },
//    { EmployeeId: "ACS000001", Date: "13", Month: "Aug", Year: "2025", Start_time: "10:00", End_time: "20:00", Break_hour: [{ Time: "13:00 - 14:00", hour: 1.0 }, { Time: "16:30 - 17:00", hours: 0.5 }, { Time: "19:00 - 19:20", hours: 0.2 }] },
//    { EmployeeId: "ACS000001", Date: "14", Month: "Aug", Year: "2025", Start_time: "10:00", End_time: "20:00", Break_hour: [{ Time: "13:00 - 14:00", hour: 1.0 }, { Time: "16:30 - 17:00", hours: 0.5 }, { Time: "18:40 - 18:50", hours: 0.1 }] },
//    { EmployeeId: "ACS000001", Date: "15", Month: "Aug", Year: "2025", Start_time: "10:00", End_time: "20:00", Break_hour: [{ Time: "13:00 - 14:00", hour: 1.0 }, { Time: "16:30 - 17:00", hours: 0.5 }, { Time: "17:40 - 18:00", hours: 0.2 }] },
//];

// --- Sub-Component for Hours and Schedule Bar ---
const MyComponent = ({ Data, selectedMetricDate }) => { // <--- PROP NAME CHANGED
  const [hoveredHour, setHoveredHour] = useState(null);
  const { theme } = useContext(Context);

  // Helper to get start/end hour from time string
  const getHourValue = useCallback((timeString) => {
    const [start, end] = timeString.split(' - ');
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    return {
      start: startHour + startMinute / 60,
      end: endHour + endMinute / 60
    };
  }, []);

  // Format seconds to hh mm ss
  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    let result = "";
    if (hours > 0) result += `${String(hours).padStart(2, '0')}h `;
    if (minutes > 0) result += `${String(minutes).padStart(2, '0')}m `;
    if (seconds > 0) result += `${String(seconds).padStart(2, '0')}s`;
    return result.trim() || '0s';
  };

  // Calculate metrics for selected date
  const calculateMetrics = useMemo(() => {
    if (!Data || selectedMetricDate === "All") return null; // <--- USE selectedMetricDate
    const dayData = Data.find(d => `${d.Date}-${d.Month}-${d.Year}` === selectedMetricDate); // <--- USE selectedMetricDate
    if (!dayData || !dayData.End_time || !dayData.Start_time) return null;

    const totalWorkingSeconds =
      (new Date(`2000/01/01 ${dayData.End_time}`) - new Date(`2000/01/01 ${dayData.Start_time}`)) / 1000;
    let breakSeconds = 0;
    if (dayData.Break_hour) {
      dayData.Break_hour.forEach(b => {
        const [start, end] = b.Time.split(' - ');
        breakSeconds += (new Date(`2000/01/01 ${end}`) - new Date(`2000/01/01 ${start}`)) / 1000;
      });
    }
    const productiveSeconds = totalWorkingSeconds - breakSeconds;
    const standardDaySeconds = 8 * 3600;
    const overtimeSeconds = Math.max(0, productiveSeconds - standardDaySeconds);

    return {
      totalWorkingHours: formatDuration(totalWorkingSeconds),
      productiveHours: formatDuration(productiveSeconds),
      breakHours: formatDuration(breakSeconds),
      overtime: formatDuration(overtimeSeconds)
    };
  }, [selectedMetricDate, Data]); // <--- USE selectedMetricDate
  const scaleHour = useCallback((hour) => ((hour - 10) / 10) * 100, []);
  const renderScheduleBar = useCallback(() => {
    if (!Data || selectedMetricDate === "All")
      return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className={`text-center py-4 italic ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Select a specific day to view the timeline.</motion.div>;

    const rawDay = Data.find(d => `${d.Date}-${d.Month}-${d.Year}` === selectedMetricDate);
    if (!rawDay)
      return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className={`text-gray-500 text-center py-4 italic ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>No schedule available for {selectedMetricDate}.</motion.div>;

    // Apply IST offset to schedule times
    const dayData = applyOffsetToSchedule(rawDay);
    const timePoints = new Set();
    if (dayData.Start_time) timePoints.add(dayData.Start_time);
    if (dayData.End_time) timePoints.add(dayData.End_time);
    if (dayData.Break_hour)
      dayData.Break_hour.forEach(b => {
        if (b.Time) {
          const [start, end] = b.Time.split(' - ');
          if (start) timePoints.add(start);
          if (end) timePoints.add(end);
        }
      });
    const sortedTimes = Array.from(timePoints).sort(
      (a, b) => new Date(`2000/01/01 ${a}`) - new Date(`2000/01/01 ${b}`)
    );
    const formatTimelineTime = (timeStr) => {
      if (!timeStr) {
        console.error("formatTimelineTime received a null or empty time string.");
        return 'Invalid Time';
      }
      const [hours, minutes] = timeStr.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      return `${formattedHours}${minutes > 0 ? `:${minutes}` : ''} ${period}`;
    };
    const calculateDuration = (startTime, endTime) =>
      (new Date(`2000/01/01 ${endTime}`) - new Date(`2000/01/01 ${startTime}`)) / (1000 * 60 * 60);
    const workingHoursSegment = {
      type: 'working',
      time: `${dayData.Start_time} - ${dayData.End_time}`,
      duration: calculateDuration(dayData.Start_time, dayData.End_time)
    };
    const breakHours = (dayData.Break_hour || []).map(h => ({
      type: 'break',
      time: h.Time,
      duration: h.hour
    }));
    const allHours = [workingHoursSegment, ...breakHours].sort(
      (a, b) => getHourValue(a.time).start - getHourValue(b.time).start
    );
    return (
      <div>
        <motion.div
          className="w-full  h-10 bg-gray-200 relative rounded-xl overflow-hidden border border-gray-300"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        >
          {allHours.map((hour, index) => {
            const { start, end } = getHourValue(hour.time);
            const leftPosition = scaleHour(start);
            const widthPercentage = scaleHour(end) - scaleHour(start);
            const colorClass = hour.type === 'working' ? 'bg-green-300' : 'bg-yellow-300';
            return (
              <motion.div
                key={index}
                className={`absolute h-full cursor-pointer transition-all duration-300 ${colorClass}`}
                style={{ left: `${leftPosition}%`, width: `${widthPercentage}%` }}
                onMouseEnter={() => setHoveredHour(hour)}
                onMouseLeave={() => setHoveredHour(null)}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              >
                {hoveredHour === hour && (
                  <div
                    className="absolute bottom-full mb-2 p-2 rounded-md shadow-lg bg-gray-800 text-white text-xs whitespace-nowrap"
                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                  >
                    <p>{hour.type === 'working' ? 'Working' : 'Break'}</p>
                    <p>Time: {hour.time}</p>
                    <p>Duration: {hour.duration.toFixed(2)} hours</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
        <div className={`flex justify-between text-xs sm:text-sm  mt-2  ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
          {sortedTimes.map((time, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
            >
              {formatTimelineTime(time)}
            </motion.span>
          ))}
        </div>
      </div>
    );
  }, [selectedMetricDate, Data, hoveredHour, getHourValue, scaleHour]); // <--- USE selectedMetricDate

  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          className="flex flex-col items-center p-2 rounded-lg bg-gray-50 border border-gray-200 shadow-sm"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center text-gray-500 mb-2">
            <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
            <span className="text-sm font-medium">Total</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-gray-800">
            {calculateMetrics?.totalWorkingHours || 'N/A'}
          </span>
        </motion.div>
        <motion.div
          className="flex flex-col items-center p-2 rounded-lg bg-green-50 border border-green-200 shadow-sm"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center text-green-700 mb-2">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-sm font-medium">Productive</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-green-800">
            {calculateMetrics?.productiveHours || 'N/A'}
          </span>
        </motion.div>
        <motion.div
          className="flex flex-col items-center p-2 rounded-lg bg-yellow-50 border border-yellow-200 shadow-sm"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center text-yellow-700 mb-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            <span className="text-sm font-medium">Break</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-yellow-800">
            {calculateMetrics?.breakHours || 'N/A'}
          </span>
        </motion.div>
        <motion.div
          className="flex flex-col items-center p-2 rounded-lg bg-blue-50 border border-blue-200 shadow-sm"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center text-blue-700 mb-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            <span className="text-sm font-medium">Overtime</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-blue-800">
            {calculateMetrics?.overtime || 'N/A'}
          </span>
        </motion.div>
      </div>
      {renderScheduleBar()}
    </motion.div>
  );
};

const ProfileAttendance = ({ theme, todayAttendance, isLoggedIn, loading }) => {
  const isDark = theme === "dark";
  const todayIso = new Date().toISOString().slice(0, 10);

  if (loading) {
    return (
      <div className="text-center p-3">
        <p className="text-sm text-indigo-400 animate-pulse">
          Loading attendance data...
        </p>
      </div>
    );
  }

  if (!todayAttendance) {
    return (
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No attendance record found for today ({todayIso}).
        </p>
      </div>
    );
  }

  const { login, logout, isPresent, mode, effectiveHours, grossHours } = todayAttendance;

  const statusClasses = (isPresent) => {
    const status = String(isPresent || "").toUpperCase();
    if (status === "TRUE" || status === "PRESENT")
      return "bg-green-100 text-green-700";
    if (status === "FALSE" || status === "ABSENT")
      return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
  };

  const containerClasses = isDark
    ? "bg-gray-800 text-white border-gray-700"
    : "bg-white border-gray-200";
  const infoCardClasses = `p-4 rounded-xl shadow-md ${isDark ? "bg-gray-700" : "bg-gray-50"
    }`;

  return (
    <div className={`p-4 rounded-2xl shadow-xl ${containerClasses}`}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses(
              isPresent
            )}`}
          >
            {String(isPresent || "N/A").toUpperCase()}
          </span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Mode: {mode || "Office"}
          </span>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-2 gap-2">
        <div className={infoCardClasses}>
          <div className="text-lg font-bold text-indigo-500">{login ? login.split(".")[0] : "N/A"}</div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
            First Login
          </div>
        </div>
        <div className={infoCardClasses}>
          <div className="text-lg font-bold text-indigo-500">{logout ? logout.split(".")[0] : "N/A"}</div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
            Last Logout
          </div>
        </div>
      </div>
    </div>
  );
};
// --- Main Attendance Dashboard Component ---
const AttendancesDashboard = ({ onBack, currentUser, employeeId, startDate = null, endDate = null }) => {
  const { empID } = useParams();
  const { userData, theme } = useContext(Context);
  const id = employeeId || userData?.employeeId || "ACS00000001";
  const role = (userData?.roles?.[0] || "").toUpperCase();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState(null);
  const [showAttendanceReports, setShowAttendanceReports] = useState(false);
  const showSidebar = ["TEAM_LEAD", "HR", "MANAGER", "ADMIN"].includes(role);
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedMetricDate, setSelectedMetricDate] = useState("All");
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const isMobile = useMediaQuery('(max-width:768px)');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [mode, setMode] = useState("office");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [grossHours, setGrossHours] = useState(0);
  const [effectiveHours, setEffectiveHours] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loadingTodayAttendance, setLoadingTodayAttendance] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(() => Date.now());
  const [showModeConfirm, setShowModeConfirm] = useState(false);
  const [isLogoutConfirmed, setIsLogoutConfirmed] = useState(false);
  const [currentAttendanceId, setCurrentAttendanceId] = useState(() => {
    try {
      return localStorage.getItem('currentAttendanceId') || null;
    } catch (e) {
      return null;
    }
  });
  const [sortBy, setSortBy] = useState('Recantly Added');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const toIso = (d) => d?.toISOString?.().slice(0, 10) || d;
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayIso = new Date().toISOString().slice(0, 10);
  const adjustTimeString = (timeString, dateRef, minutesToAdd) => {
    if (timeString === "N/A" || !timeString) return timeString;
    return timeString;
  };
  const QUERY_TODAY_ATTENDANCE = `
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
const fetchTodayAttendance = useCallback(async () => {
  setLoadingTodayAttendance(true);
  try {
    const s = todayIso;
    const e = todayIso;
    const variables = { employeeId: id, startDate: s, endDate: e };
    const data = await graphqlRequest(QUERY_TODAY_ATTENDANCE, variables);
    const items = data?.getDetailsBetweenDates || [];
    const item = items[0] || null;

    setTodayAttendance(item);
    setLastFetchedAt(Date.now());

    // Clear any existing intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (clockTimerRef.current) {
      clearInterval(clockTimerRef.current);
      clockTimerRef.current = null;
    }

    if (item) {
      const isLoggedIn = !!(item.login && !item.logout);
      setIsLoggedIn(isLoggedIn);

      const effMin = parseEffectiveHours(item.effectiveHours ?? item.effectiveHour) || 0;

      // Maintain one clock for current time
      clockTimerRef.current = setInterval(() => setCurrentTime(new Date()), 1000);

      if (isLoggedIn) {
        // Only this timer updates gross hours
        const [loginHours, loginMinutes, loginSeconds] = item.login.split(":");
        const loginDate = new Date();
        loginDate.setHours(loginHours, loginMinutes, parseFloat(loginSeconds), 0);
        clearInterval(clockTimerRef.current);
        clockTimerRef.current = null;
        intervalRef.current = setInterval(() => {
          // const now = new Date();
          const diffInSeconds = (lastFetchedAt - loginDate) / 1000;

          if (!isNaN(diffInSeconds) && diffInSeconds >= 0) {
            setGrossHours(diffInSeconds);
            setEffectiveHours(effMin * 60);
          }
          setCurrentTime(new Date());
        }, 1000);
      } else if (item.logout) {
        // Static calculation for logged-out sessions
        const [loginHours, loginMinutes, loginSeconds] = item.login.split(":");
        const [logoutHours, logoutMinutes, logoutSeconds] = item.logout.split(":");
        const loginDate = new Date();
        const logoutDate = new Date();

        loginDate.setHours(loginHours, loginMinutes, parseFloat(loginSeconds), 0);
        logoutDate.setHours(logoutHours, logoutMinutes, parseFloat(logoutSeconds), 0);

        const diffInSeconds = (logoutDate - loginDate) / 1000;
        if (!isNaN(diffInSeconds) && diffInSeconds >= 0) {
          setGrossHours(diffInSeconds);
          setEffectiveHours(effMin * 60);
        }
      }
    }
  } catch (err) {
    console.error("Error fetching attendance:", err);
  } finally {
    setLoadingTodayAttendance(false);
  }
}, [id, todayIso]);


  async function getDynamicDeviceData(mode = "") {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const device = navigator.userAgent;
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      return {
        timeZone,
        mode,
        latitude,
        longitude,
        device
      };

    } catch (error) {
      console.error("Error fetching location or device info:", error);
      return {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        mode,
        latitude: null,
        longitude: null,
        device: navigator.userAgent
      };
    }
  }

  useEffect(() => {
    const userPayload = JSON.parse(localStorage.getItem("emppayload"));
    const userImage = localStorage.getItem("loggedInUserImage");
    
    const initials = (userPayload?.displayName || "  ")
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2);

    setLoggedInUserProfile({
      image: userImage,
      initials: initials,
    });
  }, [userData]);

  useEffect(() => {
    fetchTodayAttendance();
    console.log(["TEAM_LEAD", "HR", "MANAGER", "ADMIN"].includes(role));
    // --- CLOCK TIMER ---

    const employeeId = userData?.employeeId;
    const attendanceId = currentAttendanceId;

    // === Helper Functions ===
    const handleDisconnect = async (useBeacon = false) => {
      if (!isLoggedIn || !employeeId || !attendanceId) return;
      const data = await getDynamicDeviceData(mode);
      const apiUrl = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${employeeId}/${attendanceId}/disconnected`;

      try {
        const payload = JSON.stringify({ timestamp: new Date().toISOString() });

        if (useBeacon && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon(apiUrl, blob);
          console.log("Disconnected (beacon) sent:", apiUrl);
        } else {
          await fetch(apiUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: data,
            keepalive: true,
          });
          console.log("Disconnected (fetch) done:", apiUrl);
        }
      } catch (err) {
        console.error("Disconnected API call failed:", err);
      }
    };
    const handleConnect = async () => {
      if (!isLoggedIn || !employeeId || !attendanceId) return;

      const data = await getDynamicDeviceData(mode);
      const apiUrl = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${employeeId}/${attendanceId}/connected`;

      try {
        const resp = await fetch(apiUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!resp.ok) {
          console.warn("Connected endpoint returned non-OK:", resp.status);
        } else {
          console.log("Connected endpoint hit successfully:", apiUrl);
        }
      } catch (err) {
        console.error("Connected API call failed:", err);
      }
    };

    // === Manual Disconnect (❌ Click) ===
    const handleManualDisconnect = async () => {
      if (!isLoggedIn) return;
      const confirmDisconnect = window.confirm("You are being disconnected. Are you sure?");
      if (confirmDisconnect) {
        await handleDisconnect(false);
        alert("You have been disconnected.");
      }
    };

    // === Only handle unload/shutdown ===
    const onBeforeUnload = (e) => {
      if (isLoggedIn) handleDisconnect(true);
    };

    // === When user comes back (window regains focus) ===
    const handleFocus = () => {
      if (isLoggedIn) handleConnect();
    };

    // --- Event listeners ---
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("focus", handleFocus); // 👈 connect on window focus

    // Expose manual disconnect handler
    window.triggerManualDisconnect = handleManualDisconnect;

    return () => {
      clearInterval(clockTimerRef.current);
      clockTimerRef.current = null;
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isLoggedIn, startTime, currentAttendanceId]);


  // Depend on currentAttendanceId
  const updateProfileField = async (field, value) => {
    try {
      if (!userData?.employeeId) return null;
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const url = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${userData?.employeeId}/profile/${day}/${month}/${year}`;
      const resp = await dashboardApi.put(url, { [field]: value }, { headers: { 'Content-Type': 'application/json' } });
      return resp?.data ?? null;
    } catch (err) {
      console.error(`Error updating profile field "${field}":`, err);
      return null;
    }
  };
  const handleModeChange = async (newMode) => {
    try {
      setShowModeConfirm(false);
      const data = await getDynamicDeviceData(newMode);
      const apiUrl = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${userData?.employeeId}/clock-in`;

      await dashboardApi.put(apiUrl, data, {
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      });

      await updateProfileField("mode", newMode);
      setMode(newMode);
    } catch (err) {
      console.error("Failed to change mode:", err);
      alert("Unable to change mode. Please try again.");
    }
  };

  const handleRefresh = async () => {
    await fetchTodayAttendance();
  };
  const handleLogin = async () => {
    try {
      const clock = await getDynamicDeviceData(mode);
      const apiUrl = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${id}/clock-in`;

      // Retrieve token safely
      const token = (() => {
        try {
          return localStorage.getItem('accessToken');
        } catch {
          return null;
        }
      })();

      // Prepare headers
      const headers = {
        "Accept": "*/*",
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      // Send request
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers,
        body: JSON.stringify(clock),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Clock-in API error:", errText);
        alert(`Error: ${response.status} - ${errText}`);
        throw new Error(`${response.status}`);
      }

      const data = await response.json().catch(() => null);
      console.log("Clock-in successful:", data);

      // ✅ Store attendance ID if present
      const attendanceIdFromResponse =
        data?.attendanceId || data?.id || data?.attendance_id;
      if (attendanceIdFromResponse) {
        setCurrentAttendanceId(attendanceIdFromResponse);
      } else {
        console.warn("Attendance ID not received in clock-in response.");
      }

      // ✅ Store returned token if present
      const returnedToken = data?.accessToken || data?.token || data?.jwt;
      if (returnedToken) {
        try {
          localStorage.setItem("accessToken", returnedToken);
          console.log("Stored accessToken from server");
        } catch (e) {
          console.warn("Failed to store accessToken:", e);
        }
      }
    } catch (error) {
      console.error("Clock-in failed:", error);
      setIsLoggedIn(false);
      setStartTime(null);
    }

    await fetchTodayAttendance();
  };

  const handleShowAttendances = () => {
    setSidebarView('attendances');
    setIsSidebarOpen(false);
  };
  const handleShowAttendance = () => {
    setSidebarView('attendance');
    setIsSidebarOpen(false);
  };
  const handleShowAttendanceReport = () => {
    setSidebarView('attendanceReport');
    setIsSidebarOpen(false);
  };
  const handleLogout = () => { setIsLogoutConfirmed(true); };
  const handleConfirmLogout = async () => {
    const now = new Date();
    const clockOutData = await getDynamicDeviceData(mode);

    try {
      const apiUrl = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${userData?.employeeId}/clock-out`;

      // ✅ Retrieve token safely
      const token = (() => {
        try {
          return localStorage.getItem("accessToken");
        } catch {
          return null;
        }
      })();

      // ✅ Build headers
      const headers = {
        "Content-Type": "application/json",
        Accept: "*/*",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      // ✅ Send clock-out data
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers,
        body: JSON.stringify(clockOutData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Clock-out API call failed:", response.status, errorText);
        alert(
          "Failed to record clock-out time on the server. Please try again or contact support."
        );
      } else {
        console.log("Clock-out recorded successfully on server");
      }
    } catch (error) {
      console.error("Error during clock-out API call:", error);
      alert(
        "A network error occurred while clocking out. You have been logged out locally, but the server record might be missing."
      );
    } finally {
      // ✅ Clear attendance session data
      setCurrentAttendanceId(null);
      localStorage.removeItem(attendanceStorageKey);

      setIsLoggedIn(false);
      setIsLogoutConfirmed(false);
      setEndTime(now);

      // ✅ Update frontend table data
      setRawTableData((prev) => {
        if (prev.length === 0) return prev;

        const lastIndex = prev.length - 1;
        const lastRecord = prev[lastIndex];

        if (
          lastRecord.date === now.toLocaleDateString() &&
          !lastRecord.logout_time
        ) {
          const shiftedLoginStr = addMinutesToTimeString(lastRecord.login_time);
          const loginDate = new Date(`2000-01-01T${shiftedLoginStr}:00`);
          const logoutDate = now;
          const loginHours = (logoutDate - loginDate) / (1000 * 60 * 60);

          const updatedRecord = {
            ...lastRecord,
            logout_time: formatClockTime(now),
            login_hours: loginHours > 0 ? loginHours : 0,
            barWidth: `${(loginHours / STANDARD_WORKDAY_HOURS) * 100}%`,
          };

          return [...prev.slice(0, lastIndex), updatedRecord];
        }

        return prev;
      });

      // ✅ Refresh today’s data
      fetchTodayAttendance();
    }
  };


  const handleCancel = () => { setIsLogoutConfirmed(false); };

  const [barChartData, setBarChartData] = useState([]);
  const [rawPieData, setRawPieData] = useState([]);
  const [dates, setDates] = useState([]);
  const [Data, setData] = useState([])
  const [cardData, setCardData] = useState([]);
  const [startIndex, setStartIndex] = useState(0)
  //const ATTENDANCE_ID_STORAGE_KEY = 'currentAttendanceId';
  const attendanceStorageKey = `attendanceId_${id}`;
  //const CLOCKIN_TIME_STORAGE_KEY = `attendanceClockInTime_${userData?.employeeId}`;
  useEffect(() => {
    if (!dates || dates.length <= 1) return;
    if (selectedMetricDate && selectedMetricDate !== "All") return;

    const firstDate = dates.find(d => d !== "All");
    if (!firstDate) return;

    const pieItem = rawPieData.find(item => item.Date === firstDate);
    const barItem = barChartData.find(item => item.Date === firstDate);
    const dateToSet = pieItem || barItem ? `${(pieItem || barItem).Date}-${(pieItem || barItem).Month}-${(pieItem || barItem).Year}` : firstDate;
    setSelectedMetricDate(dateToSet);
    const idx = dates.indexOf(firstDate);
    if (idx >= 0) {
      const pageStart = Math.floor(idx / datesPerPage) * datesPerPage;
      setStartIndex(pageStart);
    }
  }, [dates, rawPieData, barChartData]);
  // 1. Bar Chart Data
  useEffect(() => {
    const url = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${userData?.employeeId}/bar-chart?page=0&size=5`;
    dashboardApi.get(url).then(response => {
      const formatted = response.data.map(item => ({ Date: item.date, Month: item.month, Year: item.year, Work_Hours: item.working_hour, Break_Hours: item.break_hour }));
      setBarChartData(formatted);
      const dates = ["All", ...formatted.map(item => item.Date)];
      setDates(dates);
    }).catch(error => console.error('Error fetching bar chart data:', error));
  }, [empID]);

  // 2. Attendance Table Data
  useEffect(() => {
    const url = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${userData?.employeeId}/attendance?page=0&size=${rowsPerPageOptions[rowsPerPageOptions.length - 1]}`;
    dashboardApi.get(url).then(response => {
      setRawTableData(response.data);
      const dates = ["All", ...response.map(item => item.Date)];
      setDates(dates);
    }).catch(error => console.error('Error fetching attendance data:', error));
  }, [empID]);

  // 3. Pie Chart Data
  useEffect(() => {
    const url = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${userData?.employeeId}/pie-chart`;
    dashboardApi.get(url).then(response => {
      const formatted = response.data.map(item => ({ Date: item.date, Month: item.month, Year: item.year, Working_hour: item.working_hour, Break_hour: item.break_hour, EmployeeId: item.employeeId }));
      setRawPieData(formatted);
      const dates = ["All", ...formatted.map(item => item.Date)];
      setDates(dates);
    }).catch(error => console.error('Error fetching pie chart data:', error));
  }, [empID]);

  // 4. Line Graph/Schedule Bar Data (Data)
  useEffect(() => {
    const url = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${userData?.employeeId}/line-graph?page=0&size=5`;
    dashboardApi.get(url).then(response => {
      const formatted = response.data.map(item => ({ EmployeeId: item.employeeId, Date: item.date, Month: item.month, Year: item.year, Start_time: item.start_time, End_time: item.end_time, Break_hour: item.breaks.map(b => ({ Time: b.time, hour: b.hour })) }));
      setData(formatted);
      const dates = ["All", ...formatted.map(item => item.Date)];
      setDates(dates);
    }).catch(error => console.error('Error fetching line graph data:', error));
  }, [empID]);

  const formatSecondsToHHMMSS = (secs) => {
    const s = Math.max(0, Math.floor(Number(secs) || 0));
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };
  const elapsedTimeSeconds = isLoggedIn
    ? Math.floor(((currentTime.getTime() - lastFetchedAt) / 1000))
    : 0;
  const displayedEffectiveSeconds = isLoggedIn
    ? (Number(effectiveHours) || 0) + elapsedTimeSeconds
    : (Number(effectiveHours) || 0);

  const displayedGrossSeconds = isLoggedIn
    ? (Number(grossHours) || 0) + elapsedTimeSeconds
    : (Number(grossHours) || 0);

  const grossHoursFormatted = formatSecondsToHHMMSS(displayedGrossSeconds);
  const effectiveHoursFormatted = formatSecondsToHHMMSS(displayedEffectiveSeconds);
  const buildRange = () => {
    const today = new Date();
    let year = today.getFullYear();
    let monthIndex = today.getMonth();
    let startISO = startDateFilter || "";
    let endISO = endDateFilter || "";
    const clampToToday = (iso) => {
      if (!iso) return "";
      try {
        if (iso > todayISO) return todayISO;
        return iso;
      } catch {
        return "";
      }
    };

    startISO = clampToToday(startISO);
    endISO = clampToToday(endISO);

    if (startISO && !endISO) {
      endISO = todayISO;
    }
    if (!startISO && endISO) {
      const parts = endISO.split('-');
      const startOfMonth = new Date(parts[0], Number(parts[1]) - 1, 1);
      startISO = startOfMonth.toISOString().slice(0, 10);
    }
    if (!startISO && !endISO) {
      if (selectedMonth) {
        const m = new Date(`${selectedMonth} 1, ${year}`);
        if (!isNaN(m)) monthIndex = m.getMonth();
      }
      const start = new Date(year, monthIndex, 1);
      const end = new Date(year, monthIndex + 1, 0);
      startISO = start.toISOString().slice(0, 10);
      endISO = end.toISOString().slice(0, 10);
    }
    if (!startISO) startISO = endISO || todayISO;
    if (!endISO) endISO = startISO || todayISO;
    if (startISO > endISO) {
      const tmp = startISO; startISO = endISO; endISO = tmp;
    }
    if (endISO > todayISO) endISO = todayISO;
    if (startISO > todayISO) startISO = todayISO;

    return { startISO, endISO };
  };
  const datesPerPage = 5;
  const [loggedInUserProfile, setLoggedInUserProfile] = useState({
    image: null,
    initials: "  "
  });
  const intervalRef = useRef(null);
  const clockTimerRef = useRef(null);

  const [rawTableData, setRawTableData] = useState([]);

  const sortOptions = ["Recently added", "Ascending", "Descending", "Last Month", "Last 7 Days"];
  const rowsPerPageOptions = [10, 25, 50, 100];
  const MONTHS = ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  const textColor = theme === 'dark' ? "#FFFFFF" : "#000000";
  const [loggedPermissiondata, setLoggedPermissionData] = useState([]);
  const [matchedArray, setMatchedArray] = useState(null);
  const LoggedUserRole = userData?.roles[0] ? `ROLE_${userData?.roles[0]}` : null
  useEffect(() => {
    let fetchedData = async () => {
      let response = await authApi.get(`role-access/${LoggedUserRole}`);
      console.log("from Projects :", response.data);
      setLoggedPermissionData(response.data);
    }
    fetchedData();
  }, [])

  useEffect(() => {
    if (loggedPermissiondata) {
      setMatchedArray(loggedPermissiondata?.permissions)
    }
  }, [loggedPermissiondata]);
  //console.log(matchedArray);

  const [hasAccess, setHasAccess] = useState([])
  useEffect(() => {
    setHasAccess(userData?.permissions)
  }, [userData])

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const employeeId = userData?.employeeId || "ACS00000001";
        const { startISO, endISO } = buildRange();
        const variables = { employeeId, startDate: startISO, endDate: endISO };
        const payload = await graphqlRequest(DETAILS_QUERY, variables);
        if (cancelled) return;
        const data = payload?.getDetailsBetweenDates || [];
        const normalized = data.map((item) => {
          const dateForTime = /^\d{4}-\d{2}-\d{2}$/.test(item.date)
            ? item.date
            : (() => {
              const parts = (item.date || '').split('-');
              if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
              return new Date().toISOString().slice(0, 10);
            })();

          // more robust UTC parsing with fallbacks
          const toUtcDate = (raw) => {
            if (!raw) return null;
            const s = String(raw).trim();
            if (!s || /^(-|n\/a|null)$/i.test(s)) return null;
            if (/\d{4}-\d{2}-\d{2}T/.test(s) || /[Zz]|[+\-]\d{2}:\d{2}$/.test(s)) {
              const pd = new Date(s);
              return isNaN(pd.getTime()) ? null : pd;
            }
            const parsedByJS = new Date(s);
            if (!isNaN(parsedByJS.getTime())) return parsedByJS;
            const hhmm = tryNormalizeTo24(s);
            if (hhmm) {
              const pd = new Date(`${dateForTime}T${hhmm}:00Z`);
              return isNaN(pd.getTime()) ? null : pd;
            }
            const spaceSep = s.replace(' ', 'T');
            if (/\d{4}-\d{2}-\d{2}T/.test(spaceSep)) {
              const maybe = spaceSep.endsWith('Z') || /[+\-]\d{2}:\d{2}$/.test(spaceSep) ? new Date(spaceSep) : new Date(`${spaceSep}Z`);
              if (!isNaN(maybe.getTime())) return maybe;
            }
            return null;
          }
          const formatDateToIST = (dateObj) => {
            if (!dateObj || isNaN(dateObj.getTime())) return 'N/A';
            return new Intl.DateTimeFormat('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'Asia/Kolkata'
            }).format(dateObj);
          };

          const loginRaw = item.login ?? item.loginTime ?? null;
          const logoutRaw = item.logout ?? item.logoutTime ?? null;

          const loginUtc = loginRaw ? toUtcDate(loginRaw) : null;
          const logoutUtc = logoutRaw ? toUtcDate(logoutRaw) : null;

          // --- CHANGED: explicitly add IST offset (+5:30) to parsed UTC dates and format ---
          const shiftAndFormat = (utcDate, rawValue) => {
            if (!rawValue) return 'N/A';
            try {
              // try using already-parsed UTC date if available
              let base = (utcDate && !isNaN(utcDate.getTime())) ? utcDate : null;

              // fallback: if raw is HH:mm build a UTC instant for dateForTime
              if (!base) {
                const hh = tryNormalizeTo24(String(rawValue));
                if (hh) {
                  base = new Date(`${dateForTime}T${hh}:00Z`);
                }
              }

              // final parse fallback
              if (!base) {
                const maybe = new Date(String(rawValue));
                if (!isNaN(maybe.getTime())) base = maybe;
              }

              if (!base || isNaN(base.getTime())) return String(rawValue);

              // add IST offset (+5:30) explicitly
              const istMs = base.getTime() + IST_OFFSET_MINUTES * 60 * 1000;
              const istDate = new Date(istMs);

              // Format the shifted instant as a 12-hour India-style time
              return new Intl.DateTimeFormat('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'UTC' // we've already shifted, present as UTC to avoid double TZ conversion
              }).format(istDate);
            } catch {
              return String(rawValue);
            }
          };


          const loginDisplay = shiftAndFormat(loginUtc, loginRaw);
          const logoutDisplay = shiftAndFormat(logoutUtc, logoutRaw);

          // compute duration using the parsed UTC Date objects (difference is timezone-safe)
          let totalDurationMinutes = 0;
          if (loginUtc && logoutUtc && !isNaN(loginUtc.getTime()) && !isNaN(logoutUtc.getTime())) {
            totalDurationMinutes = Math.max(0, Math.floor((logoutUtc.getTime() - loginUtc.getTime()) / (1000 * 60)));
          } else {
            const eff = parseEffectiveHours(item.effectiveHours || '');
            const gross = parseEffectiveHours(item.grossHours || '');
            totalDurationMinutes = eff || gross || 0;
          }
          const effectiveMinutes = parseEffectiveHours(item.effectiveHours || '');
          const grossMinutes = parseEffectiveHours(item.grossHours || '');

          return {
            ...item,
            date: item.date,
            loginDisplay,
            logoutDisplay,
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
        console.error("Attendance fetch failed:", err);
        // Prefer GraphQL-level messages if present
        const graphqlMessage = err?.graphql?.length ? err.graphql.map(g => g.message).join('; ') : null;
        const serverMessage = err?.response?.data?.message || err?.message;
        if (err?.response?.status === 401) {
          setError('Unauthorized (401). Please login to continue.');
        } else {
          setError(graphqlMessage || serverMessage || 'Failed to load attendance');
        }
        setAttendanceRecords([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [selectedMonth, userData, startDateFilter, endDateFilter]);

  const maxHoursInSeconds = 8 * 3600;
  const progress = (grossHours / maxHoursInSeconds) * 100;
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
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'Recantly Added':
      default:
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
    }

    return result;
  }, [attendanceRecords, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const pageItems = filteredSorted.slice((page - 1) * pageSize, page * pageSize);


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
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const filteredPieData = useMemo(() => {
    const dataToProcess = selectedDate === "All" ? rawPieData : rawPieData.filter((d) => `${d.Date}-${d.Month}-${d.Year}` === selectedDate);
    const totalWorking = dataToProcess.reduce((sum, row) => sum + row.Working_hour, 0);
    const totalBreak = dataToProcess.reduce((sum, row) => sum + row.Break_hour, 0);
    return [{ name: "Working Hours", value: totalWorking }, { name: "Break Hours", value: totalBreak }];
  }, [selectedDate, rawPieData]);

  const filteredBarChartData = useMemo(() => {
    return selectedDate === "All" ? barChartData : barChartData.filter((d) => `${d.Date}-${d.Month}-${d.Year}` === selectedDate);
  }, [selectedDate, barChartData]);

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <IoPersonOutline className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
            </div>
            <h2 className={`text-lg sm:text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Loading Employee Attendance</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Discovering your colleagues...</p>
          </div>
        </div>
      </div>
    );

  }
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} font-sans text-gray-800 relative`}>
      {/* Sidebar */}
      <AnimatePresence>
        {(matchedArray || []).includes("VIEW_ATTENDANCE_REPORTS") && !isSidebarOpen && (
          <motion.button onClick={() => setIsSidebarOpen(true)} className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-l-lg shadow-lg z-50 hover:bg-indigo-700 transition-colors"
            aria-label="Open Sidebar"
          >
            <ChevronLeft />
          </motion.button>
        )}
        {showSidebar && isSidebarOpen && (
          <motion.div
            key="sidebar"
            className={`fixed inset-y-0 right-0 w-80 ${theme === 'dark' ? 'bg-gray-900' : 'bg-stone-100'} shadow-xl z-40 p-4 flex flex-col`}
          >
            <motion.h3
              className={`text-lg font-bold mt-20  cursor-pointer mb-1 p-2 rounded-md  hover:bg-blue-100 transition-colors duration-200 ${theme === 'dark' ? 'text-white hover:bg-gray-900' : 'text-gray-800'}`}
              onClick={handleShowAttendance}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LiaFileAlt className="w-5 h-5 inline-block mr-2" />Total Employee Attendance
            </motion.h3>
            <motion.h3
              className={`text-lg font-bold   cursor-pointer mb-4 p-2 rounded-md  hover:bg-blue-100 transition-colors duration-200 ${theme === 'dark' ? 'text-white hover:bg-gray-900' : 'text-gray-800'}`}
              onClick={handleShowAttendanceReport}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChartBarIcon className="w-5 h-5 inline-block mr-2" /> Attendance Reports
            </motion.h3>

            <button onClick={() => setIsSidebarOpen(false)} className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors z-50"
              aria-label="Close Sidebar">
              <ChevronRight />
            </button>
          </motion.div>

        )}
      </AnimatePresence>
      {/* Main Content Wrapper */}
      <div className={`flex-1 transition-all duration-300 p-4 sm:p-6 lg:p-8`}>

        {isSidebarOpen && <div className="md:hidden fixed inset-0 bg-black opacity-50 z-30" onClick={() => setIsSidebarOpen(false)}></div>}
        <main className={`p-2 sm:p-2 lg:p-4 ${isSidebarOpen && showSidebar ? 'filter blur-sm' : ''}`}>
          <header className="flex items-center justify-between mb-1">
            <motion.h1
              className={`text-2xl sm:text-4xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {showAttendanceReports ? "Attendance Reports" : ""}

            </motion.h1>

          </header>
          {/* Conditional Rendering of Main Content */}
          <AnimatePresence mode="wait">
            {sidebarView === 'attendance' && (
              <motion.div
                key="attendance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AttendanceTable onBack={() => setSidebarView(null)} />
              </motion.div>
            )}
            {sidebarView === 'attendanceReport' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className=""
              >
                <AttendanceReports rawTableData={rawTableData} role={role.toLowerCase()} onBack={() => setSidebarView(null)} />

              </motion.div>
            )}
            {sidebarView === null && (
              <motion.div
                key="dashboard"
              >
                <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-3 mb-2">
                  <motion.div
                    className="p-2 flex items-center justify-center w-full"
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className={`rounded-3xl shadow-2xl p-4 w-full max-w-lg md:max-w-3xl transition-all hover:shadow-3xl duration-300 relative overflow-hidden 
                ${theme === 'dark' ? 'bg-gray-800 border border-indigo-500/50' : 'bg-white border border-gray-200'}`}>

                      <div className="absolute -top-12 -right-12 w-50 h-50 rounded-full bg-gradient-to-tr from-purple-100 via-pink-200 to-red-300 opacity-30 z-0 animate-pulse-slow"></div>
                      <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-gradient-to-tr from-green-100 via-blue-200 to-purple-300 opacity-30 z-0 animate-pulse-slow-reverse"></div>
                      <div className="flex flex-row items-start justify-between mb-2 relative z-10">
                        <div className="flex items-start space-x-3 md:space-x-4">
                          <div className="relative mt-1"> {/* Adjusted margin top */}
                            <motion.div
                              className={`w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-4 flex items-center justify-center shadow-xl cursor-pointer 
                                ${theme === 'dark' ? 'border-gray-700 bg-gray-600' : 'border-white bg-indigo-500'}`}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              {loggedInUserProfile.image ? (
                                <img
                                  src={loggedInUserProfile.image}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span
                                  className={`text-lg md:text-xl font-bold ${theme === "dark" ? "text-white" : "text-white" // White text for contrast
                                    } flex items-center justify-center w-full h-full`}
                                >
                                  {loggedInUserProfile.initials}
                                </span>
                              )}
                            </motion.div>
                            <motion.div
                              className={`absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border-2 
                                ${theme === 'dark' ? 'border-gray-800' : 'border-white'} transition-colors 
                                ${mode === "office" ? "bg-blue-500" : "bg-green-500"}`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            >
                              {mode === "office" ? (
                                <FaBuilding className="text-white text-xs" />
                              ) : (
                                <FaHome className="text-white text-xs" />
                              )}
                            </motion.div>
                          </div>

                          {/* Welcome Text */}
                          <motion.div
                            className="text-start mt-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                          >
                            <p className={`text-xs md:text-sm font-semibold mb-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Welcome Back!
                            </p>
                            <h2 className={`text-lg md:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {`${userData?.fullName || 'Employee'}`} 👋
                            </h2>
                          </motion.div>
                        </div>
                        <div className="flex space-x-1 md:space-x-2 mt-1">
                          {/* Refresh Button - Smaller icon/padding on mobile */}
                          <motion.button
                            onClick={handleRefresh}
                            className={`p-2 rounded-full hover:shadow-lg flex items-center justify-center text-sm font-medium transition-transform duration-300 
                            ${theme === 'dark' ? 'bg-gray-700 text-indigo-400 border border-gray-600' : 'bg-gray-100 text-indigo-600 border border-gray-300'}`}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Refresh Timer"
                          >
                            <motion.svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} initial={{ rotate: 0 }}
                              animate={{ rotate: showModeConfirm ? 180 : 0 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.001 8.001 0 01-15.357-2m15.357 2H15" />
                            </motion.svg>
                            <span className="hidden sm:inline ml-1 text-xs">Refresh</span> {/* Smaller text on desktop */}
                          </motion.button>

                          {/* Mode Toggle Button - Smaller text/padding on mobile */}
                          <div className="relative">
                            <motion.button
                              onClick={() => setShowModeConfirm(!showModeConfirm)}
                              className={`px-2 py-1.5 md:px-4 md:py-2 rounded-full flex items-center justify-center gap-1 md:gap-2 text-sm font-medium shadow-md transition-transform duration-300 
                                ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 border border-indigo-300'}`}
                              whileTap={{ scale: 0.9 }}
                            >
                              {/* Mode icon */}
                              {mode === "office" ? (
                                <motion.div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-500 flex items-center justify-center" whileHover={{ rotate: 360 }}>
                                  <FaBuilding className="text-white text-xs" />
                                </motion.div>
                              ) : (
                                <motion.div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-green-500 flex items-center justify-center" whileHover={{ rotate: 360 }}>
                                  <FaHome className="text-white text-xs" />
                                </motion.div>
                              )}
                              <span className="capitalize hidden sm:inline text-sm">{mode}</span> {/* Kept hidden on mobile, smaller on desktop */}
                              <motion.svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 md:h-4 md:w-4 ml-0.5 transition-transform duration-200 hidden sm:block"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                initial={{ rotate: 0 }}
                                animate={{ rotate: showModeConfirm ? 180 : 0 }}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </motion.svg>
                            </motion.button>
                            <AnimatePresence>
                              {showModeConfirm && (
                                <motion.div
                                  className={`absolute top-full right-0 mt-2 w-48 p-3 border rounded-xl shadow-xl z-30 
                                        ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
<<<<<<< HEAD
                                    <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-medium text-xs mb-3 text-center`}>
                                        Switch to {mode === "office" ? "Remote" : "Office"} mode?
                                    </p>
                                    <div className="flex space-x-2">
                                        <motion.button
                                            onClick={() => handleModeChange(mode === "office" ? "home" : "office")}
                                            className="flex-1 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-colors font-semibold text-sm"
                                        >
                                            Confirm
                                        </motion.button>
                                        <motion.button onClick={() => setShowModeConfirm(false)} className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm" >Cancel</motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-1`}>
              <ProfileAttendance/>
</div>  
            <div className="relative my-2 w-full flex justify-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true"><motion.div className={`w-full border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} /></div>
                <span className={`px-2 text-xs font-semibold z-10 ${theme === 'dark' ? 'bg-gray-800 text-indigo-400' : 'bg-white text-indigo-600'}`}>CURRENT CLOCK</span>
            </div>
            <div className="w-full flex flex-col items-center text-center mb-4 relative z-10">
                <div className="mb-4">
                    <motion.div className="flex items-center justify-center gap-2 text-indigo-600 font-medium mb-1" ><ClockIcon className="w-5 h-5 text-indigo-500" /><span className='text-sm'>Current Time</span></motion.div>
                    <motion.p className={`text-3xl md:text-3xl lg:text-3xl font-extrabold tracking-tight mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} >{formatClockTime(currentTime)}</motion.p>
                    <motion.p className={`text-sm md:text-base font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} >     {currentTime.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} </motion.p>
                </div>
            {loadingTodayAttendance ? (
                <p className="text-sm text-indigo-400 animate-pulse">Fetching today's hours...</p>
            ) : (
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs md:max-w-md">
                    <motion.div className={`rounded-xl p-2 shadow-sm text-center flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-700 text-white border border-indigo-500/50' : 'bg-indigo-50 border border-indigo-200'}`} transition={{ type: "spring", stiffness: 300 }} >
                        <div className="text-xl font-bold text-indigo-500">{effectiveHoursFormatted}</div>
                        <div className="text-xs font-semibold mt-1 text-gray-500">Effective Hours</div>
                    </motion.div>
                    <motion.div className={`rounded-xl p-2 shadow-sm text-center flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-700 text-white border border-pink-500/50' : 'bg-pink-50 border border-pink-200'}`} transition={{ type: "spring", stiffness: 300 }} >
                        <div className="text-xl font-bold text-pink-500">{grossHoursFormatted}</div>
                        <div className="text-xs font-semibold mt-1 text-gray-500">Gross Hours</div>
                    </motion.div>
                </div> 
            )}
            </div>
            <div className="w-full flex justify-center mt-4 relative z-10">
                {!isLoggedIn ? (
                    <motion.button onClick={handleLogin} className="flex items-center justify-center w-36 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-green-600 hover:to-green-700 font-bold text-lg" ><ClockIcon className="w-5 h-5 mr-1.5" /> Clock In</motion.button>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-sm"> 
                        <AnimatePresence mode="wait">
                            {isLogoutConfirmed ? (
                                <>
                                    <motion.button key="confirm" onClick={handleConfirmLogout} className="flex-1 items-center justify-center py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold text-sm" >     Confirm Logout </motion.button>
                                    <motion.button key="cancel" onClick={handleCancel} className={`flex-1 items-center justify-center py-1 rounded-xl shadow-sm transition-all duration-200 font-medium text-sm      ${theme === 'dark' ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}     >     Cancel </motion.button>
                                </>
                            ) : (
                                <motion.button key="logout" onClick={handleLogout} className="flex items-center justify-center w-36 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-red-600 hover:to-red-700 font-bold text-lg" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} whileTap={{ scale: 0.95 }}><ClockIcon className="w-5 h-5 mr-1.5" /> Clock Out</motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    </motion.div>
                        <App attendanceRecords={attendanceRecords} />
                    </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <motion.section className={`rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col justify-between min-h-[450px] ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-stone-100 text-gray-800'}`} >
                                    <h2 className={`text-xl sm:text-2xl font-bold  mb-4 text-center ${theme === 'dark' ? 'bg-gradient-to-br from-blue-200 to-blue-600 bg-clip-text text-transparent' : 'text-gray-800'}`}><ChartPieIcon className="w-6 h-6 inline-block mr-2 text-indigo-600" /> Daily Activity Breakdown</h2>
                                    <div className="mb-6 flex justify-center gap-2 flex-wrap">
                                       <div className="mb-6 flex justify-center gap-2 flex-wrap">
                                       {startIndex > 0 && (
                                        <motion.button onClick={() => setStartIndex(prev => Math.max(0, prev - datesPerPage))} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-sm font-small flex items-center justify-center bg-gray-200 text-gray-700 ${theme === 'dark' ? "bg-gray-400 text-gray-300" : ""} cursor-pointer hover:bg-indigo-500 hover:text-white transition-colors duration-200 ease-in-out`} aria-label="Previous dates" >
                                          <ChevronLeft className="w-5 h-5" />
                                        </motion.button>
                                       )}
                                       {dates.filter(date => date !== "All").slice(startIndex, startIndex + datesPerPage).map((date) => {
                                          const pieItem = rawPieData.find((item) => item.Date === date);
                                          const barItem = barChartData.find((item) => item.Date === date);
                                          const dataItem = pieItem || barItem;
                                          const dateToSet = dataItem ? `${dataItem.Date}-${dataItem.Month}-${dataItem.Year}` : date;
                                          return (
                                             <motion.button key={date} onClick={() => setSelectedMetricDate(dateToSet)}  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-sm font-small flex items-center justify-center bg-gray-200 text-gray-700 ${theme === 'dark' ? "bg-gray-400 text-gray-300" : ""} cursor-pointer hover:bg-indigo-500 hover:text-white transition-colors duration-200 ease-in-out`}  >     {date}  </motion.button>
                                          );
                                       })}
                                       
                                       {/* Next Button */}
                                       {startIndex + datesPerPage < dates.length && (
                                           <motion.button onClick={() => setStartIndex(prev => prev + datesPerPage)} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-sm font-small flex items-center justify-center bg-gray-200 text-gray-700 ${theme === 'dark' ? "bg-gray-400 text-gray-300" : ""} cursor-pointer hover:bg-indigo-500 hover:text-white transition-colors duration-200 ease-in-out`} aria-label="Next dates"  >
                                             <ChevronRight className="w-5 h-5" /> 
                                           </motion.button>
                                       )}
                                    </div>
                                     </div>
                                     
                                     <MyComponent Data={Data} selectedMetricDate={selectedMetricDate} />
                                    <div className="flex-grow flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
                                            <PieChart>
                                                <Pie data={filteredPieData} dataKey="value" nameKey="name" outerRadius={isMobile ? 60 : 80} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} paddingAngle={2}>
                                                    {filteredPieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => `${value.toFixed(1)} hours`} />
                                                <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.section>
                                <motion.section
                                    className={`rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col justify-between min-h-[450px] ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-stone-100 text-gray-800'}`}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                >
                                    <h2 className={`text-xl sm:text-2xl font-bold  mb-4 text-center ${theme === 'dark' ? 'bg-gradient-to-br from-pink-200 to-pink-600 bg-clip-text text-transparent' : 'text-gray-800'}`}>
                                        <ChartBarIcon className="w-6 h-6 inline-block mr-2 text-indigo-600" /> Weekly Login & Break Hours
                                    </h2>
                                    <div className="flex-grow flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                                            <BarChart data={filteredBarChartData} margin={{ top: 20, right: 10, left: 5, bottom: 5 }}>
                                                 <XAxis
                                                     dataKey="Date"
                                                     stroke={textColor}
                                                     axisLine={false}
                                                     tickLine={false}
                                                     padding={{ left: 10, right: 10 }}
                                                     tickFormatter={(tick, index) =>
                                                         filteredBarChartData[index]
                                                             ? `${filteredBarChartData[index].Date}-${filteredBarChartData[index].Month}`
                                                             : tick
                                                     }
                                                     className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}
                                                 />
                                                 <YAxis allowDecimals={false} hide />
                                                 <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                                 <Legend wrapperStyle={{ paddingTop: "10px" }} />
                                                 <Bar dataKey="Work_Hours" stackId="a" fill={BAR_COLORS.work} name="Work Hours" />
                                                 <Bar dataKey="Break_Hours" stackId="a" fill={BAR_COLORS.break} name="Break Hours" />
                                             </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.section>
                            </div>
                           <div className={`p-4 sm:p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <h1 className="text-3xl font-extrabold text-indigo-800 mb-6 border-b pb-2"> Employee Attendance Tracker</h1>
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-lg border-l-4 border-indigo-500`}>
        <div className="flex flex-wrap gap-4">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={`p-2 border border-gray-300 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-50' : 'bg-white'}`}>
             <option value="">Select Month: All</option>
             {months.map(m => <option key={m} value={m}>{m}</option>)}
           </select>
            <div className="flex items-center gap-2">
  <label className="text-sm">From</label>
  <input type="date" value={startDateFilter} max={todayISO} onChange={e => setStartDateFilter(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm bg-white" />
  <label className="text-sm">To</label>
  <input type="date" value={endDateFilter} max={todayISO} onChange={e => setEndDateFilter(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm bg-white" />

  <button onClick={() => { setPage(1);}} className="px-3 py-1 bg-indigo-600 text-white rounded-lg" >Apply</button>
  <button onClick={() => { setStartDateFilter(''); setEndDateFilter(''); setPage(1); }} className="px-3 py-1 bg-gray-200 rounded-lg" >   Clear </button>
</div>
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
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 hidden sm:table-cell">Date</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 hidden sm:table-cell">Mode</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 hidden sm:table-cell">Login</th>
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 hidden sm:table-cell">Logout</th>
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
              const grossHoursHHMM = record.grossHoursDisplay || 'N/A';
              const statusColor = record.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
=======
                                  <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-medium text-xs mb-3 text-center`}>
                                    Switch to {mode === "office" ? "Remote" : "Office"} mode?
                                  </p>
                                  <div className="flex space-x-2">
                                    <motion.button
                                      onClick={() => handleModeChange(mode === "office" ? "home" : "office")}
                                      className="flex-1 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-colors font-semibold text-sm"
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      Confirm
                                    </motion.button>
                                    <motion.button
                                      onClick={() => setShowModeConfirm(false)}
                                      className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      Cancel
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                      </div>
                      <div className={`grid grid-cols-1 md:grid-cols-1`}>
                        <ProfileAttendance
                          theme={theme}
                          todayAttendance={todayAttendance}
                          isLoggedIn={isLoggedIn}
                          loading={loadingTodayAttendance}
                        />


                      </div>

                      <div className="relative my-2 w-full flex justify-center">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <motion.div
                            className={`w-full border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            style={{ transformOrigin: "left" }}
                          />
                        </div>
                        <span className={`px-2 text-xs font-semibold z-10 ${theme === 'dark' ? 'bg-gray-800 text-indigo-400' : 'bg-white text-indigo-600'}`}>
                          CURRENT CLOCK
                        </span>
                      </div>

                      {/* Time display section: Increased font size for clock, better centered */}
                      <div className="w-full flex flex-col items-center text-center mb-4 relative z-10">

                        <div className="mb-4">
                          <motion.div
                            className="flex items-center justify-center gap-2 text-indigo-600 font-medium mb-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                          >
                            <ClockIcon className="w-5 h-5 text-indigo-500" /> {/* Slightly smaller icon */}
                            <span className='text-sm'>Current Time</span>
                          </motion.div>
                          <motion.p
                            // Central clock is now larger for focus, scales down well on mobile
                            className={`text-3xl md:text-3xl lg:text-3xl font-extrabold tracking-tight mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.5 }}
                          >
                            {formatClockTime(currentTime)}
                          </motion.p>
                          <motion.p
                            className={`text-sm md:text-base font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                          >
                            {currentTime.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                          </motion.p>
                        </div>
                        {/*<div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Today's Metrics: {todayIso}
            </div>*/}

                        {loadingTodayAttendance ? (
                          <p className="text-sm text-indigo-400 animate-pulse">Fetching today's hours...</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 w-full max-w-xs md:max-w-md">
                            {/* EFFECTIVE HOURS */}
                            <motion.div
                              className={`rounded-xl p-2 shadow-sm text-center flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-700 text-white border border-indigo-500/50' : 'bg-indigo-50 border border-indigo-200'}`}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="text-xl font-bold text-indigo-500">
                                {effectiveHoursFormatted}
                              </div>
                              <div className="text-xs font-semibold mt-1 text-gray-500">
                                Effective Hours
                              </div>
                            </motion.div>

                            {/* GROSS HOURS */}
                            <motion.div
                              className={`rounded-xl p-2 shadow-sm text-center flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-700 text-white border border-pink-500/50' : 'bg-pink-50 border border-pink-200'}`}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <div className="text-xl font-bold text-pink-500">
                                {grossHoursFormatted}
                              </div>
                              <div className="text-xs font-semibold mt-1 text-gray-500">
                                Gross Hours
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - Reduced size and centered for mobile */}
                      <div className="w-full flex justify-center mt-4 relative z-10">
                        {!isLoggedIn ? (
                          <motion.button
                            onClick={handleLogin}
                            // Reduced size and font
                            className="flex items-center justify-center w-36 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-green-600 hover:to-green-700 font-bold text-lg"
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <ClockIcon className="w-5 h-5 mr-1.5" />
                            Clock In
                          </motion.button>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-sm">
                            <AnimatePresence mode="wait">
                              {isLogoutConfirmed ? (
                                <>
                                  <motion.button
                                    key="confirm"
                                    onClick={handleConfirmLogout}
                                    // Reduced size and font
                                    className="flex-1 items-center justify-center py-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold text-sm"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Confirm Logout
                                  </motion.button>
                                  <motion.button
                                    key="cancel"
                                    onClick={handleCancel}
                                    className={`flex-1 items-center justify-center py-1 rounded-xl shadow-sm transition-all duration-200 font-medium text-sm 
                                            ${theme === 'dark' ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Cancel
                                  </motion.button>
                                </>
                              ) : (
                                <motion.button
                                  key="logout"
                                  onClick={handleLogout}
                                  // Reduced size and font
                                  className="flex items-center justify-center w-36 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-red-600 hover:to-red-700 font-bold text-lg"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <ClockIcon className="w-5 h-5 mr-1.5" />
                                  Clock Out
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  <App attendanceRecords={attendanceRecords} />
                </div>


                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <motion.section
                    className={`rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col justify-between min-h-[450px] ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-stone-100 text-gray-800'}`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <h2 className={`text-xl sm:text-2xl font-bold  mb-4 text-center ${theme === 'dark' ? 'bg-gradient-to-br from-blue-200 to-blue-600 bg-clip-text text-transparent' : 'text-gray-800'}`}>
                      <ChartPieIcon className="w-6 h-6 inline-block mr-2 text-indigo-600" /> Daily Activity Breakdown
                    </h2>
                    <div className="mb-6 flex justify-center gap-2 flex-wrap">
                      <div className="mb-6 flex justify-center gap-2 flex-wrap">
                        {/* Previous Button */}
                        {startIndex > 0 && (
                          <motion.button
                            onClick={() => setStartIndex(prev => Math.max(0, prev - datesPerPage))}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-sm font-small flex items-center justify-center bg-gray-200 text-gray-700 ${theme === 'dark' ? "bg-gray-400 text-gray-300" : ""} cursor-pointer hover:bg-indigo-500 hover:text-white transition-colors duration-200 ease-in-out`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Previous dates"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </motion.button>
                        )}
                        {dates.filter(date => date !== "All").slice(startIndex, startIndex + datesPerPage).map((date) => {
                          const pieItem = rawPieData.find((item) => item.Date === date);
                          const barItem = barChartData.find((item) => item.Date === date);
                          const dataItem = pieItem || barItem;
                          const dateToSet = dataItem ? `${dataItem.Date}-${dataItem.Month}-${dataItem.Year}` : date;
                          return (
                            <motion.button
                              key={date}
                              onClick={() => setSelectedMetricDate(dateToSet)}
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-sm font-small flex items-center justify-center bg-gray-200 text-gray-700 ${theme === 'dark' ? "bg-gray-400 text-gray-300" : ""} cursor-pointer hover:bg-indigo-500 hover:text-white transition-colors duration-200 ease-in-out`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {date}
                            </motion.button>
                          );
                        })}

                        {/* Next Button */}
                        {startIndex + datesPerPage < dates.length && (
                          <motion.button
                            onClick={() => setStartIndex(prev => prev + datesPerPage)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-sm font-small flex items-center justify-center bg-gray-200 text-gray-700 ${theme === 'dark' ? "bg-gray-400 text-gray-300" : ""} cursor-pointer hover:bg-indigo-500 hover:text-white transition-colors duration-200 ease-in-out`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Next dates"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    <MyComponent Data={Data} selectedMetricDate={selectedMetricDate} />
                    <div className="flex-grow flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
                        <PieChart>
                          <Pie data={filteredPieData} dataKey="value" nameKey="name" outerRadius={isMobile ? 60 : 80} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} paddingAngle={2}>
                            {filteredPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value.toFixed(1)} hours`} />
                          <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.section>
                  <motion.section
                    className={`rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col justify-between min-h-[450px] ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-stone-100 text-gray-800'}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <h2 className={`text-xl sm:text-2xl font-bold  mb-4 text-center ${theme === 'dark' ? 'bg-gradient-to-br from-pink-200 to-pink-600 bg-clip-text text-transparent' : 'text-gray-800'}`}>
                      <ChartBarIcon className="w-6 h-6 inline-block mr-2 text-indigo-600" /> Weekly Login & Break Hours
                    </h2>
                    <div className="flex-grow flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                        <BarChart data={filteredBarChartData} margin={{ top: 20, right: 10, left: 5, bottom: 5 }}>
                          <XAxis
                            dataKey="Date"
                            stroke={textColor}
                            axisLine={false}
                            tickLine={false}
                            padding={{ left: 10, right: 10 }}
                            tickFormatter={(tick, index) =>
                              filteredBarChartData[index]
                                ? `${filteredBarChartData[index].Date}-${filteredBarChartData[index].Month}`
                                : tick
                            }
                            className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}
                          />
                          <YAxis allowDecimals={false} hide />
                          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                          <Legend wrapperStyle={{ paddingTop: "10px" }} />
                          <Bar dataKey="Work_Hours" stackId="a" fill={BAR_COLORS.work} name="Work Hours" />
                          <Bar dataKey="Break_Hours" stackId="a" fill={BAR_COLORS.break} name="Break Hours" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.section>
                </div>
                {/* Attendance Records Table */}
                <div className={`p-4 sm:p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
                  <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Employee Attendance Tracker
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Monitor and manage employee attendance records
                      </p>
                    </div>

                    {/* Filters Section */}
                    <div className={`mb-6 p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl border border-gray-200 dark:border-gray-700`}>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        {/* Filter Section */}
                        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                          {/* Month Select */}
                          <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm min-w-[140px] ${theme === 'dark'
                              ? 'bg-gray-700 text-gray-100'
                              : 'bg-white text-gray-900'
                              }`}
                          >
                            <option value="">All Months</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>

                          {/* Date Range */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">From</label>
                              <input
                                type="date"
                                value={startDateFilter}
                                max={todayISO}
                                onChange={e => setStartDateFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">To</label>
                              <input
                                type="date"
                                value={endDateFilter}
                                max={todayISO}
                                onChange={e => setEndDateFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setPage(1); }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => { setStartDateFilter(''); setEndDateFilter(''); setPage(1); }}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Sort & Display Section */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm min-w-[160px] ${theme === 'dark'
                              ? 'bg-gray-700 text-gray-100'
                              : 'bg-white text-gray-900'
                              }`}
                          >
                            <option value="Recantly Added">Recently Added</option>
                            <option value="Ascending">Employee ID: Ascending</option>
                            <option value="Descending">Employee ID: Descending</option>
                            <option value="This Month">This Month</option>
                            <option value="Last Month">Last Month</option>
                            <option value="Last 7 days">Last 7 Days</option>
                          </select>
>>>>>>> cbc250bf74cd25a940a5d1102e593aca935d02c2

                          <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm ${theme === 'dark'
                              ? 'bg-gray-700 text-gray-100'
                              : 'bg-white text-gray-900'
                              }`}
                          >
                            <option value={6}>6 per page</option>
                            <option value={12}>12 per page</option>
                            <option value={24}>24 per page</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                            <tr>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                                Date
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                                Mode
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                                Login
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                                Logout
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                                Total Duration
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                                Effective Hours
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                                Status
                              </th>
                              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sm:hidden">
                                Attendance Details
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {loading ? (
                              <tr>
                                <td colSpan={8} className="py-8 px-4 text-center">
                                  <div className="flex justify-center items-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600 dark:text-gray-300">Loading attendance data...</span>
                                  </div>
                                </td>
                              </tr>
                            ) : error ? (
                              <tr>
                                <td colSpan={8} className="py-8 px-4 text-center">
                                  <div className="text-red-600 dark:text-red-400 font-medium">
                                    Error loading attendance records
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{error}</div>
                                </td>
                              </tr>
                            ) : pageItems.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="py-8 px-4 text-center">
                                  <div className="text-gray-500 dark:text-gray-400">
                                    No attendance records found for the selected filters
                                  </div>
                                </td>
                              </tr>
                            ) : pageItems.map(record => {
                              const totalDurationHHMM = record.totalDurationHHMM || 'N/A';
                              const effectiveHoursHHMM = record.effectiveHoursDisplay || 'N/A';
                              const statusColor = record.attended
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';

                              return (
                                <tr
                                  key={`${record.employeeId}-${record.date}`}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  {/* Desktop View */}
                                  <td className={`py-4 px-4 text-sm hidden sm:table-cell ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                                    }`}>
                                    {record.date}
                                  </td>
                                  <td className="py-4 px-4 hidden sm:table-cell">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.mode === 'Office'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                      }`}>
                                      {record.mode}
                                    </span>
                                  </td>
                                  <td className={`py-4 px-4 text-sm hidden sm:table-cell ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                                    }`}>
                                    {record.loginDisplay}
                                  </td>
                                  <td className={`py-4 px-4 text-sm hidden sm:table-cell ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                                    }`}>
                                    {record.logoutDisplay}
                                  </td>
                                  <td className={`py-4 px-4 text-sm font-medium hidden sm:table-cell ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                                    }`}>
                                    {totalDurationHHMM}
                                  </td>
                                  <td className={`py-4 px-4 text-sm font-semibold hidden sm:table-cell ${theme === 'dark' ? 'text-green-300' : 'text-green-700'
                                    }`}>
                                    {effectiveHoursHHMM}
                                  </td>
                                  <td className="py-4 px-4 hidden sm:table-cell">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                      {record.attended ? 'Present' : 'Absent'}
                                    </span>
                                  </td>

                                  {/* Mobile View */}
                                  <td className="py-4 px-4 sm:hidden">
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-start">
                                        <span className={`font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                                          }`}>
                                          {record.employeeId}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                          {record.attended ? 'Present' : 'Absent'}
                                        </span>
                                      </div>

                                      <div className="text-sm space-y-1">
                                        <div className="flex justify-between">
                                          <span className="text-gray-500 dark:text-gray-400">Date:</span>
                                          <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}>
                                            {record.date}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500 dark:text-gray-400">Mode:</span>
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${record.mode === 'Office'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                            }`}>
                                            {record.mode}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500 dark:text-gray-400">Time:</span>
                                          <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}>
                                            {record.loginDisplay} - {record.logoutDisplay}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500 dark:text-gray-400">Total Hours:</span>
                                          <span className={theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>
                                            {totalDurationHHMM}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-500 dark:text-gray-400">Effective:</span>
                                          <span className={theme === 'dark' ? 'text-green-300' : 'text-green-700'}>
                                            {effectiveHoursHHMM}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Section */}
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-medium">{pageItems.length}</span> of{' '}
                            <span className="font-medium">{filteredSorted.length}</span> records
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setPage(p => Math.max(1, p - 1))}
                              disabled={page <= 1}
                              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                              Previous
                            </button>

                            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                              Page <span className="font-medium">{page}</span> of{' '}
                              <span className="font-medium">{totalPages}</span>
                            </span>

                            <button
                              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                              disabled={page >= totalPages}
                              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Section */}
                    <div className="mt-4 text-center">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Displaying <strong>{filteredSorted.length}</strong> attendance record(s) based on current filters
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
<<<<<<< HEAD
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
=======
>>>>>>> cbc250bf74cd25a940a5d1102e593aca935d02c2
    </div>
  );
};

export default AttendancesDashboard;