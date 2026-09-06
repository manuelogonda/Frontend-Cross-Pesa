import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { FormattedLedgerEntry } from "../types";
import { LedgerEntryRow } from "./LedgerEntryRow";
import { Skeleton } from "../../../components/ui/Skeleton";

interface LedgerTableProps {
  entries: FormattedLedgerEntry[];
  isLoading: boolean;
  page?: number;           // Made optional for when pagination is handled externally
  totalPages?: number;     // Made optional
  totalElements?: number;  // Made optional
  onNextPage?: () => void; // Made optional
  onPrevPage?: () => void; // Made optional
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  entries,
  isLoading,
  page,
  totalPages,
  totalElements,
  onNextPage,
  onPrevPage,
}) => {
  return (
    <div className="bg-white rounded-2xl border-none shadow-none overflow-hidden flex flex-col">
      {/* Table Shell */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Description / Class</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Running Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <tr key={index} aria-hidden="true" className="border-b border-slate-100">
                  <td className="p-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16 mt-2" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-36" /><Skeleton className="h-4 w-20 mt-2" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Inbox size={32} strokeWidth={1.5} />
                    <p className="text-sm font-medium text-slate-600">No ledger entries match your criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry) => <LedgerEntryRow key={entry.id} entry={entry} />)
            )}
          </tbody>
        </table>
      </div>
      {isLoading && <span className="sr-only" role="status">Loading transaction history...</span>}

      {/* Internal Pagination Footer (Renders only if props are provided) */}
      {(page !== undefined && totalPages !== undefined && onNextPage && onPrevPage) && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-xs text-slate-500">
          <span>
            Showing Page <strong className="text-slate-800">{page + 1}</strong> of{' '}
            <strong className="text-slate-800">{Math.max(1, totalPages)}</strong> {totalElements !== undefined && `(${totalElements} entries)`}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onPrevPage}
              disabled={page === 0 || isLoading}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 disabled:opacity-50 hover:bg-slate-100 transition-colors flex items-center gap-1 font-medium shadow-sm"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={onNextPage}
              disabled={page >= totalPages - 1 || isLoading}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 disabled:opacity-50 hover:bg-slate-100 transition-colors flex items-center gap-1 font-medium shadow-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
