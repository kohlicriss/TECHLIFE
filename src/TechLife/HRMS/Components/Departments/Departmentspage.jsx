import React, { useEffect, useContext, useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { publicinfoApi } from "../../../../axiosInstance";
import { Context } from "../HrmsContext";
import { PlusCircle, X, Loader2, Trash2, Pencil } from 'lucide-react';

// Initial form state
const initialNewDepartment = {
  departmentName: '',
  departmentDescription: '',
};

const NotificationPopup = memo(({ open, onClose, message, type, theme }) => {
  if (!open) return null;
  const baseClasses = "px-5 py-3 rounded-xl shadow font-medium border-2 flex items-center justify-between";
  const themeClasses = theme === "dark"
    ? (type === "success" ? "bg-green-700 border-green-400 text-green-100" :
       type === "error" ? "bg-red-700 border-red-400 text-red-100" :
       "bg-blue-700 border-blue-400 text-blue-100")
    : (type === "success" ? "bg-green-600 border-green-400 text-white" :
       type === "error" ? "bg-red-600 border-red-400 text-white" :
       "bg-blue-600 border-blue-400 text-white");

  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-8 z-[9999] max-w-lg w-full px-4">
      <div className={`${baseClasses} ${themeClasses}`}>
        <span>{message}</span>
        <button 
          className={`ml-4 px-3 py-1 rounded hover:opacity-80 focus:outline-none ${theme === "dark" ? "bg-white/30 text-white" : "bg-white text-blue-700"}`}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
});

const DepartmentModal = memo(({
  open, onClose, onSubmit, department, onInputChange, isSubmitting, formError, editMode, theme
}) => {
  if (!open) return null;

  const modalBg = theme === "dark" ? "bg-gray-900 text-gray-200 border-gray-700" : "bg-white text-gray-900 border-gray-200";
  const labelColor = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const inputBg = theme === "dark" ? "bg-gray-800 border-gray-600 placeholder-gray-500 text-gray-300" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] px-2">
      <div className={`rounded-2xl shadow-2xl w-full max-w-lg p-8 border ${modalBg}`}>
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-500">
          <h3 className="text-2xl font-bold text-blue-500 flex items-center">
            {editMode ? (
              <>
                <Pencil size={22} className="mr-3" /> Edit Department
              </>
            ) : (
              <>
                <PlusCircle size={22} className="mr-3" /> Create Department
              </>
            )}
          </h3>
          <button onClick={onClose}
            className={`text-gray-400 hover:text-gray-600 focus:outline-none`}
            disabled={isSubmitting}
            aria-label="Close Modal">
            <X size={26} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="departmentName" className={`block text-sm font-medium mb-1 ${labelColor}`}>
              Department Name
            </label>
            <input
              type="text"
              id="departmentName"
              name="departmentName"
              value={department.departmentName}
              onChange={onInputChange}
              placeholder="e.g., Marketing, R&D"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputBg}`}
              required
              disabled={isSubmitting}
              maxLength={100}
              spellCheck="false"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="departmentDescription" className={`block text-sm font-medium mb-1 ${labelColor}`}>
              Description
            </label>
            <textarea
              id="departmentDescription"
              name="departmentDescription"
              value={department.departmentDescription}
              onChange={onInputChange}
              placeholder="Briefly describe the department's function."
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none ${inputBg}`}
              required
              disabled={isSubmitting}
              maxLength={300}
              spellCheck="false"
            />
          </div>
          {formError && (
            <div className="bg-red-50 px-3 py-2 rounded border border-red-400 text-sm text-red-600">
              {formError}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className={`px-5 py-2 rounded-lg text-sm ${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              disabled={isSubmitting}>Cancel</button>
            <button type="submit"
              className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center 
                ${editMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              disabled={isSubmitting}>
              {isSubmitting && <Loader2 size={18} className="animate-spin mr-2" />}
              {editMode ? "Update Department" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

const Departmentspage = () => {
  const { userData, theme } = useContext(Context);
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredDeptId, setHoveredDeptId] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDeptId, setEditDeptId] = useState(null);
  const [departmentForm, setDepartmentForm] = useState(initialNewDepartment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState('success');
  const [notifOpen, setNotifOpen] = useState(false);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await publicinfoApi.get("employee/0/10/departmentId/asc/all/departments");
      setDepartments(response.data.content || []);
    } catch (err) {
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Modal input handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setDepartmentForm(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  // Notification helpers
  const showNotif = (type, msg) => {
    setNotifType(type);
    setNotifMsg(msg);
    setNotifOpen(true);
  };
  const hideNotif = () => setNotifOpen(false);

  // Create Dept submit handler
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!departmentForm.departmentName || !departmentForm.departmentDescription) {
      setFormError('Both Department Name and Description are required.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      await publicinfoApi.post(`employee/department`, departmentForm);
      showNotif('success', `Department "${departmentForm.departmentName}" created successfully.`);
      setIsCreateOpen(false);
      setDepartmentForm(initialNewDepartment);
      await fetchDepartments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create department. Make sure Department Name is unique.');
      showNotif("error", "Creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit modal open & prefill
  const handleOpenEdit = (dept) => {
    setEditDeptId(dept.departmentId);
    setDepartmentForm({
      departmentName: dept.departmentName || "",
      departmentDescription: dept.departmentDescription || "",
    });
    setIsEditOpen(true);
    setFormError('');
  };

  // Edit Dept submit handler
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!departmentForm.departmentName || !departmentForm.departmentDescription) {
      setFormError('Both Department Name and Description are required.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      await publicinfoApi.put(`employee/department/${editDeptId}`, departmentForm);
      showNotif('success', `Department "${departmentForm.departmentName}" updated successfully.`);
      setIsEditOpen(false);
      setDepartmentForm(initialNewDepartment);
      await fetchDepartments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update department. Make sure Department Name is unique.');
      showNotif("error", "Update failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteDept, setDeleteDept] = useState({});
  const handleDeleteDepartment = (e, dept) => {
    e.stopPropagation();
    setDeleteDept(dept);
    setConfirmOpen(true);
  };
  const confirmDeleteDept = async () => {
    setLoading(true);
    setConfirmOpen(false);
    try {
      await publicinfoApi.delete(`employee/${deleteDept.departmentId}/department`);
      showNotif("success", `Department "${deleteDept.departmentName}" deleted.`);
      await fetchDepartments();
    } catch {
      showNotif("error", `Failed to delete department "${deleteDept.departmentName}".`);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className={`flex justify-center items-center h-[50vh] text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-700"}`}>
      <Loader2 size={28} className="animate-spin mr-3" /> Loading departments...
    </div>
  );
  if (error) return (
    <div className={`flex justify-center items-center h-[50vh] text-lg ${theme === "dark" ? "text-red-500" : "text-red-600"}`}>
      {error}
    </div>
  );

  return (
    <div className={`${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} max-w-7xl mx-auto px-3 py-12 min-h-screen`}>
      {/* Create/Edit Modals & Notifications */}
      <DepartmentModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        department={departmentForm}
        onInputChange={handleFormChange}
        isSubmitting={isSubmitting}
        formError={formError}
        editMode={false}
        theme={theme}
      />
      <DepartmentModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        department={departmentForm}
        onInputChange={handleFormChange}
        isSubmitting={isSubmitting}
        formError={formError}
        editMode={true}
        theme={theme}
      />
      <NotificationPopup open={notifOpen} onClose={hideNotif} message={notifMsg} type={notifType} theme={theme} />

      {/* Confirm Delete Popup */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-900"} rounded-xl shadow-2xl border max-w-md w-full p-6`}>
            <div className="flex items-center mb-4">
              <Trash2 size={26} className="text-red-500 mr-3" />
              <span className="text-xl font-bold text-red-600">Delete Department</span>
            </div>
            <p className="mb-6">
              Are you sure you want to delete <b>{deleteDept.departmentName}</b>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button className={`px-5 py-2 rounded-lg text-sm hover:bg-gray-200 ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button
                className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center"
                onClick={confirmDeleteDept}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
        <h2 className={`${theme === "dark" ? "text-gray-100" : "text-blue-700"} text-4xl font-extrabold tracking-tight`}>
          🏢 Departments
        </h2>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition flex items-center"
        >
          <PlusCircle size={24} className="mr-2" />
          Create Department
        </button>
      </div>

      {/* Responsive department grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {departments.map((dept) => (
          <div
            key={dept.departmentId}
            onMouseEnter={() => setHoveredDeptId(dept.departmentId)}
            onMouseLeave={() => setHoveredDeptId(null)}
            onClick={() => navigate(`departmentview/${dept.departmentId}`)}
            className={`${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-900"} rounded-2xl shadow-xl p-8 cursor-pointer relative hover:scale-105 hover:shadow-2xl transition duration-200 group`}
            style={{ boxShadow: theme === "dark" ? "0 6px 24px rgba(31,41,55,0.8)" : "0 6px 24px rgba(63,131,248,0.08)" }}
          >
            {/* Buttons on hover */}
            <div
              className={`absolute top-3 right-3 flex gap-2 transition-opacity duration-200 ${
                hoveredDeptId === dept.departmentId ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button
                onClick={(e) => { e.stopPropagation(); handleOpenEdit(dept); }}
                className={`${theme === "dark" ? "bg-blue-700 text-blue-300 hover:bg-blue-600" : "bg-blue-100 text-blue-700 hover:bg-blue-200"} p-2 rounded-full transition`}
                aria-label="Edit department"
                title="Edit department"
              >
                <Pencil size={20} />
              </button>
              <button
                onClick={(e) => handleDeleteDepartment(e, dept)}
                className={`${theme === "dark" ? "bg-red-700 text-red-400 hover:bg-red-600" : "bg-red-100 text-red-600 hover:bg-red-200"} p-2 rounded-full transition`}
                aria-label="Delete department"
                title="Delete department"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <h3 className="mb-3 text-2xl font-bold group-hover:text-blue-400 transition">{dept.departmentName}</h3>
            <p className="text-base">{dept.departmentDescription}</p>
          </div>
        ))}
      </div>

      <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} text-center mt-12 font-medium`}>
        Total Departments: {departments.length}
      </p>
    </div>
  );
};

export default Departmentspage;
