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
  const [showChat, setShowChat] = useState(false);
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
    onReply(); // call backend API if needed
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
      <div className="bg-white w-full max-w-[calc(100vw-5rem)] md:max-w-4xl rounded-2xl shadow-2xl relative transition-all duration-300">
        <div className="p-6 overflow-y-auto h-[90vh] scroll-smooth">

          {/* Ticket View */}
          {!showChat ? (
            <>
              <h2 className="text-3xl font-extrabold text-blue-700 mb-6">🎫 Ticket Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[15px] text-gray-800 mb-8">
                <p><span className="font-semibold">👤 Employee ID:</span> {ticket.employeeId}</p>
                <p><span className="font-semibold">📛 Name:</span> {ticket.employeeName}</p>
                <p><span className="font-semibold">📝 Issue:</span> {ticket.title}</p>
                <p><span className="font-semibold">⚠️ Priority:</span> {ticket.priority}</p>
                <p className="md:col-span-2">
                  <span className="font-semibold">📅 Created:</span>{" "}
                  {ticket.sentAt ? new Date(ticket.sentAt).toLocaleString() : ""}
                </p>
                <div className="md:col-span-2">
                  <label className="block font-medium text-gray-900 mb-2">📌 Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Pending</option>
                    <option>Unsolved</option>
                    <option>Opened</option>
                    <option>Resolved</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowChat(true)}
                className="mb-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all duration-200 shadow"
              >
                💬 Open Chat
              </button>

              <div className="mt-10 flex justify-end gap-4">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
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
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          ) : (
            // Chat View
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-700">💬 Chat with {ticket.employeeName}</h2>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Back to Ticket
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-xl border mb-4 shadow-inner">
                {/* Ticket initial message */}
                <div className="bg-white text-gray-900 border rounded-bl-none px-4 py-2 max-w-[75%] text-sm rounded-2xl shadow">
                  <p>{ticket.title}</p>
                  <div className="text-[10px] mt-1 text-left text-gray-500">
                    {ticket.sentAt && new Date(ticket.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Replies */}
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

              {ticket.status === "Resolved" ? (
  <div className="text-center text-red-600 font-medium py-4 border-t border-gray-200">
    🚫 This ticket is Resolved. No further replies are allowed.
  </div>
) : (
  <div className="space-y-3">
    <label className="block font-medium text-gray-800">Reply as Admin</label>
    <textarea
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleReply();
        }
      }}
      rows="3"
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 resize-none text-sm shadow"
      placeholder="Type your reply..."
    />
    <button
      onClick={handleReply}
      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
    >
      Send
    </button>
    {messageSent && (
      <div className="text-green-600 text-sm text-center animate-pulse">
        ✅ Reply Sent
      </div>
    )}
  </div>
)}

            </>
          )}
        </div>

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
