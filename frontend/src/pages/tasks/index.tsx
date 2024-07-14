import { useEffect, useState } from "react";
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Task } from "@/lib/types"

async function getData(): Promise<Task[]> {
    const response = await fetch("http://localhost:8000/api/v1/tasks/");
    const responseBody = await response.json();
    const data = responseBody.tasks;
    return data;
}


export default function TasksTable() {
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        getData().then((data) => {
            setTasks(data);
            console.log("Tasks fetched:", data);
        });
    }, []);

    return (
        <div>
            <h1 className="m-5">Task List</h1>
            <DataTable columns={columns} data={tasks} />
        </div>
    )
}