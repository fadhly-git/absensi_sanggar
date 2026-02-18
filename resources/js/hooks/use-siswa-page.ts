/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSiswa, useSiswaMutations } from '@/hooks/useSiswa';
import { useDebounce } from '@/hooks/use-debounce';
import { SiswaService } from '@/services/siswaService';
import { toast } from 'sonner';
import type { Siswa, SiswaFilters, SiswaFormData } from '@/types/siswa';

export function useSiswaPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState<number>(12); // Grid biasanya lebih bagus dengan kelipatan 3 atau 4
    const [filters, setFilters] = useState<SiswaFilters>({
        search: '',
        status: 'all',
        sortBy: 'nama',
        sortOrder: 'asc',
    });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [formDialog, setFormDialog] = useState<{ open: boolean; siswa?: Siswa | null }>({ open: false, siswa: null });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: number }>({ open: false });

    const debouncedFilters = useDebounce(filters, 500);
    const { data: siswaData, isLoading, error, refetch } = useSiswa(page, perPage, debouncedFilters);
    const mutations = useSiswaMutations();

    const isAnyLoading = useMemo(() =>
        Object.values(mutations).some(m => (m as any).isPending) || isLoading,
    [mutations, isLoading]);

    // Toast Handlers
    useEffect(() => {
        if (mutations.createMutation.isSuccess) toast.success('Siswa berhasil ditambahkan');
        if (mutations.updateMutation.isSuccess) toast.success('Data siswa diperbarui');
        if (mutations.deleteMutation.isSuccess) toast.success('Siswa dihapus');
    }, [mutations.createMutation.isSuccess, mutations.updateMutation.isSuccess, mutations.deleteMutation.isSuccess]);

    const handleFiltersChange = useCallback((newFilters: Partial<SiswaFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1);
    }, []);

    const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
        if (selectedIds.length === 0) return toast.error('Pilih siswa terlebih dahulu');
        try {
            await mutations.bulkActionMutation.mutateAsync({ action, ids: selectedIds });
            setSelectedIds([]);
            refetch();
        } catch (err) { console.error(err); }
    };

    const selectAllOnPage = useCallback(() => {
        if (!siswaData || !siswaData.data) return;
        const idsOnPage = siswaData.data.map((s: any) => s.id as number);
        // If all already selected, clear selection; otherwise select all on page
        const allSelected = idsOnPage.every((id: number) => selectedIds.includes(id));
        setSelectedIds(allSelected ? [] : idsOnPage);
    }, [siswaData, selectedIds]);

    const handleImport = useCallback(() => {
        toast.info('Fitur import sedang dalam pengembangan', {
            description: 'Silakan tunggu update selanjutnya',
        });
    }, []);

    return {
        state: { page, perPage, filters, selectedIds, formDialog, deleteDialog, siswaData, isLoading, isAnyLoading, error },
        actions: {
            setPage,
            setPerPage,
            setFilters: handleFiltersChange,
            setSelectedIds,
            setFormDialog,
            setDeleteDialog,
            refetch,
            handleBulkAction,
            selectAllOnPage,
            handleExport: (f: boolean) => SiswaService.exportToExcel(f ? filters : {}),
            handleDelete: async (id: number) => {
                await mutations.deleteMutation.mutateAsync(id);
                setDeleteDialog({ open: false });
                refetch();
            },
            handleFormSubmit: async (data: SiswaFormData) => {
                if (formDialog.siswa) {
                    await mutations.updateMutation.mutateAsync({ id: formDialog.siswa.id, data });
                } else {
                    await mutations.createMutation.mutateAsync(data);
                }
                setFormDialog({ open: false, siswa: null });
                refetch();
            },
            handleImport,
        }
    };
}
