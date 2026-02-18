<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class QrTokenService
{
    /**
     * Generate permanent QR token for user
     * Token format: encrypted JSON containing user_id and random salt
     *
     * @param User $user
     * @return string Encrypted token
     */
    public function generateToken(User $user): string
    {
        $tokenData = [
            'user_id' => $user->id,
            'salt' => Str::random(32),
            'generated_at' => now()->timestamp
        ];

        return Crypt::encryptString(json_encode($tokenData));
    }

    /**
     * Generate QR URL for user authentication
     *
     * @param User $user
     * @return string Full URL to QR auth page
     */
    public function generateQrUrl(User $user): string
    {
        // Generate token if not exists
        if (!$user->qr_token) {
            $token = $this->generateToken($user);
            $user->update(['qr_token' => $token]);
        }

        $baseUrl = config('app.url');
        // Ensure URL has protocol
        if (!str_starts_with($baseUrl, 'http://') && !str_starts_with($baseUrl, 'https://')) {
            $baseUrl = 'https://' . $baseUrl;
        }
        return "{$baseUrl}/auth/qr?token=" . urlencode($user->qr_token);
    }

    /**
     * Validate and decode QR token
     *
     * @param string $token
     * @return array|null Returns decoded data or null if invalid
     */
    public function validateToken(string $token): ?array
    {
        try {
            $decrypted = Crypt::decryptString($token);
            $data = json_decode($decrypted, true);

            if (!isset($data['user_id']) || !isset($data['salt'])) {
                return null;
            }

            return $data;
        } catch (\Exception $e) {
            \Log::warning('QR Token validation failed', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get user from QR token
     *
     * @param string $token
     * @return User|null
     */
    public function getUserFromToken(string $token): ?User
    {
        $data = $this->validateToken($token);

        if (!$data) {
            return null;
        }

        return User::where('id', $data['user_id'])
            ->where('qr_token', $token)
            ->first();
    }

    /**
     * Generate QR code content for new format
     * This supports both attendance and authentication
     *
     * @param User $user
     * @param string $purpose 'auth' or 'attendance'
     * @return array QR data structure
     */
    public function generateQrData(User $user, string $purpose = 'auth'): array
    {
        $siswa = $user->siswas;

        if ($purpose === 'auth') {
            return [
                'type' => 'auth',
                'url' => $this->generateQrUrl($user),
            ];
        }

        // Backward compatible attendance format
        return [
            'id' => $siswa?->id ?? $user->id,
            'nama' => $user->name,
            'tanggal_terdaftar' => $siswa?->tanggal_terdaftar ?? now()->format('Y-m-d'),
        ];
    }

    /**
     * Regenerate QR token for user
     *
     * @param User $user
     * @return string New token
     */
    public function regenerateToken(User $user): string
    {
        $token = $this->generateToken($user);
        $user->update(['qr_token' => $token]);
        return $token;
    }
}
