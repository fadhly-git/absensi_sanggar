import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { useSiswaStats } from '@/hooks/useSiswa';
import { Skeleton } from '@/components/ui/skeleton';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title} className="bg-card border border-border shadow-sm rounded-xl flex flex-col justify-between h-full">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className={`flex items-center justify-center rounded-lg ${stat.iconBg} w-12 h-12`}>
                                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-base font-semibold text-foreground mb-1">
                                    {stat.title}
                                </CardTitle>
                                <div className="text-3xl font-extrabold text-foreground leading-tight">
                                    {stat.value}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                );
            })}
        </div>
    );
}
