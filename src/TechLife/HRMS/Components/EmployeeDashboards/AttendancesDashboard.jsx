import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CalendarDaysIcon, ClockIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { FaHome, FaBuilding } from "react-icons/fa";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box } from "@mui/material";

// --- Mock Data (moved outside component for clarity) ---
const rawTableData = [
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-29", login_time: null, logout_time: null },
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-28", login_time: "10:00 AM", logout_time: "08:00 PM" },
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-27", login_time: "10:00 AM", logout_time: "08:00 PM" },
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-26", login_time: null, logout_time: null },
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-25", login_time: "10:00 AM", logout_time: "08:00 PM" },
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-24", login_time: "10:00 AM", logout_time: "08:00 PM" },
];
const rawPieData = [
  { EmployeeId: "ACS000001", Day: "Mon", Working_hour: 8.3, Break_hour: 1.7 },
  { EmployeeId: "ACS000001", Day: "Tue", Working_hour: 8.4, Break_hour: 1.6 },
  { EmployeeId: "ACS000001", Day: "Wed", Working_hour: 8.2, Break_hour: 1.8 },
  { EmployeeId: "ACS000001", Day: "Thu", Working_hour:9.0, Break_hour: 1.0 },
  { EmployeeId: "ACS000001", Day: "Fri", Working_hour: 8.0, Break_hour: 2.0 },
  { EmployeeId: "ACS000001", Day: "Sat", Working_hour: 0, Break_hour: 0 },
  { EmployeeId: "ACS000001", Day: "Sun", Working_hour: 0, Break_hour: 0 },
];
const Data= [
  { EmployeeId: "ACS000001", Day: "Mon", Working_hour:{Time:"10:00 - 13:00",hours:3.0,Time:"14:00 - 16:30",hours:2.5,Time:"17:00 - 18:40",hours:1.8,Time:"19:00 - 20:00",hours:1.0}, Break_hour:{Time:"13:00 - 14:00",hours:1.0,Time:"16:30 - 17:00",hours:0.5,Time:"18:40 - 19:00",hours:0.2}},
  { EmployeeId: "ACS000001", Day: "Tue", Working_hour:{Time:"10:00 - 13:00",hours:3.0,Time:"14:00 - 16:30",hours:2.5,Time:"17:00 - 18:00",hours:1.0,Time:"18:00 - 18:50",hours:0.9,Time:"19:00 - 20:00",hours:1.0}, Break_hour:{Time:"13:00 - 14:00",hours:1.0,Time:"16:30 - 17:10",hours:0.5,Time:"18:50 - 19:00",hours:0.1}},
  { EmployeeId: "ACS000001", Day: "Wed", Working_hour:{Time:"10:00 - 12:50",hours:3.0,Time:"14:00 - 16:15",hours:2.2,Time:"17:00 - 20:00",hours:3.0}, Break_hour:{Time:"13:00 - 14:00",hours:1.0,Time:"16:15 - 16:30",hours:0.3,Time:"16:30 - 17:00",hours:0.5}},
  { EmployeeId: "ACS000001", Day: "Thu", Working_hour:{Time:"10:00 - 13:00",hours:3.0,Time:"14:00 - 17:00",hours:3.0,Time:"17:00 - 20:00",hours:3.0}, Break_hour:{Time:"13:00 - 14:00",hours:1.0}},
  { EmployeeId: "ACS000001", Day: "Fri", Working_hour:{Time:"10:00 - 13:00",hours:3.0,Time:"14:00 - 16:30",hours:2.5,Time:"17:30 - 20:00",hours:2.5}, Break_hour:{Time:"13:00 - 14:00",hours:1.0,Time:"16:30 - 17:00",hours:0.5,Time:"17:00 - 17:30",hours:0.}},
  { EmployeeId: "ACS000001", Day: "Sat", Working_hour: 0, Break_hour: 0 },
  { EmployeeId: "ACS000001", Day: "Sun", Working_hour: 0, Break_hour: 0 },
];
const barChartData = [
  { Day: "Mon", Work_Hours: 8.3, break_Hours: 1.7 },
  { Day: "Tue", Work_Hours: 8.4, break_Hours: 1.6 },
  { Day: "Wed", Work_Hours: 8.2, break_Hours: 1.8 },
  { Day: "Thu", Work_Hours: 9.0, break_Hours: 1.0 },
  { Day: "Fri", Work_Hours: 8.0, break_Hours: 2.0 },
  { Day: "Sat", Work_Hours: 0, break_Hours: 0 },
  { Day: "Sun", Work_Hours: 0, break_Hours: 0 },
];
const MONTHS = ["All", "January", "February", "March", "April", "May", "June"];
const days = ["All", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PIE_COLORS = ["#B027F5", "#F5A623"];
const STANDARD_WORKDAY_HOURS = 10;
const calculateHours = (login, logout) => {
  if (!login || !logout) return 0;
  const loginDate = new Date(`2000-01-01 ${login}`);
  const logoutDate = new Date(`2000-01-01 ${logout}`);
  const diff = (logoutDate - loginDate) / (1000 * 60 * 60);
  return diff > 0 ? diff : 0;
};
const formatTime = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};
const scaleHour = (hour) => ((hour - 10) / 10) * 100; // Scales 10 AM (0%) to 8 PM (100%)
const FilterButtonGroup = ({ options, selectedOption, onSelect, className = "" }) => (
  <div className={`flex gap-2 sm:gap-3 flex-wrap ${className}`}>
    {options.map((option) => (
      <button
        key={option}
        onClick={() => onSelect(option)}
        className={`px-4 py-2 rounded-lg border text-sm sm:text-base font-semibold
          ${selectedOption === option ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 border-gray-300"}
          hover:bg-blue-500 hover:text-white transition-colors duration-200 ease-in-out`}
        aria-pressed={selectedOption === option}
      >
        {option}
      </button>
    ))}
  </div>
);
const BriefcaseIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const TrendingUpIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const TrendingDownIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
    <polyline points="17 18 23 18 23 12"></polyline>
  </svg>
);


