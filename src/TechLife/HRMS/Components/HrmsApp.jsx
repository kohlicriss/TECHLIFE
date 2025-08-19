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
    onLogout,
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
                onLogout={onLogout}
            />
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    </div>
);

const HrmsApp = () => {
    // ==========================================================
    // FIX: Check for "accessToken" instead of "authToken"
    // ==========================================================
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem("accessToken")
    );

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [currentUser] = useState({
        name: "Johnes",
        designation: " Associate Software Engineer",
        avatar: "https://i.pravatar.cc/100",
    });

    // This effect ensures that if the token is removed from another tab, the user is logged out.
    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem("accessToken"));
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const handleLogin = () => {
        // We don't need to set a separate authToken. 
        // The presence of "accessToken" is enough.
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        // This function is passed to the Sidebar to update the state here.
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
                            <Route path="/employees/:empID/*" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                            <Route path="/my-teams/:empID/*" element={<ProtectedRoute><AllTeams /></ProtectedRoute>} />
                            <Route path="/tickets/:empID/*" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
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