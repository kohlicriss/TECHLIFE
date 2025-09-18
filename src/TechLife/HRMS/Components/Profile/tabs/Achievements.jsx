import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { publicinfoApi } from '../../../../../axiosInstance';
import { FaTrophy, FaCalendarAlt, FaExternalLinkAlt, FaBuilding, FaIdBadge, FaPencilAlt, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { IoCheckmarkCircle, IoWarning } from 'react-icons/io5';
import { Context } from '../../HrmsContext';

// --- Reusable Modal Component ---
const Modal = ({ children, onClose, title, type, theme }) => {
    let titleClass = "";
    let icon = null;

    if (type === "success") {
        titleClass = "text-green-600";
        icon = <IoCheckmarkCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />;
    } else if (type === "error") {
        titleClass = "text-red-600";
        icon = <IoWarning className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />;
    } else if (type === "confirm") {
        titleClass = "text-yellow-600";
        icon = <IoWarning className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[250]">
            <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md m-4 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center mb-4">
                    {icon && <span className="mr-3">{icon}</span>}
                    <h3 className={`text-lg sm:text-xl font-bold ${titleClass}`}>{title}</h3>
                </div>
                {children}
            </div>
        </div>
    );
};

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { empID } = useParams();
  const location = useLocation();
  const { userData, theme } = useContext(Context);  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // State for popups
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, certificateId: null });

  const searchParams = new URLSearchParams(location.search);
  const fromContextMenu = searchParams.get('fromContextMenu') === 'true';
  const targetEmployeeId = searchParams.get('targetEmployeeId');
  const employeeIdToFetch = fromContextMenu && targetEmployeeId ? targetEmployeeId : empID;
  
  const userRole = userData?.roles?.[0]?.toUpperCase();
  const hasManagementAccess = ["ADMIN", "MANAGER", "HR"].includes(userRole);
  const isOwnProfile = employeeIdToFetch === empID;
  const canEdit = isOwnProfile || hasManagementAccess;

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!employeeIdToFetch) return;
      try {
        setLoading(true);
        const response = await publicinfoApi.get(`/employee/${employeeIdToFetch}/achievements`);
        console.log(`Fetching achievements for: ${employeeIdToFetch}`, response.data);
        setAchievements(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch achievements. Please try again later.');
        console.error("Error fetching achievements:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [employeeIdToFetch]);

  const handleOpenModal = (achievement = null) => {
    if (achievement) {
      setSelectedAchievement(achievement);
      setIsEditMode(true);
    } else {
      setSelectedAchievement({
        certificationName: '',
        issuingAuthorityName: '',
        certificationURL: '',
        issueMonth: '',
        issueYear: '',
        expirationMonth: '',
        expirationYear: '',
        licenseNumber: ''
      });
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAchievement(null);
  };

  const handleDelete = (certificateId) => {
    setDeleteConfirmation({ show: true, certificateId: certificateId });
  };

  const confirmDelete = async () => {
      const { certificateId } = deleteConfirmation;
      try {
        await publicinfoApi.delete(`/employee/${employeeIdToFetch}/${certificateId}/achievements`);
        setAchievements(achievements.filter(ach => ach.id !== certificateId));
        setPopup({ show: true, message: 'Achievement deleted successfully!', type: 'success' });
      } catch (err) {
        console.error('Error deleting achievement:', err);
        setPopup({ show: true, message: 'Failed to delete achievement. Please try again.', type: 'error' });
      } finally {
        setDeleteConfirmation({ show: false, certificateId: null });
      }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const achievementDTO = Object.fromEntries(formData.entries());

    const submissionData = new FormData();
    submissionData.append('achievementDTO', new Blob([JSON.stringify(achievementDTO)], { type: 'application/json' }));

    try {
        let response;
        if (isEditMode) {
            const url = `/employee/${employeeIdToFetch}/${selectedAchievement.id}/achievements`;
            response = await publicinfoApi.put(url, submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAchievements(achievements.map(ach => ach.id === selectedAchievement.id ? response.data : ach));
            setPopup({ show: true, message: 'Achievement updated successfully!', type: 'success' });
        } else {
            const url = `/employee/achievements/${employeeIdToFetch}`;
            response = await publicinfoApi.post(url, submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAchievements([...achievements, response.data]);
            setPopup({ show: true, message: 'Achievement added successfully!', type: 'success' });
        }
        handleCloseModal();
    } catch (err) {
        console.error('Error saving achievement:', err.response?.data || err.message);
        setPopup({ show: true, message: 'Failed to save achievement. Please check your input and try again.', type: 'error' });
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="text-center px-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-500 border-t-transparent mx-auto mb-4 sm:mb-6"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaTrophy className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          </div>
        </div>
        <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>Loading Achievements</h2>
        <p className={`text-sm sm:text-base ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>Fetching certifications and achievements...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="text-center px-4">
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${
          theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
        }`}>
          <FaTrophy className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
        </div>
        <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>Error Loading Achievements</h2>
        <p className={`text-sm sm:text-base ${
          theme === 'dark' ? 'text-red-300' : 'text-red-500'
        }`}>{error}</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-8xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 md:py-12">
        {/* Header Section */}
        <div className={`rounded-none sm:rounded-2xl p-4 sm:p-6 shadow-lg border mb-6 sm:mb-8 mx-4 sm:mx-0 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-md flex-shrink-0 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-white'
              }`}>
                <FaTrophy className={`w-6 h-6 sm:w-8 sm:h-8 ${
                  theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                }`} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className={`text-lg sm:text-xl md:text-2xl font-bold break-words ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Achievements & Certifications
                </h2>
                <p className={`text-xs sm:text-sm break-words ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {isOwnProfile ? 'Your professional certifications and achievements' : 'Professional certifications and achievements'}
                </p>
              </div>
            </div>
            {canEdit && (
              <button 
                onClick={() => handleOpenModal()} 
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                }`}
                title={isOwnProfile ? "Add your achievement" : "Add achievement"}
              >
                <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{isOwnProfile ? 'Add My Achievement' : 'Add Achievement'}</span>
                <span className="sm:hidden">Add Achievement</span>
              </button>
            )}
          </div>
        </div>

        {/* Achievements Grid */}
        {achievements.length === 0 ? (
          <div className={`text-center py-12 sm:py-16 px-4 sm:px-6 rounded-none sm:rounded-2xl shadow-lg border mx-4 sm:mx-0 ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <FaTrophy className={`w-8 h-8 sm:w-10 sm:h-10 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
            <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              {isOwnProfile ? 'No Achievements Yet' : 'No Achievements Found'}
            </h3>
            <p className={`text-sm max-w-md mx-auto break-words ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {isOwnProfile 
                ? 'No achievements have been recorded yet. Add your certifications and accomplishments to showcase your expertise.'
                : 'This employee has not added any achievements or certifications yet.'
              }
            </p>
            {canEdit && isOwnProfile && (
              <button 
                onClick={() => handleOpenModal()} 
                className={`mt-6 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold flex items-center space-x-2 mx-auto transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Your First Achievement</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {achievements.map((ach) => (
              <div key={ach.id} className={`p-4 sm:p-6 rounded-none sm:rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative group ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 hover:shadow-blue-500/20' 
                  : 'bg-white border-gray-200'
              }`}>
                {canEdit && (
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => handleOpenModal(ach)} 
                      className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                        theme === 'dark'
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title={isOwnProfile ? "Edit your achievement" : "Edit achievement"}
                    >
                      <FaPencilAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(ach.id)} 
                      className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                        theme === 'dark'
                          ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title={isOwnProfile ? "Delete your achievement" : "Delete achievement"}
                    >
                      <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-md flex-shrink-0 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50'
                  }`}>
                    <FaTrophy className={`text-2xl sm:text-3xl ${
                      theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="mb-4">
                      <h3 className={`text-lg sm:text-xl font-bold mb-2 break-words ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {ach.certificationName}
                      </h3>
                      <p className={`text-sm sm:text-md flex items-center break-words ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <FaBuilding className="mr-2 flex-shrink-0" />
                        {ach.issuingAuthorityName}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div className={`p-2 sm:p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center mb-1">
                          <FaCalendarAlt className={`mr-2 text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={`text-xs font-semibold uppercase tracking-wide ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Issued
                          </span>
                        </div>
                        <span className={`font-medium break-words ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {ach.issueMonth} {ach.issueYear}
                        </span>
                      </div>
                      
                      <div className={`p-2 sm:p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center mb-1">
                          <FaCalendarAlt className={`mr-2 text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={`text-xs font-semibold uppercase tracking-wide ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Expires
                          </span>
                        </div>
                        <span className={`font-medium break-words ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {ach.expirationMonth && ach.expirationYear 
                            ? `${ach.expirationMonth} ${ach.expirationYear}` 
                            : 'No Expiration'
                          }
                        </span>
                      </div>
                      
                      <div className={`p-2 sm:p-3 rounded-lg sm:col-span-2 lg:col-span-1 ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center mb-1">
                          <FaIdBadge className={`mr-2 text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={`text-xs font-semibold uppercase tracking-wide ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            License No
                          </span>
                        </div>
                        <span className={`font-medium break-words ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {ach.licenseNumber || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    {ach.certificationURL && (
                      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a 
                          href={ach.certificationURL} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-xs sm:text-sm ${
                            theme === 'dark'
                              ? 'text-blue-400 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-700'
                              : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                          }`}
                        >
                          <span>View Credential</span>
                          <FaExternalLinkAlt className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex justify-center items-center z-[200] p-2 sm:p-4">
            <div className={`rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-lg sm:text-xl md:text-2xl font-bold break-words ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {isEditMode 
                    ? (isOwnProfile ? 'Edit Your Achievement' : 'Edit Achievement')
                    : (isOwnProfile ? 'Add Your Achievement' : 'Add New Achievement')
                  }
                </h2>
                <p className={`text-xs sm:text-sm mt-1 break-words ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {isEditMode 
                    ? 'Update the achievement details below'
                    : 'Fill in the details to add a new certification or achievement'
                  }
                </p>
              </div>
              
              <div className="p-4 sm:p-6 md:p-8">
                <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className={`block text-xs sm:text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Certification Name *
                      </label>
                      <input 
                        name="certificationName" 
                        defaultValue={selectedAchievement?.certificationName} 
                        placeholder="e.g., AWS Certified Solutions Architect" 
                        className={`w-full p-2 sm:p-3 rounded-lg border transition-colors text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        required 
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs sm:text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Issuing Authority *
                      </label>
                      <input 
                        name="issuingAuthorityName" 
                        defaultValue={selectedAchievement?.issuingAuthorityName} 
                        placeholder="e.g., Amazon Web Services" 
                        className={`w-full p-2 sm:p-3 rounded-lg border transition-colors text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        required 
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs sm:text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Issue Month *
                      </label>
                      <select 
                        name="issueMonth" 
                        defaultValue={selectedAchievement?.issueMonth} 
                        className={`w-full p-2 sm:p-3 rounded-lg border transition-colors text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        required
                      >
                        <option value="">Select Month</option>
                        {['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ].map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-xs sm:text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Issue Year *
                      </label>
                      <input 
                        name="issueYear" 
                        type="number"
                        min="1990"
                        max={new Date().getFullYear()}
                        defaultValue={selectedAchievement?.issueYear} 
                        placeholder="e.g., 2023" 
                        className={`w-full p-2 sm:p-3 rounded-lg border transition-colors text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        required 
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs sm:text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Expiration Month
                      </label>
                      <select 
                        name="expirationMonth" 
                        defaultValue={selectedAchievement?.expirationMonth} 
                        className={`w-full p-2 sm:p-3 rounded-lg border transition-colors text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      >
                        <option value="">Select Month (Optional)</option>
                        {['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ].map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-xs sm:text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Expiration Year
                      </label>
                      <input 
                        name="expirationYear" 
                        type="number"
                        min={new Date().getFullYear()}
                        max="2050"
                        defaultValue={selectedAchievement?.expirationYear} 
                        placeholder="e.g., 2026" 
                        className={`w-full p-2 sm:p-3 rounded-lg border transition-colors text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-xs sm:text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      License Number
                    </label>
                    <input 
                      name="licenseNumber" 
                      defaultValue={selectedAchievement?.licenseNumber} 
                      placeholder="e.g., AWS-ASA-12345" 
                      className={`w-full p-2 sm:p-3 rounded-lg border transition-colors text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-xs sm:text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Certification URL
                    </label>
                    <input 
                      name="certificationURL" 
                      type="url"
                      defaultValue={selectedAchievement?.certificationURL} 
                      placeholder="https://..." 
                      className={`w-full p-2 sm:p-3 rounded-lg border transition-colors text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
                    <button 
                      type="button" 
                      onClick={handleCloseModal} 
                      className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                      }`}
                    >
                      {isEditMode ? 'Update' : 'Save'} Achievement
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {popup.show && (
            <Modal
                onClose={() => setPopup({ show: false, message: '', type: '' })}
                title={popup.type === 'success' ? 'Success' : 'Error'}
                type={popup.type}
                theme={theme}
            >
                <p className={`mb-4 sm:mb-6 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{popup.message}</p>
                <div className="flex justify-end">
                    <button
                        onClick={() => setPopup({ show: false, message: '', type: '' })}
                        className={`${popup.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors text-sm`}
                    >
                        OK
                    </button>
                </div>
            </Modal>
        )}

        {deleteConfirmation.show && (
            <Modal
                onClose={() => setDeleteConfirmation({ show: false, certificateId: null })}
                title="Confirm Deletion"
                type="confirm"
                theme={theme}
            >
                <p className={`mb-4 sm:mb-6 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Are you sure you want to delete this achievement? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                    <button
                        onClick={() => setDeleteConfirmation({ show: false, certificateId: null })}
                        className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors text-sm"
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        )}
      </div>
    </div>
  );
};

export default Achievements;
