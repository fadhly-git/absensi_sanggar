// resources/js/pages/student/dashboard.tsx
import { DebugAuth } from '@/components/debug-auth';
import { DashboardCard } from '@/components/student/dashboard-card';
import { FullPageLoader } from '@/components/atoms/loading-spinner';
import { MainPage } from '@/components/student/main-page';
import { NotAuthenticated } from '@/components/student/not-authenticated';
import { ProfileSidebar } from '@/components/student/profile-sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useSiswaById } from '@/hooks/useSiswa';
import StudentLayout from '@/layouts/student-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('siswa.dashboard'),
    },
];

export default function Dashboard() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { data: siswaData, isLoading: siswaLoading } = useSiswaById(auth.user.id);

    if (authLoading) {
        return <FullPageLoader text="Memverifikasi sesi..." />;
    }

    if (!isAuthenticated) {
        return <NotAuthenticated />;
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col px-3 sm:px-4">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6 py-4 sm:py-6 lg:flex-row lg:py-8">
                    <div className="w-full lg:w-1/3">
                        <ProfileSidebar data={siswaData} isLoading={siswaLoading} />
                    </div>

                    <div className="flex w-full flex-col gap-4 sm:gap-6 lg:w-2/3">
                        <DashboardCard>
                            <MainPage userId={auth.user.id} />
                        </DashboardCard>

                        {process.env.NODE_ENV === 'development' && (
                            <DashboardCard className="border-dashed">
                                <DebugAuth />
                            </DashboardCard>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
