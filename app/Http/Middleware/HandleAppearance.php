<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class HandleAppearance
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->path();
        $isSiswaOrAdmin = str_starts_with($path, 'siswa') || str_starts_with($path, 'admin');

        // Force dark theme for routes other than /siswa and /admin
        $appearance = $isSiswaOrAdmin
            ? ($request->cookie('appearance') ?? 'system')
            : 'dark';

        View::share('appearance', $appearance);

        return $next($request);
    }
}
