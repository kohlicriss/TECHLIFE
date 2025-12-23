import React, { useState, useEffect } from 'react';
import logo from "../assets/anasol-logo.png"; // Ensure this path is correct based on your folder structure

// BACKEND API BASE URL
const API_BASE_URL = "https://hrms.anasolconsultancyservices.com";

function App() {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [token, setToken] = useState('');
  
  // SUCCESS STATE
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Personal Details
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // 2. Education Details
  const [collegeName, setCollegeName] = useState('');
  const [passYear, setPassYear] = useState(new Date().getFullYear().toString());
  const [graduated, setGraduated] = useState('true');

  // 3. File Storage
  const [resume, setResume] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [aadhaar, setAadhaar] = useState(null);
  const [pan, setPan] = useState(null);
  const [sscMemo, setSscMemo] = useState(null);
  const [interMemo, setInterMemo] = useState(null);
  const [degreeDoc, setDegreeDoc] = useState(null);
  
  // NEW: Video Storage
  const [introVideo, setIntroVideo] = useState(null);

  // --- HELPER: FILE SIZE VALIDATION ---
  const handleFileChange = (e, setFileState, maxSize = 1048576) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > maxSize) {
            const sizeInMB = maxSize / (1024 * 1024);
            // Alert logic to handle small sizes correctly (like 5MB)
            const displaySize = sizeInMB < 1 ? Math.round(sizeInMB * 100) / 100 : Math.round(sizeInMB);
            alert(`File size exceeds ${displaySize}MB! Please upload a smaller file.`);
            e.target.value = null;
            setFileState(null);
        } else {
            setFileState(file);
        }
    }
  };

  // --- STEP 1: VALIDATE LINK ON LOAD ---
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');

    if (!urlToken) {
      setLoading(false);
      setIsValid(false);
      return;
    }

    setToken(urlToken);

    fetch(`${API_BASE_URL}/api/offer/view?token=${urlToken}`)
      .then(async (response) => {
        if (response.ok) {
           setIsValid(true);
        } else {
           console.error("Validation failed with status:", response.status);
           setIsValid(false);
        }
      })
      .catch((error) => {
         console.error("Error connecting to backend:", error);
         setIsValid(false); 
      })
      .finally(() => {
         setLoading(false);
      });

  }, []);

  // --- STEP 2: HANDLE FORM SUBMIT ---
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if(!fullName || !dob || !phone || !address || !collegeName || !passYear) {
        alert("Please fill in all personal and education details.");
        return;
    }

    if(!resume || !photo || !aadhaar || !pan || !sscMemo || !interMemo || !degreeDoc || !introVideo) {
        alert("Please upload ALL required documents including the Intro Video.");
        return;
    }

    setUploadStatus('Uploading details & documents securely... Please wait.');

    const formData = new FormData();
    formData.append("token", token);

    const onboardingData = {
        fullName: fullName,
        dob: dob,
        phone: phone,
        address: address,
        collegeName: collegeName,
        passingYear: parseInt(passYear),
        graduated: graduated === 'true'
    };

    formData.append("data", new Blob([JSON.stringify(onboardingData)], {
        type: "application/json"
    }));

    formData.append("resume", resume);
    formData.append("photo", photo);
    formData.append("aadhaar", aadhaar);
    formData.append("pan", pan);
    formData.append("sscMemo", sscMemo);
    formData.append("interMemo", interMemo);
    formData.append("degreeDoc", degreeDoc);
    
    formData.append("introVideo", introVideo);

    try {
        const response = await fetch(`${API_BASE_URL}/api/offer/submit-onboarding`, {
            method: 'POST',
            body: formData, 
        });

        if (response.ok) {
            setUploadStatus('Success');
            setIsSubmitted(true);
            window.scrollTo(0,0); 
        } else {
            setUploadStatus('Upload Failed. Please try again or check file sizes.');
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        setUploadStatus('Network Error. Please check your connection.');
    }
  };

  // --- UI RENDER ---

  // Shared container styles
  const containerClass = "min-h-screen bg-gray-50 flex items-center justify-center p-4";
  const errorCardClass = "bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border-l-4 border-red-500";

  if (loading) return (
    <div className={containerClass}>
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Verifying secure link...</p>
        </div>
    </div>
  );

  if (isExpired) return (
    <div className={containerClass}>
        <div className={errorCardClass}>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Link Expired</h2>
            <p className="text-gray-500">This onboarding link is no longer valid.</p>
        </div>
    </div>
  );

  if (!isValid) return (
    <div className={containerClass}>
        <div className={errorCardClass}>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Link</h2>
            <p className="text-gray-500">Please check the URL or contact HR.</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
      
      {/* THE MAIN CARD */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* BRANDING HEADER - Updated Logo Styling */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-8 text-center flex flex-col items-center justify-center">
            {/* Removed background box/blur effects (bg-white/10, backdrop-blur-sm, p-2) */}
            <img src={logo} alt="Anasol Logo" className="h-20 w-auto mb-4" />
            <div className="text-2xl font-bold text-white tracking-wide">Anasol Consultancy Services Pvt Ltd</div>
        </div>

        {/* CONDITION: If submitted, show success view INSIDE the card */}
        {isSubmitted ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Submission Successful!</h2>
                <p className="text-gray-600 text-lg max-w-lg leading-relaxed">
                    Thank you, <b className="text-gray-900">{fullName}</b>. <br/>
                    We have received your onboarding documents. <br/>
                    Our HR team will verify them and contact you shortly.
                </p>
                <div className="mt-8 text-sm text-gray-400">
                    You can safely close this window now.
                </div>
            </div>
        ) : (
            <>
            {/* NORMAL FORM VIEW */}
            <div className="px-8 pt-8 pb-4 text-center border-b border-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Onboarding Portal</h1>
                <p className="text-gray-500">
                    Complete your profile and upload mandatory certificates to proceed.
                </p>
            </div>

            <div className="p-8">
                <form onSubmit={handleUpload} className="space-y-8">
                
                {/* Section 1: Personal Details */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                        Personal Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="flex flex-col space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                            <input 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="As per Aadhaar"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required 
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
                            <input 
                            type="date" 
                            value={dob}
                            onClick={(e) => e.target.showPicker && e.target.showPicker()} 
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required 
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                            <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Mobile Number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required 
                            />
                        </div>

                        <div className="flex flex-col space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
                            <textarea 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Current Residential Address"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            rows="2"
                            required 
                            />
                        </div>

                    </div>
                </div>

                {/* Section 2: Education Details */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                        Education Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="flex flex-col space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">College Name <span className="text-red-500">*</span></label>
                            <input 
                            type="text" 
                            value={collegeName}
                            onChange={(e) => setCollegeName(e.target.value)}
                            placeholder="University / College"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required 
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">Graduation Status <span className="text-red-500">*</span></label>
                            <select 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white" 
                                value={graduated}
                                onChange={(e) => setGraduated(e.target.value)}
                            >
                                <option value="true">Completed (Graduated)</option>
                                <option value="false">Pursuing (Intern/Student)</option>
                            </select>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">Passing Year <span className="text-red-500">*</span></label>
                            <input 
                            type="text" 
                            maxLength="4"
                            value={passYear}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, ''); 
                                setPassYear(val);
                            }}
                            placeholder="YYYY"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required 
                            />
                        </div>

                    </div>
                </div>

                {/* Section 3: Upload Documents */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                            Upload Documents 
                        </h3>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">Doc Max: 1MB</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">Resume / CV <span className="text-red-500">*</span></label>
                            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, setResume)} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">Passport Size Photo <span className="text-red-500">*</span></label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setPhoto)} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">Aadhaar Card <span className="text-red-500">*</span></label>
                            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setAadhaar)} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">PAN Card <span className="text-red-500">*</span></label>
                            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setPan)} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">10th Class Memo <span className="text-red-500">*</span></label>
                            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setSscMemo)} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">Intermediate Memo <span className="text-red-500">*</span></label>
                            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setInterMemo)} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        <div className="flex flex-col space-y-2 md:col-span-2">
                            <label className={`text-sm font-medium ${graduated === 'false' ? 'text-pink-600' : 'text-gray-700'}`}>
                                {graduated === 'false' ? 'Latest Semester Marks Memo' : 'Degree Certificate / OD'}
                                <span className="text-red-500"> *</span>
                            </label>
                            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setDegreeDoc)} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        {/* NEW VIDEO UPLOAD FIELD */}
                        <div className="flex flex-col space-y-2 md:col-span-2 mt-4 pt-4 border-t border-dashed border-gray-300">
                            <label className="text-sm font-medium text-gray-700">Self Introduction Video <span className="text-red-500">*</span></label>
                            <span className="text-xs text-gray-500">
                                Please upload a short video introducing yourself (Max: 5MB)
                            </span>
                            <input 
                                type="file" 
                                accept="video/mp4,video/webm" 
                                // Passed 5MB in bytes: 5 * 1024 * 1024 = 5242880
                                onChange={(e) => handleFileChange(e, setIntroVideo, 5242880)} 
                                required 
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                        </div>

                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    Submit Onboarding Details
                </button>
                </form>
                
                {uploadStatus && !isSubmitted && (
                    <div className={`mt-6 p-4 rounded-lg border text-center font-medium ${
                        uploadStatus.includes('Success') 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : uploadStatus.includes('Please wait') 
                            ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                            : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {uploadStatus}
                    </div>
                )}
            </div>
            </>
        )}
      </div>
    </div>
  );
}

export default App;