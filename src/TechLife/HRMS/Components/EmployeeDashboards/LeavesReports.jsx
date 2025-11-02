import React, { useContext, useState } from 'react';
import { CircleUserRound, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, } from "recharts";
import { FaFileAlt, FaRegUser, FaUserEdit, FaUsers } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { Context } from '../HrmsContext';
import { FaRegCircleXmark } from "react-icons/fa6";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/solid'; // Using Heroicons for arrows
import { useEffect } from 'react';
import axios from 'axios';

const Attendance = () => {
    const navigate = useNavigate();
    const [selectedPeriod, setSelectedPeriod] = useState('Today');
    const totalAttendance = 104;
    const data = [
        { name: 'Present', value: 60 },
        { name: 'Late', value: 20 },
        { name: 'Permission', value: 20 },
        { name: 'Absent', value: 4 },
    ];
    const statusColorMap = {
        "Present": "text-green-600",
        "Late": "text-blue-600",
        "Permission": "text-yellow-600",
        "Absent": "text-red-600",
    };
    const color = ["#4CAF50", "#2196F3", "#FFC107", "#EF5350"];

    const chartData = [...data];
    const { theme } = useContext(Context);

    return (
        <motion.div
            className={` p-2 rounded-xl shadow-md border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 ease-in-out h-full ${theme === 'dark' ? 'bg-gray-600 ' : 'bg-stone-100 '}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'bg-gradient-to-br from-orange-100 to-orange-400 bg-clip-text text-transparent border-gray-100' : 'text-gray-800 '}`}>
                    Attendance Overview</h2>
                <div className="relative inline-block text-left mt-1">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className={`inline-flex justify-center w-full rounded-md border border-gray-200 shadow-sm px-4 py-2  text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-600 text-white  hover:bg-gray-500' : 'bg-white text-gray-700'}`}
                    >
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>Last Month</option>
                    </select>
                </div>
            </div>
            <div className="relative h-48 -mt-10">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={80}
                            outerRadius={140}
                            paddingAngle={2}
                            dataKey="value"
                            cornerRadius={5}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={color[index % color.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-18">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white ' : 'text-gray-500 '}`}> Total Attendance</p>
                    <p className={`text-4xl font-bold ${theme === 'dark' ? 'text-white ' : 'text-gray-800 '}`}>{totalAttendance}</p>
                </div>
            </div>
            <hr className="my-6 border-gray-200" />
            <div className="flex justify-between items-start">
                <div>
                    <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white ' : 'text-gray-800 '}`}>Status</h3>
                    <ul className="space-y-2">
                        <AnimatePresence>
                            {data.map((item, index) => (
                                <motion.li
                                    key={item.name}
                                    className={`flex items-center  font-medium ${theme === 'dark' ? 'text-white ' : statusColorMap[item.name] || 'text-gray-700 '}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <span
                                        className="inline-block h-3 w-3 rounded-full mr-3 ring-2 ring-white"
                                        style={{ backgroundColor: color[index % color.length] }}
                                    ></span>
                                    {item.name}
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                </div>
                <div className="text-right">
                    <h3 className={`text-lg font-semibold  mb-2 ${theme === 'dark' ? 'text-white ' : 'text-gray-800 '}`}>
                        Percentage</h3>
                    <ul className="space-y-2">
                        <AnimatePresence>
                            {data.map((item, index) => (
                                <motion.li
                                    key={item.name}
                                    className={`  font-bold ${theme === 'dark' ? 'text-white ' : 'text-gray-700 '}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {item.value}%
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                </div>
            </div>
        </motion.div>
    );
};


// Mock imports for demonstration
const ClockIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.87 14.13H11.5v-6h1.37v6zM12 5.5c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5zm.5 1.5h-1v5.25l4.5 2.62.75-1.35-3.5-2.02V7z" /></svg>;

const onTimeDate = [
    { Month: "Aug", Year: "25", NoofEmployee: 100 },
    { Month: "Sept", Year: "25", NoofEmployee: 120 },
    { Month: "Oct", Year: "25", NoofEmployee: 80 },
    { Month: "Nov", Year: "25", NoofEmployee: 150 },
    { Month: "Dec", Year: "25", NoofEmployee: 7 },
];

const EmployeeBarChart = () => {
    const [selectedYear, setSelectedYear] = useState('This Year');
    const { theme } = useContext(Context);
    const filteredData = onTimeDate;
    const formattedData = filteredData.map((item) => ({
        name: `${item.Month}-${item.Year}`,
        employees: item.NoofEmployee,
    }));

    const textColor = theme === 'dark' ? "#FFFFFF" : "#000000";
    const barColor = "#ADD8E6"; // Light Blue

    const selectedBtnClass = "bg-blue-600 text-white shadow-md";
    const unselectedBtnClass = theme === 'dark' ? "bg-gray-600 text-gray-200 hover:bg-gray-500" : "bg-white text-gray-700 hover:bg-gray-100";

    return (
        <motion.div
            className={` rounded-xl  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md p-4 w-full font-sans border border-gray-200 h-96 flex flex-col ${theme === 'dark' ? 'bg-gray-700 text-gray-200 ' : 'bg-stone-100 text-gray-800'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0.5, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >

            <div className="flex justify-between items-center mb-4">

                <div className="flex items-center">
                    <ClockIcon className="w-6 h-6 text-blue-600 inline-block mr-2" />
                    <h2 className="text-xl font-semibold text-start">No of Leaves Taken</h2>
                </div>


                <div className="flex p-0.5 rounded-lg border border-gray-300">

                    <button
                        className={`text-xs py-1 px-3 rounded-md transition-colors duration-200 ${selectedYear === 'This Year' ? selectedBtnClass : unselectedBtnClass}`}
                        onClick={() => setSelectedYear('This Year')}
                    >
                        This Year
                    </button>

                    <button
                        className={`text-xs py-1 px-3 rounded-md transition-colors duration-200 ${selectedYear === 'Last Year' ? selectedBtnClass : unselectedBtnClass}`}
                        onClick={() => setSelectedYear('Last Year')}
                    >
                        Last Year
                    </button>
                </div>
            </div>

            {/* Bar Chart Container */}
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                    data={formattedData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}

                >
                    <XAxis dataKey="name" stroke={textColor} tick={{ fill: textColor }} />
                    <YAxis stroke={textColor} tick={{ fill: textColor }} hide />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: theme === 'dark' ? "#63676cff" : "#fff",
                            border: theme ? "1px solid #4B5563" : "1px solid #ccc"
                        }}
                    />
                    <Bar dataKey="employees" fill={barColor} />
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
};




const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthDirection, setMonthDirection] = useState(0);
    const { theme } = useContext(Context);
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const today = new Date();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


    const leadingEmptyCells = Array.from({ length: firstDay }, (_, i) => i);


    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handlePrevMonth = () => {
        setMonthDirection(-1);
        setCurrentDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setMonthDirection(1);
        setCurrentDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };


    const calendarVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    return (
        <div className={`flex justify-center rounded-xl items-center  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-600 ' : 'bg-stone-100 '} p-2`}>
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full h-96 transform transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0 }}
            >
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePrevMonth}
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.h2
                        key={month + '-' + year}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex-grow text-center"
                    >
                        {monthNames[month]} {year}
                    </motion.h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleNextMonth}
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <ChevronRightIcon className="h-5 w-5" />
                    </motion.button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1 p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    {dayNames.map((day, index) => (
                        <div key={index} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <AnimatePresence initial={false} custom={monthDirection}>
                    <motion.div
                        key={month + '-' + year} // Key for month animation
                        custom={monthDirection}
                        variants={calendarVariants}
                        initial="enter"
                        animate="center"

                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="grid grid-cols-7 gap-1 p-4"
                    >
                        {/* Empty leading cells */}
                        {leadingEmptyCells.map((_, index) => (
                            <div key={`empty-${index}`} className="h-10"></div>
                        ))}

                        {/* Actual days */}
                        {days.map((day) => {
                            const isToday =
                                day === today.getDate() &&
                                month === today.getMonth() &&
                                year === today.getFullYear();
                            const isWeekend =
                                (firstDay + day - 1) % 7 === 0 || (firstDay + day - 1) % 7 === 6; // Sunday or Saturday

                            return (
                                <div
                                    key={day}
                                    className={`flex items-center justify-center h-10 w-10  rounded-full text-gray-800 dark:text-gray-200 cursor-pointer 
                              ${isToday ? 'bg-blue-600 text-white font-bold shadow-md transform scale-110' : ''}
                              ${!isToday && !isWeekend ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                              ${!isToday && isWeekend ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                              ${isToday ? 'relative z-10' : ''}
                              transition-all duration-200 ease-in-out
                              `}
                                >
                                    {day}
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
//const Data = [
//    {
//        title: "Total Present",
//        value: "104/108",
//    },
//    {
//        title: "Paid Leaves",
//        value: "10",
//    },
//    {
//        title: "Unpaid Leaves",
//        value: "10",
//    },
//    {
//        title: "Sick leaves",
//        value: "15",
//    },
//    {
//        title: "Pending Request",
//        value: "15",
//    }
//];

const ChartCard = ({ title, icontextcolor, value, icon, color, }) => {
    const { theme } = useContext(Context);
    return (
        <motion.div
            className={` rounded-xl p-2 shadow-md border border-gray-200 hover:border-blue-500 hover:shadow-xl   transition-shadow duration-300 h-full flex flex-col items-center justify-center text-center  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-500 ' : 'bg-stone-100 '}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-2 p-3 ${color}  ${icontextcolor}`}>
                {React.cloneElement(icon, { className: `w-8 h-8 rounded-full` })}
            </div>
            <div>
                <h3 className={`text-xl font-semibold  ${theme === 'dark' ? 'text-white ' : 'text-gray-800 '}`}>{title}</h3>
                <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white ' : 'text-gray-800 '}`}>{value}</p>
            </div>
        </motion.div>
    );
};

const LeaveCharts = ({ start, end }) => {
    const { theme } = useContext(Context);
    const [items, setItems] = useState([]);
    const [loadingCards, setLoadingCards] = useState(false);
    const [errorCards, setErrorCards] = useState(null);

    const fetchSummary = async (s = start, e = end) => {
        setLoadingCards(true);
        setErrorCards(null);
        try {
            const url = "https://hrms.anasolconsultancyservices.com/api/attendance/attendance-summary-between-dates";
            const resp = await axios.get(url, { params: { start: s, end: e } });
            let payload = resp?.data;

            // payload may be an array (per-day) or single aggregated object — normalize to aggregated totals
            const aggregate = {
                present: 0,
                absent: 0,
                paidApprovedLeaves: 0,
                paidUnapprovedLeaves: 0,
                unpaidApprovedLeaves: 0,
                unpaidUnapprovedLeaves: 0,
                sickApprovedLeaves: 0,
                sickUnapprovedLeaves: 0,
                casualApprovedLeaves: 0,
                casualUnapprovedLeaves: 0,
                approvedLeaves: 0,
                pendingLeaves: 0,
            };

            if (Array.isArray(payload)) {
                // sum numeric fields across array
                payload.forEach((row) => {
                    Object.keys(aggregate).forEach((k) => {
                        const val = Number(row[k] ?? row[k.replace('Approved', '')] ?? 0);
                        aggregate[k] += isNaN(val) ? 0 : val;
                    });
                    // handle legacy keys that may differ
                    aggregate.sickApprovedLeaves += Number(row.sickLeaves ?? 0) || 0;
                    aggregate.present += Number(row.present ?? 0) || 0;
                    aggregate.absent += Number(row.absent ?? 0) || 0;
                });
            } else if (payload && typeof payload === "object") {
                // single object — use values (fallbacks for key name differences)
                aggregate.present = Number(payload.present ?? payload.totalPresent ?? 0);
                aggregate.absent = Number(payload.absent ?? 0);
                aggregate.paidApprovedLeaves = Number(payload.paidApprovedLeaves ?? payload.paidApproved ?? 0);
                aggregate.paidUnapprovedLeaves = Number(payload.paidUnapprovedLeaves ?? payload.paidUnapproved ?? 0);
                aggregate.unpaidApprovedLeaves = Number(payload.unpaidApprovedLeaves ?? payload.unpaidApproved ?? 0);
                aggregate.unpaidUnapprovedLeaves = Number(payload.unpaidUnapprovedLeaves ?? payload.unpaidUnapproved ?? 0);
                aggregate.sickApprovedLeaves = Number(payload.sickApprovedLeaves ?? payload.sickLeaves ?? 0);
                aggregate.sickUnapprovedLeaves = Number(payload.sickUnapprovedLeaves ?? 0);
                aggregate.casualApprovedLeaves = Number(payload.casualApprovedLeaves ?? 0);
                aggregate.casualUnapprovedLeaves = Number(payload.casualUnapprovedLeaves ?? 0);
                aggregate.approvedLeaves = Number(payload.approvedLeaves ?? 0);
                aggregate.pendingLeaves = Number(payload.pendingLeaves ?? 0);
            }

            // Build display items as requested (present/absent, paidApproved/paidUnapproved, ...)
            const cardData = [
                { title: "Total Present", value: `${aggregate.present}/${aggregate.absent}`, color: "bg-green-100", icon: <FaUsers className="w-4 h-4 text-white" />, icontextcolor: "text-green-300" },
                { title: "Paid Leaves", value: `${aggregate.paidApprovedLeaves}/${aggregate.paidUnapprovedLeaves}`, color: "bg-pink-100", icon: <FaRegUser className="w-4 h-4 text-white" />, icontextcolor: "text-pink-300" },
                { title: "Unpaid Leaves", value: `${aggregate.unpaidApprovedLeaves}/${aggregate.unpaidUnapprovedLeaves}`, color: "bg-yellow-100", icon: <FiUser className="w-4 h-4 text-white" />, icontextcolor: "text-yellow-300" },
                { title: "Sick leaves", value: `${aggregate.sickApprovedLeaves}/${aggregate.sickUnapprovedLeaves}`, color: "bg-purple-100", icon: <FiUser className="w-4 h-4 text-white" />, icontextcolor: "text-purple-300" },
                { title: "Casual Leaves", value: `${aggregate.casualApprovedLeaves}/${aggregate.casualUnapprovedLeaves}`, color: "bg-blue-100", icon: <FaUserEdit className="w-4 h-4 text-white" />, icontextcolor: "text-blue-300" },
                { title: "Pending", value: `${aggregate.approvedLeaves}/${aggregate.pendingLeaves}`, color: "bg-gray-100", icon: <CircleUserRound className="w-4 h-4 text-white" />, icontextcolor: "text-gray-300" },
            ];

            setItems(cardData);
        } catch (err) {
            console.error("Failed to fetch attendance summary:", err?.response ?? err);
            setErrorCards(err?.response?.data ?? err?.message ?? "Failed to load summary");
            setItems([]);
        } finally {
            setLoadingCards(false);
        }
    };

    useEffect(() => {
        if (start && end) fetchSummary(start, end);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [start, end]);

    return (
        <motion.div
            className="p-6 h-full flex flex-col justify-between"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-7 gap-6 h-full">
                <EmployeePieChart start={start} end={end} />
                {loadingCards ? (
                    <div className="col-span-full text-center">Loading summary…</div>
                ) : errorCards ? (
                    <div className="col-span-full text-center text-red-600">Error: {String(errorCards)}</div>
                ) : (
                    items.map((data, index) => (
                        <ChartCard
                            key={index}
                            icon={data.icon}
                            color={data.color}
                            icontextcolor={data.icontextcolor}
                            value={data.value}
                            title={data.title}
                        />
                    ))
                )}
            </div>
        </motion.div>
    );
};
//const piechartData = [
//  { title: "Total Present", value: 104 },
//  { title: "Paid Leaves ", value: 10 },
//  { title: "Unpaid Leaves", value: 6 },
//  { title:"Sick leaves", value: 5 },
//  { title: "Pending Request", value: 10 },
//];

const COLORS = ["#3B82F6", "#F59E0B", "#EF4444", "#84CC16", "#6B7280"];

const EmployeePieChart = ({ start, end }) => {
    const { theme } = useContext(Context);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const fetchSummary = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = "https://hrms.anasolconsultancyservices.com/api/attendance/attendance-summary-between-dates";
                const resp = await axios.get(url, { params: { start, end } });
                const payload = resp?.data;

                // payload may be array of day objects or single aggregated object — reduce to totals
                const aggregate = (Array.isArray(payload) ? payload : [payload]).reduce((acc, row = {}) => {
                    acc.present += Number(row.present ?? 0);
                    acc.paid += Number(row.paidApprovedLeaves ?? 0);
                    acc.unpaid += Number(row.unpaidApprovedLeaves ?? 0);
                    acc.sick += Number(row.sickLeaves ?? row.sickLeaves ?? 0);
                    acc.casual += Number(row.casualApprovedLeaves ?? 0);
                    acc.pending += Number(row.pendingLeaves ?? 0);
                    return acc;
                }, { present: 0, paid: 0, unpaid: 0, sick: 0, casual: 0, pending: 0 });

                const data = [
                    { title: "Present", value: aggregate.present },
                    { title: "Paid Leaves", value: aggregate.paid },
                    { title: "Unpaid Leaves", value: aggregate.unpaid },
                    { title: "Sick Leaves", value: aggregate.sick },
                    { title: "Casual Leaves", value: aggregate.casual },
                    { title: "Pending", value: aggregate.pending },
                ];

                if (!cancelled) setChartData(data);
            } catch (err) {
                if (!cancelled) setError(err?.response?.data ?? err.message ?? "Failed to load");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchSummary();
        return () => { cancelled = true; };
    }, [start, end]);

    const textColor = theme === 'dark' ? "#FFFFFF" : "#000000";

    if (loading) {
        return <div className="flex items-center justify-center p-4">Loading...</div>;
    }
    if (error) {
        return <div className="text-sm text-red-600 p-2">Error loading chart</div>;
    }

    return (
        <div className="flex justify-center items-center">
            <PieChart width={180} height={180}>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="title"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-lg font-small`}
                    stroke={textColor}
                >
                    Leaves
                </text>
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()}`} />
            </PieChart>
        </div>
    );
};
//const currentLeaveHistoryData = [
//    {
//        EmployeeId: "E_01",
//        Leave_type: "Unpaid Leave",
//        Leave_On: ["2025/07/10", "-", "2025/05/12"],
//        status: "Reject",
//        Request_By: "Panalisation Policy",
//        Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//        Action_Date: "2025/07/12",
//        Rejection_Reason: "Taking Continues leave in every month",
//        Action: "https://icons8.com/icon/36944/ellipsis",
//    },
//    {
//        EmployeeId: "E_02",
//        Leave_type: "Sick Leave",
//        Leave_On: ["2025/07/20"],
//        Days: 1,
//        status: "Approve",
//        Request_By: "Panalisation Policy",
//        Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//        Action_Date: "2025/07/22",
//        Rejection_Reason: null,
//        Action: "https://icons8.com/icon/36944/ellipsis",
//    },
//    {
//        EmployeeId: "E_03",
//        Leave_type: "Sick Leave",
//        Leave_On: ["2025/06/22", "-", "2025/06/24"],
//        status: "Approve",
//        Request_By: "Panalisation Policy",
//        Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//        Action_Date: "2025/06/26",
//        Rejection_Reason: null,
//        Action: "https://icons8.com/icon/36944/ellipsis",
//    },
//    {
//        EmployeeId: "E_04",
//        Leave_type: "Casual Leave",
//        Leave_On: ["2025/06/01"],
//        status: "Approve",
//        "Request By": "Panalisation Policy",
//        Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//        Action_Date: "2025/06/03",
//        Rejection_Reason: null,
//        Action: "https://icons8.com/icon/36944/ellipsis",
//    },
//    {
//        EmployeeId: "E_05",
//        Leave_type: "Sick Leave",
//        Leave_On: ["2025/05/22", "-", "2025/05/23"],
//        status: "Approve",
//        Request_By: "Panalisation Policy",
//        Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//        Action_Date: "2025/05/24",
//        Rejection_Reason: null,
//        Action: "https://icons8.com/icon/36944/ellipsis",
//    },
//    {
//        EmployeeId: "E_06",
//        Leave_type: "Casual Leave",
//        Leave_On: ["2025/05/12"],
//        status: "Approve",
//        Request_By: "Panalisation Policy",
//        Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//        Action_Date: "2025/05/14",
//        Rejection_Reason: null,
//        Action: "https://icons8.com/icon/36944/ellipsis",
//    },
//    {
//        EmployeeId: "E_07",
//        Leave_type: "Unpaid Leave",
//        Leave_On: ["2025/04/01", "-", "2025/04/02"],
//        status: "Approve",
//        Request_By: "Panalisation Policy",
//        Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//        Action_Date: "2025/04/03",
//        Rejection_Reason: null,
//        Action: "https://icons8.com/icon/36944/ellipsis",
//    },
//    {
//        EmployeeId: "E_08",
//        Leave_type: "Casual Leave",
//        Leave_On: ["2025/04/01"],
//        status: "Approve",
//        Request_By: "Panalisation Policy",
//        Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//        Action_Date: "2025/07/12",
//        Rejection_Reason: null,
//        Action: "https://icons8.com/icon/36944/ellipsis",
//    },
//    {
//        EmployeeId: "E_09",
//        Leave_type: "Paid Leave",
//        Leave_On: ["2025/03/10"],
//        status: "Approve",
//        Request_By: "Panalisation Policy",
//        Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//        Action_Date: "2025/03/12",
//        Rejection_Reason: null,
//        Action: "https://icons8.com/icon/36944/ellipsis",
//    },
//    {
//        EmployeeId: "E_10",
//        Leave_type: "Paid Leave",
//        Leave_On: ["2025/03/20"],
//        status: "Approve",
//        Request_By: "Panalisation Policy",
//        Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//        Action_Date: "2025/03/22",
//        Rejection_Reason: null,
//        Action: "https://icons8.com/icon/36944/ellipsis",
//    },
//];

//const LeaveHistory = ({ leaveHistoryData,setLeaveHistoryData}) => {
//    const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
//    const [statusFilter, setStatusFilter] = useState("All");
//    const [sortOption, setSortOption] = useState("Recently added");
//    const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//       const rowsPerPageOptions = [10, 25, 50, 100];
//    const [isLoading, setIsLoading] = useState(false);
//    const { empID } = useParams();
//    const [actionLeave, setActionLeave] = useState(null);
//    const [actionType, setActionType] = useState(""); // "approve" or "reject"
//    const [rejectionReason, setRejectionReason] = useState("");
//    const [selectedLeave, setSelectedLeave] = useState(null);
//    const { userData } = useContext(Context);
//    
//    const handleAction = (status, reason = "") => {
//      setLeaveHistoryData(prev =>
//        prev.map(leave =>
//          leave === actionLeave
//            ? {
//                ...leave,
//                status,
//                Granted_By: status === "Approve" ? "Granted By " + (userData?.roles?.[0] || "Admin")  : leave.Granted_By,
//                Rejection_Reason: status === "Reject" ? reason : leave.Rejection_Reason,
//              }
//            : leave
//        )
//      );
//    };
//    const handleDetailsClick = (leave) => {
//      setSelectedLeave(leave);
//    };
//    
//    const handleCloseModal = () => {
//      setSelectedLeave(null);
//   };
//    const leaveTypes = ["All", ...new Set(leaveHistoryData.map((d) => d.Leave_type))];
//    const statuses = ["All", ...new Set(leaveHistoryData.map((d) => d.status))];
//    const sortOptions = ["Recently added", "Ascending", "Descending", "Last Month", "Last 7 Days"];
//
//    const filterAndSortData = () => {
//        let data = [...leaveHistoryData];
//        data = data.filter((item) => {
//            return (
//                (leaveTypeFilter === "All" || item.Leave_type === leaveTypeFilter) &&
//                (statusFilter === "All" || item.status === statusFilter)
//            );
//        });
//        switch (sortOption) {
//            case "Ascending":
//                data.sort((a, b) => a.Leave_type.localeCompare(b.Leave_type));
//                break;
//            case "Descending":
//                data.sort((a, b) => b.Leave_type.localeCompare(a.Leave_type));
//                break;
//            case "Last Month":
//                const lastMonth = new Date();
//                lastMonth.setMonth(lastMonth.getMonth() - 1);
//                data = data.filter((item) => new Date(item.Leave_On) >= lastMonth);
//                break;
//            case "Last 7 Days":
//                const last7Days = new Date();
//                last7Days.setDate(last7Days.getDate() - 7);
//                data = data.filter((item) => new Date(item.Leave_On) >= last7Days);
//                break;
//            case "Recently added":
//            default:
//                data.sort((a, b) => new Date(b.Action_Date) - new Date(a.Action_Date));
//                break;
//        }
//        return data;
//    };
//
//    const filteredAndSortedData = filterAndSortData();
//    const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
//    const paginatedData = filteredAndSortedData.slice(
//        (currentPage - 1) * rowsPerPage,
//        currentPage * rowsPerPage
//    );
//    const {theme} = useContext(Context);
//
//    return (
//        <motion.div
//                   className={`shadow-lg rounded-xl p-6 col-span-full border border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 ease-in-out ${theme === 'dark' ? 'bg-gray-600' : 'bg-stone-100 text-gray-800'}`}
//                   initial={{ opacity: 0, y: 50 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5, delay: 0.6 }}
//               >
//                   <h2 className={`text-2xl font-bold mb-4 text-left border-b pb-4 ${theme === 'dark' ? 'bg-gradient-to-br from-green-400 to-green-800 bg-clip-text text-transparent border-gray-100' : 'text-gray-800 border-gray-200'} `}>
//                       Leave Requests History
//                   </h2>
//                   <div className="flex flex-wrap items-center gap-4 mb-6">
//                       <div className="relative">
//                           <label className={`text-base font-semibold mr-2 ${theme==='dark' ? 'text-white':'text-gray-700'}`}>
//                               Leave Type:
//                           </label>
//                           <select
//                               value={leaveTypeFilter}
//                               onChange={(e) => setLeaveTypeFilter(e.target.value)}
//                               className={`px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 border ${theme==='dark' ? 'border-black  bg-gray-500 text-white':'border-gray-300'}`}
//                           >
//                               {leaveTypes.map((type) => (
//                                   <option key={type} value={type}>
//                                       {type}
//                                   </option>
//                               ))}
//                           </select>
//                       </div>
//                       <div>
//                           <label className={`text-base font-semibold mr-2 ${theme==='dark' ? 'text-white':'text-gray-700'}`}>
//                               Status:
//                           </label>
//                           <select
//                               value={statusFilter}
//                               onChange={(e) => setStatusFilter(e.target.value)}
//                               className={`px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 border ${theme==='dark' ? 'border-black bg-gray-500 text-white':'border-gray-300'}`}
//                           >
//                               {statuses.map((status) => (
//                                   <option key={status} value={status}>
//                                       {status}
//                                   </option>
//                               ))}
//                           </select>
//                       </div>
//                       <div className="relative">
//                            <label className={`text-base font-semibold mr-2 ${theme==='dark' ? 'text-white':'text-gray-700'}`}>
//                               Sort by:
//                           </label>
//                           <select
//                               value={sortOption}
//                               onChange={(e) => setSortOption(e.target.value)}
//                               className={`px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${theme==='dark' ? 'border-black  bg-gray-500 text-white':'border-gray-300'} border`}
//                           >
//                               {sortOptions.map((option) => (
//                                   <option key={option} value={option}>
//                                       {option}
//                                   </option>
//                               ))}
//                           </select>
//                       </div>
//                   </div>
//            <div className="overflow-x-auto rounded-xl ">
//                <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
//                    <thead className={`bg-gray-50  ${theme==='dark' ? ' bg-gray-500 text-white':''}`}>
//                        <tr>
//                            <th className={`w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Employee_ID </th>
//                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Leave Type</th>
//                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Leave On</th>
//                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Status</th>
//                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Request By</th>
//                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Granted By</th>
//                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Details</th>
//                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Action Date</th>
//                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Rejection Reason</th>
//                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Action</th>
//                        </tr>
//                    </thead>
//                    <tbody className="bg-white divide-y divide-gray-500">
//                        <AnimatePresence mode="wait">
//                            {paginatedData.length > 0 ? (
//                                paginatedData.map((row, index) => (
//                                    <motion.tr
//                                        key={index}
//                                        className="hover:bg-gray-50"
//                                        initial={{ opacity: 0, y: 20 }}
//                                        animate={{ opacity: 1, y: 0 }}
//                                        exit={{ opacity: 0, y: -20 }}
//                                        transition={{ duration: 0.3, delay: index * 0.05 }}
//                                    >
//                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}> {row.EmployeeId}</td>
//                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>  {row.Leave_type}</td>
//                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}> {row.Leave_On}</td>
//                                       <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500':''}`}>
//                                            <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${row.status === "Approve" ? "bg-green-500" : row.status === "Reject" ? "bg-red-500" : "bg-blue-500"}`}> {row.status}</span>
//                                        </td>
//                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-800'}`}> {row.Request_By || "-"}</td>
//                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-800'}`}> {row.Granted_By || "-"}</td>
//                                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${theme==='dark' ? ' bg-gray-500':''}`}>
//                                            <button
//                                                 onClick={() => handleDetailsClick(row)}
//                                                 className="text-indigo-600 hover:text-indigo-800 text-lg  px-2 rounded"
//                                                 title="View Details"
//                                               >
//                                                <FaFileAlt className={` ${theme==='dark'?'text-blue-200':'text-blue-600'} text-lg inline w-6 h-6 md:w-6 md:h-6 transition `} />
//                                            </button>
//                                        </td>
//                                        <LeaveDetails leave={selectedLeave} onClose={handleCloseModal} />
//                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>
//                                            {row.Action_Date}
//                                        </td>
//                                       <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>
//                                            {row.Rejection_Reason || "-"}
//                                        </td>
//                                         <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>
//                                           <button
//                                             onClick={() => setActionLeave(row)}
//                                             className={`${theme==='dark'?'text-gray-200':'text-gray-600'} hover:text-gray-800 text-lg`}
//                                             title="Take Action"
//                                           >
//                                             ⋯
//                                           </button>
//                                        </td>
//                                    </motion.tr>
//                                ))
//                            ) : (
//                                <motion.tr
//                                    initial={{ opacity: 0 }}
//                                    animate={{ opacity: 1 }}
//                                    transition={{ duration: 0.3 }}
//                                >
//                                    <td colSpan="12" className="text-center py-4 text-gray-500">
//                                        {isLoading ? "Loading..." : "No matching records found."}
//                                    </td>
//                                </motion.tr>
//                            )}
//                            {actionLeave && (
//                            <motion.div
//                              className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-30"
//                              initial={{ opacity: 0 }}
//                              animate={{ opacity: 1 }}
//                              exit={{ opacity: 0 }}
//                            >
//                              <motion.div
//                                className={` rounded-lg shadow-xl p-6 max-w-sm w-full relative ${theme==='dark' ? 'bg-gray-800 text-white ':'bg-white text-gray-800 '}`}
//                                initial={{ scale: 0.9, opacity: 0 }}
//                                animate={{ scale: 1, opacity: 1 }}
//                                exit={{ scale: 0.9, opacity: 0 }}
//                              >
//                                <button
//                                  onClick={() => { setActionLeave(null); setActionType(""); setRejectionReason(""); }}
//                                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
//                                >
//                                  &times;
//                                </button>
//                                <h2 className={`text-xl font-bold mb-4 ${theme==='dark' ? 'text-white ':'text-gray-800 '}`}>Take Action</h2>
//                                {!actionType && (
//                                  <div className="flex gap-4 justify-center">
//                                    <button
//                                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//                                      onClick={() => setActionType("approve")}
//                                    >
//                                      Approve
//                                    </button>
//                                    <button
//                                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//                                      onClick={() => setActionType("reject")}
//                                    >
//                                      Reject
//                                    </button>
//                                  </div>
//                                )}
//                                {actionType === "approve" && (
//                                  <div className="mt-4 flex flex-col items-center">
//                                    <button
//                                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//                                      onClick={() => {
//                                        handleAction("Approve");
//                                        setActionLeave(null);
//                                        setActionType("");
//                                      }}
//                                    >
//                                      Confirm Approve
//                                    </button>
//                                  </div>
//                                )}
//                                {actionType === "reject" && (
//                                  <div className="mt-4 flex flex-col items-center">
//                                    <input type="text" row={1} placeholder="Enter Subject..."value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="border border-gray-300 rounded p-2 w-full mb-2" />
//                                    <textarea
//                                      rows={2}
//                                      placeholder="Enter rejection reason..."
//                                      value={rejectionReason}
//                                      onChange={e => setRejectionReason(e.target.value)}
//                                      className="border border-gray-300 rounded p-2 w-full mb-2"
//                                    />
//                                    <button
//                                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//                                      onClick={() => {
//                                        handleAction("Reject", rejectionReason);
//                                        setActionLeave(null);
//                                        setActionType("");
//                                        setRejectionReason("");
//                                      }}
//                                      disabled={!rejectionReason.trim()}
//                                    >
//                                      Confirm Reject
//                                    </button>
//                                  </div>
//                                )}
//                              </motion.div>
//                            </motion.div>
//                          )}
//                        </AnimatePresence>
//                    </tbody>
//                </table>
//            </div>
//            {/* PAGINATION CONTROLS */}
//            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
//                <div className="flex items-center gap-2 mb-4 sm:mb-0">
//                    <span className={`text-sm text-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Rows per page:</span>
//                    <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className={`border border-gray-300 px-2 py-1 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white text-gray-800'}`}>
//                        {rowsPerPageOptions.map((option) => <option key={option} value={option}>{option}</option>)}
//                    </select>
//                </div>
//                <nav className="flex items-center gap-2">
//                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-4 py-2 text-sm font-medium  border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500 hover:bg-gray-500' : 'bg-white text-gray-800'} `}>Previous</button>
//                    <span  className={`text-sm text-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Page {currentPage} of {totalPages}</span>
//                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`px-4 py-2 text-sm font-medium  border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500 hover:bg-gray-500' : 'bg-white text-gray-800'} `}>Next</button>
//                </nav>
//            </div>
//        </motion.div>
//    );
//};
//


const LeaveDetails = ({ leave, onClose }) => {
    const { theme } = useContext(Context)
    if (!leave) return null;
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-25 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className={` ${theme === 'dark' ? 'bg-gray-500 text-gray-200' : 'bg-stone-100'} rounded-lg shadow-xl p-6 max-w-lg w-full relative`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                >
                    <button
                        onClick={onClose}
                        className={`w-20 h-20 absolute top-3 right-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'} hover:text-gray-700 text-xl`}
                    >
                        <FaRegCircleXmark className="w-8 h-8" />
                    </button>
                    <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Leave Request Summary</h2>
                    <div className="space-y-2">
                        <div><strong>Employee ID:</strong> {leave.employeeId}</div>
                        <div><strong>Leave Type:</strong> {leave.leaveType}</div>
                        <div><strong>Status:</strong> {leave.status}</div>
                        <div><strong>Request On:</strong> {leave.reqOn}</div>
                        <div><strong>Request To:</strong> {leave.reqTo}</div>
                        <div><strong>Leave Reason:</strong>{leave.leaveReason || "-"} </div>
                        <div><strong>Rejection Reason:</strong>{leave.rejectionReason || "-"} </div>
                        <div><strong>Approved On:</strong>{leave.approvedOn || "-"} </div>
                        <div><strong>Half Day:</strong>{leave.halfDay ? "Yes" : "No"} </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};


const AdminLeaveHistory = () => {
    const { theme } = useContext(Context);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortOption, setSortOption] = useState("Recently added");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const rowsPerPageOptions = [10, 25, 50, 100];
    const [isLoading, setIsLoading] = useState(false);
    const { empID } = useParams();
    const [actionLeave, setActionLeave] = useState(null);
    const [actionType, setActionType] = useState(""); // "approve" or "reject"
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedLeave, setSelectedLeave] = useState(null);
    const { userData } = useContext(Context);

    const handleDetailsClick = (leave) => {
        setSelectedLeave(leave);
    };

    const handleCloseModal = () => {
        setSelectedLeave(null);
    };
    const sortOptions = ["Recently added", "Ascending", "Descending", "Last Month", "Last 7 Days"];
    const handleAction = async (status, reason = "") => {
        if (!actionLeave?.id) return;
        const leaveId = actionLeave.id;

        // Store leaveId in localStorage for reference
        localStorage.setItem("lastActionLeaveId", leaveId);

        try {
            if (status === "APPROVED") {
                // Approve endpoint - use PUT instead of POST
                await fetch(`https://hrms.anasolconsultancyservices.com/api/attendance/admin/leave/${leaveId}/approve`, {
                    method: "PUT",
                });
            } else if (status === "rejected") {
                // Reject endpoint - use PUT instead of POST
                await fetch(`https://hrms.anasolconsultancyservices.com/api/attendance/admin/leave/${leaveId}/reject?reason=${encodeURIComponent(reason)}`, {
                    method: "PUT",
                });
            }
            // Update status locally
            setLeaveRequests(prev =>
                prev.map(leave =>
                    leave.id === leaveId
                        ? {
                            ...leave,
                            status,
                            rejectionReason: status === "rejected" ? reason : leave.rejectionReason,
                            approvedOn: status === "APPROVED" ? new Date().toISOString().slice(0, 10) : leave.approvedOn,
                        }
                        : leave
                )
            );
        } catch (error) {
            alert("Failed to update leave status. Please try again.");
        }
    };

    // FIX: Use leaveRequests for filtering and sorting
    const leaveTypes = ["All", ...new Set(leaveRequests.map((d) => d.leaveType))];
    const statuses = ["All", ...new Set(leaveRequests.map((d) => d.status))];

    const filterAndSortData = () => {
        let data = [...leaveRequests];
        data = data.filter((item) => {
            return (
                (leaveTypeFilter === "All" || item.leaveType === leaveTypeFilter) &&
                (statusFilter === "All" || item.status === statusFilter)
            );
        });
        switch (sortOption) {
            case "Ascending":
                data.sort((a, b) => a.leaveType.localeCompare(b.leaveType));
                break;
            case "Descending":
                data.sort((a, b) => b.leaveType.localeCompare(a.leaveType));
                break;
            case "Last Month":
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                data = data.filter((item) => new Date(item.reqOn) >= lastMonth);
                break;
            case "Last 7 Days":
                const last7Days = new Date();
                last7Days.setDate(last7Days.getDate() - 7);
                data = data.filter((item) => new Date(item.reqOn) >= last7Days);
                break;
            case "Recently added":
            default:
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }
        return data;
    };

    const filteredAndSortedData = filterAndSortData();
    const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
    const paginatedData = filteredAndSortedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );
    useEffect(() => {
        const fetchPendingLeaves = async () => {
            try {
                const response = await fetch(
                    "https://hrms.anasolconsultancyservices.com/api/attendance/admin/pendingLeaveRequests"
                );
                const data = await response.json();
                setLeaveRequests(Array.isArray(data) ? data : []);
            } catch (error) {
                setLeaveRequests([]);
            }
        };
        fetchPendingLeaves();
    }, []);



    return (
        <motion.div
            className={`shadow-lg rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-900'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className={`text-2xl font-bold mb-4 text-left border-b pb-4 ${theme === 'dark' ? 'bg-gradient-to-br from-green-400 to-green-800 bg-clip-text text-transparent border-gray-100' : 'text-gray-800 border-gray-200'} `}>
                Leave Requests History
            </h2>
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative">
                    <label className={`text-base font-semibold mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                        Leave Type:
                    </label>
                    <select
                        value={leaveTypeFilter}
                        onChange={(e) => setLeaveTypeFilter(e.target.value)}
                        className={`px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 border ${theme === 'dark' ? 'border-black  bg-gray-500 text-white' : 'border-gray-300'}`}
                    >
                        {leaveTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={`text-base font-semibold mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                        Status:
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 border ${theme === 'dark' ? 'border-black bg-gray-500 text-white' : 'border-gray-300'}`}
                    >
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="relative">
                    <label className={`text-base font-semibold mr-2 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                        Sort by:
                    </label>
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className={`px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${theme === 'dark' ? 'border-black  bg-gray-500 text-white' : 'border-gray-300'} border`}
                    >
                        {sortOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto rounded-xl ">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                    <thead className={`bg-gray-50  ${theme === 'dark' ? ' bg-gray-500 text-white' : ''}`}>
                        <tr>
                            <th className={`w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme === 'dark' ? 'text-white' : ''}`}>Employee ID</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme === 'dark' ? 'text-white' : ''}`}>Leave Type</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme === 'dark' ? 'text-white' : ''}`}>Status</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme === 'dark' ? 'text-white' : ''}`}>Request On</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme === 'dark' ? 'text-white' : ''}`}>Request To</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme === 'dark' ? 'text-white' : ''}`}>Leave Reason</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme === 'dark' ? 'text-white' : ''}`}>Rejection Reason</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme === 'dark' ? 'text-white' : ''}`}>Approved On</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme === 'dark' ? 'text-white' : ''}`}>Half Day</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme === 'dark' ? 'text-white' : ''}`}>Details</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme === 'dark' ? 'text-white' : ''}`}>Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length > 0 ? paginatedData.map((row, idx) => (
                            <tr key={row.id || idx}>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme === 'dark' ? ' bg-gray-500 text-gray-200' : 'text-gray-900'}`}>{row.employeeId}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme === 'dark' ? ' bg-gray-500 text-gray-200' : 'text-gray-900'}`}>{row.leaveType}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme === 'dark' ? ' bg-gray-500 text-gray-200' : 'text-gray-900'}`}><span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${row.status === "APPROVED" ? "bg-green-500" : row.status === "rejected" ? "bg-red-500" : "bg-blue-500"}`}> {row.status}</span></td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme === 'dark' ? ' bg-gray-500 text-gray-200' : 'text-gray-900'}`}>{row.reqOn}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme === 'dark' ? ' bg-gray-500 text-gray-200' : 'text-gray-900'}`}>{row.reqTo}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme === 'dark' ? ' bg-gray-500 text-gray-200' : 'text-gray-900'}`}>{row.leaveReason}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme === 'dark' ? ' bg-gray-500 text-gray-200' : 'text-gray-900'}`}>{row.rejectionReason || "-"}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme === 'dark' ? ' bg-gray-500 text-gray-200' : 'text-gray-900'}`}>{row.approvedOn || "-"}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme === 'dark' ? ' bg-gray-500 text-gray-200' : 'text-gray-900'}`}>{row.halfDay ? "Yes" : "No"}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${theme === 'dark' ? ' bg-gray-500' : ''}`}>
                                    <button
                                        onClick={() => handleDetailsClick(row)}
                                        className="text-indigo-600 hover:text-indigo-800 text-lg  px-2 rounded"
                                        title="View Details"
                                    >
                                        <FaFileAlt className={` ${theme === 'dark' ? 'text-blue-200' : 'text-blue-600'} text-lg inline w-6 h-6 md:w-6 md:h-6 transition `} />
                                    </button>
                                </td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme === 'dark' ? ' bg-gray-500 text-gray-200' : 'text-gray-900'}`}>
                                    <button
                                        onClick={() => setActionLeave(row)}
                                        className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'} hover:text-gray-800 text-lg`}
                                        title="Take Action"
                                    >
                                        ⋯
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={9} className="text-center py-4 text-gray-500 italic">
                                    No leave history found.
                                </td>
                            </tr>
                        )}
                        {actionLeave && (
                            <motion.div
                                className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-30"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div
                                    className={` rounded-lg shadow-xl p-6 max-w-sm w-full relative ${theme === 'dark' ? 'bg-gray-800 text-white ' : 'bg-white text-gray-800 '}`}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                >
                                    <button
                                        onClick={() => { setActionLeave(null); setActionType(""); setRejectionReason(""); }}
                                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
                                    >
                                        &times;
                                    </button>
                                    <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white ' : 'text-gray-800 '}`}>Take Action</h2>
                                    {!actionType && (
                                        <div className="flex gap-4 justify-center">
                                            <button
                                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                                onClick={() => setActionType("APPROVED")}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                                onClick={() => setActionType("rejected")}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {actionType === "APPROVED" && (
                                        <div className="mt-4 flex flex-col items-center">
                                            <button
                                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                                onClick={() => {
                                                    handleAction("APPROVED");
                                                    setActionLeave(null);
                                                    setActionType("");
                                                }}
                                            >
                                                Confirm Approve
                                            </button>
                                        </div>
                                    )}
                                    {actionType === "rejected" && (
                                        <div className="mt-4 flex flex-col items-center">
                                            <textarea
                                                rows={2}
                                                placeholder="Enter rejection reason..."
                                                value={rejectionReason}
                                                onChange={e => setRejectionReason(e.target.value)}
                                                className="border border-gray-300 rounded p-2 w-full mb-2"
                                            />
                                            <button
                                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                                onClick={() => {
                                                    handleAction("rejected", rejectionReason);
                                                    setActionLeave(null);
                                                    setActionType("");
                                                    setRejectionReason("");
                                                }}
                                                disabled={!rejectionReason.trim()}
                                            >
                                                Confirm Reject
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                        <LeaveDetails leave={selectedLeave} onClose={handleCloseModal} />
                    </tbody>
                </table>
            </div>
            {/* PAGINATION CONTROLS */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center gap-2 mb-4 sm:mb-0">
                    <span className={`text-sm text-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Rows per page:</span>
                    <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className={`border border-gray-300 px-2 py-1 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500' : 'bg-white text-gray-800'}`}>
                        {rowsPerPageOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>
                <nav className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-4 py-2 text-sm font-medium  border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500 hover:bg-gray-500' : 'bg-white text-gray-800'} `}>Previous</button>
                    <span className={`text-sm text-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`px-4 py-2 text-sm font-medium  border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500 hover:bg-gray-500' : 'bg-white text-gray-800'} `}>Next</button>
                </nav>
            </div>
        </motion.div>
    );
};
const FormInput = ({ label, theme, ...props }) => {
    // Determine the border/text color based on the theme
    const inputClasses = theme === 'dark'
        ? 'border-gray-600 bg-gray-700 text-white'
        : 'border-gray-300 bg-white text-gray-800';

    return (
        <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {label}
            </label>
            <input
                {...props}
                className={`w-full px-4 py-2 border rounded-lg transition duration-300 ease-in-out focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none ${inputClasses}`}
            />
        </div>
    );
};
// ----------------------------------------------------------------

function EmployeeAttendanceForm({ onClose, onSubmit }) {
    const { theme } = useContext(Context);
    const [formData, setFormData] = useState({
        employeeId: "",
        month: "",
        year: "",
        paid: "",
        sick: "",
        casual: "",
        unpaid: "",
        shiftName: ""
    });
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Note: The alert is now handled by the onSubmit success message in the parent component, 
            // but is kept here for direct feedback if the parent isn't setup.
            const response = await axios.post(
                "https://hrms.anasolconsultancyservices.com/api/attendance/personalleaves/add",
                formData
            );
            if (response.status !== 200 && response.status !== 201) {
                alert(`Error: ${response}`);
                throw new Error(`${response.status}`);
            }
            alert(`Attendance added successfully! 🎉`);
            onSubmit(formData);
            setShowConfirm(false);
            onClose();
        } catch (error) {
            console.error("Submission error:", error);
            alert(error.message || "An error occurred while submitting the form.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Determine main form background and text color
    const formThemeClasses = theme === 'dark'
        ? 'bg-gray-800 text-white border-gray-700'
        : 'bg-white text-gray-800 border-green-200';

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose} // Close on backdrop click
        >
            <motion.div
                className="w-full max-w-2xl mx-auto my-auto max-h-[90vh] overflow-y-auto transform"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the form
            >
                <form
                    onSubmit={handleSubmit}
                    className={`relative rounded-3xl shadow-2xl ${formThemeClasses} transition-all duration-300`}
                >
                    <div className="text-center rounded-t-3xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                            <h2 className="text-2xl font-extrabold text-white">
                                Add Employee Attendance
                            </h2>
                        </div>
                    </div>

                    <div className="space-y-6 p-6">
                        {/* Row 1: Employee ID */}
                        <FormInput
                            label="Employee ID"
                            theme={theme}
                            type="text"
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            required
                        />

                        {/* Row 2: Month & Year */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Month (1-12)"
                                theme={theme}
                                type="number"
                                name="month"
                                value={formData.month}
                                onChange={handleChange}
                                required
                                min="1"
                                max="12"
                            />
                            <FormInput
                                label="Year (e.g., 2025)"
                                theme={theme}
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                required
                                min="2000"
                                max="2100"
                            />
                        </div>

                        <h3 className={`text-lg font-semibold border-b pb-2 ${theme === 'dark' ? 'text-gray-300 border-gray-700' : 'text-gray-700 border-gray-200'}`}>
                            Leave Details (Days)
                        </h3>

                        {/* Row 3: Paid & Sick Leaves */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                                label="Paid Leaves"
                                theme={theme}
                                type="number"
                                name="paid"
                                value={formData.paid}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                            <FormInput
                                label="Sick Leaves"
                                theme={theme}
                                type="number"
                                name="sick"
                                value={formData.sick}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>

                        {/* Row 4: Casual & Unpaid Leaves */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                                label="Casual Leaves"
                                theme={theme}
                                type="number"
                                name="casual"
                                value={formData.casual}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                            <FormInput
                                label="Unpaid Leaves"
                                theme={theme}
                                type="number"
                                name="unpaid"
                                value={formData.unpaid}
                                onChange={handleChange}
                                required
                                min="0"
                            />
                        </div>

                        {/* Row 5: Shift Name */}
                        <FormInput
                            label="Shift Name"
                            theme={theme}
                            type="text"
                            name="shiftName"
                            value={formData.shiftName}
                            onChange={handleChange}
                            required
                        />

                        {/* Action Buttons */}
                        <div className="pt-4 flex justify-end space-x-3">
                            <motion.button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-lg border text-sm font-semibold shadow-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                type="submit"
                                className="px-5 py-2.5 rounded-lg border border-transparent bg-indigo-600 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isSubmitting ? 'Processing...' : 'Submit Attendance'}
                            </motion.button>
                        </div>
                    </div>
                </form>

                {/* Confirmation Box (Modal) */}
                <AnimatePresence>
                    {showConfirm && (
                        <motion.div
                            className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className={`rounded-xl shadow-2xl p-8 w-full max-w-sm text-center ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                                initial={{ scale: 0.8, y: -50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: -50 }}
                            >
                                <h3 className="text-xl font-extrabold mb-3 text-indigo-600">Confirm Submission</h3>
                                <p className="mb-6 text-gray-600 dark:text-gray-300">
                                    Please confirm the attendance record for **Employee ID {formData.employeeId}**
                                </p>
                                <div className="flex justify-center gap-4">
                                    <motion.button
                                        className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                                        onClick={handleConfirmSubmit}
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {isSubmitting ? "Submitting..." : "Yes, Submit"}
                                    </motion.button>
                                    <motion.button
                                        className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition dark:bg-gray-600 dark:text-gray-200"
                                        onClick={() => setShowConfirm(false)}
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};
const API_BASE = "https://hrms.anasolconsultancyservices.com/api/attendance/shifts";

// --- Custom Input Component for clean JSX ---
const Form = ({ label, theme, helperText, type = 'text', ...props }) => {
    // Determine the border/text color based on the theme
    const inputClasses = theme === 'dark'
        ? 'border-gray-600 bg-gray-700 text-white'
        : 'border-gray-300 bg-white text-gray-800';

    return (
        <div>
            <label
                htmlFor={props.id || props.name}
                className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
            >
                {label}
            </label>
            <input
                type={type}
                {...props}
                className={`w-full px-4 py-2 border rounded-lg transition duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-none ${inputClasses}`}
            />
            {helperText && (
                <p className={`text-xs mt-1 italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {helperText}
                </p>
            )}
        </div>
    );
};
// ---------------------------------------------


const ShiftForm = ({ onClose }) => {
  const { theme } = useContext(Context);

  // --- State for Shift Form ---
  const [shiftFormData, setShiftFormData] = useState({
    shiftName: "",
    startTime: "",
    endTime: "",
    halfTime: "",
    acceptedBreakTime: "",
    takeAttendanceAfter: "",
  });

  // --- State for Trigger Form ---
  const [triggerFormData, setTriggerFormData] = useState({
    shift: "",
    section: "",
    cronExpression: "",
    zone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");

  // --- Helpers ---
  const convertToHHMMSS = (timeString) => {
    if (!timeString || timeString.length !== 5) return "";
    return `${timeString}:00`;
  };

  const handleShiftChange = (e) => {
    const { name, value } = e.target;
    setShiftFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTriggerChange = (e) => {
    const { name, value } = e.target;
    setTriggerFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Submit Shift ---
  const handleShiftSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage("");

    const isConfirmed = window.confirm(
      `Submit this shift?\nShift: ${shiftFormData.shiftName}\nStart: ${shiftFormData.startTime}\nEnd: ${shiftFormData.endTime}`
    );
    if (!isConfirmed) return;

    setIsSubmitting(true);
    const dataToSubmit = {
      shiftName: shiftFormData.shiftName,
      startTime: convertToHHMMSS(shiftFormData.startTime),
      endTime: convertToHHMMSS(shiftFormData.endTime),
      halfTime: convertToHHMMSS(shiftFormData.halfTime),
      acceptedBreakTime: shiftFormData.acceptedBreakTime,
      takeAttendanceAfter: shiftFormData.takeAttendanceAfter,
    };

    try {
      const response = await axios.post(API_BASE, dataToSubmit);
      alert("Shift created successfully ✅");
      setSubmissionMessage("Success: Shift data submitted!");
      setShiftFormData({
        shiftName: "",
        startTime: "",
        endTime: "",
        halfTime: "",
        acceptedBreakTime: "",
        takeAttendanceAfter: "",
      });
    } catch (error) {
      console.error(error);
      setSubmissionMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Submit Trigger ---
  const handleTriggerSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage("");

    const isConfirmed = window.confirm(
      `Create trigger?\nShift: ${triggerFormData.shift}\nSection: ${triggerFormData.section}\nCron: ${triggerFormData.cronExpression}`
    );
    if (!isConfirmed) return;

    setIsSubmitting(true);
    const dataToSubmit = {
      Shift: triggerFormData.shift,
      Section: triggerFormData.section,
      CronExpression: triggerFormData.cronExpression,
      Zone: triggerFormData.zone,
    };

    try {
      const response = await axios.post(`${API_BASE}/trigger`, dataToSubmit);
      alert("Trigger created successfully ✅");
      setSubmissionMessage("Success: Trigger data submitted!");
      setTriggerFormData({ shift: "", section: "", cronExpression: "", zone: "" });
    } catch (error) {
      console.error(error);
      setSubmissionMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formThemeClasses =
    theme === "dark"
      ? "bg-gray-800 text-white border-gray-700"
      : "bg-white text-gray-800 border-gray-100";

  const headerGradient = "bg-gradient-to-r from-teal-500 to-cyan-600";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[90vh] overflow-y-auto transform"
        initial={{ scale: 0.9, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -50 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ----------- Shift Form ----------- */}
        <form
          onSubmit={handleShiftSubmit}
          className={`relative rounded-3xl shadow-3xl overflow-hidden ${formThemeClasses}`}
        >
          <div className={`${headerGradient} text-center rounded-t-3xl p-5`}>
            <h2 className="text-xl font-bold text-white flex justify-center items-center gap-2">
              <i className="fas fa-clock"></i> Create Shift
            </h2>
            <p className="text-sm text-white/80">Define operational hours</p>
          </div>

          <div className="space-y-5 p-6">
            <Form
              label="Shift Name"
              theme={theme}
              type="text"
              name="shiftName"
              value={shiftFormData.shiftName}
              onChange={handleShiftChange}
              required
              placeholder="Morning Shift"
            />

            <div className="grid grid-cols-2 gap-5">
              <Form
                label="Start Time"
                theme={theme}
                type="time"
                name="startTime"
                value={shiftFormData.startTime}
                onChange={handleShiftChange}
                required
              />
              <Form
                label="End Time"
                theme={theme}
                type="time"
                name="endTime"
                value={shiftFormData.endTime}
                onChange={handleShiftChange}
                required
              />
            </div>

            <Form
              label="Half Time"
              theme={theme}
              type="time"
              name="halfTime"
              value={shiftFormData.halfTime}
              onChange={handleShiftChange}
              required
            />

            <Form
              label="Accepted Break (ISO 8601)"
              theme={theme}
              type="text"
              name="acceptedBreakTime"
              value={shiftFormData.acceptedBreakTime}
              onChange={handleShiftChange}
              required
              placeholder="PT1H30M00S"
            />

            <Form
              label="Take Attendance After (ISO 8601)"
              theme={theme}
              type="text"
              name="takeAttendanceAfter"
              value={shiftFormData.takeAttendanceAfter}
              onChange={handleShiftChange}
              required
              placeholder="PT0H30M"
            />

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
              >
                {isSubmitting ? "Submitting..." : "Create Shift"}
              </motion.button>
            </div>
          </div>
        </form>

        {/* ----------- Trigger Form ----------- */}
        <form
          onSubmit={handleTriggerSubmit}
          className={`relative rounded-3xl shadow-3xl overflow-hidden ${formThemeClasses}`}
        >
          <div className={`${headerGradient} text-center rounded-t-3xl p-5`}>
            <h2 className="text-xl font-bold text-white flex justify-center items-center gap-2">
              <i className="fas fa-bolt"></i> Create Trigger
            </h2>
            <p className="text-sm text-white/80">Setup scheduled trigger</p>
          </div>

          <div className="space-y-5 p-6">
            <Form
              label="Shift Name"
              theme={theme}
              type="text"
              name="shift"
              value={triggerFormData.shift}
              onChange={handleTriggerChange}
              required
              placeholder="Morning"
            />

            <Form
              label="Section"
              theme={theme}
              type="text"
              name="section"
              value={triggerFormData.section}
              onChange={handleTriggerChange}
              required
              placeholder="FIRST, SECOND"
            />

            <Form
              label="Cron Expression"
              theme={theme}
              type="text"
              name="cronExpression"
              value={triggerFormData.cronExpression}
              onChange={handleTriggerChange}
              required
              placeholder="0 0 8 * * *"
            />

            <Form
              label="Time Zone"
              theme={theme}
              type="text"
              name="zone"
              value={triggerFormData.zone}
              onChange={handleTriggerChange}
              required
              placeholder="Asia/Kolkata"
            />

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                type="submit"
                className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
              >
                {isSubmitting ? "Creating..." : "Create Trigger"}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* --- Submission Message --- */}
      <AnimatePresence>
        {submissionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute bottom-6 text-center w-full text-sm font-medium ${
              submissionMessage.startsWith("Success")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {submissionMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function LeavesReports({ onBack }) {
    const { theme } = useContext(Context);
    const [isLoading, setIsLoading] = useState();
    const [showAttendanceForm, setShowAttendanceForm] = useState(false);
    const [showShiftForm, setShowShiftForm] = useState(false);

    const todayISO = new Date().toISOString().slice(0, 10);
    const sevenDaysAgoISO = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const [stDate, setStDate] = useState(sevenDaysAgoISO);
    const [enDate, setEnDate] = useState(todayISO);
    const handleAddAttendance = (data) => {
        // You can POST data to your backend here or update local state
        console.log("Attendance Added:", data);
    };
    return (
        <motion.div
            className={`p-2 sm:p-2 min-h-screen font-sans ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 mb-2 border-b border-gray-200">
                <h1 className={`text-3xl sm:text-4xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Leaves Report
                </h1>

                <div className="flex items-center gap-2">
                    {/* date pickers placed to the left of control buttons */}
                    <div className="flex items-center space-x-2 mr-2">
                        <input type="date" value={stDate} onChange={(e) => setStDate(e.target.value)} className="p-1 border rounded bg-white text-sm" />
                        <input type="date" value={enDate} onChange={(e) => setEnDate(e.target.value)} className="p-1 border rounded bg-white text-sm" />
                        <button onClick={() => { /* trigger refresh for LeaveCharts by updating state only */ }} className="px-3 py-1 bg-gray-200 rounded text-sm">Range</button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
                        <motion.button
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                            onClick={() => setShowAttendanceForm(true)}
                            whileHover={{ scale: 1.05, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Add Attendance
                        </motion.button>
                        <motion.button
                            className="px-4 py-2 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 transition"
                            onClick={() => setShowShiftForm(true)}
                            whileHover={{ scale: 1.05, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Add Shift
                        </motion.button>
                        <motion.button
                            onClick={onBack}
                            className="flex items-center px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                            whileHover={{ scale: 1.05, boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                            </svg>
                            Back to Dashboard
                        </motion.button>
                    </div>
                </div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-2">
                {/* pass stDate/enDate to LeaveCharts so cards update for selected range */}
                <LeaveCharts start={stDate} end={enDate} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                <Attendance />
                <EmployeeBarChart />
                <Calendar />
            </div>
            <div className="w-full">
                <AdminLeaveHistory />
            </div>
            {showAttendanceForm && (
                <EmployeeAttendanceForm
                    onClose={() => setShowAttendanceForm(false)}
                    onSubmit={handleAddAttendance}
                />
            )}
            {showShiftForm && (
                <ShiftForm
                    onClose={() => setShowShiftForm(false)}
                />
            )}
        </motion.div>
    );
};
export default LeavesReports;