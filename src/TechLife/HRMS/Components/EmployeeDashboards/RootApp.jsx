import React, { useState, useMemo, useCallback } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, gql, useQuery, useMutation } from '@apollo/client';
import { Calendar, Clock, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Edit, X } from "lucide-react";

// Mock Icons - In a real app, these would come from a library like 'lucide-react'



// --- Utility Functions (Unchanged) ---
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Converts DD-MM-YYYY to YYYY-MM-DD
const toIsoDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
};

// Converts YYYY-MM-DD to DD-MM-YYYY
const toStandardDate = (isoDateString) => {
    if (!isoDateString) return '';
    const parts = isoDateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return isoDateString;
};

// --- GraphQL Operations ---
// IMPORTANT: These query structures are ASSUMPTIONS based on common HRMS data. 
// You must verify these fields against your actual GraphQL schema.

const GET_ATTENDANCE_DATA = gql`
  query GetAttendance($month: Int!, $year: Int!) {
    attendance(month: $month, year: $year) {
      date # Expected format: DD-MM-YYYY
      employeeId
      isPresent # Expected values: "Present", "Absent", "Holiday", "N/A"
      login
      logout
      effectiveHour
    }
  }
`;

const GET_EVENTS = gql`
  query GetEvents($month: Int!, $year: Int!) {
    events(month: $month, year: $year) {
      id
      event
      description
      startDate # Expected format: DD-MM-YYYY
      endDate   # Expected format: DD-MM-YYYY
      holiday # Assuming a boolean or enum indicating if it's a holiday/leave
    }
  }
`;

const ADD_EVENT_MUTATION = gql`
  mutation AddEvent($input: AddEventInput!) {
    addEvent(input: $input) {
      id
      event
      description
      startDate
      endDate
      holiday
    }
  }
`;

// --- Day Details Component (Unchanged, now consumes fetched data) ---

