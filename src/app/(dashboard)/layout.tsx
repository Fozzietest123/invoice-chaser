import Link from 'next/link'
import { getUserProfile } from '@/lib/data'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Crown } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">IC</div>
          <h1 className="text-xl font-bold">Invoice Chaser</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
            Dashboard
          </Link>
          <Link href="/dashboard/invoices" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700">
            Invoices
          </Link>
        </nav>

        <div className="border-t pt-4">
          {profile.subscription_status === 'free' ? (
            <form action="/api/checkout" method="POST">
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </form>
          ) : (
            <div className="text-xs text-center text-green-600 font-semibold bg-green-100 p-2 rounded-md">
              PRO ACCOUNT
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back</h2>
            <p className="text-gray-500">{profile.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline">Sign out</Button>
          </form>
        </header>
        
        {children}
      </main>
    </div>
  )
}