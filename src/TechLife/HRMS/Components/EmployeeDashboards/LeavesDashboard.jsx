import React, { useState } from "react";
import { useMediaQuery } from "@mui/material";
import { Box } from "@mui/material";
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

// --- AddLeaveForm Component (Integrated) ---
const AddLeaveForm = ({ onClose }) => {
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  return (
    <div className="flex flex-col h-screen">
  {/* Top bar component */}
  <div className="bg-gray-100 h-16 shadow-md">...</div>
  
  <div className="flex flex-1">
    {/* Left sidebar component */}
    <div className="w-64 bg-gray-800 text-white">...</div>

    {/* Main content area */}
    <main className="flex-1 p-6 bg-gray-200 overflow-auto">
      {/* The leave form component will go here */}
      <div className="w-full max-w-3xl mx-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold">Add Leave</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        {/* The rest of your form content */}
      </div>
    </main>
  </div>
</div>
  );
};

// --- Data Simulation (This would come from a backend in a real app) ---
const initialLeaveTypeData = [
  { employee: "Rajesh", leaveType: "Sick Leave", days: 5 },
  { employee: "Rajesh", leaveType: "Paid Leave", days: 2 },
  { employee: "Rajesh", leaveType: "Unpaid Leave", days: 4 },
  { employee: "Rajesh", leaveType: "Casual Leave", days: 3 },
];

