// import React, { useState, useEffect, useRef } from 'react';
// import { FaFileAlt } from 'react-icons/fa';
// import { IoClose } from 'react-icons/io5';

// const months = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December"
// ];
// const years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));

// const identityDocs = [
//   { name: 'Aadhaar Card', status: 'MANDATORY' },
//   { name: 'Pan Card', status: 'MANDATORY' },
//   { name: 'Voter Id Card', status: 'MANDATORY' },
//   { name: 'Driving License', status: 'MANDATORY' },
//   { name: 'Passport', status: 'MANDATORY' }
// ];

// // --- Styled Upload ---
// function FileUploadZone({ label, accept, onFile, fileName, error, link, required }) {
//   const inputRef = useRef();
//   return (
//     <div className="mb-4">
//       <label className="block mb-1 font-medium">{label} {required && <span className="text-red-500">*</span>}</label>
//       <div
//         className={`
//           flex flex-col items-center justify-center h-28 rounded-lg
//           border-2 border-dashed ${error ? 'border-red-500 bg-red-50' : 'border-blue-400 bg-blue-50'}
//           hover:bg-blue-100 transition-colors cursor-pointer
//           text-blue-500 font-semibold relative
//         `}
//         onClick={(e) => {
//           if (e.target.tagName !== "INPUT") inputRef.current?.click();
//         }}
//       >
//         <input
//           ref={inputRef}
//           type="file"
//           accept={accept}
//           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//           onChange={onFile}
//         />
//         {!fileName && (
//           <span className="flex flex-col items-center pointer-events-none">
//             <svg className="w-7 h-7 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
//             </svg>
//             <span>{label}</span>
//             <span className="text-xs text-gray-600">Click or drag file here (.png, .jpg, .jpeg, .pdf)</span>
//           </span>
//         )}
//         {fileName && link && (
//           <span>
//             <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{fileName}</a>
//           </span>
//         )}
//         {fileName && !link && (
//           <span className="block text-green-700">{fileName}</span>
//         )}
//       </div>
//       {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
//     </div>
//   );
// }

// export default function Documents() {
//   // Section states
//   const [identityData, setIdentityData] = useState({});
//   const [experienceList, setExperienceList] = useState([]);
//   const [degreeList, setDegreeList] = useState([]);
//   const [achievementList, setAchievementList] = useState([]);
//   // Modal state
//   const [popup, setPopup] = useState(null); // { type, docName/index }
//   const [form, setForm] = useState({});
//   const [formErrors, setFormErrors] = useState({});

//   // Fetch documents data
//   useEffect(() => {
//     const fetchDocuments = async () => {
//       try {
//         const response = await employeeService.getDocuments();
//         const { identityDocs, experienceDocs, degreeDocs, achievementDocs } = response.data;
//         setIdentityData(identityDocs || {});
//         setExperienceList(experienceDocs || []);
//         setDegreeList(degreeDocs || []);
//         setAchievementList(achievementDocs || []);
//       } catch (error) {
//         console.error('Error fetching documents:', error);
//       }
//     };
//     fetchDocuments();
//   }, []);

//   // API sync
//   const updateDocument = async (type, data) => {
//     try {
//       if (type === 'identity') {
//         await employeeService.uploadDocument('identity', data);
//       } else if (type === 'experience') {
//         await employeeService.uploadDocument('experience', data);
//       } else if (type === 'degree') {
//         await employeeService.uploadDocument('degree', data);
//       } else if (type === 'achievement') {
//         await employeeService.uploadDocument('achievement', data);
//       }
//     } catch (error) {
//       console.error('Error updating document:', error);
//       throw error;
//     }
//   };

//   useEffect(() => {
//     if (!popup) return;
//     if (popup.type === "experience" && popup.index !== undefined) setForm(experienceList[popup.index] || {});
//     else if (popup.type === "degree" && popup.index !== undefined) setForm(degreeList[popup.index] || {});
//     else if (popup.type === "achievement" && popup.index !== undefined) setForm(achievementList[popup.index] || {});
//     else if (popup.type === "identity") setForm(identityData[popup.docName] || {});
//     else setForm({});
//     setFormErrors({});
//   }, [popup]);

//   // --- Aadhaar Card Form Special ---
//   function renderAadhaarCardPopup() {
//     return (
//       <Modal title="Upload Aadhaar Card Details" onClose={() => setPopup(null)}>
//         <form onSubmit={e => {
//           e.preventDefault();
//           let errors = {};
//           if (!form.fileName || !form.fileData) errors.file = "Aadhaar file required";
//           if (!form.aadhaarNumber) errors.aadhaarNumber = "Aadhaar Number required";
//           if (!form.enrollmentNumber) errors.enrollmentNumber = "Enrollment Number required";
//           if (!form.dob) errors.dob = "Date of Birth required";
//           if (!form.name) errors.name = "Full Name required";
//           if (!form.address) errors.address = "Address required";
//           if (!form.gender) errors.gender = "Gender required";
//           setFormErrors(errors);
//           if (Object.keys(errors).length) return;
//           setIdentityData(prev => ({
//             ...prev,
//             ["Aadhaar Card"]: { ...form }
//           }));
//           setForm({});
//           setFormErrors({});
//           setPopup(null);
//         }}>
//           <div className="mb-4">
//             <div className="flex items-center gap-2 mb-2">
//               <img src="https://img.icons8.com/color/32/india.png" alt="India" className="h-6 inline" />
//               <span className="font-semibold text-base">Aadhaar Card</span>
//             </div>
//             <FileUploadZone
//               label="Upload Aadhaar Card"
//               accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
//               required
//               error={formErrors.file}
//               fileName={form.fileName}
//               link={form.fileData}
//               onFile={e => {
//                 const file = e.target.files?.[0];
//                 if (!file) return;
//                 const reader = new FileReader();
//                 reader.onload = ev => setForm(f => ({
//                   ...f,
//                   fileName: file.name,
//                   fileType: file.type,
//                   fileData: ev.target.result,
//                 }));
//                 reader.readAsDataURL(file);
//               }}
//             />
//             <div className="text-xs text-gray-500 mb-3 mt-1">
//               Supported file types are <b>.png, .jpg, .jpeg, .doc, .docx, .pdf, .xlsx, .xls</b>. Max file size supported is 20 MB
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-5">
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Aadhaar Number<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.aadhaarNumber ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Aadhaar Number"
//                 value={form.aadhaarNumber || ""}
//                 onChange={e => setForm(f => ({ ...f, aadhaarNumber: e.target.value }))}
//               />
//               {formErrors.aadhaarNumber && <div className="text-red-500 text-xs">{formErrors.aadhaarNumber}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Enrollment Number<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.enrollmentNumber ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Enter Enrollment Number"
//                 value={form.enrollmentNumber || ""}
//                 onChange={e => setForm(f => ({ ...f, enrollmentNumber: e.target.value }))}
//               />
//               {formErrors.enrollmentNumber && <div className="text-red-500 text-xs">{formErrors.enrollmentNumber}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Date of Birth<span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 className={`w-full border px-3 py-2 rounded ${formErrors.dob ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Date of Birth"
//                 value={form.dob || ""}
//                 onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
//               />
//               {formErrors.dob && <div className="text-red-500 text-xs">{formErrors.dob}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Name<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Full Name"
//                 value={form.name || ""}
//                 onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
//               />
//               {formErrors.name && <div className="text-red-500 text-xs">{formErrors.name}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Address<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.address ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Your complete residential address"
//                 value={form.address || ""}
//                 onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
//               />
//               {formErrors.address && <div className="text-red-500 text-xs">{formErrors.address}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Gender<span className="text-red-500">*</span>
//               </label>
//               <select
//                 className={`w-full border px-3 py-2 rounded ${formErrors.gender ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 value={form.gender || ""}
//                 onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
//               >
//                 <option value="">Select</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//                 <option value="Other">Other</option>
//               </select>
//               {formErrors.gender && <div className="text-red-500 text-xs">{formErrors.gender}</div>}
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 mt-8">
//             <button type="button" onClick={() => { setPopup(null); setForm({}); setFormErrors({}); }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md">Cancel</button>
//             <button type="submit" className="px-4 py-2 bg-purple-700 text-white rounded-md">Save</button>
//           </div>
//         </form>
//       </Modal>
//     );
//   }

