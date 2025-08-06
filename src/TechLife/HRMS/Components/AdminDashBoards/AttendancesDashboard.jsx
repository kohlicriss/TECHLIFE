import React, { useState, useEffect } from "react";
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
import { FaHome, FaBuilding } from "react-icons/fa"; // Removed FaUserCircle as it's replaced by a custom profile placeholder
import useMediaQuery from "@mui/material/useMediaQuery";
import { Box } from "@mui/material";

const rawTableData = [
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-30", login_time: "10:00 AM", logout_time: "07:00 PM" },
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-29", login_time: null, logout_time: null },
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-28", login_time: "10:00 AM", logout_time: "07:00 PM" },
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-27", login_time: "10:00 AM", logout_time: "07:00 PM" },
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-26", login_time: null, logout_time: null },
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-25", login_time: "10:00 AM", logout_time: "07:00 PM" },
  { name: "Rajesh", employee_id: "E_01", date: "2025-06-24", login_time: "10:00 AM", logout_time: "07:00 PM" },
];

const rawPieData = [
  { Employee_name: "Rajesh", Time: "10:00", Working_hour: 0, Break_hour: null },
  { Employee_name: "Rajesh", Time: "11:00", Working_hour: 1, Break_hour: null, "No of Working": 1 },
  { Employee_name: "Rajesh", Time: "12:00", Working_hour: 2, Break_hour: null, "No of Working": 1 },
  { Employee_name: "Rajesh", Time: "13:00", Working_hour: 3, Break_hour: null, "No of Working": 1 },
  { Employee_name: "Rajesh", Time: "14:00", Working_hour: null, Break_hour: 1, "No of Break": 1 },
  { Employee_name: "Rajesh", Time: "15:00", Working_hour: 4, Break_hour: null, "No of Working": 1 },
  { Employee_name: "Rajesh", Time: "16:00", Working_hour: 5, Break_hour: null, "No of Working": 1 },
  { Employee_name: "Rajesh", Time: "16:30", Working_hour: 5.5, Break_hour: null, "No of Working": 0.5 },
  { Employee_name: "Rajesh", Time: "17:00", Working_hour: null, Break_hour: 0.5, "No of Break": 0.5 },
  { Employee_name: "Rajesh", Time: "18:00", Working_hour: 6.5, Break_hour: null, "No of Working": 1 },
];

const barChartData = [
  { Day: "Mon", Work_Hours: 6.3, break_Hours: 2.3 },
  { Day: "Tues", Work_Hours: 5.5, break_Hours: 2.3 },
  { Day: "Wed", Work_Hours: 4.1, break_Hours: 2.0 },
  { Day: "Thurs", Work_Hours: 6.7, break_Hours: 0.8 },
  { Day: "Fri", Work_Hours: 8.7, break_Hours: 2.3 },
  { Day: "Sat", Work_Hours: 4.3, break_Hours: 2.7 },
  { Day: "Sun", Work_Hours: 0, break_Hours: 0 },
];

// --- Utility Functions ---
const CalculateHours = (login, logout) => {
  if (!login || !logout) return 0;
  const loginDate = new Date(`2000-01-01 ${login}`);
  const logoutDate = new Date(`2000-01-01 ${logout}`);
  const diff = (logoutDate - loginDate) / (1000 * 60 * 60);
  return diff > 0 ? diff : 0;
};

