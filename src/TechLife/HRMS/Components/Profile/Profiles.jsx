import React, { useState, useEffect, useContext} from "react";
import { Context } from "../HrmsContext";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import About from "./tabs/About";
import Profile from "./tabs/Profile";
import Job from "./tabs/Job";
import Document from "./tabs/Document";
import { HiIdentification, HiPencil } from "react-icons/hi";
import {
  MdWork,
  MdBusiness,
  MdEmail,
  MdPerson,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { FaPhone, FaBuilding } from "react-icons/fa";
import { IoEye } from "react-icons/io5";
import axios from "axios";
import { publicinfoApi } from "../../../../axiosInstance";

const Profiles = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { empID } = useParams();
  let { userprofiledata, setUserProfileData, theme, userData } = useContext(Context);

  // ✅ NEW: Context menu detection
  const searchParams = new URLSearchParams(location.search);
  const fromContextMenu = searchParams.get('fromContextMenu') === 'true';
  const targetEmployeeId = searchParams.get('targetEmployeeId');

  // ✅ NEW: Determine which employee ID to use for fetching profile data
  const profileEmployeeId = fromContextMenu && targetEmployeeId ? targetEmployeeId : empID;
  
  // ✅ NEW: Check if this is read-only mode (viewing another employee's profile)
  const isReadOnly = fromContextMenu && targetEmployeeId && targetEmployeeId !== empID;

  const [activeTab, setActiveTab] = useState(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // This state is ONLY for the preview of a newly uploaded image
  const [profileImagePreview, setProfileImagePreview] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  
  // This local state is for the edit modal form ONLY.
  const [employeeData, setEmployeeData] = useState({});

  // ✅ NEW: Store the viewed employee data separately
  const [viewedEmployeeData, setViewedEmployeeData] = useState(null);

  // ✅ UPDATED: Use profileEmployeeId instead of empID
  useEffect(() => {
    if (!profileEmployeeId) {
      return;
    }

    if (fromContextMenu && targetEmployeeId) {
      console.log("Viewing profile from context menu for employee:", targetEmployeeId);
    }

    const fetchEmployeeDetails = async () => {
      try {
        const relativePath = `/employee/${profileEmployeeId}`;
        console.log(`Requesting data from: ${relativePath}`);
        const response = await publicinfoApi.get(relativePath);

        console.log("✅ API Response Received:", response);
        console.log("✅ Employee Data:", response.data);

        if (fromContextMenu && targetEmployeeId && targetEmployeeId !== empID) {
          // ✅ If viewing another employee, store in separate state
          setViewedEmployeeData(response.data);
        } else {
          // ✅ If viewing own profile, update global context
          setUserProfileData(response.data);
          setEmployeeData(response.data); // Pre-fill local state for the edit modal
        }

      } catch (err) {
        console.error("❌ Error fetching employee details:", err);
      }
    };

    fetchEmployeeDetails();
  }, [profileEmployeeId, setUserProfileData, fromContextMenu, targetEmployeeId, empID]);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  // ✅ UPDATED: Use the correct data source for display
  const displayData = isReadOnly ? viewedEmployeeData : userprofiledata;

  const initials = (displayData?.displayName || "  ")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0,2);

  const tabs = [
    { name: "About", path: `about`, icon: MdPerson },
    { name: "Profile", path: `profile`, icon: HiIdentification },
    { name: "Job", path: `job`, icon: MdWork },
    { name: "Documents", path: `documents`, icon: MdBusiness },
  ];

  const handleImageUpload = (event) => {
    if (isReadOnly) {
      alert("You cannot upload images for another employee's profile.");
      return;
    }
    
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result); // Show preview
      };
      reader.readAsDataURL(file);
      // Here, you would typically call an API to upload the `file` object
      // e.g., uploadImage(empID, file);
    }
  };

  const handleEditClick = () => {
    if (isReadOnly) {
      alert("You can only view this employee's profile. Editing is not allowed.");
      return;
    }
    
    // When opening edit modal, ensure local state is synced with context
    setEmployeeData(displayData);
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Here you would call an API to save the 'employeeData' state
    // e.g., updateEmployee(empID, employeeData);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ UPDATED: Handle tab navigation with context menu parameters
  const handleTabClick = (path) => {
    const basePath = `/profile/${empID}/${path}`;
    if (fromContextMenu && targetEmployeeId) {
      navigate(`${basePath}?fromContextMenu=true&targetEmployeeId=${targetEmployeeId}`);
    } else {
      navigate(basePath);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      
      {/* Header */}
      <div className={`h-48 relative ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-[#B7D4FF]'
      }`}>
        
        {!isReadOnly && (
          <div className="absolute top-4 right-8">
            <button
              onClick={handleEditClick}
              className={`p-2 cursor-pointer rounded transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : 'bg-white hover:bg-gray-100 text-gray-600'
              }`}
              title="Edit Profile"
            >
              <HiPencil className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-start pt-4 px-8">
          <div className="relative group cursor-pointer">
            <label htmlFor={!isReadOnly ? "profile-upload" : ""} className={isReadOnly ? "cursor-not-allowed" : "cursor-pointer block"}>
              
              {(profileImagePreview || displayData?.employeeImage) ? (
                <img
                  src={profileImagePreview || displayData.employeeImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full bg-white border-2 border-white shadow-lg object-cover"
                />
              ) : (
                <div className={`w-32 h-32 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-2xl font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {initials}
                </div>
              )}

              {!isReadOnly && (
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-sm">Upload Photo</span>
                </div>
              )}
            </label>
            {!isReadOnly && (
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            )}
          </div>

          <div className={`ml-8 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            <h1 className="text-3xl font-bold tracking-wide mb-4">
              {displayData?.displayName}
            </h1>
            <div className={`grid grid-cols-2 gap-x-12 gap-y-2 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div className="flex items-center space-x-2">
                <HiIdentification className="w-5 h-5" />
                <p>{displayData?.employeeId}</p>
              </div>
              <div className="flex items-center space-x-2">
                <FaBuilding className="w-5 h-5" />
                <p>{displayData?.location}</p>
              </div>
              <div className="flex items-center space-x-2">
                <MdWork className="w-5 h-5" />
                <p>{displayData?.jobTitlePrimary}</p>
              </div>
              <div className="flex items-center space-x-2">
                <MdEmail className="w-5 h-5" />
                <p>{displayData?.workEmail}</p>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone className="w-5 h-5" />
                <p>{displayData?.workNumber}</p>
              </div>
              <div className="flex items-center space-x-2">
                <MdPerson className="w-5 h-5" />
                <p>{displayData?.jobTitleSecondary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <main className={`flex-1 p-6 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <Routes>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="about" element={<About />} />
            <Route path="profile" element={<Profile />} />
            <Route path="job" element={<Job />} />
            <Route path="documents" element={<Document />} />
          </Routes>
        </main>

        <div
          className={`transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-20"
          } border-l min-h-full relative ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-700'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`absolute -left-3 top-4 border rounded-full p-1 shadow z-10 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-white'
                : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-600'
            }`}
          >
            {sidebarOpen ? <MdChevronRight /> : <MdChevronLeft />}
          </button>
          <nav className="p-4 sticky top-0">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const isActive = location.pathname.endsWith(tab.path);
                return (
                  <div
                    key={tab.path}
                    onClick={() => handleTabClick(tab.path)}
                    className={`cursor-pointer flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? theme === 'dark'
                          ? "bg-blue-600 text-white"
                          : "bg-black text-white"
                        : theme === 'dark'
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon
                      className={`w-5 h-5 ${
                        isActive 
                          ? "text-white" 
                          : theme === 'dark'
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    />
                    {sidebarOpen && (
                      <span className="font-medium">{tab.name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {isEditing && !isReadOnly && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-100 flex items-center justify-center z-[200]">
          <div className={`rounded-lg p-6 w-[500px] shadow-2xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Edit Profile</h2>
            <form onSubmit={handleSave}>
              <div className="space-y-4">
                {[
                  "name",
                  "empId",
                  "company",
                  "department",
                  "email",
                  "contact",
                  "role",
                ].map((field) => (
                  <div key={field}>
                    <label className={`block text-sm font-medium capitalize ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {field}
                    </label>
                    <input
                      type={field === "email" ? "email" : "text"}
                      name={field}
                      value={employeeData[field] || ''}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={`px-4 py-2 border rounded-md transition-colors ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiles;