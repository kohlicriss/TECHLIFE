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
import Dashboard from "./Dasboards/Dashboard";
import AllTeams from "./Teams/AllTeams";

const MainLayout = ({
  isSidebarOpen,
  setSidebarOpen,
  currentUser,
  onLogout,
}) => (
  <div className="flex flex-col h-screen bg-gray-50">
    <Navbar
      setSidebarOpen={setSidebarOpen}
      currentUser={currentUser}
      onLogout={onLogout}
    />
    {/* This div provides the main layout structure */}
    <div className="flex flex-1 overflow-hidden pt-16"> {/* pt-16 ensures content starts below Navbar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
      />
      {/* The main content area where routes are rendered */}
      <main className="flex-1 overflow-y-auto">
        <Outlet /> {/* This is crucial for rendering nested routes */}
      </main>
    </div>
  </div>
);

const HrmsApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  );
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "Johnes",
    designation: " Associate Software Engineer",
    avatar: "https://i.pravatar.cc/100",
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("authToken"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogin = () => {
    localStorage.setItem("authToken", "true");
    setIsAuthenticated(true);
  };

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
                  onLogout={handleLogout}
                />
              }
            >
              {/* Main Application Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notifications" element={<NotificationSystem />} />
              <Route path="/chat" element={<ChatApp />} />
              <Route path="/profile/*" element={<Profiles />} />
              <Route path="/employees/*" element={<Employees />} />
              <Route path="/my-teams" element={<AllTeams />} />
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