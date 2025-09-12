import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // useNavigate ఇంపోర్ట్ చేయండి
import { publicinfoApi } from '../../../../axiosInstance';
import { FaUsers, FaProjectDiagram, FaArrowLeft, FaUserShield } from 'react-icons/fa';
import { Context } from '../HrmsContext';

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

const TeamDetails = () => {
    const { teamId } = useParams();
    const navigate = useNavigate(); // useNavigate ను ఇక్కడ ఉపయోగించండి
    const [team, setTeam] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { theme } = useContext(Context);

    useEffect(() => {
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

        if (teamId) {
            fetchTeamDetails();
        }
    }, [teamId]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorDisplay message={error} />;
    if (!team) return <div className={`text-center p-8 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>No team data found.</div>;

    return (
        <div className={`p-6 md:p-8 min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            <div className="max-w-7xl mx-auto">
                {/* <<<<<----- ఇక్కడ మార్పు చేయబడింది ----->>>>> */}
                <button onClick={() => navigate(-1)} className="flex items-center text-blue-500 hover:underline mb-6">
                    <FaArrowLeft className="mr-2" /> Back to All Teams
                </button>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold">{team.teamName}</h1>
                    <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Details for team ID: {team.teamId}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Team Members Column */}
                    <div className="lg:col-span-2">
                        <div className={`rounded-lg shadow-lg overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="p-5 flex items-center space-x-4">
                                <FaUsers className="w-8 h-8 text-blue-500"/>
                                <h2 className="text-2xl font-bold">Team Members ({team.employees?.length || 0})</h2>
                            </div>
                            <div className="p-5">
                                <ul className="space-y-4">
                                    {team.employees?.map(member => (
                                        <li key={member.employeeId} className={`p-4 rounded-lg flex justify-between items-center transition-all ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                            <div>
                                                <p className="font-semibold">{member.displayName}</p>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{member.workEmail}</p>
                                            </div>
                                            {member.jobTitlePrimary && (
                                                <div className={`text-xs font-bold px-3 py-1 rounded-full flex items-center ${
                                                    member.jobTitlePrimary === 'TEAM_LEAD' 
                                                    ? (theme === 'dark' ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800')
                                                    : (theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700')
                                                }`}>
                                                    {member.jobTitlePrimary === 'TEAM_LEAD' && <FaUserShield className="mr-2"/>}
                                                    {member.jobTitlePrimary}
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
                        <div className={`rounded-lg shadow-lg overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="p-5 flex items-center space-x-4">
                                <FaProjectDiagram className="w-8 h-8 text-purple-500"/>
                                <h2 className="text-2xl font-bold">Projects ({projects.length})</h2>
                            </div>
                            <div className="p-5">
                                {projects.length > 0 ? (
                                    <ul className="space-y-3">
                                        {projects.map(projectId => (
                                            <li key={projectId} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                <p className="font-semibold">{projectId}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>No projects are currently assigned to this team.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamDetails;