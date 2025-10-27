// EnhancedProtectedRoute.jsx - FIXED VERSION
import React, { useContext } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { Context } from './TechLife/HRMS/Components/HrmsContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { empID, userId, empId } = useParams();
    const { pathname } = useLocation();
    const { userData } = useContext(Context);
    
    const loggedInEmpId = localStorage.getItem("logedempid");

    // Check if user is authenticated
    if (!loggedInEmpId) {
        return <Navigate to="/login" replace />;
    }

    // Get user role from context or localStorage
    const userRole = userData?.role?.toUpperCase() || 
                    localStorage.getItem("logedemprole")?.toUpperCase() || 
                    'EMPLOYEE';

   
    if (userRole === 'EMPLOYEE') {
        const routeId = empID || userId || empId;
        if (routeId && routeId !== loggedInEmpId) {
            const correctPath = pathname.replace(routeId, loggedInEmpId);
            return <Navigate to={correctPath} replace />;
        }
    }

    if (allowedRoles.length > 0) {
        console.log(' Role Check:', {
            userRole,
            allowedRoles,
            hasAccess: allowedRoles.some(role => role.toUpperCase() === userRole)
        });

        const hasRequiredRole = allowedRoles.some(role => 
            role.toUpperCase() === userRole
        );

        if (!hasRequiredRole) {
         
            if (['ADMIN', 'HR', 'MANAGER'].includes(userRole)) {
                return <Navigate to={`/payroll/home/${loggedInEmpId}`} replace />;
            } else {
                return <Navigate to={`/payroll/employee/${loggedInEmpId}`} replace />;
            }
        }
    }

    return children;
};

export default ProtectedRoute;