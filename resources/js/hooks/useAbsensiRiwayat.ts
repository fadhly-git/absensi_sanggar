import { useQuery } from "@tanstack/react-query";
import { AbsensiService } from "@/services/absensiService";

export function useAbsensiRiwayat(
    userId: number,
    mode: "bulan" | "tahun" = "bulan",
    bulan?: string | number,
    tahun?: string | number
) {
    return useQuery({
        queryKey: ["absensi-riwayat", userId, mode, bulan, tahun],
        queryFn: () => AbsensiService.getRiwayatSiswa(userId, mode, bulan, tahun),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
}