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


// {"hostname":"celery@ebe253b9b8c2","utcoffset":0,"pid":1,"clock":8675,"freq":2.0,"active":0,"processed":5,"loadavg":[0.28,0.32,0.3],"sw_ident":"py-celery","sw_ver":"5.4.0","sw_sys":"Linux","timestamp":1721219111.4356863,"type":"worker-heartbeat","local_received":1721219111.4375706}

export type WorkerHeartbeat = {
    hostname: string
    utcoffset: number
    pid: number
    clock: number
    freq: number
    active: number
    processed: number
    loadavg: number[]
    sw_ident: string
    sw_ver: string
    sw_sys: string
    timestamp: number
    type: string
    local_received: number
}