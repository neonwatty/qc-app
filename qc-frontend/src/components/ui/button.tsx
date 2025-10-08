import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-manipulation select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(350_85%_50%)] text-white shadow-lg hover:bg-[hsl(350_85%_45%)] active:bg-[hsl(350_85%_40%)] font-bold border-2 border-[hsl(350_85%_40%)] backdrop-blur-sm",
        destructive:
          "bg-red-600 text-white shadow-lg hover:bg-red-700 active:bg-red-800 font-bold border-2 border-red-700/30",
        outline:
          "border-2 border-[hsl(350_85%_50%)] bg-white/95 text-[hsl(350_85%_50%)] shadow-lg hover:bg-[hsl(350_85%_50%)] hover:text-white active:bg-[hsl(350_85%_45%)] font-bold backdrop-blur-sm",
        secondary:
          "bg-gray-200 text-gray-900 shadow-lg hover:bg-gray-300 active:bg-gray-400 font-bold border-2 border-gray-400/50",
        ghost: "text-gray-800 bg-transparent hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 font-semibold border border-gray-300",
        link: "text-[hsl(350_85%_50%)] underline-offset-4 hover:underline active:underline font-bold",
      },
      size: {
        default: "h-10 px-4 py-2", // Increased from h-9 for better touch
        sm: "h-9 rounded-md px-3 text-xs", // Still reasonably sized
        lg: "h-11 rounded-md px-8", // Meets 44px touch target
        xl: "h-12 rounded-md px-10 text-base", // Extra large for primary actions  
        icon: "h-10 w-10", // Increased for better touch
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  animated?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, animated = true, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const buttonElement = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )

    if (!animated) {
      return buttonElement
    }

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
        className="inline-block"
      >
        {buttonElement}
      </motion.div>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
