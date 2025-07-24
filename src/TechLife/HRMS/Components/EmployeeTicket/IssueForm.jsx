import { useState } from 'react';

export default function IssueForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    title: '',
    priority: 'Low',
    description: '',
  });

  const [showNotification, setShowNotification] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    onSubmit(formData);
    setFormData({
      employeeId: '',
      title: '',
      priority: 'Low',
      description: '',
    });
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-blue-700 text-center">Fill the form</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="employeeId"
            placeholder="Employee ID"
            value={formData.employeeId}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="title"
            placeholder="Issue Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <textarea
          name="description"
          placeholder="Describe your issue in detail"
          value={formData.description}
          onChange={handleChange}
          required
          rows="5"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        ></textarea>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition"
          >
            Submit Ticket
          </button>
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
