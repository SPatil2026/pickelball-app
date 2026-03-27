import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-ink">
      <Sidebar />
      {/* On mobile: top-bar offset pt-14, bottom tab offset pb-16 */}
      {/* On desktop: left sidebar offset lg:ml-60 */}
      <main className="flex-1 min-h-screen pt-14 pb-16 lg:pt-0 lg:pb-0 lg:ml-60">
        <Outlet />
      </main>
    </div>
  )
}
