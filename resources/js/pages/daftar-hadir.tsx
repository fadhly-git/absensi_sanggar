/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { AbsensiHadirMingguIni } from "@/components/absensi/AbsensiHadirMingguIni";
import { AbsensiFilterBar } from '@/components/absensi/AbsensiFilterBar';
import { AbsensiStatsCard } from '@/components/absensi/AbsensiStatsCard';
import { AbsensiCardGrid } from '@/components/absensi/AbsensiCardGrid';
import { AbsensiPagination } from '@/components/absensi/AbsensiPagination';
import { LoadingSpinner, ErrorMessage } from '@/components/absensi/AbsensiHelpers';
import { AbsensiInputDialog } from '@/components/absensi/AbsensiInputDialog';

import {
    useWeeklyAbsensi,
    useAttendanceCount,
    useActiveSiswa,
    useCreateAbsensi,
    useExportAbsensi
} from '@/hooks/useAbsensi';
import { useDebounce } from '@/hooks/use-debounce';

import type { BreadcrumbItem } from '@/types';
import type { Siswa } from '@/types/siswa';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Daftar Hadir', href: 'daftar-hadir' },
];

// components extracted to `components/absensi/*`

export default function DaftarHadir() {
    // State management
    const [filterMode, setFilterMode] = useState<'bulan' | 'tahun'>('bulan');
    const [periode, setPeriode] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        return filterMode === 'bulan'
            ? `${year}-${month.toString().padStart(2, '0')}`
            : year.toString();
    });

    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddDialog, setShowAddDialog] = useState(false);

    // Default ke hari Minggu terdekat
    const getNearestSunday = (date = new Date()) => {
        const dayOfWeek = date.getDay();
        const sunday = new Date(date);

        if (dayOfWeek === 0) {
            return sunday.toISOString().slice(0, 10);
        } else if (dayOfWeek <= 3) {
            sunday.setDate(date.getDate() - dayOfWeek);
        } else {
            sunday.setDate(date.getDate() + (7 - dayOfWeek));
        }

        return sunday.toISOString().slice(0, 10);
    };

    const [selectedDate, setSelectedDate] = useState(getNearestSunday());

    // Debounced search
    const debouncedSearch = useDebounce(searchValue, 500);

    // Memoized filter params
    const filterParams = useMemo(() => ({
        periode,
        mode: filterMode,
        ...(debouncedSearch && { search: debouncedSearch }),
        page: currentPage,
        limit: 20
    }), [periode, filterMode, debouncedSearch, currentPage]);

    // Data fetching
    const {
        data: weeklyData,
        isLoading: weeklyLoading,
        error: weeklyError,
        refetch: refetchWeekly
    } = useWeeklyAbsensi(filterParams);

    const {
        data: countData,
        isLoading: countLoading,
        error: countError
    } = useAttendanceCount(periode, filterMode);

    const {
        data: siswaData,
        isLoading: siswaLoading,
        error: siswaError
    } = useActiveSiswa(selectedDate);

    // Mutations
    const createAbsensi = useCreateAbsensi();
    const exportAbsensi = useExportAbsensi();

    useEffect(() => {
        if (createAbsensi.isSuccess) {
            refetchWeekly();
        }
    }, [createAbsensi.isSuccess, refetchWeekly]);


    // Event handlers
    const handleModeChange = useCallback((checked: boolean) => {
        const newMode = checked ? 'bulan' : 'tahun';
        setFilterMode(newMode);
        setCurrentPage(1);

        // Update periode format
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        setPeriode(newMode === 'bulan'
            ? `${year}-${month.toString().padStart(2, '0')}`
            : year.toString()
        );
    }, []);

    const handlePeriodeChange = useCallback((newPeriode: string) => {
        setPeriode(newPeriode);
        setCurrentPage(1);
    }, []);

    const handleSearchChange = useCallback((value: string) => {
        setSearchValue(value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleAddAbsensi = useCallback((absensiData: any[]) => {
        createAbsensi.mutate(absensiData, {
            onSuccess: () => {
                setShowAddDialog(false);
                refetchWeekly();
            }
        });
    }, [createAbsensi, refetchWeekly]);

    const handleExport = useCallback(() => {
        exportAbsensi.mutate({
            periode,
            mode: filterMode,
            ...(debouncedSearch && { search: debouncedSearch })
        });
    }, [exportAbsensi, periode, filterMode, debouncedSearch]);

    // Memoized values
    const tableData = useMemo(() =>
        (weeklyData?.data || []).map((row) => {
            const newRow: any = { ...row };
            Object.keys(newRow).forEach((key) => {
                if (typeof newRow[key] === 'boolean') {
                    // Ubah false menjadi 'T', true menjadi 'H', atau string lain yang sesuai
                    newRow[key] = newRow[key] ? 'H' : 'T';
                }
            });
            return newRow;
        }), [weeklyData]);
    const pagination = useMemo(() => weeklyData?.pagination, [weeklyData]);
    const attendanceCount = useMemo(() => countData || { masuk: 0, keluar: 0 }, [countData]);

    // Transform activeSiswa to match the expected Siswa interface
    const activeSiswa = useMemo(() => {
        if (!siswaData) return [];

        return (siswaData || []).map((siswa: any): Siswa => ({
            id: siswa.id,
            nama: siswa.nama || '',
            tanggal_terdaftar: siswa.tanggal_terdaftar || new Date().toISOString(),
            alamat: siswa.alamat || '',
            status: Boolean(siswa.status === 'active' || siswa.status === 1 || siswa.status === true),
            status_text: siswa.status_text || (siswa.status ? 'Aktif' : 'Tidak Aktif'),
            total_absensi: siswa.total_absensi || 0,
            absensi_bulan_ini: siswa.absensi_bulan_ini || 0,
            created_at: siswa.created_at || new Date().toISOString(),
            updated_at: siswa.updated_at || new Date().toISOString(),
            deleted_at: siswa.deleted_at || null
        }));
    }, [siswaData]);

    const siswaSudahAbsenPadaTanggal = useMemo(() => {
        if (!tableData || !selectedDate) return [];
        return tableData
            .filter(row => row[selectedDate] === 'H' || row[selectedDate] === 'B')
            .map(row => row.siswa_id);
    }, [tableData, selectedDate]);

    // Filter siswaList untuk dialog
    const siswaBisaDiabsen = useMemo(() => {
        return activeSiswa.filter(siswa => !siswaSudahAbsenPadaTanggal.includes(siswa.id));
    }, [activeSiswa, siswaSudahAbsenPadaTanggal]);


    // Loading states
    const isLoading = weeklyLoading || countLoading;
    const hasError = weeklyError || countError || siswaError;

    // Fallback sundays if API doesn't provide it
    const sundays = useMemo(() => {
        if (weeklyData?.sundays && weeklyData.sundays.length > 0) return weeklyData.sundays;
        if (tableData[0]) {
            return Object.keys(tableData[0]).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k));
        }
        return [];
    }, [weeklyData, tableData]);

    const getPaginationRange = (currentPage: number, totalPages: number, windowSize = 5) => {
        const half = Math.floor(windowSize / 2);
        let start = Math.max(1, currentPage - half);
        const end = Math.min(totalPages, start + windowSize - 1);

        if (end - start < windowSize - 1) {
            start = Math.max(1, end - windowSize + 1);
        }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Hadir" />

            <div className="flex h-full flex-col justify-center gap-2 rounded-xl p-4 w-full overflow-auto overflow-x-auto mx-auto">
                {/* Filter Controls */}
                <AbsensiFilterBar
                    filterMode={filterMode}
                    periode={periode}
                    onModeChange={handleModeChange}
                    onPeriodeChange={handlePeriodeChange}
                    searchValue={searchValue}
                    onSearchChange={handleSearchChange}
                    onExport={handleExport}
                    onAdd={() => setShowAddDialog(true)}
                    exportPending={exportAbsensi.isPending}
                    siswaLoading={siswaLoading}
                    hasError={!!hasError}
                />

                {/* Stats Card */}
                <div className="bg-card p-6 rounded-lg shadow-sm">
                    {countError ? (
                        <div className="text-destructive text-center py-4">Gagal memuat statistik kehadiran</div>
                    ) : (
                        <AbsensiStatsCard jumlah_masuk={attendanceCount.masuk} jumlah_tidak={attendanceCount.keluar} isLoading={countLoading} />
                    )}
                </div>

                {/* Data Cards (responsive, no table) */}
                <div className="flex-1 flex flex-col gap-6 w-full">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : weeklyError ? (
                        <div className="p-6">
                            <ErrorMessage
                                message="Gagal memuat data absensi. Periksa parameter filter."
                                onRetry={refetchWeekly}
                            />
                        </div>
                    ) : (
                        <>
                            <AbsensiCardGrid data={tableData} sundays={sundays} isLoading={false} onEdit={(r) => alert(`Edit absensi: ${r.siswa_nama}`)} />

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <AbsensiPagination pagination={pagination} isLoading={isLoading} onPageChange={handlePageChange} getPaginationRange={getPaginationRange} />
                            )}

                            <AbsensiHadirMingguIni
                                startDate={sundays[0]}
                                endDate={sundays[sundays.length - 1]}
                                onEdit={absen => {
                                    alert(`Edit absensi: ${absen.nama} (${absen.tanggal})`);
                                }}
                            />
                        </>
                    )}
                </div>

                {/* Show siswa loading error if needed */}
                {siswaError && (
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-red-600 text-sm">
                            Gagal memuat data siswa. Fitur tambah data tidak tersedia.
                        </p>
                    </div>
                )}
            </div>

            {/* Add Absensi Dialog */}
            {!siswaError && (
                <AbsensiInputDialog
                    open={showAddDialog}
                    onClose={() => setShowAddDialog(false)}
                    siswaList={siswaBisaDiabsen}
                    tanggal={selectedDate}
                    setTanggal={setSelectedDate}
                    onSubmit={handleAddAbsensi}
                />
            )}
        </AppLayout>
    );
}
