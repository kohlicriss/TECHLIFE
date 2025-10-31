import React, { useContext, useRef, useState, useEffect } from "react";
import { LuListCollapse } from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaRegFolderOpen } from "react-icons/fa";
import { TbEyeDotted } from "react-icons/tb";
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

  // Added a state to track component readiness
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
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
    team: [],           // maps to teamMembers -> projectInfo.team
    teamLead: [],       // maps to teamLeads -> projectInfo.teamLead
    projectManager: [], // maps to projectManager -> projectInfo.projectManager (array for UI)
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
  // member detail endpoint (local IP provided by you)
  const MEMBER_DETAILS_BASE = 'http://192.168.0.112:8090/api/employee';

  const loadTeamPerformance = async (pid) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return [];
      const url = `${TEAM_PERF_BASE}/${encodeURIComponent(pid)}/team-performance`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      if (!res.ok) return [];
      const arr = await res.json().catch(() => []);
      // expected shape: [{ employeeId, employeeName, percentageCompleted, status, role }]
      return Array.isArray(arr) ? arr.map(it => ({
        employeeId: it.employeeId,
        name: it.employeeName || it.employeeName || it.displayName || it.employeeName,
        percentageCompleted: typeof it.percentageCompleted === 'number' ? it.percentageCompleted : 0,
        status: it.status || '',
        role: it.role || '',
        // no image in this payload — allowed to be null
        image: it.employeeImage || null
      })) : [];
    } catch (e) {
      console.error('loadTeamPerformance error', e);
      return [];
    }
  };

    const fetchMemberDetails = async (pid, empId) => {
    try {
      const token = localStorage.getItem('accessToken');
      // use provided local endpoint for member details
      const url = `${MEMBER_DETAILS_BASE}/${encodeURIComponent(pid)}/team-performance/${encodeURIComponent(empId)}`;
      const headers = token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' };
      const res = await fetch(url, { headers });
      if (!res.ok) {
        // fallback minimal object
        return { employeeId: empId, name: empId, role: '', email: '', contact: '', description: '', status: null };
      }
      const body = await res.json().catch(() => null);
      return {
        employeeId: body?.employeeId || empId,
        name: body?.employeeName || body?.displayName || empId,
        role: body?.role || '',
        email: body?.email || '',
        contact: body?.contactNumber || '',
        description: body?.description || '',
        status: body?.status ?? null
      };
    } catch (err) {
      console.error('fetchMemberDetails error', err);
      return { employeeId: empId, name: empId, role: '', email: '', contact: '', description: '', status: null };
    }
  };
