import { useEffect, useState } from "react";
import { useBeneficiaries } from "../hooks/useBeneficiaries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { beneficiarySchema, type BeneficiaryFormData } from "../validation/beneficiarySchema";
import { AlertCircle, Edit2, Trash2 } from "lucide-react";

export const BeneficiaryPage: React.FC = () => {
const { data, isLoading, error: apiError, load, add, update, remove } = useBeneficiaries();
const [editingId, setEditingId] = useState<string | null>(null);

const {
register,
handleSubmit,
reset,
formState: { errors, isSubmitting }
} = useForm({
resolver: zodResolver(beneficiarySchema)
});

useEffect(() => {
load();
}, [load]);

const onSubmit = async (formData: BeneficiaryFormData) => {
try {
if (editingId) {
await update(editingId, formData);
setEditingId(null);
} else {
await add(formData);
}
reset(); // Clear the form on success
} catch (err) {
// API errors handled by the hook
}
};

const handleEdit = (beneficiary: any) => {
setEditingId(beneficiary.id);
reset(beneficiary);
window.scrollTo({ top: 0, behavior: 'smooth' });
};

return (
  <div className="max-w-4xl mx-auto p-4 space-y-6">
     {editingId ? "Edit Beneficiary" : "Add Beneficiary"}


  {apiError && (
    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
      <AlertCircle size={20} />
      {apiError}
    </div>
  )}

  {/* The form must wrap the button to trigger submit */}
  <div className="mt-4">
  <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">First Name</label>
      <input {...register("firstName")} placeholder="John" className={`w-full border p-2 rounded outline-none focus:ring-2 ${errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`} />
      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Last Name</label>
      <input {...register("lastName")} placeholder="Doe" className={`w-full border p-2 rounded outline-none focus:ring-2 ${errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`} />
      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Type</label>
      <select {...register("beneficiaryType")} className={`w-full border p-2 rounded bg-white outline-none focus:ring-2 ${errors.beneficiaryType ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`}>
        <option value="">Select Type...</option>
        <option value="INDIVIDUAL">Individual</option>
        <option value="ORGANIZATION">Organization</option>
        <option value="BUSINESS">Business</option>
      </select>
      {errors.beneficiaryType && <p className="text-red-500 text-xs mt-1">{errors.beneficiaryType.message}</p>}
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Email</label>
      <input {...register("email")} type="email" placeholder="john@example.com" className={`w-full border p-2 rounded outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`} />
      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Phone Number</label>
      <input {...register("phoneNumber")} placeholder="+254700000000" className={`w-full border p-2 rounded outline-none focus:ring-2 ${errors.phoneNumber ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`} />
      {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Country & City</label>
      <div className="flex gap-2">
        <input {...register("countryCode")} placeholder="KE" className={`w-1/3 border p-2 rounded outline-none focus:ring-2 ${errors.countryCode ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`} />
        <input {...register("city")} placeholder="Nairobi" className={`w-2/3 border p-2 rounded outline-none focus:ring-2 ${errors.city ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`} />
      </div>
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Transfer Method</label>
      <select {...register("payoutMethod")} className={`w-full border p-2 rounded bg-white outline-none focus:ring-2 ${errors.payoutMethod ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`}>
        <option value="">Select Method...</option>
        <option value="BANK_TRANSFER">Bank Transfer</option>
        <option value="MOBILE_MONEY">Mobile Money</option>
        <option value="CARD_PAYMENT">Card Payment</option>
      </select>
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Provider</label>
      <select {...register("payoutProvider")} className={`w-full border p-2 rounded bg-white outline-none focus:ring-2 ${errors.payoutProvider ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`}>
        <option value="">Select Provider...</option>
        <option value="EQUITY_BANK">Equity Bank</option>
        <option value="MPESA">M-Pesa</option>
        <option value="VISA">Visa</option>
        <option value="MASTERCARD">Mastercard</option>
      </select>
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Account Number</label>
      <input {...register("accountNumber")} placeholder="Account / Phone No" className={`w-full border p-2 rounded outline-none focus:ring-2 ${errors.accountNumber ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`} />
    </div>

    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Currency</label>
      <select {...register("accountCurrency")} className={`w-full border p-2 rounded bg-white outline-none focus:ring-2 ${errors.accountCurrency ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'}`}>
        <option value="">Select Currency...</option>
        <option value="KES">KES</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>
    </div>

    <div className="col-span-1 md:col-span-2 flex gap-3 mt-4 border-t pt-4">
      <button 
        type="submit" 
        disabled={isSubmitting} 
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : "Save Beneficiary"}
      </button>
      {editingId && (
        <button 
          type="button" 
          onClick={() => { setEditingId(null); reset(); }} 
          className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  </form>

  {/* List */}
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-800">Saved Beneficiaries</h2>
    {isLoading ? <div className="text-slate-500 animate-pulse">Loading...</div> : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(data.content || data || []).map((b: any) => (
          <div key={b.id} className="bg-white p-5 flex justify-between items-start border border-slate-200 rounded-xl shadow-sm">
            <div>
              <p className="font-bold text-slate-800">{b.firstName} {b.lastName}</p>
              <p className="text-sm text-slate-600">{b.payoutProvider} • {b.accountNumber}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(b)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={18}/></button>
              <button onClick={() => remove(b.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
</div>
);

}