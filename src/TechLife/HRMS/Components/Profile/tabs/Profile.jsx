import React, { useState, useEffect, useContext, useRef } from 'react';
import { IoClose, IoPersonOutline, IoCheckmarkCircle, IoWarning, IoAdd, IoMailOutline, IoLocationOutline, IoSchoolOutline, IoBriefcaseOutline, IoCloudUpload, IoEye, IoCreateOutline } from "react-icons/io5";
import { Context } from "../../HrmsContext";
import { publicinfoApi } from "../../../../../axiosInstance";
import { useParams, useLocation } from "react-router-dom";

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

const sectionFields = {
  primaryDetails: [
    {
      label: "First Name",
      name: "firstName",
      type: "text",
      required: true,
      hint: "Enter your first name (up to 50 characters)"
    },
    {
      label: "Middle Name",
      name: "middleName",
      type: "text",
      hint: "Enter your middle name if applicable (up to 50 characters)"
    },
    {
      label: "Last Name",
      name: "lastName",
      type: "text",
      required: true,
      hint: "Enter your last name (up to 50 characters)"
    },
    {
      label: "Display Name",
      name: "displayName",
      type: "text",
      required: true,
      hint: "Name to display in system (up to 100 characters)"
    },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      required: true,
      options: ["Male", "Female", "Other"],
      hint: "Select your gender"
    },
    {
      label: "Date of Birth",
      name: "dateOfBirth",
      type: "date",
      required: true,
      hint: "Select your birth date (must be in the past)"
    },
    {
      label: "Marital Status",
      name: "maritalStatus",
      type: "select",
      required: true,
      options: ["Single", "Married", "Divorced", "Widowed"],
      hint: "Select your current marital status"
    },
    {
      label: "Blood Group",
      name: "bloodGroup",
      type: "select",
      required: true,
      options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      hint: "Select your blood group"
    },
    {
      label: "Physically Handicapped",
      name: "physicallyHandicapped",
      type: "select",
      required: true,
      options: ["Yes", "No"],
      hint: "Indicate if you have any physical disabilities"
    },
    {
      label: "Nationality",
      name: "nationality",
      type: "select",
      required: true,
      options: ["Indian", "American", "British", "Canadian", "Australian", "German", "French", "Japanese", "Chinese", "Brazilian", "Mexican", "Italian", "Spanish", "Russian", "South Korean", "Indonesian", "Saudi Arabian", "Turkish", "Argentine", "Other"],
      hint: "Select your nationality"
    },
  ],
  contactDetails: [
    {
      label: "Work Email",
      name: "workEmail",
      type: "email",
      required: true,
      hint: "Enter your official work email address"
    },
    {
      label: "Personal Email",
      name: "personalEmail",
      type: "email",
      hint: "Enter your personal email address"
    },
    {
      label: "Mobile Number",
      name: "mobileNumber",
      type: "text",
      required: true,
      hint: "Enter 10-digit Indian mobile number starting with 6-9"
    },
    {
      label: "Work Number",
      name: "workNumber",
      type: "text",
      hint: "Enter work phone number (3-15 digits)"
    },
  ],
  address: [
    {
      label: "Street",
      name: "street",
      type: "text",
      required: true,
      hint: "Enter street address (up to 100 characters)"
    },
    {
      label: "City",
      name: "city",
      type: "text",
      required: true,
      hint: "Enter city name (up to 50 characters)"
    },
    {
      label: "State",
      name: "state",
      type: "text",
      required: true,
      hint: "Enter state name (up to 50 characters)"
    },
    {
      label: "Zip",
      name: "zip",
      type: "text",
      required: true,
      hint: "Enter 6-digit Indian ZIP code"
    },
    {
      label: "Country",
      name: "country",
      type: "text",
      required: true,
      hint: "Enter country name (up to 50 characters)"
    },
    {
      label: "District",
      name: "district",
      type: "text",
      required: true,
      hint: "Enter district name (up to 50 characters)"
    },
  ],
  education: [
    {
      label: "Degree Type",
      name: "degreeType",
      type: "text",
      required: true,
      hint: "Enter degree name (up to 100 characters)"
    },
    {
      label: "Institution",
      name: "universityOrCollege",
      type: "text",
      required: true,
      hint: "Enter university/college name (up to 200 characters)"
    },
    {
      label: "Specialization",
      name: "branchOrSpecialization",
      type: "text",
      required: true,
      hint: "Enter branch or specialization (up to 100 characters)"
    },
    {
      label: "Start Month",
      name: "startMonth",
      type: "select",
      required: true,
      options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      hint: "Select the starting month"
    },
    {
      label: "Start Year",
      name: "startYear",
      type: "text",
      required: true,
      hint: "Enter year between 1900-2099"
    },
    {
      label: "End Month",
      name: "endMonth",
      type: "select",
      required: true,
      options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      hint: "Select the ending month"
    },
    {
      label: "End Year",
      name: "endYear",
      type: "text",
      required: true,
      hint: "Enter year between 1900-2099"
    },
    {
      label: "CGPA/Percentage",
      name: "cgpaOrPercentage",
      type: "text",
      required: true,
      hint: "Enter CGPA or percentage (0-100)"
    },
    {
      label: "Degree Certificate",
      name: "addFiles",
      type: "file",
      required: true,
      hint: "Upload degree certificate (JPG, PNG, PDF)"
    },
  ],
  experience: [
    {
      label: "Company Name",
      name: "companyName",
      type: "text",
      required: true,
      hint: "Enter company name (2-100 characters)"
    },
    {
      label: "Job Title",
      name: "jobTitle",
      type: "text",
      required: true,
      hint: "Enter job title/position (2-100 characters)"
    },
    {
      label: "Location",
      name: "location",
      type: "text",
      required: true,
      hint: "Enter work location/city"
    },
    {
      label: "Description",
      name: "description",
      type: "textarea",
      hint: "Describe your role and responsibilities (up to 1000 characters)"
    },
    {
      label: "Start Month",
      name: "startMonth",
      type: "select",
      required: true,
      options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      hint: "Select the starting month"
    },
    {
      label: "Start Year",
      name: "startYear",
      type: "text",
      required: true,
      hint: "Enter 4-digit year (e.g., 2020)"
    },
    {
      label: "End Month",
      name: "endMonth",
      type: "select",
      required: true,
      options: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      hint: "Select the ending month"
    },
    {
      label: "End Year",
      name: "endYear",
      type: "text",
      required: true,
      hint: "Enter 4-digit year (e.g., 2023)"
    },
  ],
};

const sectionConfig = {
  primaryDetails: {
    icon: IoPersonOutline,
    color: 'from-blue-500 to-blue-700',
    bgColor: 'bg-blue-50',
    darkBgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-200',
    darkBorderColor: 'border-blue-700',
    textColor: 'text-blue-700',
    darkTextColor: 'text-blue-400',
    title: 'Primary Details',
    description: 'Personal information and basic details'
  },
  contactDetails: {
    icon: IoMailOutline,
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    darkBgColor: 'bg-green-900/20',
    borderColor: 'border-green-200',
    darkBorderColor: 'border-green-700',
    textColor: 'text-green-700',
    darkTextColor: 'text-green-400',
    title: 'Contact Details',
    description: 'Email addresses and phone numbers'
  },
  address: {
    icon: IoLocationOutline,
    color: 'from-orange-500 to-orange-700',
    bgColor: 'bg-orange-50',
    darkBgColor: 'bg-orange-900/20',
    borderColor: 'border-orange-200',
    darkBorderColor: 'border-orange-700',
    textColor: 'text-orange-700',
    darkTextColor: 'text-orange-400',
    title: 'Address Information',
    description: 'Current residential address'
  },
  education: {
    icon: IoSchoolOutline,
    color: 'from-yellow-500 to-amber-700',
    bgColor: 'bg-yellow-50',
    darkBgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-200',
    darkBorderColor: 'border-yellow-700',
    textColor: 'text-yellow-700',
    darkTextColor: 'text-yellow-400',
    title: 'Education Details',
    description: 'Academic qualifications and achievements'
  },
  experience: {
    icon: IoBriefcaseOutline,
    color: 'from-indigo-500 to-indigo-700',
    bgColor: 'bg-indigo-50',
    darkBgColor: 'bg-indigo-900/20',
    borderColor: 'border-indigo-200',
    darkBorderColor: 'border-indigo-700',
    textColor: 'text-indigo-700',
    darkTextColor: 'text-indigo-400',
    title: 'Previous Experience',
    description: 'Professional work history'
  },
};

const hasActualData = (data, sectionKey) => {
  if (!data) return false;

  if (Array.isArray(data)) {
    return data.length > 0;
  }

  const fieldsToCheck = sectionFields[sectionKey];
  if (!fieldsToCheck) return false;

  return fieldsToCheck.some(field => {
    const value = data[field.name];
    return value && value !== "" && value !== null && value !== undefined;
  });
};

const getMaxDate = () => {
  const today = new Date();
  const maxYear = today.getFullYear() - 18;
  const maxDate = new Date(maxYear, today.getMonth(), today.getDate());

  return maxDate.toISOString().split('T')[0];
};

const isAtLeast18YearsOld = (dateString) => {
  if (!dateString) return true;

  const selectedDate = new Date(dateString);
  const today = new Date();
  const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  return selectedDate <= minDate;
};

