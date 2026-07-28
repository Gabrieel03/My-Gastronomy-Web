import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full relative">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-muted flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-lg bg-surface border border-surface-elevated px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(255,107,0,0.2)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
              icon && "pl-10",
              error && "border-danger focus:border-danger focus:shadow-none",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <span className="text-danger text-xs mt-1">{error}</span>}
      </div>
    )
  }
)
Input.displayName = "Input"