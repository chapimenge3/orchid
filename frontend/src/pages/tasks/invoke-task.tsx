import React, { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { LoaderCircle } from "lucide-react"
import { invokeTask, useRegisterTask } from "@/lib/fetcher"
import { ToastAction } from "@/components/ui/toast"
import { Link } from "@tanstack/react-router"


type RegisteredTask = {
    name: string
    worker: string

}

function useMediaQuery(query: string) {
    const [value, setValue] = React.useState(false)

    React.useEffect(() => {
        function onChange(event: MediaQueryListEvent) {
            setValue(event.matches)
        }

        const result = matchMedia(query)
        result.addEventListener("change", onChange)
        setValue(result.matches)

        return () => result.removeEventListener("change", onChange)
    }, [query])

    return value
}

export default function InvokeTask(
) {
    const { data, isLoading, error } = useRegisterTask();
    const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 768px)")
    console.log('Registered Task:', data)
    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {
                        isLoading ? (
                            <Button variant="default" disabled>
                                <LoaderCircle className="w-5 h-5 animate-spin" />
                            </Button>
                        ) : (
                            error ? (
                                <Button variant="default" disabled>
                                    Error
                                </Button>
                            ) : (
                                <Button variant="default">Invoke Task</Button>

                            )
                        )
                    }
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Invoke Task</DialogTitle>
                        <DialogDescription>
                            please pass <b>JSON</b> data of args and kwargs.
                            <br />
                            <code>
                                {"{"}
                                "args": [1, 2, 3]
                                "kwargs": {"{ 'a': 10 "}{"}"}
                                {"}"}
                            </code>
                        </DialogDescription>
                    </DialogHeader>
                    <InvokeTaskDialog data={data} setOpen={setOpen} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button variant="default">Invoke Task</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Invoke Task</DrawerTitle>
                    <DrawerDescription>
                        please pass json data of args and kwargs.
                        <br />
                        <code>
                            args: [1, 2, 3]
                            kwargs: {"{ 'a': 10 "}{"}"}
                        </code>
                    </DrawerDescription>
                </DrawerHeader>
                <InvokeTaskDialog className="px-4" data={data} setOpen={setOpen} />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}


function InvokeTaskDialog({ className, data, setOpen }: { className?: string, data: RegisteredTask[], setOpen: (open: boolean) => void }) {
    const { toast } = useToast()
    const [task, setTask] = useState<string>("")
    const [json, setJson] = useState<string>("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log("Task:", task)
        console.log("JSON:", json)
        try {
            const response = await invokeTask(task, json)
            const task_id = response.task_id
            console.log("Task ID:", task_id)
            toast({
                title: "Task invoked",
                description: "Successfully invoked task",
                variant: "default",
                action: (
                    <ToastAction altText="Try Again">
                        <Link className="p-1" to={`/tasks/${task_id}`}>
                            View Task
                        </Link>
                    </ToastAction>
                ),
                duration: 3000,
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "Error has occurred",
                description: `Error: ${error}`,
                variant: "destructive",
                duration: 3000,
            })
        }
        setOpen(false)
    }
    return (
        <form className={cn("grid items-start gap-4", className)} onSubmit={handleSubmit}>
            <Select value={task} onValueChange={setTask}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Choose Task" />
                </SelectTrigger>
                <SelectContent>
                    {
                        data?.map((task) => (
                            <SelectItem key={task.name} value={task.name}>
                                {task.name}
                            </SelectItem>
                        ))
                    }
                </SelectContent>
            </Select>
            <Textarea placeholder="Enter JSON data(optional if not needed)" value={json} onChange={(e) => setJson(e.target.value)} />
            <Button type="submit">Run Task</Button>
        </form>
    )
}