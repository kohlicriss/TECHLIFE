import { useEffect, useRef, useState } from "react";
import { CheckCircle2, LayoutDashboard } from "lucide-react";
import Filters from "./Filters";
import TicketCard from "./TicketCard";
import TicketModal from "./TicketModal";
import TicketStats from "./TicketStats";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PER_PAGE = 1000;

export default function TicketDashboard() {
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [newStatus, setNewStatus] = useState("Pending");
  const [error, setError] = useState("");
  const wsRef = useRef(null);
  const repliedBy = "admin";
  const navigate = useNavigate();
  const loader = useRef(null);

  const [messages, setMessages] = useState([]);

  const statusIcons = {
    all: <LayoutDashboard size={20} />,
    resolved: <CheckCircle2 size={20} />,
  };

  const statusLabels = {
    all: "All",
    resolved: "Resolved",
  };

  const statuses = Object.keys(statusIcons);

const fetchTickets = async (page, size, reset = false) => {
  try {
    const res = await fetch(
      `http://192.168.0.246:8080/api/admin/tickets?page=${page}&size=${size}`
    );
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();

    const newTickets = data.content ? data.content : data;

    setTickets((prev) => (reset ? newTickets : [...prev, ...newTickets]));
    setHasMore(!(data.last ?? true));
  } catch (err) {
    console.error(err);
    setError("Failed to load tickets");
  }
};


  const connectWebSocket = () => {
    const socket = new WebSocket(`ws://192.168.0.246:8080/ws-ticket`);
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

  const updateTicketReplies = (replyDTO) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === replyDTO.ticketId
          ? {
              ...ticket,
              replies: [...(ticket.replies || []), replyDTO],
              status: replyDTO.status || ticket.status,
            }
          : ticket
      )
    );

    if (selectedTicket?.id === replyDTO.ticketId) {
      setSelectedTicket((prev) => ({
        ...prev,
        replies: [...(prev.replies || []), replyDTO],
        status: replyDTO.status || prev.status,
      }));
    }
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
        `http://192.168.0.246:8080/api/admin/tickets/${selectedTicket.ticketId}/reply`,
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
        `http://192.168.0.246:8080/api/admin/tickets/${selectedTicket.ticketId}/reply`,
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
    (t) => filterStatus === "all" || t.status?.toLowerCase() === filterStatus
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


  const sidebarItems = [{ tab: "My Tickets", icon: Ticket }];

  const handleTabClick = (tab) => {
    if (tab === "My Tickets") {
      navigate("/tickets/employee/:empID");
    }
  };

 
 useEffect(() => {
  fetchTickets(page, PER_PAGE, page === 0); // reset tickets if page=0
}, [page]);


  useEffect(() => {
    connectWebSocket();
    return () => wsRef.current?.close();
  }, []);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [hasMore]);

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
            {filtered.map((t) => (
              <TicketCard
                key={t.id}
                {...t}
                onClick={() => {
                  setSelectedTicket(t);
                  setNewStatus(t.status);
                }}
              />
            ))}
          </div>

          {/* Infinite Scroll Loader */}
          {hasMore && (
            <div ref={loader} className="text-center py-4">
              Loading more...
            </div>
          )}
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
            onStatusChange={handleStatusChange}
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
  setPage(0);
  setTickets([]); // 🔥 clear tickets
  fetchTickets(0, PER_PAGE, true); // 🔥 fetch fresh tickets
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
