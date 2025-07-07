import { useMutation } from '@tanstack/react-query';
import { scanAbsensi, ScanResult } from '@/services/absensiScanService';

export function useAbsensiScan() {
    const mutation = useMutation<ScanResult, Error, number>({
        mutationFn: scanAbsensi,
    });

    const handleScan = (qrText: string) => {
        try {
            const parsed = JSON.parse(qrText);
            if (!parsed.id) {
                mutation.reset();
                mutation.mutateAsync(-1); // error
                return;
            }
            mutation.mutate(parsed.id);
        } catch {
            mutation.reset();
            mutation.mutateAsync(-1); // error
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
    };
}