// --- Clock Component ---
const DigitalClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const formatClockTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'

    const pad = (num) => String(num).padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
  };

  return (
    <div className="text-center my-4">
      <p className="text-4xl font-extrabold text-gray-900 tracking-wide">
        {formatClockTime(currentTime)}
      </p>
      <p className="text-lg text-gray-500 mt-1">
        {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
};

// --- Main Component ---
const AttendancesDashboard = () => {
  // State for month and day filters
  const months = ["All", "January", "February", "March", "April", "May", "June"];
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedDay, setSelectedDay] = useState("All");

  // State for Web Clock
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [mode, setMode] = useState("office"); // "office" or "home"
  const [timer, setTimer] = useState(0); // Timer in seconds
  const [canRefresh, setCanRefresh] = useState(false); // New state for refresh button

  // Media query for responsiveness
  const isMobile = useMediaQuery("(max-width:768px)");

  // --- Web Clock Logic ---
  useEffect(() => {
    let interval;
    if (isLoggedIn) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval); // Cleanup interval on unmount or logout
  }, [isLoggedIn]);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const grossHoursFormatted = formatTime(timer);
  // Assuming 1 hour (3600 seconds) is the standard break time for effective hours calculation
  // This is a simplification; in a real app, break time would be tracked.
  const effectiveSeconds = Math.max(0, timer - 3600);
  const effectiveHoursFormatted = formatTime(effectiveSeconds);

  // Handle Login button click
  const handleLogin = () => {
    setIsLoggedIn(true);
    setStartTime(new Date());
    setTimer(0);
    setEndTime(null);
    setCanRefresh(false); // Cannot refresh while logged in
  };

  // Handle Logout button click
  const handleLogout = () => {
    setIsLoggedIn(false);
    setEndTime(new Date());
    setCanRefresh(true); // Can refresh after logout
  };

  // Handle Refresh button click
  const handleRefresh = () => {
    setTimer(0);
    setStartTime(null);
    setEndTime(null);
    setCanRefresh(false);
  };

  // --- Data Transformations for Charts and Table ---

  // Filter and process table data based on selected month
  const filteredTableData = rawTableData
    .filter((entry) => {
      if (selectedMonth === "All") return true;
      const entryMonth = new Date(entry.date).getMonth();
      const selectedMonthIndex = months.indexOf(selectedMonth) - 1;
      return entryMonth === selectedMonthIndex;
    })
    .map((entry) => {
      const login_hours = CalculateHours(entry.login_time, entry.logout_time);
      const maxHoursForBar = 9; // Assuming a standard 9-hour workday for progress bar
      const barWidth = `${(login_hours / maxHoursForBar) * 100}%`;
      return { ...entry, login_hours, barWidth };
    });

  // Calculate total working and break hours for Pie Chart
  const totalWorking = rawPieData.reduce((sum, row) => sum + (row["No of Working"] || 0), 0);
  const totalBreak = rawPieData.reduce((sum, row) => sum + (row["No of Break"] || 0), 0);
  const pieData = [
    { name: "Working Hours", value: totalWorking },
    { name: "Break Hours", value: totalBreak },
  ];
  const COLORS = ["#4A90E2", "#F5A623"]; // Modern, accessible colors

  // Utility to scale hours for the Bar Time Line visualization (e.g., 9 AM to 9 PM)
  const scaleHour = (hour) => ((hour - 10) / 10) * 100;

  // Days for the daily filter buttons
  const days = ["All", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center drop-shadow-sm">
        Attendance Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Employee Profile Section - Takes 2/3 width on large screens */}
        <div className="lg:col-span-2 bg-white shadow-xl rounded-lg p-7 flex flex-col sm:flex-row items-center justify-center sm:justify-start hover:translate-y-[-8px] border border-gray-200 ease-in-out">
          {/* Left Section: Profile Picture */}
          <div className="flex-shrink-0 w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mr-0 sm:mr-6 mb-4 sm:mb-0">
            <span className="text-5xl font-semibold text-indigo-700">JD</span>
          </div>

          {/* Right Section: Details */}
          <div className="flex-grow text-center sm:text-left">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 sm:mb-0">JOHN DOE</h2>
              {/* Edit Icon */}
              <button className="p-2 bg-gray-100 rounded-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>

            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-gray-700 text-lg">
              <div className="flex items-center justify-center sm:justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2v-5m-7-5a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5z"
                  />
                </svg>
                <span>E123</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m8-10v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2z"
                  />
                </svg>
                <span>ABC Services</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-1.208-8.455-3.245m16.91 0c.75.053 1.5.044 2.247-.027m-4.502 0c.266-.026.53-.06.792-.102M12 2v10m-3.486 1.848a3 3 0 000 4.31m6.972 0a3 3 0 000-4.31M12 22v-4m-3.93-2.618l-.928 2.062a1 1 0 01-1.488.587l-2.062-.928a1 1 0 01-.587-1.488l2.062-.928a1 1 0 011.488.587L9.93 19.382zM17.93 19.382l-.928-2.062a1 1 0 011.488-.587l2.062.928a1 1 0 01.587 1.488l-2.062.928a1 1 0 01-1.488-.587zM12 12h.01"
                  />
                </svg>
                <span>Software</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 13a9 9 0 100-18 9 9 0 000 18z"
                  />
                </svg>
                <span>john@gmail.com</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>+91123456789</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Associate Software</span>
              </div>
            </div>
          </div>
        </div>

        {/* Web Clock Section - Takes 1/3 width on large screens */}
        <div className="lg:col-span-1 bg-white shadow-xl rounded-lg p-7 flex flex-col justify-between hover:translate-y-[-8px] border border-gray-200 ease-in-out">
          <div>
            <h2 className="text-2xl font-bold mb-5 text-center text-gray-800">
              <ClockIcon className="w-7 h-7 inline-block text-indigo-600 mr-2" />
              Live Work Timer
            </h2>
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setMode(mode === "office" ? "home" : "office")}
                className="px-6 py-3 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center gap-2 text-lg font-medium transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
              >
                {mode === "office" ? <FaBuilding className="text-blue-500 text-xl" /> : <FaHome className="text-green-500 text-xl" />}
                <span className="hidden sm:inline">{mode === "office" ? "Office Mode" : "Home Mode"}</span>
                <span className="sm:hidden">{mode === "office" ? "Office" : "Home"}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6 text-center mb-7">
              <div>
                <p className="text-lg text-gray-600 mb-1">Gross Time</p>
                <p className="text-3xl font-extrabold text-purple-800 tracking-wide">{grossHoursFormatted}</p>
              </div>
              <div>
                <p className="text-lg text-gray-600 mb-1">Effective Time</p>
                <p className="text-3xl font-extrabold text-orange-800 tracking-wide">{effectiveHoursFormatted}</p>
              </div>
            </div>

            <DigitalClock /> {/* Digital Clock (Calendar) */}
          </div>
          <div className="flex justify-center gap-4 mt-auto">
            {!isLoggedIn ? (
              <button
                onClick={handleLogin}
                className="flex items-center justify-center px-10 py-4 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 text-xl font-bold transform hover:scale-105"
              >
                <ClockIcon className="w-6 h-6 mr-2" /> Login
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-10 py-4 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-200 text-xl font-bold transform hover:scale-105"
              >
                <ClockIcon className="w-6 h-6 mr-2" /> Logout
              </button>
            )}
            {canRefresh && (
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 text-xl font-bold transform hover:scale-105"
                title="Refresh Timer"
              >
                <ArrowPathIcon className="w-6 h-6" />
              </button>
            )}
          </div>
          {startTime && (
            <div className="mt-6 text-center text-gray-500 text-sm">
              <p className="mb-1">Login Time: <span className="font-semibold text-gray-700">{startTime.toLocaleTimeString()}</span></p>
              {endTime && <p>Logout Time: <span className="font-semibold text-gray-700">{endTime.toLocaleTimeString()}</span></p>}
            </div>
          )}
        </div>
      </div>

      {/* --- PIE CHART + Daily Working Hour Timeline and WEEKLY BAR CHART --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* PIE CHART + Daily Working Hour Timeline */}
        <div className="bg-white rounded-lg shadow-xl p-7 hover:translate-y-[-8px] ease-in-out border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">Daily Activity Breakdown</h2>
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
          <div className="relative w-full h-5 bg-gray-200 rounded-full overflow-hidden mb-5 border border-gray-300">
            {/* These segments are hardcoded from rawPieData, for a dynamic solution, iterate over rawPieData */}
            {/* Working Hours 10 AM - 1 PM */}
            <div
              className="absolute bg-blue-500 h-full"
              style={{
                left: `${scaleHour(10)}%`,
                width: `${scaleHour(13) - scaleHour(10)}%`,
              }}
            />
            {/* Break 1 PM - 2 PM */}
            <div
              className="absolute bg-orange-500 h-full"
              style={{
                left: `${scaleHour(13)}%`,
                width: `${scaleHour(14) - scaleHour(13)}%`,
              }}
            />
            {/* Working Hours 2 PM - 4:30 PM */}
            <div
              className="absolute bg-blue-500 h-full"
              style={{
                left: `${scaleHour(14)}%`,
                width: `${scaleHour(16.5) - scaleHour(14)}%`,
              }}
            />
            {/* Break 4:30 PM - 5:00 PM */}
            <div
              className="absolute bg-orange-500 h-full"
              style={{
                left: `${scaleHour(16.5)}%`,
                width: `${scaleHour(17) - scaleHour(16.5)}%`,
              }}
            />
            {/* Working Hours 5 PM - 8 PM */}
            <div
              className="absolute bg-blue-500 h-full"
              style={{
                left: `${scaleHour(17)}%`,
                width: `${scaleHour(20) - scaleHour(17)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-8 px-1">
            <span>10 AM</span>
            <span>1 PM</span>
            <span>2 PM</span>
            <span>4:30 PM</span>
            <span>5 PM</span>
            <span>8 PM</span>
          </div>

          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" className="min-h-[250px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  className="focus:outline-none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} aria-label={`${entry.name}: ${entry.value} hours`} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)} hours`} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "15px" }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </div>

        {/* --- WEEKLY BAR CHART --- */}
        <div className="bg-white shadow-xl rounded-lg p-7 hover:translate-y-[-8px] ease-in-out border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">Weekly Login & Break Hours</h2>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={selectedDay === "All" ? barChartData : barChartData.filter((d) => d.Day.startsWith(selectedDay))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="Day" axisLine={false} tickLine={false} padding={{ left: 10, right: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Legend wrapperStyle={{ paddingTop: "15px" }} />
              <Bar dataKey="Work_Hours" stackId="a" fill="#3b82f6" name="Work Hours" radius={[10, 10, 0, 0]} />
              <Bar dataKey="break_Hours" stackId="a" fill="#F5A623" name="Break Hours" radius={[10, 10, 0, 0]} /> {/* Changed break color to orange for consistency */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Attendance Records Table --- */}
      <div className="mt-10 bg-white shadow-xl rounded-lg p-7 hover:translate-y-[-8px] ease-in-out border border-gray-200">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            <CalendarDaysIcon className="w-7 h-7 inline-block text-blue-600 mr-2" />
            Attendance Records
          </h2>
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {months.map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-4 py-2 rounded-lg border text-sm sm:text-base font-semibold
                  ${selectedMonth === month ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 border-gray-300"}
                  hover:bg-blue-500 hover:text-white transition-colors duration-200 ease-in-out`}
                aria-pressed={selectedMonth === month}
              >
                {month}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-5 h-5 text-indigo-500" />
                    <span>Date</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-green-500" />
                    <span>Login Time</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-red-500" />
                    <span>Logout Time</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <span>Login Hours</span>
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <span>Daily Progress</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTableData.length > 0 ? (
                filteredTableData.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{entry.date}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-800">
                      {entry.login_time || <span className="text-red-500 font-semibold">Absent</span>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-800">
                      {entry.logout_time || <span className="text-red-500 font-semibold">Absent</span>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-800">
                      <span className="font-semibold text-blue-700">{entry.login_hours.toFixed(2)}</span> hrs
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="relative bg-gray-200 rounded-full h-5 w-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-in-out"
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
                  <td colSpan="5" className="px-5 py-4 text-center text-gray-500 italic">
                    No attendance records found for the selected month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancesDashboard;