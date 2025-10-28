import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import Select from 'react-select';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaPlus, FaSave, FaUndo } from 'react-icons/fa';
import { X } from 'lucide-react';
import { Context } from '../HrmsContext';
import { authApi } from '../../../../axiosInstance';

// Custom Notification Component
const CustomNotification = ({ isOpen, onClose, type, title, message, theme }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let timer;
        if (isOpen) {
            setIsVisible(true);
            if (['success', 'error', 'warning'].includes(type)) {
                timer = setTimeout(() => {
                    handleClose();
                }, 3000);
            }
        } else {
             setIsVisible(false);
        }
        return () => clearTimeout(timer);
    }, [isOpen, type]);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
    }, [onClose]);

    if (!isOpen && !isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <FaCheckCircle className="w-6 h-6 text-green-500" />;
            case 'error':   return <FaExclamationTriangle className="w-6 h-6 text-red-500" />;
            case 'warning': return <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />;
            case 'info':    return <FaInfoCircle className="w-6 h-6 text-blue-500" />;
            default:        return null;
        }
    };

    const getTitleClass = () => {
        switch (type) {
            case 'success': return 'text-green-600 dark:text-green-400';
            case 'error':   return 'text-red-600 dark:text-red-400';
            case 'warning': return 'text-yellow-600 dark:text-yellow-400';
            case 'info':    return 'text-blue-600 dark:text-blue-400';
            default:        return theme === 'dark' ? 'text-white' : 'text-gray-800';
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`p-6 rounded-2xl shadow-2xl w-full max-w-md m-4 border transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 pt-1">{getIcon()}</div>
                    <h3 className={`text-xl font-bold ml-3 flex-grow ${getTitleClass()}`}>{title}</h3>
                    {(type === 'info' || type === 'warning') && (
                        <button onClick={handleClose} className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">
                            <X size={20} />
                        </button>
                    )}
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
                 {(type === 'info' || type === 'warning') && (
                    <div className="mt-5 flex justify-end">
                        <button
                            onClick={handleClose}
                            className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
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

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
    }, [onClose]);

     if (!isOpen && !isVisible) return null;

    const getIcon = () => {
        switch (type) {
             case 'danger':  return <FaExclamationTriangle className="w-6 h-6 text-red-500" />;
             case 'warning': return <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />;
             case 'info':    return <FaInfoCircle className="w-6 h-6 text-blue-500" />;
             default:        return <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />;
         }
    };
    const getTitleClass = () => {
        switch (type) {
             case 'danger':  return 'text-red-600 dark:text-red-400';
             case 'warning': return 'text-yellow-600 dark:text-yellow-400';
             case 'info':    return 'text-blue-600 dark:text-blue-400';
             default:        return 'text-yellow-600 dark:text-yellow-400';
         }
    };
    const getConfirmButtonClass = () => {
        switch (type) {
             case 'danger':  return 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600';
             case 'warning': return 'bg-yellow-500 hover:bg-yellow-600 focus-visible:outline-yellow-500 text-white';
             case 'info':    return 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600';
             default:        return 'bg-yellow-500 hover:bg-yellow-600 focus-visible:outline-yellow-500 text-white';
         }
    };

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[200] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`p-6 rounded-2xl shadow-2xl w-full max-w-md m-4 border transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 pt-1">{getIcon()}</div>
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
    const { theme, permissionsdata = [], userData, setPermissionsData } = useContext(Context);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [matchedObject, setMatchedObject] = useState(null);
    const [activeRoleTab, setActiveRoleTab] = useState(null);

    const [notification, setNotification] = useState({ isOpen: false, type: '', title: '', message: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: null, type: 'warning', isConfirming: false });

    const userRole = useMemo(() => userData?.roles?.[0]?.toUpperCase(), [userData]);
    const loggedinuserRole = userRole || null;

    useEffect(() => {
        if (loggedinuserRole && permissionsdata.length > 0) {
            const matched = permissionsdata.find(role => role.roleName?.trim() === loggedinuserRole.trim());
            setMatchedObject(matched || null);
        } else {
            setMatchedObject(null);
        }
    }, [loggedinuserRole, permissionsdata]);

    const [newPermissionLabel, setNewPermissionLabel] = useState('');
    const [allPermissionOptions, setAllPermissionOptions] = useState([]);

    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [isAddingRole, setIsAddingRole] = useState(false);

    const showNotification = useCallback((type, title, message) => {
        setNotification({ isOpen: true, type, title, message });
    }, []);
    const closeNotification = useCallback(() => {
        setNotification({ isOpen: false, type: '', title: '', message: '' });
    }, []);

    const showConfirmModal = useCallback((title, message, confirmText, onConfirm, type = 'warning') => {
        setConfirmModal({ isOpen: true, title, message, confirmText, onConfirm, type, isConfirming: false });
    }, []);
    const closeConfirmModal = useCallback(() => {
        setConfirmModal({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: null, type: 'warning', isConfirming: false });
    }, []);

    const formatPermissionLabel = useCallback((permission) => {
        if (!permission) return '';
        if (permission === 'CREAT_USER') return 'Create User';
        if (permission === 'DELETE_USER') return 'Delete User';
        if (permission === 'CREATE_TASK') return 'Create Task';
        if (permission === 'VIEW_TASKS') return 'View Tasks';
        if (permission === 'VIEW_REPORTS') return 'View Reports';
        if (permission === 'PERMISSIONS_BUTTENS') return 'Permissions Buttons';
        if (permission === 'CREATE_HR') return 'Create HR';
        return permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }, []);

    const mapAPIRoleToKey = useCallback((apiRoleName) => {
        if (!apiRoleName) return null;
        if (apiRoleName.startsWith('ROLE_')) {
            return apiRoleName.substring(5).toLowerCase();
        }
        return apiRoleName.toLowerCase();
    }, []);

    useEffect(() => {
        if (permissionsdata && Array.isArray(permissionsdata)) {
            const allApiPermissions = permissionsdata.flatMap(role => role.permissions || []);
            const currentManualOptions = allPermissionOptions.filter(opt => !allApiPermissions.includes(opt.value)).map(opt => opt.value);
            const uniqueApiPermissions = [...new Set([...allApiPermissions, ...currentManualOptions])];
            const options = uniqueApiPermissions.map(p => ({ value: p, label: formatPermissionLabel(p) }))
                .sort((a, b) => a.label.localeCompare(b.label));
            setAllPermissionOptions(options);

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

            setActiveRoleTab(prevTab => (prevTab && initialPermissions[prevTab]) ? prevTab : firstRoleKey);

            setLoading(false);
        } else {
            setAllPermissionOptions([]);
            setPermissions({});
            setActiveRoleTab(null);
            setLoading(false);
        }
    }, [permissionsdata, formatPermissionLabel, mapAPIRoleToKey]);

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

    const handleSelectionChange = useCallback((selectedOptions, roleKey) => {
        if (!roleKey) return;
        const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setPermissions(prev => ({
            ...prev,
            [roleKey]: { ...prev[roleKey], permissions: selectedValues }
        }));
    }, []);

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
            const response = await authApi.get('/role-access/all');
            setPermissionsData(response.data);
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

    // Modified Submit Handler for ROLE_GARBAGE handling
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const GARBAGE_ROLE_NAME = 'ROLE_GARBAGE';
        const GARBAGE_ROLE_KEY = mapAPIRoleToKey(GARBAGE_ROLE_NAME);

        const assignedPermissions = new Set();
        Object.values(permissions).forEach(role => {
            role.permissions.forEach(perm => assignedPermissions.add(perm));
        });
        const allAvailablePermissions = allPermissionOptions.map(opt => opt.value);
        const unassignedPermissions = allAvailablePermissions.filter(perm => !assignedPermissions.has(perm));

        let transformedPermissions = Object.keys(permissions)
            .filter(key => key !== GARBAGE_ROLE_KEY) // Exclude garbage role initially
            .map(key => {
                const apiRoleName = `ROLE_${key.toUpperCase()}`;
                return {
                    id: permissions[key]?.id,
                    roleName: apiRoleName,
                    permissions: permissions[key]?.permissions || [],
                };
            }).filter(p => p.id !== undefined);

        let finalGarbageRole = null;

        if (unassignedPermissions.length > 0) {
            let existingGarbageRole = permissions[GARBAGE_ROLE_KEY] || permissionsdata.find(r => r.roleName === GARBAGE_ROLE_NAME);

            if (!existingGarbageRole) {
                try {
                    const createDto = { roleName: GARBAGE_ROLE_NAME, permissions: [] };
                    const createResponse = await authApi.post('/role-access', createDto);
                    const createdRole = createResponse.data;
                    if (createdRole && createdRole.id) {
                        finalGarbageRole = {
                            id: createdRole.id,
                            roleName: GARBAGE_ROLE_NAME,
                            permissions: createdRole.permissions || [],
                        };
                        showNotification('info', 'New Role Created', `${GARBAGE_ROLE_NAME} was automatically created to handle unassigned permissions.`);
                    } else {
                        throw new Error("API failed to return ID for created GARBAGE role.");
                    }
                } catch (error) {
                    console.error("Failed to auto-create ROLE_GARBAGE:", error);
                    showNotification('error', 'Setup Failed', `Could not create ${GARBAGE_ROLE_NAME}. Saving process halted.`);
                    setIsSubmitting(false);
                    return;
                }
            } else {
                finalGarbageRole = {
                    id: existingGarbageRole.id,
                    roleName: GARBAGE_ROLE_NAME,
                    permissions: existingGarbageRole.permissions || [],
                };
            }

            if (finalGarbageRole) {
                const updatedGarbagePermissions = [...new Set([...finalGarbageRole.permissions, ...unassignedPermissions])];
                finalGarbageRole.permissions = updatedGarbagePermissions;
                transformedPermissions.push(finalGarbageRole);
            }

            showNotification(
                'warning', 
                'Unassigned Permissions Assigned', 
                `The following permissions were not assigned to any role: ${unassignedPermissions.join(', ')}. They have been automatically assigned to ${GARBAGE_ROLE_NAME} (ID: ${finalGarbageRole.id}).`
            );
        }

        if (transformedPermissions.length === 0) {
            showNotification('info', 'No Changes', 'No roles found in the update payload.');
            setIsSubmitting(false);
            return;
        }

        try {
            await authApi.post('role-access/updateAll', transformedPermissions);
            const response = await authApi.get('/role-access/all');
            setPermissionsData(response.data);
            showNotification('success', 'Permissions Saved', 'All changes have been saved successfully!');
        } catch (error) {
            console.error("Error saving permissions:", error);
            const errorMessage = error.response?.data?.message || "An error occurred while saving permissions.";
            showNotification('error', 'Save Failed', `Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [permissions, allPermissionOptions, mapAPIRoleToKey, setPermissionsData, showNotification, permissionsdata]);

    const handleReset = useCallback(() => {
        if (permissionsdata && Array.isArray(permissionsdata)) {
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
            setActiveRoleTab(prevTab => (initialPermissions[prevTab] ? prevTab : firstRoleKey));
            showNotification('info', 'Changes Reset', 'Permissions reverted to last saved state.');
        } else {
             showNotification('error', 'Reset Failed', 'Original permissions data not available.');
        }
    }, [permissionsdata, mapAPIRoleToKey, showNotification]);

    const handleDeleteRole = useCallback((roleKeyToDelete) => {
        if (!roleKeyToDelete) return;
        if (roleKeyToDelete === 'admin') {
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
                    const callerRole = loggedinuserRole || 'ADMIN';
                    await authApi.delete(`role-access/delete/${callerRole}/${roleToDeleteName}`);
                    const response = await authApi.get('/role-access/all');
                    setPermissionsData(response.data);
                    closeConfirmModal();
                    showNotification('success', 'Role Deleted', `Role '${roleToDeleteName}' has been successfully deleted.`);
                } catch (error) {
                    console.error("Failed to delete role:", error);
                    const errorMessage = error.response?.data?.message || "An error occurred.";
                    closeConfirmModal();
                    showNotification('error', 'Delete Failed', `Error: ${errorMessage}`);
                }
            },
            'danger'
        );
    }, [loggedinuserRole, setPermissionsData, showConfirmModal, closeConfirmModal, showNotification]);

    // Custom styles for react-select
    const customSelectStyles = useMemo(() => ({
        control: (provided, state) => ({
            ...provided,
            backgroundColor: theme === 'dark' ? '#374151' : '#fff',
            borderColor: state.isFocused
                ? (theme === 'dark' ? '#60A5FA' : '#3B82F6')
                : (theme === 'dark' ? '#4B5563' : '#D1D5DB'),
            minHeight: '48px',
            boxShadow: state.isFocused ? `0 0 0 2px ${theme === 'dark' ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)'}` : null,
            borderRadius: '0.5rem',
            padding: '2px 4px',
            '&:hover': {
                borderColor: theme === 'dark' ? '#6B7280' : '#A1A1AA',
            },
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '2px 6px',
            gap: '4px',
        }),
        input: (provided) => ({
            ...provided,
            color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
            margin: '0px',
            paddingBlock: '2px',
        }),
        indicatorSeparator: () => ({ display: 'none' }),
        placeholder: (provided) => ({ ...provided, color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)',
            borderRadius: '9999px',
            margin: '2px',
            border: `1px solid ${theme === 'dark' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
            overflow: 'hidden',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: theme === 'dark' ? '#BFDBFE' : '#1E40AF',
            padding: '3px',
            paddingLeft: '10px',
            fontSize: '0.8rem',
            fontWeight: '500',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: theme === 'dark' ? '#93C5FD' : '#3B82F6',
            backgroundColor: 'transparent',
            borderRadius: '0 9999px 9999px 0',
            padding: '4px',
            marginLeft: '1px',
            marginRight: '1px',
            '&:hover, &:focus-visible': {
                backgroundColor: theme === 'dark' ? '#DC2626' : '#EF4444',
                color: 'white',
                transform: 'scale(1.1)',
                outline: 'none',
            },
            transition: 'all 150ms',
            cursor: 'pointer',
        }),
    }), [theme]);

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
                                aria-label="Close add role modal"
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
                            <div className="flex justify-end gap-3">
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
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                            Permissions Management
                            </h1>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Configure role-based permissions</p>
                        </div>
                    </div>

                    {/* Add New Permission / Add Role Section */}
                     <div className={`p-4 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8 mx-4 sm:mx-0 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border'}`}>
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
                                <label className="block text-sm font-medium mb-1 invisible md:visible">_</label>
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
                        <div className="flex space-x-1 overflow-x-auto pb-px -mb-px px-4 sm:px-0">
                            {rolesToRender.map((roleKey) => (
                                <div key={roleKey} className="relative group flex items-center flex-shrink-0">
                                    <button
                                        onClick={() => setActiveRoleTab(roleKey)}
                                        className={`flex items-center gap-2 pl-4 pr-9 py-2.5 text-sm sm:text-base font-medium border-b-2 whitespace-nowrap transition-colors duration-150 rounded-t-md
                                            ${activeRoleTab === roleKey
                                                ? `border-blue-500 text-blue-600 dark:text-blue-400 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`
                                                : `border-transparent hover:border-gray-400 dark:hover:border-gray-500 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`
                                            }
                                        `}
                                    >
                                        <span className="capitalize">{roleKey.replace(/_/g, ' ')}</span>
                                    </button>
                                    {roleKey !== 'admin' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteRole(roleKey); }}
                                            className={`absolute top-1/2 right-2 transform -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 ${activeRoleTab === roleKey ? 'opacity-100' : ''}`}
                                            title={`Delete ROLE_${roleKey.toUpperCase()}`}
                                            aria-label={`Delete role ${roleKey}`}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                             {rolesToRender.length === 0 && !loading && (
                                <div className={`px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    No roles found. Add a new role to begin.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Role's Permission Selection Area */}
                    {activeRoleTab && permissions[activeRoleTab] ? (
                        <div className={`p-4 sm:p-6 md:p-8 rounded-lg shadow-md mx-4 sm:mx-0 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border'}`}>
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
                                aria-label={`Select permissions for ${activeRoleTab} role`}
                            />
                            <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {selectedPermissionsForActiveRole.length} / {allPermissionOptions.length} permission(s) selected.
                            </p>
                        </div>
                    ) : (
                        !loading && rolesToRender.length > 0 && (
                            <div className={`p-6 text-center rounded-lg mx-4 sm:mx-0 ${theme === 'dark' ? 'text-gray-500 bg-gray-800 border border-gray-700' : 'text-gray-600 bg-gray-100 border'}`}>
                                Select a role tab above to view or edit its permissions.
                            </div>
                        )
                    )}

                    {/* Action Buttons (Save/Reset) */}
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
