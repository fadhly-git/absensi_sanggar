// resources/js/components/student/filter-bar.tsx
import { CustomMonthPicker, CustomYearPicker } from '@/components/month-picker';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { memo } from 'react';

export interface FilterState {
    mode: 'tahun' | 'bulan';
    bulan: string;
    tahun: string;
}

interface FilterBarProps {
    isMonthMode: boolean;
    filter: FilterState;
    onModeChange: (checked: boolean) => void;
    onDateChange: (val: string) => void;
    availableYears?: number[];
    title?: string;
    subtitle?: string;
}

export const FilterBar = memo(function FilterBar({
    isMonthMode,
    onModeChange,
    onDateChange,
    availableYears = [],
    title = 'Daftar Hadir Siswa',
    subtitle,
}: FilterBarProps) {
    return (
        <div className="bg-background/95 sticky top-0 z-40 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex flex-col items-center gap-4 px-4 py-4">
                <div className="flex flex-col items-center gap-3">
                    <h1 className="text-lg font-bold md:text-xl">{title}</h1>
                    {subtitle && (
                        <p className="text-muted-foreground text-center text-sm">{subtitle}</p>
                    )}

                    <div className="bg-muted flex items-center gap-1 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => onModeChange(false)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                !isMonthMode
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Tahun
                        </button>
                        <Switch
                            checked={isMonthMode}
                            onCheckedChange={onModeChange}
                            className="mx-1"
                            aria-label="Toggle mode bulan/tahun"
                        />
                        <button
                            type="button"
                            onClick={() => onModeChange(true)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                isMonthMode
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Bulan
                        </button>
                    </div>
                </div>

                <div className="flex w-full max-w-xs items-center justify-center">
                    {isMonthMode ? (
                        <CustomMonthPicker onMonthChange={onDateChange} />
                    ) : (
                        <CustomYearPicker
                            onYearChange={onDateChange}
                            availableYears={availableYears}
                        />
                    )}
                </div>
            </div>
        </div>
    );
});
