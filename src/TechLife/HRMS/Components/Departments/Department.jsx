import React, { useEffect, useState, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Departmentspage from "./Departmentspage";
import DepartmentEmpView from "./DepartmentEmpView";
import { Context } from "../HrmsContext";
import EmpDEpartmentPage from "./EmpDEpartmentPage"; // Make sure this import is correct

const Department = () => {
  // Get the role from localStorage
  const role = localStorage.getItem("logedemprole");
  const { theme } = useContext(Context);

  // Block of code to get current time and print to console
  useEffect(() => {
    const currentTime = new Date();
    console.log("Current Time when Department component mounted:", currentTime.toLocaleString());
    // Optionally, use an interval if you want to update it frequently
    /*
    const intervalId = setInterval(() => {
        console.log("Current Time (Interval):", new Date().toLocaleString());
    }, 60000); // Prints every minute

    return () => clearInterval(intervalId); // Cleanup
    */
  }, []);

  return (
    <div className={`min-h-screen w-full ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 to-indigo-50"} transition-colors duration-200`}>
      <Routes>
        {role === "ADMIN" ? (
          
          <>
            <Route path="/" element={<Departmentspage />} />
            <Route path="departmentview/:departmentId" element={<DepartmentEmpView />} />
          </>
        ) : (
           
          <Route path="/" element={<EmpDEpartmentPage />} />
        )}
      </Routes>
    </div>
  );
};

export default Department;
