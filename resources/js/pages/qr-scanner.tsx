/* eslint-disable @typescript-eslint/no-explicit-any */
import { SundayPicker, getNearestSunday, isSunday } from '@/components/molecules/sunday-picker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAbsensiScan } from '@/hooks/useAbsensiScan';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
    Camera,
    CameraOff,
    CheckCircle2,
    Gift,
    RefreshCw,
    Repeat,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function AbsensiQrScanner() {
    const { loading, result, handleScan, reset, isError, error } =
        useAbsensiScan();
    const successAudio = useRef<HTMLAudioElement | null>(null);
    const errorAudio = useRef<HTMLAudioElement | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const autoResetRef = useRef<NodeJS.Timeout | null>(null);
    const [cameraActive, setCameraActive] = useState(true);
    const [timeoutActive, setTimeoutActive] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
        'environment',
    );
    // Default ke hari Minggu terdekat
    const [date, setDate] = useState<Date | undefined>(getNearestSunday());
    const dateRef = useRef<Date | undefined>(date);
    const bonusAudio = useRef<HTMLAudioElement | null>(null);
    const hasShownToastRef = useRef(false);

    // Update ref setiap kali date berubah
    useEffect(() => {
        dateRef.current = date;
    }, [date]);

    useEffect(() => {
        // Validasi: hanya izinkan scan jika hari Minggu (toast sekali saja)
        if (date && !isSunday(date) && !hasShownToastRef.current) {
            toast.error('Absensi hanya dapat dilakukan pada hari Minggu', {
                description: 'Silakan pilih hari Minggu untuk melakukan scan absensi',
                duration: 5000
            });
            hasShownToastRef.current = true;
        } else if (date && isSunday(date)) {
            hasShownToastRef.current = false; // Reset flag jika pilih Minggu
        }
    }, [date]);

    const resetTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(
            () => {
                setCameraActive(false);
                setTimeoutActive(true);
            },
            1 * 60 * 1000,
        );
    };

    const startCamera = () => {
        setCameraActive(true);
        setTimeoutActive(false);
        resetTimeout();
    };

    useEffect(() => {
        resetTimeout();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (loading) resetTimeout();
    }, [loading]);

    useEffect(() => {
        if (result || isError) {
            if (autoResetRef.current) {
                clearTimeout(autoResetRef.current);
            }

            autoResetRef.current = setTimeout(() => {
                reset();
            }, 30_000); // ⏱ 30 detik
        }

        return () => {
            if (autoResetRef.current) {
                clearTimeout(autoResetRef.current);
            }
        };
    }, [result, isError, reset]);

    useEffect(() => {
        if (!result && !isError) return;

        let audio: HTMLAudioElement | null = null;

        if (result?.bonus) audio = bonusAudio.current;
        else if (result?.success) audio = successAudio.current;
        else audio = errorAudio.current;

        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(console.error);
        }
    }, [result, isError]);

    const handleScanResult = useCallback((scanResult: any) => {
        if (scanResult && scanResult.length > 0 && !loading && cameraActive) {
            // Gunakan ref untuk mendapat nilai date terbaru
            const currentDate = dateRef.current;

            // Validasi: pastikan tanggal sudah dipilih
            if (!currentDate) {
                toast.error('Pilih tanggal terlebih dahulu', {
                    description: 'Silakan pilih hari Minggu untuk melakukan scan absensi'
                });
                return;
            }

            // Format tanggal ke YYYY-MM-DD tanpa timezone conversion
            const formatDate = (d: Date): string => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const dateString = formatDate(currentDate);

            // Validasi: cek apakah tanggal adalah hari Minggu
            if (!isSunday(currentDate)) {
                toast.error('Tidak dapat melakukan scan', {
                    description: 'Absensi hanya dapat dilakukan pada hari Minggu'
                });
                return;
            }

            const payload = [
                {
                    rawValue: scanResult[0].rawValue,
                    tanggal: dateString,
                },
            ];
            handleScan(payload);
            resetTimeout();
        }
    }, [loading, cameraActive, handleScan]);
    return (
        <div className="min-h-screen bg-background p-4 sm:p-6">
            <div className="mx-auto max-w-5xl">
                <Card className="overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700">
                    <div className="bg-card p-5 text-primary-foreground sm:p-6">
                        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="w-full">
                                <h1 className="text-2xl font-extrabold text-indigo-900/70 sm:text-3xl dark:text-indigo-200">
                                    Absensi Siswa QR
                                </h1>
                                <p className="mt-1 text-sm text-indigo-900/70 dark:text-indigo-200">
                                    Arahkan QR ke kamera — scan otomatis dan
                                    cepat
                                </p>
                            </div>
                            <div className="mt-3 w-full sm:mt-0 sm:w-auto">
                                <div className="text-right text-sm">
                                    <span className="block text-sm text-indigo-500/90 dark:text-indigo-200">
                                        Tanggal Absensi
                                    </span>
                                    <div className="mt-2">
                                        <SundayPicker
                                            id="scanner-date"
                                            name="scanner-date"
                                            value={date}
                                            onChange={setDate}
                                            placeholder="Pilih hari Minggu"
                                            showWarning={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                            <div className="md:col-span-2">
                                <div className="relative overflow-hidden rounded-2xl border border-slate-200/10 bg-black/80 shadow-inner dark:border-slate-700/30 dark:bg-neutral-900">
                                    <div className="relative h-[360px] w-full sm:h-[420px] md:h-[520px]">
                                        {cameraActive ? (
                                            <>
                                                <Scanner
                                                    key={facingMode}
                                                    onScan={handleScanResult}
                                                    constraints={{ facingMode }}
                                                    styles={{
                                                        container: {
                                                            width: '100%',
                                                            height: '100%',
                                                            borderRadius: 16,
                                                            overflow: 'hidden',
                                                        },
                                                        video: {
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            transform:
                                                                facingMode ===
                                                                'user'
                                                                    ? 'scaleX(1)'
                                                                    : 'scaleX(1)',
                                                        },
                                                    }}
                                                />

                                                <div className="pointer-events-none absolute inset-0">
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="h-40 w-64 rounded-lg border-2 border-white/40 backdrop-blur-sm" />
                                                    </div>

                                                    <div className="absolute top-4 left-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                                                        <span className="inline-flex items-center gap-2">
                                                            <svg
                                                                className="h-4 w-4"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                            >
                                                                <circle
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="white"
                                                                    strokeOpacity="0.5"
                                                                    strokeWidth="1.5"
                                                                />
                                                            </svg>
                                                            Live Camera
                                                        </span>
                                                    </div>

                                                    {loading && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                                                            <RefreshCw className="mb-2 animate-spin" />
                                                            <span>
                                                                Memproses...
                                                            </span>
                                                        </div>
                                                    )}

                                                    {result && (
                                                        <div
                                                            className={`absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full px-5 py-2 text-sm font-medium ${
                                                                result.success
                                                                    ? 'bg-card/90 text-black'
                                                                    : 'bg-red-800/90'
                                                            } shadow-lg`}
                                                        >
                                                            {result.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-slate-300">
                                                <CameraOff
                                                    size={56}
                                                    className="mb-4 text-slate-400"
                                                />
                                                <p className="mb-4">
                                                    {timeoutActive
                                                        ? 'Kamera dimatikan otomatis karena tidak ada aktivitas'
                                                        : 'Kamera non-aktif — klik tombol di bawah untuk mengaktifkan kembali'}
                                                </p>
                                                <div className="flex gap-3">
                                                    <Button
                                                        onClick={startCamera}
                                                        className="bg-white text-black hover:bg-gray-100"
                                                    >
                                                        <Camera
                                                            className="mr-2"
                                                            size={16}
                                                        />{' '}
                                                        Aktifkan Kamera
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute right-4 bottom-4 flex gap-3">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="bg-white/10 text-white hover:bg-white/20"
                                            onClick={() =>
                                                setFacingMode(
                                                    facingMode === 'user'
                                                        ? 'environment'
                                                        : 'user',
                                                )
                                            }
                                            title="Ganti Kamera"
                                        >
                                            <Repeat className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            size="sm"
                                            className="bg-white text-black hover:bg-gray-100"
                                            onClick={() => {
                                                reset();
                                                setTimeout(
                                                    () => resetTimeout(),
                                                    200,
                                                );
                                            }}
                                        >
                                            <RefreshCw className="mr-2 h-4 w-4" />{' '}
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <aside className="space-y-4">
                                <div className="rounded-xl p-4 shadow backdrop-blur-sm">
                                    <h3 className="text-sm font-semibold">
                                        Status Scan
                                    </h3>
                                    <div className="mt-3 space-y-3">
                                        {/* ERROR */}
                                        {isError && (
                                            <Alert
                                                variant="destructive"
                                                className={`transition-colors duration-300 ${isError ? 'border-blink' : 'border-border'} `}
                                            >
                                                <XCircle className="h-4 w-4" />
                                                <AlertTitle className="text-destructive">
                                                    Terjadi Kesalahan
                                                </AlertTitle>
                                                <AlertDescription className="text-destructive/90">
                                                    {error?.message ||
                                                        'Gagal memproses scan.'}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {/* IDLE */}
                                        {!isError && !result && (
                                            <div className="rounded-md border border-border bg-card p-3 text-sm text-muted-foreground">
                                                Siap menerima QR. Pastikan QR
                                                terlihat jelas.
                                            </div>
                                        )}

                                        {/* BONUS */}
                                        {result && result.bonus && (
                                            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                                                <Gift className="h-4 w-4" />
                                                <AlertTitle className="text-emerald-400">
                                                    Bonus Kehadiran
                                                </AlertTitle>
                                                <AlertDescription className="text-emerald-400/90">
                                                    {result.message}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {/* RESULT (SUCCESS / FAIL) */}
                                        {result && !result.bonus && (
                                            <div
                                                className={`flex items-start gap-3 rounded-md border p-3 ${
                                                    result.success
                                                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                                        : 'border-destructive/40 bg-destructive/10 text-destructive'
                                                }`}
                                            >
                                                {result.success ? (
                                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                                                )}

                                                <div>
                                                    <div className="font-semibold">
                                                        {result.success
                                                            ? 'Berhasil'
                                                            : 'Gagal'}
                                                    </div>
                                                    <div
                                                        className={`mt-1 text-sm opacity-90 ${
                                                            result.success
                                                                ? 'text-emerald-400'
                                                                : 'text-destructive'
                                                        }`}
                                                    >
                                                        {result.message}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 rounded-xl bg-white/60 p-4 shadow backdrop-blur-sm dark:bg-white/5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-semibold">
                                                Kontrol Cepat
                                            </h4>
                                            <p className="text-xs text-slate-600">
                                                Ganti kamera, reset, atau
                                                nonaktifkan kamera
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 md:flex-col">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setFacingMode(
                                                    facingMode === 'user'
                                                        ? 'environment'
                                                        : 'user',
                                                )
                                            }
                                        >
                                            <Repeat className="mr-2" /> Ganti
                                            Kamera
                                        </Button>

                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                if (cameraActive) {
                                                    setCameraActive(false);
                                                } else {
                                                    startCamera();
                                                }
                                            }}
                                        >
                                            {cameraActive ? (
                                                <>
                                                    <CameraOff className="mr-2" />{' '}
                                                    Nonaktifkan
                                                </>
                                            ) : (
                                                <>
                                                    <Camera className="mr-2" />{' '}
                                                    Aktifkan
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-3 text-xs text-slate-500">
                                    Tips: Gunakan kamera belakang untuk hasil
                                    terbaik. Pastikan pencahayaan memadai.
                                </div>
                            </aside>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <audio
                ref={successAudio}
                src="/sounds/success.mp3"
                preload="auto"
            />
            <audio ref={errorAudio} src="/sounds/wrong.mp3" preload="auto" />
            <audio ref={bonusAudio} src="/sounds/bonus.wav" preload="auto" />
        </div>
    );
}
