'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PillAnimated } from '@/components/icons/pill-animated'
import { SyringeIcon } from '@/components/icons/syringe'
import { BoxesIcon } from '@/components/icons/boxes'
import { cn } from '@/lib/utils'

interface MedicineSupplyDisplayProps {
  medicines: Array<{ name: string; quantity: number }>
  supplies: Array<{ name: string; quantity: number }>
  className?: string
}

const MedicineSupplyDisplay: React.FC<MedicineSupplyDisplayProps> = ({
  medicines,
  supplies,
  className
}) => {
  return (
    <TooltipProvider>
      <div className={cn("flex flex-col gap-4", className)}>
        {/* Medicines Section */}
        {medicines.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Medicines</h4>
            <div className="flex flex-wrap gap-2">
              {medicines.map((medicine, index) => (
                <Tooltip key={`medicine-${index}`}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 p-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                      <PillAnimated size={16} className="text-blue-600" />
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        {medicine.quantity}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">{medicine.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Supplies Section */}
        {supplies.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Supplies</h4>
            <div className="flex flex-wrap gap-2">
              {supplies.map((supply, index) => (
                <Tooltip key={`supply-${index}`}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 p-2 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                      <BoxesIcon size={16} className="text-green-600" />
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                        {supply.quantity}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">{supply.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {medicines.length === 0 && supplies.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No medicines or supplies issued
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

export { MedicineSupplyDisplay } 