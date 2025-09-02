import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { publicinfoApi } from '../../../../../axiosInstance';
import { 
  IoBriefcaseOutline, 
  IoTimeOutline, 
  IoDocumentTextOutline, 
  IoBusinessOutline, 
  IoCheckmarkCircle, 
  IoWarning,
  IoCalendarOutline,
  IoPersonOutline
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
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    title: 'Job Details',
    description: 'Employment information and job specifications'
  },
  employeeTime: {
    icon: IoTimeOutline,
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    title: 'Employee Time',
    description: 'Work schedule and attendance policies'
  },
  otherPolicies: {
    icon: IoDocumentTextOutline,
    color: 'from-orange-500 to-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    title: 'Other Policies',
    description: 'Additional company policies and guidelines'
  },
  organizationDetails: {
    icon: IoBusinessOutline,
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    title: 'Organization Details',
    description: 'Departmental and reporting structure'
  },
};

const DetailItem = ({ label, value, note, status }) => (
  <div className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-100 
                  hover:shadow-md transition-all duration-300 hover:scale-105">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
          {label}
        </span>
        {status === "active" ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-900 font-semibold">{value}</span>
            </div>
            {note && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {note}
              </span>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-900 font-semibold leading-relaxed">
              {value || (
                <span className="text-gray-400 italic">Not provided</span>
              )}
            </p>
            {note && (
              <p className="text-xs text-gray-500 mt-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md inline-block">
                {note}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Enhanced Section component
const Section = ({ sectionKey, title, data, children }) => {
  const config = sectionConfig[sectionKey];
  const IconComponent = config.icon;
  const hasData = data && data.length > 0;
  
  return (
    <div className={`bg-white border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 
                   overflow-hidden group hover:scale-[1.02] ${config.borderColor} mb-8`}>
      {/* Card Header */}
      <div className={`px-8 py-6 ${config.bgColor} border-b-2 ${config.borderColor} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-xl shadow-md transform group-hover:scale-110 transition-transform duration-300">
              <IconComponent className={`w-8 h-8 ${config.textColor}`} />
            </div>
            <div>
              <h4 className={`text-xl font-bold ${config.textColor} flex items-center space-x-2`}>
                <span>{title}</span>
                {hasData && (
                  <div className="flex items-center space-x-1">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Active
                    </span>
                  </div>
                )}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{config.description}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-8">
        {hasData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {data.map((item, index) => (
              <DetailItem 
                key={index} 
                label={item.label} 
                value={item.value} 
                note={item.note} 
                status={item.status} 
              />
            ))}
            {children}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <IconComponent className={`w-10 h-10 ${config.textColor} opacity-50`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No {title} Available</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              {title} information is not currently available or configured.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Progress Indicator Component
const ProgressIndicator = ({ completedSections, totalSections }) => {
  const percentage = (completedSections / totalSections) * 100;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Job Information</h3>
        <span className="text-sm font-medium text-gray-600">
          {completedSections}/{totalSections} Sections
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{percentage.toFixed(0)}% Complete</span>
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

// Skeleton Loading Component
const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-pulse">
    <div className="p-6 bg-gray-100 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
        <div>
          <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-48"></div>
        </div>
      </div>
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-xl">
            <div className="h-3 bg-gray-300 rounded w-20 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Enhanced Toggle Switch Component
const AttendanceToggle = () => {
  const [isDisabled, setIsDisabled] = useState(false);
  
  return (
    <div className="col-span-2 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-1">Attendance Tracking</h4>
          <p className="text-xs text-gray-600">Control automated attendance monitoring</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer group">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={isDisabled}
            onChange={(e) => setIsDisabled(e.target.checked)}
          />
          <div className="w-14 h-8 bg-gray-200 rounded-full peer transition-all duration-300 
                         peer-checked:after:translate-x-6 peer-checked:after:border-white 
                         after:content-[''] after:absolute after:top-1 after:left-1 
                         after:bg-white after:border-gray-300 after:border after:rounded-full 
                         after:h-6 after:w-6 after:transition-all after:shadow-md
                         peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-indigo-600
                         group-hover:shadow-lg">
          </div>
          <span className="ml-3 text-sm font-medium text-gray-700">
            {isDisabled ? 'Disabled' : 'Enabled'}
          </span>
        </label>
      </div>
      {isDisabled && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <IoWarning className="w-4 h-4 text-yellow-600" />
            <p className="text-xs text-yellow-700">
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
  const [jobdetails, setJobDetails] = useState(null);
  const [displayJobDetails, setDisplayJobDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completionStats, setCompletionStats] = useState({ completed: 0, total: 4 });

  // Fetch job details from the API
  useEffect(() => {
    let jobDetailsFetch = async () => {
      try {
        let response = await publicinfoApi.get(`employee/${empID}/job/details`);
        console.log("job data : ", response.data);
        setJobDetails(response.data);
      } catch (error) {
        console.log("job error : ", error);
      } finally {
        setIsLoading(false);
      }
    };
    jobDetailsFetch();
  }, [empID]);

  // Format the fetched data for display
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

      // Calculate completion stats
      const sections = [jobdetails, employeeTime, otherPolicies, organizationDetails];
      const completed = sections.filter(section => section && section.length > 0).length;
      setCompletionStats({ completed: completed || 1, total: 4 });
    }
  }, [jobdetails]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <IoBriefcaseOutline className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Job Information</h2>
            <p className="text-gray-600">Fetching employment details and policies...</p>
            <div className="flex justify-center space-x-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`} 
                     style={{ animationDelay: `${i * 0.2}s` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!displayJobDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <IoWarning className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Job Details</h2>
            <p className="text-gray-600">Job information is not available or there was an error loading the data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Enhanced Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 
                        rounded-2xl text-white text-2xl mb-6 shadow-xl">
            <IoBriefcaseOutline />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            Job Information Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Comprehensive employment details, policies, and organizational structure information.
          </p>
        </div>

        {/* Progress Section */}
        <div className="mb-12">
          <ProgressIndicator 
            completedSections={completionStats.completed} 
            totalSections={completionStats.total} 
          />
        </div>

        {/* Job Sections */}
        <div className="space-y-8">
          {isLoading ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <Section sectionKey="jobDetails" title="Job Details" data={displayJobDetails} />

              <Section sectionKey="employeeTime" title="Employee Time" data={employeeTime}>
                <AttendanceToggle />
              </Section>

              <Section sectionKey="otherPolicies" title="Other Policies" data={otherPolicies} />
              <Section sectionKey="organizationDetails" title="Organization Details" data={organizationDetails} />
            </>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Job;
