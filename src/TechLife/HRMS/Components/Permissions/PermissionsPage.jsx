import React, { useState, useContext, useEffect } from 'react';
import Select from 'react-select';
import { Context } from '../HrmsContext';
import { publicinfoApi } from '../../../../axiosInstance';

const PermissionsPage = () => {
  const { theme } = useContext(Context);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define all available permissions for the dropdown
  const allPermissionOptions = [
    { value: 'createTask', label: 'Create Task' },
    { value: 'viewTeams', label: 'View Teams' },
    { value: 'createTaskHistory', label: 'Create Task History' },
    { value: 'createEmployee', label: 'Create Employee' },
    { value: 'viewDocuments', label: 'View Documents' },
    { value: 'viewProfile', label: 'View Profile' },
  ];

  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true);
      try {
        const response = await publicinfoApi.get('/permissions/all');
        setPermissions(response.data);
      } catch (error) {
        console.error("Failed to fetch permissions, using default.", error);
        // Set all roles to empty arrays initially
        setPermissions({
          employee: [],
          team_lead: [],
          admin: [],
          hr: [],
          manager: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  // Directly store selected permission names for each role in permissions state
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
    console.log("Submitting permissions:", permissions);
    
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#1f2937' : 'white',
      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: theme === 'dark' ? '#6b7280' : '#a5b4fc',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#374151' : 'white',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
        ? (theme === 'dark' ? '#4b5563' : '#eef2ff')
        : 'transparent',
      color: theme === 'dark' ? 'white' : 'black',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#4b5563' : '#e0e7ff',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: theme === 'dark' ? 'white' : '#1e3a8a',
    }),
    input: (provided) => ({
      ...provided,
      color: theme === 'dark' ? 'white' : 'black',
    }),
  };

  if (loading)
    return <div className={`p-6 ${theme === 'dark' ? 'text-white' : ''}`}>Loading Permissions...</div>;

  if (!permissions)
    return <div className={`p-6 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Could not load permissions data.</div>;

  const roles = ['employee', 'team_lead', 'admin', 'hr', 'manager'];

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <h1 className="text-3xl font-bold mb-6">Permissions Form</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {roles.map(role => {
          // selected permissions (array of strings) → filter all options to get objects for react-select value
          const selectedPermissionsForRole = allPermissionOptions.filter(
            option => permissions[role] && permissions[role].includes(option.value)
          );
          return (
            <div key={role} className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-2xl font-semibold capitalize mb-4 border-b pb-2">{role.replace('_', ' ')}</h2>
              <Select
                isMulti
                options={allPermissionOptions}
                value={selectedPermissionsForRole}
                onChange={selectedOptions => handleSelectionChange(selectedOptions, role)}
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles}
                placeholder="Select permissions..."
              />
            </div>
          );
        })}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PermissionsPage;
