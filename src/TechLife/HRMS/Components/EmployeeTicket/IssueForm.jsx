import { useState, useEffect, useContext } from "react";
import { Context } from "../HrmsContext";


export default function IssueForm({ onSubmit }) {
  const { theme } = useContext(Context);
  const isDark = theme === "dark";
   const [matchedArray,setMatchedArray]=useState([]);

  const [formData, setFormData] = useState({
    employeeId: "",
    ticketId: "",
    title: "",
    priority: "Low",
    description: "",
    roles: "",
  });

  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("employeeId");
    if (userData) {
      const parsed = JSON.parse(userData);
      setFormData((prev) => ({
        ...prev,
        employeeId: parsed.employeeId || "",
      }));
    }
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    onSubmit(formData);
    setFormData((prev) => ({
      ...prev,
      ticketId: "",
      title: "",
      priority: "Low",
      description: "",
      roles: "",
    }));
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className={`p-8 rounded-2xl shadow-lg space-y-6 border transition ${
          isDark
            ? "bg-gray-900 border-gray-700 text-white"
            : "bg-white border-gray-500 text-black"
        }`}
      >
        <h2
          className={`text-3xl font-bold text-center ${
            isDark ? "text-blue-300" : "text-blue-700"
          }`}
        >
          Fill the form
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          <input
            name="title"
            placeholder="Issue Title"
            value={formData.title}
            onChange={handleChange}
            required
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              isDark
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-black"
            }`}
          />
        </div>

        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          required
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            isDark
              ? "bg-gray-800 border-gray-600 text-white"
              : "bg-white border-gray-300 text-black"
          }`}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select
          name="roles"
          value={formData.roles}
          onChange={handleChange}
          required
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            isDark
              ? "bg-gray-800 border-gray-600 text-white"
              : "bg-white border-gray-300 text-black"
          }`}
        >
          <option value="">Select Role</option>
          <option value="ROLE_ADMIN">Admin</option>
          <option value="ROLE_HR">HR</option>
          <option value="ROLE_MANAGER">Manager</option>
        </select>

        <textarea
          name="description"
          placeholder="Describe your issue in detail"
          value={formData.description}
          onChange={handleChange}
          required
          rows="5"
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            isDark
              ? "bg-gray-800 border-gray-600 text-white"
              : "bg-white border-gray-300 text-black"
          }`}
        ></textarea>

        <div className="flex justify-center">
           {matchedArray.includes("CREATE_TICKET") && (
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition"
          >
            Submit Ticket
          </button>
           )}
        </div>
      </form>

      {showNotification && (
        <div className="absolute top-4 right-4 z-50 bg-green-500 text-white px-5 py-3 rounded-lg shadow-md">
          ✅ Ticket submitted successfully!
        </div>
      )}
    </div>
  );
}
