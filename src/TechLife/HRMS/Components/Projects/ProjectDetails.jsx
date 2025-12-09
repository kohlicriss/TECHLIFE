import React, { useContext, useRef, useState, useEffect } from "react";
import { LuListCollapse } from "react-icons/lu";
import { FaRegFolderOpen } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaPhoneFlip } from "react-icons/fa6";
import { FaHome, FaUsers, FaTasks, FaChartBar } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { IoMdRefresh } from 'react-icons/io';
import { useLocation, useNavigate } from "react-router-dom";
import { Context } from "../HrmsContext";

const ProjectDetails = () => {
  const overviewRef = useRef(null);
  const teamRef = useRef(null);
  const Tasks = useRef(null);
  const reportsRef = useRef(null);
  const [open, setOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [departmentData, setDepartmentData] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState(null);

  useEffect(() => {
  if (selectedYear && selectedMonth) {
    fetchDepartmentProgress(selectedYear, selectedMonth);
  }
}, [selectedYear, selectedMonth]);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToSection = (ref) => {
try {
      if (!ref) return;
      // support both ref objects and element ids
      if (typeof ref === 'string') {
        const el = document.getElementById(ref);
        if (el) return el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (!ref.current) {
        // element not mounted yet
        return;
      }
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.warn('scrollToSection failed', err);
    }
  };
  const navigate = useNavigate();
  const location = useLocation();
  const project = location.state?.project;
  const { userData,theme } = useContext(Context);
  const [projectData, setProjectData] = useState(null);
  const [loadingProjectData, setLoadingProjectData] = useState(true);
  const [projectError, setProjectError] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [projectInfo, setProjectInfo] = useState({
    title: project?.title || '',
    projectId: project?.projectId || '',
    team: [],          
    teamLead: [],       
    projectManager: [],
    description: '',
    daysSpent: 0,
    totaldays: 0
  });

  const storeAccessToken = (raw) => {
  if (!raw) return;
  const token = String(raw).startsWith('Bearer ') ? String(raw).split(' ')[1] : String(raw);
  try { localStorage.setItem('accessToken', token); } catch (e) { /* ignore */ }
};

  const TEAM_PERF_BASE = 'https://hrms.anasolconsultancyservices.com/api/employee';
  const MEMBER_DETAILS_BASE = 'https://hrms.anasolconsultancyservices.com/api/employee';

   const loadTeamPerformance = async (pid) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return [];
      const url = `${TEAM_PERF_BASE}/${encodeURIComponent(pid)}/team-performance`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      const raw = await res.text().catch(() => '');
      let arr = [];
      try { arr = raw ? JSON.parse(raw) : []; } catch (e) { arr = []; }
      // debug log
      console.debug('loadTeamPerformance', { pid, url, status: res.status, bodySample: Array.isArray(arr) ? arr[0] : arr });
      if (!res.ok) return [];
      return Array.isArray(arr) ? arr.map(it => ({
        employeeId: it.employeeId || it.employee_id || it.id || null,
        name: it.employeeName || it.displayName || it.name || it.employeeId || '',
        percentageCompleted: typeof it.percentageCompleted === 'number' ? it.percentageCompleted : (it.percentageCompleted ?? 0),
        status: it.status || '',
        role: it.role || '',
        // try multiple possible image fields
        employeeImage: it.employeeImage || it.employeeImageUrl || it.image || it.avatar || it.picture || null,
        image: it.employeeImage || it.employeeImageUrl || it.image || it.avatar || it.picture || null
      })) : [];
    } catch (e) {
      console.error('loadTeamPerformance error', e);
      return [];
    }
  };
   const fetchMemberDetails = async (pid, empId) => {
    const token = localStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' };
    // try primary details endpoint (existing)
    const tryUrls = [
      `${MEMBER_DETAILS_BASE}/${encodeURIComponent(pid)}/team-performance/${encodeURIComponent(empId)}`,
      // fallback guesses
      `${MEMBER_DETAILS_BASE}/employee/${encodeURIComponent(empId)}`,
      `${MEMBER_DETAILS_BASE}/${encodeURIComponent(empId)}/profile`,
    ];
    for (const url of tryUrls) {
      try {
        const res = await fetch(url, { headers });
        const raw = await res.text().catch(() => '');
        let body = null;
        try { body = raw ? JSON.parse(raw) : null; } catch (e) { body = null; }
        console.debug('fetchMemberDetails try', { url, status: res.status, sample: body && (body.employeeId || body.id || body.employeeName) });
        if (!res.ok) continue;
        return {
          employeeId: body?.employeeId || body?.id || empId,
          name: body?.employeeName || body?.displayName || body?.name || empId,
          role: body?.role || body?.designation || '',
          email: body?.email || body?.emailAddress || '',
          contact: body?.contactNumber || body?.phone || '',
          description: body?.description || body?.bio || '',
          status: body?.status ?? null,
          // image candidates
          employeeImage: body?.employeeImage || body?.employeeImageUrl || body?.image || body?.avatar || body?.picture || null,
          image: body?.image || body?.employeeImage || body?.avatar || body?.picture || null
        };
      } catch (err) {
        console.warn('fetchMemberDetails attempt failed', url, err);
        continue;
      }
    }
    // final fallback: return minimal object
    return { employeeId: empId, name: empId, role: '', email: '', contact: '', description: '', status: null, employeeImage: null, image: null };
  };
  const handleSelectMember = async (member) => {
    setSelectedMember(null);
    const pid = project?.projectId || localStorage.getItem('selectedProjectId') || '';
    if (!member?.employeeId || !pid) {
      setSelectedMember(member);
      return;
    }
    try {
      const details = await fetchMemberDetails(pid, member.employeeId);
      setSelectedMember({ ...member, ...details });
    } catch (e) {
      console.error('handleSelectMember error', e);
      setSelectedMember(member);
    }
  };
useEffect(() => {
  let mounted = true;
  const pid = project?.projectId || localStorage.getItem('selectedProjectId') || '';
  if (!pid) {
    setProjectData(null);
    setLoadingProjectData(false);
    setProjectError('No project id available');
    return;
  }
  const token = localStorage.getItem('accessToken');
  if (!token) {
    setProjectError('Missing access token. Please login.');
    setLoadingProjectData(false);
    return;
  }
  const overviewUrl = `https://hrms.anasolconsultancyservices.com/api/employee/overview/${encodeURIComponent(pid)}`;
  const detailsByEmployeeUrl = userData?.employeeId
    ? `https://hrms.anasolconsultancyservices.com/api/employee/project/${encodeURIComponent(pid)}/employee/${encodeURIComponent(userData.employeeId)}/details`
    : null;
  const projectDetailsUrl = `https://hrms.anasolconsultancyservices.com/api/employee/${encodeURIComponent(pid)}/details`;

  (async () => {
    try {
      setLoadingProjectData(true);
      setProjectError(null);

      const requests = [
        fetch(overviewUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }),
        detailsByEmployeeUrl ? fetch(detailsByEmployeeUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        }) : Promise.resolve(null),
        fetch(projectDetailsUrl, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
      ];

      const [overviewSettled, employeeDetailsSettled, publicDetailsSettled] = await Promise.allSettled(requests);
      if (overviewSettled.status !== 'fulfilled' || !overviewSettled.value) {
        throw new Error('Failed to fetch project overview');
      }
      const overviewRes = overviewSettled.value;
      const overviewBody = await overviewRes.json().catch(() => null);
      if (!overviewRes.ok) throw new Error(overviewBody?.message || `Overview fetch failed: ${overviewRes.status}`);
      const authHeader = overviewRes.headers.get('authorization') || overviewRes.headers.get('Authorization');
      if (authHeader) storeAccessToken(authHeader);
      if (overviewBody?.accessToken || overviewBody?.token || overviewBody?.jwt) {
        storeAccessToken(overviewBody?.accessToken || overviewBody?.token || overviewBody?.jwt);
      }
      const normalizedBase = {
        projectDetails: {
          timeline_progress: overviewBody.timeline_progress ?? overviewBody.timelineProgress ?? '',
          client: overviewBody.client ?? '',
          total_cost: overviewBody.total_cost ?? overviewBody.totalCost ?? '',
          days_to_work: overviewBody.days_to_work ?? overviewBody.daysToWork ?? '',
          priority: overviewBody.priority ?? '',
          startedOn: overviewBody.startedOn ?? overviewBody.startDate ?? '',
          endDate: overviewBody.endDate ?? overviewBody.end_date ?? '',
          manager: overviewBody.manager ?? { employeeId: '', name: '' },
          dueAlert: typeof overviewBody.dueAlert !== 'undefined' ? overviewBody.dueAlert : (overviewBody.due_alert ?? 0),
        },
        tasksDetails: {
          tasksDone: overviewBody.tasksDone ?? overviewBody.tasksDetails?.tasksDone ?? 0,
          totalTasks: overviewBody.totalTasks ?? overviewBody.tasksDetails?.totalTasks ?? 0,
          percentageCompleted: overviewBody.percentageCompleted ?? overviewBody.tasksDetails?.percentageCompleted ?? 0,
        },
        raw: overviewBody,
      };
      if (employeeDetailsSettled && employeeDetailsSettled.status === 'fulfilled' && employeeDetailsSettled.value && employeeDetailsSettled.value.ok) {
        const ed = await employeeDetailsSettled.value.json().catch(() => null);
        if (ed) {
          normalizedBase.tasksDetails = {
            tasksDone: typeof ed.tasksDone === 'number' ? ed.tasksDone : normalizedBase.tasksDetails.tasksDone,
            totalTasks: typeof ed.totalTasks === 'number' ? ed.totalTasks : normalizedBase.tasksDetails.totalTasks,
            percentageCompleted: typeof ed.percentageCompleted === 'number' ? ed.percentageCompleted : normalizedBase.tasksDetails.percentageCompleted,
          };
        }
      }
      let mappedProjectInfo = {
        title: project?.title || overviewBody?.projectName || overviewBody?.title || '',
        projectId: pid,
        team: [], teamLead: [], projectManager: [], description: overviewBody?.description ?? '', daysSpent: 0, totaldays: 0
      };
      if (publicDetailsSettled && publicDetailsSettled.status === 'fulfilled' && publicDetailsSettled.value && publicDetailsSettled.value.ok) {
        const pd = await publicDetailsSettled.value.json().catch(() => null);
        if (pd) {
          mappedProjectInfo.title = pd.projectName ?? mappedProjectInfo.title;
          mappedProjectInfo.projectId = pd.projectId ?? mappedProjectInfo.projectId;
          mappedProjectInfo.description = pd.description ?? mappedProjectInfo.description;
          mappedProjectInfo.team = Array.isArray(pd.teamMembers) ? pd.teamMembers.map(m => ({
            name: m.displayName || m.employeeName || m.employeeId || 'N/A',
            role: m.role || '',
            employeeImage: m.employeeImage || m.employeeImageUrl || null,
            image: m.employeeImage || m.employeeImageUrl || null,
            employeeId: m.employeeId || null
          })) : [];
          mappedProjectInfo.teamLead = Array.isArray(pd.teamLeads) ? pd.teamLeads.map(t => ({
            name: t.displayName || t.employeeName || t.employeeId || 'N/A',
            employeeImage: t.employeeImage || t.employeeImageUrl || null,
            image: t.employeeImage || t.employeeImageUrl || null,
            employeeId: t.employeeId || null
          })) : [];
          if (pd.projectManager) {
            mappedProjectInfo.projectManager = [{
              name: pd.projectManager.displayName || pd.projectManager.employeeName || pd.projectManager.employeeId || 'N/A',
              role: pd.projectManager.role || '',
              employeeImage: pd.projectManager.employeeImage || pd.projectManager.employeeImageUrl || null,
              image: pd.projectManager.employeeImage || pd.projectManager.employeeImageUrl || null,
              employeeId: pd.projectManager.employeeId || null
            }];
           } else {
             mappedProjectInfo.projectManager = [];
           }
          mappedProjectInfo.daysSpent = typeof pd.daysSpent === 'number' ? pd.daysSpent : mappedProjectInfo.daysSpent;
          mappedProjectInfo.totaldays = typeof pd.totaldays === 'number' ? pd.totaldays : mappedProjectInfo.totaldays;
        }
      } else {
        const raw = overviewBody;
        if (raw) {
          if (raw.manager) {
            mappedProjectInfo.projectManager = [{
              name: raw.manager.name || raw.manager.employeeId || '',
              employeeId: raw.manager.employeeId || null,
              image: raw.manager.employeeImage || null
            }];
          }
          mappedProjectInfo.team = Array.isArray(raw.teamMembers) ? raw.teamMembers.map(m => ({
            name: m.displayName || m.name || m.employeeName || m.employeeId,
            role: m.role || '',
            employeeImage: m.employeeImage || m.employeeImageUrl || null,
            image: m.employeeImage || m.employeeImageUrl || null,
            employeeId: m.employeeId || null
          })) : mappedProjectInfo.team;
            mappedProjectInfo.teamLead = Array.isArray(raw.teamLeads) ? raw.teamLeads.map(t => ({
            name: t.displayName || t.name || t.employeeName || t.employeeId,
            employeeImage: t.employeeImage || t.employeeImageUrl || null,
            image: t.employeeImage || t.employeeImageUrl || null,
            employeeId: t.employeeId || null
          })) : mappedProjectInfo.teamLead;
        }
      }
     if (mounted) { 
        const team = await loadTeamPerformance(pid);
         mappedProjectInfo.team = team.length ? team : mappedProjectInfo.team;
        if (mappedProjectInfo.team && mappedProjectInfo.team.length) {
          const enrichedTeam = await Promise.all(mappedProjectInfo.team.map(async (m) => {
            try {
              // normalize id
              const empId = m.employeeId || m.employeeId === 0 ? m.employeeId : (m.id || null);
              // if already have image, keep it
              if (m.employeeImage || m.image) return { ...m, name: m.name || m.employeeName || m.displayName || m.employeeId };
              if (!empId) return m;
              const details = await fetchMemberDetails(pid, empId).catch(() => null);
              const image = m.employeeImage || m.image || details?.employeeImage || details?.image || details?.avatar || null;
              const placeholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || details?.name || empId)}&background=ddd&color=333&size=128`;
              return {
                ...m,
                employeeImage: image || placeholder,
                image: image || placeholder,
                name: m.name || details?.name || m.employeeId
              };
            } catch (e) {
              console.error('enrich team member error', e);
              return m;
            }
          }));
          mappedProjectInfo.team = enrichedTeam;
        }
        setProjectData(normalizedBase);
        setProjectInfo(mappedProjectInfo);
        if (team.length) {
          const first = team[0];
          const details = await fetchMemberDetails(pid, first.employeeId);
          setSelectedMember({ ...first, ...details });
        }
        await loadTasks(pid);
       }
       
    } catch (err) {
      if (mounted) setProjectError(err.message || 'Failed to load project details');
    } finally {
      if (mounted) setLoadingProjectData(false);
    }
  })();

  return () => { mounted = false; };
}, [project, userData]);
const textColor = theme==='dark' ? "#FFFFFF" : "#000000";
  const barColor = "#ADD8E6";
  //const getAvatarUrl = (index) => `https://i.pravatar.cc/40?img=${index + 1}`;
  const getStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'in progress':
      case 'inprogress':
      case 'in-progress':
        return 'bg-blue-200 text-blue-800';
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'not started':
      case 'notstarted':
        return 'bg-gray-200 text-gray-600';
      case 'onhold':
      case 'on hold':
        return 'bg-pink-200 text-pink-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  const ProgressColorsMap = { completed: 'bg-green-500', 'in-progress': 'bg-blue-500', updated: 'bg-indigo-500' };
  const [tasks, setTasks] = useState([]); 
  const [progress, setprogress] = useState([]);
   const [selectedTask, setSelectedTask] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
 const loadTasks = async (pid) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const url = `https://hrms.anasolconsultancyservices.com/api/employee/${encodeURIComponent(pid)}/tasks`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    if (!res.ok) {
      console.warn('Failed to load tasks', res.status);
      setTasks([]);
      return;
    }
    const body = await res.json().catch(() => []);
    const rawTasks = Array.isArray(body) ? body : (Array.isArray(body.tasks) ? body.tasks : []);
    const mapped = rawTasks.map((t, i) => ({
      id: t.id ?? t.taskId ?? i + 1,
      taskId: t.taskId || t.id || `TASK${String(i + 1).padStart(3, '0')}`, // Add taskId field
      title: t.title ?? `Task ${i + 1}`,
      status: t.status ?? 'Not Started',
      description: t.description ?? t.desc ?? '',
      statusColor: getStatusClass(t.status),
    }));
    setTasks(mapped);
    if (mapped.length) {
      setSelectedTask(mapped[0].id);
      const empId = userData?.employeeId || null;
      await loadTaskProgress(pid, empId, mapped[0].id, mapped[0].title);
    }
  } catch (err) {
    console.error('loadTasks error', err);
    setTasks([]);
  }
};
   const loadTaskProgress = async (pid, empId = null, taskId = null, taskTitle = null) => {
    setProgressLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setprogress([]);
        setProgressLoading(false);
        return [];
      }

      let url;
      if (taskId) {
        url = `https://hrms.anasolconsultancyservices.com/api/employee/${encodeURIComponent(pid)}/${encodeURIComponent(taskId)}/progress`;
        if (empId) url += `?employeeId=${encodeURIComponent(empId)}`;
      } else if (empId) {
        url = `https://hrms.anasolconsultancyservices.com/api/employee/project/${encodeURIComponent(pid)}/employee/${encodeURIComponent(empId)}/details`;
        if (taskTitle) url += `?taskTitle=${encodeURIComponent(taskTitle)}`;
      } else {
        url = `https://hrms.anasolconsultancyservices.com/api/employee/project/${encodeURIComponent(pid)}/details`;
        if (taskTitle) url += `?taskTitle=${encodeURIComponent(taskTitle)}`;
      }

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      if (!res.ok) {
        if (taskId && res.status === 404 && empId) {
          return await loadTaskProgress(pid, empId, null, taskTitle);
        }
        setprogress([]);
        setProgressLoading(false);
        return [];
      }
      const arr = await res.json().catch(() => []);
      const list = Array.isArray(arr) ? arr : [];
      const mapped = list.map((o, i) => ({
        id: i + 1,
        title: o.changes || o.note || 'Update',
        date: o.updatedDate || o.date || '',
        color: ProgressColorsMap[(String(o.changes || '').toLowerCase())] || 'bg-gray-300'
      }));
      setprogress(mapped);
      setProgressLoading(false);
      return mapped;
    } catch (err) {
      console.error('loadTaskProgress error', err);
      setprogress([]);
      setProgressLoading(false);
      return [];
    }
  };
 const handleSelectTask = async (task) => {
    const tid = task?.id ?? null;
    setSelectedTask(prev => (prev === tid ? null : tid));
    const pid = project?.projectId || localStorage.getItem('selectedProjectId') || '';
    const empId = userData?.employeeId || null;
    if (!pid) return;
    await loadTaskProgress(pid, empId, task?.id, task?.title || null);
  };
const fetchDepartmentProgress = async (year, month) => {
  setDepartmentLoading(true);
  setDepartmentError(null);
  
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setDepartmentError('Missing access token');
      return;
    }

    const url = `https://hrms.anasolconsultancyservices.com/api/employee/departments/progress?year=${year}&month=${month}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch department progress: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the API data to match chart format
    const chartData = Array.isArray(data) ? data.map(item => ({
      department: item.role || 'Unknown',
      progress: Math.round(item.progress * 100) || 0, // Convert to percentage if needed
    })) : [];

    // Update department data for the specific month
    setDepartmentData(prev => ({
      ...prev,
      [`${getMonthName(month)} ${year}`]: chartData
    }));

  } catch (error) {
    console.error('Error fetching department progress:', error);
    setDepartmentError(error.message);
  } finally {
    setDepartmentLoading(false);
  }
};

// Helper functions remain the same
const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'Invalid Month';
};

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    years.push(i);
  }
  return years;
};

const getMonthOptions = () => {
  return [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];
};

// Update the selectedMonth state initialization

 const COLOR=["purple"]
 // Default to the first month
  const displayProject = project || projectData?.raw || { title: "Loading project...", projectId: "" };
  const tasksDone = tasks.filter((task) => task.status === "Completed").length;
  const totalTasks = tasks.length;
  const mainContentPaddingClass = "pt-[160px] md:pt-[120px] "; 
  const IMAGE_BASE = 'https://hrms.anasolconsultancyservices.com'; // adjust if your images are served from different host
  const placeholderAvatar = (name = 'User') =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=DDDDDD&color=333333&size=256`;

  const resolveImageUrl = (img, name) => {
    if (!img) return placeholderAvatar(name || 'User');
    const s = String(img).trim();
    if (/^https?:\/\//i.test(s)) return s;
    if (/^\/\//.test(s)) return window.location.protocol + s;
    if (s.startsWith('/')) return `${IMAGE_BASE}${s}`;
    return `${IMAGE_BASE}/${s}`;
  };
  return (
    <div className={` ${theme==='dark'?'bg-gray-800':'bg-gray-50'}  min-h-screen relative font-sans`}>
       <div>
     <div className={`fixed top-16  z-50 p-4 md:p-3 lg:p-4 ${theme === 'dark' ? 'bg-gray-700 border-b border-gray-600' : 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200'} w-full rounded-b-xl shadow-xl flex items-center justify-between`}>
    <div className="flex items-center gap-4 sm:gap-6"> 
        <div className={`w-12 h-12 sm:w-14 sm:h-14 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg sm:rounded-2xl flex items-center justify-center shadow-md`}>
            <span className="text-2xl sm:text-3xl font-bold text-indigo-600"><FaRegFolderOpen /></span>
        </div>
        <div className="ml-0">
            <h1 className={`text-xl sm:text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{project.title}</h1>
            <p className={`text-xs sm:text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Project ID: {project.projectId}</p>
        </div>
    </div>
</div>
       <div className={`fixed top-[138px] md:hidden w-full px-4 py-3 border-b  z-40 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gradient-to-r from-indigo-50 to-indigo-100'}`}>
         <div className="flex justify-between items-center space-x-2">
          <button
            onClick={() => scrollToSection(overviewRef)}
            className={`flex flex-col items-center p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-100'} text-xs w-1/4 flex-shrink-0`}
          >
            
            <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-medium mt-1`}>Overview</span>
          </button>
          <button
            onClick={() => scrollToSection(teamRef)}
            className={`flex flex-col items-center p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-100'} text-xs w-1/4 flex-shrink-0`}
          >
            
            <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-medium mt-1`}>Team</span>
          </button>
          <button
            onClick={() => scrollToSection(Tasks)}
            className={`flex flex-col items-center p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-100'} text-xs w-1/4 flex-shrink-0`}
          >
            <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-medium mt-1`}>Tasks</span>
          </button>
          <button
            onClick={() => scrollToSection(reportsRef)}
            className={`flex flex-col items-center p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-100'} text-xs w-1/4 flex-shrink-0`}
          >
            
            <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-medium mt-1`}>Reports</span>
          </button>
        </div>
       </div>

       <div className={`fixed hidden md:block md:top-[158px] right-0 bottom-0 ${theme === 'dark' ? 'bg-gray-800 text-gray-200 ' : 'bg-stone-100 text-gray-800'} shadow-lg border-l transition-all duration-300 z-50 ${open ? "w-42" : "w-24"}`}>
         <button onClick={() => setOpen(!open)} className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-blue-300 border shadow items-center justify-center hidden md:flex">
          {open ? <FiChevronRight /> : <FiChevronLeft />}
         </button>
         <div className="mt-2 flex flex-col space-y-2 items-start">
          {/* Menu Items */}
          <button onClick={() => scrollToSection(overviewRef)} className={`flex items-start gap-1 px-3 py-2 rounded-xl ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-100'} w-full justify-center`}>
            <FaHome className={`text-xl w-6 h-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`} />
            {open && <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-medium`}>Overview</span>}
          </button>
          <button onClick={() => scrollToSection(teamRef)} className={`flex items-start gap-1 px-3 py-2 rounded-xl ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-100'} w-full justify-center`}>
            <FaUsers className={`text-xl w-6 h-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`} />
            {open && <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-medium`}>Team</span>}
          </button>
          <button onClick={() => scrollToSection(Tasks)} className={`flex items-start gap-1 px-3 py-2 rounded-xl ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-100'} w-full justify-center`}>
           <FaTasks className={`text-xl w-6 h-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`} />
           {open && <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-medium`}>Tasks</span>}
          </button>
          <button onClick={() => scrollToSection(reportsRef)} className={`flex items-start gap-1 px-3 py-2 rounded-xl ${theme === 'dark' ? 'hover:bg-blue-800' : 'hover:bg-blue-100'} w-full justify-center`}>
            <FaChartBar className={`text-xl w-6m h-6 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`} />
            {open && <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} font-medium`}>Reports</span>}
          </button>
         </div>
       </div>
   </div>
      <div className={`${mainContentPaddingClass} transition-all duration-300 ${open ? 'md:pr-48' : 'md:pr-16'}`}>
        <div className="p-3 md:p-5">
          <section ref={overviewRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2 scroll-mt-20 md:scroll-mt-12">
           <div className={`  ${theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-white text-gray-900 border border-gray-100'} rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 p-6 space-y-8 col-span-1 lg:col-span-2`}>
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
    <div>
      <h2 className={`text-3xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-extrabold tracking-tight`}>
        {project.title}
      </h2>
      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        Project ID: <span className="text-red-500 dark:text-red-400 font-bold ml-1">{project.projectId}</span>
      </p>
    </div>
  </div>
  <div>
    <h3 className={`text-lg font-bold mb-3 uppercase tracking-wider ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
      Team Members ({projectInfo.team.length})
    </h3>
<div className="flex flex-wrap gap-3">
      {projectInfo.team.map((member, index) => (
        <span
          key={index}
          className={` flex items-center gap-2 p-2 rounded-full cursor-pointer ${theme === 'dark'   ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'   : 'bg-blue-50 text-gray-800 hover:bg-blue-100' } transition duration-150 ease-in-out shadow-sm `} >
          <img
            src={member.employeeImage || member.image}
            alt={member.name || member.employeeId || 'member'}
            className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-800 object-cover flex-shrink-0"
          />
          <span className="text-sm font-semibold pr-2">{member.name}</span>
        </span>
      ))}
    </div>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
    <div className={`p-4 rounded-xl border border-gray-100  bg-gray-50 ${theme === 'dark' ? 'dark:bg-gray-700' : ''}`}>
      <h3 className={`text-md font-bold mb-3 uppercase tracking-wider ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
        Team Lead
      </h3>
      <div className="flex flex-wrap gap-3">
        {projectInfo.teamLead.map((lead, index) => (
          <span
            key={index}
            className={`flex items-center gap-3 p-2 rounded-lg ${theme === 'dark'  ? 'bg-gray-800 text-gray-100 hover:bg-gray-500'  : 'bg-white text-gray-800 border border-green-300 shadow-md hover:shadow-lg'}transition duration-150 ease-in-out`}>
            <img
              src={lead.image || lead.employeeImage}
              alt={lead.name || lead.employeeId || 'lead'}
              className="w-10 h-10 rounded-full border-2 border-green-500 object-cover flex-shrink-0"
            />
            <span className="text-base font-bold">{lead.name}</span>
          </span>
        ))}
      </div>
    </div>
    <div className={`p-4 rounded-xl border border-gray-100  bg-gray-50 ${theme === 'dark' ? 'dark:bg-gray-700' : ''}`}>
      <h3 className={`text-md font-bold mb-3 uppercase tracking-wider ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
        Project Manager
      </h3>
      <div className="flex flex-wrap gap-3">
        {projectInfo.projectManager.map((pm, index) => (
          <span
            key={index}
            className={` flex items-center gap-3 p-2 rounded-lg ${theme === 'dark'   ? 'bg-gray-800 text-gray-100 hover:bg-gray-500'   : 'bg-white text-gray-800 border border-yellow-300 shadow-md hover:shadow-lg' } transition duration-150 ease-in-out `} >
            <img
              src={pm.image || pm.employeeImage}
              alt={pm.name || pm.employeeId || 'manager'}
              className="w-10 h-10 rounded-full border-2 border-yellow-500 object-cover flex-shrink-0"
            />
            <span className="text-base font-bold">{pm.name}</span>
          </span>
        ))}
      </div>
    </div>
  </div>
  <div className="pt-4 border-t border-gray-100 ">
    <h3 className={`text-lg font-bold mb-3 uppercase tracking-wider ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>  Project Summary</h3>
    <div className={`p-4 rounded-xl border border-gray-100  bg-gray-50 ${theme === 'dark' ? 'dark:bg-gray-700' : ''}`}>
      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-base leading-relaxed`}>  {projectInfo.description}</p>
    </div>
  </div>
  </div>
            <div className="space-y-6 col-span-1">
             <div className={` ${theme==='dark'?'bg-gray-500 text-gray-200':'bg-gradient-to-r from-white to-blue-50 text-gray-800'} rounded-xl shadow-lg border border-gray-200 p-6`}>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Project Details</h2>
                {loadingProjectData ? (
                  <div className="py-6 text-center text-sm text-indigo-500">Loading project details...</div>
                ) : projectError ? (
                  <div className="py-6 text-center text-sm text-red-500">{projectError}</div>
               ) : projectData?.projectDetails ? (
                  <dl className="divide-y divide-gray-200">
                    {Object.entries(projectData.projectDetails).map(([key, value], index) => {
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      if (key === 'createdBy') {
                        return (
                          <div key={key} className="flex items-center justify-between py-3">
                            <dt className={`${theme==='dark'?'text-gray-200':'text-gray-500'}  text-base`}>Reported by</dt>
                            <dd className="text-right">
                              <span className="inline-flex items-center gap-2 justify-end">
                                {/*<img src={getAvatarUrl(index)} alt={value?.name || value?.employeeId || 'user'} className="w-8 h-8 rounded-full" />*/}
                                <span className={`${theme==='dark'?'text-gray-200':'text-gray-900'} font-medium`}>{value?.name || value?.employeeId || 'N/A'}</span>
                              </span>
                            </dd>
                          </div>
                        );
                      }
                      if (key === 'dueAlert') return null;
                      const renderValue = (() => {
                        if (value == null) return 'N/A';
                        if (Array.isArray(value)) return value.join(', ');
                        if (typeof value === 'object') {
                          if (value.name) return value.name;
                          if (value.employeeId) return value.employeeId;
                          try { return JSON.stringify(value); } catch { return 'Object'; }
                        }
                        return value;
                      })();
                      return (
                        <div key={key} className="flex items-center justify-between py-3">
                          <dt className={`${theme==='dark'?'text-gray-200':'text-gray-500'}  text-base`}>{label}</dt>
                          <dd className={`text-right ${theme==='dark'?'text-gray-200':'text-gray-900'} font-medium`}>
                            {key === 'dueDate' ? (
                              <span className="inline-flex items-center gap-2">
                                {renderValue}
                                {projectData.projectDetails?.dueAlert > 0 && (
                                  <span className="inline-flex items-center justify-center text-xs font-semibold text-white bg-red-500 rounded-md px-2 py-0.5">
                                    {projectData.projectDetails.dueAlert}
                                  </span>
                                )}
                              </span>
                            ) : (
                              renderValue
                            )}
                          </dd>
                        </div>
                      );
                    })}
                 </dl>
                ) : (
                  <div className="py-6 text-center text-sm text-gray-500">No project details available.</div>
                )}
              </div>
              <div className={`${theme==='dark'?'bg-gray-500 text-gray-200':'bg-gradient-to-r from-white to-blue-50 text-gray-800'} rounded-xl shadow-lg border border-gray-200 p-6 h-auto`}>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Tasks Details</h2>
                {loadingProjectData ? (
                  <div className="py-6 text-center text-sm text-indigo-500">Loading task summary...</div>
                ) : projectError ? (
                  <div className="py-6 text-center text-sm text-red-500">{projectError}</div>
                ) : projectData?.tasksDetails ? (
                  <div>
                    <p className={`${theme==='dark'?'text-gray-200':'text-gray-500'} text-sm`}>Tasks Done</p>
                    <p className="text-3xl font-bold mt-1">
                      {projectData.tasksDetails.tasksDone} / {projectData.tasksDetails.totalTasks}
                    </p>
                    <div className={`mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden`}>
                      <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${projectData.tasksDetails.percentageCompleted}%` }}></div>
                    </div>
                    <p className={`text-sm ${theme==='dark'?'text-gray-200':'text-gray-600'} mt-2`}>{projectData.tasksDetails.percentageCompleted}% Completed</p>
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-gray-500">No task details available.</div>
                )}
              </div>
            </div>
          </section>
          <section ref={teamRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 scroll-mt-24">
            <div className={`${theme==='dark'?'bg-gray-500 text-gray-200':'bg-gradient-to-r from-white to-blue-50 text-gray-800'} p-6 rounded-xl shadow-md`}>
              <h2 className="text-2xl font-bold mb-6">Team Members</h2>
              <div className="space-y-4">
                {projectInfo.team.map((member, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectMember(member)}
                    className={`cursor-pointer ${theme==='dark'?'bg-gray-800 text-gray-200':'bg-stone-100 text-gray-800  hover:bg-gray-50 '}  p-4 rounded-xl shadow-md flex items-center justify-between transition ${selectedMember === member ? 'border-2 border-indigo-500' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                        {/* show the current list member's image/name (not selectedMember) */}
                      <img
                        src={resolveImageUrl(member?.employeeImage || member?.image, member?.employeeName || member?.name)}
                        alt={member?.employeeName || member?.name || 'Member'}
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderAvatar(member?.employeeName || member?.name || 'User'); }}
                        className="w-20 h-20 rounded-full border-2 border-indigo-400 object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold">{member?.name || member?.employeeName || member?.employeeId}</h3>
                        <p className={`${theme==='dark'?'text-gray-200':'text-gray-500'} text-sm`}>{member?.role}</p>
                      </div>
                     </div>
                     <div className="flex items-center gap-6">
                       <div className="text-center">
                        <p className={`${theme==='dark'?'text-gray-200':'text-gray-500'}  text-xs`}>Performance %</p>
                        <p className={`font-semibold text-base ${member.percentageCompleted >= 75 ? "text-green-500" : member.percentageCompleted > 0 ? "text-yellow-500" : "text-gray-500"}`}>
                          {Math.round((member.percentageCompleted || 0))}%
                        </p>
                       </div>
                       <div className="text-center">
                        <p className={`${theme==='dark'?'text-gray-200':'text-gray-500'}  text-xs`}>Status</p>
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded-md border ${member.status ? 'border-green-500 text-green-600' : 'border-gray-300 text-gray-500'}`}>
                          {member.status || '0/0'}
                        </span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
             <div className={`${theme==='dark'?'bg-gray-500 text-gray-200':'bg-gradient-to-r from-white to-blue-50 text-gray-800'} p-6 rounded-xl shadow-md`}>
              <h2 className="text-2xl font-bold mb-6">Member Details</h2>
              {selectedMember ? (
                <div className={`${theme==='dark'?'bg-gray-800 text-gray-200':'bg-stone-100 text-gray-800'} p-6 rounded-xl space-y-4`}>
                  <div className="flex items-center gap-4">
                    <img
                      src={resolveImageUrl(selectedMember?.employeeImage || selectedMember?.image, selectedMember?.employeeName || selectedMember?.name)}
                      alt={selectedMember?.employeeName || selectedMember?.name || 'Member'}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderAvatar(selectedMember?.employeeName || selectedMember?.name || 'User'); }}
                      className="w-20 h-20 rounded-full border-2 border-indigo-400 object-cover"
                    />
                    <div>
                      <h3 className="text-2xl font-bold">{selectedMember?.employeeName || selectedMember?.name || selectedMember?.displayName || 'Member'}</h3>
                      <p className="text-indigo-600 font-medium">{selectedMember?.role || '-'}</p>
                    </div>
                  </div>
                  <div className={`space-y-2 ${theme==='dark'?'text-gray-200':'text-gray-700'}`}>
                    <p className="flex items-center gap-2 text-sm"><MdEmail /> {selectedMember?.email || '-'}</p>
                    <p className="flex items-center gap-2 text-sm"><FaPhoneFlip /> {selectedMember?.contactNumber || selectedMember?.contact || 'N/A'}</p>
                  </div>
                  <p className={`${theme==='dark'?'text-gray-200':'text-gray-600'} text-sm leading-relaxed`}>{selectedMember?.description || '-'}</p>
                </div>
                 
              ) : (
              <div className={`${theme==='dark'?'text-gray-200':'text-gray-500'} text-center mt-12 py-10 rounded-xl border border-dashed border-gray-300`}>
                  Click a team member to view details
                </div>
              )}
            </div>
          </section>
          <section ref={teamRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 scroll-mt-24">
              <div className={`${theme==='dark'?'bg-gray-500 text-gray-200':'bg-gradient-to-r from-white to-blue-50 text-gray-800'} p-6 rounded-xl shadow-md`}>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <h2 className="text-2xl font-bold">Project Tasks</h2>
                </div>
                <ul className="space-y-4">
                  {tasks.length === 0 && <li className="text-sm text-gray-500">No tasks available.</li>}
                  {tasks.map((task) => (
                    <li key={task.id} className="border-b last:border-b-0 pb-4">
                      <div
                        onClick={() => handleSelectTask(task)}
                        className={`flex justify-between items-center cursor-pointer ${selectedTask === task.id ? 'bg-indigo-50' : ''} p-2 rounded-md`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`${theme==='dark'?'text-gray-200':'text-gray-500'}`}><LuListCollapse size={20} /></span>
                          <div>
                            <div className={`text-lg font-medium ${theme==='dark'?'text-gray-200':'text-gray-600'}`}>{task.title}</div>
                            <div className="text-xs text-gray-400">{task.description || 'No description'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`${task.statusColor} px-3 py-1 rounded-md text-sm font-semibold`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      {selectedTask === task.id && (
                        <p className={`mt-3 ml-8 ${theme==='dark'?'text-gray-200':'text-gray-600'} text-sm`}>{task.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Task Progress (timeline) */}
              <div className={`${theme==='dark'?'bg-gray-500 text-gray-200':'bg-gradient-to-r from-white to-blue-50 text-gray-800'} p-6 rounded-xl shadow-md`}>
                <h2 className="text-2xl font-bold mb-2">Task Progress</h2>
                <div className="relative border-l border-gray-200 ml-4 pl-6">
                  {progressLoading ? (
                    <div className="py-6 text-center text-sm text-indigo-500">Loading progress...</div>
                  ) : progress.length ? (
                    <ul className="space-y-6">
                      {progress.map((order) => (
                        <li key={order.id} className="relative">
                          <div className={`absolute w-3 h-3 ${order.color} rounded-full -left-9 top-0.5`}></div>
                          <p className={`font-medium ${theme==='dark'?'text-gray-200':'text-gray-700'}`}>{order.title}</p>
                          <p className={`text-sm ${theme==='dark'?'text-gray-200':'text-gray-600'}`}>{order.date}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-6 text-center text-sm text-gray-500">No progress updates available.</div>
                  )}
                </div>
                <button onClick={() => setprogress([...progress].reverse())} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 flex items-center justify-center gap-2 transition">
                  <IoMdRefresh className="text-2xl" />
                  <span className="font-medium">REVERSE ORDER</span>
                </button>
              </div>
          </section>
          <section ref={reportsRef} className="mt-10 mb-20 scroll-mt-24">
            <div className={`${theme==='dark'?'bg-gray-500 text-gray-200':'bg-stone-100 text-gray-800'} p-6 rounded-xl shadow-md`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold">Department Progress</h2>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Year Dropdown */}
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium shadow-md cursor-pointer focus:outline-none hover:bg-blue-600 transition"
                  >
                    <option disabled>Select Year</option>
                    {getYearOptions().map((year) => (
                      <option key={year} value={year} className="text-black">
                        {year}
                      </option>
                    ))}
                  </select>
          
                  {/* Month Dropdown */}
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-4 py-2 rounded-lg bg-orange-400 text-white font-medium shadow-md cursor-pointer focus:outline-none hover:bg-orange-500 transition"
                  >
                    <option disabled>Select Month</option>
                    {getMonthOptions().map((month) => (
                      <option key={month.value} value={month.value} className="text-black">
                        {month.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
          
              {/* Error Display */}
              {departmentError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  Error: {departmentError}
                </div>
              )}
          
              {/* Chart Container */}
              <div className={`p-2 ${theme==='dark'?'bg-gray-800 ':'bg-gradient-to-r from-white to-blue-50 '} rounded-lg`}>
                {departmentLoading ? (
                  <div className="flex items-center justify-center h-[350px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className={`${theme==='dark'?'text-gray-200':'text-gray-600'}`}>Loading department progress...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {isMounted && departmentData[`${getMonthName(selectedMonth)} ${selectedYear}`] ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart 
                          data={departmentData[`${getMonthName(selectedMonth)} ${selectedYear}`]} 
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <XAxis 
                            dataKey="department" 
                            stroke={textColor} 
                            tick={{ fill: textColor, fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            domain={[0, 100]} 
                            stroke={textColor} 
                            tick={{ fill: textColor }} 
                            label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: theme === 'dark' ? "#374151" : "#fff", 
                              border: theme === 'dark' ? "1px solid #4B5563" : "1px solid #ccc",
                              borderRadius: "8px"
                            }}
                            formatter={(value) => [`${value}%`, 'Progress']}
                            labelFormatter={(label) => `Department: ${label}`}
                          />
                          <Bar 
                            dataKey="progress"
                            fill={barColor}  
                            barSize={40} 
                            radius={[5, 5, 0, 0]} 
                            barCategoryGap="20%" 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[350px]">
                        <div className="text-center">
                          <p className={`${theme==='dark'?'text-gray-200':'text-gray-600'} text-lg`}>
                            No data available for {getMonthName(selectedMonth)} {selectedYear}
                          </p>
                          <p className={`${theme==='dark'?'text-gray-300':'text-gray-500'} text-sm mt-2`}>
                            Please select a different month or year
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
          
              {/* Data Summary */}
              {departmentData[`${getMonthName(selectedMonth)} ${selectedYear}`] && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg ${theme==='dark'?'bg-gray-700':'bg-white'} text-center`}>
                    <p className={`text-sm ${theme==='dark'?'text-gray-300':'text-gray-600'}`}>Departments</p>
                    <p className="text-xl font-bold text-blue-600">
                      {departmentData[`${getMonthName(selectedMonth)} ${selectedYear}`].length}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme==='dark'?'bg-gray-700':'bg-white'} text-center`}>
                    <p className={`text-sm ${theme==='dark'?'text-gray-300':'text-gray-600'}`}>Avg Progress</p>
                    <p className="text-xl font-bold text-green-600">
                      {Math.round(
                        departmentData[`${getMonthName(selectedMonth)} ${selectedYear}`]
                          .reduce((sum, dept) => sum + dept.progress, 0) / 
                        departmentData[`${getMonthName(selectedMonth)} ${selectedYear}`].length
                      )}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme==='dark'?'bg-gray-700':'bg-white'} text-center`}>
                    <p className={`text-sm ${theme==='dark'?'text-gray-300':'text-gray-600'}`}>Highest</p>
                    <p className="text-xl font-bold text-purple-600">
                      {Math.max(...departmentData[`${getMonthName(selectedMonth)} ${selectedYear}`].map(d => d.progress))}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${theme==='dark'?'bg-gray-700':'bg-white'} text-center`}>
                    <p className={`text-sm ${theme==='dark'?'text-gray-300':'text-gray-600'}`}>Lowest</p>
                    <p className="text-xl font-bold text-orange-600">
                      {Math.min(...departmentData[`${getMonthName(selectedMonth)} ${selectedYear}`].map(d => d.progress))}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
export default ProjectDetails;