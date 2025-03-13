import { ThemeProvider } from '@/components/theme-provider';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    onMonthChange: (month: string) => void;
}

export default ({ children, breadcrumbs, onMonthChange, ...props }: AppLayoutProps) => (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AppLayoutTemplate onMonthChange={onMonthChange} breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    </ThemeProvider>
);