// The StatCard component itself
const StatCard = ({ icon, iconBgColor, iconTextColor, value, description, trend, trendPercentage, trendPeriod }) => {
  const isUp = trend === 'up';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 w-full flex flex-col justify-between border border-gray-200 h-48">
      <div className="flex justify-between items-start">
        <div className={`rounded-md p-2 ${iconBgColor} ${iconTextColor}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <p className="text-gray-500 text-sm mt-1">{description}</p>
      </div>
      <div className="flex items-center mt-auto">
        {isUp ? (
          <TrendingUpIcon className="w-5 h-5 text-green-500" />
        ) : (
          <TrendingDownIcon className="w-5 h-5 text-red-500" />
        )}
        <span className={`ml-1 text-sm ${isUp ? 'text-green-500' : 'text-red-500'}`}>
          {trendPercentage}% {trendPeriod}
        </span>
      </div>
    </div>
  );
};

// --- AttendancesDashboard Component ---
const AttendancesDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedDay, setSelectedDay] = useState("All");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [mode, setMode] = useState("office");
  const [timer, setTimer] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);
  const [canCancel, setCanCancel]=useState(false)

  const isMobile = useMediaQuery("(max-width:768px)");

  // --- Web Clock Logic (simplified using useCallback) ---
  useEffect(() => {
    let interval;
    if (isLoggedIn) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
    setStartTime(new Date());
    setTimer(0);
    setEndTime(null);
    setCanRefresh(false);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setEndTime(new Date());
    setCanRefresh(true);
  }, []);

  const handleRefresh = useCallback(() => {
    setTimer(0);
    setStartTime(null);
    setEndTime(null);
    setCanRefresh(false);
  }, []);
  const handlecancel = useCallback(() => {
    setTimer(0);
    setStartTime(null);
    setEndTime(null);
    setCanCancel(false);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prevMode) => (prevMode === "office" ? "home" : "office"));
  }, []);
   const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  const formatClockTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
  };

  // --- Derived State (memoized for performance) ---
  const grossHoursFormatted = useMemo(() => formatTime(timer), [timer]);
  const effectiveHoursFormatted = useMemo(() => formatTime(Math.max(0, timer - 3600)), [timer]); // Assuming 1 hour break
  const filteredTableData = useMemo(() => {
    return rawTableData
      .filter((entry) => {
        if (selectedMonth === "All") return true;
        const entryMonth = new Date(entry.date).getMonth();
        const selectedMonthIndex = MONTHS.indexOf(selectedMonth) - 1;
        return entryMonth === selectedMonthIndex;
      })
      .map((entry) => {
        const login_hours = calculateHours(entry.login_time, entry.logout_time);
        const barWidth = `${(login_hours / STANDARD_WORKDAY_HOURS) * 100}%`;
        return { ...entry, login_hours, barWidth };
      });
  }, [selectedMonth]);

  const filteredPieData = useMemo(() => {
    const dataToProcess = selectedDay === "All"
      ? rawPieData
      : rawPieData.filter((d) => d.Day === selectedDay);

    const totalWorking = dataToProcess.reduce((sum, row) => sum + row.Working_hour, 0);
    const totalBreak = dataToProcess.reduce((sum, row) => sum + row.Break_hour, 0);

    return [
      { name: "Working Hours", value: totalWorking },
      { name: "Break Hours", value: totalBreak },
    ];
  }, [selectedDay, rawPieData]);

  const filteredBarChartData = useMemo(() => {
    return selectedDay === "All"
      ? barChartData
      : barChartData.filter((d) => d.Day.startsWith(selectedDay));
  }, [selectedDay]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans text-gray-800">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-left drop-shadow-sm">
        Attendance Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Employee Profile Section */}
        <section className="bg-white shadow-lg rounded-xl p-7 flex flex-col sm:flex-row items-center justify-center sm:justify-start transition-all duration-300 hover:shadow-2xl hover:scale-[1.005] h-[200px]">
          <div className="flex-shrink-0 w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mr-0 sm:mr-6 mb-4 sm:mb-0 shadow-inner">
            <span className="text-5xl font-semibold text-indigo-700">JD</span>
          </div>
          <div className="flex-grow text-center sm:text-left">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">JOHN DOE</h2>
              <button
                className="p-2 bg-gray-100 rounded-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200"
                aria-label="Edit Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-gray-700 text-lg">
              {[
                { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2v-5m-7-5a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5z" /></svg>, text: "E123" },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m8-10v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2z" /></svg>, text: "ABC Services" },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-1.208-8.455-3.245m16.91 0c.75.053 1.5.044 2.247-.027m-4.502 0c.266-.026.53-.06.792-.102M12 2v10m-3.486 1.848a3 3 0 000 4.31m6.972 0a3 3 0 000-4.31M12 22v-4m-3.93-2.618l-.928 2.062a1 1 0 01-1.488.587l-2.062-.928a1 1 0 01-.587-1.488l2.062-.928a1 1 0 011.488.587L9.93 19.382zM17.93 19.382l-.928-2.062a1 1 0 011.488-.587l2.062.928a1 1 0 01.587 1.488l-2.062.928a1 1 0 01-1.488-.587zM12 12h.01" /></svg>, text: "Software" },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 13a9 9 0 100-18 9 9 0 000 18z" /></svg>, text: "john@gmail.com" },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>, text: "+91123456789" },
                { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, text: "Associate Software" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-center sm:justify-start">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Web Clock Section */}
        <section className="bg-white shadow-lg rounded-xl p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:scale-[1.005] h-[200px]">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-center text-gray-800">
              <ClockIcon className="w-7 h-7 inline-block text-indigo-600 mr-2" /> Live Work Timer
            </h2>
            <div className="grid grid-cols-3 items-center my-1">
             {/* Left side: Toggle Mode button */}
             <div className="flex justify-start ml-6 mb-1">
               <button
                 onClick={toggleMode}
                 className="px-3 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center gap-1 text-lg font-medium transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
               >
                 {mode === "office" ? (
                   <FaBuilding className="text-blue-500 text-xl" />
                 ) : (
                   <FaHome className="text-green-500 text-xl" />
                 )}
                 <span className="hidden sm:inline">
                   {mode === "office" ? "Office Mode" : "Home Mode"}
                 </span>
                 <span className="sm:hidden">
                   {mode === "office" ? "Office" : "Home"}
                 </span>
               </button>
             </div>
           
             {/* Center: Login/Logout and Refresh buttons */}
             <div className="flex justify-center gap-2 mt-0">
               {!isLoggedIn ? (
                 <button
                   onClick={handleLogin}
                   className="flex items-center justify-center px-6 py-2 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 text-xl font-bold transform hover:scale-105"
                 >
                   <ClockIcon className="w-6 h-6 mr-2" /> Login
                 </button>
               ) : (
                 <button
                   onClick={handleLogout}
                   className="flex items-center justify-center px-6 py-2 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200 text-xl font-bold transform hover:scale-105"
                 >
                   <ClockIcon className="w-6 h-6 mr-2" /> Logout
                 </button>
               )}
               {canRefresh && (
                 <button
                   onClick={handleRefresh}
                   className="flex items-center justify-center px-2 py-2 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 text-xl font-bold transform hover:scale-105"
                   title="Refresh Timer"
                 >
                   <ArrowPathIcon className="w-6 h-6" />
                 </button>
               )}
             </div>
             
           
             {/* Right side: Digital Clock */}
             <div className="text-right mr-8">
               <p className="text-2xl font-semibold text-gray-900 tracking-wide">
                 {formatClockTime(currentTime)}
               </p>
               <p className="text-sm text-gray-500 mt-0">
                 {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
               </p>
             </div>
            </div>
          <div className="grid grid-cols-3 items-center my-0">
          {/* Left side: Gross Time */}
          <div className="text-left">
            <p className="text-lg text-gray-600 mb-0">Gross Time</p>
            <p className="text-2xl font-bold text-purple-800 tracking-wide mb-5">
              {grossHoursFormatted}
            </p>
          </div>
        
          {/* Center: Login and Logout Times */}
          {startTime && (
            <div className="text-center text-gray-500 text-sm">
              <p className="mb-1">
                Login Time: <span className="font-semibold text-gray-700">{startTime.toLocaleTimeString()}</span>
              </p>
              {endTime && (
                <p>
                  Logout Time: <span className="font-semibold text-gray-700">{endTime.toLocaleTimeString()}</span>
                </p>
              )}
            </div>
          )}
        
          {/* Right side: Effective Time */}
          <div className="text-right ">
            <p className="text-lg text-gray-600 mb-0 mr-0">Effective Time</p>
            <p className="text-2xl font-bold text-orange-800 tracking-wide mb-5 mr-0">
              {effectiveHoursFormatted}
            </p>
          </div>
         </div>
         </div>
        </section>
      </div>

      {/* Stat Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={<BriefcaseIcon className="w-6 h-6" />}
          iconBgColor="bg-orange-100"
          iconTextColor="text-orange-500"
          value="8.5 / 10"
          description="Total Hours Today"
          trend="up"
          trendPercentage={5}
          trendPeriod="This Week"
        />
        <StatCard
          icon={<ClockIcon className="w-6 h-6" />}
          iconBgColor="bg-gray-100"
          iconTextColor="text-gray-900"
          value="40.2 / 50"
          description="Total Hours Week"
          trend="up"
          trendPercentage={7}
          trendPeriod="Last Week"
        />
        <StatCard
          icon={<CalendarDaysIcon className="w-6 h-6" />}
          iconBgColor="bg-blue-100"
          iconTextColor="text-blue-500"
          value="162 / 200"
          description="Total Hours Month"
          trend="down"
          trendPercentage={8}
          trendPeriod="Last Month"
        />
        <StatCard
          icon={<BriefcaseIcon className="w-6 h-6" />}
          iconBgColor="bg-pink-100"
          iconTextColor="text-pink-500"
          value="16 / 28"
          description="Overtime this Month"
          trend="down"
          trendPercentage={6}
          trendPeriod="Last Month"
        />
      </div>

      {/* Charts Section (Daily Activity and Daily/Weekly Hours) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Activity Breakdown (Timeline) */}
        <section className="bg-white rounded-lg p-6 border border-gray-200 flex flex-col justify-between min-h-[450px]">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">Daily Activity Breakdown</h2>
            <div className="mb-6 flex justify-center gap-2 sm:gap-3 flex-wrap">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-lg font-bold flex items-center justify-center
                    ${selectedDay === day ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-700"}
                    hover:bg-blue-500 hover:text-white transition-colors duration-200 ease-in-out`}
                  aria-pressed={selectedDay === day}
                >
                  {day.charAt(0) === "A" ? "All" : day.charAt(0)}
                </button>
              ))}
            </div>

            {/* Bar Time Line */}
            <div className="relative w-full h-4 sm:h-5 bg-gray-200 rounded-full overflow-hidden my-4 border border-gray-300">
              <div className="absolute bg-blue-500 h-full" style={{ left: `${scaleHour(10)}%`, width: `${scaleHour(13) - scaleHour(10)}%` }} />
              <div className="absolute bg-orange-500 h-full" style={{ left: `${scaleHour(13)}%`, width: `${scaleHour(14) - scaleHour(13)}%` }} />
              <div className="absolute bg-blue-500 h-full" style={{ left: `${scaleHour(14)}%`, width: `${scaleHour(16.5) - scaleHour(14)}%` }} />
              <div className="absolute bg-orange-500 h-full" style={{ left: `${scaleHour(16.5)}%`, width: `${scaleHour(17) - scaleHour(16.5)}%` }} />
              <div className="absolute bg-blue-500 h-full" style={{ left: `${scaleHour(17)}%`, width: `${scaleHour(20) - scaleHour(17)}%` }} />
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-6 px-1">
              <span>10 AM</span>
              <span>1 PM</span>
              <span>2 PM</span>
              <span>4:30 PM</span>
              <span>5 PM</span>
              <span>8 PM</span>
            </div>
          </div>
          {/* Added Spacer to push content up if needed */}
          <div className="flex-grow">
             <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" className="flex-grow">
              <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
                <PieChart>
                  <Pie
                    data={filteredPieData} 
                    dataKey="value"
                    nameKey="name"
                    outerRadius={isMobile ? 60 : 80}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    className="focus:outline-none"
                  >
                    {filteredPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} aria-label={`${entry.name}: ${entry.value} hours`} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(1)} hours`} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            </div> 
        </section>

        

          {/* WEEKLY BAR CHART */}
          <section className="bg-white rounded-lg p-6 border border-gray-200 flex flex-col justify-between min-h-[450px]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">Weekly Login & Break Hours</h2>
            </div>
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" className="flex-grow">
              <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                <BarChart
                  data={filteredBarChartData}
                  margin={{ top: 20, right: 10, left: 5, bottom: 5 }}
                >
                  <XAxis dataKey="Day" axisLine={false} tickLine={false} padding={{ left: 10, right: 10 }} />
                  <YAxis allowDecimals={false} hide />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                  <Bar dataKey="Work_Hours" stackId="a" fill="#B027F5" name="Work Hours" />
                  <Bar dataKey="break_Hours" stackId="a" fill="#F5A623" name="Break Hours" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </section>
        </div>
     

      {/* Attendance Records Table */}
      <section className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 inline-block text-blue-600 mr-2" /> Attendance Records
          </h2>
          <FilterButtonGroup
            options={MONTHS}
            selectedOption={selectedMonth}
            onSelect={setSelectedMonth}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" /> Date
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> Login Time
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" /> Logout Time
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Login Hours
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                  Daily Progress
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTableData.length > 0 ? (
                filteredTableData.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{entry.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                      {entry.login_time || <span className="text-red-500 font-semibold">Absent</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                      {entry.logout_time || <span className="text-red-500 font-semibold">Absent</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                      <span className="font-semibold text-blue-700">{entry.login_hours.toFixed(2)}</span> hrs
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <div className="relative rounded-full h-4 w-full overflow-hidden">
                        <div
                          className="bg-blue-200 h-full rounded-full transition-all duration-300 ease-in-out"
                          style={{ width: entry.barWidth }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white mix-blend-difference">
                          {entry.login_hours.toFixed(1)}h
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-3 text-center text-gray-500 italic">
                    No attendance records found for the selected month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AttendancesDashboard;