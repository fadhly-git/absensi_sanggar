import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { SharedData } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import { Github, LogIn, } from "lucide-react";

export default function LandingPage() {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col transition-colors">
            <Head>
                <title>Home</title>
                <meta name="description" content="Ngelaras App - Platform manajemen siswa Sanggar Tari Ngesti Laras Budaya." />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta property="og:title" content="Ngelaras App - Landing Page" />
                <meta property="og:description" content="Platform manajemen Sanggar Tari Ngesti Laras Budaya." />
                <meta property="og:image" content="/images/landing-page-preview.png" />
                <meta property="og:url" content="https://ngelaras.app" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Ngelaras App - Landing Page" />
                <meta name="twitter:description" content="Platform manajemen siswa Sanggar Tari Ngesti Laras Budaya." />
            </Head>
            {/* Navbar */}
            <header className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2 font-bold text-lg md:text-xl text-blue-700 dark:text-blue-200">
                    <span className="inline-block bg-blue-600 text-white rounded-md px-2 py-1 text-lg dark:bg-blue-800">Ngelaras</span>
                    <span>App</span>
                </div>
                <div className="flex gap-2 items-center">
                    <ModeToggle />
                    <Button asChild >
                        {auth.user ? (
                            <Link href={route('siswa.dashboard')} className="flex items-center">
                                <LogIn className="w-4 h-4 mr-2" />
                                Masuk
                            </Link>
                        ) : (
                            <Link href={route('login')} className="flex items-center">
                                <LogIn className="w-4 h-4 mr-2" />
                                Login
                            </Link>
                        )}
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col justify-center items-center text-center px-4">
                <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-500 dark:from-blue-300 dark:to-indigo-400 bg-clip-text text-transparent mb-4">
                    Selamat Datang di <span className="inline-block bg-blue-600 text-white rounded-md px-2 py-1 dark:bg-blue-800 text-4xl md:text-6xl">Ngelaras</span> App
                </h1>
                <p className="max-w-xl text-gray-600 dark:text-gray-300 text-base lg:text-lg mb-8 flex flex-col items-center text-wrap text-justify" style={{
                    textIndent: '2em',
                }}>
                    Platform manajemen Sanggar Tari Ngesti Laras Budaya (Ngelaras). Didesain untuk kemudahan. Ngelaras App membantu sekolah Indonesia menjadi lebih digital dan efisien.
                </p>
                <div className="flex gap-4 justify-center mb-12">
                    <Button asChild size="lg">
                        {auth.user ? (
                            <Link href={route('siswa.dashboard')} className="flex items-center">
                                <LogIn className="w-4 h-4 mr-2" />
                                Masuk
                            </Link>
                        ) : (
                            <Link href={route('login')} className="flex items-center">
                                <LogIn className="w-4 h-4 mr-2" />
                                Coba Sekarang
                            </Link>
                        )}
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <a href="https://github.com/fadhly-git/absensi_sanggar" target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            GitHub
                        </a>
                    </Button>
                </div>
            </main>

            {/* Footer */}
            <footer id="about" className="bg-blue-50 dark:bg-gray-900 border-t border-blue-100 dark:border-gray-800 py-8 mt-10">
                <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
                    <div className="text-center md:text-left">
                        <div className="font-bold text-blue-700 dark:text-blue-200 mb-2">Tentang</div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm max-w-xs">
                            <span className="inline-block bg-blue-600 text-white rounded-md px-1 py-1/2 dark:bg-blue-800">Ngelaras</span> App adalah platform open-source untuk membantu anda menjadi lebih digital dan efisien.
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 text-center md:text-left">
                        <div className="font-bold text-blue-700 dark:text-blue-200 mb-2">Kontak</div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm break-all">Email: <a href="mailto:hallo@fadh.my.id?subject=Ajakan%20Kolaborasi%20Proyek%20%E2%80%93%20[Nama%20Proyek%20atau%20Jenis%20Proyek]&body=Halo%20Fadhly%2C%0A%0ASaya%20harap%20email%20ini%20menemui%20Anda%20dalam%20keadaan%20baik.%0A%0APerkenalkan%2C%20saya%20[Nama%20Anda]%20dari%20[Perusahaan%2FKomunitas%20Anda]%2C%20dan%20saat%20ini%20sedang%20menginisiasi%20sebuah%20proyek%20[sebutkan%20jenis%20proyek]%20yang%20direncanakan%20akan%20dimulai%20dalam%20waktu%20dekat.%20Berdasarkan%20keahlian%20dan%20rekam%20jejak%20Anda%20di%20bidang%20[bidang%20terkait]%2C%20saya%20berharap%20dapat%20mengajak%20Anda%20untuk%20berkolaborasi%20dalam%20proyek%20ini.%0A%0A==%20Detail%20Proyek%20==%0A-%20Nama%20Proyek%3A%20[Nama%20atau%20Deskripsi%20Singkat]%0A-%20Jenis%20Proyek%3A%20[Website%2C%20Mobile%20App%2C%20API%2C%20dll.]%0A-%20Teknologi%20yang%20Digunakan%3A%20[React%2C%20Laravel%2C%20Next.js%2C%20PostgreSQL%2C%20dll.]%0A-%20Deskripsi%20Singkat%3A%20[Uraikan%20tujuan%20utama%20proyek]%0A%0A==%20Informasi%20Tambahan%20==%0A-%20Estimasi%20Durasi%3A%20[contoh%3A%202%20bulan%2C%20Juli%E2%80%93Agustus%202025]%0A-%20Target%20Mulai%3A%20[contoh%3A%20Awal%20Juli%202025]%0A-%20Perkiraan%20Waktu%20Kerja%20per%20Minggu%3A%20[contoh%3A%2010%E2%80%9315%20jam]%0A-%20Metode%20Kolaborasi%3A%20[Remote%2FFleksibel%2FKanban-based]%0A-%20Skema%20Kompensasi%3A%20[contoh%3A%20rate%20per%20jam%2C%20bagi%20hasil%2C%20dll.]%0A%0A%0AJika%20Anda%20berkenan%2C%20saya%20sangat%20terbuka%20untuk%20menjadwalkan%20diskusi%20singkat%20melalui%20[Zoom%2C%20WhatsApp%2C%20Telegram]%20sesuai%20kenyamanan%20Anda.%20Silakan%20sampaikan%20jadwal%20yang%20cocok.%0A%0ATerima%20kasih%20atas%20perhatian%20dan%20waktunya.%0A%0ASalam%20hangat%2C%0A[Nama%20Lengkap%20Anda]%0A[No%20WA%2FLinkedIn%2FEmail%20Anda]">hallo@fadh.my.id</a></p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">GitHub: <a href="https://github.com/fadhly-git/absensi_sanggar" className="underline text-blue-700 dark:text-blue-300">NgelarasApp</a></p>
                    </div>
                </div>
                <div className="text-center text-gray-400 dark:text-gray-500 text-xs mt-8">
                    &copy; {new Date().getFullYear()} Ngesti Laras Budaya. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

