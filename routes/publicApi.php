<?php
// routes/publicApi.php - Public API Routes (No Auth, No CSRF Required)

use App\Http\Controllers\Api\Public\ConfigController;
use App\Http\Controllers\Api\Public\ProductController as PublicProductController;
use App\Http\Controllers\Api\Public\OrderController as PublicOrderController;
use App\Http\Controllers\Api\Public\StudentController as PublicStudentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes (No Auth Required) - Untuk Next.js Frontend
|--------------------------------------------------------------------------
| These routes are accessible without authentication and CSRF protection
| Make sure to configure CORS in config/cors.php
*/

Route::prefix('v1/public')->name('api.v1.public.')->group(function () {

    // Site Config (bank accounts, school info, etc.)
    Route::get('config', [ConfigController::class, 'index'])
        ->name('config');

    // Products
    Route::get('products', [PublicProductController::class, 'index'])
        ->name('products.index');
    Route::get('products/{id}', [PublicProductController::class, 'show'])
        ->name('products.show');

    // Students Search (for order form)
    Route::get('students/search', [PublicStudentController::class, 'search'])
        ->name('students.search');

    // Orders
    Route::post('orders', [PublicOrderController::class, 'store'])
        ->name('orders.store');
    Route::post('orders/draft', [PublicOrderController::class, 'saveDraft'])
        ->name('orders.save-draft');
    Route::get('orders/drafts', [PublicOrderController::class, 'getDrafts'])
        ->name('orders.get-drafts');
    Route::post('orders/{draftCode}/checkout', [PublicOrderController::class, 'checkoutDraft'])
        ->name('orders.checkout-draft');
    Route::get('orders/{invoiceCode}', [PublicOrderController::class, 'show'])
        ->name('orders.show');
    Route::post('orders/{invoiceCode}/mark-viewed', [PublicOrderController::class, 'markAsViewed'])
        ->name('orders.mark-viewed');
    Route::get('orders/buyer/history', [PublicOrderController::class, 'getByBuyer'])
        ->name('orders.buyer-history');
    Route::get('orders/search', [PublicOrderController::class, 'searchByBuyer'])
        ->name('orders.search');
    Route::post('orders/{invoiceCode}/payment-proof', [PublicOrderController::class, 'uploadPaymentProof'])
        ->name('orders.upload-proof');
    Route::delete('orders/{invoiceCode}', [PublicOrderController::class, 'destroy'])
        ->name('orders.destroy');
});
