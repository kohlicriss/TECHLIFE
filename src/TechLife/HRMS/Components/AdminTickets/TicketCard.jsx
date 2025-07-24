export default function TicketCard({
  employeeId,
  employeeName,
  priority,
  title,
  sentAt,
  status,
  onClick,
}) {
  const priorityColor = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };

  const statusColor = {
    Pending: "bg-gray-100 text-gray-700",
    Unsolved: "bg-orange-100 text-orange-700",
    Opened: "bg-blue-100 text-blue-700",
    Resolved: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white border border-gray-200 hover:border-blue-400 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-blue-900 group-hover:text-blue-700 transition-colors">
          {title}
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor[priority]}`}
        >
          {priority}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-2">
        {employeeId} <span className="text-gray-400 text-xs">({employeeId})</span>
      </p>

      <div className="flex items-center gap-2 mb-3">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[status]}`}
        >
          {status}
        </span>
      <span className="text-xs text-gray-500">
  📅 {
    sentAt && !isNaN(new Date(sentAt).getTime())
      ? new Date(sentAt).toLocaleString()
      : "Date not available"
  }

  
</span>



      </div>
    </div>
  );
}
