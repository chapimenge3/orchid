"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Loader2Icon
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useTasks } from "@/lib/fetcher"

const chartConfig = {
    views: {
        label: "Total Execution Time",
    },
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
    runtime: {
        label: "All Task",
        color: "hsl(var(--chart-1))",
    }
} satisfies ChartConfig

export function Test() {
    const { data, isLoading } = useTasks('page_size=100');
    console.log('data', data)


    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>("runtime")

    const avgRunTime = React.useMemo(
        () => {
            if (!data) return 0
            const total = data.tasks.reduce((acc, curr) => acc + curr.runtime, 0)
            return total / data.tasks.length
        },
        [data]
    )

    // const total = React.useMemo(
    //     () => ({
    //         desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
    //         mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    //     }),
    //     []
    // )
    // total per task name
    // const total = React.useMemo(
    //     () => {
    //         const total: Record<string, number> = {}
    //         taskNames.forEach((name) => {
    //             total[name] = data.tasks.reduce((acc, curr) => {
    //                 if (curr.name === name) {
    //                     return acc + curr.runtime
    //                 }
    //                 return acc
    //             }, 0)
    //         })
    //         return total
    //     },
    //     [taskNames]
    // )

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>
                        Tasks Execution Time
                    </CardTitle>
                    <CardDescription>
                        Showing latest 100 tasks execution time
                    </CardDescription>
                </div>
                <div className="flex">
                    <button
                        data-active={activeChart === "runtime"}
                        className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                        disabled
                    >
                        <span className="text-xs text-muted-foreground">
                            Average Execution Time
                        </span>
                        <span className="text-lg font-bold leading-none sm:text-3xl">
                            {avgRunTime.toFixed(2)} sec
                        </span>
                    </button>
                    {/* {["desktop", "mobile"].map((key) => {
                        const chart = key as keyof typeof chartConfig
                        return (
                            <button
                                key={chart}
                                data-active={activeChart === chart}
                                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                                onClick={() => setActiveChart(chart)}
                            >
                                <span className="text-xs text-muted-foreground">
                                    {chartConfig[chart].label}
                                </span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                                    {total[key as keyof typeof total].toLocaleString()}
                                </span>
                            </button>
                        )
                    })} */}
                    {/* {
                        total && Object.keys(total).map((key) => {
                            return (
                                <button
                                    key={key}
                                    data-active={activeChart === key}
                                    className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                                    onClick={() => setActiveChart(chart)}
                                >
                                    <span className="text-xs text-muted-foreground">
                                        {key.split('.')[key.split('.').length - 1]}
                                    </span>
                                    <span className="text-lg font-bold leading-none sm:text-3xl">
                                        {total[key as keyof typeof total].toLocaleString()}
                                    </span>
                                </button>
                            )
                        })
                    } */}
                </div>
            </CardHeader>
            {
                isLoading && <CardContent className="flex items-center justify-center h-64">
                    <Loader2Icon className="h-8 w-8 animate-spin" />
                </CardContent>
            }
            {
                data && <CardContent className="px-2 sm:p-6">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <BarChart
                            accessibilityLayer
                            data={data.tasks}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="start_time"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const start_time = new Date(value).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })
                                    return start_time
                                }}
                            />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[150px]"
                                        nameKey="views"
                                        labelFormatter={(value, payload) => {
                                            console.log('payload', payload[0].payload)
                                            return payload[0].payload.name
                                        }}
                                    />
                                }
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>

            }
        </Card>
    )
}
