import { useState, useEffect } from 'react';
import { Ticket, CheckCircle2, AlertTriangle } from 'lucide-react';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

import IssueForm from '../EmployeeTicket/IssueForm'
import ChatBox from '../EmployeeTicket/ChatBox';
import TicketHistory from '../EmployeeTicket/TicketHistory';
import { useNavigate } from "react-router-dom";


export default function EmployeeTicket() {
  const [view, setView] = useState('history');
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dateFilter, setDateFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('My Tickets');
  const [loading, setLoading] = useState(false);

       // current page for API
 // true if more pages exist
 const nextPage=useRef(0);
  
  const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);
const [isLoading, setIsLoading] = useState(false);
const [totalCount, setTotalCount] = useState(0);

// prevent multiple fetches

  const navigate = useNavigate();

  const sidebarItems = [
    { tab: "My Tickets", icon: Ticket },
    { tab: "Assigned Tickets", icon: AlertTriangle },
  ];

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);


const fetchTickets = async (pageNum = 0) => {
  if (!token || !empID || !userData || isLoading || !hasMore) return;

  setIsLoading(true);
  try {
    let url;
    if (activeTab === "Assigned Tickets") {
      // url = ...
    } else {
      url = `https://hrms.anasolconsultancyservices.com/api/ticket/admin/tickets/employee/${empID}?page=${pageNum}&size=10`;
    }

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { content, totalElements } = res.data;

    setTickets(prev =>
      pageNum === 0 ? content : [...prev, ...content] 
    );
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


  
 const handleTabClick = (tab) => {
  setActiveTab(tab);

  if (tab === "Assigned Tickets") {
    navigate("/tickets"); 
  }
    
    setStatusFilter(tab);
};
  

  useEffect(() => {
    fetch(`http://192.168.0.7:8080/api/employee/tickets?employeeId=emp456`)
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error("Error fetching tickets:", err));
  }, []);

  const handleFormSubmit = (data) => {
    fetch('http://192.168.0.7:8080/api/employee/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(savedTicket => {
        setTickets(prev => [...prev, savedTicket]);
        setSelectedTicket(savedTicket);
        setView('chat');
      })
      .catch(err => console.error("Error creating ticket:", err));
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setView('chat');
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.priority?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter === 'Today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(t => new Date(t.createdAt).toDateString() === today);
    } else if (dateFilter === 'Last 7 days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      filtered = filtered.filter(t => new Date(t.createdAt) >= cutoff);
    } else if (dateFilter === 'Last 30 days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      filtered = filtered.filter(t => new Date(t.createdAt) >= cutoff);
    }

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      filtered = filtered.filter(t => {
        const created = new Date(t.createdAt);
        return created >= from && created <= to;
      });
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(t => t.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    return filtered;
  };

  const filteredTickets = applyFilters();

  const total = filteredTickets.length;
  const resolved = filteredTickets.filter((t) => t.status.toLowerCase() === "resolved").length;
  const unsolved = total - resolved;

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100">
      <div className="flex flex-row-reverse max-w-7xl mx-auto px-4 py-8 gap-4">

        {/* Sidebar */}
        <aside className={`sm:flex flex-col bg-white border-l border-gray-200 transition-all duration-200 ${isSidebarCollapsed ? "w-[60px]" : "w-[250px]"} hidden sm:flex sm:sticky sm:top-0 h-full`}>
          <div className="flex justify-start p-1.5 items-center">
            <motion.button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 focus:outline-none p-1.5 rounded-full hover:bg-gray-100"
              transition={{ duration: 0.3 }}
            >
              {isSidebarCollapsed ? <FaArrowLeft size={14} /> : <FaArrowRight size={14} />}
            </motion.button>
          </div>

          <nav className="flex-1 space-y-1.5 px-1.5">
            {sidebarItems.map(({ tab, icon: Icon }) => (
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