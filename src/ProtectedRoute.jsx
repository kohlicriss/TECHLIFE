import React from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { empID, userId } = useParams();
    const { pathname } = useLocation();
    const loggedInEmpId = localStorage.getItem("logedempid");

    if (!loggedInEmpId) {
        return <Navigate to="/login" replace />;
    }

    const routeId = empID || userId;
    if (routeId && routeId !== loggedInEmpId) {
        const correctPath = pathname.replace(routeId, loggedInEmpId);
        return <Navigate to={correctPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
