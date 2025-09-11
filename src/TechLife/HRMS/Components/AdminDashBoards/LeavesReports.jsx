import React, { useState } from 'react';
import {CircleUserRound} from 'lucide-react';

const Data=[
     {
      title:"Total Present",
      value:"104/108" 
     },
     {
       title:"Paid Leaves",
       value:"10" 
     },
     {
       title:"Unpaid Leaves",
      value:"10"
     },
     {
       title:"Pending Request",
       value:"15"
      }
]


const ChartCard = ({ title, value, icon, color, progressText }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md flex items-center space-x-4 overflow-hidden relative">
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl relative z-10`}
        style={{ backgroundColor: color }}
      >
        {icon}
        <div
          className="absolute w-20 h-20 rounded-full"
          style={{
            backgroundColor: color,
            left: '-1rem',
            transform: 'scale(1.9)',
            opacity: 0.2,
          }}
        ></div>
      </div>
      <div className="flex-1 text-center">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {progressText && <p className="text-gray-400 text-xs mt-1">{progressText}</p>}
      </div>
    </div>
  );
};

const LeaveCharts = () => {
  return (
    <div className="p-4 bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {Data.map((Data, index) => {
                      
                      let icon,titlecolor,colorHandler;
                
                      switch (Data.title){
                        case "Total Present":
                          icon = <CircleUserRound className="w-10 h-10 sm:w-10 sm:h-10 inline-block text-white-600 mr-2" />
                          titlecolor="text-orange-500"
                          colorHandler="#34D399"
                          break;
                        case "Paid Leaves":
                          icon = <CircleUserRound className="w-10 h-10 sm:w-10 sm:h-10 inline-block text-white-600 mr-2" />
                          titlecolor="text-blue-500";
                          colorHandler="#EC4899"
                          break;
                        case "Unpaid Leaves":
                          icon = <CircleUserRound className="w-10 h-10 sm:w-10 sm:h-10 inline-block text-white-600 mr-2" />
                          titlecolor="text-pink-500";
                          colorHandler="#FACC15" 
                          break;
                        case "Pending Request":
                          icon = <CircleUserRound className="w-10 h-10 sm:w-10 sm:h-10 inline-block text-white-600 mr-2" />
                          titlecolor="text-yellow-500";
                          colorHandler="#3B82F6"
                          break;
                        default:
                      }
                
                      return (
                        <ChartCard
                          key={index}
                          icon={icon}
                          color={colorHandler}
                          value={Data.value}
                          title={Data.title}
                          titlecolor={titlecolor}
                        />
                      );
                    })}
      </div>
    </div>
  );
}
const currentLeaveHistoryData = [
  {
    EmployeeId:"E_01",
    Leave_type: "Unpaid Leave",
    Leave_On: ["2025/07/10", "-", "2025/05/12"],
    status: "Reject",
    Request_By: "Panalisation Policy",
    Details:"https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/07/12",
    Rejection_Reason: "Taking Continues leave in every month",
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
     EmployeeId:"E_02",
    Leave_type: "Sick Leave",
    Leave_On: ["2025/07/20"],
    Days: 1,
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details:"https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/07/22",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
     EmployeeId:"E_03",
    Leave_type: "Sick Leave",
    Leave_On: ["2025/06/22", "-", "2025/06/24"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details:"https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/06/26",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
     EmployeeId:"E_04",
    Leave_type: "Casual Leave",
    Leave_On: ["2025/06/01"],
    status: "Approve",
    "Request By": "Panalisation Policy",
    Details:"https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/06/03",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
     EmployeeId:"E_05",
    Leave_type: "Sick Leave",
    Leave_On: ["2025/05/22", "-", "2025/05/23"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details:"https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/05/24",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
     EmployeeId:"E_06",
    Leave_type: "Casual Leave",
    Leave_On: ["2025/05/12"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details:"https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/05/14",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
     EmployeeId:"E_07",
    Leave_type: "Unpaid Leave",
    Leave_On: ["2025/04/01", "-", "2025/04/02"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details:"https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/04/03",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
     EmployeeId:"E_08",
    Leave_type: "Casual Leave",
    Leave_On: ["2025/04/01"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details:"https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/07/12",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
     EmployeeId:"E_09",
    Leave_type: "Paid Leave",
    Leave_On: ["2025/03/10"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details:"https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/03/12",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
  {
     EmployeeId:"E_10",
    Leave_type: "Paid Leave",
    Leave_On: ["2025/03/20"],
    status: "Approve",
    Request_By: "Panalisation Policy",
    Details:"https://www.flaticon.com/free-icon/document_16702688?term=detail+data&page=1&position=7&origin=search&related_id=16702688",
    Action_Date: "2025/03/22",
    Rejection_Reason: null,
    Action: "https://icons8.com/icon/36944/ellipsis",
  },
];
const LeaveHistory = () => {
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const leaveTypes = ["All", ...new Set(currentLeaveHistoryData.map((d) => d.Leave_type))];
  const statuses = ["All", ...new Set(currentLeaveHistoryData.map((d) => d.status))];
  const filteredData = currentLeaveHistoryData.filter((item) => {
    return (
      (leaveTypeFilter === "All" || item.Leave_type === leaveTypeFilter) &&
      (statusFilter === "All" || item.status === statusFilter)
    );
  });
  return (
    <div className="bg-white shadow-lg rounded-xl p-3 col-span-full border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 ease-in-out">
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
                EmployeeId
              </th>
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
                  {row.EmployeeId}
                </td>
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

 function LeavesReports({ onBack }) { 
  return (
    <div className="p-2">
      <header className="flex items-center justify-between">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-4xl ml-5 font-extrabold text-gray-900 mb-2">
            Leaves Report
          </h1>
        </div>
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
            <div class="lg:col-span-2">
              <div class="w-full">
                  <LeaveCharts />
                  </div>
             </div>
             <div class="lg:col-span-2">
              <div class="w-full">
                  <LeaveHistory/>
                  </div>
             </div>
        </div>
      );
    };
export default LeavesReports;