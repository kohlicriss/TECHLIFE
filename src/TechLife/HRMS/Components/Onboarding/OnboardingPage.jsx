import React, { useState, useMemo, useContext } from "react";
import axios from "axios";
import reactLogo from "../assets/anasol-logo.png";
// Import the Context to access the 'theme'
import { Context } from "../HrmsContext"; 

const OnboardingPage = () => {
  // ================= THEME CONTEXT =================
  const { theme } = useContext(Context); // 'light' or 'dark'

  // ================= LOGIC =================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  
  // Validation State
  const [roleError, setRoleError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOffers = async () => {
    try {
      const response = await axios.get(
        "https://hrms.anasolconsultancyservices.com/api/offer/onboarded-candidates"
      );
      const content = response.data?.content || response.data;

      if (content && Array.isArray(content) && content.length > 0) {
        setCandidates(content);
        setShowModal(true);
      } else {
        alert("No candidates found.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Failed to fetch data. Check console for details.");
    }
  };

  const sendOffer = async (e) => {
    e.preventDefault();

    if (!/^[a-zA-Z\s]*$/.test(role)) {
      alert("Role can only contain letters.");
      return;
    }

    const dto = { name, email, role };
    try {
      await axios.post("https://hrms.anasolconsultancyservices.com/api/offer/sendMail", dto);
      alert("Offer sent successfully! ✅");
      setName(""); 
      setEmail(""); 
      setRole(""); 
      setRoleError("");
    } catch (error) {
      console.error("Send Error:", error);
      alert("Failed to send offer.");
    }
  };

  const handleRoleChange = (val) => {
    setRole(val);
    if (val && !/^[a-zA-Z\s]*$/.test(val)) {
      setRoleError("Only letters and spaces allowed");
    } else {
      setRoleError("");
    }
  };

  // --- MODIFIED HELPER: RENDER CELL CONTENT ---
  const renderCellContent = (key, value) => {
    const stringVal = String(value || "");

    // 1. Check for VIDEO (Key contains 'video' or extension match)
    const isVideo = 
        (stringVal.startsWith("http") && /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(stringVal)) ||
        key.toLowerCase().includes("video");

    if (isVideo && stringVal.startsWith("http")) {
         return (
        <a href={stringVal} target="_blank" rel="noopener noreferrer" 
           className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border transition-colors
           ${theme === 'dark' 
             ? 'bg-purple-900/30 text-purple-300 border-purple-800 hover:bg-purple-800 hover:text-white' 
             : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-600 hover:text-white'}`}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
           Watch
        </a>
      );
    }

    // 2. Check for IMAGE
    const isImage = 
      (stringVal.startsWith("http") && /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(stringVal)) || 
      key.toLowerCase().includes("image") || 
      key.toLowerCase().includes("photo");

    if (isImage && stringVal.startsWith("http")) {
      return (
        <a href={stringVal} target="_blank" rel="noopener noreferrer" 
           className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border transition-colors
           ${theme === 'dark' 
             ? 'bg-blue-900/30 text-blue-300 border-blue-800 hover:bg-blue-800 hover:text-white' 
             : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-600 hover:text-white'}`}>
          <span>🖼️</span> View
        </a>
      );
    }

    // 3. Generic Link
    if (stringVal.startsWith("http")) {
      return (
        <a href={stringVal} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm font-medium">
          Open Link
        </a>
      );
    }
    
    // 4. Default Text
    return <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{value || "-"}</span>;
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) =>
      Object.values(c).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, candidates]);

  const headers = candidates.length > 0 ? Object.keys(candidates[0]) : [];

  return (
    <div className={`min-h-screen flex flex-col items-center py-10 px-4 font-sans transition-colors duration-300 relative
      ${theme === 'dark' 
        ? 'bg-gray-900 bg-[radial-gradient(#374151_1px,transparent_1px)]' 
        : 'bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]'} 
      [background-size:20px_20px]`}>
      
      {/* ============ View Database Button (Stick to Top Right) ============ */}
      <div className="absolute top-6 right-6 z-10">
        <button onClick={fetchOffers} 
          className={`font-semibold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2 text-sm border
          ${theme === 'dark' 
            ? 'bg-gray-800 text-gray-200 border-gray-700 hover:border-gray-500 hover:text-blue-400' 
            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:text-blue-600'}`}>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          View Database
        </button>
      </div>

      {/* Logo & Title */}
      <div className="mb-6 flex flex-col items-center mt-8">
        <img src={reactLogo} alt="Logo" className="h-14 mb-2 drop-shadow-sm" />
        <h1 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Onboarding Admin Portal
        </h1>
      </div>

      {/* Main Form Card */}
      <div className={`w-full max-w-md rounded-xl shadow-lg border overflow-hidden
        ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        
        {/* Card Header */}
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-900 border-gray-800'}`}>
            <h2 className="text-white font-bold text-base">Send Onboarding Link</h2>
            <p className="text-gray-400 text-xs mt-1">Fields marked with * are required.</p>
        </div>

        {/* Form */}
        <form className="p-6 space-y-5" onSubmit={sendOffer}>
          {/* 1. Full Name */}
          <div className="space-y-1.5">
            <label className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name *
            </label>
            <input
              type="text" 
              required 
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all
                ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
              placeholder="Up to 50 characters"
            />
          </div>

          {/* 2. Email Address */}
          <div className="space-y-1.5">
            <label className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address *
            </label>
            <input
              type="email" 
              required 
              maxLength={50}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all
                ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'}`}
              placeholder="e.g. candidate@example.com"
            />
          </div>

          {/* 3. Designation (Role) */}
          <div className="space-y-1.5">
            <label className={`block text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Designation *
            </label>
            <input
              type="text" 
              required 
              maxLength={30}
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 outline-none transition-all
                ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'}
                ${roleError ? 'border-red-500 focus:ring-red-200' : ''}`}
              placeholder="Up to 30 letters only"
            />
            {roleError && <p className="text-red-500 text-[10px] font-bold uppercase">{roleError}</p>}
          </div>

          <button
            type="submit"
            disabled={!!roleError}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-2"
          >
            Generate Offer Letter
          </button>
        </form>
      </div>

      {/* ================= MODAL SECTION ================= */}
      {showModal && (
        <div className="fixed inset-0 z-151 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity " onClick={() => setShowModal(false)} />
          
          <div className={`relative w-full max-w-6xl rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden
            ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between
                ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div>
                <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Onboarded Candidates
                </h3>
                <p className="text-xs text-gray-500 font-medium">Total Records: {filteredCandidates.length}</p>
              </div>
              
              {/* Search & Close */}
              <div className="flex items-center gap-3">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className={`pl-4 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm
                    ${theme === 'dark' 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-300' 
                        : 'bg-white border-gray-300 text-gray-800'}`} 
                />
                <button onClick={() => setShowModal(false)} className={`p-2 rounded-full transition-colors
                    ${theme === 'dark' 
                        ? 'text-gray-400 hover:text-red-400 hover:bg-gray-600' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-gray-200'}`}>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className={`sticky top-0 z-10 shadow-sm
                    ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b
                        ${theme === 'dark' ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-gray-200'}`}>
                          {h.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-100 bg-white'}`}>
                  {filteredCandidates.map((candidate, idx) => (
                    <tr key={idx} className={`transition-colors
                        ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-blue-50/50'}`}>
                      {headers.map((h) => (
                        <td key={h} className={`px-6 py-3 whitespace-nowrap border-b 
                            ${theme === 'dark' ? 'border-gray-700' : 'border-gray-50'}`}>
                            {renderCellContent(h, candidate[h])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-3 border-t flex justify-end
                ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button onClick={() => setShowModal(false)} 
                className={`px-5 py-2 border rounded-lg text-sm font-medium shadow-sm
                ${theme === 'dark' 
                    ? 'bg-gray-600 border-gray-500 text-white hover:bg-gray-500' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;