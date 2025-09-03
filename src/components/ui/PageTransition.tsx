'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { getTransitionForRoute, pageWrapperVariants } from '@/lib/page-transitions'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  const pathname = usePathname()
  const transition = getTransitionForRoute(pathname)

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={className}
        variants={transition}
        {...pageWrapperVariants}
        transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition