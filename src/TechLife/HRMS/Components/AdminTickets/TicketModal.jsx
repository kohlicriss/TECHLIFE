import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";

export default function TicketModal({
  ticket,
  onClose,
  replyText,
  setReplyText,
  roles,
  onStatusUpdate,
}) {
  const [showChat, setShowChat] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const [newStatus, setNewStatus] = useState(ticket?.status || "");

  // ✅ Format date
  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const groupedReplies = useMemo(() => {
    const groups = {};
    replies.forEach((msg) => {
      const dateLabel = formatDate(msg.repliedAt);
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(msg);
    });
    return groups;
  }, [replies]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  // WebSocket setup
  useEffect(() => {
    if (!ticket?.ticketId) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const ws = new WebSocket(
      `ws://192.168.0.247:8088/ws-ticket?ticketId=${ticket.ticketId}`
    );
    socketRef.current = ws;

    ws.onopen = () => console.log("✅ WebSocket connected for", ticket.ticketId);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setReplies((prev) => {
          const exists = prev.some(
            (r) =>
              r.replyText === msg.replyText &&
              r.repliedAt === msg.repliedAt &&
              r.repliedBy === msg.repliedBy
          );
          return exists ? prev : [...prev, msg];
        });
      } catch (e) {
        console.error("Error parsing WebSocket message", e);
      }
    };

    ws.onerror = (err) => console.error("❌ WebSocket error:", err);
    ws.onclose = () => console.log("🔌 WebSocket disconnected");

    return () => {
      ws.close();
    };
  }, [ticket?.ticketId]);

 useEffect(() => {
  const fetchReplies = async () => {
    if (!ticket?.ticketId) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://hrms.anasolconsultancyservices.com/api/ticket/admin/tickets/${ticket.ticketId}/reply`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: 0,
            size: 100, // fetch more messages if needed
          },
        }
      );

      const messagesArray = Array.isArray(response.data?.content)
        ? response.data.content
        : [];

      setReplies(messagesArray);
    } catch (error) {
      console.error("❌ Failed to fetch previous replies", error);
      setReplies([]); // fallback
    }
  };

  fetchReplies();
}, [ticket?.ticketId, showChat]);


  const handleReply = async () => {
    if (!replyText.trim() || !ticket?.ticketId) return;

    const token = localStorage.getItem("accessToken");

    const payload = {
      replyText: replyText.trim(),
      repliedBy: "admin",
      status: newStatus.toUpperCase(),
      employeeId: ticket.employeeId || "DEFAULT_EMPLOYEE",
      roles:
        roles && typeof roles === "string"
          ? `ROLE_${roles.toUpperCase()}`
          : "ROLE_HR",
      repliedAt: new Date().toISOString(),
    };

    try {
      await axios.put(
        `https://hrms.anasolconsultancyservices.com/api/ticket/admin/tickets/${ticket.ticketId}/reply`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReplyText("");
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 2000);
    } catch (error) {
      console.error("❌ Reply failed", error.response?.data || error.message);
    }
  };

  const handleStatusChange = async () => {
    if (!ticket?.ticketId) return;

    const token = localStorage.getItem("accessToken");

    const payload = {
      replyText: replyText.trim() || "Status updated",
      repliedBy: "admin",
      status: newStatus,
      employeeId: ticket.employeeId || "DEFAULT_EMPLOYEE",
      roles:
        roles && typeof roles === "string"
          ? `ROLE_${roles.toUpperCase()}`
          : "ROLE_HR",
      repliedAt: new Date().toISOString(),
    };

    try {
      const res = await axios.put(
        `https://hrms.anasolconsultancyservices.com/api/ticket/admin/tickets/${ticket.ticketId}/reply`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReplies((prev) => [...prev, res.data]);
      setNewStatus(res.data.status);

      if (onStatusUpdate) {
        onStatusUpdate(res.data);
      }

      onClose();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const displayRole = (role) => role?.replace(/^ROLE_/, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[calc(100vw-5rem)] md:max-w-4xl rounded-2xl shadow-2xl relative transition-all duration-300">
        <div className="p-6 overflow-y-auto h-[90vh] scroll-smooth">
          {!showChat ? (
            <>
              <h2 className="text-3xl font-extrabold text-blue-700 mb-6">
                🎫 Ticket Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[15px] text-gray-800 mb-8">
                <p>
                  <span className="font-semibold">👤 Employee ID:</span>{" "}
                  {ticket.employeeId}
                </p>
                <p>
                  <span className="font-semibold">📛 Ticket ID:</span>{" "}
                  {ticket.ticketId}
                </p>
                <p>
                  <span className="font-semibold">📝 Issue:</span> {ticket.title}
                </p>
                <p>
                  <span className="font-semibold">🧑‍💼 Role:</span>{" "}
                  {displayRole(ticket.roles)}
                </p>
                <p>
                  <span className="font-semibold">⚠️ Description:</span>{" "}
                  {ticket.description}
                </p>
                <p>
                  <span className="font-semibold">⚠️ Priority:</span>{" "}
                  {ticket.priority}
                </p>
                <p className="md:col-span-2">
                  <span className="font-semibold">📅 Created:</span>{" "}
                  {ticket.sentAt
                    ? new Date(ticket.sentAt).toLocaleString()
                    : ""}
                </p>

                <div className="md:col-span-2">
                  <label className="block font-medium text-gray-900 mb-2">
                    📌 Update Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Unsolved">Unsolved</option>
                    <option value="Resolved">Resolved</option>
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
                  {loading ? "Saving..." : "Update Status"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-700">
                  💬 Chat with {ticket.employeeName}
                </h2>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Back to Ticket
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-xl border mb-4 shadow-inner">
                <div className="bg-white text-gray-900 border rounded-bl-none px-4 py-2 max-w-[75%] text-sm rounded-2xl shadow">
                  <p>{ticket.title}</p>
                  <div className="text-[10px] mt-1 text-left text-gray-500">
                    {ticket.sentAt &&
                      new Date(ticket.sentAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </div>
                </div>

                {Object.keys(groupedReplies).map((date) => (
                  <div key={date}>
                    <div className="text-center text-xs text-gray-500 my-2">
                      {date}
                    </div>
                    {groupedReplies[date].map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.repliedBy === "admin"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`inline-block px-4 py-2 text-sm rounded-2xl shadow transition
                            ${
                              msg.repliedBy === "admin"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white text-gray-900 border rounded-bl-none"
                            }`}
                        >
                          <p className="whitespace-pre-line break-words">
                            {msg.replyText}
                          </p>
                          <div
                            className={`text-[10px] mt-1 ${
                              msg.repliedBy === "admin"
                                ? "text-white text-right"
                                : "text-gray-500 text-left"
                            }`}
                          >
                            {new Date(msg.repliedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            {msg.repliedBy === "admin" && "✓✓"}
                          </div>
                        </div>
                      </div>
                    ))}
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
                  <label className="block font-medium text-gray-800">
                    Reply as Admin
                  </label>
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
