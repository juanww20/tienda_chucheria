import { redirect } from 'next/navigation'
import { getSessionContext } from '@/lib/auth'

export default async function Home() {
  const { profile } = await getSessionContext()
  if (!profile) redirect('/login')
  redirect(profile.role === 'owner' ? '/owner' : '/admin')
}
