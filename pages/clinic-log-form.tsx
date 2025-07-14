import React from 'react'
import { NextPage } from 'next'
import ClinicLogForm from '@/components/forms/ClinicLogForm'

const ClinicLogFormPage: NextPage = React.memo(() => {
  return <ClinicLogForm />
})

ClinicLogFormPage.displayName = 'ClinicLogFormPage'

export default ClinicLogFormPage 