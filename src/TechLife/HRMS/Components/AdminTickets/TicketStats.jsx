import { Ticket, CheckCircle2, AlertTriangle } from "lucide-react";

export default function TicketStats({ tickets }) {
  const total = tickets.length;
  const resolved = tickets.filter((t) => t.status === "Resolved").length;
  const unsolved = tickets.filter((t) => t.status !== "Resolved").length;

  const cardBase =
    "flex items-center gap-4 p-5 rounded-xl shadow-md border bg-white hover:shadow-lg transition-all";

  return (
    <div className="px-4 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Tickets */}
        <div className={`${cardBase} border-blue-200`}>
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
            <Ticket size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Tickets</p>
            <h3 className="text-3xl font-bold text-blue-700">{total}</h3>
          </div>
        </div>

        {/* Solved Tickets */}
        <div className={`${cardBase} border-emerald-200`}>
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Solved Tickets</p>
            <h3 className="text-3xl font-bold text-emerald-600">{resolved}</h3>
          </div>
        </div>

        {/* Unsolved Tickets */}
        <div className={`${cardBase} border-red-200`}>
          <div className="bg-red-100 text-red-600 p-3 rounded-full">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Unsolved Tickets</p>
            <h3 className="text-3xl font-bold text-red-600">{unsolved}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
