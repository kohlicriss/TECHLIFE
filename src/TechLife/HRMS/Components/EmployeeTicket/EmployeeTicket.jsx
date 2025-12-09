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
 const nextPage=useRef(0);
 
  const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);
const [isLoading, setIsLoading] = useState(false);
const [totalCount, setTotalCount] = useState(0);
  const [matchedArray,setMatchedArray]=useState([]);
 
  const navigate = useNavigate();
  const { empID } = useParams();
  const { userData ,theme} = useContext(Context);
    
  const role = Array.isArray(userData?.roles) ? userData.roles[0] : userData?.roles || "";
 const normalizedRole = role.toUpperCase(); 

  const token = localStorage.getItem("accessToken");
   const isDark = theme === "dark";
  
const sidebarItems = [
  { tab: "My Tickets", icon: Ticket, key: "my-tickets" },
  
 
  ...((normalizedRole === "ADMIN" || 
       normalizedRole === "HR" || 
       normalizedRole === "MANAGER" ||
       matchedArray.includes("VIEW_ASSIGNED")) 
    ? [{ tab: "Assigned Tickets", icon: Ticket, key: "assigned-tickets" }] 
    : [])
];



 
  const statusLabels = { all: "All", resolved: "Resolved" };
  const statusIcons = { all: <LayoutDashboard size={20} />, resolved: <CheckCircle2 size={20} /> };
 
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);
  

const fetchTickets = async (pageNum = 0) => {
  if (!token || !empID || !userData || isLoading || !hasMore) return;

  setIsLoading(true);
  try {
 const url = `https://hrms.anasolconsultancyservices.com/api/ticket/admin/tickets/employee/${empID}?page=${pageNum}&size=10&sort=createdAt,desc`;

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { content, totalElements } = res.data;

    if (pageNum === 0) {
    
      setTickets(content);
    } else {
    
      setTickets((prev) => [...prev, ...content]);
    }

    setTotalCount(totalElements);
    setHasMore(content.length > 0);
    setPage(pageNum + 1);
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
}, [activeTab, empID]);



useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, [activeTab]);

const observer = useRef();
const lastTicketRef = useCallback(
  (node) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchTickets(page);
      }
    });

    if (node) observer.current.observe(node);
  },
  [isLoading, hasMore, page]
);

 const handleTabClick = (tab) => {

   if (!empID) {
    console.error(" empID is undefined, cannot navigate");
    return;
  }
  setActiveTab(tab);
  setTickets([]);
  nextPage.current = 0;
  setHasMore(true);  
  setSelectedTicket(null);
  setView("history");
  navigate(
    tab === "Assigned Tickets"
      ? `/tickets/role/${normalizedRole}/${empID}`
      : `/tickets/employee/${empID}`
  );
};
 
const handleFormSubmit = async (data) => {
  try {
    let roleToSend = Array.isArray(data.roles) ? data.roles[0] : data.roles || "";
    if (!roleToSend) return;

    roleToSend = roleToSend.toUpperCase().startsWith("ROLE_")
      ? roleToSend.toUpperCase()
      : "ROLE_" + roleToSend.toUpperCase();

    const payload = {
      ...data,
      status: "OPEN",
      employeeId: empID,
      roles: roleToSend,
    };

    const res = await fetch(
      "https://hrms.anasolconsultancyservices.com/api/ticket/employee/create",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error(`Failed to create ticket: ${res.status}`);

    const newTicket = await res.json(); 
    setTickets((prev) => [newTicket, ...prev]);
    setTotalCount((prev) => prev + 1);

    setView("history");
  } catch (err) {
    console.error(err);
    alert("Ticket creation failed.");
  }
};
  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setView('chat');
  };
 
 
 
