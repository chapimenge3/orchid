// import { PaperClipIcon } from '@heroicons/react/20/solid'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Task } from "@/lib/types"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Link } from "@tanstack/react-router"
import { revokeTask } from "@/lib/fetcher"

export default function TaskDetails({ task }: { task?: Task }) {
    const { toast } = useToast()

    if (!task) {
        return <div>Task not found</div>
    }

    const status = task.status
    let statusComponent = (
        <Badge variant="outline" className="text-xs">
            {status}
        </Badge>
    )

    if (status === 'PENDING') {
        statusComponent = (
            <Badge variant="outline" className="text-xs">
                {status}
            </Badge>
        )
    } else if (status === 'STARTED') {
        statusComponent = (
            <Badge variant="outline" className="text-xs bg-yellow-500">
                {status}
            </Badge>
        )
    } else if (status === 'SUCCEEDED') {
        statusComponent = (
            <Badge className="text-xs bg-green-800">
                {status}
            </Badge>
        )
    } else if (status === 'FAILED' || status === 'REVOKED') {
        statusComponent = (
            <Badge variant="destructive" className="text-xs">
                {status}
            </Badge>
        )
    }

    const traceback = task.traceback //?.replace('\n', '<br />')

    // TODO: args is not working properly
    const retryTask = async () => {
        console.log("Retrying task:", task.id)
        let args: string | string[] = task.args || ''
        let kwargs = task.kwargs
        if (typeof args === 'string' && args.startsWith('(') && args.endsWith(')')) {
            args = args.substring(1, args.length - 1).split(',')
        }
        if (typeof kwargs === 'string' && kwargs.startsWith('{') && kwargs.endsWith('}')) {
            kwargs = JSON.parse(kwargs)
        }
        const body = {
            task_name: task.name,
            args: args,
            kwargs: kwargs,
        }
        try {
            const response = await fetch(`http://localhost:8000/api/v1/tasks/invoke`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
            const data = await response.json()
            if (response.status === 200) {
                console.log("Data:", data)
                toast({
                    title: 'Task Retry Successful',
                    description: 'Task successfully retried.',
                    action: (
                        <Link to={`/tasks/${data.task_id}`}>
                            <Button variant="outline" className="ml-2">
                                View Task
                            </Button>
                        </Link>
                    ),
                    duration: 3000,
                })
            } else {
                console.error("Data:", data)
                toast({
                    title: 'Task Retry Failed',
                    description: 'Task retry failed.',
                    variant: "destructive",
                    duration: 3000,
                })
            }
        } catch (error) {
            console.error('Error fetching task:', error);
            toast({
                title: 'Task Retry Failed',
                description: 'Task retry failed.',
                variant: "destructive",
                duration: 3000,
            })
        }

    }

    const handleRevokeTask = async () => {
        console.log("Revoking task:", task.id)
        try {
            revokeTask(task.id)
            toast({
                title: 'Task Revoke Successful',
                description: 'Task successfully revoked.',
                duration: 3000,
            })

        } catch (error) {
            console.error('Error fetching task:', error);
            toast({
                title: 'Task Revoke Failed',
                description: 'Task revoke failed.',
                variant: "destructive",
                duration: 3000,
            })
        }

    }


    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-row justify-between">
                <div className="px-4 sm:px-0">
                    <h3 className="text-base font-semibold leading-7 text-gray-900">Task Details: {task.id}</h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Task details and status.</p>
                </div>
                <div className="">
                    <AlertDialog key="retry">
                        <AlertDialogTrigger>
                            <Button className="mr-1">Retry</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure you want to retry this task?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will create a new task with the same arguments and kwargs.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="text-red-500 hover:text-red-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction className="text-green-500" onClick={retryTask}>Retry Task</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    {
                        task.status === 'PENDING' || task.status === 'STARTED' &&
                        (<AlertDialog key="revoke">
                            <AlertDialogTrigger>
                                <Button variant="destructive" className="mr-1">Revoke</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure you want to <b className="text-red-600">REVOKE</b> this task?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will terminate the task and remove it from the queue.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-500" onClick={handleRevokeTask}>Revoke</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>)
                    }
                </div>
            </div>

            <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                    <div className="px-4 py-6 sm:grid sm:grid-cols-6 sm:gap-2 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Task Name</dt>
                        <dd className="mt-1 font-bold leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{task.name}</dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-6 sm:gap-2 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Task Status</dt>
                        <dd className="mt-1 leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{statusComponent}</dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-6 sm:gap-2 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Result</dt>
                        <dd className="mt-1 leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {
                                task.result ? task.result : 'Result not available'
                            }
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-6 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Runtime</dt>
                        <dd className="mt-1 leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {
                                task.runtime ? parseFloat(task.runtime).toFixed(2) : '0.00'
                            } {' seconds'}
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-6 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Submitted at</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {task.submitted_time && new Date(task.submitted_time).toLocaleString()}
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-6 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Start Time</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {task.start_time && new Date(task.start_time).toLocaleString()}
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-6 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">End Time</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {task.end_time && new Date(task.end_time).toLocaleString()}
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-6 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Args</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <code>{task.args}</code>
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-6 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Kwargs</dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            <code>{task.kwargs}</code>
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-6 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Exception</dt>
                        <dd className="mt-1 leading-6 text-red-700 sm:col-span-2 sm:mt-0">
                            <code>{task.exception}</code>
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-6 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Traceback</dt>
                        <dd className="mt-1 font-medium text-red-700 leading-6 sm:col-span-2 sm:mt-0">
                            <code className="whitespace-pre-wrap">
                                {traceback}
                            </code>
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-6 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium leading-6 text-gray-900">Retries</dt>
                        <dd className="mt-1leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                            {
                                task.retries ? task.retries : '0'
                            } {' retries'}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    )
}
