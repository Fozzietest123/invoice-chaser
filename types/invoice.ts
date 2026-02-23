// types/invoice.ts
export interface Invoice {
  id: string
  user_id: string
  client_name: string
  client_email: string
  amount: number
  due_date: string          // or Date if you parse it
  invoice_number: string
  notes?: string
  pdf_url?: string | null
  reminders_sent?: { date: string; status: string }[]  // optional
  created_at?: string
  // add more fields from your Supabase table if needed
}