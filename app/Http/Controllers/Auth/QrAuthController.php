<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\QrTokenService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Http\RedirectResponse;

class QrAuthController extends Controller
{
    public function __construct(
        protected QrTokenService $qrTokenService
    ) {}

    /**
     * Show PIN form or setup form based on user state
     */
    public function showPinForm(Request $request): InertiaResponse
    {
        $token = $request->input('token');

        if (!$token) {
            abort(400, 'Token QR tidak ditemukan');
        }

        // Validate and get user from token
        $user = $this->qrTokenService->getUserFromToken($token);

        if (!$user) {
            abort(404, 'Token tidak valid atau user tidak ditemukan');
        }

        // Check if PIN is locked
        if ($user->pin_locked_until && now()->lt($user->pin_locked_until)) {
            $minutesLeft = now()->diffInMinutes($user->pin_locked_until);
            abort(423, "Akun terkunci. Coba lagi dalam {$minutesLeft} menit.");
        }

        // If no PIN set, show setup form
        if (empty($user->pin)) {
            return Inertia::render('auth/setup-pin', [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ]);
        }

        // Show PIN verification form
        return Inertia::render('auth/qr-pin', [
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'attemptsLeft' => max(0, 5 - $user->pin_attempts),
        ]);
    }

    /**
     * Verify PIN and login user
     */
    public function verifyPin(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required|string',
            'pin' => 'required|string|min:4|max:6',
        ]);

        $token = $request->input('token');
        $pin = $request->input('pin');

        // Get user from token
        $user = $this->qrTokenService->getUserFromToken($token);

        if (!$user) {
            throw ValidationException::withMessages([
                'token' => 'Token tidak valid',
            ]);
        }

        // Check if locked
        if ($user->pin_locked_until && now()->lt($user->pin_locked_until)) {
            $minutesLeft = now()->diffInMinutes($user->pin_locked_until);
            throw ValidationException::withMessages([
                'pin' => "Akun terkunci. Coba lagi dalam {$minutesLeft} menit.",
            ]);
        }

        // Rate limiting per user
        $rateLimitKey = 'qr-login:' . $user->id;
        if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);
            throw ValidationException::withMessages([
                'pin' => "Terlalu banyak percobaan. Coba lagi dalam {$seconds} detik.",
            ]);
        }

        // Verify PIN
        if (!Hash::check($pin, $user->pin)) {
            RateLimiter::hit($rateLimitKey);

            // Increment attempts
            $user->increment('pin_attempts');

            // Lock account after 5 failed attempts
            if ($user->pin_attempts >= 5) {
                $user->update([
                    'pin_locked_until' => now()->addMinutes(15),
                    'pin_attempts' => 0,
                ]);

                throw ValidationException::withMessages([
                    'pin' => 'PIN salah 5 kali. Akun terkunci selama 15 menit.',
                ]);
            }

            $attemptsLeft = 5 - $user->pin_attempts;
            throw ValidationException::withMessages([
                'pin' => "PIN salah. Sisa percobaan: {$attemptsLeft}",
            ]);
        }

        // PIN correct - reset attempts and login
        $user->update([
            'pin_attempts' => 0,
            'pin_locked_until' => null,
        ]);

        RateLimiter::clear($rateLimitKey);

        // Login user
        Auth::login($user, true); // Remember user

        $request->session()->regenerate();

        // Redirect based on role
        return $this->redirectBasedOnRole($user);
    }

    /**
     * Setup PIN for first time
     */
    public function setupPin(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required|string',
            'pin' => 'required|string|min:4|max:6|confirmed',
            'pin_confirmation' => 'required|string',
        ], [
            'pin.min' => 'PIN minimal 4 digit',
            'pin.max' => 'PIN maksimal 6 digit',
            'pin.confirmed' => 'PIN tidak cocok',
        ]);

        $token = $request->input('token');
        $pin = $request->input('pin');

        // Get user from token
        $user = $this->qrTokenService->getUserFromToken($token);

        if (!$user) {
            throw ValidationException::withMessages([
                'token' => 'Token tidak valid',
            ]);
        }

        // Check if PIN already set
        if (!empty($user->pin)) {
            throw ValidationException::withMessages([
                'pin' => 'PIN sudah pernah dibuat. Gunakan form login.',
            ]);
        }

        // Validate PIN is numeric
        if (!ctype_digit($pin)) {
            throw ValidationException::withMessages([
                'pin' => 'PIN harus berisi angka saja (0-9)',
            ]);
        }

        // Save hashed PIN
        $user->update([
            'pin' => Hash::make($pin),
            'pin_attempts' => 0,
            'pin_locked_until' => null,
        ]);

        // Auto login after setup
        Auth::login($user, true);

        $request->session()->regenerate();

        return $this->redirectBasedOnRole($user);
    }

    /**
     * Redirect user based on their role
     */
    protected function redirectBasedOnRole($user): RedirectResponse
    {
        $role = $user->role ?? 'siswa';

        \Log::info('User logged in via QR auth', [
            'user_id' => $user->id,
            'role' => $role,
        ]);

        return match($role) {
            'admin', 'pengurus' => redirect()->intended(route('atmin.dashboard')),
            'siswa' => redirect()->intended(route('siswa.dashboard')),
            default => redirect()->intended(route('home')),
        };
    }
}
