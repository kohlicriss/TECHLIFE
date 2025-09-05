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

// Document type configurations with icons and colors (enhanced for dark mode)
const documentConfig = {
    aadhaar: {
        icon: <IoDocumentText />,
        color: 'from-blue-500 to-blue-700',
        bgColor: 'bg-blue-50',
        darkBgColor: 'bg-blue-900/20',
        borderColor: 'border-blue-200',
        darkBorderColor: 'border-blue-700',
        textColor: 'text-blue-700',
        darkTextColor: 'text-blue-400',
        title: 'Aadhaar Card',
        description: 'Government issued identity document'
    },
    pan: {
        icon: <IoDocumentText />,
        color: 'from-green-500 to-green-700',
        bgColor: 'bg-green-50',
        darkBgColor: 'bg-green-900/20',
        borderColor: 'border-green-200',
        darkBorderColor: 'border-green-700',
        textColor: 'text-green-700',
        darkTextColor: 'text-green-400',
        title: 'PAN Card',
        description: 'Permanent Account Number for taxation'
    },
    drivingLicense: {
        icon: <IoDocumentText />,
        color: 'from-orange-500 to-orange-700',
        bgColor: 'bg-orange-50',
        darkBgColor: 'bg-orange-900/20',
        borderColor: 'border-orange-200',
        darkBorderColor: 'border-orange-700',
        textColor: 'text-orange-700',
        darkTextColor: 'text-orange-400',
        title: 'Driving License',
        description: 'Valid driving permit document'
    },
    passport: {
        icon: <IoDocumentText />,
        color: 'from-purple-500 to-purple-700',
        bgColor: 'bg-purple-50',
        darkBgColor: 'bg-purple-900/20',
        borderColor: 'border-purple-200',
        darkBorderColor: 'border-purple-700',
        textColor: 'text-purple-700',
        darkTextColor: 'text-purple-400',
        title: 'Passport',
        description: 'International travel document'
    },
    voter: {
        icon: <IoDocumentText />,
        color: 'from-red-500 to-red-700',
        bgColor: 'bg-red-50',
        darkBgColor: 'bg-red-900/20',
        borderColor: 'border-red-200',
        darkBorderColor: 'border-red-700',
        textColor: 'text-red-700',
        darkTextColor: 'text-red-400',
        title: 'Voter ID Card',
        description: 'Electoral identity verification'
    },
};

