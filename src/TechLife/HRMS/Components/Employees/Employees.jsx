import React from 'react';
import {  Routes, Route } from 'react-router-dom';
import EmployeeApp from '../Employees/EmployeeApp';
import EmployeeProfile from '../Employees/EmployeeProfile';
import { employees } from '../Employees/EmployeeApp';

const AppRoutes = () => {
  return (
     
      <Routes>
        <Route path="/" element={<EmployeeApp />} />
        <Route path="/employee/:id" element={<EmployeeProfile employees={employees} />} />
      </Routes>
    
  );
};

export default AppRoutes;