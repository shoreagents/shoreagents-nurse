import React from 'react'
import { NextPage } from 'next'
import ReimbursementForm from '@/components/forms/ReimbursementForm'

const ReimbursementFormPage: NextPage = React.memo(() => {
  return (
    <div className="bg-gray-50 min-h-0 flex-1 flex flex-col">
      <div className="flex-1 p-6">
        <ReimbursementForm />
      </div>
    </div>
  )
})

ReimbursementFormPage.displayName = 'ReimbursementFormPage'

export default ReimbursementFormPage 