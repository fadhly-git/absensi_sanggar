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
                // Hapus objek style, biarkan className yang bekerja
                className: 'my-success-toast',
            });
        }
        if (error) {
            const errorMessage = Array.isArray(error) ? error.join(', ') : error;
            toast.error(errorMessage, {
                duration: 5000,
                className: 'my-error-toast',
            });
        }
    }, [success, error]);

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="text-primary">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {/* Tambahkan richColors dan theme agar sinkron dengan sistem */}
                <Toaster richColors closeButton theme="system" />
                {children}
            </AppContent>
        </AppShell>
    );
}
