import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const Context = createContext();

const HrmsContext = ({ children }) => {
  const [gdata, setGdata] = useState([]);
  const [lastSseMsgId, setLastSseMsgId] = useState(null);
  const username = "ACS00000005"; // Your static username

  // Request Notification Permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.warn("Notification permission denied or dismissed.");
        }
      });
    }
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await axios.post(`http://localhost:8081/api/notifications/read/${id}`);
      setGdata((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Initial notification fetch
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

  // SSE connection
  useEffect(() => {
    const eventSource = new EventSource(
      `http://localhost:8081/api/notifications/subscribe/${username}`
    );

    eventSource.addEventListener("notification", (event) => {
      try {
        const incoming = JSON.parse(event.data);
        console.log("New Notification (SSE):", incoming);

        setGdata((prev) => {
          const isDuplicate = prev.some((n) => n.id === incoming.id);
          if (isDuplicate) return prev;
          return [incoming, ...prev];
        });

        setLastSseMsgId(incoming.id);

        // System Notification
        if (Notification.permission === "granted") {
          const notification = new Notification(incoming.subject, {
            body: incoming.message,
            icon: "/path/to/your/icon.png", // Optional
            data: { id: incoming.id, link: incoming.link },
          });

          notification.onclick = (e) => {
            e.preventDefault();
            if (incoming.link) {
              window.focus();
              window.open(incoming.link, "_self");
            }
            markAsRead(incoming.id);
            notification.close();
          };
        }
      } catch (err) {
        console.error("⚠ Error parsing SSE data:", err);
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
  }, [username, markAsRead]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <Context.Provider value={{ gdata, setGdata, lastSseMsgId, markAsRead }}>
      {children}
    </Context.Provider>
  );
};

export default HrmsContext;
