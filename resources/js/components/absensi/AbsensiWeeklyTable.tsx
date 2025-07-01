import React, { memo, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { AbsensiWeeklyRow } from '@/types/absensi';

interface Props {
    data: AbsensiWeeklyRow[];
    sundays: string[];
    isLoading: boolean;
}

const AbsensiWeeklyTable = memo<Props>(({ data, sundays, isLoading }) => {
    // Memoize status badge component
    const StatusBadge = memo<{ status: string; date: string }>(({ status, date }) => {
        const variants = {
            'H': { variant: 'default' as const, className: 'bg-green-100 text-green-800', text: 'H' },
            'B': { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800', text: 'B' },
            'T': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800', text: 'T' },
        };

        const config = variants[status as keyof typeof variants] || variants.T;

        return (
            <Badge
                variant={config.variant}
                className={`${config.className} text-xs font-medium`}
                title={`${date}: ${status === 'H' ? 'Hadir' : status === 'B' ? 'Bonus' : 'Tidak Hadir'}`}
            >
                {config.text}
            </Badge>
        );
    });

    // Memoize table headers
    const headers = useMemo(() => [
        { key: 'nama', label: 'Nama Siswa', width: 'w-48' },
        { key: 'alamat', label: 'Alamat', width: 'w-64' },
        ...sundays.map(sunday => ({
            key: sunday,
            label: new Date(sunday).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short'
            }),
            width: 'w-16'
        }))
    ], [sundays]);

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="p-12 text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">Tidak ada data</div>
                <div className="text-sm">Belum ada data absensi untuk periode ini</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b bg-muted/50">
                        {headers.map((header) => (
                            <th
                                key={header.key}
                                className={`${header.width} px-4 py-3 text-left text-sm font-medium sticky top-0 bg-muted/50`}
                            >
                                {header.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr
                            key={row.siswa_id || index}
                            className="border-b hover:bg-muted/30 transition-colors"
                        >
                            <td className="px-4 py-3 font-medium text-sm">
                                {row.siswa_nama}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                {row.siswa_alamat}
                            </td>
                            {sundays.map((sunday) => (
                                <td key={sunday} className="px-4 py-3 text-center">
                                    <StatusBadge
                                        status={row[sunday] as string || 'T'}
                                        date={sunday}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

AbsensiWeeklyTable.displayName = 'AbsensiWeeklyTable';

export { AbsensiWeeklyTable };