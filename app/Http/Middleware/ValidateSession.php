<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Response;

class ValidateSession
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check both web and sanctum guards
        $isAuthenticated = Auth::check() || Auth::guard('web')->check() || Auth::guard('sanctum')->check();
        
        if ($isAuthenticated) {
            $user = Auth::user() ?? Auth::guard('web')->user() ?? Auth::guard('sanctum')->user();
            
            if ($user) {
                $expiresAt = $request->session()->get('session_expires_at');
                
                // If no expiry set, create default
                if (!$expiresAt) {
                    $isRemembered = $request->session()->get('is_remembered', false);
                    $expiresAt = $isRemembered ? 
                        now()->addDays(7)->toISOString() : 
                        now()->addHours(2)->toISOString();
                    
                    $request->session()->put('session_expires_at', $expiresAt);
                    $request->session()->put('login_time', now()->toISOString());
                    
                    Log::info("Session expiry set for user: {$user->id}", [
                        'expires_at' => $expiresAt,
                        'is_remembered' => $isRemembered
                    ]);
                }
                
                try {
                    if ($expiresAt && now()->greaterThan(Carbon::parse($expiresAt))) {
                        $isRemembered = $request->session()->get('is_remembered', false);
                        $sessionType = $isRemembered ? '7 days' : '2 hours';
                        
                        Log::info("Session expired for user: {$user->id} (Type: {$sessionType})");
                        
                        // Session expired, logout user
                        $user->tokens()->delete();
                        Auth::logout();
                        Auth::guard('web')->logout();
                        Auth::guard('sanctum')->logout();
                        
                        $request->session()->invalidate();
                        $request->session()->regenerateToken();
                        
                        if ($request->expectsJson()) {
                            return response()->json(['message' => 'Session expired'], 401);
                        }
                        
                        return redirect('/login')->with('status', 'Session expired. Please login again.');
                    }
                } catch (\Exception $e) {
                    Log::error('Error validating session', [
                        'error' => $e->getMessage(),
                        'user_id' => $user->id,
                        'expires_at' => $expiresAt
                    ]);
                }
            }
        }

        return $next($request);
    }
}