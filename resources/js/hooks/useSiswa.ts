/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SiswaService } from '@/services/siswaService';
import type { SiswaFormData, SiswaFilters } from '@/types/siswa';
import { toast } from 'sonner';

export function useSiswa(
    page: number = 1,
    perPage: number = 10,
    filters: Partial<SiswaFilters> = {}
) {
    return useQuery({
        queryKey: ['siswa', page, perPage, filters],
        queryFn: () => SiswaService.getAll(page, perPage, filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: (previousData) => previousData,
    });
}

export function useSiswaById(id: number) {
    return useQuery({
        queryKey: ['siswa', id],
        queryFn: () => SiswaService.getById(id),
        staleTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: (previousData) => previousData,
        enabled: !!id, // Only run if id is defined
    });
}

export function useSiswaByIdSpecific(ids: number[]) {

}

export function useSiswaStats() {
    return useQuery({
        queryKey: ['siswa-stats'],
        queryFn: SiswaService.getStats,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

export function useSiswaMutations() {
    const queryClient = useQueryClient();

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['siswa'] });
        queryClient.invalidateQueries({ queryKey: ['siswa-stats'] });
    };

    const createMutation = useMutation({
        mutationFn: SiswaService.create,
        onSuccess: () => {
            toast.success('Siswa berhasil ditambahkan');
            invalidateQueries();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menambahkan siswa');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<SiswaFormData> }) =>
            SiswaService.update(id, data),
        onSuccess: () => {
            toast.success('Siswa berhasil diperbarui');
            invalidateQueries();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal memperbarui siswa');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: SiswaService.delete,
        onSuccess: () => {
            toast.success('Siswa berhasil dihapus');
            invalidateQueries();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menghapus siswa');
        },
    });

    const bulkActionMutation = useMutation({
        mutationFn: ({ action, ids }: { action: 'activate' | 'deactivate' | 'delete'; ids: number[] }) =>
            SiswaService.bulkAction(action, ids),
        onSuccess: (_, { action }) => {
            const messages = {
                activate: 'Siswa berhasil diaktifkan',
                deactivate: 'Siswa berhasil dinonaktifkan',
                delete: 'Siswa berhasil dihapus'
            };
            toast.success(messages[action]);
            invalidateQueries();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Operasi gagal');
        },
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
        bulkActionMutation,
    };
}