// ...existing code...

  // --- NEW: fetch+show selected member details on click ---
  const handleSelectMember = async (member) => {
    // clear current selection while loading
    setSelectedMember(null);
    const pid = project?.projectId || localStorage.getItem('selectedProjectId') || '';
    if (!member?.employeeId || !pid) {
      setSelectedMember(member);
      return;
    }
    try {
      const details = await fetchMemberDetails(pid, member.employeeId);
      // merge whatever was in the list with fetched detail payload
      setSelectedMember({ ...member, ...details });
    } catch (e) {
      console.error('handleSelectMember error', e);
      // fallback to list item
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
  // public project details endpoint (maps to the JSON you posted)
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

      // Overview response (required)
      if (overviewSettled.status !== 'fulfilled' || !overviewSettled.value) {
        throw new Error('Failed to fetch project overview');
      }
      const overviewRes = overviewSettled.value;
      const overviewBody = await overviewRes.json().catch(() => null);
      if (!overviewRes.ok) throw new Error(overviewBody?.message || `Overview fetch failed: ${overviewRes.status}`);

      // persist token if present in headers/body
      const authHeader = overviewRes.headers.get('authorization') || overviewRes.headers.get('Authorization');
      if (authHeader) storeAccessToken(authHeader);
      if (overviewBody?.accessToken || overviewBody?.token || overviewBody?.jwt) {
        storeAccessToken(overviewBody?.accessToken || overviewBody?.token || overviewBody?.jwt);
      }

      // Normalize overview -> projectData
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

      // Employee-specific tasks/details (optional) -> override tasksDetails if present
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

      // Public project details endpoint -> map into projectInfo used by the UI
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

          // Map team members -> projectInfo.team (UI expects name & role & optional image)
          // Map team members -> projectInfo.team (include employeeImage and image fallback)
          mappedProjectInfo.team = Array.isArray(pd.teamMembers) ? pd.teamMembers.map(m => ({
            name: m.displayName || m.employeeName || m.employeeId || 'N/A',
            role: m.role || '',
            // keep the original backend key as employeeImage and provide image as legacy fallback
            employeeImage: m.employeeImage || m.employeeImageUrl || null,
            image: m.employeeImage || m.employeeImageUrl || null,
            employeeId: m.employeeId || null
          })) : [];

          // Map teamLeads -> teamLead
          mappedProjectInfo.teamLead = Array.isArray(pd.teamLeads) ? pd.teamLeads.map(t => ({
            name: t.displayName || t.employeeName || t.employeeId || 'N/A',
            employeeImage: t.employeeImage || t.employeeImageUrl || null,
            image: t.employeeImage || t.employeeImageUrl || null,
            employeeId: t.employeeId || null
          })) : [];
          // Map projectManager -> projectManager array for UI
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

          // optional numeric fields if provided
          mappedProjectInfo.daysSpent = typeof pd.daysSpent === 'number' ? pd.daysSpent : mappedProjectInfo.daysSpent;
          mappedProjectInfo.totaldays = typeof pd.totaldays === 'number' ? pd.totaldays : mappedProjectInfo.totaldays;
        }
      } else {
        // fallback: if public details not available, try to derive team/manager from overview raw
        const raw = overviewBody;
        if (raw) {
          // manager field might exist in overview
          if (raw.manager) {
            mappedProjectInfo.projectManager = [{
              name: raw.manager.name || raw.manager.employeeId || '',
              employeeId: raw.manager.employeeId || null,
              image: raw.manager.employeeImage || null
            }];
          }
          // fallback teams (if overview includes arrays)
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
        // load team performance and set selected member
        const team = await loadTeamPerformance(pid);
        mappedProjectInfo.team = team.length ? team : mappedProjectInfo.team;
        setProjectData(normalizedBase);
        setProjectInfo(mappedProjectInfo);
        if (team.length) {
          // select first member by default, then fetch detailed info for that member
          const first = team[0];
          const details = await fetchMemberDetails(pid, first.employeeId);
          setSelectedMember({ ...first, ...details });
        }
        // load tasks for this project (will also select first task & load its progress)
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


// Project and team data
//  const projectInfo = {
//  title: "Human Resource Management ",
//  projectId: "PRO-0001",
//  status: "InProgress",
//  team: [
//    { name: "Viswa", role: "Backend", description: "Expert in backend architecture and API development. Focused on scalable services,role involves creating and maintaining databases, writing server-side logic, developing and integrating APIs, handling user authentication, and ensuring the application is secure.", email: "viswa@gmail.com" },
//    { name: "Rajesh", role: "Integration", description: "Responsible for third-party integrations and automation workflow and design, build, and maintain integration solutions that allow data to flow smoothly across multiple platforms within an organization.", email: "rajesh@example.com" },
//    { name: "Raghu", role: "Database", description: "Specialist in database optimization, indexing, and migrations work closely with application developers to make sure the backend systems can quickly retrieve and update data.", email: "saraswati@example.com" },
//    { name: "Ravi", role: "Frontend", description: "Frontend developer focuses on delivering a great user experience by combining design and functionality on the client side, and turn design ideas into working features, ensure smooth navigation, and make the application work well across different devices and browsers.", email: "mahath@example.com" }
//  ],
//  teamLead: [
//    { name: "Ramya" },
//    { name: "Koteshwar" }
//  ],
//  projectManager: [
//    { name: "Varun" }
//  ],
//  tags: ["Admin Panel", "High Tech"],
//  description: "The Tech life Management System (EPMS) project aims to modernize and streamline the Human management processes within. By integrating advanced technologies and optimizing existing workflows, the project seeks to improve tickets Processing and resolving the user queries, enhance operational efficiency, and ensure compliance with regulatory standards.",
//  daysSpent: 65,
//  totaldays: 120
//};
//
//  const initialTasks = [
//  { id: 1, title: "Integration operation", status: "OnHold", description: "This task covers system-wide integration testing and validation." },
//  { id: 2, title: "Frontend Dashboard development", status: "InProgress", description: "UI and dashboard features are being built for user interaction." },
//  { id: 3, title: "Backend Tickets Employee Development", status: "Completed", description: "Ticketing system backend modules have been implemented successfully." },
//  { id: 4, title: "API Integration", status: "Pending", description: "API endpoints need to be integrated with frontend services." },
//  { id: 5, title: "Database Administration", status: "InProgress", description: "Database optimization and backup configurations are ongoing." },
//];
//const getStatusColor = (status) => {
//    switch (status) {
//        case 'InProgress':
//            return 'bg-blue-500';
//        case 'Completed':
//            return 'bg-green-500';
//        case 'Pending':
//            return 'bg-yellow-500';
//        case 'OnHold':
//            return 'bg-red-500';
//        default:
//            return 'bg-gray-400';
//    }
//};
const textColor = theme==='dark' ? "#FFFFFF" : "#000000";
  //const backgroundColor = theme==='dark' ? "bg-gray-800" : "bg-white";
  const barColor = "#ADD8E6";
//const handleCompleteTask = (taskId) => {
//        setTasks(prevTasks => {
//            const newTasks = [...prevTasks];
//            const currentTaskIndex = newTasks.findIndex(task => task.id === taskId);
//            
//            if (currentTaskIndex !== -1) {
//                newTasks[currentTaskIndex] = { ...newTasks[currentTaskIndex], status: 'Completed' };
//                const nextPendingTaskIndex = newTasks.findIndex((task, index) => 
//                    index > currentTaskIndex && (task.status === 'Pending' || task.status === 'OnHold')
//                );
//                if (nextPendingTaskIndex !== -1) {
//                    newTasks[nextPendingTaskIndex] = { ...newTasks[nextPendingTaskIndex], status: 'InProgress' };
//                }
//            }
//            return newTasks;
//        });
//    };
//const intialProgress=[
//  { id: 1, title: "Backend Tickets Employee Development", date: "09 JUN 7:20 PM", status: "completed",  },
//    { id: 2, title: "Database Administration", date: "08 JUN 12:20 PM", status: "completed",            },
//    { id: 3, title: "Integration Operation", date: "04 JUN 3:10 PM", status: "in-progress",             },
//    { id: 4, title: "Frontend Dashboard Developement", date: "02 JUN 2:45 PM", status: "in-progress",   },
//    { id: 5, title: "API Intergration and Deployment", date: "18 July 1:30 PM", status: "in-progress",  },
//]
//const ProgressColorsMap={
// "completed": "bg-green-500",
//  "in-progress": "bg-blue-500", 
//}
//const StatusColorsMap={
//    "OnHold":"bg-pink-200 text-pink-800",
//    "InProgress":"bg-blue-200 text-blue-800",
//    "Completed":"bg-green-200 text-green-800",
//    "Pending":"bg-yellow-200 text-yellow-800"
//  }
//   const tasksWithColors = initialTasks.map(task => ({
//    ...task,
//    statusColor: StatusColorsMap[task.status] || 'bg-gray-200 text-gray-800' 
//  }));
//   const progressWithColors =intialProgress.map(progress => ({
//    ...progress,
//    color: ProgressColorsMap[progress.status] || 'bg-gray-200 text-gray-800' 
//  }));
  const getAvatarUrl = (index) => `https://i.pravatar.cc/40?img=${index + 1}`;
 // const [selectedMember, setSelectedMember] = useState(null); 
//  const [status, setStatus] = useState("InProgress");
//  const [selectedTask, setSelectedTask] = useState(null);
//  const [newTaskTitle, setNewTaskTitle] = useState("");
//  const [tasks, setTasks] = useState(tasksWithColors)
//  const [progress, setprogress] = useState(progressWithColors);
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
  

  // tasks comes from backend /api/employee/{projectId}/tasks
  const [tasks, setTasks] = useState([]); 
  // timeline/progress entries for selected task (loaded from employee/project details endpoint)
  const [progress, setprogress] = useState([]);
  // selectedTask used previously for accordion -- keep as id; we'll also use it to track active task for progress
   const [selectedTask, setSelectedTask] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const [status, setStatus] = useState("InProgress");
  
  const [newTaskTitle, setNewTaskTitle] = useState("");

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
      // backend returns shape: { projectId, title, tasks: [{ title, status, description }] }
      // handle either array of tasks or wrapped object
      const rawTasks = Array.isArray(body) ? body : (Array.isArray(body.tasks) ? body.tasks : []);
      const mapped = rawTasks.map((t, i) => ({
        id: t.id ?? i + 1,
        title: t.title ?? `Task ${i + 1}`,
        status: t.status ?? 'Not Started',
        description: t.description ?? t.desc ?? '',
        statusColor: getStatusClass(t.status),
      }));
      setTasks(mapped);
      // select first task by default and load its progress
      if (mapped.length) {
        setSelectedTask(mapped[0].id);
        // prefer logged-in user's employeeId when requesting progress
        const empId = userData?.employeeId || null;
        // load progress using taskId endpoint
        await loadTaskProgress(pid, empId, mapped[0].id, mapped[0].title);
      }
    } catch (err) {
      console.error('loadTasks error', err);
      setTasks([]);
    }
  };
  
  // fetch task progress / timeline. We use employee-specific details endpoint you provided.
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
        // primary: task-specific progress endpoint
        url = `https://hrms.anasolconsultancyservices.com/api/employee/${encodeURIComponent(pid)}/${encodeURIComponent(taskId)}/progress`;
        // include employee filter if backend supports query param
        if (empId) url += `?employeeId=${encodeURIComponent(empId)}`;
      } else if (empId) {
        // fallback to employee-specific project details endpoint
        url = `https://hrms.anasolconsultancyservices.com/api/employee/project/${encodeURIComponent(pid)}/employee/${encodeURIComponent(empId)}/details`;
        if (taskTitle) url += `?taskTitle=${encodeURIComponent(taskTitle)}`;
      } else {
        // last-resort project-level details
        url = `https://hrms.anasolconsultancyservices.com/api/employee/project/${encodeURIComponent(pid)}/details`;
        if (taskTitle) url += `?taskTitle=${encodeURIComponent(taskTitle)}`;
      }

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
      if (!res.ok) {
        // If task-specific endpoint returned 404, try fallback (employee details)
        if (taskId && res.status === 404 && empId) {
          return await loadTaskProgress(pid, empId, null, taskTitle);
        }
        setprogress([]);
        setProgressLoading(false);
        return [];
      }

      const arr = await res.json().catch(() => []);
      // expected shape for task progress: [{ updatedDate, changes, note }]
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
  const departmentData = {
    May: [
      { department: "Frontend", progress: 10 }, { department: "Backend", progress: 55 }, { department: "Database", progress: 50 },
      { department: "Integration", progress: 30 }, { department: "API Integration", progress: 5 }, { department: "Deployment", progress: 5 },
    ],
    Jun: [
      { department: "Frontend", progress: 35 }, { department: "Backend", progress: 65 }, { department: "Database", progress: 70 },
      { department: "Integration", progress: 45 }, { department: "API Integration", progress: 10 }, { department: "Deployment", progress: 5 },
    ],
    Jul: [
      { department: "Frontend", progress: 60 }, { department: "Backend", progress: 80 }, { department: "Database", progress: 75 },
      { department: "Integration", progress: 50 }, { department: "API Integration", progress: 10 }, { department: "Deployment", progress: 5 },
    ],
    Aug: [
      { department: "Frontend", progress: 70 }, { department: "Backend", progress: 90 }, { department: "Database", progress: 80 },
      { department: "Integration", progress: 60 }, { department: "API Integration", progress: 30 }, { department: "Deployment", progress: 20 },
    ],
    Sept: [
      { department: "Frontend", progress: 80 }, { department: "Backend", progress: 92 }, { department: "Database", progress: 83 },
      { department: "Integration", progress: 70 }, { department: "API Integration", progress: 40 }, { department: "Deployment", progress: 30 },
    ],
  };
 const COLOR=["purple"]
  const [selectedMonth, setSelectedMonth] = useState(Object.keys(departmentData)[0]); // Default to the first month
  const displayProject = project || projectData?.raw || { title: "Loading project...", projectId: "" };
  const tasksDone = tasks.filter((task) => task.status === "Completed").length;
  const totalTasks = tasks.length;
  const percentageCompleted = totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : 0;
