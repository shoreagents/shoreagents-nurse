'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Edit2, Trash2, MoreHorizontal, Check, X, ArrowLeft } from 'lucide-react';
import { MedicalCategory, ItemTypeMedical } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';

interface CategoryManagementModalProps {
  type: ItemTypeMedical;
  onCategoriesChange: () => void;
  trigger?: React.ReactNode;
}

export function CategoryManagementModal({ type, onCategoriesChange, trigger }: CategoryManagementModalProps) {
  const [categories, setCategories] = useState<MedicalCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<MedicalCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<MedicalCategory | null>(null);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      const response = await fetch(`/api/inventory/categories?type=${type}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      showErrorToast('Error', 'Failed to load categories');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    // Check if category already exists
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (existingCategory) {
      showErrorToast('Error', 'Category already exists.');
      return;
    }

    try {
      const response = await fetch('/api/inventory/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName,
          item_type: type
        }),
      });

      if (response.ok) {
        showSuccessToast('Category Added', `${newCategoryName} has been added successfully.`);
        setNewCategoryName('');
        // Only refresh categories, not the entire table
        loadCategories();
      } else {
        const data = await response.json();
        showErrorToast('Error', data.error || 'Failed to add category');
      }
    } catch (error) {
      showErrorToast('Error', 'Failed to add category');
    }
  };

  const handleEditCategory = async (categoryId: number, newName: string) => {
    try {
      const response = await fetch(`/api/inventory/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        showSuccessToast('Category Updated', `${newName} has been updated successfully.`);
        setEditingCategory(null);
        // Only refresh categories, not the entire table
        loadCategories();
      } else {
        const data = await response.json();
        showErrorToast('Error', data.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Edit category error:', error);
      showErrorToast('Error', 'Failed to update category. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    
    try {
      const response = await fetch(`/api/inventory/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccessToast('Category Deleted', `${deletingCategory.name} has been deleted successfully.`);
        // Only refresh categories, not the entire table
        loadCategories();
        setDeletingCategory(null);
      } else {
        const data = await response.json();
        showErrorToast('Error', data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete category error:', error);
      showErrorToast('Error', 'Failed to delete category. Please try again.');
    } finally {
      setDeletingCategory(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="ghost">Manage Categories</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage {type === 'medicine' ? 'Medicine' : 'Supply'} Categories</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Add new category */}
            <div className="flex gap-2">
              <Input
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* List of categories */}
            <div className="space-y-0 max-h-60 overflow-y-auto pl-1 pr-1 pb-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2 group py-1">
                  {editingCategory?.id === category.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="flex-1"
                      />
                      <Button onClick={() => handleEditCategory(category.id, editingCategory.name)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" onClick={() => setEditingCategory(null)} className="mr-3">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm leading-6 px-3 py-2">{category.name}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="ml-2 mr-1">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={() => setDeletingCategory(category)}
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

      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent className="max-w-sm [&>button]:hidden">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove "{deletingCategory?.name}" from your inventory and cannot be undone.
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