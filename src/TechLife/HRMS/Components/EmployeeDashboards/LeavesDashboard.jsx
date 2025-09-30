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
import { dashboardApi } from "../../../../axiosInstance";

// AddLeaveForm component
const AddLeaveForm = ({ onClose, onAddLeave }) => {
    const { theme } = useContext(Context);
    const { empID } = useParams();
    const [showFromCalendar, setShowFromCalendar] = useState(false);
    const [showToCalendar, setShowToCalendar] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [selectedLeaveType, setSelectedLeaveType] = useState("");
    const [reason, setReason] = useState("");
    const [employeeId, setEmployeeId] = useState(empID || "");
    const [employeeName, setEmployeeName] = useState("");
    const validity = [
        { sickLeave: "5" },
        { casualLeave: "10" },
        { unpaidLeave: "0" },
        { paidLeave: "15" },
    ];
    const handleLeaveTypeChange = (e) => {
        setSelectedLeaveType(e.target.value);
    };
    const remainingDays = validity.find(
        (item) => Object.keys(item)[0].toLowerCase() === selectedLeaveType.toLowerCase()
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        const newLeave = {
            EmployeeId: employeeId,
            EmployeeName: employeeName,
            Leave_type: selectedLeaveType,
            Leave_On: fromDate && toDate ? [`${fromDate.toLocaleDateString("en-GB")}`, "-", `${toDate.toLocaleDateString("en-GB")}`] : [fromDate.toLocaleDateString("en-GB")],
            status: "Pending",
            Reason: reason,
            Action_Date: new Date().toLocaleDateString("en-GB"),
            Action: "https://icons8.com/icon/36944/ellipsis",
        };
        onAddLeave(newLeave);
        onClose();
    };

    return (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-25 backdrop-blur-sm p-4"    initial={{ opacity: 0 }}    animate={{ opacity: 1 }}    exit={{ opacity: 0 }}    transition={{ duration: 0.3 }}>
            <motion.div className="relative w-full max-w-3xl mx-auto  my-auto max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 md:scale-100"    initial={{ scale: 0.9, opacity: 0 }}    animate={{ scale: 1, opacity: 1 }}    exit={{ scale: 0.9, opacity: 0 }}    transition={{ duration: 0.3 }}>
               
                <form onSubmit={handleSubmit} className={`relative w-full max-w-3xl mx-auto rounded-lg   shadow-2xl my-auto max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 md:scale-100 border border-green-200 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                   <div className=" mb-4 text-center rounded-t bg-gradient-to-br from-orange-200 to-orange-600"> 
                    <h2 className={`text-2xl pt-6  font-bold border-b pb-8 ${theme === 'dark' ? 'text-white border-gray-100' : 'text-gray-800 border-gray-200'}`}>     Request a Leave</h2>
                    </div>
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                                <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                                    Employee Id
                                </label>
                                <input    type="text"    value={employeeId}    onChange={e => setEmployeeId(e.target.value)}    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}/>
                            </motion.div>
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                                <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>    Employee Name</label>
                                <input    type="text"    value={employeeName}    onChange={e => setEmployeeName(e.target.value)}    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}/>
                            </motion.div>
                        </div>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                             <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>   Leave Type</label>
                            <select    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100  ':'border border-gray-300 '} shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}    onChange={handleLeaveTypeChange}    value={selectedLeaveType}>
                                <option value=""            className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Select</option>
                                <option value="Sick Leave"  className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Sick Leave</option>
                                <option value="Casual Leave"className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Casual Leave</option>
                                <option value="Unpaid Leave"className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Unpaid Leave</option>
                                <option value="Paid Leave"  className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Paid Leave</option>
                            </select>
                        </motion.div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                                <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>   From</label>
                                <div className="relative mt-1">
                                    <input type="text" readOnly value={fromDate? fromDate.toLocaleDateString("en-GB") : "dd-mm-yyyy"} onClick={() => setShowFromCalendar(!showFromCalendar)} className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white':'border border-gray-300 text-black'}`}/>
                                    {showFromCalendar && (
                                        <Calendar    selectedDate={fromDate}    onSelectDate={(date) => {        setFromDate(date);        setShowFromCalendar(false);    }}    onClose={() => setShowFromCalendar(false) } className={`$`} />
                                    )}
                                </div>
                            </motion.div>
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                 <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>     To</label>
                                <div className="relative mt-1">
                                    <input    type="text"    readOnly    value={        toDate ? toDate.toLocaleDateString("en-GB") : "dd-mm-yyyy"    }    onClick={() => setShowToCalendar(!showToCalendar)}    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white':'border border-gray-300 text-black'}`}/>
                                    {showToCalendar && (
                                        <Calendar    selectedDate={toDate}    onSelectDate={(date) => {        setToDate(date);        setShowToCalendar(false);    }}    onClose={() => setShowToCalendar(false)}/>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                                <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>    No. of Days</label>
                                <input    readOnly    type="text"    value={        fromDate && toDate            ? `${            Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) +            1            } Days`            : "0 Days"    }    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}/>
                            </motion.div>
                            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
                               <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>     Leave Duration</label>
                                <select className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none  ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}>
                                    <option value="" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Select</option>
                                     <option value="Full Day" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Full Day</option>
                                     <option value="First Half Day"className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>First Half Day</option>
                                     <option value="Second Half Day"className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Second Half Day</option>
                                </select>
                            </motion.div>
                        </div>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
                             <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>    Remaining Days</label>
                            <input    type="text"    readOnly    value={remainingDays ? Object.values(remainingDays)[0] : "0"}    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none cursor-not-allowed ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}/>
                        </motion.div>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }}>
                            <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>    Reason</label>
                            <textarea    rows="3"    value={reason}    onChange={(e) => setReason(e.target.value)}    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}></textarea>
                        </motion.div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3 border-t p-4">
                        <motion.button    onClick={onClose}    type="button"    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"    whileHover={{ scale: 1.05 }}    whileTap={{ scale: 0.95 }}>    Cancel</motion.button>
                        <motion.button    type="submit"    className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"    whileHover={{ scale: 1.05 }}    whileTap={{ scale: 0.95 }}>    Add Leave</motion.button>
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
    const COLORS = [color, "#E0E0E0"];
    const { theme } = useContext(Context);
    return (
        <motion.div
            className={`rounded-xl shadow-lg p-6 h-full flex flex-col items-center justify-center border border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 ease-in-out ${theme === 'dark' ? 'bg-gray-600' : 'bg-stone-100 text-gray-800'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}

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
    const { theme } = useContext(Context);
    const [initialLeaveTypeData, setInitialLeaveTypeData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios
            .get(
                `http://192.168.0.123:8081/api/attendance/employee/${empID}/personalLeavesData`
            )
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
            transition={{ duration: 0.5, delay: 0.2 }}
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
    
    const { theme } = useContext(Context);
    const [selectedDay, setSelectedDay] = useState("All");
    const [rawData, setRawData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); 

   

    useEffect(() => {
       
        if (!employeeId) {
            console.error("Employee ID is missing from URL parameters.");
            setIsLoading(false);
            return;
        }
        
        
        setIsLoading(true);
        setError(null);

        
        const url = `/attendance/employee/${employeeId}/leavesbar-graph`;

        
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
            // e.g., source.cancel() logic if you use axios.CancelToken.
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
            transition={{ duration: 0.5, delay: 0.4 }}
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
                {isLoading ? (
                    <div className="text-gray-500 text-center w-full">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 text-center w-full italic">Error: {error}</div>
                ) : filteredData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={230}>
                        <BarChart
                            data={filteredData}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                        >
                            <XAxis
                                dataKey="Day"
                                axisLine={false}
                                tickLine={false}
                                className="text-sm text-gray-600"
                            />
                            <YAxis hide />
                            <Tooltip />
                            <Bar dataKey="Rate" fill="#4338CA" radius={[8, 8, 0, 0]} />
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
const LeaveHistory = ({ leaveHistoryData }) => {
    const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortOption, setSortOption] = useState("Recently added");
    const [currentPage, setCurrentPage] = useState(1);
    const [apiPageSize, setApiPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const { empID } = useParams();
    const [selectedLeave, setSelectedLeave] = useState(null);
    const { theme } = useContext(Context);

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

    return (
        <motion.div
            className={`shadow-lg rounded-xl p-6 col-span-full border border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 ease-in-out ${theme === 'dark' ? 'bg-gray-600' : 'bg-stone-100 text-gray-800'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
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
            <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full divide-y divide-gray-200 broder border-gray-200">
                    <thead className={`bg-gray-50 ${theme==='dark' ? 'border-black  bg-gray-500 text-white':''}`}>
                        <tr>
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
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>  {row.Leave_type}</td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}> {row.Leave_On}</td>
                                       <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500':''}`}>
                                            <span className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${row.status === "Approve" ? "bg-green-500" : row.status === "Reject" ? "bg-red-500" : "bg-blue-500"}`}> {row.status}</span>
                                        </td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme==='dark' ? ' bg-gray-500 text-gray-200 ':'text-gray-900'}`}> {row.Request_By || "-"}</td>
                                       <td className={`px-4 py-3 whitespace-nowrap text-sm ${theme==='dark' ?  ' bg-gray-500 text-gray-200':'text-gray-900'}`}> {row.Granted_By || "-"}</td>
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
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>
                                            {row.Action_Date}
                                        </td>
                                       <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>
                                            {row.Rejection_Reason || "-"}
                                        </td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm  ${theme==='dark' ? ' bg-gray-500 text-gray-200':'text-gray-900'}`}>
                                            <a
                                                href={row.Action}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={` ${theme==='dark'?'text-gray-200':'text-gray-600'} hover:text-gray-800 text-lg`}
                                            >
                                                ⋯
                                            </a>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <td colSpan="12" className={`text-center py-4 text-gray-500 ${theme==='dark' ? ' bg-gray-500 text-white':''} italic`}>
                                        {isLoading ? "Loading..." : "No matching records found."}
                                    </td>
                                </motion.tr>
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

// UserGreeting component
const UserGreeting = ({ handleRequestLeave }) => {
    const { userData,theme } = useContext(Context);
     const [loggedInUserProfile, setLoggedInUserProfile] = useState({
            image: null,
            initials: "  "
          });
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
    return (
        <motion.div
            className={`flex justify-between items-center p-3  rounded-lg shadow-md mb-3 ${theme === 'dark' ? 'bg-gray-600 ' : 'bg-purple-100 via-pink-100 '}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center space-x-4">
                <motion.div
                    className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden"
                    
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
                <div>
                    <h2 className={`text-2xl font-bold flex items-center ${theme==='dark' ? 'text-white':'text-gray-700'}`}>
                        Welcome, {userData?.fullName}
                    </h2>
                    <p className={` mt-1 text-sm ${theme==='dark' ? 'text-white':'text-gray-600'}`}>
                        You have <span className="font-bold text-green-600">10</span> Approved &{" "}
                        <span className="font-bold text-red-600">2</span> Rejected leaves.
                    </p>
                </div>
            </div>
            <motion.button
                onClick={handleRequestLeave}
                className="px-3 py-2 bg-indigo-600 text-sm text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Request Leave
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
    const role = (userData?.roles?.[0] || "").toUpperCase();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [showMain,setShowMain]=useState(false);
    const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState(null);
    const showSidebar = ["TEAM_LEAD", "HR", "MANAGER","ADMIN"].includes(role);
    const [currentLeaveHistoryData, setCurrentLeaveHistoryData] = useState([
        {
            EmployeeId: "ACS00000001",
            Leave_type: "Unpaid Leave",
            Leave_On: ["2025/07/10", "-", "2025/05/12"],
            status: "Reject",
            Request_By: "Panalisation Policy",
            Granted_By:"", 
            Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
            Action_Date: "2025/07/12",
            Rejection_Reason: "Taking Continues leave in every month",
            Action: "https://icons8.com/icon/36944/ellipsis",
        },
        {
            EmployeeId: "ACS0000002",
            Leave_type: "Sick Leave",
            Leave_On: ["2025/07/20"],
            Days: 1,
            status: "Approve",
            Request_By: "Panalisation Policy",
            Granted_By:"",
            Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
            Action_Date: "2025/07/22",
            Rejection_Reason: null,
            Action: "https://icons8.com/icon/36944/ellipsis",
        },
        {
            EmployeeId: "ACS00000003",
            Leave_type: "Sick Leave",
            Leave_On: ["2025/06/22", "-", "2025/06/24"],
            status: "Approve",
            Request_By: "Panalisation Policy",
            Granted_By:"",
            Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
            Action_Date: "2025/06/26",
            Rejection_Reason: null,
            Action: "https://icons8.com/icon/36944/ellipsis",
        },
        {
            EmployeeId: "ACS00000004",
            Leave_type: "Casual Leave",
            Leave_On: ["2025/06/01"],
            status: "Approve",
            Request_By: "Panalisation Policy",
            Granted_By:"",            
            Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
            Action_Date: "2025/06/03",
            Rejection_Reason: null,
            Action: "https://icons8.com/icon/36944/ellipsis",
        },
        {
            EmployeeId: "ACS00000005",
            Leave_type: "Sick Leave",
            Leave_On: ["2025/05/22", "-", "2025/05/23"],
            status: "Approve",
            Request_By: "Panalisation Policy",
            Granted_By:"",
            Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
            Action_Date: "2025/05/24",
            Rejection_Reason: null,
            Action: "https://icons8.com/icon/36944/ellipsis",
        },
    ]);
 //useEffect(() => {
//  const fetchLeaveData = async () => {
//    setIsLoading(true);
//    try {
//      const response = await axios.get(
//        `http://192.168.0.123:8081/api/attendance/employee/${empID}/leaves?page=${
//          currentPage - 1
//        }&size=${apiPageSize}`
//      );
//      const newData = Array.isArray(response.data) ? response.data : [];//
//      if (newData.length < apiPageSize) {
//        setHasMoreData(false);
//      } else {
//        setHasMoreData(true);
//      }//
//      const formatted = newData.map((item) => ({
//        Leave_type: item.leave_type,
//        Leave_On: item.leave_on,
//        status: item.status,
//        Request_By: item.request_By,
//        Details: item.details,
//        Action_Date: item.action_Date,
//        Rejection_Reason: item.rejection_Reason,
//        Action: item.action,
//      }));//
//      setCurrentLeaveHistoryData((prevData) => [...prevData, ...formatted]);
//    } catch (error) {
//      console.error("Failed to fetch leave data:", error);
//    } finally {
//      setIsLoading(false);
//    }
//  };
//  fetchLeaveData();
//}, [currentPage, apiPageSize, empID]);//
//useEffect(() => {
//  setCurrentLeaveHistoryData([]);
//  setCurrentPage(1);
//}, [leaveTypeFilter, statusFilter, sortOption]);

    const handleAddLeave = (newLeave) => {
        setCurrentLeaveHistoryData((prevData) => [newLeave, ...prevData]);
    };

    useEffect(() => {
    const source = axios.CancelToken.source(); 
    // setIsLoading(true); 
    
   
    const fetchLeaveSummary = async () => {
        try {
            
            const response = await dashboardApi.get(
                `https://hrms.anasolconsultancyservices.com/api/attendance/employee/${employeeId}/leave-summary`,
                { cancelToken: source.token } 
            );

            const typeMap = {
                Casual: "Casual Leave",
                Paid: "Paid Leave",
                Unpaid: "Unpaid Leave",
                sick: "Sick Leave",
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
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <ChevronLeft />
                    </motion.button>
                )}

                {/* Sidebar */}
                {showSidebar && sidebarOpen && (
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

            <main
                className={`transition-all duration-300 ease-in-out ${sidebarOpen && showSidebar ? "mr-80 filter blur-sm" : "mr-0"}`}
            >
                <AnimatePresence mode="wait">
                    {showReport ? (
                        <motion.div
                            key="reports"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <LeavesReports
                                onBack={handleGoBackToDashboard}
                                leaveHistoryData={currentLeaveHistoryData}
                                setLeaveHistoryData={setCurrentLeaveHistoryData}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <header className="p-3 mb-6 text-left">
                                <h1 className={`text-4xl font-bold  mb-8 ${theme === 'dark' ? 'bg-gradient-to-br from-green-400 to-green-800 bg-clip-text text-transparent' : 'text-gray-800'}`}>
                                    Leaves 
                                </h1>
                                <UserGreeting handleRequestLeave={handleRequestLeave} />
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                {isLoading ? (
                                   <div className="items-center justify-center"> 
                                      <div className={`${theme==='dark' ? 'text-gray-200':'text-gray-700'} text-center w-full`}> <div className={`w-16 h-16  rounded-full mb-1 p-3`} ><LiaFileAltSolid className={ `w-8 h-8  ml-12  bg-yllow-500  text-yellow-400 rounded-full`} /></div>Leaves data loading...</div>
                                      </div> // Simple loading indicator
                                ) : error ? (
                                    <p className="text-red-500">{error}</p> // Simple error message
                                ) : (
                                    <>
                                        <LeaveTypeCard title="Casual Leave" leaveData={casualLeaveQuota} color="#4CAF50" />
                                        <LeaveTypeCard title="Paid Leave" leaveData={paidLeaveQuota} color="#2196F3" />
                                        <LeaveTypeCard title="Sick Leave" leaveData={sickLeaveQuota} color="#FFC107" />
                                        <LeaveTypeCard title="Unpaid Leave" leaveData={unpaidLeaveQuota} color="#EF5350" />
                                    </>
                                )}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <LeaveType />
                                <WeeklyPattern />
                            </div>
                            <LeaveHistory leaveHistoryData={currentLeaveHistoryData} />
                            {showAddLeaveForm && (
                                <AddLeaveForm onClose={handleCloseForm} onAddLeave={handleAddLeave} empID={empID} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default LeavesDashboard;