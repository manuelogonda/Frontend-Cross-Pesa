import { ReceiptText, RefreshCw } from "lucide-react";
import { useLedgerStatement } from "../hooks/useLedgerStatement";
import { LedgerTable } from "../components/LedgerTable";

export const LedgerPage = () => {
  const { 
    entries, 
    page, 
    totalPages, 
    totalElements, 
    loading, 
    error, 
    nextPage, 
    prevPage, 
    refresh 
  } = useLedgerStatement(10);

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm">
            <ReceiptText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Wallet Statement</h1>
            <p className="text-xs text-slate-500">Immutable double-entry transaction record</p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-indigo-600' : ''} />
          Refresh
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Render the reusable Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <LedgerTable 
          entries={entries}
          isLoading={loading}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onNextPage={nextPage}
          onPrevPage={prevPage}
        />
      </div>

    </div>
  );
};