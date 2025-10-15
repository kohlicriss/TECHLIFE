import React, { useContext, useEffect, useState } from 'react';
import { CircleUserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FaCalendarAlt, FaTrashAlt, FaFileAlt, FaPlus, FaPaperclip, FaUsers, FaRegFolderOpen } from 'react-icons/fa';
import axios from 'axios';
import { Context } from '../HrmsContext';
import classNames from 'classnames';
import { FiDelete, FiEdit } from "react-icons/fi";
import { authApi } from '../../../../axiosInstance';

// --- ProjectCard Data and Component ---
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
      client: "ABC Enterprises",
      totalCost: "$1400",
      DaysToWork: "120 days",
      createdOn: "14 Nov 2024",
      startedOn: "15 Jan 2025",
      endDate: "15 Nov 2025",
      dueAlert: 1,
      Manager: {
        name: "Ramesh",
      },
      priority: "High"
    },
};
const firstColumnData = { Manager: projectData.projectDetails.Manager };
const secondColumnData = {
    client: projectData.projectDetails.client,
    totalCost: projectData.projectDetails.totalCost,
    DaysToWork: projectData.projectDetails.DaysToWork,
    priority: projectData.projectDetails.priority,
    startedOn: projectData.projectDetails.startedOn,
    endDate: projectData.projectDetails.endDate
};
const projectIconMap = {
    "HRMS Project": { icon: "👥", color: "text-indigo-500" },
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
    const currentProject = projects[currentIndex];
    const { icon, color } = projectIconMap[currentProject.name] || { icon: null, color: "" };
    const progressPercent = calculateProgress(projectData.projectDetails.startedOn, projectData.projectDetails.endDate);

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
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Project Overview</h2>
                    
                    {/* Project Progress Bar */}
                    <div className="mb-6">
                        <h3 className={`text-sm font-semibold uppercase ${color} mb-1`}>Timeline Progress</h3>
                        <div className="w-full bg-gray-300 rounded-full h-2.5 dark:bg-gray-700">
                            <motion.div 
                                className={`h-2.5 rounded-full ${color.replace('text', 'bg')}`} 
                                style={{ width: `${progressPercent}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1.5 }}
                            />
                        </div>
                        <p className="text-right text-sm font-medium mt-1">{progressPercent}% Complete</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3 flex flex-col justify-center items-center p-2 border border-dashed rounded-lg   group hover:ring-2 ring-blue-500 transition cursor-pointer">
                            <img src={getAvatarUrl(0)} alt={firstColumnData.Manager.name} className="w-20 h-20 rounded-full mb-2 object-cover ring-2 ring-blue-500" />
                            <p className="text-lg font-semibold ">{firstColumnData.Manager.name}</p>
                            <p className="text-sm text-gray-500">Project Manager</p>
                            <div className="flex gap-2 mt-2 text-sm">
                                <a href={`mailto:${currentProject.managerContact.email}`} className="text-blue-500 hover:underline">📧 Email</a>
                                <a href={`tel:${currentProject.managerContact.phone}`} className="text-green-500 hover:underline">📞 Call</a>
                            </div>
                        </div>

                        {/* Project Details Grid */}
                        <div className="md:w-2/3 grid grid-cols-2 gap-y-4 gap-x-2">
                            {Object.entries(secondColumnData).map(([key, value]) => {
                                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return (
                                    <div key={key} className="p-1">
                                        <dt className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs font-medium uppercase`}>{label}</dt>
                                        <dd className={`mt-1 text-md font-bold ${key === 'priority' ? 'text-red-500' : theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{value}</dd>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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

const Form = ({ label, theme, placeholder, type = 'text', ...props }) => {
    // Standard input styling based on theme
    const inputClasses = theme === 'dark' 
        ? 'border-gray-600 bg-gray-700 text-white' 
        : 'border-gray-300 bg-white text-gray-800';

    return (
        <div className='relative'>
            {/* The label is now placed normally, instead of using the complex absolute positioning */}
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {label}
            </label>
            <input 
                type={type} 
                placeholder={placeholder} 
                {...props} 
                className={`w-full px-4 py-2 border rounded-lg transition duration-300 text-sm 
                    focus:ring-2 focus:ring-green-600/40 focus:border-green-600 focus:outline-none 
                    ${inputClasses}`} 
            />
        </div>
    );
};
// --- ProjectStatus Data and Component ---
function ProjectStatus() {
    const { userData,theme } = useContext(Context);
    const role = (userData?.roles?.[0] || "").toUpperCase();
    const showSidebar = ["TEAM_LEAD", "HR", "MANAGER","ADMIN"].includes(role);
    const COLORS = ["#4f46e5", "#059669", "#f59e0b", "#10b981", "#ec4899", "#0ea5e9"];

    const [loggedPermissiondata,setLoggedPermissionData]=useState([]);
          const [matchedArray,setMatchedArray]=useState(null);
           const LoggedUserRole=userData?.roles[0]?`ROLE_${userData?.roles[0]}`:null
    
    
           useEffect(()=>{
             let fetchedData=async()=>{
                     let response = await authApi.get(`role-access/${LoggedUserRole}`);
                     console.log("from Project Status :",response.data);
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

    const projectstatusData = [
        { Project_id: "P_01", Project_name: "HRMS Project", Status: 80, Duration: "5 Months" },
        { Project_id: "P_02", Project_name: "Employee Self-Service App", Status: 55, Duration: "6 Months" },
        { Project_id: "P_03", Project_name: "Payroll Automation", Status: 90, Duration: "5 Months" },
        { Project_id: "P_04", Project_name: "Attendance System Upgrade", Status: 67, Duration: "1 Months" },
        { Project_id: "P_05", Project_name: "AI-Based Recruitment Tool", Status: 77, Duration: "6 Months" },
        { Project_id: "P_06", Project_name: "Internal Chatbot System", Status: 41, Duration: "4 Months" }
    ];

    const [teamData, setTeamData] = useState(projectstatusData);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ Project_id: "", Project_name: "", Status: "", Duration: "" });
    const [editIndex, setEditIndex] = useState(null);

    const handleAddOrEdit = (e) => {
        e.preventDefault();
        if (editIndex !== null) {
            setTeamData(prev =>
                prev.map((item, idx) => idx === editIndex ? formData : item)
            );
        } else {
            setTeamData(prev => [...prev, formData]);
        }
        setShowForm(false);
        setFormData({ Project_id: "", Project_name: "", Status: "", Duration: "" });
        setEditIndex(null);
    };

    const handleEdit = (idx) => {
        setFormData(teamData[idx]);
        setEditIndex(idx);
        setShowForm(true);
    };

    const handleDelete = (idx) => {
        setTeamData(prev => prev.filter((_, i) => i !== idx));
    };

     return (
        <motion.div
            className={`p-6  rounded-lg shadow-xl border border-green-500 h-full overflow-hidden ${theme==='dark' ? 'bg-gray-700':'bg-gradient-to-br from-green-10 to-green-50'} `}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold text-green-800 ${theme==='dark' ? 'bg-gradient-to-br from-green-100 to-green-400 bg-clip-text text-transparent ':''}`}>Project Status Overview</h2>
                {(matchedArray || []).includes("UPDATE_PROJSTATUS") && (
                    <motion.button
                        className={`flex items-center ${theme==='dark'?'bg-gray-500 text-green-500':'bg-green-50 text-green-700'} border border-green-500 font-bold py-2 px-4 rounded-xl shadow transition`}
                        onClick={() => { setShowForm(true); setFormData({ Project_id: "", Project_name: "", Status: "", Duration: "" }); setEditIndex(null); }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaPlus className="mr-2" /> Update Status
                    </motion.button>
                )}
            </div>
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
                // Professional width and clean background classes
                className={`w-full max-w-lg rounded-3xl shadow-2xl  relative ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                onSubmit={handleAddOrEdit}
                initial={{ scale: 0.8, y: -50 }} // Smoother animation
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: -50 }}
                transition={{ duration: 0.3 }}
                // Prevent modal closure when clicking inside
                onClick={(e) => e.stopPropagation()}
            > 
                {/* Professional Header - Using Green/Teal for "Status/Project" theme */}
                <div className="text-center rounded-t-3xl p-6 bg-gradient-to-r from-green-500 to-teal-600">
                    <h3 className="text-2xl font-extrabold text-white flex items-center justify-center space-x-3"> 
                        {/* Using a clear icon (assuming you have access to a project/check icon) */}
                        <i className="fas fa-tasks mr-2"></i>
                        <span>{editIndex !== null ? "Edit Project Status" : "Update Project Status"}</span>
                    </h3> 
                    <p className="text-sm text-white/90 mt-1">Submit the current progress and estimated duration.</p>
                </div>

                <div className="space-y-6 p-8">
                    <div className="grid grid-cols-1 gap-6">
                        
                        {/* 1. Project ID */}
                        <Form 
                            label="Project ID"
                            theme={theme}
                            placeholder="e.g., PROJ-2025-001" 
                            value={formData.Project_id} 
                            onChange={e => setFormData({ ...formData, Project_id: e.target.value })} 
                            required 
                        />
                        
                        {/* 2. Project Name */}
                        <Form 
                            label="Project Name"
                            theme={theme}
                            placeholder="e.g., HRMS Deployment" 
                            value={formData.Project_name} 
                            onChange={e => setFormData({ ...formData, Project_name: e.target.value })} 
                            required 
                        />
                        
                        {/* 3. Status (%) */}
                        <Form 
                            label="Status Percentage (%)"
                            theme={theme}
                            type="number" 
                            placeholder="0 to 100" 
                            value={formData.Status} 
                            onChange={e => setFormData({ ...formData, Status: e.target.value })} 
                            required 
                            min="0"
                            max="100"
                        />
                        
                        {/* 4. Duration */}
                        <Form 
                            label="Estimated Duration (e.g., 4 weeks)"
                            theme={theme}
                            type="text" 
                            placeholder="e.g., 4 Weeks Remaining" 
                            value={formData.Duration} 
                            onChange={e => setFormData({ ...formData, Duration: e.target.value })} 
                            required 
                        />
                    </div>
                    
                    {/* Action Buttons - Professional Footer */}
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
                            className="px-5 py-2.5 rounded-lg border border-transparent bg-green-600 text-sm font-semibold text-white shadow-md hover:bg-green-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {editIndex !== null ? "Update Status" : "Add Status"}
                        </motion.button>
                    </div>
                </div>
            </motion.form>
        </motion.div>
    )}
</AnimatePresence>
            
    {/* Table container with responsive overflow */}
    <div className="overflow-x-auto rounded-xl">
        <table className={`min-w-full  divide-y divide-gray-200  `}>
            <thead className="">
                <tr className={`text-left  w-full text-sm  uppercase  tracking-wider ${theme==='dark'?'bg-gray-500 text-white  ':'bg-green-50 text-green-700'}`}>
                    <th className="py-2 px-4 font-semibold">Project ID</th>
                    <th className="py-2 px-4 font-semibold">Project Name</th>
                    <th className="py-2 px-4 font-semibold">Duration</th>
                    <th className="py-2 px-4 font-semibold">Status</th>
                    {(matchedArray || []).includes("EDIT_PROJSTATUS") && <th className="py-2 px-4 ">Edit</th>}
                    {(matchedArray || []).includes("DELETE_PROJSTATUS") && <th className="py-2 px-4 ">Delete</th>}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-500">
                <AnimatePresence mode="wait">
                    {teamData.map((project, index) => (
                        <motion.tr
                            key={project.Project_id}
                            className="border-t border-gray-100 hover:bg-gray-50"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <td className={`py-2 px-4  whitespace-nowrap text-sm ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>{project.Project_id}</td>
                           <td className={`py-2 px-4   whitespace-nowrap text-sm ${theme==='dark' ?  'bg-gray-500  text-gray-200':''}`}>{project.Project_name}</td>
                            <td className={`py-2 px-4 whitespace-nowrap  text-sm ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>{project.Duration}</td>
                            <td className={`py-2 px-4  whitespace-nowrap  w-32 flex items-center ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>
                                <ResponsiveContainer width="75%" height={25}>
                                    <BarChart
                                        layout="vertical"
                                        data={[{ name: project.Project_name, value: Number(project.Status) }]}
                                        margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis type="category" dataKey="name" hide />
                                        <Tooltip formatter={(value) => `${value}%`} />
                                        <Bar dataKey="value" radius={[5, 5, 5, 5]}>
                                            <Cell fill={COLORS[index % COLORS.length]} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                                <span className={`text-xs  ml-2 ${theme==='dark' ? 'text-gray-200':'text-gray-600'}`}>{project.Status}%</span>
                            </td>
                            {(matchedArray || []).includes("EDIT_PROJSTATUS") && (
                                <td className={`py-2 px-4  whitespace-nowrap ${theme==='dark' ? 'bg-gray-500 ':''}`}>
                                    <button className={`${theme==='dark'?'text-indigo-200':'text-indigo-600'} hover:text-indigo-800 font-small`}  onClick={() => handleEdit(index)}><FiEdit className='w-5 h-5'/></button>
                                </td>
                            )}
                            {(matchedArray || []).includes("DELETE_PROJSTATUS") && (
                                <td className={`py-2 px-4  whitespace-nowrap  ${theme==='dark' ? 'bg-gray-500 ':''}`}>
                                    <button className={`${theme==='dark'?'text-red-200':'text-red-600'} hover:text-red-800 font-small`}   onClick={() => handleDelete(index)}><FiDelete className='w-5 h-5'/></button>
                                </td>
                            )}
                        </motion.tr>
                    ))}
                </AnimatePresence>
            </tbody>
        </table>
    </div>
        </motion.div>
    );
}

