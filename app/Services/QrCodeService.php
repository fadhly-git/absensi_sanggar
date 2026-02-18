<?php

namespace App\Services;

use App\Models\Siswa;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Log;

class QrCodeService
{
    /**
     * Generate QR code untuk siswa (Dual Purpose: Absensi + Login)
     * - Jika siswa punya user: QR berisi URL (bisa untuk login + absensi)
     * - Jika siswa tidak punya user: QR berisi JSON (absensi only)
     *
     * @param Siswa $siswa
     * @param bool $forceRegenerate
     * @return string|null Path file QR code
     */
    public function generateQrCode(Siswa $siswa, bool $forceRegenerate = false): ?string
    {
        try {
            // Skip jika sudah ada QR code dan tidak force regenerate
            if ($siswa->qrcode_path && !$forceRegenerate) {
                return $siswa->qrcode_path;
            }

            // Hapus QR code lama jika ada
            if ($siswa->qrcode_path) {
                Storage::disk('public')->delete($siswa->qrcode_path);
            }

            $user = $siswa->user;

            // Tentukan format QR berdasarkan apakah siswa punya user atau tidak
            if ($user) {
                // FORMAT BARU: URL-based (dual purpose: absensi + login)
                // Generate token jika belum ada
                if (!$user->qr_token) {
                    $qrTokenService = app(\App\Services\QrTokenService::class);
                    $token = $qrTokenService->generateToken($user);
                    $user->update(['qr_token' => $token]);
                }

                // QR berisi URL auth (dual purpose: browser redirect + scanner data)
                $baseUrl = config('app.url');
                // Ensure URL has protocol
                if (!str_starts_with($baseUrl, 'http://') && !str_starts_with($baseUrl, 'https://')) {
                    $baseUrl = 'https://' . $baseUrl;
                }
                $qrContent = "{$baseUrl}/auth/qr?token=" . urlencode($user->qr_token);
            } else {
                // FORMAT LAMA: JSON-based (absensi only)
                // Untuk siswa yang belum di-link ke user table
                $qrData = [
                    'id' => $siswa->id,
                    'nama' => $siswa->nama,
                    'tanggal_terdaftar' => $siswa->tanggal_terdaftar,
                ];
                $qrContent = json_encode($qrData);

                Log::warning('Generate QR dengan format JSON (siswa belum punya user)', [
                    'siswa_id' => $siswa->id,
                    'siswa_nama' => $siswa->nama
                ]);
            }

            // Path logo
            $logoPath = public_path('img/logo.png');
            if (!file_exists($logoPath)) {
                Log::warning('Logo file not found', ['path' => $logoPath]);
                // Generate QR code tanpa logo jika logo tidak ada
                return $this->generateQrCodeWithoutLogo($siswa, $qrContent);
            }

            // Generate QR code dengan logo
            $qrCodeImage = (string) QrCode::format('png')
                ->size(300)
                ->margin(1)
                ->errorCorrection('H')
                ->merge($logoPath, .25, true)
                ->generate($qrContent);

            // Buat canvas dengan Intervention Image
            $canvas = Image::canvas(300, 360, '#ffffff');
            $canvas->insert(Image::make($qrCodeImage), 'top');

            // Tambahkan teks nama
            $namaSiswa = strtoupper($siswa->nama);
            $showNama = wordwrap($namaSiswa, 20, "\n", false);

            // Path font
            $fontPath = public_path('fonts/OpenSans-Bold.ttf');

            // Tambahkan teks dengan atau tanpa custom font
            if (file_exists($fontPath)) {
                $canvas->text($showNama, 150, 335, function ($font) use ($fontPath) {
                    $font->file($fontPath);
                    $font->size(14);
                    $font->color('#000000');
                    $font->align('center');
                    $font->valign('bottom');
                });
            } else {
                // Fallback tanpa custom font
                $canvas->text($showNama, 150, 335, function ($font) {
                    $font->size(14);
                    $font->color('#000000');
                    $font->align('center');
                    $font->valign('bottom');
                });
                Log::warning('Font file not found, using default', ['path' => $fontPath]);
            }

            // Manajemen folder berdasarkan tahun masuk
            $tahunMasuk = $siswa->tanggal_terdaftar
                ? \Carbon\Carbon::parse($siswa->tanggal_terdaftar)->format('Y')
                : 'umum';
            $folder = "qrcodes/{$tahunMasuk}";
            $fileName = "{$folder}/{$siswa->id}-" . Str::slug($siswa->nama) . ".png";

            // Simpan ke storage (disk public)
            Storage::disk('public')->put($fileName, (string) $canvas->encode('png'));

            // Update database
            $siswa->update(['qrcode_path' => $fileName]);

            Log::info('QR code generated successfully', [
                'siswa_id' => $siswa->id,
                'siswa_nama' => $siswa->nama,
                'qr_path' => $fileName
            ]);

            return $fileName;

        } catch (\Exception $e) {
            Log::error('Failed to generate QR code', [
                'siswa_id' => $siswa->id,
                'siswa_nama' => $siswa->nama,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Generate QR code tanpa logo (fallback)
     *
     * @param Siswa $siswa
     * @param string $qrContent
     * @return string|null
     */
    private function generateQrCodeWithoutLogo(Siswa $siswa, string $qrContent = null): ?string
    {
        try {
            // Jika tidak ada qrContent, tentukan berdasarkan apakah siswa punya user
            if (!$qrContent) {
                $user = $siswa->user;

                if ($user) {
                    // FORMAT BARU: URL-based
                    if (!$user->qr_token) {
                        $qrTokenService = app(\App\Services\QrTokenService::class);
                        $token = $qrTokenService->generateToken($user);
                        $user->update(['qr_token' => $token]);
                    }

                    $baseUrl = config('app.url');
                    // Ensure URL has protocol
                    if (!str_starts_with($baseUrl, 'http://') && !str_starts_with($baseUrl, 'https://')) {
                        $baseUrl = 'https://' . $baseUrl;
                    }
                    $qrContent = "{$baseUrl}/auth/qr?token=" . urlencode($user->qr_token);
                } else {
                    // FORMAT LAMA: JSON-based
                    $qrData = [
                        'id' => $siswa->id,
                        'nama' => $siswa->nama,
                        'tanggal_terdaftar' => $siswa->tanggal_terdaftar,
                    ];
                    $qrContent = json_encode($qrData);
                }
            }

            // Generate QR code tanpa logo
            $qrCodeImage = (string) QrCode::format('png')
                ->size(300)
                ->margin(1)
                ->errorCorrection('H')
                ->generate($qrContent);

            // Buat canvas
            $canvas = Image::canvas(300, 360, '#ffffff');
            $canvas->insert(Image::make($qrCodeImage), 'top');

            // Tambahkan teks nama
            $namaSiswa = strtoupper($siswa->nama);
            $showNama = wordwrap($namaSiswa, 20, "\n", false);

            $canvas->text($showNama, 150, 335, function ($font) {
                $font->size(14);
                $font->color('#000000');
                $font->align('center');
                $font->valign('bottom');
            });

            // Manajemen folder
            $tahunMasuk = $siswa->tanggal_terdaftar
                ? \Carbon\Carbon::parse($siswa->tanggal_terdaftar)->format('Y')
                : 'umum';
            $folder = "qrcodes/{$tahunMasuk}";
            $fileName = "{$folder}/{$siswa->id}-" . Str::slug($siswa->nama) . ".png";

            // Simpan
            Storage::disk('public')->put($fileName, (string) $canvas->encode('png'));

            // Update database
            $siswa->update(['qrcode_path' => $fileName]);

            Log::info('QR code generated without logo', [
                'siswa_id' => $siswa->id,
                'siswa_nama' => $siswa->nama,
                'qr_path' => $fileName
            ]);

            return $fileName;

        } catch (\Exception $e) {
            Log::error('Failed to generate QR code without logo', [
                'siswa_id' => $siswa->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Generate QR code untuk multiple siswa (batch)
     *
     * @param array $siswaIds
     * @param bool $forceRegenerate
     * @return array [success_count, failed_count, errors]
     */
    public function generateBulkQrCodes(array $siswaIds, bool $forceRegenerate = false): array
    {
        $successCount = 0;
        $failedCount = 0;
        $errors = [];

        $siswaList = Siswa::whereIn('id', $siswaIds)->get();

        foreach ($siswaList as $siswa) {
            $result = $this->generateQrCode($siswa, $forceRegenerate);

            if ($result) {
                $successCount++;
            } else {
                $failedCount++;
                $errors[] = "Gagal generate QR untuk: {$siswa->nama} (ID: {$siswa->id})";
            }
        }

        return [
            'success_count' => $successCount,
            'failed_count' => $failedCount,
            'errors' => $errors
        ];
    }

    /**
     * Hapus QR code siswa
     *
     * @param Siswa $siswa
     * @return bool
     */
    public function deleteQrCode(Siswa $siswa): bool
    {
        try {
            if ($siswa->qrcode_path) {
                Storage::disk('public')->delete($siswa->qrcode_path);
                $siswa->update(['qrcode_path' => null]);

                Log::info('QR code deleted', [
                    'siswa_id' => $siswa->id,
                    'siswa_nama' => $siswa->nama
                ]);

                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Failed to delete QR code', [
                'siswa_id' => $siswa->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Generate QR code for authentication (with URL)
     * This is a new format that redirects to PIN login page
     *
     * @param User $user
     * @param string $qrUrl Full URL to auth page with token
     * @param bool $forceRegenerate
     * @return string|null Path file QR code
     */
    public function generateAuthQrCode($user, string $qrUrl, bool $forceRegenerate = false): ?string
    {
        try {
            $siswa = $user->siswas;

            // Path logo
            $logoPath = public_path('img/logo.png');
            if (!file_exists($logoPath)) {
                Log::warning('Logo file not found for auth QR', ['path' => $logoPath]);
                return $this->generateAuthQrCodeWithoutLogo($user, $qrUrl);
            }

            // Generate QR code dengan URL
            $qrCodeImage = (string) QrCode::format('png')
                ->size(300)
                ->margin(1)
                ->errorCorrection('H')
                ->merge($logoPath, .25, true)
                ->generate($qrUrl);

            // Buat canvas dengan Intervention Image
            $canvas = Image::canvas(300, 380, '#ffffff');
            $canvas->insert(Image::make($qrCodeImage), 'top');

            // Tambahkan teks nama
            $namaSiswa = strtoupper($user->name);
            $showNama = wordwrap($namaSiswa, 20, "\n", false);

            // Path font
            $fontPath = public_path('fonts/OpenSans-Bold.ttf');

            // Tambahkan teks dengan atau tanpa custom font
            if (file_exists($fontPath)) {
                $canvas->text($showNama, 150, 325, function ($font) use ($fontPath) {
                    $font->file($fontPath);
                    $font->size(14);
                    $font->color('#000000');
                    $font->align('center');
                    $font->valign('middle');
                });

                // Add "QR LOGIN" text
                $canvas->text('QR LOGIN', 150, 360, function ($font) use ($fontPath) {
                    $font->file($fontPath);
                    $font->size(10);
                    $font->color('#6366f1'); // Indigo color
                    $font->align('center');
                    $font->valign('middle');
                });
            } else {
                $canvas->text($showNama, 150, 325, function ($font) {
                    $font->size(14);
                    $font->color('#000000');
                    $font->align('center');
                    $font->valign('middle');
                });

                $canvas->text('QR LOGIN', 150, 360, function ($font) {
                    $font->size(10);
                    $font->color('#6366f1');
                    $font->align('center');
                    $font->valign('middle');
                });
            }

            // Manajemen folder
            $folder = "qrcodes/auth";
            $fileName = "{$folder}/{$user->id}-" . Str::slug($user->name) . "-auth.png";

            // Simpan ke storage (disk public)
            Storage::disk('public')->put($fileName, (string) $canvas->encode('png'));

            Log::info('Auth QR code generated successfully', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'qr_path' => $fileName
            ]);

            return $fileName;

        } catch (\Exception $e) {
            Log::error('Failed to generate auth QR code', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Generate auth QR code tanpa logo (fallback)
     *
     * @param User $user
     * @param string $qrUrl
     * @return string|null
     */
    private function generateAuthQrCodeWithoutLogo($user, string $qrUrl): ?string
    {
        try {
            // Generate QR code tanpa logo
            $qrCodeImage = (string) QrCode::format('png')
                ->size(300)
                ->margin(1)
                ->errorCorrection('H')
                ->generate($qrUrl);

            // Buat canvas
            $canvas = Image::canvas(300, 380, '#ffffff');
            $canvas->insert(Image::make($qrCodeImage), 'top');

            // Tambahkan teks nama
            $namaSiswa = strtoupper($user->name);
            $showNama = wordwrap($namaSiswa, 20, "\n", false);

            $canvas->text($showNama, 150, 325, function ($font) {
                $font->size(14);
                $font->color('#000000');
                $font->align('center');
                $font->valign('middle');
            });

            $canvas->text('QR LOGIN', 150, 360, function ($font) {
                $font->size(10);
                $font->color('#6366f1');
                $font->align('center');
                $font->valign('middle');
            });

            // Manajemen folder
            $folder = "qrcodes/auth";
            $fileName = "{$folder}/{$user->id}-" . Str::slug($user->name) . "-auth.png";

            // Simpan
            Storage::disk('public')->put($fileName, (string) $canvas->encode('png'));

            Log::info('Auth QR code generated without logo', [
                'user_id' => $user->id,
                'qr_path' => $fileName
            ]);

            return $fileName;

        } catch (\Exception $e) {
            Log::error('Failed to generate auth QR code without logo', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}
