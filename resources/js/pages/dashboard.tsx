// ...existing code...
import React from 'react';
import { SectionCards } from '@/components/section-card';
import { SessionStatus } from '@/components/session-status';
import { DebugAuth } from '@/components/debug-auth';
import AppLayout from '@/layouts/app-layout';
import { useAuth } from '@/hooks/useAuth';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@/services/dashboardApi';
import { Button } from '@/components/ui/button';
import { useExportAbsensi } from '@/hooks/useAbsensi';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { User, Calendar, TrendingUp, DownloadCloud, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function ExportButton() {
    const exportAbsensi = useExportAbsensi();
    const now = new Date();
    const periode = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    return (
        <Button variant="outline" size="sm" onClick={() => exportAbsensi.mutate({ periode, mode: 'bulan' })} disabled={exportAbsensi.isLoading}>
            <DownloadCloud className="mr-2 h-4 w-4" /> Export
        </Button>
    );
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('atmin.dashboard'),
    },
];

export default function Dashboard() {
    const { loading: authLoading, isAuthenticated } = useAuth();

    // Fetch single source of truth for dashboard summary
    const { data: summaryData, isLoading, refetch } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: fetchDashboardSummary,
        enabled: !authLoading && isAuthenticated,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 401) return false;
            return failureCount < 3;
        },
        staleTime: 5 * 60 * 1000,
    });

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
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
                        onClick={() => (window.location.href = '/login')}
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
            <div className="flex flex-1 flex-col gap-6 px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Main summary + charts */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold">Overview</h1>
                                    <p className="text-sm text-muted-foreground">Ringkasan aktivitas dan metrik penting</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-2">
                                            <ExportButton />
                                        </div>
                                    <Button variant="ghost" onClick={() => refetch()} size="sm"><RefreshCw className="h-4 w-4" /></Button>
                                </div>
                            </div>

                            {/* Summary cards */}
                            <SectionCards summary={summaryData} isLoading={isLoading} />

                            {/* Top stats row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                {isLoading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="border rounded-lg p-4 bg-background">
                                            <Skeleton className="h-6 w-24 mb-2" />
                                            <Skeleton className="h-6 w-12" />
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="border rounded-lg p-4 bg-background flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-muted/40"><User className="h-5 w-5" /></div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Total Siswa</div>
                                                <div className="text-lg font-semibold">{summaryData?.total_siswa ?? '—'}</div>
                                            </div>
                                        </div>

                                        <div className="border rounded-lg p-4 bg-background flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-muted/40"><TrendingUp className="h-5 w-5" /></div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Siswa Aktif</div>
                                                <div className="text-lg font-semibold">{summaryData?.siswa_aktif ?? '—'}</div>
                                            </div>
                                        </div>

                                        <div className="border rounded-lg p-4 bg-background flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-muted/40"><Calendar className="h-5 w-5" /></div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Berangkat (Minggu Ini)</div>
                                                <div className="text-lg font-semibold">{summaryData?.siswa_berangkat?.minggu_ini ?? '—'}</div>
                                            </div>
                                        </div>

                                        <div className="border rounded-lg p-4 bg-background flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-muted/40"><Calendar className="h-5 w-5" /></div>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Berangkat (Minggu Lalu)</div>
                                                <div className="text-lg font-semibold">{summaryData?.siswa_berangkat?.minggu_lalu ?? '—'}</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Interactive chart */}
                            <div className="bg-card border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-sm font-medium">Trend Absensi Mingguan</h2>
                                    <div className="text-xs text-muted-foreground">Realtime</div>
                                </div>
                                <ChartAreaInteractive />
                            </div>

                            {/* Quick actions */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <Link href={route('atmin.siswa')} className="btn-action rounded-lg p-3 text-center bg-card border">
                                    <div className="font-medium">Siswa</div>
                                    <div className="text-xs text-muted-foreground">Kelola data siswa</div>
                                </Link>
                                <Link href={route('atmin.scan-absensi')} className="btn-action rounded-lg p-3 text-center bg-card border">
                                    <div className="font-medium">Scan Absensi</div>
                                    <div className="text-xs text-muted-foreground">QR Scanner</div>
                                </Link>
                                <Link href={route('atmin.keuangan')} className="btn-action rounded-lg p-3 text-center bg-card border">
                                    <div className="font-medium">Keuangan</div>
                                    <div className="text-xs text-muted-foreground">Rekap & transaksi</div>
                                </Link>
                                <Link href={route('atmin.daftar-hadir')} className="btn-action rounded-lg p-3 text-center bg-card border">
                                    <div className="font-medium">Daftar Hadir</div>
                                    <div className="text-xs text-muted-foreground">Lihat rekap</div>
                                </Link>
                            </div>
                    </div>

                    {/* Right: Activity / quick stats */}
                    <aside className="space-y-4">
                        <div className="bg-card border rounded-lg p-4">
                            <SessionStatus showDetails className="w-full" />
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                            <h3 className="text-sm font-medium mb-2">Quick Stats</h3>
                            <dl className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <dt className="text-muted-foreground">Total Siswa</dt>
                                    <dd className="font-semibold">{summaryData?.total_siswa ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Siswa Aktif</dt>
                                    <dd className="font-semibold">{summaryData?.siswa_aktif ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Berangkat (Minggu Ini)</dt>
                                    <dd className="font-semibold">{summaryData?.siswa_berangkat?.minggu_ini ?? '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Berangkat (Minggu Lalu)</dt>
                                    <dd className="font-semibold">{summaryData?.siswa_berangkat?.minggu_lalu ?? '—'}</dd>
                                </div>
                                <div className="col-span-2">
                                    <dt className="text-muted-foreground">Saldo Terakhir</dt>
                                    <dd className="font-semibold">{summaryData ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(summaryData.saldo.terakhir) : '—'}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="bg-card border rounded-lg p-4">
                            <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium">Ringkasan Dashboard</div>
                                        <div className="text-xs text-muted-foreground">Terakhir diperbarui</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{new Date().toLocaleString()}</div>
                                </li>
                                <li className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium">Export Mingguan</div>
                                        <div className="text-xs text-muted-foreground">Laporan absensi tersedia</div>
                                    </div>
                                    <div>
                                        <ExportButton />
                                    </div>
                                </li>
                                <li className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium">Validasi Session</div>
                                        <div className="text-xs text-muted-foreground">Periksa status session</div>
                                    </div>
                                    <div>
                                        <Button size="sm" variant="ghost" onClick={() => window.open(route('api.check-session'), '_blank')}>Check</Button>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Debug untuk development */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="bg-card border rounded-lg p-4">
                                <DebugAuth />
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
// ...existing code...
