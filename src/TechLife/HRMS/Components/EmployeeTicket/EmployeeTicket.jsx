import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Ticket, CheckCircle2, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { FaArrowLeft, FaArrowRight, FaBars } from "react-icons/fa";
import { motion } from "framer-motion";
import { useParams, useNavigate } from 'react-router-dom';
import IssueForm from '../EmployeeTicket/IssueForm';
import ChatBox from '../EmployeeTicket/ChatBox';
import TicketHistory from '../EmployeeTicket/TicketHistory';
import { Context } from '../HrmsContext';
import axios from "axios";

export default function EmployeeTicket() {
  const [view, setView] = useState('history');
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dateFilter, setDateFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('My Tickets');
  const [loading, setLoading] = useState(false);

       // current page for API
 // true if more pages exist
 const nextPage=useRef(0);
  const isFetching = useRef(false); 
  const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);
const [isLoading, setIsLoading] = useState(false);
const [totalCount, setTotalCount] = useState(0);

// prevent multiple fetches

  const navigate = useNavigate();
  const { empID } = useParams();
  const { userData } = useContext(Context);
  const role = Array.isArray(userData?.roles) ? userData.roles[0] : userData?.roles || "";
  const normalizedRole = role.toUpperCase().startsWith("ROLE_") ? role.toUpperCase() : "ROLE_" + role.toUpperCase();
  const token = localStorage.getItem("accessToken");

  const sidebarItems = [
    { tab: "My Tickets", icon: Ticket },
    ...(normalizedRole !== "ROLE_EMPLOYEE" ? [{ tab: "Assigned Tickets", icon: Ticket }] : [])
  ];

  const statusLabels = { all: "All", resolved: "Resolved" };
  const statusIcons = { all: <LayoutDashboard size={20} />, resolved: <CheckCircle2 size={20} /> };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);


const fetchTickets = async (pageNum = 0) => {
  if (!token || !empID || !userData || isLoading || !hasMore) return;

    const fetchTickets = async () => {
      try {
        let url;
        if (activeTab === "Assigned Tickets") {
          // url = `https://hrms.anasolconsultancyservices.com/api/ticket/admin/tickets/role/${normalizedRole}/${empID}`;
        } else {
          url = `https://hrms.anasolconsultancyservices.com/api/ticket/admin/tickets/employee/${empID}`;
        }

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { content, totalElements } = res.data;

    setTickets(prev => [...prev, ...content]);
    setTotalCount(totalElements);
    setPage(pageNum + 1);
    setHasMore(content.length > 0);
  } catch (err) {
    console.error("Error fetching tickets:", err);
    setHasMore(false);
  } finally {
    setIsLoading(false);
  }
};






useEffect(() => {
  setTickets([]);
  setPage(0);
  setHasMore(true);
  fetchTickets(0);
}, [activeTab, empID, normalizedRole, token, userData]);


 useEffect(() => {
  const handleScroll = () => {
    const bottomReached = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
    if (bottomReached && hasMore && !isLoading) {
      fetchTickets(page);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [page, hasMore, isLoading]);

useEffect(() => {
  fetchTickets();
}, [empID]);


  // ======================== HANDLE TAB CLICK ========================
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setTickets([]);
    nextPage.current = 0;
    hasMore.current = true;
    setSelectedTicket(null);
    setView("history");
    navigate(tab === "Assigned Tickets"
      ? `/tickets/role/${normalizedRole}/${empID}`
      : `/tickets/employee/${empID}`);
  };


  const handleFormSubmit = async (data) => {
    try {
      let roleToSend = Array.isArray(data.roles) ? data.roles[0] : data.roles || "";
      if (!roleToSend) return;

      roleToSend = roleToSend.toUpperCase().startsWith("ROLE_") ? roleToSend.toUpperCase() : "ROLE_" + roleToSend.toUpperCase();

      const payload = { ...data, status: "OPEN", employeeId: empID, roles: roleToSend };

      const res = await fetch("https://hrms.anasolconsultancyservices.com/api/ticket/employee/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Failed to create ticket: ${res.status}`);
      const savedTicket = await res.json();
      setTickets(prev => [savedTicket, ...prev]);
      setSelectedTicket(savedTicket);
      setView("chat");
    } catch (err) {
      console.error(err);
      alert("Ticket creation failed.");
    }
  };

  // ======================== HANDLE TICKET CLICK ========================
  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setView('chat');
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
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => (t.status || "").toLowerCase() === statusFilter);
    }
    filtered.sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt));
    return filtered;
  };

 const filteredTickets = applyFilters();
const normalizeStatus = (status) => (status || "").trim().toLowerCase();

