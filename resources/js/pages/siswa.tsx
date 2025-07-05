/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, Trash2, RefreshCw, FileDown } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

import AppLayout from '@/layouts/app-layout';
import { SiswaStats } from '@/components/siswa/siswa-stats';
import { SiswaFiltersComponent } from '@/components/siswa/siswa-filters';
import { SiswaTable } from '@/components/siswa/siswa-table';
import { SiswaFormDialog } from '@/components/siswa/siswa-form-dialog';
import { useSiswa, useSiswaMutations } from '@/hooks/useSiswa';
import type { Siswa, SiswaFilters, SiswaFormData } from '@/types/siswa';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import { SiswaService } from '@/services/siswaService';

const breadcrumbs = [
    { title: 'Dashboard', href: 'atmin.dashboard' },
    { title: 'Siswa', href: 'atmin.siswa' },
];

export default function SiswaPage() {
    // State management
    const [page, setPage] = useState(1);
    const [perPage] = useState(20);
    const [filters, setFilters] = useState<SiswaFilters>({
        search: '',
        status: 'all',
        sortBy: 'nama',
        sortOrder: 'asc',
    });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [formDialog, setFormDialog] = useState<{
        open: boolean;
        siswa?: Siswa | null;
    }>({ open: false, siswa: null });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        id?: number;
    }>({ open: false });

    // Debounce search to avoid too many API calls
    const debouncedFilters = useDebounce(filters, 500);

    // Data fetching
    const { data: siswaData, isLoading, error, refetch } = useSiswa(page, perPage, debouncedFilters);
    const {
        createMutation,
        updateMutation,
        deleteMutation,
        bulkActionMutation
    } = useSiswaMutations();

    // Memoized values
    const isAnyLoading = useMemo(() =>
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending ||
        bulkActionMutation.isPending,
        [createMutation.isPending, updateMutation.isPending, deleteMutation.isPending, bulkActionMutation.isPending]
    );

    // Effect untuk handle mutation success/error
    useEffect(() => {
        if (createMutation.isSuccess) {
            toast.success('Siswa berhasil ditambahkan!', {
                description: 'Data siswa baru telah tersimpan dalam database.',
            });
        }
        if (createMutation.isError) {
            const errorMessage = createMutation.error?.response?.data?.message || 'Gagal menambahkan siswa';
            toast.error('Gagal menambahkan siswa', {
                description: errorMessage,
            });
        }
    }, [createMutation.isSuccess, createMutation.isError, createMutation.error]);

    useEffect(() => {
        if (updateMutation.isSuccess) {
            toast.success('Data siswa berhasil diperbarui!', {
                description: 'Perubahan telah tersimpan dalam database.',
            });
        }
        if (updateMutation.isError) {
            const errorMessage = updateMutation.error?.response?.data?.message || 'Gagal memperbarui data siswa';
            toast.error('Gagal memperbarui data siswa', {
                description: errorMessage,
            });
        }
    }, [updateMutation.isSuccess, updateMutation.isError, updateMutation.error]);

    useEffect(() => {
        if (deleteMutation.isSuccess) {
            toast.success('Siswa berhasil dihapus!', {
                description: 'Data siswa telah dihapus dari database.',
            });
        }
        if (deleteMutation.isError) {
            const errorMessage = deleteMutation.error?.response?.data?.message || 'Gagal menghapus siswa';
            toast.error('Gagal menghapus siswa', {
                description: errorMessage,
            });
        }
    }, [deleteMutation.isSuccess, deleteMutation.isError, deleteMutation.error]);

    // Event handlers
    const handleFiltersChange = useCallback((newFilters: Partial<SiswaFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1); // Reset to first page when filters change
        setSelectedIds([]); // Clear selections
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters({
            search: '',
            status: 'all',
            sortBy: 'nama',
            sortOrder: 'asc',
        });
        setPage(1);
        setSelectedIds([]);
        toast.info('Filter telah direset');
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        setSelectedIds([]); // Clear selections when changing page
    }, []);

    const handleFormSubmit = useCallback(async (data: SiswaFormData) => {
        try {
            if (formDialog.siswa) {
                // Update existing siswa
                await updateMutation.mutateAsync({
                    id: formDialog.siswa.id,
                    data
                });
                setFormDialog({ open: false, siswa: null });
            } else {
                // Create new siswa
                await createMutation.mutateAsync(data);
                setFormDialog({ open: true, siswa: null });
            }
            // Refetch data to update the table
            refetch();
        } catch (error) {
            // Error handling sudah dilakukan di useEffect di atas
            console.error('Error submitting form:', error);
        }
    }, [formDialog.siswa, updateMutation, createMutation, refetch]);

    const handleDelete = useCallback(async (id: number) => {
        try {
            await deleteMutation.mutateAsync(id);
            setDeleteDialog({ open: false });
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
            // Refetch data to update the table
            refetch();
        } catch (error) {
            // Error handling sudah dilakukan di useEffect di atas
            console.error('Error deleting siswa:', error);
        }
    }, [deleteMutation, refetch]);

    const handleBulkAction = useCallback(async (action: 'activate' | 'deactivate' | 'delete') => {
        if (selectedIds.length === 0) {
            toast.error('Tidak ada siswa yang dipilih', {
                description: 'Pilih minimal satu siswa untuk melakukan aksi massal',
            });
            return;
        }

        const actionMessages = {
            activate: 'mengaktifkan',
            deactivate: 'menonaktifkan',
            delete: 'menghapus'
        };

        const loadingToast = toast.loading(`Sedang ${actionMessages[action]} ${selectedIds.length} siswa...`);

        try {
            await bulkActionMutation.mutateAsync({ action, ids: selectedIds });
            toast.dismiss(loadingToast);
            toast.success(`Berhasil ${actionMessages[action]} ${selectedIds.length} siswa`);
            setSelectedIds([]);
            refetch();
        } catch (error: any) {
            toast.dismiss(loadingToast);
            const errorMessage = error.response?.data?.message || `Gagal ${actionMessages[action]} siswa`;
            toast.error(`Gagal ${actionMessages[action]} siswa`, {
                description: errorMessage,
            });
        }
    }, [selectedIds, bulkActionMutation, refetch]);

    // Tambahkan di siswa.tsx
    const handleExportAll = useCallback(async () => {
        const exportToast = toast.loading('Mempersiapkan export data...');

        try {
            // Export semua data (tanpa filter)
            await SiswaService.exportToExcel({});
            toast.dismiss(exportToast);
            toast.success('Data berhasil diekspor!', {
                description: 'Semua data siswa telah didownload dalam format Excel'
            });
        } catch {
            toast.dismiss(exportToast);
            toast.error('Gagal mengekspor data', {
                description: 'Terjadi kesalahan saat membuat file Excel'
            });
        }
    }, []);

    const handleExportFiltered = useCallback(async () => {
        const exportToast = toast.loading('Mempersiapkan export data...');

        try {
            // Export dengan filter yang sedang aktif
            await SiswaService.exportToExcel(filters);
            toast.dismiss(exportToast);
            toast.success('Data berhasil diekspor!', {
                description: 'Data siswa dengan filter telah didownload'
            });
        } catch {
            toast.dismiss(exportToast);
            toast.error('Gagal mengekspor data');
        }
    }, [filters]);

    const handleImport = useCallback(() => {
        toast.info('Fitur import sedang dalam pengembangan', {
            description: 'Silakan tunggu update selanjutnya',
        });
    }, []);

    const handleRefresh = useCallback(() => {
        const refreshToast = toast.loading('Memperbarui data...');
        refetch()
            .then(() => {
                toast.dismiss(refreshToast);
                toast.success('Data berhasil diperbarui');
            })
            .catch(() => {
                toast.dismiss(refreshToast);
                toast.error('Gagal memperbarui data');
            });
    }, [refetch]);

    // Render pagination
    const renderPagination = () => {
        if (!siswaData || siswaData.last_page <= 1) return null;

        const totalPages = siswaData.last_page;
        const currentPage = siswaData.current_page;

        return (
            <div className="flex items-center justify-between m-2 flex-col sm:flex-row">
                <div className="text-sm text-gray-500">
                    Menampilkan {siswaData.from} sampai {siswaData.to} dari {siswaData.total} siswa
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + Math.max(1, currentPage - 2);
                            if (pageNum > totalPages) return null;

                            return (
                                <PaginationItem key={pageNum}>
                                    <PaginationLink
                                        onClick={() => handlePageChange(pageNum)}
                                        isActive={pageNum === currentPage}
                                        className="cursor-pointer"
                                    >
                                        {pageNum}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        );
    };

    // Loading state
    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Siswa" />
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">Gagal memuat data siswa</p>
                        <p className="text-sm text-gray-600 mb-4">
                            {error?.message || 'Terjadi kesalahan saat memuat data'}
                        </p>
                        <Button onClick={handleRefresh}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Coba Lagi
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // ...existing code...
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Siswa" />

            <div className="space-y-6 w-full mx-auto px-2 sm:px-4 md:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full mt-2 sm:mt-4">
                    <div>
                        <h1 className="text-2xl font-bold">Manajemen Siswa</h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">
                            Kelola data siswa sanggar - Total: {siswaData?.total || 0} siswa
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer w-full sm:w-auto"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>

                        {/* Bulk Actions */}
                        {selectedIds.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" disabled={isAnyLoading} className="w-full sm:w-auto">
                                        Aksi Massal ({selectedIds.length})
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48">
                                    <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                                        Aktifkan Semua
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                                        Nonaktifkan Semua
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handleBulkAction('delete')}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Hapus Semua
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Import/Export */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                                <DropdownMenuItem onClick={handleExportAll}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Semua Data
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleImport}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import Data
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportFiltered}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Data Terfilter
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => SiswaService.downloadTemplate()}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Download Template
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Add Button */}
                        <Button
                            onClick={() => setFormDialog({ open: true, siswa: null })}
                            disabled={isAnyLoading}
                            className="w-full sm:w-auto"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Siswa
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <SiswaStats />

                <div className="w-full">
                    {/* Filters */}
                    <div className="overflow-x-auto">
                        <SiswaFiltersComponent
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                            onReset={handleResetFilters}
                        />
                    </div>
                </div>

                <div className="w-full">
                    {/* Table */}
                    <SiswaTable
                        data={siswaData?.data || []}
                        isLoading={isLoading}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        onEdit={(siswa) => setFormDialog({ open: true, siswa })}
                        onDelete={(id) => setDeleteDialog({ open: true, id })}
                        onView={(siswa) => toast.info(`Detail siswa: ${siswa.nama}`)}
                    />
                </div>

                {/* Pagination */}
                <div className="w-full">{renderPagination()}</div>

                {/* Form Dialog */}
                <SiswaFormDialog
                    open={formDialog.open}
                    onOpenChange={(open) => !isAnyLoading && setFormDialog({ open, siswa: null })}
                    siswa={formDialog.siswa}
                    onSubmit={handleFormSubmit}
                    isLoading={isAnyLoading}
                />

                {/* Delete Confirmation */}
                <AlertDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) => !isAnyLoading && setDeleteDialog({ open })}
                >
                    <AlertDialogContent className="max-w-full sm:max-w-md">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Konfirmasi Hapus Siswa</AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus siswa ini?
                                Data siswa akan dihapus permanen dan tidak dapat dipulihkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isAnyLoading}>
                                Batal
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deleteDialog.id && handleDelete(deleteDialog.id)}
                                disabled={isAnyLoading}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
    // ...existing code...
}