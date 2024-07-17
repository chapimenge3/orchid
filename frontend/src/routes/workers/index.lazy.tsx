import Navbar from '@/components/nav-bar'
import { Workers } from '@/pages/worker'

import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/workers/')({
  component: WorkersPage
})

function WorkersPage() {
  return <div className="flex min-h-screen w-full flex-col">
    <Navbar pathname='/workers' />
    <Workers />
  </div>
}