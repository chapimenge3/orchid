import Navbar from '@/components/nav-bar'
import Tasks from '@/pages/tasks'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/tasks')({
    component: TasksPage,
})

function TasksPage() {
    return <div className="flex min-h-screen w-full flex-col">
        <Navbar pathname='/tasks' />
        <Tasks />
    </div>
}   