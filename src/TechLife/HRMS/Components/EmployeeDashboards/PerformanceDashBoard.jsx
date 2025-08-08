import React, { useState, useEffect, useMemo } from 'react';
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
const weeklyTaskData = [
    { project_name: 'HRMS Project', Manager: 'Ravindra', Period: 'Week-1', 'No of Task': 2 },
    { project_name: 'HRMS Project', Manager: 'Ravindra', Period: 'Week-2', 'No of Task': 4 },
    { project_name: 'HRMS Project', Manager: 'Ravindra', Period: 'Week-3', 'No of Task': 8 },
    { project_name: 'HRMS Project', Manager: 'Ravindra', Period: 'Week-4', 'No of Task': 6 },
];

const monthlyTaskSummary = [
    { project_name: 'HRMS Project', Manager: 'Ravindra', Month: 'Jun', 'No of Task': 20 },
    { project_name: 'HRMS Project', Manager: 'Ravindra', Month: 'Jul', 'No of Task': 40 },
    { project_name: 'HRMS Project', Manager: 'Ravindra', Month: 'Aug', 'No of Task': 30 },
    { project_name: 'HRMS Project', Manager: 'Ravindra', Month: 'Sep', 'No of Task': 25 },
    { project_name: 'HRMS Project', Manager: 'Ravindra', Month: 'Oct', 'No of Task': 15 },
    { project_name: 'HRMS Project', Manager: 'Ravindra', Month: 'Nov', 'No of Task': 10 },
    { project_name: 'HRMS Project', Manager: 'Ravindra', Month: 'Dec', 'No of Task': 24 },
];

