<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth:sanctum', 'role:siswa,admin', 'check.token'])->group(function () {

    Route::prefix('siswa')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('student/dashboard');
        })->name('siswa.dashboard');
    });

});