import { useAuth } from '@/hooks/useAuth';
import StudentLayout from '@/layouts/student-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'QR Code',
        href: route('siswa.qr-code'),
    },
];

export default function QrCodePage() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const page = usePage<SharedData>();
    const { auth } = page.props;
    // console.log('auth', auth);

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
                    <p className="mb-4 text-gray-600">Please login to access this page.</p>
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
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="QR Code Siswa" />
            <div className="flex min-h-[60vh] flex-col items-center justify-center py-8">
                <h1 className="mb-4 text-2xl font-bold">QR Code Siswa</h1>
                <img src={`/storage/${auth.user.siswas.qrcode_path}`} alt={`Qr Code ${auth.user.name}`} />
                <div className="mt-4 text-center text-gray-600">Tunjukkan QR ini ke petugas untuk scan absensi.</div>
            </div>
        </StudentLayout>
    );
}
