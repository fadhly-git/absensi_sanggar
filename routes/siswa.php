<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth:sanctum', 'role:siswa,admin', 'check.token'])->group(function () {

    Route::prefix('siswa')->group(function () {
        // Route for student dashboard
        Route::get('dashboard', function () {
            return Inertia::render('student/dashboard');
        })->name('siswa.dashboard');

        Route::get('absensi', function () {
            return Inertia::render('student/daftar-hadir-siswa');
        })->name('siswa.absensi');

        Route::get('qr-code', function () {
            return 'todo: tampilkan QR code siswa';
        })->name('siswa.qr-code');
    });

});