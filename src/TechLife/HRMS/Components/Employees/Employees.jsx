import React from "react";
import { Routes, Route } from "react-router-dom";
import EmployeeApp from "./EmployeeApp"; // Assuming this is the correct path
import EmployeeProfile from "./EmployeeProfile"; // Assuming this is the correct path

const Employees = () => {
  return (
    <Routes>
      {/* FIX: 'index' specifies that EmployeeApp is the default component for the '/employees' route */}
      <Route index element={<EmployeeApp />} />
      {/* FIX: The path is now relative to '/employees', creating the full path '/employees/employee/:id' */}
      <Route path="employee/:id" element={<EmployeeProfile />} />
    </Routes>
  );
};

export default Employees;