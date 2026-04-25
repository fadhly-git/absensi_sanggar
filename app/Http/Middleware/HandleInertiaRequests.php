<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'nis' => $request->user()->nis,
                    'siswas' => $request->user()->siswas ? [
                        'qrcode_path' => $request->user()->siswas->qrcode_path,
                    ] : null,
                ] : null,
            ],
            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            'inspiringQuote' => [
                'message' => trim($message),
                'author' => trim($author),
            ],
            // Make sure ziggy is properly serialized and doesn't contain Symbols
            'ziggy' => fn() => [
                ...(new \Tighten\Ziggy\Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'seo' => fn() => [
                'title' => 'Ngesti Laras Budaya',
                'description' => 'Sanggar tari tradisional Ngesti Laras Budaya di Meteseh, Boja, Kendal. Pelestarian seni tari Jawa, gamelan, dan budaya nusantara.',
                'image' => url('/img/og-default.jpg'),
                'url' => $request->url(),
                'type' => 'website',
            ],
        ];
    }
}
