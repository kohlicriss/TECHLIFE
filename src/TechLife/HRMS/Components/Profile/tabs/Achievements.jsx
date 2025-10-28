import React, { useState, useEffect, useContext } from 'react';
import { IoClose, IoDocumentText, IoCheckmarkCircle, IoPencil,IoWarning, IoEye, IoAdd, IoCloudUpload, IoTrashOutline } from 'react-icons/io5';
import { Context } from '../../HrmsContext';
import { publicinfoApi } from '../../../../../axiosInstance';
import { useParams, useLocation } from 'react-router-dom';

// Reusable Modal Component
const Modal = ({ children, onClose, title, type, theme }) => {
  let titleClass;
  let icon = null;

  if (type === 'success') {
    titleClass = 'text-green-600';
    icon = <IoCheckmarkCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />;
  } else if (type === 'error') {
    titleClass = 'text-red-600';
    icon = <IoWarning className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />;
  } else if (type === 'confirm') {
    titleClass = 'text-yellow-600';
    icon = <IoWarning className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-[1000] animate-fadeIn">
      <div className={`w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl animate-slideUp transform-gpu ${
        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            {icon}
            <h3 className={`text-lg sm:text-xl font-bold ${titleClass} ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              {title}
            </h3>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Field Component
const InputField = ({ 
  name, 
  label, 
  type = 'text', 
  required = false, 
  hint, 
  placeholder, 
  value, 
  onChange, 
  onBlur,
  isError,
  options = [], 
  multiple = false,
  accept,
  theme 
}) => {
  const baseInputClass = `w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
    isError
      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
      : theme === 'dark'
      ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
      : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
  }`;

  const textareaClass = `w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 resize-none h-24 sm:h-32 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
    isError
      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
      : theme === 'dark'
      ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
      : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
  }`;

  const selectClass = `w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 appearance-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${
    isError
      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
      : theme === 'dark'
      ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
      : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
  }`;

  return (
    <div className="group relative" key={name}>
      <label className={`block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
      }`}>
        {label}
        {required && <span className="text-red-500 ml-1 text-sm sm:text-base">*</span>}
      </label>
      
      {hint && (
        <p className={`text-xs mb-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {hint}
        </p>
      )}

      {type === 'select' ? (
        <div className="relative">
          <select
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={selectClass}
            required={required}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
          <div className={`absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={textareaClass}
          required={required}
          rows={4}
        />
      ) : type === 'file' ? (
        <div className={`relative border-2 border-dashed rounded-lg sm:rounded-xl transition-all duration-300 ${
          isError
            ? 'border-red-300 bg-red-50'
            : theme === 'dark'
            ? 'border-gray-600 bg-gray-800 hover:border-blue-400 hover:bg-blue-900/20'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
        } cursor-pointer`}>
          <input
            type="file"
            name={name}
            accept={accept}
            multiple={multiple}
            onChange={onChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
            <IoCloudUpload className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <p className={`text-xs sm:text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Drop your file here, or <span className="text-blue-600">browse</span>
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {accept || 'All file types supported'}
            </p>
          </div>
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={baseInputClass}
          required={required}
        />
      )}

      {isError && (
        <div className="mt-2 sm:mt-3 flex items-center space-x-2 text-red-600 animate-slideIn">
          <IoWarning className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-medium">{isError}</p>
        </div>
      )}
    </div>
  );
};

const Achivements = () => {
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
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, achievementId: null });
  
  // Form state
  const [formData, setFormData] = useState({
    certificationName: '',
    issuingAuthorityName: '',
    certificationURL: '',
    issueMonth: '',
    issueYear: '',
    expirationMonth: '',
    expirationYear: '',
    licenseNumber: '',
    achievementFile: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const searchParams = new URLSearchParams(location.search);
  const fromContextMenu = searchParams.get('fromContextMenu') === 'true';
  const targetEmployeeId = searchParams.get('targetEmployeeId');
  const employeeIdToFetch = fromContextMenu && targetEmployeeId ? targetEmployeeId : empID;
  
  const userRole = userData?.roles?.[0]?.toUpperCase();
  const hasManagementAccess = ["ADMIN", "MANAGER", "HR"].includes(userRole);
  const isOwnProfile = employeeIdToFetch === empID;
  const canEdit = isOwnProfile || hasManagementAccess;

  // Configuration for different achievement types
  const config = {
    title: "Achievements & Certifications",
    subtitle: "Professional certifications and achievements",
    color: "from-blue-500 to-purple-600",
    icon: IoDocumentText
  };

  const achievementFormFields = [
    {
      name: 'certificationName',
      label: 'Certification Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., AWS Certified Solutions Architect',
      hint: 'Enter the full name of your certification or achievement'
    },
    {
      name: 'issuingAuthorityName',
      label: 'Issuing Authority',
      type: 'text',
      required: true,
      placeholder: 'e.g., Amazon Web Services',
      hint: 'Organization that issued this certification'
    },
    {
      name: 'issueMonth',
      label: 'Issue Month',
      type: 'select',
      required: true,
      options: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    {
      name: 'issueYear',
      label: 'Issue Year',
      type: 'number',
      required: true,
      placeholder: 'e.g., 2023'
    },
    {
      name: 'expirationMonth',
      label: 'Expiration Month',
      type: 'select',
      required: false,
      options: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      hint: 'Optional - leave blank if certification does not expire'
    },
    {
      name: 'expirationYear',
      label: 'Expiration Year',
      type: 'number',
      required: false,
      placeholder: 'e.g., 2026',
      hint: 'Optional - leave blank if certification does not expire'
    },
    {
      name: 'licenseNumber',
      label: 'License/Certificate Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., AWS-ASA-12345',
      hint: 'Optional - unique identifier for this certification'
    },
    {
      name: 'certificationURL',
      label: 'Certification URL',
      type: 'url',
      required: false,
      placeholder: 'https://...',
      hint: 'Optional - link to verify your certification online'
    },
    {
      name: 'achievementFile',
      label: 'Achievement Certificate',
      type: 'file',
      required: false,
      accept: 'image/*,.pdf,.doc,.docx',
      hint: 'Optional - upload your certificate or achievement document'
    }
  ];

  useEffect(() => {
    fetchAchievements();
  }, [employeeIdToFetch]);

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

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      setUploadedFiles([...files]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    achievementFormFields.forEach(field => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = `${field.label} is required`;
      }
      
      if (field.type === 'url' && formData[field.name] && !isValidUrl(formData[field.name])) {
        errors[field.name] = 'Please enter a valid URL';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleOpenModal = (achievement = null) => {
    if (achievement) {
      setSelectedAchievement(achievement);
      setIsEditMode(true);
      setFormData({
        certificationName: achievement.certificationName || '',
        issuingAuthorityName: achievement.issuingAuthorityName || '',
        certificationURL: achievement.certificationURL || '',
        issueMonth: achievement.issueMonth || '',
        issueYear: achievement.issueYear || '',
        expirationMonth: achievement.expirationMonth || '',
        expirationYear: achievement.expirationYear || '',
        licenseNumber: achievement.licenseNumber || '',
        achievementFile: null
      });
    } else {
      setSelectedAchievement(null);
      setIsEditMode(false);
      setFormData({
        certificationName: '',
        issuingAuthorityName: '',
        certificationURL: '',
        issueMonth: '',
        issueYear: '',
        expirationMonth: '',
        expirationYear: '',
        licenseNumber: '',
        achievementFile: null
      });
    }
    setFormErrors({});
    setUploadedFiles([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAchievement(null);
    setFormData({
      certificationName: '',
      issuingAuthorityName: '',
      certificationURL: '',
      issueMonth: '',
      issueYear: '',
      expirationMonth: '',
      expirationYear: '',
      licenseNumber: '',
      achievementFile: null
    });
    setFormErrors({});
    setUploadedFiles([]);
  };

  const handleDelete = (achievementId) => {
    setDeleteConfirmation({ show: true, achievementId });
  };

  const confirmDelete = async () => {
    const { achievementId } = deleteConfirmation;
    try {
      await publicinfoApi.delete(`/employee/${employeeIdToFetch}/${achievementId}/achievements`);
      setAchievements(achievements.filter(ach => ach.id !== achievementId));
      setPopup({ show: true, message: 'Achievement deleted successfully!', type: 'success' });
    } catch (err) {
      console.error('Error deleting achievement:', err);
      setPopup({ show: true, message: 'Failed to delete achievement. Please try again.', type: 'error' });
    } finally {
      setDeleteConfirmation({ show: false, achievementId: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setPopup({ show: true, message: 'Please fill the feilds in the form before submitting.', type: 'error' });
      return;
    }

    // ... (rest of the FormData setup remains the same)
    const achievementDTO = {
      certificationName: formData.certificationName,
      issuingAuthorityName: formData.issuingAuthorityName,
      certificationURL: formData.certificationURL,
      issueMonth: formData.issueMonth,
      issueYear: formData.issueYear,
      expirationMonth: formData.expirationMonth,
      expirationYear: formData.expirationYear,
      licenseNumber: formData.licenseNumber
    };

    const submissionData = new FormData();

    if (formData.achievementFile) {
      submissionData.append('achievementFile', formData.achievementFile);
    }

    if (isEditMode && selectedAchievement?.id) {
      achievementDTO.id = selectedAchievement.id;
    }

    submissionData.append('achievementsDTO', new Blob([JSON.stringify(achievementDTO)], { type: 'application/json' }));
    // --- END FormData setup ---

    try {
      if (isEditMode) {
        const url = `/employee/${employeeIdToFetch}/${selectedAchievement.id}/achievements`;
        await publicinfoApi.put(url, submissionData, { // Just await, no need to store response here
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setPopup({ show: true, message: 'Achievement updated successfully!', type: 'success' });
      } else {
        const url = `/employee/achievements/${employeeIdToFetch}`;
        await publicinfoApi.post(url, submissionData, { // Just await
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setPopup({ show: true, message: 'Achievement added successfully!', type: 'success' });
      }

      // --- MODIFICATION START ---
      // Instead of manually updating state with potentially stale response data,
      // re-fetch the entire list to ensure consistency.
      await fetchAchievements();
      // --- MODIFICATION END ---

      handleCloseModal(); // Close modal after success and re-fetch

    } catch (err) {
      console.error('Error saving achievement:', err.response?.data || err.message);
      setPopup({
        show: true,
        message: err.response?.data?.message || 'Failed to save achievement. Please check your input and try again.',
        type: 'error'
      });
    }
    // No finally block needed here, isSubmitting isn't used in this version
  };

  const getAchievementFileUrl = (filePath) => {
    if (!filePath) return null;
    // Directly return the filePath, as it contains the full S3 URL
    return filePath;
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
            <IoDocumentText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
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
          <IoDocumentText className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
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
        <div className={`rounded-none sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg border mb-6 sm:mb-8 mx-4 sm:mx-0 ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-md flex-shrink-0 bg-gradient-to-r ${config.color}`}>
                <config.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold break-words ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {config.title}
                </h1>
                <p className={`text-xs sm:text-sm md:text-base break-words ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {isOwnProfile ? `Your ${config.subtitle.toLowerCase()}` : config.subtitle}
                </p>
              </div>
            </div>
            {canEdit && (
              <button 
                onClick={() => handleOpenModal()}
                className={`w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r ${config.color} text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-blue-500/30 text-sm sm:text-base flex items-center justify-center space-x-2`}
              >
                <IoAdd className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Achievement</span>
              </button>
            )}
          </div>
        </div>

        {/* Achievement List */}
        <div className="mx-4 sm:mx-0">
          {achievements.length === 0 ? (
            <div className={`text-center py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 rounded-none sm:rounded-2xl md:rounded-3xl shadow-lg border ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <IoDocumentText className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} />
              </div>
              <h3 className={`text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {isOwnProfile ? 'No Achievements Yet' : 'No Achievements Found'}
              </h3>
              <p className={`text-sm sm:text-base max-w-md mx-auto break-words ${
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
                  className={`mt-6 sm:mt-8 px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r ${config.color} text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-blue-500/30 text-sm sm:text-base flex items-center space-x-2 mx-auto`}
                >
                  <IoAdd className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Add Your First Achievement</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8">
              {achievements.map((achievement) => {
                const hasCredentialUrl = !!achievement.certificationURL;
                const hasAchievementFile = !!achievement.achievementFile;
                const fileUrl = getAchievementFileUrl(achievement.achievementFile);

                return (
                  <div key={achievement.id} className={`p-4 sm:p-6 md:p-8 rounded-none sm:rounded-2xl md:rounded-3xl shadow-lg border hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative group ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 hover:shadow-blue-500/20' 
                      : 'bg-white border-gray-200'
                  }`}>
                   {canEdit && (
  <div className={`absolute top-4 right-4 sm:top-6 sm:right-6 flex space-x-2 transition-opacity duration-300 ${
    // Always visible on mobile (xs), only on hover on sm+
    'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
  }`}>
    <button 
      onClick={() => handleOpenModal(achievement)}
      className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
        theme === 'dark'
          ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
      }`}
      title="Edit achievement"
    >
      <IoPencil className="w-3 h-3 sm:w-4 sm:h-4" />
    </button>
    <button 
      onClick={() => handleDelete(achievement.id)}
      className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
        theme === 'dark'
          ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
      }`}
      title="Delete achievement"
    >
      <IoTrashOutline className="w-3 h-3 sm:w-4 sm:h-4" />
    </button>
  </div>
)}
                    
                    <div className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-6">
                      <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-md flex-shrink-0 bg-gradient-to-r ${config.color}`}>
                        <IoDocumentText className="text-2xl sm:text-3xl text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="mb-4 sm:mb-6">
                          <h3 className={`text-lg sm:text-xl md:text-2xl font-bold mb-2 break-words ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {achievement.certificationName}
                          </h3>
                          <p className={`text-sm sm:text-base md:text-lg flex items-center break-words ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            <IoDocumentText className="mr-2 flex-shrink-0" />
                            {achievement.issuingAuthorityName}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm md:text-base">
                          <div className={`p-3 sm:p-4 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center mb-2">
                              <IoDocumentText className={`mr-2 text-xs ${
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
                              {achievement.issueMonth} {achievement.issueYear}
                            </span>
                          </div>
                          
                          <div className={`p-3 sm:p-4 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center mb-2">
                              <IoDocumentText className={`mr-2 text-xs ${
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
                              {achievement.expirationMonth && achievement.expirationYear 
                                ? `${achievement.expirationMonth} ${achievement.expirationYear}` 
                                : 'No Expiration'}
                            </span>
                          </div>
                          
                          <div className={`p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1 ${
                            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center mb-2">
                              <IoDocumentText className={`mr-2 text-xs ${
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
                              {achievement.licenseNumber || 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        {(hasCredentialUrl || hasAchievementFile) && (
                          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
                            {hasCredentialUrl && (
                              <a 
                                href={achievement.certificationURL} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-xs sm:text-sm ${
                                  theme === 'dark'
                                    ? 'text-blue-400 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-700'
                                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                                }`}
                              >
                                <span>View Credential</span>
                                <IoEye className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                              </a>
                            )}
                            {hasAchievementFile && (
                              <a 
                                href={fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-xs sm:text-sm ${
                                  theme === 'dark'
                                    ? 'text-purple-400 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-700'
                                    : 'text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                                }`}
                              >
                                <span>View File</span>
                                <IoDocumentText className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
       {isModalOpen && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] p-2 sm:p-4">
      <div className={`rounded-2xl sm:rounded-3xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl animate-slideUp ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Fixed Header */}
        <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-r ${config.color} text-white flex-shrink-0`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                {isEditMode ? 'Edit Achievement' : 'Add New Achievement'}
              </h2>
              <p className="text-xs sm:text-sm opacity-90 mt-1">
                {isEditMode ? 'Update the achievement details' : 'Fill in the details to add a new achievement'}
              </p>
            </div>
            <button onClick={handleCloseModal} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {achievementFormFields.map((field) => (
                <div key={field.name} className={field.name === 'certificationURL' || field.name === 'achievementFile' ? 'lg:col-span-2' : ''}>
                  <InputField
                    {...field}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    onBlur={() => {}}
                    isError={formErrors[field.name]}
                    theme={theme}
                  />
                </div>
              ))}
            </div>

            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h4 className={`text-sm font-semibold mb-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Uploaded Files:
                </h4>
                <div className="space-y-2">
                  {Array.from(uploadedFiles).map((file, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <IoDocumentText className={`w-4 h-4 flex-shrink-0 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                        <span className={`text-xs sm:text-sm truncate ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {file.name}
                        </span>
                      </div>
                      <span className={`text-xs flex-shrink-0 ml-2 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Fixed Footer */}
        <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t flex-shrink-0 ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
        } flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4`}>
          <button
            type="button"
            onClick={handleCloseModal}
            className={`px-6 sm:px-8 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 focus:ring-4 focus:ring-gray-500/20 text-sm sm:text-base ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
            }`}
          >
            Cancel
          </button>
          
          {isEditMode ? (
            <button
              type="submit"
              onClick={handleSubmit}
              className={`px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-purple-500/30 text-sm sm:text-base`}
            >
              Update Achievement
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              className={`px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg sm:rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-green-500/30 text-sm sm:text-base`}
            >
              Add Achievement
            </button>
          )}
        </div>
      </div>
    </div>
  )}

        {/* Success/Error Popup */}
        {popup.show && (
          <Modal
            onClose={() => setPopup({ show: false, message: '', type: '' })}
            title={popup.type === 'success' ? 'Success' : 'Error'}
            type={popup.type}
            theme={theme}
          >
            <p className={`text-sm sm:text-base mb-4 sm:mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {popup.message}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setPopup({ show: false, message: '', type: '' })}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-lg transition-colors duration-200 text-sm sm:text-base ${
                  popup.type === 'success' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                OK
              </button>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation.show && (
          <Modal
            onClose={() => setDeleteConfirmation({ show: false, achievementId: null })}
            title="Delete Achievement"
            type="confirm"
            theme={theme}
          >
            <p className={`text-sm sm:text-base mb-4 sm:mb-6 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Are you sure you want to delete this achievement? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setDeleteConfirmation({ show: false, achievementId: null })}
                className={`px-4 sm:px-6 py-2 sm:py-3 border-2 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 text-sm sm:text-base"
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

export default Achivements;
