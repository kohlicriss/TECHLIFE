import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Users,
  Database,
  ListChecks,
  MessageCircle,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  BadgePlus,
  TicketCheck,
} from "lucide-react";
import { Context } from "../HrmsContext";
import axios from "axios";

// This is a simple skeleton loader component you can create
const SidebarSkeleton = () => (
  <div className="animate-pulse p-4">
    <div className="h-8 bg-gray-300 rounded mb-6"></div>
    <div className="space-y-4">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-300 rounded"></div>
      ))}
    </div>
    <div className="mt-10 h-8 bg-gray-300 rounded"></div>
  </div>
);

function Sidebar({ isSidebarOpen, setSidebarOpen, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New state for loading
  const location = useLocation();
  const { userData } = useContext(Context);
  const empId = userData?.employeeId;

  // Use useEffect to set a timeout for the skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1-second delay

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  const handleLogoutClick = () => {
    console.log("Clearing user data from localStorage...");
    localStorage.removeItem("logedempid");
    localStorage.removeItem("logedemprole");
    localStorage.removeItem("emppayload");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    console.log("User data cleared.");

    if (onLogout) {
      onLogout();
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: empId ? `/dashboard/${empId}` : "/dashboard",
    },
    { name: "Profile", icon: <UserCircle size={18} />, path:empId?`/profile/${empId}`: "/profile" },
    {
      name: "Attendance",
      icon: <CalendarCheck size={18} />,
      path: empId ? `/attendance/${empId}` : "/attendance",
    },
    { name: "My Leaves", icon: <FileText size={18} />, path: empId ? `/leaves/${empId}` : "/leaves" },
    { name: "My Team", icon: <Users size={18} />, path: empId ? `/my-teams/${empId}` : "/my-teams" },
    { name: "My Projects", icon: <Database size={18} />, path: empId ? `/projects/${empId}` : "/projects" },
    {
      name: "My Tasks",
      icon: <ListChecks size={18} />,
      path: empId ? `/tasks/${empId}` : "/tasks",
    },
    { name: "Employees", icon: <BadgePlus size={18} />, path: empId ? `/employees/${empId}` : "/employees" },
    { name: "Chat", icon: <MessageCircle size={18} />, path: empId ? `/chat/${empId}` : "/chat" },
    { name: "Tickets", icon: <TicketCheck size={18} />, path: "/tickets" },
  ];

  // Conditional rendering based on the loading state
  if (isLoading) {
    return (
      <div
        style={{ boxShadow: "5px 0 5px -1px rgba(0,0,0,0.2)" }}
        className={`fixed top-0 left-0 h-full w-60 bg-white shadow-lg z-60 transform transition-all duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:shadow-none pt-3`}
      >
        <SidebarSkeleton />
      </div>
    );
  }

  // Once isLoading is false, render the actual sidebar
  return (
    <>
      {/* Overlay for mobile view when sidebar is open */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-50 lg:hidden transition-opacity ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar container */}
      <div
        style={{ boxShadow: "5px 0 5px -1px rgba(0,0,0,0.2)" }}
        className={`fixed top-0 left-0 h-full ${
          collapsed ? "w-20" : "w-60"
        } bg-white shadow-lg z-60 transform transition-all duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:shadow-none pt-3`}
      >
        <div className="flex items-center justify-between px-4 mb-2">
          {/* Close button for mobile view */}
          <div className="lg:hidden">
            <button
              className="text-gray-600 hover:text-black"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          {/* Collapse/Expand button */}
          <div className="ml-auto">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="bg-gray-100 border rounded-full p-1 hover:bg-gray-200 transition"
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronLeft size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center ${
                  collapsed ? "justify-center" : "justify-start"
                } gap-3 px-4 py-1.5 transition rounded-md mx-2 ${
                  isActive
                    ? "bg-blue-500 text-white font-semibold"
                    : "text-gray-700 hover:bg-blue-100"
                }`}
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

          {/* Logout button section */}
          <div className="mt-10">
            <button
              onClick={handleLogoutClick}
              className={`flex items-center ${
                collapsed ? "justify-center" : "justify-start"
              } gap-3 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md w-full text-left`}
            >
              <LogOut size={18} />
              {!collapsed && <span>Log Out</span>}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;