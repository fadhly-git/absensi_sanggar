import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type DashboardSummary } from '@/services/dashboardApi';
import { Users, UserCheck, Wallet, School, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import { Badge } from './ui/badge';

interface SectionCardsProps {
    summary?: DashboardSummary;
    isLoading: boolean;
}

// Helper untuk format Rupiah
const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

// Komponen Card untuk Saldo dengan logika perbandingan
const CardSaldo = ({ data, isLoading }: { data?: DashboardSummary['saldo'], isLoading: boolean }) => {
    if (isLoading || !data) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-5 w-2/4" /></CardHeader>
                <CardContent><Skeleton className="h-7 w-3/4" /></CardContent>
                <CardFooter><Skeleton className="h-5 w-full" /></CardFooter>
            </Card>
        );
    }
    
    const { terakhir, sebelumnya } = data;
    const percentageChange = sebelumnya !== 0 ? ((terakhir - sebelumnya) / sebelumnya) * 100 : (terakhir > 0 ? 100 : 0);
    const isTrendingUp = terakhir >= sebelumnya;

    return (
        <Card>
            <CardHeader className="relative pb-2">
                <CardDescription>Saldo Terakhir</CardDescription>
                <CardTitle className="text-2xl font-semibold">{formatRupiah(terakhir)}</CardTitle>
                <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                        {isTrendingUp ? <TrendingUpIcon className="size-3 text-green-500" /> : <TrendingDownIcon className="size-3 text-red-500" />}
                        {percentageChange.toFixed(1)}%
                    </Badge>
                </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 pt-0 text-sm">
                <div className="flex gap-1 font-medium text-muted-foreground">
                    {isTrendingUp ? 'Naik' : 'Turun'} dari sebelumnya
                </div>
            </CardFooter>
        </Card>
    );
};

// Komponen Card untuk Siswa Berangkat dengan logika perbandingan
const CardSiswaBerangkat = ({ data, isLoading }: { data?: DashboardSummary['siswa_berangkat'], isLoading: boolean }) => {
    if (isLoading || !data) {
        return (
            <Card>
                <CardHeader><Skeleton className="h-5 w-2/4" /></CardHeader>
                <CardContent><Skeleton className="h-7 w-3/4" /></CardContent>
                <CardFooter><Skeleton className="h-5 w-full" /></CardFooter>
            </Card>
        );
    }

    const { minggu_ini, minggu_lalu } = data;
    const difference = Math.abs(minggu_ini - minggu_lalu);
    const percentageChange = minggu_lalu !== 0 ? ((minggu_ini - minggu_lalu) / minggu_lalu) * 100 : (minggu_ini > 0 ? 100 : 0);
    const isTrendingUp = minggu_ini >= minggu_lalu;
    
    return (
        <Card>
            <CardHeader className="relative pb-2">
                <CardDescription>Siswa Berangkat</CardDescription>
                <CardTitle className="text-2xl font-semibold">{minggu_ini} orang</CardTitle>
                <div className="absolute top-4 right-4">
                     <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                        {isTrendingUp ? <TrendingUpIcon className="size-3 text-green-500" /> : <TrendingDownIcon className="size-3 text-red-500" />}
                        {percentageChange.toFixed(1)}%
                    </Badge>
                </div>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 pt-0 text-sm">
                 <div className="flex gap-1 font-medium text-muted-foreground">
                    {isTrendingUp ? 'Naik' : 'Turun'} {difference} dari pertemuan lalu
                </div>
            </CardFooter>
        </Card>
    );
};

// Komponen Card statis sederhana
const SimpleStatCard = ({ title, value, icon, isLoading }: { title: string, value: string | number, icon: React.ReactNode, isLoading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="h-7 w-3/4" /> : <div className="text-2xl font-bold">{value}</div>}
        </CardContent>
    </Card>
);

// Komponen utama yang menyusun semua kartu
export function SectionCards({ summary, isLoading }: SectionCardsProps) {
    return (
        <div className="grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
            <CardSaldo data={summary?.saldo} isLoading={isLoading} />
            <CardSiswaBerangkat data={summary?.siswa_berangkat} isLoading={isLoading} />
            <SimpleStatCard
                title="Siswa Aktif"
                value={summary?.siswa_aktif ?? '...'}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                isLoading={isLoading}
            />
            <SimpleStatCard
                title="Jumlah Semua Siswa"
                value={summary?.total_siswa ?? '...'}
                icon={<School className="h-4 w-4 text-muted-foreground" />}
                isLoading={isLoading}
            />
        </div>
    );
}