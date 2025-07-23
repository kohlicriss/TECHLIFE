import React, { useState, useEffect } from "react";
import {
  Route,
  Routes,
  Navigate,
  useLocation,
  useNavigate,
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

const Profiles = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    localStorage.setItem("employeeData", JSON.stringify(employeeData));
  }, [employeeData]);

  useEffect(() => {
    if (profileImage) {
      localStorage.setItem("profileImage", profileImage);
    }
  }, [profileImage]);

  useEffect(() => {
    // FIX: If the path is just /profile, redirect to the new default tab 'profile'
    if (location.pathname === "/profile" || location.pathname === "/profile/") {
      navigate("/profile/profile", { replace: true });
    }
    setActiveTab(location.pathname);
  }, [location.pathname, navigate]);

  const initials = employeeData.name
    .split(" ")
    .map((word) => word[0])
    .join("");

  const tabs = [
    { name: "About", path: "/profile/about", icon: MdPerson },
    { name: "Profile", path: "/profile/profile", icon: HiIdentification },
    { name: "Job", path: "/profile/job", icon: MdWork },
    { name: "Documents", path: "/profile/documents", icon: MdBusiness },
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
            <Route path="about" element={<About />} />
            <Route path="profile" element={<Profile />} />
            <Route path="job" element={<Job />} />
            <Route path="documents" element={<Document />} />
            {/* FIX: Change index route to navigate to "profile" */}
            <Route index element={<Navigate to="profile" replace />} />
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
              {tabs.map((tab) => (
                <div
                  key={tab.path}
                  onClick={() => handleTabClick(tab.path)}
                  className={`cursor-pointer flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.path
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon
                    className={`w-5 h-5 ${
                      activeTab === tab.path ? "text-white" : "text-gray-500"
                    }`}
                  />
                  {sidebarOpen && (
                    <span className="font-medium">{tab.name}</span>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
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
