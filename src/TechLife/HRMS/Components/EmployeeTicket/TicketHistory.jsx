export default function TicketHistory({ tickets, onTicketClick }) {
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
          <h3 className="text-lg font-semibold text-blue-700 mb-2">ticketID: {ticket.ticketId}</h3>
          <p><strong>ID:</strong> {ticket.employeeId}</p>
          <p><strong>Title:</strong> {ticket.title}</p>
          <p><strong>Submitted:</strong> {ticket.sentAt}</p>
          <p><strong>status:</strong> {ticket.status}</p>
          <p><strong>description :</strong> {ticket.description}</p>
            <p><strong>assigned to :</strong> {ticket.roles}</p>
        </div>
      ))}
    </div>
  );
}