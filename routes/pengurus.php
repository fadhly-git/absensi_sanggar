<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AbsensiController as AC;
use App\Http\Controllers\KeuanganController as KC;
use App\Http\Controllers\Event\ProductController;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:pengurus,admin', 'check.token'])->group(function () {

    // API Routes for Event Orders
    Route::prefix('pengurus/event/orders')->group(function () {
        Route::get('api', [App\Http\Controllers\Event\OrderController::class, 'apiIndex']);
        Route::patch('{order}/status', [App\Http\Controllers\Event\OrderController::class, 'apiUpdateStatus']);
    });

    // API Routes for Event Payment Proofs
    Route::prefix('pengurus/event/payment-proofs')->group(function () {
        Route::get('api', [App\Http\Controllers\Event\PaymentProofController::class, 'apiIndex']);
        Route::patch('{order}/verify', [App\Http\Controllers\Event\PaymentProofController::class, 'apiVerify']);
    });

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

        Route::get('scan-absensi', function () {
            return Inertia::render('scan-absensi');
        })->name('atmin.scan-absensi');

        Route::get('register', function () {
            return Inertia::render('register');
        })->name('atmin.register');

        Route::get('daftar-hadir', function () {
            return Inertia::render('daftar-hadir');
        })->name('atmin.daftar-hadir');

        Route::get('keuangan', function () {
            return Inertia::render('keuangan');
        })->name('atmin.keuangan');

        // Event Products Routes
        Route::prefix('event')->group(function () {
            Route::get('orders', [App\Http\Controllers\Event\OrderController::class, 'index'])
                ->name('atmin.event.orders');

            Route::get('orders/export', [App\Http\Controllers\Event\OrderController::class, 'export'])
                ->name('atmin.event.orders.export');

            Route::get('payment-proofs', function () {
                return Inertia::render('event/payment-proofs');
            })->name('atmin.event.payment-proofs');

            Route::get('products', function () {
                return Inertia::render('event/products');
            })->name('atmin.event.products');
        });

        Route::get('system/clear-cache', [App\Http\Controllers\SystemActionController::class, 'clearAllCache'])
            ->name('atmin.system.clear-cache');
    });

});
