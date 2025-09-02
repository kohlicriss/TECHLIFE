import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiSearch, FiMail, FiMapPin, FiBriefcase } from "react-icons/fi";
import { motion } from "framer-motion";
import { Context } from "../HrmsContext";
import { publicinfoApi } from "../../../../axiosInstance";

// Helper function to generate initials from a name
const generateInitials = (name) => {
  if (!name) return "";
  const nameParts = name.split(" ");
  if (nameParts.length > 1) {
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  }
  return nameParts[0][0].toUpperCase();
};

function EmployeeApp() {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [dynamicFilters, setDynamicFilters] = useState([]);
  
  const { userprofiledata } = useContext(Context);
  const { empID } = useParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});

  // New state for the context menu
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    employee: null,
  });

  // Effect to close the context menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [contextMenu]);

  // Handle right-click event on an employee card
  const handleContextMenu = (e, employee) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      employee: employee,
    });
  };

  const handleChatClick = () => {
    if (contextMenu.employee) {
      alert(`Starting a chat with ${contextMenu.employee.displayName || contextMenu.employee.name}...`);
      navigate(`/chat/:empID`)
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  useEffect(() => {
    const fetchAllEmployees = async () => {
      try {
        const response = await publicinfoApi.get(
          `employee/0/10/employeeId/asc/employees`
        );
        console.log("Employees Data from API:", response.data);
        setEmployeeData(response.data);  
      } catch (err) {
        if (err.response) {
          console.error("Backend Error:", err.response.data);
        } else if (err.request) {
          console.error("No Response received:", err.request);
        } else {
          console.error("Error Message:", err.message);
        }
      }
    };

    fetchAllEmployees();
  }, []);

  useEffect(() => {
    if (employeeData) {
      const roles = [...new Set(employeeData.map(e => e.jobTitlePrimary).filter(Boolean))];
      const departments = [...new Set(employeeData.map(e => e.departmentId).filter(Boolean))];
      const locations = [...new Set(employeeData.map(e => e.location).filter(Boolean))];

      const newFilters = [
        { name: "Role", options: ["Select Role", ...roles] },
        { name: "Department", options: ["Select Department", ...departments] },
        { name: "Location", options: ["Select Location", ...locations] },
      ];

      setDynamicFilters(newFilters);
      
      const initialFilters = newFilters.reduce(
        (acc, filter) => ({ ...acc, [filter.name]: filter.options[0] }),
        {}
      );
      setSelectedFilters(initialFilters);
    }
  }, [employeeData]);

  const filteredEmployees = employeeData
    ? employeeData.filter((employee) => {
        const matchesSearch =
          (employee.displayName && employee.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (employee.workEmail && employee.workEmail.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilters = Object.entries(selectedFilters).every(
          ([filterName, value]) => {
            if (!value || value.startsWith("Select")) return true;

            switch (filterName) {
              case "Role":
                return employee.jobTitlePrimary === value;
              case "Department":
                return employee.departmentId === value;
              case "Location":
                return employee.location === value;
              default:
                return true;
            }
          }
        );

        return matchesSearch && matchesFilters;
      })
    : [];

  if (!employeeData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f0f2f5]">
        <p className="text-xl text-gray-600 animate-pulse">Loading Employee Directory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-2"
        >
          Employee Directory
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-gray-500 text-center mb-10 max-w-2xl mx-auto"
        >
          Discover your colleagues with a fresh, new look.
        </motion.p>
        
        {/* Neumorphic Search and Filter Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12 p-6 rounded-3xl shadow-[5px_5px_10px_#cacaca,-5px_-5px_10px_#ffffff] transition-all duration-300"
        >
          {/* Neumorphic Search Input */}
          <div className="flex-grow w-full md:w-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FiSearch className="h-5 w-5" />
            </div>
            <motion.input
              type="text"
              className="block w-full pl-12 pr-4 py-3 bg-[#f0f2f5] text-gray-800 rounded-2xl outline-none transition-all duration-300 placeholder-gray-400 focus:shadow-[inset_2px_2px_5px_#cacaca,inset_-2px_-2px_5px_#ffffff]"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              whileFocus={{ scale: 1.01 }}
            />
          </div>
          
          {/* Neumorphic Filter Dropdowns */}
          {dynamicFilters.map((filter, index) => (
            <div key={filter.name} className="relative w-full md:w-48">
              <motion.select
                className="block w-full pl-4 pr-10 py-3 bg-[#f0f2f5] text-gray-600 rounded-2xl outline-none transition-all duration-300 appearance-none cursor-pointer focus:shadow-[inset_2px_2px_5px_#cacaca,inset_-2px_-2px_5px_#ffffff]"
                value={selectedFilters[filter.name] || ""}
                onChange={(e) =>
                  setSelectedFilters({
                    ...selectedFilters,
                    [filter.name]: e.target.value,
                  })
                }
                whileFocus={{ scale: 1.01 }}
              >
                {filter.options.map((option) => (
                  <option key={option} value={option} className="bg-[#f0f2f5] text-gray-800">
                    {option}
                  </option>
                ))}
              </motion.select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          ))}
        </motion.div>

        {filteredEmployees.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredEmployees.map((employee, index) => (
              <motion.div
                key={employee.employeeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "10px 10px 20px #cacaca, -10px -10px 20px #ffffff",
                }}
                whileTap={{
                  scale: 0.98,
                  boxShadow: "inset 5px 5px 10px #cacaca, inset -5px -5px 10px #ffffff"
                }}
                className="bg-[#f0f2f5] rounded-3xl p-8 cursor-pointer shadow-[5px_5px_10px_#cacaca,-5px_-5px_10px_#ffffff] transition-all duration-300"
                onClick={() => navigate(`employee/public/${employee.employeeId}`)}
                onContextMenu={(e) => handleContextMenu(e, employee)}
              >
                <div className="flex flex-col items-center text-center">
                  {employee.employeeImage ? (
                    <img
                      src={employee.employeeImage}
                      alt={`${employee.displayName}'s profile picture`}
                      className="h-24 w-24 rounded-full object-cover border-4 border-[#e0e2e5] mb-6 shadow-[5px_5px_10px_#cacaca,-5px_-5px_10px_#ffffff]"
                    />
                  ) : (
                    <div className="flex-shrink-0 h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-3xl font-bold border-4 border-[#e0e2e5] shadow-[5px_5px_10px_#cacaca,-5px_-5px_10px_#ffffff] mb-6">
                      {generateInitials(employee.displayName)}
                    </div>
                  )}
                  
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {employee.displayName}
                    </h3>
                    <p className="text-base font-medium text-gray-600 mt-1">
                      {employee.jobTitlePrimary}
                    </p>
                  </div>

                  <div className="mt-6 w-full space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiBriefcase className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{employee.departmentId || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiMapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{employee.location || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiMail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{employee.workEmail || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Employees Found</h2>
            <p className="text-gray-500 text-lg">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {contextMenu.visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.1 }}
          className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg py-1"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleChatClick}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Chat
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default EmployeeApp;