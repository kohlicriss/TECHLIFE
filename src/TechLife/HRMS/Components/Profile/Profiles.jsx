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
import { FaPhone, FaBuilding, FaCamera, FaTrash, FaTimes } from "react-icons/fa";
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

  const renderMobile = () => (
    <div className="lg:hidden">
      {/* Card with edit button */}
      <div className={`relative p-4 w-full max-w-md mx-auto rounded-xl bg-[#B7D4FF] flex items-center space-x-4`}>
        {!isReadOnly && (
          <button
            onClick={handleEditClick}
            className="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/90 dark:text-white rounded p-1 z-10"
            aria-label="Edit Profile"
          >
            <HiPencil className="w-5 h-5" />
          </button>
        )}
        <div>
          {display?.employeeImage || profileImagePreview ? (
            <img
              src={profileImagePreview || display.employeeImage}
              alt="Profile"
              className="w-16 h-16 rounded-full border border-white shadow"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xl">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 grid grid-cols-2 text-xs gap-y-1 text-black">
          <div>
            <div>number</div>
            <div className="font-semibold">{display?.employeeId}</div>
            <div className="font-semibold">{display?.jobTitlePrimary}</div>
          </div>
          <div>
            <div>number</div>
            <div>{display?.jobTitleSecondary}</div>
            <div>{display?.workEmail}</div>
          </div>
        </div>
      </div>
      {/* Horizontal Tabs - Made Sticky */}
      <div className="sticky top-0 z-50 flex w-full max-w-md mx-auto border-t border-black mt-2 bg-[#B7D4FF] overflow-x-auto">
        {tabs.map(tab => {
          const active = location.pathname.endsWith(tab.path);
          return (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab.path)}
              className={`flex-1 min-w-[90px] py-2 text-sm ${
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
              <img src={profileImagePreview || display.employeeImage} alt="Profile" className="w-32 h-32 rounded-full border border-white shadow object-cover" />
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
              <div><strong>number</strong><br />{display?.employeeId}<br />{display?.jobTitlePrimary}</div>
              <div><strong>number</strong><br />{display?.jobTitleSecondary}<br />{display?.workEmail}</div>
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
      {/* Modals and editing UI omitted for brevity */}
      <AnimatePresence>
        {isImageModalOpen && null}
      </AnimatePresence>
      {isEditing && null}
    </div>
  );
};

export default Profiles;
