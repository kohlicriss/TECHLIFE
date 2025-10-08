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
    MdLocationOn,
    MdEdit,
} from "react-icons/md";
import { FaPhone, FaBuilding, FaCamera, FaTrash, FaTimes, FaExpand, FaCompress, FaChevronDown } from "react-icons/fa";
import { IoClose, IoDocumentText, IoCheckmarkCircle, IoWarning } from 'react-icons/io5';
import { publicinfoApi } from "../../../../axiosInstance";
import { motion, AnimatePresence } from "framer-motion";

const Profiles = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { empID } = useParams();
    const { userprofiledata, setUserProfileData, theme, userData,matchedArray } = useContext(Context);

    const searchParams = new URLSearchParams(location.search);
    const fromContextMenu = searchParams.get("fromContextMenu") === "true";
    const targetEmployeeId = searchParams.get("targetEmployeeId");

    const profileEmployeeId = fromContextMenu && targetEmployeeId ? targetEmployeeId : empID;
    const isOwnProfile = profileEmployeeId === empID;
    const isAdmin = userData?.roles?.[0]?.toUpperCase() === 'ADMIN';
    
    const canEditHeader = isOwnProfile || (isAdmin && !isOwnProfile);

    const [activeTab, setActiveTab] = useState(location.pathname);
    const [depdata, setDeptdata] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [employeeData, setEmployeeData] = useState({});
    const [viewedEmployeeData, setViewedEmployeeData] = useState(null);
    
    const [headerData, setHeaderData] = useState(null);
    const [viewedEmployeeHeaderData, setViewedEmployeeHeaderData] = useState(null);
    
    const [isEditingHeader, setIsEditingHeader] = useState(false);
    const [editingHeaderData, setEditingHeaderData] = useState({});

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isImageFullView, setIsImageFullView] = useState(false);
    const fileInputRef = useRef(null);

    // Department dropdown states
    const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
    const [departmentPage, setDepartmentPage] = useState(0);
    const [departmentLoading, setDepartmentLoading] = useState(false);
    const [departmentHasMore, setDepartmentHasMore] = useState(true);
    const [allDepartments, setAllDepartments] = useState([]);
    const [selectedDepartmentDisplay, setSelectedDepartmentDisplay] = useState('');
    const [selectedDepartmentValue, setSelectedDepartmentValue] = useState('');
    const departmentDropdownRef = useRef(null);

    // Define computed variables AFTER state variables
    const display = !isOwnProfile ? viewedEmployeeData : userprofiledata;
    const displayHeader = !isOwnProfile ? (viewedEmployeeHeaderData || viewedEmployeeData) : (headerData || userprofiledata);

    const initials = (displayHeader?.name || displayHeader?.displayName || display?.displayName || "  ")
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

    // Load initial departments
    useEffect(() => {
        fetchDepartments(0, true);
    }, []);

    const fetchDepartments = async (page = 0, reset = false) => {
        if (departmentLoading) return;
        
        setDepartmentLoading(true);
        try {
            const response = await publicinfoApi.get(`employee/${page}/10/departmentId/asc/all/departments`);
            console.log("Department Response:", response.data);
            
            if (reset) {
                setAllDepartments(response.data.content);
            } else {
                setAllDepartments(prev => [...prev, ...response.data.content]);
            }
            
            setDepartmentHasMore(response.data.length === 10);
            setDepartmentPage(page);
        } catch (error) {
            console.log("Error fetching departments:", error);
            setDepartmentHasMore(false);
        } finally {
            setDepartmentLoading(false);
        }
    };

    const handleDepartmentScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 5 && departmentHasMore && !departmentLoading) {
            fetchDepartments(departmentPage + 1, false);
        }
    };

    const handleDepartmentSelect = (department) => {
        setSelectedDepartmentDisplay(`${department.departmentId}(${department.departmentName})`);
        setSelectedDepartmentValue(department.departmentName);
        
        setEditingHeaderData(prev => ({
            ...prev,
            department: department.departmentName
        }));
        setDepartmentDropdownOpen(false);
    };

    // Initialize department values when editing starts
    useEffect(() => {
        if (isEditingHeader && displayHeader?.department) {
            setSelectedDepartmentValue(displayHeader.department);
            const matchingDept = allDepartments.find(dept => 
                dept.departmentName === displayHeader.department ||
                displayHeader.department.includes(dept.departmentName)
            );
            
            if (matchingDept) {
                setSelectedDepartmentDisplay(`${matchingDept.departmentId}(${matchingDept.departmentName})`);
            } else {
                setSelectedDepartmentDisplay(displayHeader.department);
            }
        }
    }, [isEditingHeader, displayHeader?.department, allDepartments]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
                setDepartmentDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!profileEmployeeId) return;
        
        const fetchEmployeeDetails = async () => {
            try {
                const response = await publicinfoApi.get(`employee/${profileEmployeeId}`);
                const headerResponse = await publicinfoApi.get(`employee/${profileEmployeeId}/header`);
                
                if (fromContextMenu && targetEmployeeId && targetEmployeeId !== empID) {
                    setViewedEmployeeData(response.data);
                    setViewedEmployeeHeaderData(headerResponse.data);
                } else {
                    setUserProfileData(response.data);
                    setEmployeeData(response.data);
                    setHeaderData(headerResponse.data);
                }
            } catch (err) {
                console.error("❌ Error fetching details:", err);
                try {
                    const response = await publicinfoApi.get(`employee/${profileEmployeeId}`);
                    if (fromContextMenu && targetEmployeeId && targetEmployeeId !== empID) {
                        setViewedEmployeeData(response.data);
                    } else {
                        setUserProfileData(response.data);
                        setEmployeeData(response.data);
                    }
                } catch (mainErr) {
                    console.error("❌ Error fetching main employee details:", mainErr);
                }
            }
        };
        
        fetchEmployeeDetails();
    }, [profileEmployeeId, setUserProfileData, fromContextMenu, targetEmployeeId, empID]);

    useEffect(() => {
        setActiveTab(location.pathname);
    }, [location.pathname]);

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
                `employee/${profileEmployeeId}/upload`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            
            if (!isOwnProfile) {
                setViewedEmployeeHeaderData(prev => ({ ...prev, employeeImage: res.data.employeeImage }));
            } else {
                setHeaderData(prev => ({ ...prev, employeeImage: res.data.employeeImage }));
            }
            
            alert("Profile picture updated!");
            setIsImageModalOpen(false);
            setIsImageFullView(false);
        } catch (err) {
            console.error("Error uploading image:", err);
            alert("Failed to upload image");
            setProfileImagePreview(null);
        }
    };

    const handleDeleteImage = async () => {
        if (!window.confirm("Confirm delete profile picture?")) return;
        try {
            await publicinfoApi.delete(`employee/${profileEmployeeId}/deleteImage`);
            
            if (!isOwnProfile) {
                setViewedEmployeeHeaderData(prev => ({ ...prev, employeeImage: null }));
            } else {
                setHeaderData(prev => ({ ...prev, employeeImage: null }));
            }
            
            setProfileImagePreview(null);
            alert("Profile picture deleted!");
            setIsImageModalOpen(false);
            setIsImageFullView(false);
        } catch (err) {
            console.error("Error deleting image:", err);
            alert("Failed to delete image");
        }
    };

    const handleEditClick = () => {
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

    const handleHeaderEditClick = () => {
        if (!canEditHeader) return;
        setEditingHeaderData(displayHeader || {});
        setIsEditingHeader(true);
    };

    const handleHeaderSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...editingHeaderData,
                department: selectedDepartmentValue || editingHeaderData.department
            };
            
            console.log("Sending payload:", payload);
            
            const res = await publicinfoApi.put(`employee/${profileEmployeeId}/header`, payload);
            if(!isOwnProfile) {
                setViewedEmployeeHeaderData(res.data);
            } else {
                setHeaderData(res.data);
            }
            setIsEditingHeader(false);
            setSelectedDepartmentDisplay('');
            setSelectedDepartmentValue('');
            alert("Header information updated successfully!");
        } catch (err) {
            console.error("❌ Error updating header:", err);
            alert("Failed to update header information");
        }
    };

    const handleHeaderInputChange = e => {
        setEditingHeaderData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
            <div className={`relative p-4 w-full max-w-md mx-auto rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-[#B7D4FF]'}`}>
                {matchedArray.includes("UPDATE_HEADER") && (
                    <button
                        onClick={handleHeaderEditClick}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
                        title="Edit Header"
                    >
                        <MdEdit className="w-4 h-4" />
                    </button>
                )}
                
                {/* Name on top */}
                <div className={`font-bold text-lg text-center mb-2 mx-auto ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
    {displayHeader?.name || display?.displayName}
</div>
                {/* Table-like layout: 3 columns without borders */}
                <div className={`grid grid-cols-3 gap-x-2 text-xs ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
    
    {/* Column 1: Profile Picture - LEFT aligned */}
   <div className="flex justify-start items-center" style={{ transform: 'translateY(-18px)' }}>
    <div onClick={() => setIsImageModalOpen(true)} className="cursor-pointer">
        {displayHeader?.employeeImage || profileImagePreview ? (
            <img
                src={profileImagePreview || displayHeader.employeeImage}
                alt="Profile"
                className="w-16 h-16 rounded-full border border-white shadow object-cover"
            />
        ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-base">
                {initials}
            </div>
        )}
    </div>
</div>

    {/* Column 2: First 3 Details - More LEFT with spacing */}
    <div className="space-y-3 -ml-2">
        <div className="flex items-center space-x-2">
            <HiIdentification className="flex-shrink-0" />
            <span className="truncate">{displayHeader?.employeeId}</span>
        </div>
        <div className="flex items-center space-x-2">
            <MdWork className="flex-shrink-0" />
            <span className="truncate">{displayHeader?.jobTitlePrimary}</span>
        </div>
        <div className="flex items-center space-x-2">
            <MdEmail className="flex-shrink-0" />
            <span className="truncate">{displayHeader?.workEmail}</span>
        </div>
    </div>

    {/* Column 3: Next 3 Details - More gap from column 2 */}
    <div className="space-y-3 pl-2">
        {displayHeader?.department && (
            <div className="flex items-center space-x-2">
                <MdBusiness className="flex-shrink-0" />
                <span className="truncate">{displayHeader.department}</span>
            </div>
        )}
        {displayHeader?.contact && (
            <div className="flex items-center space-x-2">
                <FaPhone className="flex-shrink-0" />
                <span className="truncate">{displayHeader.contact}</span>
            </div>
        )}
        {displayHeader?.location && (
            <div className="flex items-center space-x-2">
                <MdLocationOn className="flex-shrink-0" />
                <span className="truncate">{displayHeader.location}</span>
            </div>
        )}
    </div>
</div>
            </div>
            
            {/* FIXED MOBILE NAVBAR - Perfect Equal Spacing */}
            <div className={`sticky top-0 z-[1] flex w-full max-w-md mx-auto border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-black bg-[#B7D4FF]'}`}>
                {tabs.map(tab => {
                    const active = location.pathname.endsWith(tab.path);
                    return (
                        <button
                            key={tab.name}
                            onClick={() => handleTabClick(tab.path)}
                            className={`flex-1 py-2 px-1 text-xs text-center rounded transition-all duration-200 ${
                                active 
                                    ? `${theme === 'dark' ? 'text-white border-b-2 border-white' : 'text-black border-b-2 border-black'} font-semibold` 
                                    : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-black opacity-50 hover:opacity-75'}`
                            }`}
                        >
                            {tab.name}
                        </button>
                    );
                })}
            </div>
            
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
            <div className={`hidden lg:block h-48 relative ${theme === "dark" ? "bg-gray-800" : "bg-[#B7D4FF]"}`}>
                {matchedArray.includes("UPDATE_HEADER") && (
                    <div className="absolute top-4 right-8">
                        <button
                            onClick={handleHeaderEditClick}
                            className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-black hover:bg-gray-200'}`}
                            title="Edit Header Information"
                        >
                            <MdEdit className="w-5 h-5" />
                        </button>
                    </div>
                )}
                <div className="flex items-start pt-4 px-8">
                    <div className="relative group cursor-pointer" onClick={() => canEditHeader && setIsImageModalOpen(true)}>
                        {displayHeader?.employeeImage || profileImagePreview ? (
                            <img
                                src={profileImagePreview || displayHeader.employeeImage}
                                alt="Profile"
                                className="w-32 h-32 rounded-full border border-white shadow object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-6xl">
                                {initials}
                            </div>
                        )}
                        {canEditHeader && (
                            <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                <FaCamera className="text-white text-3xl" />
                            </div>
                        )}
                    </div>
                    <div className={`ml-8 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        <h1 className="text-3xl font-bold">{displayHeader?.name || display?.displayName}</h1>
                        <div className={`grid grid-cols-2 gap-x-10 gap-y-2 mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            <div className="flex items-center space-x-2"><HiIdentification /> <span>{displayHeader?.employeeId}</span></div>
                            <div className="flex items-center space-x-2"><MdWork /> <span>{displayHeader?.jobTitlePrimary}</span></div>
                            <div className="flex items-center space-x-2"><MdEmail /> <span>{displayHeader?.workEmail}</span></div>
                            {displayHeader?.department && (
                                <div className="flex items-center space-x-2"><MdBusiness /> <span>{displayHeader.department}</span></div>
                            )}
                            {displayHeader?.contact && (
                                <div className="flex items-center space-x-2"><FaPhone /> <span>{displayHeader.contact}</span></div>
                            )}
                            {displayHeader?.location && (
                                <div className="flex items-center space-x-2"><MdLocationOn /> <span>{displayHeader.location}</span></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {renderMobile()}

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

            {/* All existing modals and editing forms remain exactly the same... */}
            {isEditingHeader && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-2 sm:p-4 overflow-y-auto"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className={`w-full max-w-6xl mx-auto rounded-2xl shadow-2xl border-0 overflow-hidden ${
                            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }`}
                    >
                        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <IoDocumentText className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white">
                                        Edit Header Information
                                    </h3>
                                    <p className="mt-1 text-blue-100 text-sm sm:text-base">
                                        Update employee header details and contact information
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditingHeader(false)}
                                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 text-white"
                            >
                                <IoClose className="h-5 w-5 sm:h-6 sm:h-6" />
                            </button>
                        </div>
                        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
                            <form onSubmit={handleHeaderSave} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Employee ID
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="employeeId"
                                                value={editingHeaderData.employeeId || ''}
                                                onChange={handleHeaderInputChange}
                                                className={`w-full px-4 py-4 border-2 rounded-xl text-base font-medium transition-all duration-300 group-hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                                                    theme === 'dark'
                                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                                                }`}
                                                placeholder="Enter employee ID"
                                            />
                                        </div>
                                        <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Unique identifier for the employee
                                        </p>
                                    </div>
                                    <div className="group">
                                        <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                value={editingHeaderData.name || ''}
                                                onChange={handleHeaderInputChange}
                                                className={`w-full px-4 py-4 border-2 rounded-xl text-base font-medium transition-all duration-300 group-hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
                                                    theme === 'dark'
                                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                                                }`}
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                        <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Complete name of the employee
                                        </p>
                                    </div>
                                    <div className="group">
                                        <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Job Title
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="jobTitlePrimary"
                                                value={editingHeaderData.jobTitlePrimary || ''}
                                                onChange={handleHeaderInputChange}
                                                className={`w-full px-4 py-4 border-2 rounded-xl text-base font-medium transition-all duration-300 group-hover:border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-100 ${
                                                    theme === 'dark'
                                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                                                }`}
                                                placeholder="Enter job title"
                                            />
                                        </div>
                                        <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Primary role or position title
                                        </p>
                                    </div>
                                    <div className="group">
                                        <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Department
                                        </label>
                                        <div className="relative" ref={departmentDropdownRef}>
                                            <div 
                                                onClick={() => setDepartmentDropdownOpen(!departmentDropdownOpen)}
                                                className={`w-full px-4 py-4 border-2 rounded-xl text-base font-medium transition-all duration-300 cursor-pointer flex justify-between items-center group-hover:border-purple-300 focus:border-purple-500 ${
                                                    theme === 'dark'
                                                        ? 'bg-gray-700 border-gray-600 text-white'
                                                        : 'bg-gray-50 border-gray-300 text-gray-900'
                                                }`}
                                            >
                                                <span className={selectedDepartmentDisplay || editingHeaderData.department ? '' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>
                                                    {selectedDepartmentDisplay || editingHeaderData.department || 'Select department'}
                                                </span>
                                                <FaChevronDown className={`transition-transform duration-200 ${departmentDropdownOpen ? 'rotate-180' : ''}`} />
                                            </div>
                                            
                                            {departmentDropdownOpen && (
                                                <div className={`absolute z-50 w-full mt-2 max-h-60 overflow-y-auto rounded-xl border-2 shadow-lg ${
                                                    theme === 'dark'
                                                        ? 'bg-gray-700 border-gray-600'
                                                        : 'bg-white border-gray-300'
                                                }`}
                                                onScroll={handleDepartmentScroll}
                                                >
                                                    {allDepartments.map((department) => (
                                                        <div
                                                            key={department.departmentId}
                                                            onClick={() => handleDepartmentSelect(department)}
                                                            className={`px-4 py-3 cursor-pointer border-b hover:bg-opacity-80 transition-colors ${
                                                                theme === 'dark'
                                                                    ? 'text-white hover:bg-gray-600 border-gray-600'
                                                                    : 'text-gray-900 hover:bg-gray-100 border-gray-200'
                                                            } ${department === allDepartments[allDepartments.length - 1] ? 'border-b-0' : ''}`}
                                                        >
                                                            {department.departmentId}({department.departmentName})
                                                        </div>
                                                    ))}
                                                    {departmentLoading && (
                                                        <div className={`px-4 py-3 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            Loading more departments...
                                                        </div>
                                                    )}
                                                    {!departmentHasMore && allDepartments.length > 0 && (
                                                        <div className={`px-4 py-3 text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                                            No more departments
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Department or division name (Only department name will be saved)
                                        </p>
                                    </div>
                                    <div className="group">
                                        <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Work Email
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="workEmail"
                                                value={editingHeaderData.workEmail || ''}
                                                onChange={handleHeaderInputChange}
                                                className={`w-full px-4 py-4 border-2 rounded-xl text-base font-medium transition-all duration-300 group-hover:border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 ${
                                                    theme === 'dark'
                                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                                                }`}
                                                placeholder="Enter work email"
                                            />
                                        </div>
                                        <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Official company email address
                                        </p>
                                    </div>
                                    <div className="group">
                                        <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Contact Number
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="contact"
                                                value={editingHeaderData.contact || ''}
                                                onChange={handleHeaderInputChange}
                                                className={`w-full px-4 py-4 border-2 rounded-xl text-base font-medium transition-all duration-300 group-hover:border-teal-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-100 ${
                                                    theme === 'dark'
                                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                                                }`}
                                                placeholder="Enter contact number"
                                            />
                                        </div>
                                        <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Primary contact phone number
                                        </p>
                                    </div>
                                    <div className="group lg:col-span-2">
                                        <label className={`block text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Location
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="location"
                                                value={editingHeaderData.location || ''}
                                                onChange={handleHeaderInputChange}
                                                className={`w-full px-4 py-4 border-2 rounded-xl text-base font-medium transition-all duration-300 group-hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
                                                    theme === 'dark'
                                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                                                }`}
                                                placeholder="Enter work location"
                                            />
                                        </div>
                                        <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Office location or branch name
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditingHeader(false);
                                            setSelectedDepartmentDisplay('');
                                            setSelectedDepartmentValue('');
                                        }}
                                        className={`w-full sm:w-auto px-8 py-3 border-2 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 ${
                                            theme === 'dark'
                                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                        }`}
                                    >
                                        Cancel Changes
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl text-base transition-all duration-300 transform hover:scale-105 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 shadow-lg"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <AnimatePresence>
                {isImageModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-75 flex items-center justify-center z-[200] p-2 sm:p-4"
                        onClick={handleModalClose}
                    >
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
                                {(profileImagePreview || displayHeader?.employeeImage) ? (
                                    <img
                                        src={profileImagePreview || displayHeader.employeeImage}
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
                                    {(profileImagePreview || displayHeader?.employeeImage) ? (
                                        <div className="relative cursor-pointer" onClick={handleImageFullView}>
                                            <img
                                                src={profileImagePreview || displayHeader.employeeImage}
                                                alt="Profile Preview"
                                                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover mx-auto shadow-xl transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 rounded-full bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
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
                                    {displayHeader?.employeeImage && (
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
                    </motion.div>
                )}
            </AnimatePresence>

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
