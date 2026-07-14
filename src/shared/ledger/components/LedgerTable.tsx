import type { LedgerEntry } from "../validation/ledgerEntrySchema";

interface LedgerTableProps {
  entries: LedgerEntry[];
  isLoading: boolean;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({ entries, isLoading }) => {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Updating ledger records...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <th className="p-4">Date</th>
            <th className="p-4">Description</th>
            <th className="p-4 text-right">Amount</th>
            <th className="p-4 text-right">Balance After</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="p-4 text-sm text-gray-600">
                {new Date(entry.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 text-sm text-gray-800">{entry.description}</td>
              <td className={`p-4 text-sm font-bold text-right ${entry.entryType === 'CREDIT' ? 'text-green-600' : 'text-gray-900'}`}>
                {entry.entryType === 'CREDIT' ? '+' : '-'} {entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="p-4 text-sm text-gray-500 text-right">
                {entry.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};