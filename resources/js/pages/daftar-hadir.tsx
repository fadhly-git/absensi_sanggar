/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

// Simple replacement components for missing imports
const CardDH = ({ jumlah_siswa_m, jumlah_siswa_s, isLoading }: { jumlah_siswa_m: number; jumlah_siswa_s: number; isLoading: boolean }) => (
    <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Siswa Masuk</h3>
            <p className="text-2xl font-bold text-green-900">{isLoading ? '...' : jumlah_siswa_m}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800">Siswa Keluar</h3>
            <p className="text-2xl font-bold text-red-900">{isLoading ? '...' : jumlah_siswa_s}</p>
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
);

const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="text-center py-8">
        <p className="text-red-600 mb-4">{message}</p>
        <button onClick={onRetry} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Coba Lagi
        </button>
    </div>
);

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

    // Memoized filter params - fix parameter structure
    const filterParams = useMemo(() => ({
        periode,
        mode: filterMode,
        ...(debouncedSearch && { search: debouncedSearch }),
        page: currentPage,
        limit: 20
    }), [periode, filterMode, debouncedSearch, currentPage]);

    console.info('LAYER 1 (KOMPONEN): useMemo membuat objek ini:', filterParams);

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
    } = useActiveSiswa();

    // Mutations
    const createAbsensi = useCreateAbsensi();
    const exportAbsensi = useExportAbsensi();


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
    const tableData = useMemo(() => weeklyData?.data || [], [weeklyData]);
    const pagination = useMemo(() => weeklyData?.pagination, [weeklyData]);
    const attendanceCount = useMemo(() => countData || { masuk: 0, keluar: 0 }, [countData]);

    // Transform activeSiswa to match the expected Siswa interface
    const activeSiswa = useMemo(() => {
        if (!siswaData) return [];

        return (siswaData || []).map((siswa: any): Siswa => ({
            id: siswa.id,
            nama: siswa.nama || '',
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

    // Loading states
    const isLoading = weeklyLoading || countLoading;
    const hasError = weeklyError || countError || siswaError;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Hadir" />

            <div className="space-y-6 p-6">
                {/* Filter Controls */}
                <div className="bg-card p-6 rounded-lg shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
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

                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Cari nama siswa..."
                                value={searchValue}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-64"
                            />

                            <Button
                                variant="outline"
                                onClick={handleExport}
                                disabled={exportAbsensi.isPending || !!hasError}
                            >
                                {exportAbsensi.isPending ? 'Mengekspor...' : 'Export'}
                            </Button>

                            <Button
                                onClick={() => setShowAddDialog(true)}
                                disabled={siswaLoading || !!siswaError}
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
                <div className="bg-card rounded-lg shadow-sm overflow-hidden">
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
                            <AbsensiWeeklyTable
                                data={tableData}
                                sundays={weeklyData?.sundays || []}
                                isLoading={false}
                            />

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between p-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        Menampilkan {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, pagination.totalRows)} dari {pagination.totalRows} data
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1 || isLoading}
                                        >
                                            Previous
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                const page = i + 1;
                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={page === pagination.currentPage ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(page)}
                                                        disabled={isLoading}
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            })}
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
                            )}
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
                    siswaList={activeSiswa}
                    tanggal={selectedDate}
                    setTanggal={setSelectedDate}
                    onSubmit={handleAddAbsensi}
                />
            )}
        </AppLayout>
    );
}