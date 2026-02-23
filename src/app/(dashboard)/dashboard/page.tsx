import { InvoiceForm } from '../_components/invoice-form'
import { InvoiceList } from '../_components/invoice-list'
import { getInvoices } from '@/lib/data' // Changed import

export default async function DashboardPage() {
  // Now this calls a standard async function, not a Server Action
  const invoices = await getInvoices()

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <InvoiceForm />
        </div>
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
          <InvoiceList invoices={invoices} />
        </div>
      </div>
    </div>
  )
}