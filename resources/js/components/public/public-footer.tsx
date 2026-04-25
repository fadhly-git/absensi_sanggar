import { Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import AppLogoIcon from '@/components/app-logo-icon';
import { Facebook, Instagram, Youtube, Twitter, Music2, MessageCircle } from 'lucide-react';

interface SocialLink {
    platform: string;
    url: string;
}

const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/about-us', label: 'Tentang Kami' },
    { href: '/gallery', label: 'Galeri' },
    { href: '/news', label: 'Artikel' },
    { href: '/contact', label: 'Kontak Kami' },
];

const socialIcons: Record<string, React.ReactNode> = {
    facebook: <Facebook className="h-4 w-4" />,
    instagram: <Instagram className="h-4 w-4" />,
    youtube: <Youtube className="h-4 w-4" />,
    twitter: <Twitter className="h-4 w-4" />,
    tiktok: <Music2 className="h-4 w-4" />,
    whatsapp: <MessageCircle className="h-4 w-4" />,
};

export default function PublicFooter() {
    const { data: socialLinks } = useQuery({
        queryKey: ['public-social-links'],
        queryFn: async () => {
            const response = await axios.get('/api/social-links');
            return response.data.data as SocialLink[];
        },
        staleTime: 1000 * 60 * 10,
    });

    return (
        <footer className="relative border-t border-border/40 bg-background overflow-hidden">
            {/* Golden divider at top */}
            <div className="golden-divider" />

            {/* Decorative pattern */}
            <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />

            <div className="relative container mx-auto max-w-7xl px-4 py-14">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Brand */}
                    <div className="space-y-5">
                        <Link href="/" className="group inline-flex items-center gap-2.5">
                            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
                                <AppLogoIcon className="size-6 fill-current text-primary-foreground" />
                            </div>
                            <span className="golden-text font-bold text-lg tracking-tight">
                                Ngesti Laras Budaya
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Sanggar tari tradisional yang berdedikasi melestarikan seni budaya Nusantara melalui pendidikan dan pertunjukan.
                        </p>
                        {/* Social Links */}
                        {socialLinks && socialLinks.length > 0 && (
                            <div className="flex gap-2.5 pt-1">
                                {socialLinks.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                                        title={link.platform}
                                    >
                                        {socialIcons[link.platform] ?? null}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="section-label mb-5">Navigasi</h3>
                        <ul className="space-y-2.5">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                    >
                                        <span className="h-px w-0 bg-primary transition-all duration-200 group-hover:w-3" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Info */}
                    <div>
                        <h3 className="section-label mb-5">Informasi</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-primary/60 shrink-0" />
                                Meteseh, Kec. Boja
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-primary/60 shrink-0" />
                                Kabupaten Kendal, Jawa Tengah
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground/70">
                        © {new Date().getFullYear()} Ngesti Laras Budaya. All rights reserved.
                    </p>
                    <p className="text-xs text-muted-foreground/50">
                        Pelestari Seni Budaya Nusantara
                    </p>
                </div>
            </div>
        </footer>
    );
}
