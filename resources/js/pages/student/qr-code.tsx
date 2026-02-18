import { useAuth } from '@/hooks/useAuth';
import StudentLayout from '@/layouts/student-layout';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Download, QrCode, User, Sparkles, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `/storage/${auth.user.siswas.qrcode_path}`;
        link.download = `QR-Code-${auth.user.name.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
                <div className="text-center">
                    <div className="relative mx-auto mb-4 h-16 w-16">
                        <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <QrCode className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Memuat QR Code...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-destructive/10 p-4">
                                <User className="h-12 w-12 text-destructive" />
                            </div>
                        </div>
                        <CardTitle className="mb-3 text-center">Belum Terautentikasi</CardTitle>
                        <CardDescription className="mb-6 text-center">
                            Silakan login terlebih dahulu untuk mengakses halaman ini.
                        </CardDescription>
                        <Button
                            onClick={() => (window.location.href = '/login')}
                            className="w-full"
                            size="lg"
                        >
                            Pergi ke Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="QR Code Siswa" />
            <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-background via-muted/30 to-muted/50 px-4 py-12">
                <div className="mx-auto max-w-4xl">
                    {/* Header Section */}
                    <div className="mb-8 text-center">
                        <Badge variant="secondary" className="mb-4 gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>QR Code Pribadi</span>
                        </Badge>
                        <h1 className="mb-3 text-4xl font-bold">QR Code Absensi</h1>
                        <p className="text-lg text-muted-foreground">Gunakan QR code ini untuk mencatat kehadiran Anda</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* QR Code Card */}
                        <div className="md:col-span-2">
                            <Card className="overflow-hidden shadow-lg transition-shadow hover:shadow-xl">
                                <CardHeader className="border-b bg-primary text-primary-foreground">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-primary-foreground/20 p-2">
                                            <QrCode className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle>{auth.user.name}</CardTitle>
                                            <CardDescription className="text-primary-foreground/80">
                                                Siswa Sanggar
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-8">
                                    <div className="flex justify-center">
                                        <div className="relative">
                                            {/* Decorative corners */}
                                            <div className="absolute -left-2 -top-2 h-12 w-12 rounded-tl-lg border-l-4 border-t-4 border-primary"></div>
                                            <div className="absolute -right-2 -top-2 h-12 w-12 rounded-tr-lg border-r-4 border-t-4 border-primary"></div>
                                            <div className="absolute -bottom-2 -left-2 h-12 w-12 rounded-bl-lg border-b-4 border-l-4 border-primary"></div>
                                            <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-br-lg border-b-4 border-r-4 border-primary"></div>

                                            {/* QR Code */}
                                            <div className="rounded-xl border-4 border-muted bg-card p-4 shadow-md">
                                                <img
                                                    src={`/storage/${auth.user.siswas.qrcode_path}`}
                                                    alt={`QR Code ${auth.user.name}`}
                                                    className="h-64 w-64 object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-center">
                                        <Button onClick={handleDownload} size="lg" className="gap-2">
                                            <Download className="h-5 w-5" />
                                            Unduh QR Code
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Info Card */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Cara Penggunaan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="space-y-3 text-sm text-muted-foreground">
                                        <li className="flex gap-3">
                                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                1
                                            </span>
                                            <span>Tunjukkan QR code ini kepada petugas absensi</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                2
                                            </span>
                                            <span>Petugas akan melakukan scan menggunakan aplikasi</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                3
                                            </span>
                                            <span>Kehadiran Anda akan tercatat secara otomatis</span>
                                        </li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-900/50 dark:from-amber-950/20 dark:to-orange-950/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Info className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                                        Tips Penting
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 text-amber-500">•</span>
                                            <span>Pastikan QR code terlihat jelas dan tidak buram</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 text-amber-500">•</span>
                                            <span>Simpan screenshot untuk akses offline</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 text-amber-500">•</span>
                                            <span>Jangan bagikan QR code kepada orang lain</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
