/* eslint-disable @typescript-eslint/no-explicit-any */
import { DebugAuth } from '@/components/debug-auth'; // Import debug component
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { useAbsensiRiwayat } from '@/hooks/useAbsensiRiwayat';
import { useAuth } from '@/hooks/useAuth';
import { useSiswaById } from '@/hooks/useSiswa';
import StudentLayout from '@/layouts/student-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Siswa } from '@/types/siswa';
import { Head, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Calendar1, MapPin } from 'lucide-react';
import { AbsensiGridPerBarisBulan } from './absensi-perbulan';

export default function Dashboard() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const page = usePage<SharedData>();
    const { auth } = page.props;
    // Ambil data siswa berdasarkan ID dari auth
    const { data: siswaData } = useSiswaById(auth.user.id);

    // Show loading spinner jika auth masih loading
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    }

    // Show error jika tidak authenticated
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
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col px-4">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    {/* --------- Start: Layout baru agar mirip GitHub Profile --------- */}
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 py-8 lg:flex-row">
                        {/* Sidebar */}
                        <div className="flex w-full flex-col gap-2 lg:w-1/3">
                            <ProfileSidebar data={siswaData} />
                        </div>
                        {/* Main content */}
                        <div className="flex w-full flex-col gap-2 lg:w-2/3">
                            <DashboardCard>
                                {/* Main Page Content */}
                                <MainPage userId={auth.user.id} />
                            </DashboardCard>
                            {/* Debug Component - Remove in production */}
                            {process.env.NODE_ENV === 'development' && (
                                <DashboardCard>
                                    <DebugAuth />
                                </DashboardCard>
                            )}
                        </div>
                    </div>
                    {/* --------- End: Layout baru --------- */}
                </div>
            </div>
        </StudentLayout>
    );
}

interface StudentData {
    data: Siswa | undefined;
}

// --------- Tambahan dari layout gambar (mirip GitHub profile) ---------
const ProfileSidebar = ({ data }: StudentData) => {
    console.log('ProfileSidebar data:', data);
    const editProfile = true; // Ganti true jika user bisa edit profil
    const getInitials = useInitials();

    return (
        <aside className="bg-background border-accent-foreground mx-auto flex min-h-[450px] w-full max-w-xl flex-col items-center rounded-xl border p-6 shadow-sm lg:mx-0">
            <div className="relative">
                <Avatar className="h-40 w-40 rounded-full border-4 border-[#23272e] object-cover">
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-4xl font-extrabold text-black dark:bg-neutral-700 dark:text-white">
                        {getInitials(data?.nama ?? '')}
                    </AvatarFallback>
                </Avatar>
                <span className="border-accent-foreground absolute right-3 bottom-3 block h-6 w-6 rounded-full border-2 bg-green-500"></span>
            </div>
            <h2 className="mt-6 text-2xl font-bold capitalize">{data?.nama}</h2>
            <div className="flex items-start gap-1 text-sm text-gray-600 dark:text-gray-200">
                <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                <span className="line-clamp-2 capitalize">{data?.alamat}</span>
            </div>
            <div className="w-full">
                <div>
                    <span className="block text-xs text-gray-400 dark:text-gray-300">Status</span>
                    <Badge
                        variant={data?.status ? 'default' : 'secondary'}
                        className={
                            data?.status
                                ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                        }
                    >
                        {data?.status ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                </div>
                <div>
                    <span className="block text-xs text-gray-400 dark:text-gray-300">Statistik Absensi</span>
                    <span className="text-sm text-gray-600 dark:text-gray-200">
                        Total: {data?.total_absensi ?? '-'} | Bulan ini: {data?.absensi_bulan_ini ?? '-'}
                    </span>
                </div>
                <div>
                    <span className="block text-xs text-gray-400 dark:text-gray-300">Terdaftar</span>
                    <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar1 className="h-3 w-3" />
                        {data?.tanggal_terdaftar
                            ? formatDistanceToNow(new Date(data.tanggal_terdaftar), {
                                  addSuffix: true,
                                  locale: localeId,
                              })
                            : '-'}
                    </span>
                </div>
            </div>
            {editProfile && (
                <Button
                    variant={'outline'}
                    className="hover:bg-primary hover:text-secondary mt-4 w-full"
                    onClick={() => (window.location.href = route('profile.edit'))}
                >
                    Edit profile
                </Button>
            )}
        </aside>
    );
};

const DashboardCard = ({ children }: { children: React.ReactNode }) => (
    <section className="bg-background border-accent-foreground w-full min-w-0 flex-1 rounded-xl border p-7 shadow-sm">{children}</section>
);

// --------- END Tambahan layout ---------

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('siswa.dashboard'),
    },
];

import { useEffect, useState } from 'react';
// ...existing import...

const MainPage = ({ userId }: { userId: number }) => {
    const tahun = new Date().getFullYear();
    const { data, isLoading } = useAbsensiRiwayat(userId, 'tahun', 7, tahun);

    // Responsive bulanPerBaris
    const [bulanPerBaris, setBulanPerBaris] = useState(2);
    useEffect(() => {
        const handler = () => setBulanPerBaris(window.innerWidth < 1024 ? 2 : 3);
        handler();
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    if (isLoading)
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    if (!data) return <div>Tidak ada data absensi.</div>;
    return (
        <div className="relative flex flex-col gap-4">
            <div className="mb-2 font-bold">Riwayat Absensi Tahun {tahun}</div>
            <AbsensiGridPerBarisBulan absensi={data.absensi ?? data} maxCol={3} maxRow={3} bulanPerBaris={bulanPerBaris} />
        </div>
    );
};
