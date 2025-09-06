'use client'

import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Heart, 
  TrendingUp, 
  Shield, 
  Clock, 
  Users,
  Sparkles,
  Target,
  Calendar
} from 'lucide-react'
import { staggerContainer, staggerFadeUp, cardHover } from '@/lib/animations'
import { Card } from '@/components/ui/card'

const FeatureGrid = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Guided Check-ins",
      description: "Structured conversations that help you identify and address what needs attention.",
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-600"
    },
    {
      icon: Heart,
      title: "Pattern Recognition",
      description: "Track moods and responses to understand each other's patterns better.",
      gradient: "from-rose-500/10 to-pink-500/10",
      iconColor: "text-rose-600"
    },
    {
      icon: TrendingUp,
      title: "Progress Metrics",
      description: "Visualize your journey with meaningful data and celebrate improvements.",
      gradient: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-600"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your conversations stay private. Share only what you choose with flexible privacy controls.",
      gradient: "from-purple-500/10 to-violet-500/10",
      iconColor: "text-purple-600"
    },
    {
      icon: Clock,
      title: "Efficient Check-ins",
      description: "Quick, focused sessions designed to fit into any schedule.",
      gradient: "from-orange-500/10 to-amber-500/10",
      iconColor: "text-orange-600"
    },
    {
      icon: Users,
      title: "Unified View",
      description: "See individual perspectives and shared insights in one clear interface.",
      gradient: "from-teal-500/10 to-cyan-500/10",
      iconColor: "text-teal-600"
    },
    {
      icon: Sparkles,
      title: "Action Items",
      description: "Turn insights into concrete next steps with built-in accountability.",
      gradient: "from-yellow-500/10 to-orange-500/10",
      iconColor: "text-yellow-600"
    },
    {
      icon: Target,
      title: "Relationship Goals",
      description: "Set objectives together and track your progress systematically.",
      gradient: "from-indigo-500/10 to-blue-500/10",
      iconColor: "text-indigo-600"
    },
    {
      icon: Calendar,
      title: "Smart Reminders",
      description: "Gentle nudges at the right time to maintain consistency without feeling pressured or overwhelmed.",
      gradient: "from-pink-500/10 to-rose-500/10",
      iconColor: "text-pink-600"
    }
  ]

  return (
    <section id="features" className="py-24 px-2 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            variants={staggerFadeUp}
          >
            <Sparkles className="w-4 h-4" />
            A systematic approach to relationship growth
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
            variants={staggerFadeUp}
          >
            Built for analytical
            <span className="text-primary block sm:inline sm:ml-3">minds</span>
          </motion.h2>

          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            variants={staggerFadeUp}
          >
            Smart tools for couples who value improvement and efficiency.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={staggerFadeUp}
                whileHover="hover"
                {...cardHover}
              >
                <Card className={`p-6 h-full bg-gradient-to-br ${feature.gradient} border-0 shadow-sm hover:shadow-lg transition-all duration-300`}>
                  <div className="flex flex-col h-full">
                    <div className={`w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center mb-4 ${feature.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {feature.title}
                    </h3>
                    
                    <p className="text-muted-foreground leading-relaxed flex-grow">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div
            className="max-w-2xl mx-auto"
            variants={staggerFadeUp}
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to engineer a better relationship?
            </h3>
            <p className="text-muted-foreground mb-8">
              Start your systematic approach to relationship improvement.
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={staggerFadeUp}
            >
              <motion.a
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start your first check-in
              </motion.a>
              <motion.a
                href="#demo"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg border border-border hover:bg-muted/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Watch demo
              </motion.a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureGrid