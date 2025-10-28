import axios from "axios";
import React, { createContext, useState, useEffect, useCallback } from "react";
import logo from "./assets/anasol-logo.png";
import { authApi, notificationsApi } from "../../../axiosInstance";
import notificationSound from '../Components/assets/mixkit-correct-answer-tone-2870.wav';

export const Context = createContext();
export const UISidebarContext = createContext();

const HrmsContext = ({ children }) => {
    const [gdata, setGdata] = useState([]);
    const [permissionsdata, setPermissionsData] = useState([]);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme ? savedTheme : "light";
    });
    const [lastSseMsgId, setLastSseMsgId] = useState(null);
    const [globalSearch,setGlobalSearch]=useState("")
    const [unreadCount, setUnreadCount] = useState(0);
    const [userprofiledata, setUserProfileData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [isChatWindowVisible, setIsChatWindowVisible] = useState(false);
    const [matchedArray,setMatchedArray]=useState([]);
    const [chatUnreadCount,setChatUnreadCount]=useState(0);
    const notificationAudio = new Audio(notificationSound);
    notificationAudio.preload = 'auto'; 
    notificationAudio.volume = 0.6; 

    // --- New State for Notification Pagination ---
    const [notificationPageNumber, setNotificationPageNumber] = useState(0);
    const [notificationPageSize, setNotificationPageSize] = useState(10); // You can change this page size
    const [hasMoreNotifications, setHasMoreNotifications] = useState(true); // Centralized hasMore status
    // ---------------------------------------------

    useEffect(() => {
        const storedUser = localStorage.getItem("emppayload");
        const storedUserImage = localStorage.getItem("loggedInUserImage");

        if (storedUser) {
            const userObject = JSON.parse(storedUser);
            if (storedUserImage) {
                userObject.employeeImage = storedUserImage;
            }
            setUserData(userObject);
        }

        const storedAccessToken = localStorage.getItem("accessToken");
        const storedRefreshToken = localStorage.getItem("refreshToken");
        if (storedAccessToken) {
            setAccessToken(storedAccessToken);
        }
        if (storedRefreshToken) {
            setRefreshToken(storedRefreshToken);
        }
    }, []);



    const LoggedInUserRole = userData?.roles[0]?`ROLE_${userData?.roles[0]}` 
    : null;


    useEffect(() => {
        const fetchPermissionArray = async () => {
            try {
                const response = await authApi.get(`role-access/${LoggedInUserRole}`);
                setMatchedArray(response?.data?.permissions);
                
            } catch (error) {
                console.error(error);
            }
        };

        if (LoggedInUserRole) {
            fetchPermissionArray();
        }
    }, [LoggedInUserRole]);


    useEffect(() => {
        if (matchedArray && matchedArray.length > 0) {
            console.log("Context matched Array ", matchedArray);
        }
    }, [matchedArray]);



    // ✅ Permissions fetcher
    useEffect(() => {
        let permissionfetcher = async () => {
            try {
                let response = await authApi.get(`/role-access/all`);
                console.log("Original Permissions data from API:", response.data);

                // Remove ROLE_ prefix from roleName in each permission object
                const processedPermissions = response.data.map(roleData => ({
                    ...roleData,
                    roleName: roleData.roleName.replace(/^ROLE_/, '') // Remove ROLE_ prefix
                }));

                console.log("Processed Permissions data (ROLE_ prefix removed):", processedPermissions);
                setPermissionsData(processedPermissions);
            } catch (error) {
                console.log("Permission error:", error);
            }
        }
        permissionfetcher();
    }, []);

    useEffect(() => {
        if ("Notification" in window) {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    console.log("Notification permission granted.");
                } else {
                    console.warn("Notification permission was not granted.");
                }
            });
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await notificationsApi.get(`/unread-count/${userData?.employeeId}`);
            setUnreadCount(res.data);
            console.log("Notification count", res.data);
        } catch (err) {
            console.error("Error fetching unread count:", err);
        }
    }, [userData?.employeeId]);

    const markAsRead = useCallback(async (id) => {
        try {
            setGdata((prev) => prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg)));
            await notificationsApi.post(`/read/${id}`);
            fetchUnreadCount();
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    }, [fetchUnreadCount]);

    const decrementUnreadCount = useCallback(() => {
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    }, []);

    const fetchNotifications = useCallback(async () => {
        // Guard clause to prevent API call if employeeId is not yet loaded
        if (!userData?.employeeId) { 
            console.warn("Attempted to fetch notifications without employeeId. Aborting.");
            return;
        }

        try {
            const res = await notificationsApi.get(`/all/${userData?.employeeId}?page=${notificationPageNumber}&size=${notificationPageSize}`);
            
            const data = res.data;
            let notificationsArray = [];
            let isLastPage = false; // Flag to check if this is the last page

            // Check if API returned a Page object or just an array
            if (Array.isArray(data)) {
                notificationsArray = data;
                // If the array is smaller than the requested page size, assume last page
                if (notificationsArray.length < notificationPageSize) {
                    isLastPage = true;
                }
            } else if (data && Array.isArray(data.content)) {
                notificationsArray = data.content;
                isLastPage = data.last; // Use 'last' flag from Spring Boot Page object
            }

            // Centralized logic to control infinite scroll in consumer component
            setHasMoreNotifications(!isLastPage); 

            // Handle infinite scroll/pagination logic
            if (notificationPageNumber === 0) {
                setGdata(notificationsArray);
            } else {
                // Append new list to the old one, using a Set to prevent duplicates
                setGdata((prev) => {
                    const existingIds = new Set(prev.map(n => n.id));
                    const newNotifications = notificationsArray.filter(n => !existingIds.has(n.id));
                    return [...prev, ...newNotifications];
                });
            }

            const latestUnread = notificationsArray.find((msg) => !msg.read);
            setLastSseMsgId(latestUnread ? latestUnread.id : null);
            console.log("Fetched notifications page:", notificationPageNumber, notificationsArray);

        } catch (err) {
            console.error("Error fetching notifications:", err);
            // On API error, disable further scrolling until user attempts refresh
            if (notificationPageNumber > 0) {
                setHasMoreNotifications(false);
            }
        }
    }, [userData?.employeeId, notificationPageNumber, notificationPageSize]);
    
    // --- NEW: Persistent SSE Connection Logic ---
    // The previous SSE useEffect was prone to re-running if dependencies changed.
    // We isolate the connection logic here and rely only on userData?.employeeId
    // to establish the connection once the user is known.
    useEffect(() => {
        let eventSource;

        // 1. Guard clause: Ensure employeeId is available before attempting connection.
        if (!userData?.employeeId) {
            console.log("SSE: Waiting for employeeId to establish connection.");
            return;
        }

        console.log(`SSE: Setting up connection for Employee ID: ${userData.employeeId}`);
        
        // 2. Establish connection using the employeeId
        // The URL is hardcoded, so the SSE connection will attempt to connect.
        eventSource = new EventSource(`https://hrms.anasolconsultancyservices.com/api/notification/subscribe/${userData.employeeId}`);
        
        eventSource.onopen = () => { 
            console.log("SSE: Connection established successfully."); 
        };
        
        eventSource.addEventListener("notification", (event) => {
            try {
                const incoming = JSON.parse(event.data);
                console.log("📨 New Notification (SSE):", incoming);

                notificationAudio.play().catch(error => {
                    // This catch is necessary for browsers that block autoplay
                    console.warn("Could not play notification sound:", error); 
                });
                
                setGdata((prev) => {
                    const isDuplicate = prev.some((n) => n.id === incoming.id);
                    if (isDuplicate) return prev;
                    // Add new notification to the beginning of the list
                    return [incoming, ...prev];
                });
                
                setLastSseMsgId(incoming.id);
                fetchUnreadCount();
                
                if (Notification.permission === "granted") {
                    const notification = new Notification(incoming.subject, {
                        body: incoming.message, 
                        icon: logo, 
                        data: { id: incoming.id, link: incoming.link },
                        silent: true, // Fix for duplicate sound
                    });
                    
                    notification.onclick = (e) => {
                        e.preventDefault();
                        if (incoming.link) { window.open(incoming.link, "_self"); }
                        window.focus();
                        markAsRead(incoming.id);
                        notification.close();
                    };
                }
            } catch (err) { console.error("⚠ Error parsing SSE data:", err); }
        });
        
        eventSource.onerror = (err) => {
            // Log the error and close the connection. The cleanup function will run on unmount.
            console.error("SSE connection error:", err);
            // Optional: You could add logic here to attempt a reconnect after a delay.
            // eventSource.close(); 
        };
        
        // 3. Cleanup function: Closes the connection when component unmounts or employeeId changes
        return () => {
            console.log("SSE: Closing connection.");
            if (eventSource) {
                eventSource.close();
            }
        };
        
    }, [userData?.employeeId, fetchUnreadCount, markAsRead]); // Dependencies are correct for connection handling

    // --- END: Persistent SSE Connection Logic ---
    

    useEffect(() => {
        // This runs for fetching the notification list
        fetchNotifications();
    }, [fetchNotifications]); 

    useEffect(() => {
        // Fetch count only on initial load
        if (userData?.employeeId) {
            fetchUnreadCount();
        }
    }, [userData?.employeeId, fetchUnreadCount]);

    useEffect(() => {
        localStorage.setItem("theme", theme);
        console.log(`Theme saved to localStorage: ${theme}`);
    }, [theme]);

    return (
        <Context.Provider
            value={{
                gdata, setGdata, lastSseMsgId, markAsRead, unreadCount,
                decrementUnreadCount, userData, setUserData, accessToken,
                setAccessToken, refreshToken, setRefreshToken, userprofiledata,
                setUserProfileData, theme, setTheme,
                isChatWindowVisible,
                setIsChatWindowVisible,
                permissionsdata,setPermissionsData,setGlobalSearch,globalSearch,matchedArray,chatUnreadCount,setChatUnreadCount,

                // --- Exporting new pagination values and setters ---
                notificationPageNumber,
                setNotificationPageNumber,
                notificationPageSize,
                setNotificationPageSize,
                hasMoreNotifications, // <--- EXPORTED: New state for infinite scroll
            }}
        >
            {/* UISidebarContext will be provided in HrmsApp */}
            {children}
        </Context.Provider>
    );
};

export default HrmsContext;