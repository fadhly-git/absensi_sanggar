<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PinController extends Controller
{
    /**
     * Update the user's PIN
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_pin' => 'required|string|min:4|max:6',
            'new_pin' => 'required|string|min:4|max:6|confirmed',
            'new_pin_confirmation' => 'required|string',
        ], [
            'current_pin.required' => 'PIN saat ini harus diisi',
            'current_pin.min' => 'PIN minimal 4 digit',
            'current_pin.max' => 'PIN maksimal 6 digit',
            'new_pin.required' => 'PIN baru harus diisi',
            'new_pin.min' => 'PIN baru minimal 4 digit',
            'new_pin.max' => 'PIN baru maksimal 6 digit',
            'new_pin.confirmed' => 'Konfirmasi PIN tidak cocok',
        ]);

        $user = $request->user();

        // Check if user has PIN set
        if (empty($user->pin)) {
            throw ValidationException::withMessages([
                'current_pin' => 'Anda belum memiliki PIN. Silakan setup PIN terlebih dahulu.',
            ]);
        }

        // Validate current PIN
        if (!Hash::check($validated['current_pin'], $user->pin)) {
            throw ValidationException::withMessages([
                'current_pin' => 'PIN saat ini tidak sesuai',
            ]);
        }

        // Validate new PIN is numeric
        if (!ctype_digit($validated['new_pin'])) {
            throw ValidationException::withMessages([
                'new_pin' => 'PIN harus berisi angka saja (0-9)',
            ]);
        }

        // Don't allow same PIN
        if (Hash::check($validated['new_pin'], $user->pin)) {
            throw ValidationException::withMessages([
                'new_pin' => 'PIN baru tidak boleh sama dengan PIN lama',
            ]);
        }

        // Update PIN
        $user->update([
            'pin' => Hash::make($validated['new_pin']),
            'pin_attempts' => 0,
            'pin_locked_until' => null,
        ]);

        return back()->with('status', 'pin-updated');
    }
}
