import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CircleUserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FaCalendarAlt, FaTrashAlt, FaFileAlt, FaPlus, FaPaperclip, FaUsers, FaRegFolderOpen } from 'react-icons/fa';
import axios from 'axios';
import { Context } from '../HrmsContext';
import classNames from 'classnames';
import { FiDelete, FiEdit } from "react-icons/fi";
import { authApi } from '../../../../axiosInstance';
// -------- Add ProjectOverviewForm component (Create / Update) ----------
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className={`w-full max-w-lg p-6 rounded-xl shadow-xl ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-gray-900'}`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{mode === 'create' ? 'Create Project Overview' : 'Update Project Overview'}</h3>
          <button type="button" onClick={onClose} className="text-gray-500">×</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Timeline Progress</label>
            <input className="w-full p-2 border rounded" value={form.timeline_progress} onChange={handleChange('timeline_progress')} />
          </div>
          <div>
            <label className="text-sm">Client</label>
            <input className="w-full p-2 border rounded" value={form.client} onChange={handleChange('client')} />
          </div>
          <div>
            <label className="text-sm">Total Cost</label>
            <input className="w-full p-2 border rounded" value={form.total_cost} onChange={handleChange('total_cost')} />
          </div>
          <div>
            <label className="text-sm">Days to Work</label>
            <input className="w-full p-2 border rounded" value={form.days_to_work} onChange={handleChange('days_to_work')} />
          </div>
          <div>
            <label className="text-sm">Priority</label>
            <input className="w-full p-2 border rounded" value={form.priority} onChange={handleChange('priority')} />
          </div>
          <div>
            <label className="text-sm">Due Alert (days)</label>
            <input type="number" className="w-full p-2 border rounded" value={form.dueAlert} onChange={handleChange('dueAlert')} />
          </div>
          <div>
            <label className="text-sm">Start Date</label>
            <input type="date" className="w-full p-2 border rounded" value={form.startedOn} onChange={handleChange('startedOn')} />
          </div>
          <div>
            <label className="text-sm">End Date</label>
            <input type="date" className="w-full p-2 border rounded" value={form.endDate} onChange={handleChange('endDate')} />
          </div>
          <div>
            <label className="text-sm">Manager Employee ID</label>
            <input className="w-full p-2 border rounded" value={form.manager_employeeId} onChange={handleChange('manager_employeeId')} />
          </div>
          <div>
            <label className="text-sm">Manager Name</label>
            <input className="w-full p-2 border rounded" value={form.manager_name} onChange={handleChange('manager_name')} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">
            {submitting ? 'Saving...' : (mode === 'create' ? 'Create' : 'Update')}
          </button>
        </div>
      </form>
    </div>
  );
};
const APIBASE_URL = 'https://hrms.anasolconsultancyservices.com/api/employee/overview/';
// Helper to persist access token (accepts "Bearer xxx" or "xxx")
const storeAccessToken = (rawTokenOrHeader) => {
    if (!rawTokenOrHeader) return;
    const token = String(rawTokenOrHeader).startsWith('Bearer ')
        ? String(rawTokenOrHeader).split(' ')[1]
        : String(rawTokenOrHeader);
    try { localStorage.setItem('accessToken', token); } catch (e) { /* ignore */ }
};
 // ...existing code...
 const ProjectDetails = () => {
    const { projectId: paramProjectId } = useParams(); // read from URL if present
    const [projectId, setProjectId] = useState(() => paramProjectId || localStorage.getItem('selectedProjectId') || '');
    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {theme} = useContext(Context);
     const [showUpdateOverview, setShowUpdateOverview] = useState(false);

    
    // keep localStorage in sync with route-driven selection
    useEffect(() => {
        if (paramProjectId && paramProjectId !== projectId) {
            setProjectId(paramProjectId);
            try { localStorage.setItem('selectedProjectId', paramProjectId); } catch {}
        }
    }, [paramProjectId]);

    useEffect(() => {
       const fetchProjectData = async () => {
           setLoading(true);
           setError(null);

           // ensure we have a projectId to fetch
           if (!projectId) {
               setError('No project selected. Select a project to view details.');
               setLoading(false);
               setProjectData(null);
               return;
           }

           const url = `${APIBASE_URL}${encodeURIComponent(projectId)}`;

           // Use stored access token (set by your authentication flow)
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

               // If backend returned a refreshed token in headers, persist it
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
               // persist token if returned in body
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
    }, [projectId]);  // Dependency array includes PROJECT_ID
    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <p className="text-xl text-blue-600">Loading project details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded m-6" role="alert">
                <p className="font-bold">Error!</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }
    
    if (!projectData) {
        return (
            <div className="flex justify-center items-center h-40">
                <p className="text-xl text-gray-500">No project data found.</p>
            </div>
        );
    }

    // --- Project Details Display (Styled with Tailwind CSS) ---
    return (
        <div className="p-2 space-y-4">
            <div className="flex items-end justify-end border-b pb-2 mb-2">
               <button title="Update Overview" onClick={() => setShowUpdateOverview(true)} className="p-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600">
                  <FiEdit />
                </button>
            </div>
            {/* General Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <InfoCard title="Client" value={projectData.client} />
                <InfoCard title="Total Cost" value={`$${projectData.total_cost || 'N/A'}`} />
                <InfoCard title="Timeline Progress" value={projectData.timeline_progress} />
                <InfoCard title="Priority" value={projectData.priority} />
            </div> 
             {showUpdateOverview && (
              <ProjectOverviewForm
                mode="update"
                projectId={projectId}
                initialData={projectData}
                onClose={() => setShowUpdateOverview(false)}
                onSuccess={(updated) => {  setProjectData(updated); }}
              />
            )}           
          {/* Modals: Create / Update Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard title="Start Date" value={projectData.startedOn ? new Date(projectData.startedOn).toLocaleDateString() : 'N/A'} />
                <InfoCard title="End Date" value={projectData.endDate ? new Date(projectData.endDate).toLocaleDateString() : 'N/A'} />
                <InfoCard title="Days to Work" value={projectData.days_to_work} />
            </div>

            {/* Manager Details */}
            {projectData.manager && (
                <div className={`p-1 rounded-lg border-l-4 border-blue-500 shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
                    <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} mb-1`}>Project Manager</h2>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="font-medium">Name:</span> {projectData.manager.name}
                    </p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="font-medium">Employee ID:</span> {projectData.manager.employeeId}
                    </p>
                </div>
            )}
            
            {/* Due Alert */}
            <div className="pt-2 border-t mt-2">
                <p className={`text-lg font-bold ${projectData.dueAlert > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Due Alert: {projectData.dueAlert} {projectData.dueAlert > 0 ? 'Days Overdue!' : 'No Alert'}
                </p>
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
const projects = [
    {
        name: "HRMS Project",
        description: " The HRMS Project is a comprehensive web-based solution designed to streamline and automate all core HR processes within an organization. It enhances operational efficiency by integrating modules like employee records, attendance tracking, leave management, payroll, and performance evaluations into one centralized system.",
        team: [
            { role: "Project Manager", avatars: [1] },
            { role: "Backend Developers", avatars: [4] },
            { role: "Frontend Developers", avatars: [3] },
            { role: "QA Engineers", avatars: [2] },
            { role: "UX/UI Designer", avatars: [1] },
        ],
        duration: "12 months",
        modules: ["Payroll", "Attendance Tracking", "Leave Management"],
        status: "On Track",
        kpis: {
            "Sprints Completed": "5/10",
            "Bugs Critical": "2",
            "Code Coverage": "85%"
        },
        managerContact: { email: "ramesh@abc.com", phone: "+919876543210" }
    },
    {
        name: "Employee Self-Service App",
        description:  "The Employee Self-Service App is a user-friendly platform that empowers employees to independently manage their personal, professional, and administrative tasks. It reduces HR workload by allowing employees to access and update their records, apply for leaves, view payslips, and track attendance—all from a mobile or web interface.",
        team: [ { role: "Product Owner", avatars: [1] }, { role: "Mobile Developers", avatars: [2] }, { role: "Web Developer", avatars: [3] }, { role: "QA Tester", avatars: [1] },],
        duration: "6 months",
        modules: ["Payslip Access", "Leave Application", "Attendance View"],
        status: "At Risk", // ⭐ NEW
        kpis: {
            "Sprints Completed": "2/6",
            "Mobile App Rating": "3.5/5",
            "User Adoption": "40%"
        },
        managerContact: { email: "po@abc.com", phone: "+919999999999" }
    },
    {
        name: "Payroll Automation",
        description:  "Payroll Automation",
        description: "The Payroll Automation system is designed to streamline and automate the entire payroll process, ensuring accurate, timely, and compliant salary disbursements. It eliminates manual calculations and reduces errors by integrating attendance, leaves, tax regulations, and employee benefits into a seamless payroll workflow",
        team: [{ role: "Lead Developer", avatars: [1] }, { role: "Backend Developers", avatars: [3] }, { role: "QA Engineer", avatars: [1] }, { role: "Business Analyst", avatars: [1] },
],
        duration: "9 months",
        modules: ["Tax Compliance", "Benefit Integration", "Automated Disbursement"],
        status: "Completed", // ⭐ NEW
        kpis: {
            "Time Saved (Hrs/Month)": "80",
            "Error Rate": "0.1%",
            "Compliance Score": "99%"
        },
        managerContact: { email: "leaddev@abc.com", phone: "+918888888888" }
    },
    {
        name: "Attendance System Upgrade",
        description:"Attendance System Upgrade",
        description: "The Attendance System Upgrade modernizes and enhances the organization’s time-tracking infrastructure. It introduces advanced features like biometric integration, real-time monitoring, geo-tagging, and seamless syncing with payroll and HR modules—ensuring higher accuracy, reduced time theft, and improved workforce accountability.",
        team: [  { role: "System Architect", avatars: [1] }, { role: "Software Engineers", avatars: [2] }, { role: "Hardware Integration Specialist", avatars: [1] }, { role: "QA Tester", avatars: [1] }, ],
        duration: "7 months",
        modules: ["Biometric", "Geo-Tagging", "Real-time Monitoring"],
        status: "On Track",
        kpis: {
            "Biometric Failure Rate": "1%",
            "Integration Progress": "70%",
            "Devices Deployed": "150"
        },
        managerContact: { email: "arch@abc.com", phone: "+917777777777" }
    },
    {
        name: "AI-Based Recruitment Tool",
        description: " The AI-Based Recruitment Tool is an intelligent hiring platform that leverages machine learning and natural language processing to automate and optimize the recruitment lifecycle. From resume screening to candidate ranking and interview scheduling, it reduces time-to-hire, eliminates bias, and enhances talent acquisition efficiency.",
        team: [ { role: "AI/ML Engineer", avatars: [1] },{ role: "Data Scientists", avatars: [1] },{ role: "Full-stack Developers", avatars: [1] },{ role: "UX Designer", avatars: [1] },],
        duration: "10 months",
        modules: ["Resume Screening", "Candidate Ranking", "Interview Scheduling"],
        status: "At Risk",
        kpis: {
            "Time-to-Hire Reduction": "15%",
            "Bias Score": "Low",
            "Algorithm Accuracy": "75%"
        },
        managerContact: { email: "aieng@abc.com", phone: "+916666666666" }
    },
    {
        name: "Internal Chatbot System",
        description:  "The Internal Chatbot System is an AI-driven virtual assistant designed to support employees with instant responses to HR, IT, and general organizational queries. Integrated within the company’s intranet or collaboration tools, it enhances internal communication, reduces manual support workload, and provides 24/7 self-service access to information.",
        team: [  { role: "AI Chatbot Developer", avatars: [1] },{ role: "Content Specialist", avatars: [1] },{ role: "Integration Engineer", avatars: [1] },{ role: "QA Tester", avatars: [1] }, ],
        duration: "5 months",
        modules: ["24/7 Support", "IT Queries", "HR Policy Lookup"],
        status: "Completed",
        kpis: {
            "Resolution Rate": "90%",
            "User Satisfaction": "4.5/5",
            "Query Volume": "500/day"
        },
        managerContact: { email: "chatbotdev@abc.com", phone: "+915555555555" }
    }
];
const projectData = {
    projectDetails: {
      //client: "ABC Enterprises",
      //totalCost: "$1400",
      //DaysToWork: "120 days",
      //createdOn: "14 Nov 2024",
      //startedOn: "15 Jan 2025",
      //endDate: "15 Nov 2025",
      //dueAlert: 1,
      //Manager: {
      //  name: "Ramesh",
      //},
      //priority: "High",
    },
};
//const firstColumnData = { Manager: projectData.projectDetails.Manager };
//const secondColumnData = {
//    client: projectData.projectDetails.client,
//    totalCost: projectData.projectDetails.totalCost,
//    DaysToWork: projectData.projectDetails.DaysToWork,
//    priority: projectData.projectDetails.priority,    
// startedOn: projectData.projectDetails.startedOn,
//    endDate: projectData.projectDetails.endDate
//}
const projectIconMap = {    "HRMS Project": { icon: "👥", color: "text-indigo-500" },
    "Employee Self-Service App": { icon: "📱", color: "text-green-500" },
    "Payroll Automation": { icon: "💰", color: "text-yellow-500" },
    "Attendance System Upgrade": { icon: "🕒", color: "text-blue-500" },
    "AI-Based Recruitment Tool": { icon: "🤖", color: "text-pink-500" },
    "Internal Chatbot System": { icon: "💬", color: "text-teal-500" },
};
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
    const {theme} = useContext(Context);
    const motion = {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
    };

    const [currentIndex, setCurrentIndex] = useState(0);
    const currentProject = projects[currentIndex]
    const { icon, color } = projectIconMap[currentProject.name] || { icon: null, color: "" };
    const { projectId: paramProjectId } = useParams(); // read from URL if present
    const [projectId, setProjectId] = useState(() => paramProjectId || localStorage.getItem('selectedProjectId') || '');

    // local state renamed to avoid shadowing module-scope `projectData`
    const [localProjectData, setLocalProjectData] = useState(null);
    const [showCreateOverview, setShowCreateOverview] = useState(false);
    const [overviewSubmitting, setOverviewSubmitting] = useState(false);

    // compute progress using the fetched localProjectData (fallback to module-level `projectData` if needed)
    const progressSource = localProjectData || projectData;
    const progressPercent = calculateProgress(progressSource?.projectDetails?.startedOn, progressSource?.projectDetails?.endDate);

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
    const goToNextProject = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);

    };

    const goToPreviousProject = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length);
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
        <motion.div
            className={`relative p-6 rounded-xl shadow-2xl mx-auto border border-orange-400  ${theme==='dark' ? 'bg-gray-700':'bg-gradient-to-r from-orange-10 to-orange-50'}`}
            key={currentIndex}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <motion.span
                className={`absolute top-4 right-4 text-sm font-bold py-1 px-3 rounded-full shadow-md ring-2 ${getStatusClasses(currentProject.status)}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
            >
                {currentProject.status}
            </motion.span>
            <div className="flex items-center mb-6 flex-wrap">
                <motion.span
                    className={`text-5xl mr-4 ${color}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    {icon}
                </motion.span>
                <motion.h2
                    className={`text-3xl sm:text-4xl font-extrabold ${color} mt-2 sm:mt-0`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    {currentProject.name}
                </motion.h2>
            </div>
            <motion.p
                className={`text-base sm:text-lg mb-6 leading-relaxed ${theme==='dark' ? 'text-gray-200':'text-gray-700'}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                {currentProject.description}
            </motion.p>
            <motion.div
                className={`mb-6 p-3 rounded-lg border border-indigo-200 shadow-inner ${theme === 'dark' ? 'bg-gray-800' : 'bg-stone-100'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h4 className={`text-sm font-bold mb-3 uppercase ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-700'}`}>Key Modules</h4>
                <div className="flex flex-wrap gap-2">
                    {currentProject.modules && currentProject.modules.map((module, i) => (
                        <span
                            key={i}
                            className={`px-3 py-1 text-sm font-medium rounded-full shadow-sm ${theme === 'dark' ? 'text-teal-300 bg-teal-900' : 'text-indigo-800 bg-indigo-100'}`}
                        >
                            {module}
                        </span>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-2 ">
                <motion.div
                    className={`p-4 rounded-lg shadow-lg border border-gray-200 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gradient-to-br from-yellow-50 to-white'}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 text-yellow-600">Key Metrics (KPIs)</h2>
                    <dl className="space-y-3">
                        {Object.entries(currentProject.kpis).map(([key, value]) => (
                            <div key={key} className="flex justify-between border-b border-gray-100 pb-2">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{key}</dt>
                                <dd className="text-md font-semibold text-gray-500 dark:text-gray-400">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </motion.div>

                {/* Project Details / Progress Column (Combined from previous) */}
                <motion.div
                    className={`p-4 rounded-lg shadow-lg border border-gray-200 col-span-1 lg:col-span-2 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gradient-to-br from-blue-50 to-white'}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <div className="flex items-start justify-between border-b pb-2 mb-2">
              <h1 className={`text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Project Overview ({projectId})
              </h1>
              <div className="flex items-center gap-2">
                <button title="Create Overview" onClick={() => setShowCreateOverview(true)} className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700">
                  <FaPlus />
                </button>
                {/*<button title="Update Overview" onClick={() => setShowUpdateOverview(true)} className="p-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600">
                  <FiEdit />
                </button>*/}
                <button title="Delete Overview" onClick={handleDeleteOverview} disabled={overviewSubmitting} className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700">
                  <FiDelete />
                </button>
              </div>
            </div>
                    <ProjectDetails />
                    <AnimatePresence>
            {showCreateOverview && (
              <ProjectOverviewForm
                mode="create"
                projectId={projectId}
                initialData={{}}
                onClose={() => setShowCreateOverview(false)}
                onSuccess={(newData) => {  setLocalProjectData(newData); }}
              />
            )}
           
          </AnimatePresence>
                </motion.div>
                <motion.div
                    className={`p-4 rounded-lg shadow-lg border border-gray-100 col-span-1 lg:col-span-3 ${theme==='dark' ? 'bg-gray-800 text-white':'bg-gradient-to-br from-indigo-50 to-white'}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    whileHover={{ translateY: -3, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)" }}
                >
                    <h3 className={`text-xl sm:text-2xl font-bold mb-4 border-b pb-2 ${theme==='dark' ? 'text-white':'text-gray-800'}`}>Team Allocation</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                        {currentProject.team.map((teamMember, index) => (
                            <motion.div
                                key={index}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-md  dark:hover:bg-gray-200 transition border-l-4 border-indigo-400"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.7 + index * 0.05 }}
                            >
                                <p className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-1 sm:mb-0`}>
                                    {teamMember.role}
                                </p>
                                <div className="flex items-center">
                                    <span className="text-sm font-bold mr-3">{teamMember.avatars[0]}</span>
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {Array.from({ length: Math.min(teamMember.avatars[0], 4) }).map((_, avatarIndex) => (
                                            <img
                                                key={avatarIndex}
                                                className={`inline-block h-8 w-8 rounded-full ring-2 ${theme === 'dark' ? 'ring-gray-800' : 'ring-white'} object-cover`}
                                                src={getAvatarUrl(avatarIndex + 1 + index * 5)}
                                                alt={`Avatar ${avatarIndex + 1}`}
                                                title={`${teamMember.role} Member ${avatarIndex + 1}`}
                                            />
                                        ))}
                                        {teamMember.avatars[0] > 4 && (
                                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 text-xs font-medium text-gray-700 ring-2 ring-white dark:bg-gray-600 dark:text-white">
                                                +{teamMember.avatars[0] - 4}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 flex-wrap gap-4">
                <div className="relative inline-flex items-center justify-center gap-4 group">  
                <div
                    className="absolute inset-0 duration-1000 opacity-60 transitiona-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200"
                ></div>
                <a
                    role="button"
                    className="group relative inline-flex items-center justify-center text-base rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30"
                    title="Previous Project"
                    onClick={goToPreviousProject}
                    href="#"
                    >Previous <svg
                        aria-hidden="true"
                        viewBox="0 0 10 10"
                        height="10"
                        width="10"
                        fill="none"
                        className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2"
                    >
                        <path
                            d="M0 5h7"
                            className="transition opacity-0 group-hover:opacity-100"
                        ></path>
                        <path
                            d="M1 1l4 4-4 4"
                            className="transition group-hover:translate-x-[3px]"
                        ></path>
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
                        >Next <svg
                            aria-hidden="true"
                            viewBox="0 0 10 10"
                            height="10"
                            width="10"
                            fill="none"
                            className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2"
                        >
                            <path
                                d="M0 5h7"
                                className="transition opacity-0 group-hover:opacity-100"
                            ></path>
                            <path
                                d="M1 1l4 4-4 4"
                                className="transition group-hover:translate-x-[3px]"
                            ></path>
                        </svg>
                    </a>
                </div>
            </div>
        </motion.div>
    );
};
const FormInput = ({ label, theme, placeholder, type = 'text', ...props }) => {
    const inputClasses = theme === 'dark' 
        ? 'border-gray-600 bg-gray-700 text-white' 
        : 'border-gray-300 bg-white text-gray-800';

    return (
        <div className='relative mb-2'>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {label}
            </label>
            <input 
                type={type} 
                placeholder={placeholder} 
                {...props} 
                className={`w-full px-4 py-2 border rounded-lg transition duration-300 text-sm 
                    focus:ring-4 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-none 
                    ${inputClasses}`} 
            />
        </div>
    );
};
// --- MyTeam Data and Component ---
const MyTeam = () => {
    const { userData,theme } = useContext(Context);
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

    const initialEmployeeData = [
        { name: "Rajesh",   employee_id: "E_01", date: "2025-06-30",role:"Full stack Developer", login_time: "10:00 AM", logout_time: "07:00 PM" },
        { name: "Ramesh",   employee_id: "E_02", date: "2025-06-30",role:"Backend Developer", login_time: "10:00 AM", logout_time: "07:00 PM" },
        { name: "Ramya",  employee_id: "E_05", date: "2025-06-30",role:"Devops Engineer", login_time: null, logout_time: null },
        { name: "Swetha", employee_id: "E_07", date: "2025-06-30",role:"Tester", login_time: "10:00 AM", logout_time: "07:00 PM" },
        { name: "Rohit",    employee_id: "E_09", date: "2025-06-30",role:"Tester", login_time: null, logout_time: null },
        { name: "Deepika", employee_id: "E_11", date: "2025-06-30",role:"Designer", login_time: "10:00 AM", logout_time: "07:00 PM" },
    ];

    const [employeeData, setEmployeeData] = useState(initialEmployeeData);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", employee_id: "", date: "", role: "", login_time: "", logout_time: "" });
    const [editIndex, setEditIndex] = useState(null);

    const handleAddOrEdit = (e) => {
        e.preventDefault();
        if (editIndex !== null) {
            // Edit existing
            setEmployeeData(prev =>
                prev.map((emp, idx) => idx === editIndex ? formData : emp)
            );
        } else {
            // Add new
            setEmployeeData(prev => [...prev, formData]);
        }
        setShowForm(false);
        setFormData({ name: "", employee_id: "", date: "", role: "", login_time: "", logout_time: "" });
        setEditIndex(null);
    };

    const handleEdit = (idx) => {
        setFormData(employeeData[idx]);
        setEditIndex(idx);
        setShowForm(true);
    };

    const handleDelete = (idx) => {
        setEmployeeData(prev => prev.filter((_, i) => i !== idx));
    };

    return (
        <motion.div
            className={` shadow-xl rounded-lg p-6 border border-blue-500 h-full overflow-hidden ${theme==='dark' ? 'bg-gray-700':'bg-gradient-to-br from-blue-10 to-blue-50'}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold text-blue-800 ${theme==='dark' ? 'bg-gradient-to-br from-blue-100 to-blue-400 bg-clip-text text-transparent ':''}`}>
                    My Team</h2>
                {(matchedArray || []).includes("CREATE_PROJTEAM") && (
                    <motion.button
                        className={`flex items-center ${theme==='dark'?'bg-gray-500 text-blue-500':'bg-blue-50 text-blue-700'} border border-blue-500 font-bold py-2 px-4 rounded-xl shadow transition`}
                        onClick={() => { setShowForm(true); setFormData({ name: "", employee_id: "", date: "", role: "", login_time: "", logout_time: "" }); setEditIndex(null); }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                       <FaPlus className="mr-2" /> Add Team
                    </motion.button>
                )}
            </div>
            {/* Add/Edit Form */}
           <AnimatePresence>
    {showForm && (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Added backdrop click to close
            onClick={() => { setShowForm(false); setEditIndex(null); }} 
        >
            <motion.form
                // Reduced max-width for better focus
                className={`w-full max-w-xl rounded-3xl shadow-2xl relative ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                onSubmit={handleAddOrEdit}
                initial={{ scale: 0.8, y: -50 }} // Smoother animation
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: -50 }}
                transition={{ duration: 0.3 }}
                // Prevent modal closure when clicking inside
                onClick={(e) => e.stopPropagation()}
            > 
                {/* Professional Header */}
                <div className={`text-center rounded-t-3xl p-6 bg-gradient-to-r from-blue-600 to-indigo-700`}>
                    <h3 className="text-2xl font-extrabold text-white flex items-center justify-center space-x-3"> 
                        {/* Using a clear icon */}
                        <FaUsers className='w-6 h-6 text-white'/> 
                        <span>{editIndex !== null ? "Edit Team Member Details" : "Add New Team Member"}</span>
                    </h3> 
                    <p className="text-sm text-white/80 mt-1">Provide the necessary details for team management.</p>
                </div>

                <div className="space-y-6 p-8">
                    {/* Form Fields Grid - Cleaner gap and padding */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        
                        {/* 1. Name Input */}
                        <FormInput 
                            label="Employee Full Name"
                            theme={theme}
                            placeholder="e.g., John Doe" 
                            value={formData.name} 
                            onChange={e => setFormData({ ...formData, name: e.target.value })} 
                            required 
                            // Note: Removed the "Profile Image URL" text from the label for simplicity, as it's not a true file upload field.
                        />
                        
                        {/* 2. Employee ID */}
                        <FormInput 
                            label="Employee ID"
                            theme={theme}
                            placeholder="e.g., E_123" 
                            value={formData.employee_id} 
                            onChange={e => setFormData({ ...formData, employee_id: e.target.value })} 
                            required 
                        />
                        
                        {/* 3. Date */}
                        <FormInput 
                            label="Assignment Date"
                            theme={theme}
                            type="date" 
                            value={formData.date} 
                            onChange={e => setFormData({ ...formData, date: e.target.value })} 
                            required 
                        />
                        
                        {/* 4. Role */}
                        <FormInput 
                            label="Role/Designation"
                            theme={theme}
                            placeholder="e.g., Backend Developer" 
                            value={formData.role} 
                            onChange={e => setFormData({ ...formData, role: e.target.value })} 
                            required 
                        />

                        {/* 5. Login Time - Changed to type="time" for better UX */}
                        <FormInput 
                            label="Login Time"
                            theme={theme}
                            type="time" 
                            placeholder="HH:MM AM/PM" 
                            value={formData.login_time} 
                            onChange={e => setFormData({ ...formData, login_time: e.target.value })} 
                        />
                        
                        {/* 6. Logout Time - Changed to type="time" for better UX */}
                        <FormInput 
                            label="Logout Time"
                            theme={theme}
                            type="time" 
                            placeholder="HH:MM AM/PM" 
                            value={formData.logout_time} 
                            onChange={e => setFormData({ ...formData, logout_time: e.target.value })} 
                        />
                    </div>
                    
                    {/* Action Buttons - Professional Footer Style */}
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700 -mx-8 px-8">
                        <motion.button 
                            type="button" 
                            className="px-5 py-2.5 rounded-lg border text-sm font-semibold shadow-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600" 
                            onClick={() => { setShowForm(false); setEditIndex(null); }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancel
                        </motion.button>
                        <motion.button 
                            type="submit" 
                            className="px-5 py-2.5 rounded-lg border border-transparent bg-blue-600 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {editIndex !== null ? "Update Details" : "Add Team Member"}
                        </motion.button>
                    </div>
                </div>
            </motion.form>
        </motion.div>
    )}
</AnimatePresence>
            <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full ">
                    <thead className={`w-full ${theme==='dark' ? 'bg-gray-500 text-white':'bg-blue-50 text-blue-800'}`}>
                        <tr> 
                            <th className={`px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Emp ID</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Name</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Date</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Role</th>
                            <th className={`px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Status</th>
                            {(matchedArray || []).includes("EDIT_PROJTEAM") && <th className={`px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Edit</th>}
                            {(matchedArray || []).includes("DELETE_PROJTEAM") && <th className={`px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Delete</th>}
                        </tr>
                    </thead>
                    <tbody  className="bg-white divide-y divide-gray-500">
                        <AnimatePresence mode ="wait">
                            {employeeData.map((emp, index) => {
                                const [maybeImage, ...nameParts] = emp.name.split(" ");
                                const hasImage = maybeImage.startsWith("http");
                                const imageUrl = hasImage ? maybeImage : "";
                                const name = hasImage ? nameParts.join(" ") : emp.name;
                                const status = emp.login_time
                                    ? { label: "Available", color: (`${theme==='dark'?'text-green-300':'text-green-600'}`) }
                                    : { label: "Absent", color: (`${theme==='dark'?'text-red-300':'text-red-600'}`) };
                                return (
                                    <motion.tr
                                        key={emp.employee_id}
                                        className=" border-t border-gray-200 hover:bg-gray-50 "
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                       
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm   ${theme==='dark' ? 'bg-gray-500 text-gray-200':'text-gray-900'}`}>{emp.employee_id}</td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm   ${theme==='dark' ? 'bg-gray-500 text-gray-200':'text-gray-900'}`}>{name}</td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm  ${theme==='dark' ?  'bg-gray-500 text-gray-200':' text-gray-900'}`}>{emp.date}</td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm   ${theme==='dark' ? 'bg-gray-500 text-gray-200':'text-gray-900'}`}>{emp.role}</td>
                                        <td className={`px-4 py-2 whitespace-nowrap text-sm  ${status.color} ${theme==='dark' ? 'bg-gray-500 ':''} `}>{status.label}</td>
                                       <td className={`px-4  py-2 whitespace-nowrap text-sm   ${theme==='dark' ? 'bg-gray-500 ':''}`}>
                                            
                                            {(matchedArray || []).includes("EDIT_PROJTEAM") && (
                                                <button className={ `${theme==='dark'?'text-indigo-200':'text-indigo-600'}  hover:text-indigo-800 font-bold`} onClick={() => handleEdit(index)}><FiEdit className='w-5 h-5'/></button>
                                            )}
                                        </td>
                                        <td className={`py-2 px-4  whitespace-nowrap ${theme==='dark' ? 'bg-gray-500 ':''}`}>
                                            {(matchedArray || []).includes("DELETE_PROJTEAM") && (
                                                <button className={`${theme==='dark'?'text-red-200':'text-red-600'} hover:text-red-800 font-bold`} onClick={() => handleDelete(index)}><FiDelete className='w-5 h-5'/></button>
                                            )}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};



// API Endpoint Base
const APIBASEURL = 'https://hrms.anasolconsultancyservices.com/api/employee'; 

// --- Data Fetching Logic (Updated) ---
const fetchProjectStatus = async (employeeId, page, size, token) => {
    if (!token) throw new Error("Authentication token missing.");
    if (!employeeId) throw new Error("Employee ID is missing.");
    
    // Construct the endpoint using URL parameters
    const url = `${APIBASEURL}/${page}/${size}/projectId/asc/all/projectStatus/${employeeId}`;
    
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
// --- ProjectStatus Data and Component ---
function ProjectStatus() {
    const { userData, theme } = useContext(Context);
    const employeeId = userData?.employeeId; // Assuming employeeId is present in userData
    const COLORS = ["#4f46e5", "#059669", "#f59e0b", "#10b981", "#ec4899", "#0ea5e9"];

    // State for Data Fetching and Pagination
    const [teamData, setTeamData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paginationInfo, setPaginationInfo] = useState({
        pageNumber: 1, // Start page from your endpoint URL
        pageSize: 10,  // Size from your endpoint URL
        totalElements: 0,
        totalPages: 1,
    });

    // --- Data Fetching Logic ---
    const loadProjectStatus = useCallback(async (page, size) => {
        setLoading(true);
        setError(null);
        const token = getAccessToken();
        
        if (!employeeId) {
            setError("Employee ID not available for fetching status.");
            setLoading(false);
            return;
        }

        try {
            const data = await fetchProjectStatus(employeeId, page, size, token);
            
            // Map the API data keys to the component's expected keys 
            // and convert status to percentage.
            const mappedData = data.content.map(item => ({
                Project_id: item.project_id,
                Project_name: item.project_name,
                // Convert 0.0 to 0 (or multiply by 100 for percentage)
                Status: Math.round(Number(item.status) * 100), 
                Duration: item.duration,
            }));
            
            setTeamData(mappedData);
            setPaginationInfo({
                pageNumber: data.pageNumber,
                pageSize: data.pageSize,
                totalElements: data.totalElements,
                totalPages: data.totalPages,
            });
        } catch (err) {
            console.error("Failed to load project status:", err);
            setError(err.message);
            setTeamData([]); // Clear data on error
        } finally {
            setLoading(false);
        }
    }, [employeeId]); // Dependency on employeeId

    // Load data effect
    useEffect(() => {
        // Use the API's starting page number (1 in your example URL)
        loadProjectStatus(paginationInfo.pageNumber, paginationInfo.pageSize);
    }, [loadProjectStatus, paginationInfo.pageNumber, paginationInfo.pageSize]);

    // Handle pagination change
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < paginationInfo.totalPages) {
            setPaginationInfo(prev => ({ ...prev, pageNumber: newPage }));
        }
    };

    // --- Component Rendering ---
    return (
        <motion.div
            className={`p-6 rounded-lg shadow-xl border border-green-500 h-full flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-br from-green-10 to-green-50'} `}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-800'}`}>Project Status Overview</h2>
            </div> 
            
            {loading && <p className="text-center py-4 text-green-500">Loading project status...</p>}
            {error && <p className="text-center py-4 text-red-500">Error: {error}</p>}
            
            {/* Table container with responsive overflow and fixed height */}
            <div className="overflow-x-auto overflow-y-auto rounded-xl flex-grow">
                <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-600 bg-gray-700' : 'divide-gray-200 bg-white'}`}>
                    <thead className="sticky top-0 z-10"> {/* Sticky header for scrollable table */}
                        <tr className={`text-left w-full text-xs sm:text-sm uppercase tracking-wider ${theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-green-100 text-green-800'}`}>
                            <th className="py-2 px-4 font-semibold whitespace-nowrap">Project ID</th>
                            <th className="py-2 px-4 font-semibold whitespace-nowrap">Project Name</th>
                            <th className="py-2 px-4 font-semibold whitespace-nowrap">Duration</th>
                            <th className="py-2 px-4 font-semibold whitespace-nowrap">Status</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-600' : 'divide-gray-100'}`}>
                        <AnimatePresence mode="wait">
                            {teamData.length > 0 ? (
                                teamData.map((project, index) => (
                                    <motion.tr
                                        key={project.Project_id}
                                        className={`${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-green-50/50'} transition duration-150`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <td className={`py-2 px-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{project.Project_id}</td>
                                        <td className={`py-2 px-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{project.Project_name}</td>
                                        <td className={`py-2 px-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{project.Duration}</td>
                                        <td className={`py-2 px-4 whitespace-nowrap w-40 flex items-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>
                                            <ResponsiveContainer width="75%" height={25}>
                                                <BarChart
                                                    layout="vertical"
                                                    data={[{ name: project.Project_name, value: project.Status }]}
                                                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                                                >
                                                    <XAxis type="number" domain={[0, 100]} hide />
                                                    <YAxis type="category" dataKey="name" hide />
                                                    {/* Tooltip is helpful but may look messy in a tight table. */}
                                                    {/* <Tooltip formatter={(value) => `${value}%`} /> */}
                                                    <Bar dataKey="value" radius={[5, 5, 5, 5]} fill={COLORS[index % COLORS.length]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                            <span className="text-xs ml-2 font-semibold min-w-[30px]">{project.Status}%</span>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className={`text-center py-6 text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        No project statuses available.
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
            {paginationInfo.totalElements > 0 && (
                <div className={`flex justify-between items-center mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-200 text-gray-700'} shadow-inner`}>
                    <span className="text-sm">
                        Showing {teamData.length} of {paginationInfo.totalElements} projects
                    </span>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(paginationInfo.pageNumber - 1)}
                            disabled={paginationInfo.pageNumber === 1 || paginationInfo.first} // Page 1 is the starting point
                            className="px-3 py-1 rounded-lg text-sm bg-green-200 text-green-800 hover:bg-green-300 disabled:opacity-50 transition"
                        >
                            &larr; Prev
                        </button>
                        <span className="px-3 py-1 rounded-lg text-sm bg-green-600 text-white font-bold">
                            Page {paginationInfo.pageNumber} of {paginationInfo.totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(paginationInfo.pageNumber + 1)}
                            disabled={paginationInfo.pageNumber >= paginationInfo.totalPages || paginationInfo.last}
                            className="px-3 py-1 rounded-lg text-sm bg-green-200 text-green-800 hover:bg-green-300 disabled:opacity-50 transition"
                        >
                            Next &rarr;
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
const API_ENDPOINT = 'https://hrms.anasolconsultancyservices.com/api/employee/project';

const ProjectForm = ({ onClose, editProject = null }) => {
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
   const [fileAttachment, setFileAttachment] = useState(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submissionMessage, setSubmissionMessage] = useState('');
 
  // when editing, prefill form
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
    // clear previously attached file preview when editing
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
     // append as JSON string under expected key
     fd.append('projectDTO', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
     if (fileAttachment) fd.append('details', fileAttachment, fileAttachment.name);
 
     const token = localStorage.getItem('accessToken');
     if (!token) {
       setSubmissionMessage('❌ Authentication token missing. Please login.');
       setIsSubmitting(false);
       return;
     }
 
     try {
      // If editProject present => update with PUT to /project/{projectId}
      const url = editProject && (editProject.projectId || editProject.project_id)
        ? `${API_ENDPOINT}/${editProject.projectId || editProject.project_id}`
        : API_ENDPOINT;
      const method = editProject ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
       if (!res.ok) {
         let errText = res.statusText;
         try { const j = await res.json(); errText = j.message || errText; } catch {}
         setSubmissionMessage(`❌ Submission failed (${res.status}): ${errText}`);
       } else {

        setSubmissionMessage(editProject ? '✅ Project updated successfully!' : '✅ Project created successfully!');
         setFormData({
           title: '', description: '', projectPriority: 'Medium', projectStatus: 'Not Started',
           startDate: '', endDate: '', openTask: 0, closedTask: 0, teamLeadId: [''],
         });
         setFileAttachment(null);
         setTimeout(onClose, 1200);
       }
     } catch (err) {
       console.error(err);
       setSubmissionMessage(`❌ An error occurred: ${err.message}`);
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150";
   const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.form
        onSubmit={submitProject}
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
      >
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
              <option>Not Started</option><option>On Going</option><option>Completed</option>
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
      </motion.form>
    </div>
  );
};

const getAccessToken = () => {

    return localStorage.getItem('accessToken'); 
}
const API_BASE_URL = 'https://hrms.anasolconsultancyservices.com/api/employee'; 

const fetchProjects = async (page, size, token) => {
    if (!token) throw new Error("Authentication token missing.");
    const url = `${API_BASE_URL}/${page}/${size}/projectId/asc/projects`;
    
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
// --- END MOCK API ---


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

    
    // State for Data Fetching and Pagination
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
    //useEffect(() => {
    //    const fetchedData = async () => {
    //        if (!LoggedUserRole) return;
    //        try {
    //            
    //            let response = await fetch(`${API_BASE_URL.replace('/api/employee', '/api')}/role-access/${LoggedUserRole}`).then(res => res.json()); // Adjust path as needed
    //            
    //            console.log("from Projects Role Access:", response);
    //            setLoggedPermissionData(response);
    //        } catch (err) {
    //            console.error("Error fetching role permissions:", err);
    //            // setError(err.message); // Set a general error state if needed
    //        }
    //    };
    //    fetchedData();
    //}, [LoggedUserRole]);
    //useEffect(() => {
    //    if (loggedPermissiondata && loggedPermissiondata.permissions) {
    //        setMatchedArray(loggedPermissiondata.permissions);
    //    }
    //}, [loggedPermissiondata]);
    const loadProjects = useCallback(async (page, size) => {
        setLoading(true);
        setError(null);
        const token = getAccessToken();
        
        try {
            const data = await fetchProjects(page, size, token);
            
            setProjectTableData(data.content);
            setPaginationInfo({
                pageNumber: data.pageNumber,
                pageSize: data.pageSize,
                totalElements: data.totalElements,
                totalPages: data.totalPages,
            });
        } catch (err) {
            console.error("Failed to load projects:", err);
            setError(err.message);
            setProjectTableData([]); // Clear data on error
        } finally {
            setLoading(false);
        }
    }, []);
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

    // delete project
    const handleDeleteClick = async (e, proj) => {
        e.stopPropagation();
        if (!proj) return;
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
            if (!resp.ok) {
                const body = await resp.json().catch(()=>null);
                throw new Error(body?.message || resp.statusText || 'Delete failed');
            }
            loadProjects(paginationInfo.pageNumber, paginationInfo.pageSize);
        } catch (err) {
            console.error('Delete failed', err);
            alert('Delete failed: ' + (err.message || 'Unknown error'));
        }
    };
    const [editTarget, setEditTarget] = useState(null);

    const filteredProjects = projectTableData.filter(
        (proj) => statusFilter === "All" || proj.projectStatus === statusFilter
    );
   return (
        <motion.div
            className={`p-6 rounded-2xl shadow-2xl border border-purple-500 relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-br from-purple-10 to-purple-50 '}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
        >
            <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h2 className={`text-3xl font-extrabold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-800'}`}>
                    Project Overview
                </h2>
                {(matchedArray || []).includes("CREATE_PROJECT") && (
                    <motion.button
                        className={`flex items-center text-sm sm:text-base ${theme === 'dark' ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-700 text-white hover:bg-purple-800'} font-bold py-2 px-4 rounded-xl shadow-md transition`}
                        onClick={() => setShowCreateForm(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaPlus className="mr-2" /> Create Project
                    </motion.button>
                )}
            </div>
            <div className="flex justify-between items-center mb-6">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`min-w-[150px] border-2 border-purple-400 font-medium rounded-xl px-4 py-2 text-sm shadow-inner transition ${theme === 'dark' ? 'bg-gray-700 text-purple-200 focus:border-purple-500' : 'bg-white text-purple-800 focus:border-purple-600'}`}
                >
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
                             {(matchedArray || []).includes("DELETE_PROJECT") && ( <th className="py-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap">Actions</th>)}
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-100 ${theme === 'dark' ? 'divide-gray-600' : 'bg-white'}`}>
                        <AnimatePresence mode="wait">
                            {filteredProjects.length > 0 ? (
                                filteredProjects
                                .map((proj, index) => (
                                    <motion.tr
                                        key={proj.projectId || proj.project_id}
                                        className={`border-t border-gray-100 ${theme === 'dark' ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-800 hover:bg-purple-50'} cursor-pointer transition duration-150`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.02 }}
                                        onClick={() => handleRowClick(proj)}
                                    >
                                        <td className="py-3 px-4 text-sm font-bold max-w-[200px] whitespace-normal"> {proj.title || proj.project_name}</td>

                                        <td className="py-3 px-4 text-sm max-w-[150px] font-medium text-gray-600 whitespace-normal">
                                            {getTeamLeadDisplay(proj)}
                                        </td>
                                        <td className="py-3 px-4 text-xs sm:text-sm whitespace-nowrap">{proj.startDate}</td>
                                        <td className="py-3 px-4 text-xs sm:text-sm whitespace-nowrap">{proj.endDate}</td>
                                        <td onClick={e => { e.stopPropagation()}} className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${getPriorityColor(proj.projectPriority || proj.Priority)}`}>
                                                {proj.projectPriority || proj.Priority}
                                            </span>
                                        </td>
                                        <td onClick={e => { e.stopPropagation()}} className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(proj.projectStatus || proj.status)}`}>
                                                {proj.projectStatus || proj.status}
                                            </span>
                                        </td>
                                        <td onClick={e => { e.stopPropagation()}} className="py-3 px-4 text-sm whitespace-nowrap">
                                            <span className="text-blue-600 font-semibold">{proj.openTask || proj.Open_task || 0}</span> / <span className="text-gray-500">{proj.closedTask || proj.Closed_task || 0}</span>
                                        </td>
                                        <td onClick={e => { e.stopPropagation()}} className="py-3 px-4 text-center">
                                            <a href={proj.details || proj.Details} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}>
                                                <motion.div whileHover={{ scale: 1.2 }}>
                                                    <FaFileAlt className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} text-lg transition`} />
                                                </motion.div>
                                            </a>
                                        </td>
                                         {(matchedArray || []).includes("DELETE_PROJECT") && (
                                        <td className="py-3 px-4 text-sm whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                            <button onClick={(e) => handleEditClick(e, proj)} className="mr-3 text-indigo-600 hover:text-indigo-800" title="Edit">
                                                <FiEdit />
                                            </button>
                                            <button onClick={(e) => handleDeleteClick(e, proj)} className="text-red-600 hover:text-red-800" title="Delete">
                                                <FiDelete />
                                            </button>
                                        </td>
                                        )}
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className={`p-10 text-center text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {loading ? 'Fetching data...' : 'No projects found matching the filter.'}
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
            <div className={`flex flex-col sm:flex-row justify-between items-center mt-6 p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-200 text-gray-700'} shadow-md`}>
                <span className="text-sm mb-2 sm:mb-0">
                    Showing {projectTableData.length} projects out of {paginationInfo.totalElements} total
                </span>
                <div className="flex space-x-2">
                    <button
                        onClick={() => handlePageChange(paginationInfo.pageNumber - 1)}
                        disabled={paginationInfo.pageNumber === 0}
                        className="px-3 py-1 rounded-lg text-sm bg-purple-200 text-purple-800 hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        &larr; Previous
                    </button>
                    <span className="px-3 py-1 rounded-lg text-sm bg-purple-600 text-white font-bold">
                        {paginationInfo.pageNumber + 1} / {paginationInfo.totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(paginationInfo.pageNumber + 1)}
                        disabled={paginationInfo.pageNumber >= paginationInfo.totalPages - 1}
                        className="px-3 py-1 rounded-lg text-sm bg-purple-200 text-purple-800 hover:bg-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Next &rarr;
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {showCreateForm && (
                    <ProjectForm
                        onClose={handleProjectSubmissionSuccess}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
// --- Combined HRMS Dashboard Component ---
const ProjectDashboard = () => {
    const { userData,theme } = useContext(Context);
    return (
        <div className={`min-h-screen bg-gray-50 p-4 sm:p-8 ${theme==="dark"?"bg-gray-900":"bg-gray-50 "}`}>
            {/* Project Profile Section */}
            <div className="mb-8">
                <ProjectCard />
            </div>

            {/* My Team and Project Status Section (Side-by-side on larger screens, stacked on small) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                    <MyTeam />
                </div>
                <div>
                    <ProjectStatus />
                </div>
            </div>

            {/* Project Table Section */}
            <div>
                <Project />
            </div>
        </div>
    );
};

export default ProjectDashboard;