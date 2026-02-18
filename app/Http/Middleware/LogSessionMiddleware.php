<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LogSessionMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        Log::info('Request Debug', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'session_id' => $request->session()->getId(),
            'session_driver' => config('session.driver'),
            'auth_check' => Auth::check(),
            'auth_id' => Auth::id(),
            'user' => Auth::user() ? Auth::user()->toArray() : null,
            'session_all' => $request->session()->all(),
            'cookies' => $request->cookies->all(),
            'guard' => config('auth.defaults.guard'),
        ]);

        $response = $next($request);

        Log::info('Response Debug', [
            'url' => $request->fullUrl(),
            'status' => $response->status(),
            'session_id_after' => $request->session()->getId(),
            'auth_check_after' => Auth::check(),
        ]);

        return $response;
    }
}
