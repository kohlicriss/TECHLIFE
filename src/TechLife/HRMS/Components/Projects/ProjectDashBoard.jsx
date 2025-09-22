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
        duration: "12 months"
    },
    {
        name: "Employee Self-Service App",
        description: "The Employee Self-Service App is a user-friendly platform that empowers employees to independently manage their personal, professional, and administrative tasks. It reduces HR workload by allowing employees to access and update their records, apply for leaves, view payslips, and track attendance—all from a mobile or web interface.",
        team: [
            { role: "Product Owner", avatars: [1] },
            { role: "Mobile Developers", avatars: [2] },
            { role: "Web Developer", avatars: [3] },
            { role: "QA Tester", avatars: [1] },
        ],
        duration: "6 months"
    },
    {
        name: "Payroll Automation",
        description: "The Payroll Automation system is designed to streamline and automate the entire payroll process, ensuring accurate, timely, and compliant salary disbursements. It eliminates manual calculations and reduces errors by integrating attendance, leaves, tax regulations, and employee benefits into a seamless payroll workflow",
        team: [
            { role: "Lead Developer", avatars: [1] },
            { role: "Backend Developers", avatars: [3] },
            { role: "QA Engineer", avatars: [1] },
            { role: "Business Analyst", avatars: [1] },
        ],
        duration: "9 months"
    },
    {
        name: "Attendance System Upgrade",
        description: "The Attendance System Upgrade modernizes and enhances the organization’s time-tracking infrastructure. It introduces advanced features like biometric integration, real-time monitoring, geo-tagging, and seamless syncing with payroll and HR modules—ensuring higher accuracy, reduced time theft, and improved workforce accountability.",
        
        team: [
            { role: "System Architect", avatars: [1] },
            { role: "Software Engineers", avatars: [2] },
            { role: "Hardware Integration Specialist", avatars: [1] },
            { role: "QA Tester", avatars: [1] },
        ],
        duration: "7 months"
    },
    {
        name: "AI-Based Recruitment Tool",
        description: " The AI-Based Recruitment Tool is an intelligent hiring platform that leverages machine learning and natural language processing to automate and optimize the recruitment lifecycle. From resume screening to candidate ranking and interview scheduling, it reduces time-to-hire, eliminates bias, and enhances talent acquisition efficiency.",
       
        team: [
            { role: "AI/ML Engineer", avatars: [1] },
            { role: "Data Scientists", avatars: [1] },
            { role: "Full-stack Developers", avatars: [1] },
            { role: "UX Designer", avatars: [1] },
        ],
        duration: "10 months"
    },
    {
        name: "Internal Chatbot System",
        description: "The Internal Chatbot System is an AI-driven virtual assistant designed to support employees with instant responses to HR, IT, and general organizational queries. Integrated within the company’s intranet or collaboration tools, it enhances internal communication, reduces manual support workload, and provides 24/7 self-service access to information.",
       
        team: [
            { role: "AI Chatbot Developer", avatars: [1] },
            { role: "Content Specialist", avatars: [1] },
            { role: "Integration Engineer", avatars: [1] },
            { role: "QA Tester", avatars: [1] },
        ],
        duration: "5 months"
    }
];
const projectData = {
    projectDetails: {
      client: "ABC Enterprises",
      totalCost: "$1400",
      DaysToWork: "120 days",
      createdOn: "14 Nov 2024",
      startedOn: "15 Jan 2025",
      dueDate: "15 Nov 2025",
      dueAlert: 1,
      createdBy: {
        name: "Priya Rathod",
      },
      priority: "High"
    },
    
  };
 
  
    const firstColumnData = {
        createdBy: projectData.projectDetails.createdBy,
    
    };

    const secondColumnData = {
        client: projectData.projectDetails.client,
        totalCost: projectData.projectDetails.totalCost,
        DaysToWork: projectData.projectDetails.DaysToWork,
        priority: projectData.projectDetails.priority,
    };
