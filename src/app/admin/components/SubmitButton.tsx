'use client'

import { useFormStatus } from 'react-dom'

interface Props {
  children: React.ReactNode
  pendingText?: string
  className?: string
}

export default function SubmitButton({ children, pendingText, className }: Props) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={className} aria-busy={pending}>
      {pending ? pendingText ?? '…' : children}
    </button>
  )
}
