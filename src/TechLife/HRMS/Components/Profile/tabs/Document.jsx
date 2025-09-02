import React, { useState, useEffect, useContext } from "react";
import { IoClose, IoDocumentText, IoCheckmarkCircle, IoWarning, IoEye, IoAdd, IoCloudUpload } from "react-icons/io5";
import { Context } from "../../HrmsContext";
import { publicinfoApi } from "../../../../../axiosInstance";
import { useParams } from "react-router-dom";

const identityFields = {
  aadhaar: [
    { label: "Aadhaar Number", name: "aadhaarNumber", type: "text", required: true, pattern: "^[2-9]{1}[0-9]{11}$", message: "Invalid Aadhaar number format" },
    { label: "Enrollment Number", name: "enrollmentNumber", type: "text", required: true, pattern: "^[0-9]{4}/[0-9]{5}/[0-9]{7}$", message: "Invalid enrollment number format" },
    { label: "Date of Birth", name: "dateOfBirth", type: "date", required: true },
    { label: "Name", name: "aadhaarName", type: "text", required: true },
    { label: "Address", name: "address", type: "textarea", required: true },
    { label: "Gender", name: "gender", type: "select", options: ["Male", "Female", "Other"], required: true },
    { label: "Aadhaar Image", name: "aadhaarImage", type: "file" },
  ],
  pan: [
    { label: "PAN Number", name: "panNumber", type: "text", required: true, pattern: "[A-Z]{5}[0-9]{4}[A-Z]{1}", message: "Invalid PAN format (e.g., ABCDE1234F)" },
    { label: "PAN Name", name: "panName", type: "text", required: true },
    { label: "Date of Birth", name: "dateOfBirth", type: "date", required: true },
    { label: "Parents Name", name: "parentsName", type: "text", required: true },
    { label: "PAN Image", name: "panImage", type: "file" },
  ],
  drivingLicense: [
    { label: "License Number", name: "licenseNumber", type: "text", required: true },
    { label: "Name", name: "name", type: "text", required: true },
    { label: "Date of Birth", name: "dateOfBirth", type: "date", required: true },
    { label: "Blood Group", name: "bloodGroup", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], required: true },
    { label: "Father's Name", name: "fatherName", type: "text", required: true },
    { label: "Issue Date", name: "issueDate", type: "date", required: true },
    { label: "Expiry Date", name: "expiresOn", type: "date", required: true },
    { label: "Address", name: "address", type: "textarea", required: true },
    { label: "License Image", name: "licenseImage", type: "file" },
  ],
  passport: [
    { label: "Passport Number", name: "passportNumber", type: "text", required: true, pattern: "^[A-Z0-9]{6,9}$", message: "Invalid passport number format" },
    { label: "Country Code", name: "countryCode", type: "text", required: true, size: [2, 3] },
    { label: "Passport Type", name: "passportType", type: "text", required: true },
    { label: "Date of Birth", name: "dateOfBirth", type: "date", required: true },
    { label: "Name", name: "name", type: "text", required: true },
    { label: "Gender", name: "gender", type: "select", options: ["Male", "Female", "Other"], required: true },
    { label: "Date of Issue", name: "dateOfIssue", type: "date", required: true },
    { label: "Place of Issue", name: "placeOfIssue", type: "text", required: true },
    { label: "Place of Birth", name: "placeOfBirth", type: "text", required: true },
    { label: "Date of Expiration", name: "dateOfExpiration", type: "date", required: true },
    { label: "Address", name: "address", type: "textarea", required: true },
    { label: "Passport Image", name: "passportImage", type: "file" },
  ],
  voter: [
    { label: "Voter ID Number", name: "voterIdNumber", type: "text", required: true, pattern: "^[A-Z]{3}[0-9]{7}$", message: "Invalid Voter ID format (e.g., ABC1234567)" },
    { label: "Full Name", name: "fullName", type: "text", required: true },
    { label: "Relation Name", name: "relationName", type: "text", required: true },
    { label: "Gender", name: "gender", type: "select", options: ["Male", "Female", "Other"], required: true },
    { label: "Date of Birth", name: "dateOfBirth", type: "date", required: true },
    { label: "Address", name: "address", type: "textarea", required: true },
    { label: "Issued Date", name: "issuedDate", type: "date", required: true },
    { label: "Voter Image", name: "uploadVoter", type: "file" },
  ],
};

