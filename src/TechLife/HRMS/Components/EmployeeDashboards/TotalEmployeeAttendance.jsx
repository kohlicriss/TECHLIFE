import React, { useState, useMemo } from 'react';

const employeeAttendanceData = [
  {
    "employeeId": "ACS00000001",
    "name": "Arjun Reddy",
    "attendanceId": "ACS00000001_2025-10-09",
    "date": "2025-10-09",
    "month": "October",
    "year": 2025,
    "mode": "Office",
    "loginTime": "2025-10-09T09:10:00Z",
    "logoutTime": "2025-10-09T18:05:00Z",
    "breaks": [
      {
        "startTime": "2025-10-09T13:00:00Z",
        "endTime": "2025-10-09T13:30:00Z"
      }
    ],
    "effectiveHours": "PT8H25M",
    "attended": true,
    "leavesTaken": 2
  },
  {
    "employeeId": "ACS00000002",
    "name": "Priya Sharma",
    "attendanceId": "ACS00000002_2025-10-10",
    "date": "2025-10-10",
    "month": "October",
    "year": 2025,
    "mode": "Remote",
    "loginTime": "2025-10-10T09:00:00Z",
    "logoutTime": "2025-10-10T17:30:00Z",
    "breaks": [],
    "effectiveHours": "PT8H30M",
    "attended": true,
    "leavesTaken": 5
  },
  {
    "employeeId": "ACS00000003",
    "name": "Vikram Singh",
    "attendanceId": "ACS00000003_2025-09-28",
    "date": "2025-09-28",
    "month": "September",
    "year": 2025,
    "mode": "Office",
    "loginTime": "2025-09-28T09:30:00Z",
    "logoutTime": "2025-09-28T17:00:00Z",
    "breaks": [
      {
        "startTime": "2025-09-28T12:00:00Z",
        "endTime": "2025-09-28T12:30:00Z"
      },
      {
        "startTime": "2025-09-28T15:00:00Z",
        "endTime": "2025-09-28T15:15:00Z"
      }
    ],
    "effectiveHours": "PT7H15M",
    "attended": true,
    "leavesTaken": 0
  },
  {
    "employeeId": "ACS00000004",
    "name": "Sita Kumari",
    "attendanceId": "ACS00000004_2025-10-05",
    "date": "2025-10-05",
    "month": "October",
    "year": 2025,
    "mode": "Remote",
    "loginTime": "2025-10-05T09:45:00Z",
    "logoutTime": "2025-10-05T18:15:00Z",
    "breaks": [
      {
        "startTime": "2025-10-05T13:15:00Z",
        "endTime": "2025-10-05T13:45:00Z"
      }
    ],
    "effectiveHours": "PT7H45M",
    "attended": true,
    "leavesTaken": 1
  },
  {
    "employeeId": "ACS00000005",
    "name": "Rahul Das",
    "attendanceId": "ACS00000005_2025-08-15",
    "date": "2025-08-15",
    "month": "August",
    "year": 2025,
    "mode": "Office",
    "loginTime": "2025-08-15T08:50:00Z",
    "logoutTime": "2025-08-15T17:50:00Z",
    "breaks": [],
    "effectiveHours": "PT9H0M",
    "attended": true,
    "leavesTaken": 3
  }
];
const parseEffectiveHours = (effectiveHours) => {
  const match = effectiveHours.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const hours = match[1] ? parseInt(match[1], 10) : 0;
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  return hours * 60 + minutes; // నిమిషాల్లో మొత్తం సమయం.
};


const calculateBreakTime = (breaks) => {
  let totalBreakMinutes = 0;
  breaks.forEach(b => {
    const start = new Date(b.startTime);
    const end = new Date(b.endTime);
    const diffMs = end - start;
    totalBreakMinutes += Math.floor(diffMs / (1000 * 60));
  });
  return totalBreakMinutes;
};


