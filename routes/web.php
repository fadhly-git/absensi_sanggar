<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AbsensiController as AC;
use App\Http\Controllers\KeuanganCon as KC;
use Inertia\Inertia;

Route::redirect('/', '/absensi', 301);
// Route::get('/absensi', [lp::class,'index'])->name('home');
Route::get('/absensi', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::group(['prefix' =>  'atmin'], function () {
        //export route definition
        Route::get('export-financial', [KC::class, 'exportFinancialReport'])->name('export-keuangan');
        Route::get('export-absen', [AC::class, 'exportExcel'])->name('export-absen');

        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('atmin.dashboard');

        Route::get('siswa', function () {
            return Inertia::render('siswa');
        })->name('siswa');

        Route::get('register', function () {
            return Inertia::render('register');
        })->name('atmin.register');

        Route::get('daftar-hadir', function(){
            return Inertia::render('daftar-hadir');
        })->name('daftar-hadir');

        Route::get('keuangan', function () {
            return Inertia::render('keuangan');
        })->name('keuangan');
    });

});

Route::get('temp', function () {
    return Inertia::render('temp/index');
})->name('temp');


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
