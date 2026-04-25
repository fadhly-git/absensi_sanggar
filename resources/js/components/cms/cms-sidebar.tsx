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
    FileText,
    Image,
    Folder,
    Calendar,
    Settings,
    Mail,
    Home,
    Users,
} from 'lucide-react';
import AppLogo from '../app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: route('atmin.cms.dashboard'),
        icon: Layout,
    },
    {
        title: 'Halaman',
        url: route('atmin.cms.pages.index'),
        icon: Home,
    },
    {
        title: 'Artikel & Berita',
        url: route('atmin.cms.posts.index'),
        icon: FileText,
    },
    {
        title: 'Kategori',
        url: route('atmin.cms.categories.index'),
        icon: Folder,
    },
    {
        title: 'Gallery',
        url: route('atmin.cms.gallery.index'),
        icon: Image,
    },
    {
        title: 'Events',
        url: route('atmin.cms.events.index'),
        icon: Calendar,
    },
    {
        title: 'Pesan Kontak',
        url: route('atmin.cms.contact-messages.index'),
        icon: Mail,
    },
    {
        title: 'Pengaturan',
        url: route('atmin.cms.settings.index'),
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'ke Dashboard Utama',
        url: route('atmin.dashboard'),
        icon: Users,
    }
];

export function CMSSidebar() {
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('atmin.cms.dashboard')} prefetch>
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
