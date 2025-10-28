import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Departmentspage from "./Departmentspage";
import DepartmentEmpView from "./DepartmentEmpView";
import { Context } from "../HrmsContext";

const Department = () => {
  const { theme } = useContext(Context);
  return (
    <div className={`min-h-screen w-full ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 to-indigo-50"} transition-colors duration-200`}>
      <Routes>
        <Route path="/" element={<Departmentspage />} />
        <Route path="departmentview/:departmentId" element={<DepartmentEmpView />} />
      </Routes>
    </div>
  );
};

export default Department;