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
} from "lucide-react";

// Customized Modal Components
const Modal = ({ children, onClose, title, type }) => {
    let titleClass = "";
    let buttonClass = "";
    let icon = null;

    if (type === "confirm") {
        titleClass = "text-yellow-600";
        buttonClass = "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500";
        icon = <Info className="h-6 w-6 text-yellow-500" />;
    } else if (type === "success") {
        titleClass = "text-green-600";
        buttonClass = "bg-green-500 hover:bg-green-600 focus:ring-green-500";
        icon = <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (type === "error") {
        titleClass = "text-red-600";
        buttonClass = "bg-red-500 hover:bg-red-600 focus:ring-red-500";
        icon = <XCircle className="h-6 w-6 text-red-500" />;
    }

    return (
        <div className="fixed inset-0  bg-opacity-100 backdrop-blur-sm flex justify-center items-center z-200 transition-opacity duration-300 animate-in fade-in-0">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-gray-200 transform transition-all duration-300 scale-95 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                    <h3 className={`text-xl font-bold ${titleClass} flex items-center`}>
                        {icon && <span className="mr-2">{icon}</span>}
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors rounded-full p-1">
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const ErrorPopup = ({ message, onClose }) => (
    <Modal onClose={onClose} title="An Error Occurred" type="error">
        <p className="text-gray-700 mb-6 text-base whitespace-pre-wrap">{message}</p>
        <div className="flex justify-end">
            <button
                onClick={onClose}
                className="bg-red-500 text-white font-medium py-2 px-6 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
            >
                OK
            </button>
        </div>
    </Modal>
);

const SuccessPopup = ({ message, onClose }) => (
    <Modal onClose={onClose} title="Success" type="success">
        <p className="text-gray-700 mb-6 text-base whitespace-pre-wrap">{message}</p>
        <div className="flex justify-end">
            <button
                onClick={onClose}
                className="bg-green-500 text-white font-medium py-2 px-6 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
            >
                OK
            </button>
        </div>
    </Modal>
);

const ConfirmDeletePopup = ({ onConfirm, onCancel }) => (
    <Modal onClose={onCancel} title="Confirm Deletion" type="confirm">
        <p className="text-gray-700 mb-6 text-base">
            Are you sure you want to permanently delete this history entry? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
            <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={onConfirm}
                className="bg-red-500 text-white font-medium py-2 px-6 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
            >
                Delete
            </button>
        </div>
    </Modal>
);

const UpdateHistoryPopup = ({
    setShowUpdateHistoryPopup,
    handleUpdateHistorySubmit,
    updateHistoryData,
    handleUpdateHistoryInputChange,
    handleUpdateHistoryFileChange,
    assignedBy,
    employeeId,
}) => (
    <div className="fixed inset-0  bg-opacity-100 backdrop-blur-sm flex justify-center items-center z-[200] transition-all duration-300 animate-in fade-in-0">
        <div className="bg-gradient-to-br from-white to-blue-50 p-1 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-95">
            <div className="bg-white p-5 sm:p-7 rounded-xl border border-blue-100">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                        Update Task History
                    </h3>
                    <button
                        onClick={() => setShowUpdateHistoryPopup(false)}
                        className="text-gray-400 hover:text-red-500 transition-colors rounded-full p-1 focus:outline-none"
                    >
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleUpdateHistorySubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="changes"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Changes <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="changes"
                            id="changes"
                            placeholder="e.g., Status: IN_PROGRESS → COMPLETED"
                            value={updateHistoryData.changes}
                            onChange={handleUpdateHistoryInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="note"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Note
                        </label>
                        <input
                            type="text"
                            name="note"
                            id="note"
                            placeholder="Add a descriptive note"
                            value={updateHistoryData.note}
                            onChange={handleUpdateHistoryInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="relatedLinks"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Related Links
                        </label>
                        <input
                            type="text"
                            name="relatedLinks"
                            id="relatedLinks"
                            placeholder="https://example.com, https://another.com"
                            value={updateHistoryData.relatedLinks}
                            onChange={handleUpdateHistoryInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {employeeId === assignedBy && (
                        <div>
                            <label
                                htmlFor="remark"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Remark
                            </label>
                            <input
                                type="text"
                                name="remark"
                                id="remark"
                                placeholder="Add a remark"
                                value={updateHistoryData.remark}
                                onChange={handleUpdateHistoryInputChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="files"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Upload Files (Max 5)
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col w-full border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-lg cursor-pointer bg-blue-50 transition-all duration-200">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                                    <Upload className="h-8 w-8 text-blue-400 mb-2" />
                                    <p className="text-sm text-gray-500 text-center">
                                        <span className="font-semibold text-blue-600">Click to upload</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Any files (Max 5 files)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    name="files"
                                    id="files"
                                    multiple
                                    onChange={handleUpdateHistoryFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {updateHistoryData.relatedFileLinks.length > 0 && (
                            <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                                <p className="text-sm font-medium text-blue-800 mb-1">Selected files:</p>
                                <ul className="space-y-1 max-h-32 overflow-y-auto">
                                    {updateHistoryData.relatedFileLinks.map((file, index) => (
                                        <li
                                            key={index}
                                            className="text-xs bg-white rounded px-3 py-1.5 border border-blue-100 flex items-center"
                                        >
                                            <FileText className="h-3 w-3 mr-2 text-blue-500 flex-shrink-0" />
                                            <span className="truncate">{file.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowUpdateHistoryPopup(false)}
                            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                        >
                            <Upload className="h-4 w-4 mr-2 text-blue-100" />
                            Update Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
);

const TaskViewPage = () => {
    const { projectid, id } = useParams();
    const navigate = useNavigate();

    const [assignedBy, setAssignedBy] = useState("");
    const [showUpdateHistoryPopup, setShowUpdateHistoryPopup] = useState(false);
    const { userData } = useContext(Context);
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
    
    // New helper function to extract detailed error messages
    const getErrorMessage = (error) => {
        if (error.response) {
            // Server responded with a status code outside the 2xx range
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
            // The request was made but no response was received
            return "No response from the server. Please check your network connection.";
        } else {
            // Something else happened while setting up the request
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
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-600">
                    Loading Task Details...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-red-50">
                <div className="text-xl font-semibold text-red-600 p-8 text-center">{error}</div>
            </div>
        );
    }

    if (!currentTask) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-blue-100 text-red-600 text-2xl font-semibold">
                Task not found. Please check the ID.
            </div>
        );
    }

    const isTaskCompleted = currentTask.status.toUpperCase() === "COMPLETED";
    const isAssigner = userData?.employeeId === assignedBy;

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-6 px-4 sm:py-10 sm:px-6 lg:px-8 flex items-start justify-center font-sans">
                <div className="w-full bg-white p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                        <button
                            onClick={() => navigate(`/tasks/${userData?.employeeId}`)}
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                            aria-label="Go back to tasks list"
                        >
                            <ChevronLeft className="h-7 w-7" />
                        </button>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex-grow text-center">
                            Task Details
                        </h2>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <div className="mb-8 space-y-6">
                                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                                    {currentTask.title}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                    <div className="flex items-center text-gray-700">
                                        <Info className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                                        <span className="font-semibold mr-2">Priority:</span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-bold ${getPriorityClass(
                                                currentTask.priority
                                            )}`}
                                        >
                                            {currentTask.priority}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <Clock className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                                        <span className="font-semibold mr-2">Status:</span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusClass(
                                                currentTask.status
                                            )}`}
                                        >
                                            {currentTask.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <CalendarDays className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                                        <span className="font-semibold mr-2">Due Date:</span>
                                        <span className="text-sm bg-white p-2 rounded-md border border-gray-200 shadow-sm flex-grow">
                                            {currentTask.dueDate}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <CalendarDays className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                                        <span className="font-semibold mr-2">Created On:</span>
                                        <span className="text-sm bg-white p-2 rounded-md border border-gray-200 shadow-sm flex-grow">
                                            {currentTask.createdDate}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <User className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                                        <span className="font-semibold mr-2">Created By:</span>
                                        <span className="text-sm bg-white p-2 rounded-md border border-gray-200 shadow-sm flex-grow">
                                            {currentTask.createdBy}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <User className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
                                        <span className="font-semibold mr-2">Assigned To:</span>
                                        <span className="text-sm bg-white p-2 rounded-md border border-gray-200 shadow-sm flex-grow">
                                            {currentTask.assignedTo}
                                        </span>
                                    </div>
                                    {currentTask.completedDate && (
                                        <div className="flex items-center text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                                            <span className="font-semibold mr-2">
                                                Completed On:
                                            </span>
                                            <span className="text-sm">
                                                {currentTask.completedDate}
                                            </span>
                                        </div>
                                    )}
                                    {currentTask.rating && (
                                        <div className="flex items-center text-gray-700">
                                            <Star className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                                            <span className="font-semibold mr-2">Rating:</span>
                                            <span className="text-sm">{currentTask.rating} / 10</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-xl font-semibold text-gray-800 mb-3">
                                    Description
                                </h4>
                                <div className="bg-white p-5 rounded-lg border border-gray-200 text-gray-700 leading-relaxed shadow-sm">
                                    {currentTask.description}
                                </div>
                            </div>

                            {currentTask.remark && (
                                <div className="mb-8">
                                    <h4 className="text-xl font-semibold text-gray-800 mb-3">
                                        Remark
                                    </h4>
                                    <div className="bg-gray-100 p-5 rounded-lg border border-gray-200 text-gray-800 leading-relaxed shadow-sm">
                                        <MessageSquare className="inline-block h-4 w-4 mr-2 text-gray-500" />{" "}
                                        {currentTask.remark}
                                    </div>
                                </div>
                            )}

                            {currentTask.completionNote && (
                                <div className="mb-8">
                                    <h4 className="text-xl font-semibold text-gray-800 mb-3">
                                        Completion Note
                                    </h4>
                                    <div className="bg-green-50 p-5 rounded-lg border border-green-200 text-green-800 leading-relaxed shadow-sm">
                                        {currentTask.completionNote}
                                    </div>
                                </div>
                            )}

                            {(currentTask.relatedLinks?.length > 0 || currentTask.attachedFileLinks?.length > 0) && (
                                <div className="mb-8">
                                    <h4 className="text-xl font-semibold text-gray-800 mb-3">
                                        Related Links & Files
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {currentTask.relatedLinks?.length > 0 && (
                                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                                                <h5 className="font-medium text-blue-800 flex items-center mb-2">
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
                                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm">
                                                <h5 className="font-medium text-purple-800 flex items-center mb-2">
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

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-xl font-semibold text-gray-800">
                                        Update History
                                    </h4>
                                    {!isTaskCompleted && !isAssigner && (
                                        <button
                                            onClick={() => setShowUpdateHistoryPopup(true)}
                                            className="flex items-center justify-center bg-black text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-all duration-200 text-sm"
                                        >
                                            Create History
                                        </button>
                                    )}
                                </div>
                                {updateHistory?.length > 0 ? (
                                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-white">
                                                <tr>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated Date</th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changes</th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related Links</th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related Files</th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed By</th>
                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {updateHistory.map((history, index) => (
                                                    <tr key={history.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                        <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">{index + 1}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500 border border-gray-300">{new Date(history.updatedDate).toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">{history.changes}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500 italic border border-gray-300">{history.note || "-"}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">{renderRelatedLinks(history.relatedLinks)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">{renderRelatedFiles(history.relatedFileLinks)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500 italic border border-gray-300">
                                                            {editingRowId === history.id ? (
                                                                <input
                                                                    type="text"
                                                                    name="remark"
                                                                    value={editRowData?.remark || ""}
                                                                    onChange={handleInlineInputChange}
                                                                    className="w-full p-1 border rounded"
                                                                />
                                                            ) : (
                                                                history.remark || "-"
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">{history.reviewedBy || "-"}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
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
                                    <div className="text-center py-4 text-gray-500">
                                        No history recorded for this task yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showUpdateHistoryPopup && (
                <UpdateHistoryPopup
                    setShowUpdateHistoryPopup={setShowUpdateHistoryPopup}
                    handleUpdateHistorySubmit={handleUpdateHistorySubmit}
                    updateHistoryData={updateHistoryData}
                    handleUpdateHistoryInputChange={handleUpdateHistoryInputChange}
                    handleUpdateHistoryFileChange={handleUpdateHistoryFileChange}
                    assignedBy={assignedBy}
                    employeeId={userData?.employeeId}
                />
            )}
            
            {errorPopup.show && (
                <ErrorPopup
                    message={errorPopup.message}
                    onClose={() => setErrorPopup({ show: false, message: "" })}
                />
            )}

            {successPopup.show && (
                <SuccessPopup
                    message={successPopup.message}
                    onClose={() => setSuccessPopup({ show: false, message: "" })}
                />
            )}

            {confirmDeletePopup.show && (
                <ConfirmDeletePopup
                    onConfirm={confirmDelete}
                    onCancel={() => setConfirmDeletePopup({ show: false, historyId: null })}
                />
            )}
        </>
    );
};

export default TaskViewPage;