//   // --- Identity Modal (styled upload + fields, no preview) ---
//   function renderIdentityPopup(docName) {
//     if (docName === 'Aadhaar Card') return renderAadhaarCardPopup();
//     if (docName === 'Voter Id Card') return renderVoterIdCardPopup();
//     if (docName === 'Pan Card') return renderPanCardPopup();
//     if (docName === 'Driving License') return renderDrivingLicensePopup();
//     if (docName === 'Passport') return renderPassportPopup();

//   // --- Passport Form Special ---
//   function renderPassportPopup() {
//     return (
//       <Modal title="Upload Passport Details" onClose={() => setPopup(null)}>
//         <form onSubmit={e => {
//           e.preventDefault();
//           let errors = {};
//           if (!form.fileName || !form.fileData) errors.file = "Passport file required";
//           if (!form.countryCode) errors.countryCode = "Country Code required";
//           if (!form.passportType) errors.passportType = "Passport Type required";
//           if (!form.passportNumber) errors.passportNumber = "Passport Number required";
//           if (!form.name) errors.name = "Full Name required";
//           if (!form.gender) errors.gender = "Gender required";
//           if (!form.dob) errors.dob = "Date of Birth required";
//           if (!form.placeOfBirth) errors.placeOfBirth = "Place of Birth required";
//           if (!form.issueDate) errors.issueDate = "Issue Date required";
//           if (!form.placeOfIssue) errors.placeOfIssue = "Place of Issue required";
//           if (!form.expiryDate) errors.expiryDate = "Expiry Date required";
//           if (!form.address) errors.address = "Address required";
//           setFormErrors(errors);
//           if (Object.keys(errors).length) return;
//           setIdentityData(prev => ({
//             ...prev,
//             ["Passport"]: { ...form }
//           }));
//           setForm({});
//           setFormErrors({});
//           setPopup(null);
//         }}>
//           <div className="mb-4">
//             <div className="flex items-center gap-2 mb-2">
//               <img src="https://img.icons8.com/color/32/india.png" alt="India" className="h-6 inline" />
//               <span className="font-semibold text-base">Passport</span>
//             </div>
//             <FileUploadZone
//               label="Upload Passport"
//               accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
//               required
//               error={formErrors.file}
//               fileName={form.fileName}
//               link={form.fileData}
//               onFile={e => {
//                 const file = e.target.files?.[0];
//                 if (!file) return;
//                 const reader = new FileReader();
//                 reader.onload = ev => setForm(f => ({
//                   ...f,
//                   fileName: file.name,
//                   fileType: file.type,
//                   fileData: ev.target.result,
//                 }));
//                 reader.readAsDataURL(file);
//               }}
//             />
//             <div className="text-xs text-gray-500 mb-3 mt-1">
//               Supported file types are <b>.png, .jpg, .jpeg, .doc, .docx, .pdf, .xlsx, .xls</b>. Max file size supported is 20 MB
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-5">
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Country Code<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.countryCode ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Country Code"
//                 value={form.countryCode || ""}
//                 onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))}
//               />
//               {formErrors.countryCode && <div className="text-red-500 text-xs">{formErrors.countryCode}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Passport Type<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.passportType ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Passport type"
//                 value={form.passportType || ""}
//                 onChange={e => setForm(f => ({ ...f, passportType: e.target.value }))}
//               />
//               {formErrors.passportType && <div className="text-red-500 text-xs">{formErrors.passportType}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Passport Number<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.passportNumber ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Passport Number"
//                 value={form.passportNumber || ""}
//                 onChange={e => setForm(f => ({ ...f, passportNumber: e.target.value }))}
//               />
//               {formErrors.passportNumber && <div className="text-red-500 text-xs">{formErrors.passportNumber}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Full Name<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Full Name"
//                 value={form.name || ""}
//                 onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
//               />
//               {formErrors.name && <div className="text-red-500 text-xs">{formErrors.name}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Gender<span className="text-red-500">*</span>
//               </label>
//               <select
//                 className={`w-full border px-3 py-2 rounded ${formErrors.gender ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 value={form.gender || ""}
//                 onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
//               >
//                 <option value="">Select</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//                 <option value="Other">Other</option>
//               </select>
//               {formErrors.gender && <div className="text-red-500 text-xs">{formErrors.gender}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Date of Birth<span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 className={`w-full border px-3 py-2 rounded ${formErrors.dob ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 value={form.dob || ""}
//                 onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
//               />
//               {formErrors.dob && <div className="text-red-500 text-xs">{formErrors.dob}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Place of Birth<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.placeOfBirth ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Birth Place"
//                 value={form.placeOfBirth || ""}
//                 onChange={e => setForm(f => ({ ...f, placeOfBirth: e.target.value }))}
//               />
//               {formErrors.placeOfBirth && <div className="text-red-500 text-xs">{formErrors.placeOfBirth}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Date of Issue<span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 className={`w-full border px-3 py-2 rounded ${formErrors.issueDate ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 value={form.issueDate || ""}
//                 onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))}
//               />
//               {formErrors.issueDate && <div className="text-red-500 text-xs">{formErrors.issueDate}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Place of Issue<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.placeOfIssue ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Place Of Issue"
//                 value={form.placeOfIssue || ""}
//                 onChange={e => setForm(f => ({ ...f, placeOfIssue: e.target.value }))}
//               />
//               {formErrors.placeOfIssue && <div className="text-red-500 text-xs">{formErrors.placeOfIssue}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Expires On<span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 className={`w-full border px-3 py-2 rounded ${formErrors.expiryDate ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 value={form.expiryDate || ""}
//                 onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
//               />
//               {formErrors.expiryDate && <div className="text-red-500 text-xs">{formErrors.expiryDate}</div>}
//             </div>
//             <div className="col-span-2">
//               <label className="block font-medium text-gray-800 mb-1">
//                 Address<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.address ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Your complete residential address"
//                 value={form.address || ""}
//                 onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
//               />
//               {formErrors.address && <div className="text-red-500 text-xs">{formErrors.address}</div>}
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 mt-8">
//             <button type="button" onClick={() => { setPopup(null); setForm({}); setFormErrors({}); }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md">Cancel</button>
//             <button type="submit" className="px-4 py-2 bg-purple-700 text-white rounded-md">Save</button>
//           </div>
//         </form>
//       </Modal>
//     );
//   }

