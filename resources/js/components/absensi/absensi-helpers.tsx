import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export const LoadingSpinner: React.FC = () => (
    <div className="py-8 flex items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
    </div>
);

export const ErrorMessage: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="py-6">
        <Alert className="mb-4" variant="destructive">
            <div>{message}</div>
        </Alert>
        <div className="flex justify-center">
            <Button variant="ghost" onClick={onRetry}>Coba Lagi</Button>
        </div>
    </div>
);

export default {};
