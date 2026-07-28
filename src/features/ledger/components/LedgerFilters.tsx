import { Search, X } from "lucide-react";

export interface LedgerFilterState {
  searchQuery: string;
  directionFilter: 'ALL' | 'CREDIT' | 'DEBIT';
  entryClassFilter: string;
}

interface LedgerFiltersProps {
  filters: LedgerFilterState;
  onFilterChange: (updated: LedgerFilterState) => void;
  onReset: () => void;
}

export const LedgerFilters: React.FC<LedgerFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.directionFilter !== 'ALL' ||
    filters.entryClassFilter !== 'ALL';

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search Description Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search description..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Direction Filter */}
          <select
            value={filters.directionFilter}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                directionFilter: e.target.value as 'ALL' | 'CREDIT' | 'DEBIT',
              })
            }
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Directions</option>
            <option value="CREDIT">Incoming (+ Credit)</option>
            <option value="DEBIT">Outgoing (- Debit)</option>
          </select>

          {/* Entry Class Filter */}
          <select
            value={filters.entryClassFilter}
            onChange={(e) => onFilterChange({ ...filters, entryClassFilter: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="PRINCIPAL_TRANSFER">Transfers</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="MARKUP_FEE">Platform Fees</option>
            <option value="ROUTING_FEE">Network Fees</option>
            <option value="FX_CLEARING">FX Exchanges</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};