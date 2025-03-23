<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DaftarHadirController as df;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::group(['prefix' =>  'atmin'], function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('atmin.dashboard');

        Route::get('siswa', function () {
            return Inertia::render('siswa');
        })->name('siswa');

        Route::get('register', function () {
            return Inertia::render('register');
        })->name('atmin.register');

        Route::get('daftar-hadir', [df::class, 'index'])->name('daftar-hadir');

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
