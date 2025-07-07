import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { CameraIcon, CircleDollarSignIcon, DatabaseZap, FileUser, FingerprintIcon, Layout } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: 'atmin.dashboard',
        icon: Layout,
    },
    {
        title: 'Siswa',
        url: 'atmin.siswa',
        icon: FileUser,
    },
    {
        title: 'Daftar Hadir',
        url: 'atmin.daftar-hadir',
        icon: FingerprintIcon,
    },
    {
        title: 'Scan QR Absensi',
        url: 'atmin.scan-absensi',
        icon: CameraIcon,
    },
    {
        title: 'keuangan',
        url: 'atmin.keuangan',
        icon: CircleDollarSignIcon,
    },
    {
        title: 'System Cache Clear',
        url: 'atmin.system.clear-cache',
        icon: DatabaseZap,
    },
];

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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
