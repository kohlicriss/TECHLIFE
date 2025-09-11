import { CalendarDaysIcon, ClockIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
const ChartData=[
     {
      title:"Total Working Days in Month",
      value:"25" 
     },
     {
       title:"Total Leave Taken Today",
       value:"12"  
     },
     {
       title:"Total Holidays per Year",
       value:"6"
     },
     {
       title:"Total Halfdays per Day",
       value:"5"
      }
]

const ChartCard = ({ title, titlecolor,icon, value }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-full  bg-opacity-20`}>
          {icon}
        </div>
        <div>
          <h3 className={`text-sm font-medium ${titlecolor}`}>{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};
const DashboardGrid = () => {
  return (
    <div className="p-4 bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6">
         {ChartData.map((Chart, index) => {
              
              let icon,titlecolor;
        
              switch (Chart.title){
                case "Total Working Days in Month":
                  icon = <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 inline-block text-orange-600 mr-2" />
                  titlecolor="text-orange-500"
                  break;
                case "Total Leave Taken Today":
                  icon = <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 inline-block text-blue-600 mr-2" />
                  titlecolor="text-blue-500";
                  break;
                case "Total Holidays per Year":
                  icon = <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 inline-block text-pink-600 mr-2" />
                  titlecolor="text-pink-500";
                  break;
                case "Total Halfdays per Day":
                  icon = <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 inline-block text-yellow-600 mr-2" />
                  titlecolor="text-yellow-500";
                  break;
                default:
              }
        
              return (
                <ChartCard
                  key={index}
                  icon={icon}
                  value={Chart.value}
                  title={Chart.title}
                  titlecolor={titlecolor}
                />
              );
            })}
          </div>
       </div>
  );
};
const AttendanceTable = () => {
  const [selectedMonth, setSelectedMonth] = useState("All");
  const MONTHS = ["All", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const rawTableData = [
   {  employee_id: "E_01", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
   {  employee_id: "E_02", date: "2025-06-30", login_time: null, logout_time: null },
   {  employee_id: "E_03", date: "2025-06-30", login_time: "10:00 AM", logout_time: "06:00 PM" },
   {  employee_id: "E_04", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
   {  employee_id: "E_05", date: "2025-06-30", login_time: null, logout_time: null },
   {  employee_id: "E_06", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
   {  employee_id: "E_07", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
   {  employee_id: "E_08", date: "2025-06-30", login_time: "10:00 AM", logout_time: "07:00 PM" },
   {  employee_id: "E_09", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
   {  employee_id: "E_10", date: "2025-06-30", login_time: "09:45 AM", logout_time: "08:10 PM" },
   {  employee_id: "E_11", date: "2025-06-30", login_time: "09:55 AM", logout_time: "08:00 PM" },
   {  employee_id: "E_12", date: "2025-06-30", login_time: null, logout_time: null },
   {  employee_id: "E_13", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
   {  employee_id: "E_14", date: "2025-06-30", login_time: null, logout_time: null },
   {  employee_id: "E_15", date: "2025-06-30", login_time: "10:00 AM", logout_time: "08:00 PM" },
 ];
 const STANDARD_WORKDAY_HOURS = 10;
const calculateHours = (login, logout) => {
  if (!login || !logout) return 0;
  const loginDate = new Date(`2000-01-01 ${login}`);
  const logoutDate = new Date(`2000-01-01 ${logout}`);
  const diff = (logoutDate - loginDate) / (1000 * 60 * 60);
  return diff > 0 ? diff : 0;
};
const formatTime = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};
const filteredTableData = useMemo(() => {
  if (selectedMonth === "All" || !selectedMonth) return rawTableData.map((entry) => {
    const login_hours = calculateHours(entry.login_time, entry.logout_time);
    const barWidth = `${(login_hours / STANDARD_WORKDAY_HOURS) * 100}%`;
    return { ...entry, login_hours, barWidth };
  });
const selectedMonthIndex = MONTHS.indexOf(selectedMonth) - 1;
  return rawTableData
    .filter((entry) => {
      const entryMonth = new Date(entry.date).getMonth();
      return entryMonth === selectedMonthIndex;
    })
    .map((entry) => {
      const login_hours = calculateHours(entry.login_time, entry.logout_time);
      const barWidth = `${(login_hours / STANDARD_WORKDAY_HOURS) * 100}%`;
      return { ...entry, login_hours, barWidth };
    });
    }, [selectedMonth, rawTableData]);
    const FilterButtonGroup = ({ options, selectedOption, onSelect, className = "" }) => (
  <div className={`flex gap-2 sm:gap-3 flex-wrap ${className}`}>
    {options.map((option) => (
      <button
        key={option}
        onClick={() => onSelect(option)}
        className={`px-4 py-2 rounded-lg border text-sm sm:text-base font-semibold
          ${selectedOption === "MONTHS" ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 border-gray-300"}
          hover:bg-blue-500 hover:text-white transition-colors duration-200 ease-in-out`}
        aria-pressed={selectedOption === "MONTHS"}
      >
        { option }
      </button>
    ))}
  </div>
);
    return (
       <div>
          <section className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
              <h2 className="text-xl sm:text-xl font-bold text-gray-800">
                <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 inline-block text-blue-600 mr-2" /> Attendance Records
              </h2>
              <FilterButtonGroup
                options={"All, Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sept, Oct, Nov, Dec".split(', ')}
                selectedOption={selectedMonth}
                onSelect={setSelectedMonth}
              />
            </div>
    
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-2 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                         Emp_Id
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" /> Date
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /> Login Time
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" /> Logout Time
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                      Login Hours
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">
                      Daily Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTableData.length > 0 ? (
                    filteredTableData.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-blue-50 transition-colors duration-150">
                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">{entry.employee_id}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{entry.date}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                          {entry.login_time || <span className="text-red-500 font-semibold">Absent</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                          {entry.logout_time || <span className="text-red-500 font-semibold">Absent</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                          <span className="font-semibold text-blue-700">{entry.login_hours.toFixed(2)}</span> hrs
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="relative rounded-full h-4 w-full overflow-hidden">
                            <div
                              className="bg-blue-200 h-full rounded-full transition-all duration-300 ease-in-out"
                              style={{ width: entry.barWidth }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white mix-blend-difference">
                              {entry.login_hours.toFixed(1)}h
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-3 text-center text-gray-500 italic">
                        No attendance records found for the selected month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      );
    };

   function AttendanceReports({ onBack }) { 
  return (
    <div className="p-2">
      <header className="flex items-center justify-between">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-4xl ml-5 font-extrabold text-gray-900 mb-2">
            Attendance Report
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
      <div className="lg:col-span-2">
        <div className="w-full">
          <DashboardGrid />
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="w-full">
          <AttendanceTable />
        </div>
      </div>
    </div>
  );
};

export default AttendanceReports;      