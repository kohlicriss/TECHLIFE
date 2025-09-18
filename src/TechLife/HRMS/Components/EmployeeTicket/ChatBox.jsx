import { useEffect, useState, useRef } from "react";

export default function ChatBox({ userRole = "employee", ticketId, ticketStatus }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const containerRef = useRef(null);
  const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);


  const isResolved = ticketStatus?.toLowerCase() === "resolved";

 
  const dedupeMessages = (msgs) => {
    const seen = new Map();
    msgs.forEach((m) => {
     
      const key = m.id ? String(m.id) : `${m.repliedAt}-${m.replyText}`;
      seen.set(key, m);
    });
    return Array.from(seen.values()).sort(
      (a, b) => new Date(a.repliedAt) - new Date(b.repliedAt)
    );
  };
  

  const formatDate = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) return "Today";
    if (msgDate.toDateString() === yesterday.toDateString()) return "Yesterday";
    return msgDate.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  
  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = formatDate(msg.repliedAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});


const fetchMessages = async (pageToFetch) => {
  const token = localStorage.getItem("accessToken");
  if (!ticketId || !token) return;

  try {
    setLoading(true);
    const res = await fetch(
      `https://hrms.anasolconsultancyservices.com/api/ticket/employee/tickets/${ticketId}/messages?page=${pageToFetch}&size=20`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const messagesArray = Array.isArray(data?.content) ? data.content : [];

    if (messagesArray.length === 0) {
      setHasMore(false);
    } else {
      setMessages((prev) =>
        dedupeMessages([...messagesArray, ...prev]) 
      );
    }
  } catch (err) {
    console.error("❌ Fetch error:", err);
  } finally {
    setLoading(false);
  }
};

const formatChatTimeIST = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString.endsWith("Z") ? dateString : dateString + "Z");
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, 
  });
};


 const connectWebSocket = () => {
  if (!ticketId) {
    console.error("❌ Missing ticketId, cannot open WebSocket");
    return;
  }
  const token = localStorage.getItem("accessToken");

  const ws = new WebSocket(
    `wss://hrms.anasolconsultancyservices.com/api/ticket?ticketId=${ticketId}&token=${token}`
  );

  ws.onopen = () => console.log("✅ WebSocket connected");

  ws.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      console.log("📩 Incoming WS message:", payload);

      if (payload && payload.replyText) {
        setMessages((prev) => dedupeMessages([...prev, payload]));
      }
    } catch (err) {
      console.error("❌ WS parse error:", err, event.data);
    }
  };

ws.onclose = () => {
  console.warn("WebSocket closed, reconnecting in 5s...");
  setTimeout(connectWebSocket, 5000);
};


  ws.onerror = (err) => console.error("❌ WebSocket error:", err);

  socketRef.current = ws;
};


const sendMessage = async () => {
  if (!input.trim() || isResolved) return;

  const token = localStorage.getItem("accessToken");
  const messageToSend = {
    ticketId,
    replyText: input,
    repliedBy: userRole,
    repliedAt: new Date().toISOString(),
  };

  try {
    await fetch(
      `https://hrms.anasolconsultancyservices.com/api/ticket/employee/tickets/${ticketId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageToSend),
      }
    );

    //setMessages(prev => dedupeMessages([...prev, messageToSend]));
  } catch (err) {
    console.error("❌ Send failed:", err);
  } finally {
    setInput("");
  }
};

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 useEffect(() => {
  setPage(0);
  setMessages([]);
  setHasMore(true);
  fetchMessages(0);
  connectWebSocket();
  return () => {
    if (socketRef.current) socketRef.current.close();
    clearTimeout(reconnectTimeout.current);
  };
}, [ticketId]);

useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const handleScroll = () => {
    if (container.scrollTop === 0 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  container.addEventListener("scroll", handleScroll);
  return () => container.removeEventListener("scroll", handleScroll);
}, [page, hasMore, loading]);
const prevScrollHeightRef = useRef(0);

useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  if (loading) {
    prevScrollHeightRef.current = container.scrollHeight;
  } else {
    const diff = container.scrollHeight - prevScrollHeightRef.current;
    if (diff > 0) {
      container.scrollTop = diff; 
    }
  }
}, [messages, loading]);



  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl border shadow">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="text-center text-xs text-gray-500 my-2">{date}</div>

            {msgs.map((msg, i) => (
              <div
                key={`${msg.id || msg.repliedAt}-${i}`}
                className={`flex ${
                  msg.repliedBy === userRole ? "justify-end" : "justify-start"
                } mb-2`}
              >
                <div
                  className={`px-4 py-2 rounded-lg shadow text-sm break-words ${
                    msg.repliedBy === userRole
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                  style={{ maxWidth: "80%", width: "fit-content" }}
                >
                  <p className="whitespace-pre-wrap">{msg.replyText}</p>
                  <div className="text-right text-xs mt-1 opacity-60">
                 {msg.repliedAt || msg.clientTime
  ? formatChatTimeIST(msg.repliedAt || msg.clientTime)
  : ""}

                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="flex items-center gap-2 p-2 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={
            isResolved
              ? "This ticket is resolved. You cannot send messages."
              : "Type your message"
          }
          disabled={isResolved}
          className={`flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            isResolved
              ? "bg-gray-200 cursor-not-allowed text-red-500"
              : "focus:ring-blue-400"
          }`}
        />
        <button
          onClick={sendMessage}
          disabled={isResolved}
          className={`px-4 py-2 rounded text-white ${
            isResolved
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
}