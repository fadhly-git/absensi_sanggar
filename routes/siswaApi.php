<?php

use Illuminate\Support\Facades\Route;

Route::middleware("auth:sanctum")->group(function () {

    Route::prefix('siswa')->group(function () {

        // generate QR code for a specific student
        Route::post('/{id}/generate-qr', [App\Http\Controllers\Student\Absensi::class, 'generateQrCode'])
            ->name('siswa.generate-qr');

        // Get QR code image for a specific student
        Route::get('/{id}/qr', [App\Http\Controllers\Student\Absensi::class, 'getQr'])
            ->name('api.siswa.get-qr');
    });
});