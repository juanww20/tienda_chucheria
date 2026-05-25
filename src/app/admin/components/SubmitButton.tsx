'use client'

import { useFormStatus } from 'react-dom'

interface Props {
  children: React.ReactNode
  pendingText?: string
  className?: string
  disabled?: boolean
}

export default function SubmitButton({ children, pendingText, className, disabled }: Props) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending || disabled} className={className} aria-busy={pending ? 'true' : 'false'}>
      {pending ? pendingText ?? '…' : children}
    </button>
  )
}