const Forms = ({ label, theme, placeholder, type = 'text', children, className = '', ...props }) => {
    // Standard input styling based on theme
    const inputClasses = theme === 'dark' 
        ? 'border-gray-600 bg-gray-700 text-white' 
        : 'border-gray-300 bg-white text-gray-800';

    const inputStyle = `w-full px-4 py-3 border rounded-lg transition duration-300 text-sm 
                        focus:ring-2 focus:ring-purple-600/40 focus:border-purple-600 focus:outline-none 
                        ${inputClasses} ${className}`;

    return (
        <div className='relative'>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {label}
            </label>
            {type === 'textarea' ? (
                <textarea 
                    placeholder={placeholder} 
                    {...props} 
                    className={`${inputStyle} min-h-[100px]`} 
                />
            ) : type === 'select' ? (
                 <select 
                    {...props} 
                    className={`${inputStyle} appearance-none h-12`}
                 >
                    {children}
                 </select>
            ) : (
                <input 
                    type={type} 
                    placeholder={placeholder} 
                    {...props} 
                    className={inputStyle} 
                />
            )}
        </div>
    );
};
// ...existing code...
function Project() {
    const { userData,theme } = useContext(Context);
    const role = (userData?.roles?.[0] || "").toUpperCase();
    const showSidebar = ["TEAM_LEAD", "HR", "MANAGER","ADMIN"].includes(role);

    const [loggedPermissiondata,setLoggedPermissionData]=useState([]);
          const [matchedArray,setMatchedArray]=useState(null);
           const LoggedUserRole=userData?.roles[0]?`ROLE_${userData?.roles[0]}`:null
    
    
           useEffect(()=>{
             let fetchedData=async()=>{
                     let response = await authApi.get(`role-access/${LoggedUserRole}`);
                     console.log("from Projects :",response.data);
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

    const [projectTableData, setProjectTableData] = useState([
        {project_id: "P_01",project_name: "HRMS Project",status: "Ongoing",start_date: "2025-05-01",end_date: "2025-09-30",Team_Lead:"Naveen",                  Priority: "High",Open_task: 30,Closed_task: 25,Details: "https://www.flaticon.com/free-icon/document_16702688"},
        { project_id: "P_02",project_name: "Employee Self-Service App", status: "Upcoming", start_date: "2025-10-15", end_date: "2025-12-15",Team_Lead:"Rajiv",  Priority: "Medium", Open_task: 20, Closed_task: 10, Details: "https://www.flaticon.com/free-icon/document_16702688" },
        {project_id: "P_03",project_name: "Payroll Automation",status: "Completed",start_date: "2024-10-01",end_date: "2025-02-15",Team_Lead:"Manikanta",       Priority: "High",Open_task: 12,Closed_task: 10,Details: "https://www.flaticon.com/free-icon/document_16702688"},
        {project_id: "P_04",project_name: "Attendance System Upgrade",status: "Ongoing",start_date: "2025-05-10",end_date: "2025-08-10",Team_Lead:"Ravinder",   Priority: "Low",Open_task: 40,Closed_task: 25,Details: "https://www.flaticon.com/free-icon/document_16702688" },
        {project_id: "P_05",project_name: "AI-Based Recruitment Tool",status: "Upcoming",start_date: "2025-12-01",end_date: "2026-02-28",Team_Lead:"Sravani",   Priority: "Medium",Open_task: 20,Closed_task: 15,Details: "https://www.flaticon.com/free-icon/document_16702688"},
        {project_id: "P06",project_name: "Internal Chatbot System",status: "Completed",start_date: "2024-05-01",end_date: "2024-11-30",Team_Lead:"Gayatri",     Priority: "High",Open_task: 30,Closed_task: 25,Details: "https://www.flaticon.com/free-icon/document_16702688"}]);

    const teamLeadImageMap = {
        Naveen: "https://i.pravatar.cc/40?img=1",
        Rajiv: "https://i.pravatar.cc/40?img=2",
        Manikanta: "https://i.pravatar.cc/40?img=3",
        Ravinder: "https://i.pravatar.cc/40?img=4",
        Sravani: "https://i.pravatar.cc/40?img=5",
        Gayatri: "https://i.pravatar.cc/40?img=6"
    };


    const getPriorityColor = (priority) => {
        switch (priority) {case "High":return "bg-green-100 text-green-800";case "Medium":return "bg-orange-100 text-orange-800";case "Low": return "bg-red-100 text-red-800";default:return "bg-gray-100 text-gray-800";}};
    const getStatusColor = (status) => {
        switch (status) {case "In Progress":    return "bg-green-100 text-green-800";case "Ongoing": return "bg-blue-100 text-blue-800";case "Upcoming": return "bg-yellow-100 text-yellow-800";case "Completed": return "bg-purple-100 text-purple-800";default: return "bg-gray-100 text-gray-800";} };
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newProject, setNewProject] = useState({
        project_id: "",
        project_name: "",
        status: "Ongoing",
        start_date: "",
        end_date: "",
        team_Lead:"",
        Priority: "Medium",
        Open_task: 0,
        Closed_task: 0,
        rating: "",
        remark: "",
        completionNote: "",
        relatedLinks: [""],
        attachedFileLinks: [],
    });
    const [files, setFiles] = useState([]);
    const handleCreateProject = (e) => {
        e.preventDefault();
        setProjectTableData(prev => [
            ...prev,
            { ...newProject, project_id: `P_${prev.length + 1}`, attachedFileLinks: files }
        ]);
        setShowCreateForm(false);
        setNewProject({
            project_id: "",
            project_name: "",
            status: "Ongoing",
            start_date: "",
            end_date: "",
            team_Lead:"",
            Priority: "Medium",
            Open_task: 0,
            Closed_task: 0,
            rating: "",
            remark: "",
            completionNote: "",
            relatedLinks: [""],
            attachedFileLinks: [],
        });
        setFiles([]);
    };

    const handleFileChange = (e) => {
        setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRelatedLinkChange = (index, value) => {
        const newLinks = [...newProject.relatedLinks];
        newLinks[index] = value;
        setNewProject(prev => ({ ...prev, relatedLinks: newLinks }));
    };

    const addRelatedLink = () => {
        setNewProject(prev => ({ ...prev, relatedLinks: [...prev.relatedLinks, ""] }));
    };

    const removeRelatedLink = (index) => {
        setNewProject(prev => ({
            ...prev,
            relatedLinks: prev.relatedLinks.filter((_, i) => i !== index)
        }));
    };
    const [editProjectIndex, setEditProjectIndex] = useState(null);
const [editProjectData, setEditProjectData] = useState(null);

const handleEditProject = (idx) => {
    setEditProjectIndex(idx);
    setEditProjectData(projectTableData[idx]);
    setShowEditForm(true);
};

const handleDeleteProject = (idx) => {
    setProjectTableData(prev => prev.filter((_, i) => i !== idx));
};

const [showEditForm, setShowEditForm] = useState(false);

const handleUpdateProject = (e) => {
    e.preventDefault();
    setProjectTableData(prev =>
        prev.map((proj, idx) => idx === editProjectIndex ? editProjectData : proj)
    );
    setShowEditForm(false);
    setEditProjectIndex(null);
    setEditProjectData(null);
};
 const [statusFilter, setStatusFilter] = useState("All");
   const navigate = useNavigate();
const handleRowClick = (proj) => {
    navigate(`/project-details/${proj.project_id}`, { state: { project: proj } });
};
    return (
        <motion.div
            className={`p-6  rounded-2xl shadow-xl border border-purple-500 overflow-x-auto relative ${theme==='dark' ? 'bg-gray-700':'bg-gradient-to-br from-purple-10 to-purple-50 '}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold text-purple-800 ${theme==='dark' ? 'bg-gradient-to-br from-purple-100 to-purple-400 bg-clip-text text-transparent ':''}`}>
                    Project Overview</h2>
                    {(matchedArray || []).includes("CREATE_PROJECT") && (
                    <motion.button
                        className={`  flex items-center ${theme==='dark'?'bg-gray-500 text-purple-500':'bg-purple-50 text-purple-700'}  font-bold py-2 px-4 rounded-xl border border-purple-500 shadow transition`}
                        onClick={() => setShowCreateForm(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaPlus className="mr-2" /> Create Project
                    </motion.button>
                )}
                     </div>
                    <div>
                    <select
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value)}
                       className={`${theme==='dark'?'bg-gray-500 text-purple-500':'bg-purple-50  text-purple-700'} border border-purple-500   font-medium rounded-xl px-4 py-2 text-sm shadow   shadow transition`}
                    >
                     <option value="All" className={` ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-black'}`}>Select All</option>
                     <option value="Ongoing" className={` ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-black'}`}>Ongoing</option>
                     <option value="Upcoming" className={` ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-black'}`}>Upcoming</option>
                     <option value="Completed"className={` ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-black'}`}>Completed</option>
                   </select>
            </div>
            {/* Full-page overlay for the form */}
            <AnimatePresence>
    {showCreateForm && (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Allow closing by clicking backdrop
            onClick={() => setShowCreateForm(false)} 
        >
            <motion.div 
                className="relative w-full max-w-xl mx-auto my-auto max-h-[90vh] overflow-y-auto transform transition-all duration-300"
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()} // Prevent closure when clicking inside
            >
                <motion.form
                    className={`w-full max-w-xl rounded-3xl shadow-2xl  relative ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} `}
                    onSubmit={handleCreateProject}
                >
                    {/* Professional Header */}
                    <div className="text-start rounded-t-3xl p-6 bg-gradient-to-r from-purple-600 to-indigo-700">
                        <h3 className="text-2xl font-extrabold text-white flex items-center space-x-3"> 
                            <i className="fas fa-rocket mr-2"></i> <span>Create New Project</span>
                        </h3>
                        <p className="text-sm text-white/90 mt-1">Define project scope, timeline, and initial resources.</p>
                    </div>

                    <div className="space-y-6 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            
                            {/* Row 1: Project Name & Team Lead */}
                            <Forms 
                                label="Project Name"
                                theme={theme}
                                placeholder="e.g., Q3 HRMS Update"
                                value={newProject.project_name}
                                onChange={e => setNewProject({ ...newProject, project_name: e.target.value })}
                                required
                            />
                            <Forms 
                                label="Team Lead (Name & Image URL)"
                                theme={theme}
                                placeholder="Name + Profile image URL"
                                value={newProject.team_Lead} // Assuming a state field named team_lead exists
                                onChange={e => setNewProject({ ...newProject, team_lead: e.target.value })} // Adjust state key if needed
                                required
                            />

                            {/* Row 2: Status & Priority */}
                            <Forms 
                                label="Project Status"
                                theme={theme}
                                type="select"
                                value={newProject.status}
                                onChange={e => setNewProject({ ...newProject, status: e.target.value })}
                            >
                                <option value="" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Select Status</option>
                                <option value="Ongoing" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Ongoing</option>
                                <option value="Upcoming" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Upcoming</option>
                                <option value="Completed" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Completed</option>
                            </Forms>
                            <Forms 
                                label="Project Priority"
                                theme={theme}
                                type="select"
                                value={newProject.Priority}
                                onChange={e => setNewProject({ ...newProject, Priority: e.target.value })}
                            >
                                <option value="" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Select Priority</option>
                                <option value="High" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>High</option>
                                <option value="Medium" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Medium</option>
                                <option value="Low" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Low</option>
                            </Forms>

                            {/* Row 3: Dates */}
                            <Forms 
                                label="Start Date"
                                theme={theme}
                                type="date"
                                value={newProject.start_date}
                                onChange={e => setNewProject({ ...newProject, start_date: e.target.value })}
                                required
                            />
                            <Forms 
                                label="End Date"
                                theme={theme}
                                type="date"
                                value={newProject.end_date}
                                onChange={e => setNewProject({ ...newProject, end_date: e.target.value })}
                                required
                            />

                            {/* Row 4: Tasks & Rating */}
                            <Forms 
                                label="Open Tasks"
                                theme={theme}
                                type="number"
                                placeholder="0"
                                value={newProject.Open_task}
                                onChange={e => setNewProject({ ...newProject, Open_task: Number(e.target.value) })}
                            />
                             <Forms 
                                label="Closed Tasks"
                                theme={theme}
                                type="number"
                                placeholder="0"
                                value={newProject.Closed_task}
                                onChange={e => setNewProject({ ...newProject, Closed_task: Number(e.target.value) })}
                            />
                             <Forms 
                                label="Project Rating (1-5)"
                                theme={theme}
                                type="number"
                                placeholder="1-5"
                                min="1"
                                max="5"
                                value={newProject.rating}
                                onChange={e => setNewProject({ ...newProject, rating: e.target.value })}
                            />
                        </div>

                        {/* Textareas: Full width, better labeled */}
                        <Forms 
                            label="Employee Team / Members (Comma Separated)"
                            theme={theme}
                            type="textarea"
                            placeholder="List team members, e.g., Alice, Bob, Charlie"
                            value={newProject.Employee_team}
                            onChange={e => setNewProject({ ...newProject, Employee_team: e.target.value })}
                        />
                        <Forms 
                            label="Remark / Internal Notes"
                            theme={theme}
                            type="textarea"
                            placeholder="Add any internal remarks or dependencies here."
                            value={newProject.remark}
                            onChange={e => setNewProject({ ...newProject, remark: e.target.value })}
                        />
                        <Forms 
                            label="Completion Note (Visible upon closure)"
                            theme={theme}
                            type="textarea"
                            placeholder="Final notes on project closure."
                            value={newProject.completionNote}
                            onChange={e => setNewProject({ ...newProject, completionNote: e.target.value })}
                        />

                        {/* Related Links & Attachments */}
                        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {/* Related Links Block (Preserving your dynamic logic) */}
                            <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Related Links:</label>
                            {newProject.relatedLinks.map((link, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <input
                                        type="url"
                                        value={link}
                                        onChange={e => handleRelatedLinkChange(index, e.target.value)} // Assuming this function exists
                                        className={FormInput({ theme }).inputStyle} // Reuse general input style
                                        placeholder="Enter related link URL"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeRelatedLink(index)} // Assuming this function exists
                                        className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50 transition"
                                        disabled={newProject.relatedLinks.length === 1}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addRelatedLink} // Assuming this function exists
                                className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm transition"
                            >
                                <FaPlus className="mr-1 w-4 h-4" /> Add Related Link
                            </button>

                            {/* Attach Files Block (Preserving your dynamic logic) */}
                            <label className={`block text-sm font-medium pt-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Attach Files:</label>
                            <div className="flex items-center space-x-3">
                                <label className="flex items-center cursor-pointer px-4 py-2 border border-gray-400 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                    <i className="fas fa-paperclip mr-2"></i> Choose File(s)
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange} // Assuming this function exists
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-sm italic text-gray-500 dark:text-gray-400">{files.length > 0 ? `${files.length} file(s) attached` : "No files selected."}</p>
                            </div>
                            {files.length > 0 && ( // Display attached files list
                                <ul className="space-y-1 mt-2 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 max-h-32 overflow-y-auto">
                                    {files.map((file, index) => (
                                        <li key={index} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-800 dark:text-gray-200 truncate" title={file.name}>{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)} // Assuming this function exists
                                                className="text-red-500 hover:text-red-700 ml-2"
                                                aria-label={`Remove ${file.name}`}
                                            >
                                                <FaTrashAlt className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 -mx-8 px-8">
                            <motion.button
                                type="button"
                                className="px-5 py-2.5 rounded-lg border text-sm font-semibold shadow-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                onClick={() => setShowCreateForm(false)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                type="submit"
                                className="px-5 py-2.5 rounded-lg border border-transparent bg-purple-600 text-sm font-semibold text-white shadow-md hover:bg-purple-700 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Create Project
                            </motion.button>
                        </div>
                    </div>
                </motion.form>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>
            <AnimatePresence>
    {showEditForm && (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Allow closing by clicking backdrop
            onClick={() => setShowEditForm(false)}
        >
            <motion.form
                // Reduced max-width for simpler edit form
                className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                onSubmit={handleUpdateProject}
                initial={{ scale: 0.8, y: -50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: -50 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Professional Header */}
                <div className="text-center rounded-t-3xl p-6 bg-gradient-to-r from-purple-500 to-fuchsia-600">
                    <h3 className="text-2xl font-extrabold text-white flex items-center justify-center space-x-3">
                        <i className="fas fa-edit mr-2"></i> <span>Edit Project</span>
                    </h3>
                    <p className="text-sm text-white/90 mt-1">Modify core details and progress metrics.</p>
                </div>

                <div className="space-y-6 p-8">
                    <div className="grid grid-cols-1 gap-y-4 gap-x-6">
                        
                        {/* 1. Project Name */}
                        <Forms
                            label="Project Name"
                            theme={theme}
                            placeholder="Project Name"
                            value={editProjectData?.project_name || ""}
                            onChange={e => setEditProjectData({ ...editProjectData, project_name: e.target.value })}
                            required
                        />

                        {/* 2. Status & Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <Forms
                                label="Status"
                                theme={theme}
                                type="select"
                                value={editProjectData?.status || ""}
                                onChange={e => setEditProjectData({ ...editProjectData, status: e.target.value })}
                            >
                                <option value="" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Select Status</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Completed">Completed</option>
                            </Forms>
                             <Forms
                                label="Priority"
                                theme={theme}
                                type="select"
                                value={editProjectData?.Priority || ""}
                                onChange={e => setEditProjectData({ ...editProjectData, Priority: e.target.value })}
                            >
                                <option value="" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Select Priority</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </Forms>
                        </div>
                        
                        {/* 3. Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <Forms
                                label="Start Date"
                                theme={theme}
                                type="date"
                                value={editProjectData?.start_date || ""}
                                onChange={e => setEditProjectData({ ...editProjectData, start_date: e.target.value })}
                                required
                            />
                            <Forms
                                label="End Date"
                                theme={theme}
                                type="date"
                                value={editProjectData?.end_date || ""}
                                onChange={e => setEditProjectData({ ...editProjectData, end_date: e.target.value })}
                                required
                            />
                        </div>

                        {/* 4. Tasks */}
                        <div className="grid grid-cols-2 gap-4">
                            <Forms
                                label="Open Tasks"
                                theme={theme}
                                type="number"
                                placeholder="Open Tasks"
                                value={editProjectData?.Open_task || 0}
                                onChange={e => setEditProjectData({ ...editProjectData, Open_task: Number(e.target.value) })}
                            />
                            <Forms
                                label="Closed Tasks"
                                theme={theme}
                                type="number"
                                placeholder="Closed Tasks"
                                value={editProjectData?.Closed_task || 0}
                                onChange={e => setEditProjectData({ ...editProjectData, Closed_task: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 -mx-8 px-8">
                        <motion.button
                            type="button"
                            className="px-5 py-2.5 rounded-lg border text-sm font-semibold shadow-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                            onClick={() => setShowEditForm(false)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            type="submit"
                            className="px-5 py-2.5 rounded-lg border border-transparent bg-fuchsia-600 text-sm font-semibold text-white shadow-md hover:bg-fuchsia-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Update Project
                        </motion.button>
                    </div>
                </div>
            </motion.form>
        </motion.div>
    )}
</AnimatePresence>
          <div className="overflow-x-auto rounded-xl  ">
            <table className="min-w-full bg-white  ">
                <thead className={` text-left uppercase tracking-wider ${theme==='dark' ? 'bg-gray-500 text-white':'bg-purple-50 text-purple-700'}`}>
                    <tr>
                        <th className="p-3 text-sm md:text-base">Project</th>
                        <th className="p-3 text-sm md:text-base">Team_Lead</th>
                        <th className="p-3 text-sm md:text-base"><FaCalendarAlt className="inline mr-1" />Start</th>
                        <th className="p-3 text-sm md:text-base"><FaCalendarAlt className="inline mr-1" />End</th>
                        <th className="p-3 text-sm md:text-base">Priority</th>
                        <th className="p-3 text-sm md:text-base">Status</th>
                        <th className="p-3 text-sm md:text-base">Open Task</th>
                        <th className="p-3 text-sm md:text-base">Closed Task</th>
                        <th className="p-3 text-sm md:text-base">Details</th>
                        {(matchedArray || []).includes("DELETE_PROJECTS") &&<th className="p-3 text-sm md:text-base">Delete</th>}
                    </tr>
                </thead>
                <tbody  className="bg-white ">
                    <AnimatePresence>
                        {projectTableData.filter((proj)=>statusFilter==="All"||proj.status===statusFilter)
                        .map((proj, index) => (
                            <motion.tr
                                key={proj.project_id}
                                className="border-t border-gray-100 hover:bg-gray-50"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                 onClick={() => handleRowClick(proj)}
                            >
                                <td className={`p-3 text-sm md:text-base font-semibold ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}> {proj.project_name}</td>
                                <td className={`p-3 text-sm md:text-base font-semibold ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}> 
                                     <motion.img
                                            src={teamLeadImageMap[proj.Team_Lead] || "https://i.pravatar.cc/40?img=19"} // Fallback image
                                            alt={proj.Team_Lead}
                                            className="w-8 h-8 md:w-8 md:h-8 rounded-full border-2 border-white shadow-sm inline-block mr-2"
                                            whileHover={{ scale: 1.1, translateY: -5, zIndex: 10 }}
                                        />
                                        {proj.Team_Lead}
                                    
                                </td>
                                <td className={`p-3 text-sm md:text-base ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>{proj.start_date}</td>
                                <td className={`p-3 text-sm md:text-base ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>{proj.end_date}</td>
                                <td className={`p-3 ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>
                                    <select value={proj.Priority} onChange={e => {proj.Priority = e.target.value}} onClick={e => { e.stopPropagation()}} className={`px-3 py-1 rounded text-xs font-medium shadow cursor-pointer ${
                                          proj.Priority === "High"
                                            ? "bg-red-100 text-red-700"
                                            : proj.Priority === "Medium"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-green-100 text-green-700"
                                        }`}
                                    >
                                     <option value="High" className="text-red-600 ">🔴 High </option>
                                     <option value="Medium" className="text-yellow-600">🟡 Medium </option>
                                     <option value="Low" className="text-green-600"> 🟢 Low </option>
                                 </select>
                                </td>
                                <td className={`p-3 ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>
                                    <select value={proj.status} onChange={e => {proj.status = e.target.value}} onClick={e => { e.stopPropagation()}}  className={`px-3 py-1 rounded text-xs font-medium shadow cursor-pointer ${
                                          proj.status === "Ongoing"
                                            ? "bg-blue-100 text-blue-700"
                                            : proj.status === "Upcoming"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-purple-100 text-purple-700"
                                        }`}
                                    >
                                     <option value="Ongoing" className="text-blue-600 ">🔵 Ongoing</option>
                                     <option value="Upcoming" className="text-yellow-600">🟡 Upcoming</option>
                                     <option value="Completed" className="text-blue-600">🟣 Completed</option>
                                 </select>
                                </td>
                                <td className={`p-3 text-sm md:text-base ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>{proj.Open_task}</td>
                                <td className={`p-3 text-sm md:text-base ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>{proj.Closed_task}</td>          
                             <td className={`p-3 text-center ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}><a href={proj.Details} target="_blank" rel="noopener noreferrer"><motion.div whileHover={{ scale: 1.2 }}> <FaFileAlt className={` ${theme==='dark' ? 'text-blue-200':'text-blue-600'} text-lg inline w-6 h-6 md:w-6 md:h-6 transition`} /> </motion.div></a></td>
                            {(matchedArray || []).includes("DELETE_PROJECT") && (
                                <td className={`p-3 text-center ${theme==='dark' ? 'bg-gray-500 text-gray-200':''}`}>
                                    <motion.button
                                        whileHover={{ scale: 1.2 }}
                                        onClick={e => { e.stopPropagation(); handleEditProject(index); }}
                                    >
                                        <FiEdit className={` ${theme==='dark' ? 'text-blue-200':'text-blue-600'} text-lg w-3 h-3 md:w-5 md:h-5 transition`} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.2 }}
                                       onClick={e => { e.stopPropagation(); handleDeleteProject(index); }}
                                        className="ml-2"
                                    >
                                        <FaTrashAlt className={`${theme==='dark' ? 'text-red-200':'text-red-600'} text-lg w-3 h-3 md:w-5 md:h-5 transition`} />
                                    </motion.button>
                                </td>
                            )}
                            </motion.tr>
                            ))}
                    </AnimatePresence>
                </tbody>
            </table>
            </div>
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