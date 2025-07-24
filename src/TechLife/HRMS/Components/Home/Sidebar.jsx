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
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    path: "/dashboard",
  },
  { name: "Profile", icon: <UserCircle size={18} />, path: "/profile" },
  {
    name: "Attendance",
    icon: <CalendarCheck size={18} />,
    path: "/attendance",
  },
  { name: "My Leaves", icon: <FileText size={18} />, path: "/leaves" },
  { name: "My Team", icon: <Users size={18} />, path: "/my-teams" }, 
  { name: "My Projects", icon: <Database size={18} />, path: "/projects" },
  { name: "My Tasks", icon: <ListChecks size={18} />, path: "/tasks" },
  { name: "Employees", icon: <BadgePlus size={18} />, path: "/employees" },
  { name: "Chat", icon: <MessageCircle size={18} />, path: "/chat" },
  { name: "Tickets", icon: <FileText size={18} />, path: "/tickets" }, // Added Tickets
];

function Sidebar({ isSidebarOpen, setSidebarOpen, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-50 lg:hidden transition-opacity ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div
        style={{ boxShadow: "5px 0 5px -1px rgba(0,0,0,0.2)" }}
        className={`fixed top-0 left-0 h-full ${
          collapsed ? "w-20" : "w-60"
        } bg-white shadow-lg z-60 transform transition-all duration-200 ease-in-out ${
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