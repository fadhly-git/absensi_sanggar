import { ThemeProvider } from '@/components/theme-provider';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-dash';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    </ThemeProvider>
);
