import React, { useState, useContext, useEffect, useRef } from "react";
import { FiMenu, FiSearch, FiSettings, FiUser, FiLogOut } from "react-icons/fi";
import { Bell } from "lucide-react";
import logo from "../assets/anasol-logo.png";
import { Link, useLocation } from "react-router-dom";
import { Context } from "../HrmsContext";
import DarkModeToggle from "../Login/DarkModeToggle";

const NavbarSkeleton = ({ theme }) => (
  <header
    className={`${
      theme === "dark" ? "bg-gray-900" : "bg-white"
    } px-6 py-3 shadow-md flex items-center justify-between w-full fixed top-0 left-0 z-50 h-16 animate-pulse`}
  >
    <div className="flex items-center space-x-4">
      <div className="h-8 w-8 bg-gray-300 rounded-full md:hidden"></div>
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 bg-gray-300 rounded"></div>
        <div className="h-6 w-24 bg-gray-300 rounded"></div>
      </div>
      <div className="hidden md:flex flex-col ml-6 space-y-1">
        <div className="h-4 w-20 bg-gray-300 rounded"></div>
        <div className="h-3 w-16 bg-gray-300 rounded"></div>
      </div>
    </div>
    <div className="hidden md:flex relative w-[400px]">
      <div className="w-full h-9 bg-gray-300 rounded-md"></div>
    </div>
    <div className="flex items-center space-x-5">
      <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
      {/* ✅ ADD SKELETON FOR TOGGLE */}
      <div className="h-10 w-20 bg-gray-300 rounded-full hidden sm:block"></div>
      <div className="h-9 w-9 bg-gray-300 rounded-full"></div>
    </div>
  </header>
);

const Navbar = ({ setSidebarOpen }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { unreadCount, userData, theme, setTheme, setUserData } =
    useContext(Context);
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  // NEW: State to hold logged-in user's profile info from localStorage
  const [loggedInUserProfile, setLoggedInUserProfile] = useState({
    image: null,
    initials: "  "
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // NEW: Effect to get profile info from localStorage
  useEffect(() => {
    const userPayload = JSON.parse(localStorage.getItem("emppayload"));
    const userImage = localStorage.getItem("loggedInUserImage");

    const initials = (userPayload?.displayName || "  ")
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2);

    setLoggedInUserProfile({
      image: userImage,
      initials: initials,
    });
  }, [userData]); // Rerun when userData changes (e.g., on login) or on component mount

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const isNotificationsActive = location.pathname.startsWith(
    `/notifications/${userData?.employeeId}`
  );
  
  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    console.log(`Theme changed to: ${newTheme}`);
  };
  
  const handleProfileClick = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  if (isLoading) {
    return <NavbarSkeleton theme={theme} />;
  }
  
  return (
    <header
      className={`${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      } px-6 py-3 shadow-md flex items-center justify-between w-full fixed top-0 left-0 z-50 h-16`}
    >
      <div className="flex items-center space-x-4">
        <button
          className={`md:hidden text-2xl ${
            theme === "dark" ? "text-white" : "text-gray-700"
          }`}
          onClick={() => setSidebarOpen(true)}
        >
          <FiMenu />
        </button>
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <h1 className="text-xl font-bold text-blue-600">Anasol</h1>
        </div>
        <div className="hidden md:flex flex-col ml-6">
          <span
            className={`text-sm font-medium ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {userData?.fullName}
          </span>
          <span
            className={`text-xs ${
              theme === "dark" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {userData?.roles?.[0]}
          </span>
        </div>
      </div>
      <div className="hidden md:flex relative w-[400px]">
        <FiSearch
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            theme === "dark" ? "text-gray-400" : "text-gray-400"
          }`}
        />
        <input
          type="text"
          placeholder="Type to search"
          className={`w-full border rounded-md pl-10 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            theme === "dark"
              ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-black placeholder-gray-500"
          }`}
        />
      </div>
      <div className="flex items-center space-x-5">
        <Link
          to={`/notifications/${userData?.employeeId}`}
          className="relative"
        >
          <Bell
            size={22}
            className={
              isNotificationsActive
                ? "text-blue-600 fill-blue-100"
                : theme === "dark"
                ? "text-white hover:text-gray-300"
                : "text-gray-600 hover:text-black"
            }
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        {/* Dark Mode Toggle */}
        <div className="hidden sm:block">
          <DarkModeToggle 
            isDark={theme === 'dark'} 
            onToggle={handleThemeToggle}
          />
        </div>
       
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-300"
            }`}
            onClick={handleProfileClick}
          >
            {loggedInUserProfile.image ? (
              <img
                src={loggedInUserProfile.image}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className={`text-sm font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-600"
                }`}
              >
                {loggedInUserProfile.initials}
              </span>
            )}
          </div>
          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg z-[200] ${
                theme === "dark"
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="py-1">
                {/* Profile Option */}
                <Link
                  to={`/profile/${userData?.employeeId}`}
                  className={`flex items-center px-4 py-2 text-sm ${
                    theme === "dark"
                      ? "text-white hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setDropdownOpen(false)}
                >
                  <FiUser className="mr-3" size={16} />
                  View Profile
                </Link>
                <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} mt-1 pt-1 sm:hidden`}>
                  <div className={`flex items-center justify-between px-4 py-2 text-sm ${
                    theme === 'dark' ? 'text-white' : 'text-gray-700'
                  }`}>
                    <div className="flex items-center">
                      <FiSettings className="mr-3" size={16} />
                      Dark Mode
                    </div>
                    <DarkModeToggle 
                      isDark={theme === 'dark'} 
                      onToggle={handleThemeToggle}
                    />
                  </div>
                </div>
               
                {/* Logout Option */}
                <div
                  className={`border-t ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  } mt-1 pt-1`}
                >
                  <button
                    className={`w-full flex items-center px-4 py-2 text-sm text-left ${
                      theme === "dark"
                        ? "text-red-400 hover:bg-gray-700"
                        : "text-red-600 hover:bg-gray-100"
                    }`}
                    onClick={async () => {
                      setDropdownOpen(false);
                      try {
                        await fetch(
                          "http://hrms.anasolConsultancyservices.com/api/auth/logout",
                          {
                            method: "POST",
                            credentials: "include",
                          }
                        );
                      } catch (error) {
                        console.error(error);
                      } finally {
                        localStorage.clear();
                        setUserData(null);
                      }
                    }}
                  >
                    <FiLogOut className="mr-3" size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
