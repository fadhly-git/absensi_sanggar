/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@tanstack/react-query';
import { scanAbsensi, ScanResult } from '@/services/absensiScanService';

export function useAbsensiScan() {
    const mutation = useMutation<ScanResult, Error, any[]>({
        mutationFn: scanAbsensi,
    });

    const handleScan = (payload: any[]) => {
        try {
            // Validasi payload: pastikan array dan ada rawValue
            if (
                !Array.isArray(payload) ||
                !payload[0] ||
                !payload[0].rawValue
            ) {
                mutation.reset();
                mutation.mutateAsync([]); // kirim array kosong untuk error
                return;
            }
            mutation.mutate(payload); // kirim array ke backend
        } catch {
            mutation.reset();
            mutation.mutateAsync([]); // error
        }
    };

    const reset = () => mutation.reset();

    return {
        loading: mutation.isPending,
        result: mutation.data,
        handleScan,
        reset,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
    };
}