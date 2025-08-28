import React, { useState, useEffect } from "react";
import { Context } from "./HrmsContext";
import { useContext } from "react";
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

import Profiles from "./Profile/Profiles";
import LoginPage from "./Login/LoginPage";
import AllTeams from "./Teams/AllTeams";
import Tickets from "./AdminTickets/Tickets";
import EmployeeTicket from "./EmployeeTicket/EmployeeTicket";
import AdminDashBoard from "./AdminDashBoards/AdminDashBoard";
import Dashboard from "./EmployeeDashboards/Dashboard";
import TasksApp from "./Tasks/TaskApp";

// Assuming ProtectedRoute is located in a directory above HrmsApp.js
import ProtectedRoute from "../../../ProtectedRoute";
import axios from "axios";

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
        <div className="flex flex-1 overflow-hidden pt-16">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={onLogout}
            />
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    </div>
);

const HrmsApp = () => {
    const fulldata = localStorage.getItem("emppayload");
    console.log(fulldata);

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

    const loggedInEmpId = localStorage.getItem("logedempid");

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
                            <Route path="/AdminDashBoard" element={<AdminDashBoard />} />
                            <Route path="/dashboard/:empID/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/notifications/:empID/*" element={<ProtectedRoute><NotificationSystem /></ProtectedRoute>} />
                            <Route path="/chat/:userId" element={<ProtectedRoute><ChatApp /></ProtectedRoute>} />
                            <Route path="/profile/:empID/*" element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
                          
                            <Route path="/my-teams/:empID/*" element={<ProtectedRoute><AllTeams /></ProtectedRoute>} />
                            <Route path="/tickets/:empID/:role/*" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
                            <Route path="/tickets/employee/:empID/*" element={<ProtectedRoute><EmployeeTicket /></ProtectedRoute>} />
                            <Route path="/tasks/:empID/*" element={<ProtectedRoute><TasksApp /></ProtectedRoute>} />
                            <Route path="*" element={<Navigate to={`/dashboard/${loggedInEmpId}`} replace />} />
                        </Route>
                    )}
                </Routes>
            </Router>
        </HrmsContext>
    );
};

export default HrmsApp;
