import React from 'react';

const jobDetails = [
  { label: "EMPLOYEE NUMBER", value: "ACs123" },
  { label: "DATE OF JOINING", value: "02 May 2025" },
  { label: "JOB TITLE - PRIMARY", value: "Associate Software Engineer" },
  { label: "JOB TITLE - SECONDARY", value: "-" },
  { label: "IN PROBATION?", value: "Yes 02 May 2025 - 02 Nov 2025", note: "Default Probation Policy" },
  { label: "NOTICE PERIOD", value: "-" },
  { label: "WORKER TYPE", value: "Intern" },
  { label: "TIME TYPE", value: "Full Time" },
  { label: "CONTRACT STATUS", value: "In Contract", note: "02 May 2025", status: "active" },
];

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

const Section = ({ title, data, children }) => (
  <div className="bg-white rounded-lg p-6">
    <h2 className="text-lg font-medium mb-4">{title}</h2>
    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
      {data.map((item, index) => (
        <div key={index}>
          <label className="block text-sm text-gray-500">{item.label}</label>
          {item.status === "active" ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{item.value}</span>
              {item.note && <span className="text-gray-500">{item.note}</span>}
            </div>
          ) : (
            <>
              <p>{item.value}</p>
              {item.note && <p className="text-sm text-gray-500">{item.note}</p>}
            </>
          )}
        </div>
      ))}
      {children}
    </div>
  </div>
);

const Job = () => {
  return (
    <div className="p-6 space-y-6">
      <Section title="Job Details" data={jobDetails} />

      <Section title="Employee Time" data={employeeTime}>
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
            <span className="text-sm">Disable attendance tracking</span>
          </div>
        </div>
      </Section>

      <Section title="Other" data={otherPolicies} />
      <Section title="Organization" data={organizationDetails} />
    </div>
  );
};

export default Job;
