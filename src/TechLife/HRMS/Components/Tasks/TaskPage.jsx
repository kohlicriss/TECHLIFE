import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, X, Plus, Trash2, Upload, AlertCircle, ChevronRight, ChevronLeft, CheckCircle, Info, XCircle } from "lucide-react";
import { Context } from "../HrmsContext";
import { publicinfoApi, tasksApi } from '../../../../axiosInstance';

const CalendarIcon = ({ theme }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 mr-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}
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

const Modal = ({ children, onClose, title, type, theme }) => {
    let titleClass = "";
    let icon = null;

    if (type === "success") {
        titleClass = "text-green-600";
        icon = <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (type === "error") {
        titleClass = "text-red-600";
        icon = <AlertCircle className="h-6 w-6 text-red-500" />;
    } else if (type === "confirm") {
        titleClass = "text-yellow-600";
        icon = <AlertCircle className="h-6 w-6 text-yellow-500" />;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[200] animate-fadeIn">
            <div className={`p-6 rounded-3xl shadow-2xl w-full max-w-md m-4 border animate-slideUp ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center mb-4">
                    {icon && <span className="mr-3">{icon}</span>}
                    <h3 className={`text-xl font-bold ${titleClass}`}>{title}</h3>
                </div>
                {children}
            </div>
        </div>
    );
};

const SuccessPopup = ({ message, onClose, theme }) => (
    <Modal onClose={onClose} title="Success" type="success" theme={theme}>
        <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{message}</p>
        <div className="flex justify-end">
            <button
                onClick={onClose}
                className="bg-green-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-green-700 transition-all duration-200 focus:ring-4 focus:ring-green-500/20"
            >
                OK
            </button>
        </div>
    </Modal>
);

const ErrorPopup = ({ message, onClose, theme }) => (
    <Modal onClose={onClose} title="Error" type="error" theme={theme}>
        <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{message}</p>
        <div className="flex justify-end">
            <button
                onClick={onClose}
                className="bg-red-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-red-700 transition-all duration-200 focus:ring-4 focus:ring-red-500/20"
            >
                OK
            </button>
        </div>
    </Modal>
);

const ConfirmDeletePopup = ({ onConfirm, onCancel, theme }) => (
    <Modal onCancel={onCancel} title="Confirm Deletion" type="confirm" theme={theme}>
        <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Are you sure you want to delete this task? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
            <button
                onClick={onCancel}
                className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-200 focus:ring-4 focus:ring-gray-400/20 ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
                Cancel
            </button>
            <button
                onClick={onConfirm}
                className="bg-red-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-red-700 transition-all duration-200 focus:ring-4 focus:ring-red-500/20"
            >
                Delete
            </button>
        </div>
    </Modal>
);

const TasksPage = () => {
    const navigate = useNavigate();
    const { employeeId } = useParams();
    const { userData, theme } = useContext(Context);

    const [tasks, setTasks] = useState([]);
    const [assignedByMeTasks, setAssignedByMeTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [sortOption, setSortOption] = useState("none");
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
    const [displayMode, setDisplayMode] = useState("ASSIGNED_BY_ME");
    const [projects, setProjects] = useState([]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [files, setFiles] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [submissionError, setSubmissionError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [currentNumber, setCurrentNumber] = useState(0); 
    const [totalPages, setTotalPages] = useState(1);
    const [dropdownValue, setDropdownValue] = useState(5);

    const [successPopup, setSuccessPopup] = useState({ show: false, message: '' });
    const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });
    const [confirmDeletePopup, setConfirmDeletePopup] = useState({ show: false, projectId: null, taskId: null });

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

    const handleNumberClick = (number) => {
        setCurrentNumber(number);
    };

    const handleDropdownChange = (event) => {
        const value = parseInt(event.target.value, 10);
        setDropdownValue(value);
    };

    const fetchTasks = useCallback(async () => {
        if (!userData) {
            setLoading(false);
            return;
        }
        try { 
            setLoading(true);
            const userRole = userData.roles[0];
            const userId = userData.employeeId;
            const apiUrl = (userRole === "TEAM_LEAD" && employeeId)
                ? `/${currentNumber}/${dropdownValue}/id/asc/all/tasks/${employeeId}`
                : `/${currentNumber}/${dropdownValue}/id/asc/all/tasks/${userId}`;
            
            const response = await tasksApi.get(apiUrl);

            console.log("API Response Data (fetchTasks):", response.data);
            setTasks(response.data.content || response.data.tasks || []);
            setTotalPages(response.data.totalPages || 1);
            setError(null);
        } catch (err) {
            console.error("Error in fetchTasks:", err);
            if (err.response?.status === 403) {
                setError("Authorization failed. You do not have permission to view these tasks. Please check your login status.");
            } else if (err.response?.status === 404) {
                setTasks([]);
            } else {
                setError("Failed to fetch tasks. Please make sure the server is running and you are logged in.");
            }
        } finally {
            setLoading(false);
        }
    }, [userData, employeeId, currentNumber, dropdownValue]);

    const fetchTasksAssignedByMe = useCallback(async () => {
        if (userData?.roles[0] !== "TEAM_LEAD" || !userData?.employeeId) {
            setAssignedByMeTasks([]);
            return;
        }
        try {
            const tlId = userData.employeeId;
            const url = `/${currentNumber}/${dropdownValue}/id/asc/${tlId}`;
            const response = await tasksApi.get(url);

            console.log("API Response Data (fetchTasksAssignedByMe):", response.data);
            setAssignedByMeTasks(response.data.content || response.data.tasks || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            console.error("Error in fetchTasksAssignedByMe:", err);
             if (err.response?.status === 403) {
                setError("Authorization failed. You do not have permission to view tasks assigned by you.");
            } else if (err.response?.status !== 404) {
                setError(`Failed to fetch tasks assigned by Team Lead: ${err.message}`);
            } else {
                setAssignedByMeTasks([]);
            }
        }
    }, [userData, currentNumber, dropdownValue]);



           useEffect(() => {
  const fetchProjects = async () => {
    try {
      const response = await publicinfoApi.get(`employee/0/20/projectId/asc/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  fetchProjects();
}, []);



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
        if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime()) || startDate > dueDate) return 0;
        const totalDuration = dueDate.getTime() - startDate.getTime();
        if (totalDuration <= 0) return currentDate >= dueDate ? 100 : 0;
        const elapsedDuration = currentDate.getTime() - startDate.getTime();
        return Math.round(Math.max(0, Math.min(100, (elapsedDuration / totalDuration) * 100)));
    };

    const clickHandler = (projectId, id) => {
        navigate(`taskview/${projectId}/${id}`);
    };

    const getPriorityStyles = (priority) => {
        if (theme === 'dark') {
            switch (priority?.toUpperCase()) {
                case "HIGH": return "text-red-400";
                case "MEDIUM": return "text-yellow-400";
                case "LOW": return "text-blue-400";
                default: return "text-gray-400";
            }
        } else {
            switch (priority?.toUpperCase()) {
                case "HIGH": return "bg-red-50 text-red-700 border-red-100";
                case "MEDIUM": return "bg-yellow-50 text-yellow-700 border-yellow-100";
                case "LOW": return "bg-blue-50 text-blue-700 border-blue-100";
                default: return "bg-gray-50 text-gray-700 border-gray-100";
            }
        }
    };

    const getStatusStyles = (status) => {
        if (theme === 'dark') {
            switch (status?.toUpperCase().replace(" ", "_")) {
                case "IN_PROGRESS": return "text-purple-400";
                case "PENDING": return "text-orange-400";
                case "COMPLETED": return "text-green-400";
                default: return "text-gray-400";
            }
        } else {
            switch (status?.toUpperCase().replace(" ", "_")) {
                case "IN_PROGRESS": return "bg-purple-50 text-purple-700";
                case "PENDING": return "bg-orange-50 text-orange-700";
                case "COMPLETED": return "bg-green-50 text-green-700";
                default: return "bg-gray-50 text-gray-700";
            }
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

    const handleDeleteTask = (e, projectId, taskId) => {
        e.stopPropagation();
        setConfirmDeletePopup({ show: true, projectId, taskId });
    };

    const confirmDelete = async () => {
        const { projectId, taskId } = confirmDeletePopup;
        if (!projectId || !taskId) return;

        try {
            const url = `/${projectId}/${taskId}/delete/task`;
            await tasksApi.delete(url);
            setSuccessPopup({ show: true, message: "Task deleted successfully!" });
            fetchTasks();
            fetchTasksAssignedByMe();
        } catch (error) {
            console.error("Failed to delete task:", error.response?.data || error.message);
            setErrorPopup({ show: true, message: "Failed to delete the task. Please try again." });
        } finally {
            setConfirmDeletePopup({ show: false, projectId: null, taskId: null });
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        resetFormData();
    };

    const validateForm = () => {
        const newErrors = {};
        if (formMode === 'create' && !formData.id.trim()) newErrors.id = 'Task ID is required';
        if (!formData.title || formData.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
        if (formData.title.length > 100) newErrors.title = 'Title cannot exceed 100 characters';
        if (!formData.assignedTo) newErrors.assignedTo = 'Assigned to is required';
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
        if (!formData.projectId) newErrors.projectId = 'Project ID is required';
        if (formData.description && formData.description.length > 255) newErrors.description = 'Description cannot exceed 255 characters';
        if (formData.remark && formData.remark.length > 200) newErrors.remark = 'Remark cannot exceed 200 characters';
        if (formData.completionNote && formData.completionNote.length > 200) newErrors.completionNote = 'Completion note cannot exceed 200 characters';
        if (formData.rating && (formData.rating < 1 || formData.rating > 5)) newErrors.rating = 'Rating must be between 1 and 5';
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
        if (submissionError) setSubmissionError('');
    };

    const handleRelatedLinkChange = (index, value) => {
        const newLinks = [...formData.relatedLinks];
        newLinks[index] = value;
        setFormData(prev => ({ ...prev, relatedLinks: newLinks }));
    };

    const addRelatedLink = () => {
        setFormData(prev => ({ ...prev, relatedLinks: [...prev.relatedLinks, ''] }));
    };

    const removeRelatedLink = (index) => {
        setFormData(prev => ({ ...prev, relatedLinks: prev.relatedLinks.filter((_, i) => i !== index) }));
    };

    const handleFileChange = (e) => {
        setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    };

    const removeFile = (fileIndex) => {
        setFiles(prev => prev.filter((_, index) => index !== fileIndex));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmissionError('');

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
        formDataToSend.append('taskDTO', new Blob([JSON.stringify(taskPayload)], { type: 'application/json' }));
        files.forEach(file => formDataToSend.append('attachedFileLinks', file));

        try {
            const url = `/${userData.employeeId}/${formData.assignedTo}/${formData.projectId}/task`;
            const method = formMode === 'create' ? 'post' : 'put';
            
            await tasksApi[method](url, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccessPopup({ show: true, message: `Task ${formMode}d successfully!` });
            handleFormClose();
            fetchTasks();
            if (userData.roles[0] === "TEAM_LEAD") {
                fetchTasksAssignedByMe();
            }
        } catch (error) {
            console.error("Submission failed:", error);
            const errorMsg = error.response?.data?.message || error.response?.data || error.message;
            setSubmissionError(`Failed to ${formMode} task: ${errorMsg}`);
            setErrorPopup({ show: true, message: `Failed to ${formMode} task. Please try again.` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredAndSortedTasks = useMemo(() => {
        if (!Array.isArray(tasks)) return [];
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
        if (!Array.isArray(assignedByMeTasks)) return [];
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

    const renderField = (label, name, type = "text", required = false, options = [], isDisabled = false) => {
        const isError = formErrors[name];
        const fieldValue = formData[name] || "";

        const handleLocalFieldChange = (value) => {
            handleInputChange({ target: { name, value } });
        };

        return (
            <div className="group relative" key={name}>
                <label className={`block text-sm font-semibold mb-3 flex items-center ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                    {label}
                    {required && <span className="text-red-500 ml-1 text-base">*</span>}
                    {isDisabled && (
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}>
                            Read Only
                        </span>
                    )}
                </label>

                {type === "select" ? (
                    <div className="relative">
                        <select
                            value={fieldValue}
                            onChange={(e) => handleLocalFieldChange(e.target.value)}
                            className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300 appearance-none
                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                                ${isError 
                                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                    : theme === 'dark'
                                    ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                    : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                                }
                                ${isDisabled ? theme === 'dark' ? 'bg-gray-800 cursor-not-allowed opacity-60' : 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
                            disabled={isDisabled}
                        >
                            <option value="">Choose {label}</option>
                            {options.map((opt) => (
                                <option key={opt.value || opt} value={opt.value || opt}>
                                    {opt.label || opt}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                ) : type === "date" ? (
                    <input
                        type="date"
                        value={fieldValue}
                        onChange={(e) => handleLocalFieldChange(e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300
                            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                            ${isError 
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                : theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                            }
                            ${isDisabled ? theme === 'dark' ? 'bg-gray-800 cursor-not-allowed opacity-60' : 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
                        disabled={isDisabled}
                    />
                ) : type === "file" ? (
                    <div className={`relative border-2 border-dashed rounded-xl transition-all duration-300
                        ${isError 
                            ? 'border-red-300 bg-red-50' 
                            : theme === 'dark'
                            ? 'border-gray-600 bg-gray-800 hover:border-blue-400 hover:bg-blue-900/20'
                            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                        }
                        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => handleFileChange(e)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isDisabled}
                            accept="*/*"
                        />
                        <div className="px-6 py-8 text-center">
                            <Upload className={`mx-auto h-12 w-12 mb-4 ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                            }`} />
                            <p className={`text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Drop your file here, or <span className="text-blue-600">browse</span>
                            </p>
                            <p className={`text-xs ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`}>Files (MAX. 10MB each)</p>
                        </div>
                    </div>
                ) : type === "textarea" ? (
                    <textarea
                        value={fieldValue}
                        onChange={(e) => handleLocalFieldChange(e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300 resize-none h-32
                            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                            ${isError 
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                : theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                            }
                            ${isDisabled ? theme === 'dark' ? 'bg-gray-800 cursor-not-allowed opacity-60' : 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        required={required}
                        disabled={isDisabled}
                    />
                ) : (
                    <input
                        type={type}
                        value={fieldValue}
                        onChange={(e) => handleLocalFieldChange(e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300
                            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                            ${isError 
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                : theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                            }
                            ${isDisabled ? theme === 'dark' ? 'bg-gray-800 cursor-not-allowed opacity-60' : 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        required={required}
                        disabled={isDisabled}
                    />
                )}
                {isError && (
                    <div className="mt-3 flex items-center space-x-2 text-red-600 animate-slideIn">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm font-medium">{isError}</p>
                    </div>
                )}
            </div>
        );
    };

    // Modern Edit Modal - Documents.jsx Style
    const renderEditModal = () => {
        if (!isFormOpen) return null;
        const isUpdate = formMode === 'edit';

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fadeIn">
                <div className={`rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                    {/* Header */}
                    <div className={`px-8 py-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="text-4xl">
                                    {isUpdate ? <Edit className="w-10 h-10" /> : <Plus className="w-10 h-10" />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{isUpdate ? 'Update Task' : 'Create New Task'}</h2>
                                    <p className="text-white/90 text-sm">
                                        {isUpdate ? 'Modify task details and information' : 'Fill in the details to create a new task'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={handleFormClose} 
                                className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 group" 
                                aria-label="Close"
                            >
                                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
                        <form className="p-8" onSubmit={handleFormSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Basic Information */}
                                {renderField('Task ID', 'id', 'text', true, [], isUpdate)}
                                {renderField('Project ID', 'projectId', 'select', true, projects.map(p => ({ label: `(${p.projectId}) ${p.title}`, value: p.projectId })))}
                                {renderField('Task Title', 'title', 'text', true)}
                                {renderField('Description', 'description', 'textarea')}
                                {renderField('Assigned To', 'assignedTo', 'text', true)}
                                {renderField('Created By', 'createdBy', 'text', false, [], true)}
                                {renderField('Status', 'status', 'select', true, ['Not Started', 'In Progress', 'Completed', 'On Hold'])}
                                {renderField('Priority', 'priority', 'select', true, ['High', 'Medium', 'Low'])}
                                {renderField('Created Date', 'createdDate', 'date', false, [], true)}
                                {renderField('Due Date', 'dueDate', 'date', true)}
                                {renderField('Completed Date', 'completedDate', 'date')}
                                {renderField('Rating (1-5)', 'rating', 'number')}
                                {renderField('Remark', 'remark', 'textarea')}
                                {renderField('Completion Note', 'completionNote', 'textarea')}
                            </div>

                            {/* Related Links */}
                            <div className="mt-8 space-y-4">
                                <label className={`block text-sm font-semibold ${
                                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                                }`}>Related Links</label>
                                {formData.relatedLinks.map((link, index) => (
                                    <div key={index} className="flex gap-3">
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => handleRelatedLinkChange(index, e.target.value)}
                                            className={`flex-1 px-5 py-4 border-2 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 bg-white'}`}
                                            placeholder="Enter related link URL"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeRelatedLink(index)}
                                            disabled={formData.relatedLinks.length === 1}
                                            className={`px-4 py-4 rounded-xl transition-all duration-300 ${
                                                formData.relatedLinks.length === 1 
                                                    ? 'text-gray-400 cursor-not-allowed' 
                                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                            }`}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addRelatedLink}
                                    className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                                >
                                    <Plus size={18} className="mr-1" />
                                    Add Related Link
                                </button>
                            </div>

                            {/* File Upload */}
                            <div className="mt-8">
                                {renderField('Attached Files', 'attachedFileLinks', 'file')}
                                
                                {files.length > 0 && (
                                    <div className="mt-6 space-y-3">
                                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Selected files:</p>
                                        <div className="space-y-2">
                                            {files.map((file, index) => (
                                                <div key={index} className={`flex justify-between items-center p-4 rounded-xl border transition-all duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                                            <Upload className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                                        </div>
                                                        <span className={`text-sm truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`} title={file.name}>
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-500 hover:text-red-700 p-2 rounded transition-colors duration-200"
                                                        aria-label={`Remove ${file.name}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error Message */}
                            {submissionError && (
                                <div className={`mt-6 p-5 border-l-4 border-red-400 rounded-r-xl animate-slideIn ${
                                    theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                                }`}>
                                    <div className="flex items-center">
                                        <AlertCircle className="w-6 h-6 text-red-400 mr-3" />
                                        <p className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>{submissionError}</p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                    
                    {/* Footer */}
                    <div className={`px-8 py-6 border-t flex justify-end space-x-4 ${
                        theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <button 
                            type="button" 
                            onClick={handleFormClose} 
                            className={`px-8 py-3 border-2 rounded-xl font-semibold transition-all duration-200 focus:ring-4 focus:ring-gray-500/20 ${
                                theme === 'dark'
                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                            }`}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleFormSubmit}
                            disabled={isSubmitting}
                            className={`px-10 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl
                                        hover:shadow-lg transform hover:scale-105 transition-all duration-200 
                                        focus:ring-4 focus:ring-indigo-500/30 flex items-center space-x-2
                                        ${isSubmitting ? 'cursor-not-allowed opacity-75' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-5 w-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>{isUpdate ? 'Updating...' : 'Creating...'}</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>{isUpdate ? 'Update Task' : 'Create Task'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className={`flex justify-center items-center min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>Loading tasks...</div>;
    }

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-gray-100'}`}>
                <div className={`rounded-xl shadow-md p-8 max-w-md w-full text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{error}</p>
                    <p className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        If the issue persists, please contact support or check your network connection.
                    </p>
                </div>
            </div>
        );
    }

    const isTeamLead = userData?.roles[0] === "TEAM_LEAD";

    const renderTaskTable = (taskList, tableTitle, noTasksMessage, showAssignedTo) => (
        <div className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{tableTitle}</h2>
            <div className={`rounded-xl shadow-md overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200/80'}`}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-slate-50'}>
                            <tr>
                                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>Task Title</th>
                                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>Status</th>
                                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>Priority</th>
                                {showAssignedTo && <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>Assigned To</th>}
                                {(!isTeamLead || displayMode === "MY_TASKS") && <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>Assigned By</th>}
                                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>Start Date</th>
                                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>Due Date</th>
                                <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>Progress</th>
                                {showAssignedTo && isTeamLead && <th className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-slate-200'}`}>
                            {taskList.length > 0 ? taskList.map(task => {
                                const timeCompletedBar = calculateTimeCompletedBar(task.startDate || task.createdDate, task.dueDate, today);
                                const progressBarColor = timeCompletedBar <= 50 ? 'bg-green-500' : timeCompletedBar <= 75 ? 'bg-yellow-500' : 'bg-red-500';
                                return (
                                    <tr key={`${task.id}-${task.projectId}`} onClick={() => clickHandler(task.projectId, task.id)} className={`cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-slate-50'}`}>
                                        <td className={`px-6 py-4 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{task.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${getStatusStyles(task.status)}`}>
                                                <span className={`h-2 w-2 rounded-full inline-block ${getStatusDot(task.status)} mr-1`}></span>
                                                {task.status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold py-1 px-2.5 rounded-md ${theme === 'dark' ? '' : 'border'} ${getPriorityStyles(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        {showAssignedTo && <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{task.assignedTo}</td>}
                                        {(!isTeamLead || displayMode === "MY_TASKS") && <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{task.createdBy}</td>}
                                        <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}><div className="flex items-center"><CalendarIcon theme={theme} />{task.startDate || task.createdDate}</div></td>
                                        <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}><div className="flex items-center"><CalendarIcon theme={theme} />{task.dueDate}</div></td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className={`w-24 rounded-full h-2.5 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}><div className={`${progressBarColor} h-full rounded-full`} style={{ width: `${timeCompletedBar}%` }}></div></div>
                                            <div className={`text-right text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{timeCompletedBar}%</div>
                                        </td>
                                        {showAssignedTo && isTeamLead && (
                                            <td className="px-6 py-4 text-sm flex items-center space-x-2">
                                                {task.createdBy === userData?.employeeId && (
                                                    <>
                                                        <button
                                                            onClick={(e) => handleEditClick(e, task)}
                                                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer transition-colors"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteTask(e, task.projectId, task.id)}
                                                            className="text-red-600 hover:text-red-900 cursor-pointer transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={isTeamLead ? (showAssignedTo ? 9 : 8) : (showAssignedTo ? 8 : 7)} className={`text-center py-10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{noTasksMessage}</td></tr>
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
        <div className={`flex min-h-screen font-sans ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-gray-100'}`}>
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
                            <h1 className={`text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Task Dashboard</h1>
                            <p className={`mt-1 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                                Welcome, {userData?.fullName || userData?.employeeId}. You are viewing the task dashboard.
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex gap-4">
                            {isTeamLead && (
                                <button
                                    onClick={handleCreateClick}
                                    className="flex cursor-pointer items-center justify-center bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                                >
                                    <Plus size={18} className="mr-2"/> Create Task
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div>
                            <label htmlFor="filterStatus" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Filter by Status:</label>
                            <select id="filterStatus" value={filterStatus} onChange={handleFilterChange} className={`block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}>
                                <option value="ALL">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="sortOption" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Sort by:</label>
                            <select id="sortOption" value={sortOption} onChange={handleSortChange} className={`block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}>
                                <option value="none">None</option>
                                <option value="startDateAsc">Start Date (Ascending)</option>
                                <option value="priorityDesc">Priority (High to Low)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="itemsPerPage" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Items per page:</label>
                            <select 
                                id="itemsPerPage" 
                                value={dropdownValue} 
                                onChange={handleDropdownChange} 
                                className={`block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
                            >
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
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

                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center justify-center space-x-2">
                            {Array.from({ length: totalPages }, (_, i) => i).map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleNumberClick(num)}
                                    className={`flex items-center justify-center h-10 w-10 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                        currentNumber === num
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : `${theme === 'dark' ? 'text-gray-300 bg-gray-700 hover:bg-gray-600 hover:text-white' : 'text-slate-600 bg-white hover:bg-indigo-50 hover:text-indigo-600'}`
                                    }`}
                                >
                                    {num + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Modern Edit Modal */}
                    {renderEditModal()}
                </div>
            </div>

            {isTeamLead && (
                <div className={`fixed inset-y-0 right-0 w-80 shadow-xl transform transition-transform duration-300 z-40 ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full'} ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <button
                        onClick={() => setIsRightSidebarOpen(false)}
                        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors z-50"
                        aria-label="Close Team Sidebar"
                    >
                        <ChevronRight size={24} />
                    </button>
                    <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Team Dashboard</h3>
                    </div>
                    <div className="p-4 space-y-2">
                        <button
                            onClick={handleMyTasksClick}
                            className={`w-full text-left p-3 rounded-lg transition-colors flex items-center font-medium ${isMyTasksActive ? 'bg-indigo-100 text-indigo-700' : `${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}`}
                        >
                            <span>My Tasks</span>
                        </button>
                        <button
                            onClick={handleAssignedByMeClick}
                            className={`w-full text-left p-3 rounded-lg transition-colors flex items-center font-medium ${isAssignedByMeActive ? 'bg-indigo-100 text-indigo-700' : `${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}`}
                        >
                            <span>Tasks Assigned By You</span>
                        </button>
                    </div>
                </div>
            )}

            {successPopup.show && (
                <SuccessPopup 
                    message={successPopup.message} 
                    onClose={() => setSuccessPopup({ show: false, message: '' })} 
                    theme={theme}
                />
            )}
            {errorPopup.show && (
                <ErrorPopup 
                    message={errorPopup.message} 
                    onClose={() => setErrorPopup({ show: false, message: '' })} 
                    theme={theme}
                />
            )}
            {confirmDeletePopup.show && (
                <ConfirmDeletePopup 
                    onConfirm={confirmDelete} 
                    onCancel={() => setConfirmDeletePopup({ show: false, projectId: null, taskId: null })} 
                    theme={theme}
                />
            )}

            {/* Animations CSS */}
            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideIn { from { transform: translateX(-10px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-slideUp { animation: slideUp 0.4s ease-out; }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default TasksPage;