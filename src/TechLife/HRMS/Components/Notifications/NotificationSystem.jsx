import React, { useState, useContext, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaSearch,
  FaEnvelope,
  FaStar,
  FaInbox,
  FaFilter,
  FaArrowLeft,
  FaArrowRight,
  FaCalendar,
  FaChartBar,
  FaMoneyBillAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimesCircle,
  FaCheckCircle,
  FaEraser,
  FaTrashAlt,
} from "react-icons/fa";
import { parseISO, formatDistanceToNow, format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Context } from "../HrmsContext";
import { motion, AnimatePresence } from "framer-motion";
 
const NotificationSystem = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const navigate = useNavigate();
  const { gdata, setGdata, markAsRead, decrementUnreadCount } = useContext(Context);
 
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
 
  // Helper functions
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
 
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setIsEditMode(false);
    setSelectedNotifications([]);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };
 
  const getKindIcon = (kind) => {
    const icons = {
      alert: <FaTimesCircle size={18} className="text-red-500" />,
      warning: <FaExclamationTriangle size={18} className="text-yellow-500" />,
      update: <FaInfoCircle size={18} className="text-blue-500" />,
    };
    return icons[kind] || <FaInfoCircle size={18} className="text-gray-400" />;
  };
 
  const handleStar = async (id) => {
    if (isEditMode) {
      handleSelectNotification(id);
      return;
    }
 
    const originalGdata = [...gdata];
    const notificationToUpdate = gdata.find((msg) => msg.id === id);
 
    if (!notificationToUpdate) return;
 
    // Optimistically update the UI to feel responsive
    const updatedGdata = gdata.map((msg) =>
      msg.id === id ? { ...msg, stared: !msg.stared } : msg
    );
    setGdata(updatedGdata);
 
    try {
      let response;
      const isCurrentlyStared = notificationToUpdate.stared;
 
      if (isCurrentlyStared) {
       
        response = await fetch(
          `http://localhost:8081/api/notifications/unstared/${id}`,
          {
            method: "PUT",
          }
        );
      } else {
       
        response = await fetch(
          `http://localhost:8081/api/notifications/stared/${id}`,
          {
            method: "PUT",
          }
        );
      }
 
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
 
      console.log(`Notification ${id} star status updated successfully.`);
    } catch (error) {
      console.error("Failed to update star status:", error);
      // If the API call fails, revert the UI to the original state
      setGdata(originalGdata);
      alert("Failed to update the notification. Please try again.");
    }
  };
 
  const handleDeleteSingle = async (id) => {
    if (isEditMode) {
      handleSelectNotification(id);
      return;
    }
 
    const originalGdata = [...gdata];
    const notificationToDelete = gdata.find((msg) => msg.id === id);
 
    // Optimistically update UI
    setGdata(gdata.filter((msg) => msg.id !== id));
    // Decrement count if the deleted notification was unread
    if (notificationToDelete && !notificationToDelete.read) {
        decrementUnreadCount();
    }
 
    try {
      const response = await fetch(
        `http://localhost:8081/api/notifications/delete/${id}`,
        {
          method: "DELETE",
        }
      );
 
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
 
      console.log(`Notification ${id} deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      setGdata(originalGdata); // Revert if API call fails
      alert("Failed to delete the notification. Please try again.");
    }
  };
 
  const handleSelectNotification = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((selId) => selId !== id) : [...prev, id]
    );
  };
 
  const handleNotificationClick = (message) => {
    if (isEditMode) {
      handleSelectNotification(message.id);
    } else if (message.link) {
      markAsRead(message.id);
      navigate(message.link);
    }
  };
 
  const handleEditClick = () => {
    setIsEditMode(true);
    setSelectedNotifications([]);
  };
 
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSelectedNotifications([]);
  };
 
  const handleDeleteSelected = async () => {
    const originalGdata = [...gdata];
    const idsToDelete = selectedNotifications;
 
    // Identify which selected notifications were unread to adjust count
    const unreadDeletedCount = gdata.filter(msg =>
        idsToDelete.includes(msg.id) && !msg.read
    ).length;
 
    // Optimistically update UI (remove selected notifications)
    setGdata(gdata.filter((msg) => !idsToDelete.includes(msg.id)));
    setIsEditMode(false);
    setSelectedNotifications([]);
 
    // Decrement count based on unread items deleted
    for (let i = 0; i < unreadDeletedCount; i++) {
        decrementUnreadCount();
    }
 
    try {
      // Assuming your backend can handle a batch delete or multiple deletes
      await Promise.all(idsToDelete.map(id =>
        fetch(`http://localhost:8081/api/notifications/delete/${id}`, { method: "DELETE" })
          .then(res => {
            if (!res.ok) throw new Error(`Failed to delete ${id}`);
          })
      ));
     
      console.log(`Selected notifications deleted successfully.`);
    } catch (error) {
      console.error("Failed to delete selected notifications:", error);
      setGdata(originalGdata); // Revert UI if any deletion fails
      alert("Failed to delete selected notifications. Please try again.");
    }
  };
 
  const clearFilters = () => {
    setFromDate(null);
    setToDate(null);
    setSearchQuery("");
    setActiveTab("All");
  };
 
  const getTimeAgo = (date) => {
    try {
      const parsedDate = parseISO(date);
      return formatDistanceToNow(parsedDate, { addSuffix: true });
    } catch (error) {
      console.error("Error parsing date for getTimeAgo:", error);
      return "";
    }
  };
 
  const getTimestamp = (dateString) => {
    try {
      const timeZone = "Asia/Kolkata";
      return formatInTimeZone(dateString, timeZone, "MMM d, h:mm a");
    } catch (error) {
      console.error("Error formatting date in IST:", error);
      return "";
    }
  };
 
  // Memoized values
  const unreadCount = useMemo(
    () => gdata?.filter((msg) => !msg.read).length || 0,
    [gdata]
  );
 
  const filteredNotifications = useMemo(() => {
    let filtered = gdata || [];
    const lowerCaseTab = activeTab.toLowerCase();
    const lowerCaseQuery = searchQuery.toLowerCase();
 
    if (activeTab === "Unread") filtered = filtered.filter((msg) => !msg.read);
    else if (activeTab === "Starred")
      filtered = filtered.filter((msg) => msg.stared);
    else if (
      ["attendance", "leaves", "performance", "finance"].includes(lowerCaseTab)
    ) {
      filtered = filtered.filter((msg) =>
        msg.category?.toLowerCase().includes(lowerCaseTab)
      );
    }
 
    if (searchQuery) {
      filtered = filtered.filter(
        (msg) =>
          msg.message?.toLowerCase().includes(lowerCaseQuery) ||
          msg.subject?.toLowerCase().includes(lowerCaseQuery) ||
          msg.sender?.toLowerCase().includes(lowerCaseQuery)
      );
    }
 
    if (fromDate) {
      const fromDateObj = parseISO(fromDate);
      filtered = filtered.filter(
        (msg) => parseISO(msg.createdAt) >= fromDateObj
      );
    }
 
    if (toDate) {
      const toDateObj = parseISO(toDate);
      const adjustedToDateObj = new Date(toDateObj);
      adjustedToDateObj.setDate(adjustedToDateObj.getDate() + 1);
      filtered = filtered.filter(
        (msg) => parseISO(msg.createdAt) < adjustedToDateObj
      );
    }
 
    return filtered;
  }, [gdata, activeTab, searchQuery, fromDate, toDate]);
 
  // Animation variants
  const topBarVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };
 
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };
 
  // Sidebar navigation items
  const sidebarItems = [
    { tab: "Leaves", icon: FaEnvelope },
    { tab: "Performance", icon: FaChartBar },
    { tab: "Finance", icon: FaMoneyBillAlt },
    { tab: "Attendance", icon: FaCalendar },
  ];
 
  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <motion.div
        className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20 w-full"
        initial="hidden"
        animate="visible"
        variants={topBarVariants}
      >
        {/* Mobile Header */}
        <div className="sm:hidden bg-white py-2 flex items-center justify-between px-3 h-[50px]">
          <motion.button
            onClick={toggleMobileMenu}
            className="text-gray-600 hover:text-gray-800"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaBars size={18} />
          </motion.button>
 
          <div className="relative flex-1 mx-3">
            <FaSearch
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-[40px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Mobile Bell Icon Removed */}
        </div>
 
        {/* === DESKTOP HEADER === */}
        <div className="hidden sm:flex items-center space-x-4 py-2 px-4 h-[60px]">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {["All", "Unread", "Starred"].map((tab) => (
              <motion.button
                key={tab}
                style={{ borderRadius: "20px" }}
                onClick={() => handleTabClick(tab)}
                className={`py-1 px-3 text-sm font-medium flex items-center transition-colors
                ${
                  activeTab === tab
                    ? "bg-blue-600 text-white rounded-md"
                    : "text-gray-600  "
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {tab === "All" && <FaInbox className="mr-1.5" size={14} />}
                {tab === "Unread" && (
                  <FaEnvelope className="mr-1.5" size={14} />
                )}
                {tab === "Starred" && <FaStar className="mr-1.5" size={14} />}
                {tab}
              </motion.button>
            ))}
          </div>
 
          {/* Search Bar */}
          <div className="relative flex-1">
            <FaSearch
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              type="text"
              placeholder="Search notifications..."
              className="w-full h-[36px] pl-10 pr-4 text-sm rounded-lg border border-gray-200 bg-white focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
 
          {/* Filters */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fromDateRef.current?.showPicker()}
              className="flex items-center space-x-2 h-[36px] px-3 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600">From</span>
              <FaCalendar className="text-gray-400" size={14} />
            </button>
            <input
              ref={fromDateRef}
              type="date"
              className="sr-only"
              value={fromDate || ""}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <button
              onClick={() => toDateRef.current?.showPicker()}
              className="flex items-center space-x-2 h-[36px] px-3 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600">To</span>
              <FaCalendar className="text-gray-400" size={14} />
            </button>
            <input
              ref={toDateRef}
              type="date"
              className="sr-only"
              value={toDate || ""}
              onChange={(e) => setToDate(e.target.value)}
            />
            <button
              onClick={clearFilters}
              className="flex items-center justify-center h-[36px] w-[36px] text-sm rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors"
              title="Clear Filters"
            >
              <FaTimes size={14} />
            </button>
          </div>
 
          {/* Action Buttons & Notifications */}
          <div className="flex items-center">
            {/* Button Group */}
            <div className="flex items-center space-x-2">
              {!isEditMode ? (
                <motion.button
                  style={{ borderRadius: "8px" }}
                  onClick={handleEditClick}
                  className="py-1 px-2 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md flex items-center"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <FaEraser className="mr-1" size={12} />
                  Edit
                </motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={handleCancelEdit}
                    style={{ borderRadius: "10px" }}
                    className="py-1.5 px-3 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleDeleteSelected}
                    style={{ borderRadius: "10px" }}
                    className="py-1.5 px-3 text-sm font-medium text-white bg-blue-600 hover:bg-red-700 rounded-lg flex items-center"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <FaTrashAlt className="mr-1.5" size={12} />
                    Delete
                  </motion.button>
                </>
              )}
            </div>
            {/* Desktop Bell Icon Removed */}
          </div>
        </div>
      </motion.div>
 
      {/* Main Content (added dynamic padding-right for fixed sidebar) */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-60px)]">
        {/* Notification List */}
        {/* Dynamically adjust padding-right based on sidebar state */}
        <div
          className={`p-2 notifications-list flex-1 overflow-y-auto
          ${isSidebarCollapsed ? 'sm:pr-[60px]' : 'sm:pr-[250px]'}`}
        >
          {filteredNotifications?.length > 0 ? (
            filteredNotifications.map((message) => (
              <motion.div
                key={message.id}
                className={`rounded-lg shadow-sm border mb-1.5 cursor-pointer overflow-hidden relative
                ${
                  selectedNotifications.includes(message.id)
                    ? "border-indigo-400 ring-2 ring-indigo-200"
                    : "border-gray-200"
                }
                ${
                  !message.read
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50"
                    : "bg-white"
                }`}
                onClick={() => handleNotificationClick(message)}
                whileHover={{ y: -2, boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}
                transition={{ duration: 0.15 }}
              >
                {/* Mobile Layout */}
                <div className="sm:hidden flex flex-col p-2.5">
                  <div className="flex items-start">
                    <div className="pr-3 pt-1">
                      {isEditMode ? (
                        <FaCheckCircle
                          size={18}
                          className={
                            selectedNotifications.includes(message.id)
                              ? "text-indigo-600"
                              : "text-gray-300"
                          }
                        />
                      ) : (
                        getKindIcon(message.kind)
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden pr-8">
                      <div className="font-semibold text-sm text-gray-800">
                        {message.subject}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        {message.message}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200/80">
                    <div className="flex flex-col items-start">
                      <div className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {message.category}
                      </div>
                      <div className="font-bold text-xs text-gray-700 mt-1">
                        {message.sender}
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-xs">
                      <span className="text-gray-600 font-semibold">
                        {getTimeAgo(message.createdAt)}
                      </span>
                      <span className="text-gray-400 mt-0.5">
                        {getTimestamp(message.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-2.5 right-2.5 flex flex-col items-center justify-center space-y-3">
                    <FaStar
                      size={16}
                      className={`cursor-pointer transition-colors ${
                        message.stared
                          ? "text-yellow-400"
                          : "text-gray-300 hover:text-yellow-400"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStar(message.id);
                      }}
                    />
                    <FaTrashAlt
                      size={15}
                      className="cursor-pointer text-gray-300 hover:text-red-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSingle(message.id);
                      }}
                    />
                  </div>
                </div>
 
                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center w-full h-[90px] p-2">
                  <div className="px-2">
                    {isEditMode ? (
                      <FaCheckCircle
                        size={18}
                        className={
                          selectedNotifications.includes(message.id)
                            ? "text-indigo-600"
                            : "text-gray-300"
                        }
                      />
                    ) : (
                      getKindIcon(message.kind)
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center overflow-hidden h-full pl-3">
                    <div className="font-semibold text-sm text-gray-800 truncate">
                      {message.subject}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {message.message}
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-center px-4 w-48 h-full shrink-0">
                    <div className="font-bold text-sm text-gray-800 truncate w-full">
                      {message.sender}
                    </div>
                    <div className="text-xs font-medium text-indigo-600 mt-1">
                      {message.category}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center px-4 w-40 text-right h-full shrink-0">
                    <div className="text-xs text-gray-600 font-semibold">
                      {getTimeAgo(message.createdAt)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {getTimestamp(message.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-3 px-4">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaStar
                        size={16}
                        className={`cursor-pointer transition-colors ${
                          message.stared
                            ? "text-yellow-400"
                            : "text-gray-300 hover:text-yellow-400"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStar(message.id);
                        }}
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTrashAlt
                        size={15}
                        className="cursor-pointer text-gray-300 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSingle(message.id);
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-4">
              <FaCheckCircle size={48} className="mb-4 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-700">
                You're All Caught Up!
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No notifications match your current filters.
              </p>
            </div>
          )}
        </div>
 
        {/* Desktop Sidebar (Moved to the Right) */}
        <aside
          // Changed sm:sticky to sm:fixed, adjusted top and right
          // height is h-full, accounting for the navbar
          className={`sm:flex flex-col bg-white border-l border-gray-200 transition-all duration-200
          ${isSidebarCollapsed ? "w-[60px]" : "w-[250px]"}
          hidden sm:flex sm:fixed top-[60px] right-0 h-[calc(100vh-60px)] z-10`}
        >
          {/* Removed mt-[60px] from here as the parent <aside> already handles vertical positioning */}
          <div className="flex justify-start mt-[60px] p-1.5 items-center">
            <motion.button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 focus:outline-none p-1.5 rounded-full hover:bg-gray-100"
              transition={{ duration: 0.3 }}
            >
              {isSidebarCollapsed ? (
                <FaArrowLeft size={14} />
              ) : (
                <FaArrowRight size={14} />
              )}
            </motion.button>
          </div>
          <nav className="flex-1 space-y-1.5 px-1.5 overflow-y-auto">
            {sidebarItems.map(({ tab, icon: Icon }) => (
              <motion.button
                key={tab}
                className={`w-full text-left py-2 px-2 rounded-md font-medium flex items-center transition-colors
                ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }
                ${isSidebarCollapsed ? "justify-center" : ""}`}
                onClick={() => handleTabClick(tab)}
                whileHover={{ x: isSidebarCollapsed ? 0 : -3 }}
              >
                <Icon size={14} className={isSidebarCollapsed ? "" : "mr-2"} />
                {!isSidebarCollapsed && tab}
              </motion.button>
            ))}
          </nav>
        </aside>
      </div>
 
      {/* === MOBILE SIDEBAR MENU === */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              key="sidebar"
              className="fixed top-0 left-0 h-full w-3/4 max-w-sm bg-white z-40 sm:hidden flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h5 className="font-bold text-lg text-gray-800">Menu</h5>
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes size={20} className="text-gray-600" />
                </motion.button>
              </div>
 
              <div className="flex-1 overflow-y-auto">
                <div className="flex border-b border-gray-200 h-12">
                  {["All", "Unread", "Starred"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTabClick(tab)}
                      className={`flex-1 h-full py-3 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
 
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h6 className="text-sm font-semibold text-gray-500 flex items-center">
                      <FaFilter className="inline-block mr-2" size={12} />
                      Filters
                    </h6>
                    <button
                      onClick={clearFilters}
                      className="py-1 px-3 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Clear All
                    </button>
                  </div>
 
                  <div className="flex flex-col space-y-1">
                    {sidebarItems.map(({ tab }) => (
                      <button
                        key={tab}
                        className={`w-full text-left py-2 px-3 text-sm rounded-md ${
                          activeTab === tab
                            ? "bg-indigo-100 text-indigo-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => handleTabClick(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
 
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fromDateRef.current?.showPicker()}
                        className="p-2 text-sm rounded-md border border-gray-300 bg-white"
                      >
                        <FaCalendar className="text-gray-500" size={14} />
                      </button>
                      <span className="text-xs text-gray-700 w-20">
                        {fromDate
                          ? format(parseISO(fromDate), "MMM d, yyyy")
                          : "From Date"}
                      </span>
                      <input
                        ref={fromDateRef}
                        type="date"
                        className="sr-only"
                        value={fromDate || ""}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toDateRef.current?.showPicker()}
                        className="p-2 text-sm rounded-md border border-gray-300 bg-white"
                      >
                        <FaCalendar className="text-gray-500" size={14} />
                      </button>
                      <span className="text-xs text-gray-700 w-20">
                        {toDate
                          ? format(parseISO(toDate), "MMM d, yyyy")
                          : "To Date"}
                      </span>
                      <input
                        ref={toDateRef}
                        type="date"
                        className="sr-only"
                        value={toDate || ""}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>
                  </div>
 
                  <div className="flex space-x-2 pt-4">
                    {!isEditMode ? (
                      <button
                        onClick={handleEditClick}
                        className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg"
                      >
                        Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteSelected}
                          className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
 
export default NotificationSystem;