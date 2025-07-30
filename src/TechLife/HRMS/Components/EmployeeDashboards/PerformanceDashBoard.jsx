import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
    PieChart, Pie,
    AreaChart, Area, Legend, CartesianGrid
} from 'recharts';

// --- EmployeeProfile Component ---
const EmployeeProfile = () => {
    return (
        <div className="lg:col-span-2 bg-white shadow-xl rounded-lg p-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start
                         hover:translate-y-[-4px] transition-transform duration-300 ease-in-out">
            {/* Left Section: Profile Picture */}
            <div className="flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 bg-indigo-100 rounded-full flex items-center justify-center mr-0 sm:mr-6 mb-4 sm:mb-0">
                <span className="text-4xl sm:text-5xl font-semibold text-indigo-700">JD</span>
            </div>

            {/* Right Section: Details */}
            <div className="flex-grow text-center sm:text-left">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-0">JOHN DOE</h2>
                    {/* Edit Icon */}
                    <button className="p-2 bg-gray-100 rounded-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                </div>

                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-gray-700 text-base sm:text-lg">
                    <div className="flex items-center justify-center sm:justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2v-5m-7-5a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5z" />
                        </svg>
                        <span>E123</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m8-10v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                        <span>ABC Services</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-1.208-8.455-3.245m16.91 0c.75.053 1.5.044 2.247-.027m-4.502 0c.266-.026.53-.06.792-.102M12 2v10m-3.486 1.848a3 3 0 000 4.31m6.972 0a3 3 0 000-4.31M12 22v-4m-3.93-2.618l-.928 2.062a1 1 0 01-1.488.587l-2.062-.928a1 1 0 01-.587-1.488l2.062-.928a1 1 0 011.488.587L9.93 19.382zM17.93 19.382l-.928-2.062a1 1 0 011.488-.587l2.062.928a1 1 0 01.587 1.488l-2.062.928a1 1 0 01-1.488-.587zM12 12h.01" />
                        </svg>
                        <span>Software</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-9 13a9 9 0 100-18 9 9 0 000 18z" />
                        </svg>
                        <span>john@gmail.com</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>+91123456789</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Associate Software</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Assignment Component (Line Chart) ---
const Assignment = () => {
    const dailyAssignmentData = [
        { "project_name": "HRMS Project", "Task": "Chat Application", "Assigment": "Web Page for chart System", "Manager": "Ravindra", "No of assignment": 1, "day": "Monday" },
        { "project_name": "HRMS Project", "Task": "Chat Application", "Assigment": "Adding some application", "Manager": "Ravindra", "No of assignment": 1, "day": "Tuesday" },
        { "project_name": "HRMS Project", "Task": "Chat Application", "Assigment": "Add file send application", "Manager": "Ravindra", "No of assignment": 1, "day": "Wednesday" },
        { "project_name": "HRMS Project", "Task": "Chat Application", "Assigment": "Add Audio call application and video call", "Manager": "Ravindra", "No of assignment": 2, "day": "Thursday" },
        { "project_name": "HRMS Project", "Task": "Chat Application", "Assigment": "Create Groups, search bar", "Manager": "Ravindra", "No of assignment": 2, "day": "Friday" },
        { "project_name": "HRMS Project", "Task": "Chat Application", "Assigment": "Styling to entire page", "Manager": "Ravindra", "No of assignment": 4, "day": "Saturday" },
        { "project_name": "HRMS Project", "Task": "Chat Application", "Assigment": null, "Manager": "Ravindra", "No of assignment": 0, "day": "Sunday" },
    ];

    const weeklyAssignmentData = [
        { "Period": "Week-1", "No of assignment": 5 },
        { "Period": "Week-2", "No of assignment": 8 },
        { "Period": "Week-3", "No of assignment": 10 },
        { "Period": "Week-4", "No of assignment": 9 },
    ];

    const monthlyAssignmentSummary = {
        "Month": "Last Month",
        "No of Assignment": 30
    };

    const [selectedView, setSelectedView] = useState('Days');

    const getChartData = () => {
        switch (selectedView) {
            case 'Days': return dailyAssignmentData;
            case 'Weeks': return weeklyAssignmentData;
            default: return [];
        }
    };

    const getXAxisDataKey = () => {
        switch (selectedView) {
            case 'Days': return 'day';
            case 'Weeks': return 'Period';
            default: return '';
        }
    };

    return (
        <div className="chart-panel bg-white rounded-xl shadow-lg p-6 h-[400px] flex flex-col justify-between border border-gray-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out">
            <h2 className="chart-title text-2xl font-bold mb-4 text-center text-gray-800">
                Assignments Completed
            </h2>

            <div className="flex justify-center mb-4 space-x-4">
                {['Days', 'Weeks', 'Months'].map((view) => (
                    <button
                        key={view}
                        onClick={() => setSelectedView(view)}
                        className={`px-6 py-2 rounded-lg text-lg font-semibold transition-colors duration-300 ${
                            selectedView === view
                                ? 'bg-indigo-400 text-white shadow-md'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {view}
                    </button>
                ))}
            </div>

            {selectedView === 'Months' ? (
                <div className="flex-grow flex items-center justify-center">
                    <div className="bg-gradient-to-r from-teal-500 to-green-600 text-white p-8 rounded-lg shadow-xl text-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
                        <p className="text-xl font-medium mb-2">{monthlyAssignmentSummary.Month} Assignments:</p>
                        <p className="text-5xl font-extrabold">{monthlyAssignmentSummary["No of Assignment"]}</p>
                    </div>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey={getXAxisDataKey()} className="text-sm text-gray-600" />
                        <YAxis allowDecimals={false} className="text-sm text-gray-600" />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="No of assignment"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

// --- AssignmentSurvey Component (Bar Chart) ---
const AssignmentSurvey = () => {
    const dailyData = [
        { Project: "TECH LIFE", Task: "Chat System", day: "Mon", Range: 10, Status: "Completed", Assigment: "Web Page for chart System", "No of assignment": 1 },
        { Project: "TECH LIFE", Task: "Chat System", day: "Tues", Range: 5, Status: "on-going", Assigment: "Adding some application", "No of assignment": 3 },
        { Project: "TECH LIFE", Task: "Chat System", day: "Wed", Range: 10, Status: "Completed", Assigment: "Add file send application", "No of assignment": 1 },
        { Project: "TECH LIFE", Task: "Chat System", day: "Thur", Range: 8, Status: "on-going", Assigment: "Add Audio call application and video call", "No of assignment": 2 },
        { Project: "TECH LIFE", Task: "Chat System", day: "Fri", Range: 10, Status: "Completed", Assigment: "Create Groups, search bar", "No of assignment": 2 },
        { Project: "TECH LIFE", Task: "Chat System", day: "Sat", Range: 4, Status: "Not Started", Assigment: "Styling to entire page", "No of assignment": 5 },
        { Project: "TECH LIFE", Task: "Chat System", day: "Sun", Range: 0, Status: null, Assigment: null, "No of assignment": 0 },
    ];

    const weeklyData = [
        { "Period": "Week-1", "Range": 5 },
        { "Period": "Week-2", "Range": 7 },
        { "Period": "Week-3", "Range": 8 },
        { "Period": "Week-4", "Range": 10 }
    ];

    const monthlyData = {
        "Month": "Last Month",
        "Range": "70%"
    };

    const [selectedView, setSelectedView] = useState('Days');

    const statusColors = {
        Completed: "#27F56C",
        "on-going": "#BB27F5",
        "Not Started": "#F52731",
        null: "#adb5bd",
    };

    const getChartData = () => {
        switch (selectedView) {
            case 'Days': return dailyData;
            case 'Weeks': return weeklyData;
            default: return [];
        }
    };

    const getAxisDataKey = () => {
        switch (selectedView) {
            case 'Days': return "day";
            case 'Weeks': return "Period";
            default: return "";
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            if (selectedView === 'Days') {
                return (
                    <div className="p-3 bg-white border border-gray-300 rounded-md shadow-lg text-sm text-gray-800">
                        <p className="font-semibold text-lg mb-1">{label}</p>
                        <p><strong>Project:</strong> {item.Project || "None"}</p>
                        <p><strong>Task:</strong> {item.Task || "None"}</p>
                        <p><strong>Assignment:</strong> {item.Assigment || "None"}</p>
                        <p><strong>Status:</strong> {item.Status || "N/A"}</p>
                        <p><strong>No of Assignments:</strong> {item["No of assignment"]}</p>
                        <p><strong>Range:</strong> {item.Range}</p>
                    </div>
                );
            } else if (selectedView === 'Weeks') {
                return (
                    <div className="p-3 bg-white border border-gray-300 rounded-md shadow-lg text-sm text-gray-800">
                        <p className="font-semibold text-lg mb-1">{label}</p>
                        <p><strong>Completion Range:</strong> {item.Range}</p>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="chart-panel bg-white rounded-xl shadow-lg p-6 h-[400px] flex flex-col justify-between border border-gray-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out">
            <h2 className="chart-title text-2xl font-bold mb-4 text-center text-gray-800">Assignment Status Survey</h2>

            <div className="flex justify-center mb-4 space-x-4">
                {['Days', 'Weeks', 'Months'].map((view) => (
                    <button
                        key={view}
                        onClick={() => setSelectedView(view)}
                        className={`px-6 py-2 rounded-lg text-lg font-semibold transition-colors duration-300 ${
                            selectedView === view
                                ? 'bg-indigo-400 text-white shadow-md'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {view}
                    </button>
                ))}
            </div>

            {selectedView === 'Months' ? (
                <div className="flex-grow flex items-center justify-center">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 rounded-lg shadow-xl text-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
                        <p className="text-xl font-medium mb-2">{monthlyData.Month} Completion:</p>
                        <p className="text-5xl font-extrabold">{monthlyData.Range}</p>
                    </div>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                        layout="vertical"
                        data={getChartData()}
                        margin={{ top: 20, right: 40, left: 80, bottom: 10 }}
                    >
                        <XAxis type="number" className="text-sm text-gray-600" />
                        <YAxis dataKey={getAxisDataKey()} type="category" className="text-sm text-gray-600" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="Range">
                            {getChartData().map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={selectedView === 'Days' ? (statusColors[entry.Status] || "#adb5bd") : "#CF27F5"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

// --- Achievement Component (Donut Chart) ---
const Achievement = () => {
    const [showFeedback, setShowFeedback] = useState(false);
    const initialWeeklyData = [
        { period: 'Week 1', score: 3, FeedBack: 'Improve work Progress', color: '#2AF527' },
        { period: 'Week 2', score: 6, FeedBack: 'Good', color: '#F5AD27' },
        { period: 'Week 3', score: 8, FeedBack: 'Excellent', color: '#27E4F5' },
        { period: 'Week 4', score: 9, FeedBack: 'OutStanding', color: '#BB27F5' },
    ];
    const [weeklyData, setWeeklyData] = useState(initialWeeklyData);

    const radiusStart = 50;
    const ringWidth = 10;

    return (
        <div className="chart-panel bg-white rounded-xl shadow-lg p-6 h-[500px] flex flex-col justify-between border border-gray-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out relative">
            <h2 className="chart-title text-2xl font-bold mb-4 text-center text-gray-800">Weekly Achievement Score</h2>
            <div className="absolute top-6 right-6 z-10">
                <button
                    className="bg-blue-600 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setShowFeedback(!showFeedback)}
                >
                    {showFeedback ? 'Hide Feedback' : 'Show Feedback'}
                </button>
            </div>

            <div className="flex-grow w-full relative">
                <ResponsiveContainer>
                    <PieChart>
                        {weeklyData.map((week, index) => {
                            const pieData = [
                                { name: week.period, value: week.score },
                                { name: 'Remaining', value: 10 - week.score },
                            ];
                            return (
                                <Pie
                                    key={week.period}
                                    data={pieData}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    startAngle={90}
                                    endAngle={-270}
                                    innerRadius={radiusStart + index * ringWidth}
                                    outerRadius={radiusStart + (index + 1) * ringWidth}
                                    isAnimationActive={false}
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell
                                            key={`cell-${i}`}
                                            fill={i === 0 ? week.color : '#f0f0f0'}
                                        />
                                    ))}
                                </Pie>
                            );
                        })}
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-center">
                    <div className="text-md font-semibold text-gray-700">Overall Score</div>
                    <div className="text-xl font-bold text-gray-900">
                        {
                            Math.round(
                                (weeklyData.reduce((sum, w) => sum + w.score, 0) /
                                    (weeklyData.length * 10)) *
                                100
                            )
                        }%
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-700">
                {weeklyData.map((week, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: week.color }}
                        ></span>
                        {week.period}
                    </div>
                ))}
            </div>

            {showFeedback && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200 shadow-inner">
                    <h3 className="text-center font-semibold text-gray-700 mb-3">
                        Week-wise Feedback
                    </h3>
                    <ul className="space-y-1 text-gray-600 text-sm">
                        {weeklyData.map((week, index) => (
                            <li key={index}>
                                <strong>{week.period}:</strong> {week.FeedBack}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- Projects Component (Area Chart) ---
function Projects() {
    const initialRawData = [
        { project_id: "P_01", project_name: "HRMS Project", status: "Ongoing", Survey: 22, Month: "July 03" },
        { project_id: "P_01", project_name: "HRMS Project", status: "Ongoing", Survey: 11, Month: "Aug 03" },
        { project_id: "P_01", project_name: "HRMS Project", status: "Ongoing", Survey: 20, Month: "Sep 03" },
        { project_id: "P_01", project_name: "HRMS Project", status: "Ongoing", Survey: 27, Month: "Oct 03" },
        { project_id: "P_01", project_name: "HRMS Project", status: "Ongoing", Survey: 37, Month: "Nov 03" },
        { project_id: "P_01", project_name: "HRMS Project", status: "Ongoing", Survey: 20, Month: "Dec 03" },
    ];
    const [rawData] = useState(initialRawData);

    const getCombinedData = () => {
        const grouped = {};
        rawData.forEach(item => {
            if (!grouped[item.Month]) {
                grouped[item.Month] = { Month: item.Month };
            }
            grouped[item.Month].HRMS = item.Survey;
        });
        return Object.values(grouped);
    };

    const combinedData = getCombinedData();

    return (
        <div className="chart-panel bg-white rounded-xl shadow-lg p-6 h-[500px] flex flex-col justify-between border border-gray-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out">
            <h2 className="chart-title text-2xl font-bold mb-4 text-center text-gray-800">Project Survey</h2>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={combinedData}>
                    <defs>
                        <linearGradient id="colorHRMS" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="Month" className="text-sm text-gray-600" />
                    <YAxis className="text-sm text-gray-600" />
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Area
                        type="monotone"
                        dataKey="HRMS"
                        stroke="#4f46e5"
                        fillOpacity={1}
                        fill="url(#colorHRMS)"
                        name="HRMS Project"
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// --- Main Performance Dashboard Component ---
const PerformanceDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-6 sm:p-6 lg:p-8 font-sans">
            <header className="p-3 mb-6 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    Performance Dashboard
                </h1>
                <EmployeeProfile />
            </header>
            <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Assignment />
                <AssignmentSurvey />
                <Achievement />
                <Projects />
            </div>
        </div>
    );
};

export default PerformanceDashboard;