//   // --- Driving License Form Special ---
//   function renderDrivingLicensePopup() {
//     return (
//       <Modal title="Upload Driving License Details" onClose={() => setPopup(null)}>
//         <form onSubmit={e => {
//           e.preventDefault();
//           let errors = {};
//           if (!form.fileName || !form.fileData) errors.file = "Driving License file required";
//           if (!form.licenseNumber) errors.licenseNumber = "License Number required";
//           if (!form.name) errors.name = "Full Name required";
//           if (!form.fatherName) errors.fatherName = "Father's Name required";
//           if (!form.bloodGroup) errors.bloodGroup = "Blood Group required";
//           if (!form.dob) errors.dob = "Date of Birth required";
//           if (!form.issueDate) errors.issueDate = "Issue Date required";
//           if (!form.expiryDate) errors.expiryDate = "Expiry Date required";
//           if (!form.address) errors.address = "Address required";
//           setFormErrors(errors);
//           if (Object.keys(errors).length) return;
//           setIdentityData(prev => ({
//             ...prev,
//             ["Driving License"]: { ...form }
//           }));
//           setForm({});
//           setFormErrors({});
//           setPopup(null);
//         }}>
//           <div className="mb-4">
//             <div className="flex items-center gap-2 mb-2">
//               <img src="https://img.icons8.com/color/32/india.png" alt="India" className="h-6 inline" />
//               <span className="font-semibold text-base">Driving License</span>
//             </div>
//             <FileUploadZone
//               label="Upload Driving License"
//               accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
//               required
//               error={formErrors.file}
//               fileName={form.fileName}
//               link={form.fileData}
//               onFile={e => {
//                 const file = e.target.files?.[0];
//                 if (!file) return;
//                 const reader = new FileReader();
//                 reader.onload = ev => setForm(f => ({
//                   ...f,
//                   fileName: file.name,
//                   fileType: file.type,
//                   fileData: ev.target.result,
//                 }));
//                 reader.readAsDataURL(file);
//               }}
//             />
//             <div className="text-xs text-gray-500 mb-3 mt-1">
//               Supported file types are <b>.png, .jpg, .jpeg, .doc, .docx, .pdf, .xlsx, .xls</b>. Max file size supported is 20 MB
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-5">
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 License Number<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.licenseNumber ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Enter License Number"
//                 value={form.licenseNumber || ""}
//                 onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
//               />
//               {formErrors.licenseNumber && <div className="text-red-500 text-xs">{formErrors.licenseNumber}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Full Name<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Enter Full Name"
//                 value={form.name || ""}
//                 onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
//               />
//               {formErrors.name && <div className="text-red-500 text-xs">{formErrors.name}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Father's Name<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.fatherName ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Enter Father's Name"
//                 value={form.fatherName || ""}
//                 onChange={e => setForm(f => ({ ...f, fatherName: e.target.value }))}
//               />
//               {formErrors.fatherName && <div className="text-red-500 text-xs">{formErrors.fatherName}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Blood Group<span className="text-red-500">*</span>
//               </label>
//               <select
//                 className={`w-full border px-3 py-2 rounded ${formErrors.bloodGroup ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 value={form.bloodGroup || ""}
//                 onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
//               >
//                 <option value="">Select Blood Group</option>
//                 <option value="A+">A+</option>
//                 <option value="A-">A-</option>
//                 <option value="B+">B+</option>
//                 <option value="B-">B-</option>
//                 <option value="O+">O+</option>
//                 <option value="O-">O-</option>
//                 <option value="AB+">AB+</option>
//                 <option value="AB-">AB-</option>
//               </select>
//               {formErrors.bloodGroup && <div className="text-red-500 text-xs">{formErrors.bloodGroup}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Date of Birth<span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 className={`w-full border px-3 py-2 rounded ${formErrors.dob ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 value={form.dob || ""}
//                 onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
//               />
//               {formErrors.dob && <div className="text-red-500 text-xs">{formErrors.dob}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Issue Date<span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 className={`w-full border px-3 py-2 rounded ${formErrors.issueDate ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 value={form.issueDate || ""}
//                 onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))}
//               />
//               {formErrors.issueDate && <div className="text-red-500 text-xs">{formErrors.issueDate}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Expiry Date<span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 className={`w-full border px-3 py-2 rounded ${formErrors.expiryDate ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 value={form.expiryDate || ""}
//                 onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
//               />
//               {formErrors.expiryDate && <div className="text-red-500 text-xs">{formErrors.expiryDate}</div>}
//             </div>
//             <div className="col-span-2">
//               <label className="block font-medium text-gray-800 mb-1">
//                 Address<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.address ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Your complete residential address"
//                 value={form.address || ""}
//                 onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
//               />
//               {formErrors.address && <div className="text-red-500 text-xs">{formErrors.address}</div>}
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 mt-8">
//             <button type="button" onClick={() => { setPopup(null); setForm({}); setFormErrors({}); }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md">Cancel</button>
//             <button type="submit" className="px-4 py-2 bg-purple-700 text-white rounded-md">Save</button>
//           </div>
//         </form>
//       </Modal>
//     );
//   }

