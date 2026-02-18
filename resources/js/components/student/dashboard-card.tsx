// resources/js/components/student/dashboard-card.tsx
import { cn } from '@/lib/utils';

interface DashboardCardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export function DashboardCard({ children, className, noPadding = false }: DashboardCardProps) {
    return (
        <section
            className={cn(
                'bg-card text-card-foreground w-full min-w-0 flex-1 rounded-xl border shadow-sm',
                !noPadding && 'p-6',
                className
            )}
        >
            {children}
        </section>
    );
}
