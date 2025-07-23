import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const generateInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const employees = [
  {
    empId: "E123",
    name: "Riya Mehra",
    role: "Associate Software Engineer",
    department: "Software Development",
    location: "Tecjnova Solutions Pvt Ltd",
    email: "riya@gmail.com",
    contact: "+91 9876543210",
    profilePic: null,
    projects: [
      {
        name: "Employee Directory",
        description:
          "Developed a responsive employee directory with search and filter capabilities",
        technologies: ["React", "Tailwind CSS", "Framer Motion"],
      },
      {
        name: "Task Management System",
        description: "Built a task tracking system with real-time updates",
        technologies: ["Node.js", "Express", "MongoDB"],
      },
    ],
  },
  {
    empId: "EMP002",
    name: "Devansh Sharma",
    role: "Associate Software Engineer",
    department: "Software Development",
    location: "Tecjnova Solutions Pvt Ltd",
    email: "devanshsharma@anasol.co.in",
    contact: "+91 9876543211",
    profilePic: null,
    projects: [
      {
        name: "Inventory Management",
        description:
          "Created an inventory tracking system with barcode scanning",
        technologies: ["React Native", "Firebase", "Redux"],
      },
    ],
  },
  {
    empId: "EMP003",
    name: "Arav Mehta",
    role: "Associate Software Engineer",
    department: "Software Development",
    location: "TechNova Solutions Pvt. Ltd.",
    email: "akhilkodari708@gmail.com",
    profilePic: null,
  },
  {
    empId: "EMP004",
    name: "chaitanya",
    role: "Associate Software Engineer",
    department: "Software Development",
    location: "ANASOL CONSULTANCY SERVICES PRIVATE LIMITED",
    email: "chaitanya@gmail.com",
    profilePic: null,
  },
  {
    empId: "EMP005",
    name: "nandu",
    role: "Associate Software Engineer",
    department: "Software Development",
    location: "ANASOL CONSULTANCY SERVICES PRIVATE LIMITED",
    email: "nandu@gmail.com",
    profilePic: null,
  },
  {
    empId: "EMP006",
    name: "sindhu",
    role: "Associate Software Engineer",
    department: "Software Development",
    location: "ANASOL CONSULTANCY SERVICES PRIVATE LIMITED",
    email: "sindhu@gmail.com",
    profilePic: null,
  },
  {
    empId: "EMP007",
    name: "Aarav Mehta",
    role: "Frontend Developer",
    department: "UI/UX Design",
    location: "TechNova Solutions Pvt. Ltd.",
    email: "aarav.mehta@technova.com",
    profilePic: null,
  },
  {
    empId: "EMP008",
    name: "Riya Kapoor",
    role: "Backend Developer",
    department: "Software Engineering",
    location: "TechNova Solutions Pvt. Ltd.",
    email: "riya.kapoor@technova.com",
    profilePic: null,
  },
  {
    empId: "EMP009",
    name: "Devansh Sharma",
    role: "Data Analyst",
    department: "Data Science",
    location: "TechNova Solutions Pvt. Ltd.",
    email: "devansh.sharma@technova.com",
    profilePic: null,
  },
  {
    empId: "EMP010",
    name: "Sneha Reddy",
    role: "QA Engineer",
    department: "Quality Assurance",
    location: "TechNova Solutions Pvt. Ltd.",
    email: "sneha.reddy@technova.com",
    profilePic: null,
  },
  {
    empId: "EMP011",
    name: "Karan Joshi",
    role: "DevOps Engineer",
    department: "Cloud Infrastructure",
    location: "TechNova Solutions Pvt. Ltd.",
    email: "karan.joshi@technova.com",
    profilePic: null,
  },
  {
    empId: "EMP012",
    name: "Tanya Singh",
    role: "Product Manager",
    department: "Product Management",
    location: "TechNova Solutions Pvt. Ltd.",
    email: "tanya.singh@technova.com",
    profilePic: null,
  },
];

const filters = [
  {
    name: "Role",
    options: [
      "Select Role",
      "Associate Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Data Analyst",
      "QA Engineer",
      "DevOps Engineer",
      "Product Manager",
    ],
  },
  {
    name: "Department",
    options: [
      "Select Department",
      "Software Development",
      "UI/UX Design",
      "Software Engineering",
      "Data Science",
      "Quality Assurance",
      "Cloud Infrastructure",
      "Product Management",
    ],
  },
  {
    name: "Location",
    options: [
      "Select Location",
      "ANASOL CONSULTANCY SERVICES PRIVATE LIMITED",
      "TechNova Solutions Pvt. Ltd.",
      "Remote",
    ],
  },
];

function EmployeeApp() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState(
    filters.reduce(
      (acc, filter) => ({ ...acc, [filter.name]: filter.options[0] }),
      {}
    )
  );

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = Object.entries(selectedFilters).every(
      ([filterName, value]) => {
        if (value.startsWith("Select")) return true;
        const employeeValue = employee[filterName.toLowerCase()];
        return employeeValue === value;
      }
    );

    return matchesSearch && matchesFilters;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-gray-900 mb-6"
        >
          Employee Directory
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-4 mb-6"
        >
          {filters.map((filter, index) => (
            <motion.div
              key={filter.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="relative"
            >
              <select
                className="block w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-shadow duration-200 hover:shadow-md"
                value={selectedFilters[filter.name]}
                onChange={(e) =>
                  setSelectedFilters({
                    ...selectedFilters,
                    [filter.name]: e.target.value,
                  })
                }
              >
                {filter.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex-grow"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow duration-200 hover:shadow-md"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee, index) => (
            <motion.div
              key={employee.empId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.03,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              className="bg-white overflow-hidden rounded-2xl hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100"
              // FIX: Navigation path is now relative to the current route (/employees)
              onClick={() => navigate(`employee/${employee.empId}`)}
            >
              <div className="px-6 py-6">
                <div className="flex flex-col items-center text-center">
                  {employee.profilePic ? (
                    <img
                      src={employee.profilePic}
                      alt={`${employee.name}'s profile picture`}
                      className="h-16 w-16 rounded-full object-cover ring-4 ring-indigo-100 mb-4"
                    />
                  ) : (
                    <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold ring-4 ring-indigo-100 shadow-lg mb-4">
                      {generateInitials(employee.name)}
                    </div>
                  )}
                  <div className="min-w-0 mb-6">
                    <p className="text-lg font-semibold text-gray-900 truncate hover:text-indigo-600 transition-colors duration-200">
                      {employee.name}
                    </p>
                    <p className="text-sm font-medium text-indigo-500 truncate">
                      {employee.role}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="truncate">{employee.department}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="truncate">{employee.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="truncate">{employee.email}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmployeeApp;
