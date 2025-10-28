import React, { useState, useMemo, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Context } from '../HrmsContext';


const LEAVE_TYPES = ["All", "Paid", "Sick", "Casual", "Unpaid"];
const SORT_OPTIONS = [
  "Name (A-Z)",
  "Name (Z-A)",
  "Recently Added",
  "Last Month",
  "This Month",
  "Highest Overtime",
];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
];


const initialEmployeeData = [
  { employeeId: "EMP001", name: "Rajesh", month: 10, year: 2025, paid: 10, sick: 5, casual: 3, unpaid: 2, paidConsumed: 1, sickConsumed: 0, casualConsumed: 1, unpaidConsumed: 0, shiftName: "Day Shift", weekEffectiveHours: 40, monthlyEffectiveHours: 160, monthlyOnTime: 20, monthlyOvertime: { seconds: 3600 } },
  { employeeId: "EMP002", name: "Sunitha", month: 9, year: 2025, paid: 15, sick: 2, casual: 5, unpaid: 1, paidConsumed: 0, sickConsumed: 1, casualConsumed: 0, unpaidConsumed: 0, shiftName: "Night Shift", weekEffectiveHours: 35, monthlyEffectiveHours: 140, monthlyOnTime: 18, monthlyOvertime: { seconds: 7200 } },
  { employeeId: "EMP003", name: "Kiran", month: 10, year: 2025, paid: 8, sick: 8, casual: 4, unpaid: 0, paidConsumed: 2, sickConsumed: 1, casualConsumed: 0, unpaidConsumed: 0, shiftName: "Day Shift", weekEffectiveHours: 40, monthlyEffectiveHours: 160, monthlyOnTime: 22, monthlyOvertime: { seconds: 1800 } },
  { employeeId: "EMP004", name: "Priya", month: 8, year: 2025, paid: 12, sick: 3, casual: 6, unpaid: 3, paidConsumed: 1, sickConsumed: 0, casualConsumed: 2, unpaidConsumed: 1, shiftName: "Night Shift", weekEffectiveHours: 38, monthlyEffectiveHours: 152, monthlyOnTime: 19, monthlyOvertime: { seconds: 5400 } },
  { employeeId: "EMP005", name: "Mahesh", month: 10, year: 2025, paid: 10, sick: 4, casual: 5, unpaid: 0, paidConsumed: 0, sickConsumed: 2, casualConsumed: 0, unpaidConsumed: 0, shiftName: "Day Shift", weekEffectiveHours: 40, monthlyEffectiveHours: 160, monthlyOnTime: 21, monthlyOvertime: { seconds: 0 } },
  { employeeId: "EMP006", name: "Deepika", month: 7, year: 2025, paid: 20, sick: 0, casual: 10, unpaid: 5, paidConsumed: 5, sickConsumed: 0, casualConsumed: 5, unpaidConsumed: 2, shiftName: "General", weekEffectiveHours: 40, monthlyEffectiveHours: 160, monthlyOnTime: 15, monthlyOvertime: { seconds: 10800 } },
  { employeeId: "EMP007", name: "Harish", month: 9, year: 2025, paid: 10, sick: 10, casual: 10, unpaid: 10, paidConsumed: 0, sickConsumed: 0, casualConsumed: 0, unpaidConsumed: 3, shiftName: "Night Shift", weekEffectiveHours: 36, monthlyEffectiveHours: 144, monthlyOnTime: 20, monthlyOvertime: { seconds: 4500 } },
  { employeeId: "EMP008", name: "Vamsi", month: 10, year: 2025, paid: 7, sick: 3, casual: 2, unpaid: 1, paidConsumed: 1, sickConsumed: 1, casualConsumed: 0, unpaidConsumed: 0, shiftName: "Day Shift", weekEffectiveHours: 40, monthlyEffectiveHours: 160, monthlyOnTime: 17, monthlyOvertime: { seconds: 900 } }
];


const TOTAL_EMPLOYEES = initialEmployeeData.length;

