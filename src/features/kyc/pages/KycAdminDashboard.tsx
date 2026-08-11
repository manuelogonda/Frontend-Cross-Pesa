import { useEffect, useState } from "react";
import { useKyc } from "../hooks/useKyc";
import type { KycResponse, PaginatedResponse } from "../services/KycService";
import { Camera, CheckCircle, FileText, XCircle } from "lucide-react";

export const KycAdminDashboard = () => {
  const { getAdminQueue, processReview, isLoading } = useKyc();
  
  const [data, setData] = useState<PaginatedResponse<KycResponse> | null>(null);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const fetchPage = async (pageIndex: number, filter: string) => {
    const result = await getAdminQueue(pageIndex, 10, filter);
    if (result) setData(result);
  };

  useEffect(() => {
    fetchPage(page, statusFilter);
  }, [page, statusFilter]);

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    const reason = action === 'REJECTED' ? prompt("Rejection Reason:") : undefined;
    if (action === 'REJECTED' && !reason) return; // Cancelled
    
    await processReview(id, action, reason ?? undefined);
    fetchPage(page, statusFilter); // Refresh data
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">KYC Review Queue</h1>
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="p-2 border rounded-lg bg-slate-50"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-sm">
              <th className="p-4 rounded-tl-lg">User Email</th>
              <th className="p-4">Document</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4">Verification Assets</th> {/* Added missing header for alignment */}
              <th className="p-4 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data?.content.map((sub) => (
              <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium">{sub.userEmail}</td>
                <td className="p-4">{sub.documentType} ({sub.documentCountry})</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    sub.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    sub.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="p-4 text-slate-500">{new Date(sub.createdAt).toLocaleDateString()}</td>

                {/* CLOUDINARY IMAGE REVIEW LINKS */}
                <td className="p-4">
                  <div className="flex gap-2 text-xs">
                    {sub.idImageUrl ? (
                      <a 
                        href={sub.idImageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline font-medium flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded border border-indigo-100"
                      >
                        <FileText size={14} />
                        <span>Document</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No ID</span>
                    )}

                    {sub.selfieImageUrl ? (
                      <a 
                        href={sub.selfieImageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline font-medium flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded border border-indigo-100"
                      >
                        <Camera size={14} />
                        <span>Selfie</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No Selfie</span>
                    )}
                  </div>
                </td>

                <td className="p-4 flex gap-2 items-center">
                  {sub.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleAction(sub.id, 'APPROVED')} 
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition flex items-center gap-1 text-xs font-semibold"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleAction(sub.id, 'REJECTED')} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition flex items-center gap-1 text-xs font-semibold"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 p-4 border-t">
          <button 
            disabled={page === 0 || isLoading} 
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">Page {data.number + 1} of {data.totalPages}</span>
          <button 
            disabled={page === data.totalPages - 1 || isLoading} 
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};