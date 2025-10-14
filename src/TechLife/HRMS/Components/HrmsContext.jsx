import axios from "axios";
import React, { createContext, useState, useEffect, useCallback } from "react";
import logo from "./assets/anasol-logo.png";
import { authApi } from "../../../axiosInstance";

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
            const res = await axios.get(`https://hrms.anasolconsultancyservices.com/api/notification/unread-count/${userData?.employeeId}`);
            setUnreadCount(res.data);
            console.log("Notification count", res.data);
        } catch (err) {
            console.error("Error fetching unread count:", err);
        }
    }, [userData?.employeeId]);

    const markAsRead = useCallback(async (id) => {
        try {
            setGdata((prev) => prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg)));
            await axios.post(`https://hrms.anasolconsultancyservices.com/api/notification/read/${id}`);
            fetchUnreadCount();
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    }, [fetchUnreadCount]);

    const decrementUnreadCount = useCallback(() => {
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axios.get(`https://hrms.anasolconsultancyservices.com/api/notification/all/${userData?.employeeId}`);
            const data = res.data;
            setGdata(data);
            const latestUnread = data.find((msg) => !msg.read);
            setLastSseMsgId(latestUnread ? latestUnread.id : null);
            console.log("Initial notification fetch:", data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    }, [userData?.employeeId]);

    useEffect(() => {
        console.log("Setting up SSE connection...");
        const eventSource = new EventSource(`https://hrms.anasolconsultancyservices.com/api/notification/subscribe/${userData?.employeeId}`);
        eventSource.onopen = () => { console.log("SSE connection established."); };
        eventSource.addEventListener("notification", (event) => {
            try {
                const incoming = JSON.parse(event.data);
                console.log("📨 New Notification (SSE):", incoming);
                setGdata((prev) => {
                    const isDuplicate = prev.some((n) => n.id === incoming.id);
                    if (isDuplicate) return prev;
                    return [incoming, ...prev];
                });
                setLastSseMsgId(incoming.id);
                fetchUnreadCount();
                if (Notification.permission === "granted") {
                    const notification = new Notification(incoming.subject, {
                        body: incoming.message, icon: logo, data: { id: incoming.id, link: incoming.link },
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
            console.error("SSE connection error:", err);
            eventSource.close();
        };
        return () => {
            console.log("Closing SSE connection");
            eventSource.close();
        };
    }, [userData?.employeeId, markAsRead, fetchUnreadCount]);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

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
                permissionsdata,setPermissionsData,setGlobalSearch,globalSearch,matchedArray,chatUnreadCount,setChatUnreadCount
            }}
        >
            {/* UISidebarContext will be provided in HrmsApp */}
            {children}
        </Context.Provider>
    );
};

export default HrmsContext;