import React, { useState, useContext, useEffect } from 'react';
import Select from 'react-select';
import { Context } from '../HrmsContext';
import { authApi } from '../../../../axiosInstance';

const PermissionsPage = () => {
  const { theme, permissionsdata, userData, setPermissionsData } = useContext(Context);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchedObject,setMatchedObject]=useState(null)

  const [isLoaded, setIsLoaded] = useState(false);
const userRole = userData?.roles[0]?.toUpperCase();

const loggedinuserRole = userRole ? userRole : null;

console.log('Searching for role:',loggedinuserRole);

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
      alert("Please enter a label for the new permission.");
      return;
    }
    const newPermissionValue = newPermissionLabel.trim().toUpperCase().replace(/\s+/g, '_');
    if (allPermissionOptions.some(option => option.value === newPermissionValue)) {
      alert("A permission with this value already exists.");
      return;
    }
    const newPermission = { value: newPermissionValue, label: newPermissionLabel.trim() };
    setAllPermissionOptions(prevOptions => [...prevOptions, newPermission].sort((a, b) => a.label.localeCompare(b.label)));
    setNewPermissionLabel('');
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
      alert("Please enter a valid role name starting with 'ROLE_'.");
      return;
    }
    const roleKey = mapAPIRoleToKey(newRoleName);
    if (permissions[roleKey]) {
      alert("This role already exists.");
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
      alert(`Role '${newRoleDto.roleName}' created successfully and UI has been updated!`);
    } catch (error) {
      console.error("Failed to create new role or refresh data:", error);
      const errorMessage = error.response?.data?.message || "An error occurred.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsAddingRole(false);
    }
  };

  // *** MODIFIED FUNCTION ***
  // Now sends the updated permissions to the `role-access/updateAll` endpoint.
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
      // Hitting the new endpoint as requested
      await authApi.post('role-access/updateAll', transformedPermissions);

      // Refresh data from the server to ensure UI is in sync
      const response = await authApi.get('/role-access/all');
      setPermissionsData(response.data);

      alert("Permissions have been saved successfully!");

    } catch (error) {
      console.error("Error saving permissions:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while saving permissions.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (permissionsdata && Array.isArray(permissionsdata)) {
        const initializedPermissions = initializePermissionsFromAPI();
        setPermissions(initializedPermissions);
        alert("Permissions have been reset to their original state.");
    }
  };

  const handleCheckboxChange = (roleKey) => {
    setRoleToDelete(prev => (prev === roleKey ? null : roleKey));
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) {
      alert("Please select a role to delete.");
      return;
    }
    const roleToDeleteName = `ROLE_${roleToDelete.toUpperCase()}`;
    if (!window.confirm(`Are you sure you want to delete the role: ${roleToDeleteName}? This action cannot be undone.`)) {
      return;
    }
    try {
      const callerRole = 'ADMIN';
      await authApi.delete(`role-access/delete/${callerRole}/${roleToDeleteName}`);
      const response = await authApi.get('/role-access/all');
      setPermissionsData(response.data);
      alert(`Role '${roleToDeleteName}' has been deleted successfully.`);
      setRoleToDelete(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to delete role:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while deleting the role.";
      alert(`Error: ${errorMessage}`);
    }
  };

  const customSelectStyles = { /* Your custom styles */ };
  if (loading) { return <div>Loading...</div> }
  const rolesToRender = Object.keys(permissions).sort();

  return (
    <>
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg shadow-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className="text-xl font-bold mb-4">Add a New Role</h2>
            <form onSubmit={handleAddNewRole}>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="ROLE_ROLENAME"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 mb-4 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsAddRoleModalOpen(false)} className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`} disabled={isAddingRole}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400" disabled={isAddingRole}>
                  {isAddingRole ? 'Adding...' : 'Add Role'}
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
                  <input type="text" value={newPermissionLabel} onChange={(e) => setNewPermissionLabel(e.target.value)} placeholder="Enter new permission label" className={`flex-grow p-3 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} />
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
                    <button type="button" onClick={handleReset} className={`w-full sm:w-auto px-6 py-3 border-2 rounded-lg font-semibold ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>Reset</button>
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg ${isSubmitting ? 'cursor-not-allowed' : ''}`}>{isSubmitting ? 'Saving...' : 'Save Permissions'}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PermissionsPage;
