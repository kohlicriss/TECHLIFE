import React, { useContext, useEffect, useState } from 'react';
import { ArrowRightCircleIcon } from '@heroicons/react/24/solid'; // Not used in the final render, but kept from original
import classNames from 'classnames'; // Not used in the final render, but kept from original
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FaCalendarAlt, FaTrashAlt, FaFileAlt, FaPlus, FaPaperclip } from 'react-icons/fa';
import axios from 'axios';
import { Context } from '../HrmsContext';

// --- ProjectCard Data and Component ---
const projects = [
    {
        name: "HRMS Project",
        description: " The HRMS Project is a comprehensive web-based solution designed to streamline and automate all core HR processes within an organization. It enhances operational efficiency by integrating modules like employee records, attendance tracking, leave management, payroll, and performance evaluations into one centralized system.",
        highlights: [
            " Centralized Employee Database",
            " Automated Attendance & Leave Tracking",
            " Payroll Automation",
            " Performance Management",
            " Role-Based Access Control",
        ],
        characteristics: ["Enterprise-grade, scalable", "highly integrated", "compliance-focused", "data-intensive."],
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
        highlights: [
            " Profile Management",
            " Leave Application & Status Tracking",
            " Attendance Overview",
            " Request Management",
            " Mobile-Responsive Design",
        ],
        characteristics: ["User-centric", "mobile-first", "intuitive", "secure, responsive."],
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
        highlights: [
            " Automated Salary Calculations",
            " Monthly & On-Demand Payroll Runs",
            " Payslip Generation & Distribution",
            " Bank Integration for Direct Deposits",
            " Customizable Pay Structures",
        ],
        characteristics: ["High accuracy", "compliance-driven", "secure, scalable", "integration-focused."],
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
        highlights: [
            " Real-Time Attendance Tracking",
            " Geo-Tagging & Geo-Fencing ",
            " Biometric & RFID Integration",
            " Mobile App Clock-In ",
            " Auto-Sync with Payroll & HRMS",
            
        ],
        characteristics: ["Accurate", "real-time, robust", "integrated", "user-friendly."],
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
        highlights: [
            " AI-Powered Resume Screening",
            " Natural Language Processing (NLP)",
            " Automated Interview Scheduling",
            " Job Recommendation Engine",
            " Video Interview Analysis",
            " Real-Time Hiring Analytics"
        ],
        characteristics: ["Intelligent", "efficient", "data-driven", "scalable", "integrates with external platforms."],
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
        highlights: [
            " 24/7 Virtual Assistant",
            " HR & IT Support Automation",
            " AI/NLP-Based Understanding",
            " Meeting Scheduling & Reminders"
            
        ],
        characteristics: ["AI-powered", "responsive", "multi-channel", "helpful, analytical."],
        team: [
            { role: "AI Chatbot Developer", avatars: [1] },
            { role: "Content Specialist", avatars: [1] },
            { role: "Integration Engineer", avatars: [1] },
            { role: "QA Tester", avatars: [1] },
        ],
        duration: "5 months"
    }
];
const projectIconMap = {
  "HRMS Project": { icon: "👥", color: "text-indigo-500" },
  "Employee Self-Service App": { icon:"📱", color: "text-green-500" },
  "Payroll Automation": { icon: "💰", color: "text-yellow-500" },
  "Attendance System Upgrade": { icon:"🕒", color: "text-blue-500" },
  "AI-Based Recruitment Tool": { icon: "🤖", color: "text-pink-500" },
  "Internal Chatbot System": { icon:"💬", color: "text-teal-500" },
};
const ProjectCard = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentProject = projects[currentIndex];
    const { icon, color } = projectIconMap[currentProject.name] || { icon: null, color: "" };
    const goToNextProject = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    };

    const goToPreviousProject = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length);
    };

    return (
        <div className="relative p-6 bg-white rounded-lg shadow-xl mx-auto border border-gray-200">
            {/* Duration Button */}
            <button className="absolute top-4 right-4 bg-red-500 text-white text-sm font-semibold py-1 px-3 rounded-full shadow-md">
                Duration: {currentProject.duration}
            </button>
            
            {/* Project Header */}
            <div className="flex items-center mb-6 flex-wrap">
                <span className={`text-5xl mr-4 ${color}`}>{icon}</span>
                <h2 className={`text-3xl sm:text-4xl font-extrabold ${color} mt-2 sm:mt-0`}>
                    {currentProject.name}
                </h2>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-base sm:text-lg mb-8 leading-relaxed">
                {currentProject.description}
            </p>

           <div className="grid grid-cols-3  gap-4 mb-4">

    {/* Highlights */}
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Highlights</h3>
        <ul className="space-y-3 text-gray-700">
            {currentProject.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start text-base sm:text-lg">
                    <span className="mr-2 text-green-500 text-xl">✔️</span>
                    {highlight}
                </li>
            ))}
        </ul>
    </div>

    {/* Characteristics */}
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Characteristics</h3>
        <ul className="space-y-3 text-gray-700">
            {currentProject.characteristics.map((char, index) => (
                <li key={index} className="flex items-start text-base sm:text-lg">
                    <span className="mr-2 text-blue-500 text-xl">🌟</span>
                    {char}
                </li>
            ))}
        </ul>
    </div>

    {/* Team */}
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Team</h3>
        <div className="space-y-4">
            {currentProject.team.map((teamMember, index) => (
                <div key={index} className="flex flex-col items-start">
                    <p className="font-medium text-gray-800 text-base sm:text-lg mb-2">
                    <div className="flex flex-wrap gap-2">
                        {teamMember.role}: {teamMember.avatars}
                    </div></p>
                    
                </div>
            ))}
        </div>
    </div>
