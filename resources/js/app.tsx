// import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ThemeProvider } from '@/components/theme-provider';
// 1. Impor QueryClient dan QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// 2. (Opsional tapi sangat direkomendasikan) Impor Devtools untuk debugging
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// 3. Buat instance dari QueryClient
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Opsi default: data akan dianggap 'stale' (usang) setelah 5 menit.
            // Ini akan mencegah fetching berlebihan jika pengguna bolak-balik halaman.
            staleTime: 1000 * 60 * 5,
        },
    },
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            // 4. Bungkus aplikasi utama dengan QueryClientProvider
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                    <App {...props} />
                </ThemeProvider>
                {/* 5. Tambahkan Devtools di sini */}
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});