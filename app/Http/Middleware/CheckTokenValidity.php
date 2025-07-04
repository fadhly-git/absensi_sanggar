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
        $user = Auth::user();

        if ($user && method_exists($user, 'currentAccessToken')) {
            $currentToken = $user->currentAccessToken();

            // Hanya cek expired jika token bukan TransientToken
            if ($currentToken && !($currentToken instanceof TransientToken)) {
                if ($currentToken->expires_at && $currentToken->expires_at->isPast()) {
                    Auth::logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();
                    return redirect()->route('login')->withErrors(['token' => 'Session expired, please login again.']);
                }
            }
        }

        return $next($request);
    }
}