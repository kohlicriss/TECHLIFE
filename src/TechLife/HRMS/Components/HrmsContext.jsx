import axios from "axios";
import React, { createContext, useState, useEffect, useCallback } from "react";
export const Context = createContext();

const HrmsContext = ({ children }) => {
  const [gdata, setGdata] = useState([]);
  const [lastSseMsgId, setLastSseMsgId] = useState(null);
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

  // Memoized function to mark a notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      // Optimistically update the UI first for a faster feel
      setGdata((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
      );
      await axios.post(`http://localhost:8081/api/notifications/read/${id}`);
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Optional: Revert state on error if needed
    }
  }, []);

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

        // Add notification to state, preventing duplicates
        setGdata((prev) => {
          const isDuplicate = prev.some((n) => n.id === incoming.id);
          if (isDuplicate) return prev;
          return [incoming, ...prev];
        });

        setLastSseMsgId(incoming.id);

        // THIS IS THE POPUP LOGIC:
        // It will only run if you have clicked "Allow" in the browser prompt.
        if (Notification.permission === "granted") {
          const notification = new Notification(incoming.subject, {
            body: incoming.message,
            icon: "/favicon.ico", // Suggestion: Use a real icon path like your site's favicon
            data: { id: incoming.id, link: incoming.link },
          });

          // This handles what happens when you click the popup
          notification.onclick = (e) => {
            e.preventDefault();
            if (incoming.link) {
              window.open(incoming.link, "_self"); // Navigates to the link in the current tab
            }
            window.focus(); // Brings the tab into focus
            markAsRead(incoming.id); // Marks as read
            notification.close(); // Closes the popup
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

    // Cleanup function to close the connection when the component unmounts
    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
    };
  }, [username, markAsRead]); // Dependencies for the effect

  // Initial fetch of notifications
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
