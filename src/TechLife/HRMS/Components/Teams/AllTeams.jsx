import React, { useState, useEffect, useContext } from 'react';
import { publicinfoApi } from '../../../../axiosInstance';
import { FaUsers, FaPlus, FaUserShield, FaTimes, FaChevronDown, FaChevronUp, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { IoCheckmarkCircle, IoWarning } from 'react-icons/io5';
import { Context } from '../HrmsContext';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import EditTeamModal from './EditTeamModal'; 
import ConfirmationModal from './ConfirmationModal';

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState(new Set());
  
  // Form state
  const [teamName, setTeamName] = useState('');
  const [teamLead, setTeamLead] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const { userData, theme } = useContext(Context);
  const userRoles = userData?.roles || [];
  const canModifyTeam = userRoles.includes('ADMIN') || userRoles.includes('HR') || userRoles.includes('MANAGER');
  const canCreateTeam = userRoles.includes('ADMIN') || userRoles.includes('HR');

  const toggleTeamExpansion = (teamId) => {
    const newExpandedTeams = new Set(expandedTeams);
    if (newExpandedTeams.has(teamId)) {
      newExpandedTeams.delete(teamId);
    } else {
      newExpandedTeams.add(teamId);
    }
    setExpandedTeams(newExpandedTeams);
  };

  const isTeamExpanded = (teamId) => expandedTeams.has(teamId);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const empID = userData?.employeeId;
      
      if (!empID) {
        setError("Employee ID not found. Please login again.");
        return;
      }
      
      const response = await publicinfoApi.get(`employee/team/${empID}`);
      const teamsArray = Array.isArray(response.data) ? response.data : [response.data];
      setTeams(teamsArray || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Could not fetch teams data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await publicinfoApi.get('employee/0/1000/employeeId/asc/employees');
      const formattedEmployees = response.data.map(emp => ({
        value: emp.employeeId,
        label: `${emp.displayName} (${emp.employeeId})`
      }));
      setEmployees(formattedEmployees);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchTeams();
    if (canModifyTeam) {
      fetchEmployees();
    }
  }, [canModifyTeam]);

  const validateForm = () => {
    const errors = {};
    if (!teamName.trim()) errors.teamName = "Team Name is required.";
    if (teamMembers.length === 0) errors.teamMembers = "At least one Team Member is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormErrors({});

    const newTeamData = {
        teamName,
        teamDescription: "Default Description", 
        employeeIds: [teamLead?.value, ...teamMembers.map(member => member.value)].filter(Boolean),
        projectId: "PRO1001" 
    };

    try {
        await publicinfoApi.post('employee/team', newTeamData);
        await fetchTeams();
        
        setIsCreateModalOpen(false);
        setTeamName('');
        setTeamLead(null);
        setTeamMembers([]);
        alert('Team created successfully!');
    } catch (err) {
        console.error("Error creating team:", err);
        setFormErrors({ general: err.response?.data?.message || 'Failed to create team. Please check the data and try again.' });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleEditClick = (team) => {
    setSelectedTeam(team);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (team) => {
    setSelectedTeam(team);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTeam) return;

    setIsSubmitting(true);
    try {
        await publicinfoApi.delete(`employee/${selectedTeam.teamId}/team`);
        setTeams(teams.filter(t => t.teamId !== selectedTeam.teamId));
        setIsDeleteModalOpen(false);
        setSelectedTeam(null);
        alert('Team deleted successfully!');
    } catch (err) {
        console.error("Error deleting team:", err);
        alert('Failed to delete team.');
    } finally {
        setIsSubmitting(false);
    }
  };


  const renderField = (label, name, children) => {
    const isError = formErrors[name];
    return (
      <div className="group relative" key={name}>
        <label className={`block text-sm font-semibold mb-3 flex items-center ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          {label}
          <span className="text-red-500 ml-1 text-base">*</span>
        </label>
        {children}
        {isError && (
          <div className="mt-2 flex items-center space-x-2 text-red-600">
            <IoWarning className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium">{isError}</p>
          </div>
        )}
      </div>
    );
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      padding: '0.6rem 0.5rem',
      border: `2px solid ${state.isFocused ? '#3b82f6' : (formErrors[state.selectProps.name] ? '#f87171' : (theme === 'dark' ? '#4b5563' : '#e5e7eb'))}`,
      backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
      borderRadius: '0.75rem',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : (theme === 'dark' ? '#6b7280' : '#d1d5db'),
      },
    }),
    multiValue: (styles) => ({...styles, backgroundColor: theme === 'dark' ? '#4f46e5' : '#e0e7ff', color: theme === 'dark' ? 'white' : '#3730a3', borderRadius: '0.5rem'}),
    multiValueLabel: (styles) => ({...styles, color: theme === 'dark' ? 'white' : '#3730a3'}),
    multiValueRemove: (styles) => ({...styles, color: theme === 'dark' ? '#e0e7ff' : '#4f46e5', ':hover': { backgroundColor: theme === 'dark' ? '#6366f1' : '#c7d2fe', color: 'white' }}),
    option: (styles, { isFocused, isSelected }) => ({...styles, backgroundColor: isSelected ? (theme === 'dark' ? '#4f46e5' : '#6366f1') : isFocused ? (theme === 'dark' ? '#374151' : '#f3f4f6') : (theme === 'dark' ? '#1f2937' : 'white'), color: isSelected ? 'white' : (theme === 'dark' ? '#d1d5db' : '#1f2937')}),
    menu: (provided) => ({...provided, backgroundColor: theme === 'dark' ? '#1f2937' : 'white', borderRadius: '0.75rem'}),
    singleValue: (provided) => ({...provided, color: theme === 'dark' ? 'white' : 'black'}),
  };

  const renderCreateTeamModal = () => {
    if (!isCreateModalOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
            <div className={`rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
                <div className="px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-700 text-white relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white/20 rounded-xl"><FaUsers className="w-8 h-8" /></div>
                            <div>
                                <h2 className="text-2xl font-bold">Create New Team</h2>
                                <p className="text-white/90 text-sm">Organize employees into a new team.</p>
                            </div>
                        </div>
                        <button onClick={() => setIsCreateModalOpen(false)} className="p-3 hover:bg-white/20 rounded-full transition-all group">
                            <FaTimes className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-grow">
                    <form className="p-8" onSubmit={handleCreateTeam}>
                        <div className="space-y-6">
                            {renderField("Team Name", "teamName", 
                                <input 
                                    type="text" 
                                    value={teamName} 
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300
                                        focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                                        ${formErrors.teamName ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' : 
                                        theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                    placeholder="e.g., Development Team"
                                />
                            )}
                            {renderField("Team Lead", "teamLead",
                                <Select 
                                    name="teamLead"
                                    options={employees} 
                                    value={teamLead} 
                                    onChange={setTeamLead} 
                                    isClearable 
                                    styles={customSelectStyles}
                                />
                            )}
                            {renderField("Team Members", "teamMembers",
                                <Select 
                                    name="teamMembers"
                                    isMulti 
                                    options={employees} 
                                    value={teamMembers} 
                                    onChange={setTeamMembers} 
                                    styles={customSelectStyles}
                                />
                            )}
                        </div>
                        {formErrors.general && (
                            <div className={`mt-6 p-4 border-l-4 border-red-400 rounded-r-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                                <div className="flex items-center">
                                    <IoWarning className="w-5 h-5 text-red-400 mr-3" />
                                    <p className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>{formErrors.general}</p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
                
                <div className={`px-8 py-6 border-t flex justify-end space-x-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className={`px-8 py-3 border-2 rounded-xl font-semibold transition-all ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                        Cancel
                    </button>
                    <button type="button" onClick={handleCreateTeam} disabled={isSubmitting} className={`px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl
                                     hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2
                                     ${isSubmitting ? 'cursor-not-allowed opacity-75' : ''}`}>
                        {isSubmitting ? (
                            <>
                                <div className="h-5 w-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <IoCheckmarkCircle className="w-5 h-5" />
                                <span>Create Team</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className={`p-6 md:p-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          <FaUsers className="mr-3 text-blue-500" /> All Teams
        </h1>
        {canCreateTeam && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
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
            const teamLead = team.employees?.find(emp => emp.jobTitlePrimary === 'TEAM_LEAD');
            
            return (
              <div key={teamId} className={`rounded-lg shadow-lg overflow-hidden border transition-shadow duration-300 flex flex-col ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:shadow-blue-500/20' : 'bg-white border-gray-200 hover:shadow-xl'}`}>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className={`text-xl font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{team.teamName}</h2>
                      {teamLead && (
                        <div className={`flex items-center text-md mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          <FaUserShield className="mr-2 text-green-500" />
                          <strong>Lead:</strong><span className="ml-1">{teamLead.displayName}</span>
                        </div>
                      )}
                    </div>
                    {canModifyTeam && (
                        <div className="flex space-x-2">
                            {/* <<<<<----- ఇక్కడ మార్పు చేయబడింది ----->>>>> */}
                            <Link to={`/teams/${teamId}`} title="View Details" className="p-2 text-gray-500 hover:text-blue-500 transition-colors"><FaEye /></Link>
                            <button onClick={() => handleEditClick(team)} title="Edit Team" className="p-2 text-gray-500 hover:text-green-500 transition-colors"><FaEdit /></button>
                            <button onClick={() => handleDeleteClick(team)} title="Delete Team" className="p-2 text-gray-500 hover:text-red-500 transition-colors"><FaTrash /></button>
                        </div>
                    )}
                  </div>
                </div>
                <div className={`px-5 py-4 border-t mt-auto ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Members ({team.employees?.length || 0})</h3>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {membersToShow?.map(member => (
                        <span key={member.employeeId} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                          {member.displayName}
                        </span>
                      ))}
                    </div>
                    {hasMoreMembers && (
                      <button 
                        onClick={() => toggleTeamExpansion(teamId)}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        {isExpanded ? (
                          <><span>Show Less</span><FaChevronUp className="w-3 h-3" /></>
                        ) : (
                          <><span>+{team.employees.length - 5} more</span><FaChevronDown className="w-3 h-3" /></>
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
      
      {renderCreateTeamModal()}

      <EditTeamModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        team={selectedTeam}
        onTeamUpdated={fetchTeams}
        employees={employees}
      />
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Team"
        message={`Are you sure you want to delete the team "${selectedTeam?.teamName}"? This action cannot be undone.`}
        confirmText="Delete"
        isConfirming={isSubmitting}
      />

    </div>
  );
};

export default AllTeams;