// resources/js/components/atoms/loading-spinner.tsx
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
            <Loader2 className={`${sizeClasses[size]} text-primary animate-spin`} />
            {text && <p className="text-muted-foreground text-sm">{text}</p>}
        </div>
    );
}

export function FullPageLoader({ text = 'Memuat...' }: { text?: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="text-primary h-10 w-10 animate-spin" />
                <p className="text-muted-foreground text-sm">{text}</p>
            </div>
        </div>
    );
}
