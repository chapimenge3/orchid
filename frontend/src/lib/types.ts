/* eslint-disable @typescript-eslint/no-explicit-any */
export type Task = {
    id: string
    name: string
    hostname?: string
    args?: string
    kwargs?: string
    submitted_time?: string
    start_time?: string
    end_time?: string
    runtime?: string
    result?: string
    exception?: string
    traceback?: string
    status?: string
    retries?: number
    created_at: number
}


export type Worker = {
    name: string
    tasks: string[]
    total: number
    pid: number
    clock: string
    pool: PoolStatResponse
    broker: BrokerStatResponse
    rusage: RusageResponse
    prefetch_count: number
    memdump: string
}


export type PoolStatResponse = {
    implementation: string
    max_concurrency: number
    pool_size: number
    processes: number[]
    max_tasks_per_child: number
    put_guarded_by_semaphore: boolean
    timeout: number[]
    write: string
}

export type BrokerStatResponse = {
    hostname: string
    userid: string
    virtual_host: string
    port: number
    insist: boolean
    ssl: boolean
    transport: string
    connect_timeout: number
    transport_options: any
    login_method: string
    uri_prefix: string
    heartbeat: number
    failover_strategy: string
    alternates: string[]
}

export type RusageResponse = {
    utime: number
    stime: number
    maxrss: number
    ixrss: number
    idrss: number
    isrss: number
    minflt: number
    majflt: number
    nswap: number
    inblock: number
    oublock: number
    msgsnd: number
    msgrcv: number
    nsignals: number
    nvcsw: number
}


export type WorkerStatResponse = {
    name: string
    tasks: string[]
    total: { [key: string]: number }
    pid: number
    clock: string
    pool: PoolStatResponse
    broker: BrokerStatResponse
    rusage: RusageResponse
    prefetch_count: number
    report: any
    memdump: string
}