//  const projectData = {
//    projectDetails: {
//      client: "ABC Enterprises",
//      totalCost: "$1400",
//      DaysToWork: "120 days",
//      createdOn: "14 Nov 2024",
//      startedOn: "15 Jan 2025",
//      dueDate: "15 Nov 2025",
//      dueAlert: 1,
//      createdBy: {
//        name: "Priya Rathod",
//      },
//      priority: "High"
//    },
  //  tasksDetails: {
  //    tasksDone,
  //    totalTasks,
  //    percentageCompleted
  //  }
  //};
// local state for fetched project details (normalized to UI shape)

  const mainContentPaddingClass = "pt-[160px] md:pt-[120px] "; 
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
          {/* Buttons remain the same, ensuring `flex-shrink-0` keeps them visible in a scrollable container */}
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
       {/* 3. Sidebar (Desktop-Only View) - Positioning is relative to the desktop header (top-16) */}
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
      {/* Main content container with dynamic right padding */}
      <div className={`${mainContentPaddingClass} transition-all duration-300 ${open ? 'md:pr-48' : 'md:pr-16'}`}>
        <div className="p-3 md:p-5">

          {/* Overview Section */}
          <section ref={overviewRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2 scroll-mt-20 md:scroll-mt-12">
            {/* Main Overview Card */}
           <div className={`  ${theme === 'dark' ? 'bg-gray-600 text-gray-100' : 'bg-white text-gray-900 border border-gray-100'} rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 p-6 space-y-8 col-span-1 lg:col-span-2`}>
  {/* Header Section: Title & ID */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
    <div>
      <h2 className={`text-3xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-extrabold tracking-tight`}>
        {project.title}
      </h2>
      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        Project ID: <span className="text-red-500 dark:text-red-400 font-bold ml-1">{project.projectId}</span>
      </p>
    </div>
    {/* Optional: Add a status badge or action button here */}
  </div>
  {/* Team Members */}
  <div>
    <h3 className={`text-lg font-bold mb-3 uppercase tracking-wider ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
      Team Members ({projectInfo.team.length})
    </h3>
<div className="flex flex-wrap gap-3">
      {projectInfo.team.map((member, index) => (
        <span
          key={index}
          className={`
            flex items-center gap-2 p-2 rounded-full cursor-pointer
            ${theme === 'dark'
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-blue-50 text-gray-800 hover:bg-blue-100'
            }
            transition duration-150 ease-in-out shadow-sm
          `}
        >
          <img
            src={member.employeeImage || member.image || getAvatarUrl(index)}
            alt={member.name || member.employeeId || 'member'}
            className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-800 object-cover flex-shrink-0"
          />
          <span className="text-sm font-semibold pr-2">{member.name}</span>
        </span>
      ))}
    </div>
  </div>

  {/* Roles: Team Lead & Project Manager */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
    {/* Team Lead */}
    <div className={`p-4 rounded-xl border border-gray-100  bg-gray-50 ${theme === 'dark' ? 'dark:bg-gray-700' : ''}`}>
      <h3 className={`text-md font-bold mb-3 uppercase tracking-wider ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
        Team Lead
      </h3>
      <div className="flex flex-wrap gap-3">
        {projectInfo.teamLead.map((lead, index) => (
          <span
            key={index}
            className={`
              flex items-center gap-3 p-2 rounded-lg
              ${theme === 'dark'
                ? 'bg-gray-800 text-gray-100 hover:bg-gray-500'
                : 'bg-white text-gray-800 border border-green-300 shadow-md hover:shadow-lg'
              }
              transition duration-150 ease-in-out
            `}
          >
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

    {/* Project Manager */}
    <div className={`p-4 rounded-xl border border-gray-100  bg-gray-50 ${theme === 'dark' ? 'dark:bg-gray-700' : ''}`}>
      <h3 className={`text-md font-bold mb-3 uppercase tracking-wider ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
        Project Manager
      </h3>
      <div className="flex flex-wrap gap-3">
        {projectInfo.projectManager.map((pm, index) => (
          <span
            key={index}
            className={`
              flex items-center gap-3 p-2 rounded-lg
              ${theme === 'dark'
                ? 'bg-gray-800 text-gray-100 hover:bg-gray-500'
                : 'bg-white text-gray-800 border border-yellow-300 shadow-md hover:shadow-lg'
              }
              transition duration-150 ease-in-out
            `}
          >
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

  {/* Description */}
  <div className="pt-4 border-t border-gray-100 ">
    <h3 className={`text-lg font-bold mb-3 uppercase tracking-wider ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
      Project Summary
    </h3>
    <div className={`p-4 rounded-xl border border-gray-100  bg-gray-50 ${theme === 'dark' ? 'dark:bg-gray-700' : ''}`}>
      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-base leading-relaxed`}>
        {projectInfo.description}
      </p>
    </div>
  </div>
  </div>

            {/* Right Column Details */}
            <div className="space-y-6 col-span-1">
              {/* Project Details */}
             <div className={` ${theme==='dark'?'bg-gray-500 text-gray-200':'bg-gradient-to-r from-white to-blue-50 text-gray-800'} rounded-xl shadow-lg border border-gray-200 p-6`}>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Project Details</h2>

                {/* Guard rendering: show loader / error / empty state when projectData not ready */}
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
                                <img src={getAvatarUrl(index)} alt={value?.name || value?.employeeId || 'user'} className="w-8 h-8 rounded-full" />
                                <span className={`${theme==='dark'?'text-gray-200':'text-gray-900'} font-medium`}>{value?.name || value?.employeeId || 'N/A'}</span>
                              </span>
                            </dd>
                          </div>
                        );
                      }
                      if (key === 'dueAlert') return null; // Hide dueAlert from this list

                      // Format value safely (string, number, date, array or object)
                      const renderValue = (() => {
                        if (value == null) return 'N/A';
                        if (Array.isArray(value)) return value.join(', ');
                        if (typeof value === 'object') {
                          // common objects: manager { employeeId, name }
                          if (value.name) return value.name;
                          if (value.employeeId) return value.employeeId;
                          // fallback to JSON string
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

              {/* Tasks Details */}
              <div className={`${theme==='dark'?'bg-gray-500 text-gray-200':'bg-gradient-to-r from-white to-blue-50 text-gray-800'} rounded-xl shadow-lg border border-gray-200 p-6 h-auto`}>
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Tasks Details</h2>

                {/* Guard rendering for tasksDetails */}
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

          {/* Team Section */}
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
                          <button onClick={(e) => { e.stopPropagation(); /* optional deleteTask(task.id) */ }} className="text-red-500 hover:text-red-700 transition">
                            <RiDeleteBin6Line size={20} />
                          </button>
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
          {/* Reports Section */}
          <section ref={reportsRef} className="mt-10 mb-20 scroll-mt-24">
            <div className={`${theme==='dark'?'bg-gray-500 text-gray-200':'bg-stone-100 text-gray-800'} p-6 rounded-xl shadow-md`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Department Progress</h2>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-orange-400 text-white font-medium shadow-md cursor-pointer focus:outline-none"
                >
                  <option disabled>Month</option>
                  {Object.keys(departmentData).map((month) => (
                    <option key={month} value={month} className="text-black">{month}</option>
                  ))}
                </select>
              </div>
              <div className={`p-2 ${theme==='dark'?'bg-gray-800 ':'bg-gradient-to-r from-white to-blue-50 '}  rounded-lg`}>
                {isMounted &&  ( // Conditional rendering based on isMounted state
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={departmentData[selectedMonth]} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <XAxis dataKey="department" stroke={textColor} tick={{ fill: textColor }}  />
                      <YAxis domain={[0, 100]} stroke={textColor} tick={{ fill: textColor }} />
                      <Tooltip contentStyle={{ backgroundColor: theme ==='dark' ? "#63676cff" : "#fff", border: theme ? "1px solid #4B5563" : "1px solid #ccc" }}formatter={(value) => `${value}%`} />
                      <Bar dataKey="progress"fill={barColor}  barSize={40} radius={[5, 5, 0, 0]} barCategoryGap="20%" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
export default ProjectDetails;