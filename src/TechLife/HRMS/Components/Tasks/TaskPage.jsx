import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, X, Plus, Trash2, Upload, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { Context } from "../HrmsContext";

const CalendarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 mr-1.5 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
);

const TasksPage = () => {
    const navigate = useNavigate();
    const { employeeId } = useParams();
    const { userData } = useContext(Context);

    const [tasks, setTasks] = useState([]);
    const [assignedByMeTasks, setAssignedByMeTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [sortOption, setSortOption] = useState("none");
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const [displayMode, setDisplayMode] = useState("ASSIGNED_BY_ME");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [files, setFiles] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [submissionError, setSubmissionError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        createdBy: '',
        assignedTo: '',
        status: 'Not Started',
        priority: 'Medium',
        createdDate: new Date().toISOString().split('T')[0],
        completedDate: '',
        dueDate: '',
        rating: '',
        remark: '',
        completionNote: '',
        relatedLinks: [''],
        attachedFileLinks: [],
        projectId: ''
    });

    const fetchTasks = useCallback(async () => {
        if (!userData) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            let apiUrl;
            const userRole = userData.roles[0];
            const userId = userData.employeeId;
            if (userRole === "TEAM_LEAD" && employeeId) {
                apiUrl = `http://192.168.0.120:8090/api/all/tasks/${employeeId}`;
            } else {
                apiUrl = `http://192.168.0.120:8090/api/all/tasks/${userId}`;
            }
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn("No tasks found for the user.");
                    setTasks([]);
                    setError(null);
                    return;
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const responseText = await response.text();
            if (!responseText) {
                console.warn("Received an empty response for user tasks. Setting tasks to empty array.");
                setTasks([]);
                return;
            }
            const data = JSON.parse(responseText);
            setTasks(data);
            setError(null);
        } catch (err) {
            setError("Failed to fetch tasks. Please make sure the server is running and the API is returning valid JSON.");
            console.error("Error in fetchTasks:", err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [userData, employeeId]);

    const fetchTasksAssignedByMe = useCallback(async () => {
        if (userData?.roles[0] !== "TEAM_LEAD" || !userData?.employeeId) {
            setAssignedByMeTasks([]);
            return;
        }
        try {
            const tlId = userData.employeeId;
            const url = `http://192.168.0.120:8090/api/${tlId}`;
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) {
                    setAssignedByMeTasks([]);
                    return;
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setAssignedByMeTasks(data || []);
        } catch (err) {
            setError(`Failed to fetch tasks assigned by Team Lead: ${err.message}`);
            setAssignedByMeTasks([]);
        }
    }, [userData]);

    useEffect(() => {
        if (userData) {
            fetchTasks();
            if (userData.roles[0] === "TEAM_LEAD") {
                fetchTasksAssignedByMe();
            }
        }
    }, [fetchTasks, fetchTasksAssignedByMe, userData]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calculateTimeCompletedBar = (startDateStr, dueDateStr, currentDate) => {
        const startDate = new Date(startDateStr);
        const dueDate = new Date(dueDateStr);
        if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime()) || startDate > dueDate) {
            return 0;
        }
        const totalDuration = dueDate.getTime() - startDate.getTime();
        if (totalDuration <= 0) {
            return currentDate >= dueDate ? 100 : 0;
        }
        const elapsedDuration = currentDate.getTime() - startDate.getTime();
        return Math.round(Math.max(0, Math.min(100, (elapsedDuration / totalDuration) * 100)));
    };

    const clickHandler = (projectId, id) => {
        navigate(`taskview/${projectId}/${id}`);
    };

    const getPriorityStyles = (priority) => {
        switch (priority?.toUpperCase()) {
            case "HIGH": return "bg-red-50 text-red-700 border-red-100";
            case "MEDIUM": return "bg-yellow-50 text-yellow-700 border-yellow-100";
            case "LOW": return "bg-blue-50 text-blue-700 border-blue-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    const getStatusStyles = (status) => {
        switch (status?.toUpperCase().replace(" ", "_")) {
            case "IN_PROGRESS": return "bg-purple-50 text-purple-700";
            case "PENDING": return "bg-orange-50 text-orange-700";
            case "COMPLETED": return "bg-green-50 text-green-700";
            default: return "bg-gray-50 text-gray-700";
        }
    };

    const getStatusDot = (status) => {
        switch (status?.toUpperCase().replace(" ", "_")) {
            case "IN_PROGRESS": return "bg-purple-500";
            case "PENDING": return "bg-orange-500";
            case "COMPLETED": return "bg-green-500";
            default: return "bg-gray-500";
        }
    };

    const handleFilterChange = (event) => setFilterStatus(event.target.value);
    const handleSortChange = (event) => setSortOption(event.target.value);

    const resetFormData = () => {
        setFormData({
            id: '',
            title: '',
            description: '',
            createdBy: userData?.employeeId || '',
            assignedTo: '',
            status: 'Not Started',
            priority: 'Medium',
            createdDate: new Date().toISOString().split('T')[0],
            completedDate: '',
            dueDate: '',
            rating: '',
            remark: '',
            completionNote: '',
            relatedLinks: [''],
            attachedFileLinks: [],
            projectId: ''
        });
        setFiles([]);
        setFormErrors({});
        setSubmissionError('');
    };

    const handleCreateClick = () => {
        setFormMode('create');
        resetFormData();
        setIsFormOpen(true);
    };

    const handleEditClick = (e, task) => {
        e.stopPropagation();
        setFormMode('edit');
        setFormData({
            ...task,
            relatedLinks: task.relatedLinks?.length ? task.relatedLinks : [''],
            attachedFileLinks: task.attachedFileLinks || [],
            createdDate: task.createdDate || new Date().toISOString().split('T')[0],
            completedDate: task.completedDate || '',
            dueDate: task.dueDate || '',
            projectId: task.projectId || task.id?.projectId || ''
        });
        setFiles([]);
        setFormErrors({});
        setSubmissionError('');
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        resetFormData();
    };

    const validateForm = () => {
        const newErrors = {};
        if (formMode === 'create' && (!formData.id || formData.id.trim() === '')) {
            newErrors.id = 'Task ID is required';
        }
        if (!formData.title || formData.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }
        if (formData.title && formData.title.length > 100) {
            newErrors.title = 'Title cannot exceed 100 characters';
        }
        if (!formData.assignedTo) {
            newErrors.assignedTo = 'Assigned to is required';
        }
        if (!formData.dueDate) {
            newErrors.dueDate = 'Due date is required';
        }
        if (!formData.projectId) {
            newErrors.projectId = 'Project ID is required';
        }
        if (formData.description && formData.description.length > 255) {
            newErrors.description = 'Description cannot exceed 255 characters';
        }
        if (formData.remark && formData.remark.length > 200) {
            newErrors.remark = 'Remark cannot exceed 200 characters';
        }
        if (formData.completionNote && formData.completionNote.length > 200) {
            newErrors.completionNote = 'Completion note cannot exceed 200 characters';
        }
        if (formData.rating && (formData.rating < 1 || formData.rating > 5)) {
            newErrors.rating = 'Rating must be between 1 and 5';
        }
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (submissionError) {
            setSubmissionError('');
        }
    };

    const handleRelatedLinkChange = (index, value) => {
        const newLinks = [...formData.relatedLinks];
        newLinks[index] = value;
        setFormData(prev => ({ ...prev, relatedLinks: newLinks }));
        if (submissionError) {
            setSubmissionError('');
        }
    };

    const addRelatedLink = () => {
        setFormData(prev => ({ ...prev, relatedLinks: [...prev.relatedLinks, ''] }));
    };

    const removeRelatedLink = (index) => {
        setFormData(prev => ({ ...prev, relatedLinks: prev.relatedLinks.filter((_, i) => i !== index) }));
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
        if (submissionError) {
            setSubmissionError('');
        }
    };

    const removeFile = (fileIndex) => {
        setFiles(prevFiles => prevFiles.filter((_, index) => index !== fileIndex));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        setSubmissionError('');
        try {
            const formDataToSend = new FormData();
            const taskPayload = {
                id: formData.id,
                title: formData.title,
                description: formData.description || null,
                createdBy: userData.employeeId,
                assignedTo: formData.assignedTo,
                status: formData.status,
                priority: formData.priority,
                createdDate: formData.createdDate,
                dueDate: formData.dueDate,
                completedDate: formData.completedDate || null,
                rating: formData.rating ? parseInt(formData.rating) : null,
                remark: formData.remark || null,
                completionNote: formData.completionNote || null,
                relatedLinks: formData.relatedLinks.filter(link => link.trim() !== ''),
                projectId: formData.projectId,
            };
            formDataToSend.append(
                'taskDTO',
                new Blob([JSON.stringify(taskPayload)], { type: 'application/json' })
            );
            if (files?.length > 0) {
                files.forEach(file => {
                    formDataToSend.append('attachedFileLinks', file);
                });
            }
            let url;
            let method;
            if (formMode === 'create') {
                url = `http://192.168.0.120:8090/api/${userData.employeeId}/${formData.assignedTo}/${formData.projectId}/task`;
                method = 'post';
            } else {
                url = `http://192.168.0.120:8090/api/${userData.employeeId}/${formData.assignedTo}/${formData.projectId}/task`;
                method = 'put';
            }
            console.log("Submitting Request...");
            console.log("URL:", method.toUpperCase(), url);
            console.log("Payload (taskDTO):", taskPayload);
            console.log("Files attached:", files.length, files.map(f => f.name));
            const response = await axios({
                method,
                url,
                data: formDataToSend,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log("Success:", response.data);
            fetchTasks();
            if (userData.roles[0] === "TEAM_LEAD") {
                fetchTasksAssignedByMe();
            }
            handleFormClose();
            alert(`Task ${formMode === 'create' ? 'created' : 'updated'} successfully!`);
        } catch (error) {
            console.error("Submission failed:", {
                error: error.message,
                response: error.response?.data
            });
            let errorMsg = error.message;
            if (error.response?.data) {
                errorMsg = typeof error.response.data === 'string'
                    ? error.response.data
                    : JSON.stringify(error.response.data);
            }
            setSubmissionError(`Failed to ${formMode === 'create' ? 'create' : 'update'} task: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredAndSortedTasks = useMemo(() => {
        return tasks
            .filter(task => filterStatus === "ALL" || task.status?.toUpperCase().replace(" ", "_") === filterStatus)
            .sort((a, b) => {
                if (sortOption === "startDateAsc") return new Date(a.startDate) - new Date(b.startDate);
                if (sortOption === "priorityDesc") {
                    const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
                    return priorityOrder[a.priority?.toUpperCase()] - priorityOrder[b.priority?.toUpperCase()];
                }
                return 0;
            });
    }, [tasks, filterStatus, sortOption]);

    const filteredAndSortedAssignedByMeTasks = useMemo(() => {
        return assignedByMeTasks
            .filter(task => filterStatus === "ALL" || task.status?.toUpperCase().replace(" ", "_") === filterStatus)
            .sort((a, b) => {
                if (sortOption === "startDateAsc") return new Date(a.createdDate) - new Date(b.createdDate);
                if (sortOption === "priorityDesc") {
                    const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
                    return priorityOrder[a.priority?.toUpperCase()] - priorityOrder[b.priority?.toUpperCase()];
                }
                return 0;
            });
    }, [assignedByMeTasks, filterStatus, sortOption]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading tasks...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>;
    }

    const isTeamLead = userData?.roles[0] === "TEAM_LEAD";

    const renderTaskTable = (taskList, tableTitle, noTasksMessage, showAssignedTo) => (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{tableTitle}</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200/80">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Task Title</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Priority</th>
                                {showAssignedTo && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned To</th>}
                                {(!isTeamLead || displayMode === "MY_TASKS") && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned By</th>}
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Start Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Progress</th>
                                {showAssignedTo && isTeamLead && <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {taskList.length > 0 ? taskList.map(task => {
                                const timeCompletedBar = calculateTimeCompletedBar(task.startDate || task.createdDate, task.dueDate, today);
                                const progressBarColor = timeCompletedBar <= 50 ? 'bg-green-500' : timeCompletedBar <= 75 ? 'bg-yellow-500' : 'bg-red-500';
                                return (
                                    <tr key={`${task.id}-${task.projectId}`} onClick={() => clickHandler(task.projectId, task.id)} className="hover:bg-slate-50 cursor-pointer">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{task.title}</td>
                                        <td className="px-6 py-4"><span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${getStatusStyles(task.status)}`}><span className={`h-2 w-2 rounded-full inline-block ${getStatusDot(task.status)} mr-1`}></span>{task.status.replace("_", " ")}</span></td>
                                        <td className="px-6 py-4"><span className={`text-xs font-bold py-1 px-2.5 rounded-md border ${getPriorityStyles(task.priority)}`}>{task.priority}</span></td>
                                        {showAssignedTo && <td className="px-6 py-4 text-sm text-slate-800">{task.assignedTo}</td>}
                                        {(!isTeamLead || displayMode === "MY_TASKS") && <td className="px-6 py-4 text-sm text-slate-800">{task.createdBy}</td>}
                                        <td className="px-6 py-4 text-sm text-slate-500"><div className="flex items-center"><CalendarIcon />{task.startDate || task.createdDate}</div></td>
                                        <td className="px-6 py-4 text-sm text-slate-500"><div className="flex items-center"><CalendarIcon />{task.dueDate}</div></td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="w-24 bg-gray-200 rounded-full h-2.5"><div className={`${progressBarColor} h-full rounded-full`} style={{ width: `${timeCompletedBar}%` }}></div></div>
                                            <div className="text-right text-xs text-gray-600">{timeCompletedBar}%</div>
                                        </td>
                                        {showAssignedTo && isTeamLead && (
                                            <td className="px-6 py-4 text-sm">
                                                {task.createdBy === userData?.employeeId && (
                                                    <button
                                                        onClick={(e) => handleEditClick(e, task)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={isTeamLead ? (showAssignedTo ? 9 : 8) : (showAssignedTo ? 8 : 7)} className="text-center py-10 text-gray-500">{noTasksMessage}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const handleMyTasksClick = () => {
        setDisplayMode("MY_TASKS");
        setIsRightSidebarOpen(false);
    };

    const handleAssignedByMeClick = () => {
        setDisplayMode("ASSIGNED_BY_ME");
        setIsRightSidebarOpen(false);
    };

    const isMyTasksActive = displayMode === "MY_TASKS";
    const isAssignedByMeActive = displayMode === "ASSIGNED_BY_ME";

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 font-sans">
            {isTeamLead && !isRightSidebarOpen && (
                <button
                    onClick={() => setIsRightSidebarOpen(true)}
                    className="fixed right-0 top-1/2 -translate-y-1/2 p-2 rounded-l-lg bg-indigo-600 text-white shadow-lg z-50 hover:bg-indigo-700 transition-colors"
                    aria-label="Open Team Sidebar"
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            <div className={`flex-1 transition-all duration-300 ${isRightSidebarOpen ? 'md:mr-80' : 'mr-0'} p-4 sm:p-6 lg:p-8`}>
                {isRightSidebarOpen && isTeamLead && <div className="md:hidden fixed inset-0 bg-black opacity-50 z-30" onClick={() => setIsRightSidebarOpen(false)}></div>}

                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-800">Task Dashboard</h1>
                            <p className="mt-1 text-slate-500 text-lg">
                                Welcome, {userData?.firstName || userData?.employeeId}. You are viewing the task dashboard.
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex gap-4">
                            {isTeamLead && (
                                <button
                                    onClick={handleCreateClick}
                                    className="flex items-center justify-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700"
                                >
                                    <Plus size={18} className="mr-2"/> Create Task
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div>
                            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status:</label>
                            <select id="filterStatus" value={filterStatus} onChange={handleFilterChange} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm">
                                <option value="ALL">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sortOption" className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
                            <select id="sortOption" value={sortOption} onChange={handleSortChange} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm">
                                <option value="none">None</option>
                                <option value="startDateAsc">Start Date (Ascending)</option>
                                <option value="priorityDesc">Priority (High to Low)</option>
                            </select>
                        </div>
                    </div>

                    {isTeamLead ? (
                        displayMode === "MY_TASKS" ? (
                            renderTaskTable(filteredAndSortedTasks, "Tasks Assigned to You", "No tasks to display.", false)
                        ) : (
                            renderTaskTable(filteredAndSortedAssignedByMeTasks, "Tasks Assigned By You", "You have not assigned any tasks yet.", true)
                        )
                    ) : (
                        renderTaskTable(filteredAndSortedTasks, "Tasks Assigned to You", "No tasks to display.", false)
                    )}

                    {isFormOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center p-6 border-b">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {formMode === 'edit' ? 'Edit Task' : 'Create New Task'}
                                    </h2>
                                    <button onClick={handleFormClose} className="text-gray-500 hover:text-gray-700">
                                        <X size={24} />
                                    </button>
                                </div>
                                <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Task ID <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="id"
                                                value={formData.id}
                                                onChange={handleInputChange}
                                                readOnly={formMode === 'edit'}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${formErrors.id ? 'border-red-500' : 'border-gray-300'} ${formMode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500'}`}
                                                placeholder="Enter a unique task ID"
                                            />
                                            {formErrors.id && <p className="text-red-500 text-sm mt-1">{formErrors.id}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Project ID <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="projectId"
                                                value={formData.projectId}
                                                onChange={handleInputChange}
                                                readOnly={formMode === 'edit'}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${formErrors.projectId ? 'border-red-500' : 'border-gray-300'} ${formMode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500'}`}
                                                placeholder="Enter project ID"
                                            />
                                            {formErrors.projectId && <p className="text-red-500 text-sm mt-1">{formErrors.projectId}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Enter task title"
                                        />
                                        {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Enter task description"
                                        />
                                        {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="assignedTo"
                                                value={formData.assignedTo}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.assignedTo ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Enter employee ID"
                                            />
                                            {formErrors.assignedTo && <p className="text-red-500 text-sm mt-1">{formErrors.assignedTo}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                                            <input
                                                type="text"
                                                name="createdBy"
                                                value={formData.createdBy}
                                                onChange={handleInputChange}
                                                readOnly
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="Not Started">Not Started</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="On Hold">On Hold</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority <span className="text-red-500">*</span></label>
                                            <select
                                                name="priority"
                                                value={formData.priority}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="High">High</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Low">Low</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                                            <input
                                                type="date"
                                                name="createdDate"
                                                value={formData.createdDate}
                                                onChange={handleInputChange}
                                                readOnly
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
                                            <input
                                                type="date"
                                                name="dueDate"
                                                value={formData.dueDate}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {formErrors.dueDate && <p className="text-red-500 text-sm mt-1">{formErrors.dueDate}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Completed Date</label>
                                            <input
                                                type="date"
                                                name="completedDate"
                                                value={formData.completedDate}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                                            <input
                                                type="number"
                                                name="rating"
                                                value={formData.rating}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="5"
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.rating ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="1-5"
                                            />
                                            {formErrors.rating && <p className="text-red-500 text-sm mt-1">{formErrors.rating}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                                            <textarea
                                                name="remark"
                                                value={formData.remark}
                                                onChange={handleInputChange}
                                                rows={2}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.remark ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Enter remark"
                                            />
                                            {formErrors.remark && <p className="text-red-500 text-sm mt-1">{formErrors.remark}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Completion Note</label>
                                            <textarea
                                                name="completionNote"
                                                value={formData.completionNote}
                                                onChange={handleInputChange}
                                                rows={2}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.completionNote ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Enter completion note"
                                            />
                                            {formErrors.completionNote && <p className="text-red-500 text-sm mt-1">{formErrors.completionNote}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Related Links</label>
                                        {formData.relatedLinks.map((link, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <input
                                                    type="url"
                                                    value={link}
                                                    onChange={(e) => handleRelatedLinkChange(index, e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Enter related link URL"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeRelatedLink(index)}
                                                    className="px-3 py-2 text-red-600 hover:text-red-800"
                                                    disabled={formData.relatedLinks.length === 1}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addRelatedLink}
                                            className="flex items-center text-indigo-600 hover:text-indigo-800"
                                        >
                                            <Plus size={18} className="mr-1" />
                                            Add Related Link
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Attached Files</label>
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">Files (MAX. 10MB each)</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    accept="*/*"
                                                />
                                            </label>
                                        </div>
                                        {files.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                                                <ul className="space-y-2">
                                                    {files.map((file, index) => (
                                                        <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                                                            <span className="text-sm text-gray-800 truncate" title={file.name}>{file.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(index)}
                                                                className="text-red-500 hover:text-red-700 ml-4"
                                                                aria-label={`Remove ${file.name}`}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    {submissionError && (
                                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                            <div className="flex">
                                                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                                                <div>
                                                    <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                                                    <div className="mt-1 text-sm text-red-700">{submissionError}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-end space-x-4 pt-6 border-t">
                                        <button
                                            type="button"
                                            onClick={handleFormClose}
                                            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                        >
                                            {isSubmitting
                                                ? (formMode === 'edit' ? 'Updating...' : 'Creating...')
                                                : (formMode === 'edit' ? 'Update Task' : 'Create Task')
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isTeamLead && (
                <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-xl transform transition-transform duration-300 z-40 ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <button
                        onClick={() => setIsRightSidebarOpen(false)}
                        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors z-50"
                        aria-label="Close Team Sidebar"
                    >
                        <ChevronRight size={24} />
                    </button>
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-bold text-gray-800">Team Dashboard</h3>
                    </div>
                    <div className="p-4 space-y-2">
                        <button
                            onClick={handleMyTasksClick}
                            className={`w-full text-left p-2 rounded-md transition-colors flex items-center ${isMyTasksActive ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            <span className="font-semibold">My Tasks</span>
                        </button>
                        <button
                            onClick={handleAssignedByMeClick}
                            className={`w-full text-left p-2 rounded-md transition-colors flex items-center ${isAssignedByMeActive ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            <span className="font-semibold">Tasks Assigned By You</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksPage;
