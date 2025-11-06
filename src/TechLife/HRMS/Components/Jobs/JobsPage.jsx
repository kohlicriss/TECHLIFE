import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddJobModal, setShowAddJobModal] = useState(false);
    const [showEditJobModal, setShowEditJobModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
   const [newJob, setNewJob] = useState({
    jobTitle: '', 
    experience: 0, 
    location: '',
    department: '',
    jobtype: 'Full-Time', 
    skills: '', 
    description: '',
    status: 'Active'
});
    const [currentSkill, setCurrentSkill] = useState('');
    const [scheduleData, setScheduleData] = useState({
        date: '',
        time: '',
        duration: '30',
        meetingType: 'video',
        notes: ''
    });

    const token = localStorage.getItem("accessToken");

    // API base URL
    const API_BASE_URL = 'http://localhost:8087/api/payroll/jobs';

    // Fetch all jobs
    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/getall`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(response.data);
            if (response.data.length > 0) {
                setSelectedJob(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            alert('Failed to fetch jobs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch applicants for a specific job
    const fetchApplicants = async (jobId) => {
        try {
            // Replace with your actual applicants endpoint
            const response = await axios.get(`${API_BASE_URL}/${jobId}/applicants`, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            setApplicants(response.data);
        } catch (error) {
            console.error('Error fetching applicants:', error);
            // For now, we'll keep the mock applicants since we don't have the endpoint
            console.log('Using mock applicants data');
        }
    };

   // Create new job - match backend structure
const createJob = async (jobData) => {
    try {
        // Transform data to match backend expectations
        const backendJobData = {
            jobTitle: jobData.jobTitle,
            experience: parseInt(jobData.experience) || 0, // ensure it's a number
            location: jobData.location,
            department: jobData.department,
            jobtype: jobData.jobtype,
            skills: Array.isArray(jobData.skills) ? jobData.skills.join(',') : jobData.skills, // convert array to string
            description: jobData.description,
            status: jobData.status
        };

        const response = await axios.post(`${API_BASE_URL}/create`, backendJobData, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating job:', error);
        throw error;
    }
};

// Update job - FIXED
const updateJob = async (jobId, jobData) => {
    try {
        // Transform data to match backend expectations
        const backendJobData = {
            jobTitle: jobData.jobTitle,
            experience: parseInt(jobData.experience) || 0,
            location: jobData.location,
            department: jobData.department,
            jobtype: jobData.jobtype,
            skills: Array.isArray(jobData.skills) ? jobData.skills.join(',') : jobData.skills,
            description: jobData.description,
            status: jobData.status
        };

        const response = await axios.put(`${API_BASE_URL}/${jobId}/update`, backendJobData, {  // Added /update
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating job:', error);
        throw error;
    }
};

   

    // Delete job
    const deleteJob = async (jobId) => {
        try {
            await axios.delete(`${API_BASE_URL}/${jobId}/delete`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error deleting job:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        if (selectedJob) {
            fetchApplicants(selectedJob.id);
        }
    }, [selectedJob]);

    const handleJobSelect = (job) => {
        setSelectedJob(job);
    };

    const getApplicantsForJob = (jobId) => {
        return applicants.filter(applicant => applicant.jobId === jobId);
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'applied': return 'bg-yellow-100 text-yellow-800';
            case 'under review': return 'bg-blue-100 text-blue-800';
            case 'interview': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'hired': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAddJob = () => {
        setShowAddJobModal(true);
    };

   const handleEditJob = (job) => {
    // Make sure we're using the correct ID field (jobId from backend)
    console.log('Editing job:', job); // Debug log
    
    // Transform backend data to frontend format
    const frontendJob = {
        jobId: job.jobId,
        jobTitle: job.jobTitle,
        experience: job.experience,
        location: job.location,
        department: job.department,
        jobtype: job.jobtype,
        skills: job.skills, 
        description: job.description,
        status: job.status
    };
    setNewJob(frontendJob);
    setShowEditJobModal(true);
};

    const handleScheduleMeeting = (applicant) => {
        setSelectedApplicant(applicant);
        setScheduleData({
            date: '',
            time: '',
            duration: '30',
            meetingType: 'video',
            notes: ''
        });
        setShowScheduleModal(true);
    };

    const handleCloseModal = () => {
        setShowAddJobModal(false);
        setShowEditJobModal(false);
        setShowScheduleModal(false);
        setNewJob({
            title: '',
            experience: '',
            location: '',
            department: '',
            type: 'Full-time',
            skills: [],
            description: '',
            status: 'Open'
        });
        setCurrentSkill('');
        setSelectedApplicant(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewJob(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleScheduleChange = (e) => {
        const { name, value } = e.target;
        setScheduleData(prev => ({
            ...prev,
            [name]: value
        }));
    };

   const handleAddSkill = () => {
    if (currentSkill.trim()) {
        const currentSkills = newJob.skills ? newJob.skills.split(',').filter(s => s.trim()) : [];
        if (!currentSkills.includes(currentSkill.trim())) {
            const updatedSkills = [...currentSkills, currentSkill.trim()].join(',');
            setNewJob(prev => ({
                ...prev,
                skills: updatedSkills
            }));
        }
        setCurrentSkill('');
    }
};

const handleRemoveSkill = (skillToRemove) => {
    const currentSkills = newJob.skills ? newJob.skills.split(',').filter(s => s.trim()) : [];
    const updatedSkills = currentSkills.filter(skill => skill !== skillToRemove).join(',');
    setNewJob(prev => ({
        ...prev,
        skills: updatedSkills
    }));
};

    const handleSkillKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    
    try {
        if (showEditJobModal) {
            // Make sure we have the jobId
            if (!newJob.jobId) {
                alert('Error: Job ID is missing. Cannot update job.');
                return;
            }
            
            // Update existing job
            const updatedJob = await updateJob(newJob.jobId, newJob); // Use jobId
            setJobs(prev => prev.map(job => 
                job.jobId === updatedJob.jobId ? updatedJob : job  // Compare by jobId
            ));
            setSelectedJob(updatedJob);
        } else {
            // Create new job
            const jobToAdd = await createJob(newJob);
            
            // Add to jobs list
            setJobs(prev => [jobToAdd, ...prev]);
            
            // Select the new job
            setSelectedJob(jobToAdd);
        }
        
        // Close modal and reset form
        handleCloseModal();
        alert(showEditJobModal ? 'Job updated successfully!' : 'Job created successfully!');
    } catch (error) {
        console.error('Submit error:', error);
        alert(`Failed to ${showEditJobModal ? 'update' : 'create'} job. Please try again.`);
    }
};

    const handleSubmitSchedule = (e) => {
        e.preventDefault();
        
        // Update applicant status to Interview
        setApplicants(prev => prev.map(applicant => 
            applicant.id === selectedApplicant.id 
                ? { ...applicant, status: 'Interview' }
                : applicant
        ));

        // Here you would typically send the schedule data to your backend
        console.log('Scheduling meeting:', {
            applicant: selectedApplicant,
            schedule: scheduleData
        });

        // Show success message (you can replace this with a toast notification)
        alert(`Meeting scheduled with ${selectedApplicant.name} on ${scheduleData.date} at ${scheduleData.time}`);
        
        handleCloseModal();
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            try {
                await deleteJob(jobId);
                setJobs(prev => prev.filter(job => job.id !== jobId));
                if (selectedJob?.id === jobId) {
                    setSelectedJob(jobs[0] || null);
                }
                alert('Job deleted successfully!');
            } catch (error) {
                alert('Failed to delete job. Please try again.');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Job Openings</h1>
                    <p className="text-lg text-gray-600">
                        Find the perfect opportunity for your career growth
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Job Openings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-800">Available Positions</h2>
                            <div className="flex items-center gap-3">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {jobs.filter(job => job.status === "Open").length} Open Positions
                                </span>
                                <button
                                    onClick={handleAddJob}
                                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors duration-200 flex items-center justify-center"
                                    title="Add New Job"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
    {jobs.map(job => (
        <div 
            key={job.jobId}  
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedJob?.jobId === job.jobId 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            } ${job.status === 'Closed' ? 'opacity-60' : ''}`}
            onClick={() => handleJobSelect(job)}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{job.jobTitle}</h3>  {/* Changed from job.title to job.jobTitle */}
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {job.status}
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditJob(job);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit Job"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteJob(job.jobId);  {/* Changed from job.id to job.jobId */}
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Job"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {job.experience} years  {/* Added "years" */}
                </div>
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                </div>
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {job.department}
                </div>
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {job.jobtype}  {/* Added job type */}
                </div>
            </div>
            
            {/* FIXED: Skills display - convert string to array */}
            <div className="flex flex-wrap gap-2 mb-3">
                {job.skills && job.skills.split(',').map((skill, index) => (
                    <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                    >
                        {skill.trim()}
                    </span>
                ))}
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Posted: {job.createdDate || 'N/A'}</span>  {/* Added fallback */}
                <span className="font-medium text-blue-600">
                    {getApplicantsForJob(job.jobId).length} Applicants  {/* Changed from job.id to job.jobId */}
                </span>
            </div>
        </div>
    ))}
