import React, { useState, useContext, useEffect, useRef } from "react";
import { FiMenu, FiSearch, FiSettings, FiUser, FiLogOut } from "react-icons/fi";
import { Bell } from "lucide-react";
import logo from "../assets/anasol-logo.png";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Context } from "../HrmsContext";
import DarkModeToggle from "../Login/DarkModeToggle";
import "./Navbar.css";

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
      <div className="h-10 w-20 bg-gray-300 rounded-full hidden sm:block"></div>
      <div className="h-9 w-9 bg-gray-300 rounded-full"></div>
    </div>
  </header>
);

const Navbar = ({ setSidebarOpen, onLogout }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Search suggestions states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  
  const {
    unreadCount,
    userData,
    theme,
    setTheme,
    setUserData,
    isChatWindowVisible,
    globalSearch,
    setGlobalSearch
  } = useContext(Context);

  const location = useLocation();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Enhanced search suggestions with content-based navigation and scrolling
  const searchSuggestions = [
    // Task Management
    { 
      label: "task", 
      path: `/tasks/${userData?.employeeId}`,
      scrollTo: null,
      keywords: ["task", "tasks", "task management", "todo", "assignments", "work items"]
    },
    { 
      label: "tasks", 
      path: `/tasks/${userData?.employeeId}`,
      scrollTo: null,
      keywords: ["task", "tasks", "task management", "todo", "assignments", "work items"]
    },
    
    // Chat/Communication
    { 
      label: "chat", 
      path: `/chat/${userData?.employeeId}`,
      scrollTo: null,
      keywords: ["chat", "chatting", "messages", "conversation", "communication"]
    },
    
    // Profile Content-Based Suggestions
    { 
      label: "voter card", 
      path: `/profile/${userData?.employeeId}/documents`,
      scrollTo: "voter-section",
      keywords: ["voter", "voter card", "voter id", "voting", "electoral", "identity"]
    },
    { 
      label: "aadhaar card", 
      path: `/profile/${userData?.employeeId}/documents`,
      scrollTo: "aadhaar-section", 
      keywords: ["aadhaar", "aadhar", "aadhaar card", "identity", "government id"]
    },
    { 
      label: "pan card", 
      path: `/profile/${userData?.employeeId}/documents`,
      scrollTo: "pan-section",
      keywords: ["pan", "pan card", "tax", "permanent account number"]
    },
    { 
      label: "passport", 
      path: `/profile/${userData?.employeeId}/documents`,
      scrollTo: "passport-section",
      keywords: ["passport", "travel", "international", "travel document"]
    },
    { 
      label: "driving license", 
      path: `/profile/${userData?.employeeId}/documents`,
      scrollTo: "drivingLicense-section",
      keywords: ["driving", "license", "driving license", "vehicle", "permit"]
    },
    
    // Profile Sections
    { 
      label: "primary details", 
      path: `/profile/${userData?.employeeId}/profile`,
      scrollTo: "primaryDetails-section",
      keywords: ["primary", "personal", "basic", "details", "information"]
    },
    { 
      label: "contact details", 
      path: `/profile/${userData?.employeeId}/profile`,
      scrollTo: "contactDetails-section",
      keywords: ["contact", "phone", "email", "mobile", "communication"]
    },
    { 
      label: "address", 
      path: `/profile/${userData?.employeeId}/profile`,
      scrollTo: "address-section",
      keywords: ["address", "location", "home", "residence", "street"]
    },
    { 
      label: "education", 
      path: `/profile/${userData?.employeeId}/profile`,
      scrollTo: "education-section",
      keywords: ["education", "degree", "qualification", "university", "college", "study"]
    },
    { 
      label: "experience", 
      path: `/profile/${userData?.employeeId}/profile`,
      scrollTo: "experience-section",
      keywords: ["experience", "work", "job", "career", "employment", "history"]
    },
    
    // Achievements
    { 
      label: "achievements", 
      path: `/profile/${userData?.employeeId}/achievements`,
      scrollTo: null,
      keywords: ["achievements", "certifications", "awards", "accomplishments", "certificates"]
    },
    { 
      label: "certifications", 
      path: `/profile/${userData?.employeeId}/achievements`,
      scrollTo: null,
      keywords: ["certifications", "certificates", "achievements", "credentials", "qualifications"]
    },
    
    // General Navigation
    { 
      label: "dashboard", 
      path: `/admin-dashboard/${userData?.employeeId}`,
      scrollTo: null,
      keywords: ["dashboard", "overview", "summary", "admin", "home"]
    },
    { 
      label: "profile", 
      path: `/profile/${userData?.employeeId}`,
      scrollTo: null,
      keywords: ["profile", "my profile", "personal", "account"]
    },
    { 
      label: "notifications", 
      path: `/notifications/${userData?.employeeId}`,
      scrollTo: null,
      keywords: ["notifications", "alerts", "updates", "messages", "news"]
    },
    { 
      label: "employees", 
      path: `/employees/${userData?.employeeId}`,
      scrollTo: null,
      keywords: ["employees", "staff", "team", "colleagues", "workforce"]
    }
  ];

  const [loggedInUserProfile, setLoggedInUserProfile] = useState({
    image: null,
    initials: "  ",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const userPayload = JSON.parse(localStorage.getItem("emppayload"));
    const userImage = localStorage.getItem("loggedInUserImage");
    const initials = (userPayload?.displayName || "  ")
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2);
    setLoggedInUserProfile({ image: userImage, initials: initials });
  }, [userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fixed smooth scrolling function with proper element finding
  const smoothScrollToElement = (elementId, offset = 100) => {
    setTimeout(() => {
      console.log(`Searching for element: ${elementId}`);
      
      // Multiple search strategies
      let element = null;
      
      // Strategy 1: Direct ID
      element = document.getElementById(elementId);
      if (element) {
        console.log(`Found element by ID: ${elementId}`);
      } else {
        // Strategy 2: Data attribute
        element = document.querySelector(`[data-section="${elementId}"]`);
        if (element) {
          console.log(`Found element by data-section: ${elementId}`);
        } else {
          // Strategy 3: Class name
          element = document.querySelector(`[class*="${elementId}"]`);
          if (element) {
            console.log(`Found element by class: ${elementId}`);
          } else {
            // Strategy 4: Text content search (fixed version)
            const searchTerm = elementId.replace('-section', '').replace(/([A-Z])/g, ' $1').toLowerCase();
            console.log(`Searching for text content: ${searchTerm}`);
            
            // Search in headings
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            for (let heading of headings) {
              if (heading.textContent.toLowerCase().includes(searchTerm)) {
                element = heading;
                console.log(`Found element by heading text: ${heading.textContent}`);
                break;
              }
            }
            
            // Search in other elements if not found in headings
            if (!element) {
              const allElements = document.querySelectorAll('div, section, article, span, p, label');
              for (let el of allElements) {
                if (el.textContent.toLowerCase().includes(searchTerm)) {
                  element = el;
                  console.log(`Found element by text content: ${el.textContent.substring(0, 50)}...`);
                  break;
                }
              }
            }
            
            // Strategy 5: Search by title attribute
            if (!element) {
              element = document.querySelector(`[title*="${searchTerm}"]`);
              if (element) {
                console.log(`Found element by title attribute: ${element.getAttribute('title')}`);
              }
            }
          }
        }
      }

      if (element) {
        // Calculate position
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const offsetPosition = absoluteElementTop - offset;

        // Smooth scroll
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Add highlight effect
        element.classList.add('highlight-search');
        setTimeout(() => {
          element.classList.remove('highlight-search');
        }, 2000);

        console.log(`Successfully scrolled to: ${elementId}`);
      } else {
        console.log(`Element not found: ${elementId}`);
        
        // Fallback - scroll to top of page
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 200); // Increased delay to ensure page is fully loaded
  };

  // Handle search input change
  const handleGlobalSearch = (e) => {
    const searchValue = e?.target?.value;
    setGlobalSearch(searchValue);
    console.log("Current search:", searchValue);

    if (searchValue.length > 0) {
      // Enhanced filtering with better matching
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.keywords.some(keyword =>
          keyword.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
      
      // Sort by relevance - exact matches first, then partial matches
      const sortedFiltered = filtered.sort((a, b) => {
        const aExactMatch = a.keywords.some(keyword => 
          keyword.toLowerCase() === searchValue.toLowerCase()
        );
        const bExactMatch = b.keywords.some(keyword => 
          keyword.toLowerCase() === searchValue.toLowerCase()
        );
        
        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
        
        return a.label.length - b.label.length; // Shorter labels first
      });
      
      // Remove duplicates based on path and scrollTo combination
      const uniqueFiltered = sortedFiltered.filter((suggestion, index, self) =>
        index === self.findIndex((s) => 
          s.path === suggestion.path && s.scrollTo === suggestion.scrollTo
        )
      );
      
      setFilteredSuggestions(uniqueFiltered);
      setShowSuggestions(uniqueFiltered.length > 0);
      setActiveSuggestion(0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  // Handle suggestion click with enhanced navigation
  const handleSuggestionClick = (suggestion) => {
    console.log("Suggestion clicked:", suggestion.label);
    console.log("Navigating to:", suggestion.path);
    
    setGlobalSearch(suggestion.label);
    setShowSuggestions(false);
    setFilteredSuggestions([]);
    
    if (suggestion.path && userData?.employeeId) {
      // Check if we're already on the target page
      const currentPath = location.pathname;
      const targetPath = suggestion.path;
      
      if (currentPath === targetPath && suggestion.scrollTo) {
        // Same page, just scroll
        smoothScrollToElement(suggestion.scrollTo);
        console.log(`Scrolling to: ${suggestion.scrollTo}`);
      } else {
        // Different page, navigate then scroll
        navigate(suggestion.path);
        
        if (suggestion.scrollTo) {
          // Wait for navigation to complete, then scroll
          setTimeout(() => {
            smoothScrollToElement(suggestion.scrollTo);
          }, 500); // Increased delay for navigation
          
          console.log(`Mapsd to: ${suggestion.path}, will scroll to: ${suggestion.scrollTo}`);
        }
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.keyCode === 40) { // Down arrow
      e.preventDefault();
      if (activeSuggestion < filteredSuggestions.length - 1) {
        setActiveSuggestion(activeSuggestion + 1);
      }
    } else if (e.keyCode === 38) { // Up arrow
      e.preventDefault();
      if (activeSuggestion > 0) {
        setActiveSuggestion(activeSuggestion - 1);
      }
    } else if (e.keyCode === 13) { // Enter key
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        handleSuggestionClick(filteredSuggestions[activeSuggestion]);
      }
    } else if (e.keyCode === 27) { // Escape key
      setShowSuggestions(false);
    }
  };

  const isNotificationsActive = location.pathname.startsWith(
    `/notifications/${userData?.employeeId}`
  );
  
  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const handleProfileClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (isLoading) {
    return <NavbarSkeleton theme={theme} />;
  }

  return (
    <>
      {/* Add custom CSS for highlight effect */}
      <style jsx>{`
        .highlight-search {
          animation: highlightPulse 2s ease-in-out;
          border: 2px solid #3b82f6 !important;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5) !important;
          border-radius: 8px !important;
          transition: all 0.3s ease !important;
        }
        
        @keyframes highlightPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
        }
      `}</style>
      
      <header
        className={`
                ${theme === "dark" ? "bg-gray-900" : "bg-white"}
                px-6 py-3 shadow-md items-center justify-between w-full fixed top-0 left-0 z-50 h-16
                ${isChatWindowVisible ? "hidden md:flex" : "flex"}
              `}
      >
        <div className="flex items-center space-x-4">
          <button
            className={`lg:hidden text-2xl ${
              theme === "dark" ? "text-white" : "text-gray-700"
            }`}
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu />
          </button>
          <div
            onClick={() => {
              navigate(`/profile/${userData?.employeeId}`);
            }}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <img src={logo} alt="Logo" className="h-8 w-auto" />
            <h1 className="text-xl font-bold text-blue-600 name">Anasol</h1>
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

        {/* Enhanced Search Bar with Content Navigation */}
        <div className="hidden md:flex relative w-[400px]" ref={searchRef}>
          <FiSearch
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 z-10 ${
              theme === "dark" ? "text-gray-400" : "text-gray-400"
            }`}
          />
          <input
            value={globalSearch}
            onChange={handleGlobalSearch}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Search content, voter card, achievements..."
            className={`w-full border rounded-md pl-10 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === "dark"
                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-black placeholder-gray-500"
            }`}
          />
          
          {/* Enhanced Suggestions Dropdown with Content Navigation */}
          {showSuggestions && (
            <div
              className={`absolute top-full left-0 right-0 mt-1 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto ${
                theme === "dark"
                  ? "bg-gray-800 border border-gray-600"
                  : "bg-white border border-gray-300"
              }`}
            >
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.path}-${suggestion.scrollTo || 'nav'}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-4 py-3 cursor-pointer text-sm transition-all duration-150 border-l-4 ${
                    index === activeSuggestion
                      ? theme === "dark"
                        ? "bg-blue-600 text-white border-blue-400"
                        : "bg-blue-50 text-blue-900 border-blue-500"
                      : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-700 hover:text-white border-transparent hover:border-gray-600"
                      : "text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-300"
                  } ${index === 0 ? "rounded-t-md" : ""} ${
                    index === filteredSuggestions.length - 1 ? "rounded-b-md" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <FiSearch className="inline mr-3 flex-shrink-0" size={14} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium capitalize truncate">
                          {suggestion.label}
                        </span>
                        {suggestion.scrollTo && (
                          <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                            index === activeSuggestion
                              ? theme === "dark" 
                                ? "bg-blue-500 text-blue-100" 
                                : "bg-blue-200 text-blue-800"
                              : theme === "dark" 
                                ? "bg-gray-600 text-gray-300" 
                                : "bg-gray-200 text-gray-600"
                          }`}>
                            Scroll to section
                          </span>
                        )}
                      </div>
                      <span className={`text-xs truncate mt-1 ${
                        index === activeSuggestion
                          ? theme === "dark" 
                            ? "text-blue-200" 
                            : "text-blue-600"
                          : theme === "dark" 
                            ? "text-gray-400" 
                            : "text-gray-500"
                      }`}>
                        {suggestion.scrollTo 
                          ? `Maps and scroll to ${suggestion.label}` 
                          : `Maps to ${suggestion.label}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* No results message */}
              {filteredSuggestions.length === 0 && globalSearch.length > 0 && (
                <div className={`px-4 py-3 text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>
                  <FiSearch className="inline mr-2" size={14} />
                  No content found for "{globalSearch}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-5">
          <Link
            to={`/notifications/${userData?.employeeId}`}
            className="relative"
          >
            <Bell
              size={28}
              className={
                isNotificationsActive
                  ? "text-blue-600 fill-blue-100"
                  : theme === "dark"
                  ? "text-white hover:text-gray-300"
                  : "text-gray-600 hover:text-black"
              }
            />
          {unreadCount > 0 && (
  <span className="absolute -top-2 -right-3 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
    {unreadCount}
  </span>
)}
          </Link>
          <div className="hidden sm:block">
            <DarkModeToggle
              isDark={theme === "dark"}
              onToggle={handleThemeToggle}
            />
          </div>
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
            {dropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg z-[200] ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div
                  className={`px-4 py-3 border-b ${
                    theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold truncate ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {userData?.fullName}
                  </p>
                  <p
                    className={`text-xs truncate ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {userData?.roles?.[0]}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to={`/profile/${userData?.employeeId}`}
                    className={`flex items-center px-4 py-2 text-sm ${
                      theme === "dark"
                        ? "text-white hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FiUser className="mr-3" size={16} /> View Profile
                  </Link>
                  <div
                    className={`border-t ${
                      theme === "dark" ? "border-gray-700" : "border-gray-200"
                    } mt-1 pt-1 sm:hidden`}
                  >
                    <div
                      className={`flex items-center justify-between px-4 py-2 text-sm ${
                        theme === "dark" ? "text-white" : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <FiSettings className="mr-3" size={16} /> Dark Mode
                      </div>
                      <DarkModeToggle
                        isDark={theme === "dark"}
                        onToggle={handleThemeToggle}
                      />
                    </div>
                  </div>
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
                            "https://hrms.anasolConsultancyservices.com/api/auth/logout",
                            { method: "POST", credentials: "include" }
                          );
                        } catch (error) {
                          console.error(error);
                        } finally {
                          const keysToRemove = [
                            "accessToken",
                            "emppayload",
                            "logedempid",
                            "logedemprole",
                            "loggedInUserImage",
                            "employeeFormData",
                            "aboutResponses",
                            "loggedUserImage",
                            "permissionsData",
                          ];
                          keysToRemove.forEach((key) => {
                            localStorage.removeItem(key);
                          });
                          setUserData(null);
                          if (onLogout) {
                            onLogout();
                          }
                        }
                      }}
                    >
                      <FiLogOut className="mr-3" size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;