//   // --- Pan Card Form Special ---
//   function renderPanCardPopup() {
//     return (
//       <Modal title="Upload Pan Card Details" onClose={() => setPopup(null)}>
//         <form onSubmit={e => {
//           e.preventDefault();
//           let errors = {};
//           if (!form.fileName || !form.fileData) errors.file = "Pan Card file required";
//           if (!form.panNumber) errors.panNumber = "PAN Number required";
//           if (!form.name) errors.name = "Full Name required";
//           if (!form.parentName) errors.parentName = "Parent's Name required";
//           if (!form.dob) errors.dob = "Date of Birth required";
//           setFormErrors(errors);
//           if (Object.keys(errors).length) return;
//           setIdentityData(prev => ({
//             ...prev,
//             ["Pan Card"]: { ...form }
//           }));
//           setForm({});
//           setFormErrors({});
//           setPopup(null);
//         }}>
//           <div className="mb-4">
//             <div className="flex items-center gap-2 mb-2">
//               <img src="https://img.icons8.com/color/32/india.png" alt="India" className="h-6 inline" />
//               <span className="font-semibold text-base">Pan Card</span>
//             </div>
//             <FileUploadZone
//               label="Upload Pan Card"
//               accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
//               required
//               error={formErrors.file}
//               fileName={form.fileName}
//               link={form.fileData}
//               onFile={e => {
//                 const file = e.target.files?.[0];
//                 if (!file) return;
//                 const reader = new FileReader();
//                 reader.onload = ev => setForm(f => ({
//                   ...f,
//                   fileName: file.name,
//                   fileType: file.type,
//                   fileData: ev.target.result,
//                 }));
//                 reader.readAsDataURL(file);
//               }}
//             />
//             <div className="text-xs text-gray-500 mb-3 mt-1">
//               Supported file types are <b>.png, .jpg, .jpeg, .doc, .docx, .pdf, .xlsx, .xls</b>. Max file size supported is 20 MB
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-5">
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 PAN Number<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.panNumber ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Enter PAN Number"
//                 value={form.panNumber || ""}
//                 onChange={e => setForm(f => ({ ...f, panNumber: e.target.value.toUpperCase() }))}
//                 maxLength={10}
//               />
//               {formErrors.panNumber && <div className="text-red-500 text-xs">{formErrors.panNumber}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Full Name<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Enter Full Name"
//                 value={form.name || ""}
//                 onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
//               />
//               {formErrors.name && <div className="text-red-500 text-xs">{formErrors.name}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Parent's Name<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.parentName ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Enter Parent's Name"
//                 value={form.parentName || ""}
//                 onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))}
//               />
//               {formErrors.parentName && <div className="text-red-500 text-xs">{formErrors.parentName}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Date of Birth<span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 className={`w-full border px-3 py-2 rounded ${formErrors.dob ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 value={form.dob || ""}
//                 onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
//               />
//               {formErrors.dob && <div className="text-red-500 text-xs">{formErrors.dob}</div>}
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 mt-8">
//             <button type="button" onClick={() => { setPopup(null); setForm({}); setFormErrors({}); }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md">Cancel</button>
//             <button type="submit" className="px-4 py-2 bg-purple-700 text-white rounded-md">Save</button>
//           </div>
//         </form>
//       </Modal>
//     );
//   }

//   // --- Voter Id Card Form Special ---
//   function renderVoterIdCardPopup() {
//     return (
//       <Modal title="Upload Voter Id Card Details" onClose={() => setPopup(null)}>
//         <form onSubmit={e => {
//           e.preventDefault();
//           let errors = {};
//           if (!form.fileName || !form.fileData) errors.file = "Voter Id file required";
//           if (!form.voterIdNumber) errors.voterIdNumber = "Voter ID Number required";
//           if (!form.name) errors.name = "Full Name required";
//           if (!form.parentName) errors.parentName = "Parent's / Spouse's Name required";
//           if (!form.gender) errors.gender = "Gender required";
//           if (!form.dob) errors.dob = "Date of Birth required";
//           if (!form.address) errors.address = "Address required";
//           if (!form.issuedDate) errors.issuedDate = "Issued Date required";
//           setFormErrors(errors);
//           if (Object.keys(errors).length) return;
//           setIdentityData(prev => ({
//             ...prev,
//             ["Voter Id Card"]: { ...form }
//           }));
//           setForm({});
//           setFormErrors({});
//           setPopup(null);
//         }}>
//           <div className="mb-4">
//             <div className="flex items-center gap-2 mb-2">
//               <img src="https://img.icons8.com/color/32/india.png" alt="India" className="h-6 inline" />
//               <span className="font-semibold text-base">Voter Id Card</span>
//             </div>
//             <FileUploadZone
//               label="Upload Voter Id Card"
//               accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
//               required
//               error={formErrors.file}
//               fileName={form.fileName}
//               link={form.fileData}
//               onFile={e => {
//                 const file = e.target.files?.[0];
//                 if (!file) return;
//                 const reader = new FileReader();
//                 reader.onload = ev => setForm(f => ({
//                   ...f,
//                   fileName: file.name,
//                   fileType: file.type,
//                   fileData: ev.target.result,
//                 }));
//                 reader.readAsDataURL(file);
//               }}
//             />
//             <div className="text-xs text-gray-500 mb-3 mt-1">
//               Supported file types are <b>.png, .jpg, .jpeg, .doc, .docx, .pdf, .xlsx, .xls</b>. Max file size supported is 20 MB
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-5">
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Voter ID Number<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.voterIdNumber ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Voter ID Number"
//                 value={form.voterIdNumber || ""}
//                 onChange={e => setForm(f => ({ ...f, voterIdNumber: e.target.value }))}
//               />
//               {formErrors.voterIdNumber && <div className="text-red-500 text-xs">{formErrors.voterIdNumber}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Name<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Full Name"
//                 value={form.name || ""}
//                 onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
//               />
//               {formErrors.name && <div className="text-red-500 text-xs">{formErrors.name}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Parent's / Spouse's Name<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.parentName ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Enter Parent's / Spouse's Name"
//                 value={form.parentName || ""}
//                 onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))}
//               />
//               {formErrors.parentName && <div className="text-red-500 text-xs">{formErrors.parentName}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Gender<span className="text-red-500">*</span>
//               </label>
//               <select
//                 className={`w-full border px-3 py-2 rounded ${formErrors.gender ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 value={form.gender || ""}
//                 onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
//               >
//                 <option value="">Select</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//                 <option value="Other">Other</option>
//               </select>
//               {formErrors.gender && <div className="text-red-500 text-xs">{formErrors.gender}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Date of Birth<span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 className={`w-full border px-3 py-2 rounded ${formErrors.dob ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Date of Birth"
//                 value={form.dob || ""}
//                 onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
//               />
//               {formErrors.dob && <div className="text-red-500 text-xs">{formErrors.dob}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Address<span className="text-red-500">*</span>
//               </label>
//               <input
//                 className={`w-full border px-3 py-2 rounded ${formErrors.address ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Your complete residential address"
//                 value={form.address || ""}
//                 onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
//               />
//               {formErrors.address && <div className="text-red-500 text-xs">{formErrors.address}</div>}
//             </div>
//             <div>
//               <label className="block font-medium text-gray-800 mb-1">
//                 Issued Date<span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="date"
//                 className={`w-full border px-3 py-2 rounded ${formErrors.issuedDate ? "border-red-500 bg-red-50" : "border-gray-300"}`}
//                 placeholder="Issued Date"
//                 value={form.issuedDate || ""}
//                 onChange={e => setForm(f => ({ ...f, issuedDate: e.target.value }))}
//               />
//               {formErrors.issuedDate && <div className="text-red-500 text-xs">{formErrors.issuedDate}</div>}
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 mt-8">
//             <button type="button" onClick={() => { setPopup(null); setForm({}); setFormErrors({}); }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md">Cancel</button>
//             <button type="submit" className="px-4 py-2 bg-purple-700 text-white rounded-md">Save</button>
//           </div>
//         </form>
//       </Modal>
//     );
//   }

