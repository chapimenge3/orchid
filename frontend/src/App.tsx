import {
  ArrowUpRight,
  Workflow,
  FlameKindlingIcon,
  Cog,
  DatabaseZap,
  HeartPulse
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Task, WorkerStatResponse } from '@/lib/types'
import { useEffect, useState } from "react"

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [success, setSuccess] = useState(0)
  const [failure, setFailure] = useState(0)
  const [pending, setPending] = useState(0)
  const [started, setStarted] = useState(0)
  const [workers, setWorkers] = useState<WorkerStatResponse[]>([])

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/tasks/stats')
      .then(response => response.json())
      .then(data => {
        console.log("Data:", data)
        setTasks(data.latest_tasks)
        setSuccess(data.success)
        setFailure(data.failure)
        setPending(data.pending)
        setStarted(data.started)
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });

    // TODO: Convert to Promise.all
    fetch('http://localhost:8000/api/v1/workers')
      .then(response => response.json())
      .then(data => {
        console.log("Workers:", data)
        setWorkers(data)
      })
      .catch(error => {
        console.error('Error fetching workers:', error);
      });
  }, []);

  const getBadge = (status?: string) => {
    type Variant = 'outline' | 'secondary' | 'destructive'
    let badgeColor: Variant = 'outline'
    let className = ''
    if (status === 'PENDING') {
      badgeColor = 'outline'
      className = 'bg-yellow-200 text-white'
    } else if (status === 'STARTED') {
      badgeColor = 'outline'
      className = 'bg-yellow-600 text-white'
    } else if (status === 'SUCCEEDED') {
      badgeColor = 'outline'
      className = 'bg-green-600 text-white'
    } else if (status === 'FAILED') {
      badgeColor = 'destructive'
      className = 'bg-red-600 text-white'
    }
    return (
      <Badge variant={badgeColor} className={`${className} text-center`}>
        {status}
      </Badge>
    )

  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-6">
        <Card className="bg-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
            <CardTitle className="text-sm font-medium 0">
              QUEUED
            </CardTitle>
            <DatabaseZap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 text-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
            <CardTitle className="text-sm font-medium 0">
              RUNNING
            </CardTitle>
            <Cog className={`h-5 w-5 text-muted-foreground ` + (started > 0 ? 'animate-spin' : '')} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{started}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 text-green-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
            <CardTitle className="text-sm font-medium 0">
              SUCCEEDED
            </CardTitle>
            <Workflow className="h-5 w-5 text-muted-foreground hover:animate-accordion-up" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{success}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              FAILED
            </CardTitle>
            <FlameKindlingIcon className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failure}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card
          className="xl:col-span-2" x-chunk="dashboard-01-chunk-4"
        >
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Recently Tasks from celery queue.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <a href="#">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead className="">
                    Status
                  </TableHead>
                  <TableHead className="text-right">Runtime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  tasks.map((task: Task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div className="font-medium">{task.name}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {task.hostname}
                        </div>
                      </TableCell>
                      <TableCell className="">
                        {getBadge(task.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {
                          task.runtime ? parseFloat(task.runtime).toFixed(2) : '0.00'
                        }
                      </TableCell>
                    </TableRow>
                  ))
                }

              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-5">
          <CardHeader>
            <CardTitle>Active Workers Stat</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8">
            {
              workers.map((worker: WorkerStatResponse) => (
                <div key={worker.name} className="flex items-center gap-4">
                  <HeartPulse className="h-4 w-4 text-green-400 animate-bounce" />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {worker.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {
                        `Registered tasks: ${worker.tasks.length}`
                      }
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {
                      worker.broker.hostname
                    } {' Broker'}
                  </div>
                </div>
              ))
            }

          </CardContent>
        </Card>
      </div>
    </main>
  )
}