</div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 flex-wrap gap-4">
                <button
                    onClick={goToPreviousProject}
                    className="flex-grow sm:flex-grow-0 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out flex items-center justify-center"
                >
                    <span className="text-2xl mr-2">◀️</span> Previous Project
                </button>
                <button
                    onClick={goToNextProject}
                    className="flex-grow sm:flex-grow-0 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out flex items-center justify-center"
                >
                    Next Project <span className="text-2xl ml-2">▶️</span>
                </button>
            </div>
        </div>
    );
};

// --- MyTeam Data and Component ---
const MyTeam = () => {
    const initialEmployeeData = [
        { name: "https://randomuser.me/api/portraits/men/32.jpg Rajesh", employee_id: "E_01", date: "2025-06-30", login_time: "10:00 AM", logout_time: "07:00 PM" },
        { name: "https://randomuser.me/api/portraits/men/32.jpg Ramesh", employee_id: "E_02", date: "2025-06-30", login_time: "10:00 AM", logout_time: "07:00 PM" },
        { name: "https://randomuser.me/api/portraits/women/65.jpg Ramya", employee_id: "E_05", date: "2025-06-30", login_time: null, logout_time: null },
        { name: "https://randomuser.me/api/portraits/women/65.jpg Swetha", employee_id: "E_07", date: "2025-06-30", login_time: "10:00 AM", logout_time: "07:00 PM" },
        { name: "https://randomuser.me/api/portraits/men/32.jpg Rohit", employee_id: "E_09", date: "2025-06-30", login_time: null, logout_time: null },
        { name: "https://randomuser.me/api/portraits/women/65.jpg Deepika", employee_id: "E_11", date: "2025-06-30", login_time: "10:00 AM", logout_time: "07:00 PM" },
    ];

    const [employeeData] = useState(initialEmployeeData); // Removed setEmployeeData as it's not used

    const handleProfileClick = (employeeId) => {
        console.log(`Navigating to performance dashboard for employee ID: ${employeeId}`);
        // In a real application, you would use a routing library here, e.g.:
        // history.push(`/performance/${employeeId}`);
    };

    return (
        <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-200 h-full overflow-hidden">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">My Team</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-blue-600 text-white text-left text-sm md:text-base">
                            <th className="py-2 px-4">Profile</th>
                            <th className="py-2 px-4">Emp ID</th>
                            <th className="py-2 px-4">Name</th>
                            <th className="py-2 px-4">Date</th>
                            <th className="py-2 px-4">Login</th>
                            <th className="py-2 px-4">Logout</th>
                            <th className="py-2 px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employeeData.map((emp, index) => {
                            const [maybeImage, ...nameParts] = emp.name.split(" ");
                            const hasImage = maybeImage.startsWith("http");
                            const imageUrl = hasImage ? maybeImage : "";
                            const name = hasImage ? nameParts.join(" ") : emp.name;

                            const status = emp.login_time
                                ? { label: "Available", color: "text-green-600" }
                                : { label: "Absent", color: "text-red-600" };

                            return (
                                <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 text-sm md:text-base">
                                    <td className="py-2 px-4">
                                        <div
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => handleProfileClick(emp.employee_id)}
                                            title={`View ${name}'s Performance`}
                                        >
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={name}
                                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                    {name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2 px-4">{emp.employee_id}</td>
                                    <td className="py-2 px-4 font-medium">{name}</td>
                                    <td className="py-2 px-4">{emp.date}</td>
                                    <td className="py-2 px-4">{emp.login_time || "-"}</td>
                                    <td className="py-2 px-4">{emp.logout_time || "-"}</td>
                                    <td
                                        className={`py-2 px-4 font-semibold ${status.color}`}
                                    >
                                        {status.label}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- ProjectStatus Data and Component ---
const projectStatusData = [
    { Project_id: "P_01", Project_name: "HRMS Project", Status: 80, Duration: "5 Months" },
    { Project_id: "P_02", Project_name: "Employee Self-Service App", Status: 55, Duration: "6 Months" },
    { Project_id: "P_03", Project_name: "Payroll Automation", Status: 90, Duration: "5 Months" },
    { Project_id: "P_04", Project_name: "Attendance System Upgrade", Status: 67, Duration: "1 Months" },
    { Project_id: "P_05", Project_name: "AI-Based Recruitment Tool", Status: 77, Duration: "6 Months" },
    { Project_id: "P_06", Project_name: "Internal Chatbot System", Status: 41, Duration: "4 Months" }
];

const COLORS = ["#4f46e5", "#059669", "#f59e0b", "#10b981", "#ec4899", "#0ea5e9"];

function ProjectStatus() {
    //const [projectStatusData, setProjectStatusData] = useState([]);
    //useEffect(() => {
    //    axios
    //      .get('http://192.168.0.50:8090/api/all/projectStatus/ACS00000003')
    //      .then(response => {
    //       const formatted = response.data.map(item => ({
    //        Project_id: item.project_id,
    //        Project_name: item.project_name,
    //        Status: item.status,
    //        Duration: item.duration
    //
    //      }));
    //      setProjectStatusData(formatted);
    //      console.log('ProjectStatus data formatted:',  formatted);
    //        
    //      })
    //      
    //  }, []);
    return (
        <div className="p-6 bg-white rounded-lg shadow-xl border border-gray-200 h-full overflow-hidden">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Project Status Overview</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="text-left bg-gray-100 text-sm md:text-base">
                            <th className="p-2 font-semibold">Project Name</th>
                            <th className="p-2 font-semibold">Duration</th>
                            <th className="p-2 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projectStatusData.map((project, index) => (
                            <tr key={project.Project_id} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="p-2 text-sm md:text-base">{project.Project_name}</td>
                                <td className="p-2 text-sm md:text-base">{project.Duration}</td>
                                <td className="p-2 w-24"> {/* Adjusted width for status bar */}
                                    <ResponsiveContainer width="100%" height={25}>
                                        <BarChart
                                            layout="vertical"
                                            data={[{ name: project.Project_name, value: project.Status }]}
                                            margin={{ top: 0, right: 10, left: 0, bottom: 0 }} // Added right margin for value display
                                        >
                                            <XAxis type="number" domain={[0, 100]} hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <Tooltip formatter={(value) => `${value}%`} />
                                            <Bar dataKey="value" radius={[5, 5, 5, 5]}>
                                                <Cell fill={COLORS[index % COLORS.length]} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <span className="text-xs text-gray-600 ml-2">{project.Status}%</span> {/* Display percentage */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
// ...existing code...
function Project() {
    const { userData } = useContext(Context);
    const role = (userData?.roles?.[0] || "").toUpperCase();
    const showSidebar = ["TEAM_LEAD", "HR", "MANAGER"].includes(role);

    const [projectTableData, setProjectTableData] = useState([
        // ...existing projectTableData...
       {
        project_id: "P_01",
        project_name: "HRMS Project",
        status: "Ongoing",
        start_date: "2025-05-01",
        end_date: "2025-09-30",
        Employee_team: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        Priority: "High",
        Open_task: 30,
        Closed_task: 25,
        Details: "https://www.flaticon.com/free-icon/document_16702688",
        Action: "https://icons8.com/icon/102350/delete"
    },
    {
        project_id: "P_02",
        project_name: "Employee Self-Service App",
        status: "Upcoming",
        start_date: "2025-10-15",
        end_date: "2025-12-15",
        Employee_team: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        Priority: "Medium",
        Open_task: 20,
        Closed_task: 10,
        Details: "https://www.flaticon.com/free-icon/document_16702688",
        Action: "https://icons8.com/icon/102350/delete"
    },
    {
        project_id: "P_03",
        project_name: "Payroll Automation",
        status: "Completed",
        start_date: "2024-10-01",
        end_date: "2025-02-15",
        Employee_team: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        Priority: "High",
        Open_task: 12,
        Closed_task: 10,
        Details: "https://www.flaticon.com/free-icon/document_16702688",
        Action: "https://icons8.com/icon/102350/delete"
    },
    {
        project_id: "P_04",
        project_name: "Attendance System Upgrade",
        status: "Ongoing",
        start_date: "2025-05-10",
        end_date: "2025-08-10",
        Employee_team: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        Priority: "Low", // Changed from "Small" to "Low" for consistency
        Open_task: 40,
        Closed_task: 25,
        Details: "https://www.flaticon.com/free-icon/document_16702688",
        Action: "https://icons8.com/icon/102350/delete"
    },
    {
        project_id: "P_05",
        project_name: "AI-Based Recruitment Tool",
        status: "Upcoming",
        start_date: "2025-12-01",
        end_date: "2026-02-28",
        Employee_team: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        Priority: "Medium",
        Open_task: 20,
        Closed_task: 15,
        Details: "https://www.flaticon.com/free-icon/document_16702688",
        Action: "https://icons8.com/icon/102350/delete"
    },
    {
        project_id: "P06",
        project_name: "Internal Chatbot System",
        status: "Completed",
        start_date: "2024-05-01",
        end_date: "2024-11-30",
        Employee_team: [
            "https://randomuser.me/api/portraits/men/32.jpg",
            "https://randomuser.me/api/portraits/women/65.jpg",
            "https://randomuser.me/api/portraits/men/76.jpg"
        ],
        Priority: "High",
        Open_task: 30,
        Closed_task: 25,
        Details: "https://www.flaticon.com/free-icon/document_16702688",
        Action: "https://icons8.com/icon/102350/delete"
    }


        // ...other projects...
    ]);
    const getPriorityColor = (priority) => {
    switch (priority) {
        case "High":
            return "bg-green-100 text-green-800";
        case "Medium":
            return "bg-orange-100 text-orange-800";
        case "Low": // Changed from "Small"
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case "In Progress":
            return "bg-green-100 text-green-800";
        case "Ongoing":
            return "bg-blue-100 text-blue-800";
        case "Planned":
            return "bg-yellow-100 text-yellow-800"; // Changed from red to yellow for upcoming
        default:
            return "bg-gray-100 text-gray-800";
    }
};

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newProject, setNewProject] = useState({
        project_id: "",
        project_name: "",
        status: "Ongoing",
        start_date: "",
        end_date: "",
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

    return (
        <div className="p-6 bg-white rounded-lg shadow-xl border border-gray-200 overflow-x-auto relative">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Project Overview</h2>
                {showSidebar && (
                    <button
                        className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow transition"
                        onClick={() => setShowCreateForm(true)}
                    >
                        <FaPlus className="mr-2" /> Create Project
                    </button>
                )}
            </div>
            {/* Full-page overlay for the form */}
            {showCreateForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-30">
                    <form
                        className="w-full max-w-3xl bg-white rounded-lg shadow-2xl p-4 relative"
                        onSubmit={handleCreateProject}
                    >
                        <h3 className="text-2xl font-bold mb-2 bg-green-100 text-gray-800 text-center">Create New Project</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Project Name"
                                className="border p-2 rounded"
                                value={newProject.project_name}
                                onChange={e => setNewProject({ ...newProject, project_name: e.target.value })}
                                required
                            />
                            <select
                                className="border p-2 rounded"
                                value={newProject.status}
                                onChange={e => setNewProject({ ...newProject, status: e.target.value })}
                            >
                                <option value="Ongoing">Ongoing</option>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <input
                                type="date"
                                className="border p-2 rounded"
                                value={newProject.start_date}
                                onChange={e => setNewProject({ ...newProject, start_date: e.target.value })}
                                required
                            />
                            <input
                                type="date"
                                className="border p-2 rounded"
                                value={newProject.end_date}
                                onChange={e => setNewProject({ ...newProject, end_date: e.target.value })}
                                required
                            />
                            <select
                                className="border p-2 rounded"
                                value={newProject.Priority}
                                onChange={e => setNewProject({ ...newProject, Priority: e.target.value })}
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Open Tasks"
                                className="border p-2 rounded"
                                value={newProject.Open_task}
                                onChange={e => setNewProject({ ...newProject, Open_task: Number(e.target.value) })}
                            />
                            <input
                                type="number"
                                placeholder="Closed Tasks"
                                className="border p-2 rounded"
                                value={newProject.Closed_task}
                                onChange={e => setNewProject({ ...newProject, Closed_task: Number(e.target.value) })}
                            />
                            <input
                                type="number"
                                placeholder="Rating (1-5)"
                                className="border p-2 rounded"
                                min="1"
                                max="5"
                                value={newProject.rating}
                                onChange={e => setNewProject({ ...newProject, rating: e.target.value })}
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-0">Employee_team</label>
                            <textarea
                                className="border p-2 rounded w-full"
                                value={newProject.Employee_team}
                                onChange={e => setNewProject({ ...newProject, Employee_team: e.target.value })}
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-0">Remark</label>
                            <textarea
                                className="border p-2 rounded w-full"
                                value={newProject.remark}
                                onChange={e => setNewProject({ ...newProject, remark: e.target.value })}
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-0">Completion Note</label>
                            <textarea
                                className="border p-2 rounded w-full"
                                value={newProject.completionNote}
                                onChange={e => setNewProject({ ...newProject, completionNote: e.target.value })}
                            />
                        </div>
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-0">Related Links</label>
                            {newProject.relatedLinks.map((link, index) => (
                                <div key={index} className="flex gap-2 mb-0">
                                    <input
                                        type="url"
                                        value={link}
                                        onChange={e => handleRelatedLinkChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
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
                            <label className="block text-sm font-medium text-gray-700 mb-0">Attach Files</label>
                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <FaPaperclip className="mr-2" />
                                    <span className="text-sm text-gray-700">Attach</span>
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
                        <div className="flex mt-2 gap-4 justify-center">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                            >
                                Add Project
                            </button>
                            <button
                                type="button"
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded"
                                onClick={() => setShowCreateForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100 text-gray-800 text-left">
                    <tr>
                        <th className="p-3 text-sm md:text-base">Project</th>
                        <th className="p-3 text-sm md:text-base">Team</th>
                        <th className="p-3 text-sm md:text-base">Priority</th>
                        <th className="p-3 text-sm md:text-base"><FaCalendarAlt className="inline mr-1" />Start</th>
                        <th className="p-3 text-sm md:text-base"><FaCalendarAlt className="inline mr-1" />End</th>
                        <th className="p-3 text-sm md:text-base">Status</th>
                        <th className="p-3 text-sm md:text-base">Details</th>
                        <th className="p-3 text-sm md:text-base">Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {projectTableData.map((proj) => (
                        <tr key={proj.project_id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="p-3 text-sm md:text-base font-semibold">{proj.project_name}</td>
                            <td className="p-3">
                                <div className="flex -space-x-2 ">
                                    {proj.Employee_team.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt="team member"
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm"
                                        />
                                    ))}
                                </div>
                            </td>
                            <td className="p-3">
                                <span className={`px-2 py-1 text-xs md:text-sm rounded-full ${getPriorityColor(proj.Priority)}`}>
                                    {proj.Priority}
                                </span>
                            </td>
                            <td className="p-3 text-sm md:text-base">{proj.start_date}</td>
                            <td className="p-3 text-sm md:text-base">{proj.end_date}</td>
                            <td className="p-3 ">
                                <span className={`px-2 py-1 rounded-full text-xs md:text-sm ${getStatusColor(proj.status)}`}>
                                    {proj.status}
                                </span>
                            </td>
                            <td className="p-3 text-center">
                                <a href={proj.Details} target="_blank" rel="noopener noreferrer">
                                    <FaFileAlt className="text-blue-600 text-lg inline w-6 h-6 md:w-8 md:h-8 hover:scale-110 transition" />
                                </a>
                            </td>
                            <td className="p-3 text-center">
                                <button>
                                    <FaTrashAlt className="text-red-500 text-lg w-6 h-6 md:w-8 md:h-8 hover:scale-110 transition" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ...rest of your file (ProjectDashboard, etc.)...

// --- Combined HRMS Dashboard Component ---
const ProjectDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-left drop-shadow-sm">
                 Project Dashboard
            </h1>
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