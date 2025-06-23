import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { formatNumber } from './keuangan/data-table';
import { Badge } from './ui/badge';

export type cardSaldo = {
    saldo_terakhir: number | null;
    saldo_sebelumnya: number | null;
};

export const CardSaldo = ({ saldo_terakhir, saldo_sebelumnya }: cardSaldo) => {
    // console.log('saldo t' + saldo_terakhir, saldo_sebelumnya);
    const percentageChange =
        saldo_terakhir !== null && saldo_sebelumnya !== null ? ((saldo_terakhir - saldo_sebelumnya) / saldo_sebelumnya) * 100 : 0;
    const isTrendingUp = percentageChange > 0;
    const formattedPercentageChange = percentageChange.toFixed(2);
    return (
        <Card className="@container/card">
            <CardHeader className="relative">
                <CardDescription>Saldo terakhir</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {saldo_terakhir !== null ? formatNumber(saldo_terakhir) : 'N/A'}
                </CardTitle>
                <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                        {isTrendingUp ? <TrendingUpIcon className="size-3 text-green-500" /> : <TrendingDownIcon className="size-3 text-red-500" />}
                        {formattedPercentageChange}%
                    </Badge>
                </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    Saldo saat ini {isTrendingUp ? 'Naik' : 'Turun'}{' '}
                    {isTrendingUp ? <TrendingUpIcon className="size-4 text-green-500" /> : <TrendingDownIcon className="size-4 text-red-500" />}
                </div>
            </CardFooter>
        </Card>
    );
};
