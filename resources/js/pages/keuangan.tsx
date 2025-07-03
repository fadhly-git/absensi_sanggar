import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { CustomMonthPicker, CustomYearPicker } from '@/components/month-picker';
import { DataTableKeuangan, DataTableKeuanganProps } from '@/components/keuangan/data-table';
import { KeuanganTabs } from '@/components/keuangan/form-keuangan';
import { ExportButtonFinancial } from '@/components/keuangan/export-data';
import { Switch } from '@/components/ui/switch';
import { CardSaldo } from '@/components/section-card';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

import { fetchSaldo, fetchTransactions } from '@/services/keuanganApi';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: route('atmin.keuangan') },
];

type FilterState = {
    mode: 'year' | 'month';
    date: string;
};

export default function Keuangan() {
    const [filter, setFilter] = useState<FilterState>(() => {
        const year = new Date().getFullYear().toString();
        return { mode: 'year', date: year };
    });

    const isMonthMode = filter.mode === 'month';

    // --- Queries with proper error handling
    const saldoQuery = useQuery({
        queryKey: ['saldo'],
        queryFn: fetchSaldo,
        staleTime: 5 * 60 * 1000,
        retry: 2,
        retryDelay: 1000
    });

    const uangMasukQuery = useQuery({
        queryKey: ['transactions', 'masuk', filter.date, filter.mode],
        queryFn: () => fetchTransactions('masuk', filter.date, filter.mode),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
        retry: 2,
        retryDelay: 1000
    });

    const uangKeluarQuery = useQuery({
        queryKey: ['transactions', 'keluar', filter.date, filter.mode],
        queryFn: () => fetchTransactions('keluar', filter.date, filter.mode),
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
        retry: 2,
        retryDelay: 1000
    });

    // Memoized data dengan validasi array
    const saldoData = useMemo(
        () =>
            saldoQuery.data
                ? {
                    terakhir: saldoQuery.data.saldo_terakhir || 0,
                    sebelumnya: saldoQuery.data.saldo_sebelumnya || 0
                }
                : undefined,
        [saldoQuery.data]
    );

    const uangMasukData = useMemo(() => {
        const data = uangMasukQuery.data;
        return Array.isArray(data) ? data : [];
    }, [uangMasukQuery.data]);

    const uangKeluarData = useMemo(() => {
        const data = uangKeluarQuery.data;
        return Array.isArray(data) ? data : [];
    }, [uangKeluarQuery.data]);

    // --- Handlers with useCallback for performance
    const handleModeChange = useCallback((checked: boolean) => {
        const mode = checked ? 'month' : 'year';
        const now = new Date();
        setFilter({
            mode,
            date: mode === 'month'
                ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
                : now.getFullYear().toString()
        });
    }, []);

    const handleDateChange = useCallback((val: string) => {
        setFilter(f => ({ ...f, date: val }));
    }, []);

    const handleRetry = useCallback(() => {
        saldoQuery.refetch();
        uangMasukQuery.refetch();
        uangKeluarQuery.refetch();
    }, [saldoQuery, uangMasukQuery, uangKeluarQuery]);

    // Error handling - hanya jika semua query error
    const hasGlobalError = (saldoQuery.error && uangMasukQuery.error && uangKeluarQuery.error);

    if (hasGlobalError) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Keuangan" />
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <div className="text-red-500 text-lg font-semibold">
                        Terjadi kesalahan saat memuat data
                    </div>
                    <div className="text-sm text-gray-600 text-center max-w-md">
                        {saldoQuery.error?.message || uangMasukQuery.error?.message || uangKeluarQuery.error?.message}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleRetry} variant="outline">
                            Coba Lagi
                        </Button>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-primary hover:bg-primary/90"
                        >
                            Muat Ulang Halaman
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Keuangan" />
            <div className="flex flex-col gap-4 p-4 bg-background">
                {/* Filter */}
                <FilterBar
                    isMonthMode={isMonthMode}
                    filter={filter}
                    onModeChange={handleModeChange}
                    onDateChange={handleDateChange}
                />

                {/* Saldo & Action */}
                <div className="border rounded-xl p-4 bg-background shadow-sm flex flex-col gap-2">
                    <div className="flex flex-wrap justify-end gap-2 mb-2">
                        <ExportButtonFinancial date={filter.date} param={filter.mode} />
                        <KeuanganTabs />
                    </div>
                    <CardSaldo
                        data={saldoData}
                        isLoading={saldoQuery.isLoading}
                    />
                </div>

                {/* Data Table */}
                <div className="grid gap-4 md:grid-cols-2 bg-background">
                    <KeuanganTableWrapper
                        title="💰 Uang Masuk"
                        type="masuk"
                        data={uangMasukData}
                        isLoading={uangMasukQuery.isLoading}
                        error={uangMasukQuery.error}
                    />
                    <KeuanganTableWrapper
                        title="💸 Uang Keluar"
                        type="keluar"
                        data={uangKeluarData}
                        isLoading={uangKeluarQuery.isLoading}
                        error={uangKeluarQuery.error}
                    />
                </div>
            </div>
        </AppLayout>
    );
}

interface Props {
    isMonthMode: boolean;
    filter: FilterState;
    onModeChange: (checked: boolean) => void;
    onDateChange: (val: string) => void;
}

// --- Filter Bar with React.memo for performance
const FilterBar = React.memo(
    ({ isMonthMode, onModeChange, onDateChange }: Props) => {
        return (
            <div className="sticky top-0 z-40 w-full bg-background backdrop-blur border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center gap-3 px-4 py-3">
                    {/* Title & Mode */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-bold text-base md:text-lg text-primary">
                            Ringkasan Keuangan
                        </span>
                        <div className="flex items-center gap-1 md:gap-2 bg-gray-50 dark:bg-black/20 px-2 py-1 rounded-lg">
                            <button
                                type="button"
                                className={`text-xs md:text-sm font-semibold px-2 py-0.5 rounded transition ${!isMonthMode
                                    ? "bg-primary text-primary-foreground"
                                    : "text-gray-700 dark:text-gray-300"
                                    }`}
                                aria-pressed={!isMonthMode}
                                tabIndex={0}
                                onClick={() => onModeChange(false)}
                            >
                                Tahun
                            </button>
                            <Switch
                                checked={isMonthMode}
                                onCheckedChange={onModeChange}
                                className="mx-1"
                                aria-label="Pilih Bulan/Tahun"
                            />
                            <button
                                type="button"
                                className={`text-xs md:text-sm font-semibold px-2 py-0.5 rounded transition ${isMonthMode
                                    ? "bg-primary text-primary-foreground"
                                    : "text-gray-700 dark:text-gray-300"
                                    }`}
                                aria-pressed={isMonthMode}
                                tabIndex={0}
                                onClick={() => onModeChange(true)}
                            >
                                Bulan
                            </button>
                        </div>
                    </div>
                    {/* Picker di bawah title & mode */}
                    <div className="flex items-center gap-2 w-full justify-center">
                        {isMonthMode ? (
                            <CustomMonthPicker onMonthChange={onDateChange} />
                        ) : (
                            <CustomYearPicker onYearChange={onDateChange} />
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

// --- Table Wrapper with error handling
type KeuanganTableWrapperProps = {
    title: string;
    type: 'masuk' | 'keluar';
    data?: DataTableKeuanganProps['datas'];
    isLoading: boolean;
    error?: Error | null;
};

const KeuanganTableWrapper = React.memo(({
    title,
    type,
    data = [],
    isLoading,
    error
}: KeuanganTableWrapperProps) => {
    // Pastikan data selalu array
    const safeData = Array.isArray(data) ? data : [];

    return (
        <div className="border rounded-xl flex flex-col bg-background shadow-sm">
            <div className="px-4 py-3 font-semibold text-lg border-b flex items-center justify-between">
                <span>{title}</span>
                {safeData.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                        {safeData.length} transaksi
                    </span>
                )}
            </div>
            <div className="p-4">
                {error ? (
                    <div className="py-10 text-center">
                        <div className="text-red-500 mb-2">Gagal memuat data {type}</div>
                        <div className="text-sm text-gray-500">{error.message}</div>
                    </div>
                ) : isLoading ? (
                    <div className="py-10 text-center">
                        <div className="animate-pulse text-muted-foreground">
                            Memuat data...
                        </div>
                    </div>
                ) : safeData.length === 0 ? (
                    <div className="py-10 text-center text-gray-500">
                        Tidak ada transaksi {type}
                    </div>
                ) : (
                    <DataTableKeuangan
                        datas={safeData}
                        type={type}
                        isLoading={false}
                    />
                )}
            </div>
        </div>
    );
});