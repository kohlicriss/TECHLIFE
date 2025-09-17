import React, { useState, useEffect, lazy, Suspense } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Outlet,
} from "react-router-dom";
import logo from "./assets/anasol-logo.png";
import HrmsContext from "./HrmsContext";
import Sidebar from "./Home/Sidebar";
import Navbar from "./Home/Navbar";
import LoginPage from "./Login/LoginPage";
import ProtectedRoute from "../../../ProtectedRoute";
import ProjectDetails from "./Projects/ProjectDetails";


// Lazy loading components
const NotificationSystem = lazy(() => import("./Notifications/NotificationSystem"));
const ChatApp = lazy(() => import("./Chats/ChatApp"));
const Employees = lazy(() => import("./Employees/Employees"));
const Profiles = lazy(() => import("./Profile/Profiles"));
const AllTeams = lazy(() => import("./Teams/AllTeams"));
const TeamDetails = lazy(() => import("./Teams/TeamDetails"));
const Tickets = lazy(() => import("./AdminTickets/Tickets"));
const EmployeeTicket = lazy(() => import("./EmployeeTicket/EmployeeTicket"));
const CombinedDashBoard=lazy(() => import("./EmployeeDashboards/CombinedDashBoard"));
const AttendancesDashboard=lazy(()=> import("./EmployeeDashboards/AttendancesDashboard"))
const LeavesDashboard=lazy(()=>import("./EmployeeDashboards/LeavesDashboard"))
const ProjectDashBoard=lazy(()=>import("./Projects/ProjectDashBoard"))
const TasksApp = lazy(() => import("./Tasks/TaskApp"));
const EmployeeProfile = lazy(() => import("./Employees/EmployeeProfile"));
const Permissions = lazy(() => import("./Permissions/PermissionsPage")); 

const FullPageSpinner = () => {
    const [dots, setDots] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prevDots) => (prevDots >= 3 ? 1 : prevDots + 1));
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
            <img
                src={logo}
                alt="Loading..."
                className="h-20 w-20 animate-pulse"
            />
            <p className="mt-4 text-lg font-semibold text-gray-700">
                Loading{'.'.repeat(dots)}
            </p>
        </div>
    );
};

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
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem("accessToken")
    );

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [currentUser] = useState({
        name: "Johnes",
        designation: " Associate Software Engineer",
        avatar: "https://i.pravatar.cc/100",
    });

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
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    const loggedInEmpId = localStorage.getItem("logedempid");

    return (
        <HrmsContext>
            <Router>
                <Suspense fallback={<FullPageSpinner />}>
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
                                 <Route path="/combined-dashboard/:empId/*" element={<ProtectedRoute><CombinedDashBoard /></ProtectedRoute>} />
                                <Route path="/attendance/:empId/*" element={<ProtectedRoute><AttendancesDashboard /></ProtectedRoute>} />
                                <Route path="/leaves/:empId/*" element={<ProtectedRoute><LeavesDashboard /></ProtectedRoute>} />
                                <Route path="/projects/:empId/*" element={<ProtectedRoute><ProjectDashBoard /></ProtectedRoute>} />
                                <Route path="/notifications/:empID/*" element={<ProtectedRoute><NotificationSystem /></ProtectedRoute>} />
                                <Route path="/chat/:userId/*" element={<ProtectedRoute><ChatApp /></ProtectedRoute>} />
                                <Route path="/profile/:empID/*" element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
                                <Route path="/employees/:empID/*" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                                
                                <Route 
                                    path="/employees/:empID/public/:employeeID" 
                                    element={<ProtectedRoute><EmployeeProfile /></ProtectedRoute>} 
                                />

                                <Route path="/my-teams/:empID" element={<ProtectedRoute><AllTeams /></ProtectedRoute>} />
                                <Route path="/teams/:teamId" element={<ProtectedRoute><TeamDetails /></ProtectedRoute>} />
                                
                                <Route path="/tickets/:empID/*" element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']}><Tickets /></ProtectedRoute>} />
                                <Route path="/tickets/employee/:empID/*" element={<ProtectedRoute><EmployeeTicket /></ProtectedRoute>} />
                                <Route path="/tasks/:empID/*" element={<ProtectedRoute><TasksApp /></ProtectedRoute>} />
                                
                                <Route path="/permissions/:empID/*" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
                                <Route path="/project-details/:project_id/*" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />

                                <Route path="*" element={<Navigate to={`/profile/${loggedInEmpId}`} replace />} />
                            </Route>
                        )}
                    </Routes>
                </Suspense>
            </Router>
        </HrmsContext>
    );
};

export default HrmsApp;