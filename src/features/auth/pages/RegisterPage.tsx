import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Loader2, User, Mail, Phone, Lock, Wallet} from 'lucide-react';
import { registerSchema, type RegisterFormData, type RegisterFormInput } from '../validation/authSchema';
import { useRegister } from '../hooks/useAuthMutation';
import { ApiFieldError } from '../services/authService';
import { Currencies } from '../../wallet/validation/walletSchema';
import { deriveFromPhone } from '../../../lib/phoneCountry';
import { PasswordInput } from '../../../components/ui/PasswordInput';

// Fields the backend may reject with per-field validation errors
const SERVER_FIELD_NAMES = ['firstName', 'lastName', 'email', 'phoneNumber', 'password', 'currency'];

export const RegisterPage = () => {
  const { mutateAsync: registerUser, isPending } = useRegister();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormInput, unknown, RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerUser(data);
    } catch (err) {
      if (err instanceof ApiFieldError && Object.keys(err.fieldErrors).length > 0) {
        // Surface each backend validationErrors entry inline on its field.
        // type: 'server' keeps them distinct and clears on the next submit.
        Object.entries(err.fieldErrors).forEach(([field, message]) => {
          if (SERVER_FIELD_NAMES.includes(field)) {
            setError(field as keyof RegisterFormData, { type: 'server', message });
          }
        });
        setServerError(err.message || 'Please fix the highlighted fields.');
        return;
      }
      setServerError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Cross Pesa today
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {serverError}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('firstName')}
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                    placeholder="John"
                  />
                </div>
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('lastName')}
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                  placeholder="example@gmail.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                  placeholder="+254712345678"
                  onChange={(e) => {
                    // Keep react-hook-form's own change handling wired up
                    register('phoneNumber').onChange(e);

                    // Auto-detect wallet currency once the number becomes valid
                    const derived = deriveFromPhone(e.target.value, { defaultCountry: 'KE' });
                    if (derived) {
                      setValue('currency', derived.currency, { shouldValidate: true });
                    }
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                International format (+254…). Wallet currency auto-detects from country.
              </p>
              {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <PasswordInput
                {...register('password')}
                leadingIcon={<Lock className="h-5 w-5 text-gray-400" />}
                autoComplete="new-password"
                className="border-gray-300"
                placeholder="••••••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">
                10–128 characters with at least one uppercase letter, one lowercase letter, one digit, and one special character.
              </p>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wallet Currency <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Wallet className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  {...register('currency')}
                  defaultValue=""
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                >
                  <option value="">Select your preferred currency</option>
                  {Currencies.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">Your retail wallet is created automatically in this currency.</p>
              {errors.currency && <p className="mt-1 text-xs text-red-600">{errors.currency.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-70"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in here
          </Link>
        </p>

        <div className="text-center">
          <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back Home 
          </Link>
        </div>
      </div>
    </div>
  );
};
