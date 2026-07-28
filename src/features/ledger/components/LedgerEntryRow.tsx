import { ArrowDownLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { LedgerService } from "../services/LedgerService";

export const LedgerEntryRow: React.FC<LedgerEntryRowProps> = ({ entry }) => {
  const isCredit = entry.direction === 'CREDIT';
  const isNeutral = entry.direction === 'NEUTRAL'; // Handles 0-value audit entries if any
  const classMeta = LedgerService.formatEntryClass(entry.entryClass);

  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100 text-sm">
      {/* Date & Time */}
      <td className="p-4 whitespace-nowrap text-slate-500">
        <div className="font-medium text-slate-700">{new Date(entry.createdAt).toLocaleDateString()}</div>
        <div className="text-xs text-slate-400">
          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </td>

      {/* Description & Entry Class Badge */}
      <td className="p-4">
        <div className="font-medium text-slate-800">{entry.description}</div>
        <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold border rounded-md ${classMeta.badgeColor}`}>
          {classMeta.label}
        </span>
      </td>

      {/* Direction & Amount */}
      <td className="p-4 whitespace-nowrap">
        <div className={`flex items-center gap-1.5 font-bold ${
          isCredit ? 'text-emerald-600' : isNeutral ? 'text-slate-500' : 'text-slate-800'
        }`}>
          {isCredit ? <ArrowDownLeft size={16} /> : isNeutral ? <ArrowRight size={16} /> : <ArrowUpRight size={16} />}
          <span>{entry.formattedAmount}</span>
        </div>
      </td>

      {/* Post-Transaction Running Balance */}
      <td className="p-4 whitespace-nowrap font-mono text-slate-600 font-medium">
        {entry.formattedBalance}
      </td>
    </tr>
  );
};