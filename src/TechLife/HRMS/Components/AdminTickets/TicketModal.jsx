import React, { useState, useEffect, useRef } from "react";

export default function TicketModal({
  ticket,
  onClose,
  onReply,
  replyText,
  setReplyText,
  newStatus,
  setNewStatus,
  onStatusChange,
}) {
  const [replies, setReplies] = useState(ticket.replies || []);
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws-ticket?ticketId=${ticket.id}`);
    socketRef.current = ws;

    ws.onopen = () => console.log("✅ WebSocket connected");
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setReplies((prev) => [...prev, msg]);
    };
    ws.onerror = (err) => console.error("❌ WebSocket error:", err);
    ws.onclose = () => console.log("🔌 WebSocket disconnected");

    return () => ws.close();
  }, [ticket.id]);

  const handleReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    const newReply = {
      ticketId: ticket.id,
      replyText: trimmed,
      repliedBy: "admin",
      repliedAt: new Date().toISOString(),
      employeeId: ticket.employeeId,
    };

    socketRef.current.send(JSON.stringify(newReply));
    onReply();
    setReplyText("");
    setMessageSent(true);
    setTimeout(() => setMessageSent(false), 2000);
  };

  const handleStatusChange = async () => {
    if (!onStatusChange) return alert("⚠️ Status handler missing");
    try {
      setLoading(true);
      await onStatusChange(ticket.id, newStatus);
    } catch (error) {
      console.error("❌ Failed to update status", error);
      alert("Status update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[95vw] md:max-w-6xl rounded-2xl shadow-2xl relative transition-all duration-300">
        <div className="p-8 overflow-y-auto max-h-[90vh] scroll-smooth">

          {/* Top Info Row */}
          {/* Top Info Row - Horizontal Layout */}
<div className="mb-6 space-y-2">
  <h2 className="text-2xl font-bold text-blue-700">💬 Chat with {ticket.employeeName}</h2>
  <div className="flex flex-wrap gap-8 text-sm text-gray-700">
    <p>
      <span className="font-semibold">📅 Sent:</span>{" "}
      {ticket.sentAt && new Date(ticket.sentAt).toLocaleString()}
    </p>
    <p>
      <span className="font-semibold">👤 Employee ID:</span>{" "}
      {ticket.employeeId}
    </p>
    <p>
      <span className="font-semibold">📝 Issue:</span>{" "}
      {ticket.title}
    </p>
    <p>
      <span className="font-semibold">⚠️ Priority:</span>{" "}
      {ticket.priority}
    </p>
    <div>
      <label className="block font-semibold mb-1">📌 Update Status</label>
      <select
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
      >
        <option>Pending</option>
        <option>Unsolved</option>
        <option>Opened</option>
        <option>Resolved</option>
      </select>
    </div>
  </div>
</div>


          {/* Chat Area */}
          <div className="max-h-80 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-xl border mb-6 shadow-inner">
            <div className="bg-white text-gray-900 border rounded-bl-none px-4 py-2 max-w-[75%] text-sm rounded-2xl shadow">
              <p>{ticket.description}</p>
              <div className="text-[10px] mt-1 text-left text-gray-500">
                {ticket.sentAt && new Date(ticket.sentAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {replies.map((msg, idx) => (
              <div
                key={idx}
                className={`relative max-w-[75%] px-4 py-2 text-sm rounded-2xl shadow transition
                  ${msg.repliedBy === "admin"
                    ? "ml-auto bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-900 border rounded-bl-none"}
                `}
              >
                <p>{msg.replyText}</p>
                <div className={`text-[10px] mt-1 ${msg.repliedBy === "admin" ? "text-white text-right" : "text-gray-500 text-left"}`}>
                  {new Date(msg.repliedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} {msg.repliedBy === "admin" && "✓✓"}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Input */}
         {/* Reply Input - Smaller box with Send button inside */}
<div className="mb-6">
  <label className="block font-medium text-gray-800 mb-1">Reply as Admin</label>
  <div className="flex items-center gap-2">
    <textarea
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleReply();
        }
      }}
      rows="2"
      className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 resize-none text-sm shadow"
      placeholder="Type your reply..."
    />
    <button
      onClick={handleReply}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition whitespace-nowrap"
    >
      Send
    </button>
  </div>
  {messageSent && (
    <div className="text-green-600 text-sm text-center mt-2 animate-pulse">
      ✅ Reply Sent
    </div>
  )}
</div>


          {/* Action Buttons */}
          <div className="mt-4 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
            >
              Close
            </button>
            <button
              onClick={handleStatusChange}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                loading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "Saving..." : "Save Status"}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl transition"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