const validateFieldByHint = (fieldName, value, hint, fieldType) => {
  if (!value || value.trim() === '') return null;

  const trimmedValue = value.trim();

  switch (fieldName) {
    case 'firstName':
    case 'middleName':
    case 'lastName':
      if (trimmedValue.length > 50) {
        return `${fieldName} must not exceed 50 characters`;
      }
      if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
        return `${fieldName} must contain only letters and spaces`;
      }
      break;

    case 'displayName':
      if (trimmedValue.length > 100) {
        return 'Display name must not exceed 100 characters';
      }
      break;

    case 'nationality':
      if (trimmedValue.length > 50) {
        return 'Nationality must not exceed 50 characters';
      }
      if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
        return 'Nationality must contain only letters and spaces';
      }
      break;

    case 'dateOfBirth':
      const birthDate = new Date(trimmedValue);
      const today = new Date();
      if (birthDate >= today) {
        return 'Date of birth must be in the past';
      }
      if (!isAtLeast18YearsOld(trimmedValue)) {
        return 'You must be at least 18 years old.';
      }
      break;

    case 'workEmail':
    case 'personalEmail':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        return 'Please enter a valid email address';
      }
      break;

    case 'mobileNumber':
      const cleanMobile = trimmedValue.replace(/\D/g, '');
      if (cleanMobile.length !== 10) {
        return 'Mobile number must be exactly 10 digits';
      }
      if (!/^[6-9]/.test(cleanMobile)) {
        return 'Indian mobile number must start with 6, 7, 8, or 9';
      }
      break;

    case 'workNumber':
      const cleanWork = trimmedValue.replace(/\D/g, '');
      if (cleanWork.length < 3 || cleanWork.length > 15) {
        return 'Work number must be between 3-15 digits';
      }
      break;

    case 'street':
      if (trimmedValue.length > 100) {
        return 'Street address must not exceed 100 characters';
      }
      break;

    case 'city':
    case 'state':
    case 'country':
    case 'district':
      if (trimmedValue.length > 50) {
        return `${fieldName} must not exceed 50 characters`;
      }
      if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
        return `${fieldName} must contain only letters and spaces`;
      }
      break;

    case 'zip':
      const cleanZip = trimmedValue.replace(/\D/g, '');
      if (cleanZip.length !== 6) {
        return 'ZIP code must be exactly 6 digits';
      }
      break;

    case 'degreeType':
      if (trimmedValue.length > 100) {
        return 'Degree type must not exceed 100 characters';
      }
      break;

    case 'universityOrCollege':
      if (trimmedValue.length > 200) {
        return 'Institution name must not exceed 200 characters';
      }
      break;

    case 'branchOrSpecialization':
      if (trimmedValue.length > 100) {
        return 'Specialization must not exceed 100 characters';
      }
      break;

    case 'startYear':
    case 'endYear':
      const year = parseInt(trimmedValue);
      if (isNaN(year) || year < 1900 || year > 2099) {
        return 'Year must be between 1900-2099';
      }
      break;

    case 'cgpaOrPercentage':
      const score = parseFloat(trimmedValue);
      if (isNaN(score) || score < 0 || score > 100) {
        return 'CGPA/Percentage must be between 0-100';
      }
      break;

    case 'companyName':
    case 'jobTitle':
      if (trimmedValue.length < 2 || trimmedValue.length > 100) {
        return `${fieldName} must be between 2-100 characters`;
      }
      break;

    case 'description':
      if (trimmedValue.length > 1000) {
        return 'Description must not exceed 1000 characters';
      }
      break;

    default:
      break;
  }

  return null;
};

const handleNetworkError = (error) => {
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again.';
  }

  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return 'Network error occurred. Please check your internet connection and try again.';
  }

  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return 'Request timed out. Please check your connection and try again.';
  }

  if (error.response) {
    switch (error.response.status) {
      case 400:
        return error.response.data?.message || 'Invalid data provided. Please check all fields.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found. Please refresh the page and try again.';
      case 500:
        return 'Server error occurred. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again in a few moments.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  } else if (error.request) {
    return 'Unable to connect to the server. Please check your internet connection.';
  } else {
    return 'An unexpected error occurred. Please try again.';
  }
};

function Profile() {
  const [editingSection, setEditingSection] = useState(null);
  const [primarydata, setPrimaryData] = useState(null);
  const [contactdetails, setContactDetails] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [eduData, setEduData] = useState([]);
  const [experience, setExperience] = useState([]);
  const { theme, userData, matchedArray } = useContext(Context);
  const [editingData, setEditingData] = useState({});
  const { empID } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [completionStats, setCompletionStats] = useState({ completed: 0, total: 5 });
  const [selectedFile, setSelectedFile] = useState(null);

  const [initialEditingData, setInitialEditingData] = useState({});
  const [noChangesModal, setNoChangesModal] = useState({
    show: false,
    section: null,
    onContinue: null
  });

  const [networkError, setNetworkError] = useState(null);

  const [popup, setPopup] = useState({ show: false, message: '', type: '' });

  const searchParams = new URLSearchParams(location.search);
  const fromContextMenu = searchParams.get('fromContextMenu') === 'true';
  const targetEmployeeId = searchParams.get('targetEmployeeId');

  const profileEmployeeId = fromContextMenu && targetEmployeeId ? targetEmployeeId : empID;

  const loggedInEmpID = userData?.employeeId;
  const isOwnProfile = String(loggedInEmpID) === String(profileEmployeeId);
  const hasEditPermission = matchedArray?.includes("EDIT_PER");

  const isReadOnly = (
    !isOwnProfile &&
    (
      !fromContextMenu ||
      (fromContextMenu && !hasEditPermission)
    )
  );
  const isAdmin = userData?.roles?.[0]?.toUpperCase() === 'ADMIN';

  const hasFormChanges = (currentData, initialData, selectedFile = null) => {
    if (selectedFile) return true;

    const normalizeValue = (value) => {
      if (value === null || value === undefined) return '';
      return String(value).trim();
    };

    const currentFields = Object.keys(currentData || {});
    const initialFields = Object.keys(initialData || {});

    if (currentFields.length !== initialFields.length) return true;

    for (const key of currentFields) {
      const currentValue = normalizeValue(currentData[key]);
      const initialValue = normalizeValue(initialData[key]);

      if (currentValue !== initialValue) {
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    if (editingSection) {
      localStorage.setItem(`profile-editing-${editingSection.section}`, JSON.stringify(editingData));
    }
  }, [editingData, editingSection]);

  useEffect(() => {
    if (fromContextMenu && targetEmployeeId) {
      console.log("Viewing profile from context menu for employee:", targetEmployeeId);
    }

    const fetchData = async () => {
      try {
        const [primaryRes, contactRes, addressRes, eduRes, expRes] = await Promise.all([
          publicinfoApi.get(`employee/${profileEmployeeId}/primary/details`).catch(err => ({ data: null })),
          publicinfoApi.get(`employee/${profileEmployeeId}/contact`).catch(err => ({ data: null })),
          publicinfoApi.get(`employee/${profileEmployeeId}/address`).catch(err => ({ data: null })),
          publicinfoApi.get(`employee/${profileEmployeeId}/degreeDetails`).catch(err => ({ data: [] })),
          publicinfoApi.get(`employee/${profileEmployeeId}/previousExperience`).catch(err => ({ data: [] })),
        ]);

        setPrimaryData(primaryRes.data);
        setContactDetails(contactRes.data);
        setAddressData(addressRes.data);
        setEduData(eduRes.data);
        setExperience(expRes.data);

        const sections = [
          hasActualData(primaryRes.data, 'primaryDetails'),
          hasActualData(contactRes.data, 'contactDetails'),
          hasActualData(addressRes.data, 'address'),
          hasActualData(eduRes.data, 'education'),
          hasActualData(expRes.data, 'experience'),
        ];
        const completed = sections.filter(Boolean).length;
        setCompletionStats({ completed, total: 5 });

      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (profileEmployeeId) {
      fetchData();
    }
  }, [profileEmployeeId, fromContextMenu, targetEmployeeId]);

  const openEditSection = (section, itemData = null, isAdd = false) => {
    if (isReadOnly) {
      setPopup({ show: true, message: "You can only view this employee's profile. Editing is not allowed.", type: 'error' });
      return;
    }
    setErrors({});
    setNetworkError(null);

    const savedData = localStorage.getItem(`profile-editing-${section}`);
    if (savedData && !itemData && !isAdd) {
      const parsedData = JSON.parse(savedData);
      setEditingData(parsedData);
      setInitialEditingData(parsedData);
    } else {
      let dataToEdit = {};
      if (section === "primaryDetails") {
        dataToEdit = primarydata;
      } else if (section === "contactDetails") {
        dataToEdit = contactdetails;
      } else if (section === "address") {
        dataToEdit = addressData;
      } else if (section === "education") {
        if (itemData) {
          dataToEdit = itemData;
        } else if (isAdd || (eduData && eduData.length === 0)) {
          dataToEdit = {};
        } else {
          dataToEdit = eduData[0];
        }
      } else if (section === "experience") {
        if (itemData) {
          dataToEdit = itemData;
        } else if (isAdd || (experience && experience.length === 0)) {
          dataToEdit = {};
        } else {
          dataToEdit = experience[0];
        }
      }
      const finalData = dataToEdit || {};
      setEditingData(finalData);
      setInitialEditingData(finalData);
    }

    setSelectedFile(null);
    setEditingSection({ section, isAdd: isAdd || !itemData });
  };

  const handleEditFieldChange = (field, value) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setNetworkError(null);

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    const fieldConfig = sectionFields[editingSection?.section]?.find(f => f.name === field);
    if (fieldConfig) {
      const validationError = validateFieldByHint(field, value, fieldConfig.hint, fieldConfig.type);
      if (validationError) {
        setErrors((prev) => ({
          ...prev,
          [field]: validationError
        }));
      }
    }
  };

  const handleFileChange = (file) => {
    setSelectedFile(file);
  };

  const handleUpdatePrimaryDetails = async () => {
    setNetworkError(null);
    try {
      const url = `/employee/${profileEmployeeId}/primary/details`;
      await publicinfoApi.put(url, editingData);
      const updatedData = await publicinfoApi.get(url);
      setPrimaryData(updatedData.data);

      const sections = [
        hasActualData(updatedData.data, 'primaryDetails'),
        hasActualData(contactdetails, 'contactDetails'),
        hasActualData(addressData, 'address'),
        hasActualData(eduData, 'education'),
        hasActualData(experience, 'experience'),
      ];
      setCompletionStats({ completed: sections.filter(Boolean).length, total: 5 });
      return true;
    } catch (error) {
      console.error("Failed to update primary details:", error);
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data);
      } else {
        const networkErrorMessage = handleNetworkError(error);
        setNetworkError(networkErrorMessage);
      }
      return false;
    }
  };

  const handleUpdateContactDetails = async () => {
    setNetworkError(null);
    try {
      const url = `/employee/${profileEmployeeId}/contact`;
      await publicinfoApi.put(url, editingData);
      const updatedData = await publicinfoApi.get(url);
      setContactDetails(updatedData.data);

      const sections = [
        hasActualData(primarydata, 'primaryDetails'),
        hasActualData(updatedData.data, 'contactDetails'),
        hasActualData(addressData, 'address'),
        hasActualData(eduData, 'education'),
        hasActualData(experience, 'experience'),
      ];
      setCompletionStats({ completed: sections.filter(Boolean).length, total: 5 });
      return true;
    } catch (error) {
      console.error("Failed to update contact details:", error);
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data);
      } else {
        const networkErrorMessage = handleNetworkError(error);
        setNetworkError(networkErrorMessage);
      }
      return false;
    }
  };

  const handleUpdateAddress = async () => {
    setNetworkError(null);
    try {
      const url = `/employee/${profileEmployeeId}/address`;
      await publicinfoApi.put(url, editingData);
      const updatedData = await publicinfoApi.get(url);
      setAddressData(updatedData.data);

      const sections = [
        hasActualData(primarydata, 'primaryDetails'),
        hasActualData(contactdetails, 'contactDetails'),
        hasActualData(updatedData.data, 'address'),
        hasActualData(eduData, 'education'),
        hasActualData(experience, 'experience'),
      ];
      setCompletionStats({ completed: sections.filter(Boolean).length, total: 5 });
      return true;
    } catch (error) {
      console.error("Failed to update address:", error);
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data);
      } else {
        const networkErrorMessage = handleNetworkError(error);
        setNetworkError(networkErrorMessage);
      }
      return false;
    }
  };

  const handleUpdateEducation = async () => {
    setNetworkError(null);
    try {
      const isUpdate = !!(editingData && editingData.id);
      const method = isUpdate ? 'put' : 'post';
      const url = isUpdate
        ? `/employee/${profileEmployeeId}/degreeDetails/${editingData.id}`
        : `/employee/${profileEmployeeId}/degreeDetails`;

      const formData = new FormData();
      if (selectedFile) {
        formData.append("addFiles", selectedFile);
      }
      formData.append("degree", new Blob([JSON.stringify(editingData)], { type: "application/json" }));

      await publicinfoApi[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedEduRes = await publicinfoApi.get(`employee/${profileEmployeeId}/degreeDetails`);
      setEduData(updatedEduRes.data);

      const sections = [
        hasActualData(primarydata, 'primaryDetails'),
        hasActualData(contactdetails, 'contactDetails'),
        hasActualData(addressData, 'address'),
        hasActualData(updatedEduRes.data, 'education'),
        hasActualData(experience, 'experience'),
      ];
      setCompletionStats({ completed: sections.filter(Boolean).length, total: 5 });
      return true;
    } catch (error) {
      console.error("Failed to update education details:", error);
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data);
      } else {
        const networkErrorMessage = handleNetworkError(error);
        setNetworkError(networkErrorMessage);
      }
      return false;
    }
  };

  const handleUpdateExperience = async () => {
    setNetworkError(null);
    try {
      const isUpdate = !!(editingData && editingData.id);
      const url = `/employee/${profileEmployeeId}/previousExperience/${editingData.id}`;
      const method = isUpdate ? 'put' : 'post';

      if (isUpdate) {
        await publicinfoApi.put(url, editingData);
      } else {
        await publicinfoApi.post(`/employee/${profileEmployeeId}/previousExperience`, editingData);
      }

      const updatedExperienceRes = await publicinfoApi.get(`employee/${profileEmployeeId}/previousExperience`);
      setExperience(updatedExperienceRes.data);

      const sections = [
        hasActualData(primarydata, 'primaryDetails'),
        hasActualData(contactdetails, 'contactDetails'),
        hasActualData(addressData, 'address'),
        hasActualData(eduData, 'education'),
        hasActualData(updatedExperienceRes.data, 'experience'),
      ];
      setCompletionStats({ completed: sections.filter(Boolean).length, total: 5 });
      return true;
    } catch (error) {
      console.error("Failed to update experience details:", error);
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data);
      } else {
        const networkErrorMessage = handleNetworkError(error);
        setNetworkError(networkErrorMessage);
      }
      return false;
    }
  };

  const handleSubmit = async (section) => {
    setNetworkError(null);

    const fields = sectionFields[section] || [];
    const validationErrors = {};

    fields.forEach(field => {
      const value = editingData[field.name];
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        if (field.type === 'file') {
          if (!editingData[field.name] && !selectedFile) {
            validationErrors[field.name] = `${field.label} is required`;
          }
        } else {
          validationErrors[field.name] = `${field.label} is required`;
        }
      } else if (value && typeof value === 'string' && value.trim() !== '') {
        const validationError = validateFieldByHint(field.name, value, field.hint, field.type);
        if (validationError) {
          validationErrors[field.name] = validationError;
        }
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const hasChanges = hasFormChanges(editingData, initialEditingData, selectedFile);

    if (!hasChanges) {
      setNoChangesModal({
        show: true,
        section: section,
        onContinue: () => {
          setNoChangesModal({ show: false, section: null, onContinue: null });
          proceedWithSubmission(section);
        }
      });
      return;
    }

    proceedWithSubmission(section);
  };

  const proceedWithSubmission = async (section) => {
    setIsUpdating(true);
    let success = false;
    try {
      switch (section) {
        case "primaryDetails":
          success = await handleUpdatePrimaryDetails();
          break;
        case "contactDetails":
          success = await handleUpdateContactDetails();
          break;
        case "address":
          success = await handleUpdateAddress();
          break;
        case "education":
          success = await handleUpdateEducation();
          break;
        case "experience":
          success = await handleUpdateExperience();
          break;
        default:
          console.error("Unknown section:", section);
          setErrors({ general: "Unknown section selected for update." });
      }
    } finally {
      setIsUpdating(false);
    }

    if (success) {
      setEditingSection(null);
      setErrors({});
      setNetworkError(null);
      localStorage.removeItem(`profile-editing-${section}`);
      setPopup({ show: true, message: 'Profile section updated successfully!', type: 'success' });
    }
  };

  const handleCancelEdit = () => {
    if (editingSection) {
      localStorage.removeItem(`profile-editing-${editingSection.section}`);
    }
    setEditingSection(null);
    setNetworkError(null);
  };

  const renderField = (label, name, type = "text", required = false, options = [], hint = "") => {
    const isError = errors[name];
    const fieldValue = editingData[name] || "";

    if (type === "file") {
      return (
        <div className="relative" key={name}>
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

          <div className={`relative border-2 border-dashed rounded-lg sm:rounded-xl
            ${isError
              ? 'border-red-300 bg-red-50'
              : theme === 'dark'
                ? 'border-gray-600 bg-gray-800'
                : 'border-gray-300 bg-gray-50'
            }`}>
            <input
              type="file"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".jpg,.jpeg,.png,.pdf"
            />
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
              <IoCloudUpload className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} />
              <p className={`text-xs sm:text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Drop your file here, or <span className="text-blue-600">browse</span>
              </p>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>PNG, JPG, PDF up to 10MB</p>

              {selectedFile && (
                <p className={`mt-2 text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          {isError && (
            <div className="mt-2 sm:mt-3 flex items-center space-x-2 text-red-600">
              <IoWarning className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium">{isError}</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="relative" key={name}>
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

        {type === "select" ? (
          <div className="relative">
            <select
              value={fieldValue}
              onChange={(e) => handleEditFieldChange(name, e.target.value)}
              className={`w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl appearance-none text-sm
                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                ${isError
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                  : theme === 'dark'
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-200 bg-white'
                }`}
            >
              <option value="">Choose {label}</option>
              {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        ) : type === "date" ? (
          <input
            type="date"
            value={fieldValue}
            onChange={(e) => handleEditFieldChange(name, e.target.value)}
            max={name === 'dateOfBirth' ? getMaxDate() : undefined}
            className={`w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-sm
              focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
              ${isError
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-200 bg-white'
              }`}
          />
        ) : type === "textarea" ? (
          <textarea
            value={fieldValue}
            onChange={(e) => handleEditFieldChange(name, e.target.value)}
            className={`w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-sm resize-none h-24 sm:h-32
              focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
              ${isError
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-200 bg-white'
              }`}
            placeholder={`Enter ${label.toLowerCase()}...`}
            required={required}
          />
        ) : (
          <input
            type={type}
            value={fieldValue}
            onChange={(e) => handleEditFieldChange(name, e.target.value)}
            className={`w-full px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-sm
              focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
              ${isError
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 text-white'
                  : 'border-gray-200 bg-white'
              }`}
            placeholder={`Enter ${label.toLowerCase()}...`}
            required={required}
          />
        )}

        {isError && (
          <div className="mt-2 sm:mt-3 flex items-center space-x-2 text-red-600">
            <IoWarning className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium">{isError}</p>
          </div>
        )}
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editingSection) return null;
    const { section, isAdd } = editingSection;
    const fields = sectionFields[section] || [];
    const config = sectionConfig[section];
    const IconComponent = config.icon;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-2 sm:p-4">
        <div className={`rounded-2xl sm:rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
          <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-r ${config.color} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl flex-shrink-0">
                  <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold break-words">
                    {isAdd ? `Add ${config.title}` : `Edit ${config.title}`}
                  </h2>
                  <p className="text-white/90 text-xs sm:text-sm break-words">{config.description}</p>
                </div>
              </div>
              <button
                onClick={handleCancelEdit}
                className="p-2 sm:p-3 rounded-full flex-shrink-0"
                aria-label="Close"
              >
                <IoClose className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-grow">
            <form className="p-4 sm:p-6 md:p-8" onSubmit={(e) => { e.preventDefault(); handleSubmit(section); }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {fields.map((f) => renderField(f.label, f.name, f.type, f.required, f.options, f.hint))}
              </div>

              {networkError && (
                <div className={`mt-4 sm:mt-6 p-3 sm:p-4 md:p-5 border-l-4 border-red-400 rounded-r-lg sm:rounded-r-xl ${
                  theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                  }`}>
                  <div className="flex items-start">
                    <IoWarning className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
                        Network Error
                      </h4>
                      <p className={`font-medium text-sm mt-1 ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
                        {networkError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errors.general && (
                <div className={`mt-4 sm:mt-6 p-3 sm:p-4 md:p-5 border-l-4 border-red-400 rounded-r-lg sm:rounded-r-xl ${
                  theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                  }`}>
                  <div className="flex items-center">
                    <IoWarning className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 mr-3 flex-shrink-0" />
                    <p className={`font-medium text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>{errors.general}</p>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-t flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600'
              : 'bg-gray-50 border-gray-200'
            }`}>
            <button
              type="button"
              onClick={handleCancelEdit}
              className={`w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 border-2 rounded-lg sm:rounded-xl font-semibold focus:ring-4 focus:ring-gray-500/20 text-sm ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 bg-gray-600'
                  : 'border-gray-300 text-gray-700 bg-white'
                }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(section)}
              disabled={isUpdating}
              className={`w-full sm:w-auto px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r ${config.color} text-white font-bold rounded-lg sm:rounded-xl
                focus:ring-4 focus:ring-blue-500/30 flex items-center justify-center space-x-2 text-sm
                ${isUpdating ? 'cursor-not-allowed opacity-75' : ''}`}
            >
              {isUpdating ? (
                <>
                  <div className="h-4 w-4 sm:h-5 sm:w-5 border-4 border-white border-t-transparent rounded-full"></div>
                  <span>{isAdd ? 'Adding...' : 'Updating...'}</span>
                </>
              ) : (
                <>
                  <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{isAdd ? 'Add Information' : 'Update Information'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DetailItem = ({ label, value }) => (
    <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600'
        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-100'
      }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-bold uppercase tracking-wider block mb-1 sm:mb-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
            {label}
          </span>
          <p className={`text-xs sm:text-sm font-semibold leading-relaxed break-words ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
            {value || (
              <span className={`italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Not provided</span>
            )}
          </p>
        </div>

      </div>
      </div>
  );

  const EducationExperienceItem = ({ type, item, index, onEdit }) => {
    const config = sectionConfig[type];
    const IconComponent = config.icon;

    return (
      <div className={`col-span-full border-2 rounded-lg sm:rounded-xl p-4 sm:p-6 ${
        theme === 'dark'
          ? `bg-gray-700 ${config.darkBorderColor}`
          : `bg-gray-50 ${config.borderColor}`
        }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-600' : 'bg-white'
              }`}>
              <IconComponent className={`w-5 h-5 ${
                theme === 'dark' ? config.darkTextColor : config.textColor
                }`} />
            </div>
            <div>
              <h4 className={`font-bold text-sm sm:text-base ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                {type === 'education' ? item.degreeType : item.companyName}
              </h4>
              <p className={`text-xs sm:text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                {type === 'education' ? item.universityOrCollege : item.jobTitle}
              </p>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(item)}
                className={`p-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  }`}
                title="Edit"
              >
                <IoCreateOutline className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {type === 'education' ? (
            <>
              <DetailItem label="Specialization" value={item.branchOrSpecialization} />
              <DetailItem label="Years" value={`${item.startYear} - ${item.endYear}`} />
              <DetailItem label="CGPA/Percentage" value={item.cgpaOrPercentage} />
              {item.addFiles && (
                <div className="col-span-full">
                  <a href={item.addFiles} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center space-x-2 p-2 sm:p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                    }`}>
                    <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-xs sm:text-sm">View Certificate</span>
                  </a>
                </div>
              )}
            </>
          ) : (
            <>
              <DetailItem label="Location" value={item.location} />
              <DetailItem label="Duration" value={`${item.startMonth} ${item.startYear} - ${item.endMonth ? item.endMonth + ' ' + item.endYear : 'Present'}`} />
              <DetailItem label="Description" value={item.description} />
            </>
          )}
        </div>
      </div>
    );
  };

  const Section = ({ sectionKey, title, children, data }) => {
    const config = sectionConfig[sectionKey];
    const IconComponent = config.icon;

    const hasData = hasActualData(data, sectionKey);

    return (
      <div className={`border-2 rounded-none sm:rounded-2xl shadow-lg
                         overflow-hidden mb-6 sm:mb-8 ${
        theme === 'dark'
          ? `bg-gray-800 ${config.darkBorderColor}`
          : `bg-white ${config.borderColor}`
        }`}>
        <div className={`px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b-2 relative overflow-hidden ${
          theme === 'dark'
            ? `${config.darkBgColor} ${config.darkBorderColor}`
            : `${config.bgColor} ${config.borderColor}`
          }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className={`p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl shadow-md flex-shrink-0 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                }`}>
                <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${
                  theme === 'dark' ? config.darkTextColor : config.textColor
                  }`} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`font-bold text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 ${
                  theme === 'dark' ? config.darkTextColor : config.textColor
                  }`}>
                  <span className="break-words">{title}</span>
                  {hasData && (
                    <div className="flex items-center space-x-1">
                      <IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        Complete
                      </span>
                    </div>
                  )}
                </h4>
                <p className={`text-xs sm:text-sm mt-1 break-words ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{config.description}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              {(sectionKey === 'education' || sectionKey === 'experience') && !isReadOnly && (
                <button
                  onClick={() => openEditSection(sectionKey, null, true)}
                  className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg text-sm"
                >
                  <IoAdd className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Add {sectionKey === 'education' ? 'Education' : 'Experience'}</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}

              {!isReadOnly && !['education', 'experience'].includes(sectionKey) && (
                <button
                  onClick={() => openEditSection(sectionKey)}
                  className={`flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 cursor-pointer rounded-lg sm:rounded-xl font-semibold
                                 focus:ring-4 focus:ring-blue-500/20 shadow-md text-sm
                                 ${hasData
                      ? theme === 'dark'
                        ? `${config.darkTextColor} bg-gray-700 border-2 ${config.darkBorderColor}`
                        : `${config.textColor} bg-white border-2 ${config.borderColor}`
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                    }`}
                >
                  {hasData ? (
                    <>
                      <IoCreateOutline className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Edit Details</span>
                      <span className="sm:hidden">Edit</span>
                    </>
                  ) : (
                    <>
                      <IoAdd className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Add Information</span>
                      <span className="sm:hidden">Add</span>
                    </>
                  )}
                </button>
              )}

              {isReadOnly && (
                <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-400 border-2 border-gray-600'
                    : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                  }`}>
                  <IoEye className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                  <span>View Only</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          {hasData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {children}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ${
                theme === 'dark' ? config.darkBgColor : config.bgColor
                }`}>
                <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 opacity-50 ${
                  theme === 'dark' ? config.darkTextColor : config.textColor
                  }`} />
              </div>
              <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>No {title} Added</h3>
              <p className={`text-sm mb-4 sm:mb-6 max-w-sm mx-auto px-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                {isReadOnly
                  ? `This employee hasn't added their ${title.toLowerCase()} information yet.`
                  : `Add your ${title.toLowerCase()} to complete your profile information.`
                }
              </p>
              {!isReadOnly && (
                <button
                  onClick={() => openEditSection(sectionKey, null, true)}
                  className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600
                                 text-white font-semibold rounded-lg sm:rounded-xl shadow-lg text-sm"
                >
                  <IoAdd className="w-4 h-4" />
                  <span>Add {title}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProgressIndicator = () => {
    const profileSections = [
      hasActualData(primarydata, 'primaryDetails'),
      hasActualData(contactdetails, 'contactDetails'),
      hasActualData(addressData, 'address'),
      hasActualData(eduData, 'education'),
      hasActualData(experience, 'experience')
    ];
    const completedCount = profileSections.filter(Boolean).length;
    const totalCount = profileSections.length;
    const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <div className={`rounded-none sm:rounded-2xl p-4 sm:p-6 shadow-lg border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
        }`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className={`text-base sm:text-lg font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
            {isReadOnly ? 'Profile Status' : 'Profile Completion'}
          </h3>
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
            {completedCount}/{totalCount} Sections
          </span>
        </div>
        <div className={`w-full rounded-full h-2 sm:h-3 mb-3 sm:mb-4 overflow-hidden ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 sm:h-3 rounded-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm">
          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{percentage.toFixed(0)}% Complete</span>
          {percentage === 100 && (
            <span className="text-green-600 font-semibold flex items-center">
              <IoCheckmarkCircle className="w-4 h-4 mr-1" />
              All Set!
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        }`}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="relative">
              <div className="rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-500 border-t-transparent mx-auto mb-4 sm:mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <IoPersonOutline className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              </div>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Loading Profile</h2>
            <p className={`text-sm sm:text-base ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Fetching profile information...</p>
            <div className="flex justify-center space-x-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full bg-blue-500`}></div>
              ))}
            </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
      <div className="max-w-8xl mx-auto px-0 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 md:py-12">
        {fromContextMenu && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-l-4 border-blue-500 shadow-lg ${
            theme === 'dark' ? 'bg-blue-900/20 border-blue-400' : 'bg-blue-50 border-blue-500'
            }`}>
            <div className="flex items-center space-x-3">
              <IoEye className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-sm sm:text-base ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}>
                  Viewing Employee Profile
                </p>
                <p className={`text-xs sm:text-sm break-words ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                  Employee ID: {targetEmployeeId}
                  {isReadOnly && " • Read-only access"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 sm:mb-12 mx-4 sm:mx-0">
          <ProgressIndicator />
        </div>

        <div className="space-y-6 sm:space-y-8">
          <>
            <Section sectionKey="primaryDetails" title="Primary Details" data={primarydata}>
              <DetailItem label="First Name" value={primarydata?.firstName} />
              <DetailItem label="Middle Name" value={primarydata?.middleName} />
              <DetailItem label="Last Name" value={primarydata?.lastName} />
              <DetailItem label="Display Name" value={primarydata?.displayName} />
              <DetailItem label="Gender" value={primarydata?.gender} />
              <DetailItem label="Date of Birth" value={primarydata?.dateOfBirth} />
              <DetailItem label="Marital Status" value={primarydata?.maritalStatus} />
              <DetailItem label="Blood Group" value={primarydata?.bloodGroup} />
              <DetailItem label="Physically Handicapped" value={primarydata?.physicallyHandicapped} />
              <DetailItem label="Nationality" value={primarydata?.nationality} />
            </Section>
            <Section sectionKey="contactDetails" title="Contact Details" data={contactdetails}>
              <DetailItem label="Work Email" value={contactdetails?.workEmail} />
              <DetailItem label="Personal Email" value={contactdetails?.personalEmail} />
              <DetailItem label="Mobile Number" value={contactdetails?.mobileNumber} />
              <DetailItem label="Work Number" value={contactdetails?.workNumber} />
            </Section>
            <Section sectionKey="address" title="Address Information" data={addressData}>
              <DetailItem label="Street" value={addressData?.street} />
              <DetailItem label="City" value={addressData?.city} />
              <DetailItem label="State" value={addressData?.state} />
              <DetailItem label="Zip" value={addressData?.zip} />
              <DetailItem label="Country" value={addressData?.country} />
              <DetailItem label="District" value={addressData?.district} />
            </Section>

            <Section sectionKey="education" title="Education Details" data={eduData}>
              {eduData?.map((edu, index) => (
                <EducationExperienceItem
                  key={edu.id || index}
                  type="education"
                  item={edu}
                  index={index}
                  onEdit={(item) => openEditSection('education', item)}
                />
              ))}
            </Section>

            <Section sectionKey="experience" title="Previous Experience" data={experience}>
              {experience?.map((exp, index) => (
                <EducationExperienceItem
                  key={exp.id || index}
                  type="experience"
                  item={exp}
                  index={index}
                  onEdit={(item) => openEditSection('experience', item)}
                />
              ))}
            </Section>
          </>
        </div>

        {renderEditModal()}

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
                className={`${popup.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white font-semibold py-2 px-4 sm:px-6 rounded-lg text-sm`}
              >
                OK
              </button>
            </div>
          </Modal>
        )}

        {noChangesModal.show && (
          <Modal
            onClose={() => setNoChangesModal({ show: false, section: null, onContinue: null })}
            title="No Changes Detected"
            type="confirm"
            theme={theme}
          >
            <p className={`mb-4 sm:mb-6 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              You haven't made any changes to the form. Are you sure you want to submit without any modifications?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setNoChangesModal({ show: false, section: null, onContinue: null })}
                className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-semibold text-sm ${theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
              >
                Go Back & Make Changes
              </button>
              <button
                onClick={noChangesModal.onContinue}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-semibold text-white bg-yellow-600 text-sm"
              >
                Continue Anyway
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Profile;