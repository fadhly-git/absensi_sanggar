import { type ReactNode } from 'react';
import PublicNavbar from '@/components/public/public-navbar';
import PublicFooter from '@/components/public/public-footer';

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="dark min-h-screen flex flex-col bg-background text-foreground">
            <PublicNavbar />
            <main className="flex-1">
                {children}
            </main>
            <PublicFooter />
        </div>
    );
}
