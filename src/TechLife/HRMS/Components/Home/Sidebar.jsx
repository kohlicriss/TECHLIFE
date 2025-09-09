import React, { useState } from "react";
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
import { useContext } from 'react';

 
function Sidebar({ isSidebarOpen, setSidebarOpen, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
 const { userData, setUserData } = useContext(Context);
  const empId = userData?.employeeId;
// Sidebar.jsx
const role = Array.isArray(userData?.roles) ? userData.roles[0] : userData?.roles || "";
const normalizedRole = typeof role === "string" ? role.replace("ROLE_", "").toUpperCase() : "";

 
  const handleLogoutClick = async () => {
    try {
      await fetch("http://hrms.anasolconsultancyservices.com/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Backend logout failed, proceeding with client-side cleanup.", error);
    } finally {
      localStorage.clear();
      setUserData(null);
      if (onLogout) {
        onLogout();
      }
    }
  };
 
  const navItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: empId ? `/dashboard/${empId}` : "/dashboard",
    },
    { name: "Profile", icon: <UserCircle size={18} />, path: empId ? `/profile/${empId}` : "/profile" },
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
   { name: "Tickets", icon: <TicketCheck size={18} />, path: empId? `/tickets/employee/${empId}` : "/tickets" },
//       {
//   name: "Tickets",
//   icon: <TicketCheck size={18} />,
//   path:
//     normalizedRole === "EMPLOYEE"
//       ? (empId ? `/tickets/employee/${empId}` : "/tickets")
//       : "/tickets", // Admin/HR/Manager see global tickets
// }

  ];
 
  return (
    <>
      <div
        className={`fixed inset-0  bg-opacity-100 z-[150] lg:hidden transition-opacity ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
 
      <div
        style={{ boxShadow: "5px 0 5px -1px rgba(0,0,0,0.2)" }}
        className={`fixed top-0 left-0 h-full ${
          collapsed ? "w-20" : "w-60"
        } bg-white shadow-lg z-[160] transform transition-all duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:shadow-none pt-3`}
      >
        <div className="flex items-center justify-between px-4 mb-2">
          <div className="lg:hidden">
            <button
              className="text-gray-600 hover:text-black"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
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
 
          <div className="mt-10">
            <button
              onClick={onLogout}
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
 