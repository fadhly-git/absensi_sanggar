<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="shortcut icon" href="/img/logo.png" type="image/x-icon">

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function () {
            const appearance = '{{ $appearance ?? "system" }}';

            if (appearance === 'dark') {
                document.documentElement.classList.add('dark');
            } else if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500&family=Space+Grotesk:wght@500&display=swap"
        rel="stylesheet">

    {{-- Server-side SEO Meta Tags (for social media bots) --}}
    @php $seo = $page['props']['seo'] ?? []; @endphp
    <title>{{ $seo['title'] ?? 'Ngesti Laras Budaya' }}</title>
    <meta name="description"
        content="{{ $seo['description'] ?? 'Sanggar tari tradisional di Meteseh, Boja, Kendal.' }}">
    <meta property="og:type" content="{{ $seo['type'] ?? 'website' }}">
    <meta property="og:url" content="{{ $seo['url'] ?? request()->url() }}">
    <meta property="og:title" content="{{ $seo['title'] ?? 'Ngesti Laras Budaya' }}">
    <meta property="og:description"
        content="{{ $seo['description'] ?? 'Sanggar tari tradisional di Meteseh, Boja, Kendal.' }}">
    <meta property="og:image" content="{{ $seo['image'] ?? url('/img/og-default.jpg') }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Ngesti Laras Budaya">
    <meta property="og:locale" content="id_ID">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $seo['title'] ?? 'Ngesti Laras Budaya' }}">
    <meta name="twitter:description"
        content="{{ $seo['description'] ?? 'Sanggar tari tradisional di Meteseh, Boja, Kendal.' }}">
    <meta name="twitter:image" content="{{ $seo['image'] ?? url('/img/og-default.jpg') }}">

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>