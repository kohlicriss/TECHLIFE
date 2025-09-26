import React, { useState, useContext, useEffect } from 'react';
import Select from 'react-select';
import { Context } from '../HrmsContext';
import { publicinfoApi } from '../../../../axiosInstance';

const PermissionsPage = () => {
  const { theme, permissionsdata, userData } = useContext(Context);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [newPermissionLabel, setNewPermissionLabel] = useState('');
  
  const [allPermissionOptions, setAllPermissionOptions] = useState([
    { value: 'createTask', label: 'Create Task' },
    { value: 'viewTeams', label: 'View Teams' },
    { value: 'createTaskHistory', label: 'Create Task History' },
    { value: 'createEmployee', label: 'Create Employee' },
    { value: 'viewDocuments', label: 'View Documents' },
    { value: 'viewProfile', label: 'View Profile' },
  ]);

  const roleMeta = [
    { key: "hr", roleName: "HR" },
    { key: "manager", roleName: "MANAGER" },
    { key: "team_lead", roleName: "TEAM_LEAD" },
    { key: "employee", roleName: "EMPLOYEE" },
    { key: "admin", roleName: "ADMIN" },
  ];

  const hasUserPermission = (requiredPermission) => {
    try {
      if (!permissionsdata || !Array.isArray(permissionsdata)) {
        return false;
      }

      let currentUserRole = null;
      if (userData && userData.roles && userData.roles[0]) {
        currentUserRole = userData.roles[0];
      } else {
        currentUserRole = localStorage.getItem('userRole');
      }

      if (!currentUserRole) {
        return false;
      }

      const userRoleData = permissionsdata.find(role => {
        const roleNameVariations = [
          currentUserRole,
          currentUserRole.replace('ROLE_', ''),
          `ROLE_${currentUserRole}`,
          currentUserRole.toUpperCase(),
          currentUserRole.toLowerCase()
        ];
        return roleNameVariations.includes(role.roleName);
      });

      if (!userRoleData) {
        return false;
      }
      
      // Check if the required permission exists in user's permissions array
      const hasPermission = userRoleData.permissions && userRoleData.permissions.includes(requiredPermission);
      
      return hasPermission;
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  };

  // Create User button click handler
  const handleCreateUser = () => {
    // Add your create user logic here
    alert('Create User functionality will be implemented here!');
  };

  // Function to add the new permission to the options list
  const handleAddPermission = () => {
    if (!newPermissionLabel.trim()) {
      alert("Please enter a label for the new permission.");
      return;
    }

    // Sanitize the label to create a computer-friendly value (e.g., "View Reports" -> "viewReports")
    const newPermissionValue = newPermissionLabel
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .split(' ')
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');

    // Check for duplicates
    if (allPermissionOptions.some(option => option.value === newPermissionValue)) {
      alert("A permission with this value already exists.");
      return;
    }

    const newPermission = {
      value: newPermissionValue,
      label: newPermissionLabel.trim(),
    };

    setAllPermissionOptions(prevOptions => [...prevOptions, newPermission]);
    setNewPermissionLabel(''); // Clear the input field after adding
  };

  useEffect(() => {
    const loadFromLocalStorage = () => {
      const saved = localStorage.getItem("permissionsData");
      if (saved) {
        try {
          const parsedData = JSON.parse(saved);
          return parsedData;
        } catch (error) {
          console.error("Error parsing saved permissions data:", error);
        }
      }
      return null;
    };

    const fetchPermissions = async () => {
      setLoading(true);
      
      const savedPermissions = loadFromLocalStorage();
      
      try {
        const response = await publicinfoApi.get('/permissions/all');
        const apiPermissions = response.data;
        
        if (savedPermissions) {
          setPermissions(savedPermissions);
        } else {
          setPermissions(apiPermissions);
        }
      } catch (error) {
        console.error("Failed to fetch permissions from API", error);
        
        if (savedPermissions) {
          setPermissions(savedPermissions);
        } else {
          setPermissions({
            employee: [],
            team_lead: [],
            admin: [],
            hr: [],
            manager: [],
          });
        }
      } finally {
        setLoading(false);
        setIsLoaded(true); 
      }
    };

    fetchPermissions();
  }, []);

  useEffect(() => {
    if (isLoaded && permissions) {
      localStorage.setItem("permissionsData", JSON.stringify(permissions));
    }
  }, [permissions, isLoaded]);

  const handleSelectionChange = (selectedOptions, role) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setPermissions(prev => ({
      ...prev,
      [role]: selectedValues,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const transformedPermissions = roleMeta.map(({ key, roleName }) => ({
      roleName,
      permissions: permissions[key] || [],
    }));

    try {
      localStorage.removeItem("permissionsData");
      alert("Permissions data printed to console and localStorage cleared!");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("permissionsData");
    window.location.reload();
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
      borderColor: state.isFocused 
        ? '#3b82f6' 
        : theme === 'dark' ? '#4b5563' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
      borderRadius: '0.5rem',
      minHeight: '44px',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : (theme === 'dark' ? '#6b7280' : '#a5b4fc'),
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#374151' : 'white',
      borderRadius: '0.5rem',
      border: theme === 'dark' ? '1px solid #4b5563' : '1px solid #d1d5db',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 50,
      fontSize: '14px',
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
        ? (theme === 'dark' ? '#4b5563' : '#eef2ff')
        : 'transparent',
      color: state.isSelected 
        ? 'white' 
        : (theme === 'dark' ? 'white' : 'black'),
      padding: '12px 16px',
      fontSize: '14px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: state.isSelected 
          ? '#3b82f6' 
          : (theme === 'dark' ? '#4b5563' : '#eef2ff'),
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#4b5563' : '#e0e7ff',
      borderRadius: '6px',
      margin: '2px',
      fontSize: '13px',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: theme === 'dark' ? 'white' : '#1e3a8a',
      fontSize: '13px',
      fontWeight: '500',
      padding: '4px 8px',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#e0e7ff' : '#1e3a8a',
      borderRadius: '0 6px 6px 0',
      padding: '4px',
      ':hover': {
        backgroundColor: theme === 'dark' ? '#ef4444' : '#f87171',
        color: 'white',
      },
    }),
    input: (provided) => ({
      ...provided,
      color: theme === 'dark' ? 'white' : 'black',
      fontSize: '14px',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
      fontSize: '14px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === 'dark' ? 'white' : 'black',
      fontSize: '14px',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
      padding: '8px',
      ':hover': {
        color: theme === 'dark' ? '#d1d5db' : '#374151',
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
      padding: '8px',
      ':hover': {
        color: theme === 'dark' ? '#ef4444' : '#f87171',
      },
    }),
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base">Loading permissions...</p>
        </div>
      </div>
    );
  }

  if (!permissions) {
    return (
      <div className={`flex items-center justify-center min-h-screen p-4 sm:p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`text-center p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full ${theme === 'dark' ? 'bg-gray-800 text-red-400' : 'bg-white text-red-600'}`}>
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-2">Error Loading Permissions</h2>
          <p className="text-sm sm:text-base">Could not load permissions data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const roles = ['employee', 'team_lead', 'admin', 'hr', 'manager'];

  // Check if current user has CREAT_USER permission
  const canCreateUser = hasUserPermission('CREAT_USER');

  return (
    <div className={`min-h-screen px-0 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8 px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Permissions Management</h1>
              <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Configure role-based permissions for your organization
              </p>
            </div>
            
            {/* Create User Button - Conditional based on CREAT_USER permission */}
            {canCreateUser && (
              <div className="flex-shrink-0">
                <button
                  onClick={handleCreateUser}
                  className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-500/30 text-sm sm:text-base`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create User</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* New section for adding custom permissions */}
        <div className={`p-4 sm:p-6 rounded-lg shadow-md mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className="text-lg font-semibold mb-4">Add a New Permission</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newPermissionLabel}
              onChange={(e) => setNewPermissionLabel(e.target.value)}
              placeholder="Enter new permission label (e.g., View Reports)"
              className={`flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 focus:ring-blue-500' 
                  : 'bg-white border-gray-300 focus:ring-blue-500'
              }`}
            />
            <button
              type="button"
              onClick={handleAddPermission}
              className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200`}
            >
              Add Permission
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
          {roles.map((role) => {
            const selectedPermissionsForRole = allPermissionOptions.filter(
              option => permissions[role] && permissions[role].includes(option.value)
            );

            return (
              <div 
                key={role} 
                className={`mx-4 sm:mx-0 rounded-none sm:rounded-lg md:rounded-xl shadow-sm sm:shadow-md border ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                } transition-all duration-200`}
              >
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="mb-4 sm:mb-6">
                    <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold capitalize mb-2 pb-2 border-b ${
                      theme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
                    }`}>
                      {role.replace('_', ' ')}
                    </h2>
                    <p className={`text-xs sm:text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Select permissions for {role.replace('_', ' ').toLowerCase()} role
                    </p>
                  </div>

                  <div className="relative">
                    <Select
                      isMulti
                      options={allPermissionOptions}
                      value={selectedPermissionsForRole}
                      onChange={selectedOptions => handleSelectionChange(selectedOptions, role)}
                      styles={customSelectStyles}
                      placeholder="Select permissions..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      menuPosition="absolute"
                      noOptionsMessage={() => "No permissions available"}
                      isClearable={true}
                      isSearchable={true}
                      hideSelectedOptions={false}
                      closeMenuOnSelect={false}
                      blurInputOnSelect={false}
                    />
                  </div>

                  <div className="mt-3 sm:mt-4">
                    <p className={`text-xs sm:text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {selectedPermissionsForRole.length} permission{selectedPermissionsForRole.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div className="pt-4 sm:pt-6 px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleReset} 
                className={`w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 border-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/20 text-sm sm:text-base ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                }`}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30 text-sm sm:text-base ${
                  isSubmitting 
                    ? 'cursor-not-allowed opacity-75 transform-none' 
                    : 'hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 sm:h-5 sm:w-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Permissions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PermissionsPage;
