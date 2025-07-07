/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAbsensiScan } from '@/hooks/useAbsensiScan';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Camera, CameraOff, CheckCircle2, RefreshCw, Repeat, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function AbsensiQrScanner() {
    const { loading, result, handleScan, reset, isError, error } = useAbsensiScan();
    const successAudio = useRef<HTMLAudioElement | null>(null);
    const errorAudio = useRef<HTMLAudioElement | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const autoResetRef = useRef<NodeJS.Timeout | null>(null); // Tambahan
    const [cameraActive, setCameraActive] = useState(true);
    const [timeoutActive, setTimeoutActive] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');


    // Reset timeout when there's activity
    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setTimeoutActive(false);

        timeoutRef.current = setTimeout(
            () => {
                setCameraActive(false);
                setTimeoutActive(true);
            },
            1 * 60 * 1000,
        ); // 2 minutes
    };

    // Start camera and reset timeout
    const startCamera = () => {
        setCameraActive(true);
        setTimeoutActive(false);
        resetTimeout();
    };

    // Initialize timeout on mount
    useEffect(() => {
        resetTimeout();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Reset timeout on scan activity
    useEffect(() => {
        if (loading) {
            resetTimeout();
        }
    }, [loading]);

    useEffect(() => {
        if (result) {
            if (result.success) successAudio.current?.play();
            else errorAudio.current?.play();

            // Auto reset result setelah 2 detik
            autoResetRef.current = setTimeout(() => {
                reset();
            }, 500);
        }
        return () => {
            if (autoResetRef.current) clearTimeout(autoResetRef.current);
        };
    }, [result, reset]);

    useEffect(() => {
        if (isError) {
            console.error('Error during scan:', error);
            const timer = setTimeout(() => {
                reset();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isError, reset]);

    const handleScanResult = (scanResult: any) => {
        // console.log('Scan result:', scanResult);
        if (scanResult && scanResult.length > 0 && !loading && cameraActive) {
            handleScan(scanResult[0].rawValue);
            resetTimeout(); // Reset timeout on successful scan
        }
        // resetTimeout();
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-sky-100">
            <Card className="w-full max-w-lg border-0 shadow-xl flex flex-col items-center justify-center">
                <CardHeader className="text-center w-full">
                    <CardTitle className="text-2xl font-bold text-indigo-700">Absensi Siswa QR</CardTitle>
                    <p className="text-muted-foreground mt-1 text-sm">Arahkan QR ke kamera, scan otomatis</p>
                </CardHeader>
                <CardContent className="flex flex-col items-center w-full">
                    {/* Alert notification always rendered, but only visible if result */}
                    <div className="w-full flex flex-col items-center mb-4 min-h-[120px]">
                        {isError && (
                            <Alert variant="destructive" className="flex flex-col items-center w-full max-w-xs mx-auto">
                                <XCircle size={48} className="mb-1 text-red-500" />
                                <AlertTitle className="text-lg font-bold">Terjadi Kesalahan</AlertTitle>
                                <AlertDescription className="text-center">
                                    {error?.message || 'Gagal memproses scan. Coba lagi.'}
                                </AlertDescription>
                            </Alert>
                        )}
                        {result && (
                            <Alert variant={result.success ? 'default' : 'destructive'} className="flex flex-col items-center w-full max-w-xs mx-auto">
                                {result.success ? (
                                    <CheckCircle2 size={48} className="mb-1 text-green-500" />
                                ) : (
                                    <XCircle size={48} className="mb-1 text-red-500" />
                                )}
                                <AlertTitle className="text-lg font-bold">{result.success ? 'Berhasil!' : 'Gagal'}</AlertTitle>
                                <AlertDescription className="text-center">{result.message}</AlertDescription>
                                {/* Tombol Scan Lagi dihilangkan karena auto reset */}
                            </Alert>
                        )}
                    </div>

                    {/* Scanner section */}
                    <div className="flex flex-col items-center gap-4 w-full">
                        <div className="relative flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-indigo-400 bg-black shadow-inner w-full max-w-xs h-72 mx-auto">
                            {cameraActive ? (
                                <>
                                    <Scanner
                                        onScan={handleScanResult}
                                        constraints={{
                                            facingMode: facingMode,
                                        }}
                                        styles={{
                                            container: { width: '100%', height: '100%' },
                                            video: { width: '100%', height: '100%', objectFit: 'cover' },
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                                        onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                                        title="Ganti Kamera"
                                    >
                                        <Repeat className="w-5 h-5 text-indigo-700" />
                                    </button>
                                    {loading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                                            <RefreshCw className="mb-2 animate-spin text-white" size={36} />
                                            <span className="text-white">Memproses...</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-white">
                                    <CameraOff size={48} className="mb-4 text-gray-400" />
                                    <p className="mb-4 text-center text-sm text-gray-300">
                                        {timeoutActive ? 'Kamera dimatikan karena tidak ada aktivitas' : 'Kamera tidak aktif'}
                                    </p>
                                    <Button onClick={startCamera} variant="outline" className="bg-white text-black hover:bg-gray-100">
                                        <Camera className="mr-2" size={16} />
                                        Aktifkan Kamera
                                    </Button>
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-center text-xs text-gray-500">
                            {cameraActive ? 'Pastikan QR jelas & siswa terdaftar' : 'Klik tombol untuk mengaktifkan kamera'}
                        </p>
                    </div>

                    {/* Audio notification */}
                    <audio ref={successAudio} src="/sounds/success.mp3" preload="auto" />
                    <audio ref={errorAudio} src="/sounds/wrong.mp3" preload="auto" />
                </CardContent>
            </Card>
        </div>
    );
}
