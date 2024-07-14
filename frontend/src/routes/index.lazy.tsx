import App from '@/App'
import Navbar from '@/components/nav-bar'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/')({
    component: Homepage,
})

function Homepage() {
    return <div className="flex min-h-screen w-full flex-col">
        <Navbar  pathname='/' />
        <App />
    </div>
}