import { Link } from "@tanstack/react-router"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Task } from "@/lib/types"

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: 'id',
        header: 'Task ID',
        cell: ({ row }) => {
            return (
                <Link to={`/task-details/${row.original.id}`} className="text-blue-600 hover:text-blue-800">
                    {row.original.id}
                </Link>
            );
        },
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'hostname',
        header: 'Hostname',
    },
    {
        accessorKey: 'submitted_time',
        header: 'Submitted Time',
    },
    {
        accessorKey: 'start_time',
        header: 'Start Time',
    },
    {
        accessorKey: 'end_time',
        header: 'End Time',
    },
    {
        accessorKey: 'runtime',
        header: 'Runtime',
        cell: ({ row }) => {
            const runtimeValue = row.original.runtime
            // if runtime is not null, change it to number and round it to 2 decimal places
            const runtime = runtimeValue ? parseFloat(runtimeValue).toFixed(2) : '0.00'

            return (
                <div className="text-right">
                    {`${runtime} seconds`}
                </div>
            )
        },
    },

    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status
            console.log("Status:", status)
            if (status === 'PENDING') {
                return (
                    <Badge variant="outline" className="text-xs">
                        {status}
                    </Badge>
                )
            } else if (status === 'STARTED') {
                return (
                    <Badge variant="outline" className="text-xs bg-yellow-500">
                        {status}
                    </Badge>
                )
            } else if (status === 'SUCCEEDED') {
                return (
                    <Badge className="text-xs bg-green-800">
                        {status}
                    </Badge>
                )
            } else if (status === 'FAILED') {
                return (
                    <Badge variant="destructive" className="text-xs">
                        {status}
                    </Badge>
                )
            }
            console.log("Unknown status:", status)

            return (
                <Badge variant="outline" className="text-xs">
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'retries',
        header: 'Retries',
    },
]