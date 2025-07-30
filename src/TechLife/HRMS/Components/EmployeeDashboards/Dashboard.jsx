import React, { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon, 
  SwatchIcon, 
  RocketLaunchIcon, 
  BriefcaseIcon 
} from '@heroicons/react/24/solid';
import AttendancesDashboard from './AttendancesDashboard';
import LeavesDashboard from './LeavesDashboard';
import PerformanceDashboard from './PerformanceDashBoard';
import ProjectDashboard from './ProjectDashBoard';

// Define your navigation items with their corresponding icons and components
const navItems = [
  { id: 'attendance', name: 'Attendance', icon: CalendarDaysIcon, component: AttendancesDashboard },
  { id: 'leaves', name: 'Leaves', icon: SwatchIcon, component: LeavesDashboard },
  { id: 'Performance', name: 'Performance', icon: RocketLaunchIcon, component: PerformanceDashboard },
  { id: 'Projects', name: 'Projects', icon: BriefcaseIcon, component: ProjectDashboard },
];

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('attendance'); // Set initial active section

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Find the component to render based on the activeSection
  const ActiveComponent = navItems.find(item => item.id === activeSection)?.component;

  return (
    <div style={{ width: '100%', minHeight: '100vh' }} className="flex bg-gray-100  overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 p-2 transition-all duration-300 ease-in-out flex flex-col">
        {/* Header with Toggle Button (moved to sidebar for right-side placement) */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 capitalize">
            {activeSection ? `${activeSection} Overview` : 'Dashboard Overview'}
          </h1>
        </div>

        {/* Section Content */}
        <div >
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-gray-100 text-white p-6 transition-all duration-300 border border-black-100 ease-in-out flex-shrink-0 ${
          isSidebarOpen ? 'w-52' : 'w-24' // Adjust width based on sidebar state
        }`}
      >
        {/* Toggle Button */}
        <div className="flex justify-start mb-8">
          <button
            onClick={toggleSidebar}
            className="bg-white text-gray-800 shadow-md p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? (
              <ChevronRightIcon className="w-6 h-6" />
            ) : (
              <ChevronLeftIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className={`font-bold mb-8 text-center ${isSidebarOpen ? 'text-2xl' : 'text-xl'}`}>
         
        </div>

        <nav className="flex flex-col space-y-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`text-left text-lg p-3 rounded-lg flex items-center ${
                isSidebarOpen ? 'justify-start' : 'justify-center'
              }
                ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'hover:bg-gray-300 text-black'
                }`}
              title={item.name} // Add title for tooltip on collapsed icons
            >
              <item.icon className={`w-8 h-8 ${isSidebarOpen ? 'mr-3' : ''}`} />
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Dashboard;