// Document type configurations with icons and colors
const documentConfig = {
  aadhaar: {
    icon: <IoDocumentText />,
    color: 'from-blue-500 to-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    title: 'Aadhaar Card',
    description: 'Government issued identity document'
  },
  pan: {
    icon: <IoDocumentText />,
    color: 'from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    title: 'PAN Card',
    description: 'Permanent Account Number for taxation'
  },
  drivingLicense: {
    icon: <IoDocumentText />,
    color: 'from-orange-500 to-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    title: 'Driving License',
    description: 'Valid driving permit document'
  },
  passport: {
    icon: <IoDocumentText />,
    color: 'from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    title: 'Passport',
    description: 'International travel document'
  },
  voter: {
    icon: <IoDocumentText />,
    color: 'from-red-500 to-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    title: 'Voter ID Card',
    description: 'Electoral identity verification'
  },
};

const Document = () => {
    const [editingSection, setEditingSection] = useState(null);
    const [identityData, setIdentityData] = useState({});
    const [editingData, setEditingData] = useState({});
    const { empID } = useParams();
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [searchFilter, setSearchFilter] = useState('');
    const [completionStats, setCompletionStats] = useState({ completed: 0, total: 5 });

    // Validation Functions
    const validatePanData = (data) => {
        const errors = {};

        if (!data.panNumber) {
            errors.panNumber = "PAN number is required";
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber)) {
            errors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
        }

        if (!data.panName) {
            errors.panName = "PAN name is required";
        } else if (data.panName.length < 3 || data.panName.length > 100) {
            errors.panName = "PAN name must be between 3 and 100 characters";
        }

        if (!data.dateOfBirth) {
            errors.dateOfBirth = "Date of birth is required";
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth)) {
            errors.dateOfBirth = "Date of birth must be in YYYY-MM-DD format";
        }

        if (!data.parentsName) {
            errors.parentsName = "Parent's name is required";
        }

        return errors;
    };

    const validateAadhaarData = (data) => {
        const errors = {};

        if (!data.aadhaarNumber) {
            errors.aadhaarNumber = "Aadhaar number is required";
        } else if (!/^[2-9]{1}[0-9]{11}$/.test(data.aadhaarNumber)) {
            errors.aadhaarNumber = "Invalid Aadhaar number format";
        }

        if (!data.enrollmentNumber) {
            errors.enrollmentNumber = "Enrollment number is required";
        } else if (!/^[0-9]{4}\/[0-9]{5}\/[0-9]{7}$/.test(data.enrollmentNumber)) {
            errors.enrollmentNumber = "Invalid enrollment number format";
        }

        if (!data.dateOfBirth) {
            errors.dateOfBirth = "Date of birth is required";
        }

        if (!data.aadhaarName) {
            errors.aadhaarName = "Name is required";
        }

        if (!data.address) {
            errors.address = "Address is required";
        }

        if (!data.gender) {
            errors.gender = "Gender is required";
        }

        return errors;
    };

    const validateDrivingLicenseData = (data) => {
        const errors = {};

        if (!data.licenseNumber) {
            errors.licenseNumber = "License number is required";
        }

        if (!data.name) {
            errors.name = "Name is required";
        }

        if (!data.dateOfBirth) {
            errors.dateOfBirth = "Date of birth is required";
        }

        if (!data.bloodGroup) {
            errors.bloodGroup = "Blood group is required";
        }

        if (!data.fatherName) {
            errors.fatherName = "Father's name is required";
        }

        if (!data.issueDate) {
            errors.issueDate = "Issue date is required";
        }

        if (!data.expiresOn) {
            errors.expiresOn = "Expiry date is required";
        }

        if (!data.address) {
            errors.address = "Address is required";
        }

        return errors;
    };

    const validatePassportData = (data) => {
        const errors = {};

        if (!data.passportNumber) {
            errors.passportNumber = "Passport number is required";
        } else if (!/^[A-Z0-9]{6,9}$/.test(data.passportNumber)) {
            errors.passportNumber = "Invalid passport number format";
        }

        if (!data.countryCode) {
            errors.countryCode = "Country code is required";
        } else if (data.countryCode.length < 2 || data.countryCode.length > 3) {
            errors.countryCode = "Country code must be 2-3 characters";
        }

        if (!data.passportType) {
            errors.passportType = "Passport type is required";
        }

        if (!data.dateOfBirth) {
            errors.dateOfBirth = "Date of birth is required";
        }

        if (!data.name) {
            errors.name = "Name is required";
        }

        if (!data.gender) {
            errors.gender = "Gender is required";
        }

        if (!data.dateOfIssue) {
            errors.dateOfIssue = "Date of issue is required";
        }

        if (!data.placeOfIssue) {
            errors.placeOfIssue = "Place of issue is required";
        }

        if (!data.placeOfBirth) {
            errors.placeOfBirth = "Place of birth is required";
        }

        if (!data.dateOfExpiration) {
            errors.dateOfExpiration = "Date of expiration is required";
        }

        if (!data.address) {
            errors.address = "Address is required";
        }

        return errors;
    };

    const validateVoterData = (data) => {
        const errors = {};

        if (!data.voterIdNumber) {
            errors.voterIdNumber = "Voter ID number is required";
        } else if (!/^[A-Z]{3}[0-9]{7}$/.test(data.voterIdNumber)) {
            errors.voterIdNumber = "Invalid Voter ID format (e.g., ABC1234567)";
        }

        if (!data.fullName) {
            errors.fullName = "Full name is required";
        }

        if (!data.relationName) {
            errors.relationName = "Relation name is required";
        }

        if (!data.gender) {
            errors.gender = "Gender is required";
        }

        if (!data.dateOfBirth) {
            errors.dateOfBirth = "Date of birth is required";
        }

        if (!data.address) {
            errors.address = "Address is required";
        }

        if (!data.issuedDate) {
            errors.issuedDate = "Issued date is required";
        }

        return errors;
    };

    const validateFormData = (subSection, data) => {
        switch (subSection) {
            case 'pan':
                return validatePanData(data);
            case 'aadhaar':
                return validateAadhaarData(data);
            case 'drivingLicense':
                return validateDrivingLicenseData(data);
            case 'passport':
                return validatePassportData(data);
            case 'voter':
                return validateVoterData(data);
            default:
                return {};
        }
    };

    useEffect(() => {
        const fetchIdentityData = async () => {
            try {
                const identityPromises = [
                    publicinfoApi.get(`employee/${empID}/aadhaar`).catch(err => { console.error("Failed to fetch Aadhaar details:", err); return { data: null }; }),
                    publicinfoApi.get(`employee/${empID}/pan`).catch(err => { console.error("Failed to fetch PAN details:", err); return { data: null }; }),
                    publicinfoApi.get(`employee/${empID}/driving`).catch(err => { console.error("Failed to fetch Driving License details:", err); return { data: null }; }),
                    publicinfoApi.get(`employee/${empID}/passport`).catch(err => { console.error("Failed to fetch Passport details:", err); return { data: null }; }),
                    publicinfoApi.get(`employee/${empID}/voter`).catch(err => { console.error("Failed to fetch Voter ID details:", err); return { data: null }; }),
                ];

                const [aadhaarRes, panRes, drivingRes, passportRes, voterRes] = await Promise.all(identityPromises);

                console.log("Fetched Aadhaar response:", aadhaarRes.data);
                console.log("Fetched PAN response:", panRes.data);
                console.log("Fetched Driving License response:", drivingRes.data);
                console.log("Fetched Passport response:", passportRes.data);
                console.log("Fetched Voter ID response:", voterRes.data);

                const data = {
                    aadhaar: aadhaarRes.data,
                    pan: panRes.data,
                    drivingLicense: drivingRes.data,
                    passport: passportRes.data,
                    voter: voterRes.data,
                };

                setIdentityData(data);

                // Calculate completion stats
                const completed = Object.values(data).filter(Boolean).length;
                setCompletionStats({ completed, total: 5 });

            } catch (err) {
                console.error("Failed to fetch identity data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (empID) {
            fetchIdentityData();
        }
    }, [empID]);

    const openEditSection = (subSection) => {
        setErrors({});
        const dataToEdit = identityData[subSection] || {};
        setEditingData(dataToEdit);
        setEditingSection({ subSection });
    };

    const handleEditFieldChange = (field, value) => {
        setEditingData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleFileChange = (field, file) => {
        setEditingData((prev) => ({ ...prev, [field]: file }));
    };

    const handleUpdate = async (subSection) => {
        try {
            // Client-side validation first
            const validationErrors = validateFormData(subSection, editingData);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            const existingData = identityData[subSection];
            const method = existingData ? 'put' : 'post';

            const formData = new FormData();
            const files = {
                aadhaar: 'aadhaarImage', pan: 'panImage', drivingLicense: 'licenseImage',
                passport: 'passportImage', voter: 'voterImage'
            };
            const fileField = files[subSection];
            const file = editingData[fileField];

            if (file) {
                formData.append(fileField, file);
            }

            const dto = { ...editingData };
            delete dto[fileField];

            // Ensure date format is correct for backend
            if (dto.dateOfBirth) {
                dto.dateOfBirth = dto.dateOfBirth; // Already in YYYY-MM-DD format from input[type="date"]
            }

            const dtoNames = {
                aadhaar: 'aadhaar', pan: 'panDetails', drivingLicense: 'drivingLicense',
                passport: 'passportDetails', voter: 'voterDetails'
            };
            const dtoName = dtoNames[subSection];

            formData.append(dtoName, new Blob([JSON.stringify(dto)], { type: "application/json" }));

            let url;
            switch(subSection) {
                case 'aadhaar': url = `/employee/${method === 'put' ? `${empID}/aadhaar` : `aadhaar/${empID}`}`; break;
                case 'pan': url = `/employee/${empID}/pan`; break;
                case 'drivingLicense': url = `/employee/${method === 'put' ? `${empID}/driving` : `driving/license/${empID}`}`; break;
                case 'passport': url = `/employee/${method === 'put' ? `${empID}/passport` : `passport/details/${empID}`}`; break;
                case 'voter': url = `/employee/${method === 'put' ? `${empID}/voter` : `${empID}/voter`}`; break;
            }

            const response = await publicinfoApi[method](url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log(`Update for ${subSection} successful:`, response.data);

            setEditingSection(null);
            setErrors({});

            // Refresh the data
            const updatedIdentityData = await publicinfoApi.get(`employee/${empID}/${subSection}`);
            console.log(`Refreshed ${subSection} data:`, updatedIdentityData.data);
            setIdentityData(prev => ({...prev, [subSection]: updatedIdentityData.data}));

            // Update completion stats
            const newData = {...identityData, [subSection]: updatedIdentityData.data};
            const completed = Object.values(newData).filter(Boolean).length;
            setCompletionStats({ completed, total: 5 });

        } catch (error) {
            console.error(`Update for ${subSection} failed:`, error);

            if (error.response) {
                const { status, data } = error.response;

                if (status === 400) {
                    // Handle different types of 400 errors
                    if (data && typeof data === 'object' && data.timestamp) {
                        // Generic backend validation error
                        setErrors({
                            general: `Validation failed. Please check all required fields are filled correctly.`
                        });
                    } else if (data && typeof data === 'object') {
                        // Field-specific validation errors
                        setErrors(data);
                    } else {
                        // String error message
                        setErrors({ general: data || "Validation failed. Please check your input." });
                    }
                } else if (status === 401) {
                    setErrors({ general: "You are not authorized to perform this action." });
                } else if (status === 403) {
                    setErrors({ general: "Access denied. Please contact your administrator." });
                } else if (status === 404) {
                    setErrors({ general: "Employee record not found." });
                } else if (status >= 500) {
                    setErrors({ general: "Server error. Please try again later." });
                } else {
                    setErrors({ general: "An unexpected error occurred. Please try again." });
                }
            } else if (error.request) {
                // Network error
                setErrors({ general: "Network error. Please check your internet connection." });
            } else {
                // Other error
                setErrors({ general: "An unexpected error occurred. Please try again." });
            }
        }
    };

    // Skeleton Loading Component
    const SkeletonCard = () => (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-pulse">
            <div className="p-6 bg-gray-100 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                        <div>
                            <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-48"></div>
                        </div>
                    </div>
                    <div className="h-9 bg-gray-300 rounded-lg w-20"></div>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl">
                            <div className="h-3 bg-gray-300 rounded w-20 mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-32"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderField = (label, name, type = "text", required = false, options = [], isDisabled = false) => {
        const isError = errors[name];
        const fieldValue = editingData[name] || "";

        // Real-time validation for specific fields
        const handleFieldChange = (value) => {
            handleEditFieldChange(name, value);

            // Real-time validation for specific fields
            if (name === 'panNumber' && value) {
                if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
                    setErrors(prev => ({
                        ...prev,
                        [name]: "PAN format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)"
                    }));
                }
            } else if (name === 'aadhaarNumber' && value) {
                if (!/^[2-9]{1}[0-9]{11}$/.test(value)) {
                    setErrors(prev => ({
                        ...prev,
                        [name]: "Aadhaar must be 12 digits starting with 2-9"
                    }));
                }
            } else if (name === 'voterIdNumber' && value) {
                if (!/^[A-Z]{3}[0-9]{7}$/.test(value)) {
                    setErrors(prev => ({
                        ...prev,
                        [name]: "Voter ID format: 3 letters + 7 digits (e.g., ABC1234567)"
                    }));
                }
            }
        };

        return (
          <div className="group relative" key={name}>
            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
              {label}
              {required && <span className="text-red-500 ml-1 text-base">*</span>}
              {isDisabled && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                  Read Only
                </span>
              )}
            </label>

            {type === "select" ? (
              <div className="relative">
                <select
                  value={fieldValue}
                  onChange={(e) => handleFieldChange(e.target.value)}
                  className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300 appearance-none bg-white
                    focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                    ${isError
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 hover:border-gray-300 group-hover:border-blue-300'
                    }
                    ${isDisabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
                  disabled={isDisabled}
                >
                  <option value="">Choose {label}</option>
                  {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            ) : type === "date" ? (
              <input
                type="date"
                value={fieldValue}
                onChange={(e) => handleFieldChange(e.target.value)}
                className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300
                  focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                  ${isError
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 hover:border-gray-300 group-hover:border-blue-300'
                  }
                  ${isDisabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white'}`}
                disabled={isDisabled}
              />
            ) : type === "file" ? (
              <div className={`relative border-2 border-dashed rounded-xl transition-all duration-300
                ${isError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}
                ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}`}>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(name, e.target.files?.[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isDisabled}
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                <div className="px-6 py-8 text-center">
                  <IoCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drop your file here, or <span className="text-blue-600">browse</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            ) : type === "textarea" ? (
              <textarea
                value={fieldValue}
                onChange={(e) => handleFieldChange(e.target.value)}
                className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300 resize-none h-32
                  focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                  ${isError
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 hover:border-gray-300 group-hover:border-blue-300'
                  }
                  ${isDisabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white'}`}
                placeholder={`Enter ${label.toLowerCase()}...`}
                required={required}
                disabled={isDisabled}
              />
            ) : (
              <input
                type={type}
                value={fieldValue}
                onChange={(e) => handleFieldChange(e.target.value)}
                className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300
                  focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                  ${isError
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-200 hover:border-gray-300 group-hover:border-blue-300'
                  }
                  ${isDisabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white'}`}
                placeholder={`Enter ${label.toLowerCase()}...`}
                required={required}
                disabled={isDisabled}
              />
            )}

            {isError && (
              <div className="mt-3 flex items-center space-x-2 text-red-600 animate-slideIn">
                <IoWarning className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-medium">{isError}</p>
              </div>
            )}
          </div>
        );
    };

    const renderEditModal = () => {
        if (!editingSection) return null;
        const { subSection } = editingSection;
        const fields = identityFields[subSection] || [];
        const isUpdate = !!identityData[subSection];
        const config = documentConfig[subSection];

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp">
              {/* Enhanced Header */}
              <div className={`px-8 py-6 bg-gradient-to-r ${config.color} text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{config.icon}</div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {isUpdate ? 'Update' : 'Add'} {config.title}
                      </h2>
                      <p className="text-white/90 text-sm">{config.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 group"
                    aria-label="Close"
                  >
                    <IoClose className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
                <form className="p-8" onSubmit={(e) => { e.preventDefault(); handleUpdate(subSection); }}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {fields.map((f) => {
                      const isIdField = ['aadhaarNumber', 'panNumber', 'licenseNumber', 'passportNumber', 'voterIdNumber'].includes(f.name);
                      const isDisabled = isUpdate && isIdField;
                      return renderField(f.label, f.name, f.type, f.required, f.options, isDisabled);
                    })}
                  </div>

                  {errors.general && (
                    <div className="mt-6 p-5 bg-red-50 border-l-4 border-red-400 rounded-r-xl animate-slideIn">
                      <div className="flex items-center">
                        <IoWarning className="w-6 h-6 text-red-400 mr-3" />
                        <p className="text-red-800 font-medium">{errors.general}</p>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Enhanced Footer */}
              <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold
                            hover:bg-gray-100 hover:border-gray-400 transition-all duration-200
                            focus:ring-4 focus:ring-gray-500/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => handleUpdate(subSection)}
                  className={`px-10 py-3 bg-gradient-to-r ${config.color} text-white font-bold rounded-xl
                            hover:shadow-lg transform hover:scale-105 transition-all duration-200
                            focus:ring-4 focus:ring-blue-500/30 flex items-center space-x-2`}
                >
                  <IoCheckmarkCircle className="w-5 h-5" />
                  <span>{isUpdate ? 'Update Document' : 'Save Document'}</span>
                </button>
              </div>
            </div>
          </div>
        );
    };

    const DetailItem = ({ label, value }) => (
        <div className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-100
                         hover:shadow-md transition-all duration-300 hover:scale-105">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                {label}
              </span>
              <p className="text-sm text-gray-900 font-semibold leading-relaxed">
                {value || (
                  <span className="text-gray-400 italic">Not provided</span>
                )}
              </p>
            </div>
          </div>
        </div>
    );

    const DetailItemWithLink = ({ label, link }) => (
        <div className="group p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100
                         hover:shadow-md transition-all duration-300 hover:scale-105">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-2">
                {label}
              </span>
              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-sm text-blue-700 hover:text-blue-900
                            font-semibold hover:underline transition-all duration-200 group"
                >
                  <IoEye className="w-4 h-4" />
                  <span>View Document</span>
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ) : (
                <p className="text-sm text-gray-400 font-medium italic">Document not uploaded</p>
              )}
            </div>
          </div>
        </div>
    );

    const IdentitySubSection = ({ title, data, onEdit, subSectionKey }) => {
        const config = documentConfig[subSectionKey];
        const hasData = !!data;

        return (
            <div className={`bg-white border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500
                           overflow-hidden group hover:scale-[1.02] ${config.borderColor}`}>
                {/* Card Header */}
                <div className={`px-8 py-6 ${config.bgColor} border-b-2 ${config.borderColor} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
                                {config.icon}
                            </div>
                            <div>
                                <h4 className={`text-xl font-bold ${config.textColor} flex items-center space-x-2`}>
                                    <span>{title}</span>
                                    {hasData && (
                                        <div className="flex items-center space-x-1">
                                            <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                Verified
                                            </span>
                                        </div>
                                    )}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                            </div>
                        </div>
                        <button
                          onClick={() => onEdit(subSectionKey)}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                                     transform hover:scale-105 focus:ring-4 focus:ring-blue-500/20 shadow-md hover:shadow-lg
                                     ${hasData
                                        ? `${config.textColor} bg-white border-2 ${config.borderColor} hover:bg-gray-50`
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                                     }`}
                        >
                          {hasData ? (
                            <>
                              <IoDocumentText className="w-4 h-4" />
                              <span>Edit Details</span>
                            </>
                          ) : (
                            <>
                              <IoAdd className="w-4 h-4" />
                              <span>Add Document</span>
                            </>
                          )}
                        </button>
                    </div>
                </div>

                {/* Card Content */}
                <div className="p-8">
                    {hasData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Object.keys(data).map(key => {
                                if (key === 'employee') return null;
                                if (key === 'uploadAadhaar' || key === 'panImage' || key === 'licenseImage' || key === 'passportImage' || key === 'uploadVoter') {
                                    return <DetailItemWithLink key={key} label={key.replace(/([A-Z])/g, " $1")} link={data[key]} />;
                                }
                                return <DetailItem key={key} label={key.replace(/([A-Z])/g, " $1")} value={data[key]} />;
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                                <div className="text-3xl opacity-50">{config.icon}</div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No {title} Added</h3>
                            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                                Add your {title.toLowerCase()} information to complete your profile and enhance security.
                            </p>
                            <button
                              onClick={() => onEdit(subSectionKey)}
                              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600
                                         text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700
                                         transform hover:scale-105 transition-all duration-300 shadow-lg"
                            >
                              <IoAdd className="w-4 h-4" />
                              <span>Add {title}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Progress Indicator Component
    const ProgressIndicator = () => {
        const percentage = (completionStats.completed / completionStats.total) * 100;

        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Profile Completion</h3>
                    <span className="text-sm font-medium text-gray-600">
                        {completionStats.completed}/{completionStats.total} Documents
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{percentage.toFixed(0)}% Complete</span>
                    {percentage === 100 && (
                        <span className="text-green-600 font-semibold flex items-center">
                            <IoCheckmarkCircle className="w-4 h-4 mr-1" />
                            All Set!
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const filteredSections = Object.keys(documentConfig).filter(key =>
        documentConfig[key].title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        documentConfig[key].description.toLowerCase().includes(searchFilter.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <IoDocumentText className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Documents</h2>
                        <p className="text-gray-600">Fetching your identity information securely...</p>
                        <div className="flex justify-center space-x-2 mt-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`}
                                     style={{ animationDelay: `${i * 0.2}s` }}></div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
                    {/* Enhanced Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600
                                         rounded-2xl text-white text-2xl mb-6 shadow-xl">
                            <IoDocumentText />
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                            Identity Documents Hub
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Manage all your identity documents in one secure, organized location with enterprise-grade security.
                        </p>
                    </div>

                    {/* Stats and Search Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                        <div className="lg:col-span-2">
                            <ProgressIndicator />
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    className="w-full px-5 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-500
                                                focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                                />
                                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Documents Grid */}
                    <div className="space-y-8">
                        {loading ? (
                            [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
                        ) : (
                            filteredSections.map(key => (
                                <IdentitySubSection
                                    key={key}
                                    title={documentConfig[key].title}
                                    data={identityData[key]}
                                    onEdit={openEditSection}
                                    subSectionKey={key}
                                />
                            ))
                        )}

                        {filteredSections.length === 0 && searchFilter && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">No documents found</h3>
                                <p className="text-gray-500">Try adjusting your search terms</p>
                            </div>
                        )}
                    </div>

                    {renderEditModal()}
                </div>
            )}

            {/* Custom Styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateX(-10px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-slideUp { animation: slideUp 0.4s ease-out; }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}

export default Document;