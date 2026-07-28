import { useBeneficiaries } from "../hooks/useBeneficiaries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Edit2, Trash2, Users } from "lucide-react";
import { BENEFICIARY_TYPES, beneficiarySchema, PAYOUT_METHODS, PAYOUT_PROVIDERS, type BeneficiaryFormData } from "../validation/beneficiarySchema";
import type { Beneficiary } from "../../transfer/types/finance";
import { Currencies } from "../../wallet/validation/walletShema";
import { useState } from "react";

const formatEnumString = (str: string) => {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export const BeneficiaryPage = () => {
  const { beneficiaries: rawBeneficiaries, isLoading, error: apiError, add, update, remove } = useBeneficiaries();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Safely normalize rawBeneficiaries whether it's a raw array or a Spring Page object ({ content: [...] })
  const beneficiaryList: Beneficiary[] = Array.isArray(rawBeneficiaries)
    ? rawBeneficiaries
    : (rawBeneficiaries as any)?.content && Array.isArray((rawBeneficiaries as any).content)
      ? (rawBeneficiaries as any).content
      : [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema)
  });

  const onSubmit = async (formData: BeneficiaryFormData) => {
    try {
      if (editingId) {
        await update(editingId, formData);
        setEditingId(null);
      } else {
        await add(formData);
      }
      reset(); // Clear form state
    } catch (err) {
      // API error handled by hook
    }
  };

  const handleEdit = (beneficiary: Beneficiary) => {
    setEditingId(beneficiary.id!);
    reset(beneficiary); // Pre-fill form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm">
          <Users size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Beneficiaries</h1>
          <p className="text-sm text-slate-500">Save and edit contacts for fast cross-border payouts.</p>
        </div>
      </div>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-sm font-medium">
          <AlertCircle size={20} className="shrink-0" />
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 sticky top-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {editingId ? "✏️ Edit Beneficiary" : "➕ Add Beneficiary"}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                <input {...register("firstName")} placeholder="John" className={`w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 transition-all ${errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
                <input {...register("lastName")} placeholder="Doe" className={`w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 transition-all ${errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
              <select {...register("beneficiaryType")} className={`w-full border p-2.5 rounded-lg text-sm bg-white outline-none focus:ring-2 transition-all ${errors.beneficiaryType ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`}>
                <option value="">Select Type...</option>
                {BENEFICIARY_TYPES.map(type => (
                  <option key={type} value={type}>{formatEnumString(type)}</option>
                ))}
              </select>
              {errors.beneficiaryType && <p className="text-red-500 text-xs mt-1">{errors.beneficiaryType.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
              <input {...register("email")} type="email" placeholder="john@example.com" className={`w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
              <input {...register("phoneNumber")} placeholder="+254700000000" className={`w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 transition-all ${errors.phoneNumber ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Location (Country / City)</label>
              <div className="flex gap-2">
                <input {...register("countryCode")} placeholder="KE" className={`w-1/3 border p-2.5 rounded-lg text-sm uppercase outline-none focus:ring-2 transition-all ${errors.countryCode ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
                <input {...register("city")} placeholder="Nairobi" className={`w-2/3 border p-2.5 rounded-lg text-sm outline-none focus:ring-2 transition-all ${errors.city ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
              </div>
              {errors.countryCode && <p className="text-red-500 text-xs mt-1">{errors.countryCode.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payout Method</label>
              <select {...register("payoutMethod")} className={`w-full border p-2.5 rounded-lg text-sm bg-white outline-none focus:ring-2 transition-all ${errors.payoutMethod ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`}>
                <option value="">Select Method...</option>
                {PAYOUT_METHODS.map(method => (
                  <option key={method} value={method}>{formatEnumString(method)}</option>
                ))}
              </select>
              {errors.payoutMethod && <p className="text-red-500 text-xs mt-1">{errors.payoutMethod.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Provider</label>
              <select {...register("payoutProvider")} className={`w-full border p-2.5 rounded-lg text-sm bg-white outline-none focus:ring-2 transition-all ${errors.payoutProvider ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`}>
                <option value="">Select Provider...</option>
                {PAYOUT_PROVIDERS.map(provider => (
                  <option key={provider} value={provider}>{formatEnumString(provider)}</option>
                ))}
              </select>
              {errors.payoutProvider && <p className="text-red-500 text-xs mt-1">{errors.payoutProvider.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account No.</label>
                <input {...register("accountNumber")} placeholder="Acc / Phone No" className={`w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 transition-all ${errors.accountNumber ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
                {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Currency</label>
                <select {...register("accountCurrency")} className={`w-full border p-2.5 rounded-lg text-sm bg-white outline-none focus:ring-2 transition-all ${errors.accountCurrency ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`}>
                  <option value="">Select...</option>
                  {Currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
                {errors.accountCurrency && <p className="text-red-500 text-xs mt-1">{errors.accountCurrency.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 bg-indigo-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md"
              >
                {isSubmitting ? "Saving..." : "Save Beneficiary"}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => { setEditingId(null); reset(); }} 
                  className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 min-h-[500px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-medium text-sm">Loading contacts...</p>
              </div>
            ) : beneficiaryList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3 text-center">
                <Users size={48} className="opacity-20" />
                <p className="font-medium">No beneficiaries saved yet.</p>
                <p className="text-xs">Add someone using the form to easily send them money later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beneficiaryList.map((b) => (
                  <div key={b.id || b.accountNumber} className="bg-white p-5 flex flex-col justify-between border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative group">
                    <div className="mb-4 pr-12">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {b.firstName?.[0] || '?'}{b.lastName?.[0] || '?'}
                        </span>
                        <p className="font-bold text-slate-800 text-base line-clamp-1">{b.firstName} {b.lastName}</p>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-2">
                        <span className="uppercase text-[10px] tracking-wider text-slate-400">Account: </span>
                        {b.accountNumber}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        <span className="uppercase text-[10px] tracking-wider text-slate-400">Routing: </span>
                        {formatEnumString(b.payoutProvider)} • {b.accountCurrency}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(b)} 
                        className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-colors border border-slate-200"
                        title="Edit"
                      >
                        <Edit2 size={14}/>
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this beneficiary?")) remove(b.id!);
                        }} 
                        className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-200"
                        title="Delete"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};