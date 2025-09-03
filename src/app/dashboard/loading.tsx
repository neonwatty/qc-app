'use client'

import { BrandedLoader, LoadingCard, ListLoader } from '@/components/ui/LoadingStates'
import { StaggerContainer, StaggerItem } from '@/components/ui/Animations'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton with branded loader */}
      <div className="text-center">
        <BrandedLoader size="lg" className="mb-4" />
        <div className="h-8 bg-muted rounded w-64 mx-auto mb-4 animate-pulse" />
        <div className="h-4 bg-muted rounded w-48 mx-auto animate-pulse" />
      </div>

      {/* Quick actions skeleton with stagger */}
      <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <StaggerItem key={i}>
            <LoadingCard className="bg-card border border-border shadow-sm" lines={3} />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Recent activity skeleton */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="h-6 bg-muted rounded w-32 mb-4 animate-pulse" />
        <ListLoader items={3} />
      </div>

      {/* Stats skeleton with stagger */}
      <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StaggerItem key={i}>
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-center">
              <div className="h-8 bg-muted rounded w-12 mx-auto mb-2 animate-pulse" />
              <div className="h-4 bg-muted rounded w-20 mx-auto animate-pulse" />
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  )
}