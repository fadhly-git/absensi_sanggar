<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  mixed ...$roles
     * @return mixed
     */
    public function handle($request, Closure $next, ...$roles)
    {
        if (!Auth::check()) {
            // Belum login
            return redirect('/login');
        }

        $user = Auth::user();
        if (!in_array($user->role, $roles)) {
            abort(403, 'Akses tidak diizinkan.');
        }

        return $next($request);
    }
}
