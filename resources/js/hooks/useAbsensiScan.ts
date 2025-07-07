import { useMutation } from '@tanstack/react-query';
import { scanAbsensi, ScanResult } from '@/services/absensiScanService';

export function useAbsensiScan() {
    const mutation = useMutation<ScanResult, Error, string>({
        mutationFn: scanAbsensi,
    });

    const handleScan = (qrText: string) => {
        try {
            const parsed = JSON.parse(qrText);
            if (!parsed.id) {
                mutation.reset();
                mutation.mutateAsync(''); // error, kirim string kosong
                return;
            }
            mutation.mutate(qrText); // kirim string JSON QR utuh
        } catch {
            mutation.reset();
            mutation.mutateAsync(''); // error
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