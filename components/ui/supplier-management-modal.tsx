'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Edit2, Trash2, MoreHorizontal, Check } from 'lucide-react';
import { MedicalSupplier } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';

interface SupplierManagementModalProps {
  onSuppliersChange: () => void;
  trigger?: React.ReactNode;
}

export function SupplierManagementModal({ onSuppliersChange, trigger }: SupplierManagementModalProps) {
  const [suppliers, setSuppliers] = useState<MedicalSupplier[]>([]);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [editingSupplier, setEditingSupplier] = useState<MedicalSupplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<MedicalSupplier | null>(null);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadSuppliers();
    }
  }, [open]);

  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/inventory/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      showErrorToast('Error', 'Failed to load suppliers');
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) return;

    // Check if supplier already exists
    const existingSupplier = suppliers.find(
      sup => sup.name.toLowerCase() === newSupplierName.trim().toLowerCase()
    );

    if (existingSupplier) {
      showErrorToast('Error', 'Supplier name already exists.');
      return;
    }

    try {
      const response = await fetch('/api/inventory/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplierName,
        }),
      });

      if (response.ok) {
        showSuccessToast('Supplier Added', `${newSupplierName} has been added successfully.`);
        setNewSupplierName('');
        // Only refresh suppliers, not the entire table
        loadSuppliers();
      } else {
        const data = await response.json();
        showErrorToast('Error', data.error || 'Failed to add supplier');
      }
    } catch (error) {
      showErrorToast('Error', 'Failed to add supplier');
    }
  };

  const handleEditSupplier = async (supplierId: number, newName: string) => {
    try {
      const response = await fetch(`/api/inventory/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        showSuccessToast('Supplier Updated', `${newName} has been updated successfully.`);
        setEditingSupplier(null);
        // Only refresh suppliers, not the entire table
        loadSuppliers();
      } else {
        const data = await response.json();
        showErrorToast('Error', data.error || 'Failed to update supplier');
      }
    } catch (error) {
      console.error('Edit supplier error:', error);
      showErrorToast('Error', 'Failed to update supplier. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSupplier) return;
    
    try {
      const response = await fetch(`/api/inventory/suppliers/${deletingSupplier.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccessToast('Supplier Deleted', `${deletingSupplier.name} has been deleted successfully.`);
        // Only refresh suppliers, not the entire table
        loadSuppliers();
        setDeletingSupplier(null);
      } else {
        const data = await response.json();
        showErrorToast('Error', data.error || 'Failed to delete supplier');
      }
    } catch (error) {
      console.error('Delete supplier error:', error);
      showErrorToast('Error', 'Failed to delete supplier. Please try again.');
    } finally {
      setDeletingSupplier(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="ghost">Manage Suppliers</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Suppliers</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Add new supplier */}
            <div className="flex gap-2">
              <Input
                placeholder="New supplier name"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
              />
              <Button onClick={handleAddSupplier}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* List of suppliers */}
            <div className="space-y-0 max-h-60 overflow-y-auto pl-1 pr-1 pb-2">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="flex items-center gap-2 group py-1">
                  {editingSupplier?.id === supplier.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editingSupplier.name}
                        onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                        className="flex-1"
                      />
                      <Button onClick={() => handleEditSupplier(supplier.id, editingSupplier.name)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" onClick={() => setEditingSupplier(null)} className="mr-3">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm leading-6 px-3 py-2">{supplier.name}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="ml-2 mr-1">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingSupplier(supplier)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={() => setDeletingSupplier(supplier)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingSupplier} onOpenChange={(open) => !open && setDeletingSupplier(null)}>
        <AlertDialogContent className="max-w-sm [&>button]:hidden">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove "{deletingSupplier?.name}" from your inventory and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <AlertDialogCancel asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 