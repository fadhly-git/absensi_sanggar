/* eslint-disable @typescript-eslint/no-explicit-any */
import { DebugAuth } from '@/components/debug-auth'; // Import debug component
import StudentLayout from '@/layouts/student-layout';
import { useAuth } from '@/hooks/useAuth';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { useSiswaById } from '@/hooks/useSiswa';
import { Siswa } from '@/types/siswa';
import { Calendar1, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useAbsensiRiwayat } from '@/hooks/useAbsensiRiwayat';
import { AbsensiGridPerBarisBulan } from './absensi-perbulan';


export default function Dashboard() {
    const { loading: authLoading, isAuthenticated } = useAuth();
    const page = usePage<SharedData>();
    const { auth } = page.props;
    // Ambil data siswa berdasarkan ID dari auth
    const { data: siswaData } = useSiswaById(auth.user.id);
    console.log('Dashboard siswaData:', siswaData);

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
            <div className="flex flex-1 flex-col px-4">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    {/* --------- Start: Layout baru agar mirip GitHub Profile --------- */}
                    <div className="w-full flex flex-col lg:flex-row gap-2 py-8 max-w-7xl mx-auto">
                        {/* Sidebar */}
                        <div className="lg:w-1/3 w-full flex flex-col gap-2">
                            <ProfileSidebar data={siswaData} />
                        </div>
                        {/* Main content */}
                        <div className="lg:w-2/3 w-full flex flex-col gap-2">
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
    console.log('ProfileSidebar data:', data?.nama);
    const editProfile = true; // Ganti true jika user bisa edit profil
    const getInitials = useInitials();

    return (
        <aside className="bg-background border border-accent-foreground rounded-xl p-6 flex flex-col items-center w-full max-w-xl mx-auto lg:mx-0 shadow-sm min-h-[450px]">
            <div className="relative">
                <Avatar className="rounded-full border-4 border-[#23272e] w-40 h-40 object-cover">
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white text-4xl font-extrabold">
                        {getInitials(data?.nama ?? '')}
                    </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-3 right-3 bg-green-500 border-2 border-accent-foreground rounded-full w-6 h-6 block"></span>
            </div>
            <h2 className="mt-6 text-2xl font-bold capitalize">{data?.nama}</h2>
            <div className="text-gray-600 dark:text-gray-200 text-sm flex items-start gap-1">
                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2 capitalize">{data?.alamat}</span>
            </div>
            <div className="w-full">
                <div>
                    <span className="block text-xs text-gray-400 dark:text-gray-300">Status</span>
                    <Badge
                        variant={data?.status ? "default" : "secondary"}
                        className={
                            data?.status
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200"
                                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200"
                        }
                    >
                        {data?.status ? 'Aktif' : 'Tidak Aktif'}
                    </Badge>
                </div>
                <div>
                    <span className="block text-xs text-gray-400 dark:text-gray-300">Statistik Absensi</span>
                    <span className="text-gray-600 dark:text-gray-200 text-sm">
                        Total: {data?.total_absensi ?? "-"} | Bulan ini: {data?.absensi_bulan_ini ?? "-"}
                    </span>
                </div>
                <div>
                    <span className="block text-xs text-gray-400 dark:text-gray-300">Terdaftar</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                        <Calendar1 className="h-3 w-3" />
                        {data?.tanggal_terdaftar
                            ? formatDistanceToNow(new Date(data.tanggal_terdaftar), {
                                addSuffix: true,
                                locale: localeId
                            })
                            : '-'
                        }
                    </span>
                </div>
            </div>
            {editProfile && (
                <Button variant={'outline'} className="mt-4 w-full hover:bg-primary hover:text-secondary" onClick={() => window.location.href = route('profile.edit')}>
                    Edit profile
                </Button>
            )}
        </aside>
    );
};

const DashboardCard = ({ children }: { children: React.ReactNode }) => (
    <section className="bg-background border border-accent-foreground rounded-xl p-7 flex-1 min-w-0 w-full shadow-sm">
        {children}
    </section>
);

// --------- END Tambahan layout ---------

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('siswa.dashboard'),
    },
];



const MainPage = ({ userId }: { userId: number }) => {
    const tahun = new Date().getFullYear();
    const { data, isLoading } = useAbsensiRiwayat(userId, "tahun", 7, tahun);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
    if (!data) return <div>Tidak ada data absensi.</div>;
    return (
        <div className="relative flex flex-col gap-4">
            {/* Mirip style README card di gambar */}
            <div className="font-bold mb-2">Riwayat Absensi Tahun {tahun}</div>
            <AbsensiGridPerBarisBulan absensi={data.absensi ?? data} maxCol={3} maxRow={2} bulanPerBaris={3} />
            {/* Section untuk Technologies & Tools bisa ditambah di sini */}
        </div>
    )
}