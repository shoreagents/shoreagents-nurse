import { useState, useEffect } from 'react'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  serialize: (value: T) => string = JSON.stringify,
  deserialize: (value: string) => T = JSON.parse
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? deserialize(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  const setStoredValue = (newValue: T | ((prevValue: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue
      setValue(valueToStore)
      window.localStorage.setItem(key, serialize(valueToStore))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  const removeStoredValue = () => {
    try {
      window.localStorage.removeItem(key)
      setValue(defaultValue)
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(deserialize(e.newValue))
        } catch (error) {
          console.warn(`Error deserializing localStorage key "${key}":`, error)
        }
      } else if (e.key === key && e.newValue === null) {
        setValue(defaultValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, defaultValue, deserialize])

  return [value, setStoredValue, removeStoredValue] as const
}

// Hook for managing form drafts
export function useFormDraft<T>(formName: string, defaultValue: T) {
  const [draft, setDraft, removeDraft] = useLocalStorage(
    `nurse_app_draft_${formName}`,
    defaultValue
  )

  const saveDraft = (data: T) => {
    setDraft(data)
  }

  const clearDraft = () => {
    removeDraft()
  }

  const hasDraft = () => {
    try {
      const item = window.localStorage.getItem(`nurse_app_draft_${formName}`)
      return item !== null
    } catch {
      return false
    }
  }

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft
  }
}

// Hook for managing application settings
export function useSettings() {
  const [settings, setSettings] = useLocalStorage('nurse_app_settings', {
    theme: 'system' as 'light' | 'dark' | 'system',
    autoSave: true,
    notifications: true,
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    currency: 'PHP',
    itemsPerPage: 10
  })

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings({
      theme: 'system',
      autoSave: true,
      notifications: true,
      language: 'en',
      dateFormat: 'MM/dd/yyyy',
      currency: 'PHP',
      itemsPerPage: 10
    })
  }

  return {
    settings,
    updateSetting,
    resetSettings
  }
} 