import React, { useEffect, useContext, useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { publicinfoApi } from "../../../../axiosInstance";
import { Context } from "../HrmsContext";
import { PlusCircle, X, Loader2, Trash2, Pencil, Users, Building2 } from 'lucide-react';


const initialNewDepartment = { departmentName: '', departmentDescription: '' };


const NotificationPopup = memo(({ open, onClose, message, type, theme }) => {
  if (!open) return null;
  const baseClasses = "px-5 py-3 shadow font-medium border-2 flex items-center justify-between";
  const themeClasses = theme === "dark"
    ? (type === "success" ? "bg-green-700 border-green-400 text-green-100"
      : type === "error" ? "bg-red-700 border-red-400 text-red-100"
      : "bg-blue-700 border-blue-400 text-blue-100")
    : (type === "success" ? "bg-green-600 border-green-400 text-white"
      : type === "error" ? "bg-red-600 border-red-400 text-white"
      : "bg-blue-600 border-blue-400 text-white");
  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-8 z-[9999] max-w-lg w-full px-4">
      <div className={`${baseClasses} ${themeClasses}`}>
        <span>{message}</span>
        <button 
          className={`ml-4 px-3 py-1 hover:opacity-80 focus:outline-none ${theme === "dark" ? "bg-white/30 text-white" : "bg-white text-blue-700"}`}
          onClick={onClose}
        >Close</button>
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
      <div className={`shadow-2xl w-full max-w-lg p-8 border ${modalBg}`}>
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
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
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
              className={`w-full px-4 py-2 border focus:ring-2 focus:ring-blue-500 ${inputBg}`}
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
              className={`w-full px-4 py-2 border focus:ring-2 focus:ring-blue-500 resize-none ${inputBg}`}
              required
              disabled={isSubmitting}
              maxLength={300}
              spellCheck="false"
            />
          </div>
          {formError && (
            <div className="bg-red-50 px-3 py-2 border border-red-400 text-sm text-red-600">
              {formError}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className={`px-5 py-2 text-sm ${theme === "dark" ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              disabled={isSubmitting}>Cancel</button>
            <button type="submit"
              className={`px-5 py-2 text-sm font-semibold flex items-center 
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


const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 640;


const Departmentspage = () => {
  const { theme } = useContext(Context);
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
  const [mobile, setMobile] = useState(isMobile());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteDept, setDeleteDept] = useState({});


  useEffect(() => {
    const onResize = () => setMobile(isMobile());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);


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


  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setDepartmentForm(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };


  const showNotif = (type, msg) => {
    setNotifType(type);
    setNotifMsg(msg);
    setNotifOpen(true);
  };
  const hideNotif = () => setNotifOpen(false);


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


  const handleOpenEdit = (dept) => {
    setEditDeptId(dept.departmentId);
    setDepartmentForm({
      departmentName: dept.departmentName || "",
      departmentDescription: dept.departmentDescription || "",
    });
    setIsEditOpen(true);
    setFormError('');
  };


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
    <div className={`${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} min-h-screen`}>
      {/* Sticky Header */}
      <div className={`sticky top-0 z-30 px-2 ${theme === "dark" ? "bg-gray-900 border-b border-gray-800" : "bg-white border-b border-gray-200"}`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${theme === "dark" ? "bg-blue-900/50" : "bg-blue-100"}`}>
              <Building2 size={32} className={theme === "dark" ? "text-blue-400" : "text-blue-600"} />
            </div>
            <div>
              <h2 className={`${theme === "dark" ? "text-gray-100" : "text-gray-800"} text-3xl font-extrabold tracking-tight`}>Departments</h2>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Manage your organization's departments</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl transition-all flex items-center"
          >
            <PlusCircle size={24} className="mr-2" />
            Create Department
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-3 pb-8 pt-8 sm:pt-16">
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
        {confirmOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className={`${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-900"} shadow-2xl border max-w-md w-full p-6`}>
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 mr-3">
                  <Trash2 size={26} className="text-red-500" />
                </div>
                <span className="text-xl font-bold text-red-600">Delete Department</span>
              </div>
              <p className="mb-6">
                Are you sure you want to delete <b>{deleteDept.departmentName}</b>? This cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button className={`px-5 py-2 text-sm hover:bg-gray-200 ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}`} onClick={() => setConfirmOpen(false)}>Cancel</button>
                <button className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg flex items-center" onClick={confirmDeleteDept}>Delete</button>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.departmentId}
              onMouseEnter={() => setHoveredDeptId(dept.departmentId)}
              onMouseLeave={() => setHoveredDeptId(null)}
              onClick={() => navigate(`departmentview/${btoa(dept.departmentId)}`)}
              className={`${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-900"} p-6 cursor-pointer relative border-2 shadow-lg hover:shadow-2xl transition`}
            >
              <div className={`absolute -top-3 -left-3 p-3 shadow-lg ${theme === "dark" ? "bg-blue-900/50" : "bg-blue-100"}`}>
                <Users size={20} className="text-white" />
              </div>
              <div className={`absolute top-3 right-3 flex gap-2 z-10 ${mobile ? "opacity-100" : hoveredDeptId === dept.departmentId ? "opacity-100" : "opacity-0"}`}>
                <button onClick={e => { e.stopPropagation(); handleOpenEdit(dept); }}
                  className={`p-2 border ${theme === "dark" ? "bg-blue-800/80 border-blue-600 text-blue-300 hover:bg-blue-700" : "bg-blue-100/80 border-blue-300 text-blue-700 hover:bg-blue-200"} transition`} aria-label="Edit department" title="Edit department"><Pencil size={18} /></button>
                <button onClick={e => handleDeleteDepartment(e, dept)}
                  className={`p-2 border ${theme === "dark" ? "bg-red-800/80 border-red-600 text-red-300 hover:bg-red-700" : "bg-red-100/80 border-red-300 text-red-600 hover:bg-red-200"} transition`} aria-label="Delete department" title="Delete department"><Trash2 size={18} /></button>
              </div>
              <div className="relative z-1">
                <h3 className="mb-3 text-xl font-bold group-hover:text-blue-400 transition-colors duration-300">{dept.departmentName}</h3>
                <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{dept.departmentDescription}</p>
              </div>
            </div>
          ))}
        </div>
        {departments.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className={`p-8 max-w-md mx-auto ${theme === "dark" ? "bg-gray-800/50 border border-gray-700" : "bg-white/70 border border-gray-200"}`}>
              <Building2 size={64} className={`mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
              <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>No Departments Found</h3>
              <p className={`mb-6 ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>Get started by creating your first department</p>
              <button onClick={() => setIsCreateOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-xl transition-all flex items-center mx-auto">
                <PlusCircle size={20} className="mr-2" />
                Create First Department
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default Departmentspage;