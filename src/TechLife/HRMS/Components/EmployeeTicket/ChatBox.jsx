import { useEffect, useState, useRef } from "react";

export default function ChatBox({ userRole = "employee", ticketId, ticketStatus }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const containerRef = useRef(null);

  const isResolved = ticketStatus?.toLowerCase() === "resolved";

  // ✅ Helper: deduplicate + sort messages
  const dedupeMessages = (msgs) => {
    const seen = new Map();
    msgs.forEach((m) => {
      // Use id if present, otherwise use repliedAt+replyText as fallback
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

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const dateKey = formatDate(msg.repliedAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {});

  const fetchInitialMessages = async () => {
  const token = localStorage.getItem("accessToken");

  try {
    const res = await fetch(
      `https://techlife.anasolconsultancyservices.com/api/ticket/employee/tickets/${ticketId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    setMessages(Array.isArray(data) ? dedupeMessages(data) : []);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    setMessages([]);
  }
};


  const connectWebSocket = () => {
    const ws = new WebSocket(
      `wss://techlife.anasolconsultancyservices.com/ws-ticket?ticketId=${ticketId}`
    );

    ws.onopen = () => console.log("✅ WebSocket connected");

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setMessages((prev) => dedupeMessages([...prev, payload]));
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
  if (!input.trim() || isResolved) return;

  const token = localStorage.getItem("accessToken");

  const messagePayload = {
    ticketId,
    replyText: input,
    repliedBy: userRole,
  };

  try {
    await fetch(
      `https://techlife.anasolconsultancyservices.com/api/ticket/employee/tickets/${ticketId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messagePayload),
      }
    );

    console.log("📤 Message sent to backend, waiting for WebSocket...");
  } catch (err) {
    console.error("❌ Send failed:", err);
  } finally {
    setInput("");
  }
};


  // Auto-scroll when new messages arrive
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
