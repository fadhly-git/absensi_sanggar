import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function UnderConstruction() {
    const { auth } = usePage<SharedData>().props;
    const [progress, setProgress] = useState(0);
    const [blocks, setBlocks] = useState([]);

    useEffect(() => {
        // Smooth progress animation
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 50) return 50;
                return prev + 1;
            });
        }, 30);

        // Generate animated blocks
        const blockInterval = setInterval(() => {
            setBlocks((prev) => {
                const newBlocks = [...prev];
                if (newBlocks.length > 15) newBlocks.shift();

                newBlocks.push({
                    id: Date.now(),
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    size: Math.random() * 60 + 40,
                    rotation: Math.random() * 360,
                    duration: Math.random() * 3 + 2,
                });

                return newBlocks;
            });
        }, 800);

        return () => {
            clearInterval(progressInterval);
            clearInterval(blockInterval);
        };
    }, []);

    return (
        <>
            <Head title="Under Construction" />

            <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
                {/* Animated Background Grid */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                             linear-gradient(to bottom, #000 1px, transparent 1px)`,
                            backgroundSize: '60px 60px',
                        }}
                    />
                </div>

                {/* Abstract Geometric Animation */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {blocks.map((block) => (
                        <div
                            key={block.id}
                            className="absolute opacity-0"
                            style={{
                                left: `${block.x}%`,
                                top: `${block.y}%`,
                                width: `${block.size}px`,
                                height: `${block.size}px`,
                                animation: `fadeInOut ${block.duration}s ease-in-out forwards`,
                                animationDelay: '0s',
                            }}
                        >
                            <div
                                className="h-full w-full border-2 border-orange-500/20"
                                style={{
                                    transform: `rotate(${block.rotation}deg)`,
                                    borderRadius:
                                        Math.random() > 0.5 ? '0' : '50%',
                                }}
                            />
                        </div>
                    ))}

                    {/* Floating Lines */}
                    <svg className="absolute inset-0 h-full w-full">
                        <defs>
                            <linearGradient
                                id="lineGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop
                                    offset="0%"
                                    style={{
                                        stopColor: '#f97316',
                                        stopOpacity: 0,
                                    }}
                                />
                                <stop
                                    offset="50%"
                                    style={{
                                        stopColor: '#f97316',
                                        stopOpacity: 0.3,
                                    }}
                                />
                                <stop
                                    offset="100%"
                                    style={{
                                        stopColor: '#f97316',
                                        stopOpacity: 0,
                                    }}
                                />
                            </linearGradient>
                        </defs>
                        {[...Array(5)].map((_, i) => (
                            <line
                                key={i}
                                x1={`${i * 25}%`}
                                y1="0%"
                                x2={`${i * 25 + 100}%`}
                                y2="100%"
                                stroke="url(#lineGradient)"
                                strokeWidth="2"
                                style={{
                                    animation: `drawLine ${4 + i}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.5}s`,
                                }}
                            />
                        ))}
                    </svg>
                </div>

                <style>{`
          @keyframes fadeInOut {
            0% {
              opacity: 0;
              transform: scale(0.5) translateY(20px);
            }
            50% {
              opacity: 0.15;
              transform: scale(1) translateY(0);
            }
            100% {
              opacity: 0;
              transform: scale(1.2) translateY(-20px);
            }
          }
          @keyframes drawLine {
            0%, 100% {
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
            }
            50% {
              stroke-dasharray: 1000;
              stroke-dashoffset: 0;
            }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }
        `}</style>

                {/* Header */}
                <header className="relative z-20 px-6 py-6 md:px-12 md:py-8">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                                <img
                                    src="/img/logo.png"
                                    alt="Logo"
                                    className="h-6 w-6"
                                />
                            </div>
                            <span className="text-xl font-bold text-slate-900">
                                Ngesti Laras Budaya
                            </span>
                        </div>

                        {auth.user ? (
                            <Link
                                href={
                                    auth.user.role === 'admin' ||
                                    auth.user.role === 'pengurus'
                                        ? route('atmin.dashboard')
                                        : route('siswa.dashboard')
                                }
                                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white px-6 py-2 font-medium text-slate-900 shadow-sm transition-all duration-300 hover:border-orange-500"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Masuk
                                </span>
                                <div className="absolute inset-0 translate-y-full transform bg-gradient-to-r from-orange-500 to-orange-600 transition-transform duration-300 group-hover:translate-y-0" />
                                <span className="absolute inset-0 flex items-center justify-center gap-2 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Masuk
                                </span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white px-6 py-2 font-medium text-slate-900 shadow-sm transition-all duration-300 hover:border-orange-500"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Login
                                </span>
                                <div className="absolute inset-0 translate-y-full transform bg-gradient-to-r from-orange-500 to-orange-600 transition-transform duration-300 group-hover:translate-y-0" />
                                <span className="absolute inset-0 flex items-center justify-center gap-2 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Login
                                </span>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className="relative z-10 px-6 py-12 md:py-20">
                    <div className="mx-auto max-w-5xl">
                        {/* Geometric Construction Icon */}
                        <div className="mb-12 flex justify-center md:mb-16">
                            <div className="relative h-32 w-32 md:h-40 md:w-40">
                                {/* Rotating outer ring */}
                                <div
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-orange-500/30"
                                    style={{
                                        animation: 'spin 20s linear infinite',
                                    }}
                                />

                                {/* Inner geometric shapes */}
                                <div className="absolute inset-4 flex items-center justify-center">
                                    <div className="relative h-full w-full">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute inset-0"
                                                style={{
                                                    animation: `spin ${8 + i * 2}s linear infinite`,
                                                    animationDirection:
                                                        i % 2 === 0
                                                            ? 'normal'
                                                            : 'reverse',
                                                }}
                                            >
                                                <div
                                                    className="absolute h-8 w-8 border-2 border-orange-500/40"
                                                    style={{
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-200%)`,
                                                        borderRadius:
                                                            i % 2 === 0
                                                                ? '0'
                                                                : '50%',
                                                    }}
                                                />
                                            </div>
                                        ))}

                                        {/* Center square */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                                                <svg
                                                    className="h-6 w-6 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div
                            className="mb-16 space-y-6 text-center"
                            style={{ animation: 'slideIn 0.8s ease-out' }}
                        >
                            <div className="inline-block rounded-full border border-orange-100 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600">
                                Coming Soon
                            </div>

                            <h1 className="text-5xl font-bold tracking-tight text-slate-900 md:text-7xl">
                                Under Construction
                            </h1>

                            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
                                We're building something exceptional. Our new
                                platform will be ready soon with enhanced
                                features and improved performance.
                            </p>
                        </div>

                        {/* Progress Section */}
                        <div
                            className="mx-auto mb-16 max-w-2xl"
                            style={{
                                animation:
                                    'slideIn 0.8s ease-out 0.2s backwards',
                            }}
                        >
                            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">
                                        Development Progress
                                    </span>
                                    <span className="text-2xl font-bold text-orange-600">
                                        {progress}%
                                    </span>
                                </div>

                                <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 ease-out"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                                            style={{
                                                animation:
                                                    'shimmer 2s infinite',
                                                backgroundSize: '200% 100%',
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                                            <svg
                                                className="h-5 w-5 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-medium text-slate-600">
                                            Design
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                            <svg
                                                className="h-5 w-5 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-medium text-slate-600">
                                            Development
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                                            <svg
                                                className="h-5 w-5 text-slate-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-medium text-slate-600">
                                            Testing
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature Cards */}
                        <div
                            className="mb-16 grid gap-6 md:grid-cols-3"
                            style={{
                                animation:
                                    'slideIn 0.8s ease-out 0.4s backwards',
                            }}
                        >
                            <div className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:border-orange-500 hover:shadow-md">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 transition-transform duration-300 group-hover:scale-110">
                                    <svg
                                        className="h-6 w-6 text-orange-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    High Performance
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Optimized for speed and efficiency with
                                    modern architecture.
                                </p>
                            </div>

                            <div className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:border-orange-500 hover:shadow-md">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 transition-transform duration-300 group-hover:scale-110">
                                    <svg
                                        className="h-6 w-6 text-orange-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Secure & Reliable
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Enterprise-grade security with robust data
                                    protection.
                                </p>
                            </div>

                            <div className="group flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:border-orange-500 hover:shadow-md">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 transition-transform duration-300 group-hover:scale-110">
                                    <svg
                                        className="h-6 w-6 text-orange-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                    Modern Design
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Clean interface with intuitive user
                                    experience.
                                </p>
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div
                            className="text-center"
                            style={{
                                animation:
                                    'slideIn 0.8s ease-out 0.6s backwards',
                            }}
                        >
                            <p className="mb-4 text-slate-600">
                                Questions about our launch?
                            </p>
                            <a
                                href="mailto:info@ngelaras.my.id"
                                className="inline-flex items-center gap-2 font-medium text-orange-600 transition-colors hover:text-orange-700"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                Get in touch
                            </a>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 border-t border-slate-200 bg-white/50 px-6 py-8 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl text-center text-sm text-slate-500">
                        <p>
                            © {new Date().getFullYear()} Ngesti Laras Budaya.
                            All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
