import AppLayout from '@/layouts/app-layout';
import { useAuth } from '@/hooks/useAuth';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { DebugAuth } from '@/components/debug-auth';
import AbsensiQrScanner from './qr-scanner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'QR Scan Absensi',
        href: route('atmin.scan-absensi'),
    },
];

export default function AdminDashboard() {
    const { loading: authLoading, isAuthenticated } = useAuth();

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h2>
                    <p className="text-gray-600 mb-4">Please login to access the dashboard.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        {/* Session Status Card */}
                        <div className="grid gap-4 mx-2 ">
                            {/* Tambahkan komponen status jika perlu */}
                        </div>

                        <AbsensiQrScanner />

                        {/* Debug Component - Remove in production */}
                        {process.env.NODE_ENV === 'development' && (
                            <DebugAuth />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}