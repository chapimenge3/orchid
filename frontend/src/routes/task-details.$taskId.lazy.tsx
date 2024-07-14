import Navbar from '@/components/nav-bar'
import TaskDetails from '@/pages/task-details'
import { Task } from '@/lib/types'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createLazyFileRoute('/task-details/$taskId')({
    component: TasksPage,
})


async function getTaskDetails(id: string) {
    const response = await fetch(`http://localhost:8000/api/v1/tasks/${id}`)
    const data = await response.json()
    return data
}

function TasksPage() {
    const { taskId } = Route.useParams()
    const [task, setTask] = useState<Task>()
    console.log("Task ID:", taskId)

    useEffect(() => {
        const fetchData = async () => {
            const data = await getTaskDetails(taskId)
            setTask(data)
            console.log("Found Data:", data)
        }
        fetchData()
    }, [taskId])

    return <div className="flex min-h-screen w-full flex-col">
        <Navbar pathname={`/task-details/${taskId}`} />
        <TaskDetails task={task} />
    </div>
}   