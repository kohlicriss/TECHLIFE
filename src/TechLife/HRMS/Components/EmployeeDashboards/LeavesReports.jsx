import React, { useState } from 'react';
import { CircleUserRound, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FaRegUser, FaUserEdit, FaUsers } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import { useParams } from 'react-router-dom';

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

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 ease-in-out h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Attendance Overview</h2>
        <div className="relative inline-block text-left">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <p className="text-gray-500 text-sm">Total Attendance</p>
          <p className="text-4xl font-bold text-gray-900">{totalAttendance}</p>
        </div>
      </div>
      <hr className="my-6 border-gray-200" />
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Status</h3>
          <ul className="space-y-2">
            {data.map((item) => (
              <li key={item.name} className="flex items-center text-gray-700 font-medium">
                <span
                  className="inline-block h-3 w-3 rounded-full mr-3 ring-2 ring-white"
                  style={{ backgroundColor: item.color }}
                ></span>
                {item.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-right">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Percentage</h3>
          <ul className="space-y-2">
            {data.map((item) => (
              <li key={item.name} className="text-gray-700 font-bold">
                {item.value}%
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const Data = [
  {
    title: "Total Present",
    value: "104/108",
    trends: "up",
    trendPercentage:"96.3",
    trendPeriod:"This Week"
  },
  {
    title: "Paid Leaves",
    value: "10",
    trends: "down",
    trendPercentage:"10",
    trendPeriod:"This Month"
  },
  {
    title: "Unpaid Leaves",
    value: "10",
    trends: "down",
    trendPercentage:"10",
    trendPeriod:"This Month"
  },
  {
    title: "Pending Request",
    value: "15",
    trends: "up",
    trendPercentage:"15",
    trendPeriod:"This Month"
  }
];

const ChartCard = ({ title,titlecolor, value, icon, color,trends,trendPercentage,trendPeriod }) => {
    const isUp = trends === 'up';
  return (
    <div className="bg-white rounded-xl p-2 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col items-center justify-center text-center">
      <div className={`w-18 h-18 flex items-center justify-center rounded-full mb-2  p-3 ${color}`}>{React.cloneElement(icon, { className: `w-10 h-10 rounded-full` })}</div>
      <div>
        <h3 className={`text-xl font-semibold ${titlecolor}`}>{title}</h3> 
        <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p> 
      </div>
      <div className="flex items-center mt-auto">
                {isUp ? <TrendingUpIcon className="w-5 h-5 text-green-500" /> : <TrendingDownIcon className="w-5 h-5 text-red-500" />}
                <span className={`ml-1 text-sm ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {trendPercentage}% {trendPeriod}
                </span>
            </div>
    </div>
  );
};

const LeaveCharts = () => {
  return (
    <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 h-full flex flex-col justify-between">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 h-full">
        {Data.map((data, index) => {
          let icon,titlecolor, colorHandler;

          switch (data.title) {
            case "Total Present":icon = <FaUsers className="w-8 h-8 text-white" />;colorHandler = "bg-green-100"; titlecolor="text-green-300"; break;
            case "Paid Leaves":icon = <FaRegUser className="w-8 h-8 text-white" />;colorHandler = "bg-pink-100";titlecolor="text-pink-300";break;
            case "Unpaid Leaves":icon = <FiUser className="w-8 h-8 text-white" />;colorHandler = "bg-yellow-100";titlecolor="text-yellow-300";break;
            case "Pending Request":icon = <FaUserEdit className="w-8 h-8 text-white" />;colorHandler = "bg-blue-100";titlecolor="text-blue-300";break;
            default:icon = <CircleUserRound className="w-8 h-8 text-white" />;colorHandler = "bg-gray-300";
          }
          return (
            <ChartCard key={index} icon={icon} color={colorHandler} titlecolor={titlecolor} value={data.value} title={data.title} trends={data.trends} trendPercentage={data.trendPercentage} trendPeriod={data.trendPeriod} />
          );
        })}
      </div>
    </div>
  );
};
const currentLeaveHistoryData = [
  {
    EmployeeId: "E_01",
    Leave_type: "Unpaid Leave",
    Leave_On: ["2025/07/10", "-", "2025/05/12"],
    status: "Reject",
    Request_By: "Panalisation Policy",
    Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/07/12",
    Rejection_Reason: "Taking Continues leave in every month",
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    EmployeeId: "E_02",
    Leave_type: "Sick Leave",
    Leave_On: ["2025/07/20"],
    Days: 1,
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/07/22",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    EmployeeId: "E_03",
    Leave_type: "Sick Leave",
    Leave_On: ["2025/06/22", "-", "2025/06/24"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/06/26",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    EmployeeId: "E_04",
    Leave_type: "Casual Leave",
    Leave_On: ["2025/06/01"],
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/06/03",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    EmployeeId: "E_05",
    Leave_type: "Sick Leave",
    Leave_On: ["2025/05/22", "-", "2025/05/23"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/05/24",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    EmployeeId: "E_06",
    Leave_type: "Casual Leave",
    Leave_On: ["2025/05/12"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/05/14",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    EmployeeId: "E_07",
    Leave_type: "Unpaid Leave",
    Leave_On: ["2025/04/01", "-", "2025/04/02"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/04/03",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    EmployeeId: "E_08",
    Leave_type: "Casual Leave",
    Leave_On: ["2025/04/01"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/07/12",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    EmployeeId: "E_09",
    Leave_type: "Paid Leave",
    Leave_On: ["2025/03/10"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/03/12",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
    EmployeeId: "E_10",
    Leave_type: "Paid Leave",
    Leave_On: ["2025/03/20"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details: "https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/03/22",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
];

const LeaveHistory = ({}) => {
  //const [currentLeaveHistoryData, setCurrentLeaveHistoryData] = useState([]);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Recently added");
  const [currentPage, setCurrentPage] = useState(1);
  const [apiPageSize, setApiPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const { empID } = useParams();

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

  const leaveTypes = ["All", ...new Set(currentLeaveHistoryData.map((d) => d.Leave_type))];
  const statuses = ["All", ...new Set(currentLeaveHistoryData.map((d) => d.status))];
  const sortOptions = ["Recently added", "Ascending", "Descending", "Last Month", "Last 7 Days"];

  const filterAndSortData = () => {
    let data = [...currentLeaveHistoryData];
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
    <div className="bg-white shadow-lg rounded-xl p-6 col-span-full border border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 ease-in-out">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
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
            className="border border-gray-300 px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
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
            className="border border-gray-300 px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <label className="text-base font-semibold mr-2 text-gray-700">
            Sort by:
          </label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border border-gray-300 px-3 py-1.5 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
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
                      className="text-indigo-600 hover:text-indigo-800 text-lg"
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
            onClick={() => setCurrentPage((prev) => prev + 1)}
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



function LeavesReports({ onBack, currentLeaveHistoryData }) {
  return (
    <div className="p-4 sm:p-8 bg-gray-100 min-h-screen font-sans">
      <header className="flex flex-col sm:flex-row items-center justify-between pb-6 mb-6 border-b border-gray-200">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">
          Leaves Report
        </h1>
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Back to Dashboard
        </button>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Attendance />
        <LeaveCharts />
      </div>
      <div className="w-full">
        <LeaveHistory leaveHistoryData={currentLeaveHistoryData} />
      </div>
    </div>
  );
};
export default LeavesReports;