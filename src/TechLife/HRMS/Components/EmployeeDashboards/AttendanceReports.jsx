import { CalendarDaysIcon, ClockIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import React, { useMemo, useState, Fragment, useContext } from "react";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { MdEditCalendar } from "react-icons/md";
import { BiCalendarStar } from "react-icons/bi";
import { LiaCalendarCheck } from "react-icons/lia";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser } from "react-icons/fi";
import { Context } from "../HrmsContext";

const ChartData = [
    {
        title: "Total Working Days in Month",
        value: "25",
        trend: "up",
        trendPercentage: "83.3",
        trendPeriod: "This Month"
    },
    {
        title: "Total Leave Taken Today",
        value: "12",
        trend: "down",
        trendPercentage: "20",
        trendPeriod: "This Week"
    },
    {
        title: "Total Holidays per Year",
        value: "6",
        trend: "up",
        trendPercentage: "50",
        trendPeriod: "This Year"
    },
    {
        title: "Total Halfdays per Day",
        value: "5",
        trend: "down",
        trendPercentage: "16.6",
        trendPeriod: "This Month"
    }
];

const ChartCard = ({ title, titlecolor, icon, value, color, trend, trendPercentage, trendPeriod }) => {
    const isUp = trend === 'up';
    const {theme} = useContext(Context);
    return (
        <motion.div
            className={` rounded-xl p-2 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col items-center justify-center text-center space-y-2 ${theme==='dark' ? 'bg-gray-600 ':'bg-stone-100 '}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
        >
            <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-2 p-2 ${color}`}>
                {React.cloneElement(icon, { className: `w-10 h-10 rounded-full` })}
            </div>
            <div>
                <h3 className={`text-lg font-medium ${titlecolor}`}>{title}</h3>
                <p className={`text-3xl font-bold mt-2 ${theme==='dark' ?  'bg-gradient-to-br from-blue-100 to-blue-500 bg-clip-text text-transparent' :'text-gray-800 '}`}>
                    {value}</p>
            </div>
            <div className="flex items-center mt-auto">
                {isUp ? (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <TrendingUpIcon className="w-5 h-5 text-green-500" />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <TrendingDownIcon className="w-5 h-5 text-red-500" />
                    </motion.div>
                )}
                <span className={`ml-1 text-sm ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {trendPercentage}% {trendPeriod}
                </span>
            </div>
        </motion.div>
    );
};
const DashboardGrid = () => {
    return (
        <div className="p-6 h-full flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 h-full">
                {ChartData.map((chart, index) => {
                    let icon, titlecolor, colorHandler;

                    switch (chart.title) {
                        case "Total Working Days in Month": icon = <CalendarDaysIcon className="w-8 h-8 text-white" />; colorHandler = "bg-orange-200"; titlecolor = "text-orange-400";  break;
                        case "Total Leave Taken Today": icon = <BiCalendarStar className="w-8 h-8 text-white" />; colorHandler = "bg-blue-200"; titlecolor = "text-blue-400";  break;
                        case "Total Holidays per Year": icon = <LiaCalendarCheck className="w-8 h-8 text-white" />; colorHandler = "bg-pink-200"; titlecolor = "text-pink-400";  break;
                        case "Total Halfdays per Day": icon = <MdEditCalendar className="w-8 h-8 text-white" />; colorHandler = "bg-yellow-200"; titlecolor = "text-yellow-400";  break;
                        default:  icon = <ArrowPathIcon className="w-10 h-10 text-white" />; colorHandler = "#D3D3D3"; titlecolor = "text-gray-200";
                    }
                    return (
                        <ChartCard key={index} icon={icon} color={colorHandler} value={chart.value} title={chart.title} titlecolor={titlecolor} trend={chart.trend} trendPercentage={chart.trendPercentage} trendPeriod={chart.trendPeriod}
                        />
                    );
                })}
            </div>
        </div>
    );
};
const employees = [
    {
        name: 'John Doe',
        title: 'UI/UX Designer',
        department: 'UI/UX',
        status: 'Clocked In',
        time: '09:15'
    },
    {
        name: 'Raju',
        title: 'Project Manager',
        department: 'Management',
        status: 'Clocked In',
        time: '09:36'
    },
    {
        name: 'Srilekha',
        title: 'PHP Developer',
        department: 'Development',
        status: 'Clocked In',
        time: '09:15',
        details: {
            clockIn: '10:30 AM',
            clockOut: '09:45 AM',
            production: '09:21 Hrs',
        },
    },
];

const ProfilePicMap={
    "John Doe":'https://randomuser.me/api/portraits/men/30.jpg',
    'Raju':    'https://randomuser.me/api/portraits/men/57.jpg',
    'Srilekha': 'https://randomuser.me/api/portraits/women/57.jpg',
    'Anita':    'https://randomuser.me/api/portraits/women/87.jpg'
}

const lateEmployee = {
    name: 'Anita',
    title: 'Marketing Head',
    department: 'Marketing',
    status: 'Late',
    lateTime: '30 Min',
    time: '08:35',
};

const departments = ['All Departments', 'UI/UX', 'Development', 'Management', 'HR', 'Marketing'];
const timeframes = ['Today', 'This week', 'This month', 'Last Month'];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const ClockInOut = () => {
    const {theme} = useContext(Context);
    const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
    const [selectedTimeframe, setSelectedTimeframe] = useState('Today');

    return (
        <motion.div
            className={` rounded-xl shadow-md p-2 w-full font-sans border border-gray-200 h-full flex flex-col ${theme==='dark' ? 'bg-gray-600 ':'bg-stone-100'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="flex items-center justify-between border-b pb-4 mb-4 border-gray-200 flex-wrap gap-2">
                <h2 className={`text-xl font-bold text-gray-800  ${theme==='dark' ? 'text-white ':'text-gray-800'}`}><ClockIcon className="w-6 h-6 text-blue-600 mr-2" />
                    Clock-In/Out</h2>
                <div className="flex items-center space-x-2">
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <MenuButton className={`inline-flex justify-center w-full rounded-md border border-gray-200 shadow-sm px-4 py-2 text-sm font-medium  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${theme==='dark' ? 'bg-gray-600 text-white  hover:bg-gray-700':'bg-white text-gray-700'}`}>
                                {selectedDepartment}
                                <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                            </MenuButton>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <MenuItems className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg  ring-1 ring-black ring-opacity-5 focus:outline-none z-10 ${theme==='dark' ? 'bg-gray-600 text-white':'bg-white text-gray-700'}`}>
                                <div className="py-1">
                                    {departments.map((department) => (
                                        <MenuItem key={department}>
                                            {({ active }) => (
                                                <a
                                                    href="#"
                                                    onClick={() => setSelectedDepartment(department)}
                                                    className={ classNames(
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-200',
                                                        'block px-4 py-2 text-sm'
                                                    )  }
                                                >
                                                    {department}
                                                </a>
                                            )}
                                        </MenuItem>
                                    ))}
                                </div>
                            </MenuItems>
                        </Transition>
                    </Menu>

                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                             <MenuButton className={`inline-flex justify-center w-full rounded-md border border-gray-200 shadow-sm px-4 py-2 text-sm font-medium  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${theme==='dark' ? 'bg-gray-600 text-white  hover:bg-gray-700':'bg-white text-gray-700'}`}>
                                {selectedTimeframe}
                                <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                            </MenuButton>
                        </div>
                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <MenuItems className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg  ring-1 ring-black ring-opacity-5 focus:outline-none z-10 ${theme==='dark' ? 'bg-gray-600 text-white':'bg-white text-gray-700'}`}>
                                <div className="py-1">
                                    {timeframes.map((timeframe) => (
                                        <MenuItem key={timeframe}>
                                            {({ active }) => (
                                                <a
                                                    href="#"
                                                    onClick={() => setSelectedTimeframe(timeframe)}
                                                    className={classNames(
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-200',
                                                        'block px-4 py-2 text-sm'
                                                    )}
                                                >
                                                    {timeframe}
                                                </a>
                                            )}
                                        </MenuItem>
                                    ))}
                                </div>
                            </MenuItems>
                        </Transition>
                    </Menu>
                </div>
            </div>
            <div className="space-y-4 flex-grow overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence>
                    {employees.map((employee, index) => (
                        <motion.div    key={index}    className={`flex items-center justify-between rounded-lg p-2 transition-colors duration-200 hover:bg-blue-200 hover:text-gray-800 border ${theme==='dark' ? 'bg-gray-600 border-gray-200':'bg-gray-100 '}`}    
                        initial={{ opacity: 0, y: 20 }}    animate={{ opacity: 1, y: 0 }}    exit={{ opacity: 0, y: -20 }}    transition={{ duration: 0.3, delay: index * 0.05 }}>
                            <div className="flex items-center">
                                <motion.img    className="w-12 h-12 rounded-full mr-4 object-cover"   src={ProfilePicMap[employee.name] || "https://randomuser.me/api/portraits/lego/1.jpg"}    alt={employee.name}    whileHover={{ scale: 1.1 }}/>
                                <div>  <p className={`font-semibold  ${theme==='dark' ? 'text-white  ':'text-gray-800 '}`} >{employee.name}</p>  <p className={`text-sm ${theme==='dark' ? 'text-white  ':'text-gray-800 '}`}>{employee.title}</p>  </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <ClockIcon className={`h-5 w-5 ${theme=== 'dark' ? 'text-gray-200':'text-gray-400'}`} />
                                <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                    {employee.time}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <div className="mt-6 border-t pt-4 border-gray-200">
                    <p className={`font-medium mb-3 ${theme==='dark' ? 'text-white ':'text-gray-800 '}`}>Late</p>
                     <motion.div className={`flex items-center justify-between  rounded-lg p-4 transition-colors duration-200 hover:bg-red-200 hover:text-gray-800 border ${theme==='dark' ? 'bg-gray-600 border-gray-200':'bg-gray-100 '}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: employees.length * 0.05 }}>
                        <div className="flex items-center">
                            <motion.img className="w-12 h-12 rounded-full mr-4 object-cover" src={ProfilePicMap[lateEmployee.name] || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={lateEmployee.name} whileHover={{ scale: 1.1 }}/>
                            <div>    <p className={`font-semibold text-gray-800 ${theme==='dark' ? 'text-white ':'text-gray-800 '}`}> {lateEmployee.name}</p>    <p className={`text-sm text-gray-500 ${theme==='dark' ? 'text-white  ':'text-gray-800 '}`}>{lateEmployee.title}</p></div>
                        </div>
                        <div className="flex items-center space-x-2"><span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">    {lateEmployee.lateTime}</span><ClockIcon className="h-5 w-5 text-gray-400" /><div className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">    {lateEmployee.time}</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

const AttendanceTable = ({rawTableData,setRawTableData}) => {
    const {theme} = useContext(Context);
    const [selectedMonth, setSelectedMonth] = useState("All");
    const [sortOption, setSortOption] = useState("Recently added");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const sortOptions = ["Recently added", "Ascending", "Descending", "Last Month", "Last 7 Days"];
    const rowsPerPageOptions = [10, 25, 50, 100];
    const MONTHS = ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    //const rawTableData = [
    //    { employee_id: "E_01", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
    //    { employee_id: "E_02", date: "2025-06-30", login_time: null, logout_time: null },
    //    { employee_id: "E_03", date: "2025-06-30", login_time: "10:00 AM", logout_time: "06:00 PM" },
    //    { employee_id: "E_04", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
    //    { employee_id: "E_05", date: "2025-06-30", login_time: null, logout_time: null },
    //    { employee_id: "E_06", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
    //    { employee_id: "E_07", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
    //    { employee_id: "E_08", date: "2025-06-30", login_time: "10:00 AM", logout_time: "07:00 PM" },
    //    { employee_id: "E_09", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
    //    { employee_id: "E_10", date: "2025-06-30", login_time: "09:45 AM", logout_time: "08:10 PM" },
    //    { employee_id: "E_11", date: "2025-06-30", login_time: "09:55 AM", logout_time: "08:00 PM" },
    //    { employee_id: "E_12", date: "2025-06-30", login_time: null, logout_time: null },
    //    { employee_id: "E_13", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
    //    { employee_id: "E_14", date: "2025-06-30", login_time: null, logout_time: null },
    //    { employee_id: "E_15", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
    //];
    const STANDARD_WORKDAY_HOURS = 10;
    const calculateHours = (login, logout) => {
        if (!login || !logout) return 0;
        const loginDate = new Date(`2000-01-01 ${login}`);
        const logoutDate = new Date(`2000-01-01 ${logout}`);
        const diff = (logoutDate - loginDate) / (1000 * 60 * 60);
        return diff > 0 ? diff : 0;
    };

    const FilterButtonGroup = ({ options, selectedOption, onSelect, className = "" }) => (
        <div className={`flex gap-2 sm:gap-3 flex-wrap ${className}`}>
            {options.map((option) => (
                <motion.button
                    key={option}
                    onClick={() => onSelect(option)}
                    className={`px-4 py-2 rounded-lg border text-xs sm:text-sm font-semibold
                    ${selectedOption === option ? "bg-blue-600 text-white shadow-md border-blue-600" : "bg-white text-gray-700 border-gray-300"}
                    hover:bg-blue-500 hover:text-white transition-colors duration-200 ease-in-out`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {option}
                </motion.button>
            ))}
        </div>
    );
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

    return (
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
                                                                  <th scope="col" className={`px-4 py-3 text-left text-xs sm:text-sm font-medium  uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Employee ID</th>
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
                                                                              <td className={`px-4 py-3 text-sm  whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>{entry.employee_id}</td>
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
    );
};

function AttendanceReports({ rawTableData, setRawTableData }) {
    return (
        <div className="p-4 sm:p-8 min-h-screen font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 h-full items-stretch">
                <DashboardGrid />
                <ClockInOut />
            </div>

            <div className="w-full">
                <AttendanceTable rawTableData={rawTableData} setRawTableData={setRawTableData} />
            </div>
        </div>
    );
};
export default AttendanceReports;