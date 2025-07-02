<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class SystemActionController extends Controller
{
    /**
     * Membersihkan semua cache aplikasi dan redirect kembali
     * ke dashboard dengan pesan status.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function clearAllCache(): RedirectResponse
    {
        try {
            Artisan::call('cache:clear');
            Artisan::call('route:clear');
            Artisan::call('config:clear');
            Artisan::call('view:clear');

            Log::info('All caches have been cleared successfully by a user.');

            // Redirect kembali ke route 'dashboard' dengan pesan sukses
            return redirect()->route('atmin.dashboard')->with('success', 'Semua cache telah berhasil dibersihkan!');

        } catch (\Exception $e) {
            Log::error('Failed to clear cache via controller: ' . $e->getMessage());

            // Redirect kembali ke route 'dashboard' dengan pesan error
            return redirect()->route('atmin.dashboard')->with('errors', 'Gagal membersihkan cache. Silakan coba lagi.');
        }
    }
}