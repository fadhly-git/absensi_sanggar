import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-dash';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

interface AppSidebarLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: AppSidebarLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <Toaster />
                {children}
            </AppContent>
        </AppShell>
    );
}
