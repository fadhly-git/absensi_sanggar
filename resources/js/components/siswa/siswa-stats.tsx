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
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Siswa Aktif',
            value: stats.aktif.toLocaleString('id-ID'),
            icon: UserCheck,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Siswa Tidak Aktif',
            value: stats.tidak_aktif.toLocaleString('id-ID'),
            icon: UserX,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
        {
            title: 'Tingkat Aktivasi',
            value: `${aktivasiRate.toFixed(1)}%`,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bgColor}`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stat.color}`}>
                                {stat.value}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}