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
import Tickets from "./AdminTickets/Tickets";
import EmployeeTicket from "./EmployeeTicket/EmployeeTicket";
import AdminDashBoard from "./AdminDashBoards/AdminDashBoard";
import Dashboard from "./EmployeeDashboards/Dashboard";
import TasksApp from "./Tasks/TaskApp";
import ProtectedRoute from "../../../ProtectedRoute";

const MainLayout = ({
    isSidebarOpen,
    setSidebarOpen,
    currentUser,
    onLogout, // Pass onLogout to Sidebar
}) => (
    <div className="flex flex-col h-screen bg-gray-50">
        <Navbar
            setSidebarOpen={setSidebarOpen}
            currentUser={currentUser}
        />
        <div className="flex flex-1 overflow-hidden pt-16">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onLogout={onLogout} // Pass it down
            />
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    </div>
);

const HrmsApp = () => {
    // Check for token in localStorage to set initial state
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken"));
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [currentUser] = useState({
        name: "Johnes",
        designation: " Associate Software Engineer",
        avatar: "https://i.pravatar.cc/100",
    });

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    // ==========================================================
    // THIS IS THE CENTRAL LOGOUT HANDLER
    // ==========================================================
    const handleLogout = () => {
        // This function will be called from the Sidebar.
        // It changes the state, which triggers the redirect in the Routes.
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
                            {/* This Navigate component will automatically redirect any other path to /login */}
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </>
                    ) : (
                        <Route
                            element={
                                <MainLayout
                                    isSidebarOpen={isSidebarOpen}
                                    setSidebarOpen={setSidebarOpen}
                                    currentUser={currentUser}
                                    onLogout={handleLogout} // Pass the handler
                                />
                            }
                        >
                            <Route path="/AdminDashBoard" element={<AdminDashBoard />} />
                            <Route path="/dashboard/:empID/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/notifications/:empID/*" element={<ProtectedRoute><NotificationSystem /></ProtectedRoute>} />
                            <Route path="/chat/:userId" element={<ProtectedRoute><ChatApp /></ProtectedRoute>} />
                            <Route path="/profile/:empID/*" element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
                            <Route path="/employees/:empID/*" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                            <Route path="/my-teams/:empID/*" element={<ProtectedRoute><AllTeams /></ProtectedRoute>} />
                            <Route path="/tickets/:empID/*" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
                            <Route path="/tickets/employee/:empID/*" element={<ProtectedRoute><EmployeeTicket /></ProtectedRoute>} />
                            <Route path="/tasks/:empID/*" element={<ProtectedRoute><TasksApp /></ProtectedRoute>} />
                            {/* This is the default route when authenticated */}
                            <Route path="*" element={<Navigate to={`/dashboard/${loggedInEmpId}`} replace />} />
                        </Route>
                    )}
                </Routes>
            </Router>
        </HrmsContext>
    );
};

export default HrmsApp;