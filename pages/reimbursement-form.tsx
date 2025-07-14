import React from 'react'
import { NextPage } from 'next'
import ReimbursementForm from '@/components/forms/ReimbursementForm'

const ReimbursementFormPage: NextPage = React.memo(() => {
  return <ReimbursementForm />
})

ReimbursementFormPage.displayName = 'ReimbursementFormPage'

export default ReimbursementFormPage 