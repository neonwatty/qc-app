import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'
import { GuestRoute } from '@/components/auth/ProtectedRoute'

export const metadata: Metadata = {
  title: 'Sign In - Quality Control',
  description: 'Sign in to your Quality Control account'
}

export default function LoginPage() {
  return (
    <GuestRoute>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Quality Control
            </h1>
            <p className="text-muted-foreground">
              Strengthen your relationship, one check-in at a time
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </GuestRoute>
  )
}