//     return (
//       <Modal title={docName} onClose={() => setPopup(null)}>
//         <form onSubmit={e => {
//           e.preventDefault();
//           let errors = {};
//           if (!form.fileName || !form.fileData) errors.file = "Please upload a file";
//           if (!form.name) errors.name = "Required";
//           if (!form.idNumber) errors.idNumber = "Required";
//           if (!form.dob) errors.dob = "Required";
//           if (!form.address) errors.address = "Required";
//           setFormErrors(errors);
//           if (Object.keys(errors).length) return;
//           setIdentityData(prev => ({
//             ...prev,
//             [docName]: { ...form }
//           }));
//           setForm({});
//           setFormErrors({});
//           setPopup(null);
//         }}>
//           <FileUploadZone
//             label={`Upload ${docName} File`}
//             accept=".pdf,.jpg,.jpeg,.png"
//             error={formErrors.file}
//             fileName={form.fileName}
//             link={form.fileData}
//             required
//             onFile={e => {
//               const file = e.target.files?.[0];
//               if (!file) return;
//               const reader = new FileReader();
//               reader.onload = ev =>
//                 setForm(f => ({
//                   ...f,
//                   fileName: file.name,
//                   fileType: file.type,
//                   fileData: ev.target.result
//                 }));
//               reader.readAsDataURL(file);
//             }}
//           />
//           <div>
//             <label className="block mb-1 text-sm font-medium">Name<span className="text-red-500">*</span></label>
//             <input className="w-full border px-2 py-1 rounded mb-1"
//               value={form.name || ""}
//               onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
//             />
//             {formErrors.name && <div className="text-red-500 text-xs mb-2">{formErrors.name}</div>}
//           </div>
//           <div>
//             <label className="block mb-1 text-sm font-medium">ID Number<span className="text-red-500">*</span></label>
//             <input className="w-full border px-2 py-1 rounded mb-1"
//               value={form.idNumber || ""}
//               onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))}
//             />
//             {formErrors.idNumber && <div className="text-red-500 text-xs mb-2">{formErrors.idNumber}</div>}
//           </div>
//           <div>
//             <label className="block mb-1 text-sm font-medium">Date of Birth<span className="text-red-500">*</span></label>
//             <input
//               type="date"
//               className="w-full border px-2 py-1 rounded mb-1"
//               value={form.dob || ""}
//               onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
//             />
//             {formErrors.dob && <div className="text-red-500 text-xs mb-2">{formErrors.dob}</div>}
//           </div>
//           <div>
//             <label className="block mb-1 text-sm font-medium">Address<span className="text-red-500">*</span></label>
//             <input className="w-full border px-2 py-1 rounded mb-1"
//               value={form.address || ""}
//               onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
//             />
//             {formErrors.address && <div className="text-red-500 text-xs mb-2">{formErrors.address}</div>}
//           </div>
//           <div className="flex justify-end gap-3 mt-8">
//             <button type="button" onClick={() => { setPopup(null); setForm({}); setFormErrors({}); }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md">Cancel</button>
//             <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
//           </div>
//         </form>
//       </Modal>
//     );
//   }

//   // --- Experience Modal ---
//   function renderExperiencePopup() {
//     const onSubmit = (e) => {
//       e.preventDefault();
//       let err = {};
//       if (!form.title) err.title = "Required";
//       if (!form.type) err.type = "Required";
//       if (!form.company) err.company = "Required";
//       if (!form.location) err.location = "Required";
//       if (!form.locationType) err.locationType = "Required";
//       if (!form.startMonth) err.startMonth = "Required";
//       if (!form.startYear) err.startYear = "Required";
//       if (!form.current) {
//         if (!form.endMonth) err.endMonth = "Required";
//         if (!form.endYear) err.endYear = "Required";
//       }
//       setFormErrors(err);
//       if (Object.keys(err).length) return;
//       let list = [...experienceList];
//       if (popup.index !== undefined) list[popup.index] = form;
//       else list.push(form);
//       setExperienceList(list);
//       setPopup(null);
//       setForm({});
//     };
//     return (
//       <Modal title={`${popup.index !== undefined ? "Edit" : "Add"} Experience`} onClose={() => setPopup(null)}>
//         <form onSubmit={onSubmit}>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="col-span-2">
//               <label className="block text-sm font-medium">Title<span className="text-red-500">*</span></label>
//               <input className="w-full border px-2 py-1 rounded" value={form.title || ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
//               {formErrors.title && <div className="text-red-500 text-xs">{formErrors.title}</div>}
//             </div>
//             <div className="col-span-2">
//               <label className="block text-sm font-medium">Employment type<span className="text-red-500">*</span></label>
//               <input className="w-full border px-2 py-1 rounded" value={form.type || ""} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} />
//               {formErrors.type && <div className="text-red-500 text-xs">{formErrors.type}</div>}
//             </div>
//             <div className="col-span-2">
//               <label className="block text-sm font-medium">Company or Organization<span className="text-red-500">*</span></label>
//               <input className="w-full border px-2 py-1 rounded" value={form.company || ""} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
//               {formErrors.company && <div className="text-red-500 text-xs">{formErrors.company}</div>}
//             </div>
//             <div className="col-span-2">
//               <label className="block text-sm font-medium">Location<span className="text-red-500">*</span></label>
//               <input className="w-full border px-2 py-1 rounded" value={form.location || ""} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
//               {formErrors.location && <div className="text-red-500 text-xs">{formErrors.location}</div>}
//             </div>
//             <div className="col-span-2">
//               <label className="block text-sm font-medium">Location Type<span className="text-red-500">*</span></label>
//               <select className="w-full border px-2 py-1 rounded" value={form.locationType || ""} onChange={e => setForm(f => ({ ...f, locationType: e.target.value }))}>
//                 <option value="">Please select</option>
//                 <option>Onsite</option>
//                 <option>Remote</option>
//                 <option>Hybrid</option>
//               </select>
//               {formErrors.locationType && <div className="text-red-500 text-xs">{formErrors.locationType}</div>}
//             </div>
//             <div className="col-span-2">
//               <label className="block text-sm font-medium">Description</label>
//               <textarea className="w-full border px-2 py-1 rounded" rows={4}
//                 value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
//             </div>
//             <div className="col-span-2 flex items-center gap-2">
//               <input type="checkbox" checked={!!form.current}
//                 onChange={e => setForm(f => ({ ...f, current: e.target.checked }))}
//                 id="exp_current_cb" />
//               <label htmlFor="exp_current_cb" className="text-sm">I am currently working in this role</label>
//             </div>
//             <div>
//               <label className="text-sm">Start Month<span className="text-red-500">*</span></label>
//               <select className="w-full border px-2 py-1 rounded" value={form.startMonth || ""} onChange={e => setForm(f => ({ ...f, startMonth: e.target.value }))}>
//                 <option value="">Select</option>
//                 {months.map(m => <option key={m}>{m}</option>)}
//               </select>
//               {formErrors.startMonth && <div className="text-red-500 text-xs">{formErrors.startMonth}</div>}
//             </div>
//             <div>
//               <label className="text-sm">Start Year<span className="text-red-500">*</span></label>
//               <select className="w-full border px-2 py-1 rounded" value={form.startYear || ""} onChange={e => setForm(f => ({ ...f, startYear: e.target.value }))}>
//                 <option value="">Select</option>
//                 {years.map(y => <option key={y}>{y}</option>)}
//               </select>
//               {formErrors.startYear && <div className="text-red-500 text-xs">{formErrors.startYear}</div>}
//             </div>
//             <div>
//               <label className="text-sm">End Month{!form.current && <span className="text-red-500">*</span>}</label>
//               <select className="w-full border px-2 py-1 rounded" value={form.endMonth || ""} onChange={e => setForm(f => ({ ...f, endMonth: e.target.value }))} disabled={!!form.current}>
//                 <option value="">Select</option>
//                 {months.map(m => <option key={m}>{m}</option>)}
//               </select>
//               {!form.current && formErrors.endMonth && <div className="text-red-500 text-xs">{formErrors.endMonth}</div>}
//             </div>
//             <div>
//               <label className="text-sm">End Year{!form.current && <span className="text-red-500">*</span>}</label>
//               <select className="w-full border px-2 py-1 rounded" value={form.endYear || ""} onChange={e => setForm(f => ({ ...f, endYear: e.target.value }))} disabled={!!form.current}>
//                 <option value="">Select</option>
//                 {years.map(y => <option key={y}>{y}</option>)}
//               </select>
//               {!form.current && formErrors.endYear && <div className="text-red-500 text-xs">{formErrors.endYear}</div>}
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 mt-8 col-span-2">
//             <button type="button" onClick={() => { setPopup(null); setForm({}); setFormErrors({}); }}
//               className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md">Cancel</button>
//             <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
//           </div>
//         </form>
//       </Modal>
//     );
//   }

