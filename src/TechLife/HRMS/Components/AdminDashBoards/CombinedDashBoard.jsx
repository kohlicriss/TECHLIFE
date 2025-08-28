import { Calendar as CalendarIcon } from 'lucide-react';
import React, { Fragment,useState } from 'react';
import Calendar from './Calendar'; // Assuming Calendar component exists
import { FaPlusCircle } from 'react-icons/fa';
import { PieChart, Pie, Cell,Tooltip , ResponsiveContainer } from 'recharts';
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { FaCalendarAlt, FaTrashAlt, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AttendancesDashboard from '../EmployeeDashboards/AttendancesDashboard';
import AttendanceReports from './AttendanceReports';
import LeavesReports from './LeavesReports';
import EmployeeDetails from './EmployeeDetails';
import Applicants from './Applicants';
import JobsList from './JobsList';
const Header = () => {
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex items-center  space-x-2 text-gray-700">
        <span className='text-5xl text-bold'>Admin Dashboard</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="block text-sm font-medium text-gray-700">Today</label>
          <button className="flex items-center space-x-2 border px-3 py-1 rounded-md text-sm text-gray-700">
            <input
              type="text"
              readOnly
              value={fromDate ? fromDate.toLocaleDateString('en-GB') : 'dd-mm-yyyy'}
              onClick={() => setShowFromCalendar(!showFromCalendar)}
              className="focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
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
          </button>
        </div>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-4.604 4.549l2.828 2.829-5.46 5.46a1 1 0 01-.453.298l-3.268.817a1 1 0 01-1.218-1.218l.817-3.268a1 1 0 01.298-.453l5.46-5.46z" />
          </svg>
        </h2>
        <p className="text-gray-500 mt-1">
          You have <span className="font-bold text-red-500">21</span> Pending Approvals &{' '}
          <span className="font-bold text-red-500">14</span> Leave Requests
        </p>
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, total, percentage, isPositive, icon, onViewAll }) => (
  <div className="flex flex-col p-4 bg-white rounded-lg shadow-md">
    <div className="flex items-center justify-between">
      <div
        className={`p-2 rounded-full ${
          isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}
      >
        {icon}
      </div>
    </div>
    <h3 className="mt-4 text-sm text-gray-500">{title}</h3>
    <p className="text-2xl font-bold mt-1">
      {value}
      {total && <span className="text-base text-gray-500 font-normal">/{total}</span>}
    </p>
    <div className="flex items-center mt-2">
      <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {percentage}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 ml-1 ${isPositive ? 'text-green-500' : 'text-red-500'} transform ${
          isPositive ? 'rotate-0' : 'rotate-180'
        }`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <button
      onClick={onViewAll}
      className="text-blue-500 text-sm mt-4 text-left hover:underline"
    >
      View All
    </button>
  </div>
);

const EmployeeChart = () => {
  const [timeframe, setTimeframe] = useState('This Week');

  const employeeData = [
    { Role: 'UI/UX', Employees: 20 },
    { Role: 'Development', Employees: 50 },
    { Role: 'Management', Employees: 15 },
    { Role: 'HR', Employees: 10 },
    { Role: 'Testing', Employees: 5 },
    { Role: 'Marketing', Employees: 8 },
  ];

  const totalEmployees = employeeData.reduce((sum, dept) => sum + dept.Employees, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Employees By Department</h2>
        <div className="relative inline-block text-left">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pr-2 py-2 text-sm text-gray-700 bg-white border cursor-pointer"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Week</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {employeeData.map((department) => (
          <div key={department.Role}>
            <p className="text-sm font-medium text-gray-600 mb-1">{department.Role}</p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-orange-500 h-4 rounded-full"
                style={{ width: `${(department.Employees / totalEmployees) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const EmployeeStatus = [
  { FullTime: 40 },
  { Interns: 51 },
  { Probation: 13 },
  { WFH: 4 },
]

const totalEmployees = EmployeeStatus.reduce((acc, curr) => {
  const value = Object.values(curr)[0]
  return acc + parseInt(value, 10)
}, 0)

const calculatePercentage = (count) =>
  ((count / totalEmployees) * 100).toFixed(0)

const statusData = {
  FullTime: {
    count: EmployeeStatus.find((item) => item.FullTime)?.FullTime || 0,
    color: 'bg-orange-500',
    label: 'Fulltime',
  },
  Interns: {
    count: EmployeeStatus.find((item) => item.Interns)?.Interns || 0,
    color: 'bg-purple-500',
    label: 'Interns',
  },
  Probation: {
    count: EmployeeStatus.find((item) => item.Probation)?.Probation || 0,
    color: 'bg-indigo-500',
    label: 'Probation',
  },
  WFH: {
    count: EmployeeStatus.find((item) => item.WFH)?.WFH || 0,
    color: 'bg-red-500',
    label: 'WFH',
  },
}

const EmployeeStatusDashboard = ({onViewAll}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Week')

  return (
    <div className="max-w-4xl mx-auto p-2 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Employee Status</h2>
        <div className="relative inline-block text-left">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
      </div>

      {/* Total Employee and Chart */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Total Employee</span>
          <span className="text-3xl font-bold text-gray-900">
            {totalEmployees}
          </span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden">
          {Object.entries(statusData).map(([key, data]) => (
            <div
              key={key}
              style={{ width: `${calculatePercentage(data.count)}%` }}
              className={`${data.color}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {Object.entries(statusData).map(([key, data]) => (
          <div
            key={key}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center mb-2">
              <span className={`w-3 h-3 ${data.color} rounded-sm mr-2`}></span>
              <span className="text-gray-600 text-sm font-medium">
                {data.label} ({calculatePercentage(data.count)}%)
              </span>
            </div>
            <p className="text-4xl font-bold text-gray-900">{data.count}</p>
          </div>
        ))}
      </div>

      {/* Top Performer */}
      <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-md">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Top Performer</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <span className="absolute top-0 left-0 -mt-2 -ml-2 p-1 rounded-full bg-orange-400 text-white">
                🥇
              </span>
              <img
                className="w-12 h-12 rounded-full mr-4 object-cover"
                src="https://randomuser.me/api/portraits/women/65.jpg"
                alt="Daniel Esbella"
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Daniel Esbella</p>
              <p className="text-sm text-gray-500">IOS Developer</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">Performance</span>
            <p className="text-xl font-bold text-green-500">99%</p>
          </div>
        </div>
      </div>

      {/* View All Employees Button */}
      <div className="mt-2 text-center">
        <button
        onClick={onViewAll}
         className="w-full py-2 px-4 bg-gray-100 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-200">
          View All Employees
        </button>
      </div>
    </div>
  );
};
const Attendance = ({onViewAll}) => {
  const navigate= useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const totalAttendance = 104; 
  const data = [
    { name: 'Present', value: 60, color: '#10b981' }, // Green
    { name: 'Late', value: 20, color: '#1e3a8a' }, // Dark Blue
    { name: 'Permission', value: 20, color: '#facc15' }, // Yellow
    { name: 'Absent', value: 4, color: '#ef4444' }, // Red
  ];
  const totalPercentage = data.reduce((sum, item) => sum + item.value, 0);
  const fillerValue = 100 - totalPercentage;
  const chartData = [...data, ]; 
  return (
    <div className="bg-white p-5 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-800">Attendance Overview</h2>
        <div className="relative inline-block text-left">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>
      </div>
      <div className="relative h-38">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="100%" // Position the center at the bottom
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={140}
              paddingAngle={2}
              dataKey="value"
              cornerRadius={5} // Rounds the corners of the slices
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip/>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-16">
          <p className="text-gray-500 text-sm">Total Attendance</p>
          <p className="text-4xl font-bold text-gray-900">{totalAttendance}</p>
        </div>
      </div>
      <hr className="my-8 border-gray-200" />
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Status</h3>
          <ul className="space-y-1">
            {data.map((item) => (
              <li key={item.name} className="flex items-center text-gray-700">
                <span
                  className="inline-block h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                ></span>
                {item.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-right">
          <ul className="space-y-1 mt-8">
            {data.map((item) => (
              <li key={item.name} className="text-gray-700 font-medium">
                {item.value}%
              </li>
            ))}
          </ul>
          </div>
      </div>
      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="font-semibold text-gray-800 mr-2">Total Absentees</span>
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://randomuser.me/api/portraits/women/65.jpg" alt="" />
              <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src="https://randomuser.me/api/portraits/men/76.jpg" alt="" />
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 text-xs font-semibold text-gray-600">
                +1
              </div>
            </div>
          </div>
          <button
            onClick={onViewAll}
            className="text-blue-500 text-sm mt-4 text-left hover:underline"
            >
           View All
          </button>
        </div>
      </div>
    </div>
  );
};
const employees = [
  {
    name: 'John Doe',
    title: 'UI/UX Designer',
    department: 'UI/UX',
    status: 'Clocked In',
    time: '09:15',
    profilePic: '	https://randomuser.me/api/portraits/men/30.jpg',
  },
  {
    name: 'Raju',
    title: 'Project Manager',
    department: 'Management',
    status: 'Clocked In',
    time: '09:36',
    profilePic: 'https://randomuser.me/api/portraits/men/57.jpg',
  },
  {
    name: 'Srilekha',
    title: 'PHP Developer',
    department: 'Development',
    status: 'Clocked In',
    time: '09:15',
    profilePic: '	https://randomuser.me/api/portraits/women/57.jpg',
    details: {
      clockIn: '10:30 AM',
      clockOut: '09:45 AM',
      production: '09:21 Hrs',
    },
  },
];

const lateEmployee = {
  name: 'Anita',
  title: 'Marketing Head',
  department: 'Marketing',
  status: 'Late',
  lateTime: '30 Min',
  time: '08:35',
  profilePic: '	https://randomuser.me/api/portraits/women/87.jpg',
};
const departments = ['All Departments', 'UI/UX', 'Development', 'Management', 'HR', 'Marketing'];
const timeframes = ['Today', 'This week', 'This month', 'Last Month'];
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
const ClockInOut = ({onViewAll}) => {
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Today');
  return (
    <div className="bg-white rounded-lg shadow-md mr-0 w-full max-w-lg font-sans">
      <div className="p-5  flex items-center justify-between border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Clock-In/Out</h2>
        <div className="flex items-center space-x-2">
          {/* Department Dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="inline-flex justify-center w-full rounded-md text-sm border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-small text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {selectedDepartment}
                <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
              </MenuButton>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="origin-top-right absolute right-0 mt-2 w-56 text-sm rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  {departments.map((department) => (
                    <MenuItem key={department}>
                      {({ active }) => (
                        <a
                          href="#"
                          onClick={() => setSelectedDepartment(department)}
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          {department}
                        </a>
                      )}
                    </MenuItem>
                  ))}
                </div>
              </MenuItems>
            </Transition>
          </Menu>

          {/* Timeframe Dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-small text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {selectedTimeframe}
                <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
              </MenuButton>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  {timeframes.map((timeframe) => (
                    <MenuItem key={timeframe}>
                      {({ active }) => (
                        <a
                          href="#"
                          onClick={() => setSelectedTimeframe(timeframe)}
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm'
                          )}
                        >
                          {timeframe}
                        </a>
                      )}
                    </MenuItem>
                  ))}
                </div>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {employees.map((employee, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <img
                className="w-10 h-10 rounded-full mr-3"
                src={employee.profilePic}
                alt={employee.name}
              />
              <div>
                <p className="font-semibold text-gray-800">{employee.name}</p>
                <p className="text-sm text-gray-500">{employee.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <div className="flex items-center justify-center w-16 h-8 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                {employee.time}
              </div>
            </div>
          </div>
        ))}
        {/* Late Employee Section */}
        <div className="mt-6 border-t pt-4">
          <p className="text-gray-500 font-medium mb-3">Late</p>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <img
                className="w-10 h-10 rounded-full mr-3"
                src={lateEmployee.profilePic}
                alt={lateEmployee.name}
              />
              <div>
                <p className="font-semibold text-gray-800">{lateEmployee.name}</p>
                <p className="text-sm text-gray-500">{lateEmployee.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                {lateEmployee.lateTime}
              </span>
              <span className="text-gray-400 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <div className="flex items-center justify-center w-16 h-8 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                {lateEmployee.time}
              </div>
            </div>
          </div>
        </div>
        <button className="w-full text-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={onViewAll}>
          
          View All Attendance
        </button>
      </div>
    </div>
  );
}
const ChartsLayout = ({onViewAll}) => {
  const [activeTab, setActiveTab] = useState('applicants');

  const applicants = [
    {
      name: 'John Doe',
      exp: '5+',
      location: 'Hydrebad',
      job: 'Senior DevOps Engineer',
      image: 'https://randomuser.me/api/portraits/men/74.jpg',
      color: 'bg-teal-500',
    },
    {
      name: 'Ramesh',
      exp: '4+',
      location: 'Bangalore',
      job: 'UI/UX Designer',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D',
      color: 'bg-blue-500',
    },
    {
      name: 'Raghunadh',
      exp: '6+',
      location: 'Chennai',
      job: 'Full Stack Developer',
      image: 'https://randomuser.me/api/portraits/men/9.jpg',
      color: 'bg-pink-500',
    },
    {
      name: 'Anita',
      exp: '2+',
      location: 'Hyderabad',
      job: 'Junior React Developer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D',
      color: 'bg-purple-500',
    },
    {
      name: 'SriLekha',
      exp: '2+',
      location: 'Mumbai',
      job: 'Data Scientist',
      image: '	https://randomuser.me/api/portraits/women/63.jpg',
      color: 'bg-yellow-500',
    },
  ];

  const openings = [
    { title: 'Senior DevOps Engineer', openings: 10, logo: '🛠️', Category: "DevOps", Location: "Hyderabad,India", Salary: "$8,00,000 - $12,00,000 per Annum", Date: "2023-10-01" },
    { title: 'Data Scientist', openings: 20, logo: '🐘', Category: "Data Science", Location: "Bangalore,India", Salary: "$7,00,000 - $10,00,000 per Annum", Date: "2023-10-05" },
    { title: 'Junior React Developer', openings: 30, logo: '⚛️', Category: "Software", Location: "Chennai,India", Salary: "$4,00,000 - $6,00,000 per Annum", Date: "2023-10-10" },
    { title: 'UI/UX Designer', openings: 40, logo: '⚙️', Category: "Design", Location: "Mumbai,India", Salary: "$3,00,000 - $5,00,000 per Annum", Date: "2023-10-20", },
    { title: 'Full Stack Developer', openings: 15, logo: '💻', Category: "Software", Location: "Delhi,India", Salary: "$5,00,000 - $7,00,000 per Annum", Date: "2023-10-25" },
  ];

  const renderContent = () => {
    if (activeTab === 'applicants') {
      return (
        <ul>
          {applicants.map((applicant, index) => (
            <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-200">
              <div className="flex items-center">
                <img src={applicant.image} alt={applicant.name} className="w-10 h-10 rounded-full mr-4 object-cover" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{applicant.name}</h3>
                  <p className="text-sm text-gray-500">Exp: {applicant.exp} Years •{applicant.location}</p>
                </div>
              </div>
              <span className={`text-white text-xs font-semibold px-3 py-1 rounded-full ${applicant.color}`}>{applicant.job}</span>
            </li>
          ))}
        </ul>
      );
    } else {
      return (
        <ul>
          {openings.map((opening, index) => (
            <li key={index} className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-200">
              <div className="flex items-center">
                <span className="text-xl mr-4">{opening.logo}</span>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{opening.title}</h3>
                  <p className="text-sm text-gray-500">No of Openings : {opening.openings}</p>
                </div>
              </div>
              <button onClick={()=>alert('View Application')} className="text-gray-500 hover:text-gray-900" >✏️</button>
            </li>
          ))}
        </ul>
      );
    }
  };

  return (
    <div className="p-0 flex flex-col items-center bg-gray-100  font-sans">
      <div className="bg-white rounded-lg shadow-md  p-2 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Jobs Applicants</h2>
          <button className="text-blue-600 hover:underline" onClick={onViewAll}>View All</button>
        </div>
        <div className="flex space-x-2 border-b-2 border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('openings')}
            className={`py-2 px-1 rounded-t-lg font-medium ${activeTab === 'openings' ? 'bg-orange-500 text-white' : 'text-gray-600'}`}
          >
            Openings
          </button>
          <button
            onClick={() => setActiveTab('applicants')}
            className={`py-3 px-4 rounded-t-lg font-medium ${activeTab === 'applicants' ? 'bg-orange-500 text-white' : 'text-gray-600'}`}
          >
            Applicants
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};
const TaskStatistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const tasks = [
    { label: 'Ongoing', percentage: 24, color: '#facc15' }, // Tailwind yellow-400
    { label: 'On Hold', percentage: 10, color: '#3b82f6' }, // Tailwind blue-500
    { label: 'Overdue', percentage: 16, color: '#ef4444' }, // Tailwind red-500
    { label: 'Ongoing', percentage: 40, color: '#22c55e' }, // Tailwind green-500
  ];

  const totalTasks = 60;
  const totalTasksPossible = 80; // Example total tasks possibl
  const spentHours = 42;
  const totalHours = 50;

  return (
    <div className="p-1 flex flex-col items-center bg-gray-100  font-sans">
      <div className="bg-white rounded-lg shadow-md  p-2 w-full max-w-2xl">
         <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Tasks Statistics</h2>
          <div className="relative inline-block text-left">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
        </div>

        </div>

        <div className="relative flex justify-center items-center h-48">
          <div className="absolute top-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 50">
              <defs>
                <linearGradient id="ongoing-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#facc15' }} />
                  <stop offset="100%" style={{ stopColor: '#facc15' }} />
                </linearGradient>
                <linearGradient id="onhold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#3b82f6' }} />
                  <stop offset="100%" style={{ stopColor: '#3b82f6' }} />
                </linearGradient>
                <linearGradient id="overdue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#ef4444' }} />
                  <stop offset="100%" style={{ stopColor: '#ef4444' }} />
                </linearGradient>
                <linearGradient id="second-ongoing-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#22c55e' }} />
                  <stop offset="100%" style={{ stopColor: '#22c55e' }} />
                </linearGradient>
              </defs>
              <path
                d="M 2.5 50 A 47.5 47.5 0 0 1 97.5 50"
                fill="none"
                stroke="url(#ongoing-gradient)"
                strokeWidth="5"
                strokeDasharray={`${(24 / 100) * 150.8} ${150.8 - (24 / 100) * 150.8}`}
                strokeDashoffset="0"
                className="transition-all duration-1000 ease-out"
              />
              <path
                d="M 2.5 50 A 47.5 47.5 0 0 1 97.5 50"
                fill="none"
                stroke="url(#onhold-gradient)"
                strokeWidth="5"
                strokeDasharray={`${(10 / 100) * 150.8} ${150.8 - (10 / 100) * 150.8}`}
                strokeDashoffset={`-${(24 / 100) * 150.8}`}
                className="transition-all duration-1000 ease-out"
              />
              <path
                d="M 2.5 50 A 47.5 47.5 0 0 1 97.5 50"
                fill="none"
                stroke="url(#overdue-gradient)"
                strokeWidth="5"
                strokeDasharray={`${(16 / 100) * 150.8} ${150.8 - (16 / 100) * 150.8}`}
                strokeDashoffset={`-${((24 + 10) / 100) * 150.8}`}
                className="transition-all duration-1000 ease-out"
              />
              <path
                d="M 2.5 50 A 47.5 47.5 0 0 1 97.5 50"
                fill="none"
                stroke="url(#second-ongoing-gradient)"
                strokeWidth="5"
                strokeDasharray={`${(40 / 100) * 150.8} ${150.8 - (40 / 100) * 150.8}`}
                strokeDashoffset={`-${((24 + 10 + 16) / 100) * 150.8}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 text-center">
            <div className="text-sm text-gray-500">Total Tasks</div>
            <div className="text-3xl font-bold text-gray-800">{totalTasks}/{totalTasksPossible}</div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center space-x-4 my-6">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color }}></div>
              <span className="text-sm text-gray-600">{task.label}</span>
              <span className="text-sm font-semibold">{task.percentage}%</span>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 text-white rounded-lg p-4 flex justify-between items-center">
          <div>
            <div className="text-xl text-green-400 font-bold">{spentHours}/{totalHours} hrs</div>
            <div className="text-sm text-gray-400">Spent on Overall Tasks This Week</div>
          </div>
          <button className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-md hover:bg-gray-200">
            View All
          </button>
        </div>
      </div>
    </div>
  );
};
const projectTableData = [
    {
        project_id: "P_01",
        project_name: "HRMS Project",
        status: "Ongoing",
        start_date: "2025-05-01",
        end_date: "2025-09-30",
        Employee_team: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        Priority: "High",
        Open_task: 30,
        Closed_task: 25,
        Details: "https://www.flaticon.com/free-icon/document_16702688",
        Action: "https://icons8.com/icon/102350/delete"
    },
    {
        project_id: "P_02",
        project_name: "Employee Self-Service App",
        status: "In Progress", 
        start_date: "2025-10-15",
        end_date: "2025-12-15",
        Employee_team: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        Priority: "Medium",
        Open_task: 20,
        Closed_task: 10,
        Details: "https://www.flaticon.com/free-icon/document_16702688",
        Action: "https://icons8.com/icon/102350/delete"
    },
    {
        project_id: "P_03",
        project_name: "Payroll Automation",
        status: "Planned",
        start_date: "2024-10-01",
        end_date: "2025-02-15",
        Employee_team: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        Priority: "High",
        Open_task: 12,
        Closed_task: 10,
        Details: "https://www.flaticon.com/free-icon/document_16702688",
        Action: "https://icons8.com/icon/102350/delete"
    },
    {
        project_id: "P_04",
        project_name: "Attendance System Upgrade",
        status: "Ongoing",
        start_date: "2025-05-10",
        end_date: "2025-08-10",
        Employee_team: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        Priority: "Low", // Changed from "Small" to "Low" for consistency
        Open_task: 40,
        Closed_task: 25,
        Details: "https://www.flaticon.com/free-icon/document_16702688",
        Action: "https://icons8.com/icon/102350/delete"
    },
    {
        project_id: "P_05",
        project_name: "AI-Based Recruitment Tool",
        status: "Planned",
        start_date: "2025-12-01",
        end_date: "2026-02-28",
        Employee_team: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        Priority: "Medium",
        Open_task: 20,
        Closed_task: 15,
        Details: "https://www.flaticon.com/free-icon/document_16702688",
        Action: "https://icons8.com/icon/102350/delete"
    },
    {
        project_id: "P06",
        project_name: "Internal Chatbot System",
        status: "Planned",
        start_date: "2024-05-01",
        end_date: "2024-11-30",
        Employee_team: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        Priority: "High",
        Open_task: 30,
        Closed_task: 25,
        Details: "https://www.flaticon.com/free-icon/document_16702688",
        Action: "https://icons8.com/icon/102350/delete"
    }
];
const getPriorityColor = (priority) => {
    switch (priority) {
        case "High":
            return "bg-green-100 text-green-800";
        case "Medium":
            return "bg-orange-100 text-orange-800";
        case "Low":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case "In Progress":
            return "bg-green-100 text-green-800";
        case "Ongoing":
            return "bg-blue-100 text-blue-800";
        case "Planned":
            return "bg-yellow-100 text-yellow-800"; // Changed from red to yellow for upcoming
        default:
            return "bg-gray-100 text-gray-800";
    }
};

function Project() {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md border  border-gray-200 overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Project Overview</h2>
            <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-100 text-gray-800 text-left">
                    <tr>
                        <th className="p-3 text-sm md:text-base">Project</th>
                        <th className="p-3 text-sm md:text-base">Team</th>
                        <th className="p-3 text-sm md:text-base">Priority</th>
                        <th className="p-3 text-sm md:text-base"><FaCalendarAlt className="inline mr-1" />Start</th>
                        <th className="p-3 text-sm md:text-base"><FaCalendarAlt className="inline mr-1" />End</th>
                        <th className="p-3 text-sm md:text-base">Status</th>
                        <th className="p-3 text-sm md:text-base">Details</th>
                        <th className="p-3 text-sm md:text-base">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {projectTableData.map((proj) => (
                        <tr key={proj.project_id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="p-3 text-sm md:text-base font-semibold">{proj.project_name}</td>
                            <td className="p-3">
                                <div className="flex -space-x-2 ">
                                    {proj.Employee_team.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt="team member"
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm"
                                        />
                                    ))}
                                </div>
                            </td>
                            <td className="p-3">
                                <span className={`px-2 py-1 text-xs md:text-sm rounded-full ${getPriorityColor(proj.Priority)}`}>
                                    {proj.Priority}
                                </span>
                            </td>
                            <td className="p-3 text-sm md:text-base">{proj.start_date}</td>
                            <td className="p-3 text-sm md:text-base">{proj.end_date}</td>
                            <td className="p-3 ">
                                <span className={`px-2 py-1 rounded-full text-xs md:text-sm ${getStatusColor(proj.status)}`}>
                                    {proj.status}
                                </span>
                            </td>
                            <td className="p-3 text-center">
                                <a href={proj.Details} target="_blank" rel="noopener noreferrer">
                                    <FaFileAlt className="text-blue-600 text-lg inline w-6 h-6 md:w-8 md:h-8 hover:scale-110 transition" />
                                </a>
                            </td>
                            <td className="p-3 text-center">
                                <button>
                                    <FaTrashAlt className="text-red-500 text-lg w-6 h-6 md:w-8 md:h-8 hover:scale-110 transition" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
const CombinedDashboard = () => {
  const [showAttendanceReport, setShowAttendanceReport] = useState(false);
  const [showLeavesReport, setShowLeavesReport] = useState(false);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [showApplicants, setShowApplicants]=useState(false);
  const [showJobsList, setShowJobsList]=useState(false);
  const [showchartLayout, setShowchartLayout]=useState(false);
  const [showAttendanceDashBoard,setShowAttendanceDashBoard]=useState(false);
    
     const handleViewchartLayout = () => {
        setShowchartLayout(true);

    };
    const handleViewAttendance = () => {
        setShowAttendanceReport(true);

    };
     const handleViewLeaves = () => {
        setShowLeavesReport(true);
    };
    const handleViewEmployee = () => {
        setShowEmployeeDetails(true);
    };
     const handleViewApplicants = () => {
        setShowApplicants(true);
    };
    const handleViewJobs = () => {
        setShowJobsList(true);
    };
     const handleViewAtteandances = () => {
        setShowAttendanceDashBoard(true);
    };
   const handleBackToDashboard = () => {
        setShowAttendanceReport(false);
        setShowLeavesReport(false);
        setShowEmployeeDetails(false);
        setShowApplicants(false);
        setShowJobsList(false);
        setShowchartLayout(false);
        setShowAttendanceDashBoard(false);
    };
    if (showAttendanceDashBoard) {
        return <AttendancesDashboard onBack={handleBackToDashboard} />;
    }
    if (showchartLayout) {
        return <JobsList onBack={handleBackToDashboard} />;
    }
    if (showJobsList) {
        return <JobsList onBack={handleBackToDashboard} />;
    }
    if (showApplicants) {
        return <Applicants onBack={handleBackToDashboard} />;
    }
    if (showEmployeeDetails) {
        return <EmployeeDetails onBack={handleBackToDashboard} />;
    }
    if (showAttendanceReport) {
        return <AttendanceReports onBack={handleBackToDashboard} />;
    }
    if (showLeavesReport) {
        return <LeavesReports onBack={handleBackToDashboard} />;
    }
    const StatsOverview=[
    {
        title: 'Attendance Overview',
        value: '120',
        total: '154',
        percentage: '+2.1%',
        isPositive: true,
        icon: <CalendarIcon className="h-6 w-6" />
    },
    {
        title: 'Total No of Projects',
        value: '90',
        total: '125',
        percentage: '-2.1%',
        isPositive: false,
        icon: <FaPlusCircle className="h-6 w-6" />
    },
    {
        title: 'Total No of Tasks',
        value: '225',
        total: '28',
        percentage: '+11.2%',
        isPositive: true,
        icon: <CalendarIcon className="h-6 w-6" />
    },
    {
        title: 'Job Applicants',
        value: '98',
        percentage: '+2.1%',
        isPositive: true,
        icon: <CalendarIcon className="h-6 w-6" />
    },
    {
        title: 'New Hire',
        value: '45',
        total: '48',
        percentage: '-11.2%',
        isPositive: false,
        icon: <CalendarIcon className="h-6 w-6" />
    },
    {
        title: 'Total No of Clients',
        value: '69',
        total: '86',
        percentage: '-11.2%',
        isPositive: false,
        icon: <CalendarIcon className="h-6 w-6" />
    }
]
  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      <Header />
      <div className="container mx-auto">
        <UserGreeting />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
                    title="Attendance Overview"
                    value="104"
                    total="108"
                    percentage="+2.1%"
                    isPositive={true}
                    icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                    }
                    onViewAll={handleViewAtteandances}
                />
            <StatCard
              title="Total No of Projects"
              value="90"
              total="125"
              percentage="-2.1%"
              isPositive={false}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-9 4h2m-2 4h2m4-4h2m-2 4h2"
                  />
                </svg>
              }
              onViewAll={() => alert('View All Projects')}
            />
            <StatCard
              title="Total No of Tasks"
              value="60"
              total="80"
              percentage="+11.2%"
              isPositive={true}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              }
              onViewAll={() => alert('View All Tasks')}
            />
            <StatCard
              title="Job Applicants"
              value="98"
              percentage="+2.1%"
              isPositive={true}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a4 4 0 014-4h.247M17 16l4-4m0 0l-4-4m4 4H7"
                  />
                </svg>
              }
              onViewAll={handleViewJobs}
            />
            <StatCard
              title="New Hire"
              value="45"
              total="48"
              percentage="-11.2%"
              isPositive={false}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              onViewAll={handleViewApplicants}
            />
            <StatCard
              title="Total No of Clients"
              value="69"
              total="86"
              percentage="-11.2%"
              isPositive={false}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5m-2 0h-3.268a2 2 0 01-1.89-1.332L10 2l-2.482 7.493a2 2 0 00-1.89 1.332L2 20h5m-4 0h12"
                  />
                </svg>
              }
              onViewAll={() => alert('View All Clients')}
            />
          </div>
          <div className="lg:col-span-2">
            <EmployeeChart/>
          </div>
          <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
             <div class="w-full">
                 <EmployeeStatusDashboard onViewAll={handleViewEmployee}/>
             </div>
             <div class="w-full">
                 <Attendance 
                 onViewAll={handleViewLeaves}/>
             </div> 
         </div>      
            <div class="lg:col-span-2">
              <div class="w-full">
                  <ClockInOut onViewAll={handleViewAttendance}/>
                  </div>
             </div>
             <div class="lg:col-span-3">
              <div class="w-full">
                  <ChartsLayout onViewAll={handleViewchartLayout} />
                  </div>
             </div>
             <div class="lg:col-span-2">
              <div class="w-full">
                  <TaskStatistics />
                  </div>
             </div>
            <div class="lg:col-span-6">
              <div class="w-full">
                  <Project />
                  </div>
                  </div>  
                   
        </div>
      </div>
    </div>  
  );
};
export default CombinedDashboard;

 

