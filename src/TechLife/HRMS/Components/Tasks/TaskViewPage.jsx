import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
} from "lucide-react";

const UpdateHistoryPopup = ({
  setShowUpdateHistoryPopup,
  handleUpdateHistorySubmit,
  updateHistoryData,
  handleUpdateHistoryInputChange,
  handleUpdateHistoryFileChange,
  position,
}) => (
  <div className="fixed inset-0 bg-opacity-100 flex justify-center items-center shadow-2xl z-201">
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95">
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
          Update Task History
        </h3>
        <button
          onClick={() => setShowUpdateHistoryPopup(false)}
          className="text-gray-400 hover:text-gray-700 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <XCircle className="h-7 w-7" />
        </button>
      </div>
      <form onSubmit={handleUpdateHistorySubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="changes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Changes
            </label>
            <input
              type="text"
              name="changes"
              id="changes"
              placeholder="e.g., Status: IN_PROGRESS -> COMPLETED"
              value={updateHistoryData.changes}
              onChange={handleUpdateHistoryInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="note"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="relatedLinks"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Related Links (comma-separated)
            </label>
            <input
              type="text"
              name="relatedLinks"
              id="relatedLinks"
              placeholder="https://example.com, https://another-link.com"
              value={updateHistoryData.relatedLinks}
              onChange={handleUpdateHistoryInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {position === "admin" && (
            <>
              <div>
                <label
                  htmlFor="remark"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="reviewedBy"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reviewed By
                </label>
                <input
                  type="text"
                  name="reviewedBy"
                  id="reviewedBy"
                  placeholder="Enter reviewer's name"
                  value={updateHistoryData.reviewedBy}
                  onChange={handleUpdateHistoryInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </>
          )}
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Upload Files (Max 5)
            </label>
            <input
              type="file"
              name="files"
              id="files"
              multiple
              onChange={handleUpdateHistoryFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
            />
            {updateHistoryData.relatedFileLinks.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-semibold">Selected files:</p>
                <ul className="list-disc list-inside pl-2">
                  {Array.from(updateHistoryData.relatedFileLinks).map(
                    (file, index) => (
                      <li key={index}>{file.name}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="flex items-center justify-center bg-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            Update Changes
          </button>
        </div>
      </form>
    </div>
  </div>
);

const TaskViewPage = () => {
  const { projectid, id, empID } = useParams();
  const navigate = useNavigate();

  const [assignedBy, setAssignedBy] = useState("");
  const [showUpdateHistoryPopup, setShowUpdateHistoryPopup] = useState(false);
  const { userData, setUserData } = useContext(Context);
  const position = userData?.roles[0];
  const [updateHistoryData, setUpdateHistoryData] = useState({
    changes: "",
    note: "",
    relatedLinks: "",
    relatedFileLinks: [],
    reviewedBy: "",
    remark: "",
  });

  const [currentTask, setCurrentTask] = useState(null);
  const [updateHistory, setUpdateHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editRowData, setEditRowData] = useState(null);

  const fetchTaskData = async () => {
    if (!projectid || !id) return;
    
    setLoading(true);
    setError(null); // Reset error state on new fetch

    try {
      // --- Step 1: Fetch Task Details ---
      const taskResponse = await fetch(
        `http://192.168.0.120:8090/api/task/${projectid}/${id}`
      );

      if (!taskResponse.ok) {
        // Throw a specific error if task fetch fails
        throw new Error(`Task fetch failed with status: ${taskResponse.status}`);
      }

      const taskData = await taskResponse.json();
      console.log("Task Data Received:", taskData);
      setAssignedBy(taskData?.createdBy); // Set the assignedBy state here
      setCurrentTask(taskData);

      // --- Step 2: Fetch Update History (in a separate try/catch) ---
      try {
        const historyResponse = await fetch(
          `http://192.168.0.120:8090/api/task/status/${projectid}/${id}`
        );
        if (!historyResponse.ok) {
          // Don't throw an error that stops the page. Just log it and set an empty history.
          console.warn("Could not fetch task history. Displaying task without it.");
          setUpdateHistory([]); // Set to empty array to prevent render errors
        } else {
          const historyData = await historyResponse.json();
          setUpdateHistory(historyData);
        }
      } catch (historyErr) {
          console.error("A network or other error occurred while fetching history:", historyErr);
          setUpdateHistory([]);
      }

    } catch (err) {
      // This will only catch errors from the main task fetch now
      setError(err.message || "Failed to fetch critical task details.");
      console.error(err);
      setCurrentTask(null); // Ensure no stale data is shown
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [projectid, id, assignedBy]); // Added assignedBy to dependency array

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
    const files = [...e.target.files];
    if (files.length > 5) {
      const limitedFiles = files.slice(0, 5);
      setUpdateHistoryData((prev) => ({
        ...prev,
        relatedFileLinks: limitedFiles,
      }));
    } else {
      setUpdateHistoryData((prev) => ({ ...prev, relatedFileLinks: files }));
    }
  };

  const handleUpdateHistorySubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...updateHistoryData,
      relatedLinks: updateHistoryData.relatedLinks
        .split(",")
        .map((link) => link.trim())
        .filter((link) => link),
      relatedFileLinks: updateHistoryData.relatedFileLinks.map(
        (file) => file.name
      ),
    };

    try {
      const response = await axios.post(
        `http://192.168.0.120:8090/api/history/${projectid}/${id}`,
        payload
      );
      console.log("Update History Response:", response.data);
      setShowUpdateHistoryPopup(false);
      setUpdateHistoryData({
        changes: "",
        note: "",
        relatedLinks: "",
        relatedFileLinks: [],
        reviewedBy: "",
        remark: "",
      });
      fetchTaskData();
    } catch (error) {
      console.error("Error updating history:", error);
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
      const response = await axios.put(
        `http://192.168.0.120:8090/api/status/${projectid}/${id}`,
        editRowData
      );
      console.log("Inline Save Response:", response.data);
      handleInlineCancel();
      fetchTaskData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleInlineInputChange = (e) => {
    const { name, value } = e.target;
    setEditRowData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitTask = () => {
    const now = new Date();
    const completedDate = now.toISOString().slice(0, 10);
    const updatedDateTime = now.toISOString();

    const updatedTask = {
      ...currentTask,
      status: "COMPLETED",
      completedDate: completedDate,
      completionNote: currentTask.completionNote || "Task marked as completed.",
    };
    const newHistoryEntry = {
      updatedBy: {
        id: currentTask.assignedTo,
        name: currentTask.assignedTo,
      },
      updatedDate: updatedDateTime,
      changes: {
        status: { from: currentTask.status, to: "COMPLETED" },
        completedDate: {
          from: currentTask.completedDate,
          to: completedDate,
        },
      },
      note: "Task submitted and marked as completed.",
    };

    setCurrentTask(updatedTask);
    setUpdateHistory([...updateHistory, newHistoryEntry]);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
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
        <div className="text-xl font-semibold text-red-600">{error}</div>
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

          {showSuccessMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6"
              role="alert"
            >
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline ml-2">
                Task updated successfully.
              </span>
            </div>
          )}

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
                      <span className="font-semibold mr-2">Completed On:</span>
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

              {(currentTask.relatedLinks &&
                currentTask.relatedLinks.length > 0) ||
              (currentTask.attachedFileLinks &&
                currentTask.attachedFileLinks.length > 0) ? (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-3">
                    Related Links & Files
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentTask.relatedLinks &&
                      currentTask.relatedLinks.length > 0 && (
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
                    {currentTask.attachedFileLinks &&
                      currentTask.attachedFileLinks.length > 0 && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm">
                          <h5 className="font-medium text-purple-800 flex items-center mb-2">
                            <FileText className="h-4 w-4 mr-2" /> Attached
                            Files:
                          </h5>
                          <ul className="space-y-1">
                            {currentTask.attachedFileLinks.map(
                              (link, index) => (
                                <li key={index}>
                                  <a
                                    href={`http://192.168.0.120:8090/files/${projectid}/${link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:text-purple-800 hover:underline text-sm break-all"
                                  >
                                    {link}
                                  </a>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xl font-semibold text-gray-800">
                    Update History
                  </h4>
                  {userData?.employeeId !== assignedBy && (
                    <button
                      onClick={() => setShowUpdateHistoryPopup(true)}
                      className="flex items-center justify-center bg-black text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-all duration-200 text-sm"
                    >
                      Update History
                    </button>
                  )}
                </div>
                {updateHistory && updateHistory.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            S.No
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Updated Date
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Changes
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Note
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Related Links
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Related Files
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Remarks
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Reviewed By
                          </th>
                          {position === "TEAM_LEAD" && (
                            <th
                              scope="col"
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {updateHistory.map((history, index) => (
                          <tr
                            key={history.id}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 border border-gray-300">
                              {new Date(history.updatedDate).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
                              {history.changes}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 italic border border-gray-300">
                              {history.note || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 border border-gray-300">
                              {history.relatedLinks &&
                              history.relatedLinks.length > 0 ? (
                                <ul className="list-disc list-inside space-y-0.5">
                                  {history.relatedLinks.map(
                                    (link, linkIndex) => (
                                      <li
                                        key={linkIndex}
                                        className="break-words"
                                      >
                                        <a
                                          href={link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          {link}
                                        </a>
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 border border-gray-300">
                              {history.relatedFileLinks &&
                              history.relatedFileLinks.length > 0 ? (
                                <ul className="list-disc list-inside space-y-0.5">
                                  {history.relatedFileLinks.map(
                                    (link, linkIndex) => (
                                      <li
                                        key={linkIndex}
                                        className="break-words"
                                      >
                                        <a
                                          href={link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-purple-600 hover:underline"
                                        >
                                          <FileText className="inline-block h-3 w-3 mr-1" />
                                          {link.split('/').pop()}
                                        </a>
                                      </li>
                                    )
                                  )}
                                </ul>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 italic border border-gray-300">
                              {editingRowId === history.id ? (
                                <input
                                  type="text"
                                  name="remark"
                                  value={editRowData.remark || ""}
                                  onChange={handleInlineInputChange}
                                  className="w-full p-1 border rounded"
                                />
                              ) : (
                                history.remark || "-"
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
                              {editingRowId === history.id ? (
                                <input
                                  type="text"
                                  name="reviewedBy"
                                  value={editRowData.reviewedBy || ""}
                                  onChange={handleInlineInputChange}
                                  className="w-full p-1 border rounded"
                                />
                              ) : (
                                history.reviewedBy || "-"
                              )}
                            </td>
                            {position === "TEAM_LEAD" && (
                              <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300">
                                {editingRowId === history.id ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleInlineSave(history.id)
                                      }
                                      className="text-green-600 hover:text-green-800"
                                    >
                                      <Save size={16} />
                                    </button>
                                    <button
                                      onClick={handleInlineCancel}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleInlineEdit(history)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit size={16} />
                                  </button>
                                )}
                              </td>
                            )}
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

          {/* New Conditional Rendering for the Mark as Completed button */}
          {!isTaskCompleted && position === "TEAM_LEAD" && (userData?.employeeId === assignedBy) && (
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleSubmitTask}
                className="flex items-center justify-center bg-green-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Mark as Completed
              </button>
            </div>
          )}
        </div>
      </div>
      {showUpdateHistoryPopup && (
        <UpdateHistoryPopup
          setShowUpdateHistoryPopup={setShowUpdateHistoryPopup}
          handleUpdateHistorySubmit={handleUpdateHistorySubmit}
          updateHistoryData={updateHistoryData}
          handleUpdateHistoryInputChange={handleUpdateHistoryInputChange}
          handleUpdateHistoryFileChange={handleUpdateHistoryFileChange}
          position={position}
        />
      )}
    </>
  );
};

export default TaskViewPage;
