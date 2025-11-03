'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Github, Linkedin, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'

// X (Twitter) logo as SVG component since Lucide doesn't have it
const XLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

interface FooterProps {
  className?: string
}

/**
 * Footer component for the QC relationship check-in app.
 *
 * Features:
 * - Desktop-only display (hidden on mobile)
 * - Three-section layout: Branding, Links, Social media
 * - Dark/light mode support
 * - Glassmorphism effect matching Header and Navigation
 * - External links to blog and social profiles
 *
 * @param className - Optional Tailwind classes for styling
 *
 * @example
 * ```tsx
 * <Footer />
 * <Footer className="mt-8" />
 * ```
 */
export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const { isDark } = useTheme()

  // Dynamic year ensures copyright stays current - set on client to avoid hydration mismatch
  const [currentYear, setCurrentYear] = useState(2025)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  // Social and blog links configuration - Update here to add/remove platforms
  const socialLinks = [
    {
      name: 'Blog',
      href: 'https://neonwatty.com/',
      icon: BookOpen,
      label: "Visit Jeremy Watt's Blog (opens in new tab)"
    },
    {
      name: 'GitHub',
      href: 'https://github.com/neonwatty',
      icon: Github,
      label: "Visit Jeremy Watt's GitHub profile (opens in new tab)"
    },
    {
      name: 'X',
      href: 'https://x.com/neonwatty',
      icon: XLogo,
      label: "Visit Jeremy Watt's X profile (opens in new tab)"
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/jeremy-watt/',
      icon: Linkedin,
      label: "Visit Jeremy Watt's LinkedIn profile (opens in new tab)"
    }
  ]

  return (
    <footer
      role="contentinfo"
      className="hidden"
    >
      <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Copyright */}
          <p className="text-sm text-gray-600 dark:text-gray-400 pl-0">
            © {currentYear} Jeremy Watt
          </p>

          {/* Right: Blog & Social Links */}
          <nav className="flex gap-4 ml-auto" aria-label="Blog and social media links">
            {socialLinks.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label={link.label}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full",
                    "bg-rose-50 text-rose-600 hover:bg-rose-100",
                    "dark:bg-gray-800 dark:text-rose-400 dark:hover:bg-gray-700",
                    "transition-all duration-300 hover-lift",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </a>
              )
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
