import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

type PasswordInputProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  leadingIcon?: ReactNode;
  containerClassName?: string;
};

export const PasswordInput = ({
  leadingIcon,
  containerClassName = "",
  className = "",
  ...props
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative mt-1 ${containerClassName}`.trim()}>
      {leadingIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {leadingIcon}
        </div>
      )}
      <input
        {...props}
        type={isVisible ? "text" : "password"}
        className={`block w-full ${leadingIcon ? "pl-10" : "pl-3"} pr-12 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm ${className}`.trim()}
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
      >
        {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
};
