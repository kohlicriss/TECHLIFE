import React, { useContext, useRef, useState, useEffect } from "react";
import { LuListCollapse } from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaRegFolderOpen } from "react-icons/fa";
import { TbEyeDotted } from "react-icons/tb";
import { MdEmail } from "react-icons/md";
import { FaPhoneFlip } from "react-icons/fa6";
import { IoMdRefresh } from "react-icons/io";
import { FaHome, FaUsers, FaTasks, FaChartBar } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
  const { userData } = useContext(Context);

  // Project and team data
  const projectInfo = {
    title: "Human Resource Management ",
    projectId: "PRO-0001",
    status: "InProgress",
    team: [
      { name: "Viswa", role: "Backend", description: "Expert in backend architecture and API development. Focused on scalable services,role involves creating and maintaining databases, writing server-side logic, developing and integrating APIs, handling user authentication, and ensuring the application is secure.", email: "viswa@gmail.com", avatar: "https://i.pravatar.cc/40?img=1" },
      { name: "Rajesh", role: "Integration", description: "Responsible for third-party integrations and automation workflow and design, build, and maintain integration solutions that allow data to flow smoothly across multiple platforms within an organization.", email: "rajesh@example.com", avatar: "https://i.pravatar.cc/40?img=11" },
      { name: "Saraswati", role: "Database", description: "Specialist in database optimization, indexing, and migrations work closely with application developers to make sure the backend systems can quickly retrieve and update data.", email: "saraswati@example.com", avatar: "https://i.pravatar.cc/40?img=9" },
      { name: "Mahath", role: "Frontend", description: "Frontend developer focuses on delivering a great user experience by combining design and functionality on the client side, and turn design ideas into working features, ensure smooth navigation, and make the application work well across different devices and browsers.", email: "mahath@example.com", avatar: "https://i.pravatar.cc/40?img=4" }
    ],
    teamLead: [
      { name: "Ramya", avatar: "https://i.pravatar.cc/40?img=5" },
      { name: "Koteshwar", avatar: "https://i.pravatar.cc/40?img=12" }
    ],
    projectManager: [
      { name: "Varun", avatar: "https://i.pravatar.cc/40?img=8" }
    ],
    tags: ["Admin Panel", "High Tech"],
    description: "The Tech life Management System (EPMS) project aims to modernize and streamline the Human management processes within. By integrating advanced technologies and optimizing existing workflows, the project seeks to improve tickets Processing and resolving the user queries, enhance operational efficiency, and ensure compliance with regulatory standards.",
    hoursSpent: 65,
    totalHours: 120
  };

  // State Management
  const [selectedMember, setSelectedMember] = useState(projectInfo.team[0]); // Default to the first team member
  const [status, setStatus] = useState("InProgress");
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [tasks, setTasks] = useState([
    { id: 1, title: "Integration operation", status: "OnHold", statusColor: "bg-pink-200 text-pink-800", description: "This task covers system-wide integration testing and validation." },
    { id: 2, title: "Frontend Dashboard development", status: "InProgress", statusColor: "bg-blue-200 text-blue-800", description: "UI and dashboard features are being built for user interaction." },
    { id: 3, title: "Backend Tickets Employee Development", status: "Completed", statusColor: "bg-green-200 text-green-800", description: "Ticketing system backend modules have been implemented successfully." },
    { id: 4, title: "API Integration", status: "Pending", statusColor: "bg-yellow-200 text-yellow-800", description: "API endpoints need to be integrated with frontend services." },
    { id: 5, title: "Database Administration", status: "InProgress", statusColor: "bg-blue-200 text-blue-800", description: "Database optimization and backup configurations are ongoing." },
  ]);
  const [progress, setprogress] = useState([
    { id: 1, title: "Backend Tickets Employee Development", date: "09 JUN 7:20 PM", status: "completed", color: "bg-green-500" },
    { id: 2, title: "Database Administration", date: "08 JUN 12:20 PM", status: "completed", color: "bg-green-500" },
    { id: 3, title: "Integration Operation", date: "04 JUN 3:10 PM", status: "in-progress", color: "bg-blue-500" },
    { id: 4, title: "Frontend Dashboard Developement", date: "02 JUN 2:45 PM", status: "in-progress", color: "bg-blue-500" },
    { id: 5, title: "API Intergration and Deployment", date: "18 July 1:30 PM", status: "in-progress", color: "bg-blue-500" },
  ]);

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

  const [selectedMonth, setSelectedMonth] = useState(Object.keys(departmentData)[0]); // Default to the first month

  if (!project) {
    return <div>No project data found.</div>;
  }

  const tasksDone = tasks.filter((task) => task.status === "Completed").length;
  const totalTasks = tasks.length;
  const percentageCompleted = totalTasks > 0 ? Math.round((tasksDone / totalTasks) * 100) : 0;

  const projectData = {
    projectDetails: {
      client: "ABC Enterprises",
      totalCost: "$1400",
      hoursOfWork: "150 hrs",
      createdOn: "14 Nov 2024",
      startedOn: "15 Jan 2025",
      dueDate: "15 Nov 2025",
      dueAlert: 1,
      createdBy: {
        name: "Priya Rathod",
        avatar: "https://i.pravatar.cc/40?img=15"
      },
      priority: "High"
    },
    tasksDetails: {
      tasksDone,
      totalTasks,
      percentageCompleted
    }
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: tasks.length + 1,
      title: newTaskTitle,
      status: "Pending",
      statusColor: "bg-yellow-200 text-yellow-800",
      members: [],
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="bg-gray-100 min-h-screen relative font-sans">
      {/* Project Header - Fixed to top for full-width coverage */}
      <div className="fixed top-16  z-50 p-6 md:p-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-400 w-full text-white rounded-b-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-3xl font-bold text-indigo-600"><FaRegFolderOpen /></span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{project.project_name}</h1>
            <p className="text-sm text-gray-200">Project ID: {project.project_id}</p>
          </div>
        </div>
        <button
          className="px-6 py-2 mr-56 bg-white text-indigo-600 rounded-lg font-medium shadow-md hover:bg-gray-100 transition"
          onClick={() => navigate(`/projects/${userData?.employeeId}`)}
        >
          ← Back to Projects
        </button>
      </div>

      {/* Main content container with dynamic right padding */}
      <div className={`pt-[128px] transition-all duration-300 ${open ? 'pr-48' : 'pr-16'}`}>
        <div className="p-3 md:p-5">

          {/* Overview Section */}
          <section ref={overviewRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2 scroll-mt-16">
            {/* Main Overview Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 space-y-6 col-span-1 lg:col-span-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{projectInfo.title}</h2>
                  <p className="text-sm mt-1 text-gray-500">
                    Project ID: <span className="text-red-500 font-semibold">{projectInfo.projectId}</span>
                  </p>
                </div>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="appearance-none px-4 py-2 pr-12 rounded-md border border-gray-300 bg-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="InProgress">InProgress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pr-2 pointer-events-none">
                    <TbEyeDotted className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <h3 className="text-gray-700 font-semibold mb-2">Team</h3>
                <div className="flex flex-wrap gap-3">
                  {projectInfo.team.map((member, index) => (
                    <span key={index} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition">
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full border" />
                      <span className="text-sm font-medium">{member.name}</span>
                    </span>
                  ))}
                  <button className="text-gray-600 text-sm border border-dashed border-gray-400 rounded-lg px-3 py-2 hover:bg-gray-100 transition">
                    + Add New
                  </button>
                </div>
              </div>

              {/* Team Lead & Project Manager */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-gray-700 font-semibold mb-2">Team Lead</h3>
                  <div className="flex flex-wrap gap-3">
                    {projectInfo.teamLead.map((lead, index) => (
                      <span key={index} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                        <img src={lead.avatar} alt={lead.name} className="w-8 h-8 rounded-full border" />
                        <span className="text-sm font-medium">{lead.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-700 font-semibold mb-2">Project Manager</h3>
                  <div className="flex flex-wrap gap-3">
                    {projectInfo.projectManager.map((pm, index) => (
                      <span key={index} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                        <img src={pm.avatar} alt={pm.name} className="w-8 h-8 rounded-full border" />
                        <span className="text-sm font-medium">{pm.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description & Hours Spent */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-700">Description</h3>
                <p className="text-gray-600 text-base leading-relaxed">{projectInfo.description}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl px-6 py-4 text-right font-semibold text-blue-700 shadow-sm">
                {projectInfo.hoursSpent}/{projectInfo.totalHours} Hrs
              </div>
            </div>

            {/* Right Column Details */}
            <div className="space-y-6 col-span-1">
              {/* Project Details */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Project Details</h2>
                <dl className="divide-y divide-gray-200">
                  {Object.entries(projectData.projectDetails).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    if (key === 'createdBy') {
                      return (
                        <div key={key} className="flex items-center justify-between py-3">
                          <dt className="text-gray-500 text-base">Reported by</dt>
                          <dd className="text-right">
                            <span className="inline-flex items-center gap-2 justify-end">
                              <img src={value.avatar} alt={value.name} className="w-8 h-8 rounded-full" />
                              <span className="text-gray-900 font-medium">{value.name}</span>
                            </span>
                          </dd>
                        </div>
                      );
                    }
                    if (key === 'dueAlert') return null; // Hide dueAlert from this list
                    return (
                      <div key={key} className="flex items-center justify-between py-3">
                        <dt className="text-gray-500 text-base">{label}</dt>
                        <dd className="text-right text-gray-900 font-medium">
                          {key === 'dueDate' ? (
                            <span className="inline-flex items-center gap-2">
                              {value}
                              {projectData.projectDetails.dueAlert > 0 && (
                                <span className="inline-flex items-center justify-center text-xs font-semibold text-white bg-red-500 rounded-md px-2 py-0.5">
                                  {projectData.projectDetails.dueAlert}
                                </span>
                              )}
                            </span>
                          ) : (
                            value
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              {/* Tasks Details */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-auto">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Tasks Details</h2>
                <div>
                  <p className="text-gray-500 text-sm">Tasks Done</p>
                  <p className="text-3xl font-bold mt-1">
                    {projectData.tasksDetails.tasksDone} / {projectData.tasksDetails.totalTasks}
                  </p>
                  <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${projectData.tasksDetails.percentageCompleted}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{projectData.tasksDetails.percentageCompleted}% Completed</p>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section ref={teamRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 scroll-mt-24">
            {/* Team Members List */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-6">Team Members</h2>
              <div className="space-y-4">
                {projectInfo.team.map((member, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedMember(member)}
                    className={`cursor-pointer bg-white p-4 rounded-xl shadow-md flex items-center justify-between hover:bg-gray-50 transition ${selectedMember === member ? 'border-2 border-indigo-500' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full border" />
                      <div>
                        <h3 className="text-lg font-semibold">{member.name}</h3>
                        <p className="text-gray-500 text-sm">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">Performance %</p>
                        <p className={`font-semibold text-base ${index === 0 ? "text-green-500" : "text-orange-500"}`}>
                          {index === 0 ? "85%" : "47%"}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">Status</p>
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border ${index === 0 ? "border-green-500 text-green-500" : "border-orange-500 text-orange-500"}`}>
                          {index === 0 ? "5/5" : "2/5"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Member Details */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-6">Member Details</h2>
              {selectedMember ? (
                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                  <div className="flex items-center gap-4">
                    <img src={selectedMember.avatar} alt={selectedMember.name} className="w-20 h-20 rounded-full border-2 border-indigo-400" />
                    <div>
                      <h3 className="text-2xl font-bold">{selectedMember.name}</h3>
                      <p className="text-indigo-600 font-medium">{selectedMember.role} Developer</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center gap-2 text-sm"><MdEmail /> {selectedMember.email}</p>
                    <p className="flex items-center gap-2 text-sm"><FaPhoneFlip /> Contact: N/A</p>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedMember.description}</p>
                </div>
              ) : (
                <div className="text-gray-500 text-center mt-12 py-10 rounded-xl border border-dashed border-gray-300">
                  Click a team member to view details
                </div>
              )}
            </div>
          </section>

          {/* Tasks Section */}
          <section ref={Tasks} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 scroll-mt-24">
            {/* Task List */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold">Project Tasks</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter new task..."
                    className="flex-grow border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button onClick={addTask} className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600 transition">
                    + Add
                  </button>
                </div>
              </div>
              <ul className="space-y-4">
                {tasks.map((task) => (
                  <li key={task.id} className="border-b last:border-b-0 pb-4">
                    <div onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)} className="flex justify-between items-center cursor-pointer">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500"><LuListCollapse size={20} /></span>
                        <span className="text-lg font-medium text-gray-800">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`${task.statusColor} px-3 py-1 rounded-md text-sm font-semibold`}>
                          {task.status}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-red-500 hover:text-red-700 transition">
                          <RiDeleteBin6Line size={20} />
                        </button>
                      </div>
                    </div>
                    {selectedTask === task.id && (
                      <p className="mt-3 ml-8 text-gray-600 text-sm">{task.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Task Progress Timeline */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-2">Task Progress</h2>
              <p className="text-sm text-gray-500 mb-6">This month <span className="text-green-600 font-semibold">+20%</span></p>
              <ul className="relative border-l border-gray-300 ml-4 pl-6 space-y-6">
                {progress.map((order) => (
                  <li key={order.id} className="relative">
                    <div className={`absolute w-3 h-3 ${order.color} rounded-full -left-9 top-0.5`}></div>
                    <p className="font-medium text-gray-700">{order.title}</p>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </li>
                ))}
              </ul>
              <button onClick={() => setprogress([...progress].reverse())} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 flex items-center justify-center gap-2 transition">
                <IoMdRefresh className="text-2xl" />
                <span className="font-medium">REVERSE ORDER</span>
              </button>
            </div>
          </section>

          {/* Reports Section */}
          <section ref={reportsRef} className="mt-10 mb-20 scroll-mt-24">
            <div className="bg-white p-6 rounded-xl shadow-md">
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
              <div className="p-4 rounded-lg" style={{ background: "linear-gradient(90deg, #1e3a8a, #3b82f6, #60a5fa)" }}>
                {isMounted && ( // Conditional rendering based on isMounted state
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={departmentData[selectedMonth]} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <XAxis dataKey="department" stroke="#fff" />
                      <YAxis domain={[0, 100]} stroke="#fff" />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend wrapperStyle={{ color: "#fff" }} />
                      <Bar dataKey="progress" fill="#ffffff" barSize={40} radius={[5, 5, 0, 0]} barCategoryGap="20%" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className={`fixed top-[210px]  right-0 bottom-0 bg-white shadow-lg border-l transition-all duration-300 z-50 ${open ? "w-42" : "w-16"}`}>
        {/* Toggle Button */}
        <button onClick={() => setOpen(!open)} className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-white border shadow flex items-center justify-center">
          {open ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
        {/* Menu Items */}
        <div className="mt-5 flex flex-col space-y-6 items-center">
          <button onClick={() => scrollToSection(overviewRef)} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-100 w-full justify-center">
            <FaHome className="text-xl text-gray-600" />
            {open && <span className="text-gray-700 font-medium">Overview</span>}
          </button>
          <button onClick={() => scrollToSection(teamRef)} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-100 w-full justify-center">
            <FaUsers className="text-xl text-gray-600" />
            {open && <span className="text-gray-700 font-medium">Team</span>}
          </button>
          <button onClick={() => scrollToSection(Tasks)} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-100 w-full justify-center">
            <FaTasks className="text-xl text-gray-600" />
            {open && <span className="text-gray-700 font-medium">Tasks</span>}
          </button>
          <button onClick={() => scrollToSection(reportsRef)} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-blue-100 w-full justify-center">
            <FaChartBar className="text-xl text-gray-600" />
            {open && <span className="text-gray-700 font-medium">Reports</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;