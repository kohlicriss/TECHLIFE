import React, { useContext, useState } from 'react';
import { CircleUserRound, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FaFileAlt, FaRegUser, FaUserEdit, FaUsers } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import LeaveDetails from "./LeaveDetails";
import { Context } from '../HrmsContext';

// The following components are from your original code, with updated styling and layout.
// They are re-ordered here for clarity.

const Attendance = () => {
    const navigate = useNavigate();
    const [selectedPeriod, setSelectedPeriod] = useState('Today');
    const totalAttendance = 104;
    const data = [
        { name: 'Present', value: 60, color: '#10b981' },
        { name: 'Late', value: 20, color: '#1e3a8a' },
        { name: 'Permission', value: 20, color: '#facc15' },
        { name: 'Absent', value: 4, color: '#ef4444' },
    ];
    const chartData = [...data];
    const {theme} = useContext(Context);

    return (
        <motion.div
            className={` p-6 rounded-xl shadow-md border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 ease-in-out h-full ${theme==='dark' ? 'bg-gray-600 ':'bg-stone-100 '}`}
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
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-12">
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
                                    className={`flex items-center  font-medium ${theme==='dark' ? 'text-white ':'text-gray-700 '}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <span
                                        className="inline-block h-3 w-3 rounded-full mr-3 ring-2 ring-white"
                                        style={{ backgroundColor: item.color }}
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

const Data = [
    {
        title: "Total Present",
        value: "104/108",
        trends: "up",
        trendPercentage: "96.3",
        trendPeriod: "This Week"
    },
    {
        title: "Paid Leaves",
        value: "10",
        trends: "down",
        trendPercentage: "10",
        trendPeriod: "This Month"
    },
    {
        title: "Unpaid Leaves",
        value: "10",
        trends: "down",
        trendPercentage: "10",
        trendPeriod: "This Month"
    },
    {
        title: "Pending Request",
        value: "15",
        trends: "up",
        trendPercentage: "15",
        trendPeriod: "This Month"
    }
];

const ChartCard = ({ title, titlecolor, value, icon, color, trends, trendPercentage, trendPeriod }) => {
    const isUp = trends === 'up';
    const {theme} = useContext(Context);
    return (
        <motion.div
            className={` rounded-xl p-2 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col items-center justify-center text-center  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme==='dark' ? 'bg-gray-600 ':'bg-stone-100 '}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
        >
            <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-2 p-3 ${color}`}>
                {React.cloneElement(icon, { className: `w-8 h-8 rounded-full` })}
            </div>
            <div>
                <h3 className={`text-xl font-semibold ${titlecolor}`}>{title}</h3>
                <p className={`text-3xl font-bold mt-2 ${theme==='dark' ? 'text-white ':'text-gray-800 '}`}>{value}</p>
            </div>
            <div className="flex items-center mt-auto">
                {isUp ? <TrendingUpIcon className="w-5 h-5 text-green-500" /> : <TrendingDownIcon className="w-5 h-5 text-red-500" />}
                <span className={`ml-1 text-sm ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {trendPercentage}% {trendPeriod}
                </span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 h-full">
                <AnimatePresence>
                    {Data.map((data, index) => {
                        let icon, titlecolor, colorHandler;

                        switch (data.title) {
                            case "Total Present": icon = <FaUsers className="w-4 h-4 text-white" />; colorHandler = "bg-green-200"; titlecolor = "text-green-400"; break;
                            case "Paid Leaves": icon = <FaRegUser className="w-4 h-4 text-white" />; colorHandler = "bg-pink-200"; titlecolor = "text-pink-400"; break;
                            case "Unpaid Leaves": icon = <FiUser className="w-4 h-4 text-white" />; colorHandler = "bg-yellow-200"; titlecolor = "text-yellow-400"; break;
                            case "Pending Request": icon = <FaUserEdit className="w-4 h-4 text-white" />; colorHandler = "bg-blue-200"; titlecolor = "text-blue-400"; break;
                            default: icon = <CircleUserRound className="w-4 h-4 text-white" />; colorHandler = "bg-gray-300";
                        }
                        return (
                            <ChartCard key={index} icon={icon} color={colorHandler} titlecolor={titlecolor} value={data.value} title={data.title} trends={data.trends} trendPercentage={data.trendPercentage} trendPeriod={data.trendPeriod} />
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
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

const LeaveHistory = ({ leaveHistoryData,setLeaveHistoryData}) => {
    const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortOption, setSortOption] = useState("Recently added");
    const [currentPage, setCurrentPage] = useState(1);
    const [apiPageSize, setApiPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const { empID } = useParams();
    const [actionLeave, setActionLeave] = useState(null);
    const [actionType, setActionType] = useState(""); // "approve" or "reject"
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedLeave, setSelectedLeave] = useState(null);
    const { userData } = useContext(Context);
    
    const handleAction = (status, reason = "") => {
      setLeaveHistoryData(prev =>
        prev.map(leave =>
          leave === actionLeave
            ? {
                ...leave,
                status,
                Granted_By: status === "Approve" ? "Granted By " + (userData?.roles?.[0] || "Admin")  : leave.Granted_By,
                Rejection_Reason: status === "Reject" ? reason : leave.Rejection_Reason,
              }
            : leave
        )
      );
    };
    const handleDetailsClick = (leave) => {
      setSelectedLeave(leave);
    };
    
    const handleCloseModal = () => {
      setSelectedLeave(null);
   };
    const leaveTypes = ["All", ...new Set(leaveHistoryData.map((d) => d.Leave_type))];
    const statuses = ["All", ...new Set(leaveHistoryData.map((d) => d.status))];
    const sortOptions = ["Recently added", "Ascending", "Descending", "Last Month", "Last 7 Days"];

    const filterAndSortData = () => {
        let data = [...leaveHistoryData];
        data = data.filter((item) => {
            return (
                (leaveTypeFilter === "All" || item.Leave_type === leaveTypeFilter) &&
                (statusFilter === "All" || item.status === statusFilter)
            );
        });
        switch (sortOption) {
            case "Ascending":
                data.sort((a, b) => a.Leave_type.localeCompare(b.Leave_type));
                break;
            case "Descending":
                data.sort((a, b) => b.Leave_type.localeCompare(a.Leave_type));
                break;
            case "Last Month":
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                data = data.filter((item) => new Date(item.Leave_On) >= lastMonth);
                break;
            case "Last 7 Days":
                const last7Days = new Date();
                last7Days.setDate(last7Days.getDate() - 7);
                data = data.filter((item) => new Date(item.Leave_On) >= last7Days);
                break;
            case "Recently added":
            default:
                data.sort((a, b) => new Date(b.Action_Date) - new Date(a.Action_Date));
                break;
        }
        return data;
    };

    const filteredAndSortedData = filterAndSortData();
    const {theme} = useContext(Context);

    return (
        <motion.div
                   className={`shadow-lg rounded-xl p-6 col-span-full border border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 ease-in-out ${theme === 'dark' ? 'bg-gradient-to-br from-gray-100 to-gray-400' : 'bg-stone-100 text-gray-800'}`}
                   initial={{ opacity: 0, y: 50 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, delay: 0.6 }}
               >
                   <h2 className={`text-2xl font-bold mb-4 text-left border-b pb-4 ${theme === 'dark' ? 'bg-gradient-to-br from-green-400 to-green-800 bg-clip-text text-transparent border-gray-100' : 'text-gray-800 border-gray-200'} `}>
                       Leave Requests History
                   </h2>
                   <div className="flex flex-wrap items-center gap-4 mb-6">
                       <div className="relative">
                           <label className="text-base font-semibold mr-2 text-gray-700">
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
                           <label className="text-base font-semibold mr-2 text-gray-700">
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
                           <label className={`text-base font-semibold mr-2 text-gray-700`}>
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
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-blue-500">
                    <thead className={`bg-gray-50  ${theme==='dark' ? ' bg-gray-500 text-white':''}`}>
                        <tr>
                            <th className={`w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Employee_ID </th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Leave Type</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Leave On</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Status</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Request By</th>
                           <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Granted By</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Details</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Action Date</th>
                            <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Rejection Reason</th>
                           <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}> Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-500">
                        <AnimatePresence mode="wait">
                            {filteredAndSortedData.length > 0 ? (
                                filteredAndSortedData.map((row, index) => (
                                    <motion.tr
                                        key={index}
                                        className="hover:bg-gray-50"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 ${theme==='dark' ? ' bg-gray-300':''}`}> {row.EmployeeId}</td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 ${theme==='dark' ? ' bg-gray-300':''}`}>  {row.Leave_type}</td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 ${theme==='dark' ? ' bg-gray-300':''}`}> {row.Leave_On}</td>
                                       <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-300':''}`}>
                                            <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${row.status === "Approve" ? "bg-green-500" : row.status === "Reject" ? "bg-red-500" : "bg-blue-500"}`}> {row.status}</span>
                                        </td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 ${theme==='dark' ? ' bg-gray-300':''}`}> {row.Request_By || "-"}</td>
                                       <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 ${theme==='dark' ? ' bg-gray-300':''}`}> {row.Granted_By || "-"}</td>
                                       <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${theme==='dark' ? ' bg-gray-300':''}`}>
                                            <button
                                                 onClick={() => handleDetailsClick(row)}
                                                 className="text-indigo-600 hover:text-indigo-800 text-lg border border-gray-600 px-2 rounded"
                                                 title="View Details"
                                               >
                                                <FaFileAlt className="text-blue-600 text-lg inline w-6 h-6 md:w-4 md:h-4 transition" />
                                            </button>
                                        </td>
                                        <LeaveDetails leave={selectedLeave} onClose={handleCloseModal} />
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 ${theme==='dark' ? ' bg-gray-300':''}`}>
                                            {row.Action_Date}
                                        </td>
                                       <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 ${theme==='dark' ? ' bg-gray-300':''}`}>
                                            {row.Rejection_Reason || "-"}
                                        </td>
                                         <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-900 ${theme==='dark' ? ' bg-gray-300':''}`}>
                                           <button
                                             onClick={() => setActionLeave(row)}
                                             className="text-gray-600 hover:text-gray-800 text-lg"
                                             title="Take Action"
                                           >
                                             ⋯
                                           </button>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <td colSpan="12" className="text-center py-4 text-gray-500">
                                        {isLoading ? "Loading..." : "No matching records found."}
                                    </td>
                                </motion.tr>
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
                                      onClick={() => setActionType("approve")}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                      onClick={() => setActionType("reject")}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {actionType === "approve" && (
                                  <div className="mt-4 flex flex-col items-center">
                                    <button
                                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                      onClick={() => {
                                        handleAction("Approve");
                                        setActionLeave(null);
                                        setActionType("");
                                      }}
                                    >
                                      Confirm Approve
                                    </button>
                                  </div>
                                )}
                                {actionType === "reject" && (
                                  <div className="mt-4 flex flex-col items-center">
                                    <input type="text" row={1} placeholder="Enter Subject..."value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="border border-gray-300 rounded p-2 w-full mb-2" />
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
                                        handleAction("Reject", rejectionReason);
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
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
           <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
                <nav className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={!hasMoreData || isLoading}
                        className={`px-4 py-2 text-sm font-medium text-gray-700  border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${theme==='dark' ? 'bg-gray-700 text-white border-gray-600 ':''}`}
                    >
                        Load More
                    </button>
                </nav>
            </div>
        </motion.div>
    );
};

function LeavesReports({ onBack, leaveHistoryData,setLeaveHistoryData }) {
    const { theme } = useContext(Context);
    return (
        <motion.div
            className={`p-4 sm:p-8 min-h-screen font-sans ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-stone-100 text-gray-900'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <header className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-6 border-b border-gray-200">
                <h1 className={`text-3xl sm:text-4xl font-extrabold  mb-4 sm:mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Leaves Report
                </h1>
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
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Attendance />
                <LeaveCharts />
            </div>
            <div className="w-full">
                <LeaveHistory leaveHistoryData={leaveHistoryData} setLeaveHistoryData={setLeaveHistoryData} />
            </div>
        </motion.div>
    );
};
export default LeavesReports;