// Custom Tooltip for Line Chart (Weekly Data)
const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-300 shadow-md rounded-lg">
                <p className="font-semibold text-gray-700">{`Period: ${label}`}</p>
                <p className="text-blue-600">{`Total Tasks: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

// Custom Tooltip for Area Chart (Monthly Data)
const CustomAreaTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-300 shadow-md rounded-lg">
                <p className="font-semibold text-gray-700">{`Month: ${label}`}</p>
                <p className="text-purple-600">{`Total Tasks: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const TaskCharts = () => {
    const [chartType, setChartType] = useState('weekly'); // 'weekly' or 'monthly'

    return (
        <div className="chart-panel bg-white rounded-xl shadow-lg p-6 h-[500px] flex flex-col justify-between border border-blue-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out relative">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-left"> Task Overview</h1>

                {/* Buttons in the center within the chart layout */}
                <div className="absolute items-center top-6 right-6 flex space-x-4 z-10">
                    <button
                        onClick={() => setChartType('weekly')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
              ${chartType === 'weekly' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Weekly Tasks
                    </button>
                    <button
                        onClick={() => setChartType('monthly')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
              ${chartType === 'monthly' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        Monthly Tasks
                    </button>
                </div>

                <div className="mt-12" style={{ width: '100%', height: 400 }}>
                    {chartType === 'weekly' ? (
                        <ResponsiveContainer>
                            <LineChart
                                data={weeklyTaskData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-300" />
                                <XAxis dataKey="Period" hide />
                                <YAxis hide />
                                <Tooltip content={<CustomLineTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="No of Task"
                                    stroke="#4F46E5" // Indigo color
                                    activeDot={{ r: 8 }}
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <ResponsiveContainer>
                            <AreaChart
                                data={monthlyTaskSummary}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-300" />
                                <XAxis dataKey="Month"  />
                                <YAxis hide />
                                <Tooltip content={<CustomAreaTooltip />} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="No of Task"
                                    stroke="#8B5CF6" // Purple color
                                    fillOpacity={0.8}
                                    fill="url(#colorUv)"
                                    strokeWidth={2}
                                />
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
       
    );
}

// --- AssignmentSurvey Component (Bar Chart) ---
const Preformancerating = () => {
    const weeklyData = [
        { "Period": "Week-1","usercount":5, "rating_start":0, "rating_end":10, "topPercentage": 10.0 },
        { "Period": "Week-1","usercount":8, "rating_start":10, "rating_end":20, "topPercentage":9.5 },
        { "Period": "Week-1","usercount":10,"rating_start":30, "rating_end":40, "topPercentage":9.0 },
        { "Period": "Week-1","usercount":7, "rating_start":40, "rating_end":50, "topPercentage":8.5 },
        { "Period": "Week-1","usercount":5, "rating_start":50, "rating_end":60, "topPercentage":8.0 },
        { "Period": "Week-2","usercount":5, "rating_start":0, "rating_end":10, "topPercentage":10.0 },
        { "Period": "Week-2","usercount":7, "rating_start":10, "rating_end":20, "topPercentage":9.5 },
        { "Period": "Week-2","usercount":8, "rating_start":30, "rating_end":40, "topPercentage":9.0 },
        { "Period": "Week-2","usercount":10, "rating_start":40, "rating_end":50, "topPercentage":8.5 },
        { "Period": "Week-2","usercount":5, "rating_start":50, "rating_end":60, "topPercentage":8.0 },
        { "Period": "Week-3","usercount":7, "rating_start":0, "rating_end":10, "topPercentage":10.0 },
        { "Period": "Week-3","usercount":10, "rating_start":10, "rating_end":20, "topPercentage":9.5 },
        { "Period": "Week-3","usercount":8, "rating_start":30, "rating_end":40, "topPercentage":9.0 },
        { "Period": "Week-3","usercount":5, "rating_start":40, "rating_end":50, "topPercentage":8.5 },
        { "Period": "Week-3","usercount":5, "rating_start":50, "rating_end":60, "topPercentage":8.0 },
        { "Period": "Week-4","usercount":10, "rating_start":0, "rating_end":10, "topPercentage":10.0 },
        { "Period": "Week-4","usercount":8, "rating_start":10, "rating_end":20, "topPercentage":9.5 },
        { "Period": "Week-4","usercount":7, "rating_start":30, "rating_end":40, "topPercentage":9.0 },
        { "Period": "Week-4","usercount":5, "rating_start":40, "rating_end":50, "topPercentage":8.5 },
        { "Period": "Week-4","usercount":5, "rating_start":50, "rating_end":60, "topPercentage":8.0 },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="p-2 bg-white border border-gray-300 rounded shadow-md">
                    <p className="text-gray-800">
                        <span className="font-semibold">User Count:</span> {data.usercount}
                    </p>
                    <p className="text-gray-800">
                        <span className="font-semibold">Rating Range:</span> {data.rating_start}-{data.rating_end}
                    </p>
                    <p className="text-gray-800">
                        <span className="font-semibold">Top Percentage:</span> {data.topPercentage}%
                    </p>
                </div>
            );
        }
        return null;
    };


    const [currentPeriod, setCurrentPeriod] = useState('Week-1');

    const filteredData = weeklyData.filter(item => item.Period === currentPeriod);

    let highestUserCount = 0;
    if (filteredData.length > 0) {
        highestUserCount = Math.max(...filteredData.map(item => item.usercount));
    }

    // Get unique periods for the dropdown options
    const uniquePeriods = [...new Set(weeklyData.map(item => item.Period))];

    const handlePeriodChange = (event) => {
        setCurrentPeriod(event.target.value);
    };

    return (
        <div className="chart-panel bg-white rounded-xl shadow-lg p-6 h-[500px] flex flex-col justify-between border border-blue-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out relative">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Performance Overview - {currentPeriod}</h2>
            <div className="mb-4">
                <label htmlFor="period-select" className="sr-only">Select Period</label>
                <select
                    id="period-select"
                    value={currentPeriod}
                    onChange={handlePeriodChange}
                    className="block w-full px-4 py-2 text-base text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    {uniquePeriods.map(period => (
                        <option key={period} value={period}>
                            {period}
                        </option>
                    ))}
                </select>
            </div>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart
                    data={filteredData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    
                    <XAxis
                        dataKey="topPercentage"
                        label={{ value: "Top Percentage", position: "insideBottom", offset: -5 }}
                        tickLine={false}
                        axisLine={{ stroke: '#ccc' }}
                        tickFormatter={(value) => `${value}%`}
                        className="text-sm fill-gray-600" hide
                        // removed 'hide' prop to show X-axis labels
                    />
                    <YAxis
                        label={{ value: "User Count", angle: -90, position: "insideLeft" }}
                        tickLine={false}
                        axisLine={{ stroke: '#ccc' }}
                        className="text-sm fill-gray-600" hide
                        // removed 'hide' prop to show Y-axis labels
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="usercount" barSize={120}>
                        {
                            filteredData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.usercount === highestUserCount ? '#8884d8' : '#82ca9d'}
                                />
                            ))
                        }
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
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
        <div className="chart-panel bg-white rounded-xl shadow-lg p-6 h-[500px] flex flex-col justify-between border border-blue-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out relative">
            <h2 className="chart-title text-2xl font-bold mb-4 text-center text-gray-800">Weekly Achievement Score</h2>
            <div className="absolute top-16 right-6 z-10">
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
        { project_id: "P_01", project_name: "HRMS Project", status: "Ongoing", Survey: 22, Month: "Jul 03" },
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
        <div className=" bg-white rounded-xl shadow-lg p-6 h-[500px]  flex flex-col justify-center border border-gray-200 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ease-in-out">
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
                    <YAxis className="text-sm text-gray-600" hide />
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
            <header className="p-3 mb-6 text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    Performance Dashboard
                </h1>
                <EmployeeProfile />
            </header>
            <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Each chart component will now occupy its own grid cell */}
                <TaskCharts />
                <Preformancerating />
                <Achievement />
                <Projects />
            </div>
        </div>
    );
};

export default PerformanceDashboard;