import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export type cardTS = {
    total_siswa: number;
};

export const CarAllSiswa = ({ total_siswa }: cardTS) => {
    return (
        <Card className="@container/card">
            <CardHeader className="relative">
                <CardDescription>Jumlah siswa</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{total_siswa} orang</CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">Jumlah siswa yang terdaftar</div>
            </CardFooter>
        </Card>
    );
};
