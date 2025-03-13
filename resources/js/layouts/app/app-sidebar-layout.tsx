import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

interface AppSidebarLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
    onMonthChange: (month: string) => void;
}

export default function AppSidebarLayout({ children, breadcrumbs = [], onMonthChange }: AppSidebarLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} onMonthChange={onMonthChange} />
                {children}
            </AppContent>
        </AppShell>
    );
}