const DayDetailsModal = ({ dayData, eventsOnThisDay, onClose }) => {
    if (dayData.type === 'blank') return null;

    // Default attendance structure for blank days or missing data
    const defaultAttendance = { isPresent: 'Not Logged', login: 'N/A', logout: 'N/A', effectiveHour: 'N/A', employeeId: "EMP001" };
    const attendance = dayData.attendance || defaultAttendance;

    const displayAttendance = {
        employeeId: attendance.employeeId || "EMP001 (Default)",
        date: attendance.date || dayData.dateString,
        effectiveHour: attendance.effectiveHour || "N/A",
        isPresent: attendance.isPresent === 'N/A' ? "Not Logged" : attendance.isPresent,
        login: attendance.login || "N/A",
        logout: attendance.logout || "N/A",
    };

    return (
        <div className="absolute inset-0 flex justify-center items-center z-50 p-4 bg-white/50 bg-opacity-40 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-indigo-700 flex items-center">
                        <Calendar className="mr-2 w-6 h-6" /> Details for {displayAttendance.date}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Attendance Details (Now displays fetched data) */}
                <div className="mb-6 p-4 border rounded-lg bg-indigo-50">
                    <h3 className="text-xl font-semibold text-indigo-800 mb-3 border-b pb-1">Attendance</h3>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Employee ID:</strong> <span className="font-medium">{displayAttendance.employeeId}</span></p>
                        <p><strong>Status:</strong>
                            <span className={`font-bold ml-1 px-2 py-0.5 rounded-full text-sm ${
                                displayAttendance.isPresent === 'Present' ? 'bg-green-200 text-green-800' :
                                displayAttendance.isPresent === 'Absent' ? 'bg-red-200 text-red-800' :
                                displayAttendance.isPresent === 'Holiday' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
                                }`}>
                                {displayAttendance.isPresent}
                            </span>
                        </p>
                        <p><strong>Effective Hour:</strong> <span className="font-medium">{displayAttendance.effectiveHour}</span></p>
                        <p><strong>Login Time:</strong> <span className="font-medium">{displayAttendance.login}</span></p>
                        <p><strong>Logout Time:</strong> <span className="font-medium">{displayAttendance.logout}</span></p>
                    </div>
                </div>

                {/* Event Details */}
                <div className="p-4 border rounded-lg bg-teal-50">
                    <h3 className="text-xl font-semibold text-teal-800 mb-3 border-b pb-1">Events ({eventsOnThisDay.length})</h3>
                    {eventsOnThisDay.length === 0 ? (
                        <p className="text-gray-500 italic">No events scheduled for this day.</p>
                    ) : (
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                            {eventsOnThisDay.map((event, index) => (
                                <div key={index} className="border-l-4 border-teal-400 pl-3 bg-white p-2 rounded shadow-sm">
                                    <p className="font-bold text-gray-800">{event.event}</p>
                                    <p className="text-sm text-gray-600 italic truncate">{event.description}</p>
                                    {event.startDate !== event.endDate && (
                                        <p className="text-xs text-teal-600 mt-1">
                                            Multi-day event: {event.startDate} - {event.endDate}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150">
                        Got It
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- App Component (HEAVILY MODIFIED FOR GRAPHQL) ---

function App() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateForForm, setSelectedDateForForm] = useState({ start: null, end: null });
    const [showEventForm, setShowEventForm] = useState(false);
    const [showEventsList, setShowEventsList] = useState(false);
    const [showDayDetails, setShowDayDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const monthVariable = currentMonth + 1; // 1-indexed month for GraphQL variable

    // --- GRAPHQL DATA FETCHING ---
    const { data: eventsData, loading: eventsLoading, error: eventsError } = useQuery(GET_EVENTS, {
        variables: { month: monthVariable, year: currentYear },
        fetchPolicy: 'cache-and-network',
    });

    const { data: attendanceData, loading: attendanceLoading, error: attendanceError } = useQuery(GET_ATTENDANCE_DATA, {
        variables: { month: monthVariable, year: currentYear },
        fetchPolicy: 'cache-and-network',
    });

    // Safely extract data
    const events = eventsData?.events || [];
    const ATTENDANCE_DATA = attendanceData?.attendance || [];
    
    // --- GRAPHQL MUTATION ---
    const [addEvent, { loading: mutationLoading, error: mutationError }] = useMutation(ADD_EVENT_MUTATION, {
        refetchQueries: [
            { query: GET_EVENTS, variables: { month: monthVariable, year: currentYear } }
        ],
    });
    // ----------------------------

    const getEventsForDate = useCallback((dateString) => {
        const targetDate = new Date(dateString.split('-').reverse().join('-'));
        targetDate.setHours(0, 0, 0, 0);

        return events.filter(event => {
            // Converts DD-MM-YYYY from event data to ISO for Date object
            const eventStart = new Date(event.startDate.split('-').reverse().join('-'));
            const eventEnd = new Date(event.endDate.split('-').reverse().join('-'));
            
            eventStart.setHours(0, 0, 0, 0);
            eventEnd.setHours(0, 0, 0, 0);

            return targetDate >= eventStart && targetDate <= eventEnd;
        });
    }, [events]); 

    const calendarDays = useMemo(() => {
        const totalDays = getDaysInMonth(currentYear, currentMonth);
        const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
        const days = [];
        
        // Blank days
        for (let i = 0; i < firstDay; i++) {
            days.push({ key: `blank-${i}`, type: 'blank' });
        }
        
        // Actual days, populated with fetched attendance data
        for (let day = 1; day <= totalDays; day++) {
            const dateString = `${String(day).padStart(2, '0')}-${String(currentMonth + 1).padStart(2, '0')}-${currentYear}`;
            // Lookup attendance data fetched from GraphQL
            const attendance = ATTENDANCE_DATA.find(data => data.date === dateString) || { isPresent: 'N/A', login: 'N/A', logout: 'N/A' };
            days.push({ date: dateString, type: 'day', day: day, dateString, attendance });
        }
        return days;
    }, [currentYear, currentMonth, ATTENDANCE_DATA]); // Dependency on fetched attendance data

    const changeMonth = useCallback((amount) => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + amount, 1));
        setShowDayDetails(null);
        setShowEventForm(false);
        setShowEventsList(false);
    }, []);

    const handleDayClick = (dayData) => {
        if (dayData.type === 'blank') return;

        if (isEditing) {
            setSelectedDateForForm({ start: dayData.dateString, end: dayData.dateString });
            setShowEventForm(true);
            setIsEditing(false);
        } else {
            const eventsOnThisDay = getEventsForDate(dayData.dateString);
            setShowDayDetails({ ...dayData, eventsOnThisDay });
        }
    };

    // Updated handleFormSubmit to call GraphQL Mutation
    const handleFormSubmit = ({ event, description, startDate, endDate, holiday }) => {
        // startDate and endDate are already YYYY-MM-DD (ISO) from the form
        const input = {
            event,
            description,
            startDate, 
            endDate, 
            holiday: holiday, // Use 'holiday' state from EventFormModal
        };

        addEvent({ variables: { input } })
            .then(() => {
                setShowEventForm(false);
            })
            .catch(err => {
                console.error("Event mutation failed:", err);
                alert(`Failed to add event: ${err.message}`);
            });
    };

    // Event form component (Uses local state for controlled inputs)
    const EventFormModal = ({ onSubmit, selectedDate, onClose }) => {
        const [eventTitle, setEventTitle] = useState('');
        const [description, setDescription] = useState('');
        const [startDate, setStartDate] = useState(toIsoDate(selectedDate.start) || '');
        const [endDate, setEndDate] = useState(toIsoDate(selectedDate.end) || '');
        const [isHoliday, setIsHoliday] = useState(false);
        const theme = 'light'; // Mock theme variable

        const handleSubmit = (e) => {
            e.preventDefault();
            onSubmit({ 
                event: eventTitle, 
                description, 
                startDate, 
                endDate, 
                holiday: isHoliday // Pass the local state back
            });
        };

        return (
            <div className="absolute inset-0 flex justify-center items-center z-50 p-4 bg-white/50 bg-opacity-40 backdrop-blur-sm"> 
                <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
                    <h2 className="text-2xl font-bold text-indigo-700 mb-3 border-b pb-2 flex items-center">
                        <Calendar className="mr-2" /> Add/Edit Event
                    </h2>
                    
                    {mutationLoading && <p className="text-indigo-500 font-semibold mb-3">Submitting Event...</p>}
                    {mutationError && <p className="text-red-500 font-semibold mb-3">Submission Error: {mutationError.message}</p>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="mb-2">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="startDate">Start Date</label>
                            <input
                                id="startDate"
                                name="startDate"
                                type="date"
                                required
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                            />
                        </div>

                        <div className="mb-2">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="endDate">End Date</label>
                            <input
                                id="endDate"
                                name="endDate"
                                type="date"
                                required
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                            />
                        </div>
                    </div>

                    <div className="mb-2">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="eventTitle">Event Title</label>
                        <input
                            id="eventTitle"
                            name="event"
                            type="text"
                            required
                            placeholder="e.g., Team Meeting"
                            value={eventTitle}
                            onChange={e => setEventTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                    </div>
                    
                    <div className="flex items-center pt-6 mb-2">
                        <input 
                            id="isHalfDay"
                            type="checkbox" 
                            checked={isHoliday} 
                            onChange={e => setIsHoliday(e.target.checked)} 
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition duration-150"
                        />
                        <label 
                            htmlFor="isHalfDay"
                            className={`ml-2 block text-sm font-medium cursor-pointer ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}
                        >
                            Is this a Half Day leave/Holiday?
                        </label>
                    </div>
                    

                    <div className="mb-3">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="3"
                            required
                            placeholder="Details about the event..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-150"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        )
    };

    // Event List Component (Now displays fetched events)
    const EventListModal = () => {
        const currentMonthEvents = events
            .filter(event => {
                const eventStart = new Date(event.startDate.split('-').reverse().join('-'));
                const eventEnd = new Date(event.endDate.split('-').reverse().join('-'));
                const targetMonthStart = new Date(currentYear, currentMonth, 1);
                const targetMonthEnd = new Date(currentYear, currentMonth + 1, 0);

                const startsBeforeMonthEnd = eventStart <= targetMonthEnd;
                const endsAfterMonthStart = eventEnd >= targetMonthStart;

                return startsBeforeMonthEnd && endsAfterMonthStart;
            })
            .sort((a, b) => new Date(a.startDate.split('-').reverse().join('-')) - new Date(b.startDate.split('-').reverse().join('-')));

        return (
            <div className="absolute inset-0 flex justify-center items-center z-50 p-4 bg-white/50 bg-opacity-40 backdrop-blur-sm"> 
                <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center border-b-4 border-teal-300 pb-3 mb-6">
                        <h2 className="text-3xl font-extrabold text-teal-600 flex items-center">
                            <Calendar className="mr-3 w-7 h-7" /> Events for {MONTHS[currentMonth]} {currentYear}
                        </h2>
                        <button onClick={() => setShowEventsList(false)} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {currentMonthEvents.length === 0 ? (
                        <p className="text-gray-500 text-lg text-center py-10">No events added for this month yet. 🎉</p>
                    ) : (
                        <div className="space-y-6">
                            {currentMonthEvents.map((event, index) => (
                                <div key={`${event.startDate}-${index}`} className="border border-teal-200 rounded-xl p-4 shadow-sm transition duration-200 bg-teal-50">
                                    <p className="text-lg font-bold text-teal-700 mb-1 border-b border-teal-100 pb-1">
                                        <Clock className="inline w-4 h-4 mr-2" />
                                        Date: {event.startDate} {event.startDate !== event.endDate && (`- ${event.endDate}`)}
                                    </p>
                                    <p className="text-xl font-semibold text-gray-800 mb-2">{event.event}</p>
                                    <p className="text-gray-600 italic border-l-4 border-teal-400 pl-3">{event.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => setShowEventsList(false)}
                        className="mt-8 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition duration-150 shadow-lg float-right"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    // Calendar Day Box Component (Unchanged logic, consumes fetched data)
    const DayBox = ({ dayData }) => {
        if (dayData.type === 'blank') {
            return <div className="p-2 border border-gray-100 bg-gray-50 min-h-[20px] sm:min-h-[40px]"></div>;
        }

        const { day, dateString, attendance } = dayData;
        const isToday = dateString === new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        
        const eventsOnThisDay = getEventsForDate(dateString);

        const hasEvents = eventsOnThisDay.length > 0;
        let statusColor = 'bg-white';
        let statusIcon = null;

        if (attendance.isPresent === 'Present') {
            statusColor = 'bg-green-100 border-green-300';
            statusIcon = <CheckCircle className="w-4 h-4 text-green-600" />;
        } else if (attendance.isPresent === 'Absent') {
            statusColor = 'bg-red-100 border-red-300';
            statusIcon = <AlertTriangle className="w-4 h-4 text-red-600" />;
        } else if (attendance.isPresent === 'Holiday') {
            statusColor = 'bg-yellow-100 border-yellow-300';
            statusIcon = <AlertTriangle className="w-4 h-4 text-yellow-600" />;
        }

        const AttendanceHover = () => (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 bg-white border border-indigo-300 rounded-lg shadow-xl z-50 w-48 hidden group-hover:block text-left">
                <p className="text-xs font-semibold text-indigo-600 border-b pb-1 mb-1">Attendance Info</p>
                <div className="text-sm space-y-1">
                    <p>📅 Date: <span className="font-medium">{attendance.date || dateString}</span></p>
                    <p>⏰ Hour: <span className="font-medium">{attendance.effectiveHour || 'N/A'}</span></p>
                    <p>✅ Status: <span className={`font-bold ${attendance.isPresent === 'Present' ? 'text-green-600' : attendance.isPresent === 'Absent' ? 'text-red-600' : 'text-gray-600'}`}>
                        {attendance.isPresent}
                    </span></p>
                </div>
            </div>
        );

        return (
            <div
                className={`relative group p-2 sm:p-3 border border-gray-300 transition-all duration-200 cursor-pointer ${statusColor} ${isToday ? 'ring-4 ring-indigo-400 font-bold' : ''} ${hasEvents ? 'shadow-lg border-2 border-indigo-500' : 'hover:shadow-lg'} min-h-[50px] sm:min-h-[70px] flex flex-col justify-start ${isEditing ? 'cursor-crosshair ring-2 ring-pink-500' : ''}`}
                onClick={() => handleDayClick(dayData)} 
            >
                {/* Date and Icon (Top of Box) */}
                <div className="flex justify-between items-start mb-1">
                    <span className={`text-lg sm:text-xl ${isToday ? 'text-indigo-700' : 'text-gray-900'}`}>{day}</span>
                    <div className='flex-shrink-0'>{statusIcon}</div>
                </div>

                {/* Event Indicator (Bottom of Box) */}
                {hasEvents && (
                    <div className='mt-auto'>
                        <p className={`text-xs text-indigo-700 font-semibold truncate ${eventsOnThisDay.length > 1 ? 'border-t border-indigo-300 pt-1' : ''}`}>
                            {eventsOnThisDay.length} {eventsOnThisDay.length > 1 ? 'Events' : 'Event'}
                        </p>
                    </div>
                )}
                {/* Tooltip is fixed to display on group-hover */}
                <AttendanceHover /> 
            </div>
        );
    };

    // Global Loading/Error State for the App
    if (eventsLoading || attendanceLoading) return (
        <div className="p-8 text-center bg-gray-50 min-h-screen">
            <p className="text-indigo-600 text-2xl font-semibold mt-20">
                <Clock className="inline w-6 h-6 mr-2 animate-spin"/> Loading Calendar Data...
            </p>
        </div>
    );

    if (eventsError || attendanceError) return (
        <div className="p-8 text-center bg-red-50 min-h-screen">
            <p className="text-red-600 text-xl font-semibold mt-20">Error fetching data. Please check the network and GraphQL endpoint.</p>
            <pre className="text-red-800 p-4 bg-red-100 mt-4 rounded-lg overflow-auto text-left">
                Events Error: {eventsError?.message} <br/>
                Attendance Error: {attendanceError?.message}
            </pre>
        </div>
    );
    
    return (
        <div className="p-4 sm:p-8">
            <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-4 sm:p-6 relative">

                {/* Modals */}
                {showEventForm && (
                    <EventFormModal 
                        onSubmit={handleFormSubmit} 
                        selectedDate={selectedDateForForm} 
                        onClose={() => setShowEventForm(false)} 
                    />
                )}
                {showEventsList && <EventListModal />}
                {showDayDetails && (
                    <DayDetailsModal 
                        dayData={showDayDetails} 
                        eventsOnThisDay={showDayDetails.eventsOnThisDay}
                        onClose={() => setShowDayDetails(null)} 
                    />
                )}

                <div className={`${(showEventForm || showEventsList || showDayDetails) ? 'pointer-events-none opacity-50' : ''}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b pb-4">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-4 sm:mb-0">
                            {MONTHS[currentMonth]} <span className="text-indigo-600">{currentYear}</span>
                        </h1>

                        <div className="flex space-x-2 sm:space-x-4">
                            {/* Edit Button */}
                            <button
                                onClick={() => setIsEditing(prev => !prev)}
                                className={`flex items-center px-3 py-2 sm:px-4 sm:py-2 text-white font-semibold text-sm rounded-lg shadow-md transition duration-150 transform hover:scale-105 ${isEditing ? 'bg-pink-700 hover:bg-pink-800 ring-2 ring-pink-300' : 'bg-pink-500 hover:bg-pink-600'}`}
                            >
                                <Edit className="w-4 h-4 mr-1 sm:mr-2"/> {isEditing ? 'Cancel Event' : 'Add Event'}
                            </button>

                            <button
                                onClick={() => setShowEventsList(true)}
                                className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-indigo-500 text-white font-semibold text-sm rounded-lg shadow-md hover:bg-indigo-600 transition duration-150 transform hover:scale-105"
                            >
                                <Calendar className="w-4 h-4 mr-1 sm:mr-2"/> Events List
                            </button>

                            <button
                                onClick={() => changeMonth(-1)}
                                className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition duration-150"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => changeMonth(1)}
                                className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition duration-150"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="text-center font-semibold text-xs sm:text-sm text-indigo-700 p-2 bg-indigo-100 rounded">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => (
                            <DayBox key={day.key || day.dateString || `day-${index}`} dayData={day} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Root Component for Apollo Setup ---

const GRAPHQL_URI = 'https://hrms.anasolconsultancy.services/api/attendance/graphql';

const client = new ApolloClient({
    link: new HttpLink({
        uri: GRAPHQL_URI,
        // Add headers for authorization if needed
        // headers: { authorization: 'Bearer YOUR_TOKEN' } 
    }),
    cache: new InMemoryCache(),
});

// Export a function that includes the provider wrapper
const RootApp = () => (
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
);

export default RootApp; // You would typically render this RootApp component in your index.js