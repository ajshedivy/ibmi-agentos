'use client'
import AppLayout from '@/components/layout/AppLayout'
import { Suspense } from 'react'

export default function Home() {
  // Check if OS_SECURITY_KEY is defined on server-side
  const hasEnvToken = !!process.env.NEXT_PUBLIC_OS_SECURITY_KEY
  const envToken = process.env.NEXT_PUBLIC_OS_SECURITY_KEY || ''
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppLayout hasEnvToken={hasEnvToken} envToken={envToken} />
    </Suspense>
  )
}
