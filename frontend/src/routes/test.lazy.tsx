import { createLazyFileRoute } from '@tanstack/react-router'
import Navbar from '@/components/nav-bar'
import { Test } from '@/pages/test'


export const Route = createLazyFileRoute('/test')({
  component: TestPage
})

function TestPage() {
  return <div className="flex min-h-screen w-full flex-col">
    <Navbar pathname='/test' />
    <Test />
  </div>
}