const currentLeaveHistoryData = [
  {
    Leave_type: "Unpaid Leave",
    Leave_On: ["2025/07/10", "-", "2025/05/12"],
    status: "Reject",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025/07/12",
    "Rejection Reason": "Taking Continues leave in every month",
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    Leave_type: "Sick Leave",
    Leave_On: ["2025/07/20"],
    Days: 1,
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025/07/22",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    Leave_type: "Sick Leave",
    Leave_On: ["2025/06/22", "-", "2025/06/24"],
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025/06/26",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    Leave_type: "Casual Leave",
    Leave_On: ["2025/06/01"],
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025/06/03",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    Leave_type: "Sick Leave",
    Leave_On: ["2025/05/22", "-", "2025/05/23"],
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025/05/24",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    Leave_type: "Casual Leave",
    Leave_On: ["2025/05/12"],
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025/05/14",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    Leave_type: "Unpaid Leave",
    Leave_On: ["2025/04/01", "-", "2025/04/02"],
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025/04/03",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    Leave_type: "Casual Leave",
    Leave_On: ["2025/04/01"],
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025/07/12",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    Leave_type: "Paid Leave",
    Leave_On: ["2025/03/10"],
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025/03/12",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    Leave_type: "Paid Leave",
    Leave_On: ["2025/03/20"],
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025/03/22",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
];

const LeaveTypeCard = ({ title, leaveData, color }) => {
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

// --- LeaveType Component (Overall Leave Breakdown) ---
const LeaveType = ({ leaveData }) => {
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"]; // Diverse colors for overall breakdown
  const filteredData = leaveData.map(({ leaveType, days }) => ({
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

// --- WeeklyPattern Component (Bar Chart) ---
const WeeklyPattern = () => {
  const rawData = [
    { Day: "Mon", Rate: 5 },
    { Day: "Tues", Rate: 10 },
    { Day: "Wed", Rate: 10 },
    { Day: "Thu", Rate: 5 },
    { Day: "Fri", Rate: 5 },
    { Day: "Sat", Rate: 0 },
    { Day: "Sun", Rate: 0 },
  ];
  const [selectedDay, setSelectedDay] = useState("All");
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

// --- LeaveHistory Component (Table) ---
const LeaveHistory = ({ leaveData: propLeaveData }) => {
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const leaveTypes = ["All", ...new Set(propLeaveData.map((d) => d.Leave_type))];
  const statuses = ["All", ...new Set(propLeaveData.map((d) => d.status))];
  const filteredData = propLeaveData.filter((item) => {
    return (
      (leaveTypeFilter === "All" || item.Leave_type === leaveTypeFilter) &&
      (statusFilter === "All" || item.status === statusFilter)
    );
  });
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 col-span-full border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 ease-in-out">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Employee Leave Requests History
      </h2>
      <div className="flex flex-wrap items-center gap-4 mb-6">
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
      </div>
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
            {filteredData.map((row, index) => (
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
                  {row["Request By"] || "-"}
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
                  {row["Action Date"]}
                </td>
                <td className="px-4 py-3 whitespace-pre-wrap text-sm text-gray-900">
                  {row["Rejection Reason"] || "-"}
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
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="12" className="text-center py-4 text-gray-500">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main LeavesDashboard Component ---
const LeavesDashboard = ({ isSidebarOpen }) => {
  const [leaveTypesOverallData] = useState(initialLeaveTypeData);
  const [leaveHistoryTableData] = useState(currentLeaveHistoryData);
  const [showAddLeaveForm, setShowAddLeaveForm] = useState(false);

  const [casualLeaveQuota] = useState({
    type: "Casual Leave",
    consumed: 3,
    remaining: 2.83,
    total: 5.83,
  });
  const [paidLeaveQuota] = useState({
    type: "Paid Leave",
    consumed: 2,
    remaining: 0.5,
    total: 2.5,
  });
  const [sickLeaveQuota] = useState({
    type: "Sick Leave",
    consumed: 5,
    remaining: 4.83,
    total: 9.83,
  });
  const [unpaidLeaveQuota] = useState({
    type: "Unpaid Leave",
    consumed: 4,
    remaining: "Infinity",
    total: "N/A",
  });

  const handleRequestLeave = () => {
    setShowAddLeaveForm(true);
  };

  const handleCloseForm = () => {
    setShowAddLeaveForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-6 lg:p-8 font-sans">
      <header className="">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            Leaves Dashboard
          </h1>
        </div>
      </header>
      <div className="lg:col-span-2 bg-white shadow-xl rounded-lg p-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start hover:translate-y-[-4px] mb-6 transition-transform duration-300 ease-in-out">
        <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 bg-indigo-100 rounded-full flex items-center justify-center mr-0 sm:mr-6 mb-4 sm:mb-0">
          <span className="text-4xl sm:text-5xl font-semibold text-indigo-700">
            JD
          </span>
        </div>
        <div className="flex-grow text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-0">
              JOHN DOE
            </h2>
            <button className="p-2 bg-gray-100 rounded-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={handleRequestLeave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 w-full sm:w-auto"
            >
              Request Leave
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-gray-700 text-base sm:text-lg">
            <div className="flex items-center justify-center sm:justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2v-5m-7-5a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5z"
                />
              </svg>
              <span>E123</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m8-10v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2z"
                />
              </svg>
              <span>ABC Services</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-1.208-8.455-3.245m16.91 0c.75.053 1.5.044 2.247-.027m-4.502 0c.266-.026.53-.06.792-.102M12 2v10m-3.486 1.848a3 3 0 000 4.31m6.972 0a3 3 0 000-4.31M12 22v-4m-3.93-2.618l-.928 2.062a1 1 0 01-1.488.587l-2.062-.928a1 1 0 01-.587-1.488l2.062-.928a1 1 0 011.488.587L9.93 19.382zM17.93 19.382l-.928-2.062a1 1 0 011.488-.587l2.062.928a1 1 0 01.587 1.488l-2.062.928a1 1 0 01-1.488-.587zM12 12h.01"
                />
              </svg>
              <span>Software</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 13a9 9 0 100-18 9 9 0 000 18z"
                />
              </svg>
              <span>john@gmail.com</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>+91123456789</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Associate Software</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <LeaveTypeCard title="Casual Leave" leaveData={casualLeaveQuota} color="#4CAF50" />
        <LeaveTypeCard title="Paid Leave" leaveData={paidLeaveQuota} color="#2196F3" />
        <LeaveTypeCard title="Sick Leave" leaveData={sickLeaveQuota} color="#FFC107" />
        <LeaveTypeCard title="Unpaid Leave" leaveData={unpaidLeaveQuota} color="#EF5350" />
      </div>
      <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="">
          <LeaveType leaveData={leaveTypesOverallData} />
        </div>
        <div className="">
          <WeeklyPattern />
        </div>
      </div>
      <LeaveHistory leaveData={leaveHistoryTableData} />
      {showAddLeaveForm && <AddLeaveForm onClose={handleCloseForm} />}
    </div>
  );
};
export default LeavesDashboard;