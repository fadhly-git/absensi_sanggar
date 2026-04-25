import React from 'react';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { useSiswaStats } from '@/hooks/useSiswa';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';

export function SiswaStats() {
    const { data: stats, isLoading, error } = useSiswaStats();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-20" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">Gagal memuat statistik siswa</p>
            </div>
        );
    }

    const aktivasiRate = stats.total > 0 ? (stats.aktif / stats.total) * 100 : 0;

    const statCards = [
        {
            title: 'Total Siswa',
            value: stats.total.toLocaleString('id-ID'),
            icon: Users,
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
        },
        {
            title: 'Siswa Aktif',
            value: stats.aktif.toLocaleString('id-ID'),
            icon: UserCheck,
            iconBg: 'bg-green-100 dark:bg-green-900/40',
            iconColor: 'text-green-600 dark:text-green-400',
        },
        {
            title: 'Siswa Tidak Aktif',
            value: stats.tidak_aktif.toLocaleString('id-ID'),
            icon: UserX,
            iconBg: 'bg-destructive/10',
            iconColor: 'text-destructive',
        },
        {
            title: 'Tingkat Aktivasi',
            value: `${aktivasiRate.toFixed(1)}%`,
            icon: TrendingUp,
            iconBg: 'bg-purple-100 dark:bg-purple-900/40',
            iconColor: 'text-purple-600 dark:text-purple-400',
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <StatCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        icon={<Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.iconColor}`} />}
                        iconPosition="left"
                        className="bg-card border border-border shadow-sm rounded-xl h-full"
                        contentClassName="p-3 sm:p-4"
                        iconWrapperClassName={`flex items-center justify-center rounded-lg ${stat.iconBg} w-9 h-9 sm:w-12 sm:h-12`}
                        titleClassName="text-xs sm:text-base font-semibold text-foreground mb-0.5 sm:mb-1 leading-tight"
                        valueClassName="text-xl sm:text-3xl font-extrabold text-foreground leading-tight"
                    />
                );
            })}
        </div>
    );
}
