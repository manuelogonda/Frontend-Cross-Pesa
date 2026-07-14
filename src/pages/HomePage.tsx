import { ArrowRight, CheckCircle2, Globe, Shield, Wallet, Zap } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
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
      <header className="flex-1 flex items-center justify-center pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Live FX Rates are now available
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
            Move money across borders, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">instantly.</span>
          </h1>
          
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            The secure, lightning-fast platform for global transfers. Send money to over 50 countries with zero hidden fees and real-time market rates.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to={isAuthenticated ? "/dashboard" : "/register"} 
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 text-lg"
            >
              Get Started for Free <ArrowRight size={20} />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2 text-lg"
            >
              See how it works
            </a>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 text-sm font-medium">
            <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> FCA Regulated</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> Bank-level Security</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> 24/7 Support</div>
          </div>
        </div>
      </header>

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
              <p className="text-slate-500 leading-relaxed">Hold, exchange, and send funds in USD, KES, EUR, GBP, and more—all from a single dashboard.</p>
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