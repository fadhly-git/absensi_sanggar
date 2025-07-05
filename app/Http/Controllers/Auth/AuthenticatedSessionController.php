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
        Log::info('Login page accessed', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => $request->session()->getId(),
        ]);
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
        $request->authenticate();
        $request->session()->regenerate();

        // Generate token untuk pengguna yang berhasil login
        $user = Auth::user();

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
        $request->session()->put('session_expires_at', $expiresAt->toISOString());
        $request->session()->put('is_remembered', $remember);
        $request->session()->put('login_time', now()->toISOString());

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
                env('SESSION_SECURE_COOKIE', false), // Lebih baik gunakan variabel .env
                true  // Sangat direkomendasikan untuk keamanan (HttpOnly)
            ));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        if ($user = Auth::user()) {
            $user->tokens()->delete();
        } else {
            Log::error('Token not found for the current user.');
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


        // Check multiple authentication guards
        $webAuth = Auth::guard('web')->check();
        $sanctumAuth = Auth::guard('sanctum')->check();

        // Check if user is authenticated via any method
        if (!Auth::check() && !$webAuth && !$sanctumAuth) {
            Log::warning('No authentication found');
            return response()->json([
                'valid' => false,
                'message' => 'Not authenticated',
                'debug' => [
                    'auth_check' => Auth::check(),
                    'web_guard' => $webAuth,
                    'sanctum_guard' => $sanctumAuth,
                    'session_id' => $request->session()->getId(),
                ]
            ], 401);
        }

        // Get user from available guard
        $user = Auth::user() ?? Auth::guard('web')->user() ?? Auth::guard('sanctum')->user();

        if (!$user) {
            Log::error('User authenticated but user object is null');
            return response()->json([
                'valid' => false,
                'message' => 'User object not found'
            ], 401);
        }

        // Get session data
        $expiresAt = $request->session()->get('session_expires_at');
        $isRemembered = $request->session()->get('is_remembered', false);
        $loginTime = $request->session()->get('login_time');


        // Handle missing session expiry
        if (!$expiresAt) {
            Log::warning('Missing session expiry, creating new one', [
                'user_id' => $user->id,
                'is_remembered' => $isRemembered
            ]);

            // Set default expiry based on remembered status
            if ($isRemembered) {
                $expiresAt = now()->addDays(7)->toISOString();
            } else {
                $expiresAt = now()->addHours(2)->toISOString();
            }

            // Update session
            $request->session()->put('session_expires_at', $expiresAt);
            $request->session()->put('login_time', now()->toISOString());
        }

        // Check if session is expired
        try {
            $expiryTime = Carbon::parse($expiresAt);

            if (now()->greaterThan($expiryTime)) {

                // Don't destroy session here, let middleware handle it
                return response()->json([
                    'valid' => false,
                    'message' => 'Session expired',
                    'expired_at' => $expiresAt,
                    'current_time' => now()->toISOString()
                ], 401);
            }
        } catch (\Exception $e) {
            Log::error('Error parsing session expiry', [
                'error' => $e->getMessage(),
                'expires_at' => $expiresAt
            ]);

            // Reset session expiry
            $expiresAt = now()->addHours(2)->toISOString();
            $request->session()->put('session_expires_at', $expiresAt);
        }

        $responseData = [
            'valid' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'expires_at' => $expiresAt,
            'is_remembered' => $isRemembered,
            'login_time' => $loginTime,
            'current_time' => now()->toISOString(),
            'session_id' => $request->session()->getId(),
        ];

        return response()->json($responseData);
    }
}