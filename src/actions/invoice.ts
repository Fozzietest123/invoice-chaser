'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createInvoice(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  const invoiceData = {
    user_id: user.id,
    client_name: formData.get('client_name') as string,
    client_email: formData.get('client_email') as string,
    amount: parseFloat(formData.get('amount') as string),
    due_date: formData.get('due_date') as string,
    invoice_number: formData.get('invoice_number') as string,
    notes: formData.get('notes') as string || null,
    status: 'pending',
  }

  const { error } = await supabase.from('invoices').insert(invoiceData)

  if (error) {
    console.error("Create Invoice Error:", error)
    throw new Error(error.message)
  }
  
  revalidatePath('/dashboard')
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  
  if (error) {
    console.error("Delete Invoice Error:", error)
    throw new Error(error.message)
  }
  
  revalidatePath('/dashboard')
}