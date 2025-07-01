/* eslint-disable @typescript-eslint/no-explicit-any */
import { SectionCards } from '@/components/section-card';
import { SessionStatus } from '@/components/session-status';
import { DebugAuth } from '@/components/debug-auth'; // Import debug component
import AppLayout from '@/layouts/app-layout';
import { useAuth } from '@/hooks/useAuth';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@/services/dashboardApi';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('atmin.dashboard'),
    },
];

export default function Dashboard() {
    const { loading: authLoading, isAuthenticated, user } = useAuth();

    // Mengambil semua data untuk dashboard dengan satu query
    const { data: summaryData, isLoading, error, refetch } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: fetchDashboardSummary,
        // Disable query jika auth masih loading atau tidak authenticated
        enabled: !authLoading && isAuthenticated,
        retry: (failureCount, error: any) => {
            // Jangan retry jika error 401 (unauthorized)
            if (error?.response?.status === 401) {
                return false;
            }
            return failureCount < 3;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    console.log('Dashboard render state:', {
        authLoading,
        isAuthenticated,
        user,
        summaryData,
        isLoading,
        error: error?.message
    });

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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        {/* Session Status Card */}
                        <div className="grid gap-4 mx-2 ">
                            <SessionStatus showDetails className="w-full" />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-red-800 font-medium">Error loading dashboard data</h3>
                                        <p className="text-red-600 text-sm mt-1">
                                            {error instanceof Error ? error.message : 'Unknown error occurred'}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => refetch()}
                                        className="bg-red-100 hover:bg-red-200 text-red-800"
                                        size="sm"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Dashboard Summary Cards */}
                        <SectionCards summary={summaryData} isLoading={isLoading} />

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