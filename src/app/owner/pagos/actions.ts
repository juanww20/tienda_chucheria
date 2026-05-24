'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PaymentStatus } from '@/lib/types'

async function assertOwner() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'owner') throw new Error('Acceso denegado')
}

export async function setPaymentStatus(formData: FormData): Promise<void> {
  await assertOwner()
  const id = String(formData.get('id') || '')
  const status = String(formData.get('status') || '') as PaymentStatus
  if (!id || !['pending', 'validated', 'rejected'].includes(status)) return

  const admin = createAdminClient()
  await admin.from('payments').update({ status }).eq('id', id)
  revalidatePath('/owner/pagos')
}
