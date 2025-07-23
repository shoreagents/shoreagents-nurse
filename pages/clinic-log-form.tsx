import React from 'react'
import { NextPage } from 'next'
import ClinicLogForm from '@/components/forms/ClinicLogForm'

const ClinicLogFormPage: NextPage = React.memo(() => {
  return (
    <div className="bg-gray-50 min-h-0 flex-1 flex flex-col">
      <div className="flex-1 p-6">
        <ClinicLogForm />
      </div>
    </div>
  )
})

ClinicLogFormPage.displayName = 'ClinicLogFormPage'

export default ClinicLogFormPage 