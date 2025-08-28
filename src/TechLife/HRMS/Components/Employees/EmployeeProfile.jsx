import React, { useEffect, useState } from "react";
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
import { publicinfoApi } from "../../../../axiosInstance";

// Helper function to generate initials
const generateInitials = (name) => {
  if (!name) return "";
  const nameParts = name.split(" ");
  if (nameParts.length > 1) {
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  }
  return nameParts[0][0].toUpperCase();
};

const EmployeeProfile = () => {
  const { empID, employeeID } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeID) {
      setLoading(false);
      return;
    }
    
    const fetchEmployee = async () => {
      setLoading(true);
      try {
        let response = await publicinfoApi.get(
          `/employee/public/${employeeID}/employee/details`
        );
        console.log("Employee details:", response.data);
        setEmployee(response.data);
      } catch (error) {
        console.error("Failed to fetch employee details:", error);
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeID]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-xl font-mono text-gray-800 animate-pulse">LOADING...</p>
      </div>
    );
  }

  // Not found state
  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-mono text-gray-900 mb-4">
            EMPLOYEE NOT FOUND
          </h2>
          <p className="text-gray-600 mb-6 font-mono">Data unavailable for this employee ID.</p>
          <button
            onClick={() => navigate(`/employees/${empID}`)}
            className="inline-flex items-center px-6 py-3 border-2 border-gray-900 text-base font-bold font-mono text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
          >
            <FiArrowLeft className="mr-2" /> BACK TO DIRECTORY
          </button>
        </div>
      </div>
    );
  }

  // Employee profile view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white text-gray-900 font-sans p-4 sm:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.button
          onClick={() => navigate(`/employees/${empID}`)}
          className="mb-8 inline-flex items-center text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
          whileHover={{ x: -10 }}
        >
          <FiArrowLeft className="mr-2" /> BACK
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Profile Section */}
          <div className="col-span-1 border-r-2 border-gray-300 md:pr-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-40 h-40 rounded-full overflow-hidden mx-auto md:mx-0 mb-6 border-4 border-gray-900"
            >
              {employee.employeeImage ? (
                <img
                  src={employee.employeeImage}
                  alt={`${employee.displayName || employee.name}'s profile picture`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-900 text-4xl font-bold">
                  {generateInitials(employee.displayName || employee.name)}
                </div>
              )}
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl font-extrabold text-center md:text-left">
                {employee.displayName || employee.name || 'N/A'}
              </h1>
              <p className="text-lg text-red-500 font-medium text-center md:text-left mt-2">
                {employee.jobTitlePrimary || 'N/A'}
              </p>
            </motion.div>
          </div>

          {/* Details Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-4">DETAILS</h2>
                <div className="space-y-6">
                  <InfoItem icon={<FiHash />} label="Employee ID" value={employee.employeeId} />
                  <InfoItem icon={<FiBriefcase />} label="Department" value={employee.departmentId} />
                  <InfoItem icon={<FiMapPin />} label="Location" value={employee.location} />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold mb-4">CONTACT</h2>
                <div className="space-y-6">
                  <InfoItem icon={<FiMail />} label="Email" value={employee.workEmail} isMail={true} />
                  <InfoItem icon={<FiPhone />} label="Contact" value={employee.contact} />
                </div>
              </motion.div>
            </div>

            {/* Projects Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 pt-8 border-t-2 border-gray-300"
            >
              <h2 className="text-2xl font-bold mb-6">PROJECTS</h2>
              <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                {employee.projects?.length > 0 ? (
                  employee.projects.map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border-2 border-gray-300 p-4"
                    >
                      <h3 className="text-lg font-bold text-gray-900">{project.projectName || 'N/A'}</h3>
                      <p className="text-gray-600 mt-2 text-sm">{project.projectDescription || 'N/A'}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No projects available</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InfoItem = ({ icon, label, value, isMail = false }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4 }}
    className="flex items-start space-x-4"
  >
    <div className="text-gray-600 mt-1">{icon}</div>
    <div className="flex-grow">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      {isMail ? (
        <a href={`mailto:${value}`} className="font-semibold text-gray-900 hover:text-red-500 transition-colors">
          {value || 'N/A'}
        </a>
      ) : (
        <p className="font-semibold">{value || 'N/A'}</p>
      )}
    </div>
  </motion.div>
);

export default EmployeeProfile;