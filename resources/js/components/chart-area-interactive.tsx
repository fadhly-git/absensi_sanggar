import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts';

const chartConfig = {
    total: {
        label: 'Total Visitors',
        color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
    const [data, setData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/absensi/get-diagram');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const fetchedData = await res.json();
            if (!Array.isArray(fetchedData)) throw new Error('Invalid data format');
            setData(fetchedData);
        } catch (e: any) {
            console.error('Error fetching data:', e);
            setError(e?.message || 'Gagal memuat data');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Total Visitors</CardTitle>
                <CardDescription>All Data</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer config={chartConfig} className="w-full min-h-[220px] sm:min-h-[250px]">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-sm text-muted-foreground">Memuat data...</div>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center gap-2">
                            <div className="text-sm text-destructive">{error}</div>
                            <button className="px-3 py-1 rounded-md border bg-background" onClick={() => fetchData()}>
                                Coba Lagi
                            </button>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
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
                        </ResponsiveContainer>
                    )}
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
