import React, { useState, useEffect, useContext, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import logo from "../assets/anasol-logo.png";
import { Context } from "../HrmsContext";
import { authApi, publicinfoApi } from "../../../../axiosInstance";

const MAX_ATTEMPTS_PHASE1 = 5;
const MAX_ATTEMPTS_PHASE2 = 7;
const LOCKOUT_DURATION_PHASE1 = 60;
const LOCKOUT_DURATION_PHASE2 = 300;
const anasolLogoUrl = "https://placehold.co/120x40/000000/FFFFFF?text=ANASOL";

// Helper function to decode JWT payload
const decodeJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Failed to decode JWT:", error);
        return null;
    }
};

const LoginPage = ({ onLogin }) => {
    const navigate = useNavigate();

    const { theme, setTheme, setUserData, setAccessToken } = useContext(Context);

    const [selectedRole, setSelectedRole] = useState("Admin");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [otpScreen, setOtpScreen] = useState(false);
    const [otpMethod, setOtpMethod] = useState(null);
    const [mobileOtp, setMobileOtp] = useState(["", "", "", ""]);
    const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(59);
    const [resendEnabled, setResendEnabled] = useState(false);

    const [forgotPasswordScreen, setForgotPasswordScreen] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotMobile, setForgotMobile] = useState("");
    const [forgotUsername, setForgotUsername] = useState("");
    const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
    const [forgotMobileOtp, setForgotMobileOtp] = useState(["", "", "", ""]);
    const [forgotPasswordMethod, setForgotPasswordMethod] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    let employeeIdFromToken = null;

    // NEW STATE: To store the temporary token received after OTP verification (Step 2)
    const [updateAccessToken, setUpdateAccessToken] = useState(null); 

    // NEW STATE: To store the token received after OTP request (Step 1)
    const [otpToken, setOtpToken] = useState(null);
    
    // NEW STATE: To display success messages in green (as requested)
    const [successMessage, setSuccessMessage] = useState("");

    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState(0);

    const forgotOtpRefs = [
        useRef(null), useRef(null), useRef(null),
        useRef(null), useRef(null), useRef(null),
    ];
    const forgotMobileOtpRefs = [
        useRef(null), useRef(null), useRef(null), useRef(null),
    ];
    const mobileRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const emailRefs = [
        useRef(null), useRef(null), useRef(null),
        useRef(null), useRef(null), useRef(null),
    ];

    useEffect(() => {
        const mountTimer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(mountTimer);
    }, []);

    useEffect(() => {
        if (!otpScreen && !(forgotPasswordScreen && forgotPasswordStep === 2))
            return;
        if (timer === 0) {
            setResendEnabled(true);
            return;
        }
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer, otpScreen, otpMethod, forgotPasswordScreen, forgotPasswordStep]);

    useEffect(() => {
        let timerId;
        if (isLockedOut && lockoutTimer > 0) {
            timerId = setInterval(() => {
                setLockoutTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (lockoutTimer === 0 && isLockedOut) {
            setIsLockedOut(false);
            setError("You can now try logging in again.");
        }
        return () => clearInterval(timerId);
    }, [isLockedOut, lockoutTimer]);

    const handleThemeToggle = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!isLockedOut) {
            setError("");
            setSuccessMessage(""); // Clear success message on new login attempt
        }
        setIsLoading(true);

        if (!name.trim() || !password.trim()) {
            setError("Please enter both username and password.");
            setIsLoading(false);
            return;
        }

        if (isLockedOut) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("https://hrms.anasolconsultancyservices.com/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: name, password: password }),
                credentials: "include",
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("accessToken", data.accessToken);
                setAccessToken(data.accessToken);

                const decodedPayload = decodeJwt(data.accessToken);
                if (decodedPayload) {
                    localStorage.setItem("emppayload", JSON.stringify(decodedPayload));
                    localStorage.setItem("logedempid", decodedPayload.employeeId);
                    localStorage.setItem("logedemprole", decodedPayload.roles[0]);

                    setUserData(decodedPayload);

                    employeeIdFromToken = decodedPayload.employeeId;

                    try {
                        const profileResponse = await publicinfoApi.get(`/employee/${employeeIdFromToken}`, {
                            headers: { 'Authorization': `Bearer ${data.accessToken}` }
                        });
                        if (profileResponse.data.employeeImage) {
                            localStorage.setItem("loggedInUserImage", profileResponse.data.employeeImage);
                        }
                    } catch (profileError) {
                        console.error("Failed to fetch profile info on login:", profileError);
                    }
                }

                setWrongAttempts(0);
                onLogin(data);
                if (employeeIdFromToken) {
                    navigate(`/dashboard/${employeeIdFromToken}`);
                } else {
                    navigate("/dashboard");
                }
            } else {
                const newAttempts = wrongAttempts + 1;
                setWrongAttempts(newAttempts);

                if (newAttempts > MAX_ATTEMPTS_PHASE2) {
                    setIsLockedOut(true);
                    setLockoutTimer(LOCKOUT_DURATION_PHASE2);
                    setError(`Too many failed attempts. Please try again in 5 minutes.`);
                } else if (newAttempts >= MAX_ATTEMPTS_PHASE1) {
                    setIsLockedOut(true);
                    setLockoutTimer(LOCKOUT_DURATION_PHASE1);
                    setError(`Too many failed attempts. Please try again in 60 seconds.`);
                } else {
                    const attemptsLeft = MAX_ATTEMPTS_PHASE1 - newAttempts;
                    setError(`Invalid credentials. You have ${attemptsLeft} attempts left.`);
                }
            }
        } catch (error) {
            console.error("Login API call failed:", error);
            setError("Could not connect to the server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpMethodSelect = (method) => {
        setOtpMethod(method);
        resetTimer();
        setError("");
        setSuccessMessage("");
        setMobileOtp(["", "", "", ""]);
        setEmailOtp(["", "", "", "", "", ""]);
    };

    const handleOtpChange = (otpArray, setOtpArray, index, value, refs, event) => {
        const regex = /^[0-9]$/;
        if (event.key === "Backspace") {
            const newOtp = [...otpArray];
            if (newOtp[index] === "" && index > 0) {
                refs[index - 1].current.focus();
                newOtp[index - 1] = "";
            } else {
                newOtp[index] = "";
            }
            setOtpArray(newOtp);
        } else {
            if (!regex.test(value)) return;
            const newOtp = [...otpArray];
            newOtp[index] = value;
            setOtpArray(newOtp);
            if (value && refs[index + 1]) {
                refs[index + 1].current.focus();
            }
        }
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        if (otpMethod === "mobile") {
            if (mobileOtp.join("").length === 4) {
                onLogin();
            } else {
                setError("Invalid Mobile OTP.");
            }
        } else if (otpMethod === "email") {
            if (emailOtp.join("").length === 6) {
                onLogin();
            } else {
                setError("Invalid Email OTP.");
            }
        }
    };

    const resetTimer = () => {
        setTimer(59);
        setResendEnabled(false);
    };

    const handleBack = () => {
        if (forgotPasswordScreen) {
            if (forgotPasswordStep > 1) {
                if (forgotPasswordStep === 2) {
                    setForgotPasswordStep(1);
                    setForgotPasswordMethod(null);
                    setOtpToken(null); 
                    setUpdateAccessToken(null); 
                    setError("");
                    setSuccessMessage("");
                } else {
                    setForgotPasswordStep((prev) => prev - 1);
                    setError("");
                    setSuccessMessage("");
                    if (forgotPasswordStep === 3) {
                        setNewPassword("");
                        setConfirmPassword("");
                        setForgotUsername("");
                    }
                }
            } else {
                setForgotPasswordScreen(false);
                setForgotEmail("");
                setForgotMobile("");
                setForgotUsername("");
                setForgotPasswordStep(1);
                setForgotPasswordMethod(null);
                setOtpToken(null); 
                setUpdateAccessToken(null); 
                setError("");
                setSuccessMessage("");
            }
        } else if (otpScreen) {
            if (otpMethod) {
                setOtpMethod(null);
                setError("");
                setSuccessMessage("");
            } else {
                setOtpScreen(false);
                setError("");
                setSuccessMessage("");
            }
        }
    };

    // UPDATED: handleResend to clear token and re-request OTP
    const handleResend = () => {
        resetTimer();
        setOtpToken(null); // Clear previous token on resend
        setUpdateAccessToken(null); // Clear previous update token
        
        if (forgotPasswordScreen && forgotPasswordStep === 2) {
            console.log(`Resending Forgot Password OTP via ${forgotPasswordMethod}`);
            // Re-trigger the request function with a mock event
            handleRequestOtp({ preventDefault: () => {} });
        } else if (otpScreen && otpMethod) {
            console.log(`Resending Login OTP via ${otpMethod}`);
        }
    };

    const handleForgotPasswordClick = () => {
        setForgotPasswordScreen(true);
        setOtpScreen(false);
        setForgotEmail("");
        setForgotMobile("");
        setForgotUsername("");
        setForgotPasswordStep(1);
        setForgotPasswordMethod(null);
        setOtpToken(null);
        setUpdateAccessToken(null); // Clear update token
        setForgotOtp(["", "", "", "", "", ""]);
        setForgotMobileOtp(["", "", "", ""]);
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setSuccessMessage("");
    };

    const handleForgotMethodSelect = (method) => {
        setForgotPasswordMethod(method);
        setError("");
        setSuccessMessage("");
        setTimer(59);
        setResendEnabled(false);
    };

    // FIX APPLIED: Using PUT method, Axios 'params' object, and correct '/auth/SendOTP' path.
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        let contactInfo = "";
        let params = {}; // Use params object for Axios

        if (forgotPasswordMethod === 'email') {
            if (!forgotEmail.trim()) {
                setError("Please enter your email.");
                return;
            }
            contactInfo = forgotEmail.trim();
            // CORRECT: Using 'mail' as the key for email parameter. Axios handles URL encoding of '@' to %40.
            params = { mail: contactInfo }; 
        } else if (forgotPasswordMethod === 'mobile') {
            if (!forgotMobile.trim()) {
                setError("Please enter your mobile number.");
                return;
            }
            contactInfo = forgotMobile.trim();
            // CORRECT: Using 'phone' as the key for mobile parameter
            params = { phone: contactInfo };
        } else {
            setError("Please select a method.");
            return;
        }

        setIsLoading(true);

        try {
            // CORRECTED: Using PUT method as requested, passing params as the third (config) argument.
            const response = await authApi.put(`/SendOTP`, null, { params });

            // Assuming successful response is status 200 (handled by axios for 2xx)
            const tokenValue = response.data?.token || response.data; 

            if (tokenValue) {
                setOtpToken(tokenValue);
                setForgotPasswordStep(2);
                resetTimer();
                setError("");
                setForgotOtp(["", "", "", "", "", ""]);
                setForgotMobileOtp(["", "", "", ""]);
                console.log(`OTP requested for ${forgotPasswordMethod}: ${contactInfo}. Token stored.`);
            } else {
                setError("OTP request successful, but no security token received. Please try again.");
            }
        } catch (error) {
            console.error("OTP Request failed:", error.response?.data || error.message);
            setError(error.response?.data?.message || `Failed to request OTP via ${forgotPasswordMethod}. Please check your details.`);
        } finally {
            setIsLoading(false);
        }
    };

    // FIX APPLIED: Storing response.data.accessToken in updateAccessToken state.
    const handleVerifyForgotOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!otpToken) {
            setError("OTP request session expired or failed. Please request OTP again.");
            return;
        }
        
        const otpArray = forgotPasswordMethod === 'email' ? forgotOtp : forgotMobileOtp;
        const otpValue = otpArray.join("");
        const expectedLength = forgotPasswordMethod === 'email' ? 6 : 4;

        if (otpValue.length !== expectedLength) {
            setError(`Please enter the complete ${expectedLength}-digit OTP.`);
            return;
        }

        setIsLoading(true);
        // Corrected path to /auth/Verifyotp
        const verificationEndpoint = `/VerifyOTP`; 

        try {
            // Using PUT method as requested, sending params as config object with headers.
            const response = await authApi.put(verificationEndpoint, null, {
                params: { otp: otpValue }, // Use params object for query param
                headers: {
                    'X_OTP_Token': otpToken // Sending stored token in custom header
                }
            });

            if (response.status === 200) {
                const newAccessToken = response.data?.accessToken;
                
                if (newAccessToken) {
                    setUpdateAccessToken(newAccessToken); // Store the temporary access token
                    setForgotPasswordStep(3); // Move to password reset step
                    setError("");
                    console.log("Forgot Password OTP Verified successfully. Access Token received for update.");
                } else {
                    // This scenario should ideally not happen if OTP is verified, but handling it.
                    setError("OTP verified, but failed to receive a temporary access token for password reset.");
                }
                
            } else {
                setError(response.data?.message || "OTP verification failed. Please check the OTP.");
            }
        } catch (error) {
            console.error("OTP Verification failed:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Error verifying OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // FIX APPLIED: Using updateAccessToken in the Authorization header and setting green success message.
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage(""); // Clear old success message

        // Note: Password validation should be handled strictly by the backend.
        // Client-side minimum length check remains.
        if (!forgotUsername.trim() || !newPassword || !confirmPassword) {
            setError("Please enter username, new password, and confirm new password.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 8) { // Assuming minimum 8 characters as per general security practices
            setError("New password must be at least 8 characters long.");
            return;
        }

        if (!updateAccessToken) { // Ensure the token is present from Step 2
            setError("Security session expired. Please restart the password reset process.");
            return;
        }

        setIsLoading(true);

        const userId = forgotUsername.trim();
        // 🔑 Payload structure for password update
        const payload = {
            username: userId,
            password: newPassword,
        };

        try {
            // FIX APPLIED: Pass explicit Authorization header using updateAccessToken
            const response = await authApi.put(`update/${userId}`, payload, {
                headers: {
                    // Use the temporary token received after OTP verification
                    'Authorization': `Bearer ${updateAccessToken}`,
                    'Content-Type': 'application/json' 
                }
            });

            if (response.status >= 200 && response.status < 300) {
                console.log(`Password updated successfully! API endpoint hit: update/${userId}`);
                console.log("Payload sent:", payload);

                // Reset flow on successful update
                setForgotPasswordScreen(false);
                setForgotEmail("");
                setForgotMobile("");
                setForgotPasswordStep(1);
                setForgotPasswordMethod(null);
                setOtpToken(null);
                setUpdateAccessToken(null); // Clear token after use
                setForgotOtp(["", "", "", "", "", ""]);
                setForgotMobileOtp(["", "", "", ""]);
                setNewPassword("");
                setConfirmPassword("");
                setForgotUsername("");
                // FIX APPLIED: Set success message to trigger green display in JSX
                setSuccessMessage("Password updated successfully! Please login with your new password."); 
                setError(""); // Ensure error is cleared

            } else {
                // Handle non-2xx response from API
                setError(response.data?.message || "Failed to update password. Please try again.");
            }
        } catch (error) {
            console.error("Password update failed:", error);
            setError(error.response?.data?.message || "Error updating password. Please check your details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex items-center justify-center min-h-screen p-4 relative overflow-hidden transition-all duration-500 ${
            theme === 'dark'
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
                : 'bg-gradient-to-br from-gray-100 via-blue-50 to-purple-100'
        }`}>

            <div className="fixed top-6 right-6 z-50">
                <DarkModeToggle
                    isDark={theme === 'dark'}
                    onToggle={handleThemeToggle}
                />
            </div>

            <div className="absolute inset-0 overflow-hidden z-0">
                <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob ${
                    theme === 'dark' ? 'bg-purple-800/60' : 'bg-purple-200/60'
                }`}></div>
                <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000 ${
                    theme === 'dark' ? 'bg-blue-800/60' : 'bg-blue-200/60'
                }`}></div>
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 ${
                    theme === 'dark' ? 'bg-pink-800/50' : 'bg-pink-200/50'
                }`}></div>
            </div>

            <div className={`relative z-10 flex w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl backdrop-blur-lg ring-1 transition-all duration-700 ease-out
            ${isMounted ? "scale-100 opacity-100" : "scale-95 opacity-0"}
            max-h-[90vh] min-h-[600px] ${
                theme === 'dark'
                    ? 'bg-gray-800/90 ring-gray-700'
                    : 'bg-white/80 ring-black/10'
            }`}>

                <div className={`hidden md:flex flex-col justify-between w-1/2 text-white p-10 lg:p-14 ${
                    theme === 'dark'
                        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900'
                        : 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-800'
                }`}>
                    <div className="space-y-8 mt-8">
                        <img
                            src={logo}
                            alt="Anasol Logo"
                            className="w-39 h-auto opacity-90 animate-fade-in ml-[30%]"
                        />
                        <div className="space-y-4">
                            <h2 className="text-5xl font-light italic leading-snug animate-fade-in text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400">
                                Hello,
                            </h2>
                            <h1 className="text-4xl lg:text-5xl font-bold animate-fade-in animation-delay-200">
                                Welcome
                            </h1>
                            <p className="text-lg lg:text-xl opacity-80 animate-fade-in animation-delay-400 text-indigo-100">
                                Login to continue
                            </p>
                        </div>
                    </div>
                    <div className="text-sm opacity-80 space-y-1 animate-fade-in animation-delay-600">
                        <p className="font-semibold text-base">
                            ANASOL CONSULTANCY SERVICES
                        </p>
                        <p className="text-xs opacity-70 text-indigo-200">
                            © {new Date().getFullYear()} All Rights Reserved.
                        </p>
                    </div>
                </div>

                <div className={`w-full md:w-1/2 p-10 md:p-14 backdrop-blur-md h-full overflow-y-auto flex flex-col justify-center items-center ${
                    theme === 'dark' ? 'bg-gray-800/95' : 'bg-white/95'
                }`}>
                    <div style={{ marginTop: "80px" }} className="max-w-md mx-auto w-full">
                        <div className="md:hidden flex justify-center mb-6">
                            <img src={logo} alt="Anasol Logo" className="w-32 h-auto ml-[30%]" />
                        </div>
                        <h2 className={`text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r mb-6 ${
                            theme === 'dark'
                                ? 'from-blue-400 to-purple-400'
                                : 'from-purple-600 to-blue-600'
                        }`}>
                            {forgotPasswordScreen
                                ? forgotPasswordStep === 1
                                    ? "Forgot Password"
                                    : forgotPasswordStep === 2
                                        ? "Verify OTP"
                                        : "Reset Password"
                                : otpScreen
                                    ? otpMethod
                                        ? otpMethod === "mobile"
                                            ? "Mobile Verification"
                                            : "Email Verification"
                                        : "Choose OTP Method"
                                    : "Login"}
                        </h2>

                        <div className="w-full">
                            {/* Display Success Message (Green) on Login Screen */}
                            {successMessage && !forgotPasswordScreen && !otpScreen && (
                                <p className="text-green-600 font-semibold text-center mb-4">{successMessage}</p>
                            )}

                            {!forgotPasswordScreen && !otpScreen && (
                                <form onSubmit={handleLoginSubmit} className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Email or Username"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isLockedOut}
                                        className={`w-full border-b-2 py-3 px-2 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition ${
                                            theme === 'dark'
                                                ? 'border-gray-600 text-white bg-transparent'
                                                : 'border-gray-300 text-gray-800 bg-transparent'
                                        }`}
                                    />
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLockedOut}
                                            className={`w-full border-b-2 py-3 px-2 pr-10 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition ${
                                                theme === 'dark'
                                                    ? 'border-gray-600 text-white bg-transparent'
                                                    : 'border-gray-300 text-gray-800 bg-transparent'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isLockedOut}
                                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 hover:text-gray-600 cursor-pointer ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                            }`}
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {isLockedOut ? (
                                        <p className="text-red-500 text-center">
                                            Too many failed attempts. Please try again in {lockoutTimer} seconds.
                                        </p>
                                    ) : (
                                        error && <p className="text-red-500 text-center">{error}</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isLoading || isLockedOut}
                                        className={`w-full py-3 text-white rounded-full transition-all cursor-pointer ${
                                            isLoading || isLockedOut
                                                ? "bg-gray-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg"
                                        }`}
                                    >
                                        {isLoading ? "Loading..." : "Login"}
                                    </button>
                                </form>
                            )}

                            {otpScreen && !otpMethod && (
                                <div className="space-y-4">
                                    <button
                                        onClick={() => handleOtpMethodSelect("mobile")}
                                        className="w-full py-3 text-white rounded-full bg-blue-500 hover:bg-blue-600 transition"
                                    >
                                        Verify with Mobile OTP
                                    </button>
                                    <button
                                        onClick={() => handleOtpMethodSelect("email")}
                                        className="w-full py-3 text-white rounded-full bg-purple-500 hover:bg-purple-600 transition"
                                    >
                                        Verify with Email OTP
                                    </button>
                                </div>
                            )}

                            {otpScreen && otpMethod === "mobile" && (
                                <form onSubmit={handleOtpSubmit} className="space-y-4">
                                    <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Enter the 4-digit code sent to your mobile.
                                    </p>
                                    <div className="flex justify-center space-x-2">
                                        {mobileOtp.map((digit, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) =>
                                                    handleOtpChange(
                                                        mobileOtp,
                                                        setMobileOtp,
                                                        index,
                                                        e.target.value,
                                                        mobileRefs,
                                                        e
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    handleOtpChange(
                                                        mobileOtp,
                                                        setMobileOtp,
                                                        index,
                                                        e.target.value,
                                                        mobileRefs,
                                                        e
                                                    )
                                                }
                                                ref={mobileRefs[index]}
                                                className={`w-12 h-12 text-center text-2xl border-2 rounded-lg focus:outline-none focus:border-blue-500 transition ${
                                                    theme === 'dark'
                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                        : 'border-gray-300 bg-white text-gray-800'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    {error && (
                                        <p className="text-red-500 text-center">{error}</p>
                                    )}
                                    <button
                                        type="submit"
                                        className="w-full py-3 text-white rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg transition"
                                    >
                                        Verify Mobile OTP
                                    </button>
                                    <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Time remaining: {timer}s
                                        {resendEnabled ? (
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                className="ml-2 text-blue-500 hover:underline"
                                            >
                                                Resend OTP
                                            </button>
                                        ) : null}
                                    </p>
                                </form>
                            )}

                            {otpScreen && otpMethod === "email" && (
                                <form onSubmit={handleOtpSubmit} className="space-y-4">
                                    <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Enter the 6-digit code sent to your email.
                                    </p>
                                    <div className="flex justify-center space-x-2">
                                        {emailOtp.map((digit, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) =>
                                                    handleOtpChange(
                                                        emailOtp,
                                                        setEmailOtp,
                                                        index,
                                                        e.target.value,
                                                        emailRefs,
                                                        e
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    handleOtpChange(
                                                        emailOtp,
                                                        setEmailOtp,
                                                        index,
                                                        e.target.value,
                                                        emailRefs,
                                                        e
                                                    )
                                                }
                                                ref={emailRefs[index]}
                                                className={`w-10 h-10 text-center text-xl border-2 rounded-lg focus:outline-none focus:border-purple-500 transition ${
                                                    theme === 'dark'
                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                        : 'border-gray-300 bg-white text-gray-800'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    {error && (
                                        <p className="text-red-500 text-center">{error}</p>
                                    )}
                                    <button
                                        type="submit"
                                        className="w-full py-3 text-white rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg transition"
                                    >
                                        Verify Email OTP
                                    </button>
                                    <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Time remaining: {timer}s
                                        {resendEnabled ? (
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                className="ml-2 text-blue-500 hover:underline"
                                            >
                                                Resend OTP
                                            </button>
                                        ) : null}
                                    </p>
                                </form>
                            )}

                            {forgotPasswordScreen && forgotPasswordStep === 1 && !forgotPasswordMethod && (
                                <div className="space-y-4">
                                    <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Choose how you want to reset your password.
                                    </p>
                                    <button
                                        onClick={() => handleForgotMethodSelect("email")}
                                        className="w-full py-3 text-white rounded-full bg-blue-500 hover:bg-blue-600 transition"
                                    >
                                        Verify with Email OTP
                                    </button>
                                    {/* Hiding Mobile OTP button as requested */}
                                    {/*
                                    <button
                                        onClick={() => handleForgotMethodSelect("mobile")}
                                        className="w-full py-3 text-white rounded-full bg-purple-500 hover:bg-purple-600 transition"
                                    >
                                        Verify with Mobile OTP
                                    </button>
                                    */}
                                </div>
                            )}

                            {forgotPasswordScreen && forgotPasswordStep === 1 && forgotPasswordMethod === 'email' && (
                                <form onSubmit={handleRequestOtp} className="space-y-4">
                                    <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Enter your email to receive a password reset OTP.
                                    </p>
                                    <input
                                        type="email"
                                        placeholder="Your Email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        className={`w-full border-b-2 py-3 px-2 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition ${
                                            theme === 'dark'
                                                ? 'border-gray-600 text-white bg-transparent'
                                                : 'border-gray-300 text-gray-800 bg-transparent'
                                        }`}
                                    />
                                    {error && (
                                        <p className="text-red-500 text-center">{error}</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-3 text-white rounded-full transition-all ${
                                            isLoading
                                                ? "bg-gray-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg"
                                        }`}
                                    >
                                        {isLoading ? "Sending OTP..." : "Request OTP"}
                                    </button>
                                </form>
                            )}

                            {forgotPasswordScreen && forgotPasswordStep === 1 && forgotPasswordMethod === 'mobile' && (
                                <form onSubmit={handleRequestOtp} className="space-y-4">
                                    <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Enter your mobile number to receive a password reset OTP.
                                    </p>
                                    <input
                                        type="tel"
                                        placeholder="Your Mobile Number"
                                        value={forgotMobile}
                                        onChange={(e) => setForgotMobile(e.target.value)}
                                        className={`w-full border-b-2 py-3 px-2 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition ${
                                            theme === 'dark'
                                                ? 'border-gray-600 text-white bg-transparent'
                                                : 'border-gray-300 text-gray-800 bg-transparent'
                                        }`}
                                    />
                                    {error && (
                                        <p className="text-red-500 text-center">{error}</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-3 text-white rounded-full transition-all ${
                                            isLoading
                                                ? "bg-gray-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg"
                                        }`}
                                    >
                                        {isLoading ? "Sending OTP..." : "Request OTP"}
                                    </button>
                                </form>
                            )}

                            {forgotPasswordScreen && forgotPasswordStep === 2 && forgotPasswordMethod === 'email' && (
                                <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                                    <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Enter the 6-digit OTP sent to {forgotEmail}.
                                    </p>
                                    <div className="flex justify-center space-x-2">
                                        {forgotOtp.map((digit, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) =>
                                                    handleOtpChange(
                                                        forgotOtp,
                                                        setForgotOtp,
                                                        index,
                                                        e.target.value,
                                                        forgotOtpRefs,
                                                        e
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    handleOtpChange(
                                                        forgotOtp,
                                                        setForgotOtp,
                                                        index,
                                                        e.target.value,
                                                        forgotOtpRefs,
                                                        e
                                                    )
                                                }
                                                ref={forgotOtpRefs[index]}
                                                className={`w-10 h-10 text-center text-xl border-2 rounded-lg focus:outline-none focus:border-purple-500 transition ${
                                                    theme === 'dark'
                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                        : 'border-gray-300 bg-white text-gray-800'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    {error && (
                                        <p className="text-red-500 text-center">{error}</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-3 text-white rounded-full transition-all ${
                                            isLoading
                                                ? "bg-gray-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg"
                                        }`}
                                    >
                                        {isLoading ? "Verifying..." : "Verify OTP"}
                                    </button>
                                    <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Time remaining: {timer}s
                                        {resendEnabled ? (
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                className="ml-2 text-blue-500 hover:underline"
                                            >
                                                Resend OTP
                                            </button>
                                        ) : null}
                                    </p>
                                </form>
                            )}

                            {forgotPasswordScreen && forgotPasswordStep === 2 && forgotPasswordMethod === 'mobile' && (
                                <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                                    <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Enter the 4-digit OTP sent to {forgotMobile}.
                                    </p>
                                    <div className="flex justify-center space-x-2">
                                        {forgotMobileOtp.map((digit, index) => (
                                            <input
                                                key={index}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) =>
                                                    handleOtpChange(
                                                        forgotMobileOtp,
                                                        setForgotMobileOtp,
                                                        index,
                                                        e.target.value,
                                                        forgotMobileOtpRefs,
                                                        e
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    handleOtpChange(
                                                        forgotMobileOtp,
                                                        setForgotMobileOtp,
                                                        index,
                                                        e.target.value,
                                                        forgotMobileOtpRefs,
                                                        e
                                                    )
                                                }
                                                ref={forgotMobileOtpRefs[index]}
                                                className={`w-12 h-12 text-center text-2xl border-2 rounded-lg focus:outline-none focus:border-blue-500 transition ${
                                                    theme === 'dark'
                                                        ? 'border-gray-600 bg-gray-700 text-white'
                                                        : 'border-gray-300 bg-white text-gray-800'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    {error && (
                                        <p className="text-red-500 text-center">{error}</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-3 text-white rounded-full transition-all ${
                                            isLoading
                                                ? "bg-gray-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg"
                                        }`}
                                    >
                                        {isLoading ? "Verifying..." : "Verify OTP"}
                                    </button>
                                    <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Time remaining: {timer}s
                                        {resendEnabled ? (
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                className="ml-2 text-blue-500 hover:underline"
                                            >
                                                Resend OTP
                                            </button>
                                        ) : null}
                                    </p>
                                </form>
                            )}

                            {forgotPasswordScreen && forgotPasswordStep === 3 && (
                                <form onSubmit={handleUpdatePassword} className="space-y-4">
                                    <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Set your new password.
                                    </p>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={forgotUsername}
                                        onChange={(e) => setForgotUsername(e.target.value)}
                                        className={`w-full border-b-2 py-3 px-2 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition ${
                                            theme === 'dark'
                                                ? 'border-gray-600 text-white bg-transparent'
                                                : 'border-gray-300 text-gray-800 bg-transparent'
                                        }`}
                                    />
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={`w-full border-b-2 py-3 px-2 pr-10 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition ${
                                                theme === 'dark'
                                                    ? 'border-gray-600 text-white bg-transparent'
                                                    : 'border-gray-300 text-gray-800 bg-transparent'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className={`absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 hover:text-gray-600 ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                            }`}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff size={20} />
                                            ) : (
                                                <Eye size={20} />
                                            )}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm New Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full border-b-2 py-3 px-2 pr-10 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition ${
                                                theme === 'dark'
                                                    ? 'border-gray-600 text-white bg-transparent'
                                                    : 'border-gray-300 text-gray-800 bg-transparent'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 hover:text-gray-600 ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                            }`}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={20} />
                                            ) : (
                                                <Eye size={20} />
                                            )}
                                        </button>
                                    </div>
                                    {error && (
                                        <p className="text-red-500 text-center">{error}</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-3 text-white rounded-full transition-all ${
                                            isLoading
                                                ? "bg-gray-500 cursor-not-allowed"
                                                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg"
                                        }`}
                                    >
                                        {isLoading ? "Updating Password..." : "Update Password"}
                                    </button>
                                </form>
                            )}

                            {(otpScreen || forgotPasswordScreen) && (
                                <div className="text-center mt-2">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="text-sm text-blue-500 hover:underline cursor-pointer"
                                    >
                                        Back
                                    </button>
                                </div>
                            )}
                            {!otpScreen && !forgotPasswordScreen && (
                                <div className="text-center ">
                                    <button
                                        type="button"
                                        onClick={handleForgotPasswordClick}
                                        className="text-sm text-blue-500 hover:underline cursor-pointer mt-2"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;