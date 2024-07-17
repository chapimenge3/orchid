import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { WorkerHeartbeat } from "@/lib/types"
import {
    LucideHeartHandshake
} from 'lucide-react'
import { useState } from "react"
import useSWRSubscription from 'swr/subscription'


type HeartBeat = {
    [key: string]: WorkerHeartbeat
}

export function Workers() {
    const [heartbeat, setHeartBeat] = useState<HeartBeat>({})
    const { data, error } = useSWRSubscription('http://localhost:8000/api/v1/workers/ws', (key, { next }) => {
        const socket = new WebSocket(key)
        socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data)
            if (data) {
                setHeartBeat(data)
            }
            next(null, event.data)
        })
        return () => socket.close()
    })

    console.log("WS: Worker Data:", data)
    console.log("WS: Worker error:", error)
    return (
        <div>
            <div className="flex justify-between">
                <h1 className="m-5">Workers List</h1>
                <div className="m-5">
                    {/* <InvokeTask/> */}
                </div>
            </div>
            <div className="container-fluid mx-auto p-4">
                <div className="rounded-md border"></div>
                <Table>
                    <TableCaption>
                        Worker data is updated every 2 seconds
                    </TableCaption>
                    < TableHeader >
                        <TableRow>
                            <TableHead className="w-[100px]" >Name </TableHead>
                            < TableHead > Active </TableHead>
                            < TableHead > Processed </TableHead>
                            < TableHead className="" > Last Updated </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            Object.keys(heartbeat).map((key) => (
                                <TableRow key={key} >
                                    <TableCell className="font-medium" > {key} </TableCell>
                                    < TableCell > {heartbeat[key].active} </TableCell>
                                    < TableCell > {heartbeat[key].processed} </TableCell>
                                    < TableCell className="" > {
                                        // new Date(heartbeat[key].timestamp
                                        new Date(heartbeat[key].timestamp * 1000).toLocaleTimeString()
                                    } </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                    < TableFooter >
                        <TableRow>
                            <TableCell colSpan={3}>
                                <div className="flex">
                                    <p className="mr-1">Web Socket is connected!</p>
                                    <LucideHeartHandshake className="h-6 w-6 text-green-500 animate-bounce " />
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>

    )
}
