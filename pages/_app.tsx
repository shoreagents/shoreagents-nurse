import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Layout } from '@/components/layout/Layout'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'
import { initializeStorage } from '@/lib/storage'
import ErrorBoundary from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/toaster'
import { PageLoader } from '@/components/ui/loading-spinner'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Initialize localStorage with default data
    initializeStorage()
  }, [])

  useEffect(() => {
    // Handle authentication-based routing
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated - prefetch routes for better performance
        const routes = [
          '/',
          '/health-checks',
          '/clinic-log-form',
          '/clinic-records',
          '/reimbursement-form',
          '/reimbursement-records',
          '/inventory',
          '/recent-activities'
        ]

        // Prefetch immediately
        routes.forEach(route => {
          router.prefetch(route)
        })

        // Prefetch again after a short delay to ensure caching
        const timer = setTimeout(() => {
          routes.forEach(route => {
            router.prefetch(route)
          })
        }, 500)

        return () => clearTimeout(timer)
      }
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <PageLoader text="Initializing application..." />
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <ErrorBoundary>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster />
    </ErrorBoundary>
  )
} 