//   // --- Academic Qualification Section ---
//   function renderDegreeSection() {
//     function renderDegreePopup() {
//       const onSubmit = (e) => {
//         e.preventDefault();
//         let err = {};
//         if (!form.college) err.college = "Required";
//         if (!form.degree) err.degree = "Required";
//         if (!form.fieldOfStudy) err.fieldOfStudy = "Required";
//         if (!form.cgpa) err.cgpa = "Required";
//         if (!form.startMonth) err.startMonth = "Required";
//         if (!form.startYear) err.startYear = "Required";
//         if (!form.endMonth) err.endMonth = "Required";
//         if (!form.endYear) err.endYear = "Required";
//         setFormErrors(err);
//         if (Object.keys(err).length) return;
//         let list = [...degreeList];
//         if (popup.index !== undefined) list[popup.index] = form;
//         else list.push(form);
//         setDegreeList(list);
//         setPopup(null);
//         setForm({});
//       };
//       return (
//         <Modal title={`${popup.index !== undefined ? "Edit" : "Add"} Academic Qualification`} onClose={() => setPopup(null)}>
//           <form onSubmit={onSubmit}>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium">College/University<span className="text-red-500">*</span></label>
//                 <input className="w-full border px-2 py-1 rounded"
//                   value={form.college || ""} onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
//                 />
//                 {formErrors.college && <div className="text-red-500 text-xs">{formErrors.college}</div>}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">Degree<span className="text-red-500">*</span></label>
//                 <input className="w-full border px-2 py-1 rounded"
//                   value={form.degree || ""} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))}
//                 />
//                 {formErrors.degree && <div className="text-red-500 text-xs">{formErrors.degree}</div>}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">Field of Study<span className="text-red-500">*</span></label>
//                 <input className="w-full border px-2 py-1 rounded"
//                   value={form.fieldOfStudy || ""} onChange={e => setForm(f => ({ ...f, fieldOfStudy: e.target.value }))}
//                 />
//                 {formErrors.fieldOfStudy && <div className="text-red-500 text-xs">{formErrors.fieldOfStudy}</div>}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">CGPA/Percentage<span className="text-red-500">*</span></label>
//                 <input className="w-full border px-2 py-1 rounded"
//                   value={form.cgpa || ""} onChange={e => setForm(f => ({ ...f, cgpa: e.target.value }))}
//                 />
//                 {formErrors.cgpa && <div className="text-red-500 text-xs">{formErrors.cgpa}</div>}
//               </div>
//               <div>
//                 <label className="text-sm">Start Month<span className="text-red-500">*</span></label>
//                 <select className="w-full border px-2 py-1 rounded" value={form.startMonth || ""}
//                   onChange={e => setForm(f => ({ ...f, startMonth: e.target.value }))}>
//                   <option value="">Select</option>
//                   {months.map(m => <option key={m}>{m}</option>)}
//                 </select>
//                 {formErrors.startMonth && <div className="text-red-500 text-xs">{formErrors.startMonth}</div>}
//               </div>
//               <div>
//                 <label className="text-sm">Start Year<span className="text-red-500">*</span></label>
//                 <select className="w-full border px-2 py-1 rounded" value={form.startYear || ""}
//                   onChange={e => setForm(f => ({ ...f, startYear: e.target.value }))}>
//                   <option value="">Select</option>
//                   {years.map(y => <option key={y}>{y}</option>)}
//                 </select>
//                 {formErrors.startYear && <div className="text-red-500 text-xs">{formErrors.startYear}</div>}
//               </div>
//               <div>
//                 <label className="text-sm">End Month<span className="text-red-500">*</span></label>
//                 <select className="w-full border px-2 py-1 rounded" value={form.endMonth || ""}
//                   onChange={e => setForm(f => ({ ...f, endMonth: e.target.value }))}>
//                   <option value="">Select</option>
//                   {months.map(m => <option key={m}>{m}</option>)}
//                 </select>
//                 {formErrors.endMonth && <div className="text-red-500 text-xs">{formErrors.endMonth}</div>}
//               </div>
//               <div>
//                 <label className="text-sm">End Year<span className="text-red-500">*</span></label>
//                 <select className="w-full border px-2 py-1 rounded" value={form.endYear || ""}
//                   onChange={e => setForm(f => ({ ...f, endYear: e.target.value }))}>
//                   <option value="">Select</option>
//                   {years.map(y => <option key={y}>{y}</option>)}
//                 </select>
//                 {formErrors.endYear && <div className="text-red-500 text-xs">{formErrors.endYear}</div>}
//               </div>
//             </div>
//             <div className="flex justify-end gap-3 mt-8 col-span-2">
//               <button type="button" onClick={() => { setPopup(null); setForm({}); setFormErrors({}); }}
//                 className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md">Cancel</button>
//               <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
//             </div>
//           </form>
//         </Modal>
//       );
//     }
//     return (
//       <SectionCard name="Academic Qualification">
//         <div className="flex justify-end mb-4">
//           <button onClick={() => setPopup({ type: "degree" })} className="bg-blue-600 rounded px-3 py-1 text-white text-sm font-semibold"> + ADD </button>
//         </div>
//         {degreeList.length === 0 && <div className="text-gray-400 text-sm mb-4">No academic qualification added yet.</div>}
//         {degreeList.map((data, i) =>
//           <div className="mb-4 border rounded p-3 text-sm flex justify-between items-start" key={i}>
//             <div>
//               <div className="font-bold text-base mb-1">{data.college}</div>
//               <div>{data.degree}</div>
//               <div>{data.startMonth} {data.startYear} - {data.endMonth} {data.endYear}</div>
//               <div>{data.cgpa}</div>
//             </div>
//             <button onClick={() => setPopup({ type: "degree", index: i })}
//               className="bg-blue-600 rounded px-3 py-1 text-white text-sm font-semibold">Edit</button>
//           </div>
//         )}
//         {popup?.type === "degree" && renderDegreePopup()}
//       </SectionCard>
//     );
//   }

