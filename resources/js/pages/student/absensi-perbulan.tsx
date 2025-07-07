import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface AbsensiPerBulanProps {
    absensi: {
        [bulan: string]: {
            [tanggal: string]: string; // "2025-07-06": "T"
        };
    };
    loading?: boolean;
    maxCol?: number;
    maxRow?: number;
    bulanPerBaris?: number;
}

const statusIcon = (status: string) => {
    if (status === "T") {
        return (
            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-red-300 bg-red-50 text-red-500 text-xl">
                &#10006;
            </span>
        );
    } else if (status === "H") {
        return (
            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-green-300 bg-green-50 text-green-500 text-xl">
                &#10003;
            </span>
        );
    } else if (status === "B") {
        return (
            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-yellow-300 bg-yellow-50 text-yellow-500 text-xl">
                !
            </span>
        );
    } else {
        return (
            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-gray-50 text-gray-500 text-xl">
                ?
            </span>
        );
    }
};

const getBulanLabel = (firstDate: string, fallback: string) =>
    firstDate
        ? format(parseISO(firstDate), "MMMM", { locale: localeId })
        : fallback;

const Skeleton = ({ className = "" }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-neutral-800 rounded ${className}`} />
);

const SkeletonStatus = () => (
    <div className="flex flex-col items-center gap-1">
        <Skeleton className="w-8 h-3 rounded-sm mb-1" />
        <Skeleton className="w-8 h-8 rounded-full" />
    </div>
);

export const AbsensiGridPerBarisBulan = ({
    absensi,
    loading = false,
    maxCol = 3,
    maxRow = 2,
    bulanPerBaris = 3,
}: AbsensiPerBulanProps) => {
    // Jika loading
    if (loading) {
        return (
            <div className="flex flex-col gap-8">
                {[0, 1].map((rowIdx) => (
                    <div key={rowIdx} className="w-full">
                        <div className="flex gap-8 mb-3">
                            {[0, 1, 2].map((colIdx) => (
                                <Skeleton key={colIdx} className="h-6 w-20 mx-auto" />
                            ))}
                        </div>
                        <div className="flex gap-8">
                            {[0, 1, 2].map((colIdx) => (
                                <div key={colIdx} className="flex flex-col gap-2 items-start flex-1 min-w-0">
                                    {[0, 1].map((rIdx) => (
                                        <div className="flex gap-4" key={rIdx}>
                                            {[0, 1, 2].map((cIdx) => (
                                                <SkeletonStatus key={cIdx} />
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

    const bulanKeys = Object.keys(absensi ?? {}).sort((a, b) => Number(a) - Number(b));
    if (bulanKeys.length === 0) {
        return (
            <div className="text-center text-gray-500 py-10">Tidak ada data absensi.</div>
        );
    }

    // Kelompokkan bulan per baris
    const bulanRows = [];
    for (let i = 0; i < bulanKeys.length; i += bulanPerBaris) {
        bulanRows.push(bulanKeys.slice(i, i + bulanPerBaris));
    }

    return (
        <div className="flex flex-col gap-8">
            {bulanRows.map((bulanGroup, idx) => (
                <div key={idx} className="w-full">
                    {/* Header bulan */}
                    <div className="flex gap-8 mb-3">
                        {bulanGroup.map((bulanKey) => {
                            const tanggalList = Object.entries(absensi[bulanKey] ?? {}).sort(([a], [b]) => (a < b ? -1 : 1));
                            const firstDate = tanggalList[0]?.[0];
                            return (
                                <div key={bulanKey} className="flex-1 min-w-0 text-center font-bold">
                                    {getBulanLabel(firstDate, `Bulan ${bulanKey}`)}
                                </div>
                            );
                        })}
                    </div>
                    {/* Grid absensi per bulan */}
                    <div
                        className={`flex gap-8 ${bulanGroup.length === 1 ? "justify-center" : ""
                            }`}
                    >
                        {bulanGroup.map((bulanKey) => {
                            const tanggalList = Object.entries(absensi[bulanKey] ?? {}).sort(([a], [b]) => (a < b ? -1 : 1));
                            const cells = tanggalList.slice(0, maxCol * maxRow);
                            const rows = [];
                            for (let i = 0; i < cells.length; i += maxCol) {
                                rows.push(cells.slice(i, i + maxCol));
                            }
                            const isMore = tanggalList.length > maxCol * maxRow;
                            return (
                                <div key={bulanKey} className={`flex flex-col gap-2 flex-1 min-w-0 ${bulanGroup.length === 1 ? "items-center max-w-xs" : "items-start"}`}>
                                    {rows.length === 0 ? (
                                        <div className="text-gray-400 italic text-xs">Tidak ada data</div>
                                    ) : (
                                        rows.map((row, rIdx) => (
                                            <div className="flex gap-4" key={rIdx}>
                                                {row.map(([tanggal, status]) => (
                                                    <div key={tanggal} className="flex flex-col items-center gap-1">
                                                        <div className="text-gray-400 font-bold text-xs text-center">
                                                            {format(parseISO(tanggal), "dd", { locale: localeId })}
                                                            <div className="text-xs">{format(parseISO(tanggal), "MMM", { locale: localeId })}</div>
                                                        </div>
                                                        {statusIcon(status)}
                                                    </div>
                                                ))}
                                                {/* Jika row terakhir dan ada data lagi, tampilkan ... */}
                                                {isMore && rIdx === rows.length - 1 && (
                                                    <div className="flex flex-col items-center justify-center w-8 text-gray-400 text-xl">...</div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};