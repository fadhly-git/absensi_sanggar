<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Services\QrCodeService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class Absensi extends Controller
{
    protected $qrCodeService;

    public function __construct(QrCodeService $qrCodeService)
    {
        $this->qrCodeService = $qrCodeService;
    }

    public function generateQrCode($id)
    {
        try {
            $siswa = Siswa::findOrFail($id);

            // Generate QR code menggunakan service
            $qrPath = $this->qrCodeService->generateQrCode($siswa, true); // Force regenerate

            if (!$qrPath) {
                return response()->json([
                    'message' => 'Gagal membuat QR Code',
                ], 500);
            }

            return response()->json([
                'message' => 'QR Code berhasil dibuat',
                'qrcode_path' => $qrPath,
            ]);

        } catch (\Exception $e) {
            Log::error('Error generating QR code', [
                'siswa_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Gagal membuat QR Code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getQr($id)
    {
        try {
            $siswa = Siswa::findOrFail($id);

            // Otorisasi: pastikan hanya siswa tsb atau admin yang boleh akses
            // Uncomment jika ingin menambahkan authorization
            // if (auth()->user()->id !== $siswa->user_id && !auth()->user()->hasRole('admin')) {
            //     abort(403);
            // }

            $path = $siswa->qrcode_path;

            if (!$path || !Storage::disk('public')->exists($path)) {
                // Generate QR code jika belum ada
                $this->qrCodeService->generateQrCode($siswa);
                $siswa->refresh();
                $path = $siswa->qrcode_path;

                if (!$path) {
                    abort(404, 'QR Code tidak dapat dibuat');
                }
            }

            $file = Storage::disk('public')->get($path);
            return response($file)->header('Content-Type', 'image/png');

        } catch (\Exception $e) {
            Log::error('Error getting QR code', [
                'siswa_id' => $id,
                'error' => $e->getMessage()
            ]);
            abort(404);
        }
    }
}
