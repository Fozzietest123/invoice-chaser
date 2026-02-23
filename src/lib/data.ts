import { createClient } from '@/lib/supabase/server'

export async function getInvoices() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }
  return data
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}