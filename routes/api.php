<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\SiswaCon as sc;
use App\Http\Controllers\KeuanganCon as kc;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/get-absensi/index', [AbsensiController::class,'generateWeeklyReport']);

//atmin api
Route::group(['prefix' => 'atmin'], function () {

    Route::get('/dashboard-summary', [DashboardController::class, 'getSummary']);

    // daftar hadir api
    Route::group(['prefix' => 'absensi'], function () {
        Route::get('get-siswa', [AbsensiController::class, 'getAbsentStudents']);
        Route::get('get-count-absensi', [AbsensiController::class, 'jumlahSiswaMasuk']);
        Route::post('store-absensi', [AbsensiController::class, 'store']);
        Route::put('update-absensi/{id}', [AbsensiController::class, 'update']);
        Route::delete('delete-absensi/{id}', [AbsensiController::class, 'destroy']);
    });

    // siswa api
    Route::group(['prefix' => 'siswa'], function(){
        Route::get('index', [sc::class, 'index']);
        Route::post('store', [sc::class,'store']);
        Route::put('update/{id}', [sc::class,'update']);
        Route::delete('delete/{id}', [sc::class,'delete']);
        Route::get('get-siswa-aktif',[sc::class, 'getCountSiswaAktif']);
        Route::get('get-count-all', [sc::class,'getCountSiswa']);
        Route::get('export-excel', [sc::class, 'exportExcel']);
    });

    // keuangan api
    Route::group(['prefix'=> 'keuangan'], function () {
        Route::get('index', [kc::class, 'getUangByDate']);
        Route::post('store', [kc::class,'store']);
        Route::put('update/{id}', [kc::class,'update']);
        Route::delete('delete/{id}', [kc::class,'delete']);
        Route::get('get-saldo',[kc::class,'getSaldo']);
    });
    Route::get('/weekly-report', [AbsensiController::class, 'generateWeeklyReport']);
})->middleware('auth:sanctum');

