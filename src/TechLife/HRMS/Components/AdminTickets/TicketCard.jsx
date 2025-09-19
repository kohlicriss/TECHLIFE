import { useContext } from "react";
import { Context } from "../HrmsContext";

export default function TicketCard({
  employeeId,
  employeeName,
  priority,
  title,
  sentAt,
  status,
  onClick,
}) {
  const { theme } = useContext(Context);
  const isDark = theme === "dark";

  const priorityColor = {
    High: isDark
      ? "bg-red-900 text-red-300"
      : "bg-red-100 text-red-700",
    Medium: isDark
      ? "bg-yellow-900 text-yellow-300"
      : "bg-yellow-100 text-yellow-700",
    Low: isDark
      ? "bg-green-900 text-green-300"
      : "bg-green-100 text-green-700",
  };

  const statusColor = {
    Pending: isDark
      ? "bg-gray-700 text-gray-300"
      : "bg-gray-100 text-gray-700",
    Unsolved: isDark
      ? "bg-orange-900 text-orange-300"
      : "bg-orange-100 text-orange-700",
    Opened: isDark
      ? "bg-blue-900 text-blue-300"
      : "bg-blue-100 text-blue-700",
    Resolved: isDark
      ? "bg-emerald-900 text-emerald-300"
      : "bg-emerald-100 text-emerald-700",
  };

  const formatToIST = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + "Z");
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      onClick={onClick}
      className={`group rounded-xl p-5 border transition-all duration-300 cursor-pointer transform hover:-translate-y-1 
        ${isDark
          ? "bg-gray-800 border-gray-700 hover:border-blue-400 hover:shadow-lg"
          : "bg-white border-gray-200 hover:border-blue-400 hover:shadow-lg shadow-sm"
        }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3
          className={`font-semibold text-lg transition-colors ${
            isDark
              ? "text-blue-300 group-hover:text-blue-400"
              : "text-blue-900 group-hover:text-blue-700"
          }`}
        >
          {title}
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor[priority]}`}
        >
          {priority}
        </span>
      </div>

      <p
        className={`text-sm mb-2 ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {employeeName}{" "}
        <span className={isDark ? "text-gray-500 text-xs" : "text-gray-400 text-xs"}>
          ({employeeId})
        </span>
      </p>

      <div className="flex items-center gap-2 mb-3">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[status]}`}
        >
          {status}
        </span>
        <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          📅 Created: {formatToIST(sentAt)}
        </span>
      </div>
    </div>
  );
}
