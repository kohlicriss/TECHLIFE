import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tasksApi } from '../../../../axiosInstance';
import { Context } from "../HrmsContext";
import {
    ChevronLeft,
    Edit,
    CheckCircle,
    Clock,
    User,
    CalendarDays,
    Info,
    GitFork,
    FileText,
    Save,
    XCircle,
    Upload,
    Star,
    MessageSquare,
    Check,
    Trash2,
    Plus,
    AlertCircle,
} from "lucide-react";
// Modern Modal Components with Documents.jsx styling
const Modal = ({ children, onClose, title, type, theme }) => {
    let titleClass = "";
    let icon = null;
    if (type === "confirm") {
        titleClass = "text-yellow-600";
        icon = <Info className="h-6 w-6 text-yellow-500" />;
    } else if (type === "success") {
        titleClass = "text-green-600";
        icon = <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (type === "error") {
        titleClass = "text-red-600";
        icon = <XCircle className="h-6 w-6 text-red-500" />;
    }
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-[200] animate-fadeIn">
            <div className={`p-6 rounded-3xl shadow-2xl w-full max-w-md mx-4 border animate-slideUp ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center mb-4">
                    {icon && <span className="mr-3">{icon}</span>}
                    <h3 className={`text-xl font-bold ${titleClass}`}>{title}</h3>
                </div>
                {children}
            </div>
        </div>
    );
};
const ErrorPopup = ({ message, onClose, theme }) => (
    <Modal onClose={onClose} title="An Error Occurred" type="error" theme={theme}>
        <p className={`mb-6 text-base whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{message}</p>
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
const SuccessPopup = ({ message, onClose, theme }) => (
    <Modal onClose={onClose} title="Success" type="success" theme={theme}>
        <p className={`mb-6 text-base whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{message}</p>
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
const ConfirmDeletePopup = ({ onConfirm, onCancel, theme }) => (
    <Modal onClose={onCancel} title="Confirm Deletion" type="confirm" theme={theme}>
        <p className={`mb-6 text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Are you sure you want to permanently delete this history entry? This action cannot be undone.
        </p>
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
// Modern Update History Popup - Documents.jsx Style
const UpdateHistoryPopup = ({
    setShowUpdateHistoryPopup,
    handleUpdateHistorySubmit,
    updateHistoryData,
    handleUpdateHistoryInputChange,
    handleUpdateHistoryFileChange,
    assignedBy,
    employeeId,
    theme,
}) => {
    // Field renderer similar to Documents.jsx
    const renderField = (label, name, type = "text", required = false, placeholder = "") => {
        const fieldValue = updateHistoryData[name] || "";
        return (
            <div className="group relative">
                <label className={`block text-sm font-semibold mb-3 flex items-center ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                    {label}
                    {required && <span className="text-red-500 ml-1 text-base">*</span>}
                </label>
                {type === "textarea" ? (
                    <textarea
                        name={name}
                        value={fieldValue}
                        onChange={handleUpdateHistoryInputChange}
                        className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300 resize-none h-32
                            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                            ${theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                            }`}
                        placeholder={placeholder}
                        required={required}
                    />
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={fieldValue}
                        onChange={handleUpdateHistoryInputChange}
                        className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300
                            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                            ${theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                            }`}
                        placeholder={placeholder}
                        required={required}
                    />
                )}
            </div>
        );
    };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fadeIn">
            {/* Added flex and flex-col for proper layout stacking */}
            <form onSubmit={handleUpdateHistorySubmit} className={`rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-slideUp ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
                {/* Header */}
                <div className={`px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white relative overflow-hidden flex-shrink-0`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl">
                                <Plus className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Update Task History</h2>
                                <p className="text-white/90 text-sm">Add progress updates and track changes</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowUpdateHistoryPopup(false)} 
                            className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 group" 
                            aria-label="Close"
                            type="button" // Important for buttons inside a form not to submit by default
                        >
                            <XCircle className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
                        </button>
                    </div>
                </div>
                {/* Form Content - Now fully scrollable */}
                <div className="overflow-y-auto flex-grow p-8">
                    <div className="space-y-8">
                        {/* Basic Information Section */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-8 rounded-full ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
                                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Update Information</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {renderField('Changes', 'changes', 'text', true, 'e.g., Status: IN_PROGRESS → COMPLETED')}
                                {renderField('Note', 'note', 'text', false, 'Add a descriptive note')}
                            </div>
                            {renderField('Related Links', 'relatedLinks', 'text', false, 'https://example.com, https://another.com')}
                            {employeeId === assignedBy && (
                                renderField('Remark', 'remark', 'text', false, 'Add a remark')
                            )}
                        </div>
                        {/* File Upload Section */}
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-8 rounded-full ${theme === 'dark' ? 'bg-orange-500' : 'bg-orange-600'}`}></div>
                                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>File Attachments</h3>
                            </div>
                            <div className="space-y-4">
                                <label className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Upload Files (Max 5)
                                </label>
                                <div className={`relative border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer
                                    ${theme === 'dark'
                                        ? 'border-gray-600 bg-gray-800 hover:border-blue-400 hover:bg-blue-900/20'
                                        : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                                    }`}>
                                    <input
                                        type="file"
                                        name="files"
                                        multiple
                                        onChange={handleUpdateHistoryFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="*/*"
                                    />
                                    <div className="px-6 py-8 text-center">
                                        <Upload className={`mx-auto h-12 w-12 mb-4 ${
                                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                        }`} />
                                        <p className={`text-sm font-medium mb-1 ${
                                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                            Drop your files here, or <span className="text-blue-600">browse</span>
                                        </p>
                                        <p className={`text-xs ${
                                            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                                        }`}>Any files (Max 5 files)</p>
                                    </div>
                                </div>
                                {updateHistoryData.relatedFileLinks.length > 0 && (
                                    <div className="space-y-3">
                                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Selected files:</p>
                                        <div className="space-y-2">
                                            {updateHistoryData.relatedFileLinks.map((file, index) => (
                                                <div key={index} className={`flex justify-between items-center p-4 rounded-xl border transition-all duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                                            <FileText className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                                        </div>
                                                        <span className={`text-sm truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`} title={file.name}>
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer - fixed bottom position with flex-shrink-0 */}
                <div className={`px-8 py-6 border-t flex justify-end space-x-4 flex-shrink-0 ${
                    theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-200'
                }`}>
                    <button 
                        type="button" 
                        onClick={() => setShowUpdateHistoryPopup(false)} 
                        className={`px-8 py-3 border-2 rounded-xl font-semibold transition-all duration-200 focus:ring-4 focus:ring-gray-500/20 ${
                            theme === 'dark'
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                        }`}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className={`px-10 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl
                                hover:shadow-lg transform hover:scale-105 transition-all duration-200 
                                focus:ring-4 focus:ring-blue-500/30 flex items-center space-x-2`}
                    >
                        <Upload className="w-5 h-5" />
                        <span>Update Changes</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
const TaskViewPage = () => {
    const { projectid, id } = useParams();
    const navigate = useNavigate();
    const [assignedBy, setAssignedBy] = useState("");
    const [showUpdateHistoryPopup, setShowUpdateHistoryPopup] = useState(false);
    const { userData, theme } = useContext(Context);
    const [updateHistoryData, setUpdateHistoryData] = useState({
        changes: "",
        note: "",
        relatedLinks: "",
        relatedFileLinks: [],
        remark: "",
    });
    const [currentTask, setCurrentTask] = useState(null);
    const [updateHistory, setUpdateHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successPopup, setSuccessPopup] = useState({ show: false, message: "" });
    const [errorPopup, setErrorPopup] = useState({ show: false, message: "" });
    const [confirmDeletePopup, setConfirmDeletePopup] = useState({ show: false, historyId: null });
    const [editingRowId, setEditingRowId] = useState(null);
    const [editRowData, setEditRowData] = useState(null);
    // Helper function to extract detailed error messages
    const getErrorMessage = (error) => {
        if (error.response) {
            if (error.response.data) {
                if (typeof error.response.data.message === 'string') {
                    return error.response.data.message;
                }
                if (typeof error.response.data.error === 'string') {
                    return error.response.data.error;
                }
                if (typeof error.response.data === 'string') {
                    return error.response.data;
                }
            }
            return `Error: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
            return "No response from the server. Please check your network connection.";
        } else {
            return error.message || "An unknown error occurred.";
        }
    };
    const fetchTaskData = async () => {
        if (!projectid || !id) return;
        setLoading(true);
        setError(null);
        try {
            const taskResponse = await tasksApi.get(`/task/${projectid}/${id}`);
            console.log("Task Data Received:", taskResponse.data);
            setCurrentTask(taskResponse.data);
            setAssignedBy(taskResponse.data?.createdBy);
            const historyResponse = await tasksApi.get(`/${projectid}/${id}/updatetasks`);
            console.log("All task history responses:", historyResponse.data);
            setUpdateHistory(historyResponse.data);
        } catch (err) {
            console.error("Error in fetchTaskData:", err.response?.data || err.message);
            if (err.response?.status === 404) {
                setError("Task not found. Please check the ID.");
                setCurrentTask(null);
            } else {
                setError(getErrorMessage(err) || "Failed to fetch critical task details.");
            }
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTaskData();
    }, [projectid, id]);
    const getPriorityClass = (priority) => {
        const upperPriority = priority ? priority.toUpperCase() : "";
        switch (upperPriority) {
            case "HIGH":
                return "bg-red-100 text-red-800 border-red-200";
            case "MEDIUM":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "LOW":
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };
    const getStatusClass = (status) => {
        const upperStatus = status ? status.toUpperCase().replace(" ", "_") : "";
        switch (upperStatus) {
            case "IN_PROGRESS":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "PENDING":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "COMPLETED":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };
    const handleUpdateHistoryInputChange = (e) => {
        const { name, value } = e.target;
        setUpdateHistoryData((prev) => ({ ...prev, [name]: value }));
    };
    const handleUpdateHistoryFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        let allFiles = [...updateHistoryData.relatedFileLinks, ...selectedFiles];
        if (allFiles.length > 5) {
            setErrorPopup({ show: true, message: "You can only upload a maximum of 5 files." });
            allFiles = allFiles.slice(0, 5);
        }
        setUpdateHistoryData((prev) => ({
            ...prev,
            relatedFileLinks: allFiles,
        }));
    };
    const handleUpdateHistorySubmit = async (e) => {
        e.preventDefault();
        if (!updateHistoryData.changes) {
            setErrorPopup({ show: true, message: "The 'Changes' field is required." });
            return;
        }
        const creatorId = userData?.employeeId;
        if (!creatorId) {
            setErrorPopup({ show: true, message: "User ID not found. Please log in again." });
            return;
        }
        const isAssigner = creatorId === assignedBy;
        const formData = new FormData();
        const taskUpdatePayload = {
            id: Date.now(),
            changes: updateHistoryData.changes,
            note: updateHistoryData.note || null,
            relatedLinks: updateHistoryData.relatedLinks
                .split(",")
                .map((link) => link.trim())
                .filter((link) => link),
            reviewedBy: isAssigner ? creatorId : null,
            remark: isAssigner ? updateHistoryData.remark : null,
            updatedDate: new Date().toISOString(),
        };
        formData.append(
            "taskUpdateDTO",
            new Blob([JSON.stringify(taskUpdatePayload)], {
                type: "application/json",
            })
        );
        if (
            updateHistoryData.relatedFileLinks &&
            updateHistoryData.relatedFileLinks.length > 0
        ) {
            for (const file of updateHistoryData.relatedFileLinks) {
                formData.append("relatedFileLinks", file);
            }
        }
        try {
            const response = await tasksApi.post(
                `/history/${projectid}/${id}`,
                formData
            );
            console.log("Create History Response:", response.data);
            setShowUpdateHistoryPopup(false);
            setUpdateHistoryData({
                changes: "",
                note: "",
                relatedLinks: "",
                relatedFileLinks: [],
                remark: "",
            });
            setSuccessPopup({ show: true, message: "Task history created successfully!" });
            fetchTaskData();
        } catch (error) {
            console.error("Error creating history:", error);
            const detailedError = getErrorMessage(error);
            setErrorPopup({ show: true, message: `Failed to create history: ${detailedError}` });
        }
    };
    const handleInlineEdit = (historyItem) => {
        setEditingRowId(historyItem.id);
        setEditRowData(historyItem);
    };
    const handleInlineCancel = () => {
        setEditingRowId(null);
        setEditRowData(null);
    };
    const handleInlineSave = async () => {
        try {
            if (!editRowData || !editRowData.id) {
                setErrorPopup({ show: true, message: "Cannot save. Invalid history item." });
                return;
            }
            const reviewerId = userData?.employeeId;
            if (!reviewerId || userData?.employeeId !== assignedBy) {
                setErrorPopup({ show: true, message: "Only the task assigner can add remarks." });
                return;
            }
            const cleanedFileLinks = (editRowData.relatedFileLinks || []).map(
                (url) => {
                    try {
                        const urlObject = new URL(url);
                        return urlObject.pathname.substring(1);
                    } catch (e) {
                        return url;
                    }
                }
            );
            const updatedPayload = {
                ...editRowData,
                reviewedBy: reviewerId,
                updatedDate: new Date().toISOString(),
                relatedLinks: Array.isArray(editRowData.relatedLinks)
                    ? editRowData.relatedLinks
                    : editRowData.relatedLinks
                        ? [editRowData.relatedLinks]
                        : [],
                relatedFileLinks: cleanedFileLinks,
            };
            await tasksApi.put(
                `/${reviewerId}/status/${projectid}/${id}`,
                updatedPayload,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );
            handleInlineCancel();
            setSuccessPopup({ show: true, message: "Remark updated successfully!" });
            fetchTaskData();
        } catch (error) {
            console.error("Error updating status:", error);
            const detailedError = getErrorMessage(error);
            setErrorPopup({ show: true, message: `An error occurred while saving: ${detailedError}` });
        }
    };
    const handleInlineInputChange = (e) => {
        const { name, value } = e.target;
        setEditRowData((prev) => ({ ...prev, [name]: value }));
    };
    const handleDeleteHistory = (historyId) => {
        setConfirmDeletePopup({ show: true, historyId });
    };
    const confirmDelete = async () => {
        const historyId = confirmDeletePopup.historyId;
        setConfirmDeletePopup({ show: false, historyId: null });
        try {
            const deleterId = userData?.employeeId;
            if (!deleterId) {
                setErrorPopup({ show: true, message: "User ID not found. Please log in again." });
                return;
            }
            const response = await tasksApi.delete(
                `/${projectid}/${id}/${historyId}/delete`
            );
            if (response.status === 200 || response.status === 204) {
                setSuccessPopup({ show: true, message: "History entry deleted successfully." });
                fetchTaskData();
            } else {
                setErrorPopup({ show: true, message: `Failed to delete history entry. Server responded with status ${response.status}.` });
            }
        } catch (error) {
            console.error("Error deleting history:", error);
            const detailedError = getErrorMessage(error);
            setErrorPopup({ show: true, message: `An error occurred while deleting: ${detailedError}` });
        }
    };
    const renderRelatedLinks = (links) => {
        if (!links || links.length === 0) return "-";
        return (
            <ul className="list-disc list-inside text-xs space-y-1">
                {links.map((link, i) => (
                    <li key={i}>
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            {link}
                        </a>
                    </li>
                ))}
            </ul>
        );
    };
    const renderRelatedFiles = (files) => {
        if (!files || files.length === 0) return "-";
        return (
            <ul className="list-disc list-inside text-xs space-y-1">
                {files.map((file, i) => (
                    <li key={i}>
                        <a
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 hover:underline flex items-center"
                        >
                            <FileText size={14} className="mr-1" />
                            {decodeURIComponent(file.split("/").pop().split("?")[0])}
                        </a>
                    </li>
                ))}
            </ul>
        );
    };
    const handleSubmitTask = () => {
        const now = new Date();
        const completedDate = now.toISOString().slice(0, 10);
        const updatedDateTime = now.toISOString();
        const updatedTask = {
            ...currentTask,
            status: "COMPLETED",
            completedDate: completedDate,
            completionNote:
                currentTask.completionNote || "Task marked as completed.",
        };
        const newHistoryEntry = {
            updatedBy: { id: currentTask.assignedTo, name: currentTask.assignedTo },
            updatedDate: updatedDateTime,
            changes: {
                status: { from: currentTask.status, to: "COMPLETED" },
                completedDate: { from: currentTask.completedDate, to: completedDate },
            },
            note: "Task submitted and marked as completed.",
        };
        setCurrentTask(updatedTask);
        setUpdateHistory([...updateHistory, newHistoryEntry]);
        setSuccessPopup({ show: true, message: "Task marked as completed successfully!" });
    };
    if (loading) {
        return (
            <div className={`flex justify-center items-center h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <div className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Loading Task Details...
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className={`flex justify-center items-center h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-red-50'}`}>
                <div className={`text-xl font-semibold p-8 text-center ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{error}</div>
            </div>
        );
    }
    if (!currentTask) {
        return (
            <div className={`flex justify-center items-center h-screen text-2xl font-semibold ${theme === 'dark' ? 'bg-gray-900 text-red-400' : 'bg-gradient-to-br from-gray-50 to-blue-100 text-red-600'}`}>
                Task not found. Please check the ID.
            </div>
        );
    }
    const isTaskCompleted = currentTask.status.toUpperCase() === "COMPLETED";
    const isAssigner = userData?.employeeId === assignedBy;
    return (
        <>
            <div className={`min-h-screen p-0 flex items-start justify-center font-sans ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-gray-100'}`}>
                <div className={`w-full max-w-full pt-6 pb-6 sm:pt-8 sm:pb-8 md:pt-10 md:pb-10 px-0 rounded-3xl shadow-2xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className={`flex items-center justify-between  pb-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <button
                            onClick={() => navigate(`/tasks/${userData?.employeeId}`)}
                            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700 hover:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-700'}`}
                            aria-label="Go back to tasks list"
                        >
                            <ChevronLeft className="h-7 w-7" />
                        </button>
                        <h2 className={`text-3xl sm:text-4xl font-extrabold flex-grow text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Task Details
                        </h2>
                    </div>
                    <div className="flex flex-col gap-8">
                        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="mb-8 space-y-6">
    <h3 className={`text-2xl sm:text-3xl font-bold leading-tight text-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
        {currentTask.title}
    </h3>
    {/* Improved Mobile Layout for Key Info */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Priority */}
        <div className={`flex flex-col space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="flex items-center">
                <Info className="h-4 w-4 text-indigo-500 mr-2 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">Priority:</span>
            </div>
            <span
                className={`text-xs sm:text-sm px-3 py-2 rounded-lg border shadow-sm ${getPriorityClass(
                    currentTask.priority
                )}`}
            >
                {currentTask.priority}
            </span>
        </div>
        {/* Status */}
        <div className={`flex flex-col space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="flex items-center">
                <Clock className="h-4 w-4 text-indigo-500 mr-2 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">Status:</span>
            </div>
            <span
                className={`text-xs sm:text-sm px-3 py-2 rounded-lg border shadow-sm ${getStatusClass(
                    currentTask.status
                )}`}
            >
                {currentTask.status}
            </span>
        </div>
        {/* Due Date */}
        <div className={`flex flex-col space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="flex items-center">
                <CalendarDays className="h-4 w-4 text-indigo-500 mr-2 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">Due Date:</span>
            </div>
            <div className={`text-xs sm:text-sm p-2 sm:p-3 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-200 text-black'}`}>
                {currentTask.dueDate}
            </div>
        </div>
        {/* Created On */}
        <div className={`flex flex-col space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="flex items-center">
                <CalendarDays className="h-4 w-4 text-indigo-500 mr-2 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">Created On:</span>
            </div>
            <div className={`text-xs sm:text-sm p-2 sm:p-3 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-200 text-black'}`}>
                {currentTask.createdDate}
            </div>
        </div>
        {/* Created By */}
        <div className={`flex flex-col space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="flex items-center">
                <User className="h-4 w-4 text-indigo-500 mr-2 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">Created By:</span>
            </div>
            <div className={`text-xs sm:text-sm p-2 sm:p-3 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-200 text-black'}`}>
                {currentTask.createdBy}
            </div>
        </div>
        {/* Assigned To */}
        <div className={`flex flex-col space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="flex items-center">
                <User className="h-4 w-4 text-indigo-500 mr-2 flex-shrink-0" />
                <span className="font-semibold text-sm sm:text-base">Assigned To:</span>
            </div>
            <div className={`text-xs sm:text-sm p-2 sm:p-3 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-200 text-black'}`}>
                {currentTask.assignedTo}
            </div>
        </div>
        {currentTask.completedDate && (
            <div className={`flex flex-col space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-base">Completed On:</span>
                </div>
                <div className={`text-xs sm:text-sm p-2 sm:p-3 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-800'}`}>
                    {currentTask.completedDate}
                </div>
            </div>
        )}
        {currentTask.rating && (
            <div className={`flex flex-col space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-base">Rating:</span>
                </div>
                <div className={`text-xs sm:text-sm p-2 sm:p-3 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-200 text-black'}`}>
                    {currentTask.rating} / 10
                </div>
            </div>
        )}
    </div>
</div>

                            <div className="mb-8">
                                <h4 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                    Description
                                </h4>
                                <div className={`p-5 rounded-lg border leading-relaxed shadow-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>
                                    {currentTask.description}
                                </div>
                            </div>
                            {currentTask.remark && (
                                <div className="mb-8">
                                    <h4 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        Remark
                                    </h4>
                                    <div className={`p-5 rounded-lg border leading-relaxed shadow-sm ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-800'}`}>
                                        <MessageSquare className={`inline-block h-4 w-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />{" "}
                                        {currentTask.remark}
                                    </div>
                                </div>
                            )}
                            {currentTask.completionNote && (
                                <div className="mb-8">
                                    <h4 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        Completion Note
                                    </h4>
                                    <div className={`p-5 rounded-lg border leading-relaxed shadow-sm ${theme === 'dark' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-800'}`}>
                                        {currentTask.completionNote}
                                    </div>
                                </div>
                            )}
                            {(currentTask.relatedLinks?.length > 0 || currentTask.attachedFileLinks?.length > 0) && (
                                <div className="mb-8">
                                    <h4 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        Related Links & Files
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {currentTask.relatedLinks?.length > 0 && (
                                            <div className={`p-4 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                                                <h5 className={`font-medium flex items-center mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                                                    <GitFork className="h-4 w-4 mr-2" /> Related Links:
                                                </h5>
                                                <ul className="space-y-1">
                                                    {currentTask.relatedLinks.map((link, index) => (
                                                        <li key={index}>
                                                            <a
                                                                href={link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm break-all"
                                                            >
                                                                {link}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {currentTask.attachedFileLinks?.length > 0 && (
                                            <div className={`p-4 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200'}`}>
                                                <h5 className={`font-medium flex items-center mb-2 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-800'}`}>
                                                    <FileText className="h-4 w-4 mr-2" /> Attached Files:
                                                </h5>
                                                <ul className="space-y-1">
                                                    {currentTask.attachedFileLinks.map((link, index) => (
                                                        <li key={index}>
                                                            <a
                                                                href={link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-purple-600 hover:text-purple-800 hover:underline text-sm break-all"
                                                            >
                                                                {decodeURIComponent(link.split("/").pop().split("?")[0])}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        Update History
                                    </h4>
                                    {!isTaskCompleted && !isAssigner && (
                                        <button
                                            onClick={() => setShowUpdateHistoryPopup(true)}
                                            className={`flex items-center justify-center font-semibold py-3 px-6 rounded-xl shadow-md focus:outline-none focus:ring-4 focus:ring-opacity-75 transition-all duration-200 ${theme === 'dark' ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500' : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'}`}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create History
                                        </button>
                                    )}
                                </div>
                                {updateHistory?.length > 0 ? (
                                    <div className={`overflow-x-auto rounded-lg border shadow-sm ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className={theme === 'dark' ? 'bg-gray-600' : 'bg-white'}>
                                                <tr>
                                                    <th scope="col" className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>S.No</th>
                                                    <th scope="col" className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Updated Date</th>
                                                    <th scope="col" className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Changes</th>
                                                    <th scope="col" className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Note</th>
                                                    <th scope="col" className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Related Links</th>
                                                    <th scope="col" className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Related Files</th>
                                                    <th scope="col" className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Remarks</th>
                                                    <th scope="col" className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Reviewed By</th>
                                                    <th scope="col" className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y transition-colors duration-150 ${theme === 'dark' ? 'bg-gray-700 divide-gray-600' : 'bg-white divide-gray-200'}`}>
                                                {updateHistory.map((history, index) => (
                                                    <tr key={history.id} className={`transition-colors duration-150 ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}`}>
                                                        <td className={`px-4 py-3 text-sm border ${theme === 'dark' ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'}`}>{index + 1}</td>
                                                        <td className={`px-4 py-3 text-sm border ${theme === 'dark' ? 'text-gray-300 border-gray-600' : 'text-gray-500 border-gray-300'}`}>{new Date(history.updatedDate).toLocaleString()}</td>
                                                        <td className={`px-4 py-3 text-sm border ${theme === 'dark' ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'}`}>{history.changes}</td>
                                                        <td className={`px-4 py-3 text-sm italic border ${theme === 'dark' ? 'text-gray-300 border-gray-600' : 'text-gray-500 border-gray-300'}`}>{history.note || "-"}</td>
                                                        <td className={`px-4 py-3 text-sm border ${theme === 'dark' ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'}`}>{renderRelatedLinks(history.relatedLinks)}</td>
                                                        <td className={`px-4 py-3 text-sm border ${theme === 'dark' ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'}`}>{renderRelatedFiles(history.relatedFileLinks)}</td>
                                                        <td className={`px-4 py-3 text-sm italic border ${theme === 'dark' ? 'text-gray-300 border-gray-600' : 'text-gray-500 border-gray-300'}`}>
                                                            {editingRowId === history.id ? (
                                                                <input
                                                                    type="text"
                                                                    name="remark"
                                                                    value={editRowData?.remark || ""}
                                                                    onChange={handleInlineInputChange}
                                                                    className={`w-full p-1 border rounded ${theme === 'dark' ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-black'}`}
                                                                />
                                                            ) : (
                                                                history.remark || "-"
                                                            )}
                                                        </td>
                                                        <td className={`px-4 py-3 text-sm border ${theme === 'dark' ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'}`}>{history.reviewedBy || "-"}</td>
                                                        <td className={`px-4 py-3 text-sm border ${theme === 'dark' ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'}`}>
                                                            <div className="flex gap-2">
                                                                {isAssigner && (
                                                                    editingRowId === history.id ? (
                                                                        <>
                                                                            <button onClick={handleInlineSave} className="text-green-600 hover:text-green-800" aria-label="Save"><Check size={16} /></button>
                                                                            <button onClick={handleInlineCancel} className="text-red-600 hover:text-red-800" aria-label="Cancel"><XCircle size={16} /></button>
                                                                        </>
                                                                    ) : (
                                                                        <button onClick={() => handleInlineEdit(history)} className="text-blue-600 hover:text-blue-800" aria-label="Edit"><Edit size={16} /></button>
                                                                    )
                                                                )}
                                                                <button onClick={() => handleDeleteHistory(history.id)} className="text-red-600 hover:text-red-800" aria-label="Delete"><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        No history recorded for this task yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modern Update History Popup */}
            {showUpdateHistoryPopup && (
                <UpdateHistoryPopup
                    setShowUpdateHistoryPopup={setShowUpdateHistoryPopup}
                    handleUpdateHistorySubmit={handleUpdateHistorySubmit}
                    updateHistoryData={updateHistoryData}
                    handleUpdateHistoryInputChange={handleUpdateHistoryInputChange}
                    handleUpdateHistoryFileChange={handleUpdateHistoryFileChange}
                    assignedBy={assignedBy}
                    employeeId={userData?.employeeId}
                    theme={theme}
                />
            )}
            {errorPopup.show && (
                <ErrorPopup
                    message={errorPopup.message}
                    onClose={() => setErrorPopup({ show: false, message: "" })}
                    theme={theme}
                />
            )}
            {successPopup.show && (
                <SuccessPopup
                    message={successPopup.message}
                    onClose={() => setSuccessPopup({ show: false, message: "" })}
                    theme={theme}
                />
            )}
            {confirmDeletePopup.show && (
                <ConfirmDeletePopup
                    onConfirm={confirmDelete}
                    onCancel={() => setConfirmDeletePopup({ show: false, historyId: null })}
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
        </>
    );
};
export default TaskViewPage;