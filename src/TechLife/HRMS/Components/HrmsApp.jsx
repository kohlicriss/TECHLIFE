import React from 'react';
import HrmsContext from "./HrmsContext";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotificationSystem from './Notifications/NotificationSystem';
import Sidebar from './Home/Sidebar';
import Navbar from './Home/Navbar';
import ChatApp from './Chats/ChatApp';
import Employees from './Employees/Employees';
import Profiles from './Profile/Profiles';
import Job from './Profile/tabs/Job';
import Profile from './Profile/tabs/Profile';
import About from './Profile/tabs/About';
const HrmsApp = () => {
  return (
    <HrmsContext>
      <Router>
        <div className="flex flex-col h-screen bg-gray-50">
          <Navbar />
          <div className="flex flex-1 overflow-hidden pt-16"> 
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path='/notifications' element={<NotificationSystem />} />
                <Route path='/chat' element={<ChatApp />} />
                <Route path='/profile' element={<Profiles />} />
                <Route path='/employees' element={<Employees />} />
                 
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </HrmsContext>
  );
};

export default HrmsApp;











// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { ChevronRight, Eye, EyeOff } from "lucide-react";
// import newLogo from "./assets/Anasol_logo11.png"; // Ensure correct path

// const Login = ({ setRole }) => {
//   const [selectedRole, setSelectedRole] = useState(null);
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);
//   const [otpScreen, setOtpScreen] = useState(false);
//   const [mobileOtp, setMobileOtp] = useState(["", "", "", ""]);
//   const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
//   const [mobileNumber, setMobileNumber] = useState("");
//   const [email, setEmail] = useState("");
//   const [error, setError] = useState("");
//   const [step, setStep] = useState(1);

//   const [timer, setTimer] = useState(59);
//   const [resendEnabled, setResendEnabled] = useState(false);

//   const navigate = useNavigate();

//   const mobileRefs = Array.from({ length: 4 }, () => useRef());
//   const emailRefs = Array.from({ length: 6 }, () => useRef());

//   useEffect(() => {
//     const mountTimer = setTimeout(() => setIsMounted(true), 100);
//     return () => clearTimeout(mountTimer);
//   }, []);

//   useEffect(() => {
//     if (!otpScreen) return;
//     if (timer === 0) {
//       setResendEnabled(true);
//       return;
//     }
//     const interval = setInterval(() => {
//       setTimer((prev) => prev - 1);
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [timer, otpScreen]);

//   const handleRoleSelect = (role) => {
//     setSelectedRole(role);
//     setName(role === "Admin" ? "admin" : "employee");
//     setPassword(role === "Admin" ? "admin" : "employee");
//   };

//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedRole) return;
//     setIsLoading(true);
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     setIsLoading(false);
//     setOtpScreen(true);

//     if (selectedRole === "Admin") {
//       sendOtpToPhone(mobileNumber, "admin");
//     } else if (selectedRole === "Employee") {
//       sendOtpToPhone(mobileNumber, "employee");
//     }

//     resetTimer();
//   };

//   const sendOtpToPhone = (phoneNumber, role) => {
//     console.log(`Sending OTP to ${role} at phone number: ${phoneNumber}`);
//     if (role === "admin") {
//       console.log("Admin OTP sent.");
//     } else if (role === "employee") {
//       console.log("Employee OTP sent.");
//     }
//   };

//   const sendOtpToEmail = (email, role) => {
//     console.log(`Sending OTP to ${role} at email: ${email}`);
//     if (role === "admin") {
//       console.log("Admin Email OTP sent.");
//     } else if (role === "employee") {
//       console.log("Employee Email OTP sent.");
//     }
//   };

//   const handleOtpChange = (otpArray, setOtpArray, index, value, refs, event) => {
//     const regex = step === 1 ? /^[0-9]$/ : /^[A-Za-z0-9]$/;

//     if (event.key === "Backspace") {
//       if (otpArray[index] !== "") {
//         const newOtp = [...otpArray];
//         newOtp[index] = "";
//         setOtpArray(newOtp);
//         if (index > 0) refs[index - 1].current.focus();
//       }
//     } else {
//       if (!regex.test(value)) return;

