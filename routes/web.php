<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;


// Route::get('/absensi', [lp::class,'index'])->name('home');
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

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
            'access_token' => Auth::user() ? Auth::user()->currentAccessToken() : null,
        ]);
    })->middleware('auth:sanctum');
}

Route::prefix('atmin')->middleware('auth:sanctum')->group(function () {
    Route::prefix('event')->group(function () {
        // api
            Route::prefix('api/orders')->group(function () {
                Route::get('/', [App\Http\Controllers\Event\OrderController::class, 'apiIndex']);
                Route::post('/', [App\Http\Controllers\Event\OrderController::class, 'apiStore']);
                Route::get('/statistics', [App\Http\Controllers\Event\OrderController::class, 'apiStatistics']);
                Route::get('/students', [App\Http\Controllers\Event\OrderController::class, 'apiStudents']);
                Route::get('/products', [App\Http\Controllers\Event\OrderController::class, 'apiProducts']);
                Route::get('/{order}', [App\Http\Controllers\Event\OrderController::class, 'apiShow']);
                Route::put('/{order}', [App\Http\Controllers\Event\OrderController::class, 'apiUpdate']);
                Route::put('/{order}/status', [App\Http\Controllers\Event\OrderController::class, 'apiUpdateStatus']);
                Route::delete('/{order}', [App\Http\Controllers\Event\OrderController::class, 'apiDestroy']);
            });

    });
});

require __DIR__ . '/pengurus.php';
require __DIR__ . '/siswa.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
