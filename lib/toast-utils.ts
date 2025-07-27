import { toast } from "@/hooks/use-toast"

// Toast utility functions for better UX
export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "success",
  })
}

export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive",
  })
}

export const showWarningToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "warning",
  })
}

export const showInfoToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "info",
  })
}

// Predefined common toasts
export const showItemAddedToast = (itemName: string, itemType: string = "item") => {
  showSuccessToast(
    `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Added`,
    `${itemName} has been added successfully.`
  )
}

export const showItemUpdatedToast = (itemName: string, itemType: string = "item") => {
  showSuccessToast(
    `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Updated`,
    `${itemName} has been updated successfully.`
  )
}

export const showItemDeletedToast = (itemName: string, itemType: string = "item") => {
  showSuccessToast(
    `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Deleted`,
    `${itemName} has been deleted successfully.`
  )
}

export const showSaveErrorToast = (itemType: string = "item") => {
  showErrorToast(
    "Save Failed",
    `Failed to save ${itemType}. Please try again.`
  )
}

export const showDeleteErrorToast = (itemType: string = "item") => {
  showErrorToast(
    "Delete Failed", 
    `Failed to delete ${itemType}. Please try again.`
  )
}

export const showFormResetToast = () => {
  showSuccessToast(
    "Form Reset",
    "All form fields have been cleared."
  )
}

export const showLoginSuccessToast = () => {
  showSuccessToast(
    "Login Successful",
    "Welcome back!"
  )
}

export const showLoginErrorToast = (message?: string) => {
  showErrorToast(
    "Login Failed",
    message || "Please check your credentials and try again."
  )
} 