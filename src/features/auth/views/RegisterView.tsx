import { Link, Loader2, Mail, Phone, User, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { registerSchema, type RegisterInput } from "../validation/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMutation } from "../hooks/useAuthMutation";

export default function RegisterView() {
  const { mutate: registerUser, isPending, error: mutationError } = useRegisterMutation();

  // Initialize React Hook Form and tie it to your Zod structural schema rules
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterInput) => {
    registerUser(data); // Triggers your TanStack Query mutation pipeline
  };

  // Extract API error response strings cleanly
  const apiError = (mutationError as any)?.response?.data?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Create Your Account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Join CrossPesa transaction networks</p>
        </div>

        {(apiError || errors.root) && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {apiError || 'Please fix the validation parameters below.'}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          
          {/* First Name & Last Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  {...register('firstName')}
                  className={`pl-10 w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${
                    errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  placeholder="Emmanuel"
                />
              </div>
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                {...register('lastName')}
                className={`mt-1 w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${
                  errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500'
                }`}
                placeholder="Odhiambo"
              />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email Address Field */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                {...register('email')}
                className={`pl-10 w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${
                  errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500'
                }`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <div className="mt-1 relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                {...register('phoneNumber')}
                className={`pl-10 w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${
                  errors.phoneNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500'
                }`}
                placeholder="+254 700 000000"
              />
            </div>
            {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                {...register('password')}
                className={`pl-10 w-full p-2.5 border rounded-lg outline-none focus:ring-2 ${
                  errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Action Trigger Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}