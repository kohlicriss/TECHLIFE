import React, { useState, useEffect, useContext } from 'react';
import { publicinfoApi } from '../../../../axiosInstance';
import { FaUsers, FaPlus, FaUserShield, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Context } from '../HrmsContext';
import Select from 'react-select';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg">
    <h3 className="font-bold text-lg">Oops! Something went wrong.</h3>
    <p>{message}</p>
  </div>
);

const AllTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  // ✅ NEW: State to track expanded teams
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  
  // Form state
  const [teamName, setTeamName] = useState('');
  const [teamLead, setTeamLead] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  
  const { userData } = useContext(Context);
  const userRoles = userData?.roles || [];
  const canCreateTeam = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_HR');

  // ✅ NEW: Function to toggle team member expansion
  const toggleTeamExpansion = (teamId) => {
    const newExpandedTeams = new Set(expandedTeams);
    if (newExpandedTeams.has(teamId)) {
      newExpandedTeams.delete(teamId);
    } else {
      newExpandedTeams.add(teamId);
    }
    setExpandedTeams(newExpandedTeams);
  };

  // ✅ NEW: Function to check if team is expanded
  const isTeamExpanded = (teamId) => expandedTeams.has(teamId);

  // ✅ FIXED: Fetch teams using correct backend endpoint
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const empID = userData?.employeeId;
      
      if (!empID) {
        setError("Employee ID not found. Please login again.");
        return;
      }
      
      const response = await publicinfoApi.get(`employee/team/${empID}`);
      console.log("Fetched Teams Response:", response.data);
      
      const teamsArray = Array.isArray(response.data) ? response.data : [response.data];
      setTeams(teamsArray || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Could not fetch teams data. You may not have permission, or there's a server issue.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setEmployees([]);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchTeams();
    if (canCreateTeam) {
      fetchEmployees();
    }
  }, [canCreateTeam]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName || !teamLead || teamMembers.length === 0) {
        alert('Please fill all fields');
        return;
    }

    const newTeamData = {
        teamName,
        teamLeadId: teamLead.value,
        employeeIds: teamMembers.map(member => member.value),
    };

    try {
        const response = await publicinfoApi.post('employee/team', newTeamData);
        console.log("Team created successfully:", response.data);
        
        fetchTeams();
        
        setIsModalOpen(false);
        setTeamName('');
        setTeamLead(null);
        setTeamMembers([]);
        alert('Team created successfully!');
    } catch (err) {
        console.error("Error creating team:", err);
        alert('Failed to create team. Please check the console for errors.');
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaUsers className="mr-3 text-blue-500" /> All Teams
        </h1>
        {canCreateTeam && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center shadow-md"
          >
            <FaPlus className="mr-2" /> Create Team
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, index) => {
            const teamId = team.teamId || index;
            const isExpanded = isTeamExpanded(teamId);
            const membersToShow = isExpanded ? team.employees : team.employees?.slice(0, 5);
            const hasMoreMembers = team.employees?.length > 5;
            
            return (
              <div key={teamId} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-900 truncate">{team.teamName}</h2>
                  {team.teamLead && (
                    <div className="flex items-center text-md text-gray-600 mt-2">
                      <FaUserShield className="mr-2 text-green-500" />
                      <strong>Lead:</strong><span className="ml-1">{team.teamLead}</span>
                    </div>
                  )}
                </div>
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-2">Members ({team.employees?.length || 0})</h3>
                  
                  {/* ✅ UPDATED: Enhanced member display with expand/collapse */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {membersToShow?.map(member => (
                        <span key={member.employeeId} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {member.displayName}
                        </span>
                      ))}
                    </div>
                    
                    {/* ✅ NEW: Expand/Collapse Button */}
                    {hasMoreMembers && (
                      <button 
                        onClick={() => toggleTeamExpansion(teamId)}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                      >
                        {isExpanded ? (
                          <>
                            <span>Show Less</span>
                            <FaChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            <span>+{team.employees.length - 5} more</span>
                            <FaChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Create Team Modal - unchanged */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create a New Team</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                    <FaTimes size={24} />
                </button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teamName">Team Name</label>
                <input id="teamName" type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teamLead">Team Lead</label>
                <Select id="teamLead" options={employees} value={teamLead} onChange={setTeamLead} isClearable required />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teamMembers">Team Members</label>
                <Select id="teamMembers" isMulti options={employees} value={teamMembers} onChange={setTeamMembers} required />
              </div>
              <div className="flex items-center justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-300 mr-2">Cancel</button>
                <button type="submit" className="bg-black text-white font-bold py-2 px-4 rounded hover:bg-gray-800">Create Team</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTeams;
