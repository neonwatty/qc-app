'use client'

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from 'framer-motion'

// Enhanced Card variants for mobile-first design
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        elevated: "shadow-md hover:shadow-lg",
        interactive: "cursor-pointer hover:shadow-md active:scale-[0.98] transition-transform",
        outlined: "border-2 border-primary/20 hover:border-primary/40",
        filled: "bg-primary/5 border-primary/20",
      },
      padding: {
        default: "",
        compact: "[&>*]:px-4 [&>*]:py-3",
        comfortable: "[&>*]:px-6 [&>*]:py-6",
        spacious: "[&>*]:px-8 [&>*]:py-8",
      },
      touchTarget: {
        default: "",
        large: "min-h-[44px]", // Minimum 44px touch target
        xl: "min-h-[56px]", // Extra large touch target
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      touchTarget: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
  pressable?: boolean
  onPress?: () => void
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, touchTarget, pressable, onPress, asChild, ...props }, ref) => {
    const isInteractive = pressable || onPress || variant === 'interactive'
    
    const cardContent = (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant: isInteractive && variant === 'default' ? 'interactive' : variant, padding, touchTarget }),
          isInteractive && "select-none",
          className
        )}
        onClick={onPress}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={isInteractive ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onPress?.()
          }
        } : undefined}
        {...props}
      />
    )

    if (isInteractive) {
      return (
        <motion.div
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
        >
          {cardContent}
        </motion.div>
      )
    }

    return cardContent
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg sm:text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0 sm:p-6 sm:pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 pt-0 sm:p-6 sm:pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Mobile-specific card components
const MobileCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, touchTarget = "large", padding = "compact", ...props }, ref) => (
    <Card
      ref={ref}
      className={cn("touch-manipulation", className)}
      touchTarget={touchTarget}
      padding={padding}
      {...props}
    />
  )
)
MobileCard.displayName = "MobileCard"

const TouchableCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "interactive", touchTarget = "large", ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        "touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
        className
      )}
      variant={variant}
      touchTarget={touchTarget}
      pressable
      {...props}
    />
  )
)
TouchableCard.displayName = "TouchableCard"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  MobileCard,
  TouchableCard,
  cardVariants
}