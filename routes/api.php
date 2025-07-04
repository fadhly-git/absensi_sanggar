<?php
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\KeuanganController;

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
Route::prefix('admin')->middleware(['web', 'auth:sanctum'])->group(function () {
    // Dashboard
    Route::get('/dashboard/summary', [DashboardController::class, 'getSummary'])
        ->name('api.admin.dashboard.summary');

    // Absensi
    Route::prefix('absensi')->group(function () {
        Route::get('weekly-report', [AbsensiController::class, 'generateWeeklyReport'])
            ->name('api.admin.absensi.weekly-report');

        Route::get('hadir-minggu-ini', [AbsensiController::class, 'getSiswaHadirMingguIni'])
            ->name('api.admin.absensi.hadir-minggu-ini');

        Route::get('weekly-report/export', [AbsensiController::class, 'exportWeeklyReport'])
            ->name('api.admin.absensi.weekly-report.export');

        Route::get('count', [AbsensiController::class, 'getAttendanceCount'])
            ->name('api.admin.absensi.count');

        Route::get('siswa-aktif', [AbsensiController::class, 'getActiveSiswa'])
            ->name('api.admin.absensi.siswa-aktif');

        Route::post('/', [AbsensiController::class, 'store'])
            ->name('api.admin.absensi.store');

        Route::delete('/{id}', [AbsensiController::class, 'destroy'])
            ->name('api.admin.absensi.destroy');
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
    Route::prefix('keuangan')->name('api.admin.keuangan.')->group(function () {
        Route::get('/', [KeuanganController::class, 'getTransactions'])->name('index');
        Route::post('/', [KeuanganController::class, 'store'])->name('store');
        Route::put('{id}', [KeuanganController::class, 'update'])->name('update');
        Route::delete('{id}', [KeuanganController::class, 'destroy'])->name('destroy');
        Route::get('saldo', [KeuanganController::class, 'getSaldo'])->name('saldo');
        Route::get('export', [KeuanganController::class, 'exportFinancialReport'])->name('export');
    });
});