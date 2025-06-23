import { SectionCards } from '@/components/section-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@/services/dashboardApi';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];

export default function Dashboard() {
    // Mengambil semua data untuk dashboard dengan satu query
    const { data: summaryData, isLoading } = useQuery({
        queryKey: ['dashboardSummary'], // Kunci unik untuk query ini
        queryFn: fetchDashboardSummary, // Fungsi API yang akan dijalankan
    });

    // useEffect untuk token sudah dihapus dari sini sesuai rekomendasi sebelumnya.

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        {/* Kirim data dan status loading ke komponen SectionCards.
                          Ini membuat SectionCards menjadi 'presentational component' yang
                          fokusnya hanya untuk tampilan.
                        */}
                        <SectionCards summary={summaryData} isLoading={isLoading} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}