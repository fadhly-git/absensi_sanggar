<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $host = request()->getHost();

        // Paksa https hanya jika domain tunnel, BUKAN kalau diakses lewat IP LAN
        if ($host === 'absensi.ngelaras.my.id') {
            URL::forceScheme('https');
        }
    }
}
