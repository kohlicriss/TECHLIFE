import { useEffect, useRef, useState, useContext } from "react";
import { Ticket } from "lucide-react";
import Filters from "./Filters";
import TicketCard from "./TicketCard";
import TicketModal from "./TicketModal";
import TicketStats from "./TicketStats";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight ,FaBars , FaTicketAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../HrmsContext";
import { ticketsApi } from "../../../../axiosInstance";

export default function TicketDashboard() {
  
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

    const { userData, theme } = useContext(Context);
  const isDark = theme === "dark";

  
  

  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 9,
    totalPages: 0,
    totalElements: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const wsRef = useRef(null);
  const repliedBy = "admin";
  const navigate = useNavigate();

  
  const rawRole = Array.isArray(userData?.roles)
    ? userData.roles[0]
    : userData?.roles || "";
  const normalizedRole =
    typeof rawRole === "string"
      ? rawRole.toUpperCase().startsWith("ROLE_")
        ? rawRole.toUpperCase()
        : "ROLE_" + rawRole.toUpperCase()
      : "";

  const statusLabels = {
    all: "All",
    resolved: "Resolved",
  };

 
  const fetchTickets = async () => {
    try {
      if (!normalizedRole || !empID) {
        throw new Error("Missing role or employee ID");
      }

      const res = await ticketsApi.get(
        `admin/tickets/role/${normalizedRole}/${empID}?page=${
          currentPage - 1
        }&size=${pageInfo.size}`
      );

      setTickets(res.data.content || []);
      setPageInfo({
        page: res.data.page,
        size: res.data.size,
        totalPages: res.data.totalPages,
        totalElements: res.data.totalElements,
      });

      console.log("Fetched tickets:", res.data.content);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load tickets");
    }
  };

  const connectWebSocket = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("❌ No token found in localStorage");
    return;
  }

  const socket = new WebSocket(
    `wss://hrms.anasolconsultancyservices.com/api/ticket&token=${token}`
  );

  socket.onopen = () => console.log("✅ WebSocket connected");

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      updateTicketReplies(message);
    } catch (err) {
      console.error("❌ Failed to parse WS message", err);
    }
  };

  socket.onclose = () => {
    console.warn("⚠️ WS disconnected. Reconnecting in 3s...");
    setTimeout(connectWebSocket, 3000);
  };

  socket.onerror = (e) => console.error("❌ WS error:", e);

  wsRef.current = socket;
};


  const updateTicketReplies = (replyDTO) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.ticketId === replyDTO.ticketId
          ? {
              ...ticket,
              replies: Array.isArray(ticket.replies)
                ? [...ticket.replies, replyDTO]
                : [replyDTO],
              status: replyDTO.status || ticket.status,
            }
          : ticket
      )
    );

    if (selectedTicket?.ticketId === replyDTO.ticketId) {
      setSelectedTicket((prev) => ({
        ...prev,
        replies: Array.isArray(prev?.replies)
          ? [...prev.replies, replyDTO]
          : [replyDTO],
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
        `https://hrms.anasolconsultancyservices.com/api/ticket/admin/tickets/${selectedTicket.ticketId}/reply`,
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
  const bgClass = isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";
  const cardBg = isDark ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-800 border-gray-300";
  const sidebarBg = isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-700";
  const btnPrimary = isDark
    ? "bg-blue-600 text-white hover:bg-blue-500"
    : "bg-blue-600 text-white hover:bg-blue-700";
  const btnSecondary = isDark
    ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
    : "bg-gray-100 text-gray-700 hover:bg-gray-200";
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
        `https://hrms.anasolconsultancyservices.com/api/ticket/admin/tickets/${selectedTicket.ticketId}/reply`,
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

 const applyFilters = () => {
  let filtered = [...tickets];

  if (searchTerm.trim() !== '') {
    const s = searchTerm.toLowerCase();
    filtered = filtered.filter(t =>
      (t.title || "").toLowerCase().includes(s) ||
      (t.status || "").toLowerCase().includes(s) ||
      (t.priority || "").toLowerCase().includes(s)
    );
  }

 
  if (dateFilter !== "All") {
    const now = new Date();

    filtered = filtered.filter(t => {
      const date = new Date(t.sentAt || t.createdAt);

      if (dateFilter === "Today") {
        return date.toDateString() === now.toDateString();
      }

      if (dateFilter === "Last 7 days") {
        const last7 = new Date();
        last7.setDate(now.getDate() - 7);
        return date >= last7 && date <= now;
      }

      if (dateFilter === "Last 30 days") {
        const last30 = new Date();
        last30.setDate(now.getDate() - 30);
        return date >= last30 && date <= now;
      }

      return true;
    });
  }

 
  filtered.sort(
    (a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt)
  );

  return filtered;
};

  const filtered = tickets
    .filter(
      (t) =>
        filterStatus === "all" ||
        t.status?.toLowerCase() === filterStatus.toLowerCase()
    )
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
    navigate(`/tickets/employee/${empID}`);
  }
  
  setIsSidebarCollapsed(true);
};

  useEffect(() => {
    fetchTickets();
  }, [normalizedRole, empID, currentPage]);

  useEffect(() => {
    connectWebSocket();
    return () => wsRef.current?.close();
  }, []);

  return (
    <div className={`flex flex-row min-h-screen ${bgClass}`}>
    

      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-[url('/your-image.jpg')] bg-cover bg-center">
          <div   className={`w-full h-full ${
              isDark
                ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
                : "bg-gradient-to-b from-white/20 via-white/80 to-white"
            }`}></div>
        </div>

        <div className="relative z-10 px-4">
          <Filters
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

      
          <div className="flex space-x-2 my-3">
            {["all", "resolved"].map((status) => (
              <button
                key={status}
                className={`px-4 py-1 rounded-md font-medium border ${
                  filterStatus === status
                    ? btnPrimary
                    : `${btnSecondary} border`
                }`}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
              >
                {statusLabels[status]}
              </button>
            ))}
          </div>

          {error && (
            <div className={`p-2 border rounded mb-4 ${
                isDark ? "bg-red-900 text-red-200 border-red-700" : "bg-red-100 text-red-700 border-red-300"
              }`}
>
              {error}
            </div>
          )}

          <TicketStats tickets={tickets} />

         <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {applyFilters()
    .filter(
      (t) =>
        filterStatus === "all" ||
        t.status?.toLowerCase() === filterStatus.toLowerCase()
    )
    .map((t) => (
      <TicketCard
        key={t.ticketId}
        {...t}
        className={`${cardBg}`}
        onClick={() => {
          setSelectedTicket({
            ...t,
            replies: Array.isArray(t.replies) ? t.replies : [],
          });
          setNewStatus(t.status);
        }}
      />
    ))}
</div>


        
          <div className="flex justify-center items-center space-x-2 my-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1).map(
              (num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === num ? "bg-blue-600 text-white" : "bg-white"
                  }`}
                >
                  {num}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, pageInfo.totalPages))
              }
              disabled={currentPage === pageInfo.totalPages}
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

     
<header className="sm:hidden relative  px-4 py-3 shadow-md">
 
  <button
    onClick={toggleSidebar}
    className="absolute top-2 right-4 p-2 rounded-md hover:bg-gray-200"
  >
    <FaBars size={18} />
  </button>
</header>



  <aside
        className={`hidden sm:flex flex-col h-screen transition-all duration-200 z-40 ${sidebarBg} ${
          isSidebarCollapsed ? "w-[60px]" : "w-[250px]"
        }`}
      >
  <div className="flex justify-start p-2 items-center">
    <motion.button
      onClick={toggleSidebar}
      className="text-gray-500 hover:text-gray-700 focus:outline-none p-1.5 rounded-full hover:bg-gray-100"
      transition={{ duration: 0.3 }}
    >
      {isSidebarCollapsed ? <FaArrowRight size={16} /> : <FaArrowLeft size={16} />}
    </motion.button>
  </div>

 {!isSidebarCollapsed && (
  <nav className="flex-1 space-y-2 px-2 mt-2">
    {sidebarItems.map(({ tab, icon: Icon }) => (
      <motion.button
        key={tab}
        className={`w-full text-left py-2 px-2 rounded-md font-medium flex items-center hover:bg-gray-200 ${
          isDark ? "text-white" : "text-black"
        }`}
        onClick={() => handleTabClick(tab)}
        whileHover={{ x: -3 }}
      >
        <Icon size={16} className="mr-2" />
        <span>{tab}</span>
      </motion.button>
    ))}
  </nav>
)}
</aside>


{!isSidebarCollapsed && (
  <div
    className="sm:hidden fixed inset-0 bg-black/40 z-40"
    onClick={toggleSidebar}
  />
)}

<aside
  className={`sm:hidden fixed top-0 right-0 h-screen transition-transform duration-300 z-50
  ${isSidebarCollapsed ? "translate-x-full" : "translate-x-0"} w-[250px]
  ${isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-200 text-black"}`}
>
  
  <div
    className={`flex justify-between p-3 items-center border-b ${
      isDark ? "border-gray-700 text-white" : "border-gray-200 text-black"
    }`}
  >
   <motion.button
  onClick={() => {
    handleTabClick("My Tickets");
    setIsSidebarCollapsed(true);
  }}
  className={`font-semibold px-3 py-2 mt-8 rounded-md transition flex items-center
    ${isDark ? "text-white hover:bg-gray-800" : "text-black hover:bg-gray-200"}`}
  whileHover={{ scale: 1.05 }}
>
  <FaTicketAlt size={16} className="mr-2" />
  My Tickets
</motion.button>

  </div>

 
  <nav className="flex flex-col h-full px-2 mt-2">
    <div className="flex-1" /> 

    {sidebarItems.map(({ tab, icon: Icon }) => (
      <motion.button
        key={tab}
        className={`w-full text-left py-2 px-2 mb-2 rounded-md font-medium flex items-center transition
        ${isDark ? "text-white hover:bg-gray-800" : "text-black hover:bg-gray-200"}`}
        onClick={() => {
          handleTabClick(tab);
          setIsSidebarCollapsed(true);
        }}
        whileHover={{ x: -3 }}
      >
        <Icon size={16} className="mr-2" />
        <span>{tab}</span>
      </motion.button>
    ))}
  </nav>
</aside>
    </div>
  );
}