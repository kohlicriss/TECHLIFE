import { useEffect, useRef, useState } from "react";
import {
  Clock,
  HelpCircle,
  MailOpen,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";
import Filters from "./Filters";
import TicketCard from "./TicketCard";
import TicketModal from "./TicketModal";
import TicketStats from "./TicketStats";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Ticket,  AlertTriangle } from 'lucide-react';
import { useNavigate } from "react-router-dom";


const PER_PAGE = 9;

export default function TicketDashboard(ticket) {
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [replyText, setReplyText] = useState("");
  const [newStatus, setNewStatus] = useState("Pending");
  const [error, setError] = useState("");
  const wsRef = useRef(null);
  const repliedBy = "admin"; // You can set dynamically
  const navigate = useNavigate();

  const statusIcons = {
    all: <LayoutDashboard size={20} />,
   
    resolved: <CheckCircle2 size={20} />,
  };

  const statusLabels = {
    all: "All",
   
    resolved: "Resolved",

  };
  


  const statuses = Object.keys(statusIcons);

  const fetchTickets = async () => {
  try {
    const res = await fetch("http://192.168.0.7:8080/api/admin/tickets");
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    setTickets(data);
  } catch (err) {
    console.error(err);
    setError("Failed to load tickets");
  }
};



  const connectWebSocket = () => {
    const socket = new WebSocket(`ws://192.168.0.7:8080/ws-ticket`);
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
  console.log("Updating ticket with replyDTO:", replyDTO);

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
      status: newStatus,
    };

    try {
      await fetch(`http://192.168.0.7:8080/api/admin/tickets/${selectedTicket.ticketId}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      }

      setReplyText("");
    } catch (err) {
      console.error("Reply failed", err);
    }
  };

  const handleStatusChange = async (statusToUpdate) => {
  try {
    await fetch(`http://192.168.0.7:8080/api/admin/tickets/${ticket.ticketId}/reply`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketId: ticket.ticketId,
        replyText: "",
        repliedBy,
        repliedAt: new Date().toISOString(),
        status: statusToUpdate,
      }),
    });
  } catch (err) {
    console.error("Status change failed", err);
  }
};


  const applyDateFilter = (ticket) => {
    if (dateFilter === "All") return true;
    const now = new Date();
    const created = new Date(ticket.timestamp);
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
    if (dateFilter === "Today") return daysDiff < 1;
    if (dateFilter === "Last 7 days") return daysDiff <= 7;
    if (dateFilter === "Last 30 days") return daysDiff <= 30;
    return true;
  };

  const filtered = tickets
    .filter((t) => filterStatus === "all" || t.status?.toLowerCase() === filterStatus)
    .filter(applyDateFilter)
    .filter((t) => {
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      return (
        t.employeeName?.toLowerCase().includes(term) ||
        t.employeeId?.toLowerCase().includes(term) ||
        t.priority?.toLowerCase().includes(term) ||
        t.issue?.toLowerCase().includes(term) ||
        t.status?.toLowerCase().includes(term)
      );
    });
     const sidebarItems = [
    { tab: "My Tickets", icon: Ticket },
 
  ];
   const handleTabClick = (tab) => {
 
  if (tab === "My Tickets") {
    navigate("/tickets/employee"); 
  }
    
    
};

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageTickets = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const changePage = (n) => n >= 1 && n <= totalPages && setCurrentPage(n);

  useEffect(() => {
    fetchTickets();
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
          <div className="bg-red-100 text-red-700 p-2 border rounded mb-4">{error}</div>
        )}

        <TicketStats tickets={tickets} />

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageTickets.map((t) => (
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

        <div className="flex flex-wrap justify-center items-center my-4 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => changePage(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => changePage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => changePage(currentPage + 1)}
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
      {isSidebarCollapsed ? <FaArrowRight size={14} /> : <FaArrowLeft size={14} />}
    </motion.button>
  </div>

  {/* Navigation */}
  <nav className="flex-1 space-y-1.5 px-1.5">
    {/* Ticket Status Filters */}
    {statuses.map((status) => (
      <motion.button
        key={status}
        className={`w-full text-left py-2 px-2 rounded-md font-medium flex items-center transition-colors
          ${filterStatus === status ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}
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

    {/* Static Sidebar Items */}
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