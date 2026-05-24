import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/auth'
import OwnerConsole from './OwnerConsole'

export const dynamic = 'force-dynamic'

export default async function OwnerPage() {
  const { profile } = await getSessionContext()
  if (!profile) redirect('/login')
  if (profile.role !== 'owner') redirect('/admin')

  const supabase = await createClient()
  const { data } = await supabase
    .from('companies')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })

  const companies = (data ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    logo_url: c.logo_url as string | null,
    active: (c.active ?? true) as boolean,
    created_at: c.created_at as string,
    adminEmail:
      (c.profiles as { email: string | null }[] | null)?.[0]?.email ?? null,
  }))

  return <OwnerConsole companies={companies} />
}
