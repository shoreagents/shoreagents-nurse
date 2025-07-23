import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"


interface ConfirmationDialogProps {
  trigger: React.ReactNode
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "default"
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function ConfirmationDialog({
  trigger,
  title = "Confirm Action",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  onConfirm,
  loading = false,
}: ConfirmationDialogProps) {
  const [open, setOpen] = React.useState(false)

  const handleConfirm = async () => {
    try {
      await onConfirm()
      setOpen(false)
    } catch (error) {
      // Keep dialog open if there's an error
      console.error("Confirmation action failed:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-sm [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        {/* Buttons with same layout as forms */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Predefined delete confirmation dialog
interface DeleteConfirmationDialogProps {
  trigger: React.ReactNode
  itemName: string
  itemType?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function DeleteConfirmationDialog({
  trigger,
  itemName,
  itemType = "item",
  onConfirm,
  loading = false,
}: DeleteConfirmationDialogProps) {
  return (
    <ConfirmationDialog
      trigger={trigger}
      title={`Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
      description={`This action will permanently remove "${itemName}" from your inventory and cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
      onConfirm={onConfirm}
      loading={loading}
    />
  )
} 