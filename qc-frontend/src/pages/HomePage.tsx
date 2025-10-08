import Hero from '@components/Landing/Hero'
import FeatureGrid from '@components/Landing/FeatureGrid'

export function HomePage() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <FeatureGrid />
    </main>
  )
}
