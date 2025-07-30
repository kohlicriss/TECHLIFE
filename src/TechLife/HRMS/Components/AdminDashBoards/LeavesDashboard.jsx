import React, { useState, useEffect } from "react";
import { useMediaQuery } from "@mui/material";
import { Box } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Label,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

// --- Data Simulation (This would come from a backend in a real app) ---
const initialLeaveTypeData = [
  { employee: "Rajesh", leaveType: "Sick Leave", days: 5 },
  { employee: "Rajesh", leaveType: "Paid Leave", days: 2 },
  { employee: "Rajesh", leaveType: "Unpaid Leave", days: 4 },
  { employee: "Rajesh", leaveType: "Casual Leave", days: 3 },
];

let currentLeaveHistoryData = [
  {
    department: "IT",
    Gender: "Male",
    Leave_type: "Unpaid Leave",
    Leave_From: "2025-07-10",
    Leave_to: "2025-05-12",
    Days: 2,
    status: "Reject",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025-07-12",
    "Rejection Reason": "Taking Continues leave in every month",
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    department: "IT",
    Gender: "Male",
    Leave_type: "Sick Leave",
    Leave_From: "2025-07-20",
    Days: 1,
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025-07-22",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    department: "IT",
    Gender: "Male",
    Leave_type: "Sick Leave",
    Leave_From: "2025-06-22",
    Leave_to: "2025-06-24",
    Days: 2,
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025-06-26",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    department: "IT",
    Gender: "Male",
    Leave_type: "Casual Leave",
    Leave_From: "2025-06-01",
    Days: 1,
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025-06-03",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    department: "IT",
    Gender: "Male",
    Leave_type: "Sick Leave",
    Leave_From: "2025-05-22",
    Leave_to: "2025-05-23",
    Days: 2,
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025-05-24",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    department: "IT",
    Gender: "Male",
    Leave_type: "Casual Leave",
    Leave_From: "2025-05-12",
    Days: 1,
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025-05-14",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    department: "IT",
    Gender: "Male",
    Leave_type: "Unpaid Leave",
    Leave_From: "2025-04-01",
    Leave_to: "2025-04-02",
    Days: 2,
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025-04-03",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    department: "IT",
    Gender: "Male",
    Leave_type: "Casual Leave",
    Leave_From: "2025-04-01",
    Days: 1,
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025-07-12",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    department: "IT",
    Gender: "Male",
    Leave_type: "Paid Leave",
    Leave_From: "2025-03-10",
    Days: 1,
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025-03-12",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    department: "IT",
    Gender: "Male",
    Leave_type: "Paid Leave",
    Leave_From: "2025-03-20",
    Days: 1,
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:
      "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    "Action Date": "2025-03-22",
    "Rejection Reason": null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
];



// --- CasualLeaveType Component ---
const CasualLeaveType = ({ leaveData }) => {
  const COLORS = ["#4CAF50", "#E0E0E0"]; // Green for consumed, light gray for remaining
  const { leaveType, days, Available, "Annual Quota": annualQuota } = leaveData;
  const isMobile = useMediaQuery("(max-width:768px)");

  const chartData = [
    { name: "Consumed", value: days },
    { name: "Remaining", value: Math.max(annualQuota - days, 0) },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-full flex flex-col items-center justify-center border border-gray-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-800">Casual Leave</h1>
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="center"
        alignItems="center"
        gap={2}
        p={1}
        className="w-full"
      >
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
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
              className="text-lg font-bold text-gray-700"
            >
              {leaveType.split(" ")[0]}
            </text>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* Info Panel */}
        <div className="text-left space-y-1 text-sm text-gray-700">
          <div>
            <strong>Leave Type:</strong> {leaveType}
          </div>
          <div>
            <strong>Consumed:</strong> <span className="font-semibold text-red-600">{days}</span> days
          </div>
          <div>
            <strong>Available:</strong> <span className="font-semibold text-green-600">{Available}</span> days
          </div>
          <div>
            <strong>Annual Quota:</strong> {annualQuota} days
          </div>
        </div>
      </Box>
    </div>
  );
};

// --- PaidLeaveType Component ---
const PaidLeaveType = ({ leaveData }) => {
  const COLORS = ["#2196F3", "#E0E0E0"]; // Blue for consumed, light gray for remaining
  const { leaveType, days, Available, "Annual Quota": annualQuota } = leaveData;
  const isMobile = useMediaQuery("(max-width:768px)");

  const chartData = [
    { name: "Consumed", value: days },
    { name: "Remaining", value: Math.max(annualQuota - days, 0) },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-full flex flex-col items-center justify-center border border-gray-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-800">Paid Leave</h1>
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="center"
        alignItems="center"
        gap={2}
        p={1}
        className="w-full"
      >
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
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
              className="text-lg font-bold text-gray-700"
            >
              {leaveType.split(" ")[0]}
            </text>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* Info Panel */}
        <div className="text-left space-y-1 text-sm text-gray-700">
          <div>
            <strong>Leave Type:</strong> {leaveType}
          </div>
          <div>
            <strong>Consumed:</strong> <span className="font-semibold text-red-600">{days}</span> days
          </div>
          <div>
            <strong>Available:</strong> <span className="font-semibold text-green-600">{Available}</span> days
          </div>
          <div>
            <strong>Annual Quota:</strong> {annualQuota} days
          </div>
        </div>
      </Box>
    </div>
  );
};

// --- SickLeaveType Component ---
const SickLeaveType = ({ leaveData }) => {
  const COLORS = ["#FFC107", "#E0E0E0"]; // Amber for consumed, light gray for remaining
  const { leaveType, days, Available, "Annual Quota": annualQuota } = leaveData;
  const isMobile = useMediaQuery("(max-width:768px)");

  const chartData = [
    { name: "Consumed", value: days },
    { name: "Remaining", value: Math.max(annualQuota - days, 0) },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-full flex flex-col items-center justify-center border border-gray-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-800">Sick Leave</h1>
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="center"
        alignItems="center"
        gap={2}
        p={1}
        className="w-full"
      >
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
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
              className="text-lg font-bold text-gray-700"
            >
              {leaveType.split(" ")[0]}
            </text>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* Info Panel */}
        <div className="text-left space-y-1 text-sm text-gray-700">
          <div>
            <strong>Leave Type:</strong> {leaveType}
          </div>
          <div>
            <strong>Consumed:</strong> <span className="font-semibold text-red-600">{days}</span> days
          </div>
          <div>
            <strong>Available:</strong> <span className="font-semibold text-green-600">{Available}</span> days
          </div>
          <div>
            <strong>Annual Quota:</strong> {annualQuota} days
          </div>
        </div>
      </Box>
    </div>
  );
};

// --- UnpaidLeaveType Component ---
const UnpaidLeaveType = ({ leaveData }) => {
  const COLORS = ["#EF5350", "#E0E0E0"]; // Red for consumed, light gray for remaining
  const { leaveType, days, Available, "Annual Quota": annualQuota } = leaveData;
  const isMobile = useMediaQuery("(max-width:768px)");

  const chartData = [
    { name: "Consumed", value: days },
    { name: "Remaining", value: Math.max(annualQuota - days, 0) },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-full flex flex-col items-center justify-center border border-gray-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-800">Unpaid Leave</h1>
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="center"
        alignItems="center"
        gap={2}
        p={1}
        className="w-full"
      >
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
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
              className="text-lg font-bold text-gray-700"
            >
              {leaveType.split(" ")[0]}
            </text>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* Info Panel */}
        <div className="text-left space-y-1 text-sm text-gray-700">
          <div>
            <strong>Leave Type:</strong> {leaveType}
          </div>
          <div>
            <strong>Consumed:</strong> <span className="font-semibold text-red-600">{days}</span> days
          </div>
          <div>
            <strong>Available:</strong> <span className="font-semibold text-green-600">{Available}</span> days
          </div>
          <div>
            <strong>Annual Quota:</strong> {annualQuota} days
          </div>
        </div>
      </Box>
    </div>
  );
};

