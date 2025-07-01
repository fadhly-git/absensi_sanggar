<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Inertia\Inertia;

Route::redirect('/', '/absensi', 301);
// Route::get('/absensi', [lp::class,'index'])->name('home');
Route::get('/absensi', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('temp', function () {
    return Inertia::render('temp/index');
})->name('temp');

// Debug route (hanya untuk development)
if (app()->environment('local')) {
    Route::get('/debug-session', function (Request $request) {
        return response()->json([
            'auth_user' => Auth::user(),
            'session_data' => [
                'session_expires_at' => $request->session()->get('session_expires_at'),
                'is_remembered' => $request->session()->get('is_remembered'),
                'login_time' => $request->session()->get('login_time'),
            ],
            'current_time' => now()->toISOString(),
            'session_id' => $request->session()->getId(),
        ]);
    })->middleware('auth');
}

require __DIR__.'/pengurus.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