const Document = () => {
    const [editingSection, setEditingSection] = useState(null);
    const [identityData, setIdentityData] = useState({});
    const [editingData, setEditingData] = useState({});
    const { empID } = useParams();
    const { theme } = useContext(Context);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [searchFilter, setSearchFilter] = useState('');
    const [completionStats, setCompletionStats] = useState({ completed: 0, total: 5 });

    // Validation Functions (keeping the same logic)
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

                const data = {
                    aadhaar: aadhaarRes.data,
                    pan: panRes.data,
                    drivingLicense: drivingRes.data,
                    passport: passportRes.data,
                    voter: voterRes.data,
                };

                setIdentityData(data);

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
            const validationErrors = validateFormData(subSection, editingData);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            const existingData = identityData[subSection];
            const method = existingData ? 'put' : 'post';
            const formData = new FormData();

            const filePartNames = {
                aadhaar: 'aadhaarImage', 
                pan: 'panImage', 
                drivingLicense: 'licenseImage',
                passport: 'passportImage', 
                voter: 'voterImage'
            };

            const dtoPartNames = {
                aadhaar: 'aadhaar', 
                pan: 'panDTO',
                drivingLicense: 'drivingLicense',
                passport: 'passportDetails', 
                voter: 'voterDTO'
            };

            const fileInputNames = {
                aadhaar: 'aadhaarImage',
                pan: 'panImage',
                drivingLicense: 'licenseImage',
                passport: 'passportImage',
                voter: 'uploadVoter'
            };
            
            const fileInputField = fileInputNames[subSection];
            const file = editingData[fileInputField];
            
            if (file && file instanceof File) {
                const backendFilePartName = filePartNames[subSection];
                formData.append(backendFilePartName, file);
            }
            
            const dto = { ...editingData };
            delete dto[fileInputField];

            const backendDtoPartName = dtoPartNames[subSection];
            formData.append(backendDtoPartName, new Blob([JSON.stringify(dto)], { type: "application/json" }));

            let url;
            switch(subSection) {
                case 'aadhaar': url = `/employee/${method === 'put' ? `${empID}/aadhaar` : `aadhaar/${empID}`}`; break;
                case 'pan': url = `/employee/${empID}/pan`; break;
                case 'drivingLicense': url = `/employee/${method === 'put' ? `${empID}/driving` : `driving/license/${empID}`}`; break;
                case 'passport': url = `/employee/${method === 'put' ? `${empID}/passport` : `passport/details/${empID}`}`; break;
                case 'voter': url = `/employee/${empID}/voter`; break;
                default: throw new Error("Invalid subsection for URL");
            }

            const response = await publicinfoApi[method](url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log(`Update for ${subSection} successful:`, response.data);
            setEditingSection(null);
            setErrors({});

            const getUrlKey = subSection === 'drivingLicense' ? 'driving' : subSection;
            const updatedIdentityData = await publicinfoApi.get(`employee/${empID}/${getUrlKey}`);
            setIdentityData(prev => ({...prev, [subSection]: updatedIdentityData.data}));
            
            const newData = {...identityData, [subSection]: updatedIdentityData.data};
            const completed = Object.values(newData).filter(Boolean).length;
            setCompletionStats({ completed, total: 5 });

        } catch (error) {
            console.error(`Update for ${subSection} failed:`, error);
            if (error.response) {
                const { status, data } = error.response;
                if (status === 400) {
                     if (data && typeof data === 'object' && !data.timestamp) {
                        setErrors(data);
                    } else {
                        const message = (data && data.message) ? data.message : "Validation failed. Please check your input.";
                        setErrors({ general: message });
                    }
                } else {
                    setErrors({ general: "An unexpected error occurred. Please try again." });
                }
            } else {
                setErrors({ general: "Network error. Please check your internet connection." });
            }
        }
    };

    // Skeleton Loading Component
    const SkeletonCard = () => (
        <div className={`border rounded-2xl shadow-sm overflow-hidden animate-pulse ${
            theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
        }`}>
            <div className={`p-6 border-b ${
                theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-gray-100 border-gray-200'
            }`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl ${
                            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                        }`}></div>
                        <div>
                            <div className={`h-5 rounded w-32 mb-2 ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                            }`}></div>
                            <div className={`h-3 rounded w-48 ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                            }`}></div>
                        </div>
                    </div>
                    <div className={`h-9 rounded-lg w-20 ${
                        theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                    }`}></div>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`p-4 rounded-xl ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        }`}>
                            <div className={`h-3 rounded w-20 mb-2 ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                            }`}></div>
                            <div className={`h-4 rounded w-32 ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                            }`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderField = (label, name, type = "text", required = false, options = [], isDisabled = false) => {
        const isError = errors[name];
        const fieldValue = editingData[name] || "";

        const handleLocalFieldChange = (value) => {
            handleEditFieldChange(name, value);
            if (name === 'panNumber' && value) {
                if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
                    setErrors(prev => ({ ...prev, [name]: "PAN format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)" }));
                }
            } else if (name === 'aadhaarNumber' && value) {
                if (!/^[2-9]{1}[0-9]{11}$/.test(value)) {
                    setErrors(prev => ({ ...prev, [name]: "Aadhaar must be 12 digits starting with 2-9" }));
                }
            } else if (name === 'voterIdNumber' && value) {
                if (!/^[A-Z]{3}[0-9]{7}$/.test(value)) {
                    setErrors(prev => ({ ...prev, [name]: "Voter ID format: 3 letters + 7 digits (e.g., ABC1234567)" }));
                }
            }
        };

        return (
            <div className="group relative" key={name}>
                <label className={`block text-sm font-semibold mb-3 flex items-center ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                    {label}
                    {required && <span className="text-red-500 ml-1 text-base">*</span>}
                    {isDisabled && (
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}>
                            Read Only
                        </span>
                    )}
                </label>

                {type === "select" ? (
                    <div className="relative">
                        <select
                            value={fieldValue}
                            onChange={(e) => handleLocalFieldChange(e.target.value)}
                            className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300 appearance-none
                                focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                                ${isError 
                                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                    : theme === 'dark'
                                    ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                    : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                                }
                                ${isDisabled ? theme === 'dark' ? 'bg-gray-800 cursor-not-allowed opacity-60' : 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
                            disabled={isDisabled}
                        >
                            <option value="">Choose {label}</option>
                            {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                ) : type === "date" ? (
                    <input
                        type="date"
                        value={fieldValue}
                        onChange={(e) => handleLocalFieldChange(e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300
                            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                            ${isError 
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                : theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                            }
                            ${isDisabled ? theme === 'dark' ? 'bg-gray-800 cursor-not-allowed opacity-60' : 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
                        disabled={isDisabled}
                    />
                ) : type === "file" ? (
                    <div className={`relative border-2 border-dashed rounded-xl transition-all duration-300
                        ${isError 
                            ? 'border-red-300 bg-red-50' 
                            : theme === 'dark'
                            ? 'border-gray-600 bg-gray-800 hover:border-blue-400 hover:bg-blue-900/20'
                            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                        }
                        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                            type="file"
                            onChange={(e) => handleFileChange(name, e.target.files?.[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isDisabled}
                            accept=".jpg,.jpeg,.png,.pdf"
                        />
                        <div className="px-6 py-8 text-center">
                            <IoCloudUpload className={`mx-auto h-12 w-12 mb-4 ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                            }`} />
                            <p className={`text-sm font-medium mb-1 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Drop your file here, or <span className="text-blue-600">browse</span>
                            </p>
                            <p className={`text-xs ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`}>PNG, JPG, PDF up to 10MB</p>
                        </div>
                    </div>
                ) : type === "textarea" ? (
                    <textarea
                        value={fieldValue}
                        onChange={(e) => handleLocalFieldChange(e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300 resize-none h-32
                            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                            ${isError 
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                : theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                            }
                            ${isDisabled ? theme === 'dark' ? 'bg-gray-800 cursor-not-allowed opacity-60' : 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        required={required}
                        disabled={isDisabled}
                    />
                ) : (
                    <input
                        type={type}
                        value={fieldValue}
                        onChange={(e) => handleLocalFieldChange(e.target.value)}
                        className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-300
                            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                            ${isError 
                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                : theme === 'dark'
                                ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500 group-hover:border-blue-400'
                                : 'border-gray-200 bg-white hover:border-gray-300 group-hover:border-blue-300'
                            }
                            ${isDisabled ? theme === 'dark' ? 'bg-gray-800 cursor-not-allowed opacity-60' : 'bg-gray-50 cursor-not-allowed opacity-60' : ''}`}
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
                <div className={`rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <div className={`px-8 py-6 bg-gradient-to-r ${config.color} text-white relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="text-4xl">{config.icon}</div>
                                <div>
                                    <h2 className="text-2xl font-bold">{isUpdate ? 'Update' : 'Add'} {config.title}</h2>
                                    <p className="text-white/90 text-sm">{config.description}</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingSection(null)} className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 group" aria-label="Close">
                                <IoClose className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
                            </button>
                        </div>
                    </div>
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
                                <div className={`mt-6 p-5 border-l-4 border-red-400 rounded-r-xl animate-slideIn ${
                                    theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                                }`}>
                                    <div className="flex items-center">
                                        <IoWarning className="w-6 h-6 text-red-400 mr-3" />
                                        <p className={`font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>{errors.general}</p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                    <div className={`px-8 py-6 border-t flex justify-end space-x-4 ${
                        theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-gray-50 border-gray-200'
                    }`}>
                        <button type="button" onClick={() => setEditingSection(null)} className={`px-8 py-3 border-2 rounded-xl font-semibold transition-all duration-200 focus:ring-4 focus:ring-gray-500/20 ${
                            theme === 'dark'
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                        }`}>
                            Cancel
                        </button>
                        <button type="button" onClick={() => handleUpdate(subSection)} className={`px-10 py-3 bg-gradient-to-r ${config.color} text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:ring-4 focus:ring-blue-500/30 flex items-center space-x-2`}>
                            <IoCheckmarkCircle className="w-5 h-5" />
                            <span>{isUpdate ? 'Update Document' : 'Save Document'}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const DetailItem = ({ label, value }) => (
        <div className={`group p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
            theme === 'dark'
                ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 hover:shadow-md hover:shadow-blue-500/20'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-100 hover:shadow-md'
        }`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>{label}</span>
                    <p className={`text-sm font-semibold leading-relaxed ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                        {value || (
                            <span className={`italic ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Not provided</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );

    const DetailItemWithLink = ({ label, link }) => (
        <div className={`group p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
            theme === 'dark'
                ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-700'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
        }`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>{label}</span>
                    {link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center space-x-2 text-sm font-semibold hover:underline transition-all duration-200 group ${
                            theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-900'
                        }`}>
                            <IoEye className="w-4 h-4" />
                            <span>View Document</span>
                            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    ) : (
                        <p className={`text-sm font-medium italic ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}>Document not uploaded</p>
                    )}
                </div>
            </div>
        </div>
    );

    const IdentitySubSection = ({ title, data, onEdit, subSectionKey }) => {
        const config = documentConfig[subSectionKey];
        const hasData = !!data;
        return (
            <div className={`border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group hover:scale-[1.02] ${
                theme === 'dark'
                    ? `bg-gray-800 ${config.darkBorderColor} hover:shadow-blue-500/20`
                    : `bg-white ${config.borderColor}`
            }`}>
                <div className={`px-8 py-6 border-b-2 relative overflow-hidden ${
                    theme === 'dark'
                        ? `${config.darkBgColor} ${config.darkBorderColor}`
                        : `${config.bgColor} ${config.borderColor}`
                }`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">{config.icon}</div>
                            <div>
                                <h4 className={`text-xl font-bold flex items-center space-x-2 ${
                                    theme === 'dark' ? config.darkTextColor : config.textColor
                                }`}>
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
                                <p className={`text-sm mt-1 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>{config.description}</p>
                            </div>
                        </div>
                        <button onClick={() => onEdit(subSectionKey)} className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-blue-500/20 shadow-md hover:shadow-lg ${
                            hasData 
                                ? theme === 'dark'
                                    ? `${config.darkTextColor} bg-gray-700 border-2 ${config.darkBorderColor} hover:bg-gray-600`
                                    : `${config.textColor} bg-white border-2 ${config.borderColor} hover:bg-gray-50`
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                        }`}>
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
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                                theme === 'dark' ? config.darkBgColor : config.bgColor
                            }`}>
                                <div className={`text-3xl opacity-50 ${
                                    theme === 'dark' ? config.darkTextColor : config.textColor
                                }`}>{config.icon}</div>
                            </div>
                            <h3 className={`text-lg font-semibold mb-2 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}>No {title} Added</h3>
                            <p className={`text-sm mb-6 max-w-sm mx-auto ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>Add your {title.toLowerCase()} information to complete your profile and enhance security.</p>
                            <button onClick={() => onEdit(subSectionKey)} className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                                <IoAdd className="w-4 h-4" />
                                <span>Add {title}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const ProgressIndicator = () => {
        const percentage = (completionStats.completed / completionStats.total) * 100;
        return (
            <div className={`rounded-2xl p-6 shadow-lg border ${
                theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
            }`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>Profile Completion</h3>
                    <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{completionStats.completed}/{completionStats.total} Documents</span>
                </div>
                <div className={`w-full rounded-full h-3 mb-4 overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-700 ease-out" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="flex justify-between text-sm">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{percentage.toFixed(0)}% Complete</span>
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
        <div className={`min-h-screen ${
            theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
                : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        }`}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <IoDocumentText className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>
                        <h2 className={`text-2xl font-bold mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>Loading Your Documents</h2>
                        <p className={`${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>Fetching your identity information securely...</p>
                        <div className="flex justify-center space-x-2 mt-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                        <div className="lg:col-span-2">
                            <ProgressIndicator />
                        </div>
                        <div className={`rounded-2xl p-6 shadow-lg border ${
                            theme === 'dark' 
                                ? 'bg-gray-800 border-gray-700' 
                                : 'bg-white border-gray-200'
                        }`}>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search documents..." 
                                    value={searchFilter} 
                                    onChange={(e) => setSearchFilter(e.target.value)} 
                                    className={`w-full px-5 py-4 pl-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 ${
                                        theme === 'dark'
                                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500'
                                            : 'border-gray-200 bg-white text-black placeholder-gray-500 focus:border-blue-500'
                                    }`} 
                                />
                                <svg className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {filteredSections.map(key => (
                            <IdentitySubSection 
                                key={key} 
                                title={documentConfig[key].title} 
                                data={identityData[key]} 
                                onEdit={openEditSection} 
                                subSectionKey={key} 
                            />
                        ))}
                        {filteredSections.length === 0 && searchFilter && (
                            <div className="text-center py-16">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                                }`}>
                                    <svg className={`w-8 h-8 ${
                                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className={`text-lg font-semibold mb-2 ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                                }`}>No documents found</h3>
                                <p className={`${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                }`}>Try adjusting your search terms</p>
                            </div>
                        )}
                    </div>

                    {renderEditModal()}
                </div>
            )}
            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideIn { from { transform: translateX(-10px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-slideUp { animation: slideUp 0.4s ease-out; }
                .animate-slideIn { animation: slideIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}

export default Document;
