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
 
                await fetch(`https://hrms.anasolconsultancyservices.com/api/attendance/admin/leave/${leaveId}/reject?reason=${encodeURIComponent(reason)}`, {
                    method: "PUT",
                });
            }
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
            <div className="w-full">
                <AdminLeaveHistory />
            </div>
        </motion.div>
    );
};
export default LeavesReports;