const total = totalCount;
const resolved = filteredTickets.filter(t => normalizeStatus(t.status) === "resolved").length;
const unsolved = total - resolved;




  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100">
      <div className="flex flex-row-reverse max-w-7xl mx-auto px-4 py-8 gap-4">

        {/* Desktop Sidebar */}
        <aside className={`sm:flex flex-col bg-white border-l border-gray-200 transition-all duration-200 ${isSidebarCollapsed ? "w-[60px]" : "w-[250px]"} hidden sm:flex sm:sticky sm:top-0 h-full`}>
          <div className="flex justify-start p-1.5 items-center">
            <motion.button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 focus:outline-none p-1.5 rounded-full hover:bg-gray-100" transition={{ duration: 0.3 }}>
              {isSidebarCollapsed ? <FaArrowLeft size={14} /> : <FaArrowRight size={14} />}
            </motion.button>
          </div>

          <nav className="flex-1 space-y-1.5 px-1.5">
            {sidebarItems
              .filter(({ tab }) => normalizedRole === "ROLE_EMPLOYEE" && tab === "Assigned Tickets" ? false : true)
              .map(({ tab, icon: Icon }) => (
                <motion.button
                  key={tab}
                  className={`w-full text-left py-2 px-2 rounded-md font-medium flex items-center transition-colors
                  ${activeTab === tab ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}
                  ${isSidebarCollapsed ? "justify-center" : ""}`}
                  onClick={() => handleTabClick(tab)}
                  whileHover={{ x: isSidebarCollapsed ? 0 : -3 }}
                >
                  <Icon size={14} className={isSidebarCollapsed ? "" : "mr-2"} />
                  {!isSidebarCollapsed && tab}
                </motion.button>
              ))}
          </nav>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <div className="sm:hidden flex flex-col w-full">
          <div className="flex justify-start mb-2">
            <motion.button onClick={toggleMobileSidebar} className="text-gray-500 hover:text-gray-700 focus:outline-none p-2 rounded-full hover:bg-gray-100" transition={{ duration: 0.3 }}>
              <FaBars size={20} />
            </motion.button>
          </div>

          {isMobileSidebarOpen && (
            <div className="bg-white border rounded-lg shadow p-2 mb-4">
              {sidebarItems
                .filter(({ tab }) => normalizedRole === "ROLE_EMPLOYEE" && tab === "Assigned Tickets" ? false : true)
                .map(({ tab, icon: Icon }) => (
                  <motion.button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className={`flex w-full items-center gap-2 px-4 py-2 rounded-lg text-left text-sm font-medium
                      ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Icon size={16} />
                    {tab}
                  </motion.button>
                ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <main className="flex-1 space-y-8">

          {/* Filters */}
          <div className="bg-white rounded-xl shadow p-6 border flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col lg:flex-row items-center gap-4 w-full flex-wrap">
              <label className="text-sm font-medium text-gray-700" htmlFor="date-filter">Filter by Date</label>
              <select
                id="date-filter"
                className="border border-gray-300 text-sm rounded-lg p-2.5 w-42 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option>All</option>
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Today</option>
              </select>
              <label className="text-sm font-medium text-gray-700" htmlFor="search">Search</label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Title, status, priority..."
                className="border border-gray-300 text-sm rounded-lg p-2.5 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <label className="text-sm font-medium text-gray-700" htmlFor="from-date">From</label>
              <input
                type="date"
                id="from-date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-gray-300 text-sm rounded-lg p-2.5 w-44 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <label className="text-sm font-medium text-gray-700" htmlFor="to-date">To</label>
              <input
                type="date"
                id="to-date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-gray-300 text-sm rounded-lg p-2.5 w-44 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* Status Filter Buttons */}
              <div className="flex gap-2 ml-4">
                {Object.keys(statusIcons).map((status) => (
                  <motion.button
                    key={status}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors 
                      ${statusFilter === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    onClick={() => setStatusFilter(status)}
                    whileHover={{ scale: 1.05 }}
                  >
                    {statusIcons[status]}
                    <span>{statusLabels[status]}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-6 rounded-2xl shadow-lg border border-blue-200 bg-white">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full"><Ticket size={32} /></div>
              <div>
                <p className="text-sm text-gray-500">Your Tickets</p>
                <h3 className="text-4xl font-bold text-blue-700">{total}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 rounded-2xl shadow-lg border border-emerald-200 bg-white">
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full"><CheckCircle2 size={32} /></div>
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <h3 className="text-4xl font-bold text-emerald-600">{resolved}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 rounded-2xl shadow-lg border border-red-200 bg-white">
              <div className="bg-red-100 text-red-600 p-4 rounded-full"><AlertTriangle size={32} /></div>
              <div>
                <p className="text-sm text-gray-500">Unresolved</p>
                <h3 className="text-4xl font-bold text-red-600">{unsolved}</h3>
              </div>
            </div>
          </div>

          {/* Conditional Views */}
          {view === 'history' && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-700">Ticket History</h2>
                <button
                  onClick={() => setView('form')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xl shadow hover:scale-105 transition"
                >
                  +
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <TicketHistory tickets={filteredTickets} onTicketClick={handleTicketClick} />
              </div>
            </>
          )}

          {view === 'form' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-700">Raise a Ticket</h2>
                <button
                  onClick={() => setView('history')}
                  className="text-blue-600 hover:text-blue-800 border border-blue-600 hover:border-blue-800 px-4 py-1 rounded-full text-sm shadow"
                >
                  ← Back to History
                </button>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <IssueForm onSubmit={handleFormSubmit} />
              </div>
            </div>
          )}

          {view === 'chat' && selectedTicket && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-700">
                  Chat with Admin (Ticket #{selectedTicket.employeeId})
                </h2>
                <button
                  onClick={() => setView('history')}
                  className="text-blue-600 hover:text-blue-800 border border-blue-600 hover:border-blue-800 px-4 py-1 rounded-full text-sm shadow"
                >
                  ← Back to History
                </button>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <ChatBox
                  userRole="employee"
                  ticketId={selectedTicket.ticketId}
                  ticketStatus={selectedTicket.status} 
                />
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
} 