//   function renderExperienceSection() {
//     return (
//       <SectionCard name="Experience">
//         <div className="flex justify-end mb-4">
//           <button onClick={() => setPopup({ type: "experience" })} className="bg-blue-600 rounded px-3 py-1 text-white text-sm font-semibold"> + ADD </button>
//         </div>
//         {experienceList.length === 0 && <div className="text-gray-400 text-sm mb-4">No experience added yet.</div>}
//         {experienceList.map((data, i) =>
//           <div className="mb-4 border rounded p-3 text-sm flex justify-between items-center" key={i}>
//             <div>
//               <div className="font-bold text-base mb-1">{data.title}</div>
//               <div className="mb-1">{data.company}</div>
//               <div className="mb-1">{data.startMonth} {data.startYear} - {data.current ? "Present" : `${data.endMonth} ${data.endYear}`}</div>
//               <div className="mb-1">{data.location} ({data.locationType})</div>
//               {data.description && <div className="text-gray-600">{data.description}</div>}
//             </div>
//             <button onClick={() => setPopup({ type: "experience", index: i })}
//               className="bg-blue-600 rounded px-3 py-1 text-white text-sm font-semibold">Edit</button>
//           </div>
//         )}
//         {popup?.type === "experience" && renderExperiencePopup()}
//       </SectionCard>
//     );
//   }

//   function renderAchievementSection() {
//     function renderAchievementPopup() {
//       const onSubmit = (e) => {
//         e.preventDefault();
//         let err = {};
//         if (!form.name) err.name = "Required";
//         if (!form.organization) err.organization = "Required";
//         if (!form.issueMonth) err.issueMonth = "Required";
//         if (!form.issueYear) err.issueYear = "Required";
//         if (!form.expirationMonth) err.expirationMonth = "Required";
//         if (!form.expirationYear) err.expirationYear = "Required";
//         if (!form.credId) err.credId = "Required";
//         if (!form.credUrl) err.credUrl = "Required";
//         if (!form.fileName || !form.fileData) err.file = "Please upload your credential file";
//         setFormErrors(err);
//         if (Object.keys(err).length) return;
//         let list = [...achievementList];
//         if (popup.index !== undefined) list[popup.index] = form;
//         else list.push(form);
//         setAchievementList(list);
//         setPopup(null);
//         setForm({});
//       };
//       return (
//         <Modal title={`${popup.index !== undefined ? "Edit" : "Add"} Achievement/Certification`} onClose={() => setPopup(null)}>
//           <form onSubmit={onSubmit}>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium">Name<span className="text-red-500">*</span></label>
//                 <input className="w-full border px-2 py-1 rounded"
//                   value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
//                 />
//                 {formErrors.name && <div className="text-red-500 text-xs">{formErrors.name}</div>}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">Issuing Organization<span className="text-red-500">*</span></label>
//                 <input className="w-full border px-2 py-1 rounded"
//                   value={form.organization || ""} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
//                 />
//                 {formErrors.organization && <div className="text-red-500 text-xs">{formErrors.organization}</div>}
//               </div>
//               <div>
//                 <label className="text-sm">Issue Month<span className="text-red-500">*</span></label>
//                 <select className="w-full border px-2 py-1 rounded" value={form.issueMonth || ""}
//                   onChange={e => setForm(f => ({ ...f, issueMonth: e.target.value }))}>
//                   <option value="">Select</option>
//                   {months.map(m => <option key={m}>{m}</option>)}
//                 </select>
//                 {formErrors.issueMonth && <div className="text-red-500 text-xs">{formErrors.issueMonth}</div>}
//               </div>
//               <div>
//                 <label className="text-sm">Issue Year<span className="text-red-500">*</span></label>
//                 <select className="w-full border px-2 py-1 rounded" value={form.issueYear || ""}
//                   onChange={e => setForm(f => ({ ...f, issueYear: e.target.value }))}>
//                   <option value="">Select</option>
//                   {years.map(y => <option key={y}>{y}</option>)}
//                 </select>
//                 {formErrors.issueYear && <div className="text-red-500 text-xs">{formErrors.issueYear}</div>}
//               </div>
//               <div>
//                 <label className="text-sm">Expiration Month<span className="text-red-500">*</span></label>
//                 <select className="w-full border px-2 py-1 rounded" value={form.expirationMonth || ""}
//                   onChange={e => setForm(f => ({ ...f, expirationMonth: e.target.value }))}>
//                   <option value="">Select</option>
//                   {months.map(m => <option key={m}>{m}</option>)}
//                 </select>
//                 {formErrors.expirationMonth && <div className="text-red-500 text-xs">{formErrors.expirationMonth}</div>}
//               </div>
//               <div>
//                 <label className="text-sm">Expiration Year<span className="text-red-500">*</span></label>
//                 <select className="w-full border px-2 py-1 rounded" value={form.expirationYear || ""}
//                   onChange={e => setForm(f => ({ ...f, expirationYear: e.target.value }))}>
//                   <option value="">Select</option>
//                   {years.map(y => <option key={y}>{y}</option>)}
//                 </select>
//                 {formErrors.expirationYear && <div className="text-red-500 text-xs">{formErrors.expirationYear}</div>}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">Credentials ID<span className="text-red-500">*</span></label>
//                 <input className="w-full border px-2 py-1 rounded"
//                   value={form.credId || ""} onChange={e => setForm(f => ({ ...f, credId: e.target.value }))}
//                 />
//                 {formErrors.credId && <div className="text-red-500 text-xs">{formErrors.credId}</div>}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">Credentials URL<span className="text-red-500">*</span></label>
//                 <input className="w-full border px-2 py-1 rounded"
//                   value={form.credUrl || ""} onChange={e => setForm(f => ({ ...f, credUrl: e.target.value }))}
//                 />
//                 {formErrors.credUrl && <div className="text-red-500 text-xs">{formErrors.credUrl}</div>}
//               </div>
//               <div className="col-span-2">
//                 <FileUploadZone
//                   label="Upload Credential"
//                   fileName={form.fileName}
//                   accept=".png,.jpg,.jpeg,.pdf"
//                   error={formErrors.file}
//                   required
//                   link={null}
//                   onFile={e => {
//                     const file = e.target.files?.[0];
//                     if (!file) return;
//                     const reader = new FileReader();
//                     reader.onload = ev =>
//                       setForm(f => ({
//                         ...f,
//                         fileName: file.name,
//                         fileType: file.type,
//                         fileData: ev.target.result
//                       }));
//                     reader.readAsDataURL(file);
//                   }}
//                 />
//                 {form.fileType && form.fileType.startsWith("image/") && form.fileData && (
//                   <img src={form.fileData} alt="preview" className="mt-2 border rounded" style={{ width: 160, height: 80, objectFit: "cover" }} />
//                 )}
//               </div>
//             </div>
//             <div className="flex justify-end gap-3 mt-8 col-span-2">
//               <button type="button" onClick={() => { setPopup(null); setForm({}); setFormErrors({}); }}
//                 className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md">Cancel</button>
//               <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
//             </div>
//           </form>
//         </Modal>
//       );
//     }
//     return (
//       <SectionCard name="Achievements & Certifications">
//         <div className="flex justify-end mb-4">
//           <button
//             onClick={() => setPopup({ type: "achievement" })}
//             className="bg-blue-600 rounded px-3 py-1 text-white text-sm font-semibold"
//           >
//             + ADD
//           </button>
//         </div>

