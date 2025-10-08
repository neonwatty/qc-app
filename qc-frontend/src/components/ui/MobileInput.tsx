
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const mobileInputVariants = cva(
  "flex w-full rounded-md border border-input bg-background text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
  {
    variants: {
      size: {
        default: "h-10 px-3 py-2", // Standard touch-friendly height
        sm: "h-9 px-3 py-2 text-xs",
        lg: "h-12 px-4 py-3 text-base", // Large for better touch
        xl: "h-14 px-5 py-4 text-lg", // Extra large for primary inputs
      },
      variant: {
        default: "",
        filled: "bg-muted border-transparent focus-visible:bg-background focus-visible:border-input",
        ghost: "border-transparent bg-transparent hover:bg-muted/50 focus-visible:bg-muted/50",
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface MobileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof mobileInputVariants> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ 
    className, 
    type, 
    size, 
    variant,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    onRightIconClick,
    id,
    ...props 
  }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              mobileInputVariants({ size, variant }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            id={inputId}
            {...props}
          />
          
          {rightIcon && (
            <div 
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                onRightIconClick && "cursor-pointer hover:text-foreground transition-colors"
              )}
              onClick={onRightIconClick}
            >
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={cn(
            "text-xs",
            error ? "text-destructive" : "text-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
MobileInput.displayName = "MobileInput"

// Specialized mobile input components
const SearchInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, variant = "filled", ...props }, ref) => (
    <MobileInput
      ref={ref}
      type="search"
      className={cn("rounded-full", className)}
      variant={variant}
      {...props}
    />
  )
)
SearchInput.displayName = "SearchInput"

const PasswordInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    
    return (
      <MobileInput
        ref={ref}
        type={showPassword ? "text" : "password"}
        rightIcon={
          <button
            type="button"
            className="text-xs font-medium"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        }
        {...props}
      />
    )
  }
)
PasswordInput.displayName = "PasswordInput"

const NumberInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, ...props }, ref) => (
    <MobileInput
      ref={ref}
      type="number"
      inputMode="numeric"
      className={cn("tabular-nums", className)}
      {...props}
    />
  )
)
NumberInput.displayName = "NumberInput"

const PhoneInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, ...props }, ref) => (
    <MobileInput
      ref={ref}
      type="tel"
      inputMode="tel"
      className={cn("tabular-nums", className)}
      {...props}
    />
  )
)
PhoneInput.displayName = "PhoneInput"

const EmailInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ ...props }, ref) => (
    <MobileInput
      ref={ref}
      type="email"
      inputMode="email"
      autoCapitalize="none"
      autoComplete="email"
      {...props}
    />
  )
)
EmailInput.displayName = "EmailInput"

export {
  MobileInput,
  SearchInput,
  PasswordInput,
  NumberInput,
  PhoneInput,
  EmailInput,
  mobileInputVariants
}