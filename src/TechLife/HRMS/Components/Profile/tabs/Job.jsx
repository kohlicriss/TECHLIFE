// src/TechLife/HRMS/Components/Profile/tabs/Job.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Context } from '../../HrmsContext';
import { publicinfoApi } from '../../../../../axiosInstance';
import { 
  IoBriefcaseOutline, 
  IoTimeOutline, 
  IoDocumentTextOutline, 
  IoBusinessOutline, 
  IoCheckmarkCircle, 
  IoWarning,
  IoEye
} from 'react-icons/io5';

// Static data for other sections
const employeeTime = [
  { label: "SHIFT", value: "10 AM - 8 PM" },
  { label: "WEEKLY OFF POLICY", value: "All Sat - Sun" },
  { label: "LEAVE PLAN", value: "Leave Plan" },
  { label: "HOLIDAY CALENDAR", value: "Anasol Holiday Plan" },
  { label: "ATTENDANCE NUMBER", value: "-" },
  { label: "PAYROLL TIME SOURCE", value: "Attendance" },
  { label: "ATTENDANCE CAPTURE SCHEME", value: "Capture Scheme Anasol" },
  { label: "ATTENDANCE PENALIZATION POLICY", value: "Anasol Penalization Policy" },
  { label: "SHIFT WEEKLY OFF RULE", value: "-Not Set-" },
  { label: "SHIFT ALLOWANCE POLICY", value: "-Not Set-" },
  { label: "OVERTIME", value: "-Not Set-" },
];

const otherPolicies = [
  { label: "EXPENSE POLICY", value: "-" },
  { label: "TIMESHEET POLICY", value: "-" },
  { label: "LOAN POLICY", value: "-" },
  { label: "AIR TICKET POLICY", value: "-" },
];

const organizationDetails = [
  { label: "BUSINESS UNIT", value: "-" },
  { label: "DEPARTMENT", value: "Software Development" },
  { label: "LOCATION", value: "ANASOL CONSULTANCY SERVICES PRIVATE..." },
  { label: "COST CENTER", value: "-Not Set-" },
  { label: "LEGAL ENTITY", value: "ANASOL PRIVATE LIMITED" },
  { label: "REPORTS TO", value: "-" },
  { label: "MANAGER OF MANAGER (L2 MANAGER)", value: "-" },
  { label: "DIRECT REPORTS", value: "0 Employees" },
];

// Section configurations with icons and colors
const sectionConfig = {
  jobDetails: {
    icon: IoBriefcaseOutline,
    color: 'from-blue-500 to-blue-700',
    bgColor: 'bg-blue-50',
    darkBgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-200',
    darkBorderColor: 'border-blue-700',
    textColor: 'text-blue-700',
    darkTextColor: 'text-blue-400',
    title: 'Job Details',
    description: 'Employment information and job specifications'
  },
  employeeTime: {
    icon: IoTimeOutline,
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    darkBgColor: 'bg-green-900/20',
    borderColor: 'border-green-200',
    darkBorderColor: 'border-green-700',
    textColor: 'text-green-700',
    darkTextColor: 'text-green-400',
    title: 'Employee Time',
    description: 'Work schedule and attendance policies'
  },
  otherPolicies: {
    icon: IoDocumentTextOutline,
    color: 'from-orange-500 to-orange-700',
    bgColor: 'bg-orange-50',
    darkBgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-200',
    darkBorderColor: 'border-orange-700',
    textColor: 'text-orange-700',
    darkTextColor: 'text-orange-400',
    title: 'Other Policies',
    description: 'Additional company policies and guidelines'
  },
  organizationDetails: {
    icon: IoBusinessOutline,
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    darkBgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-200',
    darkBorderColor: 'border-purple-700',
    textColor: 'text-purple-700',
    darkTextColor: 'text-purple-400',
    title: 'Organization Details',
    description: 'Departmental and reporting structure'
  },
};

