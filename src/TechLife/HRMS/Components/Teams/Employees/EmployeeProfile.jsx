import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiArrowLeft,
  FiPhone,
  FiHash,
} from "react-icons/fi";
import { employees } from "./EmployeeApp";

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const employee = employees.find((emp) => emp.empId === id);

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Employee not found
          </h2>
          <button
            onClick={() => navigate("/employees")}
            className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <FiArrowLeft className="mr-2" /> Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <button
          // FIX: Changed path to the correct absolute path for the directory
          onClick={() => navigate("/employees")}
          className="mb-8 inline-flex items-center text-indigo-600 hover:text-indigo-500"
        >
          <FiArrowLeft className="mr-2" /> Back to Directory
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div className="px-6 py-8">
              <div className="flex flex-col items-center mb-8">
                {employee.profilePic ? (
                  <img
                    src={employee.profilePic}
                    alt={`${employee.name}'s profile picture`}
                    className="h-32 w-32 rounded-full object-cover ring-4 ring-indigo-500 ring-offset-4 mb-4"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold ring-4 ring-indigo-500 ring-offset-4 mb-4">
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
                <h1 className="text-3xl font-bold text-gray-900 text-center">
                  {employee.name}
                </h1>
                <p className="text-xl text-indigo-600 mt-2">{employee.role}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 text-gray-700">
                  <FiHash className="h-6 w-6 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Employee ID</p>
                    <p className="font-medium">{employee.empId}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-gray-700">
                  <FiBriefcase className="h-6 w-6 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{employee.department}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-gray-700">
                  <FiMapPin className="h-6 w-6 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{employee.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-gray-700">
                  <FiMail className="h-6 w-6 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a
                      href={`mailto:${employee.email}`}
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      {employee.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-gray-700">
                  <FiPhone className="h-6 w-6 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{employee.contact}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Projects Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Projects
              </h2>
              <div className="space-y-6">
                {employee.projects?.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </h3>
                    <p className="text-gray-600 mt-2">{project.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
                {(!employee.projects || employee.projects.length === 0) && (
                  <p className="text-gray-500 italic">No projects available</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeProfile;
