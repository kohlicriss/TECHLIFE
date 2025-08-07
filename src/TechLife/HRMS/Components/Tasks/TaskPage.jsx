import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Edit } from "lucide-react";
import { Context } from "../HrmsContext";
import { useContext } from "react";

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

const TaskPopup = ({
  show,
  setShow,
  handleSubmit,
  taskData,
  setTaskData,
  isEditing,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setTaskData((prev) => ({
      ...prev,
      attachedFileLinks: [...e.target.files],
    }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-opacity-100 flex justify-center shadow-2xl items-center z-200">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditing ? "Edit Task" : "Create New Task"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="id"
              value={taskData.id}
              onChange={handleInputChange}
              placeholder="Manual Task Id"
              className="p-2 border rounded-md"
              required
              disabled={isEditing}
            />
            <input
              name="title"
              value={taskData.title}
              onChange={handleInputChange}
              placeholder="Title"
              className="p-2 border rounded-md"
              required
            />
            <input
              name="createdBy"
              value={taskData.createdBy}
              onChange={handleInputChange}
              placeholder="Created By"
              className="p-2 border rounded-md"
              required
            />
            <input
              name="assignedTo"
              value={taskData.assignedTo}
              onChange={handleInputChange}
              placeholder="Assigned To"
              className="p-2 border rounded-md"
              required
            />
            <select
              name="status"
              value={taskData.status}
              onChange={handleInputChange}
              className="p-2 border rounded-md"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select
              name="priority"
              value={taskData.priority}
              onChange={handleInputChange}
              className="p-2 border rounded-md"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Due Date
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={taskData.dueDate}
                onChange={handleInputChange}
                className="p-2 border rounded-md w-full"
                required
              />
            </div>
            <div>
              <label
                htmlFor="createdDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Created Date
              </label>
              <input
                id="createdDate"
                name="createdDate"
                type="date"
                value={taskData.createdDate}
                onChange={handleInputChange}
                className="p-2 border rounded-md w-full"
                required
              />
            </div>
            <input
              name="rating"
              type="number"
              value={taskData.rating || ""}
              onChange={handleInputChange}
              placeholder="Rating (0-10)"
              className="p-2 border rounded-md"
              min="0"
              max="10"
            />
          </div>

          <textarea
            name="description"
            value={taskData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-2 border rounded-md"
            required
          />
          <textarea
            name="remark"
            value={taskData.remark}
            onChange={handleInputChange}
            placeholder="Remark"
            className="w-full p-2 border rounded-md"
          />
          <textarea
            name="completionNote"
            value={taskData.completionNote}
            onChange={handleInputChange}
            placeholder="Completion Note"
            className="w-full p-2 border rounded-md"
          />

          <input
            name="relatedLinks"
            value={
              Array.isArray(taskData.relatedLinks)
                ? taskData.relatedLinks.join(", ")
                : taskData.relatedLinks
            }
            onChange={handleInputChange}
            placeholder="Related Links (comma-separated)"
            className="w-full p-2 border rounded-md"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attach Files
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {isEditing ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TasksPage = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const sai = localStorage.getItem("logedempid");
  const role = localStorage.getItem("logedemprole");
  
  console.log(sai, role);
  const { userData, setUserData,accessToken } = useContext(Context);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortOption, setSortOption] = useState("none");
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initialFormState = {
    id: "",
    title: "",
    description: "",
    createdBy: "",
    assignedTo: "",
    status: "PENDING",
    priority: "MEDIUM",
    dueDate: "",
    createdDate: "",
    rating: "",
    remark: "",
    completionNote: "",
    relatedLinks: "",
    attachedFileLinks: [],
  };

  const [taskData, setTaskData] = useState(initialFormState);

  const fetchTasks = useCallback(async (currentEmployeeId) => {
    try {
      setLoading(true);
      const idToFetch = currentEmployeeId || userData?.employeeId ;
      const response = await axios.get(
        `http://192.168.0.120:8090/api/all/tasks/${idToFetch}`
      );
      setTasks(response.data);
      console.log("Fetched tasks:", response.data);
      setError(null);
    } catch (err) {
      setError(
        "Failed to fetch tasks. Please make sure the server is running."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(employeeId);
  }, [fetchTasks, employeeId]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calculateTimeCompletedBar = (startDateStr, dueDateStr, currentDate) => {
    const startDate = new Date(startDateStr);
    const dueDate = new Date(dueDateStr);

    startDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (
      isNaN(startDate.getTime()) ||
      isNaN(dueDate.getTime()) ||
      startDate.getTime() > dueDate.getTime()
    ) {
      return 0;
    }

    const totalDuration = dueDate.getTime() - startDate.getTime();
    const elapsedDuration = currentDate.getTime() - startDate.getTime();

    if (totalDuration <= 0) {
      return currentDate.getTime() >= dueDate.getTime() ? 100 : 0;
    }

    let percentage = (elapsedDuration / totalDuration) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    return Math.round(percentage);
  };

  const clickHandler = (projectid, id) => {
    navigate(`taskview/${projectid}/${id}`);
  };

  const getPriorityStyles = (priority) => {
    const upperPriority = priority ? priority.toUpperCase() : "";
    switch (upperPriority) {
      case "HIGH":
        return "bg-red-50 text-red-700 border-red-100";
      case "MEDIUM":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "LOW":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getStatusStyles = (status) => {
    const upperStatus = status ? status.toUpperCase().replace(" ", "_") : "";
    switch (upperStatus) {
      case "IN_PROGRESS":
        return "bg-purple-50 text-purple-700";
      case "PENDING":
        return "bg-orange-50 text-orange-700";
      case "COMPLETED":
        return "bg-green-50 text-green-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getStatusDot = (status) => {
    const upperStatus = status ? status.toUpperCase().replace(" ", "_") : "";
    switch (upperStatus) {
      case "IN_PROGRESS":
        return "bg-purple-500";
      case "PENDING":
        return "bg-orange-500";
      case "COMPLETED":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleCreateClick = () => {
    setIsEditing(false);
    setTaskData(initialFormState);
    setShowTaskPopup(true);
  };

  const handleEditClick = (e, task) => {
    e.stopPropagation();
    setIsEditing(true);
    setTaskData(task);
    setShowTaskPopup(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const taskPayload = {
      ...taskData,
      relatedLinks: Array.isArray(taskData.relatedLinks)
        ? taskData.relatedLinks
        : taskData.relatedLinks
            .split(",")
            .map((link) => link.trim())
            .filter((link) => link),
      attachedFileLinks: Array.isArray(taskData.attachedFileLinks)
        ? taskData.attachedFileLinks.map((f) => f.name)
        : [],
      rating: taskData.rating ? parseInt(taskData.rating, 10) : null,
    };

    const employeeId = "ACS00000001";
    const projectId = isEditing ? taskData.projectId : "PRO0001";

    try {
      if (isEditing) {
        const response = await axios.put(
          `http://192.168.0.120:8090/api/${employeeId}/${projectId}/task`,
          taskPayload
        );
        console.log("Task updated:", response.data);
      } else {
        const response = await axios.post(
          `http://192.168.0.120:8090/api/${employeeId}/${projectId}/task`,
          taskPayload
        );
        console.log("Task created:", response.data);
      }
      setShowTaskPopup(false);
      fetchTasks(employeeId);
    } catch (err) {
      console.error(`Error ${isEditing ? "updating" : "creating"} task:`, err);
      setError(`Failed to ${isEditing ? "update" : "create"} task.`);
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filterStatus === "ALL") {
          return true;
        }
        const normalizedTaskStatus = task.status
          ? task.status.toUpperCase().replace(" ", "_")
          : "";
        return normalizedTaskStatus === filterStatus;
      })
      .sort((a, b) => {
        if (sortOption === "startDateAsc") {
          return new Date(a.startDate) - new Date(b.startDate);
        } else if (sortOption === "priorityDesc") {
          const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
          const priorityA = a.priority ? a.priority.toUpperCase() : "";
          const priorityB = b.priority ? b.priority.toUpperCase() : "";
          return priorityOrder[priorityA] - priorityOrder[priorityB];
        }
        return 0;
      });
  }, [tasks, filterStatus, sortOption]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">
          Loading tasks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              {userData?.roles[0] === "TEAM_LEAD" ? (
                <p>
                  Welcome, {userData?.roles[0]} You are Viewing Employe's tasks
                </p>
              ) : null}
              {userData?.roles[0] === "HR" ? (
                <p>
                  Welcome, {userData?.roles[0]} You are Viewing Employe's tasks
                </p>
              ) : null}
              {userData?.roles[0] === "MANAGER" ? (
                <p>
                  Welcome, {userData?.roles[0]} You are Viewing Employe's tasks
                </p>
              ) : null}
              {userData?.roles[0] === "EMPLOYEE" ? (
                <p>
                  Welcome, {userData?.roles[0]} You are Viewing your's tasks
                </p>
              ) : null}
              <h1 className="text-3xl font-extrabold text-slate-800">
                {["TEAM_LEAD", "HR", "MANAGER"].includes(userData?.roles?.[0])
                  ? "Employee's Tasks"
                  : "My Tasks"}
              </h1>
              {userData?.roles[0] === "EMPLOYEE" && (
                <p className="mt-1 text-slate-500 text-lg">
                  You have {filteredAndSortedTasks.length} tasks currently
                  displayed.
                </p>
              )}
            </div>
            {userData?.roles[0] === "TEAM_LEAD" && (
              <button
                onClick={handleCreateClick}
                className="mt-4 sm:mt-0 flex items-center justify-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all duration-200 text-sm"
              >
                Create Task
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <label
                htmlFor="filterStatus"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Status:
              </label>
              <select
                id="filterStatus"
                name="filterStatus"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm bg-white"
                value={filterStatus}
                onChange={handleFilterChange}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label
                htmlFor="sortOption"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sort by:
              </label>
              <select
                id="sortOption"
                name="sortOption"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm bg-white"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="none">None</option>
                <option value="startDateAsc">Start Date (Ascending)</option>
                <option value="priorityDesc">Priority (High to Low)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200/80">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Task Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Priority
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Assigned To
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Assigned By
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Start Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Due Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                    >
                      Progress
                    </th>
                    {userData?.roles[0] === "TEAM_LEAD" && (
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredAndSortedTasks.length > 0 ? (
                    filteredAndSortedTasks.map((task) => {
                      const timeCompletedBar = calculateTimeCompletedBar(
                        task.startDate,
                        task.dueDate,
                        today
                      );
                      let progressBarColor;

                      if (timeCompletedBar <= 25) {
                        progressBarColor = "bg-green-500";
                      } else if (
                        timeCompletedBar > 25 &&
                        timeCompletedBar <= 50
                      ) {
                        progressBarColor = "bg-blue-500";
                      } else if (
                        timeCompletedBar > 50 &&
                        timeCompletedBar <= 75
                      ) {
                        progressBarColor = "bg-yellow-500";
                      } else {
                        progressBarColor = "bg-red-500";
                      }

                      return (
                        <tr
                          key={task.id}
                          onClick={() => clickHandler(task.projectId, task.id)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-normal text-sm font-medium text-slate-800">
                            {task.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${getStatusStyles(
                                task.status
                              )}`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full inline-block ${getStatusDot(
                                  task.status
                                )} mr-1`}
                              ></span>
                              {task.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-xs font-bold py-1 px-2.5 rounded-md border ${getPriorityStyles(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {task.assignedTo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {task.createdBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            <div className="flex items-center">
                              <CalendarIcon />
                              {task.startDate}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            <div className="flex items-center">
                              <CalendarIcon />
                              {task.dueDate}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="w-24 bg-gray-200 rounded-full h-2.5 overflow-hidden mb-1">
                              <div
                                className={`${progressBarColor} h-full rounded-full transition-all duration-500 ease-out`}
                                style={{ width: `${timeCompletedBar}%` }}
                              ></div>
                            </div>
                            <div className="text-right text-xs text-gray-600">
                              {timeCompletedBar}%
                            </div>
                          </td>
                          {userData?.roles[0] === "TEAM_LEAD" && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={(e) => handleEditClick(e, task)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit size={18} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={role === "MANAGER" ? 9 : 8}
                        className="text-center py-10 text-gray-500 text-lg"
                      >
                        No tasks match your current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showTaskPopup && (
        <TaskPopup
          show={showTaskPopup}
          setShow={setShowTaskPopup}
          handleSubmit={handleTaskSubmit}
          taskData={taskData}
          setTaskData={setTaskData}
          isEditing={isEditing}
        />
      )}
    </>
  );
};

export default TasksPage;
