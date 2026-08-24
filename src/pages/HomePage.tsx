import { AlertCircle, ArrowDownUp, ArrowRight, CheckCircle2, Globe, Info, Shield, Wallet, Zap } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Currencies } from "../features/wallet/validation/walletSchema";
import { fetchAndValidateQuote } from "../features/rates/services/rateService";

export const HomePage: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // --- Calculator & Real-time Quote State ---
  const [amount, setAmount] = useState<string>("1000");
  const [sourceCurrency, setSourceCurrency] = useState<string>("GBP");
  const [targetCurrency, setTargetCurrency] = useState<string>("KES");
  
  const [quoteData, setQuoteData] = useState<any>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Fetch live backend quote whenever amount or currency pairs change
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
      if (sourceCurrency === targetCurrency) {
        setQuoteError("Source and target currencies must be different.");
        return;
      }

      setIsLoadingQuote(true);
      setQuoteError(null);

      try {
        // Fetching real exchange rate and metadata from backend service
        const response = await fetchAndValidateQuote(sourceCurrency, targetCurrency);
        setQuoteData(response);
      } catch (err: any) {
        setQuoteError(err.response?.data?.message || "Failed to fetch live quote from engine.");
        setQuoteData(null);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    const debounceTimer = setTimeout(fetchQuote, 400);
    return () => clearTimeout(debounceTimer);
  }, [amount, sourceCurrency, targetCurrency]);

  // Calculations derived directly from backend quote data if available, with smooth fallback simulation
  const numericAmount = parseFloat(amount) || 0;
  const exchangeRate = quoteData?.exchangeRate || 166.0256;
  
  // Dynamic breakdown matching your TransactionFeeEngineService backend model
  const normalizedUsd = quoteData?.usdBaselineAmount || (numericAmount / (sourceCurrency === 'USD' ? 1 : 0.78));
  let markupRate = 0.0060;
  if (normalizedUsd > 5000) markupRate = 0.0020;
  else if (normalizedUsd > 1000) markupRate = 0.0040;

  const platformMarkup = quoteData?.platformMarkupFee || (numericAmount * markupRate);
  const routingFee = quoteData?.routingCostFee || (numericAmount * 0.0030);
  const totalFee = quoteData?.totalPlatformFee || (platformMarkup + routingFee);
  const recipientGets = quoteData?.payoutAmountTarget || Math.max(0, (numericAmount - totalFee) * exchangeRate);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* --- Navigation Bar --- */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Wallet size={24} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">CrossPesa</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#calculator" className="hover:text-indigo-600 transition-colors">Live Rates</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#security" className="hover:text-indigo-600 transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link 
                to="/dashboard" 
                className="font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-200 flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="font-semibold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
             Pricing Engine Connected Live
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Move money across borders, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">instantly.</span>
          </h1>
          
          <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            Test our real-time backend engine below. Preview exact tier brackets, corridor routing costs, and recipient payouts instantly.
          </p>
        </div>
      </header>

      {/* --- Interactive Live Calculator Preview Widget --- */}
      <section id="calculator" className="pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Inputs */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Live Transfer Quote Preview</h3>
              <p className="text-xs text-slate-500">Powered directly by our secure transaction engine.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">You Send</label>
              <div className="flex gap-3">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-slate-200 p-3.5 rounded-2xl text-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="1000"
                />
                <select 
                  value={sourceCurrency}
                  onChange={(e) => setSourceCurrency(e.target.value)}
                  className="bg-slate-100 border border-slate-200 font-bold px-4 py-3 rounded-2xl outline-none text-slate-700 cursor-pointer"
                >
                  {Currencies.map((cur) => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center -my-2">
              <div className="p-2 bg-slate-100 border border-slate-200 rounded-full text-slate-600 shadow-sm">
                <ArrowDownUp size={16} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Recipient Gets (Estimated)</label>
              <div className="flex gap-3">
                <div className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xl font-extrabold text-indigo-600 flex items-center justify-between">
                  <span>{recipientGets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  {isLoadingQuote && (
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <select 
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="bg-slate-100 border border-slate-200 font-bold px-4 py-3 rounded-2xl outline-none text-slate-700 cursor-pointer"
                >
                  {Currencies.map((cur) => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>
            </div>

            {quoteError && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1.5">
                <AlertCircle size={14} /> {quoteError}
              </p>
            )}
          </div>

          {/* Right Side: Airtight Ledger Breakdown Preview */}
          <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-6 border border-slate-200/60 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ledger Audit Summary</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} /> Live Engine Active
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applied Exchange Rate</span>
                  <span className="font-semibold text-slate-800">1 {sourceCurrency} = {exchangeRate.toFixed(4)} {targetCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Platform Markup Fee</span>
                  <span className="font-semibold text-slate-800">{platformMarkup.toFixed(2)} {sourceCurrency} <span className="text-[10px] text-indigo-600 font-bold">({(markupRate * 100).toFixed(2)}% tier)</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Corridor Routing Cost</span>
                  <span className="font-semibold text-slate-800">{routingFee.toFixed(2)} {sourceCurrency}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-200 font-bold text-slate-900">
                  <span>Total Platform Fees</span>
                  <span className="text-indigo-600">{totalFee.toFixed(2)} {sourceCurrency}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link 
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-center"
              >
                Send This Amount Now <ArrowRight size={18} />
              </Link>
              <p className="text-[10px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
                <Info size={12} /> Rates lock for 10 minutes upon transaction initiation.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for modern global finance</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Everything you need to manage your money globally, wrapped in a beautiful, easy-to-use platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Currency Wallets</h3>
              <p className="text-slate-500 leading-relaxed">Hold, exchange, and send funds across 12 supported currencies—all from a single dashboard.</p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
              <p className="text-slate-500 leading-relaxed">90% of our transfers arrive in seconds. Powered by direct integrations with local payment networks like M-PESA.</p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Bank-grade Security</h3>
              <p className="text-slate-500 leading-relaxed">Your money is safeguarded with regulated tier-1 banks. We use TLS encryption and strict idempotency checks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 opacity-80">
            <Wallet size={20} className="text-indigo-400" />
            <span className="text-xl font-bold text-white tracking-tight">CrossPesa</span>
          </div>
          <p className="mb-6 max-w-md">The modern way to send money globally. Built with ❤️ for financial freedom.</p>
          <p className="text-sm opacity-60"> &copy; {new Date().getFullYear()} CrossPesa Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};