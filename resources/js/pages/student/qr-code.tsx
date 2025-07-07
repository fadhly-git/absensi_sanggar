import StudentLayout from '@/layouts/student-layout';
import { Head, usePage } from '@inertiajs/react';
import { useAuth } from '@/hooks/useAuth';
import { BreadcrumbItem, SharedData } from '@/types';

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
                    <p className="text-gray-600 mb-4">Please login to access this page.</p>
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
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="QR Code Siswa" />
            <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
                <h1 className="text-2xl font-bold mb-4">QR Code Siswa</h1>
                <img src={route('api.siswa.get-qr', auth.user.id)} alt="QR Siswa" />
                <div className="mt-4 text-center text-gray-600">
                    Tunjukkan QR ini ke petugas untuk scan absensi.
                </div>
            </div>
        </StudentLayout>
    );
}