import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../HrmsContext";
import { motion } from "framer-motion";
import {
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiArrowLeft,
  FiPhone,
  FiHash,
  FiAward,
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
  const { theme } = useContext(Context);


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
          `employee/public/${employeeID}/details`
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
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <p className={`text-xl font-mono animate-pulse ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>LOADING...</p>
      </div>
    );
  }


  // Not found state
  if (!employee) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-8 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center">
          <h2 className={`text-3xl font-bold font-mono mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            EMPLOYEE NOT FOUND
          </h2>
          <p className={`mb-6 font-mono ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>Data unavailable for this employee ID.</p>
          <button
            onClick={() => navigate(`/employees/${empID}`)}
            className={`inline-flex items-center px-6 py-3 border-2 text-base font-bold font-mono transition-colors ${
              theme === 'dark'
                ? 'border-white text-white hover:bg-white hover:text-gray-900'
                : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
            }`}
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
      className={`min-h-screen font-sans p-4 sm:p-8 ${
        theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.button
          onClick={() => navigate(`/employees/${empID}`)}
          className={`mb-8 inline-flex items-center cursor-pointer transition-colors ${
            theme === 'dark' 
              ? 'text-gray-300 hover:text-white' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          whileHover={{ x: -10 }}
        >
          <FiArrowLeft className="mr-2" /> BACK
        </motion.button>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Profile Section */}
          <div className={`col-span-1 border-r-2 md:pr-12 ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className={`w-40 h-40 rounded-full overflow-hidden mx-auto md:mx-0 mb-6 border-4 ${
                theme === 'dark' ? 'border-white' : 'border-gray-900'
              }`}
            >
              {employee.employeeImage ? (
                <img
                  src={employee.employeeImage}
                  alt={`${employee.displayName || employee.name}'s profile picture`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-4xl font-bold ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-200 text-gray-900'
                }`}>
                  {generateInitials(employee.displayName || employee.name)}
                </div>
              )}
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className={`text-4xl font-extrabold text-center md:text-left ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
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
                <h2 className={`text-2xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>DETAILS</h2>
                <div className="space-y-6">
                  <InfoItem 
                    icon={<FiHash />} 
                    label="Employee ID" 
                    value={employee.employeeId} 
                    theme={theme}
                  />
                  <InfoItem 
                    icon={<FiBriefcase />} 
                    label="Department" 
                    value={employee.departmentId} 
                    theme={theme}
                  />
                  <InfoItem 
                    icon={<FiMapPin />} 
                    label="Location" 
                    value={employee.location} 
                    theme={theme}
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h2 className={`text-2xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>CONTACT</h2>
                <div className="space-y-6">
                  <InfoItem 
                    icon={<FiMail />} 
                    label="Email" 
                    value={employee.workEmail} 
                    isMail={true} 
                    theme={theme}
                  />
                  <InfoItem 
                    icon={<FiPhone />} 
                    label="Contact" 
                    value={employee.contact} 
                    theme={theme}
                  />
                </div>
              </motion.div>
            </div>


            {/* Achievements Section - Moved to the top */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className={`mt-12 pt-8 border-t-2 ${
                theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>ACHIEVEMENTS</h2>
              <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                {employee.achievements?.length > 0 ? (
                  employee.achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`border-2 p-4 flex items-center space-x-4 ${
                        theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                      }`}
                    >
                      <FiAward className="text-xl text-yellow-500 flex-shrink-0" />
                      <div>
                        <h3 className={`text-lg font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{achievement.certificationName || 'N/A'}</h3>
                        <p className={`mt-1 text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          <span className="font-semibold">Issuing Authority:</span> {achievement.issuingAuthorityName || 'N/A'}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className={`italic ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>No achievements available</p>
                )}
              </div>
            </motion.div>


            {/* Projects Section - Moved below Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className={`mt-12 pt-8 border-t-2 ${
                theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>PROJECTS</h2>
              <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                {employee.projects?.length > 0 ? (
                  employee.projects.map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`border-2 p-4 ${
                        theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                      }`}
                    >
                      <h3 className={`text-lg font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{project.projectName || 'N/A'}</h3>
                      <p className={`mt-2 text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>{project.projectDescription || 'N/A'}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className={`italic ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>No projects available</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


const InfoItem = ({ icon, label, value, isMail = false, theme }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4 }}
    className="flex items-start space-x-4"
  >
    <div className={`mt-1 ${
      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }`}>{icon}</div>
    <div className="flex-grow">
      <p className={`text-xs uppercase ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>{label}</p>
      {isMail ? (
        <a 
          href={`mailto:${value}`} 
          className={`font-semibold transition-colors ${
            theme === 'dark' 
              ? 'text-white hover:text-red-400' 
              : 'text-gray-900 hover:text-red-500'
          }`}
        >
          {value || 'N/A'}
        </a>
      ) : (
        <p className={`font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>{value || 'N/A'}</p>
      )}
    </div>
  </motion.div>
);


export default EmployeeProfile;
