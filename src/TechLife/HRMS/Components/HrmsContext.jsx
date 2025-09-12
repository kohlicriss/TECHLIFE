import axios from "axios";
import React, { createContext, useState, useEffect, useCallback } from "react";
import logo from "./assets/anasol-logo.png";
import { publicinfoApi } from "../../../axiosInstance";



export const Context = createContext();



const HrmsContext = ({ children }) => {
  const [gdata, setGdata] = useState([]);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme : "light";
  });
  const [lastSseMsgId, setLastSseMsgId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userprofiledata, setUserProfileData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  // ✅ NEW: SSE connection status tracking
  const [sseStatus, setSseStatus] = useState('disconnected');
  const [sseConnectionCount, setSseConnectionCount] = useState(0);


  // Function to fetch and set user profile data
  const fetchAndSetUserProfile = async (employeeId) => {
    try {
      const response = await publicinfoApi.get(`/employee/${employeeId}`);
      setUserProfileData(response.data);
      // Store the profile image in localStorage
      if (response.data.employeeImage) {
        localStorage.setItem("loggedInUserImage", response.data.employeeImage);
      } else {
        localStorage.removeItem("loggedInUserImage");
      }
    } catch (err) {
      console.error("❌ Error fetching user profile data in context:", err);
    }
  };



  useEffect(() => {
    const storedUser = localStorage.getItem("emppayload");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);
      // Fetch full profile data when context loads
      if (parsedUser.employeeId) {
        fetchAndSetUserProfile(parsedUser.employeeId);
      }
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
    // ✅ FIX: Check if userData and employeeId exist before fetching
    if (!userData?.employeeId) return;
    try {
      const res = await axios.get(
        `http://hrms.anasolconsultancyservices.com/api/notification/unread-count/${userData.employeeId}`
      );
      setUnreadCount(res.data);
      console.log("Notification count", res.data);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, [userData?.employeeId]);



  const markAsRead = useCallback(
    async (id) => {
      try {
        setGdata((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
        );
        await axios.post(
          `http://hrms.anasolconsultancyservices.com/api/notification/read/${id}`
        );
        fetchUnreadCount();
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    },
    [fetchUnreadCount]
  );



  const decrementUnreadCount = useCallback(() => {
    setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
  }, []);



  const fetchNotifications = useCallback(async () => {
    // ✅ FIX: Check if userData and employeeId exist before fetching
    if (!userData?.employeeId) return;
    try {
      const res = await axios.get(
        `http://hrms.anasolconsultancyservices.com/api/notification/all/${userData.employeeId}`
      );
      const data = res.data;
      setGdata(data);



      const latestUnread = data.find((msg) => !msg.read);
      setLastSseMsgId(latestUnread ? latestUnread.id : null);



      console.log("Initial notification fetch:", data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [userData?.employeeId]);


  // ✅ NEW: SSE Connection Status Monitor
  useEffect(() => {
    if (sseStatus === 'connected') {
      const statusInterval = setInterval(() => {
        const currentTime = new Date().toLocaleTimeString();
        console.log(`🔵 SSE Connection Status: ${sseStatus.toUpperCase()} | Active Since: ${currentTime} | Connection #${sseConnectionCount}`);
      }, 30000); // Log every 30 seconds when connected

      return () => clearInterval(statusInterval);
    }
  }, [sseStatus, sseConnectionCount]);



  useEffect(() => {
    if (!userData?.employeeId) {
        console.warn("⚠️ SSE connection skipped: Employee ID is not available yet.");
        setSseStatus('waiting_for_employee_id');
        return;
    }
    
    console.log(`🚀 Setting up SSE connection for Employee ID: ${userData.employeeId}...`);
    setSseStatus('connecting');
    
    const connectionNumber = sseConnectionCount + 1;
    setSseConnectionCount(connectionNumber);
    
    const eventSource = new EventSource(
      `http://hrms.anasolconsultancyservices.com/api/notification/subscribe/${userData.employeeId}`
    );



    eventSource.onopen = () => {
      const connectionTime = new Date().toLocaleTimeString();
      setSseStatus('connected');
      console.log(`✅ SSE Connection #${connectionNumber} ESTABLISHED at ${connectionTime}`);
      console.log(`🔗 SSE URL: http://hrms.anasolconsultancyservices.com/api/notification/subscribe/${userData.employeeId}`);
      console.log(`📊 Connection Ready State: ${eventSource.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSED)`);
    };



    eventSource.addEventListener("notification", (event) => {
      try {
        const incoming = JSON.parse(event.data);
        const receivedTime = new Date().toLocaleTimeString();
        console.log(`📨 New Notification (SSE Connection #${connectionNumber}) received at ${receivedTime}:`, incoming);



        setGdata((prev) => {
          const isDuplicate = prev.some((n) => n.id === incoming.id);
          if (isDuplicate) return prev;
          return [incoming, ...prev];
        });



        setLastSseMsgId(incoming.id);
        fetchUnreadCount();



        if (Notification.permission === "granted") {
          const notification = new Notification(incoming.subject, {
            body: incoming.message,
            icon: logo,
            data: { id: incoming.id, link: incoming.link },
          });



          notification.onclick = (e) => {
            e.preventDefault();
            if (incoming.link) {
              window.open(incoming.link, "_self");
            }
            window.focus();
            markAsRead(incoming.id);
            notification.close();
          };
        }
      } catch (err) {
        console.error("⚠️ Error parsing SSE data:", err);
      }
    });



    eventSource.onerror = (err) => {
      const errorTime = new Date().toLocaleTimeString();
      setSseStatus('error');
      console.error(`❌ SSE Connection #${connectionNumber} ERROR at ${errorTime}:`, err);
      console.log(`📊 Connection Ready State: ${eventSource.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSED)`);
      console.log("🔄 EventSource will attempt to reconnect automatically...");
      
      // Set status back to connecting as EventSource will auto-reconnect
      setTimeout(() => setSseStatus('reconnecting'), 1000);
      
      eventSource.close();
    };



    return () => {
      const closeTime = new Date().toLocaleTimeString();
      setSseStatus('disconnected');
      console.log(`🔴 Closing SSE Connection #${connectionNumber} at ${closeTime}`);
      console.log(`📊 Final Connection Ready State: ${eventSource.readyState}`);
      eventSource.close();
    };
  }, [userData?.employeeId, markAsRead, fetchUnreadCount]);



  useEffect(() => {
    // ✅ FIX: This effect will now re-run when userData is set, and the functions inside will have the employeeId
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount, userData]);



  // Save theme to localStorage whenever theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
    console.log(`Theme saved to localStorage: ${theme}`);
  }, [theme]);


  // ✅ NEW: Log SSE status changes
  useEffect(() => {
    const statusTime = new Date().toLocaleTimeString();
    console.log(`🔄 SSE Status Changed to: ${sseStatus.toUpperCase()} at ${statusTime}`);
  }, [sseStatus]);



  return (
    <Context.Provider
      value={{
        gdata,
        setGdata,
        lastSseMsgId,
        markAsRead,
        unreadCount,
        decrementUnreadCount,
        userData,
        setUserData,
        accessToken,
        setAccessToken,
        refreshToken,
        setRefreshToken,
        userprofiledata,
        setUserProfileData,
        theme,
        setTheme,
        sseStatus,
        sseConnectionCount,
      }}
    >
      {children}
    </Context.Provider>
  );
};



export default HrmsContext;
