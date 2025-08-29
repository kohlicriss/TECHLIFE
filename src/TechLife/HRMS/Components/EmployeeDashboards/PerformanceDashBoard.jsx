import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
    PieChart, Pie,
    AreaChart, Area, Legend, CartesianGrid
} from 'recharts';
import { useParams } from "react-router-dom";
import { Context } from "../HrmsContext";

// --- EmployeeProfile Component ---
const UserGreeting = ({currentUser}) => {
     const {userData}=useContext(Context)
    return(
  <div className="flex justify-between items-center p-6 bg-white rounded-lg shadow-md mt-4">
    <div className="flex items-center space-x-4">
      <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden">
          <img
            src={currentUser?.avatar || "https://i.pravatar.cc/100"}
            alt="Profile"
            className="w-20 h-20 object-cover"
          />
        </div>
      <div>
        <h2 className="text-2xl font-semibold flex items-center">
          Welcome, {userData?.employeeId}, {userData?.fullName}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-4.604 4.549l2.828 2.829-5.46 5.46a1 1 0 01-.453.298l-3.268.817a1 1 0 01-1.218-1.218l.817-3.268a1 1 0 01.298-.453l5.46-5.46z" />
          </svg>
        </h2>
        <p className="text-gray-500 mt-1">
          You have to <span className="font-bold text-red-500">Improve work progress</span> as compare to {' '}
          <span className="font-bold text-red-500">Last month's </span> performance
        </p>
      </div>
    </div>
  </div>
);
};

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
                        className="text-sm fill-gray-600"  
                        // removed 'hide' prop to show X-axis labels
                    />
                    <YAxis
                        label={{ value: "User Count", angle: -90, position: "insideLeft" }}
                        tickLine={false}
                        axisLine={{ stroke: '#ccc' }}
                        className="text-sm fill-gray-600" 
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
                <UserGreeting />
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