//       const newOtp = [...otpArray];
//       newOtp[index] = value;
//       setOtpArray(newOtp);

//       if (value && refs[index + 1]) refs[index + 1].current.focus();
//     }
//   };

//   const handleOtpSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (step === 1) {
//       if (selectedRole === "Admin") {
//         if (mobileOtp.join("") === "1111") {
//           setStep(2);
//           sendOtpToEmail(email, "admin");
//           resetTimer();
//         } else {
//           setError("Invalid Mobile OTP for Admin. Please try again.");
//         }
//       } else if (selectedRole === "Employee") {
//         if (mobileOtp.join("") === "2222") {
//           setStep(2);
//           sendOtpToEmail(email, "employee");
//           resetTimer();
//         } else {
//           setError("Invalid Mobile OTP for Employee. Please try again.");
//         }
//       }
//     } else if (step === 2) {
//       if (selectedRole === "Admin") {
//         if (emailOtp.join("") === "ABC123") {
//           setRole(selectedRole);
//           navigate("/dashboard");
//         } else {
//           setError("Invalid Admin Email OTP. Please try again.");
//         }
//       } else if (selectedRole === "Employee") {
//         if (emailOtp.join("") === "XYZ456") {
//           setRole(selectedRole);
//           navigate("/dashboard");
//         } else {
//           setError("Invalid Employee Email OTP. Please try again.");
//         }
//       }
//     }
//   };

//   const handleResend = () => {
//     if (!resendEnabled) return;
//     if (step === 1) sendOtpToPhone(mobileNumber, selectedRole.toLowerCase());
//     else if (step === 2) sendOtpToEmail(email, selectedRole.toLowerCase());
//     resetTimer();
//   };

//   const resetTimer = () => {
//     setTimer(30);
//     setResendEnabled(false);
//   };

//   const handleBack = () => {
//     if (step === 1) {
//       setOtpScreen(false); // Go back to the login screen
//     } else if (step === 2) {
//       setStep(1); // Go back to mobile OTP step
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-purple-100 p-4 relative overflow-hidden">
//       <div className="absolute inset-0 overflow-hidden z-0">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/60 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/60 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200/50 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
//       </div>

//       <div className={`relative z-10 flex w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl bg-white/80 backdrop-blur-lg ring-1 ring-black/10 transition-all duration-700 ease-out ${isMounted ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
//         <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-800 text-white p-10 lg:p-14">
//           <div className="space-y-8 mt-8">
//             <img src={newLogo} alt="Anasol Logo" className="w-14 h-auto opacity-90 animate-fade-in" />
//             <div className="space-y-4">
//               <h2 className="text-5xl font-light italic leading-snug animate-fade-in text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400">Hello,</h2>
//               <h1 className="text-4xl lg:text-5xl font-bold animate-fade-in animation-delay-200">Welcome!</h1>
//               <p className="text-lg lg:text-xl opacity-80 animate-fade-in animation-delay-400 text-indigo-100">Sign in to continue access</p>
//             </div>
//           </div>
//           <div className="text-sm opacity-80 space-y-1 animate-fade-in animation-delay-600">
//             <p className="font-semibold text-base">ANASOL CONSULTANCY SERVICES</p>
//             <p className="text-xs opacity-70 text-indigo-200">© {new Date().getFullYear()} All Rights Reserved.</p>
//           </div>
//         </div>

//         <div className="w-full md:w-1/2 p-10 md:p-14 bg-white/95 backdrop-blur-md">
//           <div className="max-w-md mx-auto space-y-8">
//             <h2 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
//               {otpScreen ? (step === 1 ? "Mobile Number Verification" : "Email Verification") : "Login "}
//             </h2>

//             {!otpScreen && (
//               <div className="flex gap-2 justify-center">
//                 {["Admin", "Employee"].map((role) => (
//                   <button
//                     key={role}
//                     onClick={() => handleRoleSelect(role)}
//                     className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${selectedRole === role ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
//                   >
//                     {role}
//                   </button>
//                 ))}
//               </div>
//             )}

//             <form onSubmit={otpScreen ? handleOtpSubmit : handleLoginSubmit} className="space-y-6">
//               {!otpScreen ? (
//                 <>
//                   <input
//                     type="text"
//                     placeholder="Email or Username"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     className="w-full border-b-2 border-gray-300 py-3 px-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
//                   />
//                   <div className="relative">
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       placeholder="Password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="w-full border-b-2 border-gray-300 py-3 px-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                     </button>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <p className="text-gray-600 text-center mb-4">
//                     {step === 1
//                       ? "Enter the 4-digit code sent to your mobile number."
//                       : "Enter the 6-digit code sent to your email address."}
//                   </p>

//                   {/* Mobile OTP (4 boxes) */}
//                   {step === 1 && (
//                     <div className="grid grid-cols-4 gap-2 justify-center">
//                       {mobileOtp.map((digit, idx) => (
//                         <input
//                           key={idx}
//                           type="text"
//                           maxLength="1"
//                           value={digit}
//                           ref={mobileRefs[idx]}
//                           onChange={(e) =>
//                             handleOtpChange(
//                               mobileOtp,
//                               setMobileOtp,
//                               idx,
//                               e.target.value,
//                               mobileRefs,
//                               e
//                             )
//                           }
//                           onKeyDown={(e) => {
//                             if (e.key === "Backspace") {
//                               handleOtpChange(
//                                 mobileOtp,
//                                 setMobileOtp,
//                                 idx,
//                                 "",
//                                 mobileRefs,
//                                 e
//                               );
//                             }
//                           }}
//                           className="w-14 h-14 border-2 text-2xl text-center rounded-lg border-gray-300 focus:outline-none focus:border-purple-500"
//                         />
//                       ))}
//                     </div>
//                   )}

//                   {/* Email OTP (6 boxes) */}
//                   {step === 2 && (
//                     <div className="grid grid-cols-6 gap-2 justify-center">
//                       {emailOtp.map((digit, idx) => (
//                         <input
//                           key={idx}
//                           type="text"
//                           maxLength="1"
//                           value={digit}
//                           ref={emailRefs[idx]}
//                           onChange={(e) =>
//                             handleOtpChange(
//                               emailOtp,
//                               setEmailOtp,
//                               idx,
//                               e.target.value,
//                               emailRefs,
//                               e
//                             )
//                           }
//                           onKeyDown={(e) => {
//                             if (e.key === "Backspace") {
//                               handleOtpChange(
//                                 emailOtp,
//                                 setEmailOtp,
//                                 idx,
//                                 "",
//                                 emailRefs,
//                                 e
//                               );
//                             }
//                           }}
//                           className="w-14 h-14 border-2 text-2xl text-center rounded-lg border-gray-300 focus:outline-none focus:border-purple-500"
//                         />
//                       ))}
//                     </div>
//                   )}

//                   <div className="text-center mt-4">
//                     <button
//                       type="button"
//                       onClick={handleResend}
//                       disabled={!resendEnabled}
//                       className="text-sm text-blue-500 hover:underline"
//                     >
//                       {resendEnabled ? "Resend OTP" : `Resend in 00:${timer < 10 ? `0${timer}` : timer}`}
//                     </button>
//                   </div>
//                 </>
//               )}

//               {error && <p className="text-red-500 text-center">{error}</p>}

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className={`w-full py-3 text-white rounded-full ${isLoading ? "bg-gray-500" : "bg-gradient-to-r from-purple-600 to-blue-600"}`}
//               >
//                 {isLoading ? "Loading..." : otpScreen ? "Verify OTP" : "Login"}
//               </button>
//             </form>

//             {/* Add the Back Button */}
//             {otpScreen && (
//               <div className="text-center mt-4">
//                 <button
//                   type="button"
//                   onClick={handleBack}
//                   className="text-sm text-blue-500 hover:underline"
//                 >
//                   Back
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;