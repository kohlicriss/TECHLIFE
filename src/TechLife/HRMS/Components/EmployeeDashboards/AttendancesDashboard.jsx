import React, { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { Context } from "../HrmsContext";
import {
    CalendarDaysIcon,
    ClockIcon,
    ArrowLeftIcon,
    BriefcaseIcon,
    ChartBarIcon,
    ChartPieIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";
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
import { motion, AnimatePresence } from "framer-motion";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from 'axios';
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaBuilding, FaHome } from "react-icons/fa"
import AttendanceReports from "./AttendanceReports";
import { publicinfoApi } from "../../../../axiosInstance";

// --- Constants and Helper Functions ---
const PIE_COLORS = ["#4F46E5", "#F97316"]; // Tailwind's indigo-600 and orange-500
const BAR_COLORS = { work: "#4F46E5", break: "#F97316" };
const STANDARD_WORKDAY_HOURS = 8;

const calculateHours = (login, logout) => {
    if (!login || !logout) return 0;
    const loginDate = new Date(`2000-01-01 ${login}`);
    const logoutDate = new Date(`2000-01-01 ${logout}`);
    const diff = (logoutDate - loginDate) / (1000 * 60 * 60);
    return diff > 0 ? diff : 0;
};

const formatClockTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
};

const FilterButtonGroup = ({ options, selectedOption, onSelect, className = "" }) => {
    const {theme} = useContext(Context);
    return(
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
)};

const TrendingUpIcon = ({className }) => (
    <svg className={`${className}  `} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" >
        <motion.polyline
            points="23 6 13.5 15.5 8.5 10.5 1 18"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
        />
        <motion.polyline
            points="17 6 23 6 23 12"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
        />
    </svg>
);

const TrendingDownIcon = ({ className,theme }) => (
    <svg className={`${className}  ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" >
        <motion.polyline
            points="23 18 13.5 8.5 8.5 13.5 1 6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
        />
        <motion.polyline
            points="17 18 23 18 23 12"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
        />
    </svg>
);
const cardData = [
    { value: "8.5/10", description: "Total Hours Today", trend: "up", trendPercentage: "5", trendPeriod: "This week" },
    { value: "40.5/50", description: "Total Hours Week", trend: "up", trendPercentage: "7", trendPeriod: "Last week" },
    { value: "162/200", description: "Total Hours Month", trend: "down", trendPercentage: "8", trendPeriod: "Last Month" },
    { value: "16/28", description: "Overtime this Month", trend: "down", trendPercentage: "6", trendPeriod: "Last Month" }
];

const dates = ["All", "11", "12", "13", "14", "15"];
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
const rawPieData = [
    { EmployeeId: "ACS000001", Date: "11", Month: "Aug", Year: "2025", Working_hour: 8.3, Break_hour: 1.7 },
    { EmployeeId: "ACS000001", Date: "12", Month: "Aug", Year: "2025", Working_hour: 8.4, Break_hour: 1.6 },
    { EmployeeId: "ACS000001", Date: "13", Month: "Aug", Year: "2025", Working_hour: 8.2, Break_hour: 1.8 },
    { EmployeeId: "ACS000001", Date: "14", Month: "Aug", Year: "2025", Working_hour: 9.0, Break_hour: 1.0 },
    { EmployeeId: "ACS000001", Date: "15", Month: "Aug", Year: "2025", Working_hour: 8.0, Break_hour: 2.0 },
];
const barChartData = [
    { EmployeeId: "ACS000001", Date: "11", Month: "Aug", Year: "2025", Working_hour: 8.3, Break_hour: 1.7 },
    { EmployeeId: "ACS000001", Date: "12", Month: "Aug", Year: "2025", Working_hour: 8.4, Break_hour: 1.6 },
    { EmployeeId: "ACS000001", Date: "13", Month: "Aug", Year: "2025", Working_hour: 8.2, Break_hour: 1.8 },
    { EmployeeId: "ACS000001", Date: "14", Month: "Aug", Year: "2025", Working_hour: 9.0, Break_hour: 1.0 },
    { EmployeeId: "ACS000001", Date: "15", Month: "Aug", Year: "2025", Working_hour: 8.0, Break_hour: 2.0 },
];
const Data = [
    { EmployeeId: "ACS000001", Date: "11", Month: "Aug", Year: "2025", Start_time: "10:00", End_time: "20:00", Break_hour: [{ Time: "13:00 - 14:00", hour: 1.0 }, { Time: "16:30 - 17:00", hours: 0.5 }, { Time: "18:40 - 19:00", hours: 0.2 }] },
    { EmployeeId: "ACS000001", Date: "12", Month: "Aug", Year: "2025", Start_time: "10:00", End_time: "20:00", Break_hour: [{ Time: "13:00 - 14:00", hour: 1.0 }, { Time: "16:40 - 17:10", hours: 0.5 }, { Time: "19:20 - 19:40", hours: 0.2 }] },
    { EmployeeId: "ACS000001", Date: "13", Month: "Aug", Year: "2025", Start_time: "10:00", End_time: "20:00", Break_hour: [{ Time: "13:00 - 14:00", hour: 1.0 }, { Time: "16:30 - 17:00", hours: 0.5 }, { Time: "19:00 - 19:20", hours: 0.2 }] },
    { EmployeeId: "ACS000001", Date: "14", Month: "Aug", Year: "2025", Start_time: "10:00", End_time: "20:00", Break_hour: [{ Time: "13:00 - 14:00", hour: 1.0 }, { Time: "16:30 - 17:00", hours: 0.5 }, { Time: "18:40 - 18:50", hours: 0.1 }] },
    { EmployeeId: "ACS000001", Date: "15", Month: "Aug", Year: "2025", Start_time: "10:00", End_time: "20:00", Break_hour: [{ Time: "13:00 - 14:00", hour: 1.0 }, { Time: "16:30 - 17:00", hours: 0.5 }, { Time: "17:40 - 18:00", hours: 0.2 }] },
];
const StatCard = ({ icon, iconBgColor, iconTextColor, value, description, trend, trendPercentage, trendPeriod, }) => {
    const isUp = trend === 'up';
    const {theme} = useContext(Context);
    return (
        <motion.div
            className={`rounded-xl p-2 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col items-center justify-center text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-stone-100'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
        >
            <div className="flex justify-between items-start">
                <div className={`w-18 h-18 flex items-center justify-center rounded-full mb-2 p-3 ${iconBgColor} ${iconTextColor}`}>
                    {React.cloneElement(icon, { className: `w-12 h-12 rounded-full` })}
                </div>
            </div>
            <div className="mt-4">
                <p className={`text-3xl font-bold  ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-200 to-indigo-600 bg-clip-text text-transparent' : 'text-gray-800'}`}>
                    {value}</p>
                <p className={`text-gray-500 text-sm mt-1  ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                    {description}</p>
            </div>
            <div className="flex items-center mt-auto">
                {isUp ? <TrendingUpIcon className="w-5 h-5 text-green-500" /> : <TrendingDownIcon className="w-5 h-5 text-red-500" />}
                <span className={`ml-1 text-sm ${isUp ? 'text-green-500' : 'text-red-500'} ${theme === 'dark' ? (isUp ? 'text-green-400' : 'text-red-400') : ''}`}>
                    {trendPercentage}% {trendPeriod}
                </span>
            </div>
        </motion.div>
    );
};

// --- Sub-Component for Hours and Schedule Bar ---
const MyComponent = ({ Data, selectedDate }) => {
    const [hoveredHour, setHoveredHour] = useState(null);
    const {theme} = useContext(Context);

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
        if (!Data || selectedDate === "All") return null;
        const dayData = Data.find(d => `${d.Date}-${d.Month}-${d.Year}` === selectedDate);
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
    }, [selectedDate, Data]);

    // Scale hour for bar position (assuming 10:00 to 20:00 as full range)
    const scaleHour = useCallback((hour) => ((hour - 10) / 10) * 100, []);

    // Render schedule bar for selected date
    const renderScheduleBar = useCallback(() => {
        if (!Data || selectedDate === "All")
            return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className={`text-center py-4 italic ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Select a specific day to view the timeline.</motion.div>;
        const dayData = Data.find(d => `${d.Date}-${d.Month}-${d.Year}` === selectedDate);
        if (!dayData)
            return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className={`text-gray-500 text-center py-4 italic ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>No schedule available for {selectedDate}.</motion.div>;
        const timePoints = new Set([dayData.Start_time, dayData.End_time]);
        if (dayData.Break_hour)
            dayData.Break_hour.forEach(b => {
                const [start, end] = b.Time.split(' - ');
                timePoints.add(start);
                timePoints.add(end);
            });
        const sortedTimes = Array.from(timePoints).sort(
            (a, b) => new Date(`2000/01/01 ${a}`) - new Date(`2000/01/01 ${b}`)
        );
        const formatTimelineTime = (timeStr) => {
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
                    className="w-full h-10 bg-gray-200 relative rounded-xl overflow-hidden border border-gray-300"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                >
                    {allHours.map((hour, index) => {
                        const { start, end } = getHourValue(hour.time);
                        const leftPosition = scaleHour(start);
                        const widthPercentage = scaleHour(end) - scaleHour(start);
                        const colorClass = hour.type === 'working' ? 'bg-green-400' : 'bg-yellow-400';
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
                <div className={`flex justify-between text-xs sm:text-sm  mt-2 px-2 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
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
    }, [selectedDate, Data, hoveredHour, getHourValue, scaleHour]);

    return (
        <motion.div
            className="p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <motion.div
                    className="flex flex-col items-center p-4 rounded-lg bg-gray-50 border border-gray-200 shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center text-gray-500 mb-2">
                        <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                        <span className="text-sm font-medium">Total</span>
                    </div>
                    <span className="text-xl sm:text-xl font-bold text-gray-800">
                        {calculateMetrics?.totalWorkingHours || 'N/A'}
                    </span>
                </motion.div>
                <motion.div
                    className="flex flex-col items-center p-4 rounded-lg bg-green-50 border border-green-200 shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center text-green-700 mb-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-sm font-medium">Productive</span>
                    </div>
                    <span className="text-xl sm:text-xl font-bold text-green-800">
                        {calculateMetrics?.productiveHours || 'N/A'}
                    </span>
                </motion.div>
                <motion.div
                    className="flex flex-col items-center p-4 rounded-lg bg-yellow-50 border border-yellow-200 shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center text-yellow-700 mb-2">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        <span className="text-sm font-medium">Break</span>
                    </div>
                    <span className="text-xl sm:text-xl font-bold text-yellow-800">
                        {calculateMetrics?.breakHours || 'N/A'}
                    </span>
                </motion.div>
                <motion.div
                    className="flex flex-col items-center p-4 rounded-lg bg-blue-50 border border-blue-200 shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center text-blue-700 mb-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        <span className="text-sm font-medium">Overtime</span>
                    </div>
                    <span className="text-xl sm:text-xl font-bold text-blue-800">
                        {calculateMetrics?.overtime || 'N/A'}
                    </span>
                </motion.div>
            </div>
            {renderScheduleBar()}
        </motion.div>
    );
};

// --- Main Attendance Dashboard Component ---
const AttendancesDashboard = ({ onBack, currentUser }) => {
    const { empID } = useParams();
    const { userData,theme } = useContext(Context);
    const role = (userData?.roles?.[0] || "").toUpperCase();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showAttendanceReports, setShowAttendanceReports] = useState(false);
    const showSidebar = ["TEAM_LEAD", "HR", "MANAGER","ADMIN"].includes(role);
    const [selectedMonth, setSelectedMonth] = useState("All");
    const [selectedDate, setSelectedDate] = useState("All");
    const isMobile = useMediaQuery('(max-width:768px)');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [mode, setMode] = useState("office");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [grossHours, setGrossHours] = useState(0);
    const [effectiveHours, setEffectiveHours] = useState(0);
    const [showModeConfirm, setShowModeConfirm] = useState(false);
    const [isLogoutConfirmed, setIsLogoutConfirmed] = useState(false);
    const [sortOption, setSortOption] = useState("Recently added");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [loggedInUserProfile, setLoggedInUserProfile] = useState({
        image: null,
        initials: "  "
      });
       
    const [rawTableData , setRawTableData] = useState(  [
    { employee_id: "E_01", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
    { employee_id: "E_01", date: "2025-06-29", login_time: null, logout_time: null },
    { employee_id: "E_01", date: "2025-06-28", login_time: "10:00 AM", logout_time: "08:00 PM" },
    { employee_id: "E_01", date: "2025-06-27", login_time: "10:00 AM", logout_time: "08:00 PM" },
    { employee_id: "E_01", date: "2025-06-26", login_time: null, logout_time: null },
    { employee_id: "E_01", date: "2025-06-25", login_time: "10:00 AM", logout_time: "08:00 PM" },
    { employee_id: "E_01", date: "2025-06-24", login_time: "10:00 AM", logout_time: "08:00 PM" },
    { employee_id: "E_01", date: "2025-06-23", login_time: "10:00 AM", logout_time: "07:00 PM" },
]);

    const sortOptions = ["Recently added", "Ascending", "Descending", "Last Month", "Last 7 Days"];
    const rowsPerPageOptions = [10, 25, 50, 100];
    const MONTHS = ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

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
  
    // Timer and Clock Effects
    useEffect(() => {
        let interval;
        if (isLoggedIn && startTime) {
            interval = setInterval(() => {
                const now = new Date();
                const diffInSeconds = (now - startTime) / 1000;
                setGrossHours(diffInSeconds);
                setEffectiveHours(diffInSeconds); // Assuming effective hours are the same as gross hours for now
            }, 1000);
        } else { setGrossHours(0); setEffectiveHours(0); }
        const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => { clearInterval(interval); clearInterval(clockTimer); };
    }, [isLoggedIn, startTime]);

    // Action Handlers
    const handleModeChange = (newMode) => { setMode(newMode); setShowModeConfirm(false); };
   const handleLogin = () => {setIsLoggedIn(true);const now = new Date();setStartTime(now);setEndTime(null);setGrossHours(0);setEffectiveHours(0);

    setRawTableData(prev => [...prev,{ employee_id:"E_XX",date: now.toLocaleDateString(), login_time: formatClockTime(now),logout_time: null,login_hours: 0, barWidth: "0%",    }]);// Add new record
};
    const handleLogout = () => { setIsLogoutConfirmed(true); };
    const handleConfirmLogout = () => {setIsLoggedIn(false);setIsLogoutConfirmed(false);const now = new Date();setEndTime(now);

    setRawTableData(prev => {
        if (prev.length === 0) return prev;
        const lastIndex = prev.length - 1;
        const lastRecord = prev[lastIndex];
        const loginDate = new Date(`2000-01-01 ${lastRecord.login_time}`);
        const logoutDate = now;
        const loginHours = ((logoutDate - loginDate) / (1000 * 60 * 60));
        return [
            ...prev.slice(0, lastIndex),
            {
                ...lastRecord,
                logout_time: formatClockTime(now),
                login_hours: loginHours > 0 ? loginHours : 0,
                barWidth: `${(loginHours / STANDARD_WORKDAY_HOURS) * 100}%`,
            }
        ];
    });
};
    const handleCancel = () => { setIsLogoutConfirmed(false); };
    // Format hours for display
    const formatHours = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
    };
    const grossHoursFormatted = formatHours(grossHours);
    const effectiveHoursFormatted = formatHours(effectiveHours);
    const maxHoursInSeconds = 8 * 3600;
    const progress = (grossHours / maxHoursInSeconds) * 100;
    const finalAttendanceData = useMemo(() => {
        let data = [...rawTableData];
        if (selectedMonth !== "All" && selectedMonth) {
            const selectedMonthIndex = MONTHS.indexOf(selectedMonth) - 1;
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
        <div className={`min-h-screen ${theme === 'dark'? 'bg-gray-900': 'bg-gray-50'} font-sans text-gray-800 relative`}>
            {/* Sidebar */}
            {showSidebar && (
                <>
                    <button onClick={() => setIsSidebarOpen(true)} className={`fixed right-0 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-l-lg shadow-lg z-50 transition-all duration-300 ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`} aria-label="Open Sidebar">
                        <ChevronLeft />
                    </button>
                    <motion.div
                        className={`fixed inset-y-0 right-0 w-60  shadow-xl z-40 p-4 flex flex-col ${theme === 'dark' ? 'bg-gray-800 border-l border-gray-700' : 'bg-white border-l border-gray-200'}`}
                        initial={{ x: '100%' }}
                        animate={{ x: isSidebarOpen ? '0%' : '100%' }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <button onClick={() => setIsSidebarOpen(false)} className="self-start mb-4 bg-indigo-600 text-white p-2 rounded-full shadow-lg" aria-label="Close Sidebar" >
                            <ChevronRight />
                        </button>
                        <motion.h3
                            className={`text-lg font-bold  cursor-pointer mb-4 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 ${theme === 'dark' ? 'text-white hover:bg-gray-900' : 'text-gray-800'}`}
                            onClick={() => { setShowAttendanceReports(true); setIsSidebarOpen(false); }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ChartBarIcon className="w-5 h-5 inline-block mr-2" /> Attendance Reports
                        </motion.h3>
                    </motion.div>
                </>
            )}
            {/* Main Content Wrapper */}
            <main className={`p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out ${isSidebarOpen && showSidebar ? 'mr-60' : 'mr-0'}`}>
                <header className="flex items-center justify-between mb-8">
                    <motion.h1
                        className={`text-2xl sm:text-4xl font-extrabold ${theme === 'dark'? 'text-white': 'text-gray-900'}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {showAttendanceReports ? "Attendance Reports" : "Attendance"}
                    </motion.h1>
                    <motion.button
                        onClick={showAttendanceReports ? () => setShowAttendanceReports(false) : onBack}
                        className="flex items-center px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />{showAttendanceReports ? "Back to Dashboard" : "Back"}
                    </motion.button>
                </header>
                {/* Conditional Rendering of Main Content */}
                <AnimatePresence mode="wait">
                    {showAttendanceReports ? (
                        <motion.div
                            key="reports"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="p-2"
                        >
                            <AttendanceReports rawTableData={rawTableData} role={role.toLowerCase()} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Employee Profile and Clock Layouts - REFACTORED */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <motion.div
                                    className="p-4 flex items-center justify-center"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    {/* Main container with motion and color accents */}
                                    <div className={`rounded-2xl shadow-xl p-6 w-full max-w-2xl transition-transform hover:scale-105 hover:shadow-2xl duration-300 relative overflow-hidden ${theme === 'dark'? 'bg-gray-700 ': 'bg-stone-100 '}`}>

                                        {/* Subtle animated background pattern */}
                                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-tr from-purple-200 via-pink-200 to-red-200 opacity-70 z-0 animate-bounce-slow"></div>
                                        <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-gradient-to-tr from-green-200 via-blue-200 to-purple-200 opacity-70 z-0 animate-bounce-slow-reverse"></div>

                                        {/* Top section with profile on left and mode selector on right */}
                                        <div className="flex flex-row items-start justify-between mb-6 relative z-10 transition-all duration-500 ease-in-out">

                                            {/* Profile on left */}
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <motion.div
                                                        className={`w-20 h-20 rounded-full overflow-hidden border-4  shadow-lg cursor-pointer ${theme === 'dark'? 'border-gray-600': 'border-white'}`}
                                                        whileHover={{ scale: 1.1 }}
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
                                                              className={`text-sm font-bold ${
                                                                theme === "dark" ? "text-white" : "text-gray-600"
                                                              }`}
                                                            >
                                                              {loggedInUserProfile.initials}
                                                            </span>
                                                          )}
                                                         
                                                    </motion.div>
                                                    {/* Status indicator */}
                                                    <motion.div
                                                        className={`absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white transition-colors ${mode === "office" ? "bg-blue-500" : "bg-green-500"}`}
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
                                                {/* User info */}
                                                <div>
                                                    <div className="flex space-x-4 mt-1">
                                                        <motion.div
                                                            className="flex flex-col text-center"
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.3, duration: 0.5 }}
                                                        >
                                                            <span className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>Attendance</span>
                                                            <span className="font-semibold text-green-600 text-xl">{`100%`}</span>
                                                        </motion.div>
                                                        <motion.div
                                                            className="flex flex-col text-center"
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.4, duration: 0.5 }}
                                                        >
                                                            <span className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>Avg. Hours</span>
                                                            <span className="font-semibold text-blue-600 text-xl">{`10h 9m`}</span>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Mode selector with animated pop-up */}
                                        <div className="absolute top-1 right-1 z-20">
                                            <div className="relative">
                                                <motion.button
                                                    onClick={() => setShowModeConfirm(!showModeConfirm)}
                                                    className="px-4 py-2.5 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300 flex items-center justify-center gap-2 text-sm font-medium shadow-sm border border-blue-300 transition-transform hover:scale-105 duration-300"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    {/* Mode icon */}
                                                    {mode === "office" ? (
                                                        <motion.div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center" whileHover={{ rotate: 360 }}>
                                                            <FaBuilding className="text-white text-xs" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center" whileHover={{ rotate: 360 }}>
                                                            <FaHome className="text-white text-xs" />
                                                        </motion.div>
                                                    )}
                                                    <span className="capitalize">{mode}</span>
                                                    <motion.svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 ml-1 transition-transform duration-200"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        initial={{ rotate: 0 }}
                                                        animate={{ rotate: showModeConfirm ? 180 : 0 }}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </motion.svg>
                                                </motion.button>

                                                {/* Mode confirmation popup with smooth animation */}
                                                <AnimatePresence>
                                                    {showModeConfirm && (
                                                        <motion.div
                                                            className={`absolute top-full right-0 mt-2 w-52 p-3  border border-gray-300 rounded-xl shadow-lg z-30 ${theme === 'dark'? 'bg-gray-800 text-white': 'bg-white text-gray-800'}`}
                                                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                        >
                                                            <p className="text-gray-700 font-medium text-sm mb-3 text-center">
                                                                Switch to {mode === "office" ? "Remote" : "Office"} mode?
                                                            </p>
                                                            <div className="flex space-x-2">
                                                                <motion.button
                                                                    onClick={() => handleModeChange(mode === "office" ? "home" : "office")}
                                                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-colors font-semibold"
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    Confirm
                                                                </motion.button>
                                                                <motion.button
                                                                    onClick={() => setShowModeConfirm(false)}
                                                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                                                    whileHover={{ scale: 1.05 }}
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

                                        {/* Welcome message */}
                                        <motion.div
                                            className="text-start mb-2 relative z-8 px-2"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5, duration: 0.5 }}
                                        >
                                            <h2 className={`text-2xl font-medium  mb-2 ${theme === 'dark'? 'text-white': 'text-gray-800'}`}>    {`Welcome, ${userData?.fullName}`}</h2>
                                        </motion.div>

                                        {/* Divider with animated underline */}
                                        <div className="relative my-3 w-full flex justify-center">
                                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                <motion.div
                                                    className="w-full border-t border-gray-300"
                                                    initial={{ scaleX: 0 }}
                                                    animate={{ scaleX: 1 }}
                                                    transition={{ delay: 0.6, duration: 0.8 }}
                                                    style={{ transformOrigin: "left" }}
                                                />
                                            </div>
                                            <span className={`px-3  text-md  font-medium z-10 ${theme === 'dark'? 'bg-gray-700 text-white': 'bg-white text-gray-500'}`}>TIME TRACKING</span>
                                        </div>

                                        {/* Time display section */}
                                        <div className="w-full flex flex-col items-center text-center mb-4 relative z-10">
                                            {/* Current Time */}
                                            <div className="mb-4">
                                                <motion.div
                                                    className="flex items-center justify-center gap-2 text-indigo-600 font-medium mb-2"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.8, duration: 0.5 }}
                                                >
                                                    <ClockIcon className="w-5 h-5 text-indigo-500" />
                                                    <span>Current Time</span>
                                                </motion.div>
                                                <motion.p
                                                    className={`text-2xl font-bold  tracking-wide mb-1 ${theme === 'dark'? 'text-white': 'text-gray-900'}`}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 1, duration: 0.5 }}
                                                >
                                                    {formatClockTime(currentTime)}
                                                </motion.p>
                                                <motion.p
                                                    className={`text-sm  ${theme === 'dark'? 'text-white': 'text-gray-500'}`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 1.2, duration: 0.5 }}
                                                >
                                                    {currentTime.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                                                </motion.p>
                                            </div>
                                            {/* Metrics Cards */}
                                            <div className="grid grid-cols-2 gap-4 w-full max-w-md px-2">
                                                {/* Gross Time Card */}
                                                <motion.div
                                                    className={` rounded-xl p-4 shadow-sm  ${theme === 'dark'? 'bg-gray-800 text-white border-gray-600': 'bg-gradient-to-br from-purple-50 to-purple-100 border border-gray-300'}`}
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                >
                                                    <p className={`text-sm  font-medium mb-2 ${theme === 'dark'? 'text-blue-300': 'text-gray-600'}`}>Gross Time</p>
                                                    <p className={`text-xl font-semibold ${theme === 'dark'? 'text-white': 'text-purple-700 '}`}>{grossHoursFormatted}</p>
                                                </motion.div>
                                                {/* Effective Time Card */}
                                                <motion.div
                                                    className={` ${theme === 'dark'? 'bg-gray-800 text-white border-gray-600': 'bg-gradient-to-br from-pink-50 to-pink-100 border border-gray-300'} rounded-xl p-4 shadow-sm border border-gray-300`}
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ type: "spring", stiffness: 300 }}
                                                >
                                                    <p className={`text-sm font-medium mb-2 ${theme === 'dark'? 'text-blue-300': 'text-gray-600'}`}>Effective Time</p>
                                                    <p className={`text-xl font-semibold  ${theme === 'dark'? 'text-white': 'text-orange-700 '}`}>{effectiveHoursFormatted}</p>
                                                </motion.div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="relative my-2 w-24 mx-auto">
                                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                <motion.div
                                                    className="w-full border-t border-gray-300"
                                                    initial={{ scaleX: 0 }}
                                                    animate={{ scaleX: 1 }}
                                                    transition={{ delay: 1.4, duration: 0.8 }}
                                                />
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="w-full flex justify-center mt-4 relative z-10">
                                            {!isLoggedIn ? (
                                                <motion.button
                                                    onClick={handleLogin}
                                                    className="flex items-center justify-center w-48 max-w-md py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:from-green-500 hover:to-green-600 font-semibold text-lg"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <ClockIcon className="w-5 h-5 mr-2" />
                                                    Clock In
                                                </motion.button>
                                            ) : (
                                                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
                                                    <AnimatePresence mode="wait">
                                                        {isLogoutConfirmed ? (
                                                            <>
                                                                <motion.button
                                                                    key="confirm"
                                                                    onClick={handleConfirmLogout}
                                                                    className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold"
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    exit={{ opacity: 0, x: -20 }}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    <ClockIcon className="w-4 h-4 mr-2" />
                                                                    Confirm Logout
                                                                </motion.button>
                                                                <motion.button
                                                                    key="cancel"
                                                                    onClick={handleCancel}
                                                                    className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-xl shadow-sm hover:bg-gray-300 transition-all duration-200"
                                                                    initial={{ opacity: 0, x: 20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    exit={{ opacity: 0, x: 20 }}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    <XCircleIcon className="w-4 h-4 mr-2" />
                                                                    Cancel
                                                                </motion.button>
                                                            </>
                                                        ) : (
                                                            <motion.button
                                                                key="logout"
                                                                onClick={handleLogout}
                                                                className="flex items-center justify-center w-48 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 font-semibold"
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                            >
                                                                <ClockIcon className="w-5 h-5 mr-2" />
                                                                Clock Out
                                                            </motion.button>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>


                                {/* Stat Cards Grid */}
                                <motion.div
                                    className="p-6 h-full flex flex-col justify-between"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 h-full">
                                        {cardData.map((card, index) => {
                                            let icon, iconBgColor, iconTextColor;
                                            switch (card.description) {
                                                case "Total Hours Today": icon = <ClockIcon className="w-6 h-6" />; iconBgColor = "bg-purple-100"; iconTextColor = "text-purple-500"; break;
                                                case "Total Hours Week": icon = <CalendarDaysIcon className="w-6 h-6" />; iconBgColor = "bg-teal-100"; iconTextColor = "text-teal-500"; break;
                                                case "Total Hours Month": icon = <BriefcaseIcon className="w-6 h-6" />; iconBgColor = "bg-blue-100"; iconTextColor = "text-blue-500"; break;
                                                case "Overtime this Month": icon = <TrendingUpIcon className="w-6 h-6" />; iconBgColor = "bg-pink-100"; iconTextColor = "text-pink-500"; break;
                                                default: icon = <BriefcaseIcon className="w-6 h-6" />; iconBgColor = "bg-gray-100"; iconTextColor = "text-gray-900";
                                            }
                                            return <StatCard key={index} icon={icon} iconBgColor={iconBgColor} iconTextColor={iconTextColor} value={card.value} description={card.description} trend={card.trend} trendPercentage={card.trendPercentage} trendPeriod={card.trendPeriod} />;
                                        })}
                                    </div>
                                </motion.div>
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
                                        {dates.map((date) => {
                                            const pieItem = rawPieData.find((item) => item.Date === date);
                                            const barItem = barChartData.find((item) => item.Date === date);
                                            // Prefer pieItem, fallback to barItem, else just use the date
                                            const dataItem = pieItem || barItem;
                                            const dateToSet = date === "All" ? "All" : (dataItem ? `${dataItem.Date}-${dataItem.Month}-${dataItem.Year}` : date);
                                            return (
                                                <motion.button
                                                    key={date}
                                                    onClick={() => setSelectedDate(dateToSet)}
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full text-base sm:text-sm font-small flex items-center justify-center ${selectedDate === dateToSet ? "bg-indigo-600 text-white shadow-md" : "bg-gray-200 text-gray-700"} ${theme === 'dark' ? (selectedDate === dateToSet ? "bg-indigo-500 text-white shadow-md" : "bg-gray-400 text-gray-300") : ""} cursor-pointer hover:bg-indigo-500 hover:text-white transition-colors duration-200 ease-in-out`}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    {date === "All" ? "All" : date}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                    <MyComponent Data={Data} selectedDate={selectedDate} />
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
                                                <XAxis dataKey="Date" axisLine={false} tickLine={false} padding={{ left: 10, right: 10 }}  tickFormatter={(tick, index) => filteredBarChartData[index] ? `${filteredBarChartData[index].Date}-${filteredBarChartData[index].Month}` : tick } className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}/>
                                                <YAxis allowDecimals={false} hide />
                                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                                                <Bar dataKey="Working_hour" stackId="a" fill={BAR_COLORS.work} name="Work Hours" />
                                                <Bar dataKey="Break_hour" stackId="a" fill={BAR_COLORS.break} name="Break Hours" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.section>
                            </div>
                            {/* Attendance Records Table */}
                            <motion.div
                                className={`p-4 sm:p-6  rounded-xl border border-gray-200 shadow-lg mb-8 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-stone-100 text-gray-800'}`}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1 }}
                            >
                                <section>
                                    <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                                        <h2 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'bg-gradient-to-br from-green-200 to-green-600 bg-clip-text text-transparent' : 'text-gray-800'}`}>
                                            <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 inline-block text-blue-600 mr-2" /> Attendance Records
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <FilterButtonGroup options={MONTHS} selectedOption={selectedMonth} onSelect={(month) => { setSelectedMonth(month); setCurrentPage(1); }} />
                                            <div className="relative">
                                                <label className={`text-sm font-semibold mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Sort by:</label>
                                                <select value={sortOption} onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }} className={`border border-gray-300 px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white text-gray-800'}`}>
                                                    {sortOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className={`${theme === 'dark' ? 'bg-gray-500 text-white' : 'bg-gray-50 text-gray-800'}`}>
                                                <tr>
                                                    <th scope="col" className={`px-4 py-3 text-left text-xs sm:text-sm font-medium  uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}><div className="flex items-center gap-2"><CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" /> Date</div></th>
                                                    <th scope="col"className={`px-4 py-3 text-left text-xs sm:text-sm font-medium  uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}><div className="flex items-center gap-2"><ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> Login Time</div></th>
                                                    <th scope="col" className={`px-4 py-3 text-left text-xs sm:text-sm font-medium  uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}><div className="flex items-center gap-2"><ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" /> Logout Time</div></th>
                                                    <th scope="col" className={`px-4 py-3 text-left text-xs sm:text-sm font-medium  uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Login Hours</th>
                                                    <th scope="col" className={`px-4 py-3 text-left text-xs sm:text-sm font-medium  uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Daily Progress</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`${theme === 'dark' ? 'bg-gray-500 text-white' : 'bg-gray-50 text-gray-800'} divide-y divide-gray-200`}>
                                                <AnimatePresence>
                                                    {paginatedData.length > 0 ? (
                                                        paginatedData.map((entry, idx) => (
                                                            <motion.tr
                                                                key={idx}
                                                                className="hover:bg-indigo-200 transition-colors duration-150"
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -20 }}
                                                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                                            >
                                                                <td className={`px-4 py-3 text-sm  whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{entry.date}</td>
                                                                <td className={`px-4 py-3 text-sm  whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{entry.login_time || <span className="text-red-500 font-semibold">Absent</span>}</td>
                                                                <td className={`px-4 py-3 text-sm  whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{entry.logout_time || <span className="text-red-500 font-semibold">Absent</span>}</td>
                                                                <td className={`px-4 py-3 text-sm  whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}><span className={`font-semibold text-indigo-700 ${theme === 'dark' ? 'text-white' : 'text-indigo-700'}`}>{entry.login_hours.toFixed(2)}</span> hrs</td>
                                                                <td className={`px-4 py-3 text-sm  whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                                                                    <div className="relative rounded-full h-4 w-full bg-indigo-100 overflow-hidden">
                                                                        <motion.div
                                                                            className="bg-indigo-500 h-full rounded-full"
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: entry.barWidth }}
                                                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                                                        />
                                                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white mix-blend-difference">{entry.login_hours.toFixed(1)}h</span>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan="5"className={`px-4 py-3 text-center  whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-600'}italic`}>No attendance records found for the selected options.</td></tr>
                                                    )}
                                                </AnimatePresence>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
                                        <div className="flex items-center gap-2 mb-4 sm:mb-0">
                                            <span className={`text-sm text-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Rows per page:</span>
                                            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className={`border border-gray-300 px-2 py-1 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white text-gray-800'}`}>
                                                {rowsPerPageOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                            </select>
                                        </div>
                                        <nav className="flex items-center gap-2">
                                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-4 py-2 text-sm font-medium  border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500 hover:bg-gray-500' : 'bg-white text-gray-800'} `}>Previous</button>
                                            <span  className={`text-sm text-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Page {currentPage} of {totalPages}</span>
                                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`px-4 py-2 text-sm font-medium  border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500 hover:bg-gray-500' : 'bg-white text-gray-800'} `}>Next</button>
                                        </nav>
                                    </div>
                                </section>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AttendancesDashboard;