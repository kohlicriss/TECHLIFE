import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authApi, publicinfoApi } from '../../../../axiosInstance';
import { FaUsers, FaProjectDiagram, FaArrowLeft, FaUserShield, FaEdit } from 'react-icons/fa';
import { Context } from '../HrmsContext';
import EditTeamModal from './EditTeamModal';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-40 sm:h-64">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="text-center p-4 sm:p-8 bg-red-100 text-red-700 rounded-lg">
        <h3 className="font-bold text-base sm:text-lg">Oops! Something went wrong.</h3>
        <p className="text-sm sm:text-base">{message}</p>
    </div>
);

const TeamDetails = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [allEmployees, setAllEmployees] = useState([]);
    const [loggedPermissiondata,setLoggedPermissionData]=useState([]);
    const [matchedArray,setMatchedArray]=useState(null);

    useEffect(()=>{
        let fetchedData=async()=>{
                let response = await authApi.get(`role-access/${LoggedUserRole}`);
                console.log("from Edit Team :",response.data);
                setLoggedPermissionData(response.data);
        }
        fetchedData();
    },[])
  
    useEffect(()=>{
        if(loggedPermissiondata){
            setMatchedArray(loggedPermissiondata?.permissions)
        }
    },[loggedPermissiondata]);
    console.log(matchedArray);



    const { theme, userData } = useContext(Context);
    const userRoles = userData?.roles || [];
    const canModifyTeam = userRoles.includes('ADMIN') || userRoles.includes('HR') || userRoles.includes('MANAGER');
    

        const LoggedUserRole=userData?.roles[0]?`ROLE_${userData?.roles[0]}`:null
        console.log("Logged user role ",LoggedUserRole)

        
        


    // 🎯 Get logged in user ID
    const empID = userData?.employeeId;

    const fetchTeamDetails = async () => {
        try {
            setLoading(true);
            const teamResponse = await publicinfoApi.get(`employee/team/employee/${teamId}`);
            const teamData = Array.isArray(teamResponse.data) ? teamResponse.data[0] : teamResponse.data;
            setTeam(teamData);

            const projectsResponse = await publicinfoApi.get(`employee/team/projects/${teamId}`);
            setProjects(projectsResponse.data || []);
            
            setError(null);
        } catch (err) {
            console.error("Error fetching team details:", err);
            setError("Could not fetch team details. The team may not exist or an error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllEmployees = async () => {
        try {
          const response = await publicinfoApi.get('employee/0/1000/employeeId/asc/employees');
          const formattedEmployees = response.data.map(emp => ({
            value: emp.employeeId,
            label: `${emp.displayName} (${emp.employeeId})`
          }));
          setAllEmployees(formattedEmployees);
        } catch (err) {
          console.error("Error fetching employees:", err);
        }
    };

    // 🚀 Handle user click navigation
    const handleUserClick = (member) => {
        if (empID && member.employeeId) {
            navigate(`/employees/${empID}/public/${member.employeeId}`);
        }
    };

    useEffect(() => {
        if (teamId) {
            fetchTeamDetails();
            if (canModifyTeam) {
                fetchAllEmployees();
            }
        }
    }, [teamId, canModifyTeam]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;
    if (!team) return <div className={`text-center p-4 sm:p-8 text-sm sm:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>No team data found.</div>;
    
    const teamWithProjects = { ...team, projects };

    return (
        <div className={`px-0 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            <div className="max-w-7xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-blue-500 hover:underline mb-4 sm:mb-6 px-4 sm:px-0 text-sm sm:text-base"
                >
                    <FaArrowLeft className="mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Back to All Teams
                </button>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 md:mb-8 px-4 sm:px-0 gap-4 sm:gap-0">
                    <div className="w-full sm:w-auto">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold break-words">{team.teamName}</h1>
                        <p className={`mt-1 sm:mt-2 text-xs sm:text-sm md:text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Details for team ID: {team.teamId}
                        </p>
                    </div>
                    {matchedArray.includes("TEAMS_EDIT_TEAM") && (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="w-full sm:w-auto bg-blue-600 text-white px-3 sm:px-4 md:px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center shadow-md text-xs sm:text-sm md:text-base"
                        >
                            <FaEdit className="mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Edit Team
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {/* Team Members Column */}
                    <div className="lg:col-span-2">
                        <div className={`rounded-none sm:rounded-lg shadow-lg overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="p-3 sm:p-4 md:p-5 flex items-center space-x-3 sm:space-x-4">
                                <FaUsers className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-500 flex-shrink-0"/>
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words">Team Members ({team.employees?.length || 0})</h2>
                            </div>
                            <div className="p-3 sm:p-4 md:p-5">
                                <ul className="space-y-3 sm:space-y-4">
                                    {team.employees?.map(member => (
                                        <li 
                                            key={member.employeeId} 
                                            onClick={() => handleUserClick(member)}
                                            className={`p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 transition-all cursor-pointer transform hover:scale-105 ${
                                                theme === 'dark' 
                                                ? 'bg-gray-700 hover:bg-gray-600 hover:shadow-lg' 
                                                : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md'
                                            }`}
                                            title={`Click to view ${member.displayName}'s profile`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm sm:text-base break-words">{member.displayName}</p>
                                                <p className={`text-xs sm:text-sm mt-1 break-words ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {member.workEmail}
                                                </p>
                                                <p className={`text-xs font-mono mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    ID: {member.employeeId}
                                                </p>
                                            </div>
                                            {member.jobTitlePrimary && (
                                                <div className={`text-xs font-bold px-2 sm:px-3 py-1 rounded-full flex items-center flex-shrink-0 ${
                                                    member.jobTitlePrimary === 'TEAM_LEAD' 
                                                    ? (theme === 'dark' ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800')
                                                    : (theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700')
                                                }`}>
                                                    {member.jobTitlePrimary === 'TEAM_LEAD' && <FaUserShield className="mr-1 sm:mr-2 w-3 h-3"/>}
                                                    <span className="break-words">{member.jobTitlePrimary}</span>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Projects Column */}
                    <div>
                        <div className={`rounded-none sm:rounded-lg shadow-lg overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="p-3 sm:p-4 md:p-5 flex items-center space-x-3 sm:space-x-4">
                                <FaProjectDiagram className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-500 flex-shrink-0"/>
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words">Projects ({projects.length})</h2>
                            </div>
                            <div className="p-3 sm:p-4 md:p-5">
                                {projects.length > 0 ? (
                                    <ul className="space-y-2 sm:space-y-3">
                                        {projects.map(projectId => (
                                            <li key={projectId} className={`p-2 sm:p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                <p className="font-semibold text-sm sm:text-base break-words">{projectId}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        No projects are currently assigned to this team.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditTeamModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                team={teamWithProjects}
                onTeamUpdated={fetchTeamDetails}
                employees={allEmployees}
            />
        </div>
    );
};

export default TeamDetails;
