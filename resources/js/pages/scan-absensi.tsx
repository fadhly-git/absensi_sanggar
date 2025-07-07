import { DebugAuth } from '@/components/debug-auth';
import { useAuth } from '@/hooks/useAuth';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import AbsensiQrScanner from './qr-scanner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'QR Scan Absensi',
        href: route('atmin.scan-absensi'),
    },
];

export default function AdminDashboard() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const page = usePage<SharedData>();
    const { auth } = page.props;

    console.log('auth', auth);

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-4 text-2xl font-bold text-gray-900">Not Authenticated</h2>
                    <p className="mb-4 text-gray-600">Please login to access the dashboard.</p>
                    <button
                        onClick={() => (window.location.href = '/login')}
                        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
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
                        <div className="mx-2 grid gap-4">{/* Tambahkan komponen status jika perlu */}</div>

                        <AbsensiQrScanner />

                        {/* Debug Component - Remove in production */}
                        {process.env.NODE_ENV === 'development' && <DebugAuth />}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
