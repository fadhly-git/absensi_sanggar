import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

const chartConfig = {
    total: {
        label: 'Total Visitors',
        color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
    const [data, setData] = React.useState([]);

    React.useEffect(() => {
        // Fetch data dari backend
        fetch('/api/absensi/get-diagram')
            .then((response) => response.json())
            .then((fetchedData) => {
                setData(fetchedData);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Total Visitors</CardTitle>
                <CardDescription>All Data</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-total)" stopOpacity={1.0} />
                                <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                });
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        });
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area dataKey="total_siswa" type="natural" fill="url(#fillTotal)" stroke="var(--color-total)" />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
