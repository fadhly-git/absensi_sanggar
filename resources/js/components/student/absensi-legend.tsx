// resources/js/components/student/absensi-legend.tsx
import { cn } from '@/lib/utils';

interface LegendItem {
    status: string;
    icon: string;
    label: string;
    colorClass: string;
}

const legendItems: LegendItem[] = [
    {
        status: 'H',
        icon: '✓',
        label: 'Hadir',
        colorClass: 'border-green-500/30 bg-green-500/10 text-green-600',
    },
    {
        status: 'T',
        icon: '✕',
        label: 'Tidak Hadir',
        colorClass: 'border-red-500/30 bg-red-500/10 text-red-600',
    },
    {
        status: 'B',
        icon: '!',
        label: 'Bonus',
        colorClass: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
    },
    {
        status: '?',
        icon: '?',
        label: 'Lainnya',
        colorClass: 'border-muted-foreground/30 bg-muted text-muted-foreground',
    },
];

interface AbsensiLegendProps {
    className?: string;
}

export function AbsensiLegend({ className }: AbsensiLegendProps) {
    return (
        <div className={cn('flex flex-wrap items-center justify-center gap-4', className)}>
            {legendItems.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                    <span
                        className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full border text-sm font-medium',
                            item.colorClass
                        )}
                    >
                        {item.icon}
                    </span>
                    <span className="text-muted-foreground text-sm">{item.label}</span>
                </div>
            ))}
        </div>
    );
}
