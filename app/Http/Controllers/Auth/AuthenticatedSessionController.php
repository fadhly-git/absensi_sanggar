<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
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
        $token = $user->createToken('api-token')->plainTextToken;

        // Redirect ke halaman dashboard dengan token sebagai props
        return redirect()
            ->route('atmin.dashboard')
            ->withCookie(cookie('auth_token', $token, 60, '/', null, false, false)); // HttpOnly = false
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

        // Redirect ke halaman login

        return redirect('/');
    }
}
