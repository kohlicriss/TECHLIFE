import { useContext } from "react";
import { Context } from "../HrmsContext";

export default function TicketHistory({ tickets, onTicketClick, lastTicketRef }) {
  const { theme } = useContext(Context);
  const isDark = theme === "dark";

  const formatDateIST = (dateString) => {
    if (!dateString) return "N/A";

    // Fix timezone issue — ensure correct IST time
    const date = new Date(dateString.endsWith("Z") ? dateString : dateString + "Z");

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  if (!tickets || tickets.length === 0) {
    return (
      <div
        className={`text-center py-6 ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        No tickets submitted yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket, index) => {
        const isLast = index === tickets.length - 1;

        return (
          
          <div
            key={ticket.ticketId}
            ref={isLast ? lastTicketRef : null} 
            onClick={() => onTicketClick(ticket)}
            className={`cursor-pointer border rounded-lg p-4 shadow-md hover:shadow-lg transition-all ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:border-blue-400 text-gray-200"
                : "bg-white border-gray-300 hover:border-blue-400 text-gray-900"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${
                isDark ? "text-blue-300" : "text-blue-700"
              }`}
            >
              Ticket ID: {ticket.ticketId}
            </h3>
            <p>
              <strong>Employee ID:</strong> {ticket.employeeId}
            </p>
            <p>
              <strong>Title:</strong> {ticket.title}
            </p>
            <p>
              <strong>Submitted:</strong> {formatDateIST(ticket.createdAt || ticket.sentAt)}
            </p>
            <p>
              <strong>Status:</strong> {ticket.status}
            </p>
            <p>
              <strong>Description:</strong> {ticket.description}
            </p>
            <p>
              <strong>Assigned to:</strong> {ticket.roles}
            </p>
          </div>
        );
      })}
    </div>
  );
}
