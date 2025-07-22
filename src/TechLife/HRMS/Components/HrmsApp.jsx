import React, { useState } from "react";
import HrmsContext from "./HrmsContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotificationSystem from "./Notifications/NotificationSystem";
import Sidebar from "./Home/Sidebar";
import Navbar from "./Home/Navbar";
import ChatApp from "./Chats/ChatApp";
import Employees from "./Employees/Employees"; // This component now handles nested routes
import Profiles from "./Profile/Profiles";

const HrmsApp = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "Johnes",
    designation: " Associate Software Engineer",
    avatar: "https://i.pravatar.cc/100",
  });

  return (
    <HrmsContext>
      <Router>
        <div className="flex flex-col h-screen bg-gray-50">
          <Navbar setSidebarOpen={setSidebarOpen} currentUser={currentUser} />
          <div className="flex flex-1 overflow-hidden pt-16">
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/notifications" element={<NotificationSystem />} />
                <Route path="/chat" element={<ChatApp />} />
                <Route path="/profile/*" element={<Profiles />} />
                <Route path="/employees/*" element={<Employees />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </HrmsContext>
  );
};

export default HrmsApp;