const applyFilters = () => {
  let filtered = [...tickets];

  // 🔍 Search filter
  if (searchTerm.trim() !== '') {
    const s = searchTerm.toLowerCase();
    filtered = filtered.filter(t =>
      (t.title || "").toLowerCase().includes(s) ||
      (t.status || "").toLowerCase().includes(s) ||
      (t.priority || "").toLowerCase().includes(s)
    );
  }

 
  if (statusFilter !== 'all') {
    filtered = filtered.filter(
      t => (t.status || "").toLowerCase() === statusFilter
    );
  }

  
  const now = new Date();

  if (dateFilter === 'Today') {
    filtered = filtered.filter(t => {
      const date = new Date(t.sentAt || t.createdAt);
      return date.toDateString() === now.toDateString();
    });
  }

  if (dateFilter === 'Last 7 days') {
    const last7 = new Date();
    last7.setDate(now.getDate() - 7);
    filtered = filtered.filter(t => {
      const date = new Date(t.sentAt || t.createdAt);
      return date >= last7 && date <= now;
    });
  }

  if (dateFilter === 'Last 30 days') {
    const last30 = new Date();
    last30.setDate(now.getDate() - 30);
    filtered = filtered.filter(t => {
      const date = new Date(t.sentAt || t.createdAt);
      return date >= last30 && date <= now;
    });
  }

  if (fromDate) {
    const from = new Date(fromDate);
    filtered = filtered.filter(t => {
      const date = new Date(t.sentAt || t.createdAt);
      return date >= from;
    });
  }

  if (toDate) {
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    filtered = filtered.filter(t => {
      const date = new Date(t.sentAt || t.createdAt);
      return date <= to;
    });
  }

filtered.sort((a, b) => new Date(a.sentAt || a.createdAt) - new Date(b.sentAt ||b.createdAt));


  return filtered;
};
useEffect(() => {
  if (userData?.permissions) {  
    setMatchedArray(userData.permissions);
  }
}, [userData]);







 
 const filteredTickets = applyFilters();
const normalizeStatus = (status) => (status || "").trim().toLowerCase();
 
