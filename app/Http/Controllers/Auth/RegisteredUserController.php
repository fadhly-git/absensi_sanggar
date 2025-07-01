<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Generate token untuk user baru (auto 2 jam untuk registrasi baru)
        $expiresAt = now()->addHours(2);
        $token = $user->createToken('api-token', ['*'], $expiresAt)->plainTextToken;

        // Set session expiry (2 jam untuk registrasi baru)
        $sessionLifetime = 2 * 60; // 2 jam dalam menit
        $request->session()->put('session_expires_at', $expiresAt->toISOString());
        $request->session()->put('is_remembered', false);
        $request->session()->put('login_time', now()->toISOString());

        Log::info("New user registered: {$user->id}", [
            'expires_at' => $expiresAt->toISOString(),
            'session_lifetime_minutes' => $sessionLifetime
        ]);

        return redirect()
            ->route('atmin.dashboard')
            ->withCookie(cookie(
                'auth_token', 
                $token, 
                $sessionLifetime,
                '/', 
                null, 
                false, 
                false
            ));
    }
}