import React, { useState, useContext } from "react";
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
  UserRoundCog,
} from "lucide-react";
import { Context } from "../HrmsContext";
import { FaUsers } from "react-icons/fa";

function Sidebar({ isSidebarOpen, setSidebarOpen, onLogout, chatUnreadCount }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { userData, setUserData, theme } = useContext(Context);
  const empId = userData?.employeeId;
  const userRole = userData?.roles?.[0]?.toUpperCase();

  const handleLogoutClick = async () => {
    try {
      await fetch("https://hrms.anasolConsultancyservices.com/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Backend logout failed, proceeding with client-side cleanup.", error);
    } finally {
      [
        "accessToken","emppayload","logedempid","logedemprole",
        "loggedInUserImage","employeeFormData","aboutResponses",
        "loggedUserImage","permissionsData"
      ].forEach(key => {
        localStorage.removeItem(key);
      });
      setUserData(null);
      if (onLogout) onLogout();
    }
  };

  const navItems = [
    { name: "Profile", icon: <UserCircle size={18} />, path: empId ? `/profile/${empId}` : "/profile" },
    { name: "Attendance", icon: <CalendarCheck size={18} />, path: empId ? `/attendance/${empId}` : "/attendance" },
    { name: "My Leaves", icon: <FileText size={18} />, path: empId ? `/leaves/${empId}` : "/leaves" },
    { name: "My Team", icon: <Users size={18} />, path: empId ? `/my-teams/${empId}` : "/my-teams" },
    { name: "My Projects", icon: <Database size={18} />, path: empId ? `/projects/${empId}` : "/projects" },
    { name: "My Tasks", icon: <ListChecks size={18} />, path: empId ? `/tasks/${empId}` : "/tasks" },
    { name: "Employees", icon: <BadgePlus size={18} />, path: empId ? `/employees/${empId}` : "/employees" },
    { name: "Chat", icon: <MessageCircle size={18} />, path: empId ? `/chat/${empId}` : "/chat", notification: chatUnreadCount > 0 },
    { name: "Tickets", icon: <TicketCheck size={18} />, path: empId ? `/tickets/employee/${empId}` : "/tickets" }
  ];

  if (userRole === 'ADMIN') {
    navItems.push({ name: "Departments", icon: <Database size={18} />, path: empId ? `/departments/${empId}` : "/departments" });
    navItems.push({ name: "Permissions", icon: <UserRoundCog size={18} />, path: empId ? `/permissions/${empId}` : "/permissions" });
    navItems.push({ name: "ADMIN", icon: <FaUsers size={18} />, path: empId ? `/combined-dashboard/${empId}` : "/combined-dashboard" });
  }
  if (userRole === 'HR') {
    navItems.push({ name: "HR", icon: <FaUsers size={18} />, path: empId ? `/combined-dashboard/${empId}` : "/combined-dashboard" });
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-opacity-50 z-40 lg:hidden transition-opacity ${isSidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />
      <div
        style={{ boxShadow: "5px 0 5px -1px rgba(0,0,0,0.2)" }}
        className={`fixed top-0 left-0 h-full ${collapsed ? "w-20" : "w-60"} ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} shadow-lg z-[150] transform transition-all duration-200 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:shadow-none pt-3 flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 mb-2 flex-shrink-0">
          <div className="lg:hidden">
            <button
              className={theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-600 hover:text-black'}
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`border rounded-full p-1 transition ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white'
                : 'bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-600'
                }`}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-4">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center cursor-pointer ${collapsed ? "justify-center" : "justify-start"} gap-3 px-4 py-1.5 transition rounded-md mx-2 relative ${isActive
                    ? "bg-blue-500 text-white font-semibold"
                    : theme === 'dark'
                      ? "text-white hover:bg-gray-800"
                      : "text-gray-700 hover:bg-blue-100"
                    }`}
                >
                  {item.icon}
                  {!collapsed && <span>{item.name}</span>}
                  {!collapsed && item.notification && (
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                  {collapsed && item.notification && (
                    <span className="absolute right-2 top-2 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-4 mb-4 px-2 flex-shrink-0">
          <button
            onClick={handleLogoutClick}
            className={`flex items-center cursor-pointer ${collapsed ? "justify-center" : "justify-start"} gap-3 px-4 py-2 rounded-md w-full text-left ${theme === 'dark' ? 'text-red-400 hover:bg-gray-800' : 'text-red-600 hover:bg-red-50'}`}
          >
            <LogOut size={18} />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
