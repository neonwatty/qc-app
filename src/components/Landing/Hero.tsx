'use client'

import { motion } from 'framer-motion'
import { Heart, MessageCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { buttonTap, staggerContainer, staggerFadeUp, slideUp } from '@/lib/animations'
import { Button } from '@/components/ui/button'

const Hero = () => {
  const features = [
    {
      icon: MessageCircle,
      text: "Structured Sessions"
    },
    {
      icon: Heart,
      text: "Relationship Reminders"
    },
    {
      icon: TrendingUp,
      text: "Progress Tracking"
    }
  ]

  return (
    <section className="min-h-screen flex items-start justify-center pt-20 sm:pt-24 lg:pt-32 px-2 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft romantic background */}
      <div className="absolute inset-0 gradient-blush opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-pink-50/80 to-orange-50/80" />
      <motion.div
        className="w-full sm:max-w-4xl mx-auto text-center relative z-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
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
          className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed"
          variants={staggerFadeUp}
        >
          Simple tools to engineer a stronger relationship.
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-rose-200/50 text-sm font-medium text-gray-900 hover:shadow-lg hover:border-rose-300/50 transition-all cursor-pointer backdrop-blur-sm"
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

      </motion.div>
    </section>
  )
}

export default Hero