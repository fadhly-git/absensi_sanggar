<?php
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\KeuanganCon as KeuanganController;

// Session check route - PENTING: gunakan web middleware untuk session-based auth
Route::get('check-session', [AuthenticatedSessionController::class, 'checkSession'])
    ->name('api.check-session')
    ->middleware(['web', 'auth']);

// User route untuk Sanctum token-based auth
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum')->name('api.user');

// Absensi Laporan Mingguan (public)
Route::get('/absensi/weekly-report', [AbsensiController::class, 'generateWeeklyReport'])
    ->name('api.absensi.weekly-report');

// Admin API - PENTING: gunakan middleware yang konsisten
Route::prefix('admin')->middleware(['web', 'auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard/summary', [DashboardController::class, 'getSummary'])
        ->name('api.admin.dashboard.summary');

    // Absensi
    Route::prefix('absensi')->group(function () {
        Route::get('siswa-list', [AbsensiController::class, 'getAbsentStudents'])
            ->name('api.admin.absensi.siswa-list');
        Route::get('count', [AbsensiController::class, 'jumlahSiswaMasuk'])
            ->name('api.admin.absensi.count');
        Route::post('/', [AbsensiController::class, 'store'])
            ->name('api.admin.absensi.store');
        Route::put('{id}', [AbsensiController::class, 'update'])
            ->name('api.admin.absensi.update');
        Route::delete('{id}', [AbsensiController::class, 'destroy'])
            ->name('api.admin.absensi.destroy');
        Route::get('weekly-report', [AbsensiController::class, 'generateWeeklyReport'])
            ->name('api.admin.absensi.weekly-report');
    });

    // Siswa - Updated routes for simplified structure
    // Siswa routes dengan resource
    Route::prefix('siswa')->group(function () {
        // Non-resource routes PERTAMA
        Route::get('export', [SiswaController::class, 'export'])
            ->name('api.admin.siswa.export');
        Route::post('import', [SiswaController::class, 'import'])
            ->name('api.admin.siswa.import');
        Route::get('template', [SiswaController::class, 'downloadTemplate'])
            ->name('api.admin.siswa.template');
        Route::get('count/aktif', [SiswaController::class, 'getCountSiswaAktif'])
            ->name('api.admin.siswa.count-aktif');
        Route::get('count/semua', [SiswaController::class, 'getCountSiswa'])
            ->name('api.admin.siswa.count-semua');
        Route::get('trashed', [SiswaController::class, 'getTrashed'])
            ->name('api.admin.siswa.trashed');
        Route::post('bulk-action', [SiswaController::class, 'bulkAction'])
            ->name('api.admin.siswa.bulk-action');

        // Resource routes KEDUA
        Route::apiResource('/', SiswaController::class, [
            'names' => [
                'index' => 'api.admin.siswa.index',
                'show' => 'api.admin.siswa.show',
                'store' => 'api.admin.siswa.store',
                'update' => 'api.admin.siswa.update',
                'destroy' => 'api.admin.siswa.delete',
            ],
            'parameters' => ['' => 'id']
        ])->where(['id' => '[0-9]+']);

        // Additional routes
        Route::post('{id}/restore', [SiswaController::class, 'restore'])
            ->name('api.admin.siswa.restore')
            ->where('id', '[0-9]+');
        Route::delete('{id}/force', [SiswaController::class, 'forceDelete'])
            ->name('api.admin.siswa.force-delete')
            ->where('id', '[0-9]+');
    });

    // Keuangan
    Route::prefix('keuangan')->group(function () {
        Route::get('/', [KeuanganController::class, 'getUangByDate'])
            ->name('api.admin.keuangan.index');
        Route::post('/', [KeuanganController::class, 'store'])
            ->name('api.admin.keuangan.store');
        Route::put('{id}', [KeuanganController::class, 'update'])
            ->name('api.admin.keuangan.update');
        Route::delete('{id}', [KeuanganController::class, 'delete'])
            ->name('api.admin.keuangan.destroy');
        Route::get('saldo', [KeuanganController::class, 'getSaldo'])
            ->name('api.admin.keuangan.saldo');
    });
});