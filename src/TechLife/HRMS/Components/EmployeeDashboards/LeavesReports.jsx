import React, { useContext, useState } from 'react';
import { CircleUserRound, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,} from "recharts";
import { FaFileAlt, FaRegUser, FaUserEdit, FaUsers } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import LeaveDetails from "./LeaveDetails";
import { Context } from '../HrmsContext';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid'; // Using Heroicons for arrows
import { useEffect } from 'react';
import axios from 'axios';


// The following components are from your original code, with updated styling and layout.
// They are re-ordered here for clarity.

const Attendance = () => {
    const navigate = useNavigate();
    const [selectedPeriod, setSelectedPeriod] = useState('Today');
    const totalAttendance = 104;
    const data = [
        { name: 'Present', value: 60 },
        { name: 'Late', value: 20 },
        { name: 'Permission', value: 20},
        { name: 'Absent', value: 4 },
    ];
    const statusColorMap = {
       "Present": "text-green-600",
       "Late": "text-blue-600",
       "Permission": "text-yellow-600",
       "Absent": "text-red-600",
    };
    const color=["#4CAF50","#2196F3","#FFC107","#EF5350"];

    const chartData = [...data];
    const {theme} = useContext(Context);

    return (
        <motion.div
            className={` p-2 rounded-xl shadow-md border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 ease-in-out h-full ${theme==='dark' ? 'bg-gray-600 ':'bg-stone-100 '}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${theme==='dark' ? 'bg-gradient-to-br from-orange-100 to-orange-400 bg-clip-text text-transparent border-gray-100':'text-gray-800 '}`}>
                    Attendance Overview</h2>
                <div className="relative inline-block text-left mt-1">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className={`inline-flex justify-center w-full rounded-md border border-gray-200 shadow-sm px-4 py-2  text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme==='dark' ? 'bg-gray-600 text-white  hover:bg-gray-500':'bg-white text-gray-700'}`}
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
                    <p className={`text-sm font-medium ${theme==='dark' ? 'text-white ':'text-gray-500 '}`}> Total Attendance</p>
                    <p className={`text-4xl font-bold ${theme==='dark' ? 'text-white ':'text-gray-800 '}`}>{totalAttendance}</p>
                </div>
            </div>
            <hr className="my-6 border-gray-200" />
            <div className="flex justify-between items-start">
                <div>
                    <h3 className={`text-lg font-semibold mb-2 ${theme==='dark' ? 'text-white ':'text-gray-800 '}`}>Status</h3>
                    <ul className="space-y-2">
                        <AnimatePresence>
                            {data.map((item, index) => (
                                <motion.li
                                    key={item.name}
                                    className={`flex items-center  font-medium ${theme==='dark' ? 'text-white ': statusColorMap[item.name] || 'text-gray-700 '}`}
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
                    <h3 className={`text-lg font-semibold  mb-2 ${theme==='dark' ? 'text-white ':'text-gray-800 '}`}>
                        Percentage</h3>
                    <ul className="space-y-2">
                        <AnimatePresence>
                            {data.map((item, index) => (
                                <motion.li
                                    key={item.name}
                                    className={`  font-bold ${theme==='dark' ? 'text-white ':'text-gray-700 '}`}
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
const ClockIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.87 14.13H11.5v-6h1.37v6zM12 5.5c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5zm.5 1.5h-1v5.25l4.5 2.62.75-1.35-3.5-2.02V7z"/></svg>;

const onTimeDate = [
  { Month: "Aug", Year: "25", NoofEmployee: 100 },
  { Month: "Sept", Year:"25", NoofEmployee: 120 },
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
            className={` rounded-xl  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md p-4 w-full font-sans border border-gray-200 h-96 flex flex-col ${theme==='dark' ? 'bg-gray-700 text-gray-200 ':'bg-stone-100 text-gray-800'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0.5,scale:1 }}
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
          <YAxis stroke={textColor} tick={{ fill: textColor }} hide/>
          <Tooltip 
             contentStyle={{ 
                 backgroundColor: theme ==='dark' ? "#63676cff" : "#fff", 
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
  const {theme}=useContext(Context);
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
    <div className={`flex justify-center rounded-xl items-center  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme==='dark' ? 'bg-gray-600 ':'bg-stone-100 '} p-2`}>
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
const Data = [
    {
        title: "Total Present",
        value: "104/108",
    },
    {
        title: "Paid Leaves",
        value: "10",
    },
    {
        title: "Unpaid Leaves",
        value: "10",
    },
    {
        title: "Sick leaves",
        value: "15",
    },
    {
        title: "Pending Request",
        value: "15",
    }
];

const ChartCard = ({ title, icontextcolor, value, icon, color, }) => {
    const {theme} = useContext(Context);
    return (
        <motion.div
            className={` rounded-xl p-2 shadow-md border border-gray-200 hover:border-blue-500 hover:shadow-xl   transition-shadow duration-300 h-full flex flex-col items-center justify-center text-center  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme==='dark' ? 'bg-gray-500 ':'bg-stone-100 '}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
           
        >
            <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-2 p-3 ${color}  ${icontextcolor}`}>
                {React.cloneElement(icon, { className: `w-8 h-8 rounded-full` })}
            </div>
            <div>
                <h3 className={`text-xl font-semibold  ${theme==='dark' ? 'text-white ':'text-gray-800 '}`}>{title}</h3>
                <p className={`text-3xl font-bold mt-2 ${theme==='dark' ? 'text-white ':'text-gray-800 '}`}>{value}</p>
            </div>
    
        </motion.div>
    );
};

const LeaveCharts = () => {
    return (
        <motion.div
            className="p-6 h-full flex flex-col justify-between"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-6 gap-6 h-full">
                <AnimatePresence>
                    <EmployeePieChart/>
                    {Data.map((data, index) => {
                        let icon, icontextcolor, colorHandler;
                        switch (data.title) {
                            case "Total Present": icon = <FaUsers className="w-4 h-4 text-white" />; colorHandler = "bg-green-100"; icontextcolor = "text-green-300"; break;
                            case "Paid Leaves": icon = <FaRegUser className="w-4 h-4 text-white" />; colorHandler = "bg-pink-100";  icontextcolor = "text-pink-300"; break;
                            case "Unpaid Leaves": icon = <FiUser className="w-4 h-4 text-white" />; colorHandler = "bg-yellow-100"; icontextcolor = "text-yellow-300"; break;
                            case "Sick leaves": icon = <FiUser className="w-4 h-4 text-white" />; colorHandler = "bg-purple-100"; icontextcolor = "text-purple-300"; break;
                            case "Pending Request": icon = <FaUserEdit className="w-4 h-4 text-white" />; colorHandler = "bg-blue-100"; icontextcolor = "text-blue-300"; break;
                            default: icon = <CircleUserRound className="w-4 h-4 text-white" />; colorHandler = "bg-gray-100";
                        }
                        return (
                            <ChartCard key={index} icon={icon} color={colorHandler} icontextcolor={icontextcolor} value={data.value} title={data.title} trends={data.trends} trendPercentage={data.trendPercentage} trendPeriod={data.trendPeriod} />
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
const piechartData = [
  { title: "Total Present", value: 104 },
  { title: "Paid Leaves ", value: 10 },
  { title: "Unpaid Leaves", value: 6 },
  { title:"Sick leaves", value: 5 },
  { title: "Pending Request", value: 10 },
];

const COLORS = ["#3B82F6", "#F59E0B", "#EF4444", "#84CC16", "#6B7280"];

const EmployeePieChart = () => {
    const {theme}=useContext(Context);
    const textColor = theme === 'dark' ? "#FFFFFF" : "#000000";
  return (
    <div className="flex justify-center items-center">
      {/* Chart container */}
      <PieChart width={180} height={180}>
        <Pie data={piechartData} dataKey="value" nameKey="title" cx="50%" cy="50%" innerRadius={50}  outerRadius={80} >
          {piechartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-lg font-small `}
            stroke={textColor}
        >
            Leaves
        </text>
        <Tooltip />
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
                          <label className={`text-base font-semibold mr-2 ${theme==='dark' ? 'text-white':'text-gray-700'}`}>
                              Leave Type:
                          </label>
                          <select
                              value={leaveTypeFilter}
                              onChange={(e) => setLeaveTypeFilter(e.target.value)}
                              className={`px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 border ${theme==='dark' ? 'border-black  bg-gray-500 text-white':'border-gray-300'}`}
                          >
                              {leaveTypes.map((type) => (
                                  <option key={type} value={type}>
                                      {type}
                                  </option>
                              ))}
                          </select>
                      </div>
                      <div>
                          <label className={`text-base font-semibold mr-2 ${theme==='dark' ? 'text-white':'text-gray-700'}`}>
                              Status:
                          </label>
                          <select
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className={`px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 border ${theme==='dark' ? 'border-black bg-gray-500 text-white':'border-gray-300'}`}
                          >
                              {statuses.map((status) => (
                                  <option key={status} value={status}>
                                      {status}
                                  </option>
                              ))}
                          </select>
                      </div>
                      <div className="relative">
                           <label className={`text-base font-semibold mr-2 ${theme==='dark' ? 'text-white':'text-gray-700'}`}>
                              Sort by:
                          </label>
                          <select
                              value={sortOption}
                              onChange={(e) => setSortOption(e.target.value)}
                              className={`px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${theme==='dark' ? 'border-black  bg-gray-500 text-white':'border-gray-300'} border`}
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
                    <thead className={`bg-gray-50  ${theme==='dark' ? ' bg-gray-500 text-white':''}`}>
                        <tr>
                            <th className={`w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Employee ID</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Leave Type</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Status</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Request On</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Request To</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Leave Reason</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Rejection Reason</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Approved On</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Half Day</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Details</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length > 0 ? paginatedData.map((row, idx) => (
                            <tr key={row.id || idx}>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.employeeId}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.leaveType}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}><span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${row.status === "APPROVED" ? "bg-green-500" : row.status === "rejected" ? "bg-red-500" : "bg-blue-500"}`}> {row.status}</span></td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.reqOn}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.reqTo}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.leaveReason}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.rejectionReason || "-"}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.approvedOn || "-"}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.halfDay ? "Yes" : "No"}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${theme==='dark' ? ' bg-gray-500':''}`}>
                                           <button
                                                onClick={() => handleDetailsClick(row)}
                                                className="text-indigo-600 hover:text-indigo-800 text-lg  px-2 rounded"
                                                title="View Details"
                                              >
                                               <FaFileAlt className={` ${theme==='dark'?'text-blue-200':'text-blue-600'} text-lg inline w-6 h-6 md:w-6 md:h-6 transition `} />
                                           </button>
                                       </td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>
                                          <button
                                            onClick={() => setActionLeave(row)}
                                            className={`${theme==='dark'?'text-gray-200':'text-gray-600'} hover:text-gray-800 text-lg`}
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
                                className={` rounded-lg shadow-xl p-6 max-w-sm w-full relative ${theme==='dark' ? 'bg-gray-800 text-white ':'bg-white text-gray-800 '}`}
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
                                <h2 className={`text-xl font-bold mb-4 ${theme==='dark' ? 'text-white ':'text-gray-800 '}`}>Take Action</h2>
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
                    <span  className={`text-sm text-gray-700 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className={`px-4 py-2 text-sm font-medium  border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gray-600 text-white border-gray-500 hover:bg-gray-500' : 'bg-white text-gray-800'} `}>Next</button>
                </nav>
            </div>
        </motion.div>
    );
};
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
            await axios.post(
                "https://hrms.anasolconsultancyservices.com/api/attendance/personalleaves/add",
                formData
            );
            alert(`Added Attendance successfully! 🎉}`);
            onSubmit(formData);
            setShowConfirm(false);
            onClose();
        } catch (error) {
            alert("Failed to submit attendance. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-25 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <motion.div className="relative w-full max-w-3xl mx-auto my-auto max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 md:scale-100" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.3 }}>
                <form onSubmit={handleSubmit} className={`relative w-full max-w-3xl mx-auto rounded-lg shadow-2xl my-auto max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 md:scale-100 border border-green-200 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                    <div className="mb-4 text-center rounded-t bg-gradient-to-br from-orange-200 to-orange-600">
                        <h2 className={`text-2xl pt-6 font-bold border-b pb-8 ${theme === 'dark' ? 'text-white border-gray-100' : 'text-gray-800 border-gray-200'}`}>Add Employee Attendance</h2>
                    </div>
                    <div className="space-y-4 p-4">
                        {/* ...existing input fields... */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Employee ID:</label>
                            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`} required />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Month:</label>
                                <input type="number" name="month" value={formData.month} onChange={handleChange} className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`} required min="1" max="12" />
                            </div>
                            <div className="flex-1">
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Year:</label>
                                <input type="number" name="year" value={formData.year} onChange={handleChange} className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`} required min="2000" max="2100" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Paid:</label>
                                <input type="number" name="paid" value={formData.paid} onChange={handleChange} className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`} required min="0" />
                            </div>
                            <div className="flex-1">
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Sick:</label>
                                <input type="number" name="sick" value={formData.sick} onChange={handleChange} className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`} required min="0" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Casual:</label>
                                <input type="number" name="casual" value={formData.casual} onChange={handleChange} className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`} required min="0" />
                            </div>
                            <div className="flex-1">
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Unpaid:</label>
                                <input type="number" name="unpaid" value={formData.unpaid} onChange={handleChange} className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`} required min="0" />
                            </div>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Shift Name:</label>
                            <input type="text" name="shiftName" value={formData.shiftName} onChange={handleChange} className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`} required />
                        </div>
                        <div className="mt-6 flex justify-end space-x-3 border-t p-4">
                            <button type="submit" className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors" disabled={isSubmitting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Submit</button>
                            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancel</button>
                        </div>
                    </div>
                </form>
                {/* Confirmation Box */}
                <AnimatePresence>
                    {showConfirm && (
                        <motion.div
                            className="fixed inset-0 z-60 flex items-center justify-center  bg-opacity-25 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm text-center`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <h3 className="text-lg font-bold mb-4 text-indigo-600">Confirm Submission</h3>
                                <p className="mb-6 text-gray-700 dark:text-gray-200">Are you sure you want to submit this attendance record?</p>
                                <div className="flex justify-center gap-4">
                                    <button
                                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                                        onClick={handleConfirmSubmit}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Submitting..." : "Yes, Submit"}
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                                        onClick={() => setShowConfirm(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
  };
  const API_ENDPOINT = "https://hrms.anasolconsultancyservices.com/api/attendance/shifts";

const ShiftForm = ({onClose}) => {
    // State for form data
    const { theme } = useContext(Context);
    const [formData, setFormData] = useState({
        shiftName: '',
        startTime: '', // Initialize with a default HH:MM for easy user input
        endTime: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState('');

    // Utility function to convert HH:MM to HH:MM:SS
    // The input type="time" gives HH:MM, we append :00 for seconds.
    const convertToHHMMSS = (timeString) => {
        if (!timeString || timeString.length !== 5) return '';
        return `${timeString}:00`;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionMessage(''); // Clear previous messages

        // 1. Initial Confirmation Box
        const isConfirmed = window.confirm(
            "Are you sure you want to submit this shift data?\n" +
            `Shift Name: ${formData.shiftName}\n` +
            `Start Time: ${formData.startTime}\n` +
            `End Time: ${formData.endTime}`
        );

        if (!isConfirmed) {
            return; // User cancelled the submission
        }

        setIsSubmitting(true);

        // Prepare data for the API
        const dataToSubmit = {
            shiftName: formData.shiftName,
            startTime: convertToHHMMSS(formData.startTime),
            endTime: convertToHHMMSS(formData.endTime),
        };

        try {
            // 2. API Call
            const response = await axios.post(API_ENDPOINT, dataToSubmit);

            // 3. Post-Submission Confirmation/Success Box
            alert(`Shift submitted successfully! 🎉\nStatus: ${response.status}\nMessage: ${response.data.message || 'Data received by server.'}`);
            setSubmissionMessage('Success: Shift data submitted!');
            // Optionally clear the form
            setFormData({ shiftName: '', startTime: '', endTime: '' });
            onClose();

        } catch (error) {
            console.error('Submission Error:', error.response?.data || error.message);
            // 3. Post-Submission Error Box
            alert(`Submission failed! 😔\nError: ${error.response?.data?.message || error.message}`);
            setSubmissionMessage(`Error: Submission failed! ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-25 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <motion.div className="relative w-full max-w-3xl mx-auto my-auto max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 md:scale-100" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.3 }}>
                <form onSubmit={handleSubmit} className={`relative w-full max-w-3xl mx-auto rounded-lg shadow-2xl my-auto max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 md:scale-100 border border-green-200 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                    <div className="mb-4 text-center rounded-t bg-gradient-to-br from-orange-200 to-orange-600">
                        <h2 className={`text-2xl pt-6 font-bold border-b pb-8 ${theme === 'dark' ? 'text-white border-gray-100' : 'text-gray-800 border-gray-200'}`}>Create New Shift</h2>
                    </div>
                
                {/* Shift Name Input */}
                <div className="space-y-4 p-4">
                <div className="mb-4">
                    <label htmlFor="shiftName" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                        Shift Name
                    </label>
                    <input
                        type="text"
                        id="shiftName"
                        name="shiftName"
                        value={formData.shiftName}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                        placeholder="e.g., Morning Shift"
                    />
                </div>

                {/* Start Time Input */}
                <div className="mb-4">
                    <label htmlFor="startTime" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                        Start Time (HH:MM)
                    </label>
                    <input
                        type="time" // Use type="time" for native time picker/input
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                    />
                    <p className={`text-sm mt-1  ${theme==='dark' ? 'text-white':'text-black'}`}>
                        *Will be submitted as {convertToHHMMSS(formData.startTime)}
                    </p>
                </div>

                {/* End Time Input */}
                <div className="mb-6">
                    <label htmlFor="endTime" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                        End Time (HH:MM)
                    </label>
                    <input
                        type="time" // Use type="time" for native time picker/input
                        id="endTime"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                        className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                    />
                     <p className={`text-sm mt-1  ${theme==='dark' ? 'text-white':'text-black'}`}>
                        *Will be submitted as {convertToHHMMSS(formData.endTime)}
                    </p>
                </div>
                </div>

                {/* Submission Button */}
                 <div className="mt-6 flex justify-end space-x-3 border-t p-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={` py-2 px-4 rounded-md text-white font-semibold transition duration-300 ease-in-out ${
                        isSubmitting 
                            ? 'bg-indigo-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                    }`}
                >
                    {isSubmitting ? 'Submitting...' : 'Create Shift'}
                </button>
                <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancel</button>
                </div>

                {/* Submission Status Message */}
                {submissionMessage && (
                    <p 
                        className={`mt-4 text-center p-2 rounded-md text-sm ${
                            submissionMessage.startsWith('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {submissionMessage}
                    </p>
                )}
            </form>
        </motion.div>
        </motion.div>
    );
};

function LeavesReports({ onBack }) {
    const { theme } = useContext(Context);
    const [isLoading,setIsLoading]=useState();
    const [showAttendanceForm, setShowAttendanceForm] = useState(false);
     const [showShiftForm, setShowShiftForm] = useState(false);
    
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
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-2">
                <LeaveCharts />
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