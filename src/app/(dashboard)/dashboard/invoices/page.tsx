import { getInvoices } from '@/lib/data'
import { InvoiceList } from '../../_components/invoice-list'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Invoices</h1>
        <Link href="/dashboard">
          <Button>+ New Invoice</Button>
        </Link>
      </div>
      
      <InvoiceList invoices={invoices} />
    </div>
  )
}