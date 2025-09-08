import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Context } from "../HrmsContext";
import { publicinfoApi } from "../../../../axiosInstance";
import {
    IoSearchOutline,
    IoMailOutline,
    IoLocationOutline,
    IoBriefcaseOutline,
    IoPersonOutline,
    IoBusinessOutline,
    IoFilterOutline,
    IoChatbubbleOutline,
    IoChevronDownOutline,
    IoGridOutline,
    IoListOutline,
    IoRefreshOutline,
    IoDocumentsOutline,
    IoInformationCircleOutline
} from "react-icons/io5";


const generateInitials = (name) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    if (nameParts.length > 1) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
};


function EmployeeApp() {
    const navigate = useNavigate();
    const [employeeData, setEmployeeData] = useState(null);
    const [dynamicFilters, setDynamicFilters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const { userprofiledata, theme, userData } = useContext(Context);
    console.log(userData)
    const { empID } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilters, setSelectedFilters] = useState({});
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        employee: null,
    });


    // ✅ Get the user's role from userData and check if they have management access
    const userRole = userData?.roles?.[0]?.toUpperCase();
    const hasManagementAccess = ["ADMIN", "MANAGER", "HR"].includes(userRole);


    useEffect(() => {
        const handleOutsideClick = () => {
            if (contextMenu.visible) {
                setContextMenu({ ...contextMenu, visible: false });
            }
        };
        window.addEventListener("click", handleOutsideClick);
        return () => {
            window.removeEventListener("click", handleOutsideClick);
        };
    }, [contextMenu]);


    const handleContextMenu = (e, employee) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            employee: employee,
        });
    };


    const handleChatClick = () => {
        if (contextMenu.employee) {
            alert(`Starting a chat with ${contextMenu.employee.displayName || contextMenu.employee.name}...`);
            navigate(`/chat/${contextMenu.employee.employeeId}`);
        }
        setContextMenu({ ...contextMenu, visible: false });
    };


    // ✅ UPDATED: Changed to match the documents pattern
    const handleViewProfileClick = () => {
        if (contextMenu.employee) {
            navigate(`/profile/${empID}/profile?fromContextMenu=true&targetEmployeeId=${contextMenu.employee.employeeId}`);
        }
        setContextMenu({ ...contextMenu, visible: false });
    };


    const handleDocumentsClick = () => {
        if (contextMenu.employee) {
            navigate(`/profile/${empID}/documents?fromContextMenu=true&targetEmployeeId=${contextMenu.employee.employeeId}`);
        }
        setContextMenu({ ...contextMenu, visible: false });
    };


    const handleAboutClick = () => {
        if (contextMenu.employee) {
            alert(`Viewing about details for ${contextMenu.employee.displayName || contextMenu.employee.name}...`);
        }
        setContextMenu({ ...contextMenu, visible: false });
    };


    useEffect(() => {
        const fetchAllEmployees = async () => {
            try {
                setLoading(true);
                const response = await publicinfoApi.get(
                    `employee/0/15/employeeId/asc/employees`
                );
                console.log("Employees Data from API:", response.data);
                setEmployeeData(response.data);
            } catch (err) {
                console.error("Error fetching employees:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllEmployees();
    }, []);


    useEffect(() => {
        if (employeeData) {
            const roles = [...new Set(employeeData.map(e => e.jobTitlePrimary).filter(Boolean))];
            const departments = [...new Set(employeeData.map(e => e.departmentId).filter(Boolean))];
            const locations = [...new Set(employeeData.map(e => e.location).filter(Boolean))];
            const newFilters = [
                { name: "Role", options: ["All Roles", ...roles], icon: IoBriefcaseOutline },
                { name: "Department", options: ["All Departments", ...departments], icon: IoBusinessOutline },
                { name: "Location", options: ["All Locations", ...locations], icon: IoLocationOutline },
            ];
            setDynamicFilters(newFilters);
            const initialFilters = newFilters.reduce(
                (acc, filter) => ({ ...acc, [filter.name]: filter.options[0] }),
                {}
            );
            setSelectedFilters(initialFilters);
        }
    }, [employeeData]);


    const filteredEmployees = employeeData
        ? employeeData.filter((employee) => {
            const matchesSearch =
                (employee.displayName && employee.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (employee.workEmail && employee.workEmail.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesFilters = Object.entries(selectedFilters).every(
                ([filterName, value]) => {
                    if (!value || value.startsWith("All")) return true;
                    switch (filterName) {
                        case "Role":
                            return employee.jobTitlePrimary === value;
                        case "Department":
                            return employee.departmentId === value;
                        case "Location":
                            return employee.location === value;
                        default:
                            return true;
                    }
                }
            );
            return matchesSearch && matchesFilters;
        })
        : [];


    const clearFilters = () => {
        setSearchTerm("");
        const clearedFilters = dynamicFilters.reduce(
            (acc, filter) => ({ ...acc, [filter.name]: filter.options[0] }),
            {}
        );
        setSelectedFilters(clearedFilters);
    };


    if (loading) {
        return (
            <div className={`min-h-screen ${
                theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
                }`}>
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
                            }`}>Loading Employee Directory</h2>
                        <p className={`${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>Discovering your colleagues...</p>
                        <div className="flex justify-center space-x-2 mt-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`}
                                    style={{ animationDelay: `${i * 0.2}s` }}></div>
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
            <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`rounded-2xl p-8 shadow-lg border mb-12 ${
                        theme === 'dark'
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                        }`}
                >
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <IoSearchOutline className={`h-6 w-6 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                    }`} />
                            </div>
                            <input
                                type="text"
                                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-300 placeholder-gray-500 ${
                                    theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500 group-hover:border-blue-400'
                                        : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300 group-hover:border-blue-300'
                                    }`}
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>


                        <div className="flex flex-wrap gap-4">
                            {dynamicFilters.map((filter) => {
                                const IconComponent = filter.icon;
                                return (
                                    <div key={filter.name} className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <IconComponent className={`h-5 w-5 ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <select
                                            className={`pl-12 pr-10 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-300 appearance-none cursor-pointer min-w-[180px] ${
                                                theme === 'dark'
                                                    ? 'bg-gray-700 border-gray-600 text-white hover:border-gray-500 group-hover:border-blue-400'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 group-hover:border-blue-300'
                                                }`}
                                            value={selectedFilters[filter.name] || ""}
                                            onChange={(e) =>
                                                setSelectedFilters({
                                                    ...selectedFilters,
                                                    [filter.name]: e.target.value,
                                                })
                                            }
                                        >
                                            {filter.options.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <IoChevronDownOutline className={`h-5 w-5 ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                                }`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>


                        <div className="flex gap-3">
                            <button
                                onClick={clearFilters}
                                className={`flex items-center space-x-2 px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                                    theme === 'dark'
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                                    }`}
                            >
                                <IoRefreshOutline className="w-5 h-5" />
                                <span>Clear</span>
                            </button>


                            <div className={`flex rounded-xl p-1 ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                }`}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-3 rounded-lg transition-all duration-200 ${
                                        viewMode === 'grid'
                                            ? theme === 'dark'
                                                ? 'bg-gray-600 text-blue-400 shadow-sm'
                                                : 'bg-white text-blue-600 shadow-sm'
                                            : theme === 'dark'
                                                ? 'text-gray-400 hover:text-gray-200'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <IoGridOutline className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-3 rounded-lg transition-all duration-200 ${
                                        viewMode === 'list'
                                            ? theme === 'dark'
                                                ? 'bg-gray-600 text-blue-400 shadow-sm'
                                                : 'bg-white text-blue-600 shadow-sm'
                                            : theme === 'dark'
                                                ? 'text-gray-400 hover:text-gray-200'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <IoListOutline className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>


                <div className="flex items-center justify-between mb-8">
                    <h3 className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                        {filteredEmployees.length} Employee{filteredEmployees.length !== 1 ? 's' : ''} Found
                    </h3>
                </div>


                {filteredEmployees.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className={
                            viewMode === 'grid'
                                ? "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                : "space-y-4"
                        }
                    >
                        <AnimatePresence>
                            {filteredEmployees.map((employee, index) => (
                                <motion.div
                                    key={employee.employeeId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border cursor-pointer overflow-hidden group ${
                                        theme === 'dark'
                                            ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                        } ${viewMode === 'list' ? 'flex items-center p-6' : 'p-6'}`}
                                    onClick={() => navigate(`/employees/${empID}/public/${employee.employeeId}`)}
                                    onContextMenu={(e) => handleContextMenu(e, employee)}
                                >
                                    {viewMode === 'grid' ? (
                                        <div className="flex flex-col items-center text-center">
                                            <div className="relative mb-6">
                                                {employee.employeeImage ? (
                                                    <img
                                                        src={employee.employeeImage}
                                                        alt={`${employee.displayName}'s profile picture`}
                                                        className="h-24 w-24 rounded-2xl object-cover border-4 border-blue-100 shadow-lg group-hover:border-blue-300 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-300">
                                                        {generateInitials(employee.displayName)}
                                                    </div>
                                                )}
                                            </div>


                                            <div className="w-full">
                                                <h3 className={`text-xl font-bold mb-2 truncate ${
                                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                    {employee.displayName}
                                                </h3>
                                                <p className="text-blue-600 font-semibold mb-4">
                                                    {employee.jobTitlePrimary}
                                                </p>


                                                <div className="space-y-3 text-sm">
                                                    <div className={`flex items-center justify-center space-x-2 ${
                                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                                        }`}>
                                                        <IoBriefcaseOutline className={`w-4 h-4 ${
                                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                                            }`} />
                                                        <span className="truncate">{employee.departmentId || 'N/A'}</span>
                                                    </div>
                                                    <div className={`flex items-center justify-center space-x-2 ${
                                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                                        }`}>
                                                        <IoLocationOutline className={`w-4 h-4 ${
                                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                                            }`} />
                                                        <span className="truncate">{employee.location || 'N/A'}</span>
                                                    </div>
                                                    <div className={`flex items-center justify-center space-x-2 ${
                                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                                        }`}>
                                                        <IoMailOutline className={`w-4 h-4 ${
                                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                                            }`} />
                                                        <span className="truncate">{employee.workEmail || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-shrink-0 mr-6">
                                                {employee.employeeImage ? (
                                                    <img
                                                        src={employee.employeeImage}
                                                        alt={`${employee.displayName}'s profile picture`}
                                                        className="h-16 w-16 rounded-xl object-cover border-2 border-blue-100"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                                                        {generateInitials(employee.displayName)}
                                                    </div>
                                                )}
                                            </div>


                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className={`text-lg font-bold ${
                                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                            }`}>
                                                            {employee.displayName}
                                                        </h3>
                                                        <p className="text-blue-600 font-semibold">
                                                            {employee.jobTitlePrimary}
                                                        </p>
                                                    </div>
                                                    <div className="text-right space-y-1">
                                                        <div className={`flex items-center space-x-2 text-sm ${
                                                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                                            }`}>
                                                            <IoBriefcaseOutline className="w-4 h-4" />
                                                            <span>{employee.departmentId || 'N/A'}</span>
                                                        </div>
                                                        <div className={`flex items-center space-x-2 text-sm ${
                                                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                                            }`}>
                                                            <IoLocationOutline className="w-4 h-4" />
                                                            <span>{employee.location || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`mt-2 flex items-center space-x-2 text-sm ${
                                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                                    }`}>
                                                    <IoMailOutline className="w-4 h-4" />
                                                    <span>{employee.workEmail || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="text-center py-20">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                            <IoPersonOutline className={`w-12 h-12 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                }`} />
                        </div>
                        <h2 className={`text-2xl font-bold mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}>No Employees Found</h2>
                        <p className={`text-lg mb-6 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            Try adjusting your search terms or filters.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>


            <AnimatePresence>
                {contextMenu.visible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className={`fixed z-50 border-2 rounded-xl shadow-2xl py-2 min-w-[120px] ${
                            theme === 'dark'
                                ? 'bg-gray-800 border-gray-600'
                                : 'bg-white border-gray-200'
                            }`}
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button
                            onClick={handleChatClick}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center space-x-2 ${
                                theme === 'dark'
                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                        >
                            <IoChatbubbleOutline className="w-4 h-4" />
                            <span>Start Chat</span>
                        </button>


                        {/* ✅ Conditionally render these buttons based on the user's role */}
                        {hasManagementAccess && (
                            <>
                                <div className={`h-px mx-4 my-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                                <button
                                    onClick={handleViewProfileClick}
                                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center space-x-2 ${
                                        theme === 'dark'
                                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    <IoPersonOutline className="w-4 h-4" />
                                    <span>View Profile</span>
                                </button>
                                <button
                                    onClick={handleDocumentsClick}
                                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center space-x-2 ${
                                        theme === 'dark'
                                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    <IoDocumentsOutline className="w-4 h-4" />
                                    <span>Documents</span>
                                </button>
                                <button
                                    onClick={handleAboutClick}
                                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center space-x-2 ${
                                        theme === 'dark'
                                            ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    <IoInformationCircleOutline className="w-4 h-4" />
                                    <span>About</span>
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>


            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-slideUp { animation: slideUp 0.4s ease-out; }
            `}</style>
        </div>
    );
}


export default EmployeeApp;
