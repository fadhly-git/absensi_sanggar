<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Config;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request)
    {
        // Log::info('Login page accessed', [
        //     'ip' => $request->ip(),
        //     'user_agent' => $request->userAgent(),
        //     'session_id' => $request->session()->getId(),
        // ]);
        $user = Auth::user();
        // Jika sudah login, redirect ke halaman dashboard yang sesuai
        if ($user) {
            if ($user->role === 'siswa') {
                return redirect()->route('siswa.dashboard');
            } else if ($user->role === 'admin' || $user->role === 'pengurus') {
                return redirect()->route('atmin.dashboard');
            } else if ($user->role === '') {
                return redirect()->route('/');
            }
        }
        // Jika belum login, tampilkan halaman login
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */

    public function store(LoginRequest $request)
    {
        try{
            $request->authenticate();

        // Generate token untuk pengguna yang berhasil login
        $user = Auth::user();

        // \Log::info('Login attempt', [
        //     'user_id' => $user ? $user->id : null,
        //     'email' => $user ? $user->email : null,
        //     'session_id' => $request->session()->getId(),
        //     'session_driver' => config('session.driver'),
        //     'session_table' => config('session.table'),
        //     'session_data' => $request->session()->all(),
        //     'ip' => $request->ip(),
        //     'user_agent' => $request->userAgent(),
        // ]);

        // Hapus semua token lama user ini untuk mencegah multiple session
        // Hanya hapus token yang sudah expired atau akan expired dalam 1 menit
        $user->tokens()->where(function ($query) {
            $query->where('expires_at', '<', now())
                ->orWhereNull('expires_at')
                ->orWhere('expires_at', '<', now()->addMinute());
        })->delete();

        // Buat token dengan expiry berdasarkan remember me
        $remember = $request->boolean('remember', false);

        if ($remember) {
            // 7 hari untuk remember me
            $tokenExpiry = now()->addDays(7);
            $sessionLifetime = 7 * 24 * 60; // 7 hari dalam menit (10080 menit)
            $expiresAt = now()->addDays(7);
        } else {
            // 2 jam untuk login biasa
            $tokenExpiry = now()->addMinutes((int) env('SESSION_LIFETIME', 120));
            $sessionLifetime = (int) env('SESSION_LIFETIME', 120); // 2 jam dalam menit (120 menit)
            $expiresAt = now()->addMinutes((int) env('SESSION_LIFETIME', 120));
        }

        // Set dynamic session lifetime
        Config::set('session.lifetime', $sessionLifetime);

        $token = $user->createToken('api-token', ['*'], $tokenExpiry)->plainTextToken;

        // Set session expiry time untuk tracking manual dengan format yang konsisten
        $request->session()->put('session_expires_at', $expiresAt->toRfc3339String());
        $request->session()->put('is_remembered', $remember);
        $request->session()->put('login_time', now()->toRfc3339String());

        // Redirect seperti biasa
        $redirectRoute = 'login';
        if ($user->role === 'siswa') {
            $redirectRoute = 'siswa.dashboard';
        } elseif ($user->role === 'admin' || $user->role === 'pengurus') {
            $redirectRoute = 'atmin.dashboard';
        }

        return redirect()->route($redirectRoute)
            ->withCookie(cookie(
                'auth_token',
                $token,
                $sessionLifetime,
                '/',
                env('SESSION_DOMAIN', null),
                env('SESSION_SECURE_COOKIE', false),
                false  // HttpOnly=false so JavaScript can read it for API calls
            ));
        } catch (\Exception $e) {
            Log::error('Authentication error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip(),
                'session_id' => $request->session()->getId(),
            ]);

            return redirect()->route('login')
                ->withErrors(['login' => 'Authentication failed. Please try again.']);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        if ($user = Auth::user()) {
            // Hapus semua token user
            $user->tokens()->delete();

            // Log::info('User logged out', [
            //     'user_id' => $user->id,
            //     'email' => $user->email,
            // ]);
        } else {
            Log::warning('Logout attempt without authenticated user.');
        }

        // Hapus session pengguna
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Hapus cookie auth_token
        return redirect('/')
            ->withCookie(cookie()->forget('auth_token'));
    }

    /**
     * Check session validity with extensive debugging
     */
    public function checkSession(Request $request)
    {
        try {
            // Wrap whole handler to log unexpected exceptions and return JSON instead of server 500

            // Hanya gunakan guard 'web' untuk konsistensi
            $user = Auth::guard('web')->user();

            if (!$user) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Not authenticated',
                    'session_id' => $request->session()->getId(),
                ], 401);
            }

            // Get session data
            $expiresAt = $request->session()->get('session_expires_at');
            $isRemembered = $request->session()->get('is_remembered', false);
            $loginTime = $request->session()->get('login_time');

            // Handle missing session expiry
            if (!$expiresAt) {
                // Set default expiry based on remembered status
                if ($isRemembered) {
                    $expiresAt = now()->addDays(7)->toRfc3339String();
                } else {
                    $expiresAt = now()->addHours(2)->toRfc3339String();
                }

                // Update session
                $request->session()->put('session_expires_at', $expiresAt);
                $request->session()->put('login_time', now()->toRfc3339String());
                $request->session()->save(); // PENTING: Save session setelah update
            }

            // Check if session is expired
            try {
                $expiryTime = Carbon::parse($expiresAt);

                if (now()->greaterThan($expiryTime)) {
                    return response()->json([
                        'valid' => false,
                        'message' => 'Session expired',
                        'expired_at' => $expiresAt,
                        'current_time' => now()->toRfc3339String()
                    ], 401);
                }
            } catch (\Exception $e) {
                Log::error('Error parsing session expiry', [
                    'error' => $e->getMessage(),
                    'expires_at' => $expiresAt
                ]);

                // Reset session expiry
                $expiresAt = now()->addHours(2)->toRfc3339String();
                $request->session()->put('session_expires_at', $expiresAt);
                $request->session()->save(); // PENTING: Save session setelah update
            }

            return response()->json([
                'valid' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'expires_at' => $expiresAt,
                'is_remembered' => $isRemembered,
                'login_time' => $loginTime,
                'current_time' => now()->toRfc3339String(),
                'session_id' => $request->session()->getId(),
            ]);

        } catch (\Exception $e) {
            Log::error('checkSession unexpected error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip(),
                'session_id' => $request->session()->getId(),
                'headers' => $request->headers->all(),
            ]);

            return response()->json([
                'valid' => false,
                'message' => 'Server error while checking session',
                'error' => $e->getMessage(),
            ], 500);
        }

    }
}
