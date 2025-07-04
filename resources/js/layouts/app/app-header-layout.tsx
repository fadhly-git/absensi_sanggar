import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type PropsWithChildren } from 'react';
import { toast } from 'sonner';

interface FlashProps {
    success?: string;
    error?: string | string[];
}

export default function AppHeaderLayout({ children, breadcrumbs }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
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
        <AppShell>
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