const projectIconMap = {
    "HRMS Project": { icon: "👥", color: "text-indigo-500" },
    "Employee Self-Service App": { icon: "📱", color: "text-green-500" },
    "Payroll Automation": { icon: "💰", color: "text-yellow-500" },
    "Attendance System Upgrade": { icon: "🕒", color: "text-blue-500" },
    "AI-Based Recruitment Tool": { icon: "🤖", color: "text-pink-500" },
    "Internal Chatbot System": { icon: "💬", color: "text-teal-500" },
};
const ProjectCard = () => {
    const {theme}=useContext(Context);
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentProject = projects[currentIndex];
    const { icon, color } = projectIconMap[currentProject.name] || { icon: null, color: "" };
    const goToNextProject = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    };

    const goToPreviousProject = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length);
    };
    const getAvatarUrl = (index) => `https://i.pravatar.cc/40?img=${index + 1}`;
    return (
        <motion.div
            className={`relative p-6  rounded-lg shadow-xl mx-auto border border-gray-200  ${theme==='dark' ? 'bg-gray-700':'bg-stone-100'}`}
            key={currentIndex} // Key is important for Framer Motion to re-animate on state change
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            
        >
            {/* Duration Button */}
            <motion.button
                className="absolute top-4 right-4 bg-red-500 text-white text-sm font-semibold py-1 px-3 rounded-full shadow-md"
                whileHover={{ scale: 1.1, backgroundColor: "#ef4444" }}
                whileTap={{ scale: 0.9 }}
            >
                Duration: {currentProject.duration}
            </motion.button>

            {/* Project Header */}
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

            {/* Description */}
            <motion.p
                className={`text-gray-700 text-base sm:text-lg mb-8 leading-relaxed ${theme==='dark' ? 'text-white':''}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                {currentProject.description}
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2 ">
                {/* Highlights */}
                 
                 <motion.div
            className={`p-3 rounded-lg shadow-lg border border-gray-200 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ translateY: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)" }}
        >
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Project Details</h2>
            <div className="flex flex-col md:flex-row gap-6">
                {/* First Column */}
                <div className="md:w-1/2 flex flex-col justify-center items-center p-4 border border-dashed rounded-lg">
                    <img src={getAvatarUrl(0)} alt={firstColumnData.createdBy.name} className="w-20 h-20 rounded-full mb-2" />
                    <p className="text-lg font-semibold">{firstColumnData.createdBy.name}</p>
                    <p className="text-sm text-gray-500">Reported By</p>
                </div>

                {/* Second Column with four side-by-side items */}
                <div className="md:w-1/2 grid grid-cols-2 gap-4">
                    {Object.entries(secondColumnData).map(([key, value]) => {
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        return (
                            <div key={key} className={`p-2 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
                                <dt className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs font-medium uppercase`}>{label}</dt>
                                <dd className={`mt-1 text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{value}</dd>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
               

               
                

                {/* Team */}
                <motion.div
                    className={` p-3 rounded-lg shadow-sm border border-gray-100 ${theme==='dark' ? 'bg-gray-800 text-white':'bg-gradient-to-br from-indigo-50 to-indigo-100'}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    whileHover={{ translateY: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)" }}
                >
                    <h3 className={`text-xl sm:text-2xl font-semibold  mb-4 border-b pb-2 ${theme==='dark' ? 'text-white':'text-gray-800'}`}>Team</h3>
                    <div className="space-y-2">
                        {currentProject.team.map((teamMember, index) => (
                            <motion.div
                                key={index}
                                className="flex flex-col items-start"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                            >
                                <p className={`font-medium  text-base sm:text-lg mb-2 ${theme==='dark' ? 'text-white':'text-gray-800'}`}>
                                    <div className="flex flex-wrap gap-2">
                                        {teamMember.role}: {teamMember.avatars}
                                    </div>
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 flex-wrap gap-4">
               
<div class="relative inline-flex items-center justify-center gap-4 group">
  <div
    class="absolute inset-0 duration-1000 opacity-60 transitiona-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200"
  ></div>
  <a
    role="button"
    class="group relative inline-flex items-center justify-center text-base rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30"
    title="payment"
    onClick={goToPreviousProject}
    href="#"
    >Previous Project<svg
      aria-hidden="true"
      viewBox="0 0 10 10"
      height="10"
      width="10"
      fill="none"
      class="mt-0.5 ml-2 -mr-1 stroke-white stroke-2"
    >
      <path
        d="M0 5h7"
        class="transition opacity-0 group-hover:opacity-100"
      ></path>
      <path
        d="M1 1l4 4-4 4"
        class="transition group-hover:translate-x-[3px]"
      ></path>
    </svg>
  </a>
</div>

                <div class="relative inline-flex items-center justify-center gap-4 group">
  <div
    class="absolute inset-0 duration-1000 opacity-60 transitiona-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-lg filter group-hover:opacity-100 group-hover:duration-200"
  ></div>
  <a
    role="button"
    class="group relative inline-flex items-center justify-center text-base rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30"
    title="payment"
    onClick={goToNextProject}
    href="#"
    >Next Project<svg
      aria-hidden="true"
      viewBox="0 0 10 10"
      height="10"
      width="10"
      fill="none"
      class="mt-0.5 ml-2 -mr-1 stroke-white stroke-2"
    >
      <path
        d="M0 5h7"
        class="transition opacity-0 group-hover:opacity-100"
      ></path>
      <path
        d="M1 1l4 4-4 4"
        class="transition group-hover:translate-x-[3px]"
      ></path>
    </svg>
  </a>
</div>
            </div>
        </motion.div>
    );
};

// --- MyTeam Data and Component ---
const MyTeam = () => {
    const { userData,theme } = useContext(Context);
    const role = (userData?.roles?.[0] || "").toUpperCase();
    const showSidebar = ["TEAM_LEAD", "HR", "MANAGER","ADMIN"].includes(role);

    const initialEmployeeData = [
        { name: "Rajesh",   employee_id: "E_01", date: "2025-06-30",role:"Full stack Developer", login_time: "10:00 AM", logout_time: "07:00 PM" },
        { name: "Ramesh",   employee_id: "E_02", date: "2025-06-30",role:"Backend Developer", login_time: "10:00 AM", logout_time: "07:00 PM" },
        { name: "Ramya",  employee_id: "E_05", date: "2025-06-30",role:"Devops Engineer", login_time: null, logout_time: null },
        { name: "Swetha", employee_id: "E_07", date: "2025-06-30",role:"Tester", login_time: "10:00 AM", logout_time: "07:00 PM" },
        { name: "Rohit",    employee_id: "E_09", date: "2025-06-30",role:"Tester", login_time: null, logout_time: null },
        { name: "Deepika", employee_id: "E_11", date: "2025-06-30",role:"Designer", login_time: "10:00 AM", logout_time: "07:00 PM" },
    ];
    
    const ImageMap={
        "Rajesh":"https://randomuser.me/api/portraits/men/32.jpg" , 
        "Ramesh": "https://randomuser.me/api/portraits/men/32.jpg" ,  
        "Ramya": "https://randomuser.me/api/portraits/women/65.jpg",  
        "Swetha": "https://randomuser.me/api/portraits/women/65.jpg",  
        "Rohit": "https://randomuser.me/api/portraits/men/32.jpg",     
        "Deepika": "https://randomuser.me/api/portraits/women/65.jpg",
    }

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
            className={` shadow-xl rounded-lg p-6 border border-blue-500 h-full overflow-hidden ${theme==='dark' ? 'bg-gray-700':'bg-gradient-to-br from-blue-50 to-blue-100'}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold text-gray-800 ${theme==='dark' ? 'bg-gradient-to-br from-blue-100 to-blue-400 bg-clip-text text-transparent ':''}`}>
                    My Team</h2>
                {showSidebar && (
                    <motion.button
                        className={`flex items-center ${theme==='dark'?'bg-gray-500 text-blue-500':'bg-blue-50 text-blue-700'} border-lg border-blue-500 font-bold py-2 px-4 rounded-xl shadow transition`}
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
                        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                    <motion.form
                            className={`w-full max-w-3xl rounded-lg shadow-2xl  relative ${theme==='dark' ? 'bg-gray-800 text-white':'bg-white text-black'}`}
                            onSubmit={handleAddOrEdit}
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            transition={{ duration: 0.3 }}
                     >    
                        <div className=" mb-4 text-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-400">
                        <h3 className="text-2xl font-bold  border-gray-200   pt-6  text-gray-600 border-lg pb-8"> <FaUsers className={`w-6 h-6 ${theme==='dark'?'text-white':'text-gray-800'}text-white`}/>{editIndex !== null ? "Edit Team Member" : "Add Team Member"}</h3>  
                        </div>
                        <div className="space-y-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className='relative mb-2'>
                                <label className={`block text-sm  font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Profile Image & Name</label>
                            <input type="text" placeholder="Profile Image URL + Name" className="w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className='relative mb-2'>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Employee ID</label>
                            <input type="text" placeholder="Employee ID" className="w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" value={formData.employee_id} onChange={e => setFormData({ ...formData, employee_id: e.target.value })} required />
                            </div>
                            <div className='relative mb-2'>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Date</label>
                            <input type="date" className="w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                            </div>
                            <div className='relative mb-2'>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Role</label>
                            <input type="text" placeholder="Role" className="w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} required />
                            </div>
                            <div className='relative mb-2'>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Login Time</label>
                            <input type="text" placeholder="Login Time" className="w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" value={formData.login_time} onChange={e => setFormData({ ...formData, login_time: e.target.value })} />
                            </div>
                            <div className='relative mb-2'>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Logout Time</label>
                            <input type="text" placeholder="Logout Time" className="w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" value={formData.logout_time} onChange={e => setFormData({ ...formData, logout_time: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editIndex !== null ? "Update" : "Add"}</button>
                            <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => { setShowForm(false); setEditIndex(null); }}>Cancel</button>
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
                            {showSidebar && <th className={`px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Edit</th>}
                            {showSidebar && <th className={`px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider ${theme==='dark' ? 'text-white':''}`}>Delete</th>}
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
                                            
                                            {showSidebar && (
                                                <button className={ `${theme==='dark'?'text-indigo-200':'text-indigo-600'}  hover:text-indigo-800 font-bold`} onClick={() => handleEdit(index)}><FiEdit className='w-5 h-5'/></button>
                                            )}
                                        </td>
                                        <td className={`py-2 px-4  whitespace-nowrap ${theme==='dark' ? 'bg-gray-500 ':''}`}>
                                            {showSidebar && (
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

// --- ProjectStatus Data and Component ---
function ProjectStatus() {
    const { userData,theme } = useContext(Context);
    const role = (userData?.roles?.[0] || "").toUpperCase();
    const showSidebar = ["TEAM_LEAD", "HR", "MANAGER","ADMIN"].includes(role);
    const COLORS = ["#4f46e5", "#059669", "#f59e0b", "#10b981", "#ec4899", "#0ea5e9"];

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
            className={`p-6  rounded-lg shadow-xl border border-gray-200 h-full overflow-hidden ${theme==='dark' ? 'bg-gray-700':'bg-gradient-to-br from-green-50 to-green-100'} `}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold text-gray-800 ${theme==='dark' ? 'bg-gradient-to-br from-green-100 to-green-400 bg-clip-text text-transparent ':''}`}>Project Status Overview</h2>
                {showSidebar && (
                    <motion.button
                        className={`flex items-center ${theme==='dark'?'bg-gray-500 text-green-500':'bg-green-50 text-green-700'} border-xl border-green-500 font-bold py-2 px-4 rounded-xl shadow transition`}
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
                        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.form
                            className={`w-full max-w-md  rounded-lg shadow-2xl  relative ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                            onSubmit={handleAddOrEdit}
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className=" mb-4 text-center rounded-lg bg-gradient-to-br from-green-100 to-green-400">
                            <h3 className={`text-2xl font-bold  border-gray-200   pt-6   border-lg pb-8 ${theme==='dark' ? 'text-gray-600 ':'text-gray-800'}`}>{editIndex !== null ? "Edit Project Status" : "Update Project Status"}</h3>
                            </div>
                             <div className="space-y-4 p-4">
                            <div className="grid grid-cols-1 gap-2">
                                <div className='relative mb-2'>
                                 <label className={`absolute -top-3 left-2 px-1 text-sm font-medium ${theme==='dark' ? 'bg-gray-700 text-white':'bg-white text-gray-800'}`}>Project ID</label>   
                                <input type="text" placeholder="Project ID" className="w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" value={formData.Project_id} onChange={e => setFormData({ ...formData, Project_id: e.target.value })} required />
                                </div>
                                <div className='relative mb-2'>
                                <label className={`absolute -top-3 left-2 px-1 text-sm font-medium ${theme==='dark' ? 'bg-gray-700 text-white':'bg-white text-gray-800'}`}>Project Name</label>   
                                <input type="text" placeholder="Project Name" className="w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" value={formData.Project_name} onChange={e => setFormData({ ...formData, Project_name: e.target.value })} required />
                                </div>
                                <div className='relative mb-2'>
                                <label className={`absolute -top-3 left-2 px-1 text-sm font-medium ${theme==='dark' ? 'bg-gray-700 text-white':'bg-white text-gray-800'}`}>Status (%)</label>
                                <input type="number" placeholder="Status (%)" className="w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" value={formData.Status} onChange={e => setFormData({ ...formData, Status: e.target.value })} required />
                                </div>
                                <div className='relative mb-2'>
                                <label className={`absolute -top-3 left-2 px-1 text-sm font-medium ${theme==='dark' ? 'bg-gray-700 text-white':'bg-white text-gray-800'}`}>Duration</label>
                                <input type="text" placeholder="Duration" className="w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none" value={formData.Duration} onChange={e => setFormData({ ...formData, Duration: e.target.value })} required />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2 justify-center">
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editIndex !== null ? "Update" : "Add"}</button>
                                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => { setShowForm(false); setEditIndex(null); }}>Cancel</button>
                            </div>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
            
    {/* Table container with responsive overflow */}
    <div className="overflow-x-auto rounded-lg">
        <table className={`min-w-full  divide-y divide-gray-200  `}>
            <thead className="border border-green-500">
                <tr className={`text-left  w-full text-sm  uppercase  tracking-wider border border-green-500 ${theme==='dark'?'bg-gray-500 text-white  ':'bg-green-50 text-green-700'}`}>
                    <th className="py-2 px-4 font-semibold">Project ID</th>
                    <th className="py-2 px-4 font-semibold">Project Name</th>
                    <th className="py-2 px-4 font-semibold">Duration</th>
                    <th className="py-2 px-4 font-semibold">Status</th>
                    {showSidebar && <th className="py-2 px-4 ">Edit</th>}
                    {showSidebar && <th className="py-2 px-4 ">Delete</th>}
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
                            {showSidebar && (
                                <td className={`py-2 px-4  whitespace-nowrap ${theme==='dark' ? 'bg-gray-500 ':''}`}>
                                    <button className={`${theme==='dark'?'text-indigo-200':'text-indigo-600'} hover:text-indigo-800 font-small`}  onClick={() => handleEdit(index)}><FiEdit className='w-5 h-5'/></button>
                                </td>
                            )}
                            {showSidebar && (
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

// ...existing code...
function Project() {
    const { userData,theme } = useContext(Context);
    const role = (userData?.roles?.[0] || "").toUpperCase();
    const showSidebar = ["TEAM_LEAD", "HR", "MANAGER","ADMIN"].includes(role);

    const [projectTableData, setProjectTableData] = useState([
        {project_id: "P_01",project_name: "HRMS Project",status: "Ongoing",start_date: "2025-05-01",end_date: "2025-09-30",Team_Lead:"Naveen",                   more:"+4",Priority: "High",Open_task: 30,Closed_task: 25,Details: "https://www.flaticon.com/free-icon/document_16702688"},
        { project_id: "P_02",project_name: "Employee Self-Service App", status: "Upcoming", start_date: "2025-10-15", end_date: "2025-12-15",Team_Lead:"Rajiv",  more:"+2", Priority: "Medium", Open_task: 20, Closed_task: 10, Details: "https://www.flaticon.com/free-icon/document_16702688" },
        {project_id: "P_03",project_name: "Payroll Automation",status: "Completed",start_date: "2024-10-01",end_date: "2025-02-15",Team_Lead:"Manikanta",        more:"+1",Priority: "High",Open_task: 12,Closed_task: 10,Details: "https://www.flaticon.com/free-icon/document_16702688"},
        {project_id: "P_04",project_name: "Attendance System Upgrade",status: "Ongoing",start_date: "2025-05-10",end_date: "2025-08-10",Team_Lead:"Ravinder",  more:"+5",Priority: "Low",Open_task: 40,Closed_task: 25,Details: "https://www.flaticon.com/free-icon/document_16702688" },
        {project_id: "P_05",project_name: "AI-Based Recruitment Tool",status: "Upcoming",start_date: "2025-12-01",end_date: "2026-02-28",Team_Lead:"Sravani",   more:"+6",Priority: "Medium",Open_task: 20,Closed_task: 15,Details: "https://www.flaticon.com/free-icon/document_16702688"},
        {project_id: "P06",project_name: "Internal Chatbot System",status: "Completed",start_date: "2024-05-01",end_date: "2024-11-30",Team_Lead:"Gayatri",     more:"+3",Priority: "High",Open_task: 30,Closed_task: 25,Details: "https://www.flaticon.com/free-icon/document_16702688"}]);

    const teamLeadImageMap = {
        Naveen: "https://i.pravatar.cc/40?img=1",
        Rajiv: "https://i.pravatar.cc/40?img=2",
        Manikanta: "https://i.pravatar.cc/40?img=3",
        Ravinder: "https://i.pravatar.cc/40?img=4",
        Sravani: "https://i.pravatar.cc/40?img=5",
        Gayatri: "https://i.pravatar.cc/40?img=6"
    };

    const teamImagesMap = {
        P_01: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        P_02: [
            "https://randomuser.me/api/portraits/men/15.jpg",
            "https://randomuser.me/api/portraits/women/22.jpg"
        ],
        P_03: [
            "https://randomuser.me/api/portraits/men/11.jpg"
        ],
        P_04: [
            "https://randomuser.me/api/portraits/men/55.jpg",
            "https://randomuser.me/api/portraits/women/88.jpg",
            "https://randomuser.me/api/portraits/men/99.jpg",
            "https://randomuser.me/api/portraits/women/78.jpg"
        ],
        P_05: [
            "https://randomuser.me/api/portraits/men/66.jpg",
            "https://randomuser.me/api/portraits/women/77.jpg",
            "https://randomuser.me/api/portraits/men/12.jpg",
            "https://randomuser.me/api/portraits/women/23.jpg",
            "https://randomuser.me/api/portraits/men/45.jpg"
        ],
        P06: [
            "https://randomuser.me/api/portraits/men/21.jpg",
            "https://randomuser.me/api/portraits/women/43.jpg",
            "https://randomuser.me/api/portraits/men/87.jpg"
        ]
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
        Team_Lead:"",
        Employee_team: [],
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
            Team_lead:"",
            Employee_team: [],
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
            className={`p-6  rounded-2xl shadow-xl border border-purple-500 overflow-x-auto relative ${theme==='dark' ? 'bg-gray-700':'bg-gradient-to-br from-purple-50 to-purple-100 '}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold text-gray-800 ${theme==='dark' ? 'bg-gradient-to-br from-purple-100 to-purple-400 bg-clip-text text-transparent ':''}`}>
                    Project Overview</h2>
                    <div className=" absolute right-52 gap-2">
                    <select
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value)}
                       className={`${theme==='dark'?'bg-gray-500 text-purple-500':'bg-purple-50  text-purple-700'} border border-purple-500   font-medium rounded-xl px-4 py-2 text-sm shadow   shadow transition`}
                    >
                     <option value="All" className={` ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-black'}`}>Select Status</option>
                     <option value="Ongoing" className={` ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-black'}`}>Ongoing</option>
                     <option value="Upcoming" className={` ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-black'}`}>Upcoming</option>
                     <option value="Completed"className={` ${theme==='dark'?'bg-gray-800 text-white':'bg-white text-black'}`}>Completed</option>
                   </select>
         
            </div>
                {showSidebar && (
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
            {/* Full-page overlay for the form */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        className="fixed backdrop-blur-sm bg-opacity-30 inset-0 z-50 flex items-center justify-center "
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                         <motion.div className="relative  w-full max-w-3xl mx-auto  my-auto max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 md:scale-100"    initial={{ scale: 0.9, opacity: 0 }}    animate={{ scale: 1, opacity: 1 }}    exit={{ scale: 0.9, opacity: 0 }}    transition={{ duration: 0.3 }}>
                        <motion.form
                            className={`w-full max-w-3xl  rounded-lg shadow-2xl  relative ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} `}
                            onSubmit={handleCreateProject}
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="  mb-4 text-start rounded-t bg-gradient-to-br from-purple-400 to-purple-700">
                                 
                                           
                            <h3 className={`text-2xl font-bold   border-gray-200   pt-6 ml-10   border-lg pb-8 ${theme === 'dark' ? 'text-gray-200 ' : 'text-gray-800 '}`}>Create New Project</h3>
                            </div>
                            <div className="space-y-4 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="relative mt-1">
                                <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}> Project Name</label>
                                 
                                <input
                                    type="text"
                                    placeholder="Project Name"
                                    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                                    value={newProject.project_name}
                                    onChange={e => setNewProject({ ...newProject, project_name: e.target.value })}
                                    required
                                />
                                </div>
                                 <div className="relative mt-1">
                                <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}> Team Lead</label>
                                 
                                <input
                                    type="text"
                                    placeholder="Team Lead + Profile image URl"
                                    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                                    value={newProject.project_name}
                                    onChange={e => setNewProject({ ...newProject, project_name: e.target.value })}
                                    required 
                                />
                                </div>
                                <div className="relative mt-1">
                                <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Project Status</label>
                                 
                                <select
                                    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none  ${theme==='dark' ? 'border border-gray-100  ':'border border-gray-300 '} shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
                                    value={newProject.status}
                                    onChange={e => setNewProject({ ...newProject, status: e.target.value })}
                                >
                                    <option value="" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Select</option>
                                    <option value="Ongoing"className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Ongoing</option>
                                    <option value="Upcoming"className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Upcoming</option>
                                    <option value="Completed"className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Completed</option>
                                </select>
                                </div>
                                <div className="relative mt-1">
                                    <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Start Date</label>
                                <input
                                    type="date"
                                     className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                                    value={newProject.start_date}
                                    onChange={e => setNewProject({ ...newProject, start_date: e.target.value })}
                                    required
                                />
                                </div>
                                <div className="relative mt-1">
                                    <label className={`block text-sm  font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>End Date</label>
                                <input
                                    type="date"
                                    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                                    value={newProject.end_date}
                                    onChange={e => setNewProject({ ...newProject, end_date: e.target.value })}
                                    required
                                />
                                </div>
                                   <div className="relative mt-1">
                                <label className={`block text-sm font-medium   ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Project Priority</label>
                             
                                <select
                                   className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none  ${theme==='dark' ? 'border border-gray-100  ':'border border-gray-300 '} shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
                                    value={newProject.Priority}
                                    onChange={e => setNewProject({ ...newProject, Priority: e.target.value })}
                                >
                                    <option value="" className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Select</option>
                                    <option value="High"className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>High</option>
                                    <option value="Medium"className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Medium</option>
                                    <option value="Low"className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>Low</option>
                                </select>
                                </div>
                                 <div className="relative mt-1">
                                <label className={`block text-sm font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Open Tasks</label>
                               
                                <input
                                    type="number"
                                    placeholder="Open Tasks"
                                     className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                                    value={newProject.Open_task}
                                    onChange={e => setNewProject({ ...newProject, Open_task: Number(e.target.value) })}
                                />
                                </div>
                                <div className="relative mt-1">
                                <label className={`block text-sm  font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Closed Tasks</label>
                                <input
                                    type="number"
                                    placeholder="Closed Tasks"
                                    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                                    value={newProject.Closed_task}
                                    onChange={e => setNewProject({ ...newProject, Closed_task: Number(e.target.value) })}
                                />
                                </div>
                                <div className="relative mt-1">
                                <label className={`block text-sm  font-medium  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Project Rating</label>
                                <input
                                    type="number"
                                    placeholder="Rating (1-5)"
                                    className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                                    min="1"
                                    max="5"
                                    value={newProject.rating}
                                    onChange={e => setNewProject({ ...newProject, rating: e.target.value })}
                                />
                                </div>
                                <div className="mt-2">
                                    <label className={`block text-sm font-medium  mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Employee_team</label>
                                    <textarea
                                        className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                                        value={newProject.Employee_team}
                                        onChange={e => setNewProject({ ...newProject, Employee_team: e.target.value })}
                                    />
                                </div>
                                <div className="mt-2">
                                    <label className={`block text-sm font-medium  mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Remark</label>
                                    <textarea
                                        className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                                        value={newProject.remark}
                                        onChange={e => setNewProject({ ...newProject, remark: e.target.value })}
                                    />
                                </div>
                                <div className="mt-2">
                                    <label className={`block text-sm font-medium  mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Completion Note</label>
                                    <textarea
                                        className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                                        value={newProject.completionNote}
                                        onChange={e => setNewProject({ ...newProject, completionNote: e.target.value })}
                                    />
                                </div>
                                <div className="mt-2">
                                    <label className={`block text-sm font-medium  mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                                        Related Links:</label>
                                    {newProject.relatedLinks.map((link, index) => (
                                        <div key={index} className="flex gap-2 mb-0">
                                            <input
                                                type="url"
                                                value={link}
                                                onChange={e => handleRelatedLinkChange(index, e.target.value)}
                                                className={`w-full px-3 mt-2 sm:px-4 md:px-5 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-300 text-sm
                                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none ${theme==='dark' ? 'border border-gray-100 text-white ':'border border-gray-300 text-black'}`}
                                                placeholder="Enter related link URL"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeRelatedLink(index)}
                                                className="px-3 py-2 text-red-600 hover:text-red-800"
                                                disabled={newProject.relatedLinks.length === 1}
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addRelatedLink}
                                        className="flex items-center text-indigo-600 hover:text-indigo-800"
                                    >
                                        <FaPlus className="mr-1" />
                                        Add Related Link
                                    </button>
                                </div>
                                <div className="mt-2">
                                    <label className={`block text-sm font-medium  mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                                        Attach Files</label>
                                    <div className="flex items-center">
                                        <label className="flex items-center cursor-pointer">
                                            <FaPaperclip className="mr-2" />
                                            <span className={`text-sm  ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>Attach</span>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    {files.length > 0 && (
                                        <div className="mt-2">
                                            <ul className="space-y-2">
                                                {files.map((file, index) => (
                                                    <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                                                        <span className="text-sm text-gray-800 truncate" title={file.name}>{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            className="text-red-500 hover:text-red-700 ml-4"
                                                            aria-label={`Remove ${file.name}`}
                                                        >
                                                            <FaTrashAlt />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex mt-2 gap-4 justify-center">
                                <motion.button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Add Project
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded"
                                    onClick={() => setShowCreateForm(false)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
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
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.form
                className={`w-full max-w-3xl rounded-lg shadow-2xl relative ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}
                onSubmit={handleUpdateProject}
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ duration: 0.3 }}
            >
                <div className="mb-4 text-center rounded-t bg-gradient-to-br from-purple-100 to-purple-400">
                    <h3 className={`text-2xl font-bold pt-6 pb-8 ${theme === 'dark' ? 'text-gray-600 ' : 'text-gray-800 '}`}>Edit Project</h3>
                </div>
                <div className="space-y-4 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="Project Name"
                            className="border p-2 rounded w-full"
                            value={editProjectData?.project_name || ""}
                            onChange={e => setEditProjectData({ ...editProjectData, project_name: e.target.value })}
                            required
                        />
                        <select
                            className="border p-2 rounded w-full"
                            value={editProjectData?.status || ""}
                            onChange={e => setEditProjectData({ ...editProjectData, status: e.target.value })}
                        >
                            <option value="">Select Status</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Completed">Completed</option>
                        </select>
                        <input
                            type="date"
                            className="border p-2 rounded w-full"
                            value={editProjectData?.start_date || ""}
                            onChange={e => setEditProjectData({ ...editProjectData, start_date: e.target.value })}
                            required
                        />
                        <input
                            type="date"
                            className="border p-2 rounded w-full"
                            value={editProjectData?.end_date || ""}
                            onChange={e => setEditProjectData({ ...editProjectData, end_date: e.target.value })}
                            required
                        />
                        <select
                            className="border p-2 rounded w-full"
                            value={editProjectData?.Priority || ""}
                            onChange={e => setEditProjectData({ ...editProjectData, Priority: e.target.value })}
                        >
                            <option value="">Select Priority</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Open Tasks"
                            className="border p-2 rounded w-full"
                            value={editProjectData?.Open_task || 0}
                            onChange={e => setEditProjectData({ ...editProjectData, Open_task: Number(e.target.value) })}
                        />
                        <input
                            type="number"
                            placeholder="Closed Tasks"
                            className="border p-2 rounded w-full"
                            value={editProjectData?.Closed_task || 0}
                            onChange={e => setEditProjectData({ ...editProjectData, Closed_task: Number(e.target.value) })}
                        />
                    </div>
                    {/* Add more fields as needed */}
                    <div className="flex mt-2 gap-4 justify-center">
                        <motion.button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Update Project
                        </motion.button>
                        <motion.button
                            type="button"
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded"
                            onClick={() => setShowEditForm(false)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancel
                        </motion.button>
                    </div>
                </div>
            </motion.form>
        </motion.div>
    )}
</AnimatePresence>
          <div className="overflow-x-auto rounded-xl  ">
            <table className="min-w-full bg-white  ">
                <thead className={` text-left uppercase tracking-wider border border-purple-500 ${theme==='dark' ? 'bg-gray-500 text-white':'bg-purple-50 text-purple-700'}`}>
                    <tr className={" border border-purple-500"}>
                        <th className="p-3 text-sm md:text-base">Project</th>
                        <th className="p-3 text-sm md:text-base">Team_Lead</th>
                        <th className="p-3 text-sm md:text-base"><FaCalendarAlt className="inline mr-1" />Start</th>
                        <th className="p-3 text-sm md:text-base"><FaCalendarAlt className="inline mr-1" />End</th>
                        <th className="p-3 text-sm md:text-base">Priority</th>
                        <th className="p-3 text-sm md:text-base">Status</th>
                        <th className="p-3 text-sm md:text-base">Open Task</th>
                        <th className="p-3 text-sm md:text-base">Closed Task</th>
                        <th className="p-3 text-sm md:text-base">Details</th>
                        {showSidebar &&<th className="p-3 text-sm md:text-base">Delete</th>}
                    </tr>
                </thead>
                <tbody  className="bg-white   ">
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
                                    <select value={proj.Priority} onChange={(e) => (proj.Priority = e.target.value)} className={`px-3 py-1 rounded text-xs font-medium shadow cursor-pointer ${
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
                                    <select value={proj.status} onChange={(e) => (proj.status = e.target.value)} className={`px-3 py-1 rounded text-xs font-medium shadow cursor-pointer ${
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
                            {showSidebar && (
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
            <motion.h1
                className={`text-3xl sm:text-4xl font-bold  mb-6 sm:mb-8 text-left drop-shadow-sm ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-400 to-indigo-800 bg-clip-text text-transparent ' : 'text-gray-800 '} `}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Projects
            </motion.h1>
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