import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { Badge } from './ui/badge';

export type cardDH = {
    jumlah_siswa_m: number;
    jumlah_siswa_s: number;
};

export const CardDH = ({ jumlah_siswa_m, jumlah_siswa_s }: cardDH) => {
    const upOrDown = Math.abs(jumlah_siswa_m - jumlah_siswa_s);
    const percentageChange = ((jumlah_siswa_m - jumlah_siswa_s) / jumlah_siswa_s) * 100;
    // console.log(jumlah_siswa_m, jumlah_siswa_s);
    const isTrendingUp = percentageChange > 0;
    const formattedPercentageChange = percentageChange.toFixed(2);
    return (
        <Card className="@container/card">
            <CardHeader className="relative">
                <CardDescription>Siswa berangkat</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{jumlah_siswa_m} orang</CardTitle>
                <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                        {isTrendingUp ? <TrendingUpIcon className="size-3 text-green-500" /> : <TrendingDownIcon className="size-3 text-red-500" />}
                        {formattedPercentageChange}%
                    </Badge>
                </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    {isTrendingUp ? 'Naik' : 'Turun'} {upOrDown} orang
                    {isTrendingUp ? <TrendingUpIcon className="size-4 text-green-500" /> : <TrendingDownIcon className="size-4 text-red-500" />}
                </div>
            </CardFooter>
        </Card>
    );
};
