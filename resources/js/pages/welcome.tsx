import { Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCheck, Users, Wallet } from 'lucide-react';

// Definisikan tipe props yang diterima dari Laravel
interface WelcomeProps {
    canLogin: boolean;
    canRegister: boolean;
    laravelVersion: string;
    phpVersion: string;
}

export default function Welcome({ canLogin, canRegister }: WelcomeProps) {
    return (
        <>
            <Head title="Selamat Datang" />
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header Navigasi */}
                <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                        <Link href="/" className="flex items-center gap-2">
                            {/* Ganti dengan Logo Sanggar Anda jika ada */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                                <path d="m9 12 2 2 4-4"/>
                            </svg>
                            <span className="font-bold">Sanggar App</span>
                        </Link>
                        <nav className="flex items-center gap-4">
                            {canLogin && (
                                <Link href={route('login')}>
                                    <Button variant="outline">Login</Button>
                                </Link>
                            )}
                            {canRegister && (
                                <Link href={route('register')}>
                                    <Button>Register</Button>
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-800/50">
                        <div className="container mx-auto px-4 text-center">
                            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-gray-900 dark:text-gray-50">
                                Sistem Manajemen Sanggar
                            </h1>
                            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                                Kelola data siswa, absensi, dan keuangan sanggar Anda dengan mudah di satu tempat yang terpusat dan modern.
                            </p>
                            <div className="mt-8 flex justify-center gap-4">
                                <Link href={route('login')}>
                                    <Button size="lg">Mulai Kelola</Button>
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Fitur Section */}
                    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
                        <div className="container mx-auto px-4">
                            <div className="mx-auto max-w-3xl text-center">
                                <h2 className="text-3xl font-bold tracking-tight">Fitur Unggulan</h2>
                                <p className="mt-4 text-gray-500 dark:text-gray-400">
                                    Semua yang Anda butuhkan untuk menjalankan administrasi sanggar secara efisien.
                                </p>
                            </div>
                            <div className="mt-12 grid gap-8 md:grid-cols-3">
                                <Card>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <Users className="h-8 w-8 text-primary" />
                                        <CardTitle>Manajemen Siswa</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Catat dan kelola semua data siswa aktif maupun non-aktif dengan mudah.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <BookCheck className="h-8 w-8 text-primary" />
                                        <CardTitle>Absensi Digital</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Lakukan absensi secara digital dan lihat rekap laporannya secara otomatis.
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <Wallet className="h-8 w-8 text-primary" />
                                        <CardTitle>Rekap Keuangan</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Monitor pemasukan, pengeluaran, dan saldo sanggar secara transparan.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="py-6 border-t dark:border-gray-800">
                    <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                        © {new Date().getFullYear()} Sanggar App. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}