<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DataController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\DaftarHadirController as DH;
use App\Http\Controllers\KeuanganController as Keuangan;

Route::get('/data', [DataController::class, 'store']);

Route::get('data/index', [DataController::class, 'index']);

// route untuk siswa
Route::group(['prefix' => 'siswa'], function () {
    Route::delete('delete/{id}', [SiswaController::class, 'delete']);
    Route::put('update/{id}', [SiswaController::class, 'update']);
    Route::post('store', [SiswaController::class, 'store']);
    Route::get('index', [SiswaController::class, 'index']);
    Route::get('dh', [SiswaController::class, 'search']);
});

Route::group(['prefix' => 'absensi'], function () {
    Route::delete('delete/{id}', [DH::class, 'delete']);
    Route::put('update/{id}', [DH::class, 'update']);
    Route::post('store', [DH::class, 'store']);
    Route::get('index', [DH::class, 'getAbsensi']);
    Route::get('get-s', [DH::class, 'getSiswa']);
});

Route::group(['prefix' => 'keuangan'], function () {
    Route::delete('delete/{id}', [Keuangan::class, 'delete']);
    Route::put('update/{id}', [Keuangan::class, 'update']);
    Route::post('store', [Keuangan::class, 'store']);
    Route::get('index', [Keuangan::class, 'index']);
    Route::get('get-s', [Keuangan::class, 'getSiswa']);
});

