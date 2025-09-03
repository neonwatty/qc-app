import Hero from '@/components/Landing/Hero'
import FeatureGrid from '@/components/Landing/FeatureGrid'

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <FeatureGrid />
    </main>
  )
}