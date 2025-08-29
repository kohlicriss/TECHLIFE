import React, { useState, useEffect, useRef,useContext } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Context } from "../HrmsContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/anasol-logo.png"

// Note: For authenticated API calls, it's recommended to use the Axios instance
// we previously discussed instead of the native fetch API.

const MAX_ATTEMPTS_PHASE1 = 5;
const MAX_ATTEMPTS_PHASE2 = 7; // 5 + 2 additional attempts
const LOCKOUT_DURATION_PHASE1 = 60; // 1 minute
const LOCKOUT_DURATION_PHASE2 = 300; // 5 minutes

// Helper function to decode JWT payload without an external library
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

// The Context import is removed as it's not provided in the prompt.
// We'll simulate the context functionality for this self-contained example.
// const useDummyContext = () => {
//   const [userData, setUserData] = useState(null);
//   const [accessToken, setAccessToken] = useState(null);
//   return { userData, setUserData, setAccessToken };
// };

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();

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
  const [forgotMobile, setForgotMobile] = useState(""); // New state for mobile
  const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]);
  const [forgotMobileOtp, setForgotMobileOtp] = useState(["", "", "", ""]); // New state for mobile OTP
  const [forgotPasswordMethod, setForgotPasswordMethod] = useState(null); // New state for selection
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  let employeeIdFromToken = null;

  // New state variables for the lockout feature
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // const { setUserData, setAccessToken } = useDummyContext();
  const { setUserData, setAccessToken } = useContext(Context);

  const forgotOtpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const forgotMobileOtpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const mobileRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const emailRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!isLockedOut) {
      setError("");
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
      const response = await fetch("http://hrms.anasolconsultancyservices.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, password: password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login Successful! Access Token Received:", data);
        localStorage.setItem("accessToken", data.accessToken);
        console.log("Access token has been saved to Local Storage.");
        setAccessToken(data.accessToken);

        try {
          const decodedPayload = decodeJwt(data.accessToken);
           localStorage.setItem("emppayload", JSON.stringify(decodedPayload));
          setUserData(decodedPayload);
          employeeIdFromToken = decodedPayload.employeeId;
          console.log("Decoded Access Token Payload:", decodedPayload);
          localStorage.setItem("logedempid", decodedPayload.employeeId);
          localStorage.setItem("logedemprole", decodedPayload.roles[0]);
          localStorage.setItem("emppayload", JSON.stringify(decodedPayload));
        } catch (decodeError) {
          console.error("Failed to decode access token:", decodeError);
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
    setMobileOtp(["", "", "", ""]);
    setEmailOtp(["", "", "", "", "", ""]);
  };

  const handleOtpChange = (
    otpArray,
    setOtpArray,
    index,
    value,
    refs,
    event
  ) => {
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
        if (forgotPasswordStep === 2 && forgotPasswordMethod) {
          // Go back to the method selection screen
          setForgotPasswordStep(1);
          setForgotPasswordMethod(null);
          setError("");
        } else {
          setForgotPasswordStep((prev) => prev - 1);
          setError("");
          if (forgotPasswordStep === 2) {
            setForgotOtp(["", "", "", "", "", ""]);
            setForgotMobileOtp(["", "", "", ""]);
          }
          if (forgotPasswordStep === 3) {
            setNewPassword("");
            setConfirmPassword("");
          }
        }
      } else {
        setForgotPasswordScreen(false);
        setForgotEmail("");
        setForgotMobile("");
        setForgotPasswordStep(1);
        setForgotPasswordMethod(null);
        setError("");
      }
    } else if (otpScreen) {
      if (otpMethod) {
        setOtpMethod(null);
        setError("");
      } else {
        setOtpScreen(false);
        setError("");
      }
    }
  };

  const handleResend = () => {
    resetTimer();
    if (forgotPasswordScreen && forgotPasswordStep === 2) {
      console.log(`Resending Forgot Password OTP via ${forgotPasswordMethod}`);
    } else if (otpScreen && otpMethod) {
      console.log(`Resending Login OTP via ${otpMethod}`);
    }
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordScreen(true);
    setOtpScreen(false);
    setForgotEmail("");
    setForgotMobile("");
    setForgotPasswordStep(1);
    setForgotPasswordMethod(null);
    setForgotOtp(["", "", "", "", "", ""]);
    setForgotMobileOtp(["", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  // New handler for selecting forgot password method
  const handleForgotMethodSelect = (method) => {
    setForgotPasswordMethod(method);
    setError("");
    setTimer(59);
    setResendEnabled(false);
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setError("");
    let contactInfo = "";

    if (forgotPasswordMethod === 'email') {
      if (!forgotEmail.trim()) {
        setError("Please enter your email.");
        return;
      }
      contactInfo = forgotEmail;
    } else if (forgotPasswordMethod === 'mobile') {
      if (!forgotMobile.trim()) {
        setError("Please enter your mobile number.");
        return;
      }
      contactInfo = forgotMobile;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotPasswordStep(2);
      resetTimer();
      console.log(`OTP requested for ${forgotPasswordMethod}: ${contactInfo}`);
    }, 1500);
  };

  const handleVerifyForgotOtp = (e) => {
    e.preventDefault();
    setError("");
    const otp = forgotPasswordMethod === 'email' ? forgotOtp.join("") : forgotMobileOtp.join("");
    const expectedLength = forgotPasswordMethod === 'email' ? 6 : 4;

    if (otp.length !== expectedLength) {
      setError(`Please enter the ${expectedLength}-digit OTP.`);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotPasswordStep(3);
      setError("");
      console.log("Forgot Password OTP Verified.");
    }, 1500);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setError("");
    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log(
        "Password updated successfully! Please login with your new password."
      );
      setForgotPasswordScreen(false);
      setForgotEmail("");
      setForgotMobile("");
      setForgotPasswordStep(1);
      setForgotPasswordMethod(null);
      setForgotOtp(["", "", "", "", "", ""]);
      setForgotMobileOtp(["", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-purple-100 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/60 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/60 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200/50 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      <div
        className={`relative z-10 flex w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl bg-white/80 backdrop-blur-lg ring-1 ring-black/10 transition-all duration-700 ease-out
          ${isMounted ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          max-h-[90vh] min-h-[600px]`}
      >
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-800 text-white p-10 lg:p-14">
          <div className="space-y-8 mt-8">
            <img
              src={logo}
              alt="Anasol Logo"
              className="w-30 h-auto opacity-90 animate-fade-in"
            />
            <div className="space-y-4">
              <h2 className="text-5xl font-light italic leading-snug animate-fade-in text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400">
                Hello,
              </h2>
              <h1 className="text-4xl lg:text-5xl font-bold animate-fade-in animation-delay-200">
                Welcome!
              </h1>
              <p className="text-lg lg:text-xl opacity-80 animate-fade-in animation-delay-400 text-indigo-100">
                Login to continue access
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
        <div className="w-full md:w-1/2 p-10 md:p-14 bg-white/95 backdrop-blur-md h-full overflow-y-auto flex flex-col justify-center items-center">
          <div
            style={{ marginTop: "80px" }}
            className="max-w-md mx-auto w-full"
          >
            <h2 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
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
              {!forgotPasswordScreen && !otpScreen && (
                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Email or Username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLockedOut}
                    className="w-full border-b-2 border-gray-300 py-3 px-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLockedOut}
                      className="w-full border-b-2 border-gray-300 py-3 px-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLockedOut}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
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
                  <p className="text-center text-gray-600">
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
                        className="w-12 h-12 text-center text-2xl border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
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
                  <p className="text-center text-sm text-gray-500">
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
                  <p className="text-center text-gray-600">
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
                        className="w-10 h-10 text-center text-xl border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
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
                  <p className="text-center text-sm text-gray-500">
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

              {/* New "Forgot Password" method selection screen */}
              {forgotPasswordScreen && forgotPasswordStep === 1 && !forgotPasswordMethod && (
                <div className="space-y-4">
                  <p className="text-center text-gray-600">
                    Choose how you want to reset your password.
                  </p>
                  <button
                    onClick={() => handleForgotMethodSelect("email")}
                    className="w-full py-3 text-white rounded-full bg-blue-500 hover:bg-blue-600 transition"
                  >
                    Verify with Email OTP
                  </button>
                  <button
                    onClick={() => handleForgotMethodSelect("mobile")}
                    className="w-full py-3 text-white rounded-full bg-purple-500 hover:bg-purple-600 transition"
                  >
                    Verify with Mobile OTP
                  </button>
                </div>
              )}

              {forgotPasswordScreen && forgotPasswordStep === 1 && forgotPasswordMethod === 'email' && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <p className="text-center text-gray-600">
                    Enter your email to receive a password reset OTP.
                  </p>
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full border-b-2 border-gray-300 py-3 px-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
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
                  <p className="text-center text-gray-600">
                    Enter your mobile number to receive a password reset OTP.
                  </p>
                  <input
                    type="tel"
                    placeholder="Your Mobile Number"
                    value={forgotMobile}
                    onChange={(e) => setForgotMobile(e.target.value)}
                    className="w-full border-b-2 border-gray-300 py-3 px-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
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
                  <p className="text-center text-gray-600">
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
                        className="w-10 h-10 text-center text-xl border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
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
                  <p className="text-center text-sm text-gray-500">
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
                  <p className="text-center text-gray-600">
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
                        className="w-12 h-12 text-center text-2xl border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
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
                  <p className="text-center text-sm text-gray-500">
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
                  <p className="text-center text-gray-600">
                    Set your new password.
                  </p>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border-b-2 border-gray-300 py-3 px-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      className="w-full border-b-2 border-gray-300 py-3 px-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Back
                  </button>
                </div>
              )}
              {!otpScreen && !forgotPasswordScreen && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleForgotPasswordClick}
                    className="text-sm text-blue-500 hover:underline mt-2"
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
