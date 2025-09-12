import { useEffect, useRef, useState, useContext } from "react";
import { CheckCircle2, LayoutDashboard, Ticket } from "lucide-react";
import Filters from "./Filters";
import TicketCard from "./TicketCard";
import TicketModal from "./TicketModal";
import TicketStats from "./TicketStats";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../HrmsContext";
import { ticketsApi } from "../../../../axiosInstance";

export default function TicketDashboard() {
  const { userData } = useContext(Context);
  const { empID } = useParams();
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [newStatus, setNewStatus] = useState("Pending");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 9;

  const wsRef = useRef(null);
  const repliedBy = "admin";
  const navigate = useNavigate();

  // ✅ Normalize role
  const rawRole = Array.isArray(userData?.roles)
    ? userData.roles[0]
    : userData?.roles || "";
  const normalizedRole =
    typeof rawRole === "string"
      ? rawRole.toUpperCase().startsWith("ROLE_")
        ? rawRole.toUpperCase()
        : "ROLE_" + rawRole.toUpperCase()
      : "";

  const statusIcons = {
    all: <LayoutDashboard size={20} />,
    resolved: <CheckCircle2 size={20} />,
  };

  const statusLabels = {
    all: "All",
    resolved: "Resolved",
  };

  const statuses = Object.keys(statusIcons);

  // ✅ Fetch tickets
  const fetchTickets = async () => {
    try {
      if (!normalizedRole || !empID) {
        throw new Error("Missing role or employee ID");
      }

      const res = await ticketsApi.get(
        `admin/tickets/role/${normalizedRole}/${empID}`
      );

      setTickets(res.data || []);
      console.log("Fetched tickets:", res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets");
    }
  };

  // ✅ WebSocket
  const connectWebSocket = () => {
    const socket = new WebSocket(`wss://techlife.anasolconsultancyservices.com/api/ticket`);
    socket.onopen = () => console.log("✅ WebSocket connected");

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      updateTicketReplies(message);
    };

    socket.onclose = () => {
      console.warn("⚠️ WS disconnected. Reconnecting...");
      setTimeout(connectWebSocket, 3000);
    };

    socket.onerror = (e) => console.error("❌ WS error:", e);

    wsRef.current = socket;
  };

  // ✅ Update replies in UI
  const updateTicketReplies = (replyDTO) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.ticketId === replyDTO.ticketId
          ? {
              ...ticket,
              replies: [...(ticket.replies || []), replyDTO],
              status: replyDTO.status || ticket.status,
            }
          : ticket
      )
    );

    if (selectedTicket?.ticketId === replyDTO.ticketId) {
      setSelectedTicket((prev) => ({
        ...prev,
        replies: [...(prev.replies || []), replyDTO],
        status: replyDTO.status || prev.status,
      }));
    }
  };

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    const payload = {
      ticketId: selectedTicket.ticketId,
      replyText,
      repliedBy,
      repliedAt: new Date().toISOString(),
      status: newStatus || selectedTicket.status,
      employeeId: selectedTicket.employeeId,
      roles: selectedTicket.roles,
    };

    try {
      await fetch(
        `https://techlife.anasolconsultancyservices.com/api/ticket/admin/tickets/${selectedTicket.ticketId}/reply`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      setMessages((prev) => [...prev, payload]);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      }

      setReplyText("");
    } catch (err) {
      console.error("Reply failed", err);
    }
  };
  

  const handleStatusChange = async (statusToUpdate) => {
    if (!selectedTicket) return;

    const payload = {
      ticketId: selectedTicket.ticketId,
      replyText: "",
      repliedBy,
      repliedAt: new Date().toISOString(),
      status: statusToUpdate,
      employeeId: selectedTicket.employeeId,
      roles: selectedTicket.roles,
    };

    try {
      await fetch(
        `https://techlife.anasolconsultancyservices.com/api/ticket/admin/tickets/${selectedTicket.ticketId}/reply`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    } catch (err) {
      console.error("Status change failed", err);
    }
  };

  const applyDateFilter = (ticket) => {
    if (dateFilter === "All") return true;

    const now = new Date();
    const created = ticket.sentAt ? new Date(ticket.sentAt) : null;
    if (!created || isNaN(created)) return false;

    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);

    if (dateFilter === "Today") {
      return (
        created.getDate() === now.getDate() &&
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }
    if (dateFilter === "Last 7 days") return daysDiff <= 7;
    if (dateFilter === "Last 30 days") return daysDiff <= 30;

    return true;
  };

  const filtered = tickets
    .filter(
  (t) =>
    filterStatus === "all" ||
    t.status?.toLowerCase() === filterStatus.toLowerCase()
)

    .filter(applyDateFilter)
    .filter((t) => {
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      return (
        t.employeeName?.toLowerCase().includes(term) ||
        String(t.employeeId || "").toLowerCase().includes(term) ||
        t.priority?.toLowerCase().includes(term) ||
        t.title?.toLowerCase().includes(term) ||
        t.status?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filtered.length / ticketsPerPage);
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filtered.slice(indexOfFirstTicket, indexOfLastTicket);

  const sidebarItems = [{ tab: "My Tickets", icon: Ticket }];

  const handleTabClick = (tab) => {
    if (tab === "My Tickets") {
      navigate(`/tickets/employee/${empID}`);
    }
  };

  // ✅ Load tickets and connect WebSocket
  useEffect(() => {
    fetchTickets();
  }, [normalizedRole, empID]);

  useEffect(() => {
    connectWebSocket();
    return () => wsRef.current?.close();
  }, []);

  return (
    <div className="flex flex-row min-h-screen bg-gray-50">
      {/* Main Content Left */}
      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-[url('/your-image.jpg')] bg-cover bg-center">
          <div className="w-full h-full bg-gradient-to-b from-white/20 via-white/80 to-white"></div>
        </div>

        <div className="relative z-10 px-4">
          <Filters
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {error && (
            <div className="bg-red-100 text-red-700 p-2 border rounded mb-4">
              {error}
            </div>
          )}

          <TicketStats tickets={tickets} />

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTickets.map((t) => (
              <TicketCard
                key={t.ticketId}
                {...t}
                onClick={() => {
                  setSelectedTicket(t);
                  setNewStatus(t.status);
                }}
              />
            ))}
          </div>

          {/* ✅ Pagination Controls */}
          <div className="flex justify-center items-center space-x-2 my-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1 border rounded ${
                  currentPage === num
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                {num}
              </button>
            ))}
            

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {selectedTicket && (
          <TicketModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onReply={handleReply}
            replyText={replyText}
            setReplyText={setReplyText}
            newStatus={newStatus}
            setNewStatus={setNewStatus}
            onStatusUpdate={(updatedTicket) => {
              setTickets((prev) =>
                prev.map((t) =>
                  t.ticketId === updatedTicket.ticketId
                    ? { ...t, status: updatedTicket.status }
                    : t
                )
              );

              setSelectedTicket((prev) =>
                prev ? { ...prev, status: updatedTicket.status } : prev
              );
            }}
          />
        )}
      </main>

      {/* Sidebar on the Right */}
      <aside
        className={`sm:flex flex-col bg-white border-l border-gray-200 transition-all duration-200 ${
          isSidebarCollapsed ? "w-[60px]" : "w-[250px]"
        } hidden sm:flex sm:sticky sm:top-0 h-screen`}
      >
        {/* Collapse/Expand Button */}
        <div className="flex justify-start p-1.5 items-center">
          <motion.button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-700 focus:outline-none p-1.5 rounded-full hover:bg-gray-100"
            transition={{ duration: 0.3 }}
          >
            {isSidebarCollapsed ? (
              <FaArrowRight size={14} />
            ) : (
              <FaArrowLeft size={14} />
            )}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-1.5">
          {statuses.map((status) => (
            <motion.button
              key={status}
              className={`w-full text-left py-2 px-2 rounded-md font-medium flex items-center transition-colors
                ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }
                ${isSidebarCollapsed ? "justify-center" : ""}`}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
              whileHover={{ x: isSidebarCollapsed ? 0 : -3 }}
            >
              {statusIcons[status]}
              {!isSidebarCollapsed && (
                <span className="ml-2 capitalize">{statusLabels[status]}</span>
              )}
            </motion.button>
          ))}

          <hr className="my-3 border-gray-300" />

          {sidebarItems.map(({ tab, icon: Icon }) => (
            <motion.button
              key={tab}
              className={`w-full text-left py-2 px-2 rounded-md font-medium flex items-center transition-colors
                ${isSidebarCollapsed ? "justify-center" : ""}`}
              onClick={() => handleTabClick(tab)}
              whileHover={{ x: isSidebarCollapsed ? 0 : -3 }}
            >
              <Icon size={14} className={isSidebarCollapsed ? "" : "mr-2"} />
              {!isSidebarCollapsed && <span>{tab}</span>}
            </motion.button>
          ))}
        </nav>
      </aside>
    </div>
  );
}
