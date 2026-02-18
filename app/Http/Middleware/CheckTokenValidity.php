<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class CheckTokenValidity
{
    public function handle(Request $request, Closure $next)
    {
        try {
            // Cleanup expired tokens globally (limit untuk performa)
            PersonalAccessToken::where('expires_at', '<', now())
                ->limit(100)
                ->delete();

            $user = Auth::user();

            if ($user) {
                // Cleanup expired tokens untuk user ini
                $user->tokens()->where('expires_at', '<', now())->delete();

                // Cek session expiry di session
                $expiresAt = $request->session()->get('session_expires_at');

                // \Log::debug('CheckTokenValidity check', [
                //     'user_id' => $user->id,
                //     'has_session_expiry' => !is_null($expiresAt),
                //     'session_expires_at' => $expiresAt,
                //     'current_time' => now()->toRfc3339String(),
                //     'ip' => $request->ip(),
                //     'url' => $request->fullUrl(),
                // ]);

                if ($expiresAt && now()->greaterThan(\Carbon\Carbon::parse($expiresAt))) {
                    // \Log::info('Session expired, logging out user', [
                    //     'user_id' => $user->id,
                    //     'session_expires_at' => $expiresAt,
                    // ]);

                    // Hapus semua token user
                    $user->tokens()->delete();

                    Auth::guard('web')->logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    return redirect()->route('login')
                        ->withErrors(['token' => 'Session expired, please login again.'])
                        ->withCookie(cookie()->forget('auth_token'));
                }
            }

            return $next($request);
        } catch (\Exception $e) {
            \Log::error('CheckTokenValidity middleware error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'ip' => $request->ip(),
                'url' => $request->fullUrl(),
                'session_id' => $request->session()->getId(),
                'has_auth' => Auth::check(),
            ]);

            // Allow request to continue but mark unauthenticated to avoid 500
            return $next($request);
        }
    }
}
