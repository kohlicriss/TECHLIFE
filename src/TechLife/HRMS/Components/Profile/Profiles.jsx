import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import About from "./tabs/About";
import Profile from "./tabs/Profile";
import Job from "./tabs/Job";
import Document from "./tabs/Document";
import { HiIdentification, HiPencil } from "react-icons/hi";
import {
  MdWork,
  MdBusiness,
  MdEmail,
  MdPerson,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { FaPhone, FaBuilding } from "react-icons/fa";
import axios from "axios";
import { publicinfoApi } from "../../../../axiosInstance";
const Profiles = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { empID } = useParams();

  const [activeTab, setActiveTab] = useState(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileImage, setProfileImage] = useState(() => {
    const savedImage = localStorage.getItem("profileImage");
    return savedImage || null;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [employeeData, setEmployeeData] = useState(() => {
    const savedData = localStorage.getItem("employeeData");
    return savedData
      ? JSON.parse(savedData)
      : {
          name: "JOHN DOE",
          empId: "e123",
          company: "ABC Services",
          department: "Software",
          email: "john@gmail.com",
          contact: "+91123456799",
          role: "Associate Software",
        };
  });

  const EMPLOYEE_ID_TO_FETCH = empID;

  useEffect(() => {
    // empID (URL nuṇḍi) uṇṭēnē API call cēyāli
    if (!empID) {
      return;
    }

    const fetchEmployeeDetails = async () => {
      // API call mundu loading start cheyyandi
      try {
        // baseURL (http://localhost:8090/api) mī instance lō uṇṭundi,
        // kābaṭṭi manam kevalaṁ migatā path mātramē ivvāli.
        const relativePath = `/public/${empID}/employee/details`;

        console.log(`Requesting data from: ${relativePath}`);

        // SARIAINA MĀRPU: 'axios.get' badulu 'publicinfoApi.get' vāḍutunnāmu
        // const response = await publicinfoApi.get(relativePath);

        // BRO, I've inserted your data here directly.
        // I am simulating a successful API call with your data.
        const response = {
          data: {
            employeeId: "ACS00000004",
            employeeName: "Rahul K. Verma",
            jobTitlePrimary: "Data Analyst",
            department: "Finance",
            emailId: "rahul.verma@acs.com",
            mobileNo: "0403344556",
            location: "ACS",
          },
        };

        console.log("✅ API Response Received:", response);
        console.log("✅ Employee Data:", response.data);

        // Vaccina dēṭānu state lōki set cheyyandi
        const data = response.data;
        setEmployeeData({
          name: data.employeeName || "N/A",
          empId: data.employeeId,
          company: data.location || "Anasol", // Updated to use the location field
          department: data.department || "N/A",
          email: data.emailId || "N/A",
          contact: data.mobileNo || "N/A",
          role: data.jobTitlePrimary || "N/A", // Updated to use jobTitlePrimary
        });
      } catch (err) {
        console.error("❌ Error fetching employee details:", err);
        // Error state ni kūḍā set cēsukōvaccu
      } finally {
        // Call ayyāka loading stop cheyyandi
      }
    };

    fetchEmployeeDetails();
  }, [empID]); // empID mārinappuḍallā ī useEffect run avutuṁdi

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const initials = employeeData.name
    .split(" ")
    .map((word) => word[0])
    .join("");

  const tabs = [
    { name: "About", path: `about`, icon: MdPerson },
    { name: "Profile", path: `profile`, icon: HiIdentification },
    { name: "Job", path: `job`, icon: MdWork },
    { name: "Documents", path: `documents`, icon: MdBusiness },
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // This function now receives the full path to navigate to
  const handleTabClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#B7D4FF] h-48 relative">
        <div className="absolute top-4 right-8">
          <button
            onClick={handleEditClick}
            className="p-2 bg-white hover:bg-gray-100 rounded transition-colors"
            title="Edit Profile"
          >
            <HiPencil className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="flex items-start pt-4 px-8">
          <div className="relative group cursor-pointer">
            <label htmlFor="profile-upload" className="cursor-pointer block">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full bg-white border-2 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 border-2 border-white shadow-lg flex items-center justify-center text-xl font-medium text-gray-600">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-sm">Upload Photo</span>
              </div>
            </label>
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="ml-8 text-gray-800">
            <h1 className="text-3xl font-bold tracking-wide mb-4">
              {employeeData.name}
            </h1>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <HiIdentification className="w-5 h-5" />
                <p>{employeeData.empId}</p>
              </div>
              <div className="flex items-center space-x-2">
                <FaBuilding className="w-5 h-5" />
                <p>{employeeData.company}</p>
              </div>
              <div className="flex items-center space-x-2">
                <MdWork className="w-5 h-5" />
                <p>{employeeData.department}</p>
              </div>
              <div className="flex items-center space-x-2">
                <MdEmail className="w-5 h-5" />
                <p>{employeeData.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <FaPhone className="w-5 h-5" />
                <p>{employeeData.contact}</p>
              </div>
              <div className="flex items-center space-x-2">
                <MdPerson className="w-5 h-5" />
                <p>{employeeData.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <main className="flex-1 p-6 bg-gray-50">
          <Routes>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="about" element={<About />} />
            <Route path="profile" element={<Profile />} />
            <Route path="job" element={<Job />} />
            <Route path="documents" element={<Document />} />
          </Routes>
        </main>

        <div
          className={`transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-20"
          } bg-gray-50 border-l border-gray-200 min-h-full relative`}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -left-3 top-4 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-gray-100 z-10"
          >
            {sidebarOpen ? <MdChevronRight /> : <MdChevronLeft />}
          </button>
          <nav className="p-4 sticky top-0">
            <div className="space-y-1">
              {tabs.map((tab) => {
                // This is the full, absolute path for the tab
                const tabPath = `/profile/${empID}/${tab.path}`;
                return (
                  <div
                    key={tab.path}
                    // ***FIX: Pass the full `tabPath` to the handler***
                    onClick={() => handleTabClick(tabPath)}
                    className={`cursor-pointer flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tabPath
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon
                      className={`w-5 h-5 ${
                        activeTab === tabPath ? "text-white" : "text-gray-500"
                      }`}
                    />
                    {sidebarOpen && (
                      <span className="font-medium">{tab.name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 backdrop-blur-sm   bg-opacity-100 flex items-center justify-center z-100">
          <div className="bg-white rounded-lg p-6 w-[500px] shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleSave}>
              <div className="space-y-4">
                {[
                  "name",
                  "empId",
                  "company",
                  "department",
                  "email",
                  "contact",
                  "role",
                ].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {field}
                    </label>
                    <input
                      type={field === "email" ? "email" : "text"}
                      name={field}
                      value={employeeData[field]}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiles;