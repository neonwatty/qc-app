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
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/30">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Hero Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
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
          Quality Control
          <span className="block text-primary mt-2">for your relationship</span>
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
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm"
                variants={staggerFadeUp}
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
              className="px-8 py-4 text-lg font-semibold group"
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
              className="px-8 py-4 text-lg font-semibold"
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