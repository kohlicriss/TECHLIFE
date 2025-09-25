import { useContext } from "react";
import { Ticket, CheckCircle2, AlertTriangle } from "lucide-react";
import { Context } from "../HrmsContext";

export default function TicketStats({ tickets }) {
  const { theme } = useContext(Context);
  const isDark = theme === "dark";

  const total = tickets.length;
  const resolved = tickets.filter((t) => t.status === "Resolved").length;
  const unsolved = tickets.filter((t) => t.status !== "Resolved").length;

  const cardBase = `flex items-center gap-4 p-5 rounded-xl border transition-all 
    ${isDark ? "bg-gray-800 border-gray-700 shadow-md hover:shadow-lg" : "bg-white shadow-md hover:shadow-lg"}
  `;

  const textMuted = isDark ? "text-white" : "text-gray-500";
  const textPrimary = isDark ? "text-white" : "text-blue-700";

  return (
    <div className="px-4 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
       
        <div className={`${cardBase} ${isDark ? "border-blue-800" : "border-blue-200"}`}>
          <div className={`${isDark ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-600"} p-3 rounded-full`}>
            <Ticket size={28} />
          </div>
          <div>
            <p className={`text-sm ${textMuted}`}>Total Tickets</p>
            <h3 className={`text-3xl font-bold ${textPrimary}`}>{total}</h3>
          </div>
        </div>

      
      
        <div className={`${cardBase} ${isDark ? "border-emerald-800" : "border-emerald-200"}`}>
          <div className={`${isDark ? "bg-emerald-900 text-emerald-300" : "bg-emerald-100 text-emerald-600"} p-3 rounded-full`}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className={`text-sm ${textMuted}`}>Solved Tickets</p>
            <h3 className="text-3xl font-bold text-emerald-600">{resolved}</h3>
          </div>
        </div>

      
      
        <div className={`${cardBase} ${isDark ? "border-red-800" : "border-red-200"}`}>
          <div className={`${isDark ? "bg-red-900 text-red-300" : "bg-red-100 text-red-600"} p-3 rounded-full`}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className={`text-sm ${textMuted}`}>Unsolved Tickets</p>
            <h3 className="text-3xl font-bold text-red-600">{unsolved}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
