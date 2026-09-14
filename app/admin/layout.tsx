import { requireAdmin } from '@/src/lib/supabase/admin-auth'

import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r border-white/10 p-4 md:block">
          <AdminSidebar />
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <div className="border-b border-white/10 p-4 md:hidden">
            <AdminSidebar />
          </div>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
