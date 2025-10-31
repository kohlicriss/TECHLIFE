import React, { useEffect, useState, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Departmentspage from "./Departmentspage";
import DepartmentEmpView from "./DepartmentEmpView";
import { Context } from "../HrmsContext";
import EmpDEpartmentPage from "./EmpDEpartmentPage";  

const Department = () => {
  const role = localStorage.getItem("logedemprole");
  const { theme } = useContext(Context);

  

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
