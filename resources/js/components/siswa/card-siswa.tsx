import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { Badge } from '../ui/badge';

export type cardSiswaType = {
    siswa_aktif: number;
    siswa_nonaktif: number;
};

export const CardSiswa = ({ siswa_aktif, siswa_nonaktif }: cardSiswaType) => {
    const percentageChange = (siswa_aktif / (siswa_aktif + siswa_nonaktif)) * 100;
    const isTrendingUp = percentageChange > 0;
    const formattedPercentageChange = percentageChange.toFixed(2);
    return (
        <Card className="@container/card">
            <CardHeader className="relative">
                <CardDescription>Siswa aktif</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{siswa_aktif} orang</CardTitle>
                <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                        {isTrendingUp ? <TrendingUpIcon className="size-3 text-green-500" /> : <TrendingDownIcon className="size-3 text-red-500" />}
                        {formattedPercentageChange}%
                    </Badge>
                </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                    Jumlah siswa yang aktif{' '}
                    {isTrendingUp ? <TrendingUpIcon className="size-4 text-green-500" /> : <TrendingDownIcon className="size-4 text-red-500" />}
                </div>
            </CardFooter>
        </Card>
    );
};
