import { useQuery } from "@tanstack/react-query";
import { AbsensiService } from "@/services/absensiService";

export function useAvailableYears(userId: number) {
    return useQuery({
        queryKey: ["available-years", userId],
        queryFn: () => AbsensiService.getAvailableYears(userId),
        enabled: !!userId,
        staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    });
}
