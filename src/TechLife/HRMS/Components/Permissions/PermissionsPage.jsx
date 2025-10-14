import React, { useState, useContext, useEffect } from 'react';
import Select from 'react-select';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { X } from 'lucide-react';
import { Context } from '../HrmsContext';
import { authApi } from '../../../../axiosInstance';

// Custom Notification Component
const CustomNotification = ({ isOpen, onClose, type, title, message, theme }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            if (type === 'success' || type === 'error') {
                const timer = setTimeout(() => {
                    handleClose();
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [isOpen, type]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
    };

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="w-6 h-6 text-green-500" />;
            case 'error':
                return <FaExclamationTriangle className="w-6 h-6 text-red-500" />;
            case 'info':
                return <FaInfoCircle className="w-6 h-6 text-blue-500" />;
            default:
                return null;
        }
    };

    const getTitleClass = () => {
        switch (type) {
            case 'success':
                return 'text-green-600 dark:text-green-400';
            case 'error':
                return 'text-red-600 dark:text-red-400';
            case 'info':
                return 'text-blue-600 dark:text-blue-400';
            default:
                return theme === 'dark' ? 'text-white' : 'text-gray-800';
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[200] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`p-6 rounded-3xl shadow-2xl w-full max-w-md m-4 border transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center mb-4">
                    {getIcon()}
                    <h3 className={`text-xl font-bold ml-3 ${getTitleClass()}`}>{title}</h3>
                    {type !== "success" && type !== "error" && (
                        <button onClick={handleClose} className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X size={20} />
                        </button>
                    )}
                </div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
                {(type === 'success' || type === 'error') && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleClose}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                type === 'success' 
                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
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
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
    };

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <FaExclamationTriangle className="w-6 h-6 text-red-500" />;
            case 'warning':
                return <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />;
            case 'info':
                return <FaInfoCircle className="w-6 h-6 text-blue-500" />;
            default:
                return <FaExclamationTriangle className="w-6 h-6 text-yellow-500" />;
        }
    };

    const getTitleClass = () => {
        switch (type) {
            case 'danger':
                return 'text-red-600 dark:text-red-400';
            case 'warning':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'info':
                return 'text-blue-600 dark:text-blue-400';
            default:
                return 'text-yellow-600 dark:text-yellow-400';
        }
    };

    const getConfirmButtonClass = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700';
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700';
            case 'info':
                return 'bg-blue-600 hover:bg-blue-700';
            default:
                return 'bg-yellow-600 hover:bg-yellow-700';
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[200] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`p-6 rounded-3xl shadow-2xl w-full max-w-md m-4 border transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center mb-4">
                    {getIcon()}
                    <h3 className={`text-xl font-bold ml-3 ${getTitleClass()}`}>{title}</h3>
                    <button onClick={handleClose} className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
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
            </div>
        </div>
    );
};

const PermissionsPage = () => {
  const { theme, permissionsdata, userData, setPermissionsData } = useContext(Context);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchedObject, setMatchedObject] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    isOpen: false,
    type: '',
    title: '',
    message: ''
  });

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null,
    type: 'warning',
    isConfirming: false
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const userRole = userData?.roles[0]?.toUpperCase();
  const loggedinuserRole = userRole ? userRole : null;

  console.log('Searching for role:', loggedinuserRole);

  const matchedRoleObject = permissionsdata.find(
    role => role.roleName.trim() === loggedinuserRole.trim()
  );

  useEffect(() => {
    if (matchedRoleObject) {
      setMatchedObject(matchedRoleObject);
    }
  }, [matchedRoleObject]);

  console.log('Found object:', matchedObject);
  
  const [newPermissionLabel, setNewPermissionLabel] = useState('');
  const [allPermissionOptions, setAllPermissionOptions] = useState([]);

  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [isAddingRole, setIsAddingRole] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Custom notification handlers
  const showNotification = (type, title, message) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeNotification = () => {
    setNotification({
      isOpen: false,
      type: '',
      title: '',
      message: ''
    });
  };

  // Custom confirmation handlers
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

  const createPermissionOptionsFromAPI = () => {
    if (!permissionsdata || !Array.isArray(permissionsdata)) return [];
    const allPermissionsFromAPI = permissionsdata.flatMap(role => role.permissions || []);
    const uniquePermissions = [...new Set(allPermissionsFromAPI)];
    const permissionOptions = uniquePermissions.map(permission => {
      let label = permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
      if (permission === 'CREAT_USER') label = 'Create User';
      if (permission === 'DELETE_USER') label = 'Delete User';
      if (permission === 'CREATE_TASK') label = 'Create Task';
      if (permission === 'VIEW_TASKS') label = 'View Tasks';
      if (permission === 'VIEW_REPORTS') label = 'View Reports';
      if (permission === 'PERMISSIONS_BUTTENS') label = 'Permissions Buttons';
      if (permission === 'CREATE_HR') label = 'Create HR';
      return { value: permission, label };
    });
    return permissionOptions.sort((a, b) => a.label.localeCompare(b.label));
  };

  const mapAPIRoleToKey = (apiRoleName) => {
    if (!apiRoleName) return null;
    return apiRoleName.replace('ROLE_', '').toLowerCase();
  };

  const initializePermissionsFromAPI = () => {
    if (!permissionsdata || !Array.isArray(permissionsdata)) return {};
    const initialPermissions = {};
    permissionsdata.forEach(apiRole => {
      const roleKey = mapAPIRoleToKey(apiRole.roleName);
      if (roleKey) {
        initialPermissions[roleKey] = {
          id: apiRole.id,
          permissions: apiRole.permissions ? [...new Set(apiRole.permissions)] : []
        };
      }
    });
    return initialPermissions;
  };
  
  const handleAddPermission = () => {
    if (!newPermissionLabel.trim()) {
      showNotification('error', 'Validation Error', 'Please enter a label for the new permission.');
      return;
    }
    const newPermissionValue = newPermissionLabel.trim().toUpperCase().replace(/\s+/g, '_');
    if (allPermissionOptions.some(option => option.value === newPermissionValue)) {
      showNotification('error', 'Duplicate Permission', 'A permission with this value already exists.');
      return;
    }
    const newPermission = { value: newPermissionValue, label: newPermissionLabel.trim() };
    setAllPermissionOptions(prevOptions => [...prevOptions, newPermission].sort((a, b) => a.label.localeCompare(b.label)));
    setNewPermissionLabel('');
    showNotification('success', 'Permission Added', 'New permission has been added successfully.');
  };

  useEffect(() => {
    if (permissionsdata && Array.isArray(permissionsdata)) {
      const permissionOptions = createPermissionOptionsFromAPI();
      setAllPermissionOptions(permissionOptions);
      const initializedPermissions = initializePermissionsFromAPI();
      setPermissions(initializedPermissions);
      setLoading(false);
      setIsLoaded(true);
    } else { setLoading(false); }
  }, [permissionsdata]);

  const handleSelectionChange = (selectedOptions, role) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setPermissions(prev => ({
      ...prev,
      [role]: { ...prev[role], permissions: selectedValues }
    }));
  };

  const handleAddNewRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleName.toUpperCase().startsWith('ROLE_')) {
      showNotification('error', 'Invalid Role Name', "Please enter a valid role name starting with 'ROLE_'.");
      return;
    }
    const roleKey = mapAPIRoleToKey(newRoleName);
    if (permissions[roleKey]) {
      showNotification('error', 'Role Already Exists', 'This role already exists.');
      return;
    }
    setIsAddingRole(true);
    const newRoleDto = {
      roleName: newRoleName.trim().toUpperCase(),
      permissions: []
    };
    try {
      await authApi.post('/role-access', newRoleDto);
      const response = await authApi.get('/role-access/all');
      setPermissionsData(response.data);
      setIsAddRoleModalOpen(false);
      setNewRoleName('');
      showNotification('success', 'Role Created Successfully', `Role '${newRoleDto.roleName}' created successfully and UI has been updated!`);
    } catch (error) {
      console.error("Failed to create new role or refresh data:", error);
      const errorMessage = error.response?.data?.message || "An error occurred.";
      showNotification('error', 'Role Creation Failed', `Error: ${errorMessage}`);
    } finally {
      setIsAddingRole(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const transformedPermissions = Object.keys(permissions).map(key => {
      const rolePayload = {
        roleName: `ROLE_${key.toUpperCase()}`,
        permissions: permissions[key].permissions || [],
      };
      if (permissions[key].id !== null) {
        rolePayload.id = permissions[key].id;
      }
      return rolePayload;
    });

    try {
      await authApi.post('role-access/updateAll', transformedPermissions);
      const response = await authApi.get('/role-access/all');
      setPermissionsData(response.data);
      showNotification('success', 'Permissions Saved', 'Permissions have been saved successfully!');
    } catch (error) {
      console.error("Error saving permissions:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while saving permissions.";
      showNotification('error', 'Save Failed', `Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (permissionsdata && Array.isArray(permissionsdata)) {
      const initializedPermissions = initializePermissionsFromAPI();
      setPermissions(initializedPermissions);
      showNotification('success', 'Permissions Reset', 'Permissions have been reset to their original state.');
    }
  };

  const handleCheckboxChange = (roleKey) => {
    setRoleToDelete(prev => (prev === roleKey ? null : roleKey));
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) {
      showNotification('error', 'No Role Selected', 'Please select a role to delete.');
      return;
    }
    
    const roleToDeleteName = `ROLE_${roleToDelete.toUpperCase()}`;
    
    showConfirmModal(
      'Delete Role',
      `Are you sure you want to delete the role: ${roleToDeleteName}? This action cannot be undone.`,
      'Delete Role',
      async () => {
        setConfirmModal(prev => ({ ...prev, isConfirming: true }));
        try {
          const callerRole = 'ADMIN';
          await authApi.delete(`role-access/delete/${callerRole}/${roleToDeleteName}`);
          const response = await authApi.get('/role-access/all');
          setPermissionsData(response.data);
          closeConfirmModal();
          showNotification('success', 'Role Deleted', `Role '${roleToDeleteName}' has been deleted successfully.`);
          setRoleToDelete(null);
          setIsEditMode(false);
        } catch (error) {
          console.error("Failed to delete role:", error);
          const errorMessage = error.response?.data?.message || "An error occurred while deleting the role.";
          closeConfirmModal();
          showNotification('error', 'Delete Failed', `Error: ${errorMessage}`);
        }
      },
      'danger'
    );
  };

  const customSelectStyles = { /* Your custom styles */ };
  if (loading) { return <div>Loading...</div> }
  const rolesToRender = Object.keys(permissions).sort();

  return (
    <>
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className={`p-6 rounded-3xl shadow-2xl w-full max-w-md m-4 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center mb-4">
              <FaInfoCircle className="w-6 h-6 text-blue-500" />
              <h2 className={`text-xl font-bold ml-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Add a New Role</h2>
              <button 
                onClick={() => setIsAddRoleModalOpen(false)} 
                className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddNewRole}>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="ROLE_ROLENAME"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 mb-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <div className="flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddRoleModalOpen(false)} 
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`} 
                  disabled={isAddingRole}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center" 
                  disabled={isAddingRole}
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

      <div className={`min-h-screen px-0 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8 px-4 sm:px-0 flex justify-between items-center">
            <div>
              {matchedObject?.permissions?.includes("DELETE_USER") && (
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Permissions Management
                </h1>
              )}
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Configure role-based permissions</p>
            </div>
            <div>
              <button 
                onClick={() => { setIsEditMode(!isEditMode); setRoleToDelete(null); }}
                className={`p-3 rounded-full transition-colors duration-200 ${isEditMode ? 'bg-blue-600 text-white' : (theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')}`}
                title={isEditMode ? "Cancel Edit" : "Edit Roles"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
              </button>
            </div>
          </div>
          
          <div className={`p-4 sm:p-6 rounded-lg shadow-md mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Add a New Permission</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input type="text" value={newPermissionLabel} onChange={(e) => setNewPermissionLabel(e.target.value)} placeholder="Enter new permission label" className={`flex-grow p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  <button type="button" onClick={handleAddPermission} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Add Permission</button>
                </div>
              </div>
              <div className="flex-shrink-0 mt-4 sm:mt-0">
                 <h3 className="text-lg font-semibold mb-2 text-transparent select-none hidden sm:block">.</h3>
                 <button onClick={() => setIsAddRoleModalOpen(true)} className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Add New Role</button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {rolesToRender.map((role) => {
              const selectedPermissionsForRole = allPermissionOptions.filter(
                option => permissions[role]?.permissions?.includes(option.value)
              );
              return (
                <div key={role} className={`mx-4 sm:mx-0 rounded-lg shadow-md border transition-all duration-300 ${roleToDelete === role ? 'border-red-500 ring-2 ring-red-500/50' : (theme === 'dark' ? 'border-gray-700' : 'border-gray-200')}`}>
                  <div className="p-4 sm:p-6 md:p-8 flex items-start gap-4">
                    {isEditMode && (
                      <input type="checkbox" className="mt-2 h-6 w-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 cursor-pointer" checked={roleToDelete === role} onChange={() => handleCheckboxChange(role)} disabled={roleToDelete !== null && roleToDelete !== role} />
                    )}
                    <div className="flex-grow">
                      <h2 className={`text-lg sm:text-xl font-semibold capitalize mb-4 pb-2 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>{role.replace(/_/g, ' ')}</h2>
                      <Select isMulti options={allPermissionOptions} value={selectedPermissionsForRole} onChange={selectedOptions => handleSelectionChange(selectedOptions, role)} styles={customSelectStyles} placeholder="Select permissions..." closeMenuOnSelect={false} isDisabled={isEditMode} />
                      <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{selectedPermissionsForRole.length} permission(s) selected</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="pt-4 sm:pt-6 px-4 sm:px-0">
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                {isEditMode ? (
                  <button type="button" onClick={handleDeleteRole} disabled={!roleToDelete} className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg disabled:bg-red-400 disabled:cursor-not-allowed">Delete Selected Role</button>
                ) : (
                  <>
                    <button type="button" onClick={handleReset} className={`w-full sm:w-auto px-6 py-3 border-2 rounded-lg font-semibold ${theme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Reset</button>
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg ${isSubmitting ? 'cursor-not-allowed opacity-75' : 'hover:shadow-lg'}`}>
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Permissions'
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
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
