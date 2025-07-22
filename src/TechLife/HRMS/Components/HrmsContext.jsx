import axios from "axios";
import React, { createContext, useState, useEffect, useCallback } from "react";
export const Context = createContext();

const HrmsContext = ({ children }) => {
  const [gdata, setGdata] = useState([]);
  const [lastSseMsgId, setLastSseMsgId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const username = "ACS00000005"; // Your static username

  // Request Notification Permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("✅ Notification permission granted.");
        } else {
          console.warn("🔔 Notification permission was not granted.");
        }
      });
    }
  }, []);

  // 2. New function to fetch the unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      // Corrected the URL from '/notification/' to '/notifications/' for consistency
      const res = await axios.get(
        `http://localhost:8081/api/notifications/unread-count/${username}`
      );
      setUnreadCount(res.data);
      console.log("Notification count", res.data);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, [username]);

  // Memoized function to mark a notification as read
  const markAsRead = useCallback(
    async (id) => {
      try {
        setGdata((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
        );
        await axios.post(`http://localhost:8081/api/notifications/read/${id}`);
        fetchUnreadCount(); // 3. Refresh count after marking as read
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    },
    [fetchUnreadCount]
  ); // Added dependency

  // Memoized function to fetch all notifications initially
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:8081/api/notifications/all/${username}`
      );
      const data = res.data;
      setGdata(data);

      const unread = data.find((msg) => !msg.read);
      setLastSseMsgId(unread ? unread.id : null);

      console.log("Initial notification fetch:", data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [username]);

  // Effect for setting up the SSE connection
  useEffect(() => {
    console.log("Setting up SSE connection...");
    const eventSource = new EventSource(
      `http://localhost:8081/api/notifications/subscribe/${username}`
    );

    eventSource.onopen = () => {
      console.log("SSE connection established.");
    };

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
        fetchUnreadCount(); // 3. Refresh count when a new notification arrives

        if (Notification.permission === "granted") {
          const notification = new Notification(incoming.subject, {
            body: incoming.message,
            icon: "/favicon.ico",
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
      console.error("SSE connection error:", err);
      eventSource.close();
    };

    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, [username, markAsRead, fetchUnreadCount]); // Added dependency

  // Initial fetch of notifications and unread count
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount(); // 3. Fetch count on initial load
  }, [fetchNotifications, fetchUnreadCount]);

  return (
    // 4. Expose unreadCount in the context provider
    <Context.Provider
      value={{ gdata, setGdata, lastSseMsgId, markAsRead, unreadCount }}
    >
      {children}
    </Context.Provider>
  );
};

export default HrmsContext;
