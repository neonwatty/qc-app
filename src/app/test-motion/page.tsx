'use client'

import { 
  MotionBox, 
  StaggerContainer, 
  StaggerItem, 
  PageTransition,
  FadePresence,
  MotionButton,
  MotionCard
} from '@/components/ui/motion'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function TestMotionPage() {
  const [showFadeDemo, setShowFadeDemo] = useState(false)

  return (
    <PageTransition>
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <MotionBox variant="fade" className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Framer Motion Test</h1>
          <p className="text-lg text-muted-foreground">
            Testing animation presets and motion components
          </p>
        </MotionBox>

        <div className="grid gap-8">
          {/* Basic Animation Variants */}
          <section>
            <MotionBox variant="slideUp" delay={0.1}>
              <h2 className="text-2xl font-semibold mb-4">Animation Variants</h2>
            </MotionBox>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MotionCard className="p-6 border rounded-lg">
                <MotionBox variant="fade" delay={0.2}>
                  <h3 className="font-semibold mb-2">Fade In</h3>
                  <p className="text-muted-foreground">Smooth opacity transition</p>
                </MotionBox>
              </MotionCard>

              <MotionCard className="p-6 border rounded-lg">
                <MotionBox variant="slideUp" delay={0.3}>
                  <h3 className="font-semibold mb-2">Slide Up</h3>
                  <p className="text-muted-foreground">Slides in from bottom</p>
                </MotionBox>
              </MotionCard>

              <MotionCard className="p-6 border rounded-lg">
                <MotionBox variant="slideRight" delay={0.4}>
                  <h3 className="font-semibold mb-2">Slide Right</h3>
                  <p className="text-muted-foreground">Slides in from right</p>
                </MotionBox>
              </MotionCard>

              <MotionCard className="p-6 border rounded-lg">
                <MotionBox variant="scale" delay={0.5}>
                  <h3 className="font-semibold mb-2">Scale In</h3>
                  <p className="text-muted-foreground">Scales up from center</p>
                </MotionBox>
              </MotionCard>
            </div>
          </section>

          {/* Stagger Animation */}
          <section>
            <MotionBox variant="slideUp" delay={0.6}>
              <h2 className="text-2xl font-semibold mb-4">Stagger Animation</h2>
            </MotionBox>
            
            <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <StaggerItem key={item}>
                  <MotionCard className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-2"></div>
                    <span className="text-sm font-medium">Item {item}</span>
                  </MotionCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          {/* Interactive Components */}
          <section>
            <MotionBox variant="slideUp" delay={0.7}>
              <h2 className="text-2xl font-semibold mb-4">Interactive Components</h2>
            </MotionBox>
            
            <div className="flex flex-wrap gap-4 items-center">
              <MotionButton className="px-6 py-2 bg-primary text-primary-foreground rounded-md">
                Motion Button
              </MotionButton>
              
              <Button 
                onClick={() => setShowFadeDemo(!showFadeDemo)}
                variant="outline"
              >
                Toggle Fade Demo
              </Button>
            </div>
          </section>

          {/* Conditional Animation */}
          <section>
            <MotionBox variant="slideUp" delay={0.8}>
              <h2 className="text-2xl font-semibold mb-4">Conditional Animation</h2>
            </MotionBox>
            
            <FadePresence show={showFadeDemo}>
              <MotionCard className="p-6 border rounded-lg bg-secondary">
                <h3 className="font-semibold mb-2">Fade Presence Demo</h3>
                <p className="text-muted-foreground">
                  This content fades in and out when toggled. Perfect for modals,
                  dropdowns, and conditional content.
                </p>
              </MotionCard>
            </FadePresence>
          </section>

          {/* Performance Info */}
          <section>
            <MotionBox variant="slideUp" delay={0.9}>
              <MotionCard className="p-6 border rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">✅ All Animations Working</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Fade in animations</li>
                  <li>• Slide up/right animations</li>
                  <li>• Scale animations</li>
                  <li>• Stagger animations</li>
                  <li>• Interactive hover/tap effects</li>
                  <li>• Conditional presence animations</li>
                </ul>
              </MotionCard>
            </MotionBox>
          </section>
        </div>
      </main>
    </PageTransition>
  )
}