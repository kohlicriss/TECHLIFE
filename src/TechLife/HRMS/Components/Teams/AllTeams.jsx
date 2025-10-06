import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { publicinfoApi ,authApi} from '../../../../axiosInstance';
import { FaUsers, FaPlus, FaUserShield, FaTimes, FaChevronDown, FaChevronUp, FaTrash, FaEye, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa'; 
import { IoCheckmarkCircle, IoWarning } from 'react-icons/io5';
import { Context } from '../HrmsContext';
import ConfirmationModal from './ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';

// --- Project Dropdown with Infinite Scroll (UPDATED WITH PAGINATION SUPPORT) ---
const ProjectDropdown = ({ value, onChange, theme, error, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    
    const isFetchingRef = useRef(false);

    const PAGE_SIZE = 10;

    const loadProjects = useCallback(async (page = 0, reset = false) => {
        if (isFetchingRef.current) return;
        if (!reset && !hasMore) return; 

        isFetchingRef.current = true;
        setLoading(true);
        
        try {
            const response = await publicinfoApi.get(`employee/${page}/${PAGE_SIZE}/projectId/asc/projects`);
            
            // ✅ UPDATED: Use response.data.content for data and response.data.last for pagination
            const fetchedProjects = response.data?.content || [];
            const newProjects = Array.isArray(fetchedProjects) ? fetchedProjects : [];
            const isLastPage = response.data?.last || false; // Check if this is the last page
            
            setProjects(prev => {
                const prevArray = Array.isArray(prev) ? prev : [];
                return reset ? newProjects : [...prevArray, ...newProjects];
            });
            
            setCurrentPage(page);
            // ✅ UPDATED: Use response.data.last to determine if there are more pages
            setHasMore(!isLastPage);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [hasMore]);

    useEffect(() => {
        if (isOpen) {
            loadProjects(0, true);
        }
    }, [isOpen, loadProjects]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isFetchingRef.current) {
            loadProjects(currentPage + 1);
        }
    };

    const handleSelect = (project) => {
        onChange({ value: project.projectId, label: `${project.projectId}(${project.title})` });
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    const safeProjects = Array.isArray(projects) ? projects : [];

    const filteredProjects = safeProjects.filter(proj => 
        proj.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.projectId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative">
            <div 
                onClick={toggleDropdown} 
                className={`w-full p-3 border-2 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-between ${
                    error ? 'border-red-300' : (theme === 'dark' ? 'border-gray-600' : 'border-gray-200')
                } ${disabled ? 'opacity-50' : ''} ${
                    theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                }`}
            >
                <span className={!value ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-500') : ''}>
                    {value ? value.label : 'Select project...'}
                </span>
                <FaChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        className={`absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-lg z-50 ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                        }`}
                    >
                        <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search projects..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${
                                        theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    }`} 
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto" onScroll={handleScroll}>
                            {filteredProjects.map(project => {
                                const isSelected = value?.value === project.projectId;
                                return (
                                    <div 
                                        key={project.projectId} 
                                        onClick={() => handleSelect(project)} 
                                        className={`p-3 cursor-pointer flex items-center justify-between ${
                                            isSelected ? 'bg-blue-50 dark:bg-blue-900/50' : `hover:${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'}`
                                        }`}
                                    >
                                        <div className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                                            <div className="font-medium">{project.projectId}({project.title})</div>
                                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Client: {project.client} • Status: {project.projectStatus}
                                            </div>
                                        </div>
                                        {isSelected && <IoCheckmarkCircle className="w-5 h-5 text-blue-500" />}
                                    </div>
                                );
                            })}
                            {loading && (
                                <div className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Loading more projects...
                                </div>
                            )}
                            {/* ✅ UPDATED: Show "End of projects" message when no more data */}
                            {!hasMore && projects.length > 0 && (
                                <div className={`p-4 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    🎯 End of projects
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Employee Dropdown with Infinite Scroll (UPDATED WITH PAGINATION SUPPORT) ---
const EmployeeDropdown = ({ value, onChange, theme, error, disabled, isMulti = false, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const { userData } = useContext(Context);
    
    const isFetchingRef = useRef(false);
    
    const PAGE_SIZE = 15;

    const loadEmployees = useCallback(async (page = 0, reset = false) => {
        if (isFetchingRef.current) return;
        if (!reset && !hasMore) return;

        isFetchingRef.current = true;
        setLoading(true);
        
        try {
            const response = await publicinfoApi.get(`employee/${page}/${PAGE_SIZE}/employeeId/asc/employees`);
            
            // ✅ UPDATED: Use response.data.content for data and response.data.last for pagination
            const responseData = response.data || {};
            const fetchedEmployees = responseData.content || []; 
            const newEmployees = Array.isArray(fetchedEmployees) ? fetchedEmployees : [];
            const isLastPage = responseData.last || false; // Check if this is the last page
            
            setEmployees(prev => {
                const prevArray = Array.isArray(prev) ? prev : [];
                return reset ? newEmployees : [...prevArray, ...newEmployees];
            });
            
            setCurrentPage(page);
            // ✅ UPDATED: Use response.data.last to determine if there are more pages
            setHasMore(!isLastPage);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
            isFetchingRef.current = false; 
        }
    }, [hasMore]);

    useEffect(() => {
        if (isOpen) {
            loadEmployees(0, true);
        }
    }, [isOpen, loadEmployees]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isFetchingRef.current) {
            loadEmployees(currentPage + 1);
        }
    };

    const handleSelect = (employee) => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            const isSelected = currentValues.some(item => item.value === employee.employeeId);
            if (isSelected) {
                onChange(currentValues.filter(item => item.value !== employee.employeeId));
            } else {
                onChange([...currentValues, { value: employee.employeeId, label: `${employee.displayName} (${employee.employeeId})` }]);
            }
        } else {
            onChange({ value: employee.employeeId, label: `${employee.displayName} (${employee.employeeId})` });
            setIsOpen(false);
        }
    };

    const toggleDropdown = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    const safeEmployees = Array.isArray(employees) ? employees : [];
    
    const filteredEmployees = safeEmployees.filter(emp => 
        emp.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderSelectedValue = () => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : [];
            if (currentValues.length === 0) return <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Select team members...</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {currentValues.map(item => (
                        <div key={item.value} className={`text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full ${theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                            {item.label}
                        </div>
                    ))}
                </div>
            );
        } else {
            if (!value) return <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Select a team lead...</span>;
            return <span>{value.label}</span>;
        }
    };

    return (
        <div className="relative">
            <div onClick={toggleDropdown} className={`w-full p-3 border-2 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-between ${error ? 'border-red-300' : (theme === 'dark' ? 'border-gray-600' : 'border-gray-200')} ${disabled ? 'opacity-50' : ''} ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}>
                <div className="flex-1">{renderSelectedValue()}</div>
                <FaChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-lg z-50 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                        <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`} />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto" onScroll={handleScroll}>
                            {filteredEmployees.map(employee => {
                                const isSelected = isMulti ? (Array.isArray(value) && value.some(item => item.value === employee.employeeId)) : value?.value === employee.employeeId;
                                return (
                                    <div key={employee.employeeId} onClick={() => handleSelect(employee)} className={`p-3 cursor-pointer flex items-center justify-between ${isSelected ? 'bg-blue-50 dark:bg-blue-900/50' : `hover:${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'}`}`}>
                                        <div className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                                            <div className="font-medium">{employee.displayName}</div>
                                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{employee.employeeId}</div>
                                        </div>
                                        {isSelected && <IoCheckmarkCircle className="w-5 h-5 text-blue-500" />}
                                    </div>
                                );
                            })}
                            {loading && <div className={`p-4 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Loading more employees...</div>}
                            
                            {/* ✅ UPDATED: Show "End of employees" message when no more data */}
                            {!hasMore && employees.length > 0 && (
                                <div className={`p-4 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    👥 End of employees
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="text-center p-6 sm:p-8 bg-red-100 text-red-700 rounded-lg">
    <h3 className="font-bold text-base sm:text-lg">Oops! Something went wrong.</h3>
    <p className="text-sm sm:text-base">{message}</p>
  </div>
);

const AllTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [expandedTeams, setExpandedTeams] = useState(new Set()); // Fixed initialization
  const [searchTerm, setSearchTerm] = useState('');
  const [matchedArray,setMatchedArray]=useState(null);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false); // New State
  const [displayMode, setDisplayMode] = useState('MY_TEAMS'); // New state for view mode: 'MY_TEAMS' or 'ALL_TEAMS'
  const [adminallteams, setAdminAllTeams] = useState([]); // State for ALL_TEAMS data

  // Form state
  const [teamName, setTeamName] = useState('');
  const [teamLead, setTeamLead] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const { userData, theme } = useContext(Context);
  const userRoles = userData?.roles || [];
  const canModifyTeam = userRoles.includes('ADMIN') || userRoles.includes('HR') || userRoles.includes('MANAGER');
  const canCreateTeam = userRoles.includes('ADMIN') || userRoles.includes('HR');

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fromContextMenu = searchParams.get('fromContextMenu') === 'true';
  const targetEmployeeId = searchParams.get('targetEmployeeId');

  const employeeIdToFetch = fromContextMenu && targetEmployeeId ? targetEmployeeId : userData?.employeeId;

  const loggedinuserRole = userData?.roles[0] 
  ? `ROLE_${userData.roles[0]}` 
  : null;

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
      
      if (!employeeIdToFetch) {
        setError("Employee ID not found. Please login again.");
        return;
      }

      // Fetch teams based on the logged-in/target employee
      const response = await publicinfoApi.get(`employee/team/${employeeIdToFetch}`);
      
      const teamsArray = Array.isArray(response.data) ? response.data : [response.data];
      setTeams(teamsArray || []);
      setError(null);
    } catch (err) {
      setError(`Could not fetch teams data for employee ${employeeIdToFetch}.`);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch or load All Teams data, using the API endpoint directly
  const fetchAdminAllTeams = async () => {
    if (!matchedArray || !matchedArray.includes("ADMIN_FETCHING_ALLTEAMS")) {
      setAdminAllTeams([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setAdminAllTeams([]); // Clear previous state
    
    try {
      // Use the actual API endpoint
      let response = await publicinfoApi.get(
        "employee/0/19/employeeId/asc/teams"
      );
      
      const teamsData = response.data;
      setAdminAllTeams(teamsData);
      console.log("Admin Fetched Teams (ALL_TEAMS view) ✅", teamsData);
      setError(null);
    } catch (error) {
      console.log("Error From Admin Fetching All Teams ❌", error);
      setAdminAllTeams([]); 
      setError('Failed to load all teams directory.');
    } finally {
      setLoading(false);
    }
  };


   useEffect(() => {
    if(loggedinuserRole) {
        let fetchForPermissionArray=async()=>{
            try {
                let response=await authApi.get(`role-access/${loggedinuserRole}`);
                setMatchedArray(response?.data?.permissions);
            } catch (error) {
                console.log("error from Fetching Error matching Objects:",error);
            }
        }
        fetchForPermissionArray();
    }
  },[loggedinuserRole]);

  useEffect(() => {
    if (displayMode === 'MY_TEAMS') {
        fetchTeams();
    } else if (displayMode === 'ALL_TEAMS') {
        // Run admin fetch when switching to ALL_TEAMS mode
        fetchAdminAllTeams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayMode, canCreateTeam, employeeIdToFetch, matchedArray]);
  
  // Determine the current data source based on displayMode
  const currentDataSource = displayMode === 'MY_TEAMS' ? teams : adminallteams;

  // Filter current data source based on search term
  const filteredCurrentTeams = (Array.isArray(currentDataSource) ? currentDataSource : []).filter(team =>
    team.teamName && team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const errors = {};
    if (!teamName.trim()) errors.teamName = "Team Name is required.";
    if (!teamLead) errors.teamLead = "Team Lead is required.";
    if (teamMembers.length === 0) errors.teamMembers = "At least one Team Member is required.";
    if (!selectedProject) errors.selectedProject = "Project selection is required.";
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
        projectId: selectedProject?.value // Send only the project ID
    };

    try {
        await publicinfoApi.post('employee/team', newTeamData);
        
        // Refresh My Teams list after creation
        if (displayMode === 'MY_TEAMS') {
            await fetchTeams();
        }

        // Reset form
        setIsCreateModalOpen(false);
        setTeamName('');
        setTeamLead(null);
        setTeamMembers([]);
        setSelectedProject(null);
        alert('Team created successfully!');
    } catch (err) {
        setFormErrors({ general: err.response?.data?.message || 'Failed to create team. Please check the data and try again.' });
    } finally {
        setIsSubmitting(false);
    }
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
        
        if (displayMode === 'MY_TEAMS') {
            setTeams(teams.filter(t => t.teamId !== selectedTeam.teamId));
        } else if (displayMode === 'ALL_TEAMS') {
            // Update the ALL TEAMS list if we are viewing it
            setAdminAllTeams(adminallteams.filter(t => t.teamId !== selectedTeam.teamId));
        }
        
        setIsDeleteModalOpen(false);
        setSelectedTeam(null);
        alert('Team deleted successfully!');
    } catch (err) {
        alert('Failed to delete team.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderCreateTeamModal = () => {
    if (!isCreateModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-2 sm:p-4">
            <div className={`rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
                <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-500 to-indigo-700 text-white relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                            <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl flex-shrink-0">
                                <FaUsers className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words">Create New Team</h2>
                                <p className="text-white/90 text-xs sm:text-sm break-words">Organize employees into a new team.</p>
                            </div>
                        </div>
                        <button onClick={() => {
                            setIsCreateModalOpen(false);
                            // Reset form
                            setTeamName('');
                            setTeamLead(null);
                            setTeamMembers([]);
                            setSelectedProject(null);
                            setFormErrors({});
                        }} className="p-2 sm:p-3 hover:bg-white/20 rounded-full transition-all group flex-shrink-0">
                            <FaTimes className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-grow">
                    <form className="p-4 sm:p-6 md:p-8" onSubmit={handleCreateTeam}>
                        <div className="space-y-4 sm:space-y-6">
                           <div>
                                <label className={`block text-xs sm:text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Team Name <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={teamName} 
                                    onChange={(e) => setTeamName(e.target.value)} 
                                    className={`w-full p-3 border-2 rounded-xl transition-colors ${
                                        formErrors.teamName ? 'border-red-300' : (theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white text-gray-900')
                                    }`} 
                                    placeholder="e.g., Development Team" 
                                />
                                {formErrors.teamName && <p className="text-red-500 text-xs mt-1">{formErrors.teamName}</p>}
                            </div>

                            <div>
                                <label className={`block text-xs sm:text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Project <span className="text-red-500">*</span>
                                </label>
                                <ProjectDropdown 
                                    value={selectedProject} 
                                    onChange={setSelectedProject} 
                                    theme={theme} 
                                    error={formErrors.selectedProject} 
                                />
                                {formErrors.selectedProject && <p className="text-red-500 text-xs mt-1">{formErrors.selectedProject}</p>}
                            </div>

                            <div>
                                <label className={`block text-xs sm:text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Team Lead <span className="text-red-500">*</span>
                                </label>
                                <EmployeeDropdown value={teamLead} onChange={setTeamLead} theme={theme} error={formErrors.teamLead} />
                                {formErrors.teamLead && <p className="text-red-500 text-xs mt-1">{formErrors.teamLead}</p>}
                            </div>
                            <div>
                                <label className={`block text-xs sm:text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Team Members <span className="text-red-500">*</span>
                                </label>
                                <EmployeeDropdown value={teamMembers} onChange={setTeamMembers} theme={theme} error={formErrors.teamMembers} isMulti={true} />
                                {formErrors.teamMembers && <p className="text-red-500 text-xs mt-1">{formErrors.teamMembers}</p>}
                            </div>
                        </div>
                        {formErrors.general && (
                            <div className={`mt-4 sm:mt-6 p-3 sm:p-4 border-l-4 border-red-400 rounded-r-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                                <div className="flex items-center">
                                    <IoWarning className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-3 flex-shrink-0" />
                                    <p className={`font-medium text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>{formErrors.general}</p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <button 
                        type="button" 
                        onClick={() => {
                            setIsCreateModalOpen(false);
                            // Reset form
                            setTeamName('');
                            setTeamLead(null);
                            setTeamMembers([]);
                            setSelectedProject(null);
                            setFormErrors({});
                        }} 
                        className={`w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl font-semibold transition-all text-sm ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleCreateTeam} 
                        disabled={isSubmitting} 
                        className={`w-full sm:w-auto px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-lg sm:rounded-xl
                                     hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2 text-sm
                                     ${isSubmitting ? 'cursor-not-allowed opacity-75' : ''}`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="h-4 w-4 sm:h-5 sm:w-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Create Team</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
  };

  const handleMyTeamsClick = () => {
    setDisplayMode('MY_TEAMS');
    setIsRightSidebarOpen(false);
  };

  const handleAllTeamsClick = () => {
    setDisplayMode('ALL_TEAMS');
    setIsRightSidebarOpen(false);
    
    // Logic to run when All Teams is clicked (runs the fetch which populates adminallteams)
    fetchAdminAllTeams();
  };

  // Render content based on displayMode
  const renderContent = () => {
    // Determine the current data source and title
    const isMyTeamsMode = displayMode === 'MY_TEAMS';
    const teamsToRender = isMyTeamsMode ? teams : adminallteams;
    const teamTitle = isMyTeamsMode ? 'My Teams' : 'All Teams';

    // Show loading spinner if currently loading data
    if (loading) {
        return <LoadingSpinner />;
    }

    // Show error only if there is a general error on the page
    if (error && isMyTeamsMode) {
        return <ErrorDisplay message={error} />;
    }
    
    // Filter the current list of teams
    const teamsToRenderAfterSearch = (Array.isArray(currentDataSource) ? currentDataSource : []).filter(team =>
        team.teamName && team.teamName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Check if loading has finished and the array is empty (for both modes)
    if (teamsToRenderAfterSearch.length === 0) {
        return (
            <div className="text-center py-12 sm:py-16 px-4">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                    <FaUsers className={`w-8 h-8 sm:w-10 sm:h-10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <h2 className={`text-lg sm:text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {searchTerm ? `No Teams Found matching "${searchTerm}"` : `${teamTitle} Not Available`}
                </h2>
                <p className={`text-sm sm:text-base mb-4 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {isMyTeamsMode
                        ? 'You are not part of any teams yet. Ask your manager to add you.'
                        : 'No teams are currently listed in the directory or unable to fetch directory data.'
                    }
                </p>
            </div>
        );
    }
    
    // Render Team Cards
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mx-4 sm:mx-0">
                {teamsToRenderAfterSearch.map((team, index) => {
                    const teamId = team.teamId || index;
                    const isExpanded = isTeamExpanded(teamId);
                    const membersToShow = isExpanded ? team.employees : team.employees?.slice(0, 5);
                    const hasMoreMembers = team.employees?.length > 5;
                    // The teamLead variable is still optional and depends on data structure
                    const teamLead = team.employees?.find(emp => emp.jobTitlePrimary === 'TEAM_LEAD');

                    return (
                        <div key={teamId} className={`rounded-none sm:rounded-lg shadow-lg overflow-hidden border transition-shadow duration-300 flex flex-col ${theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:shadow-blue-500/20' : 'bg-white border-gray-200 hover:shadow-xl'}`}>
                            <div className="p-4 sm:p-5">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <h2 className={`text-lg sm:text-xl font-bold break-words ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            {team.teamName}
                                        </h2>
                                        {teamLead && (
                                            <div className={`flex items-center text-sm sm:text-md mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <FaUserShield className="mr-2 text-green-500 flex-shrink-0" />
                                                <strong>Lead:</strong><span className="ml-1 break-words">{teamLead.displayName}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex space-x-2 flex-shrink-0">
                                        <Link to={`/teams/${teamId}`} title="View Details" className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
                                            <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </Link>
                                        { matchedArray?.includes("TEAM_DELETE_BTN") && !fromContextMenu && (
                                            <button onClick={() => handleDeleteClick(team)} title="Delete Team" className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                                <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={`px-4 sm:px-5 py-3 sm:py-4 border-t mt-auto ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                <h3 className={`font-semibold mb-2 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Members ({team.employees?.length || 0})
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-1 sm:gap-2">
                                        {membersToShow?.map(member => (
                                            <span key={member.employeeId} className={`text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full break-words ${
                                                member.employeeId === employeeIdToFetch 
                                                    ? theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                                                    : theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {member.displayName}
                                                {member.employeeId === employeeIdToFetch && ' (You)'}
                                            </span>
                                        ))}
                                    </div>
                                    {hasMoreMembers && (
                                        <button
                                            onClick={() => toggleTeamExpansion(teamId)}
                                            className="flex items-center space-x-1 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
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
            
        </>
    );
  };

  const hasAdminPermissions = matchedArray && matchedArray.includes("ADMIN_FETCHING_ALLTEAMS");

  return (
    <div className={`relative flex min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        
        {/* Sticky Open Sidebar Button - Visible only if user has admin permission and sidebar is closed */}
        {hasAdminPermissions && !isRightSidebarOpen && (
            <button
                onClick={() => setIsRightSidebarOpen(true)}
                className="fixed right-0 top-1/2 -translate-y-1/2 p-2 rounded-l-lg bg-indigo-600 text-white shadow-lg z-50 hover:bg-indigo-700 transition-colors"
                aria-label="Open Navigation Sidebar"
                title="Open Navigation"
            >
                <FaChevronLeft size={24} />
            </button>
        )}

        {/* Main Content Area - adjust margin based on sidebar state */}
        <div className={`flex-1 transition-all duration-300 ${isRightSidebarOpen ? 'lg:mr-60' : 'mr-0'}`}>
            <div className={`px-0 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8`}>
                {/* Existing content starts here */}
                {fromContextMenu && targetEmployeeId && (
                    <div className={`mb-4 sm:mb-6 p-3 sm:p-4 mx-4 sm:mx-0 rounded-none sm:rounded-xl border-l-4 border-blue-500 shadow-md flex items-center space-x-3 ${theme === 'dark' ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
                        <FaEye className="flex-shrink-0" />
                        <p className="font-semibold text-sm sm:text-base break-words">
                            🔍 Viewing teams for employee: <span className="font-mono">{targetEmployeeId}</span>
                        </p>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-4 mx-4 sm:mx-0">
                    <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        <FaUsers className="mr-2 sm:mr-3 text-blue-500" /> 
                        {displayMode === 'MY_TEAMS' ? 'My Teams' : (fromContextMenu ? 'Employee Teams' : 'All Teams')}
                    </h1>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search by team name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-8 sm:pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'}`}
                            />
                            <FaSearch className={`absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                        {matchedArray?.includes("CREATE_TEAM") && !fromContextMenu && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="w-full sm:w-auto bg-black text-white px-4 sm:px-5 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center shadow-md text-sm"
                            >
                                <FaPlus className="mr-2" /> Create Team
                            </button>
                        )}
                    </div>
                </div>

                {renderContent()}

                {/* Existing Modals remain here */}
                {renderCreateTeamModal()}
                
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
        </div>

        {/* Right Sidebar - Desktop and Mobile (Navigation Sidebar) - Conditionally Rendered */}
        {hasAdminPermissions && (
            <aside
                // Modified top and height to start below the fixed Navbar (h-16 or 64px)
                className={`fixed top-16 right-0 h-[calc(100vh-4rem)] border-l transition-all duration-300 z-50 flex flex-col ${
                    isRightSidebarOpen ? 'w-60 translate-x-0' : 'w-0 translate-x-full'
                } ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
                {/* Sticky Close Sidebar Button on the side (Desktop only) */}
                {isRightSidebarOpen && (
                    <button
                        onClick={() => setIsRightSidebarOpen(false)}
                        className="absolute -left-12 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors z-50 hidden md:block"
                        aria-label="Close Navigation Sidebar"
                        title="Close Navigation"
                    >
                        <FaChevronRight size={24} />
                    </button>
                )}

                <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Navigation</h3>
                    {/* FaTimes is kept for mobile close functionality inside the panel */}
                    <button
                        onClick={() => setIsRightSidebarOpen(false)}
                        className={`p-1 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                        title="Close Sidebar"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {/* My Teams button (Default Active) */}
                    <button
                        onClick={handleMyTeamsClick}
                        className={`w-full text-left py-2 px-3 rounded-lg font-medium flex items-center transition-colors ${
                            displayMode === 'MY_TEAMS'
                                ? 'bg-blue-600 text-white'
                                : theme === 'dark'
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <FaUsers className="mr-2" size={16} />
                        My Teams
                    </button>
                    {/* All Teams button (Displays "Under Progress" / Runs Admin Fetch) */}
                    <button
                        onClick={handleAllTeamsClick}
                        className={`w-full text-left py-2 px-3 rounded-lg font-medium flex items-center transition-colors ${
                            displayMode === 'ALL_TEAMS'
                                ? 'bg-blue-600 text-white'
                                : theme === 'dark'
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <FaUsers className="mr-2" size={16} />
                        All Teams
                    </button>
                </nav>
            </aside>
        )}

        {/* Overlay for mobile view */}
        {isRightSidebarOpen && (
            <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsRightSidebarOpen(false)}
            />
        )}
    </div>
  );
};

export default AllTeams;
