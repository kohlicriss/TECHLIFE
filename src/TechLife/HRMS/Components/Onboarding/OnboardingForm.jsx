import React, { useState, useEffect } from 'react';
import './App.css';
import logo from "../assets/anasol-logo.png"

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
  // Modified to accept a custom maxSize (default 1MB for docs, can pass more for video)
  const handleFileChange = (e, setFileState, maxSize = 1048576) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > maxSize) {
            const sizeInMB = maxSize / (1024 * 1024);
            alert(`File size exceeds ${Math.round(sizeInMB)}MB! Please upload a smaller file.`);
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

    // Added introVideo check
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
    
    // Append Video
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

  if (loading) return <div className="container"><p style={{textAlign:'center', color:'#666'}}>Verifying secure link...</p></div>;
  if (isExpired) return <div className="container"><div className="error-card"><h2 className="error-title">Link Expired</h2></div></div>;
  if (!isValid) return <div className="container"><div className="error-card"><h2 className="error-title">Invalid Link</h2></div></div>;

  return (
    <div className="container">
      
      {/* THE MAIN CARD */}
      <div className="card">
        
        {/* BRANDING HEADER: Logo Middle BIG, Name Below */}
        <div className="card-brand-header">
            <img src={logo} alt="Anasol Logo" className="brand-logo" />
            <div className="brand-name">Anasol Consultancy Services Pvt Ltd</div>
        </div>

        {/* CONDITION: If submitted, show success view INSIDE the card */}
        {isSubmitted ? (
            <div className="success-view">
                <div className="success-icon-container">
                    <svg className="checkmark" viewBox="0 0 52 52">
                        <path d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                </div>
                <h2 className="success-title">Submission Successful!</h2>
                <p className="success-desc">
                    Thank you, <b>{fullName}</b>. <br/>
                    We have received your onboarding documents. <br/>
                    Our HR team will verify them and contact you shortly.
                </p>
                <div style={{marginTop: '30px', color: '#9ca3af', fontSize: '12px'}}>
                    You can safely close this window now.
                </div>
            </div>
        ) : (
            <>
            {/* NORMAL FORM VIEW */}
            <div className="page-title-section">
                <h1>Onboarding Portal</h1>
                <p className="sub-text">
                    Complete your profile and upload mandatory certificates to proceed.
                </p>
            </div>

            <div className="form-body">
                <form onSubmit={handleUpload}>
                
                {/* Section 1: Personal Details */}
                <div className="form-section">
                    <h3 className="section-title">Personal Details</h3>
                    <div className="form-grid">
                        
                        <div className="input-group full-width">
                            <label>Full Name <span style={{color: '#ef4444'}}>*</span></label>
                            <input 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="As per Aadhaar"
                            className="text-input"
                            required 
                            />
                        </div>

                        <div className="input-group">
                            <label>Date of Birth <span style={{color: '#ef4444'}}>*</span></label>
                            <input 
                            type="date" 
                            value={dob}
                            onClick={(e) => e.target.showPicker && e.target.showPicker()} 
                            onChange={(e) => setDob(e.target.value)}
                            className="text-input"
                            required 
                            />
                        </div>

                        <div className="input-group">
                            <label>Phone Number <span style={{color: '#ef4444'}}>*</span></label>
                            <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Mobile Number"
                            className="text-input"
                            required 
                            />
                        </div>

                        <div className="input-group full-width">
                            <label>Address <span style={{color: '#ef4444'}}>*</span></label>
                            <textarea 
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Current Residential Address"
                            className="text-input"
                            rows="2"
                            required 
                            />
                        </div>

                    </div>
                </div>

                {/* Section 2: Education Details */}
                <div className="form-section">
                    <h3 className="section-title">Education Details</h3>
                    <div className="form-grid">
                        
                        <div className="input-group full-width">
                            <label>College Name <span style={{color: '#ef4444'}}>*</span></label>
                            <input 
                            type="text" 
                            value={collegeName}
                            onChange={(e) => setCollegeName(e.target.value)}
                            placeholder="University / College"
                            className="text-input"
                            required 
                            />
                        </div>

                        <div className="input-group">
                            <label>Graduation Status <span style={{color: '#ef4444'}}>*</span></label>
                            <select 
                                className="text-input" 
                                value={graduated}
                                onChange={(e) => setGraduated(e.target.value)}
                            >
                                <option value="true">Completed (Graduated)</option>
                                <option value="false">Pursuing (Intern/Student)</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Passing Year <span style={{color: '#ef4444'}}>*</span></label>
                            <input 
                            type="text" 
                            maxLength="4"
                            value={passYear}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, ''); 
                                setPassYear(val);
                            }}
                            placeholder="YYYY"
                            className="text-input"
                            required 
                            />
                        </div>

                    </div>
                </div>

                {/* Section 3: Upload Documents */}
                <div className="form-section">
                    <h3 className="section-title">
                        Upload Documents 
                        <span style={{fontSize:'12px', fontWeight:'normal', color:'#6b7280', marginLeft:'auto'}}>
                            Doc Max: 1MB
                        </span>
                    </h3>
                    
                    <div className="form-grid">
                        
                        <div className="input-group">
                            <label>Resume / CV <span style={{color: '#ef4444'}}>*</span></label>
                            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, setResume)} required />
                        </div>

                        <div className="input-group">
                            <label>Passport Size Photo <span style={{color: '#ef4444'}}>*</span></label>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setPhoto)} required />
                        </div>

                        <div className="input-group">
                            <label>Aadhaar Card <span style={{color: '#ef4444'}}>*</span></label>
                            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setAadhaar)} required />
                        </div>

                        <div className="input-group">
                            <label>PAN Card <span style={{color: '#ef4444'}}>*</span></label>
                            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setPan)} required />
                        </div>

                        <div className="input-group">
                            <label>10th Class Memo <span style={{color: '#ef4444'}}>*</span></label>
                            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setSscMemo)} required />
                        </div>

                        <div className="input-group">
                            <label>Intermediate Memo <span style={{color: '#ef4444'}}>*</span></label>
                            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setInterMemo)} required />
                        </div>

                        <div className="input-group full-width">
                            <label style={{color: graduated === 'false' ? '#d92586' : '#374151'}}>
                                {graduated === 'false' ? 'Latest Semester Marks Memo' : 'Degree Certificate / OD'}
                                <span style={{color: '#ef4444'}}> *</span>
                            </label>
                            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFileChange(e, setDegreeDoc)} required />
                        </div>

                         {/* NEW VIDEO UPLOAD FIELD */}
                         <div className="input-group full-width" style={{marginTop:'15px', borderTop:'1px dashed #e5e7eb', paddingTop:'15px'}}>
                            <label>Self Introduction Video <span style={{color: '#ef4444'}}>*</span></label>
                            <span style={{fontSize:'11px', color:'#6b7280', display:'block', marginBottom:'6px'}}>
                                Please upload a short video introducing yourself (Max: 50MB, Format: MP4/WebM)
                            </span>
                            <input 
                                type="file" 
                                accept="video/mp4,video/webm" 
                                // Passing 50MB limit (52428800 bytes) specifically for video
                                onChange={(e) => handleFileChange(e, setIntroVideo, 52428800)} 
                                required 
                            />
                        </div>

                    </div>
                </div>

                <button type="submit" className="btn-primary">
                    Submit Onboarding Details
                </button>
                </form>
                
                {uploadStatus && !isSubmitted && (
                    <div className="status-msg" style={{
                        background: uploadStatus.includes('Success') ? '#d1fae5' : '#fee2e2',
                        color: uploadStatus.includes('Success') ? '#065f46' : '#991b1b',
                        border: `1px solid ${uploadStatus.includes('Success') ? '#34d399' : '#f87171'}`
                    }}>
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