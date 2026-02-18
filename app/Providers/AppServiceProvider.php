<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Foundation\AliasLoader;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Daftarkan Alias Image agar bisa dipanggil langsung sebagai 'Image'
        $loader = AliasLoader::getInstance();
        $loader->alias('Image', \Intervention\Image\Facades\Image::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->runningInConsole()) return;

        $host = request()->getHost();
        $main = 'ngelaras.my.id';

        // Jangan redirect untuk localhost/dev IP lokal yang spesifik jika perlu
        if (preg_match('/^(192\.168\.5\.31|localhost|127\.0\.0\.1)$/', $host)) return;

        // Jika sudah di domain utama -> paksa https dan lanjutkan (tanpa redirect)
        if ($host === $main) {
            URL::forceScheme('https');
            return;
        }

        // Redirect semua host selain domain utama ke domain utama
        $uri = '/' . ltrim(request()->getRequestUri(), '/');
        redirect()->to("https://{$main}{$uri}", 301)->send();
        exit;
    }
}
