/* eslint-disable @typescript-eslint/no-explicit-any */
import { SessionStatus } from '@/components/session-status';
import { DebugAuth } from '@/components/debug-auth'; // Import debug component
import StudentLayout from '@/layouts/student-layout';
import { useAuth } from '@/hooks/useAuth';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('siswa.dashboard'),
    },
];

export default function Dashboard() {
    const { loading: authLoading, isAuthenticated } = useAuth();


    // Show loading spinner jika auth masih loading
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Show error jika tidak authenticated
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
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        {/* Session Status Card */}
                        <div className="grid gap-4 mx-2 ">
                            <SessionStatus showDetails className="w-full" />
                        </div>

                        {/* Debug Component - Remove in production */}
                        {process.env.NODE_ENV === 'development' && (
                            <DebugAuth />
                        )}

                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}