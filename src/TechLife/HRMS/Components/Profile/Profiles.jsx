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
import { FaPhone, FaBuilding, FaCamera, FaTrash, FaTimes, FaExpand, FaCompress } from "react-icons/fa";
import { publicinfoApi } from "../../../../axiosInstance";
import { motion, AnimatePresence } from "framer-motion";

const Profiles = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { empID } = useParams();
  const { userprofiledata, setUserProfileData, theme } = useContext(Context);

  const searchParams = new URLSearchParams(location.search);
  const fromContextMenu = searchParams.get("fromContextMenu") === "true";
  const targetEmployeeId = searchParams.get("targetEmployeeId");

  const profileEmployeeId = fromContextMenu && targetEmployeeId ? targetEmployeeId : empID;
  const isReadOnly = fromContextMenu && targetEmployeeId && targetEmployeeId !== empID;

  const [activeTab, setActiveTab] = useState(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [employeeData, setEmployeeData] = useState({});
  const [viewedEmployeeData, setViewedEmployeeData] = useState(null);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isImageFullView, setIsImageFullView] = useState(false);
  const fileInputRef = useRef(null);

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
        console.error("❌ Error fetching details:", err);
      }
    };
    fetchEmployeeDetails();
  }, [profileEmployeeId, setUserProfileData, fromContextMenu, targetEmployeeId, empID]);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const display = isReadOnly ? viewedEmployeeData : userprofiledata;

  const initials = (display?.displayName || "  ")
    .split(" ")
    .map(w => w[0])
    .join("")
    .substring(0, 2);

  const tabs = [
    { name: "About", path: "about", icon: MdPerson },
    { name: "Profile", path: "profile", icon: HiIdentification },
    { name: "Job", path: "job", icon: MdWork },
    { name: "Documents", path: "documents", icon: MdBusiness },
    { name: "Achievements", path: "achievements", icon: MdStar },
  ];

  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(reader.result);
    reader.readAsDataURL(file);
    
    const formData = new FormData();
    formData.append("employeeImage", file);

    try {
      const res = await publicinfoApi.post(
        `/employee/${profileEmployeeId}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setUserProfileData(res.data);
      if (res.data.employeeImage) {
        localStorage.setItem("loggedUserImage", res.data.employeeImage);
      }
      alert("Profile picture updated!");
      setIsImageModalOpen(false);
      setIsImageFullView(false);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
      setProfileImagePreview(null);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm("Confirm delete profile picture?")) return;
    try {
      await publicinfoApi.delete(`/employee/${profileEmployeeId}/deleteImage`);
      setUserProfileData({ ...userprofiledata, employeeImage: null });
      localStorage.removeItem("loggedUserImage");
      setProfileImagePreview(null);
      alert("Profile picture deleted!");
      setIsImageModalOpen(false);
      setIsImageFullView(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete image");
    }
  };

  const handleEditClick = () => {
    if (isReadOnly) return;
    setEmployeeData(display);
    setIsEditing(true);
  };

  const handleSave = e => {
    e.preventDefault();
    setIsEditing(false);
  };

  const handleInputChange = e => {
    setEmployeeData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTabClick = path => {
    const base = `/profile/${empID}/${path}`;
    navigate(fromContextMenu && targetEmployeeId ? `${base}?fromContextMenu=true&targetEmployeeId=${targetEmployeeId}` : base);
  };

  const handleImageFullView = () => {
    setIsImageFullView(true);
  };

  const handleCloseFullView = () => {
    setIsImageFullView(false);
  };

  const handleModalClose = () => {
    setIsImageModalOpen(false);
    setIsImageFullView(false);
  };

  const renderMobile = () => (
    <div className="lg:hidden">
      {/* Card with edit button */}
      <div className={`relative p-4 w-full max-w-md mx-auto rounded-xl bg-[#B7D4FF] flex items-center space-x-4`}>
        {/* {!isReadOnly && (
          <button
            onClick={handleEditClick}
            className="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/90 dark:text-white rounded p-1 z-10"
            aria-label="Edit Profile"
          >
            <HiPencil className="w-5 h-5" />
          </button>
        )} */}
        <div onClick={() => setIsImageModalOpen(true)} className="cursor-pointer">
          {display?.employeeImage || profileImagePreview ? (
            <img
              src={profileImagePreview || display.employeeImage}
              alt="Profile"
              className="w-16 h-16 rounded-full border border-white shadow object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xl">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 grid grid-cols-2 text-xs gap-y-1 text-black">
          <div>
            <div className="font-semibold">{display?.employeeId}</div>
            <div className="font-semibold">{display?.jobTitlePrimary}</div>
          </div>
          <div>
            <div>{display?.jobTitleSecondary}</div>
            <div>{display?.workEmail}</div>
          </div>
        </div>
      </div>
      
      {/* Horizontal Tabs - Made Sticky with Equal Spacing */}
      <div className="sticky top-0 z-[1] grid grid-cols-5 gap-1 w-full max-w-md mx-auto border-t border-black bg-[#B7D4FF] px-1">
        {tabs.map(tab => {
          const active = location.pathname.endsWith(tab.path);
          return (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab.path)}
              className={`py-2 px-1 text-xs text-center rounded ${
                active ? "text-black border-b-2 border-black font-semibold" : "text-black opacity-50"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>
      
      {/* Tab Content */}
      <div className="max-w-md mx-auto p-3">
        <Routes>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="about" element={<About />} />
          <Route path="profile" element={<Profile />} />
          <Route path="job" element={<Job />} />
          <Route path="documents" element={<Document />} />
          <Route path="achievements" element={<Achievements />} />
        </Routes>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Desktop header */}
      <div className={`hidden lg:block h-48 relative ${theme === "dark" ? "bg-gray-800" : "bg-[#B7D4FF]"}`}>
        {!isReadOnly && (
          <div className="absolute top-4 right-8">
            <button
              onClick={handleEditClick}
              className={`p-2 cursor-pointer rounded transition-colors ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-white hover:bg-gray-100 text-gray-600"}`}
              title="Edit Profile"
            >
              <HiPencil className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-start pt-4 px-8">
          <div className="relative group cursor-pointer" onClick={() => setIsImageModalOpen(true)}>
            {display?.employeeImage || profileImagePreview ? (
              <img 
                src={profileImagePreview || display.employeeImage} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border border-white shadow object-cover" 
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-6xl">
                {initials}
              </div>
            )}
            {!isReadOnly && (
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                <FaCamera className="text-white text-3xl" />
              </div>
            )}
          </div>
          <div className={`ml-8 text-black`}>
            <h1 className="text-3xl font-bold">{display?.displayName}</h1>
            <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-black">
              <div>{display?.employeeId}<br />{display?.jobTitlePrimary}</div>
              <div>{display?.jobTitleSecondary}<br />{display?.workEmail}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header and tabs */}
      {renderMobile()}

      {/* Desktop content and sidebar */}
      <div className="hidden lg:flex flex-1">
        <main className={`flex-1 p-6 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
          <Routes>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="about" element={<About />} />
            <Route path="profile" element={<Profile />} />
            <Route path="job" element={<Job />} />
            <Route path="documents" element={<Document />} />
            <Route path="achievements" element={<Achievements />} />
          </Routes>
        </main>
        <div className={`transition-all ${sidebarOpen ? "w-64" : "w-20"} border-l ${theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`absolute -left-3 top-4 rounded-full border p-1 shadow z-10 ${theme === "dark" ? "bg-gray-800 border-gray-600 hover:bg-gray-700 text-white" : "bg-white border-gray-300 hover:bg-gray-100 text-gray-600"}`}
          >
            {sidebarOpen ? <MdChevronRight /> : <MdChevronLeft />}
          </button>
          <nav className="p-4 sticky top-0">
            {tabs.map(tab => {
              const active = location.pathname.endsWith(tab.path);
              return (
                <div key={tab.path} onClick={() => handleTabClick(tab.path)} className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer ${active ? (theme === "dark" ? "bg-blue-600 text-white" : "bg-black text-white") : (theme === "dark" ? "text-gray-300 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100")}`}>
                  <tab.icon className={`w-5 h-5 ${active ? "text-white" : (theme === "dark" ? "text-gray-400" : "text-gray-500")}`} />
                  {sidebarOpen && <span>{tab.name}</span>}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-75 flex items-center justify-center z-[200] p-2 sm:p-4"
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
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 sm:p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200"
                  title="Close"
                >
                  <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {(display?.employeeImage) ? (
                  <img 
                    src={display.employeeImage} 
                    alt="Profile Full View" 
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                  />
                ) : (
                  <div className={`w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-xl shadow-2xl flex items-center justify-center text-6xl sm:text-8xl font-medium ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
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
                      className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 sm:p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-200"
                      title="Back to Modal"
                    >
                      <FaCompress className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    {(profileImagePreview || display?.employeeImage) ? (
                      <img 
                        src={profileImagePreview || display.employeeImage} 
                        alt="Profile Full View" 
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                      />
                    ) : (
                      <div className={`w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-xl shadow-2xl flex items-center justify-center text-6xl sm:text-8xl font-medium ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {initials}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className={`relative rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 text-center w-full max-w-sm sm:max-w-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={handleModalClose} 
                      className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full transition-all duration-200 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
                    >
                      <FaTimes className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    
                    <h3 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Profile Picture
                    </h3>
                    
                    <div className="mb-4 sm:mb-6 relative group">
                      {(profileImagePreview || display?.employeeImage) ? (
                        <div className="relative cursor-pointer" onClick={handleImageFullView}>
                          <img 
                            src={profileImagePreview || display.employeeImage} 
                            alt="Profile Preview" 
                            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover mx-auto shadow-xl transition-transform duration-300 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 rounded-full  bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
                            <FaExpand className="text-white opacity-0 group-hover:opacity-100 text-lg sm:text-2xl transition-all duration-300 transform group-hover:scale-110" />
                          </div>
                        </div>
                      ) : (
                        <div 
                          className={`w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full mx-auto shadow-xl flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-medium cursor-pointer transition-transform duration-300 group-hover:scale-105 relative ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                          onClick={handleImageFullView}
                        >
                          {initials}
                          <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
                            <FaExpand className="text-white opacity-0 group-hover:opacity-100 text-lg sm:text-2xl transition-all duration-300 transform group-hover:scale-110" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                      <button 
                        onClick={() => fileInputRef.current.click()}
                        className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                      >
                        <FaCamera className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Change</span>
                      </button>
                      {display?.employeeImage && (
                        <button
                          onClick={handleDeleteImage}
                          className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                        >
                          <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
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

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className={`rounded-lg p-4 sm:p-6 w-full max-w-md sm:max-w-lg shadow-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl sm:text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Profile</h2>
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
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 text-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className={`w-full sm:w-auto px-4 py-2 border rounded-md transition-colors text-sm ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
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
