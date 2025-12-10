import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  User,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import logo from "../assets/anasol-logo.png";
import { Context } from "../HrmsContext";
import { authApi, publicinfoApi } from "../../../../axiosInstance";

// --- CONSTANTS (UNCHANGED) ---
const MAX_ATTEMPTS_PHASE1 = 5;
const MAX_ATTEMPTS_PHASE2 = 7;
const LOCKOUT_DURATION_PHASE1 = 60;
const LOCKOUT_DURATION_PHASE2 = 300;
const anasolLogoUrl = "https://placehold.co/120x40/000000/FFFFFF?text=ANASOL";

// Helper function to decode JWT payload (UNCHANGED)
const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();

  // --- CONTEXT AND STATE (UNCHANGED LOGIC) ---
  // NOTE: The theme context is used to switch between the two distinct UI styles (Dark Glass / Light Glass)
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

  const [updateAccessToken, setUpdateAccessToken] = useState(null);
  const [otpToken, setOtpToken] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // --- REFS (UNCHANGED) ---
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

  // --- useEffects (UNCHANGED LOGIC) ---
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

  // --- HANDLERS (LOGIC UNCHANGED) ---
  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!isLockedOut) {
      setError("");
      setSuccessMessage("");
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
      const response = await fetch(
        "https://hrms.anasolconsultancyservices.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name, password: password }),
          credentials: "include",
        }
      );

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
            const profileResponse = await publicinfoApi.get(
              `/employee/${employeeIdFromToken}`,
              {
                headers: { Authorization: `Bearer ${data.accessToken}` },
              }
            );
            if (profileResponse.data.employeeImage) {
              localStorage.setItem(
                "loggedInUserImage",
                profileResponse.data.employeeImage
              );
            }
          } catch (profileError) {
            console.error(
              "Failed to fetch profile info on login:",
              profileError
            );
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
          setError(
            `Invalid credentials. You have ${attemptsLeft} attempts left.`
          );
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

  const handleResend = () => {
    resetTimer();
    setOtpToken(null);
    setUpdateAccessToken(null);

    if (forgotPasswordScreen && forgotPasswordStep === 2) {
      console.log(`Resending Forgot Password OTP via ${forgotPasswordMethod}`);
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
    setUpdateAccessToken(null);
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

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    let contactInfo = "";
    let params = {};

    if (forgotPasswordMethod === "email") {
      if (!forgotEmail.trim()) {
        setError("Please enter your email.");
        return;
      }
      contactInfo = forgotEmail.trim();
      params = { mail: contactInfo };
    } else if (forgotPasswordMethod === "mobile") {
      if (!forgotMobile.trim()) {
        setError("Please enter your mobile number.");
        return;
      }
      contactInfo = forgotMobile.trim();
      params = { phone: contactInfo };
    } else {
      setError("Please select a method.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.put(`/SendOTP`, null, { params });

      const tokenValue = response.data?.token || response.data;

      if (tokenValue) {
        setOtpToken(tokenValue);
        setForgotPasswordStep(2);
        resetTimer();
        setError("");
        setForgotOtp(["", "", "", "", "", ""]);
        setForgotMobileOtp(["", "", "", ""]);
        console.log(
          `OTP requested for ${forgotPasswordMethod}: ${contactInfo}. Token stored.`
        );
      } else {
        setError(
          "OTP request successful, but no security token received. Please try again."
        );
      }
    } catch (error) {
      console.error(
        "OTP Request failed:",
        error.response?.data || error.message
      );
      setError(
        error.response?.data?.message ||
          `Failed to request OTP via ${forgotPasswordMethod}. Please check your details.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!otpToken) {
      setError(
        "OTP request session expired or failed. Please request OTP again."
      );
      return;
    }

    const otpArray =
      forgotPasswordMethod === "email" ? forgotOtp : forgotMobileOtp;
    const otpValue = otpArray.join("");
    const expectedLength = forgotPasswordMethod === "email" ? 6 : 4;

    if (otpValue.length !== expectedLength) {
      setError(`Please enter the complete ${expectedLength}-digit OTP.`);
      return;
    }

    setIsLoading(true);
    const verificationEndpoint = `/VerifyOTP`;

    try {
      const response = await authApi.put(verificationEndpoint, null, {
        params: { otp: otpValue },
        headers: {
          X_OTP_Token: otpToken,
        },
      });

      if (response.status === 200) {
        const newAccessToken = response.data?.accessToken;

        if (newAccessToken) {
          setUpdateAccessToken(newAccessToken);
          setForgotPasswordStep(3);
          setError("");
          console.log(
            "Forgot Password OTP Verified successfully. Access Token received for update."
          );
        } else {
          setError(
            "OTP verified, but failed to receive a temporary access token for password reset."
          );
        }
      } else {
        setError(
          response.data?.message ||
            "OTP verification failed. Please check the OTP."
        );
      }
    } catch (error) {
      console.error(
        "OTP Verification failed:",
        error.response?.data || error.message
      );
      setError(
        error.response?.data?.message ||
          "Error verifying OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!forgotUsername.trim() || !newPassword || !confirmPassword) {
      setError(
        "Please enter username, new password, and confirm new password."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (!updateAccessToken) {
      setError(
        "Security session expired. Please restart the password reset process."
      );
      return;
    }

    setIsLoading(true);

    const userId = forgotUsername.trim();
    const payload = {
      username: userId,
      password: newPassword,
    };

    try {
      const response = await authApi.put(`update/${userId}`, payload, {
        headers: {
          Authorization: `Bearer ${updateAccessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status >= 200 && response.status < 300) {
        console.log(
          `Password updated successfully! API endpoint hit: update/${userId}`
        );
        console.log("Payload sent:", payload);

        // Reset flow on successful update
        setForgotPasswordScreen(false);
        setForgotEmail("");
        setForgotMobile("");
        setForgotPasswordStep(1);
        setForgotPasswordMethod(null);
        setOtpToken(null);
        setUpdateAccessToken(null);
        setForgotOtp(["", "", "", "", "", ""]);
        setForgotMobileOtp(["", "", "", ""]);
        setNewPassword("");
        setConfirmPassword("");
        setForgotUsername("");
        setSuccessMessage(
          "Password updated successfully! Please login with your new password."
        );
        setError("");
      } else {
        setError(
          response.data?.message ||
            "Failed to update password. Please try again."
        );
      }
    } catch (error) {
      console.error("Password update failed:", error);
      setError(
        error.response?.data?.message ||
          "Error updating password. Please check your details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- STYLING CONSTANTS for GLASSCORPH UI (Dynamic based on Theme) ---
  const isDark = theme === "dark";

  // Glassmorphism input style (Dynamic colors)
  const commonInputClass = `w-full py-3 px-4 placeholder-gray-300 focus:outline-none focus:ring-1 transition duration-300 ease-in-out rounded-xl backdrop-blur-sm shadow-md ${
    isDark
      ? "bg-white/10 text-white/90 border border-white/20 focus:ring-white/50 placeholder-gray-400"
      : "bg-white/50 text-gray-900 border border-gray-300/50 focus:ring-gray-600/50 placeholder-gray-500"
  }`;

  const otpInputClass = `w-12 h-14 text-center text-xl font-bold rounded-xl focus:outline-none focus:ring-2 transition duration-200 ease-in-out backdrop-blur-sm shadow-md ${
    isDark
      ? "bg-white/10 text-white border border-white/20 focus:ring-white/70"
      : "bg-white/50 text-gray-900 border border-gray-300/50 focus:ring-gray-600/70"
  }`;

  // Gradient button style (Fixed, as per the design image)
  const commonButtonClass = `w-full py-3 text-white rounded-xl font-bold transition duration-300 ease-in-out shadow-lg transform hover:scale-[1.02]`;
  const primaryButtonClass = `bg-gradient-to-r from-indigo-500 to-orange-500 shadow-indigo-500/50`;
  const disabledButtonClass = `bg-gray-500/50 cursor-not-allowed shadow-none`;

  // Text and Icon colors (Dynamic)
  const primaryTextColor = isDark ? "text-white" : "text-gray-900";
  const secondaryTextColor = isDark ? "text-white/70" : "text-gray-700";
  const primaryIconColor = isDark ? "text-white/70" : "text-gray-700";
  const linkTextColor = isDark
    ? "text-indigo-300 hover:text-white"
    : "text-indigo-600 hover:text-indigo-700";

  // Function to get the current screen title
  const getScreenTitle = () => {
    if (forgotPasswordScreen) {
      if (forgotPasswordStep === 1)
        return forgotPasswordMethod
          ? `Request OTP via ${forgotPasswordMethod.toUpperCase()}`
          : "Forgot Password - Select Method";
      if (forgotPasswordStep === 2) return "Verify Security Code (OTP)";
      if (forgotPasswordStep === 3) return "Secure Password Reset";
    }
    if (otpScreen) {
      return otpMethod
        ? `${otpMethod.toUpperCase()} Verification (2FA)`
        : "Two-Factor Authentication";
    }
    return "Welcome Back!";
  };

  // Function to render the step-specific content (LOGIC UNCHANGED)
  const renderContent = () => {
    // --- LOGIN SCREEN ---
    if (!forgotPasswordScreen && !otpScreen) {
      return (
        <form onSubmit={handleLoginSubmit} className="space-y-6 pt-4">
          <h2 className={`text-2xl font-bold text-center ${primaryTextColor}`}>
            {getScreenTitle()}
          </h2>
          {successMessage && (
            <div className="p-3 rounded-xl bg-green-900/40 text-green-300 flex items-center space-x-2 border border-green-500/50 shadow-inner animate-pulse-once">
              <CheckCircle size={18} />
              <p className="font-medium text-sm">{successMessage}</p>
            </div>
          )}

          {/* Username Field */}
          <div className="relative">
            <User
              size={18}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${primaryIconColor}`}
            />
            <input
              type="text"
              placeholder="Employee ID or Email Address"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading || isLockedOut}
              className={`${commonInputClass} pl-12`}
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock
              size={18}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${primaryIconColor}`}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Your Secure Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isLockedOut}
              className={`${commonInputClass} pl-12 pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading || isLockedOut}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                isDark
                  ? "text-white/60 hover:text-white"
                  : "text-gray-500 hover:text-gray-900"
              } transition`}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isLockedOut ? (
            <p className="text-red-300 text-center flex items-center justify-center space-x-1 font-medium bg-red-900/40 p-3 rounded-xl border border-red-500/50 shadow-inner text-sm">
              <AlertTriangle size={18} />
              <span>Account locked. Try again in **{lockoutTimer}s**.</span>
            </p>
          ) : (
            error && (
              <p className="text-red-300 text-center flex items-center justify-center space-x-1 font-medium text-sm">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </p>
            )
          )}

          <button
            type="submit"
            disabled={isLoading || isLockedOut}
            className={`${commonButtonClass} ${
              isLoading || isLockedOut
                ? disabledButtonClass
                : primaryButtonClass
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <RefreshCw size={18} className="animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              "Sign In to Portal"
            )}
          </button>

          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className={`w-full text-sm font-medium hover:underline transition ${linkTextColor} mt-2`}
          >
            Trouble logging in? Reset Password.
          </button>
        </form>
      );
    }

    // --- FORGOT PASSWORD FLOW (Adapted to Glassmorphism) ---
    if (forgotPasswordScreen) {
      const backButton = (
        <button
          type="button"
          onClick={handleBack}
          className={`mb-6 text-sm flex items-center space-x-1 font-semibold ${linkTextColor}`}
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
      );

      // STEP 1: Choose Method / Enter Contact
      if (forgotPasswordStep === 1) {
        if (!forgotPasswordMethod) {
          return (
            <div className="space-y-6 pt-4">
              {backButton}
              <h2
                className={`text-2xl font-bold text-center ${primaryTextColor}`}
              >
                {getScreenTitle()}
              </h2>
              <p className={`text-center ${secondaryTextColor} text-sm`}>
                Select a verified contact method to receive a security code.
              </p>
              <button
                onClick={() => handleForgotMethodSelect("email")}
                className={`${commonButtonClass} bg-blue-500/80 hover:bg-blue-600`}
              >
                <Mail size={18} className="inline mr-2" />
                Use My Registered Email
              </button>
            </div>
          );
        } else if (
          forgotPasswordMethod === "email" ||
          forgotPasswordMethod === "mobile"
        ) {
          return (
            <form onSubmit={handleRequestOtp} className="space-y-6 pt-4">
              {backButton}
              <h2
                className={`text-2xl font-bold text-center ${primaryTextColor}`}
              >
                {getScreenTitle()}
              </h2>
              <p className={`text-center ${secondaryTextColor} text-sm`}>
                Provide your verified{" "}
                {forgotPasswordMethod === "email"
                  ? "email address"
                  : "mobile number"}
                .
              </p>
              <div className="relative">
                {forgotPasswordMethod === "email" ? (
                  <Mail
                    size={18}
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${primaryIconColor}`}
                  />
                ) : (
                  <Phone
                    size={18}
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${primaryIconColor}`}
                  />
                )}
                <input
                  type={forgotPasswordMethod === "email" ? "email" : "tel"}
                  placeholder={
                    forgotPasswordMethod === "email"
                      ? "Enter your Email"
                      : "Enter your Mobile Number"
                  }
                  value={
                    forgotPasswordMethod === "email"
                      ? forgotEmail
                      : forgotMobile
                  }
                  onChange={(e) =>
                    forgotPasswordMethod === "email"
                      ? setForgotEmail(e.target.value)
                      : setForgotMobile(e.target.value)
                  }
                  className={`${commonInputClass} pl-12`}
                />
              </div>
              {error && (
                <p className="text-red-300 text-center flex items-center justify-center space-x-1 font-medium text-sm">
                  <AlertTriangle size={18} />
                  <span>{error}</span>
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={`${commonButtonClass} ${
                  isLoading ? disabledButtonClass : primaryButtonClass
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Sending Security Code...</span>
                  </span>
                ) : (
                  "Send Security Code"
                )}
              </button>
            </form>
          );
        }
      }

      // STEP 2: Verify OTP
      if (forgotPasswordStep === 2) {
        const isEmail = forgotPasswordMethod === "email";
        const otpArray = isEmail ? forgotOtp : forgotMobileOtp;
        const setOtpArray = isEmail ? setForgotOtp : setForgotMobileOtp;
        const refs = isEmail ? forgotOtpRefs : forgotMobileOtpRefs;
        const length = isEmail ? 6 : 4;
        const contact = isEmail ? forgotEmail : forgotMobile;

        return (
          <form onSubmit={handleVerifyForgotOtp} className="space-y-6 pt-4">
            {backButton}
            <h2
              className={`text-2xl font-bold text-center ${primaryTextColor}`}
            >
              {getScreenTitle()}
            </h2>
            <p className={`text-center ${secondaryTextColor} text-sm`}>
              Enter the {length}-digit code we sent to **{contact}**.
            </p>
            <div className="flex justify-center space-x-3">
              {otpArray.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(
                      otpArray,
                      setOtpArray,
                      index,
                      e.target.value,
                      refs,
                      e
                    )
                  }
                  onKeyDown={(e) =>
                    handleOtpChange(
                      otpArray,
                      setOtpArray,
                      index,
                      e.target.value,
                      refs,
                      e
                    )
                  }
                  ref={refs[index]}
                  className={`${otpInputClass} ${
                    isEmail ? "w-10" : "w-12"
                  } text-lg ${isDark ? "text-white" : "text-gray-900"}`}
                />
              ))}
            </div>
            {error && (
              <p className="text-red-300 text-center flex items-center justify-center space-x-1 font-medium text-sm">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`${commonButtonClass} ${
                isLoading ? disabledButtonClass : primaryButtonClass
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Validating...</span>
                </span>
              ) : (
                "Validate Security Code"
              )}
            </button>
            <p
              className={`text-center text-xs ${secondaryTextColor} text-white/50`}
            >
              Code expires in: **{timer}s**
              {resendEnabled ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className={`ml-2 font-semibold flex items-center justify-center space-x-1 w-full text-sm ${linkTextColor}`}
                >
                  <RefreshCw size={16} />
                  <span>Resend Code</span>
                </button>
              ) : null}
            </p>
          </form>
        );
      }

      // STEP 3: Reset Password
      if (forgotPasswordStep === 3) {
        return (
          <form onSubmit={handleUpdatePassword} className="space-y-6 pt-4">
            {backButton}
            <h2
              className={`text-2xl font-bold text-center ${primaryTextColor}`}
            >
              {getScreenTitle()}
            </h2>
            <p className={`text-center ${secondaryTextColor} text-sm`}>
              Set a strong new password now.
            </p>

            {/* Username Field */}
            <div className="relative">
              <User
                size={18}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${primaryIconColor}`}
              />
              <input
                type="text"
                placeholder="Enter Your Username"
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
                className={`${commonInputClass} pl-12`}
              />
            </div>

            {/* New Password Field */}
            <div className="relative">
              <Lock
                size={18}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${primaryIconColor}`}
              />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password (min. 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`${commonInputClass} pl-12 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDark
                    ? "text-white/60 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                } transition`}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <Lock
                size={18}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${primaryIconColor}`}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${commonInputClass} pl-12 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDark
                    ? "text-white/60 hover:text-white"
                    : "text-gray-500 hover:text-gray-900"
                } transition`}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p className="text-red-300 text-center flex items-center justify-center space-x-1 font-medium text-sm">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`${commonButtonClass} ${
                isLoading ? disabledButtonClass : primaryButtonClass
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Finalizing Update...</span>
                </span>
              ) : (
                "Update & Complete Reset"
              )}
            </button>
          </form>
        );
      }
    }

    // --- REGULAR OTP SCREEN (2FA PLACEHOLDER) ---
    if (otpScreen) {
      const backButton = (
        <button
          type="button"
          onClick={handleBack}
          className={`mb-6 text-sm flex items-center space-x-1 font-semibold ${linkTextColor}`}
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>
      );

      return (
        <div className="space-y-6 pt-4">
          {backButton}
          <h2 className={`text-2xl font-bold text-center ${primaryTextColor}`}>
            {getScreenTitle()}
          </h2>
          <p className={`text-center ${secondaryTextColor} text-sm`}>
            {otpMethod
              ? `Enter the code received via your ${otpMethod} to proceed.`
              : "Choose your preferred verification method."}
          </p>

          {!otpMethod && (
            <div className="space-y-4">
              <button
                onClick={() => handleOtpMethodSelect("mobile")}
                className={`${commonButtonClass} bg-blue-500/80 hover:bg-blue-600`}
              >
                <Phone size={18} className="inline mr-2" />
                Verify via Mobile (4-digit)
              </button>
              <button
                onClick={() => handleOtpMethodSelect("email")}
                className={`${commonButtonClass} bg-purple-500/80 hover:bg-purple-600`}
              >
                <Mail size={18} className="inline mr-2" />
                Verify via Email (6-digit)
              </button>
            </div>
          )}
          {otpMethod && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="flex justify-center space-x-3">
                {/* Using the correct length based on method */}
                {(otpMethod === "mobile" ? mobileOtp : emailOtp).map(
                  (digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) =>
                        handleOtpChange(
                          otpMethod === "mobile" ? mobileOtp : emailOtp,
                          otpMethod === "mobile" ? setMobileOtp : setEmailOtp,
                          index,
                          e.target.value,
                          otpMethod === "mobile" ? mobileRefs : emailRefs,
                          e
                        )
                      }
                      onKeyDown={(e) =>
                        handleOtpChange(
                          otpMethod === "mobile" ? mobileOtp : emailOtp,
                          otpMethod === "mobile" ? setMobileOtp : setEmailOtp,
                          index,
                          e.target.value,
                          otpMethod === "mobile" ? mobileRefs : emailRefs,
                          e
                        )
                      }
                      ref={
                        (otpMethod === "mobile" ? mobileRefs : emailRefs)[index]
                      }
                      className={`${otpInputClass} ${
                        otpMethod === "mobile" ? "w-12" : "w-10"
                      } text-lg ${isDark ? "text-white" : "text-gray-900"}`}
                    />
                  )
                )}
              </div>
              {error && (
                <p className="text-red-300 text-center flex items-center justify-center space-x-1 font-medium text-sm">
                  <AlertTriangle size={18} />
                  <span>{error}</span>
                </p>
              )}
              <button
                type="submit"
                className={`${commonButtonClass} ${primaryButtonClass}`}
              >
                Verify {otpMethod === "mobile" ? "Mobile" : "Email"} Code
              </button>
              <p className={`text-center text-xs ${secondaryTextColor}`}>
                Code expires in: **{timer}s**
                {resendEnabled ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className={`ml-2 font-semibold flex items-center justify-center space-x-1 w-full text-sm ${linkTextColor}`}
                  >
                    <RefreshCw size={16} />
                    <span>Resend Code</span>
                  </button>
                ) : null}
              </p>
            </form>
          )}
        </div>
      );
    }
  };

  return (
    // Dynamic Background based on Theme
    <div
      className={`flex items-center justify-center h-screen w-screen relative overflow-hidden transition-all duration-500 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-900"
      }`}
    >
      {/* Background Gradient / Neon Effects (Dynamic based on Theme) */}
      <div className="absolute inset-0 z-0">
        {/* Purple Glow (Top Right) */}
        <div
          className={`absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl ${
            isDark ? "bg-purple-600 opacity-30" : "bg-purple-300 opacity-50"
          } animate-pulse-slow`}
        ></div>
        {/* Indigo Glow (Bottom Left) */}
        <div
          className={`absolute bottom-0 left-0 w-80 h-80 rounded-full mix-blend-screen filter blur-3xl ${
            isDark ? "bg-indigo-700 opacity-20" : "bg-indigo-400 opacity-40"
          } animate-pulse-slow animation-delay-2000`}
        ></div>
        {/* Overlay (Darkens/Lightens the background effects) */}
        <div
          className={`absolute inset-0 ${
            isDark ? "bg-black/50" : "bg-white/50"
          }`}
        ></div>
      </div>

      {/* Dark Mode Toggle (Kept for accessibility, placed outside the glass card) */}
      <div className="fixed top-8 right-8 z-50">
        <DarkModeToggle isDark={isDark} onToggle={handleThemeToggle} />
      </div>

      {/* Main Content Area (Split in the original image, but implemented as responsive columns) */}
      <div
        className={`relative z-10 flex w-full max-w-6xl h-[650px] transition-all duration-700 ease-out 
            ${isMounted ? "opacity-100" : "opacity-0"}`}
      >
        {/* Left Section: Branding & Slogan (Dynamic colors) */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-16">
          <div className="space-y-12">
            {/* Glowing Logo */}
            <div className="w-24 h-24 relative">
              <img
                src={logo}
                alt="Anasol Logo"
                className="w-full h-full object-contain filter drop-shadow-lg"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/50 via-purple-500/50 to-orange-500/50 blur-xl opacity-80 z-[-1]"></div>
            </div>

            <div className="space-y-4">
              <h2
                className={`text-4xl font-extralight italic leading-none ${primaryTextColor}`}
              >
                Empowering
              </h2>
              <h1
                className={`text-6xl font-bold tracking-tight ${primaryTextColor}`}
              >
                Your Workforce.
              </h1>
              <p className={`text-lg ${secondaryTextColor}`}>
                Access your essential HR services quickly and securely.
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-sm opacity-70 space-y-1">
            <p className={`font-semibold ${primaryTextColor}`}>
              ANASOL CONSULTANCY SERVICES
            </p>
            <p className={`text-xs ${secondaryTextColor}`}>
              © {new Date().getFullYear()} All Rights Reserved.
            </p>
          </div>
        </div>

        {/* Right Section: Glassmorphism Login Card (Dynamic colors) */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-8">
          <div
            className={`w-full max-w-md p-8 md:p-10 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-500
                    overflow-y-auto max-h-[600px] 
                    ${
                      isDark
                        ? "bg-white/5 border border-white/20 text-white"
                        : "bg-white/70 border border-gray-300/50 text-gray-900"
                    }`}
          >
            {/* Mobile Logo (visible on small screens) */}
            <div className="md:hidden flex justify-center mb-6">
              <img src={logo} alt="Anasol Logo" className="w-20 h-auto" />
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