const formatMinutesToHHMM = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const AttendanceTable = ({onBack}) => {
  const [leaveType, setLeaveType] = useState('');
  const [sortBy, setSortBy] = useState('Recantly Added');
  const [selectedMonth, setSelectedMonth] = useState('');

 
  const filteredData = useMemo(() => {
    let result = [...employeeAttendanceData];

    if (selectedMonth) {
      result = result.filter(item => item.month.toLowerCase() === selectedMonth.toLowerCase());
    }

    
    if (leaveType) {
    
        result = result.filter(item => item.leavesTaken > 0);
    }
    

    switch (sortBy) {
      case 'Ascending':
    
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Descending':
        
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'Last Month':
      
        const targetMonth = new Date().getMonth() === 0 ? 'December' : new Date(0, new Date().getMonth() - 1).toLocaleString('en-US', { month: 'long' });
        result.sort((a, b) => {
            if (a.month === targetMonth && b.month !== targetMonth) return -1;
            if (a.month !== targetMonth && b.month === targetMonth) return 1;
            return 0;
        });
        break;
      case 'Last 7 days':
      
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'This Month':
        
        const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
        result.sort((a, b) => {
            if (a.month === currentMonth && b.month !== currentMonth) return -1;
            if (a.month !== currentMonth && b.month === currentMonth) return 1;
            return 0;
        });
        break;
      case 'Recantly Added':
      default:
       
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
    }
    
    return result;
  }, [employeeAttendanceData, leaveType, sortBy, selectedMonth]);

 
  const totalEmployees = useMemo(() => {
    const uniqueIds = new Set(employeeAttendanceData.map(item => item.employeeId));
    return uniqueIds.size;
  }, [employeeAttendanceData]);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


  const tableHeaders = [
    'EmployeeId',
    'Date',
    'Mode',
    'Login',
    'Logout',
    'Total Duration',
    'Break Duration',
    'Effective Hours',
    'Leaves Taken',
    'Status'
  ];

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-indigo-800 mb-6 border-b pb-2">
        <span role="img" aria-label="clock">⏰</span> Employee Attendance Tracker
      </h1>
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-indigo-100 text-blue-600 rounded-lg font-semibold shadow hover:bg-indigo-200 transition"
      >
        ← Back to Dashboard
      </button>

      {/* Overview Section & Dropdowns */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 bg-white rounded-xl shadow-lg border-l-4 border-indigo-500">
        <div className="text-lg font-semibold text-gray-700 mb-4 sm:mb-0">
          Total Employees: <span className="text-indigo-600 text-2xl">{totalEmployees}</span>
        </div>
        
        <div className="flex flex-wrap gap-4">
          
          {/* Leave Type Dropdown */}
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-indigo-500 transition-colors focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">Leave Type: All</option>
            <option value="sick">Sick</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="casual">Casual</option>
          </select>

          {/* Select Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-indigo-500 transition-colors focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">Select Month: All</option>
            {months.map(m => (
              <option key={m} value={m}>{m.slice(0, 3)}</option>
            ))}
          </select>
          
          {/* Sorted By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg text-sm bg-white hover:border-indigo-500 transition-colors focus:ring-2 focus:ring-indigo-300"
          >
            <option value="Recantly Added">Sorted By: Recently Added</option>
            <option value="Ascending">Name: Ascending</option>
            <option value="Descending">Name: Descending</option>
            <option value="This Month">Date: This Month</option>
            <option value="Last Month">Date: Last Month</option>
            <option value="Last 7 days">Date: Last 7 days</option>
          </select>
          
        </div>
      </div>

      <div className="overflow-x-auto shadow-2xl rounded-xl">
        <table className="min-w-full bg-white border-collapse">
          
          {/* Table Header (Desktop View) */}
          <thead className="bg-indigo-600 text-white sticky top-0">
            <tr>
              {tableHeaders.map(header => (
                <th key={header} className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 hidden sm:table-cell">
                  {header}
                </th>
              ))}
       
              <th className="py-3 px-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-indigo-500 sm:hidden">
                Employee Details
              </th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500 text-lg">
                  No attendance records found for the selected filters.
                </td>
              </tr>
            ) : (
              filteredData.map((record, index) => {
                const totalMinutesEffective = parseEffectiveHours(record.effectiveHours);
                const breakMinutes = calculateBreakTime(record.breaks);
                
           
                // Total Duration = Effective Hours + Break Duration
                const loginTimeDate = new Date(record.loginTime);
                const logoutTimeDate = new Date(record.logoutTime);
                const totalDurationMinutes = Math.floor((logoutTimeDate - loginTimeDate) / (1000 * 60));
                const totalDurationHHMM = formatMinutesToHHMM(totalDurationMinutes);
                
                const effectiveHoursHHMM = formatMinutesToHHMM(totalMinutesEffective);
                const breakDurationHHMM = formatMinutesToHHMM(breakMinutes);

                
                const statusColor = record.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

                return (
                  <tr 
                    key={record.attendanceId} 
                    className={`border-b transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-200' : 'bg-white hover:bg-gray-200'}`}
                  >
                    
                    
                    <td className="py-4 px-4 text-gray-800 font-medium hidden sm:table-cell">
                      {record.employeeId}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 hidden sm:table-cell">
                      {record.date}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 hidden sm:table-cell">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${record.mode === 'Office' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {record.mode}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 hidden sm:table-cell">
                      {loginTimeDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 hidden sm:table-cell">
                      {logoutTimeDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })}
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-indigo-700 hidden sm:table-cell">
                      {totalDurationHHMM}
                    </td>
                    <td className="py-4 px-4 text-sm text-orange-600 hidden sm:table-cell">
                      {breakDurationHHMM}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-green-700 hidden sm:table-cell">
                      {effectiveHoursHHMM}
                    </td>
                    
                    <td className="py-4 px-4 text-sm text-red-600 font-medium hidden sm:table-cell">
                      {record.leavesTaken}
                    </td>

                    <td className="py-4 px-4 text-sm hidden sm:table-cell">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                        {record.attended ? 'Present' : 'Absent'}
                      </span>
                    </td>

                    {/* Mobile View (sm:hidden) */}
                    <td className="py-4 px-4 sm:hidden">
                      <div className="flex flex-col space-y-1">
                        <span className="text-base font-bold text-indigo-700">{record.name}</span>
                        <span className="text-sm text-gray-600">Date: {record.date} ({record.mode})</span>
                        <span className="text-sm text-gray-600">
                          {loginTimeDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })} - 
                          {logoutTimeDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' })}
                        </span>
                        <div className="text-xs font-medium mt-1">
                            <span className="text-green-700">Effective: {effectiveHoursHHMM}</span> | 
                            <span className="text-red-600"> Leaves: {record.leavesTaken}</span>
                        </div>
                      </div>
                    </td>
                    
                  </tr>
                );
              })
            )}
          </tbody>
          
        </table>
      </div>
      
      <p className="text-sm text-gray-500 mt-6 text-center">
        Data is displayed for **{filteredData.length}** attendance record(s) based on current filters.
      </p>
    </div>
  );
};

export default AttendanceTable;