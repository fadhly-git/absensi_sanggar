// resources/js/components/student/skeleton/absensi-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function AbsensiSkeleton() {
    return (
        <div className="flex flex-col gap-8">
            {[0, 1].map((rowIdx) => (
                <div key={rowIdx} className="w-full">
                    <div className="mb-3 flex gap-8">
                        {[0, 1, 2].map((colIdx) => (
                            <Skeleton key={colIdx} className="mx-auto h-6 w-20" />
                        ))}
                    </div>
                    <div className="flex gap-8">
                        {[0, 1, 2].map((colIdx) => (
                            <div key={colIdx} className="flex min-w-0 flex-1 flex-col items-start gap-2">
                                {[0, 1].map((rIdx) => (
                                    <div className="flex gap-4" key={rIdx}>
                                        {[0, 1, 2].map((cIdx) => (
                                            <div key={cIdx} className="flex flex-col items-center gap-1">
                                                <Skeleton className="mb-1 h-3 w-8 rounded-sm" />
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
