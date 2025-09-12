import React, { useState } from 'react';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    CalendarDaysIcon,
    SwatchIcon,
    RocketLaunchIcon,
    BriefcaseIcon
} from '@heroicons/react/24/solid';

// Assuming these components exist
import AttendancesDashboard from './AttendancesDashboard';
import LeavesDashboard from './LeavesDashboard';
import CombinedDashboard from './CombinedDashBoard';

const navItems = [
    { id: 'Admin', name: 'Admin', icon: BriefcaseIcon, component: CombinedDashboard },
    { id: 'attendance', name: 'Attendance', icon: CalendarDaysIcon, component: AttendancesDashboard },
    { id: 'leaves', name: 'Leaves', icon: SwatchIcon, component: LeavesDashboard },
];

const Dashboard = () => {
    const [isNavbarOpen, setIsNavbarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('Admin');
    const toggleNavbar = () => setIsNavbarOpen(!isNavbarOpen);

    const ActiveComponent = navItems.find(item => item.id === activeSection)?.component;

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Navbar - Positioned at the top */}
            <div
                className={`flex justify-between items-center bg-white text-gray-800 px-4 py-2 border-b border-gray-200 shadow-md transition-all duration-300 ease-in-out z-20`}
            >
                <div className="flex items-center">
                    <RocketLaunchIcon className="w-8 h-8 mr-2 text-blue-600" />
                    <span className="font-bold text-xl">Dashboard</span>
                </div>

                {/* Mobile Menu Button */}
                <div className="lg:hidden">
                    <button
                        onClick={toggleNavbar}
                        className="p-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        aria-label={isNavbarOpen ? 'Close menu' : 'Open menu'}
                    >
                        {isNavbarOpen ? (
                            <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                        ) : (
                            <ChevronRightIcon className="w-6 h-6 text-gray-800" />
                        )}
                    </button>
                </div>

                {/* Nav Links - Toggles on mobile */}
                <nav
                    className={`flex-col lg:flex lg:flex-row lg:space-x-4 lg:space-y-0 space-y-2 absolute top-full left-0 w-full bg-white lg:relative lg:w-auto p-4 lg:p-0 transition-all duration-300 ease-in-out
                    ${isNavbarOpen ? 'block' : 'hidden'} `}
                >
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveSection(item.id);
                                setIsNavbarOpen(false); // Close navbar on selection
                            }}
                            className={`text-lg p-2 rounded-lg flex items-center justify-start lg:justify-center ${
                                activeSection === item.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'hover:bg-gray-200 text-gray-800'
                            }`}
                            title={item.name}
                        >
                            <item.icon className={`w-6 h-6 mr-2`} />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main content area */}
            <div className="flex-1 p-6 overflow-y-auto">
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
};

export default Dashboard;