'use client'

import { motion } from 'framer-motion'
import { Heart, MessageCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { buttonTap, staggerContainer, staggerFadeUp, slideUp } from '@/lib/animations'
import { Button } from '@/components/ui/button'

const Hero = () => {
  const features = [
    {
      icon: Heart,
      text: "Strengthen your bond"
    },
    {
      icon: MessageCircle,
      text: "Open communication"
    },
    {
      icon: TrendingUp,
      text: "Track your growth"
    }
  ]

  return (
    <section className="min-h-screen flex items-center justify-center px-2 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft romantic background */}
      <div className="absolute inset-0 gradient-blush opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-pink-50/80 to-orange-50/80" />
      <motion.div
        className="w-full sm:max-w-4xl mx-auto text-center relative z-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Hero Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-soft-coral text-rose-700 text-sm font-medium mb-8 shadow-lg shadow-rose-200/50"
          variants={staggerFadeUp}
        >
          <Heart className="w-4 h-4" />
          Relationship wellness made simple
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6"
          variants={slideUp}
        >
          <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">Quality Control</span>
          <span className="block bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent mt-2">for your relationship</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          variants={staggerFadeUp}
        >
          Transform your relationship with thoughtful check-ins, meaningful conversations, 
          and tools designed to help you grow together.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          variants={staggerContainer}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-rose-200/50 text-sm font-medium hover:shadow-lg hover:border-rose-300/50 transition-all cursor-pointer backdrop-blur-sm"
                variants={staggerFadeUp}
                whileHover={{ scale: 1.05 }}
              >
                <Icon className="w-4 h-4 text-primary" />
                {feature.text}
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={staggerFadeUp}
        >
          <motion.div variants={buttonTap}>
            <Button
              size="lg"
              className="px-8 py-4 text-lg font-semibold group gradient-primary text-white border-0 shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/50 transition-all"
              asChild
            >
              <a href="/dashboard" className="flex items-center gap-2">
                Start your journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </motion.div>

          <motion.div variants={buttonTap}>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-rose-300 hover:bg-rose-50 text-rose-600 shadow-md hover:shadow-lg transition-all px-8 py-4 text-lg font-semibold"
              asChild
            >
              <a href="#features">Learn more</a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          className="mt-16 text-center"
          variants={staggerFadeUp}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Trusted by couples who prioritize their relationship
          </p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <div className="flex -space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-background flex items-center justify-center text-xs font-bold"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm font-medium">
              Join 1000+ couples building stronger relationships
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero