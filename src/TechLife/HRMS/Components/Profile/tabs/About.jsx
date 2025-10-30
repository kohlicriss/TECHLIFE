import React, { useState, useEffect, useContext, useCallback } from "react";
import { Context } from "../../HrmsContext";
import { useLocation, useParams } from "react-router-dom";
import { IoEye, IoWarning, IoClose } from "react-icons/io5";
import { publicinfoApi } from "../../../../../axiosInstance";

const initialFieldState = { text: "", isEditing: false };

const About = () => {
  const { theme, userData, matchedArray } = useContext(Context); 
  const { empID } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fromContextMenu = searchParams.get('fromContextMenu') === 'true';
  const targetEmployeeId = searchParams.get('targetEmployeeId');
  const employeeIdToFetch = fromContextMenu && targetEmployeeId ? targetEmployeeId : empID;
  const isCurrentUser = String(userData?.employeeId) === String(employeeIdToFetch);
  
  const isReadOnly = fromContextMenu || !isCurrentUser;

  const hasEditPermission = matchedArray?.includes("EDIT_PER");
  const canEdit = isCurrentUser || (fromContextMenu && hasEditPermission);

  const [responses, setResponses] = useState({
    about: initialFieldState,
    jobLove: initialFieldState,
    hobbies: initialFieldState,
  });
  const [editCache, setEditCache] = useState({
    about: '',
    jobLove: '',
    hobbies: ''
  });
  const [recordExists, setRecordExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const revertState = useCallback((allPrevState, field, errorMessage) => {
    setResponses(allPrevState);
    if (field) {
      setEditCache(prev => ({ ...prev, [field]: allPrevState[field].text }));
    } else {
      setEditCache({
        about: allPrevState.about.text,
        jobLove: allPrevState.jobLove.text,
        hobbies: allPrevState.hobbies.text,
      });
    }
    setError(errorMessage);
  }, []);

  const fetchAbout = useCallback(async () => {
    if (!employeeIdToFetch) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await publicinfoApi.get(`employee/about/${employeeIdToFetch}`);
      const apiData = response.data || {};
      setResponses({
        about: { text: apiData.about || "", isEditing: false },
        jobLove: { text: apiData.jobLove || "", isEditing: false },
        hobbies: { text: apiData.hobbies || "", isEditing: false },
      });
      setEditCache({
        about: apiData.about || "",
        jobLove: apiData.jobLove || "",
        hobbies: apiData.hobbies || "",
      });
      setRecordExists(!!(apiData.about || apiData.jobLove || apiData.hobbies));
    } catch (err) {
      if (err.response && err.response.status === 404) setRecordExists(false);
      else setError("Failed to load profile data.");
    } finally {
      setIsLoading(false);
    }
  }, [employeeIdToFetch]);

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  const updateEditCache = (field, value) => setEditCache(prev => ({ ...prev, [field]: value }));

  const handleEdit = (field) => {
    // 🔑 isReadOnly స్థానంలో canEdit చెక్
    if (!canEdit) return; 
    setResponses((prev) => ({ ...prev, [field]: { ...prev[field], isEditing: true } }));
    setEditCache(prev => ({ ...prev, [field]: responses[field].text }));
  };

  const handleCancel = (field) => {
    setResponses((prev) => ({ ...prev, [field]: { ...prev[field], isEditing: false } }));
    setEditCache(prev => ({ ...prev, [field]: responses[field].text }));
  };

  const handleDelete = async (field) => {
    // 🔑 isReadOnly స్థానంలో canEdit చెక్
    if (isSaving || !canEdit) return;
    const allPreviousState = responses;
    setResponses(prev => ({ ...prev, [field]: { text: "", isEditing: false } }));
    setEditCache(prev => ({ ...prev, [field]: "" }));
    setIsSaving(true); setError(null);
    try {
      const payload = {
        employeeId: employeeIdToFetch,
        about: field === 'about' ? "" : allPreviousState.about.text,
        jobLove: field === 'jobLove' ? "" : allPreviousState.jobLove.text,
        hobbies: field === 'hobbies' ? "" : allPreviousState.hobbies.text,
      };
      
      const isAllEmpty = !payload.about.trim() && !payload.jobLove.trim() && !payload.hobbies.trim();
      const endpoint = `employee/${employeeIdToFetch}/${recordExists ? 'updateAbout' : 'createAbout'}`;
      
      await publicinfoApi[recordExists ? 'put' : 'post'](endpoint, payload);
      
      if (isAllEmpty) setRecordExists(false);
      else if (!recordExists) setRecordExists(true);

    } catch (err) {
      revertState(allPreviousState, field, `Failed to delete ${field}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (field) => {
    // 🔑 isReadOnly స్థానంలో canEdit చెక్
    if (!canEdit) return;
    const newValue = editCache[field].trim();
    if (!newValue) {
      handleDelete(field); 
      return;
    }

    setIsSaving(true); setError(null);
    const allPreviousState = responses;
    
    // Optimistic Update
    setResponses(prev => ({ ...prev, [field]: { text: newValue, isEditing: false } }));
    
    const payload = {
      employeeId: employeeIdToFetch,
      about: field === 'about' ? newValue : allPreviousState.about.text,
      jobLove: field === 'jobLove' ? newValue : allPreviousState.jobLove.text,
      hobbies: field === 'hobbies' ? newValue : allPreviousState.hobbies.text,
    };
    
    try {
      const endpoint = `employee/${employeeIdToFetch}/${recordExists ? 'updateAbout' : 'createAbout'}`;
      
      if (recordExists) {
        await publicinfoApi.put(endpoint, payload);
      } else {
        await publicinfoApi.post(endpoint, payload);
        setRecordExists(true);
      }
    } catch (err) {
      const isAlreadyRecordedError =
        err.response &&
        (err.response.status === 500 || err.response.status === 409 ||
          (err.response.status === 400 && JSON.stringify(err.response.data).toLowerCase().includes("already recorded")));
      
      if (isAlreadyRecordedError && !recordExists) {
        try {
          await publicinfoApi.put(`employee/${employeeIdToFetch}/updateAbout`, payload);
          setRecordExists(true);
        } catch {
          revertState(allPreviousState, field, `Failed to save ${field}. Try again.`);
          return;
        }
      } else revertState(allPreviousState, field, `Failed to save ${field}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const EditButton = ({ onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-0.5 border shadow-sm text-xs sm:text-xs transition ${
        theme === 'dark'
          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:text-gray-100 hover:border-gray-500'
          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-800 hover:border-gray-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label="Edit section"
    >
      Edit
    </button>
  );

  const renderResponseSection = (field, title) => {
    const { text, isEditing } = responses[field];

    if (isLoading) {
      return <div className={`h-20 w-full ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded-md animate-pulse`} />;
    }

    if (!text && !isEditing) {
      return (
        <button
          onClick={() => handleEdit(field)}
          // 🔑 ఇక్కడ isReadOnly స్థానంలో canEdit చెక్
          disabled={!canEdit} 
          className={`w-full border rounded-md px-2 py-2 text-xs sm:text-sm transition-colors duration-200 ${
            !canEdit
              ? theme === 'dark'
                ? 'text-gray-500 border-gray-600 cursor-not-allowed'
                : 'text-gray-400 border-gray-300 cursor-not-allowed'
              : theme === 'dark'
              ? 'text-purple-400 border-purple-400 hover:bg-purple-900/20'
              : 'text-purple-600 border-purple-600 hover:bg-purple-50'
          }`}
          aria-label={!canEdit ? `No ${title} added` : `Add your ${title}`}
        >
          {!canEdit ? `No ${title} added` : `Add your ${title}`}
        </button>
      );
    }

    if (isEditing) {
      return (
        <div className="space-y-1 sm:space-y-2 w-full">
          <textarea
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors duration-200 text-xs sm:text-sm ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
            rows={field === "about" ? 5 : 3}
            value={editCache[field]}
            onChange={(e) => updateEditCache(field, e.target.value)}
            placeholder={`Tell us about your ${title.toLowerCase()}...`}
            disabled={!canEdit || isSaving} // 🔑 canEdit చెక్
            style={{ minHeight: '48px', resize: 'vertical' }}
          />
          <div className="flex flex-col sm:flex-row-reverse justify-end space-y-2 sm:space-y-0 sm:space-x-2 w-full">
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleCancel(field)}
                disabled={isSaving}
                className={`w-full sm:w-auto px-2 py-1 rounded-md text-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'text-gray-300 border border-gray-600 hover:bg-gray-700'
                    : 'text-gray-600 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(field)}
                // 🔑 ఇక్కడ disabled={!editCache[field].trim() || isSaving} స్థానంలో isSaving మాత్రమే ఉంచాలి
                // ఎందుకంటే blank సేవ్ చేస్తే ఆటోమేటిక్‌గా handleDelete అవుతుంది (handleSave లో లాజిక్ ఉంది).
                // కానీ user input లేకపోతే Save button enable చేయకూడదు కాబట్టి, పాత లాజిక్ ఉంచడం ఉత్తమం.
                disabled={!editCache[field].trim() || isSaving} 
                className={`w-full sm:w-auto px-2 py-1 rounded-md text-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
            {responses[field].text && (
              <button
                onClick={() => handleDelete(field)}
                disabled={isSaving}
                className={`w-full sm:w-auto px-2 py-1 rounded-md text-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'text-red-400 border border-red-400 hover:bg-red-900/20'
                    : 'text-red-600 border border-red-600 hover:bg-red-50'
                }`}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`p-3 rounded-md w-full relative group transition-colors duration-200 ${
          theme === 'dark'
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-gray-50 border border-gray-200'
        }`}
      >
        {/* Edit button rendering logic సరిచేయబడింది */}
        {canEdit && (
          <div className="absolute top-1 right-1 flex">
            <div className="sm:hidden">
              <EditButton onClick={() => handleEdit(field)} disabled={isSaving} />
            </div>
            <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <EditButton onClick={() => handleEdit(field)} disabled={isSaving} />
            </div>
          </div>
        )}

        <p className={`whitespace-pre-wrap text-xs sm:text-sm break-words ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
          {text}
        </p>
      </div>
    );
  };

  return (
    <div className={`px-2 sm:px-3 md:px-4 py-3 sm:py-4 transition-colors duration-200 min-h-screen w-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      {(fromContextMenu || !isCurrentUser) && (
        <div className={`mb-3 sm:mb-5 p-2 sm:p-3 mx-2 sm:mx-0 rounded-md border-l-4 border-blue-500 shadow-sm ${theme === 'dark' ? 'bg-blue-900/20 border-blue-400' : 'bg-blue-50 border-blue-500'}`}>
          <div className="flex items-center space-x-2 w-full">
            <IoEye className={`w-4 h-4 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <div className="min-w-0 flex-1">
              <p className={`font-semibold text-xs sm:text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-800'}`}>
                {isCurrentUser ? "Your Profile" : "Viewing Employee About Details"}
              </p>
              <p className={`text-[10px] sm:text-xs break-words ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                Employee ID: {employeeIdToFetch}
                {isReadOnly && " • Read-only access"}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className={`mb-3 sm:mb-5 p-2 sm:p-3 mx-2 sm:mx-0 rounded-md text-xs font-medium ${theme === 'dark' ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4 mx-1 sm:mx-0">
        <h2 className={`text-base sm:text-lg md:text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Description</h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h3 className={`text-sm sm:text-base font-medium mb-2 sm:mb-3 break-words ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>About</h3>
            {renderResponseSection("about", "About Me")}
          </div>
          <div>
            <h3 className={`text-sm sm:text-base font-medium mb-2 sm:mb-3 break-words ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>What I love about my job?</h3>
            {renderResponseSection("jobLove", "Job Love")}
          </div>
          <div>
            <h3 className={`text-sm sm:text-base font-medium mb-2 sm:mb-3 break-words ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>My hobbies</h3>
            {renderResponseSection("hobbies", "Hobbies")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;