import React, { useState, useEffect, useContext } from "react";
import { IoClose, IoPersonOutline, IoCheckmarkCircle, IoWarning, IoAdd, IoMailOutline, IoLocationOutline, IoSchoolOutline, IoPeopleOutline } from "react-icons/io5";
import { Context } from "../../HrmsContext";
import { publicinfoApi } from "../../../../../axiosInstance";
import { useParams } from "react-router-dom";


// Default Profile (Only static relations/identity)
const defaultProfile = {
  relations: {
    fatherName: "Albert Smith",
    motherName: "Marry Smith",
    spouseName: "Jane Smith",
    children: "2",
    siblings: "1",
  },
};


const sectionFields = {
  primaryDetails: [
    { label: "First Name", name: "firstName", type: "text", required: true },
    { label: "Middle Name", name: "middleName", type: "text" },
    { label: "Last Name", name: "lastName", type: "text", required: true },
    {
      label: "Display Name",
      name: "displayName",
      type: "text",
      required: true,
    },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      required: true,
      options: ["Male", "Female", "Other"],
    },
    {
      label: "Date of Birth",
      name: "dateOfBirth",
      type: "date",
      required: true,
    },
    {
      label: "Marital Status",
      name: "maritalStatus",
      type: "select",
      options: ["Single", "Married", "Divorced"],
    },
    {
      label: "Blood Group",
      name: "bloodGroup",
      type: "select",
      required: true,
      options: ["O+ (O Positive)", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"],
    },
    {
      label: "Physically Handicapped",
      name: "physicallyHandicapped",
      type: "select",
      required: true,
      options: ["Yes", "No"],
    },
    {
      label: "Nationality",
      name: "nationality",
      type: "select",
      required: true,
      options: ["United States", "India", "Canada"],
    },
  ],
  contactDetails: [
    { label: "Work Email", name: "workEmail", type: "email", required: true },
    { label: "Personal Email", name: "personalEmail", type: "email" },
    { label: "Mobile Number", name: "mobileNumber", type: "text", required: true },
    { label: "Work Number", name: "workNumber", type: "text" },
  ],
  address: [
    { label: "Street", name: "street", type: "text", required: true },
    { label: "City", name: "city", type: "text", required: true },
    { label: "State", name: "state", type: "text", required: true },
    { label: "Zip", name: "zip", type: "text", required: true },
    { label: "Country", name: "country", type: "text", required: true },
    { label: "District", name: "district", type: "text", required: true },
  ],
  relations: [
    { label: "Father Name", name: "fatherName", type: "text" },
    { label: "Mother Name", name: "motherName", type: "text" },
    { label: "Spouse Name", name: "spouseName", type: "text" },
    { label: "Children", name: "children", type: "number" },
    { label: "Siblings", name: "siblings", type: "number" },
  ],
  education: [
    {
      label: "Highest Degree",
      name: "highestDegree",
      type: "text",
      required: true,
    },
    { label: "Institution", name: "institution", type: "text", required: true },
    {
      label: "Year Of Passing",
      name: "yearOfPassing",
      type: "number",
      required: true,
    },
    {
      label: "Grading System",
      name: "gradingSystem",
      type: "select",
      options: ["Percentage", "CGPA", "GPA"],
      required: true,
    },
    { label: "Grade", name: "grade", type: "text" },
    { label: "Specialization", name: "specialization", type: "text" },
  ],
};


// Section configurations with icons and colors
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
  relations: {
    icon: IoPeopleOutline,
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    darkBgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-200',
    darkBorderColor: 'border-purple-700',
    textColor: 'text-purple-700',
    darkTextColor: 'text-purple-400',
    title: 'Family Relations',
    description: 'Family members and relationships'
  },
  education: {
    icon: IoSchoolOutline,
    color: 'from-red-500 to-red-700',
    bgColor: 'bg-red-50',
    darkBgColor: 'bg-red-900/20',
    borderColor: 'border-red-200',
    darkBorderColor: 'border-red-700',
    textColor: 'text-red-700',
    darkTextColor: 'text-red-400',
    title: 'Education Details',
    description: 'Academic qualifications and achievements'
  },
};


function Profile() {
  const [editingSection, setEditingSection] = useState(null);
  const [primarydata, setPrimaryData] = useState(null);
  const [contactdetails, setContactDetails] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [eduData, setEduData] = useState([]);
  const [experience, setExperience] = useState([]);
  const { userprofiledata, setUserProfileData, theme } = useContext(Context);
  const [editingData, setEditingData] = useState({});
  const { empID } = useParams();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // New state for loading spinner
  const [errors, setErrors] = useState({});
  const [completionStats, setCompletionStats] = useState({ completed: 0, total: 4 });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [primaryRes, contactRes, addressRes, eduRes, expRes] = await Promise.all([
          publicinfoApi.get(`employee/${empID}/primary/details`).catch(err => ({ data: null })),
          publicinfoApi.get(`employee/${empID}/contact`).catch(err => ({ data: null })),
          publicinfoApi.get(`employee/${empID}/address`).catch(err => ({ data: null })),
          publicinfoApi.get(`employee/${empID}/degreeDetails`).catch(err => ({ data: null })),
          publicinfoApi.get(`employee/${empID}/previousExperience`).catch(err => ({ data: null })),
        ]);
        
        setPrimaryData(primaryRes.data);
        console.log("Fetched primary details response:", primaryRes.data);
        setContactDetails(contactRes.data);
        console.log("Fetched contact details response:", contactRes.data);
        setAddressData(addressRes.data);
        console.log("Fetched address details response:", addressRes.data);
        setEduData(eduRes.data);
        console.log("Fetched education details response:", eduRes.data);
        setExperience(expRes.data);
        console.log("Fetched experience details response:", expRes.data);


        // Calculate completion stats
        const sections = [primaryRes.data, contactRes.data, addressRes.data, eduRes.data];
        const completed = sections.filter(Boolean).length;
        setCompletionStats({ completed, total: 4 });
        
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };


    if (empID) {
      fetchData();
    }
  }, [empID]);


  const openEditSection = (section) => {
    setErrors({});
    let dataToEdit = {};
    if (section === "primaryDetails") {
      dataToEdit = primarydata;
    } else if (section === "contactDetails") {
      dataToEdit = contactdetails;
    } else if (section === "address") {
      dataToEdit = addressData;
    } else if (section === "relations") {
      dataToEdit = defaultProfile.relations;
    }


    setEditingData(dataToEdit || {});
    setEditingSection({ section });
  };


  const handleEditFieldChange = (field, value) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };


  // --- NEW: SEPARATE UPDATE FUNCTIONS ---
  const handleUpdatePrimaryDetails = async () => {
    try {
      const url = `/employee/${empID}/primary/details`;
      await publicinfoApi.put(url, editingData);
      const updatedData = await publicinfoApi.get(url);
      setPrimaryData(updatedData.data);
      setCompletionStats(prev => ({ ...prev, completed: [updatedData.data, contactdetails, addressData, eduData].filter(Boolean).length }));
      return true;
    } catch (error) {
      if (error.response && error.response.status === 400) setErrors(error.response.data);
      else setErrors({ general: "An unexpected error occurred while updating Primary Details." });
      return false;
    }
  };


  const handleUpdateContactDetails = async () => {
    try {
      const url = `/employee/${empID}/contact`;
      await publicinfoApi.put(url, editingData);
      const updatedData = await publicinfoApi.get(url);
      setContactDetails(updatedData.data);
      setCompletionStats(prev => ({ ...prev, completed: [primarydata, updatedData.data, addressData, eduData].filter(Boolean).length }));
      return true;
    } catch (error) {
      if (error.response && error.response.status === 400) setErrors(error.response.data);
      else setErrors({ general: "An unexpected error occurred while updating Contact Details." });
      return false;
    }
  };


  const handleUpdateAddress = async () => {
    try {
      const url = `/employee/${empID}/address`;
      await publicinfoApi.put(url, editingData);
      const updatedData = await publicinfoApi.get(url);
      setAddressData(updatedData.data);
      setCompletionStats(prev => ({ ...prev, completed: [primarydata, contactdetails, updatedData.data, eduData].filter(Boolean).length }));
      return true;
    } catch (error) {
      if (error.response && error.response.status === 400) setErrors(error.response.data);
      else setErrors({ general: "An unexpected error occurred while updating Address." });
      return false;
    }
  };
  
  const handleUpdateRelations = () => {
      console.error("Backend endpoint for updating relations does not exist in your controller.");
      alert("This section cannot be updated yet. A backend API endpoint is missing.");
      setEditingSection(null);
  };


  // --- NEW: Master handleSubmit function to call the correct update function ---
  const handleSubmit = async (section) => {
    setIsUpdating(true); // Start the loading spinner
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
            case "relations":
                handleUpdateRelations(); // This will show an alert
                break;
            default:
                console.error("Unknown section:", section);
                setErrors({ general: "Unknown section selected for update." });
        }
    } finally {
        setIsUpdating(false); // Stop the loading spinner
    }


    if (success) {
      setEditingSection(null);
      setErrors({});
    }
  };
  
  // Skeleton Loading Component
  const SkeletonCard = () => (
    <div className={`border rounded-2xl shadow-sm overflow-hidden animate-pulse ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className={`p-6 border-b ${
        theme === 'dark' 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl ${
              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`}></div>
            <div>
              <div className={`h-5 rounded w-32 mb-2 ${
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
              }`}></div>
              <div className={`h-3 rounded w-48 ${
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
              }`}></div>
            </div>
          </div>
          <div className={`h-9 rounded-lg w-20 ${
            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
          }`}></div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className={`h-3 rounded w-20 mb-2 ${
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
              }`}></div>
              <div className={`h-4 rounded w-32 ${
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

// Moved renderField inside the component to access handleEditFieldChange
const renderField = (label, name, type = "text", required = false, options = []) => {
  const isError = errors[name];
  const fieldValue = editingData[name] || "";
  
  return (
    <div className="group relative" key={name}>
      <label className={`block text-sm font-semibold mb-3 flex items-center ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
      }`}>
        {label}
        {required && <span className="text-red-500 ml-1 text-base">*</span>}
      </label>
      
      {type === "select" ? (
        <div className="relative">
          <select 
            value={fieldValue} 
            onChange={(e) => handleEditFieldChange(name, e.target.value)} 
            className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300 appearance-none 
              focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
              ${isError 
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                : theme === 'dark'
                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
              }`}
          >
            <option value="">Choose {label}</option>
            {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      ) : type === "date" ? (
        <input 
          type="date" 
          value={fieldValue} 
          onChange={(e) => handleEditFieldChange(name, e.target.value)} 
          className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300
            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
            ${isError 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
              : theme === 'dark'
              ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
              : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
            }`}
        />
      ) : (
        <input 
          type={type} 
          value={fieldValue} 
          onChange={(e) => handleEditFieldChange(name, e.target.value)} 
          className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300
            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
            ${isError 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
              : theme === 'dark'
              ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
              : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
            }`}
          placeholder={`Enter ${label.toLowerCase()}...`} 
          required={required} 
        />
      )}
      
      {isError && (
        <div className="mt-3 flex items-center space-x-2 text-red-600 animate-slideIn">
          <IoWarning className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-medium">{isError}</p>
        </div>
      )}
    </div>
  );
};
 
  const renderEditModal = () => {
    if (!editingSection) return null;
    const { section } = editingSection;
    const fields = sectionFields[section] || [];
    const config = sectionConfig[section];
    const IconComponent = config.icon;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fadeIn">
        <div className={`rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp flex flex-col ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className={`px-8 py-6 bg-gradient-to-r ${config.color} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <IconComponent className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Edit {config.title}
                  </h2>
                  <p className="text-white/90 text-sm">{config.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingSection(null)} 
                className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 group" 
                aria-label="Close"
              >
                <IoClose className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            <form className="p-8" onSubmit={(e) => { e.preventDefault(); handleSubmit(section); }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {fields.map((f) => renderField(f.label, f.name, f.type, f.required, f.options))}
              </div>
              
              {errors.general && (
                <div className={`mt-6 p-5 border-l-4 border-red-400 rounded-r-xl animate-slideIn ${
                  theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                }`}>
                  <div className="flex items-center">
                    <IoWarning className="w-6 h-6 text-red-400 mr-3" />
                    <p className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>{errors.general}</p>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          <div className={`px-8 py-6 border-t flex justify-end space-x-4 ${
            theme === 'dark' 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <button 
              type="button" 
              onClick={() => setEditingSection(null)} 
              className={`px-8 py-3 border-2 rounded-xl font-semibold transition-all duration-200 focus:ring-4 focus:ring-gray-500/20 ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
              }`}
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={() => handleSubmit(section)}
              disabled={isUpdating}
              className={`px-10 py-3 bg-gradient-to-r ${config.color} text-white font-bold rounded-xl
                         hover:shadow-lg transform hover:scale-105 transition-all duration-200 
                         focus:ring-4 focus:ring-blue-500/30 flex items-center space-x-2
                         ${isUpdating ? 'cursor-not-allowed opacity-75' : ''}`}
            >
              {isUpdating ? (
                <>
                  <div className="h-5 w-5 border-4 border-white border-t-transparent rounded-full animate-spin-slow"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <IoCheckmarkCircle className="w-5 h-5" />
                  <span>Update Information</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
 
  const DetailItem = ({ label, value }) => (
    <div className={`group p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 hover:shadow-md hover:shadow-blue-500/20'
        : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-100 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {label}
          </span>
          <p className={`text-sm font-semibold leading-relaxed ${
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


  const Section = ({ sectionKey, title, children, data }) => {
    const config = sectionConfig[sectionKey];
    const IconComponent = config.icon;
    const hasData = !!data;
    
    return (
      <div className={`border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 
                       overflow-hidden group hover:scale-[1.02] mb-8 ${
        theme === 'dark'
          ? `bg-gray-800 ${config.darkBorderColor} hover:shadow-blue-500/20`
          : `bg-white ${config.borderColor}`
      }`}>
        <div className={`px-8 py-6 border-b-2 relative overflow-hidden ${
          theme === 'dark'
            ? `${config.darkBgColor} ${config.darkBorderColor}`
            : `${config.bgColor} ${config.borderColor}`
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl shadow-md transform group-hover:scale-110 transition-transform duration-300 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-white'
              }`}>
                <IconComponent className={`w-8 h-8 ${
                  theme === 'dark' ? config.darkTextColor : config.textColor
                }`} />
              </div>
              <div>
                <h4 className={`text-xl font-bold flex items-center space-x-2 ${
                  theme === 'dark' ? config.darkTextColor : config.textColor
                }`}>
                  <span>{title}</span>
                  {hasData && (
                    <div className="flex items-center space-x-1">
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        Complete
                      </span>
                    </div>
                  )}
                </h4>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>{config.description}</p>
              </div>
            </div>
            <button 
              onClick={() => openEditSection(sectionKey)} 
              className={`flex items-center space-x-2 px-6 py-3 cursor-pointer rounded-xl font-semibold transition-all duration-300 
                         transform hover:scale-105 focus:ring-4 focus:ring-blue-500/20 shadow-md hover:shadow-lg
                         ${hasData 
                           ? theme === 'dark'
                             ? `${config.darkTextColor} bg-gray-700 border-2 ${config.darkBorderColor} hover:bg-gray-600`
                             : `${config.textColor} bg-white border-2 ${config.borderColor} hover:bg-gray-50`
                           : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                         }`}
            >
              {hasData ? (
                <>
                  <IconComponent className="w-4 h-4" />
                  <span>Edit Details</span>
                </>
              ) : (
                <>
                  <IoAdd className="w-4 h-4" />
                  <span>Add Information</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="p-8">
          {hasData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {children}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                theme === 'dark' ? config.darkBgColor : config.bgColor
              }`}>
                <IconComponent className={`w-10 h-10 opacity-50 ${
                  theme === 'dark' ? config.darkTextColor : config.textColor
                }`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>No {title} Added</h3>
              <p className={`text-sm mb-6 max-w-sm mx-auto ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Add your {title.toLowerCase()} to complete your profile information.
              </p>
              <button 
                onClick={() => openEditSection(sectionKey)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 
                           text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 
                           transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <IoAdd className="w-4 h-4" />
                <span>Add {title}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };


  const ProgressIndicator = () => {
    const percentage = completionStats.total > 0 ? (completionStats.completed / completionStats.total) * 100 : 0;
    
    return (
      <div className={`rounded-2xl p-6 shadow-lg border ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>Profile Completion</h3>
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {completionStats.completed}/{completionStats.total} Sections
          </span>
        </div>
        <div className={`w-full rounded-full h-3 mb-4 overflow-hidden ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-700 ease-out"
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


  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <IoPersonOutline className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>Loading Your Profile</h2>
            <p className={`${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Fetching your personal information...</p>
            <div className="flex justify-center space-x-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`} 
                     style={{ animationDelay: `${i * 0.2}s` }}></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="mb-12">
            <ProgressIndicator />
          </div>


          <div className="space-y-8">
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
                <Section sectionKey="relations" title="Family Relations" data={defaultProfile.relations}>
                  <DetailItem label="Father Name" value={defaultProfile.relations?.fatherName} />
                  <DetailItem label="Mother Name" value={defaultProfile.relations?.motherName} />
                  <DetailItem label="Spouse Name" value={defaultProfile.relations?.spouseName} />
                  <DetailItem label="Children" value={defaultProfile.relations?.children} />
                  <DetailItem label="Siblings" value={defaultProfile.relations?.siblings} />
                </Section>
              </>
          </div>
          
          {renderEditModal()}
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-spin-slow {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}


export default Profile;
