<?php

use App\Http\Controllers\Public\PublicApiController;
use App\Http\Controllers\Public\ContactController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
|
| These routes are publicly accessible for frontend pages
|
*/

Route::prefix('api')->group(function () {
    // Posts
    Route::get('/posts', [PublicApiController::class, 'getPosts']);
    Route::get('/posts/{slug}', [PublicApiController::class, 'getPost']);
    Route::post('/posts/{id}/view', [PublicApiController::class, 'incrementPostViews']);

    // Categories
    Route::get('/categories', [PublicApiController::class, 'getCategories']);

    // Gallery
    Route::get('/gallery', [PublicApiController::class, 'getGallery']);

    // Pages
    Route::get('/pages/{slug}', [PublicApiController::class, 'getPage']);

    // Settings
    Route::get('/settings', [PublicApiController::class, 'getSettings']);
    Route::get('/social-links', [PublicApiController::class, 'getSocialLinks']);

    // Stats
    Route::get('/stats', [PublicApiController::class, 'getStats']);

    // Events
    Route::get('/events/upcoming', [PublicApiController::class, 'getUpcomingEvents']);

    // Contact
    Route::post('/contact', [ContactController::class, 'store']);
});
