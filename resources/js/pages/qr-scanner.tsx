import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAbsensiScan } from "@/hooks/useAbsensiScan"
import { useRef, useEffect } from "react"
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { QrReader } from 'react-qr-reader'

export default function AbsensiQrScanner() {
    const { loading, result, handleScan, reset } = useAbsensiScan()
    const successAudio = useRef<HTMLAudioElement | null>(null)
    const errorAudio = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        if (result) {
            if (result.success) successAudio.current?.play()
            else errorAudio.current?.play()
        }
    }, [result])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-sky-100">
            <Card className="w-full max-w-lg shadow-xl border-0">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-indigo-700">Absensi Siswa QR</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Arahkan QR ke kamera, scan otomatis</p>
                </CardHeader>
                <CardContent>
                    {!result && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="rounded-xl border-2 border-dashed border-indigo-400 bg-black w-72 h-72 flex items-center justify-center overflow-hidden shadow-inner relative">
                                <QrReader
                                    constraints={{ facingMode: "user" }}
                                    containerStyle={{ width: "100%", height: "100%" }}
                                    videoStyle={{ width: "100%", height: "100%" }}
                                    onResult={(result) => {
                                        if (result?.getText && !loading) handleScan(result.getText())
                                    }}
                                />
                                {loading && (
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                        <RefreshCw className="animate-spin text-white mb-2" size={36} />
                                        <span className="text-white">Memproses...</span>
                                    </div>
                                )}
                            </div>
                            <p className="mt-2 text-gray-500 text-center text-xs">Pastikan QR jelas & siswa terdaftar</p>
                        </div>
                    )}

                    {result && (
                        <Alert
                            variant={result.success ? "default" : "destructive"}
                            className="my-4 flex flex-col items-center"
                        >
                            {result.success ? (
                                <CheckCircle2 size={48} className="text-green-500 mb-1" />
                            ) : (
                                <XCircle size={48} className="text-red-500 mb-1" />
                            )}
                            <AlertTitle className="text-lg font-bold">
                                {result.success ? "Berhasil!" : "Gagal"}
                            </AlertTitle>
                            <AlertDescription className="text-center">
                                {result.message}
                            </AlertDescription>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={reset}
                            >
                                Scan Lagi
                            </Button>
                        </Alert>
                    )}

                    {/* Audio notification */}
                    <audio ref={successAudio} src="/sounds/success.mp3" preload="auto" />
                    <audio ref={errorAudio} src="/sounds/wrong.mp3" preload="auto" />
                </CardContent>
            </Card>
        </div>
    )
}