import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-dash';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type PropsWithChildren } from 'react';
import { toast, Toaster } from 'sonner';

interface AppSidebarLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

interface FlashProps {
    success?: string;
    error?: string | string[];
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: AppSidebarLayoutProps) {
    const { props } = usePage();
    const { success, error } = (props.flash ?? {}) as FlashProps;

    useEffect(() => {
        if (success) {
            toast.success(success, {
                duration: 5000,
                icon: '✅',
                style: {
                    background: '#f0f4f8',
                    color: '#333',
                },
            });
        }
        if (error) {
            const errorMessage = Array.isArray(error) ? error.join(', ') : error;
            toast.error(errorMessage, {
                duration: 5000,
                icon: '❌',
                style: {
                    background: '#f8d7da',
                    color: '#721c24',
                },
            });
        }

    }, [success, error]);
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
