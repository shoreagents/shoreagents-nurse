import React from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  onClose?: () => void
  className?: string
}

const typeStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-500'
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-500'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
    iconColor: 'text-blue-500'
  }
}

export function Notification({ type, title, message, onClose, className }: NotificationProps) {
  const style = typeStyles[type]
  const Icon = style.icon

  return (
    <div className={cn('border rounded-lg p-4', style.container, className)}>
      <div className="flex items-start">
        <Icon className={cn('h-5 w-5 mt-0.5 mr-3', style.iconColor)} />
        <div className="flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          {message && (
            <p className="text-sm mt-1 opacity-90">{message}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 p-1 hover:bg-black/5 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function NotificationContainer({ 
  notifications, 
  onRemove 
}: { 
  notifications: (NotificationProps & { id: string })[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<(NotificationProps & { id: string })[]>([])

  const addNotification = React.useCallback((notification: NotificationProps) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { ...notification, id }])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification
  }
} 