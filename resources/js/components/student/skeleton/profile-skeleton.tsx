// resources/js/components/student/skeleton/profile-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
    return (
        <aside className="bg-card mx-auto flex min-h-[450px] w-full max-w-xl flex-col items-center rounded-xl border p-6 shadow-sm lg:mx-0">
            <Skeleton className="h-40 w-40 rounded-full" />
            <Skeleton className="mt-6 h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-32" />
            <div className="mt-6 w-full space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-20" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="mt-6 h-10 w-full" />
        </aside>
    );
}
