// resources/js/pages/student/daftar-hadir-siswa.tsx
import { AbsensiGrid } from '@/components/student/absensi-grid';
import { AbsensiLegend } from '@/components/student/absensi-legend';
import { FilterBar, FilterState } from '@/components/student/filter-bar';
import { FullPageLoader } from '@/components/atoms/loading-spinner';
import { NotAuthenticated } from '@/components/student/not-authenticated';
import { useAbsensiRiwayat } from '@/hooks/useAbsensiRiwayat';
import { useAvailableYears } from '@/hooks/useAvailableYears';
import { useAuth } from '@/hooks/useAuth';
import StudentLayout from '@/layouts/student-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Daftar Hadir',
        href: route('siswa.absensi'),
    },
];

export default function DaftarHadirSiswa() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const page = usePage<SharedData>();
    const { auth } = page.props;

    const [bulanPerBaris, setBulanPerBaris] = useState(2);
    const [filter, setFilter] = useState<FilterState>(() => {
        const now = new Date();
        return {
            mode: 'tahun',
            bulan: String(now.getMonth() + 1).padStart(2, '0'),
            tahun: now.getFullYear().toString(),
        };
    });

    // Fetch available years
    const { data: availableYears, isLoading: yearsLoading } = useAvailableYears(auth.user.id);

    const { data, isLoading } = useAbsensiRiwayat(
        auth.user.id,
        filter.mode,
        filter.bulan,
        filter.tahun
    );

    useEffect(() => {
        const updateBulanPerBaris = () => {
            setBulanPerBaris(window.innerWidth < 1024 ? 2 : 3);
        };

        updateBulanPerBaris();
        window.addEventListener('resize', updateBulanPerBaris);
        return () => window.removeEventListener('resize', updateBulanPerBaris);
    }, []);

    const handleModeChange = useCallback((checked: boolean) => {
        const mode = checked ? 'bulan' : 'tahun';
        const now = new Date();
        setFilter({
            mode,
            bulan: String(now.getMonth() + 1).padStart(2, '0'),
            tahun: now.getFullYear().toString(),
        });
    }, []);

    const handleDateChange = useCallback(
        (val: string) => {
            if (filter.mode === 'bulan') {
                const [tahun, bulan] = val.split('-');
                setFilter((prev) => ({
                    ...prev,
                    bulan: bulan || prev.bulan,
                    tahun: tahun || prev.tahun,
                }));
            } else {
                setFilter((prev) => ({
                    ...prev,
                    tahun: val,
                }));
            }
        },
        [filter.mode]
    );

    if (authLoading) {
        return <FullPageLoader text="Memverifikasi sesi..." />;
    }

    if (!isAuthenticated) {
        return <NotAuthenticated />;
    }

    const isMonthMode = filter.mode === 'bulan';

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Hadir Siswa" />

            <FilterBar
                isMonthMode={isMonthMode}
                filter={filter}
                onModeChange={handleModeChange}
                onDateChange={handleDateChange}
                availableYears={availableYears || []}
                title="Daftar Hadir Siswa"
                subtitle={`Selamat datang, ${auth.user.name}. Berikut adalah daftar kehadiran Anda.`}
            />

            <div className="flex flex-1 flex-col px-3 sm:px-4">
                <div className="mx-auto w-full max-w-7xl py-4 sm:py-6 lg:py-8">
                    <AbsensiLegend className="mb-4 sm:mb-6" />
                    <AbsensiGrid
                        absensi={data?.absensi ?? data ?? {}}
                        isLoading={isLoading}
                        maxCol={3}
                        maxRow={3}
                        bulanPerBaris={bulanPerBaris}
                    />
                </div>
            </div>
        </StudentLayout>
    );
}
