import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

const navLinks = [
    { href: '/', label: 'Beranda', name: 'home' },
    { href: '/about-us', label: 'Tentang Kami', name: 'about-us' },
    { href: '/gallery', label: 'Galeri', name: 'gallery' },
    { href: '/news', label: 'Artikel', name: 'news' },
    { href: '/contact', label: 'Kontak Kami', name: 'contact' },
];

export default function PublicNavbar() {
    const { url } = usePage();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (href: string) => {
        if (href === '/') return url === '/';
        return url.startsWith(href);
    };

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-500 ${scrolled
                ? 'border-b border-primary/20 bg-background/80 backdrop-blur-xl shadow-lg shadow-primary/5'
                : 'border-b border-border/20 bg-background/60 backdrop-blur-md'
                }`}
        >
            <div className="container mx-auto max-w-7xl px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-2.5">
                        <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
                            <AppLogoIcon className="size-5 fill-current text-primary-foreground" />
                        </div>
                        <span className="golden-text font-bold text-base tracking-tight">
                            Ngesti Laras Budaya
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-0.5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`relative inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${isActive(link.href)
                                    ? 'text-primary'
                                    : 'text-foreground/70 hover:text-foreground hover:bg-accent/50'
                                    }`}
                            >
                                {link.label}
                                {isActive(link.href) && (
                                    <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary animate-scale-in" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg text-foreground/70 hover:text-foreground hover:bg-accent/50 transition-colors"
                        aria-label="Menu"
                    >
                        <div className="relative w-5 h-4 flex flex-col justify-between">
                            <span className={`block h-0.5 w-full rounded-full bg-current transition-all duration-300 origin-center ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                            <span className={`block h-0.5 w-full rounded-full bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-0' : ''}`} />
                            <span className={`block h-0.5 w-full rounded-full bg-current transition-all duration-300 origin-center ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="border-t border-border/30 bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive(link.href)
                                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground border-l-2 border-transparent'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
}
