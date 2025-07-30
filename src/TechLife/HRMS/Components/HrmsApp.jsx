import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import HrmsContext from "./HrmsContext";
import NotificationSystem from "./Notifications/NotificationSystem";
import Sidebar from "./Home/Sidebar";
import Navbar from "./Home/Navbar";
import ChatApp from "./Chats/ChatApp";
import Employees from "./Employees/Employees";
import Profiles from "./Profile/Profiles";
import LoginPage from "./Login/LoginPage"; 
import AllTeams from "./Teams/AllTeams";
import Tickets from  "./AdminTickets/Tickets";
import EmployeeTicket from "./EmployeeTicket/EmployeeTicket";
import AdminDashBoard from "./AdminDashBoards/AdminDashBoard";
import Dashboard from "./EmployeeDashboards/Dashboard";


const MainLayout = ({
  isSidebarOpen,
  setSidebarOpen,
  currentUser,
  onLogout, // Receive onLogout prop
}) => (
  <div className="flex flex-col h-screen bg-gray-50">
    <Navbar
      setSidebarOpen={setSidebarOpen}
      currentUser={currentUser}
      onLogout={onLogout} // Pass it to Navbar
    />
    <div className="flex flex-1 overflow-hidden pt-16">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout} // Pass it to Sidebar
      />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

const HrmsApp = () => {
  // Initialize state from localStorage to persist login
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  );
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "Johnes",
    designation: " Associate Software Engineer",
    avatar: "https://i.pravatar.cc/100",
  });

  // Effect to sync state with localStorage - useful if auth changes in another tab
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("authToken"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Handle Login: set auth state and save a token to localStorage
  const handleLogin = () => {
    localStorage.setItem("authToken", "true"); // Use a simple flag
    setIsAuthenticated(true);
  };

  // Handle Logout: clear auth state and remove the token from localStorage
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  return (
    <HrmsContext>
      <Router>
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route
                path="/login"
                element={<LoginPage onLogin={handleLogin} />}
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <Route
              element={
                <MainLayout
                  isSidebarOpen={isSidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                  currentUser={currentUser}
                  onLogout={handleLogout} // Pass the logout handler down
                />
              }
            >
              <Route path="/AdminDashBoard" element={<AdminDashBoard/>}/>
              <Route path="/dashboard" element={<Dashboard />}> </Route>
              <Route path="/notifications" element={<NotificationSystem />} />
              <Route path="/chat" element={<ChatApp />} />
              <Route path="/profile/*" element={<Profiles />} />
              <Route path="/employees/*" element={<Employees />} />
              <Route path="/my-teams" element={<AllTeams />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/employee" element={<EmployeeTicket />} />
              {/* Redirect any unmatched route to the dashboard when logged in */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          )}
        </Routes>
      </Router>
    </HrmsContext>
  );
};

export default HrmsApp;