const Dropdown = ({ label, options, value, onChange }) => {
const {theme} = useContext(Context);
  return (
  <div className="flex flex-col w-full md:w-auto">
    <label className={`text-sm font-medium ${theme==='dark'?' text-gray-50 ':'text-gray-700'} mb-1`}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full pl-3 pr-10 py-2 text-base border border-gray-300 ${theme==='dark'?'bg-gray-700 text-gray-50':'bg-white'} rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm transition duration-150 ease-in-out`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
)};

const LeaveBadge = ({ label, consumed, total }) => (
    <div className="flex justify-between text-xs py-1 px-2 rounded-full font-medium"
         style={{ 
             backgroundColor: total > 0 ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 99, 71, 0.1)', // Light blue or Light red
             color: total > 0 ? '#0284c7' : '#ef4444' // Blue or Red text
         }}>
        <span>{label}:</span>
        <span className="font-bold">{consumed} / {total}</span>
    </div>
);


export default function EmployeeTable({ onBack }) {
   const { userData,theme } = useContext(Context);
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]); 
  const currentYear = new Date().getFullYear();

  const filteredAndSortedData = useMemo(() => {
    let data = [...initialEmployeeData];
    
    
    if (selectedMonth !== 'All') {
        const monthIndex = MONTHS.indexOf(selectedMonth) + 1;
        data = data.filter(emp => emp.month === monthIndex && emp.year === currentYear);
    }
    if (leaveType !== "All") {
      const consumedKey = `${leaveType.toLowerCase()}Consumed`;
      data = data.filter(emp => emp[consumedKey] > 0);
    }

    if (sortBy === "Name (A-Z)") {
        data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Name (Z-A)") {
        data.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "Highest Overtime") {
        data.sort((a, b) => b.monthlyOvertime.seconds - a.monthlyOvertime.seconds);
    } else if (sortBy === "Recently Added") {
        data.sort((a, b) => b.employeeId.localeCompare(a.employeeId));
    } else if (sortBy === "This Month") {
        data.sort((a, b) => (b.month === MONTHS.indexOf(selectedMonth) + 1 ? 1 : -1));
    } else if (sortBy === "Last Month") {
        let lastMonthIndex = (MONTHS.indexOf(selectedMonth) + 1) - 1;
        lastMonthIndex = lastMonthIndex === 0 ? 12 : lastMonthIndex;
        data.sort((a, b) => (b.month === lastMonthIndex ? 1 : -1));
    }
    return data;
  }, [leaveType, sortBy, selectedMonth, currentYear]);
  const getTotals = (employee) => {
    const totalLeaves = employee.paid + employee.sick + employee.casual + employee.unpaid;
    const consumedLeaves = employee.paidConsumed + employee.sickConsumed + employee.casualConsumed + employee.unpaidConsumed;
    return { totalLeaves, consumedLeaves };
  };

  return (
    <div className={`p-4 md:p-8 ${theme==='dark'?'bg-gray-900':'bg-gray-50'} min-h-screen`}>
      <h1 className={`text-3xl font-extrabold ${theme==='dark'?'text-gray-50':'text-gray-800'} mb-6 border-b-2 border-sky-400 pb-2`}>
        Employee Leave & Attendance Dashboard 📊
      </h1>
       <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-indigo-100 text-blue-600 rounded-lg font-semibold shadow hover:bg-indigo-200 transition"
      >
        ← Back to Dashboard
      </button>
      <div className={`mb-8 p-4 md:p-6 ${theme==='dark'?'bg-gray-700':'bg-white'} rounded-xl shadow-lg border border-gray-100`}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 items-end">
          <Dropdown
            label="Leave Type:"
            options={LEAVE_TYPES}
            value={leaveType}
            onChange={setLeaveType}
          />
          <Dropdown
            label="Sorted By:"
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
          />
          <Dropdown
            label="Select Month:"
            options={["All", ...MONTHS]}
            value={selectedMonth}
            onChange={setSelectedMonth}
          />
          <div className={`col-span-2 md:col-span-1 p-2  ${theme==='dark'?'bg-gray-700 border border-gray-300':'bg-sky-50'} rounded-lg border-l-4 border-sky-400`}>
              <p className={`text-sm ${theme==='dark'?'text-gray-50':'text-gray-600'} font-medium`}>Total Employees</p>
              <p className="text-2xl font-bold text-sky-700">{TOTAL_EMPLOYEES}</p>
          </div>
        </div>
      </div>
      <div className="shadow-2xl sm:rounded-lg overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-sky-600 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Name / ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Leave Balance (Total)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Consumed Leaves</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Monthly Attendance</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Shift / Hours</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAndSortedData.map((employee, index) => {
                  const { totalLeaves, consumedLeaves } = getTotals(employee);
                  const overtimeHours = (employee.monthlyOvertime.seconds / 3600).toFixed(1);
                  const isEven = index % 2 === 0;

                  return (
                    <tr key={employee.employeeId} className={`border-b transition-colors duration-200 ${theme==='dark'?'bg-gray-700 hover:bg-gray-600':'hover:bg-gray-100'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-semibold ${theme==='dark'?'text-gray-50':'text-gray-900'}`}>{employee.name}</div>
                        <div className={`text-xs ${theme==='dark'?'text-gray-50':'text-gray-500'}`}>{employee.employeeId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {totalLeaves} Days
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme==='dark'?'text-red-400':'text-red-600'}`}>{consumedLeaves} Days</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm`}>
                          <span className={`font-bold ${theme==='dark'?'text-sky-400':'text-sky-600'}`}>{employee.monthlyOnTime}</span> On-Time Entries
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme==='dark'?'text-gray-50':'text-gray-500'}`}>
                          {employee.shiftName} / <span className={`font-medium ${theme==='dark'?'text-orange-300':'text-orange-600'}`}>{overtimeHours} hrs OT</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>

        {/* Mobile View (Small Screens) */}
        <div className={`md:hidden divide-y divide-gray-200 ${theme==='dark'?'bg-gray-700':'bg-white'}`}>
            {filteredAndSortedData.map((employee) => {
                const { totalLeaves, consumedLeaves } = getTotals(employee);
                const overtimeHours = (employee.monthlyOvertime.seconds / 3600).toFixed(1);

                return (
                    <div key={employee.employeeId} className={`p-4 border-b border-gray-200 ${theme==='dark'?'bg-gray-700':'bg-white'} shadow-sm`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className={`text-lg font-bold ${theme==='dark'?'text-sky-300':'text-sky-700'}`}>{employee.name}</h3>
                            <span className={`text-sm font-medium ${theme==='dark'?'text-gray-50 bg-gray-800':'text-gray-500 bg-gray-100'} px-2 py-1 rounded-full`}>{employee.employeeId}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className={`font-medium ${theme==='dark'?'text-gray-50':'text-gray-700'}`}>Total Leaves: <span className={`${theme==='dark'?'text-green-300':'text-green-600'} font-bold`}>{totalLeaves}</span></div>
                            <div className={`font-medium ${theme==='dark'?'text-gray-50':'text-gray-700'}`}>Consumed: <span className={`${theme==='dark'?'text-red-300':'text-red-600'} font-bold`}>{consumedLeaves}</span></div>
                            <div className={`font-medium ${theme==='dark'?'text-gray-50':'text-gray-700'}`}>On-Time: <span className="font-bold">{employee.monthlyOnTime}</span></div>
                            <div className={`font-medium ${theme==='dark'?'text-gray-50':'text-gray-700'}`}>Overtime: <span className={`${theme==='dark'?'text-orange-300':'text-orange-600'} font-bold`}>{overtimeHours} hrs</span></div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <LeaveBadge label="Paid" consumed={employee.paidConsumed} total={employee.paid} />
                            <LeaveBadge label="Sick" consumed={employee.sickConsumed} total={employee.sick} />
                            <LeaveBadge label="Casual" consumed={employee.casualConsumed} total={employee.casual} />
                            <LeaveBadge label="Unpaid" consumed={employee.unpaidConsumed} total={employee.unpaid} />
                        </div>
                    </div>
                );
            })}
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className={`p-6 text-center ${theme==='dark'?'text-gray-50 bg-gray-800':'text-gray-600 bg-gray-100'} text-lg font-medium`}>
            <span role="img" aria-label="Not Found">😔</span> No data found for the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}