//         {achievementList.length === 0 && (
//           <div className="text-gray-400 text-sm mb-4">
//             No achievements or certifications added yet.
//           </div>
//         )}

//         {achievementList.map((data, i) => (
//           <div
//             key={i}
//             className="mb-4 border rounded p-3 text-sm flex justify-between items-start gap-4"
//           >
//             {/* LEFT: Details */}
//             <div className="flex-1">
//               <div className="font-bold text-base mb-1">{data.name}</div>
//               <div className="mb-1">{data.organization}</div>
//               <div className="mb-1">Issued: {data.issueMonth} {data.issueYear}</div>
//               <div className="mb-1">ID: {data.credId}</div>

//               {/* Image preview */}
//               {data.fileType?.startsWith("image/") && data.fileData && (
//                 <div
//                   className="mt-4 border border-gray-300 rounded-md overflow-hidden"
//                   style={{ maxHeight: '100%', width: '100%', maxWidth: '200px' }}
//                 >
//                   <img
//                     src={data.fileData}
//                     alt={data.fileName}
//                     className="w-full h-full object-contain"
//                     style={{ maxHeight: '400px' }}
//                   />
//                 </div>
//               )}

//             </div>

//             {/* RIGHT: Edit button */}
//             <div>
//               <button
//                 onClick={() => setPopup({ type: "achievement", index: i })}
//                 className="bg-blue-600 rounded px-3 py-1 text-white text-sm font-semibold"
//               >
//                 Edit
//               </button>
//             </div>
//           </div>
//         ))}

//         {popup?.type === "achievement" && renderAchievementPopup()}
//       </SectionCard>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <SectionCard name="Identity Documents">
//         <div className="mb-2">
//           {identityDocs.map(doc => (
//             <div key={doc.name} className="flex items-center justify-between border-b pb-4 mb-3">
//               {/* LEFT SIDE: Name, Status and Identity Details */}
//               <div className="flex flex-col gap-1 text-sm">
//                 <div className="flex items-center gap-3">
//                   <div className="bg-gray-100 p-2 rounded">
//                     <FaFileAlt className="text-gray-400 text-lg" />
//                   </div>
//                   <span>{doc.name}</span>
//                   <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md font-medium">
//                     {doc.status}
//                   </span>
//                 </div>

//                 {/* Show identity details just below the name */}
//                 {identityData[doc.name] && (
//                   <div className="mt-2 space-y-1 text-xs text-left ml-12">
//                     {doc.name === "Aadhaar Card" ? (
//                       <>
//                         <div><b>Aadhaar Number:</b> {identityData[doc.name].aadhaarNumber}</div>
//                         <div><b>Enrollment Number:</b> {identityData[doc.name].enrollmentNumber}</div>
//                         <div><b>Date of Birth:</b> {identityData[doc.name].dob}</div>
//                         <div><b>Name:</b> {identityData[doc.name].name}</div>
//                         <div><b>Address:</b> {identityData[doc.name].address}</div>
//                         <div><b>Gender:</b> {identityData[doc.name].gender}</div>
//                       </>
//                     ) : (
//                       <>
//                         <div><b>Name:</b> {identityData[doc.name].name}</div>
//                         <div><b>ID Number:</b> {identityData[doc.name].idNumber}</div>
//                         <div><b>Date of Birth:</b> {identityData[doc.name].dob}</div>
//                         <div><b>Address:</b> {identityData[doc.name].address}</div>
//                       </>
//                     )}
//                     <div>
//                       {identityData[doc.name].fileName && identityData[doc.name].fileData && (
//                         <a
//                           href={identityData[doc.name].fileData}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-blue-600 underline"
//                         >
//                           {identityData[doc.name].fileName}
//                         </a>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* RIGHT SIDE: Button */}
//               <div>
//                 <button
//                   onClick={() => {
//                     setPopup({ type: 'identity', docName: doc.name });
//                     setForm(identityData[doc.name] || {});
//                   }}
//                   className="text-sm bg-blue-600 rounded px-3 py-1 text-white font-semibold"
//                 >
//                   {identityData[doc.name] ? 'Edit' : '+Add details'}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Render Popup */}
//         {popup && popup.type === "identity" && renderIdentityPopup(popup.docName)}
//       </SectionCard>

//       {renderExperienceSection()}
//       {renderDegreeSection()}
//       {renderAchievementSection()}
//     </div>
//   );
// }

// // --------- Modal and SectionCard ---------
// function Modal({ title, children, onClose }) {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
//         <div className="flex items-center justify-between p-4 border-b">
//           <h2 className="text-lg font-semibold">{title}</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             <IoClose size={24} />
//           </button>
//         </div>
//         <div className="p-4">{children}</div>
//       </div>
//     </div>
//   );
// }
// function SectionCard({ name, children }) {
//   return (
//     <div className="bg-white rounded-lg p-6 mt-6 border">
//       <h2 className="text-lg font-semibold mb-3">{name}</h2>
//       {children}
//     </div>
//   );
// }
