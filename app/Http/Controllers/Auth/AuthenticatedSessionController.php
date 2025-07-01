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
    public function create(Request $request): Response
    {
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
            $tokenExpiry = now()->addHours(2);
            $sessionLifetime = 2 * 60; // 2 jam dalam menit (120 menit)
            $expiresAt = now()->addHours(2);
        }
        
        // Set dynamic session lifetime
        Config::set('session.lifetime', $sessionLifetime);
        
        $token = $user->createToken('api-token', ['*'], $tokenExpiry)->plainTextToken;

        // Set session expiry time untuk tracking manual dengan format yang konsisten
        $request->session()->put('session_expires_at', $expiresAt->toISOString());
        $request->session()->put('is_remembered', $remember);
        $request->session()->put('login_time', now()->toISOString());

        Log::info("User {$user->id} logged in", [
            'remember' => $remember ? 'Yes (7 days)' : 'No (2 hours)',
            'expires_at' => $expiresAt->toISOString(),
            'session_lifetime_minutes' => $sessionLifetime
        ]);

        // Redirect ke halaman dashboard dengan token sebagai cookie
        return redirect()
            ->route('atmin.dashboard')
            ->withCookie(cookie(
                'auth_token', 
                $token, 
                $sessionLifetime, // dalam menit
                '/', 
                null, 
                false, // secure = false untuk development
                false  // httpOnly = false agar bisa diakses JS
            ));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        if($user = Auth::user()) {
            // Hapus semua token yang ada
            $user->tokens()->delete();
            Log::info("All tokens revoked for user: {$user->id}");
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
        // Debug logging
        Log::info('Session check started', [
            'user_id' => Auth::id(),
            'auth_check' => Auth::check(),
            'session_id' => $request->session()->getId(),
            'has_session_data' => $request->session()->has('session_expires_at'),
            'user_agent' => $request->userAgent(),
            'ip' => $request->ip(),
        ]);

        // Check multiple authentication guards
        $webAuth = Auth::guard('web')->check();
        $sanctumAuth = Auth::guard('sanctum')->check();
        
        Log::info('Auth guards check', [
            'web_guard' => $webAuth,
            'sanctum_guard' => $sanctumAuth,
            'web_user' => Auth::guard('web')->user()?->id,
            'sanctum_user' => Auth::guard('sanctum')->user()?->id,
        ]);

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
        
        Log::info('Session data retrieved', [
            'user_id' => $user->id,
            'expires_at' => $expiresAt,
            'is_remembered' => $isRemembered,
            'login_time' => $loginTime,
        ]);

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
                Log::info('Session expired', [
                    'user_id' => $user->id,
                    'expired_at' => $expiresAt,
                    'current_time' => now()->toISOString()
                ]);
                
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

        Log::info('Session check successful', $responseData);

        return response()->json($responseData);
    }
}