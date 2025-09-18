import React, { useState, useEffect, useContext } from 'react';
import { publicinfoApi } from '../../../../axiosInstance';
import { FaUsers, FaTimes } from 'react-icons/fa';
import { IoCheckmarkCircle, IoWarning } from 'react-icons/io5';
import { Context } from '../HrmsContext';
import Select from 'react-select';

const EditTeamModal = ({ team, isOpen, onClose, onTeamUpdated, employees }) => {
    const { theme } = useContext(Context);

    // Form state
    const [teamName, setTeamName] = useState('');
    const [teamMembers, setTeamMembers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (team) {
            setTeamName(team.teamName || '');
            const currentMembers = team.employees?.map(emp => ({
                value: emp.employeeId,
                label: `${emp.displayName} (${emp.employeeId})`
            })) || [];
            setTeamMembers(currentMembers);
        }
    }, [team]);
    
    if (!isOpen) return null;

    const validateForm = () => {
        const errors = {};
        if (!teamName.trim()) errors.teamName = "Team Name is required.";
        if (teamMembers.length === 0) errors.teamMembers = "At least one Team Member is required.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateTeam = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setFormErrors({});
        
        const projectIdToSend = (team && team.projects && team.projects.length > 0) 
                                  ? team.projects[0] 
                                  : "PRO1001"; 

        if (!projectIdToSend) {
            setFormErrors({ general: 'Error: Project ID is missing. Cannot update the team.' });
            setIsSubmitting(false);
            return;
        }

        const updatedTeamData = {
            teamId: team.teamId,
            teamName,
            teamDescription: team.teamDescription || "",
            employeeIds: teamMembers.map(member => member.value),
            projectId: projectIdToSend
        };

        console.log("Update Team Payload:", updatedTeamData);

        try {
            await publicinfoApi.put(`employee/team/employee/${team.teamId}`, updatedTeamData);
            onTeamUpdated();
            onClose();
            alert('Team updated successfully!');
        } catch (err) {
            console.error("Error updating team:", err);
            setFormErrors({ general: err.response?.data?.message || 'Failed to update team. Please check the data and try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            padding: '0.4rem 0.5rem',
            border: `2px solid ${state.isFocused ? '#3b82f6' : (formErrors[state.selectProps.name] ? '#f87171' : (theme === 'dark' ? '#4b5563' : '#e5e7eb'))}`,
            backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
            borderRadius: '0.75rem',
            boxShadow: state.isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
            fontSize: '14px',
            '&:hover': {
                borderColor: state.isFocused ? '#3b82f6' : (theme === 'dark' ? '#6b7280' : '#d1d5db'),
            },
        }),
        multiValue: (styles) => ({...styles, backgroundColor: theme === 'dark' ? '#4f46e5' : '#e0e7ff', color: theme === 'dark' ? 'white' : '#3730a3', borderRadius: '0.5rem', fontSize: '12px'}),
        multiValueLabel: (styles) => ({...styles, color: theme === 'dark' ? 'white' : '#3730a3', fontSize: '12px'}),
        multiValueRemove: (styles) => ({...styles, color: theme === 'dark' ? '#e0e7ff' : '#4f46e5', ':hover': { backgroundColor: theme === 'dark' ? '#6366f1' : '#c7d2fe', color: 'white' }}),
        option: (styles, { isFocused, isSelected }) => ({...styles, backgroundColor: isSelected ? (theme === 'dark' ? '#4f46e5' : '#6366f1') : isFocused ? (theme === 'dark' ? '#374151' : '#f3f4f6') : (theme === 'dark' ? '#1f2937' : 'white'), color: isSelected ? 'white' : (theme === 'dark' ? '#d1d5db' : '#1f2937'), fontSize: '14px'}),
        menu: (provided) => ({...provided, backgroundColor: theme === 'dark' ? '#1f2937' : 'white', borderRadius: '0.75rem'}),
        singleValue: (provided) => ({...provided, color: theme === 'dark' ? 'white' : 'black', fontSize: '14px'}),
        placeholder: (provided) => ({...provided, fontSize: '14px'}),
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-2 sm:p-4">
            <div className={`rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Header */}
                <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-500 to-indigo-700 text-white relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                            <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl flex-shrink-0">
                                <FaUsers className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words">Edit Team</h2>
                                <p className="text-white/90 text-xs sm:text-sm break-words">Update the details for {team.teamName}.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 sm:p-3 hover:bg-white/20 rounded-full transition-all group flex-shrink-0">
                            <FaTimes className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="overflow-y-auto flex-grow">
                    <form className="p-4 sm:p-6 md:p-8" onSubmit={handleUpdateTeam}>
                        <div className="space-y-4 sm:space-y-6">
                            {/* Team Name Field */}
                            <div>
                                <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Team Name <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={teamName} 
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className={`w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all text-sm ${
                                        formErrors.teamName 
                                            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                            : theme === 'dark' 
                                            ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 focus:border-blue-500' 
                                            : 'border-gray-200 bg-white hover:border-gray-300 focus:border-blue-500'
                                    } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                                    placeholder="Enter team name..."
                                />
                                {formErrors.teamName && (
                                    <div className="mt-2 flex items-center space-x-2 text-red-600">
                                        <IoWarning className="w-4 h-4 flex-shrink-0" />
                                        <p className="text-xs sm:text-sm font-medium">{formErrors.teamName}</p>
                                    </div>
                                )}
                            </div>

                            {/* Team Members Field */}
                            <div>
                                <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Team Members <span className="text-red-500">*</span>
                                </label>
                                <Select 
                                    name="teamMembers"
                                    isMulti 
                                    options={employees} 
                                    value={teamMembers} 
                                    onChange={setTeamMembers} 
                                    styles={customSelectStyles}
                                    placeholder="Select team members..."
                                />
                                {formErrors.teamMembers && (
                                    <div className="mt-2 flex items-center space-x-2 text-red-600">
                                        <IoWarning className="w-4 h-4 flex-shrink-0" />
                                        <p className="text-xs sm:text-sm font-medium">{formErrors.teamMembers}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* General Error Message */}
                        {formErrors.general && (
                            <div className={`mt-4 sm:mt-6 p-3 sm:p-4 border-l-4 border-red-400 rounded-r-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
                                <div className="flex items-center">
                                    <IoWarning className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-3 flex-shrink-0" />
                                    <p className={`font-medium text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
                                        {formErrors.general}
                                    </p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
                
                {/* Footer Buttons */}
                <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className={`w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl font-semibold transition-all text-sm ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleUpdateTeam} 
                        disabled={isSubmitting} 
                        className={`w-full sm:w-auto px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-lg sm:rounded-xl
                                     hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center space-x-2 text-sm
                                     ${isSubmitting ? 'cursor-not-allowed opacity-75' : ''}`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="h-4 w-4 sm:h-5 sm:w-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Updating...</span>
                            </>
                        ) : (
                            <>
                                <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Update Team</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditTeamModal;
