import { CustomMonthPicker, CustomYearPicker } from '@/components/month-picker';
import { Switch } from '@/components/ui/switch';
import { useAbsensiRiwayat } from '@/hooks/useAbsensiRiwayat';
import { useAuth } from '@/hooks/useAuth';
import StudentLayout from '@/layouts/student-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { AbsensiLegend } from './absensi-legend';
import { AbsensiGridPerBarisBulan } from './absensi-perbulan';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('siswa.absensi'),
    },
];

export default function DaftarHadirSiswa() {
    const [bulanPerBaris, setBulanPerBaris] = useState(2);
    useEffect(() => {
        const handler = () => setBulanPerBaris(window.innerWidth < 1024 ? 2 : 3);
        handler();
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    const { loading: authLoading, isAuthenticated } = useAuth();
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [filter, setFilter] = React.useState<FilterState>(() => {
        const now = new Date();
        return {
            mode: 'tahun',
            bulan: String(now.getMonth() + 1).padStart(2, '0'),
            tahun: now.getFullYear().toString(),
        };
    });

    const isMonthMode = filter.mode === 'bulan';

    //data fetching
    const { data, isLoading } = useAbsensiRiwayat(auth.user.id, filter.mode, filter.bulan, filter.tahun);

    // --- Handlers with useCallback for performance
    const handleModeChange = React.useCallback((checked: boolean) => {
        const mode = checked ? 'bulan' : 'tahun';
        const now = new Date();
        setFilter({
            mode,
            bulan: String(now.getMonth() + 1).padStart(2, '0'),
            tahun: now.getFullYear().toString(),
        });
    }, []);

    const handleDateChange = React.useCallback(
        (val: string) => {
            if (filter.mode === 'bulan') {
                // val format: "YYYY-MM"
                const [tahun, bulan] = val.split('-');
                setFilter((f) => ({
                    ...f,
                    bulan: bulan || f.bulan,
                    tahun: tahun || f.tahun,
                }));
            } else {
                // val format: "YYYY"
                setFilter((f) => ({
                    ...f,
                    tahun: val,
                }));
            }
        },
        [filter.mode],
    );

    // Show loading spinner jika auth masih loading
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    }

    // Show error jika tidak authenticated
    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">Not Authenticated</h2>
                    <p className="mb-4 text-gray-600">Please login to access the dashboard.</p>
                    <button
                        onClick={() => (window.location.href = '/login')}
                        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Hadir Siswa" />
            <FilterBar
                isMonthMode={isMonthMode} // Default to year mode
                filter={filter}
                onModeChange={handleModeChange}
                onDateChange={handleDateChange}
                name={auth.user.name}
            />
            <div className="flex flex-1 flex-col px-4">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    {/* --------- Start: Layout baru agar mirip GitHub Profile --------- */}
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 py-8 lg:flex-row">
                        {/* Main content */}
                        <div className="flex w-full flex-col gap-2">
                            <AbsensiLegend />
                            {isLoading ? (
                                <div className="flex flex-col gap-8">
                                    {[0, 1].map((rowIdx) => (
                                        <div key={rowIdx} className="w-full">
                                            {/* Header bulan skeleton */}
                                            <div className="mb-3 flex gap-8">
                                                {[0, 1, 2].map((colIdx) => (
                                                    <Skeleton key={colIdx} className="mx-auto h-6 w-20" />
                                                ))}
                                            </div>
                                            {/* Grid absensi per bulan skeleton */}
                                            <div className="flex gap-8">
                                                {[0, 1, 2].map((colIdx) => (
                                                    <div key={colIdx} className="flex min-w-0 flex-1 flex-col items-start gap-2">
                                                        {[0, 1].map((rIdx) => (
                                                            <div className="flex gap-4" key={rIdx}>
                                                                {[0, 1, 2].map((cIdx) => (
                                                                    <SkeletonStatus key={cIdx} />
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : data ? (
                                <AbsensiGridPerBarisBulan absensi={data.absensi ?? data} maxCol={3} maxRow={3} bulanPerBaris={bulanPerBaris} />
                            ) : (
                                <div className="py-8 text-center text-gray-500">Tidak ada data absensi.</div>
                            )}
                        </div>
                    </div>
                    {/* --------- End: Layout baru --------- */}
                </div>
            </div>
        </StudentLayout>
    );
}

const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`animate-pulse rounded bg-gray-200 dark:bg-neutral-800 ${className}`} />
);

const SkeletonStatus = () => (
    <div className="flex flex-col items-center gap-1">
        <Skeleton className="mb-1 h-3 w-8 rounded-sm" />
        <Skeleton className="h-8 w-8 rounded-full" />
    </div>
);

type FilterState = {
    mode: 'tahun' | 'bulan';
    bulan: string;
    tahun: string;
};

interface Props {
    isMonthMode: boolean;
    filter: FilterState;
    onModeChange: (checked: boolean) => void;
    onDateChange: (val: string) => void;
    name: string;
}

// --- Filter Bar with React.memo for performance
const FilterBar = React.memo(({ isMonthMode, onModeChange, onDateChange, name }: Props) => {
    return (
        <div className="bg-background sticky top-0 z-40 w-full border-b border-gray-100 backdrop-blur dark:border-gray-800">
            <div className="flex flex-col items-center gap-3 px-4 py-3">
                {/* Title & Mode */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-primary text-base font-bold md:text-lg">Daftar Hadir Siswa</span>
                    <span className="text-xs">Selamat datang, {name}. Berikut adalah daftar hadir Anda.</span>
                    <div className="flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1 md:gap-2 dark:bg-black/20">
                        <button
                            type="button"
                            className={`rounded px-2 py-0.5 text-xs font-semibold transition md:text-sm ${!isMonthMode ? 'bg-primary text-primary-foreground' : 'text-gray-700 dark:text-gray-300'
                                }`}
                            aria-pressed={!isMonthMode}
                            tabIndex={0}
                            onClick={() => onModeChange(false)}
                        >
                            Tahun
                        </button>
                        <Switch checked={isMonthMode} onCheckedChange={onModeChange} className="mx-1" aria-label="Pilih Bulan/Tahun" />
                        <button
                            type="button"
                            className={`rounded px-2 py-0.5 text-xs font-semibold transition md:text-sm ${isMonthMode ? 'bg-primary text-primary-foreground' : 'text-gray-700 dark:text-gray-300'
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
                <div className="flex w-full items-center justify-center gap-2">
                    {isMonthMode ? <CustomMonthPicker onMonthChange={onDateChange} /> : <CustomYearPicker onYearChange={onDateChange} />}
                </div>
            </div>
        </div>
    );
});