// --- LeaveType Component (Overall Leave Breakdown) ---
const LeaveType = ({ leaveData }) => {
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

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
    <div className="bg-white rounded-xl shadow-lg p-4 h-full flex flex-col border border-gray-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out">
      <h2 className="text-xl font-bold mb-2 text-center text-gray-800">
        Leave Type Breakdown
      </h2>

      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="center"
        alignItems="center"
        height="100%"
        gap={isMobile ? 0 : 5}
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
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
    <div className="bg-white shadow-lg rounded-xl p-4 h-full flex flex-col border border-gray-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out">
      <h1 className="text-xl font-bold mb-2 text-center text-gray-800">Weekly Leave Pattern</h1>
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
          <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis dataKey="Day" axisLine={false} tickLine={false} className="text-sm text-gray-600" />
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
    <div className="bg-white shadow-lg rounded-xl p-6 col-span-full border border-gray-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out">
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
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Leave From
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Leave To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Days
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
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
                  {row.department}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {row.Gender}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {row.Leave_type}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {row.Leave_From}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {row.Leave_to || "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {row.Days}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                      row.status === "Approve"
                        ? "bg-green-500"
                        : row.status === "Reject"
                        ? "bg-red-500"
                        : "bg-blue-500" // For "Pending" or other statuses
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
const LeavesDashboard = () => {
  const [leaveTypesOverallData, setLeaveTypesOverallData] = useState(initialLeaveTypeData);
  const [leaveHistoryTableData, setLeaveHistoryTableData] = useState(currentLeaveHistoryData);

  // Simulate individual leave type quotas (these would also typically come from a dynamic source)
  const [casualLeaveQuota, setCasualLeaveQuota] = useState({
    employee: "Rajesh",
    leaveType: "Casual Leave",
    days: 3,
    Available: 6,
    "Annual Quota": 2.83,
  });
  const [paidLeaveQuota, setPaidLeaveQuota] = useState({
    employee: "Rajesh",
    leaveType: "Paid Leave",
    days: 2,
    Available: 0,
    "Annual Quota": 0.5,
  });
  const [sickLeaveQuota, setSickLeaveQuota] = useState({
    employee: "Rajesh",
    leaveType: "Sick Leave",
    days: 5,
    Available: 5,
    "Annual Quota": 4.83,
  });
  const [unpaidLeaveQuota, setUnpaidLeaveQuota] = useState({
    employee: "Rajesh",
    leaveType: "Unpaid Leave",
    days: 4,
    Available: "Infinity",
    "Annual Quota": 1.25,
  });


 

  const handleRequestLeave = () => {
    alert("Initiating Leave Request Form...");
    // In a real application, this would open a modal or navigate to a leave request form.
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <header className="bg-white shadow-lg rounded-xl p-6 mb-6 flex justify-between items-center border border-gray-200">
        <div className="text-left">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
             Leaves DashBoard
          </h1>
         
        </div>
        <button
          onClick={handleRequestLeave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Request Leave
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Individual Leave Type Cards */}
        <CasualLeaveType leaveData={casualLeaveQuota} />
        <PaidLeaveType leaveData={paidLeaveQuota} />
        <SickLeaveType leaveData={sickLeaveQuota} />
        <UnpaidLeaveType leaveData={unpaidLeaveQuota} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Overall Leave Breakdown */}
        <div className="col-span-1">
          <LeaveType leaveData={leaveTypesOverallData} />
        </div>
        {/* Weekly Pattern Bar Chart */}
        <div className="col-span-1">
          <WeeklyPattern />
        </div>
      </div>

      {/* Leave History Table */}
      <LeaveHistory leaveData={leaveHistoryTableData} />
    </div>
  );
};

export default LeavesDashboard;