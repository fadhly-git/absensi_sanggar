<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\TransientToken;

class CheckTokenValidity
{
    public function handle(Request $request, Closure $next)
    {
        // Cek session expiry di session
        $expiresAt = $request->session()->get('session_expires_at');
        if ($expiresAt && now()->greaterThan(\Carbon\Carbon::parse($expiresAt))) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route('login')->withErrors(['token' => 'Session expired, please login again.']);
        }

        return $next($request);
    }
}