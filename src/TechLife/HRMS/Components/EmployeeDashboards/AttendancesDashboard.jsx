import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { Context } from "../HrmsContext";
import { CalendarDaysIcon, ClockIcon, ArrowPathIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
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
import axios from 'axios';
import { useParams } from "react-router-dom";
import { green } from "@mui/material/colors";
import AttendanceReports from "./AttendanceReports";
import { ChevronLeft, ChevronRight,BadgeX  } from "lucide-react";

const PIE_COLORS = ["#B027F5", "#F5A623"];
const STANDARD_WORKDAY_HOURS = 8;

// --- Helper Functions (No changes needed here, keeping them for completeness) ---

const calculateHours = (login, logout) => {
  if (!login || !logout) return 0;
  const loginDate = new Date(`2000-01-01 ${login}`);
  const logoutDate = new Date(`2000-01-01 ${logout}`);
  const diff = (logoutDate - loginDate) / (1000 * 60 * 60);
  return diff > 0 ? diff : 0;
};
const formatClockTime = (date) => {
  if (!date) return "--:--:--";
  return date.toLocaleTimeString("en-US", { hour: "2-digit",minute: "2-digit",second: "2-digit",hour12: true, });
};
const FilterButtonGroup = ({ options, selectedOption, onSelect, className = "" }) => (
  <div className={`flex gap-2 sm:gap-3 flex-wrap ${className}`}>
    {options.map((option) => (
      <button
        key={option}
        onClick={() => onSelect(option)}
        className={`px-3 py-2 rounded-lg border text-sm sm:text-base font-semibold
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
  <svg className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const TrendingUpIcon = ({ className }) => (
    <svg className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

const TrendingDownIcon = ({ className }) => (
    <svg className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
        <polyline points="17 18 23 18 23 12"></polyline>
    </svg>
);

const StatCard = ({ icon, iconBgColor, iconTextColor, value, description, trend, trendPercentage, trendPeriod }) => {
    const isUp = trend === 'up';
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 w-full flex flex-col justify-between border border-gray-200 h-48">
            <div className="flex justify-between items-start">
                <div className={`rounded-md p-2 ${iconBgColor} ${iconTextColor}`}>{icon}</div>
            </div>
            <div className="mt-4">
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                <p className="text-gray-500 text-sm mt-1">{description}</p>
            </div>
            <div className="flex items-center mt-auto">
                {isUp ? <TrendingUpIcon className="w-5 h-5 text-green-500" /> : <TrendingDownIcon className="w-5 h-5 text-red-500" />}
                <span className={`ml-1 text-sm ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {trendPercentage}% {trendPeriod}
                </span>
            </div>
        </div>
    );
};


const AttendancesDashboard = ({ onBack, currentUser }) => {
  const { empID } = useParams();
  const { userData } = useContext(Context);

  const role = (userData?.roles?.[0] || "").toUpperCase();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAttendanceReports, setShowAttendanceReports] = useState(false);
  const showSidebar = ["TEAM_LEAD", "HR", "MANAGER"].includes(role);

  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All");
  const [hoveredHour, setHoveredHour] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');
  const [barChartData, setBarChartData] = useState([]);
  const [rawPieData, setRawPieData] = useState([]);
  const [rawTableData, setrawTableData] = useState([]);
  const [dates, setDates] = useState([]);
  const [Data, setData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [mode, setMode] = useState("office");
  const [timer, setTimer] = useState(0);
  const [isLogoutConfirmed, setIsLogoutConfirmed] = useState(false);
  const [sortOption, setSortOption] = useState("Recently added");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardData, setCardData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [grossHours, setGrossHours] = useState(0);
  const [effectiveHours, setEffectiveHours] = useState(0);
  const [showModeConfirm, setShowModeConfirm] = useState(false);
  const [isBreak, setIsBreak] = useState(false); // NEW: Track if user is on break
  const [breakStartTime, setBreakStartTime] = useState(null); // NEW: Track break start time
  const [totalBreakTime, setTotalBreakTime] = useState(0); // NEW: Accumulate total break time

  const sortOptions = ["Recently added", "Ascending", "Descending", "Last Month", "Last 7 Days"];
  const rowsPerPageOptions = [10, 25, 50, 100];
  const MONTHS = ["All", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // --- All your useEffect hooks for data fetching (no changes needed) ---
    useEffect(() => {
        axios.get(`http://192.168.0.123:8081/api/attendance/employee/${empID}/bar-chart`).then(response => {
            const formatted = response.data.map(item => ({ Date: item.date, Month: item.month, Year: item.year, Work_Hours: item.working_hour, break_Hours: item.break_hour }));
            setBarChartData(formatted);
            const dates = ["All", ...formatted.map(item => item.Date)];
            setDates(dates);
        }).catch(error => console.error('Error fetching bar chart data:', error));
    }, [empID]);

    useEffect(() => {
        axios.get(`http://192.168.0.123:8081/api/attendance/employee/${empID}/attendance?page=0&size=10`).then(response => {
            setrawTableData(response.data);
        }).catch(error => console.error('Error fetching attendance data:', error));
    }, [empID]);

    useEffect(() => {
        axios.get(`http://192.168.0.123:8081/api/attendance/employee/${empID}/pie-chart`).then(response => {
            const formatted = response.data.map(item => ({ Date: item.date, Month: item.month, Year: item.year, Working_hour: item.working_hour, Break_hour: item.break_hour, EmployeeId: item.employeeId }));
            setRawPieData(formatted);
        }).catch(error => console.error('Error fetching pie chart data:', error));
    }, [empID]);

    useEffect(() => {
        axios.get(`http://192.168.0.123:8081/api/attendance/employee/${empID}/line-graph`).then(response => {
            const formatted = response.data.map(item => ({ EmployeeId: item.employeeId, Date: item.date, Month: item.month, Year: item.year, Start_time: item.start_time, End_time: item.end_time, Break_hour: item.breaks.map(b => ({ Time: b.time, hour: b.hour })) }));
            setData(formatted);
        }).catch(error => console.error('Error fetching line graph data:', error));
    }, [empID]);
    
    useEffect(() => {
        axios.get(`http://192.168.0.123:8081/api/attendance/attendance/leaves/dashboard/${empID}`).then(response => {
            setCardData(response.data);
        }).catch(error => console.error('Error fetching card data:', error));
    }, [empID]);


  // --- All your other functions and useMemo hooks (no changes needed) ---
    useEffect(() => {
        let interval;
        if (isLoggedIn) {
            interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isLoggedIn]);

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLoggedIn && startTime) {
        const interval = setInterval(() => {
        const now = new Date();
        const diffInSeconds = (now - startTime) / 1000;
        setGrossHours(diffInSeconds);
        setEffectiveHours(diffInSeconds);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, startTime]);
     const handleModeChange = (newMode) => {
    setMode(newMode);
    setShowModeConfirm(false);
  };

  const handleLogin = () => {setIsLoggedIn(true);setStartTime(new Date());setEndTime(null); setGrossHours(0); setEffectiveHours(0);};
  const handleLogout = () => {setIsLogoutConfirmed(true);};
  const handleConfirmLogout = () => {setIsLoggedIn(false); setIsLogoutConfirmed(false); setEndTime(new Date());};
  const handleCancel = () => { setIsLogoutConfirmed(false);};
  const formatHours = (seconds) => {const h = Math.floor(seconds / 3600);const m = Math.floor((seconds % 3600) / 60);const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}h${String(m).padStart(2, "0")}m${String(s).padStart(2, "0")}s`;
};
  const grossHoursFormatted = formatHours(grossHours);
  const effectiveHoursFormatted = formatHours(effectiveHours);
    const getHourValue = useCallback((timeString) => {
        const [start, end] = timeString.split(' - ');
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
        return { start: startHour + startMinute / 60, end: endHour + endMinute / 60 };
    }, []);
    const scaleHour = useCallback((hour) => ((hour - 10) / 10) * 100, []);
    const renderScheduleBar = useCallback(() => {
        if (selectedDate === "All") return <div className="text-gray-500 text-center py-4">Select a specific day to view the timeline.</div>;
        const dayData = Data.find(d => `${d.Date}-${d.Month}-${d.Year}` === selectedDate);
        if (!dayData) return <div className="text-gray-500 text-center py-4">No schedule available for {selectedDate}.</div>;

        const timePoints = new Set([dayData.Start_time, dayData.End_time]);
        if (dayData.Break_hour) dayData.Break_hour.forEach(b => { const [start, end] = (b.Time).split(' - '); timePoints.add(start); timePoints.add(end); });
        
        const sortedTimes = Array.from(timePoints).sort((a, b) => new Date(`2000/01/01 ${a}`) - new Date(`2000/01/01 ${b}`));

        const formatTimelineTime = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
            return `${formattedHours}${minutes > 0 ? `:${minutes}` : ''} ${period}`;
        };
        const calculateDuration = (startTime, endTime) => (new Date(`2000/01/01 ${endTime}`) - new Date(`2000/01/01 ${startTime}`)) / (1000 * 60 * 60);
        const workingHoursSegment = { type: 'working', time: `${dayData.Start_time} - ${dayData.End_time}`, duration: calculateDuration(dayData.Start_time, dayData.End_time) };
        const breakHours = (dayData.Break_hour || []).map(h => ({ type: 'break', time: h.Time, duration: h.hour }));
        const allHours = [workingHoursSegment, ...breakHours].sort((a, b) => getHourValue(a.time).start - getHourValue(b.time).start);
        return (
            <div>
                <div className="w-full h-10 bg-gray-200 relative rounded-full overflow-hidden border border-gray-300">
                    {allHours.map((hour, index) => {
                        const { start, end } = getHourValue(hour.time);
                        const leftPosition = scaleHour(start);
                        const widthPercentage = scaleHour(end) - scaleHour(start);
                        const colorClass = hour.type === 'working' ? 'bg-indigo-500' : 'bg-red-500';
                        return (
                            <div key={index} className={`absolute h-full cursor-pointer transition-all duration-300 ${colorClass}`} style={{ left: `${leftPosition}%`, width: `${widthPercentage}%` }} onMouseEnter={() => setHoveredHour(hour)} onMouseLeave={() => setHoveredHour(null)}>
                                {hoveredHour === hour && (
                                    <div className="absolute bottom-full mb-2 p-2 rounded-md shadow-lg bg-gray-800 text-white text-xs whitespace-nowrap" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                                        <p>{hour.type === 'working' ? 'Working' : 'Break'}</p>
                                        <p>Time: {hour.time}</p>
                                        <p>Duration: {hour.duration.toFixed(2)} hours</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-2 px-1">
                    {sortedTimes.map((time, index) => <span key={index}>{formatTimelineTime(time)}</span>)}
                </div>
            </div>
        );
    }, [selectedDate, Data, hoveredHour, getHourValue, scaleHour]);
    const finalAttendanceData = useMemo(() => {
        let data = [...rawTableData];
        if (selectedMonth !== "All" && selectedMonth) {
            const selectedMonthIndex = MONTHS.indexOf(selectedMonth) -1;
            data = data.filter((entry) => new Date(entry.date).getMonth() === selectedMonthIndex);
        }
        switch (sortOption) {
            case "Ascending": data.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
            case "Descending": data.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
            case "Last Month": const lastMonth = new Date(); lastMonth.setMonth(lastMonth.getMonth() - 1); data = data.filter(item => new Date(item.date) >= lastMonth); break;
            case "Last 7 Days": const last7Days = new Date(); last7Days.setDate(last7Days.getDate() - 7); data = data.filter(item => new Date(item.date) >= last7Days); break;
            default: data.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
        }
        const formattedData = data.map(entry => ({ ...entry, login_hours: calculateHours(entry.login_time, entry.logout_time), barWidth: `${(calculateHours(entry.login_time, entry.logout_time) / STANDARD_WORKDAY_HOURS) * 100}%` }));
        const totalPages = Math.ceil(formattedData.length / rowsPerPage);
        const paginatedData = formattedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
        return { paginatedData, totalPages, totalCount: formattedData.length };
    }, [rawTableData, selectedMonth, sortOption, rowsPerPage, currentPage, MONTHS]);

    const { paginatedData, totalPages } = finalAttendanceData;

    const filteredPieData = useMemo(() => {
        const dataToProcess = selectedDate === "All" ? rawPieData : rawPieData.filter((d) => `${d.Date}-${d.Month}-${d.Year}` === selectedDate);
        const totalWorking = dataToProcess.reduce((sum, row) => sum + row.Working_hour, 0);
        const totalBreak = dataToProcess.reduce((sum, row) => sum + row.Break_hour, 0);
        return [{ name: "Working Hours", value: totalWorking }, { name: "Break Hours", value: totalBreak }];
    }, [selectedDate, rawPieData]);

    const filteredBarChartData = useMemo(() => {
        return selectedDate === "All" ? barChartData : barChartData.filter((d) => `${d.Date}-${d.Month}-${d.Year}` === selectedDate);
    }, [selectedDate, barChartData]);


  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative">
      {/* --- Sidebar --- */}
      {showSidebar && (
        <>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`fixed right-0 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-l-lg shadow-lg z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`}
            aria-label="Open Sidebar"
          >
            <ChevronLeft />
          </button>
          
          <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-40 p-4 flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="self-start mb-4 bg-indigo-600 text-white p-2 rounded-full shadow-lg"
              aria-label="Close Sidebar"
            >
              <ChevronRight />
            </button>
            <h3
              className="text-lg font-bold text-gray-800 cursor-pointer mb-4 p-2 rounded-md hover:bg-gray-100"
              onClick={() => {
                setShowAttendanceReports(true);
                setIsSidebarOpen(false); // Optionally close sidebar on click
              }}
            >
              Attendance Reports
            </h3>
          </div>
        </>
      )}

      {/* --- Main Content Wrapper (This is the new part for the push effect) --- */}
      <main className={`p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out ${isSidebarOpen && showSidebar ? 'mr-80' : 'mr-0'}`}>
        <header className="flex items-center justify-between mb-6">
            <h1 className="text-xl sm:text-4xl font-extrabold text-gray-900">
                {/* Title changes based on view */}
                {showAttendanceReports ? "Attendance Reports" : "Attendance Dashboard"}
            </h1>
            <button
                // Button functionality changes based on view
                onClick={showAttendanceReports ? () => setShowAttendanceReports(false) : onBack}
                className="flex items-center px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                {showAttendanceReports ? "Back to Dashboard" : "Back"}
            </button>
        </header>
        {/* --- Conditional Rendering of Main Content --- */}
        {showAttendanceReports ? (
          <div className="p-2">
            <AttendanceReports role={role.toLowerCase()} />
          </div>
        ) : (
          <>
            <div className="bg-white shadow-xl rounded-lg p-3 flex flex-col md:flex-row items-center justify-between gap-6 hover:translate-y-[-1px] transition-transform duration-300 ease-in-out relative mb-6">  
      {/* Left side: Profile and Greeting */}
      <div className="flex-1 flex flex-col items-center md:items-start space-y-4 md:border-r border-gray-200 pr-6">
        <div className="flex items-center space-x-6 p-4">
          <div className="w-32 h-32 bg-gray-300 rounded-full overflow-hidden flex-shrink-0"><img src={userData?.avatar || "https://i.pravatar.cc/100"} alt="Profile" className="w-full h-full object-cover" /> </div>
          <div className="flex-grow">
            <h2 className="text-3xl font-bold text-gray-900">Welcome, {userData?.employeeId} {userData?.fullName}</h2>
            <p className="text-gray-500 mt-2 text-lg">  You have <span className="font-bold text-red-500">100%</span> of Attendance & <span className="font-bold text-red-500">10hr 9min</span> of Avg Working Hours </p>
          </div>
        </div>
      </div>
      {/* Right side: Mode, Digital Clock, and Clock In/Out */}
      <div className="flex-1 flex flex-col justify-between items-end pl-6 mt-6 md:mt-0">
        <div className="flex justify-end w-full mb-1 mt-3 space-x-4 gap-32">
          <div className="flex-none">
            <button  onClick={() => setShowModeConfirm(true)}  className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center gap-2 text-lg font-medium transition-all duration-300 ease-in-out shadow-sm hover:shadow-md" >
              {mode === "office" ? <FaBuilding className="text-blue-500 text-2xl" /> : <FaHome className="text-green-500 text-2xl" />}
              <span className="hidden sm:inline">{mode === "office" ? "Office Mode" : "Home Mode"}</span>
              <span className="sm:hidden">{mode === "office" ? "Office" : "Home"}</span>
            </button>
          </div>
          <div className="text-right mr-4">
            <p className="text-3xl font-extrabold text-indigo-900 tracking-wide">{formatClockTime(currentTime)}</p>
            <p className="text-lg text-indigo-500">{currentTime.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
        </div>
        {/* Gross Time and Effective Time */}
        <div className="flex w-full justify-between items-center space-x-6 mt-2">
          <div className="text-center">
            <p className="text-xl text-gray-600 font-medium">Gross Time</p>
            <p className="text-2xl font-bold text-purple-800 tracking-wider mt-0">{grossHoursFormatted}</p>
            {startTime && <p className="text-gray-500 text-lg mt-2">Login Time: <span className="font-semibold text-gray-700">{startTime.toLocaleTimeString()}</span></p>}
          </div>
          <div className="text-center">
            <p className="text-xl text-gray-600 font-medium">Effective Time</p>
            <p className="text-2xl font-bold text-orange-800 tracking-wider mt-0">{effectiveHoursFormatted}</p>
            {endTime && <p className="text-gray-500 text-lg mt-2">Logout Time: <span className="font-semibold  text-gray-700">{endTime.toLocaleTimeString()}</span></p>}
          </div>
        </div>
        {/* Clock In/Out Buttons */}
        <div className="w-80 mr-24 mt-2">
          {!isLoggedIn ? (
            <button  onClick={handleLogin}   className="flex items-center justify-center w-54 px-2 py-2 bg-green-600 text-white rounded-3xl shadow-xl hover:bg-green-700 focus:ring-2 focus:ring-green-300 transition-all duration-300 text-xl font-semibold transform hover:scale-105" >
              <ClockIcon className="w-6 h-6 mr-3" /> Clock In </button>
          ) : (
            <div className="flex flex-col items-center w-full">
        {isLogoutConfirmed ? (
          <div className="flex flex-row space-x-4">
            <button onClick={handleConfirmLogout}  className="flex items-center justify-center w-54 px-2 py-2 bg-red-600 text-white rounded-3xl shadow-xl hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-300 text-xl font-semibold transform hover:scale-105" >
              <ClockIcon className="w-6 h-6 mr-3" /> Confirm Logout</button>
            <button  onClick={handleCancel}  className="flex items-center justify-center w-54 px-2 py-2 bg-gray-500 text-white rounded-3xl shadow-md hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200 text-xl font-medium transform hover:scale-105" >
              <BadgeX className="w-5 h-5 mr-3" /> Cancel </button>
          </div>
        ) : (
          <button  onClick={handleLogout}  className="flex items-center justify-center w-54 px-2 py-2 bg-red-600 text-white rounded-3xl shadow-xl hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-300 text-xl font-semibold transform hover:scale-105">
            <ClockIcon className="w-6 h-6 mr-3" /> Clock Out</button>
        )}
       </div>
      )}
        </div>
      </div>
      
      {/* Mode Change Confirmation Modal */}
      {showModeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center rounded-xl shadow-xl justify-center bg-gray-300 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Mode Change</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to change your working mode?</p>
            <div className="flex justify-around space-x-4">
              <button  onClick={() => handleModeChange(mode === "office" ? "home" : "office")}  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700" >  Confirm </button>
              <button onClick={() => setShowModeConfirm(false)}  className="px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300"> Cancel  </button>
            </div>
          </div>
        </div>
      )}
    </div>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                 {cardData.map((card, index) => {
                    let icon, iconBgColor, iconTextColor;
                    switch (card.description) {
                        case "Total Hours Today": icon = <BriefcaseIcon className="w-6 h-6" />; iconBgColor = "bg-orange-100"; iconTextColor = "text-orange-500"; break;
                        case "Total Hours Week": icon = <ClockIcon className="w-6 h-6" />; iconBgColor = "bg-gray-100"; iconTextColor = "text-gray-900"; break;
                        case "Total Hours Month": icon = <CalendarDaysIcon className="w-6 h-6" />; iconBgColor = "bg-blue-100"; iconTextColor = "text-blue-500"; break;
                        case "Overtime this Month": icon = <BriefcaseIcon className="w-6 h-6" />; iconBgColor = "bg-pink-100"; iconTextColor = "text-pink-500"; break;
                        default: icon = <BriefcaseIcon className="w-6 h-6" />; iconBgColor = "bg-gray-100"; iconTextColor = "text-gray-900";
                    }
                    return <StatCard key={index} icon={icon} iconBgColor={iconBgColor} iconTextColor={iconTextColor} value={card.value} description={card.description} trend={card.trend} trendPercentage={card.trendPercentage} trendPeriod={card.trendPeriod} />;
                })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <section className="bg-white rounded-lg p-6 border border-gray-200 flex flex-col justify-between min-h-[450px]">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">Daily Activity Breakdown</h2>
                        <div className="mb-6 flex justify-center gap-2 sm:gap-3 flex-wrap">
                            {dates.map((date) => {
                                const dataItem = rawPieData.find((item) => item.Date === date);
                                const dateToSet = date === "All" ? "All" : (dataItem ? `${dataItem.Date}-${dataItem.Month}-${dataItem.Year}` : date);
                                return (
                                    <button key={date} onClick={() => setSelectedDate(dateToSet)} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-sm font-small flex items-center justify-center ${selectedDate === dateToSet ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-700"} hover:bg-blue-500 hover:text-white transition-colors duration-200 ease-in-out`}>
                                        {date === "All" ? "All" : date}
                                    </button>
                                );
                            })}
                        </div>
                        {renderScheduleBar()}
                    </div>
                    <div className="flex-grow">
                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                            <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
                                <PieChart>
                                    <Pie data={filteredPieData} dataKey="value" nameKey="name" outerRadius={isMobile ? 60 : 80} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} paddingAngle={2}>
                                        {filteredPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value.toFixed(1)} hours`} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </div>
                </section>
                <section className="bg-white rounded-lg p-6 border border-gray-200 flex flex-col justify-between min-h-[450px]">
                    <div><h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">Weekly Login & Break Hours</h2></div>
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" className="flex-grow">
                        <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                            <BarChart data={filteredBarChartData} margin={{ top: 20, right: 10, left: 5, bottom: 5 }}>
                                <XAxis dataKey="Date" axisLine={false} tickLine={false} padding={{ left: 10, right: 10 }} className="text-sm" tickFormatter={(tick, index) => barChartData[index] ? `${barChartData[index].Date}-${barChartData[index].Month}` : tick} />
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
            <div className="p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-md">
                <section>
                    <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800"><CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 inline-block text-blue-600 mr-2" /> Attendance Records</h2>
                        <div className="flex flex-wrap items-center gap-4">
                            <FilterButtonGroup options={MONTHS} selectedOption={selectedMonth} onSelect={(month) => { setSelectedMonth(month); setCurrentPage(1); }} />
                            <div className="relative">
                                <label className="text-sm font-semibold mr-2 text-gray-700">Sort by:</label>
                                <select value={sortOption} onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }} className="border border-gray-300 px-3 py-1.5 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700">
                                    {sortOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider"><div className="flex items-center gap-2"><CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" /> Date</div></th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider"><div className="flex items-center gap-2"><ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> Login Time</div></th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider"><div className="flex items-center gap-2"><ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" /> Logout Time</div></th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Login Hours</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Daily Progress</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((entry, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition-colors duration-150">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{entry.date}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{entry.login_time || <span className="text-red-500 font-semibold">Absent</span>}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{entry.logout_time || <span className="text-red-500 font-semibold">Absent</span>}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800"><span className="font-semibold text-blue-700">{entry.login_hours.toFixed(2)}</span> hrs</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                <div className="relative rounded-full h-4 w-full bg-blue-100 overflow-hidden">
                                                    <div className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-in-out" style={{ width: entry.barWidth }} />
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white mix-blend-difference">{entry.login_hours.toFixed(1)}h</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="px-4 py-3 text-center text-gray-500 italic">No attendance records found for the selected options.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
                        <div className="flex items-center gap-2 mb-4 sm:mb-0">
                            <span className="text-sm text-gray-700">Rows per page:</span>
                            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-gray-300 px-2 py-1 rounded-md text-sm">
                                {rowsPerPageOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                        <nav className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                            <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                        </nav>
                    </div>
                </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AttendancesDashboard;