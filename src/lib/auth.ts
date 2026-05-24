import { createClient } from '@/lib/supabase/server'
import type { Company, Profile } from '@/lib/types'

export async function getSessionContext(): Promise<{
  profile: Profile | null
  company: Company | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { profile: null, company: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return { profile: null, company: null }

  let company: Company | null = null
  if (profile.company_id) {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('id', profile.company_id)
      .single()
    company = data
  }

  return { profile: profile as Profile, company }
}