const DetailItem = ({ label, value, note, status, theme }) => (
  <div className={`group p-3 sm:p-4 rounded-none sm:rounded-lg md:rounded-xl border transition-all duration-300 hover:scale-105 ${
    theme === 'dark'
      ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 hover:shadow-md hover:shadow-blue-500/20'
      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-100 hover:shadow-md'
  }`}>
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <span className={`text-xs font-bold uppercase tracking-wider block mb-1 sm:mb-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {label}
        </span>
        {status === "active" ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`text-sm font-semibold break-words ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{value}</span>
            </div>
            {note && (
              <span className={`text-xs px-2 py-1 rounded-full break-words ${
                theme === 'dark' ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-100'
              }`}>
                {note}
              </span>
            )}
          </div>
        ) : (
          <div>
            <p className={`text-sm font-semibold leading-relaxed break-words ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {value || (
                <span className={`italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Not provided</span>
              )}
            </p>
            {note && (
              <p className={`text-xs mt-1 px-2 py-1 rounded-md inline-block break-words ${
                theme === 'dark' ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700'
              }`}>
                {note}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

const Section = ({ sectionKey, title, data, children, theme }) => {
  const config = sectionConfig[sectionKey];
  const IconComponent = config.icon;
  const hasData = data && data.length > 0;
  
  return (
    <div className={`border-2 rounded-none sm:rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 
                   overflow-hidden group hover:scale-[1.02] mb-4 sm:mb-6 md:mb-8 ${
      theme === 'dark'
        ? `bg-gray-800 ${config.darkBorderColor} hover:shadow-blue-500/20`
        : `bg-white ${config.borderColor}`
    }`}>
      <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b-2 relative overflow-hidden ${
        theme === 'dark'
          ? `${config.darkBgColor} ${config.darkBorderColor}`
          : `${config.bgColor} ${config.borderColor}`
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md transform group-hover:scale-110 transition-transform duration-300 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            }`}>
              <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${
                theme === 'dark' ? config.darkTextColor : config.textColor
              }`} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className={`text-lg sm:text-xl font-bold flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 ${
                theme === 'dark' ? config.darkTextColor : config.textColor
              }`}>
                <span className="break-words">{title}</span>
                {hasData && (
                  <div className="flex items-center space-x-1">
                    <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Active
                    </span>
                  </div>
                )}
              </h4>
              <p className={`text-xs sm:text-sm mt-1 break-words ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>{config.description}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 md:p-8">
        {hasData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            {data.map((item, index) => (
              <DetailItem 
                key={index} 
                label={item.label} 
                value={item.value} 
                note={item.note} 
                status={item.status} 
                theme={theme}
              />
            ))}
            {children}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${
              theme === 'dark' ? config.darkBgColor : config.bgColor
            }`}>
              <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 opacity-50 ${
                theme === 'dark' ? config.darkTextColor : config.textColor
              }`} />
            </div>
            <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>No {title} Available</h3>
            <p className={`text-sm mb-4 sm:mb-6 max-w-sm mx-auto px-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {title} information is not currently available or configured.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProgressIndicator = ({ completedSections, totalSections, theme }) => {
  const percentage = (completedSections / totalSections) * 100;
  
  return (
    <div className={`rounded-none sm:rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-lg border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className={`text-base sm:text-lg font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>Job Information</h3>
        <span className={`text-sm font-medium ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {completedSections}/{totalSections} Sections
        </span>
      </div>
      <div className={`w-full rounded-full h-2 sm:h-3 mb-3 sm:mb-4 overflow-hidden ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 sm:h-3 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-sm">
        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{percentage.toFixed(0)}% Complete</span>
        {percentage === 100 && (
          <span className="text-green-600 font-semibold flex items-center">
            <IoCheckmarkCircle className="w-4 h-4 mr-1" />
            All Set!
          </span>
        )}
      </div>
    </div>
  );
};

const SkeletonCard = ({ theme }) => (
  <div className={`border rounded-none sm:rounded-xl md:rounded-2xl shadow-sm overflow-hidden animate-pulse ${
    theme === 'dark' 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200'
  }`}>
    <div className={`p-4 sm:p-6 border-b ${
      theme === 'dark' 
        ? 'bg-gray-700 border-gray-600' 
        : 'bg-gray-100 border-gray-200'
    }`}>
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${
          theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
        }`}></div>
        <div className="flex-1 min-w-0">
          <div className={`h-4 sm:h-5 rounded w-24 sm:w-32 mb-2 ${
            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
          }`}></div>
          <div className={`h-3 rounded w-32 sm:w-48 ${
            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
          }`}></div>
        </div>
      </div>
    </div>
    <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`p-3 sm:p-4 rounded-none sm:rounded-lg md:rounded-xl ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className={`h-3 rounded w-16 sm:w-20 mb-2 ${
              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}></div>
            <div className={`h-4 rounded w-24 sm:w-32 ${
              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AttendanceToggle = ({ theme }) => {
  const [isDisabled, setIsDisabled] = useState(false);
  
  return (
    <div className={`col-span-1 lg:col-span-2 p-4 sm:p-6 rounded-none sm:rounded-lg md:rounded-xl border ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-700'
        : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-semibold mb-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>Attendance Tracking</h4>
          <p className={`text-xs break-words ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>Control automated attendance monitoring</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer group flex-shrink-0">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={isDisabled}
            onChange={(e) => setIsDisabled(e.target.checked)}
          />
          <div className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full peer transition-all duration-300 
                         peer-checked:after:translate-x-5 sm:peer-checked:after:translate-x-6 peer-checked:after:border-white 
                         after:content-[''] after:absolute after:top-1 after:left-1 
                         after:bg-white after:border after:rounded-full 
                         after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all after:shadow-md
                         peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-indigo-600
                         group-hover:shadow-lg ${
            theme === 'dark' 
              ? 'bg-gray-600 after:border-gray-500' 
              : 'bg-gray-200 after:border-gray-300'
          }`}>
          </div>
          <span className={`ml-3 text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {isDisabled ? 'Disabled' : 'Enabled'}
          </span>
        </label>
      </div>
      {isDisabled && (
        <div className={`mt-3 p-3 border rounded-lg ${
          theme === 'dark'
            ? 'bg-yellow-900/30 border-yellow-700'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            <IoWarning className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <p className={`text-xs break-words ${
              theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              Attendance tracking is currently disabled for this employee
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const Job = () => {
  const { empID } = useParams();
  const location = useLocation();
  const { theme } = useContext(Context);
  const [jobdetails, setJobDetails] = useState(null);
  const [displayJobDetails, setDisplayJobDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completionStats, setCompletionStats] = useState({ completed: 0, total: 4 });

  const searchParams = new URLSearchParams(location.search);
  const fromContextMenu = searchParams.get('fromContextMenu') === 'true';
  const targetEmployeeId = searchParams.get('targetEmployeeId');

  const jobEmployeeId = fromContextMenu && targetEmployeeId ? targetEmployeeId : empID;
  const isReadOnly = fromContextMenu && targetEmployeeId && targetEmployeeId !== empID;

  useEffect(() => {
    let jobDetailsFetch = async () => {
      try {
        let response = await publicinfoApi.get(`employee/${jobEmployeeId}/job/details`);
        console.log("job data : ", response.data);
        setJobDetails(response.data);
      } catch (error) {
        console.log("job error : ", error);
      } finally {
        setIsLoading(false);
      }
    };
    jobDetailsFetch();
  }, [jobEmployeeId]);

  useEffect(() => {
    if (jobdetails) {
      const formattedData = [
        { label: "EMPLOYEE NUMBER", value: jobdetails.employeeId },
        { label: "DATE OF JOINING", value: jobdetails.dateOfJoining },
        { label: "JOB TITLE - PRIMARY", value: jobdetails.jobTitlePrimary },
        { label: "JOB TITLE - SECONDARY", value: jobdetails.jobTitleSecondary || "-" },
        {
          label: "IN PROBATION?",
          value: `${jobdetails.inProbation} ${jobdetails.probationStartDate || "-"} - ${jobdetails.probationEndDate || "-"}`,
          note: jobdetails.probationPolicy || "Default Probation Policy"
        },
        { label: "NOTICE PERIOD", value: "-" },
        { label: "WORKER TYPE", value: jobdetails.workerType || "Intern" },
        { label: "TIME TYPE", value: jobdetails.timeType },
        {
          label: "CONTRACT STATUS",
          value: jobdetails.contractStatus,
          note: jobdetails.contractStartDate,
          status: jobdetails.contractStatus === "Active" ? "active" : ""
        },
      ];
      setDisplayJobDetails(formattedData);

      const sections = [jobdetails, employeeTime, otherPolicies, organizationDetails];
      const completed = sections.filter(section => section && section.length > 0).length;
      setCompletionStats({ completed: completed || 1, total: 4 });
    }
  }, [jobdetails]);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-500 border-t-transparent mx-auto mb-4 sm:mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <IoBriefcaseOutline className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              </div>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Loading Job Information</h2>
            <p className={`text-sm sm:text-base ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Fetching employment details and policies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!displayJobDetails) {
    return (
      <div className={`min-h-screen ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${
              theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
            }`}>
              <IoWarning className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Unable to Load Job Details</h2>
            <p className={`text-sm sm:text-base ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Job information is not available for this employee.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-7xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        {fromContextMenu && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 mx-4 sm:mx-0 rounded-none sm:rounded-xl md:rounded-2xl border-l-4 border-blue-500 shadow-lg ${
            theme === 'dark' ? 'bg-blue-900/20 border-blue-400' : 'bg-blue-50 border-blue-500'
          }`}>
            <div className="flex items-center space-x-3">
              <IoEye className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}>
                  Viewing Employee Job Details
                </p>
                <p className={`text-xs sm:text-sm break-words ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  Employee ID: {targetEmployeeId} 
                  {isReadOnly && " • Read-only access"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 sm:mb-8 md:mb-12 mx-4 sm:mx-0">
          <ProgressIndicator 
            completedSections={completionStats.completed} 
            totalSections={completionStats.total} 
            theme={theme}
          />
        </div>

        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <Section sectionKey="jobDetails" title="Job Details" data={displayJobDetails} theme={theme} />
          <Section sectionKey="employeeTime" title="Employee Time" data={employeeTime} theme={theme}>
            <AttendanceToggle theme={theme} />
          </Section>
          <Section sectionKey="otherPolicies" title="Other Policies" data={otherPolicies} theme={theme} />
          <Section sectionKey="organizationDetails" title="Organization Details" data={organizationDetails} theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default Job;
