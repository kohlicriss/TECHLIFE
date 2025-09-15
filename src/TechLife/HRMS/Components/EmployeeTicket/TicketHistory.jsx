export default function TicketHistory({ tickets, onTicketClick }) {
  
  const formatDateIST = (dateString) => {
  let date;
  
  if (dateString) {
    // parse backend date as UTC
    date = new Date(dateString + "Z"); // force UTC interpretation
  } else {
    date = new Date(); // current time
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", // IST
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};



  if (!tickets.length) {
    return (
      <div className="text-center text-gray-500 py-6">
        No tickets submitted yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket, ticketId) => (
        <div
          key={ticketId}
          onClick={() => onTicketClick(ticket)}
          className="cursor-pointer border border-gray-300 rounded-lg p-4 bg-white shadow-md hover:shadow-lg hover:border-blue-400 transition-all"
        >
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            ticketID: {ticket.ticketId}
          </h3>
          <p><strong>ID:</strong> {ticket.employeeId}</p>
          <p><strong>Title:</strong> {ticket.title}</p>
          <p><strong>Submitted:</strong> {formatDateIST(ticket.sentAt )}</p>

          <p><strong>Status:</strong> {ticket.status}</p>
          <p><strong>Description:</strong> {ticket.description}</p>
          <p><strong>Assigned to:</strong> {ticket.roles}</p>
        </div>
      ))}
    </div>
  );
}
