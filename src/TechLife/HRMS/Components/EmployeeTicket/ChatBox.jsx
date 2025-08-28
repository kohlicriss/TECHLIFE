import { useEffect, useState, useRef } from "react";

export default function ChatBox({ userRole = "employee", ticketId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const containerRef = useRef(null);

  // Format dates into Today / Yesterday / dd MMM yyyy
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

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = formatDate(msg.repliedAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  // Fetch existing messages safely
  const fetchInitialMessages = async () => {
    try {
      const res = await fetch(
        `http://192.168.0.246:8080/api/employee/tickets/${ticketId}/messages`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.warn("⚠️ Unexpected data format:", data);
        setMessages([]);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setMessages([]);
    }
  };

  const connectWebSocket = () => {
    const ws = new WebSocket(
      `ws://192.168.0.246:8080/ws-ticket?ticketId=${ticketId}`
    );

    ws.onopen = () => console.log("✅ WebSocket connected");

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setMessages((prev) => {
          const alreadyExists = prev.some(
            (msg) =>
              msg.replyText === payload.replyText &&
              msg.repliedBy === payload.repliedBy &&
              msg.repliedAt === payload.repliedAt
          );
          return alreadyExists ? prev : [...prev, payload];
        });
      } catch (err) {
        console.error("❌ Failed to parse WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      console.warn("⚠️ WebSocket closed. Reconnecting...");
      reconnectTimeout.current = setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (err) => console.error("❌ WebSocket error:", err);

    socketRef.current = ws;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messagePayload = {
      ticketId,
      replyText: input,
      repliedBy: userRole,
      repliedAt: new Date().toISOString(),
    };

    try {
      await fetch(
        `http://192.168.0.246:8080/api/employee/tickets/${ticketId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messagePayload),
        }
      );

      setMessages((prev) => [...prev, messagePayload]);

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(messagePayload));
        console.log("📤 Sent over WebSocket");
      } else {
        console.warn("⚠️ WebSocket not open");
      }
    } catch (err) {
      console.error("❌ Send failed:", err);
    } finally {
      setInput("");
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Only auto-scroll if user is near bottom
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (isNearBottom) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    fetchInitialMessages();
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      clearTimeout(reconnectTimeout.current);
    };
  }, [ticketId]);

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
                key={`${msg.repliedAt}-${i}`}
                className={`flex ${
                  msg.repliedBy === userRole
                    ? "justify-end"
                    : "justify-start"
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
                    {msg.repliedAt
                      ? new Date(msg.repliedAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
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
          placeholder="Type your message"
          className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
