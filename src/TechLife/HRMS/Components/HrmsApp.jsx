import React, { useState, useEffect, lazy, Suspense, useContext } from "react";
import ErrorBoundary from "../../../ErrorBoundary";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Outlet,
} from "react-router-dom";
import logo from "./assets/anasol-logo.png";
import HrmsContext, { Context } from "./HrmsContext";
import Sidebar from "./Home/Sidebar";
import Navbar from "./Home/Navbar";
import LoginPage from "./Login/LoginPage";
import ProtectedRoute from "../../../ProtectedRoute";

// Lazy imports with error handling
const NotificationSystem = lazy(() => 
    import("./Notifications/NotificationSystem").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Notifications. Please refresh.</div>
    }))
);
const ChatApp = lazy(() => 
    import("./Chats/ChatApp").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Chat. Please refresh.</div>
    }))
);
const Employees = lazy(() => 
    import("./Employees/Employees").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Employees. Please refresh.</div>
    }))
);
const Profiles = lazy(() => 
    import("./Profile/Profiles").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Profile. Please refresh.</div>
    }))
);
const AllTeams = lazy(() => 
    import("./Teams/AllTeams").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Teams. Please refresh.</div>
    }))
);
const TeamDetails = lazy(() => 
    import("./Teams/TeamDetails").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Team Details. Please refresh.</div>
    }))
);
const Tickets = lazy(() => 
    import("./AdminTickets/Tickets").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Tickets. Please refresh.</div>
    }))
);
const EmployeeTicket = lazy(() => 
    import("./EmployeeTicket/EmployeeTicket").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Employee Tickets. Please refresh.</div>
    }))
);
const CombinedDashBoard = lazy(() => 
    import("./EmployeeDashboards/CombinedDashBoard").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Dashboard. Please refresh.</div>
    }))
);
const AttendancesDashboard = lazy(() => 
    import("./EmployeeDashboards/AttendancesDashboard").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Attendance. Please refresh.</div>
    }))
);
const LeavesDashboard = lazy(() => 
    import("./EmployeeDashboards/LeavesDashboard").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Leaves. Please refresh.</div>
    }))
);
const ProjectDashBoard = lazy(() => 
    import("./Projects/ProjectDashBoard").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Projects. Please refresh.</div>
    }))
);
const TasksApp = lazy(() => 
    import("./Tasks/TaskApp").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Tasks. Please refresh.</div>
    }))
);
const EmployeeProfile = lazy(() => 
    import("./Employees/EmployeeProfile").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Employee Profile. Please refresh.</div>
    }))
);
const Permissions = lazy(() => 
    import("./Permissions/PermissionsPage").catch(() => ({
        default: () => <div className="p-8 text-center text-red-600">Failed to load Permissions. Please refresh.</div>
    }))
);

// Enhanced Full Page Loading Spinner
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
            <img src={logo} alt="Loading..." className="h-20 w-20 animate-pulse" />
            <p className="mt-4 text-lg font-semibold text-gray-700">Loading{'.'.repeat(dots)}</p>
        </div>
    );
};

// Main Module Spinner with Bouncing Animation - Outlet Centered
const ModuleSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-full h-full w-full bg-gray-50">
            {/* Logo */}
            <div className="mb-8">
                <img 
                    src={logo} 
                    alt="Loading..." 
                    className="h-16 w-16 animate-pulse opacity-80" 
                />
            </div>
            
            {/* Bouncing dots with CSS animation */}
            <div className="flex items-center space-x-2">
                <div className="bouncing-dot" style={{ animationDelay: '0s' }}></div>
                <div className="bouncing-dot" style={{ animationDelay: '0.2s' }}></div>
                <div className="bouncing-dot" style={{ animationDelay: '0.4s' }}></div>
            </div>
            
            <style jsx>{`
                .bouncing-dot {
                    width: 12px;
                    height: 12px;
                    background-color: #3b82f6;
                    border-radius: 50%;
                    animation: bouncing-loader 1.4s infinite ease-in-out;
                }
                
                @keyframes bouncing-loader {
                    0%, 80%, 100% {
                        transform: scale(0.7) translateY(0);
                        opacity: 0.6;
                    }
                    40% {
                        transform: scale(1.2) translateY(-15px);
                        opacity: 1;
                        box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
                    }
                }
            `}</style>
        </div>
    );
};

// Error fallback component for individual modules
const ModuleErrorFallback = ({ moduleName, error, resetError }) => (
    <div className="flex h-64 w-full flex-col items-center justify-center bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-500 mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-700 mb-2">{moduleName} Error</h3>
        <p className="text-sm text-red-600 text-center mb-4 max-w-md">
            Something went wrong while loading {moduleName}. This won't affect other parts of the app.
        </p>
        <button
            onClick={resetError}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
            Try Again
        </button>
        <p className="text-xs text-gray-500 mt-2">
            {error?.message && `Error: ${error.message}`}
        </p>
    </div>
);

// Wrapper component for each route with isolated error handling
const RouteWrapper = ({ children, moduleName }) => (
    <ErrorBoundary
        key={`${moduleName}-${Date.now()}`}
        fallback={(error, resetError) => (
            <ModuleErrorFallback 
                moduleName={moduleName} 
                error={error} 
                resetError={resetError} 
            />
        )}
    >
        <Suspense fallback={<ModuleSpinner />}>
            {children}
        </Suspense>
    </ErrorBoundary>
);

// Main Layout with error boundaries for sidebar and navbar
const MainLayout = ({ isSidebarOpen, setSidebarOpen, currentUser, onLogout, isChatWindowVisible }) => (
    <div className="flex flex-col h-screen bg-gray-50">
        <ErrorBoundary 
            fallback={() => (
                <div className="h-16 bg-red-100 border-b border-red-200 flex items-center px-4">
                    <span className="text-red-700">Navigation error - please refresh page</span>
                </div>
            )}
        >
            <Navbar setSidebarOpen={setSidebarOpen} currentUser={currentUser} onLogout={onLogout} />
        </ErrorBoundary>
        
        <div className={`flex flex-1 overflow-hidden ${isChatWindowVisible ? 'pt-0 md:pt-16' : 'pt-16'}`}>
            <ErrorBoundary 
                fallback={() => (
                    <div className="w-64 bg-red-100 border-r border-red-200 flex items-center justify-center">
                        <span className="text-red-700 text-sm">Sidebar error</span>
                    </div>
                )}
            >
                <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} onLogout={onLogout} />
            </ErrorBoundary>
            
            <main className="flex-1 overflow-y-auto">
                <ErrorBoundary
                    fallback={(error, resetError) => (
                        <div className="flex h-full items-center justify-center bg-red-50">
                            <div className="text-center max-w-md">
                                <div className="text-red-500 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-red-700 mb-2">Page Error</h2>
                                <p className="text-red-600 mb-4">
                                    This page encountered an error. The navigation and sidebar are still working.
                                </p>
                                <button
                                    onClick={resetError}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Reload Page
                                </button>
                            </div>
                        </div>
                    )}
                >
                    <Outlet />
                </ErrorBoundary>
            </main>
        </div>
    </div>
);

const MainLayoutWrapper = (props) => {
    const { isChatWindowVisible } = useContext(Context);
    return <MainLayout {...props} isChatWindowVisible={isChatWindowVisible} />;
};

