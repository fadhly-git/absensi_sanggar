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
    errors?: string | string[];
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: AppSidebarLayoutProps) {
    const { props } = usePage();
    const { success, errors } = (props.flash ?? {}) as FlashProps;

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
        if (errors) {
            const errorMessage = Array.isArray(errors) ? errors.join(', ') : errors;
            toast.error(errorMessage, {
                duration: 5000,
                icon: '❌',
                style: {
                    background: '#f8d7da',
                    color: '#721c24',
                },
            });
        }

    }, [success, errors]);
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
