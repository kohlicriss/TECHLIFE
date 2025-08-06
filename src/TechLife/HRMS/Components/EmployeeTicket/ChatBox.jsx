import { useEffect, useState, useRef } from 'react';

export default function ChatBox({ userRole = 'employee', ticketId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const messageEndRef = useRef(null);
  const reconnectTimeout = useRef(null);

  // Fetch existing messages safely
  const fetchInitialMessages = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/${userRole}/tickets/${ticketId}/messages`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.warn('⚠️ Unexpected data format:', data);
        setMessages([]); // fallback to empty array
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setMessages([]); // fallback on error
    }
  };

  // WebSocket connection
  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8080/ws-ticket?ticketId=${ticketId}`);

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
    // Send to backend via REST API
    await fetch(`http://localhost:8080/api/${userRole}/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messagePayload),
    });

    // 💡 Immediately update UI
    setMessages((prev) => [...prev, messagePayload]);

    // Send over WebSocket (optional)
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(messagePayload));
      console.log('📤 Sent over WebSocket');
    } else {
      console.warn('⚠️ WebSocket not open');
    }

  } catch (err) {
    console.error('❌ Send failed:', err);
  } finally {
    setInput('');
  }
};


  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {Array.isArray(messages) && messages.map((msg, i) => (
          <div
            key={`${msg.repliedAt}-${i}`}
            className={`max-w-[80%] px-4 py-2 rounded-lg shadow text-sm ${
              msg.repliedBy === userRole
                ? 'ml-auto bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-900 rounded-bl-none'
            }`}
          >
            <p>{msg.replyText}</p>
            <div className="text-right text-xs mt-1 opacity-60">
              {msg.repliedAt
                ? new Date(msg.repliedAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                : ''}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="flex items-center gap-2 p-2 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
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
