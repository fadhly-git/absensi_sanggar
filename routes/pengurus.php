<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AbsensiController as AC;
use App\Http\Controllers\KeuanganController as KC;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {

    Route::group(['prefix' => 'atmin'], function () {
        //export route definition
        Route::get('export-financial', [KC::class, 'exportFinancialReport'])->name('export-keuangan');
        Route::get('export-absen', [AC::class, 'exportExcel'])->name('export-absen');

        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('atmin.dashboard');

        Route::get('siswa', function () {
            return Inertia::render('siswa');
        })->name('atmin.siswa');

        Route::get('register', function () {
            return Inertia::render('register');
        })->name('atmin.register');

        Route::get('daftar-hadir', function () {
            return Inertia::render('daftar-hadir');
        })->name('atmin.daftar-hadir');

        Route::get('keuangan', function () {
            return Inertia::render('keuangan');
        })->name('atmin.keuangan');

        Route::get('system/clear-cache', [App\Http\Controllers\SystemActionController::class, 'clearAllCache'])
            ->name('atmin.system.clear-cache');
    });

});