</div>
                    </div>

                    {/* Right Side - Applicants */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Applicants
                                {selectedJob && (
                                    <span className="text-blue-600 ml-2">for {selectedJob.title}</span>
                                )}
                            </h2>
                            {selectedJob && (
                                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                    {getApplicantsForJob(selectedJob.id).length} total
                                </span>
                            )}
                        </div>

                        {selectedJob ? (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {getApplicantsForJob(selectedJob.id).length > 0 ? (
                                    getApplicantsForJob(selectedJob.id).map(applicant => (
                                        <div key={applicant.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 text-lg">{applicant.name}</h4>
                                                    <p className="text-gray-600 text-sm">{applicant.email}</p>
                                                    <p className="text-gray-500 text-sm">{applicant.phone}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                                                    {applicant.status}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                                                <div>
                                                    <strong>Experience:</strong> {applicant.experience}
                                                </div>
                                                <div>
                                                    <strong>Current Company:</strong> {applicant.currentCompany}
                                                </div>
                                                <div>
                                                    <strong>Applied:</strong> {applicant.appliedDate}
                                                </div>
                                                <div>
                                                    <strong>Resume:</strong>{' '}
                                                    <a 
                                                        href={`/resumes/${applicant.resume}`} 
                                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2 flex-wrap">
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                                    View Profile
                                                </button>
                                                <button 
                                                    onClick={() => handleScheduleMeeting(applicant)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Schedule Interview
                                                </button>
                                                <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                                                    Download Resume
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Applicants Yet</h3>
                                        <p className="text-gray-500">No one has applied for this position yet.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Job</h3>
                                <p className="text-gray-500">Click on a job from the left panel to view applicants</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Job Modal */}
            {(showAddJobModal || showEditJobModal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {showEditJobModal ? 'Edit Job Opening' : 'Add New Job Opening'}
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmitJob} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Job Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="jobTitle"
                                            value={newJob.title}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., Frontend Developer"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Experience Required *
                                        </label>
                                        <input
                                            type="number"
                                            name="experience"
                                            value={newJob.experience}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., 2-4 years"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={newJob.location}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., Bangalore"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Department *
                                        </label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={newJob.department}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., Engineering"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Job Type *
                                        </label>
                                        <select
                                            name="jobtype"
                                            value={newJob.type}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>

                                    <div>
                                     <select
    name="status"
    value={newJob.status}
    onChange={handleInputChange}
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
    <option value="Active">Active</option> 
    <option value="Closed">Closed</option>
    <option value="Draft">Draft</option>
</select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Required Skills
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={currentSkill}
                                            onChange={(e) => setCurrentSkill(e.target.value)}
                                            onKeyPress={handleSkillKeyPress}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Add a skill and press Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddSkill}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
              
<div className="flex flex-wrap gap-2">
    {newJob.skills && newJob.skills.split(',').filter(s => s.trim()).map((skill, index) => (
        <span
            key={index}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
        >
            {skill.trim()}
            <button
                type="button"
                onClick={() => handleRemoveSkill(skill.trim())}
                className="text-blue-600 hover:text-blue-800"
            >
                ×
            </button>
        </span>
    ))}
</div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={newJob.description}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Describe the job responsibilities, requirements, and benefits..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        {showEditJobModal ? 'Update Job Opening' : 'Create Job Opening'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Meeting Modal */}
            {showScheduleModal && selectedApplicant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Schedule Interview</h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold text-gray-900">With: {selectedApplicant.name}</h4>
                                <p className="text-gray-600 text-sm">{selectedApplicant.email}</p>
                                <p className="text-gray-600 text-sm">Position: {selectedJob?.title}</p>
                            </div>

                            <form onSubmit={handleSubmitSchedule} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={scheduleData.date}
                                        onChange={handleScheduleChange}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Time *
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={scheduleData.time}
                                        onChange={handleScheduleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration *
                                    </label>
                                    <select
                                        name="duration"
                                        value={scheduleData.duration}
                                        onChange={handleScheduleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="60">60 minutes</option>
                                        <option value="90">90 minutes</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meeting Type *
                                    </label>
                                    <select
                                        name="meetingType"
                                        value={scheduleData.meetingType}
                                        onChange={handleScheduleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="video">Video Call</option>
                                        <option value="phone">Phone Call</option>
                                        <option value="in-person">In-Person</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={scheduleData.notes}
                                        onChange={handleScheduleChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Any additional information for the candidate..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Schedule Interview
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobsPage;