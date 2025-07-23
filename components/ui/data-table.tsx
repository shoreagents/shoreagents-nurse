'use client'

import React, { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Download,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import * as SelectPrimitive from "@radix-ui/react-select"
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryManagementModal } from '@/components/ui/category-management-modal'
import { SupplierManagementModal } from '@/components/ui/supplier-management-modal'
import { SelectSeparator } from '@/components/ui/select'

// Custom SelectContent without scroll arrows - same as forms
const CustomSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-[40vh] min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1 max-h-[40vh] overflow-y-scroll",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(156 163 175) rgb(243 244 246)',
          scrollbarGutter: 'stable'
        }}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
CustomSelectContent.displayName = "CustomSelectContent"

export interface DataTableColumn<T> {
  key: keyof T
  header: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: T[keyof T], record: T) => React.ReactNode
}

export interface DataTableFilter {
  key: string
  label: string
  options: Array<{ value: string; label: string }>
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  filters?: DataTableFilter[]
  searchPlaceholder?: string
  title?: string
  loading?: boolean
  onRefresh?: () => void
  onExport?: () => void
  emptyMessage?: string
  className?: string
  customActions?: React.ReactNode
  type?: 'medicine' | 'supply' // Add type prop to determine category type
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  filters = [],
  searchPlaceholder = 'Search...',
  title,
  loading = false,
  onRefresh,
  onExport,
  emptyMessage = 'No data found',
  className,
  customActions,
  type
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply column filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => {
          const itemValue = item[key]
          
          // Special handling for medicines and supplies arrays
          if (key === 'medicines' || key === 'supplies') {
            if (Array.isArray(itemValue)) {
              return itemValue.some(medicine => 
                medicine.name?.toLowerCase() === value.toLowerCase()
              )
            }
            return false
          }
          
          // Default string comparison for other fields
          return itemValue?.toString().toLowerCase() === value.toLowerCase()
        })
      }
    })

    return filtered
  }, [data, searchTerm, activeFilters])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  // Pagination info
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, sortedData.length)

  const handleSort = (key: keyof T) => {
    if (!columns.find(col => col.key === key)?.sortable) return

    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : { key, direction: 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    if (value === '__all__') {
      // Remove the filter for "All" option
      setActiveFilters(prev => {
        const newFilters = { ...prev }
        delete newFilters[key]
        return newFilters
      })
    } else {
      setActiveFilters(prev => ({
        ...prev,
        [key]: value
      }))
    }
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const clearFilters = () => {
    setActiveFilters({})
    setSearchTerm('')
    setSortConfig(null)
    setCurrentPage(1)
  }

  const getSortIcon = (key: keyof T) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
    }
    return <ArrowUp className="w-4 h-4 opacity-30" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      {(title || onExport || customActions) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
          </div>
          
          <div className="flex items-center gap-2">
            {customActions}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="p-3">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Column Filters */}
            {filters.map(filter => (
              <Select
                key={filter.key}
                value={activeFilters[filter.key] || '__all__'}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <CustomSelectContent>
                  <SelectItem 
                    value="__all__" 
                  >
                    All {filter.label === 'Category' ? 'Categories' : filter.label === 'Supplier' ? 'Suppliers' : filter.label}
                  </SelectItem>
                  {filter.options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  {filter.key === 'category_name' && (
                    <>
                      <SelectSeparator className="my-2" />
                      <div className="px-2 py-1.5">
                        <CategoryManagementModal
                          type={type === 'medicine' ? 'medicine' : 'supply'}
                          onCategoriesChange={onRefresh || (() => {})}
                          trigger={
                            <button className="w-full text-left text-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm relative">
                              Manage Categories
                            </button>
                          }
                        />
                      </div>
                    </>
                  )}
                  {filter.key === 'supplier_name' && (
                    <>
                      <SelectSeparator className="my-2" />
                      <div className="px-2 py-1.5">
                        <SupplierManagementModal
                          onSuppliersChange={onRefresh || (() => {})}
                          trigger={
                            <button className="w-full text-left text-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm relative">
                              Manage Suppliers
                            </button>
                          }
                        />
                      </div>
                    </>
                  )}
                </CustomSelectContent>
              </Select>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(column => (
                    <TableHead
                      key={column.key as string}
                      className={cn(
                        'cursor-pointer hover:bg-muted/50 transition-colors',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.width && `w-${column.width}`
                      )}
                      onClick={() => handleSort(column.key)}
                    >
                      <div className={cn(
                        'flex items-center gap-2',
                        column.align === 'center' && 'justify-center',
                        column.align === 'right' && 'justify-end'
                      )}>
                        {column.header}
                        {column.sortable && getSortIcon(column.key)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {loading ? (
                  // Skeleton rows for loading state
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map(column => (
                        <TableCell key={column.key as string} className={cn(
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      {columns.map(column => (
                        <TableCell
                          key={column.key as string}
                          className={cn(
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                        >
                          {column.render 
                            ? column.render(item[column.key], item)
                            : String(item[column.key] ?? '-')
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {sortedData.length} entries
          </p>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm text-muted-foreground mx-2">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 