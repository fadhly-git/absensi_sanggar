import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomMonthPicker, CustomYearPicker } from '@/components/month-picker';
import { Label } from '@/components/ui/label';

interface Props {
    filterMode: 'bulan' | 'tahun';
    periode: string;
    onModeChange: (v: boolean) => void;
    onPeriodeChange: (val: string) => void;
    searchValue: string;
    onSearchChange: (v: string) => void;
    onExport: () => void;
    onAdd: () => void;
    exportPending?: boolean;
    siswaLoading?: boolean;
    hasError?: boolean;
}

export const AbsensiFilterBar: React.FC<Props> = ({
    filterMode,
    periode,
    onModeChange,
    onPeriodeChange,
    searchValue,
    onSearchChange,
    onExport,
    onAdd,
    exportPending,
    siswaLoading,
    hasError,
}) => {
    return (
        <div className="bg-card p-6 rounded-lg shadow-sm w-full">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row items-center justify-center w-full sm:gap-4">
                    <div className="flex items-center gap-2">
                        <Label>Tahun</Label>
                        <Switch checked={filterMode === 'bulan'} onCheckedChange={onModeChange} />
                        <Label>Bulan</Label>
                    </div>

                    <div className="flex items-center gap-2">
                        {filterMode === 'bulan' ? (
                            <CustomMonthPicker onMonthChange={onPeriodeChange} value={periode} />
                        ) : (
                            <CustomYearPicker onYearChange={onPeriodeChange} value={periode} />
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                    <Input
                        placeholder="Cari nama siswa..."
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full sm:w-64"
                    />
                    <Button
                        variant="outline"
                        onClick={onExport}
                        disabled={exportPending || !!hasError}
                        className="w-full sm:w-auto"
                    >
                        {exportPending ? 'Mengekspor...' : 'Export'}
                    </Button>
                    <Button onClick={onAdd} disabled={siswaLoading || !!hasError} className="w-full sm:w-auto">
                        Tambah Data
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AbsensiFilterBar;
