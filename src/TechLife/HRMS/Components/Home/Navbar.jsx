import React from "react";
import { FiMenu, FiSearch } from "react-icons/fi";
import { Bell } from "lucide-react";
import logo from "../assets/anasol-logo.png";
import { Link, useLocation } from "react-router-dom"; 
import { useContext } from "react";
import { Context } from "../HrmsContext";

const Navbar = ({ setSidebarOpen, currentUser }) => {
  const name = currentUser?.name || "Guest";
  const designation = currentUser?.designation || "Guest";
  const { unreadCount,userData } = useContext(Context);

  const location = useLocation();
  const isNotificationsActive = location.pathname === "/notifications";

  return (
    <header className="bg-white px-6 py-3 shadow-md flex items-center justify-between w-full fixed top-0 left-0 z-50 h-16">
      <div className="flex items-center space-x-4">
        <button
          className="md:hidden text-gray-700 text-2xl"
          onClick={() => setSidebarOpen(true)}
        >
          <FiMenu />
        </button>

        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <h1 className="text-xl font-bold text-blue-600">Anasol</h1>
        </div>

        <div className="hidden md:flex flex-col ml-6">
          <span className="text-sm font-medium text-gray-900">{userData?.employeeId}</span>
          <span className="text-xs text-gray-500">{userData?.roles[0]}</span>
        </div>
      </div>

      <div className="hidden md:flex relative w-[400px]">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Type to search"
          className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center space-x-5">
        <Link to="/notifications" className="relative">
          <Bell
            size={22}
            className={
              isNotificationsActive
                ? "text-blue-600 fill-blue-100" 
                : "text-gray-600 hover:text-black" 
            }
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="w-9 h-9 bg-gray-300 rounded-full overflow-hidden">
          <img
            src={currentUser?.avatar || "https://i.pravatar.cc/100"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
