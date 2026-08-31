import { useBeneficiaries } from "../hooks/useBeneficiaries";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Edit2, Edit3, Plus, Trash2, Users } from "lucide-react";
import { BENEFICIARY_TYPES, beneficiarySchema, PAYOUT_METHODS, PAYOUT_PROVIDERS, type BeneficiaryFormData } from "../validation/beneficiarySchema";
import type { Beneficiary } from "../validation/beneficiarySchema";
import { Currencies } from "../../wallet/validation/walletSchema";
import { deriveFromPhone } from "../../../lib/phoneCountry";
import { usePayoutInstitutions } from "../hooks/usePayoutsInstitutions";
import { useEffect, useState, type FormEvent } from "react";
import { PasswordConfirmationModal } from "../../../components/ui/PasswordConfirmationModal";
import { buildStepUpContext } from "../../../lib/stepUp";
import { authService } from "../../auth/services/authService";
import { toast } from "../../../store/toastStore";



export const formatEnumString = (str: string) => {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export const BeneficiaryPage = () => {
  const { 
    beneficiaries: rawBeneficiaries, 
    isLoading, 
    error: apiError, 
    load,
    add, 
    update, 
    remove,
  } = useBeneficiaries();

  useEffect(() => {
    load();
  }, [load]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    | { kind: "create"; payload: BeneficiaryFormData }
    | { kind: "update"; beneficiaryId: string; payload: BeneficiaryFormData }
    | { kind: "delete"; beneficiaryId: string }
    | null
  >(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [pageFeedback, setPageFeedback] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

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
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema)
  });

  const buildBeneficiaryCreateContext = (payload: BeneficiaryFormData) =>
    buildStepUpContext([
      ["firstName", payload.firstName],
      ["lastName", payload.lastName],
      ["beneficiaryType", payload.beneficiaryType],
      ["email", payload.email],
      ["phoneNumber", payload.phoneNumber],
      ["countryCode", payload.countryCode],
      ["city", payload.city],
      ["payoutMethod", payload.payoutMethod],
      ["payoutProvider", payload.payoutProvider],
      ["accountNumber", payload.accountNumber],
      ["bankCode", payload.bankCode],
      ["accountCurrency", payload.accountCurrency],
    ]);

  const buildBeneficiaryUpdateContext = (beneficiaryId: string, payload: BeneficiaryFormData) =>
    buildStepUpContext([
      ["beneficiaryId", beneficiaryId],
      ["firstName", payload.firstName],
      ["lastName", payload.lastName],
      ["beneficiaryType", payload.beneficiaryType],
      ["email", payload.email],
      ["phoneNumber", payload.phoneNumber],
      ["countryCode", payload.countryCode],
      ["city", payload.city],
      ["payoutMethod", payload.payoutMethod],
      ["payoutProvider", payload.payoutProvider],
      ["accountNumber", payload.accountNumber],
      ["bankCode", payload.bankCode],
      ["accountCurrency", payload.accountCurrency],
    ]);

  const buildBeneficiaryDeleteContext = (beneficiaryId: string) =>
    buildStepUpContext([["beneficiaryId", beneficiaryId]]);

  const openPasswordModal = (nextAction: NonNullable<typeof pendingAction>) => {
    setPendingAction(nextAction);
    setPasswordValue("");
    setPasswordError(null);
    setPageFeedback(null);
    setPasswordModalOpen(true);
  };

  const raiseBeneficiaryFeedback = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setPageFeedback({ type, title, message });
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setPasswordValue("");
    setPasswordSubmitting(false);
    setPasswordError(null);
    setPendingAction(null);
  };

  const submitPasswordConfirmation = async (e: FormEvent) => {
    e.preventDefault();
    if (!pendingAction) return;

    setPasswordSubmitting(true);
    setPasswordError(null);

    try {
      const verification = await authService.confirmPassword({
        action:
          pendingAction.kind === "create"
            ? "BENEFICIARY_CREATE"
            : pendingAction.kind === "update"
              ? "BENEFICIARY_UPDATE"
              : "BENEFICIARY_DELETE",
        context:
          pendingAction.kind === "create"
            ? buildBeneficiaryCreateContext(pendingAction.payload)
            : pendingAction.kind === "update"
              ? buildBeneficiaryUpdateContext(pendingAction.beneficiaryId, pendingAction.payload)
              : buildBeneficiaryDeleteContext(pendingAction.beneficiaryId),
        password: passwordValue,
      });

      const action = pendingAction;

      if (action.kind === "create") {
        await add(action.payload, verification.stepUpToken);
        reset();
        setEditingId(null);
        raiseBeneficiaryFeedback(
          "success",
          "Beneficiary saved",
          `${action.payload.firstName} ${action.payload.lastName} was added successfully.`
        );
      } else if (action.kind === "update") {
        await update(action.beneficiaryId, action.payload, verification.stepUpToken);
        reset();
        setEditingId(null);
        raiseBeneficiaryFeedback(
          "success",
          "Beneficiary updated",
          `${action.payload.firstName} ${action.payload.lastName} was updated successfully.`
        );
      } else {
        await remove(action.beneficiaryId, verification.stepUpToken);
        if (editingId === action.beneficiaryId) {
          reset();
          setEditingId(null);
        }
        raiseBeneficiaryFeedback("success", "Beneficiary deleted", "The beneficiary was removed successfully.");
      }

      closePasswordModal();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || "Password confirmation failed";
      setPasswordError(message);
      setPageFeedback({ type: "error", title: "Beneficiary action failed", message });
      toast.error(message);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Live Flutterwave bank/network codes for the payout country.
  // The selected institution's code becomes bankCode in the payload.
  const watchCountryCode = watch("countryCode");
  const {
    institutions: payoutInstitutions,
    isLoading: institutionsLoading,
    error: institutionsError,
  } = usePayoutInstitutions(watchCountryCode);

  // Country changed → previously selected code may no longer route payouts
  useEffect(() => {
    setValue("bankCode", "");
  }, [watchCountryCode, setValue]);

  const onSubmit = async (formData: BeneficiaryFormData) => {
    openPasswordModal(
      editingId
        ? { kind: "update", beneficiaryId: editingId, payload: formData }
        : { kind: "create", payload: formData }
    );
  };

  const clearPageFeedback = () => setPageFeedback(null);

  const handleEdit = (beneficiary: Beneficiary) => {
    if (!beneficiary.id) return;
    setEditingId(beneficiary.id);
    
    // Explicitly map properties to match the strict form data types
    reset({
      firstName: beneficiary.firstName,
      lastName: beneficiary.lastName,
      beneficiaryType: beneficiary.beneficiaryType as BeneficiaryFormData['beneficiaryType'],
      email: beneficiary.email,
      phoneNumber: beneficiary.phoneNumber,
      countryCode: beneficiary.countryCode,
      city: beneficiary.city || '',
      payoutMethod: beneficiary.payoutMethod as BeneficiaryFormData['payoutMethod'],
      payoutProvider: beneficiary.payoutProvider as BeneficiaryFormData['payoutProvider'],
      bankCode: beneficiary.bankCode || '',
      accountNumber: beneficiary.accountNumber,
      accountCurrency: beneficiary.accountCurrency as BeneficiaryFormData['accountCurrency'],
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
          <Users size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Beneficiaries</h1>
          <p className="text-sm text-slate-500 mt-1">Save and edit contacts for fast, secure cross-border payouts.</p>
        </div>
      </div>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-sm font-medium">
          <AlertCircle size={20} className="shrink-0" />
          {apiError}
        </div>
      )}

      {pageFeedback && (
        <div
          className={`p-4 rounded-xl border shadow-sm flex items-start gap-3 ${
            pageFeedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {pageFeedback.type === "success" ? (
            <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{pageFeedback.title}</p>
            <p className="text-sm mt-0.5">{pageFeedback.message}</p>
          </div>
          <button
            type="button"
            onClick={clearPageFeedback}
            className="text-inherit opacity-70 hover:opacity-100 text-sm font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TOP SECTION: Form Container */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-6 pb-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {editingId ? <Edit3 size={20} className="text-indigo-600" /> : <Plus size={20} className="text-indigo-600" />}
             <span>{editingId ? "Edit Beneficiary Details" : "Add New Beneficiary"}</span>
          </h2>
          {editingId && (
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
              Editing Mode Active
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name</label>
              <input {...register("firstName")} placeholder="John" className={`w-full border p-3 rounded-xl text-sm outline-none focus:ring-2 transition-all ${errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Last Name</label>
              <input {...register("lastName")} placeholder="Doe" className={`w-full border p-3 rounded-xl text-sm outline-none focus:ring-2 transition-all ${errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
              <select {...register("beneficiaryType")} className={`w-full border p-3 rounded-xl text-sm bg-white outline-none focus:ring-2 transition-all ${errors.beneficiaryType ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`}>
                <option value="">Select Type...</option>
                {BENEFICIARY_TYPES.map(type => (
                  <option key={type} value={type}>{formatEnumString(type)}</option>
                ))}
              </select>
              {errors.beneficiaryType && <p className="text-red-500 text-xs mt-1">{errors.beneficiaryType.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
              <input {...register("email")} type="email" placeholder="john@example.com" className={`w-full border p-3 rounded-xl text-sm outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input {...register("phoneNumber")} placeholder="+254700000000"
                onChange={(e) => {
                  register("phoneNumber").onChange(e);
                  const derived = deriveFromPhone(e.target.value, { defaultCountry: "KE" });
                  if (derived) {
                    setValue("countryCode", derived.countryCode, { shouldValidate: true });
                    setValue("accountCurrency", derived.currency, { shouldValidate: true });
                  }
                }} className={`w-full border p-3 rounded-xl text-sm outline-none focus:ring-2 transition-all ${errors.phoneNumber ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location (Country / City)</label>
              <div className="flex gap-2">
                <input {...register("countryCode")} placeholder="KE" className={`w-1/3 border p-3 rounded-xl text-sm uppercase outline-none focus:ring-2 transition-all ${errors.countryCode ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
                <input {...register("city")} placeholder="Nairobi" className={`w-2/3 border p-3 rounded-xl text-sm outline-none focus:ring-2 transition-all ${errors.city ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
              </div>
              {errors.countryCode && <p className="text-red-500 text-xs mt-1">{errors.countryCode.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Payout Method</label>
              <select {...register("payoutMethod")} className={`w-full border p-3 rounded-xl text-sm bg-white outline-none focus:ring-2 transition-all ${errors.payoutMethod ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`}>
                <option value="">Select Method...</option>
                {PAYOUT_METHODS.map(method => (
                  <option key={method} value={method}>{formatEnumString(method)}</option>
                ))}
              </select>
              {errors.payoutMethod && <p className="text-red-500 text-xs mt-1">{errors.payoutMethod.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Provider</label>
              <select {...register("payoutProvider")} className={`w-full border p-3 rounded-xl text-sm bg-white outline-none focus:ring-2 transition-all ${errors.payoutProvider ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`}>
                <option value="">Select Provider...</option>
                {PAYOUT_PROVIDERS.map(provider => (
                  <option key={provider} value={provider}>{formatEnumString(provider)}</option>
                ))}
              </select>
              {errors.payoutProvider && <p className="text-red-500 text-xs mt-1">{errors.payoutProvider.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Account Number / Phone</label>
              <input {...register("accountNumber")} placeholder="Acc / Phone No" className={`w-full border p-3 rounded-xl text-sm outline-none focus:ring-2 transition-all ${errors.accountNumber ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
              {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bank / Network</label>

              {payoutInstitutions.length > 0 ? (
                <select {...register("bankCode")}
                  className={`w-full border p-3 rounded-xl text-sm bg-white outline-none focus:ring-2 transition-all ${errors.bankCode ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`}>
                  <option value="">Select institution…</option>
                  {payoutInstitutions.map((inst) => (
                    <option key={`${inst.id}-${inst.code}`} value={inst.code}>
                      {inst.name} ({inst.code})
                    </option>
                  ))}
                </select>
              ) : (
                <>
              <input {...register("bankCode")} list="payout-bank-codes"
                placeholder={institutionsLoading ? 'Loading banks…' : 'e.g. MPS / ATL / 058'}
                className={`w-full border p-3 rounded-xl text-sm uppercase outline-none focus:ring-2 transition-all ${errors.bankCode ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`} />
                </>
              )}
              <datalist id="payout-bank-codes">
                {payoutInstitutions.length > 0 ? payoutInstitutions.map((inst) => (
                  <option key={`${inst.id}-${inst.code}`} value={inst.code}>
                    {inst.name} ({inst.code})
                  </option>
                )) : (
                  <>
                    <option value="MPS">M-Pesa Kenya</option>
                    <option value="ATL">Airtel Kenya</option>
                  </>
                )}
              </datalist>

              {institutionsError && (
                <p className="text-[9px] text-amber-600 mt-1">{institutionsError}</p>
              )}
              {errors.bankCode && <p className="text-red-500 text-xs mt-1">{errors.bankCode.message}</p>}
              {!institutionsError && payoutInstitutions.length === 0 && !institutionsLoading && (
                <p className="text-[9px] text-slate-400 mt-1">
                  Live list unavailable — enter the Flutterwave code exactly (MPS = M-Pesa KE).
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Account Currency</label>
              <select {...register("accountCurrency")} className={`w-full border p-3 rounded-xl text-sm bg-white outline-none focus:ring-2 transition-all ${errors.accountCurrency ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`}>
                <option value="">Select Currency...</option>
                {Currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
              {errors.accountCurrency && <p className="text-red-500 text-xs mt-1">{errors.accountCurrency.message}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100 justify-end">
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); reset(); }} 
                className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-slate-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? "Saving..." : editingId ? "Update Beneficiary" : "Save Beneficiary"}
            </button>
          </div>
        </form>
      </div>

      {/* BOTTOM SECTION: Persistent Beneficiaries List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xl font-bold text-slate-900">Saved Beneficiaries</h2>
          <span className="px-3.5 py-1 bg-slate-200/70 text-slate-800 text-xs font-bold rounded-full">
            {beneficiaryList.length} Total
          </span>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-medium text-sm">Loading saved contacts...</p>
            </div>
          ) : beneficiaryList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3 text-center">
              <Users size={48} className="opacity-20" />
              <p className="font-medium text-slate-700">No beneficiaries saved yet.</p>
              <p className="text-xs text-slate-500">Fill out the form above to add your first recipient.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {beneficiaryList.map((b) => (
                <div key={b.id || b.accountNumber} className="bg-white p-5 flex flex-col justify-between border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all relative group">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
                        {b.firstName?.[0] || '?'}{b.lastName?.[0] || '?'}
                      </span>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 text-sm truncate">{b.firstName} {b.lastName}</p>
                        <p className="text-xs font-semibold text-indigo-600">{formatEnumString(b.beneficiaryType)}</p>
                        {!b.bankCode && (
                          <span className="inline-block bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5">
                            PAYOUT SETUP INCOMPLETE — EDIT &amp; RE-SAVE
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <p className="flex justify-between">
                        <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Account</span>
                        <span className="font-medium text-slate-700">{b.accountNumber}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Provider</span>
                        <span className="font-medium text-slate-700">{formatEnumString(b.payoutProvider)} ({b.accountCurrency})</span>
                      </p>
                      {b.bankCode && (
                        <p className="flex justify-between">
                          <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider">Bank Code</span>
                          <span className="font-medium text-slate-700">{b.bankCode}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-200">
                    <button 
                      onClick={() => handleEdit(b)} 
                      className="p-1.5 text-slate-600 rounded-md hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={13}/>
                    </button>
                    <button 
                      onClick={async () => {
                        setPageFeedback(null);
                        openPasswordModal({ kind: "delete", beneficiaryId: b.id! });
                      }} 
                      className="p-1.5 text-slate-600 rounded-md hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PasswordConfirmationModal
        open={passwordModalOpen}
        title={
          pendingAction?.kind === "delete"
            ? "Confirm beneficiary deletion"
            : pendingAction?.kind === "update"
              ? "Confirm beneficiary update"
              : "Confirm beneficiary creation"
        }
        description="Enter your password to complete this beneficiary action."
        password={passwordValue}
        error={passwordError}
        isSubmitting={passwordSubmitting}
        submitLabel="Confirm"
        onPasswordChange={setPasswordValue}
        onSubmit={submitPasswordConfirmation}
        onCancel={closePasswordModal}
      />
    </div>
  );
};
