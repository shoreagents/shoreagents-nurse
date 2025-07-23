import React from 'react'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/router'

interface PageWrapperProps {
  title: string
  description?: string
  showBack?: boolean
  breadcrumbs?: Array<{ label: string; href?: string }>
  children: React.ReactNode
}

export function PageWrapper({ 
  title, 
  description, 
  showBack = false, 
  breadcrumbs = [],
  children 
}: PageWrapperProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="bg-gray-50 min-h-0 flex-1 flex flex-col">
      {/* Header */}
      {(title || description || showBack || breadcrumbs.length > 0) && (
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              
              <div>
                {breadcrumbs.length > 0 && (
                  <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        {crumb.href ? (
                          <button
                            onClick={() => router.push(crumb.href!)}
                            className="hover:text-gray-700"
                          >
                            {crumb.label}
                          </button>
                        ) : (
                          <span>{crumb.label}</span>
                        )}
                        {index < breadcrumbs.length - 1 && (
                          <span className="text-gray-400">›</span>
                        )}
                      </React.Fragment>
                    ))}
                  </nav>
                )}
                
                {title && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
                {description && (
                  <p className="text-gray-600 mt-1">{description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  )
} 