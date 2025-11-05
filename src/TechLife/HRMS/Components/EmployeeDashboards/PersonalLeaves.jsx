import React, { useContext, useEffect, useState, Fragment } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { set } from "date-fns";
import { Context } from "../HrmsContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, SearchIcon, UserCircle, X } from "lucide-react";
import { FaListUl, FaPlus, FaTh } from "react-icons/fa";
import { FiDelete, FiEdit } from "react-icons/fi";

const Form = ({ label, theme, helperText, type = 'text', ...props }) => {
    const inputClasses = theme === 'dark'
        ? 'border-gray-600 bg-gray-700 text-white'
        : 'border-gray-300 bg-white text-gray-800';
    return (
        <div>
            <label
                htmlFor={props.id || props.name}
                className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
            >
                {label}
            </label>
            <input
                type={type}
                {...props}
                className={`w-full px-4 py-2 border rounded-lg transition duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-none ${inputClasses}`}
            />
            {helperText && (
                <p className={`text-xs mt-1 italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {helperText}
                </p>
            )}
        </div>
   );
};
const ShiftFormModal = ({ mode = "create", initialData = null, onClose = () => {}, onSaved = () => {} }) => {
  const { theme } = useContext(Context);
  const [formData, setFormData] = useState({
    shiftName: "",
    startTime: "",
    endTime: "",
    halfTime: "",
    acceptedBreakTime: "",
    takeAttendanceAfter: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  useEffect(() => {
    if (initialData) {
      setFormData({
        shiftName: initialData.shiftName || initialData.shiftName === "" ? initialData.shiftName : "",
        startTime: (initialData.startTime || "").slice(0,5),
        endTime: (initialData.endTime || "").slice(0,5),
        halfTime: (initialData.halfTime || "").slice(0,5),
        acceptedBreakTime: initialData.acceptedBreakTime || "",
        takeAttendanceAfter: initialData.takeAttendanceAfter || "",
      });
    }
  }, [initialData]);
  const convertToHHMMSS = (timeString) => {
    if (!timeString || timeString.length !== 5) return "";
    return `${timeString}:00`;
  };
  const handleShiftChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };
  const handleShiftSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage("");
    if (!formData.shiftName) {
     setSubmissionMessage("Shift name required");
      return;
    }
    setIsSubmitting(true);
    const payload = {
      shiftName: formData.shiftName,
      startTime: convertToHHMMSS(formData.startTime),
      endTime: convertToHHMMSS(formData.endTime),
      halfTime: convertToHHMMSS(formData.halfTime),
      acceptedBreakTime: formData.acceptedBreakTime,
      takeAttendanceAfter: formData.takeAttendanceAfter,
    };
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      if (mode === "create") {
        await axios.post(API_BASE, payload, { headers });
      alert("Shift created successfully ✅");
      setSubmissionMessage("Success: Shift data submitted!");
      } else {
        const target = encodeURIComponent(initialData?.shiftName || formData.shiftName);
        await axios.put(`${API_BASE}/${target}`, payload, { headers });
        alert("Shift updated successfully ✅");
        setSubmissionMessage("Success: Shift data updated!");
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setSubmissionMessage(err.response?.data?.message || err.message || "Failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  const formThemeClasses =
    theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-800 border-gray-100";
  const headerGradient = "bg-gradient-to-r from-teal-500 to-cyan-600";
  return (
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={onClose} >
        <motion.div className="w-full max-w-2xl mx-auto gap-6 max-h-[90vh] overflow-y-auto transform" initial={{ scale: 0.9, y: -50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -50 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()} >
          <form onSubmit={handleShiftSubmit} className={`relative rounded-3xl shadow-3xl overflow-hidden ${formThemeClasses}`}>
            <div className={`${headerGradient} text-center rounded-t-3xl p-5`}>
              <h2 className="text-xl font-bold text-white flex justify-center items-center gap-2">
                <i className="fas fa-clock"></i> Create Shift
              </h2>
              <p className="text-sm text-white/80">Define operational hours</p>
            </div>
            <div className="space-y-5 p-6">
              <Form label="Shift Name" theme={theme} type="text" name="shiftName" value={formData.shiftName} onChange={handleShiftChange} required placeholder="Morning Shift" />
              <div className="grid grid-cols-2 gap-5">
                <Form label="Start Time" theme={theme} type="time" name="startTime" value={formData.startTime} onChange={handleShiftChange} required />
                <Form label="End Time" theme={theme} type="time" name="endTime" value={formData.endTime} onChange={handleShiftChange} required />
              </div>
              <Form label="Half Time" theme={theme} type="time" name="halfTime" value={formData.halfTime} onChange={handleShiftChange} required />
              <Form label="Accepted Break (ISO 8601)" theme={theme} type="text" name="acceptedBreakTime" value={formData.acceptedBreakTime} onChange={handleShiftChange} required placeholder="PT1H30M00S" />
              <Form label="Take Attendance After (ISO 8601)" theme={theme} type="text" name="takeAttendanceAfter" value={formData.takeAttendanceAfter} onChange={handleShiftChange} required placeholder="PT0H30M" />
              <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <motion.button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition" disabled={isSubmitting} whileHover={{ scale: 1.05 }}>
                  {isSubmitting ? "Submitting..." : "Create Shift"}
                </motion.button>
              </div>
            </div>
          </form>
  
          <AnimatePresence>
            {submissionMessage && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`absolute bottom-6 text-center w-full text-sm font-medium ${submissionMessage.startsWith("Success") ? "text-green-500" : "text-red-500"}`}>
                {submissionMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  };
const API_BASE = "https://hrms.anasolconsultancyservices.com/api/attendance/shifts";
const parsePTDuration = (pt = "") => {
  if (!pt || !pt.startsWith("PT")) return pt || "-";
  const h = (pt.match(/(\d+)H/) || [0, 0])[1];
  const m = (pt.match(/(\d+)M/) || [0, 0])[1];
  const s = (pt.match(/(\d+)S/) || [0, 0])[1];
  const parts = [];
  if (+h) parts.push(`${h}h`);
  if (+m) parts.push(`${m}m`);
  if (+s) parts.push(`${s}s`);
  return parts.length ? parts.join(" ") : "0m";
};

const fmtTime = (t) => {
  if (!t) return "-";
  try {
    const [hhmmss] = t.split("T").reverse();
    const [hh, mm, ss] = (hhmmss || t).split(":");
    return `${String(hh).padStart(2, "0")}:${String(mm || "00").padStart(2, "0")}` + (ss ? `:${String(ss).padStart(2, "0")}` : "");
  } catch {
    return t;
  }
};
const Shift = ({ shiftName: propShiftName, onClose = () => {} }) => {
  const { shiftName: paramShiftName } = useParams();
  const shiftName = propShiftName || paramShiftName;
  const { theme } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shift, setShift] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const loadShift = async (name) => {
    if (!name) {
      setError("No shift selected.");
      setShift(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const url = `${API_BASE}/${encodeURIComponent(name)}`;
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const body = await res.json().catch(() => null);
      setShift(body || null);
    } catch (err) {
      setError(err.message || "Failed to load shift");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadShift(shiftName);
  }, [shiftName]);
  const handleDelete = async () => {
    if (!shiftName || !window.confirm(`Delete shift "${shiftName}"? This action cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      await axios.delete(`${API_BASE}/${encodeURIComponent(shiftName)}`, { headers });
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className={`p-6 rounded-xl shadow-2xl transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-gray-100 shadow-gray-700/50" : "bg-white text-gray-800 shadow-lg"}`}>
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <h3 className="text-2xl font-extrabold text-indigo-500">{shiftName ? `Shift: ${shiftName}` : "Shift Details"}</h3>
        <div className="flex items-center gap-2">
          <button  onClick={(e) => { e.stopPropagation(); setShowCreate(true); }} title="Create Shift" className="p-2 rounded-md bg-green-600 text-white"><FaPlus /></button>
          <button onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}  title="Edit Shift" className="p-2 rounded-md bg-yellow-500 text-white"><FiEdit /></button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} disabled={isDeleting} title="Delete Shift" className="p-2 rounded-md bg-red-600 text-white"><FiDelete /></button>
          <button onClick={() => { setShift(null); onClose(); }} className="px-3 py-1 ml-2 rounded bg-red-600 text-white hover:bg-red-700">Close</button>
        </div>
      </div>
      {loading && <div className="py-8 text-center text-lg font-medium text-indigo-400 animate-pulse">Loading shift details...</div>}
      {error && <div className="p-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500 font-semibold">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border border-gray-200 bg-gray-50  transition-shadow hover:shadow-md ${theme === "dark" ? "bg-gray-800" : ""}`}>
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Shift Name</div>
            <div className="text-xl font-bold mt-1 text-indigo-600 dark:text-indigo-400">{shift?.shiftName || shiftName || "N/A"}</div>
          </div>
          <div className={`p-4 rounded-xl border border-gray-200 bg-gray-50  transition-shadow hover:shadow-md ${theme === "dark" ? "bg-gray-800" : ""}`}>
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Start Time</div>
            <div className="text-xl font-bold mt-1">{fmtTime(shift?.startTime)}</div>
          </div>
          <div className={`p-4 rounded-xl border border-gray-200 bg-gray-50  transition-shadow hover:shadow-md ${theme === "dark" ? "bg-gray-800" : ""}`}>
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">End Time</div>
            <div className="text-xl font-bold mt-1">{fmtTime(shift?.endTime)}</div>
          </div>
          <div className={`p-4 rounded-xl border border-gray-200 bg-gray-50  transition-shadow hover:shadow-md ${theme === "dark" ? "bg-gray-800" : ""}`}>
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Half Time</div>
            <div className="text-xl font-bold mt-1">{fmtTime(shift?.halfTime)}</div>
          </div>
          <div className={`p-4 rounded-xl border border-gray-200 bg-gray-50  transition-shadow hover:shadow-md ${theme === "dark" ? "bg-gray-800" : ""}`}>
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Accepted Break Time</div>
            <div className="text-xl font-bold mt-1">{parsePTDuration(shift?.acceptedBreakTime)}</div>
          </div>
          <div className={`p-4 rounded-xl border border-gray-200 bg-gray-50  transition-shadow hover:shadow-md ${theme === "dark" ? "bg-gray-800" : ""}`}>
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Take Attendance After</div>
            <div className="text-xl font-bold mt-1">{parsePTDuration(shift?.takeAttendanceAfter)}</div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {showCreate && <ShiftFormModal mode="create" onClose={() => setShowCreate(false)} onSaved={() => loadShift(shiftName)} />}
        {showEdit && <ShiftFormModal mode="edit" initialData={shift || { shiftName }} onClose={() => setShowEdit(false)} onSaved={() => loadShift(shiftName)} />}
      </AnimatePresence>
    </div>
  );
};
const BASE_URL = "https://hrms.anasolconsultancyservices.com/api/attendance";
const PersonDetailsAddDto = {
  id: null,
  employeeId: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  paid: 0.0,
  sick: 0.0,
  casual: 0.0,
  unpaid: 0.0,
  paidConsumed: 0.0,
  sickConsumed: 0.0,
  casualConsumed: 0.0,
  unpaidConsumed: 0.0,
  shiftName: '',
  weekEffectiveHours: 0,
  monthlyEffectiveHours: 0,
  monthlyOnTime: 0,
  monthlyOvertime: 'PT0H',
  latitude: 0,
  longitude: 0,
  timezone: 'Asia/Kolkata'
};

const AttendanceRequest = {
  employeeId: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  totalWorkingDays: 0,
  daysPresent: 0,
  unpaidLeaves: 0
};

const PersonalLeavesService = {
  // ➕ Add Leaves
  addLeaves: async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/personalleaves/add`, data);
      return response.data;
    } catch (error) {
      console.error("Error adding leaves:", error);
      throw error;
    }
  },

  // ✏️ Update Leaves
  updateLeaves: async (data, month, year) => {
    try {
      const response = await axios.post(`${BASE_URL}/updateLeaves/${month}/${year}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating leaves:", error);
      throw error;
    }
  },

  // ❌ Delete Leaves
  deleteLeaves: async (employeeId, month, year) => {
    try {
      const response = await axios.delete(`${BASE_URL}/deleteLeaves/${employeeId}/${month}/${year}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting leaves:", error);
      throw error;
    }
  },

  // 🔍 Get Leaves for a specific employee and month/year
  getLeaves: async (employeeId, month, year) => {
    try {
      const response = await axios.get(`${BASE_URL}/getLeaves/${employeeId}/${month}/${year}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching leaves:", error);
      throw error;
    }
  },

  // 📄 Get all leaves by employee with pagination
  getLeavesByEmployee: async (employeeId, page, size) => {
    try {
      const response = await axios.get(`${BASE_URL}/getLeaves/${employeeId}`, {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching employee leaves:", error);
      throw error;
    }
  },

  // 🧾 Attendance Report (All employees)
  attendanceReport: async (month, year, page, size) => {
    try {
      var page = page ;
      const response = await axios.get(`${BASE_URL}/getAllEmployeeLeaves/${month}/${year}`, {
        params: { page, size },
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching attendance report:", error);
      throw error;
    }
  },
};

const AddEmployeeLeavesForm = ({ activeView, Data, onCancel = () => {} }) => {
  // console.log(Data);
  const isEdit = !!Data; // detect mode
  const [employee, setEmployee] = useState({ ...PersonDetailsAddDto });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const {theme} = useContext(Context);

  // 🧭 Initialize data (prefill if editing)
  useEffect(() => {
    if (isEdit && Data) {
      setEmployee({ ...Data });
    }
  }, [Data]);

  // 🧭 Fetch user location automatically
  useEffect(() => {
    if (!isEdit && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setEmployee((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })),
        (err) => console.warn("Location access denied", err)
      );
    }
  }, [isEdit]);

  // 🧾 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      if (!employee.employeeId.trim()) {
        throw new Error("Employee ID is required");
      }

      if (isEdit) {
        await PersonalLeavesService.updateLeaves(employee, employee.month, employee.year);
        setSuccess("✅ Employee leaves updated successfully!");
      } else {
        await PersonalLeavesService.addLeaves(employee);
        setSuccess("✅ Employee leaves added successfully!");
      }

      if (!isEdit) setEmployee({ ...PersonDetailsAddDto });
    } catch (err) {
      setError("❌ Operation failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  const handleReset = () => {
    setEmployee(isEdit ? { ...Data } : { ...PersonDetailsAddDto });
    setSuccess("");
    setError("");
  };

  return (
    <div className={`rounded-2xl shadow-xl p-8 max-w-6xl mx-auto mt-10 border border-gray-200  transition-colors ${theme === "dark" ? "dark:bg-gray-900" : "bg-white"}`}>
      <h2 className={`text-3xl font-semibold mb-6 text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
        {isEdit ? "Update Employee Leave Details" : "Add Employee Leave Details"}
      </h2>

      {success && (
        <div className={`p-3 rounded-lg mb-4 font-medium ${theme === "dark" ? "bg-green-900 text-green-200" : "bg-green-100 text-green-700"}`}>
          {success}
        </div>
      )}
      {error && (
        <div className={`p-3 rounded-lg mb-4 font-medium ${theme === "dark" ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"}`}>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {[
          { label: "Employee ID *", key: "employeeId", type: "text", required: true },
          { label: "Month", key: "month", type: "number", min: 1, max: 12 },
          { label: "Year", key: "year", type: "number", min: 2020, max: 2030 },
          { label: "Paid Leaves", key: "paid", type: "number", step: "0.1" },
          { label: "Sick Leaves", key: "sick", type: "number", step: "0.1" },
          { label: "Casual Leaves", key: "casual", type: "number", step: "0.1" },
          { label: "Unpaid Leaves", key: "unpaid", type: "number", step: "0.1" },
          { label: "Shift Name", key: "shiftName", type: "text" },
          { label: "Weekly Effective Hours", key: "weekEffectiveHours", type: "number" },
          { label: "Monthly Effective Hours", key: "monthlyEffectiveHours", type: "number" },
          { label: "Monthly On-Time Count", key: "monthlyOnTime", type: "number" },
          { label: "Monthly Overtime (ISO Duration e.g. PT5H)", key: "monthlyOvertime", type: "text" },
          { label: "Latitude", key: "latitude", type: "number" },
          { label: "Longitude", key: "longitude", type: "number" },
          { label: "Timezone", key: "timezone", type: "text" },
        ].map((field, idx) => (
          console.log(employee),
          console.log(employee[field.key]),
          <div key={idx}>
            <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
              {field.label}
            </label>
            <input
              {...field}
              value={employee[field.key] ?? ""}
              onChange={(e) =>
                setEmployee((prev) => ({
                  ...prev,
                  [field.key]:
                    field.type === "number"
                      ? parseFloat(e.target.value)
                      : e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
            />
          </div>
        ))}
      </form>
       <div className="flex justify-center mt-8 space-x-6">
         <button
           onClick={handleSubmit}
           disabled={loading}
           className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 
             dark:bg-blue-500 dark:hover:bg-blue-600 text-white 
             rounded-lg font-medium shadow-md 
             focus:outline-none focus:ring-2 focus:ring-blue-400 
             disabled:opacity-50 transition"
         >
           {loading ? "Processing..." : isEdit ? "Update" : "Save"}
         </button>
 
         <button
           type="button"
           onClick={handleReset}
           className="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 
                      dark:bg-gray-700 dark:hover:bg-gray-600 text-white 
                      rounded-lg font-medium shadow-md 
                      focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
         >
           Reset
         </button>
        <button
          type="button"
          onClick={() => {
            handleReset();
            try { onCancel(); } catch {}
          }}
          className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
const CreateTriggerForm = ({ mode = "create", initialData = null, onClose = () => {}, onSaved = () => {} }) => {
  const { theme } = useContext(Context);
  const [triggerFormData, setTriggerFormData] = useState({
    shift: "",
    section: "",
    cronExpression: "",
    zone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");

  useEffect(() => {
    if (initialData) {
      // initialData may be the trigger object from backend
      // backend sample: { name: "attendance_check_Morning_FIRST", cronExpression: "...", nextFireTime: "...", group: "...", ... }
      const name = initialData.name || "";
      const parts = name.split("_");
      const section = parts.length > 0 ? parts[parts.length - 1] : "";
      const shift = parts.length > 2 ? parts[parts.length - 2] : (initialData.shift || "");
      setTriggerFormData({
        shift: initialData.shift || shift || "",
        section: initialData.section || section || "",
        cronExpression: initialData.cronExpression || initialData.CronExpression || "",
        zone: initialData.zone || initialData.Zone || "",
      });
    }
  }, [initialData]);

  const handleTriggerChange = (e) => {
    const { name, value } = e.target;
    setTriggerFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleTriggerSubmit = async (e) => {
    e.preventDefault();
    setSubmissionMessage("");
    const isConfirmed = window.confirm(
      `Create/Update trigger?\nShift: ${triggerFormData.shift}\nSection: ${triggerFormData.section}\nCron: ${triggerFormData.cronExpression}`
    );
    if (!isConfirmed) return;
    setIsSubmitting(true);
    const dataToSubmit = {
      Shift: triggerFormData.shift,
      Section: triggerFormData.section,
      CronExpression: triggerFormData.cronExpression,
      Zone: triggerFormData.zone,
      name: initialData?.name,
    };
    try {
      if (mode === "create") {
        await axios.post(`${BASE_URL}/trigger`, dataToSubmit);
        alert("Trigger created successfully ✅");
        setSubmissionMessage("Success: Trigger created!");
      } else {
        await axios.put(`${BASE_URL}/trigger/update`, dataToSubmit);
        alert("Trigger updated successfully ✅");
        setSubmissionMessage("Success: Trigger updated!");
      }
      onSaved();
      onClose();
      setTriggerFormData({ shift: "", section: "", cronExpression: "", zone: "" });
    } catch (error) {
      console.error(error);
      setSubmissionMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const formThemeClasses = theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-800 border-gray-100";
  const headerGradient = "bg-gradient-to-r from-teal-500 to-cyan-600";
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={onClose}>
      <motion.div className="w-full max-w-md mx-auto gap-6 max-h-[90vh] overflow-y-auto transform" initial={{ scale: 0.95, y: -30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -30 }} transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleTriggerSubmit} className={`relative rounded-3xl shadow-3xl overflow-hidden ${formThemeClasses}`}>
          <div className={`${headerGradient} text-center rounded-t-3xl p-5`}>
            <h2 className="text-xl font-bold text-white flex justify-center items-center gap-2">
              <i className="fas fa-bolt"></i> {mode === "create" ? "Create Trigger" : "Update Trigger"}
            </h2>
            <p className="text-sm text-white/80">Setup scheduled trigger</p>
          </div>
          <div className="space-y-5 p-6">
            <Form label="Shift Name" theme={theme} type="text" name="shift" value={triggerFormData.shift} onChange={handleTriggerChange} required placeholder="Morning" />
            <Form label="Section" theme={theme} type="text" name="section" value={triggerFormData.section} onChange={handleTriggerChange} required placeholder="FIRST, SECOND" />
            <Form label="Cron Expression" theme={theme} type="text" name="cronExpression" value={triggerFormData.cronExpression} onChange={handleTriggerChange} required placeholder="0 0 8 * * *" />
            <Form label="Time Zone" theme={theme} type="text" name="zone" value={triggerFormData.zone} onChange={handleTriggerChange} required placeholder="Asia/Kolkata" />
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <motion.button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition" disabled={isSubmitting} whileHover={{ scale: 1.03 }}>
                {isSubmitting ? "Processing..." : mode === "create" ? "Create Trigger" : "Update Trigger"}
              </motion.button>
            </div>
          </div>
        </form>

        <AnimatePresence>
          {submissionMessage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`absolute bottom-6 text-center w-full text-sm font-medium ${submissionMessage.startsWith("Success") ? "text-green-500" : "text-red-500"}`}>
              {submissionMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

const TriggerLayout = ({ shiftName = "" }) => {
  const { theme } = useContext(Context);
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  

  const parseSectionFromName = (name = "") => {
    if (!name) return "";
    const parts = name.split("_");
    return parts.length ? parts[parts.length - 1] : "";
  };

  const loadTriggers = async (sName) => {
    if (!sName) {
      setTriggers([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/trigger/get/${encodeURIComponent(sName)}`);
      setTriggers(Array.isArray(res.data) ? res.data : []);
      setSelected(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load triggers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTriggers(shiftName);
  }, [shiftName]);

  const handleDelete = async (trigger) => {
    if (!trigger) return;
    const section = trigger.section || parseSectionFromName(trigger.name || "");
    const shift = shiftName || trigger.shift || "";
    if (!shift || !section) {
      alert("Missing shift or section for deletion.");
      return;
    }
    if (!window.confirm(`Delete trigger for shift: ${shift} section: ${section}?`)) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/trigger/delete/${encodeURIComponent(shift)}/${encodeURIComponent(section)}`);
      alert("Trigger deleted ✅");
      loadTriggers(shiftName);
    } catch (err) {
      console.error(err);
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
  <div className={`rounded-2xl shadow-2xl p-8 mb-8 ${theme === "dark" ? "bg-gray-800 border border-gray-700 shadow-indigo-500/10" : "bg-white border border-gray-200 shadow-xl shadow-indigo-100/50"}`}>
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-6 border-b border-gray-200 dark:border-gray-700">
      <h3 className={`text-2xl font-bold tracking-tight mb-3 md:mb-0 ${theme === "dark" ? "text-indigo-400" : "text-indigo-700"}flex items-center`}>
        Scheduled Triggers for: <span className="ml-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-base font-semibold">{shiftName || "—"}</span>
      </h3>
      <div className="flex items-center gap-3">
        <button onClick={() => setShowCreate(true)} title="Create New Trigger" className="px-4 py-2 flex items-center gap-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]">
          <FaPlus className="w-4 h-4" />
          {/*<span className="hidden sm:inline">New</span>*/}
        </button>
        
        <button onClick={() => { if (!selected) { alert("Select a trigger first"); return; } setShowEdit(true); }} title="Edit Selected Trigger" disabled={!selected}className={`px-4 py-2 flex items-center gap-1 rounded-lg font-medium transition-all duration-200 shadow-md active:scale-[0.98] ${!selected ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70" : "bg-yellow-500 hover:bg-yellow-600 text-white"}`}>
          <FiEdit className="w-4 h-4" />
          {/*<span className="hidden sm:inline">Edit</span>*/}
        </button>
        
        <button onClick={() => { if (!selected) { alert("Select a trigger first"); return; } handleDelete(selected); }} title="Delete Selected Trigger" disabled={isDeleting || !selected} className={`px-4 py-2 flex items-center gap-1 rounded-lg font-medium transition-all duration-200 shadow-md active:scale-[0.98] ${isDeleting || !selected ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70" : "bg-red-600 hover:bg-red-700 text-white"}`}>
          <FiDelete className="w-4 h-4" />
          {/*<span className="hidden sm:inline">Delete</span>*/}
        </button>
      </div>
    </div>

    {/* Content Area */}
    {loading ? (
      <div className="py-8 text-center text-lg font-medium text-indigo-500 animate-pulse">
        <div className="flex justify-center items-center"><span className="mr-2">⏳</span> Loading triggers...</div>
      </div>
    ) : error ? (
      <div className="py-4 px-4 rounded-md bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-sm font-medium">
        Error fetching triggers: {error}
      </div>
    ) : triggers.length === 0 ? (
      <div className="py-6 text-center text-base text-gray-500 italic">
        No scheduled triggers found for this shift. Click **New** to create one.
      </div>
    ) : (
      <div
  className="flex flex-col gap-4"
>
  {triggers.map((t, i) => {
    const name = t.name || t.group || `trigger-${i}`;
    const section = t.section || parseSectionFromName(name);
    return (
      <div
        key={i}
        onClick={() => setSelected(t)}
        className={`
          p-5 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer
          ${selected === t ? "ring-4 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 shadow-lg" : theme === "dark" ? "bg-gray-900 border-gray-700 hover:border-indigo-500 hover:shadow-md" : "bg-white border-gray-200 hover:border-indigo-400 hover:shadow-md"}
        `}
      >
        <div className="mb-2 sm:mb-0">
          <div className="text-lg text-indigo-600 dark:text-indigo-400 font-bold">{name}</div>
          <div className={`mt-1 text-sm font-mono ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            CRON: {t.cronExpression || t.CronExpression || t.cron || <span className="text-red-400">— N/A —</span>}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Next Fire: <span className="font-medium">{t.nextFireTime ? new Date(t.nextFireTime).toLocaleString() : "—"}</span>
          </div>
        </div>

        <div className="text-right text-sm">
          <div className={`font-semibold ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
            Section: <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">{section}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
            Group: {t.group || t.description || "No description"}
          </div>
        </div>
      </div>
    );
  })}
</div>
    )}
    <AnimatePresence>
      {showCreate && <CreateTriggerForm mode="create" onClose={() => setShowCreate(false)} onSaved={() => loadTriggers(shiftName)} />}
      {showEdit && selected && <CreateTriggerForm mode="edit" initialData={selected} onClose={() => setShowEdit(false)} onSaved={() => loadTriggers(shiftName)} />}
    </AnimatePresence>
  </div>
);
};
const ShiftFilterLayout = ({ onApply = () => {}, onReset = () => {} }) => {
  const { theme } = useContext(Context);
  const [employeeId, setEmployeeId] = useState("");
  const [shiftOptions, setShiftOptions] = useState([]);
  const [selectedShift, setSelectedShift] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [employeesForShift, setEmployeesForShift] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  useEffect(() => {
    let mounted = true;
    const loadShifts = async () => {
      setLoadingShifts(true);
      setLoadError("");
      try {
        const res = await axios.get(API_BASE); // GET https://.../attendance/shifts
        if (!mounted) return;
        setShiftOptions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!mounted) return;
        setLoadError(err?.message || "Failed to load shifts");
      } finally {
        if (mounted) setLoadingShifts(false);
      }
    };
    loadShifts();
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    let mounted = true;
    const loadEmployees = async () => {
      if (!selectedShift) {
        setEmployeesForShift([]);
        return;
      }
      setLoadingEmployees(true);
      try {
        const res = await axios.get(`${API_BASE}/employees/${encodeURIComponent(selectedShift)}?page=0&size=200`);
        if (!mounted) return;
        console.debug("loadEmployees response:", res?.data);
        let data = res.data;
        if (!data) data = [];
        if (Array.isArray(data)) {
          // fine
        } else if (Array.isArray(data.content)) {
          data = data.content;
        } else if (Array.isArray(data.data)) {
          data = data.data;
        } else if (Array.isArray(data.items)) {
          data = data.items;
        } else {
          const firstArray = Object.values(data).find((v) => Array.isArray(v));
          data = firstArray || [];
        }
        setEmployeesForShift(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Failed loading employees for shift", err);
        setEmployeesForShift([]);
      } finally {
        if (mounted) setLoadingEmployees(false);
      }
    };
    loadEmployees();
    return () => { mounted = false; };
  }, [selectedShift]);

  const handleApply = () => {
    onApply({ employeeId: employeeId.trim(), shiftName: selectedShift, start: startTime, end: endTime });
  };
  const handleReset = () => {
    setEmployeeId("");
    setSelectedShift("");
    setStartTime("");
    setEndTime("");
    setEmployeesForShift([]);
    onReset();
  };
 const inputBase = `w-full px-4 py-2 rounded-lg transition-all duration-200 border text-base focus:outline-none focus:ring-4 focus:ring-indigo-500/50 ${theme === 'dark' ? 'bg-gray-800 text-gray-50 border-gray-700 placeholder-gray-500 focus:ring-indigo-600/60' : 'bg-white text-gray-800 border-gray-300 placeholder-gray-400 focus:ring-indigo-500/50'}`;
  return (
    <div className={`w-full max-w-7xl p-8 rounded-3xl shadow-2xl transition-colors duration-300 
      ${theme === 'dark' 
        ? 'bg-gray-900 shadow-indigo-500/30' 
        : 'bg-white shadow-xl shadow-gray-200/50'}`}>
      <h4 className={`mb-6 text-2xl font-extrabold border-b pb-4 tracking-tight ${theme === 'dark' ? 'text-indigo-400 border-gray-800' : 'text-indigo-700 border-gray-100'}`}>
         Shift & Employee Filters
      </h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-4">
          <h5 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Select a Shift</h5>
          {loadingShifts ? (
            <div className="text-sm text-gray-500 p-4">Loading shifts...</div>
          ) : loadError ? (
            <div className="text-sm text-red-500 p-4">{loadError}</div>
          ) : (
            <div className="flex flex-col gap-3">
              {shiftOptions.map((s, idx) => {
                const sName = s.name ?? s.shiftName ?? s.shift ?? "";
                const sStart = s.startTime || s.start || s.startTimeIso || "";
                const sEnd = s.endTime || s.end || s.endTimeIso || "";
                const isSelected = selectedShift === sName;
                return (
                  <label   key={idx}   className={`w-full block p-4 rounded-xl border cursor-pointer transition-all duration-150  ${isSelected  ? 'border-indigo-500 ring-2 ring-indigo-500/50'  : `${theme === 'dark'  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'  : 'bg-white border-gray-200 hover:bg-gray-50'}`}`} >
                    <div className="flex items-center gap-4 w-full">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedShift(sName);
                            setStartTime(sStart ? fmtTime(sStart) : "");
                            setEndTime(sEnd ? fmtTime(sEnd) : "");
                          } else {
                            setSelectedShift("");
                            setStartTime("");
                            setEndTime("");
                            setEmployeesForShift([]); 
                          }
                        }}
                        className="h-5 w-5 rounded-full text-indigo-600 focus:ring-indigo-500 flex-shrink-0 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold truncate ${theme === 'dark' ? 'text-gray-50' : 'text-gray-900'}`}>{sName || "Unnamed Shift"}</div>
                        <div className="text-sm text-gray-500 truncate dark:text-gray-400 mt-0.5">{s.description || s.group || "No description"}</div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>Start:</span>
                          <span className={`px-2 py-0.5 rounded-md font-mono ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-indigo-50 text-indigo-700'}`}>{sStart ? fmtTime(sStart) : "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>End:</span>
                          <span className={`px-2 py-0.5 rounded-md font-mono ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-indigo-50 text-indigo-700'}`}>{sEnd ? fmtTime(sEnd) : "—"}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
          <div className={`p-2 rounded-xl border mt-2 shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-2 mb-3">Current Selection</div>
            <div className={`text-xl font-bold ${selectedShift ? 'text-indigo-500' : 'text-gray-400'}`}>{selectedShift || "No Shift Selected"}</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className={`p-2 rounded-lg border text-sm transition-colors ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Start Time</div>
                <div className="font-mono text-lg">{startTime || "—"}</div>
              </div>
              <div className={`p-2 rounded-lg border text-sm transition-colors ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>End Time</div>
                <div className="font-mono text-lg">{endTime || "—"}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h5 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Employee Preview</h5>
          <div className={`w-full p-5 rounded-xl border shadow-sm h-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex justify-between items-start border-b pb-3 mb-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Shift Status</div>
                <div className={`mt-1 text-base font-bold ${selectedShift ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {selectedShift ? `Employees for ${selectedShift}` : "Select a shift to preview employees"}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
                {selectedShift ? (loadingEmployees ? "Loading..." : `${employeesForShift.length} employees`) : ""}
              </div>
            </div>
            {selectedShift && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {loadingEmployees ? (
                  <div className="col-span-full text-center text-sm text-gray-500 py-6">Loading employee roster...</div>
                ) : employeesForShift.length === 0 ? (
                  <div className="col-span-full text-center text-sm text-gray-500 py-6">No employees found for this shift.</div>
                ) : (
                  employeesForShift.map((emp, i) => (
                    <div key={i} className={`p-3 rounded-lg border text-sm flex flex-col justify-between h-20 transition-shadow hover:shadow-md  ${theme === 'dark' ? 'bg-gray-900 border-gray-700 hover:border-indigo-600' : 'bg-white border-gray-200 hover:border-indigo-400'}`} >
                      <div className="text-lg text-indigo-500 dark:text-indigo-400 font-medium">ID: {emp.employeeId || emp.employeeID || emp.id || "—"}</div>
                      <div className={`mt-1 font-semibold truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                        {emp.name || emp.userData?.name || emp.user?.name || "Unnamed Employee"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {!selectedShift && (
              <div className="mt-4 text-sm text-gray-500 py-6 text-center italic">
                The employee list will appear here once a shift is selected.
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 pt-3 border-t border-dashed flex items-center justify-end gap-4 
        ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}">
        <button onClick={handleReset} className={`px-8 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-md ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 focus:ring-offset-white'}`}>
          Reset Filters
        </button>
        <button  onClick={handleApply}  className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-gray-900" >
          Apply Filter
        </button>
      </div>
    </div>
  );
};
const EmployeeShiftDetails = ({ shiftName: propShiftName = "", onViewEmployee = () => {} }) => {
  const { theme } = useContext(Context);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [shiftName, setShiftName] = useState(propShiftName);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    setShiftName(propShiftName || "");
  }, [propShiftName]);
  const fetchByShift = async (sName, p = 0) => {
    if (!sName) {
      setItems([]);
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await axios.get(`${API_BASE}/employees/${encodeURIComponent(sName)}?page=${p}&size=${size}`);
      const data = res.data;
      if (Array.isArray(data)) {
        setItems(data);
        setTotalPages(1);
      } else if (data.content) {
        setItems(data.content || []);
        setTotalPages(data.totalPages ?? 1);
      } else {
        setItems(data.items || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };
    const fetchByEmployee = async (employeeIdOrObj) => {
    const empId =
      typeof employeeIdOrObj === "string"
        ? employeeIdOrObj
        : employeeIdOrObj?.userData?.employeeId ?? employeeIdOrObj?.employeeId;

    if (!empId) return;
    setLoading(true);
    setError("");
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const res = await axios.get(`${API_BASE}/by/${encodeURIComponent(empId)}?month=${month}&year=${year}`);
      setItems(Array.isArray(res.data) ? res.data : []);
      setTotalPages(1);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = () => {
    setPage(0);
    if (searchTerm.trim()) {
      fetchByEmployee(searchTerm.trim());
    } else {
      fetchByShift(shiftName, 0);
    }
  };
  useEffect(() => {
    if (!searchTerm.trim()) fetchByShift(shiftName, page);
  }, [shiftName, page, size, searchTerm]);

  const inputCls = `w-full px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-base ${theme === "dark"
    ? "bg-gray-800 text-white border-gray-700 placeholder-gray-400"
    : "bg-white text-gray-800 border-gray-300 placeholder-gray-500"}`; 

  return (
    <div className={`mt-2 p-8 rounded-xl ${theme === "dark" ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"} shadow-xl transition-shadow duration-300`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-gray-200 dark:border-gray-800">
        <h4 className={`text-3xl font-bold tracking-tight ${theme === "dark" ? "text-indigo-400" : "text-indigo-700"} mb-4 md:mb-0 flex items-center`}>
          <span className="mr-3 text-4xl"></span> Employee Shift Analytics
          {shiftName && (
            <span className={`ml-3 px-3 py-1 text-sm rounded-full font-medium ${theme === "dark" ? "bg-indigo-900/50 text-indigo-300" : "bg-indigo-100 text-indigo-600"}`}>
              {shiftName}
            </span>
          )}
        </h4>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-stretch space-x-2 w-full md:w-auto">
            <input
              placeholder="Search Employee ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputCls} flex-grow md:w-56`}
            />
            <button onClick={handleSearch} className="flex-shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 active:scale-[0.98]">
              Search
            </button>
          </div>
          <div className="flex items-center rounded-lg overflow-hidden shadow-sm border border-gray-300 dark:border-gray-700">
            <button
              title="Grid view"
              onClick={() => setViewMode("grid")}
              className={`p-3 transition-colors duration-200 focus:outline-none ${viewMode === "grid"
                  ? "bg-indigo-600 text-white shadow-inner"
                  : theme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                } border-r border-gray-300 dark:border-gray-700`}
            >
              <FaTh />
            </button>
            <button
              title="List view"
              onClick={() => setViewMode("list")}
              className={`p-3 transition-colors duration-200 focus:outline-none ${viewMode === "list"
                  ? "bg-indigo-600 text-white shadow-inner"
                  : theme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
            >
              <FaListUl />
            </button>
          </div>
        </div>
      </div>
      {error && <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md text-sm mb-4">{error}</div>}
      {loading ? (
        <div className="py-12 text-center text-lg font-medium text-indigo-500">
          <span className="animate-pulse">Loading Employee Data...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-base text-gray-500 italic">
          {searchTerm.trim() ? "No shift records found for the employee ID." : "No records for this shift."}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((it, idx) => (
           <div key={idx} onClick={() => onViewEmployee(it.employeeId)} className={`cursor-pointer p-5 rounded-xl border transition-all duration-300 hover:shadow-lg ${theme === "dark" ? "bg-gray-800 border-gray-700 hover:border-indigo-600" : "bg-white border-gray-200 hover:border-indigo-400"}`} >
              <div className="flex items-center justify-between mb-3 border-b pb-2 border-gray-200 dark:border-gray-700">
                <div className="text-sm font-semibold text-indigo-500 dark:text-indigo-400">Employee ID</div>
                <div className="text-xs text-gray-500 font-medium">{it.month}/{it.year}</div>
              </div>
              <div className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{it.employeeId}</div>
              <div className="mt-4 text-sm space-y-2">
                <div className={`flex justify-between items-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  <span>Total Working:</span> <span className={`font-semibold ${theme === "dark" ? "text-indigo-300" : "text-indigo-600"}`}>{it.totalWorkingDays}</span>
                </div>
                <div className={`flex justify-between items-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  <span>Days Present:</span> <span className={`font-semibold ${theme === "dark" ? "text-green-300" : "text-green-600"}`}>{it.daysPresent}</span>
                </div>
                <div className={`flex justify-between items-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  <span>Unpaid Leaves:</span> <span className={`font-semibold ${theme === "dark" ? "text-red-300" : "text-red-600"}`}>{it.unpaidLeaves}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`bg-gray-50 ${theme === "dark" ? "bg-gray-800" : ""}`}>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 ${theme === "dark" ? "text-gray-400" : ""}`}>Employee ID</th>
                <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 ${theme === "dark" ? "text-gray-400" : ""}`}>Month/Year</th>
                <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 ${theme === "dark" ? "text-gray-400" : ""}`}>Working Days</th>
                <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 ${theme === "dark" ? "text-gray-400" : ""}`}>Days Present</th>
                <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 ${theme === "dark" ? "text-gray-400" : ""}`}>Unpaid Leaves</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 ${theme === "dark" ? "text-gray-300 bg-gray-900" : "text-gray-700 bg-white"}`}>
              {items.map((it, idx) => (
                <tr key={idx} onClick={() => onViewEmployee(it.employeeId)} className={`cursor-pointer ${idx % 2 === 0 ? (theme === "dark" ? "bg-gray-900" : "bg-white") : (theme === "dark" ? "bg-gray-850" : "bg-gray-50")} hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition-colors duration-150`} >
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-indigo-600 dark:text-indigo-400">{it.employeeId}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{it.month}/{it.year}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{it.totalWorkingDays}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{it.daysPresent}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-red-500 dark:text-red-400">{it.unpaidLeaves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls (Improved styling) */}
      {items.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing **{items.length}** records. Page **{page + 1}** of **{Math.max(1, totalPages)}**
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors duration-200 ${page <= 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-md"
                }`}
            >
              Previous
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors duration-200 ${page + 1 >= totalPages
                  ? "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-md"
                }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
const PersonalLeaves = () => {
  const { empId } = useParams();
  const {theme} = useContext(Context);
  const [employeeId, setEmployeeId] = useState('');
  const [activeView, setActiveView] = useState('view');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftQueryName, setShiftQueryName] = useState("Morning");
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState({ ...PersonDetailsAddDto });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  useEffect(() => {
    if (empId) setEmployeeId(empId);
  }, [empId]);
  useEffect(() => {
    loadEmployeeDetails(empId);
  }, [currentPage, filters]);
  const loadAllEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await PersonalLeavesService.attendanceReport(
        filters.month,
        filters.year,
        currentPage,
        pageSize
      );
      setEmployees(response || []);
    } catch (err) {
      setError('Failed to load employees: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  const loadEmployeeDetails = async (employeeId) => {
    setLoading(true);
    setError('');
    try {
      const response = await PersonalLeavesService.getLeavesByEmployee(employeeId, currentPage,
        pageSize);
      setEmployees(response || []);
    } catch (err) {
      setError('Failed to load employee details: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadAllEmployees();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await PersonalLeavesService.getLeavesByEmployee(
        searchTerm,
        currentPage,
        pageSize
      );
      setEmployees(response.data || []);
    } catch (err) {
      setError('Search failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteLeaves = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete these leaves?')) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      await PersonalLeavesService.deleteLeaves(
        employeeId,
        filters.month,
        filters.year
      );
      setSuccess('Leaves deleted successfully!');
      loadAllEmployees();
    } catch (err) {
      setError('Failed to delete leaves: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  const handleViewEmployee = async (employeeId) => {
    setLoading(true);
    setError('');
    try {
      const employeeData = await PersonalLeavesService.getLeaves(
        employeeId,
        filters.month,
        filters.year
      );
      loadEmployeeDetails(employeeId);
      setCurrentEmployee(employeeData);
      setActiveView('view');
    } catch (err) {
      setError('Failed to load employee data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
    const handleUpdateDetails = async (employeeId) => {
    setLoading(true);
    setError('');
    try {
      const employeeData = await PersonalLeavesService.getLeaves(
        employeeId,
        filters.month,
        filters.year
      );
      setCurrentEmployee(employeeData);
      setActiveView('update');
    } catch (err) {
      setError('Failed to load employee data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  const handleSaveEmployee = async () => {
    try {
      await PersonalLeavesService.updateLeaves(currentEmployee, currentEmployee.month,
        currentEmployee.year);
      alert('Employee data updated successfully!');
      setActiveView('search');
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  };


  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

   if (activeView === 'shift') {
    return (
      <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-3xl font-bold mb-8 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>Create / View Shift</h1>
         <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="w-full">
              <Shift
                shiftName={shiftQueryName}
                onClose={() => {
                  setActiveView('search');
                  setShiftQueryName('');
                }}
              />
            </div>

            <div className="w-full">
              <TriggerLayout shiftName={shiftQueryName} />
            </div>
          </div>
          <div className="mb-8">
            <ShiftFilterLayout
              onApply={(filters) => {console.log('ShiftFilter applied:', filters);}}
              onReset={() => { console.log('ShiftFilter reset'); }}
            />
          </div>
         <div className="mb-8">
            <EmployeeShiftDetails shiftName={shiftQueryName} onViewEmployee={(employeeId) => { setActiveView("view"); handleViewEmployee(employeeId); }} />
          </div>
        </div>
      </div>
    );
  }

  return (
     <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl font-bold mb-8 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>Employee Leaves Management</h1>
<AnimatePresence>
  {!sidebarOpen && (
    <motion.button
      key="open-nav"
      onClick={() => setSidebarOpen(true)}
      className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-indigo-700 text-white p-2 rounded-l-xl shadow-2xl z-50 hover:bg-indigo-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      aria-label="Open Navigation"
    >
      <ChevronLeft className="h-6 w-6" /> 
    </motion.button>
  )}

  {sidebarOpen && (
    <>
      <motion.div
        key="nav-sidebar"
        className={`fixed inset-y-0 top-16 right-0 w-80 max-w-full ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} shadow-2xl z-50 p-6 flex flex-col`}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
      >
        <div className="flex items-center justify-between mb-6 border-b pb-4 border-gray-200">
          <h3 className="text-xl font-bold tracking-tight">App Navigation</h3>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`p-2 rounded-full bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'hover:bg-gray-200'}`}
            aria-label="Close Navigation"
          >
            <X className="h-5 w-5" /> 
          </button>
        </div>

        <nav className="flex flex-col gap-1 mt-2">
          <button
            onClick={() => {
              setActiveView('MyDetails');
              clearMessages();
              handleViewEmployee(empId);
              setSidebarOpen(false);
            }}
            className={`text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
              activeView === 'MyDetails'
                ? 'bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700'
                : theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            }`}
          >
            <UserCircle className="h-5 w-5" /> 
            My details
          </button>

          {/* Search Button */}
          <button
            onClick={() => {
              setActiveView('search');
              clearMessages();
              loadAllEmployees();
              setSidebarOpen(false);
            }}
            // Updated Navigation Item Styles
            className={`text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
              activeView === 'search'
                ? 'bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700'
                : theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900' 
            }`}
          >
            <SearchIcon className="h-5 w-5" /> 
            All Employees
          </button>
           <button
            onClick={() => {
              setSidebarOpen(false);
              setShiftQueryName("Morning");
              setActiveView('shift');
            }}
            className={`text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
              theme === 'dark' ? 'hover:bg-gray-700 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Create Shift
          </button>
        </nav>
      </motion.div>
      <motion.div
        key="nav-backdrop"
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={() => setSidebarOpen(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    </>
  )}
</AnimatePresence>
        {error && (
          <div className={`mb-4 p-4 border border-red-200 rounded-lg ${theme === "dark" ? "bg-red-800 text-red-100" : "bg-red-50 text-red-700"}`}>
            {error}
          </div>
        )}
        {success && (
          <div className={`mb-4 p-4 border border-green-200 rounded-lg ${theme === "dark" ? "bg-green-800 text-green-100" : "bg-green-50 text-green-700"}`}>
            {success}
          </div>
        )}
         {activeView === "add" && (
          <AddEmployeeLeavesForm
            onCancel={() => { setActiveView('search'); clearMessages(); loadAllEmployees(); }}
          />
        )};
        {activeView === "update" && (
          <AddEmployeeLeavesForm
            Data={currentEmployee}
            onCancel={() => { setActiveView('view'); clearMessages(); handleViewEmployee(currentEmployee.employeeId); }}
          />
        )};
        {activeView === 'view' && currentEmployee && (
          <div className={`rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 transition-all duration-500 hover:shadow-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center justify-between border-b pb-3 mb-6 border-gray-300">
              <h2 className={`text-2xl font-bold tracking-tight ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                Employee Leave Details
              </h2>
              <span className="px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 rounded-full shadow-sm">
                {currentEmployee.employeeId}
              </span>
            </div>
            <div className="space-y-4 mb-8">
              <h3 className={`text-lg font-semibold border-l-4 border-blue-500 pl-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Employee ID", value: currentEmployee.employeeId },
                  { label: "Month", value: currentEmployee.month },
                  { label: "Year", value: currentEmployee.year },
                ].map(({ label, value }, idx) => (
                  <div
                    key={idx}
                    className={`bg-gray-100 rounded-lg px-4 py-3 border border-gray-300 hover:scale-[1.01] transition-transform ${theme === "dark" ? "dark:bg-gray-800 dark:border-gray-700" : ""}`}
                  >
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
                    <p className={`text-base font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <h3 className={`text-lg font-semibold border-l-4 border-green-500 pl-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                Leave Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['paid', 'sick', 'casual', 'unpaid'].map((type) => (
                  <div
                    key={type}
                    className={`bg-gray-100 rounded-lg px-4 py-3 border border-gray-300 hover:scale-[1.01] transition-transform ${theme === "dark" ? "dark:bg-gray-800 dark:border-gray-700" : ""}`}
                  >
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{type} Leaves</p>
                    <p className={`text-base font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                      {currentEmployee[type]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <h3 className={`text-lg font-semibold border-l-4 border-yellow-500 pl-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                Consumed Leaves
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['paidConsumed', 'sickConsumed', 'casualConsumed', 'unpaidConsumed'].map((type) => (
                  <div
                    key={type}
                    className={`bg-gray-100 rounded-lg px-4 py-3 border border-gray-300 hover:scale-[1.01] transition-transform ${theme === "dark" ? "dark:bg-gray-800 dark:border-gray-700" : ""}`}
                  >
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      {type.replace('Consumed', ' Consumed')}
                    </p>
                    <p className={`text-base font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                      {currentEmployee[type]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <h3 className={`text-lg font-semibold border-l-4 border-purple-500 pl-2 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                Shift & Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Shift Name", value: currentEmployee.shiftName },
                  { label: "Latitude", value: currentEmployee.latitude },
                  { label: "Longitude", value: currentEmployee.longitude },
                ].map(({ label, value }, idx) => (
                  <div
                    key={idx}
                    className={`bg-gray-100 rounded-lg px-4 py-3 border border-gray-300 hover:scale-[1.01] transition-transform ${theme === "dark" ? "bg-gray-800 border-gray-700" : ""}`}
                  >
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
                    <p className={`text-base font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {(
          <div 
           className={`w-full max-w-8xl rounded-xl shadow-xl p-6 mb-8 transition-colors duration-300 
             ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
         >
           <h2 
             className={`text-2xl font-bold mb-5 border-b pb-3 border-gray-200 
               ${theme === "dark" ? "text-white" : "text-gray-900"}`}
           >
             Employee Operations
           </h2>
           <div 
             className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0"
           >
             <input
               type="text"
               placeholder="Enter Employee ID (e.g., E1234)"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
               className={`w-full md:flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg 
                 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all
                 ${theme === "dark" ? "bg-gray-700 text-white placeholder-gray-400 border-gray-600" : "bg-gray-50 text-gray-900 placeholder-gray-500"}`}
             />
             <button
               onClick={handleSearch}
               disabled={loading}
               className={`w-full md:w-auto px-6 py-3 font-semibold bg-indigo-600 text-white rounded-lg 
                 hover:bg-indigo-700 transition-colors duration-200 
                 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 
                 disabled:opacity-60 disabled:cursor-not-allowed`}
             >
               {loading ? 'Searching...' : 'Search Leaves'}
             </button>
             <button
               onClick={() => setActiveView('add')}
               disabled={loading}
               className={`w-full md:w-auto px-6 py-3 font-semibold bg-blue-600 text-white rounded-lg 
                 hover:bg-blue-700 transition-colors duration-200 
                 focus:outline-none focus:ring-4 focus:ring-blue-500/50 
                 disabled:opacity-60 disabled:cursor-not-allowed`}
             >
               {'ADD Employee'}
             </button>
           </div>
         </div>
        )}
        {(
          <div className={`rounded-lg shadow-md p-4 mb-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <h3 className={`text-lg font-medium mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Some Filters</h3>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"} mb-1`}>Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-200":"text-gray-700"} mb-1`}>Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 11 }, (_, i) => (
                    <option key={i} value={2020 + i}>
                      {2020 + i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        {(
          <div className={`rounded-lg shadow-md overflow-hidden ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Current Employee Details</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading employees...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className={`p-8 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                No employees found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`bg-gray-50 ${theme === "dark" ? "dark:bg-gray-700" : ""}`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Employee ID
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Month/Year
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Working Days
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Days Present
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Unpaid Leaves
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-200 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                      {employees.map((employee, index) => (
                        <tr
                          key={index}
                          className={`cursor-pointer transition-colors ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                          onClick={() => handleViewEmployee(employee.employeeId)}
                        >
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>
                            {employee.employeeId}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            {employee.month}/{employee.year}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            {employee.totalWorkingDays}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            {employee.daysPresent}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            {employee.unpaidLeaves}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateDetails(employee.employeeId);
                                setActiveView('update');
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLeaves(employee.employeeId);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className={`px-4 py-2 rounded-lg hover:bg-gray-300 ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalLeaves;