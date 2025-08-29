import React, { useState, useEffect, useContext } from "react";
import { IoClose } from "react-icons/io5";
import { Context } from "../../HrmsContext";
import { publicinfoApi } from "../../../../../axiosInstance";
import { useParams } from "react-router-dom";

// ---- Default Profile ---
const defaultProfile = {
  primaryDetails: {
    firstName: "John",
    middleName: "Robert",
    lastName: "Smith",
    displayName: "John Smith",
    gender: "Male",
    dateOfBirth: "1990-03-15",
    maritalStatus: "Married",
    bloodGroup: "O+ (O Positive)",
    physicallyHandicapped: "No",
    nationality: "United States",
  },
  contactDetails: {
    email: "john@example.com",
    alternateEmail: "john@gmail.com",
    phone: "+1 234-567-8900",
    city: "Los Angeles",
    state: "California",
    zip: "90001",
    country: "United States",
  },
  address: {
    permanentAddress: "123 Main St, Hometown",
    permanentCity: "Los Angeles",
    permanentState: "California",
    permanentZip: "90001",
    permanentCountry: "United States",
    currentAddress: "456 Work Ave, Worktown",
    currentCity: "San Francisco",
    currentState: "California",
    currentZip: "94101",
    currentCountry: "United States",
  },
  relations: {
    fatherName: "Albert Smith",
    motherName: "Marry Smith",
    spouseName: "Jane Smith",
    children: "2",
    siblings: "1",
  },
  education: {
    highestDegree: "B.Tech",
    institution: "MIT",
    yearOfPassing: "2014",
    gradingSystem: "CGPA",
    grade: "9.2",
    specialization: "Computer Science",
  },
  professionalSummary: {
    summary: "Full-stack developer with 10+ years of experience.",
  },
  identityInformation: {
    photoId: null,
    addressProof: null,
    payroll: null,
    photoIdName: "",
    addressProofName: "",
    payrollName: "",
  },
};

const sectionFields = {
  primaryDetails: [
    { label: "First Name", name: "firstName", type: "text", required: true },
    { label: "Middle Name", name: "middleName", type: "text" },
    { label: "Last Name", name: "lastName", type: "text", required: true },
    {
      label: "Display Name",
      name: "displayName",
      type: "text",
      required: true,
    },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      required: true,
      options: ["Male", "Female", "Other"],
    },
    {
      label: "Date of Birth",
      name: "dateOfBirth",
      type: "date",
      required: true,
    },
    {
      label: "Marital Status",
      name: "maritalStatus",
      type: "select",
      options: ["Single", "Married", "Divorced"],
    },
    {
      label: "Blood Group",
      name: "bloodGroup",
      type: "select",
      required: true,
      options: ["O+ (O Positive)", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"],
    },
    {
      label: "Physically Handicapped",
      name: "physicallyHandicapped",
      type: "select",
      required: true,
      options: ["Yes", "No"],
    },
    {
      label: "Nationality",
      name: "nationality",
      type: "select",
      required: true,
      options: ["United States", "India", "Canada"],
    },
  ],
  contactDetails: [
    { label: "Email", name: "email", type: "email", required: true },
    { label: "Alternate Email", name: "alternateEmail", type: "email" },
    { label: "Phone", name: "phone", type: "text", required: true },
    { label: "City", name: "city", type: "text" },
    { label: "State", name: "state", type: "text" },
    { label: "Zip", name: "zip", type: "text" },
    { label: "Country", name: "country", type: "text", required: true },
  ],
  address: [
    { label: "Permanent Address", name: "permanentAddress", type: "text" },
    { label: "Permanent City", name: "permanentCity", type: "text" },
    { label: "Permanent State", name: "permanentState", type: "text" },
    { label: "Permanent Zip", name: "permanentZip", type: "text" },
    { label: "Permanent Country", name: "permanentCountry", type: "text" },
    { label: "Current Address", name: "currentAddress", type: "text" },
    { label: "Current City", name: "currentCity", type: "text" },
    { label: "Current State", name: "currentState", type: "text" },
    { label: "Current Zip", name: "currentZip", type: "text" },
    { label: "Current Country", name: "currentCountry", type: "text" },
  ],
  relations: [
    { label: "Father Name", name: "fatherName", type: "text" },
    { label: "Mother Name", name: "motherName", type: "text" },
    { label: "Spouse Name", name: "spouseName", type: "text" },
    { label: "Children", name: "children", type: "number" },
    { label: "Siblings", name: "siblings", type: "number" },
  ],
  education: [
    {
      label: "Highest Degree",
      name: "highestDegree",
      type: "text",
      required: true,
    },
    { label: "Institution", name: "institution", type: "text", required: true },
    {
      label: "Year Of Passing",
      name: "yearOfPassing",
      type: "number",
      required: true,
    },
    {
      label: "Grading System",
      name: "gradingSystem",
      type: "select",
      options: ["Percentage", "CGPA", "GPA"],
      required: true,
    },
    { label: "Grade", name: "grade", type: "text" },
    { label: "Specialization", name: "specialization", type: "text" },
  ],
};

// ---- Profile Component -----
function Profile() {
  const [editingSection, setEditingSection] = useState(null);
  const [primarydata, setPrimaryData] = useState(null);
  const [contactdetails, setContactDetails] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [eduData, setEduData] = useState(null);
  const [experience, setExperience] = useState(null);
  let { userprofiledata, setUserProfileData } = useContext(Context);
  const [editingData, setEditingData] = useState({});
  const { empID } = useParams();
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("profileData");
    return saved ? JSON.parse(saved) : defaultProfile;
  });
  const [loading, setLoading] = useState(true);

  // Fetch primary data
  useEffect(() => {
    const fetchPrimaryData = async () => {
      try {
        let response = await publicinfoApi.get(`employee/${empID}/primary/details`);
        console.log("Primary Information:", response.data);
        setPrimaryData(response.data);
      } catch (err) {
        console.error("Failed to fetch primary details:", err);
        setPrimaryData(null);
      }
    };
    if (empID) {
      fetchPrimaryData();
    }
  }, [empID]);





  useEffect(()=>{
    let edudataFetch=async()=>{
        try {
          let response= await publicinfoApi.get(`employee/${empID}/previousExperience`);
          setExperience(response.data);
          console.log("Experience data :",response.data)
        } catch (error) {
          console.log("Experience error:",error);
        }
    }
    edudataFetch();
  },[empID])

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        let response = await publicinfoApi.get(`employee/${empID}/contact`);
        console.log("Contact Information:", response.data);
        setContactDetails(response.data);
      } catch (err) {
        console.error("Failed to fetch contact details:", err);
        setContactDetails(null);
      }
    };
    if (empID) {
      fetchContactInfo();
    }
  }, [empID]);

  // Fetch address data
  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        let response = await publicinfoApi.get(`employee/${empID}/address`); 
        console.log("Address Information:", response.data); // Added this line
        setAddressData(response.data);
      } catch (err) {
        console.error("Failed to fetch address details:", err);
        setAddressData(null);
      }
    };
    if (empID) {
      fetchAddressData();
    }
  }, [empID]);


  // Set loading to false once all data sets have been fetched
  useEffect(() => {
    if (primarydata !== null && contactdetails !== null && addressData !== null) {
      setLoading(false);
    }
  }, [primarydata, contactdetails, addressData]);


  useEffect(() => {
    localStorage.setItem("profileData", JSON.stringify(formData));
  }, [formData]);

  const getFileName = (file, name) =>
    file ? (file.name ? file.name : name) : name || "";

  // ---- Helper: Get Display Value with Dynamic Data -----
  const getDisplayValue = (sectionKey, fieldName) => {
    const apiFieldMapping = {
      email: 'workEmail',
      alternateEmail: 'personalEmail',
      phone: 'mobileNumber',
      displayName: 'displayName',
      permanentAddress: 'street',
      permanentCity: 'city',
      permanentState: 'state',
      permanentZip: 'zip',
      permanentCountry: 'country',
      currentAddress: 'street',
      currentCity: 'city',
      currentState: 'state',
      currentZip: 'zip',
      currentCountry: 'country',
    };
    
    if (sectionKey === "primaryDetails" && primarydata) {
      return primarydata[apiFieldMapping[fieldName] || fieldName] || "-Not Set-";
    }
    if (sectionKey === "contactDetails" && contactdetails) {
      return contactdetails[apiFieldMapping[fieldName] || fieldName] || "-Not Set-";
    }
    if (sectionKey === "address" && addressData) {
      const apiAddressField = apiFieldMapping[fieldName] || fieldName;
      return addressData[apiAddressField] || "-Not Set-";
    }

    const val = formData[sectionKey]?.[fieldName];
    if (val !== undefined && val !== "") {
      return val;
    }

    const defaultVal = defaultProfile[sectionKey]?.[fieldName];
    if (defaultVal !== undefined && defaultVal !== "") {
      return defaultVal;
    }
    return "-Not Set-";
  };

  // ---- Edit / Modal Section Logic -----
  const openEditSection = (section) => {
    const merged = { ...defaultProfile[section], ...formData[section] };
    setEditingData(merged);
    setEditingSection(section);
  };

  const handleEditFieldChange = (field, value) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (field, file) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: file,
      [`${field}Name`]: file && file.name ? file.name : "",
    }));
  };

  const renderField = (
    label,
    name,
    type = "text",
    required = false,
    options = []
  ) => (
    <div className="mb-4" key={name}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === "select" ? (
        <select
          value={editingData[name] || ""}
          onChange={(e) => handleEditFieldChange(name, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : type === "date" ? (
        <input
          type="date"
          value={editingData[name] || ""}
          onChange={(e) => handleEditFieldChange(name, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      ) : (
        <input
          type={type}
          value={editingData[name] || ""}
          onChange={(e) => handleEditFieldChange(name, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={`Enter ${label.toLowerCase()}`}
          required={required}
        />
      )}
    </div>
  );

  // ---- Modal Renderer -----
  const renderEditModal = () => {
    if (!editingSection) return null;

    if (editingSection === "professionalSummary") {
      return (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-100 flex items-center justify-center z-116">
          <div className="bg-white shadow-2xl rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-medium">Professional Summary</h2>
              <button
                onClick={() => setEditingSection(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <IoClose size={24} />
              </button>
            </div>
            <form
              className="p-4"
              onSubmit={(e) => {
                e.preventDefault();
                setFormData((prev) => ({
                  ...prev,
                  professionalSummary: { summary: editingData.summary || "" },
                }));
                setEditingSection(null);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Professional Summary
                </label>
                <textarea
                  value={editingData.summary || ""}
                  onChange={(e) =>
                    handleEditFieldChange("summary", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  rows={5}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (editingSection === "identityInformation") {
      return (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-100 flex items-center justify-center z-117">
          <div className="bg-white shadow-2xl rounded-lg w-[550px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-medium">Identity Information</h2>
              <button
                onClick={() => setEditingSection(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <IoClose size={24} />
              </button>
            </div>
            <form
              className="p-4"
              onSubmit={(e) => {
                e.preventDefault();
                setFormData((prev) => ({
                  ...prev,
                  identityInformation: { ...editingData },
                }));
                setEditingSection(null);
              }}
            >
              {[
                {
                  id: "photoId",
                  label: "Photo ID (e.g., Passport, PAN Card)",
                },
                {
                  id: "addressProof",
                  label: "Address Proof (e.g., Aadhaar, Electricity Bill)",
                },
                {
                  id: "payroll",
                  label: "Payroll (Recent Payslip)",
                },
              ].map((f) => (
                <div key={f.id} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {f.label}
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) =>
                      handleFileChange(f.id, e.target.files?.[0])
                    }
                    className="mt-1 block w-full text-sm text-gray-600"
                  />
                  {getFileName(
                    editingData[f.id],
                    editingData[`${f.id}Name`]
                  ) && (
                    <span className="block mt-1 text-xs text-gray-500">
                      Uploaded:{" "}
                      {getFileName(
                        editingData[f.id],
                        editingData[`${f.id}Name`]
                      )}
                    </span>
                  )}
                </div>
              ))}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    const fields = sectionFields[editingSection] || [];
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-opacity-100 flex items-center justify-center z-115">
        <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-medium capitalize">
              {editingSection.replace(/([A-Z])/g, " $1")}
            </h2>
            <button
              onClick={() => setEditingSection(null)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <IoClose size={24} />
            </button>
          </div>
          <form
            className="p-4"
            onSubmit={(e) => {
              e.preventDefault();
              setFormData((prev) => ({
                ...prev,
                [editingSection]: editingData,
              }));
              setEditingSection(null);
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              {fields.map((f) =>
                renderField(f.label, f.name, f.type, f.required, f.options)
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const Section = ({ sectionKey, title, singleField, isFileSection }) => (
    <div className="bg-white rounded-lg p-6 mt-6 bg-opacity-100 z-[116] shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <button
          onClick={() => openEditSection(sectionKey)}
          className="text-blue-600 hover:text-blue-800"
        >
          Edit
        </button>
      </div>
      <div
        className={singleField ? "mb-2" : "grid grid-cols-2 gap-x-8 gap-y-4"}
      >
        {singleField ? (
          <div>
            <label className="block text-sm text-gray-500">SUMMARY</label>
            <p>{getDisplayValue(sectionKey, "summary")}</p>
          </div>
        ) : isFileSection ? (
          ["photoId", "addressProof", "payroll"].map((field) => (
            <div key={field}>
              <label className="block text-sm text-gray-500">
                {field === "photoId"
                  ? "PHOTO ID"
                  : field === "addressProof"
                  ? "ADDRESS PROOF"
                  : field === "payroll"
                  ? "PAYROLL"
                  : field}
              </label>
              <span className="block text-gray-600 text-sm truncate">
                {formData[sectionKey]?.[`${field}Name`] ||
                  getFileName(
                    formData[sectionKey]?.[field],
                    defaultProfile[sectionKey][`${field}Name`]
                  ) ||
                  "-Not Set-"}
              </span>
            </div>
          ))
        ) : (
          (sectionFields[sectionKey] || []).map((field) => (
            <div key={field.name}>
              <label className="block text-sm text-gray-500">
                {field.label.toUpperCase()}
              </label>
              <p>{getDisplayValue(sectionKey, field.name)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {loading || !primarydata || !contactdetails || !addressData ? (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl font-semibold">Loading Profile...</p>
        </div>
      ) : (
        <>
          <Section sectionKey="primaryDetails" title="Primary Details" />
          <Section sectionKey="contactDetails" title="Contact Details" />
          <Section sectionKey="address" title="Address" />
          <Section sectionKey="relations" title="Relations" />
          <Section sectionKey="education" title="Education" />
          <Section
            sectionKey="professionalSummary"
            title="Professional Summary"
            singleField
          />
          <Section
            sectionKey="identityInformation"
            title="Identity Information"
            isFileSection
          />
          {renderEditModal()}
        </>
      )}
    </div>
  );
}

export default Profile;