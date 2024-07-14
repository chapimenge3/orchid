// import { PaperClipIcon } from '@heroicons/react/20/solid'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Task } from "@/lib/types"

export default function TaskDetails({ task }: { task?: Task }) {

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
    } else if (status === 'FAILED') {
        statusComponent = (
            <Badge variant="destructive" className="text-xs">
                {status}
            </Badge>
        )
    }

    const traceback = task.traceback //?.replace('\n', '<br />')
    // console.log("Traceback:", traceback)


    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-row justify-between">
                <div className="px-4 sm:px-0">
                    <h3 className="text-base font-semibold leading-7 text-gray-900">Task Details: {task.id}</h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Task details and status.</p>
                </div>
                <div className="">
                    <Button className="mr-1">Retry</Button>
                    <Button variant='destructive' >Delete</Button>
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
