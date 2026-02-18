import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Layout,
    Users,
    User,
    CalendarCheck,
    QrCode,
    CreditCard,
    Tag,
    Package,
    ShoppingCart,
    RefreshCw,
    Receipt,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: route('atmin.dashboard'),
        icon: Layout,
    },
    {
        title: 'Siswa Management',
        icon: Users,
        url: route('atmin.siswa'),
        items: [
            {
                title: 'Siswa',
                url: route('atmin.siswa'),
                icon: User,
            },
            {
                title: 'Daftar Hadir',
                url: route('atmin.daftar-hadir'),
                icon: CalendarCheck,
            },
            {
                title: 'Scan QR Absensi',
                url: route('atmin.scan-absensi'),
                icon: QrCode,
            },
            {
                title: 'Keuangan',
                url: route('atmin.keuangan'),
                icon: CreditCard,
            },
        ],
    },
    {
        title: 'Event',
        url: '',
        icon: Tag,
        items: [
            {
                title: 'Produk Event',
                url: route('atmin.event.products'),
                icon: Package,
            },
            {
                title: 'Pesanan',
                url: route('atmin.event.orders'),
                icon: ShoppingCart,
            },
            {
                title: 'Bukti Pembayaran',
                url: route('atmin.event.payment-proofs'),
                icon: Receipt,
            }
        ],
    },
    {
        title: 'System Cache Clear',
        url: route('atmin.system.clear-cache'),
        icon: RefreshCw,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('atmin.dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
