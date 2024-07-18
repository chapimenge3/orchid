import Navbar from '@/components/nav-bar'
import Analytics from '@/pages/analytics'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/analytics')({
  component: AnalyticsPage
})

function AnalyticsPage() {
  return <div className="flex min-h-screen w-full flex-col">
    <Navbar pathname='/analytics' />
    <Analytics />
  </div>
}