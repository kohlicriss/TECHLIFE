import React, { useContext, useEffect, useState, Fragment } from "react";
import { useMediaQuery } from "@mui/material";
import { Box } from "@mui/material";
import ReactPaginate from "react-paginate";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Label,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "./Calender";
import axios from 'axios';
import { Navigate, useParams } from "react-router-dom";
import { Context } from "../HrmsContext";
import LeavesReports from "./LeavesReports";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LeaveDetails from "./LeaveDetails";
import { FaFileAlt, FaRegFileAlt } from "react-icons/fa";
import { LiaFileAlt, LiaFileAltSolid } from "react-icons/lia";
import { IoPersonOutline } from "react-icons/io5";
import { authApi, dashboardApi } from "../../../../axiosInstance";
import EmployeeTable from "./TotalEmployeeLeaves";


const FormField = ({ label, theme, children, helperText, className = '' }) => {
    return (
        <div className={`space-y-1 ${className}`}>
            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {label}
            </label>
            {children}
            {helperText && (
                <p className={`text-xs mt-1 italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {helperText}
                </p>
            )}
        </div>
    );
};

const baseInputClasses = (theme) => `w-full px-4 py-3 border rounded-lg text-sm 
    focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-none 
    ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-800'}`;

// ---------------------------------------------------

// ... (FormField and baseInputClasses remain the same)
const AddLeaveForm = ({ onClose, onAddLeave }) => {
    // Logic and State (UNCHANGED as requested)
   const { userData, theme } = useContext(Context);
  const defaultEmpId = userData?.employee_id || userData?.employeeId || "";
  const [employeeId, setEmployeeId] = useState(defaultEmpId);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [reason, setReason] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const computeNumberOfDays = () => {
    if (!fromDate || !toDate) return 1;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffDays = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!employeeId) return setError("Employee ID required");
    if (!fromDate || !toDate) return setError("Select From and To dates");
    if (!leaveType) return setError("Select leave type");

    const payload = {
      employeeId,
      numberOfDays: computeNumberOfDays(),
      req_To_from: fromDate, // expected "YYYY-MM-DD"
      req_To_to: toDate,
      leave_Reason: reason,
      isHalf_Day: !!isHalfDay,
      leave_Type: leaveType
    };

    setSubmitting(true);
    const url = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/leaveRequest/${employeeId}`;
    const headers = { "Content-Type": "application/json" };

    try {
      let resp;
      // Try PUT first (as originally implemented). If server responds 405, fall back to POST.
        try {
            const response = await (dashboardApi?.post
                ? dashboardApi.post(url, payload, { headers })
                : axios.post(url, payload, { headers })
            );

            // Handle non-success HTTP codes manually
            if (response.status !== 200 && response.status !== 201) {
                const message =
                typeof response.data === "string"
                    ? response.data
                    : response.data?.message || "Unexpected error occurred.";

                alert(`Error: ${message}`);
                throw new Error(message);
            }

            // Success message (if you want feedback)
            alert("Request completed successfully 🎉");
        } catch (error) {
            console.error("Submission Error:", error);

            // Extract message from backend or fallback
            const backendMsg = error.response?.data
                ? typeof error.response.data === "string"
                ? error.response.data
                : error.response.data.message
                : error.message;

            alert(`Error: ${backendMsg}`);
        }


      // Persist locally and notify parent
      const key = `leaveHistory_${employeeId}`;
      const stored = JSON.parse(localStorage.getItem(key)) || [];
      const record = {
        status: resp?.data?.status || "pending",
        details: resp?.data?.details || `${leaveType} leave`,
        action: resp?.data?.action || "-",
        leave_type: leaveType,
        leave_on: fromDate,
        request_By: userData?.fullName || employeeId,
        action_Date: new Date().toISOString().slice(0,10),
        rejection_Reason: resp?.data?.rejection_Reason || ""
      };
      localStorage.setItem(key, JSON.stringify([record, ...stored]));
      if (typeof onAddLeave === "function") onAddLeave(record);
      onClose && onClose();
    } catch (err) {
      console.error("Leave request failed:", err);
      setError(err?.response?.data?.message || err.message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  };
    // UI Redesign Starts Here
    const formThemeClasses = theme === 'dark'
        ? 'bg-gray-800 text-white border-gray-700'
        : 'bg-white text-gray-800 border-gray-100';
    const headerGradient = 'bg-gradient-to-r from-blue-500 to-blue-600';
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden={true}
        >
           <motion.div
                className="relative w-full max-w-xl mx-auto my-auto max-h-[90vh] overflow-y-auto z-60 transform"
                initial={{ scale: 0.97, y: -8, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.97, y: -8, opacity: 0 }}
                // transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
            >
                <form
                    onSubmit={handleSubmit}
                    className={`relative w-full rounded-3xl shadow-3xl overflow-hidden ${formThemeClasses} transition-all duration-300`}
                >
                    {/* Professional Header */}
                    <div className={`text-center rounded-t-3xl ${headerGradient} p-6`}>
                        <h2 className="text-2xl font-extrabold text-white flex items-center justify-center">
                            <i className="fas fa-plane-departure mr-3"></i> Request Employee Leave
                        </h2>
                        <p className="text-sm text-white/90 mt-1">Fill out the details below to submit your leave request.</p>
                    </div>
                    <div className="space-y-6 p-8">
                        {/* Employee ID (Read-only/Initial Value) */}
                        <FormField label="Employee ID" theme={theme} helperText="This is automatically fetched from your profile.">
                            <input
                                type="text"
                                value={employeeId}
                                onChange={e => setEmployeeId(e.target.value)}
                                className={`${baseInputClasses(theme)} bg-gray-300  cursor-not-allowed`}
                                readOnly // Making it look disabled but still editable if needed
                            />
                        </FormField>
                        {/* Date Inputs Group */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField label="From Date" theme={theme}>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={e => setFromDate(e.target.value)}
                                    className={baseInputClasses(theme)}
                                    required
                                />
                            </FormField>
                            <FormField label="To Date" theme={theme} helperText={`Duration: ${computeNumberOfDays()} day(s)`}>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={e => setToDate(e.target.value)}
                                    className={baseInputClasses(theme)}
                                    min={fromDate} // UX improvement: Cannot select a date before 'From Date'
                                    required
                                />
                            </FormField>
                        </div>
                        {/* Leave Type and Half-Day Group */}
                        <div className="grid grid-cols-2 gap-6 items-end">
                             <FormField label="Leave Type" theme={theme}>
                                <select
                                    value={leaveType}
                                    onChange={e => setLeaveType(e.target.value)}
                                    className={`${baseInputClasses(theme)} h-12 appearance-none`} // Increased height for aesthetic, removed extra styles
                                    required
                                >
                                    <option  value=""     className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`} disabled hidden >Select Type</option>
                                    <option value="SICK" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>SICK</option>
                                     <option value="CASUAL" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>CASUAL</option>
                                    <option value="UNPAID" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>UNPAID</option>
                                    <option value="PAID" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>PAID</option>

                                </select>

                            </FormField>

                           

                            {/* Half Day Checkbox (Enhanced Style) */}

                            <div className="flex items-center pt-6">
                                <input
                                    id="isHalfDay"
                                    type="checkbox"
                                    checked={isHalfDay}
                                    onChange={e => setIsHalfDay(e.target.checked)}
                                    className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <label
                                    htmlFor="isHalfDay"
                                    className={`ml-2 block text-sm font-medium cursor-pointer ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                                >
                                    Is this a Half Day leave?
                                </label>
                            </div>
                        </div>
                        {/* Reason Textarea */}
                        <FormField label="Reason for Leave" theme={theme}>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className={`${baseInputClasses(theme)} min-h-[100px]`}
                                required
                                placeholder="Briefly describe your reason for taking leave..."
                            />
                        </FormField>
                        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
                        {/* Action Buttons */}
                        <div className="pt-4 flex justify-end space-x-4 border-t border-gray-200 dark:border-gray-700 -mx-8 px-8">
                            <motion.button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-lg border text-sm font-semibold shadow-sm transition-colors hover:bg-gray-100  dark:border-gray-600"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancel
                            </motion.button>
                           
                            <motion.button
                                type="submit"
                                className="px-5 py-2.5 rounded-lg border border-transparent bg-blue-600 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:bg-red-400 transition-colors"
                                disabled={submitting}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {submitting ? 'Sending Request...' : 'Submit Leave Request'}
                            </motion.button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};
// LeaveTypeCard component
const LeaveTypeCard = ({
    title,
    leaveData = { type: title, consumed: 0, remaining: 0, total: 0 },
    color,
}) => {
    const isMobile = useMediaQuery("(max-width:500px)");
    const { type, consumed, remaining, total } = leaveData;
    const chartData = [
        { name: "Consumed", value: consumed },
        { name: "Remaining", value: Math.max(total - consumed, 0) },
    ];
    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];
    const { theme } = useContext(Context);
    return (
        <motion.div
            className={`rounded-xl shadow-lg p-6 h-full flex flex-col items-center justify-center border border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 ease-in-out ${theme === 'dark' ? 'bg-gray-600' : 'bg-stone-100 text-gray-800'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.5, ease: "easeOut" }}

        >
            <h1 className={`text-xl font-bold mb-4 text-center ${theme==='dark' ? 'bg-gradient-to-br from-yellow-100 to-yellow-400 bg-clip-text text-transparent border-gray-100':'text-gray-700'}`}>
                {title}
            </h1>
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                className="w-full"
            >
                <>
                <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={60}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            className="ml-0"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                        <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className={`text-lg font-semibold ${theme==='dark' ? 'text-gray-200':'text-gray-700'}`}
                        >
                            {type.split(" ")[0]}
                        </text>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className={`text-center mt-4 space-y-2 text-sm ${theme==='dark' ? 'text-white':'text-gray-700'}`}>
                    <div>
                        <strong>Consumed:</strong>{" "}
                        <span className="font-semibold text-sm text-red-600">
                            {consumed}
                        </span>{" "}
                        days
                    </div>
                    <div>
                        <strong>Available:</strong>{" "}
                        <span className="font-semibold text-sm text-green-600">
                            {" "}
                            {remaining}
                        </span>{" "}
                        days
                    </div>
                    <div>
                        <strong>Total:</strong> {total} days
                    </div>
                </div>
                </>
                
            </Box>
        </motion.div>
    );
};

// LeaveType component
const LeaveType = () => {
    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];
    const { empID } = useParams();
    const { userData,theme } = useContext(Context);
    const [initialLeaveTypeData, setInitialLeaveTypeData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
       const url = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${userData?.employeeId}/personalLeavesData`; 
        dashboardApi.get(url)
            .then((response) => {
                const formatted = response.data.map((item) => ({
                    name: item.leaveType,
                    value: item.days,
                }));
                setInitialLeaveTypeData(formatted);
            })
            .catch((error) => {
                console.error("Error fetching personal leave data:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [empID]);
//   const initialLeaveTypeData = [
//  { employee: "Rajesh", leaveType: "Sick Leave", days: 5 },
//  { employee: "Rajesh", leaveType: "Paid Leave", days: 2 },
//  { employee: "Rajesh", leaveType: "Unpaid Leave", days: 4 },
//  { employee: "Rajesh", leaveType: "Casual Leave", days: 3 },
//];
    const isMobile = useMediaQuery("(max-width:768px)");
    const renderCenterLabel = () => {
        return (
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-base font-semibold text-gray-700"
            >
                Leave Types
            </text>
        );
    };
    const filteredData = initialLeaveTypeData.filter((item) => item.value > 0);

    return (
        <motion.div
            className={` rounded-xl shadow-lg p-6 h-full flex flex-col border border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 ease-in-out ${theme === 'dark' ? 'bg-gray-600' : 'bg-stone-100 text-gray-800'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.5, delay: 0.2 }}
        >
             <h1 className={`text-2xl font-bold mb-4 text-center ${theme==='dark' ? 'bg-gradient-to-br from-purple-100 to-purple-400 bg-clip-text text-transparent border-gray-100':'text-gray-700 border-gray-200'} border-b pb-4`}>
                Leave Type Breakdown
            </h1>
            <Box display="flex" flexDirection={isMobile ? "column" : "row"} justifyContent="center" alignItems="center" height="100%" gap={2} p={1}>
                {isLoading ? (
                    <div className="text-gray-500 text-center w-full">Loading...</div>
                ) :filteredData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={filteredData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                paddingAngle={2}
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {filteredData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Label content={renderCenterLabel} position="center" />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className={` text-center w-full ${theme === 'dark' ? 'text-white' : 'text-gray-500'} italic`}>
                        No leave data available.
                    </div>
                )}
            </Box>
        </motion.div>
    );
};

// WeeklyPattern component
const WeeklyPattern = () => {
    
    const { employeeId } = useParams(); 
    // const { empID, employeeId } = useParams(); 
    
    const { userData,theme } = useContext(Context);
    const [selectedDay, setSelectedDay] = useState("All");
    const [rawData, setRawData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); 
     const textColor = theme === 'dark' ? "#FFFFFF" : "#000000";

   

    useEffect(() => {
        const url = `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${userData?.employeeId}/leavesbar-graph`; 
        dashboardApi.get(url)
            .then((response) => {
                const formatted = response.data.map((item) => ({
                  
                    Day: item.day,
                    Rate: item.rate,
                }));
                setRawData(formatted);
                console.log("Give me Weekly pattern:",formatted)
            })
            .catch((error) => {
                console.error("Error fetching leaves bar chart data:", error);
              
                const errorMessage = error.response 
                    ? `Error: ${error.response.status} - ${error.response.statusText}` 
                    : "Failed to load weekly leave pattern data.";
                setError(errorMessage);
            })
            .finally(() => {
                setIsLoading(false);
            });

      
        return () => {
           
        };

   
    }, [employeeId]); 
    const isMobile = useMediaQuery("(max-width:768px)");
    const dayOptions = ["All", ...new Set(rawData.map((d) => d.Day))];
    const filteredData =
        selectedDay === "All"
            ? rawData
            : rawData.filter((entry) => entry.Day === selectedDay);

    return (
        <motion.div
            className={` shadow-lg rounded-xl p-6 h-full flex flex-col border border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 ease-in-out ${theme === 'dark' ? 'bg-gray-600' : 'bg-stone-100 text-gray-800'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.5, delay: 0.4 }}

        >
            <h1 className={`text-2xl font-bold mb-4 text-center ${theme==='dark' ? 'bg-gradient-to-br from-purple-100 to-purple-400 bg-clip-text text-transparent border-gray-100':'text-gray-700 border-gray-200'} border-b pb-4`}>
                Weekly Leave Pattern
            </h1>
            
            {/* Day Selector UI */}
            <div className="mb-4 text-center">
                <label className={`mr-2 font-semibold  ${theme==='dark' ? 'text-white':'text-gray-700'}`}>Select Day:</label>
                <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className={`p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${theme==='dark' ? 'text-white':' text-gray-800 '}`}
                    disabled={isLoading || error}
                >
                    {dayOptions.map((day) => (
                        <option key={day} value={day}>
                            {day}
                        </option>
                    ))}
                </select>
            </div>
            
            {/* Chart/Loading/Error Display Area */}
            <Box
                display="flex"
                flexDirection={isMobile ? "column" : "row"}
                justifyContent="center"
                alignItems="center"
                height="100%"
                gap={5}
                p={isMobile ? 1 : 2}
            >
                { filteredData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={230}>
                        <BarChart
                            data={filteredData}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                        >
                            <XAxis
                                dataKey="Day"
                                axisLine={false}
                                tickLine={false}
                                stroke={textColor}
                                className="text-sm text-gray-600"
                            />
                            <YAxis hide />
                            <Tooltip contentStyle={{ backgroundColor: theme ==='dark' ? "#63676cff" : "#fff", border: theme ? "1px solid #4B5563" : "1px solid #ccc" }} />
                            <Bar dataKey="Rate" fill="#69d6dbff" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : ( 
                    <div className={` text-center w-full ${theme === 'dark' ? 'text-white' : 'text-gray-500'} italic`}>
                        No weekly leave pattern data available.
                    </div>
                )}
            </Box>
        </motion.div>
    );
};


// LeaveHistory component
//const LeaveHistory = ({ leaveHistoryData }) => {
//    const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
//    const [statusFilter, setStatusFilter] = useState("All");
//    const [sortOption, setSortOption] = useState("Recently added");
//    const [apiPageSize, setApiPageSize] = useState(10);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//    const rowsPerPageOptions = [10, 25, 50, 100];
//    const [currentPage, setCurrentPage] = useState(1);
//    const [isLoading, setIsLoading] = useState(false);
//    const { empID } = useParams();
//    const [selectedLeave, setSelectedLeave] = useState(null);
//    const { theme } = useContext(Context);
//
//const handleDetailsClick = (leave) => {
//  setSelectedLeave(leave);
//};
//
//const handleCloseModal = () => {
//  setSelectedLeave(null);
//};
//
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
//
//    return (
//        <motion.div
//            className={`shadow-lg rounded-xl p-6 col-span-full border border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 ease-in-out ${theme === 'dark' ? 'bg-gray-600' : 'bg-stone-100 text-gray-800'}`}
//            initial={{ opacity: 0, y: 50 }}
//            animate={{ opacity: 1, y: 0 }}
//            transition={{ duration: 0.5, delay: 0.6 }}
//        >
//            <h2 className={`text-2xl font-bold mb-4 text-left border-b pb-4 ${theme === 'dark' ? 'bg-gradient-to-br from-green-400 to-green-800 bg-clip-text text-transparent border-gray-100' : 'text-gray-800 border-gray-200'} `}>
//                Leave Requests History
//            </h2>
//            <div className="flex flex-wrap items-center gap-4 mb-6">
//                <div className="relative">
//                    <label className={`text-base font-semibold mr-2 ${theme==='dark' ? 'text-white':'text-gray-700'}`}>
//                        Leave Type:
//                    </label>
//                    <select
//                        value={leaveTypeFilter}
//                        onChange={(e) => setLeaveTypeFilter(e.target.value)}
//                        className={`px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 border ${theme==='dark' ? 'border-black  bg-gray-500 text-white':'border-gray-300'}`}
//                    >
//                        {leaveTypes.map((type) => (
//                            <option key={type} value={type}>
//                                {type}
//                            </option>
//                        ))}
//                    </select>
//                </div>
//                <div>
//                    <label className={`text-base font-semibold mr-2 ${theme==='dark' ? 'text-white':'text-gray-700'}`}>
//                        Status:
//                    </label>
//                    <select
//                        value={statusFilter}
//                        onChange={(e) => setStatusFilter(e.target.value)}
//                        className={`px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 border ${theme==='dark' ? 'border-black bg-gray-500 text-white':'border-gray-300'}`}
//                    >
//                        {statuses.map((status) => (
//                            <option key={status} value={status}>
//                                {status}
//                            </option>
//                        ))}
//                    </select>
//                </div>
//                <div className="relative">
//                     <label className={`text-base font-semibold mr-2 ${theme==='dark' ? 'text-white':'text-gray-700'}`}>
//                        Sort by:
//                    </label>
//                    <select
//                        value={sortOption}
//                        onChange={(e) => setSortOption(e.target.value)}
//                        className={`px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${theme==='dark' ? 'border-black  bg-gray-500 text-white':'border-gray-300'} border`}
//                    >
//                        {sortOptions.map((option) => (
//                            <option key={option} value={option}>
//                                {option}
//                            </option>
//                        ))}
//                    </select>
//                </div>
//            </div>
//            <div className="overflow-x-auto rounded-xl">
//                <table className="min-w-full divide-y divide-gray-200 broder border-gray-200">
//                    <thead className={`bg-gray-50 ${theme==='dark' ? 'border-black  bg-gray-500 text-white':''}`}>
//                        <tr>
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
//                             {paginatedData.length > 0 ? (
//                                paginatedData.map((row, index) => (
//                                    <motion.tr
//                                        key={index}
//                                        className="hover:bg-gray-50"
//                                        initial={{ opacity: 0, y: 20 }}
//                                        animate={{ opacity: 1, y: 0 }}
//                                        exit={{ opacity: 0, y: -20 }}
//                                        transition={{ duration: 0.3, delay: index * 0.05 }}
//                                    >
//                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>  {row.Leave_type}</td>
//                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}> {row.Leave_On}</td>
//                                       <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500':''}`}>
//                                            <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${row.status === "accepted" ? "bg-green-500" : row.status === "rejected" ? "bg-red-500" : "bg-blue-500"}`}> {row.status}</span>
//                                        </td>
//                                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme==='dark' ? ' bg-gray-500 text-gray-200 ':'text-gray-900'}`}> {row.Request_By || "-"}</td>
//                                       <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme==='dark' ?  ' bg-gray-500 text-gray-200':'text-gray-900'}`}> {row.Granted_By || "-"}</td>
//                                       <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${theme==='dark' ?    'bg-gray-500 text-gray-200 ':''}`}>
//                                            <button
//                                                 onClick={() => handleDetailsClick(row)}
//                                                 className="text-indigo-600 hover:text-indigo-800 text-lg"
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
//                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>
//                                            <a
//                                                href={row.Action}
//                                                target="_blank"
//                                                rel="noreferrer"
//                                                className={` ${theme==='dark'?'text-gray-200':'text-gray-600'} hover:text-gray-800 text-lg`}
//                                            >
//                                                ⋯
//                                            </a>
//                                        </td>
//                                    </motion.tr>
//                                ))
//                            ) : (
//                                <motion.tr
//                                    initial={{ opacity: 0 }}
//                                    animate={{ opacity: 1 }}
//                                    transition={{ duration: 0.3 }}
//                                >
//                                    <td colSpan="12" className={`text-center py-4 text-gray-500 ${theme==='dark' ? ' bg-gray-500 text-white':''} italic`}>
//                                        {isLoading ? "Loading..." : "No matching records found."}
//                                    </td>
//                                </motion.tr>
//                            )}
//                        </AnimatePresence>
//                    </tbody>
//                </table>
//            </div>
//             {/* PAGINATION CONTROLS */}
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
const LeaveHistory = ({ leaveHistoryData }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortOption, setSortOption] = useState("Recently added");
   const [rowsPerPage, setRowsPerPage] = useState(10);
    const rowsPerPageOptions = [10, 25, 50, 100];
    const [isLoading, setIsLoading] = useState(false);
    const { empID } = useParams();
    const [selectedLeave, setSelectedLeave] = useState(null);
    const { theme } = useContext(Context);
    const sortOptions = ["Recently added", "Ascending", "Descending", "Last Month", "Last 7 Days"];

    const leaveTypes = ["All", ...new Set(leaveHistoryData.map((d) => d.leave_type))];
    const statuses = ["All", ...new Set(leaveHistoryData.map((d) => d.status))];
    const handleDetailsClick = (leave) => {
  setSelectedLeave(leave);
};

const handleCloseModal = () => {
  setSelectedLeave(null);
};
   // const sortOptions = ["Recently added", "Ascending", "Descending", "Last Month", "Last 7 Days"];
    const filterAndSortData = () => {
        let data = [...leaveHistoryData];
        data = data.filter((item) => {
            return (
                (leaveTypeFilter === "All" || item.leave_type === leaveTypeFilter) &&
                (statusFilter === "All" || item.status === statusFilter)
            );
        });
        switch (sortOption) {
            case "Ascending":
                data.sort((a, b) => a.leave_type.localeCompare(b.leave_type));
                break;
            case "Descending":
                data.sort((a, b) => b.leave_type.localeCompare(a.leave_type));
                break;
            case "Last Month":
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                data = data.filter((item) => new Date(item.leave_On) >= lastMonth);
                break;
            case "Last 7 Days":
                const last7Days = new Date();
                last7Days.setDate(last7Days.getDate() - 7);
                data = data.filter((item) => new Date(item.leave_On) >= last7Days);
                break;
            case "Recently added":
            default:
                data.sort((a, b) => new Date(b.action_Date) - new Date(a.action_Date));
                break;
        }
        return data;
    };
   const filteredAndSortedData= filterAndSortData();
    const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
    const paginatedData = filteredAndSortedData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );
    return (
        <div className={`shadow-lg rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
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
           <div className="overflow-x-auto rounded-xl">
               <table className="min-w-full divide-y divide-gray-200 broder border-gray-200">
                   <thead className={`bg-gray-50 ${theme==='dark' ? 'border-black  bg-gray-500 text-white':''}`}>
                    <tr>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Status</th>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Details</th>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Action</th>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Leave Type</th>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Leave On</th>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Request By</th>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Action Date</th>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Rejection Reason</th>
                        <th className={`px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>LeaveDetails</th>

                    </tr>
                </thead>
                  <tbody className="bg-white divide-y divide-gray-500">
                    {paginatedData.length > 0 ? paginatedData.map((row, idx) => (
                        <tr key={idx}>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}><span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${row.status === "APPROVED" ? "bg-green-500" : row.status === "rejected" ? "bg-red-500" : "bg-blue-500"}`}> {row.status}</span></td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.details}</td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.action}</td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.leave_type}</td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.leave_on}</td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.request_By}</td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.action_Date}</td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>{row.rejection_Reason}</td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${theme==='dark' ?    'bg-gray-500 text-gray-200 ':''}`}>
                                            <button
                                                 onClick={() => handleDetailsClick(row)}
                                                 className="text-indigo-600 hover:text-indigo-800 text-lg"
                                                 title="View Details"
                                               >
                                                <FaFileAlt className={` ${theme==='dark'?'text-blue-200':'text-blue-600'} text-lg inline w-6 h-6 md:w-6 md:h-6 transition `} />
                                            </button>
                                        </td>
                                        <LeaveDetails leave={selectedLeave} onClose={handleCloseModal} />
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={8} className={`text-center py-4 text-gray-500 ${theme==='dark' ? ' bg-gray-500 text-white':''} italic`}>No leave history found.</td>
                        </tr>
                    )}
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
        </div>
    );
};
const UserGreeting = ({ handleRequestLeave }) => {
    const { userData, theme } = useContext(Context);
    const [loggedInUserProfile, setLoggedInUserProfile] = useState({
        image: null,
        initials: " "
    });

    // Attendance summary state
    const [attendanceSummary, setAttendanceSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    // --- Effects (Logic remains the same) ---
    useEffect(() => {
        const userPayload = JSON.parse(localStorage.getItem("emppayload"));
        const userImage = localStorage.getItem("loggedInUserImage");

        const initials = (userPayload?.displayName || " ")
            .split(" ")
            .map((word) => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

        setLoggedInUserProfile({
            image: userImage,
            initials: initials,
        });
    }, [userData]);

    useEffect(() => {
        async function fetchAttendanceSummary() {
            setSummaryLoading(true);
            try {
                const month = new Date().getMonth() + 1;
                const year = new Date().getFullYear();
                const url = `https://hrms.anasolconsultancyservices.com/api/attendance/getLeaves/${userData?.employeeId}/${month}/${year}?employee_id=${userData?.employeeId}&month=${month}&year=${year}`;

                // Read stored Bearer token (Application Auth)
                const storedToken = localStorage.getItem('accessToken');
                const headers = { 'Content-Type': 'application/json' };
                if (storedToken) headers.Authorization = `Bearer ${storedToken}`;

                const response = await axios.get(url, { headers });

                if (response.status !== 200 && response.status !== 201) {
                    alert(`Error: ${response}`);
                    throw new Error(`${response.status}`);
                }

                setAttendanceSummary(response.data);
            } catch (error) {
                setAttendanceSummary(null);
            } finally {
                setSummaryLoading(false);
            }
        }
        if (userData?.employeeId) fetchAttendanceSummary();
    }, [userData?.employeeId]);

    // --- Rendering (Visual Changes) ---
    return (
        <motion.div
            className={`flex flex-col xl:flex-row justify-between items-start xl:items-center p-3 sm:p-4 rounded-2xl shadow-2xl mb-8 transition-all duration-300
                        ${theme === 'dark'
                            ? 'bg-gray-800 border-t-4 border-indigo-600' // Dark mode refinement
                            : 'bg-white border-t-4 border-indigo-600' // Light mode clean look
                        }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            // transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        >
            {/* Greeting and Profile Section (More prominent on all screens) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full xl:w-3/5 mb-6 xl:mb-0">
                
                {/* Profile Image/Initials - Increased Size */}
                <motion.div
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex items-center justify-center border-4 
                        ${theme === 'dark' ? 'border-gray-700 bg-indigo-700' : 'border-indigo-100 bg-indigo-600'} shadow-xl`}
                    whileHover={{ scale: 1.05 }}
                    // transition={{ type: "spring", stiffness: 300 }}
                >
                    {loggedInUserProfile.image ? (
                        <img
                            src={loggedInUserProfile.image}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className={`text-2xl sm:text-3xl font-extrabold text-white`}>
                            {loggedInUserProfile.initials}
                        </span>
                    )}
                </motion.div>

                <div className="flex-1">
                    {/* Welcome Text - Larger and more impactful */}
                    <h2 className={`text-2xl sm:text-4xl font-extrabold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        Welcome, <span className="text-indigo-600 ml-2">{userData?.fullName || 'User'}</span>!
                    </h2>
                    <p className={`text-sm sm:text-base mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Your monthly attendance summary for a quick glance.
                    </p>

                    {/* Attendance summary layout - Enhanced Dashboard Style */}
                    <div className={`mt-4 p-4 rounded-xl transition-colors duration-300 
                        ${theme === 'dark' ? 'bg-gray-900/50 backdrop-blur-sm' : 'bg-indigo-50/70'} border ${theme === 'dark' ? 'border-gray-700' : 'border-indigo-200'}`}>
                        
                        {summaryLoading ? (
                            <span className="text-xs font-medium text-indigo-400">Fetching attendance summary...</span>
                        ) : attendanceSummary ? (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-y-3 gap-x-6 text-sm">
                                
                                {/* Leave Balances */}
                                {['Paid', 'Sick', 'Casual', 'Unpaid'].map((type, index) => (
                                    <div key={type} className="flex flex-col">
                                        <span className={`text-xs uppercase font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{type}</span>
                                        <span className={`text-xl font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                            {attendanceSummary[type.toLowerCase()]}
                                        </span>
                                    </div>
                                ))}

                                {/* Shift Details - Made a focal point on desktop/tablet */}
                                <div className="col-span-2 md:col-span-1 flex flex-col items-start md:items-center p-2 rounded-lg bg-white shadow-inner md:bg-transparent md:shadow-none">
                                    <span className={`text-xs uppercase font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Shift</span>
                                    <span className={`text-sm font-semibold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        {attendanceSummary.shiftName || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <span className="text-sm font-medium text-red-500">Could not load attendance summary.</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Request Leave Button - More prominent and full-width on mobile */}
            <motion.button
                onClick={handleRequestLeave}
                className="w-full xl:w-auto flex items-center justify-center px-6 py-3 mt-4 xl:mt-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-base text-white font-bold rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-300 transform active:scale-98"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.7)" }}
                whileTap={{ scale: 0.98 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Request New Leave
            </motion.button>
        </motion.div>
    );
};

// LeavesDashboard component
const LeavesDashboard = () => {
    const { theme } = useContext(Context);
    const [leaveSummaryData, setLeaveSummaryData] = useState([]);
    const { empID,employeeId } = useParams();
    const { userData } = useContext(Context);
     const [sidebarView, setSidebarView] = useState(null);
    const role = (userData?.roles?.[0] || "").toUpperCase();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [showMain,setShowMain]=useState(false);
    const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState(null);
    const showSidebar = ["TEAM_LEAD", "HR", "MANAGER","ADMIN"].includes(role);
    const [currentLeaveHistoryData, setCurrentLeaveHistoryData] = useState([

    ]);
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
        // When a new leave is added, prepend to localStorage and update state
    function formatLeave(leave) {
    return {
        status: leave.status || "pending",
        details: leave.details || "-",
        action: leave.action || "-",
        leave_type: leave.leave_type || leave.leave_Type || "-",
        leave_on: leave.leave_on || leave.req_To_from || "-",
        request_By: leave.request_By || leave.Request_By || "-",
        action_Date: leave.action_Date || leave.Action_Date || "-",
        rejection_Reason: leave.rejection_Reason || leave.Rejection_Reason || "-",
    };
}

function deduplicateLeaves(leaves) {
    const seen = new Set();
    return leaves.filter(leave => {
        const key = `${leave.leave_type}-${leave.leave_on}-${leave.status}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
  useEffect(() => {
    const fetchLeaveHistory = async () => {
        if (!userData?.employeeId) return;
        try {
            const response = await dashboardApi.get(
                `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${userData?.employeeId}/leaves?page=0&size=10`
            );
            const apiLeaves = Array.isArray(response.data) ? response.data : [];
            const key = `leaveHistory_${userData.employeeId}`;
            const localLeaves = JSON.parse(localStorage.getItem(key)) || [];
            // Format all leaves
            const formattedApiLeaves = apiLeaves.map(formatLeave);
            const formattedLocalLeaves = localLeaves.map(formatLeave);
            // Merge and deduplicate
            const mergedLeaves = deduplicateLeaves([...formattedLocalLeaves, ...formattedApiLeaves]);
            setCurrentLeaveHistoryData(mergedLeaves);
        } catch (error) {
            console.error("Failed to fetch leave history:", error);
            setCurrentLeaveHistoryData([]);
        }
    };
    fetchLeaveHistory();
}, [userData?.employeeId]);

    // When a new leave is added, prepend to localStorage and update state
   const handleAddLeave = (newLeave) => {
    const key = `leaveHistory_${userData.employeeId}`;
    const storedLeaves = JSON.parse(localStorage.getItem(key)) || [];
    const formattedLeave = formatLeave(newLeave);
    const updatedLeaves = [formattedLeave, ...storedLeaves];
    localStorage.setItem(key, JSON.stringify(updatedLeaves));
    setCurrentLeaveHistoryData(updatedLeaves);
};
   
    useEffect(() => {
        if (userData?.employeeId) {
            const storedLeaves = localStorage.getItem(`leaveHistory_${userData.employeeId}`);
            setCurrentLeaveHistoryData(storedLeaves ? JSON.parse(storedLeaves) : []);
        }
    }, [userData?.employeeId]);

    useEffect(() => {
    const source = axios.CancelToken.source(); 
    // setIsLoading(true); 
    
   
    const fetchLeaveSummary = async () => {
        try {
            
            const response = await dashboardApi.get(
                `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${userData?.employeeId}/leave-summary`,
                { cancelToken: source.token } 
            );

            if (response.status !== 200 && response.status !== 201) {
                alert(`Error: ${response}`);
                throw new Error(`${response.status}`);
            }

            const typeMap = {
                Casual: "Casual Leave",
                Paid: "Paid Leave",
                Unpaid: "Unpaid Leave",
                Sick: "Sick Leave",
                
            };

            const formattedData = response.data.map((item) => ({
                type: typeMap[item.type] || item.type,
                consumed: item.consumed,
                remaining: item.remaining,
                total: item.total,
            }));

            setLeaveSummaryData(formattedData);
            // setIsLoading(false); 

        } catch (error) {
           
            if (axios.isCancel(error)) {
                console.log('Request cancelled', error.message);
            } else {
                console.error("Error fetching line chart data:", error);
                // setIsLoading(false);
            }
        }
    };
    
    
    fetchLeaveSummary();

    
    return () => {
        source.cancel('Operation canceled by the user.');
    };
    
}, [employeeId]);

    const [showAddLeaveForm, setShowAddLeaveForm] = useState(false);
     const casualLeaveQuota = leaveSummaryData.find((item) => item.type === "Casual Leave");
    const paidLeaveQuota = leaveSummaryData.find((item) => item.type === "Paid Leave");
    const sickLeaveQuota = leaveSummaryData.find((item) => item.type === "Sick Leave");
    const unpaidLeaveQuota = leaveSummaryData.find((item) => item.type === "Unpaid Leave");


    const handleRequestLeave = () => {
        setShowAddLeaveForm(true);
    };
    const handleCloseForm = () => {
        setShowAddLeaveForm(false);
    };
    const handleShowReports = () => {
        setSidebarView('leaveReports');
        setSidebarOpen(false);
    };
    const handleShowMain=()=>{
        
        setShowMain(true);
        setSidebarOpen(false);
    }
    const handleGoBackToDashboard = () => {
        setShowReport(false);
    };
    const handleShowLeaves = () => {
        setSidebarView('leaves');
        setSidebarOpen(false);
    };
    //if (isLoading) {
    //    return (
    //      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
    //        <div className="min-h-screen flex items-center justify-center px-4">
    //          <div className="text-center">
    //            <div className="relative">
    //              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
    //              <div className="absolute inset-0 flex items-center justify-center">
    //                <IoPersonOutline className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
    //              </div>
    //            </div>
    //            <h2 className={`text-lg sm:text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Loading Employee Leaves</h2>
    //            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Discovering your colleagues...</p>
    //          </div>
    //        </div>
    //      </div>
    //    );
    //  }

    return (
        <div className={`min-h-screen p-2 sm:p-3 lg:p-4 font-sans ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
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
                        // transition={{ duration: 0.3, delay: 0.2 }}
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
                        // transition={{ duration: 0.3 }}
                    >
                        <motion.h3
                            className={`text-lg font-bold ${theme==='dark'?'text-gray-200 hover:bg-gray-500':'text-gray-900 hover:bg-blue-100'} cursor-pointer mb-1 mt-20  p-2 rounded-md`}
                            onClick={handleShowMain}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <LiaFileAlt className="w-5 h-5 inline-block mr-2"  />My Leaves 
                        </motion.h3>
                        <motion.h3
                            className={`text-lg font-bold ${theme==='dark'?'text-gray-200 hover:bg-gray-500':'text-gray-900 hover:bg-blue-100'} cursor-pointer mb-4   p-2 rounded-md`}
                            onClick={handleShowReports}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <LiaFileAlt className="w-5 h-5 inline-block mr-2"  />Leaves Reports
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
                            // transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <ChevronRight />
                        </button>
                        
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`flex-1 transition-all duration-300 p-2 sm:p-3 lg:p-4`}>
         
              {sidebarOpen && <div className="md:hidden fixed inset-0 bg-black opacity-50 z-30" onClick={() => setSidebarOpen(false)}></div>}
            <main className={`p-2 sm:p-2 lg:p-2 ${sidebarOpen && showSidebar ? 'filter blur-sm' : ''}`}>
                <AnimatePresence mode="wait">
                    {sidebarView === 'leaves' &&(
                     <motion.div
                         key="leaves"
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -20 }}
                        //  transition={{ duration: 0.3 }}
                     >
                         <EmployeeTable onBack={() => setSidebarView(null)} />
                     </motion.div>
                 )}
                    {sidebarView ==='leaveReports' &&  (
                        <motion.div
                            key="reports"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            // transition={{ duration: 0.3 }}
                        >
                            <LeavesReports
                                onBack={() => setSidebarView(null)}
                                leaveHistoryData={currentLeaveHistoryData}
                                setLeaveHistoryData={setCurrentLeaveHistoryData}
                            />
                        </motion.div>
                    )}  
                     {sidebarView === null && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            // transition={{ duration: 0.3 }}
                        >
                            <header className="p-3 mb-6 text-left">
                                <UserGreeting handleRequestLeave={handleRequestLeave} />
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                
                                    <>
                                        <LeaveTypeCard title="Casual Leave" leaveData={casualLeaveQuota} color="#4CAF50" />
                                        <LeaveTypeCard title="Paid Leave" leaveData={paidLeaveQuota} color="#2196F3" />
                                        <LeaveTypeCard title="Sick Leave" leaveData={sickLeaveQuota} color="#FFC107" />
                                        <LeaveTypeCard title="Unpaid Leave" leaveData={unpaidLeaveQuota} color="#EF5350" />
                                    </>
                              
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <LeaveType />
                                <WeeklyPattern />
                            </div>
                             <LeaveHistory leaveHistoryData={currentLeaveHistoryData} />
                             {showAddLeaveForm && (
                                 <AddLeaveForm onClose={() => setShowAddLeaveForm(false)} onAddLeave={handleAddLeave} />
                             )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            </div>
        </div>
    );
};

export default LeavesDashboard;