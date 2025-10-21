import React, { useState, useEffect, useMemo, useCallback, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Context } from '../HrmsContext';
import { notificationsApi } from '../../../../axiosInstance';
import {
    FaBars,
    FaTimes,
    FaSearch,
    FaEnvelope,
    FaStar,
    FaInbox,
    FaFilter,
    FaCalendar,
    FaExclamationTriangle,
    FaInfoCircle,
    FaTimesCircle,
    FaCheckCircle,
    FaEraser,
    FaTrashAlt,
    FaSync,
} from "react-icons/fa";
import { parseISO, formatDistanceToNow, format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const NotificationSystem = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    
    const navigate = useNavigate();
    const { gdata, setGdata, markAsRead, decrementUnreadCount, theme,notificationPageNumber,
             setNotificationPageNumber,
             notificationPageSize,
             hasMoreNotifications // <-- IMPORTED: Centralized status for infinite scroll
             } = useContext(Context);

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const listRef = useRef(null);

    const fromDateRef = useRef(null);
    const toDateRef = useRef(null);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const loadMore = useCallback(() => {
        // Now using the centralized hasMoreNotifications status
        if (isLoadingMore || !hasMoreNotifications) return;
        
        setIsLoadingMore(true);
        setNotificationPageNumber(prevPage => prevPage + 1);
    }, [isLoadingMore, hasMoreNotifications, setNotificationPageNumber]); // <-- Dependency updated

    useEffect(() => {
        const listEl = listRef.current;
        if (!listEl) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = listEl;
            // Trigger loadMore when near the bottom
            if (scrollTop + clientHeight >= scrollHeight - 150) {
                loadMore();
            }
        };

        listEl.addEventListener('scroll', handleScroll);
        return () => listEl.removeEventListener('scroll', handleScroll);
    }, [loadMore]);

    // FIX: Add useEffect to turn off isLoadingMore after a fetch completes.
    useEffect(() => {
        if (isLoadingMore) {
            // A change in gdata or hasMoreNotifications signals the fetch has completed.
            const timer = setTimeout(() => {
                setIsLoadingMore(false);
            }, 100); 

            return () => clearTimeout(timer);
        }
    }, [gdata, hasMoreNotifications, isLoadingMore]);


    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        setIsEditMode(false);
        setSelectedNotifications([]);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    const handleEditClick = () => {
        setIsEditMode(true);
        setSelectedNotifications([]);
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setSelectedNotifications([]);
    };
    
    const clearFilters = () => {
        setFromDate(null);
        setToDate(null);
        setSearchQuery("");
        setActiveTab("All");
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
        const updatedGdata = gdata.map((msg) => msg.id === id ? { ...msg, stared: !msg.stared } : msg);
        setGdata(updatedGdata);
        try {
            const notificationToUpdate = gdata.find((msg) => msg.id === id);
            if (notificationToUpdate.stared) {
                await notificationsApi.put(`/unStar/${id}`);
            } else {
                await notificationsApi.put(`/stared/${id}`);
            }
        } catch (error) {
            setGdata(originalGdata);
        }
    };

    const handleDeleteSingle = async (id) => {
        if (isEditMode) {
            handleSelectNotification(id);
            return;
        }
        const originalGdata = [...gdata];
        const notificationToDelete = gdata.find((msg) => msg.id === id);
        setGdata(gdata.filter((msg) => msg.id !== id));
        if (notificationToDelete && !notificationToDelete.read) {
            decrementUnreadCount();
        }
        try {
            await notificationsApi.delete(`/delete/${id}`);
        } catch (error) {
            setGdata(originalGdata); 
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

    const handleDeleteSelected = async () => {
        const originalGdata = [...gdata];
        const idsToDelete = selectedNotifications;
        const unreadDeletedCount = gdata.filter(msg => idsToDelete.includes(msg.id) && !msg.read).length;
        setGdata(gdata.filter((msg) => !idsToDelete.includes(msg.id)));
        setIsEditMode(false);
        setSelectedNotifications([]);
        for (let i = 0; i < unreadDeletedCount; i++) {
            decrementUnreadCount();
        }
        try {
            await Promise.all(idsToDelete.map(id => notificationsApi.delete(`/delete/${id}`)));
        } catch (error) {
            setGdata(originalGdata); 
        }
    };

    const getTimeAgo = (date) => {
        try { return formatDistanceToNow(parseISO(date), { addSuffix: true }); } 
        catch (error) { return ""; }
    };

    const getTimestamp = (dateString) => {
        try { return formatInTimeZone(dateString, "Asia/Kolkata", "MMM d, h:mm a"); } 
        catch (error) { return ""; }
    };

    const filteredNotifications = useMemo(() => {
        let filtered = gdata || [];
        const lowerCaseQuery = searchQuery.toLowerCase();

        if (activeTab === "Unread") filtered = filtered.filter((msg) => !msg.read);
        else if (activeTab === "Starred") filtered = filtered.filter((msg) => msg.stared);
        
        if (searchQuery) {
            filtered = filtered.filter( (msg) =>
                msg.message?.toLowerCase().includes(lowerCaseQuery) ||
                msg.subject?.toLowerCase().includes(lowerCaseQuery) ||
                msg.sender?.toLowerCase().includes(lowerCaseQuery)
            );
        }

        if (fromDate) {
            const fromDateObj = parseISO(fromDate);
            filtered = filtered.filter((msg) => parseISO(msg.createdAt) >= fromDateObj);
        }

        if (toDate) {
            const toDateObj = parseISO(toDate);
            const adjustedToDateObj = new Date(toDateObj);
            adjustedToDateObj.setDate(adjustedToDateObj.getDate() + 1);
            filtered = filtered.filter((msg) => parseISO(msg.createdAt) < adjustedToDateObj);
        }

        return filtered;
    }, [gdata, activeTab, searchQuery, fromDate, toDate]);

    // NEW: Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return (
            searchQuery !== "" || 
            activeTab !== "All" || 
            fromDate !== null || 
            toDate !== null
        );
    }, [searchQuery, activeTab, fromDate, toDate]);

    const topBarVariants = {
        hidden: { y: -50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 }},
    };

    const buttonVariants = { hover: { scale: 1.05 }, tap: { scale: 0.95 } };
    
    return (
        <div className={`w-full h-[90vh] flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
            
            <motion.div
                className={`flex-shrink-0 shadow-sm border-b z-20 w-full ${
                    theme === 'dark' ? 'bg-black border-gray-700' : 'bg-white border-gray-200'
                }`}
                initial="hidden"
                animate="visible"
                variants={topBarVariants}
            >
                <div className={`sm:hidden py-2 flex items-center justify-between px-3 h-[50px] ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                    <motion.button onClick={toggleMobileMenu} className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <FaBars size={18} />
                    </motion.button>
                    <div className="relative flex-1 mx-3">
                        <FaSearch className={`absolute left-3.5 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} size={14}/>
                        <input type="text" placeholder="Search..." className={`w-full pl-10 pr-4 py-2 text-sm rounded-full border focus:ring-2 focus:ring-indigo-200 h-[40px] ${ theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:bg-gray-700 focus:border-indigo-500' : 'border-gray-200 bg-gray-50 text-black placeholder-gray-500 focus:bg-white focus:border-indigo-500'}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                    </div>
                </div>
                <div className="hidden sm:flex items-center space-x-4 py-2 px-4 h-[60px]">
                    <div className={`flex space-x-1 p-1 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        {["All", "Unread", "Starred"].map((tab) => (
                            <motion.button key={tab} style={{ borderRadius: "20px" }} onClick={() => handleTabClick(tab)} className={`py-1 px-3 text-sm font-medium flex items-center transition-colors ${ activeTab === tab ? "bg-blue-600 text-white rounded-md" : theme === 'dark' ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"}`} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                {tab === "All" && <FaInbox className="mr-1.5" size={14} />}
                                {tab === "Unread" && <FaEnvelope className="mr-1.5" size={14} />}
                                {tab === "Starred" && <FaStar className="mr-1.5" size={14} />}
                                {tab}
                            </motion.button>
                        ))}
                    </div>
                    <div className="relative flex-1">
                        <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} size={15}/>
                        <input type="text" placeholder="Search notifications..." className={`w-full h-[36px] pl-10 pr-4 text-sm rounded-lg border focus:ring-1 focus:ring-indigo-200 ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:bg-gray-700 focus:border-indigo-500' : 'border-gray-200 bg-white text-black placeholder-gray-500 focus:bg-white focus:border-indigo-500'}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => fromDateRef.current?.showPicker()} className={`flex items-center space-x-2 h-[36px] px-3 text-sm rounded-lg border transition-colors ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                            <span>From</span>
                            <FaCalendar className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} size={14} />
                        </button>
                        <input ref={fromDateRef} type="date" className="sr-only" value={fromDate || ""} onChange={(e) => setFromDate(e.target.value)}/>
                        <button onClick={() => toDateRef.current?.showPicker()} className={`flex items-center space-x-2 h-[36px] px-3 text-sm rounded-lg border transition-colors ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
                            <span>To</span>
                            <FaCalendar className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} size={14} />
                        </button>
                        <input ref={toDateRef} type="date" className="sr-only" value={toDate || ""} onChange={(e) => setToDate(e.target.value)}/>
                        <button onClick={clearFilters} className={`flex items-center justify-center h-[36px] w-[36px] text-sm rounded-lg border transition-colors ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-red-400' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-red-500'}`} title="Clear Filters">
                            <FaTimes size={14} />
                        </button>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center space-x-2">
                            {!isEditMode ? (
                                <motion.button style={{ borderRadius: "8px" }} onClick={handleEditClick} className="py-1 px-2 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md flex items-center" variants={buttonVariants} whileHover="hover" whileTap="tap">
                                    <FaEraser className="mr-1" size={12} />Edit
                                </motion.button>
                            ) : (
                                <>
                                    <motion.button onClick={handleCancelEdit} style={{ borderRadius: "10px" }} className={`py-1.5 px-3 text-sm font-medium rounded-lg flex items-center ${theme === 'dark' ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'}`} variants={buttonVariants} whileHover="hover" whileTap="tap">Cancel</motion.button>
                                    <motion.button onClick={handleDeleteSelected} style={{ borderRadius: "10px" }} className="py-1.5 px-3 text-sm font-medium text-white bg-blue-600 hover:bg-red-700 rounded-lg flex items-center" variants={buttonVariants} whileHover="hover" whileTap="tap">
                                        <FaTrashAlt className="mr-1.5" size={12} />Delete
                                    </motion.button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>


            <div
                ref={listRef}
                // FIX: Apply centering classes when the list is empty and not loading
                className={`flex-1 overflow-y-auto ${!isLoadingMore && filteredNotifications?.length === 0 ? 'flex items-center justify-center' : ''}`}
            >
                {filteredNotifications?.length > 0 ? (
                    <div className="p-2 notifications-list"> 
                        {filteredNotifications.map((message) => (
                            <motion.div
                                key={message.id}
                                className={`rounded-lg shadow-sm border mb-1.5 cursor-pointer overflow-hidden relative ${
                                    selectedNotifications.includes(message.id) ? "border-indigo-400 ring-2 ring-indigo-200" : theme === 'dark' ? "border-gray-700" : "border-gray-200"
                                } ${
                                    !message.read ? (theme === 'dark' ? "bg-gradient-to-r from-gray-800 to-gray-700" : "bg-gradient-to-r from-indigo-50 to-purple-50") : (theme === 'dark' ? "bg-gray-800" : "bg-white")
                                }`}
                                onClick={() => handleNotificationClick(message)}
                                whileHover={{ y: -2, boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}
                                transition={{ duration: 0.15 }}
                            >
                                <div className="sm:hidden flex flex-col p-2.5">
                                    <div className="flex items-start">
                                        <div className="pr-3 pt-1">{isEditMode ? (<FaCheckCircle size={18} className={ selectedNotifications.includes(message.id) ? "text-indigo-600" : "text-gray-300" }/>) : ( getKindIcon(message.kind) )}</div>
                                        <div className="flex-1 overflow-hidden pr-8">
                                            <div className={`font-semibold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{message.subject}</div>
                                            <div className={`text-xs mt-1 truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{message.message}</div>
                                        </div>
                                    </div>
                                    <div className={`flex justify-between items-center mt-2 pt-2 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200/80'}`}>
                                        <div className="flex flex-col items-start">
                                            <div className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">{message.category}</div>
                                            <div className={`font-bold text-xs mt-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{message.sender}</div>
                                        </div>
                                        <div className="flex flex-col items-end text-xs">
                                            <span className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{getTimeAgo(message.createdAt)}</span>
                                            <span className={`mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{getTimestamp(message.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-2.5 right-2.5 flex flex-col items-center justify-center space-y-3">
                                        <FaStar size={16} className={`cursor-pointer transition-colors ${message.stared ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`} onClick={(e) => { e.stopPropagation(); handleStar(message.id); }}/>
                                        <FaTrashAlt size={15} className="cursor-pointer text-gray-300 hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); handleDeleteSingle(message.id); }}/>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center w-full h-[90px] p-2">
                                    <div className="px-2">{isEditMode ? (<FaCheckCircle size={18} className={ selectedNotifications.includes(message.id) ? "text-indigo-600" : "text-gray-300" }/>) : ( getKindIcon(message.kind) )}</div>
                                    <div className="flex-1 flex flex-col justify-center overflow-hidden h-full pl-3">
                                        <div className={`font-semibold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{message.subject}</div>
                                        <div className={`text-xs mt-1 truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{message.message}</div>
                                    </div>
                                    <div className="flex flex-col items-start justify-center px-4 w-48 h-full shrink-0">
                                        <div className={`font-bold text-sm truncate w-full ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{message.sender}</div>
                                        <div className="text-xs font-medium text-indigo-600 mt-1">{message.category}</div>
                                    </div>
                                    <div className="flex flex-col items-end justify-center px-4 w-40 text-right h-full shrink-0">
                                        <div className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{getTimeAgo(message.createdAt)}</div>
                                        <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{getTimestamp(message.createdAt)}</div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center space-y-3 px-4">
                                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                            <FaStar size={16} className={`cursor-pointer transition-colors ${message.stared ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`} onClick={(e) => { e.stopPropagation(); handleStar(message.id); }}/>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                            <FaTrashAlt size={15} className="cursor-pointer text-gray-300 hover:text-red-500 transition-colors" onClick={(e) => { e.stopPropagation(); handleDeleteSingle(message.id); }}/>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {/* UPDATED: Loading spinner */}
                        {isLoadingMore && ( 
                            <div className={`text-center py-4 flex justify-center items-center space-x-2 ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-600' }`}>
                                <FaSync size={16} className="text-blue-500 animate-spin" style={{ animation: 'spin 1s linear infinite' }}/>
                                <span>Loading more...</span>
                            </div> 
                        )}
                        {!hasMoreNotifications && ( <div className={`text-center py-4 ${ theme === 'dark' ? 'text-gray-500' : 'text-gray-500' }`}>No more notifications.</div> )}
                    </div>
                ) : (
                    // Empty state block
                    !isLoadingMore && (
                        // Removed justify-center h-full, as the parent listRef now handles centering.
                        <div className="p-2 notifications-list w-full"> 
                            <div className="flex flex-col items-center text-center p-4">
                                {hasActiveFilters ? (
                                    // Case 1: Filters are active but no results found
                                    <>
                                        <FaSearch size={48} className={`mb-4 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                        <h3 className={`text-xl font-semibold ${ theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>No Matches Found</h3>
                                        <p className={`mt-1 text-sm ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500' }`}>Try adjusting your filters or clearing the search query.</p>
                                    </>
                                ) : (
                                    // Case 2: No filters are active (default view) and list is empty
                                    <>
                                        <FaCheckCircle size={48} className="mb-4 text-green-500" />
                                        <h3 className={`text-xl font-semibold ${ theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>You're All Caught Up!</h3>
                                        <p className={`mt-1 text-sm ${ theme === 'dark' ? 'text-gray-400' : 'text-gray-500' }`}>No notifications to show.</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div key="overlay" className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-30 sm:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)}/>
                        <motion.div key="sidebar" className={`fixed top-0 left-0 h-full w-3/4 max-w-sm z-40 sm:hidden flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`} initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}>
                            <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <h5 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Filters & Actions</h5>
                                <motion.button onClick={() => setIsMobileMenuOpen(false)} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                                    <FaTimes size={20} className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                                </motion.button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <div className={`flex border-b h-12 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                    {["All", "Unread", "Starred"].map((tab) => (<button key={tab} onClick={() => handleTabClick(tab)} className={`flex-1 h-full py-3 text-sm font-medium transition-colors ${activeTab === tab ? "bg-indigo-50 text-indigo-600" : (theme === 'dark' ? "text-gray-300 hover:bg-gray-700" : "text-gray-500 hover:bg-gray-50")}`}>{tab}</button>))}
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h6 className={`text-sm font-semibold flex items-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}><FaFilter className="inline-block mr-2" size={12} />Filters</h6>
                                        <button onClick={clearFilters} className={`py-1 px-3 text-xs font-medium rounded-md ${theme === 'dark' ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}>Clear All</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => fromDateRef.current?.showPicker()} className={`p-2 text-sm rounded-md border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}><FaCalendar className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={14} /></button>
                                            <span className={`text-xs w-20 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{fromDate ? format(parseISO(fromDate), "MMM d, yyyy") : "From Date"}</span>
                                            <input ref={fromDateRef} type="date" className="sr-only" value={fromDate || ""} onChange={(e) => setFromDate(e.target.value)}/>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => toDateRef.current?.showPicker()} className={`p-2 text-sm rounded-md border ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}><FaCalendar className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={14} /></button>
                                            <span className={`text-xs w-20 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{toDate ? format(parseISO(toDate), "MMM d, yyyy") : "To Date"}</span>
                                            <input ref={toDateRef} type="date" className="sr-only" value={toDate || ""} onChange={(e) => setToDate(e.target.value)}/>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 pt-4">
                                        {!isEditMode ? (<button onClick={handleEditClick} className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>Edit</button>) : (<>
                                            <button onClick={handleCancelEdit} className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>Cancel</button>
                                            <button onClick={handleDeleteSelected} className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">Delete</button>
                                        </>)}
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