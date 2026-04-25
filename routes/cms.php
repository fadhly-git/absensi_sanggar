<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CMS\PostController;
use App\Http\Controllers\CMS\PostCategoryController;
use App\Http\Controllers\CMS\EventController;
use App\Http\Controllers\CMS\MediaController;
use App\Http\Controllers\CMS\GalleryController;
use App\Http\Controllers\CMS\PageController;
use App\Http\Controllers\CMS\SiteSettingController;
use App\Http\Controllers\CMS\SocialLinkController;
use App\Http\Controllers\CMS\ContactMessageController;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:pengurus,admin', 'check.token'])->prefix('atmin/cms')->name('atmin.cms.')->group(function () {

    // CMS Dashboard
    Route::get('/', function () {
        return Inertia::render('cms/dashboard');
    })->name('dashboard');

    // CMS Stats API
    Route::get('/api/stats', [App\Http\Controllers\CMS\CMSController::class, 'getStats'])->name('api.stats');

    // Posts Management
    Route::prefix('posts')->name('posts.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('cms/posts/index');
        })->name('index');

        Route::get('/create', function () {
            return Inertia::render('cms/posts/create');
        })->name('create');

        Route::get('/{post}/edit', function ($post) {
            return Inertia::render('cms/posts/edit', ['postId' => $post]);
        })->name('edit');

        // API routes
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/', [PostController::class, 'index'])->name('index');
            Route::post('/', [PostController::class, 'store'])->name('store');
            Route::get('/{post}', [PostController::class, 'show'])->name('show');
            Route::put('/{post}', [PostController::class, 'update'])->name('update');
            Route::delete('/{post}', [PostController::class, 'destroy'])->name('destroy');
            Route::patch('/{post}/publish', [PostController::class, 'publish'])->name('publish');
            Route::patch('/{post}/draft', [PostController::class, 'draft'])->name('draft');
        });
    });

    // Post Categories Management
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('cms/categories/index');
        })->name('index');

        // API routes
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/', [PostCategoryController::class, 'index'])->name('index');
            Route::post('/', [PostCategoryController::class, 'store'])->name('store');
            Route::put('/{category}', [PostCategoryController::class, 'update'])->name('update');
            Route::delete('/{category}', [PostCategoryController::class, 'destroy'])->name('destroy');
        });
    });

    // Events Management
    Route::prefix('events')->name('events.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('cms/events/index');
        })->name('index');

        Route::get('/create', function () {
            return Inertia::render('cms/events/create');
        })->name('create');

        Route::get('/{event}/edit', function ($event) {
            return Inertia::render('cms/events/edit', ['eventId' => $event]);
        })->name('edit');

        // API routes
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/', [EventController::class, 'index'])->name('index');
            Route::post('/', [EventController::class, 'store'])->name('store');
            Route::get('/{event}', [EventController::class, 'show'])->name('show');
            Route::put('/{event}', [EventController::class, 'update'])->name('update');
            Route::delete('/{event}', [EventController::class, 'destroy'])->name('destroy');
            Route::patch('/{event}/cancel', [EventController::class, 'cancel'])->name('cancel');
        });
    });

    // Media Library Management
    Route::prefix('media')->name('media.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('cms/media/index');
        })->name('index');

        // API routes
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/', [MediaController::class, 'index'])->name('index');
            Route::post('/upload', [MediaController::class, 'upload'])->name('upload');
            Route::post('/upload-multiple', [MediaController::class, 'uploadMultiple'])->name('upload.multiple');
            Route::put('/{media}', [MediaController::class, 'update'])->name('update');
            Route::delete('/{media}', [MediaController::class, 'destroy'])->name('destroy');
        });
    });

    // Gallery Management
    Route::prefix('gallery')->name('gallery.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('cms/gallery/index');
        })->name('index');

        Route::get('/create', function () {
            return Inertia::render('cms/gallery/create');
        })->name('create');

        Route::get('/{galleryItem}/edit', function ($galleryItem) {
            return Inertia::render('cms/gallery/edit', ['galleryId' => $galleryItem]);
        })->name('edit');

        Route::get('/pending', function () {
            return Inertia::render('cms/gallery/pending');
        })->name('pending');

        // API routes
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/', [GalleryController::class, 'index'])->name('index');
            Route::get('/pending', [GalleryController::class, 'pending'])->name('pending');
            Route::post('/', [GalleryController::class, 'store'])->name('store');
            Route::get('/{galleryItem}', [GalleryController::class, 'show'])->name('show');
            Route::put('/{galleryItem}', [GalleryController::class, 'update'])->name('update');
            Route::delete('/{galleryItem}', [GalleryController::class, 'destroy'])->name('destroy');
            Route::patch('/{galleryItem}/approve', [GalleryController::class, 'approve'])->name('approve');
            Route::patch('/{galleryItem}/reject', [GalleryController::class, 'reject'])->name('reject');
        });
    });

    // Pages Management (Homepage, About, Contact)
    Route::prefix('pages')->name('pages.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('cms/pages/index');
        })->name('index');

        Route::get('/{pageKey}/edit', function ($pageKey) {
            return Inertia::render('cms/pages/edit', ['pageKey' => $pageKey]);
        })->name('edit');

        // API routes
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/', [PageController::class, 'index'])->name('index');
            Route::get('/{pageKey}', [PageController::class, 'show'])->name('show');
            Route::match(['put', 'post'], '/{pageKey}', [PageController::class, 'update'])->name('update');
        });
    });

    // Site Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('cms/settings/index');
        })->name('index');

        // API routes
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/', [SiteSettingController::class, 'index'])->name('index');
            Route::put('/', [SiteSettingController::class, 'update'])->name('update');
        });
    });

    // Social Links Management
    Route::prefix('social-links')->name('social-links.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('cms/social-links/index');
        })->name('index');

        // API routes
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/', [SocialLinkController::class, 'index'])->name('index');
            Route::post('/', [SocialLinkController::class, 'store'])->name('store');
            Route::put('/{socialLink}', [SocialLinkController::class, 'update'])->name('update');
            Route::delete('/{socialLink}', [SocialLinkController::class, 'destroy'])->name('destroy');
        });
    });

    // Contact Messages Management
    Route::prefix('contact-messages')->name('contact-messages.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('cms/contact-messages/index');
        })->name('index');

        // API routes
        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/', [ContactMessageController::class, 'index'])->name('index');
            Route::patch('/{contactMessage}/read', [ContactMessageController::class, 'markRead'])->name('read');
            Route::post('/{contactMessage}/reply', [ContactMessageController::class, 'reply'])->name('reply');
            Route::delete('/{contactMessage}', [ContactMessageController::class, 'destroy'])->name('destroy');
        });
    });
});
