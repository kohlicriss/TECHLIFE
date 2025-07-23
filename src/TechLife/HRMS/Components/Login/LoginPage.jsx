import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/anasol-logo.png";

const LoginPage = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [otpScreen, setOtpScreen] = useState(false);
  const [otpMethod, setOtpMethod] = useState(null); // New state: 'mobile' or 'email' for login OTP
  const [mobileOtp, setMobileOtp] = useState(["", "", "", ""]);
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(59);
  const [resendEnabled, setResendEnabled] = useState(false);

  // New states for Forgot Password functionality
  const [forgotPasswordScreen, setForgotPasswordScreen] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState(["", "", "", "", "", ""]); // Assuming email OTP for forgot password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Ref for forgot password OTP
  const forgotOtpRefs = [
    useRef(null),
    useRef(null),
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
    // Timer only runs if otpScreen is active and an OTP method is selected, OR if forgot password OTP (step 2) is active
    if (!otpScreen && !(forgotPasswordScreen && forgotPasswordStep === 2))
      return;
    if (timer === 0) {
      setResendEnabled(true);
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, otpScreen, otpMethod, forgotPasswordScreen, forgotPasswordStep]); // Added new dependencies

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Validation for name and password
    if (!name.trim()) {
      setError("Please enter your email or username.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    // Note: selectedRole is currently always "Admin". If roles become dynamic, this check is relevant.
    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }

    setOtpScreen(true);
    setOtpMethod(null); // Reset OTP method selection
  };

  const handleOtpMethodSelect = (method) => {
    setOtpMethod(method);
    resetTimer(); // Start timer for the chosen method
    setError(""); // Clear error when method is selected
    setMobileOtp(["", "", "", ""]);
    setEmailOtp(["", "", "", "", "", ""]);
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

  const handleRoleSelect = (role) => setSelectedRole(role);

  const handleOtpChange = (
    otpArray,
    setOtpArray,
    index,
    value,
    refs,
    event
  ) => {
    const regex = /^[0-9]$/; // OTPs are typically numeric
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

  const resetTimer = () => {
    setTimer(59);
    setResendEnabled(false);
  };

  const handleBack = () => {
    if (forgotPasswordScreen) {
      if (forgotPasswordStep > 1) {
        // If not at step 1 of forgot password, go back one step
        setForgotPasswordStep((prev) => prev - 1);
        setError("");
        // Clear OTP if going back from step 2
        if (forgotPasswordStep === 2) {
          setForgotOtp(["", "", "", "", "", ""]);
        }
        // Clear passwords if going back from step 3
        if (forgotPasswordStep === 3) {
          setNewPassword("");
          setConfirmPassword("");
        }
      } else {
        // If at step 1 of forgot password, go back to login
        setForgotPasswordScreen(false);
        setForgotEmail("");
        setForgotPasswordStep(1); // Reset step for next time
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
      // Resending OTP for forgot password
      console.log(`Resending Forgot Password OTP to ${forgotEmail}`);
      // Call API to resend forgot password OTP
    } else if (otpScreen && otpMethod) {
      // Resending OTP for regular login
      console.log(`Resending Login OTP via ${otpMethod}`);
      // Call API to resend login OTP
    }
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordScreen(true);
    setOtpScreen(false); // Ensure login OTP screen is hidden
    setForgotEmail(""); // Clear previous email
    setForgotPasswordStep(1); // Start at step 1
    setForgotOtp(["", "", "", "", "", ""]); // Clear OTP field
    setNewPassword(""); // Clear password fields
    setConfirmPassword("");
    setError(""); // Clear errors
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Validation for empty email in Forgot Password flow - THIS IS ALREADY HERE
    if (!forgotEmail.trim()) {
      // .trim() to handle whitespace-only input
      setError("Please enter your email."); // THIS SETS THE ERROR MESSAGE
      return; // Stops the function execution
    }
    // Logic to simulate requesting OTP (already exists)
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotPasswordStep(2); // Move to OTP entry step
      resetTimer(); // Start timer for OTP entry
      console.log(`OTP requested for: ${forgotEmail}`);
    }, 1500);
  };

  const handleVerifyForgotOtp = (e) => {
    e.preventDefault();
    setError("");
    if (forgotOtp.join("").length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setIsLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      // If OTP is correct (simulated success)
      setForgotPasswordStep(3); // Move to set new password step
      setError(""); // Clear any previous errors
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
      // Example: minimum password length
      setError("New password must be at least 6 characters long.");
      return;
    }

    // Simulate API call to update password
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(
        "Password updated successfully! Please login with your new password."
      );
      setForgotPasswordScreen(false); // Go back to login screen
      setForgotEmail("");
      setForgotPasswordStep(1); // Reset step for next time
      setForgotOtp(["", "", "", "", "", ""]);
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
                Sign in to continue access
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
          <div style={{ marginTop: "80px" }} className="max-w-md mx-auto">
            {/* Removed space-y-4 here */}
            <h2 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
              {/* Added mb-6 here */}
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
            {/* --- Forgot Password Form --- */}
            {forgotPasswordScreen ? (
              <form
                onSubmit={
                  forgotPasswordStep === 1
                    ? handleRequestOtp
                    : forgotPasswordStep === 2
                    ? handleVerifyForgotOtp
                    : handleUpdatePassword
                }
                className="space-y-3"
              >
                {forgotPasswordStep === 1 && (
                  <>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full border-b-2 border-gray-300 py-3 px-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                      required
                    />
                    {/* Error message for forgot password email input */}
                    {error && (
                      <p className="text-red-500 text-center">{error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 text-white rounded-full ${
                        isLoading
                          ? "bg-gray-500"
                          : "bg-gradient-to-r from-blue-500 to-blue-700"
                      }`}
                    >
                      {isLoading ? "Requesting OTP..." : "Request OTP"}
                    </button>
                  </>
                )}
                {forgotPasswordStep === 2 && (
                  <>
                    <p className="text-gray-600 text-center mb-2">
                      Enter the 6-digit code sent to {forgotEmail}.
                    </p>
                    <div className="grid grid-cols-6 gap-2 justify-center">
                      {forgotOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          type="text"
                          maxLength="1"
                          value={digit}
                          ref={forgotOtpRefs[idx]}
                          onChange={(e) =>
                            handleOtpChange(
                              forgotOtp,
                              setForgotOtp,
                              idx,
                              e.target.value,
                              forgotOtpRefs,
                              e
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Backspace") {
                              handleOtpChange(
                                forgotOtp,
                                setForgotOtp,
                                idx,
                                "",
                                forgotOtpRefs,
                                e
                              );
                            }
                          }}
                          className="w-14 h-14 border-2 text-2xl text-center rounded-lg border-gray-300 focus:outline-none focus:border-purple-500"
                        />
                      ))}
                    </div>
                    <div className="text-center mt-2">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={!resendEnabled}
                        className="text-sm text-blue-500 hover:underline disabled:text-gray-400 disabled:no-underline"
                      >
                        {resendEnabled
                          ? "Resend OTP"
                          : `Resend in 00:${timer < 10 ? `0${timer}` : timer}`}
                      </button>
                    </div>
                    {error && (
                      <p className="text-red-500 text-center">{error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3 text-white rounded-full ${
                        isLoading
                          ? "bg-gray-500"
                          : "bg-gradient-to-r from-purple-600 to-blue-600"
                      }`}
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </>
                )}
                {forgotPasswordStep === 3 && (
                  <>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border-b-2 border-gray-300 py-3 px-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border-b-2 border-gray-300 py-3 px-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                        required
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
                      className={`w-full py-3 text-white rounded-full ${
                        isLoading
                          ? "bg-gray-500"
                          : "bg-gradient-to-r from-purple-600 to-blue-600"
                      }`}
                    >
                      {isLoading ? "Updating..." : "Update Password"}
                    </button>
                  </>
                )}
              </form>
            ) : (
              // --- Original Login/OTP Form ---
              <form
                onSubmit={
                  otpScreen && otpMethod ? handleOtpSubmit : handleLoginSubmit
                }
                className="space-y-3"
              >
                {!otpScreen ? (
                  <>
                    <input
                      type="text"
                      placeholder="Email or Username"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border-b-2 border-gray-300 py-3 px-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border-b-2 border-gray-300 py-3 px-2 pr-10 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {!otpMethod ? (
                      <div className="flex flex-col gap-4">
                        <p className="text-gray-600 text-center mb-2">
                          How would you like to receive the OTP?
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOtpMethodSelect("mobile")}
                          className="w-full py-3 text-white rounded-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition duration-300 ease-in-out"
                        >
                          Send to Mobile
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOtpMethodSelect("email")}
                          className="w-full py-3 text-white rounded-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition duration-300 ease-in-out"
                        >
                          Send to Email
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-600 text-center mb-2">
                          {otpMethod === "mobile"
                            ? "Enter the 4-digit code sent to your mobile."
                            : "Enter the 6-digit code sent to your email."}
                        </p>
                        {/* Corrected conditional rendering for OTP inputs to strictly show only one grid */}
                        {otpMethod === "mobile" ? (
                          <div className="grid grid-cols-4 gap-2 justify-center">
                            {mobileOtp.map((digit, idx) => (
                              <input
                                key={idx}
                                type="text"
                                maxLength="1"
                                value={digit}
                                ref={mobileRefs[idx]}
                                onChange={(e) =>
                                  handleOtpChange(
                                    mobileOtp,
                                    setMobileOtp,
                                    idx,
                                    e.target.value,
                                    mobileRefs,
                                    e
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Backspace") {
                                    handleOtpChange(
                                      mobileOtp,
                                      setMobileOtp,
                                      idx,
                                      "",
                                      mobileRefs,
                                      e
                                    );
                                  }
                                }}
                                className="w-14 h-14 border-2 text-2xl text-center rounded-lg border-gray-300 focus:outline-none focus:border-purple-500"
                              />
                            ))}
                          </div>
                        ) : otpMethod === "email" ? (
                          <div className="grid grid-cols-6 gap-2 justify-center">
                            {emailOtp.map((digit, idx) => (
                              <input
                                key={idx}
                                type="text"
                                maxLength="1"
                                value={digit}
                                ref={emailRefs[idx]}
                                onChange={(e) =>
                                  handleOtpChange(
                                    emailOtp,
                                    setEmailOtp,
                                    idx,
                                    e.target.value,
                                    emailRefs,
                                    e
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Backspace") {
                                    handleOtpChange(
                                      emailOtp,
                                      setEmailOtp,
                                      idx,
                                      "",
                                      emailRefs,
                                      e
                                    );
                                  }
                                }}
                                className="w-14 h-14 border-2 text-2xl text-center rounded-lg border-gray-300 focus:outline-none focus:border-purple-500"
                              />
                            ))}
                          </div>
                        ) : null}{" "}
                        {/* Ensures only one or none are rendered */}
                        <div className="text-center mt-2">
                          <button
                            type="button"
                            onClick={handleResend}
                            disabled={!resendEnabled}
                            className="text-sm text-blue-500 hover:underline disabled:text-gray-400 disabled:no-underline"
                          >
                            {resendEnabled
                              ? "Resend OTP"
                              : `Resend in 00:${
                                  timer < 10 ? `0${timer}` : timer
                                }`}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
                {error && <p className="text-red-500 text-center">{error}</p>}
                {/* Login button is now only disabled by isLoading, allowing validation messages */}
                {!otpScreen || otpMethod ? (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 text-white rounded-full ${
                      isLoading
                        ? "bg-gray-500"
                        : "bg-gradient-to-r from-purple-600 to-blue-600"
                    }`}
                  >
                    {isLoading
                      ? "Loading..."
                      : otpScreen
                      ? "Verify OTP"
                      : "Login"}
                  </button>
                ) : null}
              </form>
            )}
            {/* Back button logic */}
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
            {/* Forgot Password Link - Only shown on initial login screen */}
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
  );
};

export default LoginPage;
