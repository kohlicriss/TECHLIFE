import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FaCalendarAlt, FaTrashAlt, FaFileAlt, FaPlus, FaPaperclip, FaUsers, FaRegFolderOpen } from 'react-icons/fa';
import axios from 'axios';
import { Context } from '../HrmsContext';
import { FiDelete, FiEdit } from "react-icons/fi";
import { authApi } from '../../../../axiosInstance';

const SprintTable = ({ projectId }) => {
  const { theme } = useContext(Context);
  const [sprints, setSprints] = useState([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    sprintName: '',
    startDate: '',
    endDate: '',
    status: 'PLANNED'
  });
  const API_HOST = 'https://hrms.anasolconsultancyservices.com/api/employee/sprints';
  const token = () => localStorage.getItem('accessToken');
  const persistTokenFromRes = async (res, body) => {
    try {
      const authHeader = res.headers.get('authorization') || res.headers.get('Authorization');
      if (authHeader) storeAccessToken(authHeader);
      if (body?.accessToken || body?.token || body?.jwt) storeAccessToken(body?.accessToken || body?.token || body?.jwt);
    } catch (e) { /* ignore */ }
  };
  const loadSprints = async () => {
    if (!projectId) return;
    setLoadingSprints(true);
    setError(null);
    try {
      const res = await fetch(`${API_HOST}/project/${encodeURIComponent(projectId)}`, {
        headers: { Accept: 'application/json', Authorization: token() ? `Bearer ${token()}` : undefined }
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const body = await res.json().catch(() => []);
      await persistTokenFromRes(res, body);
      setSprints(Array.isArray(body) ? body : (body.sprints || []));
      if (Array.isArray(body) && body.length) {
        setSelectedSprint(body[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load sprints');
      setSprints([]);
    } finally {
      setLoadingSprints(false);
    }
  };

  useEffect(() => { loadSprints(); }, [projectId]);
  const openCreate = () => {
    setForm({ sprintName: '', startDate: '', endDate: '', status: 'PLANNED' });
    setShowCreate(true);
  };
  const openEdit = () => {
    if (!selectedSprint) return;
    setForm({
      sprintName: selectedSprint.sprintName || selectedSprint.title || '',
      startDate: selectedSprint.startDate || '',
      endDate: selectedSprint.endDate || '',
      status: selectedSprint.status || 'PLANNED'
    });
    setShowEdit(true);
  };
  const createSprint = async (e) => {
    e?.preventDefault();
    if (!projectId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_HOST}/project/${encodeURIComponent(projectId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token() ? `Bearer ${token()}` : undefined },
        body: JSON.stringify(form)
      });
      const body = await res.json().catch(() => null);
      await persistTokenFromRes(res, body);
      if (!res.ok) throw new Error(body?.message || `Status ${res.status}`);
      setShowCreate(false);
      await loadSprints();
    } catch (err) {
      alert('Create failed: ' + (err.message || err));
    } finally { setSubmitting(false); }
  };
  const updateSprint = async (e) => {
    e?.preventDefault();
    if (!projectId || !selectedSprint) return;
    setSubmitting(true);
    try {
      const sprintId = selectedSprint.sprintId || selectedSprint.sprint_id || selectedSprint.id;
      const res = await fetch(`${API_HOST}/${encodeURIComponent(projectId)}/${encodeURIComponent(sprintId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token() ? `Bearer ${token()}` : undefined },
        body: JSON.stringify(form)
      });
      const body = await res.json().catch(() => null);
      await persistTokenFromRes(res, body);
      if (!res.ok) throw new Error(body?.message || `Status ${res.status}`);
      setShowEdit(false);
      await loadSprints();
    } catch (err) {
      alert('Update failed: ' + (err.message || err));
    } finally { setSubmitting(false); }
  };
  const deleteSprint = async (s) => {
    if (!projectId || !s) return;
    if (!window.confirm(`Delete sprint ${s.sprintId || s.sprint_id || s.id}?`)) return;
    setSubmitting(true);
    try {
      const sprintId = s.sprintId || s.sprint_id || s.id;
      const res = await fetch(`${API_HOST}/${encodeURIComponent(projectId)}/${encodeURIComponent(sprintId)}`, {
        method: 'DELETE',
        headers: { Authorization: token() ? `Bearer ${token()}` : undefined }
      });
      const body = await res.json().catch(() => null);
      await persistTokenFromRes(res, body);
      if (!res.ok) throw new Error(body?.message || `Status ${res.status}`);
      await loadSprints();
    } catch (err) {
      alert('Delete failed: ' + (err.message || err));
    } finally { setSubmitting(false); }
  };
  return (
    <div className={`p-4 rounded-xl shadow-md ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Sprints</h3>
        <div className="flex items-center gap-2">
          <button onClick={openCreate} title="Create Sprint" className="p-2 rounded-md bg-green-600 text-white"><FaPlus /></button>
          <button onClick={openEdit} disabled={!selectedSprint} title="Edit Selected" className="p-2 rounded-md bg-yellow-500 text-white"><FiEdit /></button>
          <button onClick={() => deleteSprint(selectedSprint)} disabled={!selectedSprint} title="Delete Selected" className="p-2 rounded-md bg-red-600 text-white"><FiDelete /></button>
        </div>
      </div>
      {loadingSprints ? (
        <div className="py-6 text-center text-sm text-indigo-500">Loading sprints...</div>
      ) : error ? (
        <div className="py-4 text-center text-sm text-red-500">{error}</div>
      ) : sprints.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-500">No sprints found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2 px-3">Sprint ID</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Start</th>
                <th className="py-2 px-3">End</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sprints.map((s, idx) => (
                <tr
                  key={s.sprintId || s.sprint_id || idx}
                  onClick={() => setSelectedSprint(s)}
                  className={`cursor-pointer ${selectedSprint === s ? 'ring-2 ring-indigo-300' : ''} hover:bg-gray-50`}
                >
                  <td className="py-2 px-3">{s.sprintId || s.sprint_id || s.id || '-'}</td>
                  <td className="py-2 px-3">{s.sprintName || s.title || '-'}</td>
                  <td className="py-2 px-3">{s.startDate || '-'}</td>
                  <td className="py-2 px-3">{s.endDate || '-'}</td>
                  <td className="py-2 px-3">{s.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
{showCreate && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <form onSubmit={createSprint} className={`w-full max-w-lg p-7 rounded-2xl shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5 pb-2 border-b border-gray-300/50 dark:border-gray-700">
                <h4 className="text-xl font-bold tracking-tight">Create New Sprint</h4>
                <button type="button" onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <div className="space-y-4">
                <input className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`} placeholder="Sprint Name (e.g., Sprint 1, Q1 Project Kickoff)" value={form.sprintName} onChange={e => setForm(prev => ({ ...prev, sprintName: e.target.value }))} required />
                <div className="grid grid-cols-2 gap-3">
                    <input type="date" className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} value={form.startDate} onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))} required />
                    <input type="date" className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} value={form.endDate} onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))} required />
                </div>
                <select 
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`} 
                    value={form.status} 
                    onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}>
                    <option value="PLANNED">PLANNED</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                </select>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-300/50 dark:border-gray-700">
                <button type="button" onClick={() => setShowCreate(false)} className={`px-5 py-2 rounded-lg font-semibold transition-colors border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Cancel</button>
                <button  type="submit"  disabled={submitting}  className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors" >     {submitting ? 'Creating...' : 'Create'} </button>
            </div>
        </form>
    </div>
)}
{showEdit && selectedSprint && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <form onSubmit={updateSprint} className={`w-full max-w-lg p-7 rounded-2xl shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 text-gray-100 border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5 pb-2 border-b border-gray-300/50 dark:border-gray-700">
                <h4 className="text-xl font-bold tracking-tight">Update Sprint Details</h4>
                <button type="button" onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none"> &times; </button>
            </div>
            <div className="space-y-4">
                <input className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`} placeholder="Sprint Name (e.g., Sprint 1, Q1 Project Kickoff)" value={form.sprintName} onChange={e => setForm(prev => ({ ...prev, sprintName: e.target.value }))} required />
                <div className="grid grid-cols-2 gap-3">
                    <input type="date" className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} value={form.startDate} onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))} required />
                    <input type="date" className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} value={form.endDate} onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))} required />
                </div>
                <select 
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`} 
                    value={form.status} 
                    onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}>
                    <option value="PLANNED">PLANNED</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                </select>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-300/50 dark:border-gray-700">
                <button type="button" onClick={() => setShowEdit(false)} className={`px-5 py-2 rounded-lg font-semibold transition-colors border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>    Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-yellow-500 text-white rounded-lg font-semibold shadow-md hover:bg-yellow-600 disabled:bg-yellow-400 disabled:cursor-not-allowed transition-colors">    {submitting ? 'Updating...' : 'Update'}</button>
            </div>
        </form>
    </div>
)}
    </div>
  );
};
const ProjectOverviewForm = ({ mode = 'create', projectId, initialData = {}, onClose = () => {}, onSuccess = () => {} }) => {
  const { theme } = useContext(Context);
  const [form, setForm] = useState({
    timeline_progress: initialData.timeline_progress || '',
    client: initialData.client || '',
    total_cost: initialData.total_cost || '',
    days_to_work: initialData.days_to_work || '',
    priority: initialData.priority || '',
    startedOn: initialData.startedOn ? initialData.startedOn.slice(0,10) : '',
    endDate: initialData.endDate ? initialData.endDate.slice(0,10) : '',
    manager_employeeId: initialData.manager?.employeeId || '',
    manager_name: initialData.manager?.name || '',
    dueAlert: typeof initialData.dueAlert !== 'undefined' ? initialData.dueAlert : 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const base = 'https://hrms.anasolconsultancyservices.com/api/employee';
  const handleChange = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));
  const persistReturnedToken = async (res, bodyData) => {
    const authHeader = res.headers.get('authorization') || res.headers.get('Authorization');
    if (authHeader) {
      const raw = String(authHeader).startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
      try { localStorage.setItem('accessToken', raw); } catch {}
    }
    const returnedToken = bodyData?.accessToken || bodyData?.token || bodyData?.jwt;
    if (returnedToken) {
      const raw = String(returnedToken).startsWith('Bearer ') ? returnedToken.split(' ')[1] : returnedToken;
      try { localStorage.setItem('accessToken', raw); } catch {}
    }
  };
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!projectId) return alert('Project id missing');
    const token = localStorage.getItem('accessToken');
    if (!token) return alert('Missing access token. Please login.');
    const payload = {
      timeline_progress: form.timeline_progress,
      client: form.client,
      total_cost: form.total_cost,
      days_to_work: form.days_to_work,
      priority: form.priority,
      startedOn: form.startedOn || null,
      endDate: form.endDate || null,
      manager: { employeeId: form.manager_employeeId, name: form.manager_name },
      dueAlert: Number(form.dueAlert || 0)
    };
    const url = mode === 'create'
      ? `${base}/create/ProjectOverview/${encodeURIComponent(projectId)}`
      : `${base}/update/ProjectOverview/${encodeURIComponent(projectId)}`;
    setSubmitting(true);
    try {
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const body = await res.json().catch(() => null);
      await persistReturnedToken(res, body);
      if (!res.ok) {
        const msg = body?.message || res.statusText || `Status ${res.status}`;
        throw new Error(msg);
      }
      onSuccess(body || payload);
      onClose();
    } catch (err) {
      console.error(`${mode} overview failed`, err);
      alert(`Failed to ${mode} overview: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <form onSubmit={handleSubmit} className={`w-full max-w-2xl p-8 rounded-2xl shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100 border border-gray-700' : 'bg-white text-gray-800 border border-gray-200'}`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6 pb-2 border-b border-gray-300/50">
            <h3 className="text-2xl font-extrabold tracking-tight">
                {mode === 'create' ? 'Create Project Overview' : 'Update Project Overview'}
            </h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none">
                &times;
            </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Timeline Progress</label>
                <input className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`} value={form.timeline_progress} onChange={handleChange('timeline_progress')} placeholder="e.g., 50%" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Client</label>
                <input className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`} value={form.client} onChange={handleChange('client')} placeholder="Client Company Name" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Total Cost</label>
                <input className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`} value={form.total_cost} onChange={handleChange('total_cost')} placeholder="e.g., $15,000" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Days to Work</label>
                <input className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`} value={form.days_to_work} onChange={handleChange('days_to_work')} placeholder="e.g., 45" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <input className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`} value={form.priority} onChange={handleChange('priority')} placeholder="e.g., High, Medium, Low" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Due Alert (days)</label>
                <input type="number" className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`} value={form.dueAlert} onChange={handleChange('dueAlert')} placeholder="e.g., 7" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input type="date" className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`} value={form.startedOn} onChange={handleChange('startedOn')} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input type="date" className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`} value={form.endDate} onChange={handleChange('endDate')} />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Manager Employee ID</label>
                <input className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`} value={form.manager_employeeId} onChange={handleChange('manager_employeeId')} placeholder="e.g., MGR101" />
            </div>
            <div className="sm:col-span-2"> 
                <label className="block text-sm font-medium mb-1">Manager Name</label>
                <input className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`} value={form.manager_name} onChange={handleChange('manager_name')} placeholder="Full Name" />
            </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-300/50">
            <button type="button" onClick={onClose} className={`px-5 py-2 rounded-lg font-semibold transition-colors border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors">
                {submitting ? 'Saving...' : (mode === 'create' ? 'Create' : 'Update')}
            </button>
        </div>
    </form>
</div>
  );
};
const APIBASE_URL = 'https://hrms.anasolconsultancyservices.com/api/employee/overview/';
const storeAccessToken = (rawTokenOrHeader) => {
    if (!rawTokenOrHeader) return;
    const token = String(rawTokenOrHeader).startsWith('Bearer ')
        ? String(rawTokenOrHeader).split(' ')[1]
        : String(rawTokenOrHeader);
    try { localStorage.setItem('accessToken', token); } catch (e) { /* ignore */ }
};
 const ProjectDetails = ({ projectId: propProjectId }) => {
    const { projectId: paramProjectId } = useParams();
    const [projectId, setProjectId] = useState(() => propProjectId || paramProjectId || localStorage.getItem('selectedProjectId') || '');
    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {theme} = useContext(Context);
    const [loggedPermissiondata,setLoggedPermissionData]=useState([]);
          const [matchedArray,setMatchedArray]=useState(null);
           const LoggedUserRole=userData?.roles[0]?`ROLE_${userData?.roles[0]}`:null
           useEffect(()=>{
             let fetchedData=async()=>{
                     let response = await authApi.get(`role-access/${LoggedUserRole}`);
                     console.log("from MyTeam :",response.data);
                     setLoggedPermissionData(response.data);
             }
             fetchedData();
             },[])
        
             useEffect(()=>{
             if(loggedPermissiondata){
                 setMatchedArray(loggedPermissiondata?.permissions)
             }
             },[loggedPermissiondata]);
             console.log(matchedArray);
    const [showUpdateOverview, setShowUpdateOverview] = useState(false);
    useEffect(() => {
        if (propProjectId && propProjectId !== projectId) {
            setProjectId(propProjectId);
            try { localStorage.setItem('selectedProjectId', propProjectId); } catch {}
        }
    }, [propProjectId]);
    useEffect(() => {
       const fetchProjectData = async () => {
           setLoading(true);
           setError(null);
           if (!projectId) {
               setError('No project selected. Select a project to view details.');
               setLoading(false);
               setProjectData(null);
               return;
           }
           const url = `${APIBASE_URL}${encodeURIComponent(projectId)}`;
           const token = localStorage.getItem('accessToken');
           if (!token) {
               setError('Access token missing. Please login (store accessToken in localStorage).');
               setLoading(false);
               return;
           }
           try {
               const response = await fetch(url, {
                   method: 'GET',
                   headers: {
                       'Authorization': `Bearer ${token}`,
                       'Accept': 'application/json',
                   },
               });
               const authHeader = response.headers.get('authorization') || response.headers.get('Authorization');
               if (authHeader) storeAccessToken(authHeader);
               if (response.status === 401) {
                   setError('Unauthorized (401). Access token invalid or expired. Please re-login.');
                   setProjectData(null);
                   return;
               }
               if (!response.ok) {
                   const txt = await response.text().catch(() => null);
                   throw new Error(txt || `HTTP ${response.status}`);
               }
               const data = await response.json();
               const returnedToken = data?.accessToken || data?.token || data?.jwt;
               if (returnedToken) storeAccessToken(returnedToken);

               setProjectData(data);
           } catch (err) {
               console.error("Fetch error:", err);
               setError(`Failed to fetch project data. Check the token and URL. Error: ${err.message}`);
           } finally {
               setLoading(false);
           }
       };
       fetchProjectData();
     }, [projectId]); 
    if (loading) {
        return (
            <div className="flex justify-center items-center h-40"><p className="text-xl text-blue-600">Loading project details...</p></div>
        );
    }
    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded m-6" role="alert"><p className="font-bold">Error!</p><p className="text-sm">{error}</p></div>
        );
    }
    if (!projectData) {
        return (
            <div className="flex justify-center items-center h-40"><p className="text-xl text-gray-500">No project data found.</p></div>
        );
    }
    return (
        <div className="p-2 space-y-4">
            <div className="flex items-end justify-end border-b pb-2 mb-2">
               {(matchedArray || []).includes("UPDATE_PROJECTOVERVIEW") && (<button title="Update Overview" onClick={() => setShowUpdateOverview(true)} className="p-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600"><FiEdit /></button>  )}
            </div>
            {/* General Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <InfoCard title="Client" value={projectData.client} />
                <InfoCard title="Total Cost" value={`$${projectData.total_cost || 'N/A'}`} />
                <InfoCard title="Timeline Progress" value={projectData.timeline_progress} />
                <InfoCard title="Priority" value={projectData.priority} />
            </div> 
             {showUpdateOverview && (
              <ProjectOverviewForm mode="update" projectId={projectId} initialData={projectData} onClose={() => setShowUpdateOverview(false)} onSuccess={(updated) => {  setProjectData(updated); }} />
            )}           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard title="Start Date" value={projectData.startedOn ? new Date(projectData.startedOn).toLocaleDateString() : 'N/A'} />
                <InfoCard title="End Date" value={projectData.endDate ? new Date(projectData.endDate).toLocaleDateString() : 'N/A'} />
                <InfoCard title="Days to Work" value={projectData.days_to_work} />
            </div>
            {projectData.manager && (
                <div className={`p-1 rounded-lg border-l-4 border-blue-500 shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} mb-1`}>Project Manager</h2>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}><span className="font-medium">Name:</span> {projectData.manager.name}</p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}><span className="font-medium">Employee ID:</span> {projectData.manager.employeeId}</p>
                </div>
            )}
            
            {/* Due Alert */}
            <div className="pt-2 border-t mt-2">
                <p className={`text-lg font-bold ${projectData.dueAlert > 0 ? 'text-red-600' : 'text-green-600'}`}> Due Alert: {projectData.dueAlert} {projectData.dueAlert > 0 ? 'Days Overdue!' : 'No Alert'} </p>
            </div>
        </div>
    );
};

// Helper component for cleaner display
const InfoCard = ({ title, value }) => {
    const {theme} = useContext(Context);
    return (
    <div className={`p-2 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{value || 'N/A'}</p>
    </div>
    );  
};
const projectData = {projectDetails: {},};
const calculateProgress = (startDateStr, endDateStr) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const today = new Date();

    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    const totalDuration = end.getTime() - start.getTime();
    const elapsedDuration = today.getTime() - start.getTime();

    if (totalDuration <= 0 || elapsedDuration < 0) return 0;
    if (elapsedDuration >= totalDuration) return 100;

    return Math.min(100, Math.round((elapsedDuration / totalDuration) * 100));
};
const ProjectCard = () => {
    const {theme,userData} = useContext(Context);
    const motion = {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
    };
    const { projectId: paramProjectId } = useParams();
    const [projectId, setProjectId] = useState(() => paramProjectId || localStorage.getItem('selectedProjectId') || '');

    const [rolesData, setRolesData] = useState(null);
    const [rolesLoading, setRolesLoading] = useState(false); 

    const [localProjectData, setLocalProjectData] = useState(null);
    const [showCreateOverview, setShowCreateOverview] = useState(false);
    const [overviewSubmitting, setOverviewSubmitting] = useState(false);

    const [showSprintModal, setShowSprintModal] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [carouselProjects, setCarouselProjects] = useState([]);
    const [loadingCarousel, setLoadingCarousel] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [loadingProject, setLoadingProject] = useState(false);
    const icon = currentProject?.icon || '📁';
    const color = currentProject?.color || 'text-indigo-500';
    // compute progress using the fetched localProjectData (fallback to module-level `projectData` if needed)
    const progressSource = localProjectData || projectData;
    const progressPercent = calculateProgress(progressSource?.projectDetails?.startedOn, progressSource?.projectDetails?.endDate);

    const [loggedPermissiondata,setLoggedPermissionData]=useState([]);
          const [matchedArray,setMatchedArray]=useState(null);
           const LoggedUserRole=userData?.roles[0]?`ROLE_${userData?.roles[0]}`:null
           useEffect(()=>{
             let fetchedData=async()=>{
                     let response = await authApi.get(`role-access/${LoggedUserRole}`);
                     console.log("from MyTeam :",response.data);
                     setLoggedPermissionData(response.data);
             }
             fetchedData();
             },[])
        
             useEffect(()=>{
             if(loggedPermissiondata){
                 setMatchedArray(loggedPermissiondata?.permissions)
             }
             },[loggedPermissiondata]);
             console.log(matchedArray);
     const loadCarouselProjects = async () => {
    setLoadingCarousel(true);
    try {
      const token = getAccessToken();
      if (!token) return;
      const list = await fetchProjects(0, 10, token).catch(() => []);
      const arr = Array.isArray(list) ? list : (list.content || []);
      setCarouselProjects(arr);
      if (arr.length) {
        setCurrentIndex(0);
        await loadProjectDetailsById(arr[0].projectId || arr[0].project_id);
      }
    } catch (err) {
      console.error('loadCarouselProjects error', err);
    } finally {
      setLoadingCarousel(false);
    }
  };
  const loadProjectDetailsById = async (pid) => {
    if (!pid) return;
    setLoadingProject(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error('Missing token');
      const overviewUrl = `${APIBASE_URL}${encodeURIComponent(pid)}`;
      const overviewRes = await fetch(overviewUrl, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      const overviewBody = overviewRes.ok ? await overviewRes.json().catch(() => null) : null;
      const rolesUrl = `https://hrms.anasolconsultancyservices.com/api/employee/${encodeURIComponent(pid)}/roles`;
      const rolesRes = await fetch(rolesUrl, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      const rolesBody = rolesRes.ok ? await rolesRes.json().catch(() => []) : [];
      let kpiBody = null;
      const empId = userData?.employeeId;
      if (empId) {
        try {
          const kpiUrl = `https://hrms.anasolconsultancyservices.com/api/employee/kpi/${encodeURIComponent(empId)}/${encodeURIComponent(pid)}`;
          const kpiRes = await fetch(kpiUrl, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
          if (kpiRes.ok) kpiBody = await kpiRes.json().catch(() => null);
        } catch (e) { /* ignore KPI error */ }
      }
      const normalized = {
        projectId: pid,
        name: overviewBody?.projectName || overviewBody?.title || overviewBody?.projectName || carouselProjects.find(p => (p.projectId||p.project_id) === pid)?.title || pid,
        description: overviewBody?.projectDescription || overviewBody?.description || overviewBody?.project_details || '',
        status: overviewBody?.status || overviewBody?.projectStatus || (overviewBody?.projectDetails?.status) || 'N/A',
        kpis: kpiBody?.kpis || overviewBody?.kpis || overviewBody?.KPIs || carouselProjects.find(p => (p.projectId||p.project_id) === pid)?.kpis || {},
        overview: overviewBody || null,
        teamAllocation: Array.isArray(rolesBody) ? rolesBody : (rolesBody?.roles || []),
      };
      setCurrentProject(normalized);
      setLocalProjectData(normalized.overview || null);
      try { setProjectId(pid); localStorage.setItem('selectedProjectId', pid); } catch {}
    } catch (err) {
      console.error('loadProjectDetailsById error', err);
    } finally {
      setLoadingProject(false);
    }
  };
   useEffect(() => { loadCarouselProjects(); }, []);
    const loadRoles = async (pid) => {
     if (!pid) return;
     setRolesLoading(true);
     try {
       const token = localStorage.getItem('accessToken');
       const url = `https://hrms.anasolconsultancyservices.com/api/employee/${encodeURIComponent(pid)}/roles`;
       const res = await fetch(url, { headers: { Accept: 'application/json', Authorization: token ? `Bearer ${token}` : undefined } });
       if (!res.ok) {
         console.warn('Failed to load roles', res.status);
         setRolesData(null);
         return;
       }
       const body = await res.json().catch(() => null);
       if (Array.isArray(body)) {
         const mapped = body.map(g => ({
           role: g.role || 'Unknown',
           count: typeof g.count === 'number' ? g.count : (Array.isArray(g.employees) ? g.employees.length : 0),
           employees: Array.isArray(g.employees) ? g.employees.map(e => ({
             employeeId: e.employeeId,
             name: e.displayName || e.employeeName || e.name,
             image: e.employeeImage || null
           })) : []
         }));
         setRolesData(mapped);
       } else {
         setRolesData(null);
       }
     } catch (err) {
       console.error('loadRoles error', err);
       setRolesData(null);
     } finally {
       setRolesLoading(false);
     }
   };
   useEffect(() => { if (projectId) loadRoles(projectId); }, [projectId]);
    const handleDeleteOverview = async () => {
       if (!projectId) return alert('Project id missing');
       if (!window.confirm(`Delete overview for ${projectId}? This cannot be undone.`)) return;
       const token = localStorage.getItem('accessToken');
       if (!token) return alert('Missing access token. Please login.');
       setOverviewSubmitting(true);
       try {
         const url = `https://hrms.anasolconsultancyservices.com/api/employee/delete/${encodeURIComponent(projectId)}`;
         const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
         const body = await res.json().catch(()=>null);
         // persist token if returned
         const authHeader = res.headers.get('authorization') || res.headers.get('Authorization');
         if (authHeader) storeAccessToken(authHeader);
         if (body?.accessToken || body?.token || body?.jwt) storeAccessToken(body?.accessToken || body?.token || body?.jwt);
         if (!res.ok) throw new Error(body?.message || res.statusText || `Status ${res.status}`);
         setLocalProjectData(null);
         alert('Project overview deleted.');
       } catch (err) {
         console.error('Delete overview failed', err);
         alert('Delete failed: ' + (err.message || err));
       } finally {
         setOverviewSubmitting(false);
       }
     };
    const goToNextProject = async () => {
      if (!carouselProjects.length) return;
      const next = (currentIndex + 1) % carouselProjects.length;
      setCurrentIndex(next);
      const pid = carouselProjects[next].projectId || carouselProjects[next].project_id;
      await loadProjectDetailsById(pid);
    };
    const goToPreviousProject = async () => {
      if (!carouselProjects.length) return;
      const prev = (currentIndex - 1 + carouselProjects.length) % carouselProjects.length;
      setCurrentIndex(prev);
      const pid = carouselProjects[prev].projectId || carouselProjects[prev].project_id;
      await loadProjectDetailsById(pid);
    };
    const getAvatarUrl = (index) => `https://i.pravatar.cc/40?img=${index + 1}`;
    const getStatusClasses = (status) => {
        switch (status) {
            case 'On Track':
                return 'bg-green-100 text-green-800 ring-green-500';
            case 'At Risk':
                return 'bg-yellow-100 text-yellow-800 ring-yellow-500';
            case 'Completed':
                return 'bg-blue-100 text-blue-800 ring-blue-500';
            default:
                return 'bg-gray-100 text-gray-800 ring-gray-500';
        }
    };
    return (
        <motion.div className={`relative p-6 rounded-xl shadow-2xl mx-auto border border-orange-400  ${theme==='dark' ? 'bg-gray-700':'bg-gradient-to-r from-orange-10 to-orange-50'}`} key={currentIndex} >
           <motion.span className={`absolute top-4 right-4 text-sm font-bold py-1 px-3 rounded-full shadow-md ring-2 ${getStatusClasses(currentProject?.status)}`} >
                {currentProject?.status || 'N/A'}
            </motion.span>
            <div className="flex items-center mb-6 flex-wrap">
                 <motion.span className={`text-5xl mr-4 ${color}`} >{icon} </motion.span>
                 <motion.h2 className={`text-3xl sm:text-4xl font-extrabold ${color} mt-2 sm:mt-0`} >{currentProject?.name || 'Project'} </motion.h2>
            </div>
            <motion.p className={`text-base sm:text-lg mb-6 leading-relaxed ${theme==='dark' ? 'text-gray-200':'text-gray-700'}`} >
                {currentProject?.description || currentProject?.overview?.projectDescription || ''}
             </motion.p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-2 ">
              <motion.div className={`p-4 rounded-lg shadow-lg border border-gray-200 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gradient-to-br from-yellow-50 to-white'}`} >
                   <div className="relative">
                     <button
                       type="button"
                       title="Open Sprints"
                       onClick={() => setShowSprintModal(true)}
                       className="absolute top-2 right-2 z-10 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-700"
                     >
                       Sprints
                     </button>
                     <h2 className="text-xl font-bold mb-2 border-b pb-2 text-yellow-600">Key Metrics (KPIs)</h2>
                     <div className="mt-2">
                       <dl className="space-y-3">
                         {currentProject?.kpis && Object.keys(currentProject.kpis).length ? (
                           Object.entries(currentProject.kpis).map(([key, value]) => (
                             <div key={key} className="flex justify-between border-b border-gray-100 pb-2">
                               <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{key}</dt>
                               <dd className="text-md font-semibold text-gray-500 dark:text-gray-400">{value}</dd>
                             </div>
                           ))
                         ) : (
                           <div className="text-sm text-gray-500">No KPI data available for this project.</div>
                         )}
                       </dl>
                     </div>
                   </div>
                </motion.div>
                {showSprintModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-auto">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-lg font-semibold">Sprints for {projectId}</h3>
                        <div className="flex items-center gap-2">
                          {(matchedArray || []).includes("CREATE_SPRINT") && (<button onClick={() => setShowSprintModal(false)} className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300">Close</button>   )}
                        </div>
                      </div>
                      <div className="p-4">
                        <SprintTable projectId={projectId} />
                      </div>
                    </div>
                  </div>
                )}
                <motion.div className={`p-4 rounded-lg shadow-lg border border-gray-200 col-span-1 lg:col-span-2 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gradient-to-br from-blue-50 to-white'} mt-6`} >
                    <div className="flex items-start justify-between border-b pb-2 mb-2">
              <h1 className={`text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Project Overview ({projectId})</h1>
              <div className="flex items-center gap-2">
                {(matchedArray || []).includes("CREATE_PROJECTOVERVIEW") && (<button title="Create Overview" onClick={() => setShowCreateOverview(true)} className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700"><FaPlus /></button>  )}
                {(matchedArray || []).includes("DELETE_PROJECTOVERVIEW") && (<button title="Delete Overview" onClick={handleDeleteOverview} disabled={overviewSubmitting} className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700"><FiDelete /></button>  )}
              </div>
            </div>
                   <ProjectDetails projectId={projectId} />
                    <AnimatePresence>
            {showCreateOverview && (
              <ProjectOverviewForm mode="create" projectId={projectId} initialData={{}} onClose={() => setShowCreateOverview(false)} onSuccess={(newData) => {  setLocalProjectData(newData); }} />
            )}
          </AnimatePresence>
                </motion.div>
                <motion.div className={`p-4 rounded-lg shadow-lg border border-gray-100 col-span-1 lg:col-span-3 ${theme==='dark' ? 'bg-gray-800 text-white':'bg-gradient-to-br from-indigo-50 to-white'}`} >
                    <h3 className={`text-xl sm:text-2xl font-bold mb-4 border-b pb-2 ${theme==='dark' ? 'text-white':'text-gray-800'}`}>Team Allocation</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                      {rolesLoading ? (
                        <div className="col-span-3 py-6 text-center text-sm text-gray-500">Loading team allocation...</div>
                      ) : ((currentProject?.teamAllocation && currentProject.teamAllocation.length) ? currentProject.teamAllocation : (rolesData ?? currentProject?.team ?? [])).map((teamMember, index) => {
                           const role = teamMember.role || teamMember.roleName || 'Team';
                           const count = teamMember.count ?? (teamMember.avatars ? teamMember.avatars[0] : 0);
                           const employees = teamMember.employees || teamMember.members || [];
                          return (
                            <motion.div key={role + index} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-md transition border-l-4 border-indigo-400" >
                                <p className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-1 sm:mb-0`}>{role}</p>
                                <div className="flex items-center">
                                    <span className="text-sm font-bold mr-3">{count}</span>
                                    <div className="flex -space-x-2 overflow-hidden">
                                      {employees.length ? (
                                         employees.slice(0,4).map((emp, avatarIndex) => (
                                          <img key={emp.employeeId || avatarIndex} className={`inline-block h-8 w-8 rounded-full ring-2 ${theme === 'dark' ? 'ring-gray-800' : 'ring-white'} object-cover`}  src={emp.image || emp.employeeImage || getAvatarUrl(avatarIndex + 1 + index * 5)}  alt={emp.name || emp.displayName || `Member ${avatarIndex+1}`}  title={emp.name || emp.displayName}/>
                                        ))
                                      ) : (
                                        Array.from({ length: Math.min(count || 1, 4) }).map((_, avatarIndex) => (
                                          <img key={avatarIndex} className={`inline-block h-8 w-8 rounded-full ring-2 ${theme === 'dark' ? 'ring-gray-800' : 'ring-white'} object-cover`} src={getAvatarUrl(avatarIndex + 1 + index * 5)} alt={`Avatar ${avatarIndex + 1}`} />
                                        ))
                                      )}
                                      {count > 4 && (
                                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 text-xs font-medium text-gray-700 ring-2 ring-white dark:bg-gray-600 dark:text-white">
                                          +{count - 4}
                                        </span>
                                      )}
                                    </div>
                                </div>
                            </motion.div>
                          );
                      })}
                    </div>
                </motion.div>
            </div>
            <div className="flex justify-between mt-8 flex-wrap gap-4">
                <div className="relative inline-flex items-center justify-center gap-4 group">  
                <div className="absolute inset-0 duration-1000 opacity-60 transitiona-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200" ></div>
                <a
                    role="button"
                    className="group relative inline-flex items-center justify-center text-base rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30"
                    title="Previous Project"
                    onClick={goToPreviousProject}
                    href="#"
                    >Previous <svg aria-hidden="true" viewBox="0 0 10 10" height="10" width="10" fill="none" className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2" >
                        <path d="M0 5h7" className="transition opacity-0 group-hover:opacity-100" ></path>
                        <path d="M1 1l4 4-4 4" className="transition group-hover:translate-x-[3px]" ></path>
                    </svg>
                </a>
                </div>
                <div className="relative inline-flex items-center justify-center gap-4 group">
                    <div
                        className="absolute inset-0 duration-1000 opacity-60 transitiona-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200"
                    ></div>
                    <a
                        role="button"
                        className="group relative inline-flex items-center justify-center text-base rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30"
                        title="Next Project"
                        onClick={goToNextProject}
                        href="#"
                        >Next <svg aria-hidden="true" viewBox="0 0 10 10" height="10" width="10" fill="none" className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2" >  <path d="M0 5h7" className="transition opacity-0 group-hover:opacity-100" ></path>  <path d="M1 1l4 4-4 4" className="transition group-hover:translate-x-[3px]" ></path></svg>
                    </a>
                </div>
            </div>
        </motion.div>
    );
};
const API_ENDPOINT = 'https://hrms.anasolconsultancyservices.com/api/employee/project';
const ProjectForm = ({ onClose, editProject = null, onSuccess = () => {} }) => {
   const [formData, setFormData] = useState({
     title: '',
     description: '',
     projectPriority: 'Medium',
     projectStatus: 'Not Started',
     startDate: '',
     endDate: '',
     openTask: 0,
     closedTask: 0,
     teamLeadId: [''],
   });
   const statusOptions = [
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Not Started', label: 'Not Started' },
  ];
   const [fileAttachment, setFileAttachment] = useState(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
    const [rawErrorDetail, setRawErrorDetail] = useState(null);
   const [submissionMessage, setSubmissionMessage] = useState('');
  useEffect(() => {
    if (!editProject) return;
    setFormData({
      title: editProject.title || editProject.project_name || editProject.title || '',
      description: editProject.description || '',
      projectPriority: editProject.projectPriority || editProject.Priority || 'Medium',
      projectStatus: editProject.projectStatus || editProject.status || 'Not Started',
      startDate: editProject.startDate || editProject.start_date || '',
      endDate: editProject.endDate || editProject.end_date || '',
      openTask: editProject.openTask ?? editProject.Open_task ?? 0,
      closedTask: editProject.closedTask ?? editProject.Closed_task ?? 0,
      teamLeadId: Array.isArray(editProject.teamLeadId) ? editProject.teamLeadId : (editProject.teamLeadId ? [String(editProject.teamLeadId)] : (editProject.Team_Lead ? [String(editProject.Team_Lead)] : [''])),
    });
    setFileAttachment(null);
  }, [editProject]);
   const handleChange = (e) => {
     const { name, value } = e.target;
     const processedValue = (name === 'openTask' || name === 'closedTask') ? parseInt(value) || 0 : value;
     setFormData((prev) => ({ ...prev, [name]: processedValue }));
   };
   const handleFileChange = (e) => setFileAttachment(e.target.files?.[0] || null);
   const handleTeamLeadChange = (e, idx) => {
     const arr = [...formData.teamLeadId];
     arr[idx] = e.target.value;
     setFormData(prev => ({ ...prev, teamLeadId: arr }));
   };
   const submitProject = async (e) => {
     e.preventDefault();
     setIsSubmitting(true);
     setSubmissionMessage('');
     setRawErrorDetail(null);
     const dto = {
       title: formData.title,
       description: formData.description,
       projectPriority: formData.projectPriority,
       projectStatus: formData.projectStatus,
       startDate: formData.startDate,
       endDate: formData.endDate,
       openTask: Number(formData.openTask || 0),
       closedTask: Number(formData.closedTask || 0),
       teamLeadId: formData.teamLeadId.filter(Boolean),
     };
     const fd = new FormData();
     fd.append('projectDTO', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
     if (fileAttachment) fd.append('details', fileAttachment, fileAttachment.name);
     const token = localStorage.getItem('accessToken');
     if (!token) {
       setSubmissionMessage('❌ Authentication token missing. Please login.');
       setIsSubmitting(false);
       return;
     }
     try {
      const url = editProject && (editProject.projectId || editProject.project_id)
        ? `${API_ENDPOINT}/${editProject.projectId || editProject.project_id}`
        : API_ENDPOINT;
      const method = editProject ? 'PUT' : 'POST';
            // include Accept header so backend returns JSON/text consistently
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: fd,
      });
      // read raw text then try to parse JSON (safer for non-JSON error responses)
      const raw = await res.text().catch(() => '');
      let errorBody = null;
      try { errorBody = raw ? JSON.parse(raw) : null; } catch (e) { errorBody = null; }
      if (!res.ok) {
        // surface validationErrors if present
        if (errorBody?.validationErrors) {
          const ve = Object.entries(errorBody.validationErrors).map(([k,v]) => `${k}: ${v}`).join('\n');
          setSubmissionMessage(`❌ Validation failed:\n${ve}`);
        } else {
          const message = errorBody?.message || raw || res.statusText || `Status ${res.status}`;
          setSubmissionMessage(`❌ Submission failed (${res.status}): ${message}`);
        }
        console.error('Project submit failed', { status: res.status, body: errorBody ?? raw });
        setRawErrorDetail(raw || JSON.stringify(errorBody) || null);
      } else {
        setSubmissionMessage(editProject ? '✅ Project updated successfully!' : '✅ Project created successfully!');
         setFormData({
           title: '', description: '', projectPriority: 'Medium', projectStatus: 'Not Started',
           startDate: '', endDate: '', openTask: 0, closedTask: 0, teamLeadId: [''],
         });
         setFileAttachment(null);
          setTimeout(() => {
           try { onSuccess(); } catch {}
           try { onClose(); } catch {}
         }, 600);
       }
         } catch (err) {
       console.error(err);
      setSubmissionMessage(`❌ An error occurred: ${err.message}`);
      setRawErrorDetail((err && err.stack) ? String(err.stack) : String(err));
     } finally {
       setIsSubmitting(false);
     }
   };
   const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150";
   const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.form onSubmit={submitProject} className="bg-white p-6 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" >
       <button 
             type="button" 
             onClick={onClose} 
             className="absolute w-6 h-6 top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl font-bold p-1 leading-none"
         >
             &times;
         </button>
        <h1 className="text-3xl font-extrabold text-blue-700 border-b pb-3 mb-6 sticky top-0 bg-white z-10">
          {editProject ? 'Edit Project' : 'Create New Project'}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
           <label htmlFor="title" className={labelClass}>Project Title <span className="text-red-500">*</span></label>
            <input name="title" value={formData.title} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
             <label htmlFor="startDate" className={labelClass}>Start Date <span className="text-red-500">*</span></label>
            <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className={inputClass} />
          </div>
          <div>
          <label htmlFor="endDate" className={labelClass}>End Date <span className="text-red-500">*</span></label>
            <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select name="projectPriority" value={formData.projectPriority} onChange={handleChange} className={inputClass}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="projectStatus" value={formData.projectStatus} onChange={handleChange} className={inputClass}>
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="description" className={labelClass}>Description <span className="text-red-500">*</span></label>
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={labelClass}>Open Tasks</label>
            <input name="openTask" type="number" min="0" value={formData.openTask} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Closed Tasks</label>
            <input name="closedTask" type="number" min="0" value={formData.closedTask} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Team Lead ID</label>
          <input name="teamLead" value={formData.teamLeadId[0]} onChange={(e) => handleTeamLeadChange(e, 0)} className={inputClass} placeholder="e.g., EMP-005" />
        </div>
        <div className="mt-4 border-t pt-4">
          <label className={`${labelClass} text-base`}>Details (attach file)</label>
          <input type="file" onChange={handleFileChange} className="mt-2" />
          {fileAttachment && <p className="text-sm mt-2">Selected: <strong>{fileAttachment.name}</strong></p>}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
        {submissionMessage && (
          <p className={`mt-4 p-2 rounded ${submissionMessage.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{submissionMessage}</p>
        )}
         {rawErrorDetail && (
          <div className="mt-3 p-3 bg-gray-50 rounded border text-xs text-gray-700">
            <div className="font-semibold mb-1">Server debug:</div>
            <pre className="whitespace-pre-wrap break-words">{rawErrorDetail}</pre>
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => { setRawErrorDetail(null); setSubmissionMessage(''); }} className="px-3 py-1 border rounded">Dismiss</button>
              <button type="button" onClick={submitProject} disabled={isSubmitting} className="px-3 py-1 bg-blue-600 text-white rounded">Retry</button>
            </div>
          </div>
        )}
      </motion.form>
    </div>
  );
};
const getAccessToken = () => {
    return localStorage.getItem('accessToken'); 
}
const API_BASE_URL = 'https://hrms.anasolconsultancyservices.com/api/employee'; 
const fetchProjects = async (page, size, token, employeeId = null) => {
    if (!token) throw new Error("Authentication token missing.");
    const url = employeeId
      ? `${API_BASE_URL}/projects/${encodeURIComponent(employeeId)}`
      : `${API_BASE_URL}/${page}/${size}/projectId/asc/projects`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized: Token expired or invalid. Please log in again.");
        }
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(`API Error: ${errorBody.message || response.statusText}`);
    }
    return response.json();
};
function Project() {
    const { userData, theme } = useContext(Context);
    const role = (userData?.roles?.[0] || "").toUpperCase();
    const showSidebar = ["TEAM_LEAD", "HR", "MANAGER","ADMIN"].includes(role);
     const [loggedPermissiondata,setLoggedPermissionData]=useState([]);
          const [matchedArray,setMatchedArray]=useState(null);
           const LoggedUserRole=userData?.roles[0]?`ROLE_${userData?.roles[0]}`:null
           useEffect(()=>{
             let fetchedData=async()=>{
                     let response = await authApi.get(`role-access/${LoggedUserRole}`);
                     console.log("from MyTeam :",response.data);
                     setLoggedPermissionData(response.data);
             }
             fetchedData();
             },[])
        
             useEffect(()=>{
             if(loggedPermissiondata){
                 setMatchedArray(loggedPermissiondata?.permissions)
             }
             },[loggedPermissiondata]);
             console.log(matchedArray);
             const [hasAccess,setHasAccess]=useState([])
                   useEffect(()=>{
                       setHasAccess(userData?.permissions)
                   },[userData])
                   console.log("permissions from userdata:",hasAccess)
    const [projectTableData, setProjectTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paginationInfo, setPaginationInfo] = useState({
        pageNumber: 0,
        pageSize: 11,
        totalElements: 0,
        totalPages: 1,
    });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");
    const navigate = useNavigate();
     const loadProjects = useCallback(async (page, size) => {
        setLoading(true);
        setError(null);
        const token = getAccessToken();
        try {
            const rawRole = Array.isArray(userData?.roles) ? userData.roles[0] : userData?.roles || "";
            const normalizedRole = typeof rawRole === "string" ? rawRole.toUpperCase().replace(/^ROLE_/, "") : "";
            const isAdmin = normalizedRole === 'ADMIN';
            const employeeId = (!isAdmin && userData?.employeeId) ? userData.employeeId : null;
            const data = await fetchProjects(page, size, token, employeeId);
            if (employeeId && Array.isArray(data)) {
                setProjectTableData(data || []);
                setPaginationInfo(prev => ({ ...prev, totalElements: data.length || 0 }));
            } else {
                setProjectTableData(data.content || data || []);
                setPaginationInfo({
                    pageNumber: typeof data.pageNumber !== 'undefined' ? data.pageNumber : page,
                    pageSize: typeof data.pageSize !== 'undefined' ? data.pageSize : size,
                    totalElements: typeof data.totalElements !== 'undefined' ? data.totalElements : (Array.isArray(data) ? data.length : 0),
                    totalPages: typeof data.totalPages !== 'undefined' ? data.totalPages : 1,
                });
            }
        } catch (err) {
            console.error("Failed to load projects:", err);
            setError(err.message);
            setProjectTableData([]); 
        } finally {
            setLoading(false);
        }
    }, [userData]); 
    useEffect(() => {
        loadProjects(paginationInfo.pageNumber, paginationInfo.pageSize);
    }, [loadProjects, paginationInfo.pageNumber, paginationInfo.pageSize]);
    const handleRowClick = (proj) => {
        const idKey = proj.projectId || proj.project_id; 
        try { localStorage.setItem('selectedProjectId', idKey); } catch {}
        navigate(`/project-details/${idKey}`, { state: { project: proj } });
    };
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < paginationInfo.totalPages) {
            setPaginationInfo(prev => ({ ...prev, pageNumber: newPage }));
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High": return "bg-green-100 text-green-800";
            case "Medium": return "bg-orange-100 text-orange-800";
            case "Low": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "In Progress": return "bg-green-100 text-green-800";
            case "Ongoing": return "bg-blue-100 text-blue-800";
            case "Upcoming": return "bg-yellow-100 text-yellow-800";
            case "Completed": return "bg-purple-100 text-purple-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
       const getTeamLeadDisplay = (proj) => {
        if (!proj) return "N/A";
        if (Array.isArray(proj.teamLeadId) && proj.teamLeadId.length) return proj.teamLeadId.join(', ');
        if (Array.isArray(proj.TeamLeadId) && proj.TeamLeadId.length) return proj.TeamLeadId.join(', ');
        if (proj.teamLeadId) return String(proj.teamLeadId);
        if (proj.TeamLeadId) return String(proj.TeamLeadId);
        if (proj.TeamLead) return String(proj.TeamLead);
        if (proj.Team_Lead) return String(proj.Team_Lead);
        return "N/A";
    };
    const handleProjectSubmissionSuccess = () => {
        setShowCreateForm(false);
        loadProjects(paginationInfo.pageNumber, paginationInfo.pageSize); 
    };
     const handleEditClick = (e, proj) => {
        e.stopPropagation();
        setShowCreateForm(true);
        setEditTarget(proj);
    };
   const deleteProjectById = async (proj) => {
    if (!proj) return alert('Select a project to delete.');
    const id = proj.projectId || proj.project_id;
    if (!id) return alert('Missing project id');
    if (!window.confirm(`Delete project ${id}? This cannot be undone.`)) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return alert('Missing auth token. Login required.');
    try {
      const resp = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const body = await resp.json().catch(() => null);
      if (!resp.ok) {
        if (resp.status === 500 && body?.error && /foreign key/i.test(body.error)) {
          return alert(`Delete failed: ${body.message || 'Project has related data.'}\nDelete related dependent resources first.`);
        }
        if (body?.validationErrors) {
          const ve = Object.entries(body.validationErrors).map(([k,v]) => `${k}: ${v}`).join('\n');
          return alert(`Delete failed: ${body.message || resp.statusText}\n${ve}`);
        }
        throw new Error(body?.message || resp.statusText || `Status ${resp.status}`);
      }
      // refresh list and clear selection
      setSelectedRow(null);
      loadProjects(paginationInfo.pageNumber, paginationInfo.pageSize);
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed: ' + (err.message || 'Unknown error'));
    }
  };
  const handleGlobalEdit = () => {
    if (!selectedRow) return alert('Select a project first (click the select icon on a row).');
    setEditTarget(selectedRow);
    setShowCreateForm(true);
  };
  const handleGlobalCreate = () => {
    setEditTarget(null);
    setShowCreateForm(true);
  };
  const handleGlobalDelete = () => deleteProjectById(selectedRow);
    const [editTarget, setEditTarget] = useState(null);
     const [selectedRow, setSelectedRow] = useState(null);
    const filteredProjects = projectTableData.filter(
        (proj) => statusFilter === "All" || proj.projectStatus === statusFilter
    );
     const handleSelectRow = (proj, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setSelectedRow(proj);
  };
   return (
        <motion.div  className={`p-6 rounded-2xl shadow-2xl border border-purple-500 relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-br from-purple-10 to-purple-50 '}`}>
            <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h2 className={`text-3xl font-extrabold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-800'}`}>  Project Overview</h2>
                <div className="flex items-center gap-2">
                  {(matchedArray || []).includes("CREATE_PROJECT") && (
                    <button title="Create Project" onClick={handleGlobalCreate} className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700" >
                      <FaPlus />
                    </button>
                  )}
                  {(matchedArray || []).includes("EDIT_PROJECT") && (<button title="Edit selected" onClick={handleGlobalEdit} disabled={!selectedRow} className={`p-2 rounded-md ${selectedRow ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
                    <FiEdit />
                  </button>
                  )}
                  {(matchedArray || []).includes("DELETE_PROJECT") && (<button title="Delete selected" onClick={handleGlobalDelete} disabled={!selectedRow} className={`p-2 rounded-md ${selectedRow ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
                    <FiDelete />
                  </button>
                  )}
                </div>
            </div>
            <div className="flex justify-between items-center mb-6">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`min-w-[150px] border-2 border-purple-400 font-medium rounded-xl px-4 py-2 text-sm shadow-inner transition ${theme === 'dark' ? 'bg-gray-700 text-purple-200 focus:border-purple-500' : 'bg-white text-purple-800 focus:border-purple-600'}`} >
                    <option value="All" className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>All Statuses</option>
                    <option value="In Progress" className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>InProgress</option>
                    <option value="Completed" className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>Completed</option>
                    <option value="Not Started" className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>NotStarted</option>
                </select>
                {loading && <p className={`text-base ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>Loading projects...</p>}
                {error && <p className="text-red-500 font-semibold text-base">Error: {error}</p>}
            </div>
            <div className="overflow-x-auto rounded-xl shadow-2xl">
                <table className={`min-w-full divide-y divide-gray-200 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
                    <thead className={`text-left uppercase tracking-wider text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-700 text-purple-300 border-b border-purple-500' : 'bg-purple-100 text-purple-800'}`}>
                        <tr>
                            <th className="py-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">Project</th>
                            <th className="py-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">Team Lead</th>
                            <th className="py-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap"><FaCalendarAlt className="inline mr-1" />Start</th>
                            <th className="py-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap"><FaCalendarAlt className="inline mr-1" />End</th>
                            <th className="py-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">Priority</th>
                            <th className="py-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">Status</th>
                            <th className="py-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">Open/Closed</th>
                            <th className="py-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">Details</th>
                            
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-100 ${theme === 'dark' ? 'divide-gray-600' : 'bg-white'}`}>
                        <AnimatePresence mode="wait">
                            {filteredProjects.length > 0 ? (
                                filteredProjects
                                .map((proj, index) => 
                                    <motion.tr key={proj.projectId || proj.project_id} className={`border-t border-gray-100 ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-800 hover:bg-purple-50'} cursor-pointer transition duration-150`} onClick={() => handleRowClick(proj)} >
                                        <td className="py-3 px-4 text-sm font-bold max-w-[200px] whitespace-normal">{(matchedArray || []).includes("SELECT_ROW") && (<button onClick={(e)=>handleSelectRow(proj,e)} className={`mr-2 px-2 py-1 rounded ${selectedRow===proj ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>  {selectedRow===proj ? 'Selected' : 'Select'}</button>  )}{proj.title || proj.project_name}</td>
                                        <td className="py-3 px-4 text-sm max-w-[150px] font-medium text-gray-600 whitespace-normal">  {getTeamLeadDisplay(proj)}</td>
                                        <td className="py-3 px-4 text-xs sm:text-sm whitespace-nowrap">{proj.startDate}</td>
                                        <td className="py-3 px-4 text-xs sm:text-sm whitespace-nowrap">{proj.endDate}</td>
                                        <td onClick={e => { e.stopPropagation()}} className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${getPriorityColor(proj.projectPriority || proj.Priority)}`}>  {proj.projectPriority || proj.Priority}</span></td>
                                        <td onClick={e => { e.stopPropagation()}} className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(proj.projectStatus || proj.status)}`}>  {proj.projectStatus || proj.status}</span></td>
                                        <td onClick={e => { e.stopPropagation()}} className="py-3 px-4 text-sm whitespace-nowrap"><span className="text-blue-600 font-semibold">{proj.openTask || proj.Open_task || 0}</span> / <span className="text-gray-500">{proj.closedTask || proj.Closed_task || 0}</span></td>
                                        <td onClick={e => { e.stopPropagation()}} className="py-3 px-4 text-center"><a href={proj.details || proj.Details} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}><motion.div whileHover={{ scale: 1.2 }}>  <FaFileAlt className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} text-lg transition`} /></motion.div></a></td>
                                    </motion.tr>
                                )
                            ) : (
                                <tr><td colSpan="8" className={`p-10 text-center text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{loading ? 'Fetching data...' : 'No projects found matching the filter.'}</td></tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
            <div className={`flex flex-col sm:flex-row justify-between items-center mt-6 p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-200 text-gray-700'} shadow-md`}>
                <span className="text-sm mb-2 sm:mb-0"> Showing {projectTableData.length} projects out of {paginationInfo.totalElements} total </span>
                <div className="flex space-x-2">
                    <button onClick={() => handlePageChange(paginationInfo.pageNumber - 1)} disabled={paginationInfo.pageNumber === 0} className="px-3 py-1 rounded-lg text-sm bg-purple-200 text-purple-800 hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition" >     &larr; Previous </button>
                    <span className="px-3 py-1 rounded-lg text-sm bg-purple-600 text-white font-bold">{paginationInfo.pageNumber + 1} / {paginationInfo.totalPages}</span>
                    <button onClick={() => handlePageChange(paginationInfo.pageNumber + 1)} disabled={paginationInfo.pageNumber >= paginationInfo.totalPages - 1} className="px-3 py-1 rounded-lg text-sm bg-purple-200 text-purple-800 hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition" >     Next &rarr; </button>
                </div>
            </div>
            <AnimatePresence>
                {showCreateForm && (
                  <ProjectForm
                    onClose={() => { setShowCreateForm(false); setEditTarget(null); }}
                    editProject={editTarget}
                    onSuccess={() => { setShowCreateForm(false); setEditTarget(null); loadProjects(paginationInfo.pageNumber, paginationInfo.pageSize); }}
                  />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
const ProjectDashboard = () => {
    const {theme } = useContext(Context);
    return (
        <div className={`min-h-screen bg-gray-50 p-4 sm:p-8 ${theme==="dark"?"bg-gray-900":"bg-gray-50 "}`}>
            <div className="mb-8">
                <ProjectCard />
            </div>
            <div>
                <Project />
            </div>
        </div>
    );
};

export default ProjectDashboard;