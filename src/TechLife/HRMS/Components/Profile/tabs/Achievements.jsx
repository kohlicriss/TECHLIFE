import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { publicinfoApi } from '../../../../../axiosInstance';
import { FaTrophy, FaCalendarAlt, FaExternalLinkAlt, FaBuilding, FaIdBadge, FaPencilAlt, FaTrash, FaPlus } from 'react-icons/fa';
import { Context } from '../../HrmsContext';

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

  const searchParams = new URLSearchParams(location.search);
  const fromContextMenu = searchParams.get('fromContextMenu') === 'true';
  const targetEmployeeId = searchParams.get('targetEmployeeId');
  const employeeIdToFetch = fromContextMenu && targetEmployeeId ? targetEmployeeId : empID;
  
  // ✅ Updated permission logic: Allow editing for own profile or if user has management access
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

  const handleDelete = async (certificateId) => {
    const confirmMessage = hasManagementAccess 
      ? 'Are you sure you want to delete this achievement?' 
      : 'Are you sure you want to delete your achievement?';
      
    if (window.confirm(confirmMessage)) {
      try {
        await publicinfoApi.delete(`/employee/${employeeIdToFetch}/${certificateId}/achievements`);
        setAchievements(achievements.filter(ach => ach.id !== certificateId));
        alert('Achievement deleted successfully!');
      } catch (err) {
        console.error('Error deleting achievement:', err);
        alert('Failed to delete achievement. Please try again.');
      }
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
            // ✅ CORRECTED ENDPOINT for UPDATE
            const url = `/employee/${employeeIdToFetch}/${selectedAchievement.id}/achievements`;
            response = await publicinfoApi.put(url, submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAchievements(achievements.map(ach => ach.id === selectedAchievement.id ? response.data : ach));
            alert('Achievement updated successfully!');
        } else {
            // ✅ CORRECTED ENDPOINT for CREATE
            const url = `/employee/achievements/${employeeIdToFetch}`;
            response = await publicinfoApi.post(url, submissionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAchievements([...achievements, response.data]);
            alert('Achievement added successfully!');
        }
        handleCloseModal();
    } catch (err) {
        console.error('Error saving achievement:', err.response?.data || err.message);
        alert('Failed to save achievement. Please check your input and try again.');
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaTrophy className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>Loading Achievements</h2>
        <p className={`${
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
      <div className="text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'
        }`}>
          <FaTrophy className="w-10 h-10 text-red-500" />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>Error Loading Achievements</h2>
        <p className={`${
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
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header Section */}
        <div className={`rounded-2xl p-6 shadow-lg border mb-8 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl shadow-md ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-white'
              }`}>
                <FaTrophy className={`w-8 h-8 ${
                  theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                }`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Achievements & Certifications
                </h2>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {isOwnProfile ? 'Your professional certifications and achievements' : 'Professional certifications and achievements'}
                </p>
              </div>
            </div>
            {canEdit && (
              <button 
                onClick={() => handleOpenModal()} 
                className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                }`}
                title={isOwnProfile ? "Add your achievement" : "Add achievement"}
              >
                <FaPlus className="w-4 h-4" />
                <span>{isOwnProfile ? 'Add My Achievement' : 'Add Achievement'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Achievements Grid */}
        {achievements.length === 0 ? (
          <div className={`text-center py-16 px-6 rounded-2xl shadow-lg border ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <FaTrophy className={`w-10 h-10 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              {isOwnProfile ? 'No Achievements Yet' : 'No Achievements Found'}
            </h3>
            <p className={`text-sm max-w-md mx-auto ${
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
                className={`mt-6 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
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
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {achievements.map((ach) => (
              <div key={ach.id} className={`p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative group ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 hover:shadow-blue-500/20' 
                  : 'bg-white border-gray-200'
              }`}>
                {canEdit && (
                  <div className="absolute top-6 right-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => handleOpenModal(ach)} 
                      className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                        theme === 'dark'
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title={isOwnProfile ? "Edit your achievement" : "Edit achievement"}
                    >
                      <FaPencilAlt className="w-4 h-4" />
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
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-start space-x-6">
                  <div className={`p-4 rounded-xl shadow-md ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50'
                  }`}>
                    <FaTrophy className={`text-3xl ${
                      theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className={`text-xl font-bold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {ach.certificationName}
                      </h3>
                      <p className={`text-md flex items-center ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <FaBuilding className="mr-2" />
                        {ach.issuingAuthorityName}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className={`p-3 rounded-lg ${
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
                        <span className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {ach.issueMonth} {ach.issueYear}
                        </span>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${
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
                        <span className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {ach.expirationMonth && ach.expirationYear 
                            ? `${ach.expirationMonth} ${ach.expirationYear}` 
                            : 'No Expiration'
                          }
                        </span>
                      </div>
                      
                      <div className={`p-3 rounded-lg md:col-span-2 lg:col-span-1 ${
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
                        <span className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {ach.licenseNumber || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    {ach.certificationURL && (
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <a 
                          href={ach.certificationURL} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
                            theme === 'dark'
                              ? 'text-blue-400 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-700'
                              : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                          }`}
                        >
                          <span>View Credential</span>
                          <FaExternalLinkAlt className="ml-2 w-4 h-4" />
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
          <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex justify-center items-center z-[200] p-4">
            <div className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`px-8 py-6 border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {isEditMode 
                    ? (isOwnProfile ? 'Edit Your Achievement' : 'Edit Achievement')
                    : (isOwnProfile ? 'Add Your Achievement' : 'Add New Achievement')
                  }
                </h2>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {isEditMode 
                    ? 'Update the achievement details below'
                    : 'Fill in the details to add a new certification or achievement'
                  }
                </p>
              </div>
              
              <div className="p-8">
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Certification Name *
                      </label>
                      <input 
                        name="certificationName" 
                        defaultValue={selectedAchievement?.certificationName} 
                        placeholder="e.g., AWS Certified Solutions Architect" 
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        required 
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Issuing Authority *
                      </label>
                      <input 
                        name="issuingAuthorityName" 
                        defaultValue={selectedAchievement?.issuingAuthorityName} 
                        placeholder="e.g., Amazon Web Services" 
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        required 
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Issue Month *
                      </label>
                      <select 
                        name="issueMonth" 
                        defaultValue={selectedAchievement?.issueMonth} 
                        className={`w-full p-3 rounded-lg border transition-colors ${
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
                      <label className={`block text-sm font-semibold mb-2 ${
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
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        required 
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Expiration Month
                      </label>
                      <select 
                        name="expirationMonth" 
                        defaultValue={selectedAchievement?.expirationMonth} 
                        className={`w-full p-3 rounded-lg border transition-colors ${
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
                      <label className={`block text-sm font-semibold mb-2 ${
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
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      License Number
                    </label>
                    <input 
                      name="licenseNumber" 
                      defaultValue={selectedAchievement?.licenseNumber} 
                      placeholder="e.g., AWS-ASA-12345" 
                      className={`w-full p-3 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Certification URL
                    </label>
                    <input 
                      name="certificationURL" 
                      type="url"
                      defaultValue={selectedAchievement?.certificationURL} 
                      placeholder="https://..." 
                      className={`w-full p-3 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-6">
                    <button 
                      type="button" 
                      onClick={handleCloseModal} 
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
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
      </div>
    </div>
  );
};

export default Achievements;
