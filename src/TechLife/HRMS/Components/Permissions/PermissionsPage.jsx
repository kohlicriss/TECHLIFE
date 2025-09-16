import React, { useState, useContext } from 'react';
import { Context } from '../HrmsContext'; 

const PermissionsPage = () => {
    const { theme } = useContext(Context);

    const [permissions, setPermissions] = useState({
        employee: {
            createEmployee: false,
            viewDocuments: true, // Default checked
            viewProfile: true, // Default checked
            viewTeams: false,
            createTask: false,
            createTaskHistory: false,
        },
        admin: {
            createEmployee: true,
            viewDocuments: true,
            viewProfile: true,
            viewTeams: true,
            createTask: false,
            createTaskHistory: true,
        },
        hr: {
            createEmployee: true,
            viewDocuments: true,
            viewProfile: true,
            viewTeams: true,
            createTask: true,
            createTaskHistory: true,
        },
        manager: {
            createEmployee: true,
            viewDocuments: true,
            viewProfile: true,
            viewTeams: true,
            createTask: true,
            createTaskHistory: true,
        },
    });

    const handleCheckboxChange = (role, permission) => {
        setPermissions(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [permission]: !prev[role][permission],
            },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Saving Permissions:", permissions);
        alert("Permissions saved! ( seee in Console )");
    };

    const roles = ['employee', 'admin', 'hr', 'manager'];

    return (
        <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            <h1 className="text-3xl font-bold mb-6">Permissions Form</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                {roles.map(role => (
                    <div key={role} className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className="text-2xl font-semibold capitalize mb-4 border-b pb-2">{role}</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(permissions[role]).map(permission => (
                                <label key={permission} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                                        checked={permissions[role][permission]}
                                        onChange={() => handleCheckboxChange(role, permission)}
                                    />
                                    <span className="capitalize">{permission.replace(/([A-Z])/g, ' $1')}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                    >
                        POST
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PermissionsPage;