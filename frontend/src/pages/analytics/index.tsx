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
        label: "Runtime",
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

export default function Analytics() {
    const { data, isLoading } = useTasks('page_size=100');
    console.log('data', data)


    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>("runtime")

    const avgRunTime = React.useMemo(
        () => {
            if (!data) return 0
            const total = data.tasks.reduce((acc: number, curr) => acc + curr.runtime, 0)
            return total / data.tasks.length
        },
        [data]
    )

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>
                        Tasks Execution Time
                    </CardTitle>
                    <CardDescription>
                        Showing latest 100 successful tasks execution time
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
                                        labelFormatter={(_, payload) => {
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
