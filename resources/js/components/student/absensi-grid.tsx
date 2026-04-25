// resources/js/components/student/absensi-grid.tsx
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { AbsensiSkeleton } from './skeleton/absensi-skeleton';

interface AbsensiGridProps {
    absensi: Record<string, Record<string, string>>;
    isLoading?: boolean;
    maxCol?: number;
    maxRow?: number;
    bulanPerBaris?: number;
}

const statusConfig: Record<string, { icon: string; className: string }> = {
    H: {
        icon: '✓',
        className: 'border-green-500/30 bg-green-500/10 text-green-600',
    },
    T: {
        icon: '✕',
        className: 'border-red-500/30 bg-red-500/10 text-red-600',
    },
    B: {
        icon: '!',
        className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
    },
};

function StatusIcon({ status }: { status: string }) {
    const config = statusConfig[status] ?? {
        icon: '?',
        className: 'border-muted-foreground/30 bg-muted text-muted-foreground',
    };

    return (
        <span
            className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border text-lg font-medium transition-transform hover:scale-110',
                config.className
            )}
        >
            {config.icon}
        </span>
    );
}

function getBulanLabel(firstDate: string, fallback: string): string {
    if (!firstDate) return fallback;
    try {
        return format(parseISO(firstDate), 'MMMM', { locale: localeId });
    } catch {
        return fallback;
    }
}

export function AbsensiGrid({
    absensi,
    isLoading = false,
    maxCol = 3,
    maxRow = 2,
    bulanPerBaris = 3,
}: AbsensiGridProps) {
    if (isLoading) {
        return <AbsensiSkeleton />;
    }

    const bulanKeys = Object.keys(absensi ?? {}).sort((a, b) => Number(a) - Number(b));

    if (bulanKeys.length === 0) {
        return (
            <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg py-16">
                <div className="text-muted-foreground mb-2 text-4xl">📅</div>
                <p className="text-muted-foreground">Tidak ada data absensi</p>
            </div>
        );
    }

    const bulanRows: string[][] = [];
    for (let i = 0; i < bulanKeys.length; i += bulanPerBaris) {
        bulanRows.push(bulanKeys.slice(i, i + bulanPerBaris));
    }

    return (
        <div className="flex flex-col gap-8">
            {bulanRows.map((bulanGroup, idx) => (
                <div key={idx} className="w-full">
                    <div className="mb-3 sm:mb-4 flex gap-4 sm:gap-8">
                        {bulanGroup.map((bulanKey) => {
                            const tanggalList = Object.entries(absensi[bulanKey] ?? {}).sort(
                                ([a], [b]) => (a < b ? -1 : 1)
                            );
                            const firstDate = tanggalList[0]?.[0];
                            return (
                                <div
                                    key={bulanKey}
                                    className="min-w-0 flex-1 text-center text-sm font-semibold capitalize"
                                >
                                    {getBulanLabel(firstDate, `Bulan ${bulanKey}`)}
                                </div>
                            );
                        })}
                    </div>

                    <div
                        className={cn(
                            'flex gap-4 sm:gap-8',
                            bulanGroup.length === 1 && 'justify-center'
                        )}
                    >
                        {bulanGroup.map((bulanKey) => {
                            const tanggalList = Object.entries(absensi[bulanKey] ?? {}).sort(
                                ([a], [b]) => (a < b ? -1 : 1)
                            );
                            const cells = tanggalList.slice(0, maxCol * maxRow);
                            const rows: [string, string][][] = [];

                            for (let i = 0; i < cells.length; i += maxCol) {
                                rows.push(cells.slice(i, i + maxCol));
                            }

                            const hasMore = tanggalList.length > maxCol * maxRow;

                            return (
                                <div
                                    key={bulanKey}
                                    className={cn(
                                        'flex min-w-0 flex-1 flex-col gap-3',
                                        bulanGroup.length === 1 ? 'max-w-xs items-center' : 'items-start'
                                    )}
                                >
                                    {rows.length === 0 ? (
                                        <div className="text-muted-foreground text-sm italic">
                                            Tidak ada data
                                        </div>
                                    ) : (
                                        rows.map((row, rIdx) => (
                                            <div className="flex gap-2 sm:gap-3" key={rIdx}>
                                                {row.map(([tanggal, status]) => (
                                                    <div
                                                        key={tanggal}
                                                        className="flex flex-col items-center gap-1"
                                                    >
                                                        <div className="text-center">
                                                            <div className="text-muted-foreground text-xs font-bold">
                                                                {format(parseISO(tanggal), 'dd', {
                                                                    locale: localeId,
                                                                })}
                                                            </div>
                                                            <div className="text-muted-foreground/70 text-[10px]">
                                                                {format(parseISO(tanggal), 'MMM', {
                                                                    locale: localeId,
                                                                })}
                                                            </div>
                                                        </div>
                                                        <StatusIcon status={status} />
                                                    </div>
                                                ))}
                                                {hasMore && rIdx === rows.length - 1 && (
                                                    <div className="text-muted-foreground flex w-9 flex-col items-center justify-center text-xl">
                                                        ...
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
