<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = Auth::user();
        if ($user->role === 'admin' || $user->role === 'pengurus') {
            return Inertia::render('settings/profile', [
                'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
                'status' => $request->session()->get('status'),
            ]);
        } else if ($user->role === 'siswa') {
            return Inertia::render('student/settings/profile', [
                'status' => $request->session()->get('status'),
            ]);
        }
        return Inertia::render('studen/landing-page');
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        Log::info('Updating user profile', [
            'user_id' => $request->user()->id,
            'data' => $request->all(),
        ]);
        $user = $request->user();
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();

        // Jika user adalah siswa, update juga alamat di tabel siswa
        if ($user->role === 'siswa') {
            $siswas = $user->siswas; // pastikan relasi 'siswas' ada di model User
            if ($siswas) {
                $siswas->alamat = $request->input('alamat');
                $siswas->save();
            }
        }

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
