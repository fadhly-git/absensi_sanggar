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
            // \Log::warning('CheckRole: User not authenticated', [
            //     'url' => $request->fullUrl(),
            //     'ip' => $request->ip(),
            //     'session_id' => $request->session()->getId(),
            // ]);
            return redirect('/login');
        }
        $user = $request->user();
        if (!$user || !in_array($user->role, $roles)) {
            // \Log::warning('CheckRole: Access denied', [
            //     'user_id' => $user ? $user->id : null,
            //     'user_role' => $user ? $user->role : null,
            //     'required_roles' => $roles,
            //     'url' => $request->fullUrl(),
            // ]);
            abort(403, 'Akses tidak diizinkan.');
        }

        // \Log::debug('CheckRole: Access granted', [
        //     'user_id' => $user->id,
        //     'user_role' => $user->role,
        //     'required_roles' => $roles,
        // ]);

        return $next($request);
    }
}
