import React, { useEffect, useState } from "react";
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
import Calendar from "./Calender";
import axios from "axios";

const AddLeaveForm = ({ onClose }) => {
  // ... state for form inputs (fromDate, toDate, etc.) ...
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  return (
    // This is the overlay div. It covers the entire screen,
    // applies the background blur, and centers the content.
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-25 backdrop-blur-sm">
      {/* This is the main container for the form content */}
      <div className="relative w-full max-w-3xl mx-auto rounded-lg bg-white p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 md:scale-100">
        {/* Close button at the top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center border-b pb-4">Add Leave</h2>

        <div className="space-y-4">
          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee Name</label>
            <input
              type="text"
              value=""
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Leave Type</label>
            <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
              <option>Select</option>
              <option>Sick Leave</option>
              <option>Casual Leave</option>
              <option>Unpaid Leave</option>
              <option>Paid Leave</option>
            </select>
          </div>

          {/* Date Range with custom date pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">From</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  readOnly
                  value={fromDate ? fromDate.toLocaleDateString("en-GB") : "dd-mm-yyyy"}
                  onClick={() => setShowFromCalendar(!showFromCalendar)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
                />
                {showFromCalendar && (
                  <Calendar
                    selectedDate={fromDate}
                    onSelectDate={(date) => {
                      setFromDate(date);
                      setShowFromCalendar(false);
                    }}
                    onClose={() => setShowFromCalendar(false)}
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">To</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  readOnly
                  value={toDate ? toDate.toLocaleDateString("en-GB") : "dd-mm-yyyy"}
                  onClick={() => setShowToCalendar(!showToCalendar)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
                />
                {showToCalendar && (
                  <Calendar
                    selectedDate={toDate}
                    onSelectDate={(date) => {
                      setToDate(date);
                      setShowToCalendar(false);
                    }}
                    onClose={() => setShowToCalendar(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* New row for calculated days and leave duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">No. of Days</label>
              <input
                readOnly
                type="text"
                value={
                  fromDate && toDate ? `${Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1} Days` : "0 Days"
                }
                className="mt-1 block w-full cursor-not-allowed rounded-md border-gray-300 bg-gray-100 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Leave Duration</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option>Select</option>
                <option>Full Day</option>
                <option>First Half Day</option>
                <option>Second Half Day</option>
              </select>
            </div>
          </div>
          
          {/* Remaining Days (placeholder for now) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Remaining Days</label>
            <input
              type="text"
              readOnly
              value="8"
              className="mt-1 block w-full cursor-not-allowed rounded-md border-gray-300 bg-gray-100 shadow-sm"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button className="rounded-md border border-transparent bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
            Add Leave
          </button>
        </div>
      </div>
    </div>
  );
};
//const initialLeaveTypeData = [
//  { employee: "Rajesh", leaveType: "Sick Leave", days: 5 },
//  { employee: "Rajesh", leaveType: "Paid Leave", days: 2 },
//  { employee: "Rajesh", leaveType: "Unpaid Leave", days: 4 },
//  { employee: "Rajesh", leaveType: "Casual Leave", days: 3 },
//];
//const currentLeaveHistoryData = [
//  {
//    Leave_type: "Unpaid Leave",
//    Leave_On: ["2025/07/10", "-", "2025/05/12"],
//    status: "Reject",
//    Request_By: "Panalisation Policy",
//    Details:
//      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//    Action_Date: "2025/07/12",
//    Rejection_Reason: "Taking Continues leave in every month",
//    Action: "https://icons8.com/icon/36944/ellipsis",
//  },
//  {
//    Leave_type: "Sick Leave",
//    Leave_On: ["2025/07/20"],
//    Days: 1,
//    status: "Approve",
//    Request_By: "Panalisation Policy",
//    Details:
//      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//    Action_Date: "2025/07/22",
//    Rejection_Reason: null,
//    Action: "https://icons8.com/icon/36944/ellipsis",
//  },
//  {
//    Leave_type: "Sick Leave",
//    Leave_On: ["2025/06/22", "-", "2025/06/24"],
//    status: "Approve",
//    Request_By: "Panalisation Policy",
//    Details:
//      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//    Action_Date: "2025/06/26",
//    Rejection_Reason: null,
//    Action: "https://icons8.com/icon/36944/ellipsis",
//  },
//  {
//    Leave_type: "Casual Leave",
//    Leave_On: ["2025/06/01"],
//    status: "Approve",
//    "Request By": "Panalisation Policy",
//    Details:
//      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//    Action_Date: "2025/06/03",
//    Rejection_Reason: null,
//    Action: "https://icons8.com/icon/36944/ellipsis",
//  },
//  {
//    Leave_type: "Sick Leave",
//    Leave_On: ["2025/05/22", "-", "2025/05/23"],
//    status: "Approve",
//    Request_By: "Panalisation Policy",
//    Details:
//      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//    Action_Date: "2025/05/24",
//    Rejection_Reason: null,
//    Action: "https://icons8.com/icon/36944/ellipsis",
//  },
//  {
//    Leave_type: "Casual Leave",
//    Leave_On: ["2025/05/12"],
//    status: "Approve",
//    Request_By: "Panalisation Policy",
//    Details:
//      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//    Action_Date: "2025/05/14",
//    Rejection_Reason: null,
//    Action: "https://icons8.com/icon/36944/ellipsis",
//  },
//  {
//    Leave_type: "Unpaid Leave",
//    Leave_On: ["2025/04/01", "-", "2025/04/02"],
//    status: "Approve",
//    Request_By: "Panalisation Policy",
//    Details:
//      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//    Action_Date: "2025/04/03",
//    Rejection_Reason: null,
//    Action: "https://icons8.com/icon/36944/ellipsis",
//  },
//  {
//    Leave_type: "Casual Leave",
//    Leave_On: ["2025/04/01"],
//    status: "Approve",
//    Request_By: "Panalisation Policy",
//    Details:
//      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//    Action_Date: "2025/07/12",
//    Rejection_Reason: null,
//    Action: "https://icons8.com/icon/36944/ellipsis",
//  },
//  {
//    Leave_type: "Paid Leave",
//    Leave_On: ["2025/03/10"],
//    status: "Approve",
//    Request_By: "Panalisation Policy",
//    Details:
//      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//    Action_Date: "2025/03/12",
//    Rejection_Reason: null,
//    Action: "https://icons8.com/icon/36944/ellipsis",
//  },
//  {
//    Leave_type: "Paid Leave",
//    Leave_On: ["2025/03/20"],
//    status: "Approve",
//    Request_By: "Panalisation Policy",
//    Details:
//      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
//    Action_Date: "2025/03/22",
//    Rejection_Reason: null,
//    Action: "https://icons8.com/icon/36944/ellipsis",
//  },
//];
const LeaveTypeCard = ({ title, leaveData = { type: title, consumed: 0, remaining: 0, total: 0 }, color }) => {
  const isMobile = useMediaQuery("(max-width:500px)");
  const { type, consumed, remaining, total } = leaveData;
  const chartData = [
    { name: "Consumed", value: consumed },
    { name: "Remaining", value: Math.max(total - consumed, 0) },
  ];
  const COLORS = [color, "#E0E0E0"];
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-full flex flex-col items-center justify-center border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 ease-in-out">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-800">
        {title}
      </h1>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        className="w-full"
      >
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
              className="text-large font-semibold text-gray-700"
            >
              {type.split(" ")[0]}
            </text>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center mt-4 space-y-2 text-sm text-gray-700">
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
      </Box>
    </div>
  );
};
const LeaveType = () => {
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"]; 
  useEffect(() => {
    axios
      .get('http://192.168.0.123:8081/api/attendance/employee/ACS00000001/personalLeavesData')
      .then(response => {
       const formatted = response.data.map(item => ({
        leaveType: item.leaveType,
        days: item.days,
      }));
      setInitialLeaveTypeData(formatted);
      console.log('personalleaveData data formatted:',  formatted);
        
      })
      
  }, []);
   const [initialLeaveTypeData, setInitialLeaveTypeData] = useState([]);
  const filteredData = initialLeaveTypeData.map(({ leaveType, days }) => ({
    name: leaveType,
    value: days,
  }));
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
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-full flex flex-col border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 ease-in-out">
      <h2 className="text-xl font-bold mb-2 text-center text-gray-800">
        Leave Type Breakdown
      </h2>
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="center"
        alignItems="center"
        height="100%"
        gap={2}
        p={1}
      >
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
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Label content={renderCenterLabel} position="center" />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </div>
  );
};
const WeeklyPattern = () => {
  //const rawData = [
   // { Day: "Mon", Rate: 5 },
   // { Day: "Tues", Rate: 10 },
   // { Day: "Wed", Rate: 10 },
   // { Day: "Thu", Rate: 5 },
   // { Day: "Fri", Rate: 5 },
   // { Day: "Sat", Rate: 0 },
   // { Day: "Sun", Rate: 0 },
  //];
  useEffect(() => {
    axios
      .get('http://192.168.0.123:8081/api/attendance/employee/ACS00000001/leavesbar-graph')
      .then(response => {
       const formatted = response.data.map(item => ({
        Day: item.day,
        Rate: item.rate,
      }));
      setrawData(formatted);
      console.log('leavesbarchart data formatted:',  formatted);
        
      })
      
  }, []);
  const [selectedDay, setSelectedDay] = useState("All");
  const [rawData, setrawData] = useState([]);
  const isMobile = useMediaQuery("(max-width:768px)");
  const filteredData =
    selectedDay === "All"
      ? rawData
      : rawData.filter((entry) => entry.Day === selectedDay);
  const dayOptions = ["All", ...rawData.map((d) => d.Day)];
  return (
    <div className="bg-white shadow-lg rounded-xl p-4 h-full flex flex-col border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 ease-in-out">
      <h1 className="text-xl font-bold mb-2 text-center text-gray-800">
        Weekly Leave Pattern
      </h1>
      <div className="mb-4 text-center">
        <label className="mr-2 font-semibold text-gray-700">Day:</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700"
        >
          {dayOptions.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="center"
        alignItems="center"
        height="100%"
        gap={5}
        p={isMobile ? 1 : 2}
      >
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
            <Bar dataKey="Rate" fill="#4CAF50" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </div>
  );
};
const LeaveHistory = () => {
  const [currentLeaveHistoryData, setCurrentLeaveHistoryData] = useState([]);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Recently added");
  const [currentPage, setCurrentPage] = useState(1);
  const [apiPageSize, setApiPageSize] = useState(10); // Change this value to 2, 3, 4, etc.
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  // useEffect to fetch data based on the current page
  useEffect(() => {
    const fetchLeaveData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `http://192.168.0.123:8081/api/attendance/employee/ACS00000001/leaves?page=${currentPage - 1}&size=${apiPageSize}`
        );
        const newData = Array.isArray(response.data) ? response.data : [];

        // Check if there are more records to fetch
        if (newData.length < apiPageSize) {
          setHasMoreData(false);
        } else {
          setHasMoreData(true);
        }

        const formatted = newData.map(item => ({
          Leave_type: item.leave_type,
          Leave_On: item.leave_on,
          status: item.status,
          Request_By: item.request_By,
          Details: item.details,
          Action_Date: item.action_Date,
          Rejection_Reason: item.rejection_Reason,
          Action: item.action,
        }));

        // Append the new data to the existing data for cumulative display
        setCurrentLeaveHistoryData(prevData => [...prevData, ...formatted]);
      } catch (error) {
        console.error("Failed to fetch leave data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaveData();
  }, [currentPage, apiPageSize]);

  // Reset data and page number when filters or sorting change
  useEffect(() => {
    setCurrentLeaveHistoryData([]);
    setCurrentPage(1);
  }, [leaveTypeFilter, statusFilter, sortOption]);

  const leaveTypes = ["All", ...new Set(currentLeaveHistoryData.map((d) => d.Leave_type))];
  const statuses = ["All", ...new Set(currentLeaveHistoryData.map((d) => d.status))];
  const sortOptions = ["Recently added", "Ascending", "Descending", "Last Month", "Last 7 Days"];

  const filterAndSortData = () => {
    let data = [...currentLeaveHistoryData];
    // Filtering logic
    data = data.filter((item) => {
      return (
        (leaveTypeFilter === "All" || item.Leave_type === leaveTypeFilter) &&
        (statusFilter === "All" || item.status === statusFilter)
      );
    });
    // Sorting logic
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
        data = data.filter(item => new Date(item.Leave_On) >= lastMonth);
        break;
      case "Last 7 Days":
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        data = data.filter(item => new Date(item.Leave_On) >= last7Days);
        break;
      case "Recently added":
      default:
        data.sort((a, b) => new Date(b.Action_Date) - new Date(a.Action_Date));
        break;
    }
    return data;
  };

  const filteredAndSortedData = filterAndSortData();
  const totalPages = Math.ceil(filteredAndSortedData.length / apiPageSize);

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 col-span-full border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 ease-in-out">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Leave Requests History
      </h2>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Leave Type Filter */}
        <div>
          <label className="text-base font-semibold mr-2 text-gray-700">
            Leave Type:
          </label>
          <select
            value={leaveTypeFilter}
            onChange={(e) => setLeaveTypeFilter(e.target.value)}
            className="border border-gray-300 px-3 py-1.5 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            {leaveTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        {/* Status Filter */}
        <div>
          <label className="text-base font-semibold mr-2 text-gray-700">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 px-3 py-1.5 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        {/* Sort Button with Dropdown */}
        <div className="relative">
          <label className="text-base font-semibold mr-2 text-gray-700">
            Sort by:
          </label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border border-gray-300 px-3 py-1.5 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Leave On
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Request By
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Action Date
              </th>
              <th className="px-4 py-3 whitespace-pre-wrap text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Rejection Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {row.Leave_type}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {row.Leave_On}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                        row.status === "Approve"
                          ? "bg-green-500"
                          : row.status === "Reject"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {row.Request_By || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <a
                      href={row.Details}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-lg"
                    >
                      📄
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {row.Action_Date}
                  </td>
                  <td className="px-4 py-3 whitespace-pre-wrap text-sm text-gray-900">
                    {row.Rejection_Reason || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <a
                      href={row.Action}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-600 hover:text-gray-800 text-lg"
                    >
                      ⋯
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="text-center py-4 text-gray-500">
                  {isLoading ? "Loading..." : "No matching records found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasMoreData || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Load More
          </button>
        </nav>
      </div>
    </div>
  );
};
const UserGreeting = () => (
  <div className="flex justify-between items-center p-6 bg-white rounded-lg shadow-md mt-4">
    <div className="flex items-center space-x-4">
      <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="rounded-full h-16 w-16" />
      <div>
        <h2 className="text-2xl font-semibold flex items-center">
          Welcome, Rohit
        </h2>
        <p className="text-gray-500 mt-1">
          You have <span className="font-bold text-red-500">21</span> Pending Approvals &{' '}
          <span className="font-bold text-red-500">14</span> Leave Requests
        </p>
      </div>
    </div>
  </div>
);
const LeavesDashboard = ({ isSidebarOpen }) => {

  const [leaveSummaryData, setLeaveSummaryData] = useState([]);
useEffect(() => {
  axios
    .get('http://192.168.0.123:8081/api/attendance/employee/ACS00000001/leave-summary')
    .then(response => {
      // Map backend data to recharts format and fix type names
      const typeMap = {
        Casual: "Casual Leave",
        Paid: "Paid Leave",
        Unpaid: "Unpaid Leave",
        sick: "Sick Leave",
        Sick: "Sick Leave"
      };
      const formattedData = response.data.map(item => ({
        type: typeMap[item.type] || item.type,
        consumed: item.consumed,
        remaining: item.remaining,
        total: item.total,
      }));
      setLeaveSummaryData(formattedData);
    })
    .catch(error => {
      console.error('Error fetching line chart data:', error);
    });
}, []);
  const [showAddLeaveForm, setShowAddLeaveForm] = useState(false);

const casualLeaveQuota = leaveSummaryData.find(item => item.type === "Casual Leave");
const paidLeaveQuota = leaveSummaryData.find(item => item.type === "Paid Leave");
const sickLeaveQuota = leaveSummaryData.find(item => item.type === "Sick Leave");
const unpaidLeaveQuota = leaveSummaryData.find(item => item.type === "Unpaid Leave");
  const handleRequestLeave = () => {
    setShowAddLeaveForm(true);
  };
  const handleCloseForm = () => {
    setShowAddLeaveForm(false);
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-6 lg:p-8 font-sans">
      <header className="p-3 mb-6 text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    Leaves Dashboard
                </h1>
                <UserGreeting />
            </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <LeaveTypeCard title="Casual Leave" leaveData={casualLeaveQuota} color="#4CAF50" />
        <LeaveTypeCard title="Paid Leave" leaveData={paidLeaveQuota} color="#2196F3" />
        <LeaveTypeCard title="Sick Leave" leaveData={sickLeaveQuota} color="#FFC107" />
        <LeaveTypeCard title="Unpaid Leave" leaveData={unpaidLeaveQuota} color="#EF5350" />
      </div>
      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="">
          {/* Remove the prop leaveData here */}
          <LeaveType />
        </div>
        <div className="">
          <WeeklyPattern />
        </div>
      </div>
      <LeaveHistory />
      {showAddLeaveForm && <AddLeaveForm onClose={handleCloseForm} />}
    </div>
  );
};
export default LeavesDashboard;