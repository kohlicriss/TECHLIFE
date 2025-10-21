import React, { useState, useContext, useEffect, useCallback, useMemo, useRef } from 'react'; // Added missing hooks just in case, though not all might be used now
import Select from 'react-select';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaPlus, FaTrashAlt, FaEdit, FaSave, FaUndo } from 'react-icons/fa';
import { X, Edit3, Trash2 } from 'lucide-react'; // Using Lucide icons
import { Context } from '../HrmsContext'; // Ensure this path is correct
import { authApi } from '../../../../axiosInstance'; // Ensure this path is correct

// Custom Notification Component
const CustomNotification = ({ isOpen, onClose, type, title, message, theme }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let timer;
        if (isOpen) {
            setIsVisible(true);
            // Auto-close for success/error after delay
            if (type === 'success' || type === 'error') {
                timer = setTimeout(() => {
                    handleClose();
                }, 3000); // Auto-close after 3 seconds
            }
        } else {
             // Immediately start fade out if isOpen becomes false
             setIsVisible(false);
        }
        // Cleanup timeout on unmount or if isOpen changes before timeout finishes
        return () => clearTimeout(timer);
    }, [isOpen, type]); // Rerun effect if isOpen or type changes

    const handleClose = useCallback(() => { // Wrap in useCallback
        setIsVisible(false);
        // Delay onClose call to allow fade-out animation
        setTimeout(() => onClose(), 300); // Match transition duration
    }, [onClose]);

    // Render immediately if isOpen is true, rely on isVisible for animations
    if (!isOpen && !isVisible) return null; // Only return null if fully closed and animation finished

    const getIcon = () => {
        switch (type) {
            case 'success': return <FaCheckCircle className="w-6 h-6 text-green-500" />;
            case 'error':   return <FaExclamationTriangle className="w-6 h-6 text-red-500" />;
            case 'info':    return <FaInfoCircle className="w-6 h-6 text-blue-500" />;
            default:        return null;
        }
    };
    const getTitleClass = () => {
        switch (type) {
            case 'success': return 'text-green-600 dark:text-green-400';
            case 'error':   return 'text-red-600 dark:text-red-400';
            case 'info':    return 'text-blue-600 dark:text-blue-400';
            default:        return theme === 'dark' ? 'text-white' : 'text-gray-800';
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`p-6 rounded-2xl shadow-2xl w-full max-w-md m-4 border transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start mb-4"> {/* Changed items-center to items-start for long titles */}
                    <div className="flex-shrink-0 pt-1">{getIcon()}</div> {/* Added pt-1 for alignment */}
                    <h3 className={`text-xl font-bold ml-3 flex-grow ${getTitleClass()}`}>{title}</h3>
                    {/* Show close button only for info or non-auto-closing types */}
                    {(type === 'info') && (
                        <button onClick={handleClose} className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">
                            <X size={20} />
                        </button>
                    )}
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
                 {/* Explicit OK button only needed for info type */}
                 {(type === 'info') && (
                     <div className="mt-5 flex justify-end"> {/* Increased margin top */}
                         <button
                             onClick={handleClose}
                             className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors bg-blue-500 hover:bg-blue-600 text-white`}
                         >
                             OK
                         </button>
                     </div>
                 )}
            </div>
        </div>
    );
};


// Custom Confirmation Modal Component
const CustomConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isConfirming, theme, type = 'warning' }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
             setIsVisible(false);
        }
    }, [isOpen]);

    const handleClose = useCallback(() => { // Wrap in useCallback
        setIsVisible(false);
        setTimeout(() => onClose(), 300); // Match transition duration
    }, [onClose]);

     // Render immediately if isOpen is true, rely on isVisible for animations
     if (!isOpen && !isVisible) return null; // Only return null if fully closed and animation finished

    const getIcon = () => {
        switch (type) {
             case 'danger':  return <FaExclamationTriangle className="w-6 h-6 text-red-500" />;
             case 'warning': return <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />;
             case 'info':    return <FaInfoCircle className="w-6 h-6 text-blue-500" />;
             default:        return <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />; // Default to warning
         }
    };
    const getTitleClass = () => {
        switch (type) {
             case 'danger':  return 'text-red-600 dark:text-red-400';
             case 'warning': return 'text-yellow-600 dark:text-yellow-400';
             case 'info':    return 'text-blue-600 dark:text-blue-400';
             default:        return 'text-yellow-600 dark:text-yellow-400'; // Default to warning
         }
    };
    const getConfirmButtonClass = () => {
        switch (type) {
             case 'danger':  return 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600';
             case 'warning': return 'bg-yellow-500 hover:bg-yellow-600 focus-visible:outline-yellow-500 text-white'; // Yellow needs white text often
             case 'info':    return 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600';
             default:        return 'bg-yellow-500 hover:bg-yellow-600 focus-visible:outline-yellow-500 text-white'; // Default to warning
         }
    };

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`p-6 rounded-2xl shadow-2xl w-full max-w-md m-4 border transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start mb-4"> {/* Changed items-center to items-start */}
                    <div className="flex-shrink-0 pt-1">{getIcon()}</div> {/* Added pt-1 */}
                    <h3 className={`text-xl font-bold ml-3 flex-grow ${getTitleClass()}`}>{title}</h3>
                    <button onClick={handleClose} className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">
                        <X size={20} />
                    </button>
                </div>
                <p className={`mb-6 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isConfirming}
                        className={`px-5 py-2 rounded-lg font-medium text-sm text-white transition-colors flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${getConfirmButtonClass()} ${isConfirming ? 'opacity-75 cursor-not-allowed' : ''}`}
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
            </div>
        </div>
    );
};

// Main Permissions Page Component
const PermissionsPage = () => {
    const { theme, permissionsdata = [], userData, setPermissionsData } = useContext(Context); // Default permissionsdata to empty array
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [matchedObject, setMatchedObject] = useState(null);
    const [activeRoleTab, setActiveRoleTab] = useState(null);

    // Notification state
    const [notification, setNotification] = useState({ isOpen: false, type: '', title: '', message: '' });
    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: null, type: 'warning', isConfirming: false });

    const userRole = useMemo(() => userData?.roles?.[0]?.toUpperCase(), [userData]); // Memoize userRole
    const loggedinuserRole = userRole ? userRole : null;

    // Find the permission object for the logged-in user (for UI control checks if needed later)
    useEffect(() => {
        if (loggedinuserRole && permissionsdata && permissionsdata.length > 0) {
            const matched = permissionsdata.find(
            role => role.roleName?.trim() === loggedinuserRole.trim()
            );
            setMatchedObject(matched || null);
        } else {
            setMatchedObject(null); // Reset if data/role changes
        }
    }, [loggedinuserRole, permissionsdata]);

    const [newPermissionLabel, setNewPermissionLabel] = useState('');
    const [allPermissionOptions, setAllPermissionOptions] = useState([]);

    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [isAddingRole, setIsAddingRole] = useState(false);

    // Custom notification handlers
    const showNotification = useCallback((type, title, message) => {
        setNotification({ isOpen: true, type, title, message });
    }, []);
    const closeNotification = useCallback(() => {
        setNotification({ isOpen: false, type: '', title: '', message: '' });
    }, []);

    // Custom confirmation handlers
    const showConfirmModal = useCallback((title, message, confirmText, onConfirm, type = 'warning') => {
        setConfirmModal({ isOpen: true, title, message, confirmText, onConfirm, type, isConfirming: false });
    }, []);
    const closeConfirmModal = useCallback(() => {
        setConfirmModal({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: null, type: 'warning', isConfirming: false });
    }, []);

    // --- Helper Functions ---
    const formatPermissionLabel = useCallback((permission) => {
        if (!permission) return '';
        // Specific overrides first
        if (permission === 'CREAT_USER') return 'Create User';
        if (permission === 'DELETE_USER') return 'Delete User';
        if (permission === 'CREATE_TASK') return 'Create Task';
        if (permission === 'VIEW_TASKS') return 'View Tasks';
        if (permission === 'VIEW_REPORTS') return 'View Reports';
        if (permission === 'PERMISSIONS_BUTTENS') return 'Permissions Buttons'; // Check spelling if needed
        if (permission === 'CREATE_HR') return 'Create HR';
        // General formatting
        return permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }, []);

    const mapAPIRoleToKey = useCallback((apiRoleName) => {
        if (!apiRoleName) return null;
        if (apiRoleName.startsWith('ROLE_')) {
          return apiRoleName.substring(5).toLowerCase();
        }
        return apiRoleName.toLowerCase(); // Fallback if needed
    }, []);


    // Effect to initialize state when API data (permissionsdata) changes
    useEffect(() => {
        if (permissionsdata && Array.isArray(permissionsdata)) {
            // Create Permission Options
            const allApiPermissions = permissionsdata.flatMap(role => role.permissions || []);
            const uniqueApiPermissions = [...new Set(allApiPermissions)];
            const options = uniqueApiPermissions.map(p => ({ value: p, label: formatPermissionLabel(p) }))
                                             .sort((a, b) => a.label.localeCompare(b.label));
            setAllPermissionOptions(options);

            // Initialize Permissions State & Active Tab
            const initialPermissions = {};
            let firstRoleKey = null;
            const sortedApiData = [...permissionsdata].sort((a,b) => (a.roleName || "").localeCompare(b.roleName || "")); // Sort roles before processing

            sortedApiData.forEach(apiRole => {
                const roleKey = mapAPIRoleToKey(apiRole.roleName);
                if (roleKey) {
                    if (!firstRoleKey) firstRoleKey = roleKey; // Capture the first valid role key from sorted list
                    initialPermissions[roleKey] = {
                        id: apiRole.id,
                        permissions: apiRole.permissions ? [...new Set(apiRole.permissions)] : []
                    };
                }
            });
            setPermissions(initialPermissions);

             // Set active tab: use current if still valid, else first, else null
            setActiveRoleTab(prevTab => {
                if (prevTab && initialPermissions[prevTab]) {
                    return prevTab; // Keep current active tab if it still exists
                }
                return firstRoleKey; // Otherwise, set to the first available role or null
            });


            setLoading(false);
        } else {
            // Handle case where permissionsdata is empty or invalid
            setAllPermissionOptions([]);
            setPermissions({});
            setActiveRoleTab(null);
            setLoading(false);
        }
    }, [permissionsdata, formatPermissionLabel, mapAPIRoleToKey]); // Added dependencies


    // Add New Permission Option Handler
    const handleAddPermission = useCallback(() => {
        if (!newPermissionLabel.trim()) {
            showNotification('error', 'Validation Error', 'Please enter a label for the new permission.');
            return;
        }
        const newPermissionValue = newPermissionLabel.trim().toUpperCase().replace(/\s+/g, '_');
        if (allPermissionOptions.some(option => option.value === newPermissionValue)) {
            showNotification('error', 'Duplicate Permission', 'A permission option with this value already exists.');
            return;
        }
        const newPermission = { value: newPermissionValue, label: formatPermissionLabel(newPermissionValue) };
        setAllPermissionOptions(prevOptions => [...prevOptions, newPermission].sort((a, b) => a.label.localeCompare(b.label)));
        setNewPermissionLabel('');
        showNotification('info', 'Permission Option Added', `"${newPermission.label}" option created. Assign it to roles and save.`);
    }, [newPermissionLabel, allPermissionOptions, formatPermissionLabel, showNotification]);

    // Handle permission selection change for the ACTIVE tab
    const handleSelectionChange = useCallback((selectedOptions, roleKey) => {
        if (!roleKey) return; // Should have an active role tab
        const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setPermissions(prev => ({
            ...prev,
            [roleKey]: { ...prev[roleKey], permissions: selectedValues }
        }));
    }, []);

    // Handle Add New Role (API call)
    const handleAddNewRole = useCallback(async (e) => {
        e.preventDefault();
        const trimmedRoleName = newRoleName.trim().toUpperCase();
        if (!trimmedRoleName || !trimmedRoleName.startsWith('ROLE_')) {
            showNotification('error', 'Invalid Role Name', "Role name must start with 'ROLE_' and cannot be empty.");
            return;
        }
        const roleKey = mapAPIRoleToKey(trimmedRoleName);
        if (permissions[roleKey]) {
            showNotification('error', 'Role Already Exists', 'This role already exists.');
            return;
        }
        setIsAddingRole(true);
        const newRoleDto = { roleName: trimmedRoleName, permissions: [] };

        try {
            await authApi.post('/role-access', newRoleDto);
            const response = await authApi.get('/role-access/all'); // Refetch updated list
            setPermissionsData(response.data); // Update context, triggers useEffect re-initialization
            // The useEffect will handle setting the active tab correctly based on the new data
            setIsAddRoleModalOpen(false);
            setNewRoleName('');
            showNotification('success', 'Role Created', `Role '${newRoleDto.roleName}' created. Assign permissions and save.`);
        } catch (error) {
            console.error("Failed to create new role:", error);
            const errorMessage = error.response?.data?.message || "An error occurred.";
            showNotification('error', 'Role Creation Failed', `Error: ${errorMessage}`);
        } finally {
            setIsAddingRole(false);
        }
    }, [newRoleName, permissions, mapAPIRoleToKey, setPermissionsData, showNotification]);


    // Handle Save Permissions (API call)
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const transformedPermissions = Object.keys(permissions).map(key => {
            const apiRoleName = `ROLE_${key.toUpperCase()}`;
            return {
                id: permissions[key]?.id, // Include the ID from the state
                roleName: apiRoleName,
                permissions: permissions[key]?.permissions || [],
            };
        }).filter(p => p.id !== undefined); // Ensure we only send roles that were originally loaded (have an ID) or newly created roles might need a different endpoint? Check API.

        if (transformedPermissions.length === 0) {
            showNotification('info', 'No Changes', 'No permissions data found to save.');
            setIsSubmitting(false);
            return;
        }


        try {
            await authApi.post('role-access/updateAll', transformedPermissions);
            const response = await authApi.get('/role-access/all'); // Refetch to confirm
            setPermissionsData(response.data);
            showNotification('success', 'Permissions Saved', 'All changes have been saved successfully!');
        } catch (error) {
            console.error("Error saving permissions:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while saving permissions.";
            showNotification('error', 'Save Failed', `Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [permissions, setPermissionsData, showNotification]);

    // Handle Reset Permissions (Client-side reload from context data)
    const handleReset = useCallback(() => {
        if (permissionsdata && Array.isArray(permissionsdata)) {
            // Re-run the initialization logic directly
            const initialPermissions = {};
            let firstRoleKey = null;
            const sortedApiData = [...permissionsdata].sort((a,b) => (a.roleName || "").localeCompare(b.roleName || ""));

            sortedApiData.forEach(apiRole => {
                const roleKey = mapAPIRoleToKey(apiRole.roleName);
                if (roleKey) {
                    if (!firstRoleKey) firstRoleKey = roleKey;
                    initialPermissions[roleKey] = {
                        id: apiRole.id,
                        permissions: apiRole.permissions ? [...new Set(apiRole.permissions)] : []
                    };
                }
            });
            setPermissions(initialPermissions);
            // Reset active tab as well, if desired, or keep current if it still exists
            setActiveRoleTab(prevTab => (initialPermissions[prevTab] ? prevTab : firstRoleKey));

            showNotification('info', 'Changes Reset', 'Permissions reverted to last saved state.');
        } else {
             showNotification('error', 'Reset Failed', 'Original permissions data not available.');
        }
    }, [permissionsdata, mapAPIRoleToKey, showNotification]);


    // Handle Delete Role (Triggered by 'X' icon)
    const handleDeleteRole = useCallback((roleKeyToDelete) => {
        if (!roleKeyToDelete) return;
        if (roleKeyToDelete === 'admin') { // Basic protection
            showNotification('error', 'Deletion Denied', 'The ADMIN role cannot be deleted.');
            return;
        }

        const roleToDeleteName = `ROLE_${roleKeyToDelete.toUpperCase()}`;

        showConfirmModal(
            'Confirm Role Deletion',
            `Are you sure you want to permanently delete the role: ${roleToDeleteName}? This action cannot be undone.`,
            'Delete Role',
            async () => {
                setConfirmModal(prev => ({ ...prev, isConfirming: true }));
                try {
                    const callerRole = loggedinuserRole || 'ADMIN'; // Determine caller role appropriately
                    await authApi.delete(`role-access/delete/${callerRole}/${roleToDeleteName}`);
                    const response = await authApi.get('/role-access/all'); // Refetch updated list
                    setPermissionsData(response.data); // Update context, triggers useEffect re-render
                    // Active tab logic is handled by the main useEffect now
                    closeConfirmModal();
                    showNotification('success', 'Role Deleted', `Role '${roleToDeleteName}' has been successfully deleted.`);
                } catch (error) {
                    console.error("Failed to delete role:", error);
                    const errorMessage = error.response?.data?.message || "An error occurred.";
                    closeConfirmModal(); // Close modal even on error
                    showNotification('error', 'Delete Failed', `Error: ${errorMessage}`);
                }
                // No need to set isConfirming false here as modal closes
            },
            'danger' // Use danger type for deletion confirmation
        );
    }, [loggedinuserRole, setPermissionsData, showConfirmModal, closeConfirmModal, showNotification]);


    // Custom styles for react-select
    // Inside PermissionsPage component...

const customSelectStyles = useMemo(() => ({
    control: (provided, state) => ({
        ...provided,
        backgroundColor: theme === 'dark' ? '#374151' : '#fff', // gray-700
        borderColor: state.isFocused
            ? (theme === 'dark' ? '#60A5FA' : '#3B82F6') // Brighter blue for focus (blue-400 / blue-500)
            : (theme === 'dark' ? '#4B5563' : '#D1D5DB'), // gray-600 : gray-300
        minHeight: '48px', // Maintain height for consistency
        boxShadow: state.isFocused ? `0 0 0 2px ${theme === 'dark' ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)'}` : null,
        borderRadius: '0.5rem', // Slightly larger border-radius for the control
        padding: '2px 4px', // Add slight padding inside control
        '&:hover': {
            borderColor: theme === 'dark' ? '#6B7280' : '#A1A1AA', // gray-500 : gray-400
        },
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '2px 6px', // Adjust padding inside value container for tags
        gap: '4px', // Add gap between multi-value items
    }),
    input: (provided) => ({
        ...provided,
        color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
        margin: '0px',
        paddingBlock: '2px',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (provided) => ({ /* ... (keep previous styles) ... */ }),
    clearIndicator: (provided) => ({ /* ... (keep previous styles) ... */ }),
    placeholder: (provided) => ({ ...provided, color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }),
    menu: (provided) => ({ /* ... (keep previous styles) ... */ }),
    option: (provided, state) => ({ /* ... (keep previous styles) ... */ }),

    // --- Styling the Selected Permission Tags ---
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)', // Use theme-aware blue background (lighter)
        // backgroundColor: theme === 'dark' ? '#4B5563' : '#E0E7FF', // Alternative: gray/indigo
        borderRadius: '9999px', // Fully rounded pills
        margin: '2px', // Minimal margin
        border: `1px solid ${theme === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`, // Subtle border matching background
        // border: `1px solid ${theme === 'dark' ? '#6B7280' : '#C7D2FE'}`, // Alternative border
        overflow: 'hidden', // Ensure border radius clips remove button
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: theme === 'dark' ? '#BFDBFE' : '#1E40AF', // Lighter blue text (dark) / Darker blue text (light)
        // color: theme === 'dark' ? '#E5E7EB' : '#4338CA', // Alternative: gray/indigo text
        padding: '3px', // Adjust padding inside label
        paddingLeft: '10px', // More padding on the left
        fontSize: '0.8rem', // Slightly smaller font size for pills
        fontWeight: '500', // Medium weight
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: theme === 'dark' ? '#93C5FD' : '#3B82F6', // Blueish color for 'x'
        // color: theme === 'dark' ? '#9CA3AF' : '#6D28D9', // Alternative: gray/violet
        backgroundColor: 'transparent',
        borderRadius: '0 9999px 9999px 0',
        padding: '4px', // Keep padding
        marginLeft: '1px', // Minimal space
        marginRight: '1px',
        // Enhanced Hover/Focus for the 'x'
        '&:hover, &:focus-visible': {
            backgroundColor: theme === 'dark' ? '#DC2626' : '#EF4444', // Red background
            color: 'white',
            transform: 'scale(1.1)',
            outline: 'none',
        },
        transition: 'all 150ms', // Apply transition to all properties
        cursor: 'pointer',
    }),
    noOptionsMessage: (provided) => ({ /* ... (keep previous styles) ... */ }),
}), [theme]); // Depend on theme


    // --- Render Logic ---

    if (loading) {
        return <div className={`flex justify-center items-center h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>Loading Permissions...</div>;
    }

    const rolesToRender = Object.keys(permissions).sort((a, b) => {
        if (a === 'admin') return -1;
        if (b === 'admin') return 1;
        return a.localeCompare(b);
    });

    const selectedPermissionsForActiveRole = activeRoleTab ? allPermissionOptions.filter(
        option => permissions[activeRoleTab]?.permissions?.includes(option.value)
    ) : [];


    return (
        <>
            {/* Add Role Modal */}
             {isAddRoleModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[151]">
                  <div className={`p-6 rounded-2xl shadow-2xl w-full max-w-md m-4 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center mb-4">
                      <FaPlus className="w-6 h-6 text-blue-500" />
                      <h2 className={`text-xl font-bold ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Add New Role</h2>
                      <button
                        onClick={() => setIsAddRoleModalOpen(false)}
                        className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label="Close add role modal" // Accessibility
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <form onSubmit={handleAddNewRole}>
                      <label htmlFor="newRoleNameInput" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Role Name (must start with ROLE_)
                      </label>
                      <input
                        id="newRoleNameInput"
                        type="text"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        placeholder="e.g., ROLE_MANAGER"
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 mb-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' : 'bg-white border-gray-300 focus:ring-blue-600'}`}
                      />
                      <div className="flex justify-end gap-3"> {/* Reduced gap */}
                        <button
                          type="button"
                          onClick={() => setIsAddRoleModalOpen(false)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                          disabled={isAddingRole}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
                          disabled={isAddingRole || !newRoleName.trim() || !newRoleName.toUpperCase().startsWith('ROLE_')}
                        >
                          {isAddingRole ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Adding...
                            </>
                          ) : (
                            'Add Role'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}


            {/* Main Page Content */}
            <div className={`min-h-screen px-0 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="mb-6 sm:mb-8 px-4 sm:px-0 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2"> {/* Reduced margin */}
                            Permissions Management
                            </h1>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Configure role-based permissions</p>
                        </div>
                        {/* Removed Edit Button */}
                    </div>

                    {/* Add New Permission / Add Role Section */}
                     <div className={`p-4 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8 mx-4 sm:mx-0 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border'}`}> {/* Added border */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            {/* Add New Permission Form */}
                            <div className="w-full md:w-auto md:flex-grow mb-4 md:mb-0">
                                <label htmlFor="newPermissionInput" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Add New Permission Option
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    id="newPermissionInput"
                                    type="text"
                                    value={newPermissionLabel}
                                    onChange={(e) => setNewPermissionLabel(e.target.value)}
                                    placeholder="Enter label (e.g., Edit Own Profile)"
                                    className={`flex-grow p-3 border rounded-lg focus:outline-none focus:ring-1 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-600 focus:border-blue-600'}`}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddPermission}
                                    className="px-4 py-3 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    disabled={!newPermissionLabel.trim()}
                                >
                                    <FaPlus size={14}/> Add Option
                                </button>
                                </div>
                                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Adds an option available for selection in all roles.</p>
                            </div>
                            {/* Add New Role Button */}
                            <div className="flex-shrink-0 w-full md:w-auto">
                                <label className="block text-sm font-medium mb-1 invisible md:visible">_</label> {/* Spacer - invisible on small screens */}
                                <button
                                    onClick={() => setIsAddRoleModalOpen(true)}
                                    className="w-full px-4 py-3 bg-green-600 text-white font-semibold text-sm rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <FaPlus size={14}/> Add New Role
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Horizontal Tabs for Roles */}
                    <div className={`mb-6 sm:mb-8 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex space-x-1 overflow-x-auto pb-px -mb-px px-4 sm:px-0"> {/* Added padding for scroll */}
                            {rolesToRender.map((roleKey) => (
                                <div key={roleKey} className="relative group flex items-center flex-shrink-0"> {/* Added flex-shrink-0 */}
                                    <button
                                        onClick={() => setActiveRoleTab(roleKey)}
                                        // Padding adjusted: more horizontal, less vertical for tabs
                                        className={`flex items-center gap-2 pl-4 pr-9 py-2.5 text-sm sm:text-base font-medium border-b-2 whitespace-nowrap transition-colors duration-150 rounded-t-md
                                            ${activeRoleTab === roleKey
                                                ? `border-blue-500 text-blue-600 dark:text-blue-400 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}` // Active tab background matches content area below
                                                : `border-transparent hover:border-gray-400 dark:hover:border-gray-500 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}` // Subtle hover background
                                            }
                                        `}
                                    >
                                        <span className="capitalize">{roleKey.replace(/_/g, ' ')}</span>
                                    </button>
                                    {/* Delete 'X' Icon - Adjusted positioning and visibility */}
                                    {roleKey !== 'admin' && ( // Don't allow deleting admin
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteRole(roleKey); }}
                                            // Position inside the button padding area, more intuitive
                                            className={`absolute top-1/2 right-2 transform -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 ${activeRoleTab === roleKey ? 'opacity-100' : ''}`} // Visible on hover/focus or if active
                                            title={`Delete ROLE_${roleKey.toUpperCase()}`}
                                            aria-label={`Delete role ${roleKey}`} // Accessibility
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                             {/* Add a filler div if no roles exist */}
                             {rolesToRender.length === 0 && !loading && (
                                <div className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    No roles found. Add a new role to begin.
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Active Role's Permission Selection Area */}
                    {activeRoleTab && permissions[activeRoleTab] ? (
                        <div className={`p-4 sm:p-6 md:p-8 rounded-lg shadow-md mx-4 sm:mx-0 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border'}`}> {/* Added border */}
                            <h2 className={`text-lg sm:text-xl font-semibold capitalize mb-4 pb-2 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                Permissions for <span className='text-blue-600 dark:text-blue-400'>{activeRoleTab.replace(/_/g, ' ')}</span> Role
                            </h2>
                            <Select
                                isMulti
                                options={allPermissionOptions}
                                value={selectedPermissionsForActiveRole}
                                onChange={selectedOptions => handleSelectionChange(selectedOptions, activeRoleTab)}
                                styles={customSelectStyles}
                                placeholder="Select permissions for this role..."
                                closeMenuOnSelect={false}
                                // isDisabled={isSubmitting} // Optionally disable while saving
                                // className={isSubmitting ? 'opacity-70' : ''}
                                aria-label={`Select permissions for ${activeRoleTab} role`} // Accessibility
                            />
                            <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {selectedPermissionsForActiveRole.length} / {allPermissionOptions.length} permission(s) selected.
                            </p>
                        </div>
                    ) : (
                        // Show placeholder only if loading is finished and still no active tab
                        !loading && rolesToRender.length > 0 && (
                            <div className={`p-6 text-center rounded-lg mx-4 sm:mx-0 ${theme === 'dark' ? 'text-gray-500 bg-gray-800 border border-gray-700' : 'text-gray-600 bg-gray-100 border'}`}> {/* Added background/border */}
                                Select a role tab above to view or edit its permissions.
                            </div>
                        )
                    )}


                    {/* Action Buttons (Save/Reset) - Show if roles exist */}
                    {rolesToRender.length > 0 && (
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 px-4 sm:px-0 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className={`w-full sm:w-auto px-5 py-2.5 border-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${theme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                    disabled={isSubmitting}
                                >
                                    <FaUndo size={14}/> Reset Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-lg shadow-md transition-all ${isSubmitting ? 'cursor-not-allowed opacity-75' : 'hover:shadow-lg hover:from-blue-700 hover:to-indigo-700'}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <><FaSave size={15}/> Save Permissions</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Custom Notification */}
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
        </>
    );
};

export default PermissionsPage;