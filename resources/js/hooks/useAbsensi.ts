/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AbsensiService } from '@/services/absensiService';
import type { AbsensiWeeklyFilter } from '@/types/absensi';
import { toast } from 'sonner';

export function useWeeklyAbsensi(params: AbsensiWeeklyFilter) {
    return useQuery({
        queryKey: ['weeklyAbsensi', params],
        queryFn: () => AbsensiService.getWeeklyReport(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: !!(params.periode && params.mode)
    });
}

export function useAttendanceCount(periode: string, mode: 'tahun' | 'bulan') {
    return useQuery({
        queryKey: ['attendanceCount', periode, mode],
        queryFn: () => AbsensiService.getAttendanceCount(periode, mode),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: 2,
        enabled: !!(periode && mode)
    });
}

export function useActiveSiswa(tanggal: string) {
    return useQuery({
        queryKey: ['activeSiswa', tanggal],
        queryFn: () => AbsensiService.getActiveSiswa(tanggal),
        enabled: !!tanggal
    });
}

export function useCreateAbsensi() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: AbsensiService.createAbsensi,
        onSuccess: () => {
            toast.success('Data absensi berhasil disimpan');

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['weeklyAbsensi'] });
            queryClient.invalidateQueries({ queryKey: ['attendanceCount'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data absensi');
        }
    });
}

export function useExportAbsensi() {
    return useMutation({
        mutationFn: AbsensiService.exportWeeklyReport,
        onSuccess: () => {
            toast.success('Data berhasil diekspor');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal mengekspor data');
        }
    });
}