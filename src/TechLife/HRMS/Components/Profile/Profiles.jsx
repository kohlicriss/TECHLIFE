import React, { useState, useEffect, useContext, useRef } from "react";
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
import Achievements from "./tabs/Achievements";
import { HiIdentification, HiPencil } from "react-icons/hi";
import {
  MdWork,
  MdBusiness,
  MdEmail,
  MdPerson,
  MdChevronLeft,
  MdChevronRight,
  MdStar,
} from "react-icons/md";
import { FaPhone, FaBuilding, FaCamera, FaTrash, FaTimes, FaExpand, FaCompress } from "react-icons/fa"; // Added new icons
import { publicinfoApi } from "../../../../axiosInstance";
import { motion, AnimatePresence } from "framer-motion";

const Profiles = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { empID } = useParams();
  const { userprofiledata, setUserProfileData, theme } = useContext(Context);

  const searchParams = new URLSearchParams(location.search);
  const fromContextMenu = searchParams.get('fromContextMenu') === 'true';
  const targetEmployeeId = searchParams.get('targetEmployeeId');

  const profileEmployeeId = fromContextMenu && targetEmployeeId ? targetEmployeeId : empID;
  
  const isReadOnly = fromContextMenu && targetEmployeeId && targetEmployeeId !== empID;

  const [activeTab, setActiveTab] = useState(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [profileImagePreview, setProfileImagePreview] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);
  const [employeeData, setEmployeeData] = useState({});
  const [viewedEmployeeData, setViewedEmployeeData] = useState(null);

  // ✅ New state for the image management modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  // ✅ NEW: State for full image view
  const [isImageFullView, setIsImageFullView] = useState(false);
  const fileInputRef = useRef(null); // To trigger file input click

  useEffect(() => {
    if (!profileEmployeeId) return;

    const fetchEmployeeDetails = async () => {
      try {
        const response = await publicinfoApi.get(`/employee/${profileEmployeeId}`);
        if (fromContextMenu && targetEmployeeId && targetEmployeeId !== empID) {
          setViewedEmployeeData(response.data);
        } else {
          setUserProfileData(response.data);
          setEmployeeData(response.data); 
        }
      } catch (err) {
        console.error("❌ Error fetching employee details:", err);
      }
    };

    fetchEmployeeDetails();
  }, [profileEmployeeId, setUserProfileData, fromContextMenu, targetEmployeeId, empID]);

  //      useEffect(() => {
  // // Start of new logic
  // const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // const now = new Date();
  // const formattedTime = now.toLocaleTimeString('en-US');
  // console.log("Current Time Zone:", userTimeZone);
  // console.log("Current Time:", formattedTime);
  //      })

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const displayData = isReadOnly ? viewedEmployeeData : userprofiledata;

  const initials = (displayData?.displayName || "  ")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0,2);

  const tabs = [
    { name: "About", path: `about`, icon: MdPerson },
    { name: "Profile", path: `profile`, icon: HiIdentification },
    { name: "Job", path: `job`, icon: MdWork },
    { name: "Documents", path: `documents`, icon: MdBusiness },
    { name: "Achievements", path: 'achievements', icon: MdStar },
  ];

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('employeeImage', file);

      try {
        const response = await publicinfoApi.post(`/employee/${profileEmployeeId}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUserProfileData(response.data);
        // NEW: Update localStorage with new image
        if (response.data.employeeImage) {
            localStorage.setItem("loggedInUserImage", response.data.employeeImage);
        }
        alert('Profile picture updated successfully!');
        setIsImageModalOpen(false); // Close modal on success
        setIsImageFullView(false); // Reset full view
      } catch (err) {
        console.error("Error uploading image:", err);
        alert('Failed to upload image. Please try again.');
        setProfileImagePreview(null); 
      }
    }
  };

  const handleDeleteImage = async () => {
    if (window.confirm("Are you sure you want to delete your profile picture? This action cannot be undone.")) {
        try {
            await publicinfoApi.delete(`/employee/${profileEmployeeId}/deleteImage`);
            setUserProfileData({ ...userprofiledata, employeeImage: null });
            // NEW: Remove image from localStorage
            localStorage.removeItem("loggedInUserImage");
            setProfileImagePreview(null);
            alert('Profile picture deleted successfully.');
            setIsImageModalOpen(false);
            setIsImageFullView(false);
        } catch (err) {
            console.error("Error deleting image:", err);
            alert('Failed to delete image. Please try again.');
        }
    }
  };

  const handleEditClick = () => {
    if (isReadOnly) return;
    setEmployeeData(displayData);
    setIsEditing(true);
  };
  
  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setEmployeeData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTabClick = (path) => {
    const basePath = `/profile/${empID}/${path}`;
    navigate(fromContextMenu && targetEmployeeId ? `${basePath}?fromContextMenu=true&targetEmployeeId=${targetEmployeeId}` : basePath);
  };

  // ✅ NEW: Handle image full view toggle
  const handleImageFullView = () => {
    setIsImageFullView(true);
  };

  const handleCloseFullView = () => {
    setIsImageFullView(false);
  };

  // ✅ NEW: Handle modal close with full view reset
  const handleModalClose = () => {
    setIsImageModalOpen(false);
    setIsImageFullView(false);
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`h-48 relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-[#B7D4FF]'}`}>
        {!isReadOnly && (
          <div className="absolute top-4 right-8">
            <button
              onClick={handleEditClick}
              className={`p-2 cursor-pointer rounded transition-colors ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-600'}`}
              title="Edit Profile"
            >
              <HiPencil className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-start pt-4 px-8">
          {/* ✅ UPDATED: Image container now opens the modal */}
          <div 
            className="relative group cursor-pointer"
            onClick={() => setIsImageModalOpen(true)}
          >
            {(profileImagePreview || displayData?.employeeImage) ? (
              <img
                src={profileImagePreview || displayData.employeeImage}
                alt="Profile"
                className="w-32 h-32 rounded-full bg-white border-2 border-white shadow-lg object-cover"
              />
            ) : (
              <div className={`w-32 h-32 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-2xl font-medium ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {initials}
              </div>
            )}

            {!isReadOnly && (
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <FaCamera className="text-white text-2xl"/>
              </div>
            )}
          </div>

          {/* ... rest of the header content ... */}
          <div className={`ml-8 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <h1 className="text-3xl font-bold tracking-wide mb-4">{displayData?.displayName}</h1>
            <div className={`grid grid-cols-2 gap-x-12 gap-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex items-center space-x-2"><HiIdentification className="w-5 h-5" /><p>{displayData?.employeeId}</p></div>
              <div className="flex items-center space-x-2"><FaBuilding className="w-5 h-5" /><p>{displayData?.location}</p></div>
              <div className="flex items-center space-x-2"><MdWork className="w-5 h-5" /><p>{displayData?.jobTitlePrimary}</p></div>
              <div className="flex items-center space-x-2"><MdEmail className="w-5 h-5" /><p>{displayData?.workEmail}</p></div>
              <div className="flex items-center space-x-2"><FaPhone className="w-5 h-5" /><p>{displayData?.workNumber}</p></div>
              <div className="flex items-center space-x-2"><MdPerson className="w-5 h-5" /><p>{displayData?.jobTitleSecondary}</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <main className={`flex-1 p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Routes>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="about" element={<About />} />
            <Route path="profile" element={<Profile />} />
            <Route path="job" element={<Job />} />
            <Route path="documents" element={<Document />} />
            <Route path="achievements" element={<Achievements />} /> 
          </Routes>
        </main>

        <div className={`transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"} border-l min-h-full relative ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`absolute -left-3 top-4 border rounded-full p-1 shadow z-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-white' : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-600'}`}>
                {sidebarOpen ? <MdChevronRight /> : <MdChevronLeft />}
            </button>
            <nav className="p-4 sticky top-0">
                <div className="space-y-1">
                    {tabs.map((tab) => {
                        const isActive = location.pathname.endsWith(tab.path);
                        return (
                            <div key={tab.path} onClick={() => handleTabClick(tab.path)} className={`cursor-pointer flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? (theme === 'dark' ? "bg-blue-600 text-white" : "bg-black text-white") : (theme === 'dark' ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100")}`}>
                                <tab.icon className={`w-5 h-5 ${isActive ? "text-white" : (theme === 'dark' ? "text-gray-400" : "text-gray-500")}`} />
                                {sidebarOpen && <span className="font-medium">{tab.name}</span>}
                            </div>
                        );
                    })}
                </div>
            </nav>
        </div>
      </div>

      <AnimatePresence>
        {isImageModalOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-75 flex items-center justify-center z-[200] p-4"
                onClick={handleModalClose}
            >
                {isReadOnly ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={handleModalClose}
                            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200"
                            title="Close"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                        {(displayData?.employeeImage) ? (
                            <img 
                                src={displayData.employeeImage} 
                                alt="Profile Full View" 
                                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                            />
                        ) : (
                            <div className={`w-[500px] h-[500px] rounded-xl shadow-2xl flex items-center justify-center text-8xl font-medium ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {initials}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <>
                    {isImageFullView ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={handleCloseFullView}
                                className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200"
                                title="Back to Modal"
                            >
                                <FaCompress className="w-5 h-5" />
                            </button>

                            {(profileImagePreview || displayData?.employeeImage) ? (
                                <img 
                                    src={profileImagePreview || displayData.employeeImage} 
                                    alt="Profile Full View" 
                                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                                />
                            ) : (
                                <div className={`w-[500px] h-[500px] rounded-xl shadow-2xl flex items-center justify-center text-8xl font-medium ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {initials}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className={`relative rounded-2xl shadow-xl p-8 text-center max-w-md w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={handleModalClose} 
                                className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>

                            <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Profile Picture
                            </h3>
                            <div className="mb-6 relative group">
                                {(profileImagePreview || displayData?.employeeImage) ? (
                                    <div className="relative cursor-pointer" onClick={handleImageFullView}>
                                        <img 
                                            src={profileImagePreview || displayData.employeeImage} 
                                            alt="Profile Preview" 
                                            className="w-48 h-48 rounded-full object-cover mx-auto shadow-xl transition-transform duration-300 group-hover:scale-105" 
                                        />
                                        <div className="absolute inset-0 rounded-full bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
                                            <FaExpand className="text-white opacity-0 group-hover:opacity-100 text-2xl transition-all duration-300 transform group-hover:scale-110" />
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className={`w-48 h-48 rounded-full mx-auto shadow-xl flex items-center justify-center text-5xl font-medium cursor-pointer transition-transform duration-300 group-hover:scale-105 ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                        onClick={handleImageFullView}
                                    >
                                        {initials}
                                        <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
                                            <FaExpand className="text-white opacity-0 group-hover:opacity-100 text-2xl transition-all duration-300 transform group-hover:scale-110" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center space-x-4">
                                <button 
                                    onClick={() => fileInputRef.current.click()}
                                    className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                                >
                                    <FaCamera className="w-4 h-4" />
                                    <span>Change</span>
                                </button>
                                {displayData?.employeeImage && (
                                    <button
                                        onClick={handleDeleteImage}
                                        className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                        <span>Delete</span>
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </motion.div>
                    )}
                    </>
                )}
            </motion.div>
        )}
      </AnimatePresence>

      {isEditing && !isReadOnly && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-[200]">
          <div className={`rounded-lg p-6 w-[500px] shadow-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Profile</h2>
            <form onSubmit={handleSave}>
              <div className="space-y-4">
                {["name", "empId", "company", "department", "email", "contact", "role"].map((field) => (
                  <div key={field}>
                    <label className={`block text-sm font-medium capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{field}</label>
                    <input
                      type={field === "email" ? "email" : "text"}
                      name={field}
                      value={employeeData[field] || ''}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsEditing(false)} className={`px-4 py-2 border rounded-md transition-colors ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiles;