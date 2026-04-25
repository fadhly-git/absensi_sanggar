<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\SEO\SitemapController;
use App\Http\Controllers\SEO\RobotsController;


// Public pages
Route::get('/', function () {
    return Inertia::render('public/welcome', [
        'seo' => [
            'title' => 'Sanggar Tari Ngesti Laras Budaya - Meteseh, Boja, Kendal',
            'description' => 'Sanggar tari tradisional Ngesti Laras Budaya di Meteseh, Boja, Kendal. Pelestarian seni tari Jawa, gamelan, dan budaya nusantara.',
            'image' => url('/img/og-default.jpg'),
            'url' => request()->url(),
            'type' => 'website',
        ],
    ]);
})->name('home');

Route::get('/about-us', function () {
    return Inertia::render('public/about-us', [
        'seo' => [
            'title' => 'Tentang Kami - Sanggar Tari Ngesti Laras Budaya Kendal',
            'description' => 'Sejarah, visi, dan misi Sanggar Tari Ngesti Laras Budaya di Meteseh, Boja, Kendal.',
            'image' => url('/img/og-default.jpg'),
            'url' => request()->url(),
            'type' => 'website',
        ],
    ]);
})->name('about-us');

Route::get('/gallery', function () {
    return Inertia::render('public/gallery', [
        'seo' => [
            'title' => 'Gallery - Sanggar Tari Ngesti Laras Budaya Kendal',
            'description' => 'Gallery foto kegiatan dan pentas seni Sanggar Tari Ngesti Laras Budaya di Meteseh, Boja, Kendal.',
            'image' => url('/img/og-default.jpg'),
            'url' => request()->url(),
            'type' => 'website',
        ],
    ]);
})->name('gallery');

Route::get('/news', function () {
    return Inertia::render('public/berita-kegiatan', [
        'seo' => [
            'title' => 'Berita & Kegiatan - Sanggar Tari Ngesti Laras Budaya Kendal',
            'description' => 'Berita terkini dan kegiatan Sanggar Tari Ngesti Laras Budaya di Meteseh, Boja, Kendal.',
            'image' => url('/img/og-default.jpg'),
            'url' => request()->url(),
            'type' => 'website',
        ],
    ]);
})->name('news');

Route::get('/news/{slug}', function ($slug) {
    $post = \App\Models\Post::where('slug', $slug)->published()->with('author:id,name', 'category:id,name')->first();

    $seo = [
        'title' => ($post?->meta_title ?? $post?->title ?? 'Artikel') . ' | Ngesti Laras Budaya',
        'description' => $post?->meta_description ?? $post?->excerpt ?? '',
        'image' => $post?->featured_image ? url($post->featured_image) : url('/img/og-default.jpg'),
        'url' => request()->url(),
        'type' => 'article',
    ];

    return Inertia::render('public/post-detail', [
        'slug' => $slug,
        'seo' => $seo,
    ]);
})->name('post-detail');

Route::get('/contact', function () {
    return Inertia::render('public/kontak-kami', [
        'seo' => [
            'title' => 'Kontak Kami - Sanggar Tari Ngesti Laras Budaya Kendal',
            'description' => 'Hubungi Sanggar Tari Ngesti Laras Budaya di Meteseh, Boja, Kendal.',
            'image' => url('/img/og-default.jpg'),
            'url' => request()->url(),
            'type' => 'website',
        ],
    ]);
})->name('contact');

// Redirects from old routes (SEO preservation)
Route::get('/berita-kegiatan/{slug?}', function ($slug = null) {
    return redirect($slug ? "/news/$slug" : '/news', 301);
});
Route::get('/kontak-kami', function () {
    return redirect('/contact', 301);
});

// SEO Routes
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', [RobotsController::class, 'index'])->name('robots');

// Debug route (hanya untuk development)
if (app()->environment('local')) {
    Route::get('/debug-session', function (Request $request) {
        return response()->json([
            'auth_user' => Auth::user(),
            'session_data' => [
                'session_expires_at' => $request->session()->get('session_expires_at'),
                'is_remembered' => $request->session()->get('is_remembered'),
                'login_time' => $request->session()->get('login_time'),
            ],
            'current_time' => now()->toISOString(),
            'session_id' => $request->session()->getId(),
            'access_token' => Auth::user() ? Auth::user()->currentAccessToken() : null,
        ]);
    })->middleware('auth:sanctum');
}

Route::prefix('atmin')->middleware('auth:sanctum')->group(function () {
    Route::prefix('event')->group(function () {
        // api
        Route::prefix('api/orders')->group(function () {
            Route::get('/', [App\Http\Controllers\Event\OrderController::class, 'apiIndex']);
            Route::post('/', [App\Http\Controllers\Event\OrderController::class, 'apiStore']);
            Route::get('/statistics', [App\Http\Controllers\Event\OrderController::class, 'apiStatistics']);
            Route::get('/students', [App\Http\Controllers\Event\OrderController::class, 'apiStudents']);
            Route::get('/products', [App\Http\Controllers\Event\OrderController::class, 'apiProducts']);
            Route::get('/{order}', [App\Http\Controllers\Event\OrderController::class, 'apiShow']);
            Route::put('/{order}', [App\Http\Controllers\Event\OrderController::class, 'apiUpdate']);
            Route::put('/{order}/status', [App\Http\Controllers\Event\OrderController::class, 'apiUpdateStatus']);
            Route::delete('/{order}', [App\Http\Controllers\Event\OrderController::class, 'apiDestroy']);
        });

    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dev/tools', function () {
        return Inertia::render('dev/tools/index');
    })->name('dev.tools');
});

require __DIR__ . '/pengurus.php';
require __DIR__ . '/siswa.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/cms.php';
require __DIR__ . '/public.php';

require __DIR__ . '/auth.php';
