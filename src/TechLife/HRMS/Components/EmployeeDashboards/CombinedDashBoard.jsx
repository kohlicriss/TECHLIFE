import { Calendar as CalendarDays, BriefcaseMedical, PackageSearch, MessageSquareCode, CircleUserRound, UserRoundCog, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { Fragment, useContext, useEffect, useState } from 'react';
import Calendar from './Calender';
import { FaCalendarAlt, FaTrashAlt, FaFileAlt, FaPlus } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import EmployeeDetails from './EmployeeDetails';
import Applicants from './Applicants';
import JobsList from './JobsList';
import { Context } from '../HrmsContext';
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperclip } from 'react-icons/fa6';
import { FiEdit } from 'react-icons/fi';
import { LiaFileAlt } from 'react-icons/lia';
import LeavesReports from './LeavesReports';
import { authApi } from '../../../../axiosInstance';
import EmployeeTable from './TotalEmployeeLeaves';
import AttendanceTable from './TotalEmployeeAttendance';


const Header = () => {
    const [showFromCalendar, setShowFromCalendar] = useState(false);
    const [fromDate, setFromDate] = useState(new Date());
    const {theme}=useContext(Context);

    return (
        <motion.div
            className="flex justify-between items-center p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            
            <div className="relative flex items-start space-x-4">
                <label className={`block text-sm font-medium ${theme==='dark'?'text-gray-200':'text-gray-800'}`}>Today:</label>
                <motion.button
                    className="relative flex items-center space-x-2 border px-3 py-1 rounded-md text-sm text-gray-700 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                    onClick={() => setShowFromCalendar(!showFromCalendar)}
                    whileHover={{ scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <input
                        type="text"
                        readOnly
                        value={fromDate ? fromDate.toLocaleDateString('en-GB') : 'dd-mm-yyyy'}
                        className="focus:outline-none cursor-pointer bg-transparent"
                    />
                    <AnimatePresence>
                        {showFromCalendar && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="absolute w-full top-full right-0 mt-2 z-50"
                            >
                                <Calendar
                                    selectedDate={fromDate}
                                    onSelectDate={(date) => {
                                        setFromDate(date);
                                        setShowFromCalendar(false);
                                    }}
                                    onClose={() => setShowFromCalendar(false)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </motion.div>
    );
};

const UserGreeting = ({ handleRequestLeave }) => {
    const { userData, theme } = useContext(Context);
    const [loggedInUserProfile, setLoggedInUserProfile] = useState({
        image: null,
        initials: "  " // Ensure this is styled to center correctly
    });

    useEffect(() => {
        const userPayload = JSON.parse(localStorage.getItem("emppayload"));
        const userImage = localStorage.getItem("loggedInUserImage");

        const initials = (userPayload?.displayName || " ")
            .split(" ")
            .map((word) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase(); // Added toUpperCase for better display

        setLoggedInUserProfile({
            image: userImage,
            initials: initials,
        });
    }, [userData]);

    return (
        <motion.div
            // UPDATED: Clearer light/dark mode background, better padding
            className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl shadow-lg mb-6 
                       ${theme === 'dark' 
                            ? 'bg-gray-800 border border-gray-700' // Dark Mode: Solid, contrasted background
                            : 'bg-gradient-to-r from-white to-purple-50 border border-gray-200' // Light Mode: Subtle gradient
                       }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Left Section: Profile and Text */}
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                
                {/* Profile Picture/Initials Container */}
                <motion.div
                    // UPDATED: Larger avatar on desktop, centered initials
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center border-4 ${theme === 'dark' ? 'border-gray-700 bg-indigo-600' : 'border-white bg-indigo-500'} shadow-md`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                   {/* Avatar Logic */}
                   {loggedInUserProfile.image ? (
                        <img
                            src={loggedInUserProfile.image}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        // UPDATED: Centered initials styling
                        <span
                            className={`text-xl font-extrabold text-white`}
                        >
                            {loggedInUserProfile.initials}
                        </span>
                    )}
                </motion.div>
                
                {/* Greeting and Stats Text */}
                <div>
                    <h2 className={`text-xl sm:text-2xl font-extrabold flex items-center ${theme==='dark' ? 'text-white':'text-gray-800'}`}>
                        Welcome, {userData?.fullName || 'User'}👋
                    </h2>
                </div>
            </div>   
        </motion.div>
    );
};

const StatCard = ({ title, value,color, total, titlecolor, icon, onViewAll }) => {
  const {theme}=useContext(Context)
  return(
    <motion.div
        className={`flex flex-col p-4 ${theme==='dark'?'bg-gray-500':'bg-stone-100'}  rounded-lg shadow-md border border-gray-200 cursor-pointer`}
        whileHover={{  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)" }}
        whileTap={{ scale: 0.98 }}
    >
        <div className="flex items-center justify-between">
            <div className={`p-2 rounded-full bg-opacity-20 ${color}`}>
                {React.cloneElement(icon, { className: 'h-8 w-8' })}
            </div>
        </div>
        <h3 className={`mt-4 text-lg  ${titlecolor}`}>{title}</h3>
        <p className="text-2xl font-bold mt-1">
            {value}
            {total && <span className={`text-base ${theme==='dark'?'text-gray-200':'text-gray-500'}  font-normal`}>/{total}</span>}
        </p>
        <motion.button
            onClick={onViewAll}
            className={`${theme==='dark'?'text-blue-300':'text-blue-500'}  text-lg mt-4 text-left hover:underline`}
            whileHover={{ x: 5 }}
        >
            View All
        </motion.button>
    </motion.div>
)};

const EmployeeChart = () => {
    const [timeframe, setTimeframe] = useState('This Week');
    const employeeData = [
        { Role: 'UI/UX', Employees: 20 },
        { Role: 'Development', Employees: 50 },
        { Role: 'Management', Employees: 15 },
        { Role: 'HR', Employees: 10 },
        { Role: 'Testing', Employees: 5 },
        { Role: 'Marketing', Employees: 8 },
    ];
    const totalEmployees = employeeData.reduce((sum, dept) => sum + dept.Employees, 0);
    const {theme}=useContext(Context)

    return (
        <motion.div
            className={` ${theme==='dark'?'bg-gray-500':'bg-stone-100'}  p-6 rounded-lg shadow-md h-full border border-gray-200`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${theme==='dark'?'text-gray-200':'text-gray-800'}`}>Employees By Department</h2>
                <div className="relative inline-block text-left">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className={`block w-full ${theme==='dark'?'bg-gray-800 text-gray-200':'bg-stone-100'} rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pr-2 py-2 text-sm   border cursor-pointer`}
                    >
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>Last Week</option>
                    </select>
                </div>
            </div>
            <div className="space-y-4">
                <AnimatePresence>
                    {employeeData.map((department, index) => (
                        <motion.div
                            key={department.Role}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <p className={`text-sm font-medium ${theme==='dark'?'text-gray-200':'text-gray-800'}  mb-1`}>{department.Role}</p>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <motion.div
                                    className="bg-orange-500 h-4 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(department.Employees / totalEmployees) * 100}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                ></motion.div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const EmployeeStatus = [
    { FullTime: 40 },
    { Interns: 51 },
    { Probation: 13 },
    { WFH: 4 },
];
const totalEmployees = EmployeeStatus.reduce((acc, curr) => {
    const value = Object.values(curr)[0]
    return acc + parseInt(value, 10)
}, 0);
const calculatePercentage = (count) =>
    ((count / totalEmployees) * 100).toFixed(0);

const statusData = {
    FullTime: {
        count: EmployeeStatus.find((item) => item.FullTime)?.FullTime || 0,
        color: 'bg-orange-500',
        label: 'Fulltime',
    },
    Interns: {
        count: EmployeeStatus.find((item) => item.Interns)?.Interns || 0,
        color: 'bg-purple-500',
        label: 'Interns',
    },
    Probation: {
        count: EmployeeStatus.find((item) => item.Probation)?.Probation || 0,
        color: 'bg-indigo-500',
        label: 'Probation',
    },
    WFH: {
        count: EmployeeStatus.find((item) => item.WFH)?.WFH || 0,
        color: 'bg-red-500',
        label: 'WFH',
    },
};

const EmployeeStatusDashboard = ({ onViewAll }) => {
    const [selectedTimeframe, setSelectedTimeframe] = useState('This Week');
    const {theme}=useContext(Context)

    return (
        <motion.div
            className={`p-4 ${theme==='dark'?'bg-gray-500':'bg-stone-100'}  rounded-lg shadow-lg border border-gray-200 h-full`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold  ${theme==='dark'?'text-gray-200':'text-gray-800'}`}>Employee Status</h2>
                <div className="relative inline-block text-left">
                    <select
                        value={selectedTimeframe}
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className={`inline-flex ${theme==='dark'?'bg-gray-800 text-gray-200':'bg-stone-100'} justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 text-sm font-medium  focus:outline-none`}
                    >
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>Last Month</option>
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className={`${theme==='dark'?'text-gray-200':'text-gray-600'}`}>Total Employee</span>
                    <span className={`text-3xl font-bold ${theme==='dark'?'text-gray-200':'text-gray-900'}`}>{totalEmployees}</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden">
                    <AnimatePresence>
                        {Object.entries(statusData).map(([key, data], index) => (
                            <motion.div
                                key={key}
                                style={{ width: `${calculatePercentage(data.count)}%` }}
                                className={`${data.color}`}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.8, delay: index * 0.1, originX: 0 }}
                            ></motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <AnimatePresence>
                    {Object.entries(statusData).map(([key, data], index) => (
                        <motion.div
                            key={key}
                            className={`p-4 ${theme==='dark'?'bg-gray-900':'bg-blue-50'} rounded-xl border border-gray-200`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                        >
                            <div className="flex items-center mb-2">
                                <span className={`w-3 h-3 ${data.color} rounded-sm mr-2`}></span>
                                <span className={`${theme==='dark'?'text-gray-200':'text-gray-600'} text-sm font-medium`}>
                                    {data.label} ({calculatePercentage(data.count)}%)
                                </span>
                            </div>
                            <p className={`text-4xl font-extrabold ${theme==='dark'?'text-gray-200':'text-gray-600'}`}>{data.count}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <div className="mt-4 text-center">
                <motion.button
                    onClick={onViewAll}
                    className={`w-full py-2 px-4 ${theme==='dark'?'text-gray-200 bg-gray-800 hover:bg-gray-900':'text-gray-700 bg-gray-100 hover:bg-gray-50'} border border-gray-300 rounded-md font-medium  `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    View All Employees
                </motion.button>
            </div>
        </motion.div>
    );
};

const ChartsLayout = ({ onViewAll }) => {
    const [activeTab, setActiveTab] = useState('applicants');
    const {theme}=useContext(Context)

    const applicants = [
        { name: 'Manikanta', exp: '5+', location: 'Hydrebad', job: 'Senior DevOps Engineer'},
        { name: 'Ramesh',    exp: '4+', location: 'Bangalore', job: 'UI/UX Designer'},
        { name: 'Raghunadh', exp: '6+', location: 'Chennai', job: 'Full Stack Developer'},
        { name: 'Anita',     exp: '2+', location: 'Hyderabad', job: 'Junior React Developer'},
        { name: 'SriLekha', exp: '2+', location: 'Mumbai', job: 'Data Scientist'},
    ];
    const teamLeadImageMap = {
        Manikanta : 'https://randomuser.me/api/portraits/men/74.jpg',
        Ramesh: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D',
       Raghunadh: 'https://i.pravatar.cc/40?img=4',
        Anita: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D',
       SriLekha: 'https://randomuser.me/api/portraits/women/63.jpg'
    };
    const bgcolor={
        Manikanta: 'bg-teal-500',
        Ramesh: 'bg-blue-500',
       Raghunadh: 'bg-pink-500',
        Anita: 'bg-purple-500',
         SriLekha: 'bg-yellow-500'

    }
    const openings = [
        { title: 'Senior DevOps Engineer', openings: 10, Category: "DevOps", Location: "Hyderabad,India", Salary: "$8,00,000 - $12,00,000 per Annum", Date: "2023-10-01" },
        { title: 'Data Scientist', openings: 20,  Category: "Data Science", Location: "Bangalore,India", Salary: "$7,00,000 - $10,00,000 per Annum", Date: "2023-10-05" },
        { title: 'Junior React Developer', openings: 30,  Category: "Software", Location: "Chennai,India", Salary: "$4,00,000 - $6,00,000 per Annum", Date: "2023-10-10" },
        { title: 'UI/UX Designer', openings: 40, Category: "Design", Location: "Mumbai,India", Salary: "$3,00,000 - $5,00,000 per Annum", Date: "2023-10-20", },
        { title: 'Full Stack Developer', openings: 15,  Category: "Software", Location: "Delhi,India", Salary: "$5,00,000 - $7,00,000 per Annum", Date: "2023-10-25" },
    ];
    const logoMap = {
        'Senior DevOps Engineer': '🛠️',
        'Data Scientist': '🐘',
        'Junior React Developer': '⚛️',
        'UI/UX Designer': '⚙️',
        'Full Stack Developer': '💻',
    };
        const renderContent = () => {
        if (activeTab === 'applicants') {
            return (
                <motion.ul
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {applicants.map((applicant, index) => (
                        <motion.li
                            key={index}
                            className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-200"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <div className="flex items-center">
                                <img src={teamLeadImageMap[applicant.name]} alt={applicant.name} className="w-10 h-10 rounded-full mr-4 object-cover" />
                                <div>
                                    <h3 className={`text-lg font-medium ${theme==='dark'?'text-gray-200':'text-gray-900'}`}>{applicant.name}</h3>
                                    <p className={`text-sm ${theme==='dark'?'text-gray-200':'text-gray-500'}`}>Exp: {applicant.exp} Years • {applicant.location}</p>
                                </div>
                            </div>
                            <span className={`text-white text-xs font-semibold px-3 py-1 rounded-full ${bgcolor[applicant.name] ? bgcolor[applicant.name] : 'bg-gray-500'}`}>{applicant.job}</span>
                        </motion.li>
                    ))}
                </motion.ul>
            );
        } else {
            return (
                <motion.ul
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {openings.map((opening, index) => (
                        <motion.li
                            key={index}
                            className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-200"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <div className="flex items-center">
                                <span className="text-xl mr-4">
                                    {logoMap[opening.title] || '💼'}
                                </span>
                                <div>
                                    <h3 className={`text-sm font-medium ${theme==='dark'?'text-gray-200':'text-gray-900'}`}>{opening.title}</h3>
                                    <p className={`text-sm ${theme==='dark'?'text-gray-200':'text-gray-500'}`}>No of Openings : {opening.openings}</p>
                                </div>
                            </div>
                            <motion.button
                                onClick={() => alert('View Application')}
                                className="text-gray-500 hover:text-gray-900"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                ✏️
                            </motion.button>
                        </motion.li>
                    ))}
                </motion.ul>
            );
        }
    };

    return (
        <motion.div
            className={`p-4 flex flex-col items-center ${theme==='dark'?'bg-gray-500':'bg-stone-100'}  rounded-lg shadow-md border border-gray-200`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
        >
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-xl font-semibold ${theme==='dark'?'text-gray-200':'text-gray-900'} `}>Jobs Applicants</h2>
                    <motion.button
                        className={`${theme==='dark'?'text-blue-200':'text-blue-600'} hover:underline`}
                        onClick={onViewAll}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        View All
                    </motion.button>
                </div>
                <div className="flex space-x-2 border-b-2 border-gray-200 mb-4">
                    <motion.button
                        onClick={() => setActiveTab('openings')}
                        className={`py-2 px-1 rounded-t-lg font-medium transition-colors duration-200 ${activeTab === 'openings' ? 'bg-orange-500 text-white' : 'text-gray-900'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Openings
                    </motion.button>
                    <motion.button
                        onClick={() => setActiveTab('applicants')}
                        className={`py-3 px-4 rounded-t-lg font-medium transition-colors duration-200 ${activeTab === 'applicants' ? 'bg-orange-500 text-white' : 'text-gray-900'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Applicants
                    </motion.button>
                </div>
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const TaskStatistics = ({onViewAll}) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Today');
    const tasks = [
        { label: 'Ongoing', percentage: 24 },
        { label: 'On Hold', percentage: 10 },
        { label: 'Overdue', percentage: 16 },
        { label: 'Completed', percentage: 40 },
    ];
    const getlabelColor = (label) => {
        switch (label) {
            case "Ongoing":
                return " text-yellow-400";
            case "On Hold":
                return " text-blue-500";
            case "Overdue":
                return "text-red-500";
            case "Completed":
                return " text-green-800";
            default:
                return " text-black-800";
        }
    };

    const totalTasks = 60;
    const totalTasksPossible = 80;
    const spentHours = 42;
    const totalHours = 50;
    const {theme}=useContext(Context);

    return (
        <div className="p-1 flex flex-col items-center   font-sans">
            <div className={`${theme==='dark'?'bg-gray-500':'bg-stone-100'} rounded-lg shadow-md  p-2 w-full max-w-2xl`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-xl font-semibold ${theme==='dark'?'text-gray-200':'text-gray-800'}`}>Tasks Statistics</h2>
                    <div className="relative inline-block text-left">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className={`inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2  text-sm font-medium ${theme==='dark'?'bg-gray-800 text-gray-200':'bg-stone-100'} focus:outline-none`}
                        >
                            <option>Today</option>
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>Last Month</option>
                        </select>
                    </div>
                </div>
                <div className="relative flex justify-center items-center h-48">
                    <div className="absolute top-0 w-full h-full">
                        <svg className="w-full h-full" viewBox="0 0 100 50">
                            <defs>
                                <linearGradient id="ongoing-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: '#facc15' }} />
                                    <stop offset="100%" style={{ stopColor: '#facc15' }} />
                                </linearGradient>
                                <linearGradient id="onhold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: '#3b82f6' }} />
                                    <stop offset="100%" style={{ stopColor: '#3b82f6' }} />
                                </linearGradient>
                                <linearGradient id="overdue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: '#ef4444' }} />
                                    <stop offset="100%" style={{ stopColor: '#ef4444' }} />
                                </linearGradient>
                                <linearGradient id="second-ongoing-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: '#22c55e' }} />
                                    <stop offset="100%" style={{ stopColor: '#22c55e' }} />
                                </linearGradient>
                            </defs>
                            
                            <path
                                d="M 2.5 50 A 47.5 47.5 0 0 1 97.5 50"
                                fill="none"
                                stroke="url(#ongoing-gradient)"
                                strokeWidth="5"
                                strokeDasharray={`${(24 / 100) * 150.8} ${150.8 - (24 / 100) * 150.8}`}
                                strokeDashoffset="0"
                                className="transition-all duration-1000 ease-out"
                            />
                            <path
                                d="M 2.5 50 A 47.5 47.5 0 0 1 97.5 50"
                                fill="none"
                                stroke="url(#onhold-gradient)"
                                strokeWidth="5"
                                strokeDasharray={`${(10 / 100) * 150.8} ${150.8 - (10 / 100) * 150.8}`}
                                strokeDashoffset={`-${(24 / 100) * 150.8}`}
                                className="transition-all duration-1000 ease-out"
                            />
                            <path
                                d="M 2.5 50 A 47.5 47.5 0 0 1 97.5 50"
                                fill="none"
                                stroke="url(#overdue-gradient)"
                                strokeWidth="5"
                                strokeDasharray={`${(16 / 100) * 150.8} ${150.8 - (16 / 100) * 150.8}`}
                                strokeDashoffset={`-${((24 + 10) / 100) * 150.8}`}
                                className="transition-all duration-1000 ease-out"
                            />
                            <path
                                d="M 2.5 50 A 47.5 47.5 0 0 1 97.5 50"
                                fill="none"
                                stroke="url(#second-ongoing-gradient)"
                                strokeWidth="5"
                                strokeDasharray={`${(40 / 100) * 150.8} ${150.8 - (40 / 100) * 150.8}`}
                                strokeDashoffset={`-${((24 + 10 + 16) / 100) * 150.8}`}
                                className="transition-all duration-1000 ease-out"
                            />
                            
                        </svg>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 text-center">
                        <div className={`text-sm ${theme==='dark'?'text-gray-200':'text-gray-500'}`}>Total Tasks</div>
                        <div className={`text-3xl font-bold ${theme==='dark'?'text-gray-200':'text-gray-800'}`}>{totalTasks}/{totalTasksPossible}</div>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center space-x-4 my-6">
                    {tasks.map((task, index) => (
                        <div key={index} className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color }}></div>
                            <span className={`text-sm ${theme==='dark'?'text-gray-200':'text-gray-600'} ${getlabelColor(task.label)}`}>{task.label}</span>
                            <span className="text-sm font-semibold">{task.percentage}%</span>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-900 text-white rounded-lg p-4 flex justify-between items-center">
                    <div>
                        <div className="text-xl text-green-400 font-bold">{spentHours}/{totalHours} hrs</div>
                        <div className="text-sm text-gray-400">Spent on Overall Tasks This Week</div>
                    </div>
                    <button onClick={onViewAll} className={`${theme==='dark'?'bg-gray-500 text-gray-200':' bg-stone-100 text-gray-800'}  font-semibold px-4 py-2 rounded-md`}>
                        View All
                    </button>
                </div>
            </div>
        </div>
    );
};
function Project() {
    const { userData,theme } = useContext(Context);
    const role = (userData?.roles?.[0] || "").toUpperCase();
    const showSidebar = ["TEAM_LEAD", "HR", "MANAGER","ADMIN"].includes(role);

    const [projectTableData, setProjectTableData] = useState([
        {project_id: "P_01",project_name: "HRMS Project",status: "Ongoing",start_date: "2025-05-01",end_date: "2025-09-30",Team_Lead:"Naveen",                   Priority: "High",Open_task: 30,Closed_task: 25,Details: "https://www.flaticon.com/free-icon/document_16702688"},
        { project_id: "P_02",project_name: "Employee Self-Service App", status: "Upcoming", start_date: "2025-10-15", end_date: "2025-12-15",Team_Lead:"Rajiv",  Priority: "Medium", Open_task: 20, Closed_task: 10, Details: "https://www.flaticon.com/free-icon/document_16702688" },
        {project_id: "P_03",project_name: "Payroll Automation",status: "Completed",start_date: "2024-10-01",end_date: "2025-02-15",Team_Lead:"Manikanta",        Priority: "High",Open_task: 12,Closed_task: 10,Details: "https://www.flaticon.com/free-icon/document_16702688"},
        {project_id: "P_04",project_name: "Attendance System Upgrade",status: "Ongoing",start_date: "2025-05-10",end_date: "2025-08-10",Team_Lead:"Ravinder",    Priority: "Low",Open_task: 40,Closed_task: 25,Details: "https://www.flaticon.com/free-icon/document_16702688" },
        {project_id: "P_05",project_name: "AI-Based Recruitment Tool",status: "Upcoming",start_date: "2025-12-01",end_date: "2026-02-28",Team_Lead:"Sravani",    Priority: "Medium",Open_task: 20,Closed_task: 15,Details: "https://www.flaticon.com/free-icon/document_16702688"},
        {project_id: "P06",project_name: "Internal Chatbot System",status: "Completed",start_date: "2024-05-01",end_date: "2024-11-30",Team_Lead:"Gayatri",      Priority: "High",Open_task: 30,Closed_task: 25,Details: "https://www.flaticon.com/free-icon/document_16702688"}]);

    const teamLeadImageMap = {
        Naveen: "https://i.pravatar.cc/40?img=1",
        Rajiv: "https://i.pravatar.cc/40?img=2",
        Manikanta: "https://i.pravatar.cc/40?img=3",
        Ravinder: "https://i.pravatar.cc/40?img=4",
        Sravani: "https://i.pravatar.cc/40?img=5",
        Gayatri: "https://i.pravatar.cc/40?img=6"
    };

    
    const getPriorityColor = (priority) => {
        switch (priority) {case "High":return "bg-green-100 text-green-800";case "Medium":return "bg-orange-100 text-orange-800";case "Low": return "bg-red-100 text-red-800";default:return "bg-gray-100 text-gray-800";}};
    const getStatusColor = (status) => {
        switch (status) {case "In Progress":    return "bg-green-100 text-green-800";case "Ongoing": return "bg-blue-100 text-blue-800";case "Upcoming": return "bg-yellow-100 text-yellow-800";case "Completed": return "bg-purple-100 text-purple-800";default: return "bg-gray-100 text-gray-800";} };
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newProject, setNewProject] = useState({
        project_id: "",
        project_name: "",
        status: "Ongoing",
        start_date: "",
        end_date: "",
        Team_Lead:"",
        Employee_team: [],
        Priority: "Medium",
        Open_task: 0,
        Closed_task: 0,
        rating: "",
        remark: "",
        completionNote: "",
        relatedLinks: [""],
        attachedFileLinks: [],
    });
    const [files, setFiles] = useState([]);
    const handleCreateProject = (e) => {
        e.preventDefault();
        setProjectTableData(prev => [
            ...prev,
            { ...newProject, project_id: `P_${prev.length + 1}`, attachedFileLinks: files }
        ]);
        setShowCreateForm(false);
        setNewProject({
            project_id: "",
            project_name: "",
            status: "Ongoing",
            start_date: "",
            end_date: "",
            Team_lead:"",
            Employee_team: [],
            Priority: "Medium",
            Open_task: 0,
            Closed_task: 0,
            rating: "",
            remark: "",
            completionNote: "",
            relatedLinks: [""],
            attachedFileLinks: [],
        });
        setFiles([]);
    };

    const handleFileChange = (e) => {
        setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRelatedLinkChange = (index, value) => {
        const newLinks = [...newProject.relatedLinks];
        newLinks[index] = value;
        setNewProject(prev => ({ ...prev, relatedLinks: newLinks }));
    };

    const addRelatedLink = () => {
        setNewProject(prev => ({ ...prev, relatedLinks: [...prev.relatedLinks, ""] }));
    };

    const removeRelatedLink = (index) => {
        setNewProject(prev => ({
            ...prev,
            relatedLinks: prev.relatedLinks.filter((_, i) => i !== index)
        }));
    };
    const [editProjectIndex, setEditProjectIndex] = useState(null);
const [editProjectData, setEditProjectData] = useState(null);

const handleEditProject = (idx) => {
    setEditProjectIndex(idx);
    setEditProjectData(projectTableData[idx]);
    setShowEditForm(true);
};

const handleDeleteProject = (idx) => {
    setProjectTableData(prev => prev.filter((_, i) => i !== idx));
};

const [showEditForm, setShowEditForm] = useState(false);

const handleUpdateProject = (e) => {
    e.preventDefault();
    setProjectTableData(prev =>
        prev.map((proj, idx) => idx === editProjectIndex ? editProjectData : proj)
    );
    setShowEditForm(false);
    setEditProjectIndex(null);
    setEditProjectData(null);
};
 const [statusFilter, setStatusFilter] = useState("All");
   const navigate = useNavigate();
const handleRowClick = (proj) => {
    navigate(`/project-details/${proj.project_id}`, { state: { project: proj } });
};
    return (
        <motion.div
            className={`p-6  rounded-2xl shadow-xl border border-purple-500 overflow-x-auto relative ${theme==='dark' ? 'bg-gray-700':'bg-gradient-to-br from-purple-10 to-purple-50 '}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
        >
            <div className="absolute right-5 gap-2 justify-end items-end">
                    <select
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value)}
                       className={`${theme==='dark'?'bg-gray-500 text-purple-500':'bg-purple-50  text-purple-700'} border border-purple-500   font-medium rounded-xl px-4 py-2 text-sm shadow   shadow transition`}
                    >
                     <option value="All" className={` ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-black'}`}>Select Status</option>
                     <option value="Ongoing" className={` ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-black'}`}>Ongoing</option>
                     <option value="Upcoming" className={` ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-black'}`}>Upcoming</option>
                     <option value="Completed"className={` ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-black'}`}>Completed</option>
                   </select>
         
            </div>
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold text-purple-800 ${theme==='dark' ? 'bg-gradient-to-br from-purple-100 to-purple-400 bg-clip-text text-transparent ':''}`}>
                    Project Overview</h2>
                    
            </div>
            {/* Full-page overlay for the form */}
          <div className="overflow-x-auto rounded-xl  ">
            <table className="min-w-full bg-white  ">
                <thead className={` text-left uppercase tracking-wider border border-purple-500 ${theme==='dark' ? 'bg-gray-500 text-white':'bg-purple-50 text-purple-700'}`}>
                    <tr className={" border border-purple-500"}>
                        <th className="p-3 text-sm md:text-base">Project</th>
                        <th className="p-3 text-sm md:text-base">Team_Lead</th>
                        <th className="p-3 text-sm md:text-base"><FaCalendarAlt className="inline mr-1" />Start</th>
                        <th className="p-3 text-sm md:text-base"><FaCalendarAlt className="inline mr-1" />End</th>
                        <th className="p-3 text-sm md:text-base">Priority</th>
                        <th className="p-3 text-sm md:text-base">Status</th>
                        <th className="p-3 text-sm md:text-base">Open Task</th>
                        <th className="p-3 text-sm md:text-base">Closed Task</th>
                        <th className="p-3 text-sm md:text-base">Details</th>
                       {/* {showSidebar &&<th className="p-3 text-sm md:text-base">Delete</th>}*/}
                    </tr>
                </thead>
                <tbody  className="bg-white   ">
                    <AnimatePresence>
                        {projectTableData.filter((proj)=>statusFilter==="All"||proj.status===statusFilter)
                        .map((proj, index) => (
                            <motion.tr
                                key={proj.project_id}
                                className="border-t border-gray-100 hover:bg-gray-50"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                 onClick={() => handleRowClick(proj)}
                            >
                                <td className={`p-3 text-sm md:text-base font-semibold ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}> {proj.project_name}</td>
                                <td className={`p-3 text-sm md:text-base font-semibold ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}> 
                                     <motion.img
                                            src={teamLeadImageMap[proj.Team_Lead] || "https://i.pravatar.cc/40?img=19"} // Fallback image
                                            alt={proj.Team_Lead}
                                            className="w-8 h-8 md:w-8 md:h-8 rounded-full border-2 border-white shadow-sm inline-block mr-2"
                                            whileHover={{ scale: 1.1, translateY: -5, zIndex: 10 }}
                                        />
                                        {proj.Team_Lead}
                                    
                                </td>
                                <td className={`p-3 text-sm md:text-base ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>{proj.start_date}</td>
                                <td className={`p-3 text-sm md:text-base ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>{proj.end_date}</td>
                                <td className={`p-3 ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>
                                    <select value={proj.Priority} onChange={(e) => (proj.Priority = e.target.value)} className={`px-3 py-1 rounded text-xs font-medium shadow cursor-pointer ${
                                          proj.Priority === "High"
                                            ? "bg-red-100 text-red-700"
                                            : proj.Priority === "Medium"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-green-100 text-green-700"
                                        }`}
                                    >
                                     <option value="High" className="text-red-600 ">🔴 High </option>
                                     <option value="Medium" className="text-yellow-600">🟡 Medium </option>
                                     <option value="Low" className="text-green-600"> 🟢 Low </option>
                                 </select>
                                </td>
                                <td className={`p-3 ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>
                                    <select value={proj.status} onChange={(e) => (proj.status = e.target.value)} className={`px-3 py-1 rounded text-xs font-medium shadow cursor-pointer ${
                                          proj.status === "Ongoing"
                                            ? "bg-blue-100 text-blue-700"
                                            : proj.status === "Upcoming"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-purple-100 text-purple-700"
                                        }`}
                                    >
                                     <option value="Ongoing" className="text-blue-600 ">🔵 Ongoing</option>
                                     <option value="Upcoming" className="text-yellow-600">🟡 Upcoming</option>
                                     <option value="Completed" className="text-blue-600">🟣 Completed</option>
                                 </select>
                                </td>
                                <td className={`p-3 text-sm md:text-base ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>{proj.Open_task}</td>
                                <td className={`p-3 text-sm md:text-base ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>{proj.Closed_task}</td>          
                             <td className={`p-3 text-center ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}><a href={proj.Details} target="_blank" rel="noopener noreferrer"><motion.div whileHover={{ scale: 1.2 }}> <FaFileAlt className={` ${theme==='dark' ? 'text-blue-200':'text-blue-600'} text-lg inline w-6 h-6 md:w-6 md:h-6 transition`} /> </motion.div></a></td>
                          { /*  {showSidebar && (
                                <td className={`p-3 text-center ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>
                                    <motion.button
                                        whileHover={{ scale: 1.2 }}
                                        onClick={e => { e.stopPropagation(); handleEditProject(index); }}
                                    >
                                        <FiEdit className={` ${theme==='dark' ? 'text-blue-200':'text-blue-600'} text-lg w-3 h-3 md:w-5 md:h-5 transition`} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.2 }}
                                       onClick={e => { e.stopPropagation(); handleDeleteProject(index); }}
                                        className="ml-2"
                                    >
                                        <FaTrashAlt className={`${theme==='dark' ? 'text-red-200':'text-red-600'} text-lg w-3 h-3 md:w-5 md:h-5 transition`} />
                                    </motion.button>
                                </td> 
                            )} */}
                            </motion.tr>
                            ))}
                    </AnimatePresence>
                </tbody>
            </table>
            </div>
        </motion.div>
    );
}


const CombinedDashboard = () => {
    const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
    const [showApplicants, setShowApplicants] = useState(false);
    const [showJobsList, setShowJobsList] = useState(false);
    const [showchartLayout, setShowchartLayout] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
        const [showReport, setShowReport] = useState(false);
        const [showMain,setShowMain]=useState(false);
    const { userData,theme } = useContext(Context);
    const navigate=useNavigate()
    const { empID } = useParams();
     const [flippedCard, setFlippedCard] = useState(null);
        const [contextMenu, setContextMenu] = useState({
            visible: false,
            x: 0,
            y: 0,
            employee: null,
        });
        const [sidebarView, setSidebarView] = useState(null);
     const role = (userData?.roles?.[0] || "").toUpperCase();   
     const showSidebar = ["TEAM_LEAD", "HR", "MANAGER","ADMIN"].includes(role);
     const [loggedPermissiondata,setLoggedPermissionData]=useState([]);
    const [matchedArray,setMatchedArray]=useState(null);
    const LoggedUserRole=userData?.roles[0]?`ROLE_${userData?.roles[0]}`:null
    useEffect(()=>{
                     let fetchedData=async()=>{
                             let response = await authApi.get(`role-access/${LoggedUserRole}`);
                             console.log("from Employee :",response.data);
                             setLoggedPermissionData(response.data);
                     }
                     fetchedData();
                     },[])
                
                     useEffect(()=>{
                     if(loggedPermissiondata){
                         setMatchedArray(loggedPermissiondata?.permissions)
                     }
                     },[loggedPermissiondata]);
                     console.log(matchedArray);
        
            const [hasAccess,setHasAccess]=useState([])
                useEffect(()=>{
                    setHasAccess(userData?.permissions)
                },[userData])
                console.log("permissions from userdata:",hasAccess)
    const handleProjectClick= async(employee)=>{
       if (employee) {
            navigate(`/projects/${userData.employeeId}?fromContextMenu=true&targetEmployeeId=${userData.employeeId}`);
        }
        setContextMenu({ ...contextMenu, visible: false });
        setFlippedCard(null);
    }
    const handleTaskClick= async(employee)=>{
      if (employee) {
            navigate(`/tasks/${empID}?fromContextMenu=true&targetEmployeeId=${employee.employeeId}`);
        }
        setContextMenu({ ...contextMenu, visible: false });
        setFlippedCard(null);
    }
    const handleEmployeeClick= async(employee)=>{
      if (employee) {
            navigate(`/employees/${empID}?fromContextMenu=true&targetEmployeeId=${employee.employeeId}`);
        }
        setContextMenu({ ...contextMenu, visible: false });
        setFlippedCard(null);
    }
    const handleTasksClick= async(employee)=>{
      if (employee) {
            navigate(`/tasks/${empID}?fromContextMenu=true&targetEmployeeId=${employee.employeeId}`);
        }
        setContextMenu({ ...contextMenu, visible: false });
        setFlippedCard(null);
    }
    const handleViewchartLayout = () => {
        setShowchartLayout(true);
    };
    const handleViewEmployee = () => {
        setShowEmployeeDetails(true);
    };
    const handleViewApplicants = () => {
        setShowApplicants(true);
    };
    const handleViewJobs = () => {
        setShowJobsList(true);
    };

    const handleBackToDashboard = () => {
        setShowEmployeeDetails(false);
        setShowApplicants(false);
        setShowJobsList(false);
        setShowchartLayout(false);
    };

    if (showchartLayout) {
        return <JobsList onBack={handleBackToDashboard} />;
    }
    if (showJobsList) {
        return <JobsList onBack={handleBackToDashboard} />;
    }
    if (showApplicants) {
        return <Applicants onBack={handleBackToDashboard} />;
    }
    if (showEmployeeDetails) {
        return <EmployeeDetails onBack={handleBackToDashboard} />;
    }

    const StatsOverview = [
        {
            title: 'Total No of Projects',
            value: '5',
            total: '10',

        },
        {
            title: 'Total No of Tasks',
            value: '60',
            total: '80',

        },
        {
            title: 'Job Applicants',
            value: '20',

        },
        {
            title: 'New Hire',
            value: '30',
            total: '20',

        },
    ];
    const handleShowReports = () => {
        setShowReport(true);
        setSidebarOpen(false);
    };
    const handleShowMain=()=>{
        setShowMain(true);
        setSidebarOpen(false);
    }
    const handleGoBackToDashboard = () => {
        setShowReport(false);
    };
    const handleShowAttendance = () => {
        setSidebarView('attendance');
        setSidebarOpen(false);
    };
    const handleShowLeaves = () => {
        setSidebarView('leaves');
        setSidebarOpen(false);
    };
    
    



    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} p-4 font-sans`}>
            <AnimatePresence>
                {/* Sidebar Trigger Button */}
                {showSidebar && !sidebarOpen && (
                    <motion.button
                        key="open-sidebar"
                        onClick={() => setSidebarOpen(true)}
                        className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-l-lg shadow-lg z-50 hover:bg-indigo-700 transition-colors"
                        aria-label="Open Sidebar"
                        initial={{ x: '100%' }}
                        animate={{ x: '0%' }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <ChevronLeft />
                    </motion.button>
                )}

                {/* Sidebar */}
                {(matchedArray || []).includes("VIEW_LEAVES_REPORTS") && sidebarOpen && (
                    <motion.div
                        key="sidebar"
                        className={`fixed inset-y-0 right-0 w-80 ${theme==='dark'?'bg-gray-900':'bg-stone-100'} shadow-xl z-40 p-4 flex flex-col`}
                        initial={{ x: '100%' }}
                        animate={{ x: '0%' }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.h3
                            className={`text-lg font-bold ${theme==='dark'?'text-gray-200 hover:bg-gray-500':'text-gray-900 hover:bg-blue-100'} cursor-pointer mb-1 mt-20  p-2 rounded-md`}
                             onClick={handleShowAttendance}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <LiaFileAlt className="w-5 h-5 inline-block mr-2"  />Total Employee Attendance 
                        </motion.h3>
                        <motion.h3
                            className={`text-lg font-bold ${theme==='dark'?'text-gray-200 hover:bg-gray-500':'text-gray-900 hover:bg-blue-100'} cursor-pointer mb-4   p-2 rounded-md`}
                           onClick={handleShowLeaves}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <LiaFileAlt className="w-5 h-5 inline-block mr-2"  />Total Employee Leaves
                        </motion.h3>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors z-50"
                            aria-label="Close Sidebar"
                            initial={{ x: '100%' }}
                            animate={{ x: '0%' }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <ChevronRight />
                        </button>
                        
                    </motion.div>
                )}
            </AnimatePresence>
            <Header />
             <div className={`flex-1 transition-all duration-300 p-2 sm:p-3 lg:p-4`}>
         
              {sidebarOpen && <div className="md:hidden fixed inset-0 bg-black opacity-50 z-30" onClick={() => setSidebarOpen(false)}></div>}
            <main className={`p-2 sm:p-2 lg:p-2 ${sidebarOpen && showSidebar ? 'filter blur-sm' : ''}`}>
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
                        {/* Render Employee Table only for Leaves */}
                        {sidebarView === 'leaves' && (
                            <motion.div
                                key="leaves"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <EmployeeTable onBack={() => setSidebarView(null)} />
                            </motion.div>
                        )}
                    {sidebarView === null && (
            <div className="container mx-auto">
                <UserGreeting />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {StatsOverview.map((Stats, index) => {
                        let icon, titlecolor, onViewAllHandler,color;
                        switch (Stats.title) {
                            case "Total No of Projects":
                                icon = < BriefcaseMedical className="h-6 w-6 sm:w-7 sm:h-7 inline-block text-blue-600 mr-2" />
                                titlecolor = "text-blue-500";
                                color="text-blue-500";
                                onViewAllHandler = handleProjectClick;
                                break;
                            case "Total No of Tasks":
                                icon = <PackageSearch className="h-6 w-6 sm:w-7 sm:h-7 inline-block text-pink-600 mr-2" />
                                titlecolor = "text-pink-500";
                                color="text-pink-500";
                                onViewAllHandler = handleTaskClick;
                                break;
                            case "Job Applicants":
                                icon = <MessageSquareCode className="h-6 w-6 sm:w-7 sm:h-7 inline-block text-yellow-600 mr-2" />
                                titlecolor = "text-yellow-500";
                                color= "text-yellow-500";
                                onViewAllHandler = handleViewJobs;
                                break;
                            case "New Hire":
                                icon = <CircleUserRound className="h-6 w-6 sm:w-7 sm:h-7 inline-block text-purple-600 mr-2" />
                                titlecolor = "text-purple-500";
                                color="text-purple-500";
                                onViewAllHandler = handleViewApplicants;
                                break
                            default:
                                onViewAllHandler = () => console.log('No handler defined');
                        }

                        return (
                            <StatCard key={index} icon={icon} color={color} title={Stats.title} titlecolor={titlecolor} value={Stats.value} total={Stats.total} onViewAll={onViewAllHandler} />
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                    <EmployeeStatusDashboard onViewAll={ handleEmployeeClick} />
                    <EmployeeChart />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                    <ChartsLayout onViewAll={handleViewchartLayout} />
                    <TaskStatistics onViewAll={handleTasksClick} />
                </div>
                <div className="mt-6">
                    <Project />
                </div>
            </div>
    )};
            </AnimatePresence>
            </main>
        </div>
        </div>
    );
};

export default CombinedDashboard;