import { useState, useEffect, useContext } from 'react';
import { Ticket, CheckCircle2, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { useParams, useNavigate } from 'react-router-dom';
import IssueForm from '../EmployeeTicket/IssueForm';
import ChatBox from '../EmployeeTicket/ChatBox';
import TicketHistory from '../EmployeeTicket/TicketHistory';
import { Context } from '../HrmsContext';

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
  const [activeTab, setActiveTab] = useState('My Tickets');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { empID } = useParams();
  const { userData } = useContext(Context); // logged-in user info

  // Sidebar items with role-based visibility
  const sidebarItems = [
    { tab: "My Tickets", icon: Ticket },
    { tab: "Assigned Tickets", icon: Ticket}
  ];

  const statusLabels = { all: "All", resolved: "Resolved" };
  const statusIcons = { all: <LayoutDashboard size={20} />, resolved: <CheckCircle2 size={20} /> };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        let url;
        if (activeTab === "Assigned Tickets") {
         
          url = `http://192.168.0.246:8080/api/admin/tickets/role/${userData.role.toUpperCase()}`;
        } else {
          
          url = `http://192.168.0.246:8080/api/admin/tickets/employee/${empID}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setTickets([]);
      }
    };

    fetchTickets();
  }, [activeTab, empID, userData.role]);

  const role = JSON.parse(localStorage.getItem("userData"))?.role;

const handleTabClick = (tab) => {
  setActiveTab(tab);
  if (tab === "Assigned Tickets") {
    navigate(`/tickets/${empID}/${role}`);
  } else {
    navigate(`/tickets/employee/${empID}`);
  }
};


  const handleFormSubmit = (data) => {
    let roleToSend = Array.isArray(data.roles) ? data.roles[0] : data.roles || "";
    if (!roleToSend) return console.error("Role not provided!");

    fetch('http://192.168.0.246:8080/api/employee/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, roles: roleToSend }),
    })
      .then(res => res.json())
      .then(savedTicket => {
        setTickets(prev => [...prev, savedTicket]);
        setSelectedTicket(savedTicket);
        setView('chat');
      })
      .catch(console.error);
  };

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
  const total = filteredTickets.length;
  const resolved = filteredTickets.filter(t => (t.status || "").toLowerCase() === "resolved").length;
  const unsolved = total - resolved;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100">
      <div className="flex flex-row-reverse max-w-7xl mx-auto px-4 py-8 gap-4">

        {/* Sidebar */}
        <aside className={`sm:flex flex-col bg-white border-l border-gray-200 transition-all duration-200 ${isSidebarCollapsed ? "w-[60px]" : "w-[250px]"} hidden sm:flex sm:sticky sm:top-0 h-full`}>
          <div className="flex justify-start p-1.5 items-center">
            <motion.button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 focus:outline-none p-1.5 rounded-full hover:bg-gray-100" transition={{ duration: 0.3 }}>
              {isSidebarCollapsed ? <FaArrowLeft size={14} /> : <FaArrowRight size={14} />}
            </motion.button>
          </div>

          <nav className="flex-1 space-y-1.5 px-1.5">
           {sidebarItems.map(({ tab, icon: Icon, rolesAllowed }) => {
  if (rolesAllowed && !rolesAllowed.includes(userData?.role?.toUpperCase())) return null;
  return (
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
  );
})}


            {Object.keys(statusIcons).map((status) => (
              <motion.button key={status} className={`w-full text-left py-2 px-2 rounded-md font-medium flex items-center transition-colors ${statusFilter === status ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"} ${isSidebarCollapsed ? "justify-center" : ""}`} onClick={() => setStatusFilter(status)} whileHover={{ x: isSidebarCollapsed ? 0 : -3 }}>
                {statusIcons[status]}
                {!isSidebarCollapsed && <span className="ml-2 capitalize">{statusLabels[status]}</span>}
              </motion.button>
            ))}
          </nav>
        </aside>

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
                <h2 className="text-2xl font-bold text-blue-700">Chat with Admin (Ticket #{selectedTicket.employeeId})</h2>
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
                  ticketId={selectedTicket.id || selectedTicket.ticketId || selectedTicket.employeeId}
                />
              </div>
            </div>
            
          )}

        </main>
      </div>
    </div>
  );
}