const HrmsApp = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken"));
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
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const handleLogin = () => setIsAuthenticated(true);
    const handleLogout = () => setIsAuthenticated(false);
    const loggedInEmpId = localStorage.getItem("logedempid");

    return (
        // Top-level error boundary for entire app
        <ErrorBoundary
            fallback={(error, resetError) => (
                <div className="min-h-screen bg-red-50 flex items-center justify-center">
                    <div className="text-center max-w-lg mx-auto p-8">
                        <img src={logo} alt="Logo" className="h-20 w-20 mx-auto mb-6 opacity-50" />
                        <h1 className="text-2xl font-bold text-red-700 mb-4">Application Error</h1>
                        <p className="text-red-600 mb-6">
                            Something went wrong with the HRMS application. Please try refreshing the page.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={resetError}
                                className="block w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Reload Application
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="block w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Hard Refresh
                            </button>
                        </div>
                        {error?.message && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-600">
                                    Technical Details
                                </summary>
                                <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-auto">
                                    {error.message}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            )}
        >
            <HrmsContext>
                <ErrorBoundary
                    fallback={() => (
                        <div className="min-h-screen bg-red-50 flex items-center justify-center">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-red-700 mb-2">Context Error</h2>
                                <p className="text-red-600">Failed to initialize application context.</p>
                            </div>
                        </div>
                    )}
                >
                    <Router>
                        <ErrorBoundary
                            fallback={() => (
                                <div className="min-h-screen bg-red-50 flex items-center justify-center">
                                    <div className="text-center">
                                        <h2 className="text-xl font-semibold text-red-700 mb-2">Routing Error</h2>
                                        <p className="text-red-600">Failed to initialize application routing.</p>
                                    </div>
                                </div>
                            )}
                        >
                            <Suspense fallback={<FullPageSpinner />}>
                                <Routes>
                                    {!isAuthenticated ? (
                                        <>
                                            <Route 
                                                path="/login" 
                                                element={
                                                    <RouteWrapper moduleName="Login">
                                                        <LoginPage onLogin={handleLogin} />
                                                    </RouteWrapper>
                                                } 
                                            />
                                            <Route path="*" element={<Navigate to="/login" replace />} />
                                        </>
                                    ) : (
                                        <Route
                                            element={
                                                <MainLayoutWrapper
                                                    isSidebarOpen={isSidebarOpen}
                                                    setSidebarOpen={setSidebarOpen}
                                                    currentUser={currentUser}
                                                    onLogout={handleLogout}
                                                />
                                            }
                                        >
                                            <Route 
                                                path="/admin-dashboard/:empId/*" 
                                                element={
                                                    <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER']}>
                                                        <RouteWrapper moduleName="Admin Dashboard">
                                                            <CombinedDashBoard />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/attendance/:empId/*" 
                                                element={
                                                    <ProtectedRoute>
                                                        <RouteWrapper moduleName="Attendance">
                                                            <AttendancesDashboard />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/leaves/:empId/*" 
                                                element={
                                                    <ProtectedRoute>
                                                        <RouteWrapper moduleName="Leaves">
                                                            <LeavesDashboard />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/projects/:empId/*" 
                                                element={
                                                    <ProtectedRoute>
                                                        <RouteWrapper moduleName="Projects">
                                                            <ProjectDashBoard />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/notifications/:empID/*" 
                                                element={
                                                    <ProtectedRoute>
                                                        <RouteWrapper moduleName="Notifications">
                                                            <NotificationSystem />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/chat/:userId/*" 
                                                element={
                                                    <ProtectedRoute>
                                                        <RouteWrapper moduleName="Chat">
                                                            <ChatApp />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/profile/:empID/*" 
                                                element={
                                                    <ProtectedRoute>
                                                        <RouteWrapper moduleName="Profile">
                                                            <Profiles />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/employees/:empID/*" 
                                                element={
                                                    <ProtectedRoute>
                                                        <RouteWrapper moduleName="Employees">
                                                            <Employees />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/employees/:empID/public/:employeeID" 
                                                element={
                                                    <ProtectedRoute>
                                                        <RouteWrapper moduleName="Employee Profile">
                                                            <EmployeeProfile />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/my-teams/:empID" 
                                                element={
                                                    <ProtectedRoute>
                                                        <RouteWrapper moduleName="Teams">
                                                            <AllTeams />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/teams/:teamId" 
                                                element={
                                                    <ProtectedRoute>
                                                        <RouteWrapper moduleName="Team Details">
                                                            <TeamDetails />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/tickets/:empID/*" 
                                                element={
                                                    <ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MANAGER', 'TEAM_LEAD']}>
                                                        <RouteWrapper moduleName="Admin Tickets">
                                                            <Tickets />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/tickets/employee/:empID/*" 
                                                element={
                                                    <ProtectedRoute>
                                                        <RouteWrapper moduleName="Employee Tickets">
                                                            <EmployeeTicket />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/tasks/:empID/*" 
                                                element={
                                                    <ProtectedRoute>
                                                        <RouteWrapper moduleName="Tasks">
                                                            <TasksApp />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route 
                                                path="/permissions/:empID/*" 
                                                element={
                                                    <ProtectedRoute allowedRoles={['ADMIN']}>
                                                        <RouteWrapper moduleName="Permissions">
                                                            <Permissions />
                                                        </RouteWrapper>
                                                    </ProtectedRoute>
                                                } 
                                            />
                                            <Route path="*" element={<Navigate to={`/profile/${loggedInEmpId}`} replace />} />
                                        </Route>
                                    )}
                                </Routes>
                            </Suspense>
                        </ErrorBoundary>
                    </Router>
                </ErrorBoundary>
            </HrmsContext>
        </ErrorBoundary>
    );
};

export default HrmsApp;
