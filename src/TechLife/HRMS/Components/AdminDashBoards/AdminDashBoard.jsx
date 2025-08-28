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
import CombinedDashboard from './CombinedDashBoard';
const navItems = [
  { id: 'Admin', name: 'Admin', icon: BriefcaseIcon, component: CombinedDashboard },
  { id: 'attendance', name: 'Attendance', icon: CalendarDaysIcon, component: AttendancesDashboard },
  { id: 'leaves', name: 'Leaves', icon: SwatchIcon, component: LeavesDashboard },
];
const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Admin');
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const ActiveComponent = navItems.find(item => item.id === activeSection)?.component;
  return (
    <div className="relative flex flex-col lg:flex-row-reverse w-full min-h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - Positioned fixed to the right */}
      <div
        className={`fixed top-0 right-0 h-full bg-gray-100 text-white p-4 transition-all duration-300 border-l border-gray-200 ease-in-out flex-shrink-0 flex flex-col z-20
          ${isSidebarOpen ? 'w-52' : 'w-0 lg:w-20'} 
          ${isSidebarOpen ? 'block' : 'hidden lg:flex'} `} 
      >
        <div className="flex justify-end mb-8">
          <button
            onClick={toggleSidebar}
            className="bg-white text-gray-800 shadow-md p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? (
              <ChevronLeftIcon className="w-4 h-4" /> 
            ) : (
              <ChevronRightIcon className="w-4 h-4" /> 
            )}
          </button>
        </div>

        <div className={`font-bold mb-8 text-center text-gray-800 ${isSidebarOpen ? 'text-xl' : 'text-xl'}`}>
          {isSidebarOpen && <span>Menu</span>}
        </div>

        <nav className="flex flex-col space-y-4 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                // On mobile (less than 'lg' breakpoint), close sidebar after selection
                if (window.innerWidth < 1024) { 
                  setIsSidebarOpen(false);
                }
              }}
              className={`text-left text-lg p-3 rounded-lg flex items-center ${
                isSidebarOpen ? 'justify-start' : 'justify-center'
              }
              ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:bg-gray-300 text-black'
              }`}
              title={item.name}
            >
              <item.icon className={`w-8 h-8 ${isSidebarOpen ? 'mr-3' : ''}`} />
              {isSidebarOpen && <span>{item.name}</span>}
            </button>
          ))}
        </nav>
      </div>
      <div className={`flex-1 p-2 transition-all duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'mr-52' : 'mr-0 lg:mr-24'} `}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 capitalize">
          </h1>
          {!isSidebarOpen && ( 
             <button
               onClick={toggleSidebar}
               className="lg:hidden bg-white text-gray-800 shadow-md p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
               aria-label="Open sidebar"
             >
               <ChevronLeftIcon className="w-4 h-4" /> 
             </button>
           )}
        </div>
        <div className="flex-1 overflow-y-auto pb-4">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;