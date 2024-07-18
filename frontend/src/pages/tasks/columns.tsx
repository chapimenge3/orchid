import { Link } from "@tanstack/react-router"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Task } from "@/lib/types"
import { ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: 'id',
        header: 'Task ID',
        cell: ({ row }) => {
            return (
                <Link to={`/tasks/${row.original.id}`} className="text-blue-600 hover:text-blue-800">
                    {row.original.id}
                </Link>
            );
        },
    },
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => {
                        console.log("Sorting column: ", column.id, column.getIsSorted())
                        return column.toggleSorting(column.getIsSorted() === "asc")
                    }}
                >
                    Name
                    {
                        column.getIsSorted() && column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />
                    }
                    {
                        column.getIsSorted() && column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />
                    }
                </Button>
            )
        },
    },
    {
        accessorKey: 'hostname',
        header: 'Hostname',
    },
    {
        accessorKey: 'submitted_time',
        // header: 'Submitted Time',
        header: ({ column }) => {
            // check if there is sorting on this column
            console.log("Column:",)
            return (
                <Button
                    variant="ghost"
                    onClick={() => {
                        console.log("Sorting column: ", column.id, column.getIsSorted())
                        return column.toggleSorting(column.getIsSorted() === "asc")
                    }}
                >
                    Submitted Time
                    {
                        column.getIsSorted() && column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />
                    }
                    {
                        column.getIsSorted() && column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />
                    }
                </Button>
            )
        },
    },
    {
        accessorKey: 'start_time',
        // header: 'Start Time',
        header: ({ column }) => {
            // check if there is sorting on this column
            console.log("Column:",)
            return (
                <Button
                    variant="ghost"
                    onClick={() => {
                        console.log("Sorting column: ", column.id, column.getIsSorted())
                        return column.toggleSorting(column.getIsSorted() === "asc")
                    }}
                >
                    Start Time
                    {
                        column.getIsSorted() && column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />
                    }
                    {
                        column.getIsSorted() && column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />
                    }
                </Button>
            )
        }
    },
    {
        accessorKey: 'end_time',
        // header: 'End Time',
        header: ({ column }) => {
            // check if there is sorting on this column
            console.log("Column:",)
            return (
                <Button
                    variant="ghost"
                    onClick={() => {
                        console.log("Sorting column: ", column.id, column.getIsSorted())
                        return column.toggleSorting(column.getIsSorted() === "asc")
                    }}
                >
                    End Time
                    {
                        column.getIsSorted() && column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />
                    }
                    {
                        column.getIsSorted() && column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />
                    }
                </Button>
            )
        }
    },
    {
        accessorKey: 'runtime',
        cell: ({ row }) => {
            const runtimeValue = row.original.runtime
            const runtime = runtimeValue ? parseFloat(runtimeValue).toFixed(2) : '0.00'

            return (
                <div className="text-right">
                    {`${runtime} seconds`}
                </div>
            )
        },
        header: ({ column }) => {
            // check if there is sorting on this column
            console.log("Column:",)
            return (
                <Button
                    variant="ghost"
                    onClick={() => {
                        console.log("Sorting column: ", column.id, column.getIsSorted())
                        return column.toggleSorting(column.getIsSorted() === "asc")
                    }}
                >
                    Runtime
                    {
                        column.getIsSorted() && column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />
                    }
                    {
                        column.getIsSorted() && column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />
                    }
                </Button>
            )
        }
    },

    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status
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