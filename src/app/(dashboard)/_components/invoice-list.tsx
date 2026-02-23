'use client'

import { deleteInvoice } from '@/actions/invoice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

type Invoice = {
  id: string
  client_name: string
  invoice_number: string
  amount: number
  due_date: string
  status: string
}

// This interface defines the props
interface InvoiceListProps {
  invoices: Invoice[]
}

// We apply the props here: { invoices }: InvoiceListProps
export function InvoiceList({ invoices }: InvoiceListProps) {
  if (!invoices || invoices.length === 0) {
    return <div className="text-center text-gray-500 mt-10 p-4 border rounded-lg">No invoices yet. Add your first one!</div>
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Invoice #</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.client_name}</TableCell>
              <TableCell>{invoice.invoice_number}</TableCell>
              <TableCell>${invoice.amount.toFixed(2)}</TableCell>
              <TableCell>{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <form action={deleteInvoice.bind(null, invoice.id)}>
                  <Button type="submit" size="sm" variant="destructive">Delete</Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}