import StudentLayout from "@/layouts/student-layout";
import { Head } from "@inertiajs/react";
import { SharedData, type BreadcrumbItem } from '@/types';
import { useAuth } from "@/hooks/useAuth";
import { usePage } from "@inertiajs/react";
import { CustomMonthPicker, CustomYearPicker } from "@/components/month-picker";
import { Switch } from "@/components/ui/switch";
import React, { useEffect, useState } from "react";
import { useAbsensiRiwayat } from "@/hooks/useAbsensiRiwayat";
import { AbsensiGridPerBarisBulan } from "./absensi-perbulan";
import { AbsensiLegend } from "./absensi-legend";

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
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    const { loading: authLoading, isAuthenticated } = useAuth();
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [filter, setFilter] = React.useState<FilterState>(() => {
        const now = new Date();
        return {
            mode: 'tahun',
            bulan: String(now.getMonth() + 1).padStart(2, '0'),
            tahun: now.getFullYear().toString()
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
            tahun: now.getFullYear().toString()
        });
    }, []);

    const handleDateChange = React.useCallback((val: string) => {
        if (filter.mode === 'bulan') {
            // val format: "YYYY-MM"
            const [tahun, bulan] = val.split('-');
            setFilter(f => ({
                ...f,
                bulan: bulan || f.bulan,
                tahun: tahun || f.tahun
            }));
        } else {
            // val format: "YYYY"
            setFilter(f => ({
                ...f,
                tahun: val
            }));
        }
    }, [filter.mode]);

    // Show loading spinner jika auth masih loading
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Show error jika tidak authenticated
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h2>
                    <p className="text-gray-600 mb-4">Please login to access the dashboard.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
                    <div className="w-full flex flex-col lg:flex-row gap-2 py-8 max-w-7xl mx-auto">
                        {/* Main content */}
                        <div className="w-full flex flex-col gap-2">
                            <AbsensiLegend />
                            {isLoading ? (
                                <div className="flex flex-col gap-8">
                                    {[0, 1].map((rowIdx) => (
                                        <div key={rowIdx} className="w-full">
                                            {/* Header bulan skeleton */}
                                            <div className="flex gap-8 mb-3">
                                                {[0, 1, 2].map((colIdx) => (
                                                    <Skeleton key={colIdx} className="h-6 w-20 mx-auto" />
                                                ))}
                                            </div>
                                            {/* Grid absensi per bulan skeleton */}
                                            <div className="flex gap-8">
                                                {[0, 1, 2].map((colIdx) => (
                                                    <div key={colIdx} className="flex flex-col gap-2 items-start flex-1 min-w-0">
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
                                <AbsensiGridPerBarisBulan
                                    absensi={data.absensi ?? data}
                                    maxCol={3}
                                    maxRow={3}
                                    bulanPerBaris={bulanPerBaris}
                                />
                            ) : (
                                <div className="text-center text-gray-500 py-8">Tidak ada data absensi.</div>
                            )}

                        </div>
                    </div>
                    {/* --------- End: Layout baru --------- */}
                </div>
            </div>
        </StudentLayout>
    );
}

const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-neutral-800 rounded ${className}`} />
);

const SkeletonStatus = () => (
    <div className="flex flex-col items-center gap-1">
        <Skeleton className="w-8 h-3 rounded-sm mb-1" />
        <Skeleton className="w-8 h-8 rounded-full" />
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
const FilterBar = React.memo(
    ({ isMonthMode, onModeChange, onDateChange, name }: Props) => {
        return (
            <div className="sticky top-0 z-40 w-full bg-background backdrop-blur border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-center gap-3 px-4 py-3">
                    {/* Title & Mode */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-bold text-base md:text-lg text-primary">
                            Daftar Hadir Siswa
                        </span>
                        <span className="text-xs">Selamat datang, {name}. Berikut adalah daftar hadir Anda.</span>
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