const total = totalCount;
const resolved = filteredTickets.filter(t => normalizeStatus(t.status) === "resolved").length;
const unsolved = total - resolved;




  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-100 text-gray-900"
      }`}
    >
      <div className="flex flex-row-reverse max-w-7xl mx-auto px-4 py-8 gap-4">
 
      {normalizedRole !== "ROLE_EMPLOYEE" && (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`sm:flex flex-col border-l transition-all duration-200 hidden sm:flex sm:sticky sm:top-0 h-full ${
          isDark
            ? "bg-gray-800 border-gray-700 text-gray-200"
            : "bg-white border-gray-200 text-gray-900"
        } ${isSidebarCollapsed ? "w-[60px]" : "w-[250px]"}`}
      >
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
                ${activeTab === tab
                  ? "bg-blue-600 text-white"
                  : `${isDark ? "text-white hover:bg-gray-700" : "text-black hover:bg-gray-200"}`}
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
     
       
    </>
  )}
       
        <main className="flex-1 space-y-8">
 
          
          <div
            className={`rounded-xl shadow p-6 border flex flex-col lg:flex-row items-center justify-between gap-6 ${
              isDark
                ? "bg-gray-800 border-gray-700  text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <div className="flex flex-col lg:flex-row items-center gap-4 w-full flex-wrap">
               <label className={`text-sm font-medium text-gray-700
                 ${
              isDark
                ? "bg-gray-800 border-gray-700  text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`} htmlFor="search">Search</label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Title, status, priority..."
                className="border border-gray-300 text-sm rounded-lg p-2.5 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <label className={`text-sm font-medium   ${
              isDark
                ? "bg-gray-800 border-gray-700  text-white"
                : "bg-white border-gray-200 text-gray-900"
            } `} htmlFor="date-filter">Filter by Date</label>
              <select
                id="date-filter"
                className={`border border-gray-300 text-sm rounded-lg p-2.5 w-42 focus:outline-none focus:ring-2 focus:ring-blue-400
                
                 ${
              isDark
                ? "bg-gray-800 border-gray-700  text-white"
                : "bg-white border-gray-200 text-gray-900"
            }
                `}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option>All</option>
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Today</option>
              </select>
             
 
              <label className={`text-sm font-medium text-gray-700 
                 ${
              isDark
                ? "bg-gray-800 border-gray-700  text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`} htmlFor="from-date">From</label>
             <input
  type="date"
  id="from-date"
  value={fromDate}
  onChange={(e) => setFromDate(e.target.value)}
  className={`border text-sm rounded-lg p-2.5 w-44 focus:outline-none focus:ring-2 focus:ring-blue-400
    ${isDark ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300 text-black"}`}
/>
 
              <label className={`text-sm font-medium text-gray-700
                 ${
              isDark
                ? "bg-gray-800 border-gray-700  text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`} htmlFor="to-date">To</label>
              <input
                type="date"
                id="to-date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-gray-300 text-sm rounded-lg p-2.5 w-44 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
 
             
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
                <button
  onClick={() => {
    setSearchTerm('');
    setDateFilter('All');
    setFromDate('');
    setToDate('');
    setStatusFilter('all');
  }}
  className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
>
  Clear Filters
</button>
            </div>
          </div>
           <div className="sm:hidden flex gap-2 overflow-x-auto py-2 px-1">
    {sidebarItems.map(({ tab, icon: Icon }) => (
      <motion.button
        key={tab}
        onClick={() => handleTabClick(tab)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
          ${activeTab === tab
            ? "bg-blue-600 text-white"
            : `${isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-black hover:bg-gray-200"}`}`}
        whileHover={{ scale: 1.02 }}
      >
        <Icon size={16} />
        {tab}
      </motion.button>
    ))}
  </div>
 
  
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 "
             >
            <div className={`flex items-center gap-4 p-6 rounded-2xl shadow-lg border border-blue-200 
               ${
              isDark
                ? "bg-gray-800 border-gray-700  text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}>
                <div className={`bg-blue-100 text-blue-600 p-4 rounded-full
                   ${
              isDark
                ? "bg-gray-800 border-gray-700  text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}><Ticket size={32} /></div>
              <div>
                <p className={`text-sm text-gray-500
                   ${
              isDark
                ? "bg-gray-800 border-gray-700  text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}>Your Tickets</p>
                <h3 className="text-4xl font-bold text-blue-700">{total}</h3>
              </div>
            </div>
 
            <div className={`flex items-center gap-4 p-6 rounded-2xl shadow-lg border border-emerald-200  ${
              isDark
                ? "bg-gray-800 border-gray-700  text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}>
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full"><CheckCircle2 size={32} /></div>
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <h3 className="text-4xl font-bold text-emerald-600">{resolved}</h3>
              </div>
            </div>
 
            <div className={`flex items-center gap-4 p-6 rounded-2xl shadow-lg border border-red-200 
               ${
              isDark
                ? "bg-gray-800 border-gray-700  text-white"
                : "bg-white border-gray-200 text-gray-900"
            } `}>
              <div className="bg-red-100 text-red-600 p-4 rounded-full"><AlertTriangle size={32} /></div>
              <div>
                <p className="text-sm text-gray-500">Unresolved</p>
                <h3 className="text-4xl font-bold text-red-600">{unsolved}</h3>
              </div>
            </div>
          </div>
 
          {view === 'history' && (
            <>
              <div className="flex justify-between items-center">
               <h2
            className={`text-2xl font-bold ${
              isDark ? "text-blue-300" : "text-blue-700"
            }`}
          >
            Ticket History
          </h2>
          
                <button
                  onClick={() => setView('form')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-xl shadow hover:scale-105 transition"
                >
                  +
                </button>
           
              </div>
 
              <div className={`${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"} p-6 rounded-2xl shadow-lg`}>
  <TicketHistory tickets={[...filteredTickets].reverse()}
  
   onTicketClick={handleTicketClick}
  lastTicketRef={lastTicketRef} />
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
              <div className=" p-6 rounded-2xl shadow-lg border border-gray-200">
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
              <div className=" p-6 rounded-2xl shadow-lg border border-gray-200">
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
 