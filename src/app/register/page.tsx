import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { GuestRoute } from '@/components/auth/ProtectedRoute'

export const metadata: Metadata = {
  title: 'Sign Up - Quality Control',
  description: 'Create your Quality Control account and start your relationship journey'
}

export default function RegisterPage() {
  return (
    <GuestRoute>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Quality Control
            </h1>
            <p className="text-muted-foreground">
              Begin your journey to a stronger relationship
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </GuestRoute>
  )
}