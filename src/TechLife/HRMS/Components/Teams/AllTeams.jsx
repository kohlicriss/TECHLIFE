import React, { useState, useEffect, useContext} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../HrmsContext";
import { motion, AnimatePresence } from "framer-motion";
import { publicinfoApi } from "../../../../axiosInstance";
import {
  IoMailOutline,
  IoCallOutline,
  IoPeopleOutline,
  IoWarningOutline,
  IoBusinessOutline,
  IoReloadOutline,
  IoPersonCircleOutline
} from "react-icons/io5";


// Helper function to generate initials from a name
const generateInitials = (name) => {
  if (!name || typeof name !== 'string') return "?";
  const nameParts = name.trim().split(" ");
  if (nameParts.length > 1) {
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  }
  return nameParts[0][0].toUpperCase();
};


const AllTeams = () => {
  const navigate = useNavigate();
  const { empID } = useParams();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useContext(Context);


  useEffect(() => {
    const fetchAllTeams = async () => {
      if (!empID) {
        setLoading(false);
        setError("Employee ID is missing.");
        return;
      }
      try {
        setLoading(true);
        const response = await publicinfoApi.get(`employee/team/${empID}`);
        console.log("API Response:", response.data);
        const teamsArray = Array.isArray(response.data) ? response.data : [response.data];
        setTeams(teamsArray || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to fetch team data. The team might not exist or there's a server issue.");
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTeams();
  }, [empID]);


  // Clean Loading State with Blue Colors
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`w-16 h-16 border-4 border-t-blue-500 rounded-full mx-auto mb-6 ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}
          />
          <h2 className={`text-2xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>Loading Teams</h2>
          <p className={`${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
          }`}>Discovering your team members...</p>
        </div>
      </div>
    );
  }


  // Clean Error State
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center max-w-md">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
          }`}>
            <IoWarningOutline className="w-10 h-10 text-red-500" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>Unable to Load Teams</h2>
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white 
                     font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            <IoReloadOutline className="w-5 h-5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }


  // Clean No Teams State
  if (teams.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center max-w-md">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <IoPeopleOutline className={`w-12 h-12 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
            }`} />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>No Teams Found</h2>
          <p className={`${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            There are no teams associated with this employee at the moment.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Clean Header with Blue Theme */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Team Directory</h1>
          <p className={`text-lg max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Meet your team members and discover their roles within the organization.
          </p>
        </div>


        {/* Teams Display */}
        <div className="space-y-12">
          <AnimatePresence>
            {teams.map((team, teamIdx) => (
              <motion.div
                key={team.teamId || teamIdx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: teamIdx * 0.1 }}
                className={`rounded-2xl shadow-sm border overflow-hidden ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Clean Team Header with Blue Accents */}
                <div className={`px-8 py-6 border-b ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                    }`}>
                      <IoBusinessOutline className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <h2 className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-blue-900'
                      }`}>
                        {team.teamName}
                      </h2>
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        Team ID: {team.teamId}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Clean Team Members Grid */}
                <div className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {team.employees.map((member, memberIdx) => (
                      <motion.div
                        key={member.employeeId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: memberIdx * 0.05 }}
                        whileHover={{ 
                          y: -4,
                          boxShadow: theme === 'dark' 
                            ? "0 8px 25px rgba(59, 130, 246, 0.25)" 
                            : "0 8px 25px rgba(59, 130, 246, 0.15)" 
                        }}
                        whileTap={{ scale: 0.98 }}
                        className={`rounded-xl border cursor-pointer p-6 text-center transition-all duration-200 ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 hover:border-blue-400'
                            : 'bg-white border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => navigate(`/employees/${empID}/public/${member.employeeId}`)}
                      >
                        {/* Clean Profile Avatar with Blue Gradient */}
                        <div className="relative mb-4">
                          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 
                                        text-white text-lg font-bold flex items-center justify-center">
                            {generateInitials(member.displayName)}
                          </div>
                        </div>
                        
                        {/* Clean Member Info */}
                        <div className="space-y-2">
                          <h3 className={`font-semibold text-sm truncate ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                              title={member.displayName}>
                            {member.displayName}
                          </h3>
                          <p className={`text-xs font-medium ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                            {member.jobTitlePrimary || "No role assigned"}
                          </p>
                          
                          {/* Clean Contact Details */}
                          <div className={`pt-3 space-y-2 text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {member.workEmail && (
                              <div className="flex items-center justify-center space-x-1">
                                <IoMailOutline className="w-3 h-3" />
                                <span className="truncate">{member.workEmail}</span>
                              </div>
                            )}
                            {member.workNumber && (
                              <div className="flex items-center justify-center space-x-1">
                                <IoCallOutline className="w-3 h-3" />
                                <span>{member.workNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};


export default AllTeams;
