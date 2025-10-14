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
import { FaPhone, FaBuilding, FaCamera, FaTrash, FaTimes, FaExpand, FaCompress, FaChevronDown, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { IoClose, IoDocumentText, IoCheckmarkCircle, IoWarning, IoAdd, IoTrash, IoPencil } from 'react-icons/io5';
import { publicinfoApi } from "../../../../axiosInstance";
import { motion, AnimatePresence } from "framer-motion";

// =================================================================
// 🚨 MODIFIED CustomNotification Component for Right Bottom Swipe-Out (1.5s)
// =================================================================
const CustomNotification = ({ isOpen, onClose, type, title, message, theme }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (isOpen) {
            // Show the notification instantly
            setIsVisible(true); 
            // Set a timer to start closing after 1.5 seconds for auto-closing types
            if (type === 'success' || type === 'error') {
                const timer = setTimeout(() => {
                    handleClose();
                }, 1500); // **1.5 seconds**
                return () => clearTimeout(timer);
            }
            // For 'info' type, it stays open until manually closed
        } else {
            // Reset visibility when isOpen is false
            setIsVisible(false);
        }
    }, [isOpen, type, onClose]);
    // Function to start the closing animation
    const handleClose = () => {
        setIsVisible(false);
        // Wait for CSS transition (300ms) before calling parent's onClose
        setTimeout(() => onClose(), 300); 
    };
    if (!isOpen) return null;
    const getIcon = () => {
        switch (type) {
            case 'success': return <FaCheckCircle className="w-6 h-6 text-green-500" />;
            case 'error': return <FaExclamationTriangle className="w-6 h-6 text-red-500" />;
            case 'info': return <IoWarning className="w-6 h-6 text-blue-500" />;
            default: return null;
        }
    };
    const getTitleClass = () => {
        switch (type) {
            case 'success': return 'text-green-600 dark:text-green-400';
            case 'error': return 'text-red-600 dark:text-red-400';
            case 'info': return 'text-blue-600 dark:text-blue-400';
            default: return theme === 'dark' ? 'text-white' : 'text-gray-800';
        }
    };
    return (
        // 🚨 POSITION MODIFIED: fixed bottom-4 right-4 for right-bottom position
        // 🚨 TRANSITION MODIFIED: Using transform/opacity for swipe effect
        <div className={`fixed bottom-4 right-4 z-[300] transition-all duration-300 ease-in-out
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
            <div className={`p-4 rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm m-4 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center">
                    {getIcon()}
                    <div className="ml-3 flex-1">
                        <h3 className={`text-md font-bold ${getTitleClass()}`}>{title}</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
                    </div>
                    {/* Allow manual close for all types, in case user swipes before 1.5s */}
                    <button onClick={handleClose} className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <IoClose size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Custom Confirmation Modal Component (Unchanged)
const CustomConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isConfirming, theme, type = 'warning' }) => {
    if (!isOpen) return null;
    const getIcon = () => {
        switch (type) {
            case 'danger': return <FaExclamationTriangle className="w-6 h-6 text-red-500" />;
            case 'warning': return <IoWarning className="w-6 h-6 text-yellow-500" />;
            case 'info': return <IoWarning className="w-6 h-6 text-blue-500" />;
            default: return <IoWarning className="w-6 h-6 text-yellow-500" />;
        }
    };
    const getConfirmButtonClass = () => {
        switch (type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700';
            case 'warning': return 'bg-yellow-600 hover:bg-yellow-700';
            case 'info': return 'bg-blue-600 hover:bg-blue-700';
            default: return 'bg-yellow-600 hover:bg-yellow-700';
        }
    };
    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] transition-opacity duration-300`}>
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className={`p-6 rounded-3xl shadow-2xl w-full max-w-md m-4 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center mb-4">
                    {getIcon()}
                    <h3 className={`text-xl font-bold ml-3 ${type === 'danger' ? 'text-red-600' : 'text-yellow-600'} dark:text-white`}>{title}</h3>
                    <button onClick={onClose} className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <FaTimes size={20} />
                    </button>
                </div>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                        disabled={isConfirming}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isConfirming}
                        className={`px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center ${getConfirmButtonClass()} ${isConfirming ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {isConfirming ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
// =================================================================

const Profiles = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { empID } = useParams();
    const { userprofiledata, setUserProfileData, theme, userData, matchedArray } = useContext(Context);
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
    
    // --- Custom Notification/Modal States ---
    const [notification, setNotification] = useState({
        isOpen: false,
        type: '',
        title: '',
        message: ''
    });
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        onConfirm: null,
        type: 'warning',
        isConfirming: false
    });
    
    const showNotification = (type, title, message) => {
        setNotification({ isOpen: true, type, title, message });
    };
    const closeNotification = () => {
        setNotification({ isOpen: false, type: '', title: '', message: '' });
    };
    const showConfirmModal = (title, message, confirmText, onConfirm, type = 'warning') => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            confirmText,
            onConfirm,
            type,
            isConfirming: false
        });
    };
    const closeConfirmModal = () => {
        setConfirmModal({
            isOpen: false,
            title: '',
            message: '',
            confirmText: '',
            onConfirm: null,
            type: 'warning',
            isConfirming: false
        });
    };
    // ----------------------------------------
    
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
            showNotification('success', 'Success', 'Profile picture updated successfully!');
            setIsImageModalOpen(false);
            setIsImageFullView(false);
        } catch (err) {
            console.error("Error uploading image:", err);
            showNotification('error', 'Error', 'Failed to upload image. Please try again.');
            setProfileImagePreview(null);
        }
    };

    const handleDeleteImage = () => {
        showConfirmModal(
            'Confirm Delete',
            'Are you sure you want to delete the profile picture? This action cannot be undone.',
            'Delete',
            async () => {
                setConfirmModal(prev => ({ ...prev, isConfirming: true }));
                try {
                    await publicinfoApi.delete(`employee/${profileEmployeeId}/deleteImage`);
                    if (!isOwnProfile) {
                        setViewedEmployeeHeaderData(prev => ({ ...prev, employeeImage: null }));
                    } else {
                        setHeaderData(prev => ({ ...prev, employeeImage: null }));
                    }
                    setProfileImagePreview(null);
                    closeConfirmModal();
                    showNotification('success', 'Success', 'Profile picture deleted successfully!');
                    setIsImageModalOpen(false);
                    setIsImageFullView(false);
                } catch (err) {
                    console.error("Error deleting image:", err);
                    closeConfirmModal();
                    showNotification('error', 'Error', 'Failed to delete image. Please try again.');
                }
            },
            'danger'
        );
    };

    const handleEditClick = () => {
        setEmployeeData(display);
        setIsEditing(true);
    };

    const handleSave = e => {
        e.preventDefault();
        // Assuming this will eventually call an API and show a notification
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
            // ✅ PRESERVE existing employeeImage when updating
            if (!isOwnProfile) {
                setViewedEmployeeHeaderData(prev => ({
                    ...res.data,
                    employeeImage: prev?.employeeImage || res.data.employeeImage
                }));
            } else {
                setHeaderData(prev => ({
                    ...res.data,
                    employeeImage: prev?.employeeImage || res.data.employeeImage
                }));
            }
            setIsEditingHeader(false);
            setSelectedDepartmentDisplay('');
            setSelectedDepartmentValue('');
            showNotification('success', 'Success', 'Header information updated successfully!');
        } catch (err) {
            console.error("❌ Error updating header:", err);
            showNotification('error', 'Error', 'Failed to update header information. Please check the details and try again.');
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

    // Add new address function
    const handleAddAddress = () => {
        // Implementation for adding new address
        showNotification('info', 'Info', 'Add address functionality would be implemented here');
    };

    // Delete address function
    const handleDeleteAddress = (addressId) => {
        showConfirmModal(
            'Confirm Delete',
            'Are you sure you want to delete this address?',
            'Delete',
            () => {
                // Implementation for deleting address
                showNotification('success', 'Success', 'Address deleted successfully!');
            },
            'danger'
        );
    };

    // Add new job function
    const handleAddJob = () => {
        // Implementation for adding new job
        showNotification('info', 'Info', 'Add job functionality would be implemented here');
    };

    // Delete job function
    const handleDeleteJob = (jobId) => {
        showConfirmModal(
            'Confirm Delete',
            'Are you sure you want to delete this job record?',
            'Delete',
            () => {
                // Implementation for deleting job
                showNotification('success', 'Success', 'Job record deleted successfully!');
            },
            'danger'
        );
    };

    // Add new document function
    const handleAddDocument = () => {
        // Implementation for adding new document
        showNotification('info', 'Info', 'Add document functionality would be implemented here');
    };

    // Delete document function
    const handleDeleteDocument = (documentId) => {
        showConfirmModal(
            'Confirm Delete',
            'Are you sure you want to delete this document?',
            'Delete',
            () => {
                // Implementation for deleting document
                showNotification('success', 'Success', 'Document deleted successfully!');
            },
            'danger'
        );
    };

    // Add new achievement function
    const handleAddAchievement = () => {
        // Implementation for adding new achievement
        showNotification('info', 'Info', 'Add achievement functionality would be implemented here');
    };

    // Delete achievement function
    const handleDeleteAchievement = (achievementId) => {
        showConfirmModal(
            'Confirm Delete',
            'Are you sure you want to delete this achievement?',
            'Delete',
            () => {
                // Implementation for deleting achievement
                showNotification('success', 'Success', 'Achievement deleted successfully!');
            },
            'danger'
        );
    };

    const renderMobile = () => (
        <div className="md:hidden">
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
            <div className={`hidden md:block h-auto md:h-48 relative ${theme === "dark" ? "bg-gray-800" : "bg-[#B7D4FF]"}`}>
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
                                className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-white shadow object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-5xl md:text-6xl">
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
                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 mt-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
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
            <div className="hidden md:flex flex-1">
                <main className={`flex-1 p-6 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
                    <Routes>
                        <Route index element={<Navigate to="profile" replace />} />
                        <Route path="about" element={
                            <div className="relative">
                                {matchedArray.includes("CREATE_ADDRESS") && (
                                    <button
                                        onClick={handleAddAddress}
                                        className="absolute top-0 right-10 p-2 rounded-full transition-colors"
                                        title="Add Address"
                                    >
                                        <IoAdd className="w-5 h-5" />
                                    </button>
                                )}
                                {matchedArray.includes("DELETE_ADDRESS") && (
                                    <button
                                        onClick={() => handleDeleteAddress(1)}
                                        className="absolute top-0 right-0 p-2 rounded-full transition-colors"
                                        title="Delete Address"
                                    >
                                        <IoTrash className="w-5 h-5" />
                                    </button>
                                )}
                                <About />
                            </div>
                        } />
                        <Route path="profile" element={
                            <div className="relative">
                                {matchedArray.includes("CREATE_PROFILE") && (
                                    <button
                                        onClick={handleEditClick}
                                        className="absolute top-0 right-0 p-2 rounded-full transition-colors"
                                        title="Edit Profile"
                                    >
                                        <IoPencil className="w-5 h-5" />
                                    </button>
                                )}
                                <Profile />
                            </div>
                        } />
                        <Route path="job" element={
                            <div className="relative">
                                {matchedArray.includes("CREATE_JOB") && (
                                    <button
                                        onClick={handleAddJob}
                                        className="absolute top-0 right-10 p-2 rounded-full transition-colors"
                                        title="Add Job"
                                    >
                                        <IoAdd className="w-5 h-5" />
                                    </button>
                                )}
                                {matchedArray.includes("DELETE_JOB") && (
                                    <button
                                        onClick={() => handleDeleteJob(1)}
                                        className="absolute top-0 right-0 p-2 rounded-full transition-colors"
                                        title="Delete Job"
                                    >
                                        <IoTrash className="w-5 h-5" />
                                    </button>
                                )}
                                <Job />
                            </div>
                        } />
                        <Route path="documents" element={
                            <div className="relative">
                                {matchedArray.includes("CREATE_DOCUMENT") && (
                                    <button
                                        onClick={handleAddDocument}
                                        className="absolute top-0 right-10 p-2 rounded-full transition-colors"
                                        title="Add Document"
                                    >
                                        <IoAdd className="w-5 h-5" />
                                    </button>
                                )}
                                {matchedArray.includes("DELETE_DOCUMENT") && (
                                    <button
                                        onClick={() => handleDeleteDocument(1)}
                                        className="absolute top-0 right-0 p-2 rounded-full transition-colors"
                                        title="Delete Document"
                                    >
                                        <IoTrash className="w-5 h-5" />
                                    </button>
                                )}
                                <Document />
                            </div>
                        } />
                        <Route path="achievements" element={
                            <div className="relative">
                                {matchedArray.includes("CREATE_ACHIEVEMENT") && (
                                    <button
                                        onClick={handleAddAchievement}
                                        className="absolute top-0 right-10 p-2 rounded-full transition-colors"
                                        title="Add Achievement"
                                    >
                                        <IoAdd className="w-5 h-5" />
                                    </button>
                                )}
                                {matchedArray.includes("DELETE_ACHIEVEMENT") && (
                                    <button
                                        onClick={() => handleDeleteAchievement(1)}
                                        className="absolute top-0 right-0 p-2 rounded-full transition-colors"
                                        title="Delete Achievement"
                                    >
                                        <IoTrash className="w-5 h-5" />
                                    </button>
                                )}
                                <Achievements />
                            </div>
                        } />
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
    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-2 sm:p-4"
>
    <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className={`w-full max-w-6xl mx-auto rounded-2xl shadow-2xl border-0 overflow-hidden flex flex-col ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
    >
        {/* Fixed Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8 flex-shrink-0">
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
        
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
            <div className="p-6 sm:p-8">
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
                </form>
            </div>
        </div>
        
        {/* Fixed Footer */}
        <div className="p-6 sm:p-8 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
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
                    onClick={handleHeaderSave}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl text-base transition-all duration-300 transform hover:scale-105 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 shadow-lg"
                >
                    Save Changes
                </button>
            </div>
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
                                    {matchedArray.includes("CREATE_IMAGE") && <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                                    >
                                        <FaCamera className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span>Change</span>
                                    </button>}
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
            {/* Editing modal (kept as is, no alerts here) */}
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
            {/* Custom Notification Component (Modified) */}
            <CustomNotification
                isOpen={notification.isOpen}
                onClose={closeNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                theme={theme}
            />
            {/* Custom Confirmation Modal */}
            <CustomConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isConfirming={confirmModal.isConfirming}
                theme={theme}
                type={confirmModal.type}
            />
        </div>
    );
};

export default Profiles;