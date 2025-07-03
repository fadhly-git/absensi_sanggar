/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { AbsensiHadirMingguIni } from "@/components/absensi/AbsensiHadirMingguIni";
import { CustomMonthPicker, CustomYearPicker } from '@/components/month-picker';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { AbsensiWeeklyTable } from '@/components/absensi/AbsensiWeeklyTable';
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

// Simple replacement components for missing imports
const CardDH = ({
    jumlah_siswa_m,
    jumlah_siswa_s,
    isLoading
}: { jumlah_siswa_m: number; jumlah_siswa_s: number; isLoading: boolean }) => (
    <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Siswa Masuk</h3>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{isLoading ? '...' : jumlah_siswa_m}</p>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Siswa Tidak berangkat</h3>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{isLoading ? '...' : jumlah_siswa_s}</p>
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
);

const ErrorMessage = ({
    message,
    onRetry
}: { message: string; onRetry: () => void }) => (
    <div className="text-center py-8">
        <p className="text-red-600 mb-4">{message}</p>
        <button onClick={onRetry} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Coba Lagi
        </button>
    </div>
);

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
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

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
                <div className="bg-card p-6 rounded-lg shadow-sm container w-full">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Filter controls */}
                        <div className="flex flex-col gap-2 sm:flex-row items-center justify-center w-full sm:gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Tahun</span>
                                <Switch
                                    checked={filterMode === 'bulan'}
                                    onCheckedChange={handleModeChange}
                                />
                                <span className="text-sm font-medium">Bulan</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {filterMode === 'bulan' ? (
                                    <CustomMonthPicker
                                        onMonthChange={handlePeriodeChange}
                                    />
                                ) : (
                                    <CustomYearPicker
                                        onYearChange={handlePeriodeChange}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                            <Input
                                placeholder="Cari nama siswa..."
                                value={searchValue}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full sm:w-64"
                            />
                            <Button
                                variant="outline"
                                onClick={handleExport}
                                disabled={exportAbsensi.isPending || !!hasError}
                                className="w-full sm:w-auto"
                            >
                                {exportAbsensi.isPending ? 'Mengekspor...' : 'Export'}
                            </Button>
                            <Button
                                onClick={() => setShowAddDialog(true)}
                                disabled={siswaLoading || !!siswaError}
                                className="w-full sm:w-auto"
                            >
                                Tambah Data
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="bg-card p-6 rounded-lg shadow-sm">
                    {countError ? (
                        <div className="text-red-600 text-center py-4">
                            Gagal memuat statistik kehadiran
                        </div>
                    ) : (
                        <CardDH
                            jumlah_siswa_m={attendanceCount.masuk}
                            jumlah_siswa_s={attendanceCount.keluar}
                            isLoading={countLoading}
                        />
                    )}
                </div>

                {/* Data Table */}
                <div className="flex-1 flex flex-col gap-4 rounded-xl container">
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
                            <div className="relative flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-bsorder">
                                <AbsensiWeeklyTable
                                    data={tableData}
                                    sundays={sundays}
                                    isLoading={false}
                                />
                            </div>
                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t container">
                                    {/* Info - sembunyikan di layar sangat kecil */}
                                    <div className="text-xs sm:text-sm text-muted-foreground text-center w-full sm:w-auto">
                                        Menampilkan {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, pagination.totalRows)} dari {pagination.totalRows} data
                                    </div>

                                    {/* Pagination controls */}
                                    <div className="w-full sm:w-auto">
                                        <div className="flex flex-nowrap overflow-x-auto gap-1 sm:gap-2 items-center justify-center sm:justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1 || isLoading}
                                            >
                                                Previous
                                            </Button>

                                            <div className="flex flex-nowrap gap-1">
                                                {getPaginationRange(pagination.currentPage, pagination.totalPages, 5).map(page => (
                                                    <Button
                                                        key={page}
                                                        variant={page === pagination.currentPage ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(page)}
                                                        disabled={isLoading}
                                                        className="min-w-[2.5rem] px-2 sm:px-3 whitespace-nowrap"
                                                    >
                                                        {page}
                                                    </Button>
                                                ))}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.totalPages || isLoading}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <AbsensiHadirMingguIni
                                startDate={sundays[0]}
                                endDate={sundays[sundays.length - 1]}
                                onEdit={absen => {
                                    // Tampilkan dialog edit absensi, misal setEditAbsensi(absen)
                                    // Atau tampilkan alert/console.log(absen) untuk sementara
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