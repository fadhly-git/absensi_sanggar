import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface AbsensiPerBulanProps {
    absensi: {
        [bulan: string]: {
            [tanggal: string]: string; // "2025-07-06": "T"
        };
    };
    maxCol?: number; // default: 3
    maxRow?: number; // default: 2
    bulanPerBaris?: number; // default: 3
}

const statusIcon = (status: string) => {
    if (status === "T") {
        // Tidak Hadir (merah, silang)
        return (
            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-red-300 bg-red-50 text-red-500 text-xl">
                &#10006;
            </span>
        );
    } else if (status === "H") {
        // Hadir (hijau, centang)
        return (
            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-green-300 bg-green-50 text-green-500 text-xl">
                &#10003;
            </span>
        );
    } else if (status === "B") {
        // Izin (kuning, tanda seru)
        return (
            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-yellow-300 bg-yellow-50 text-yellow-500 text-xl">
                !
            </span>
        );
    } else {
        // Status lainnya (abu-abu, tanda tanya)
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

export const AbsensiGridPerBarisBulan = ({
    absensi,
    maxCol = 3,
    maxRow = 2,
    bulanPerBaris = 3,
}: AbsensiPerBulanProps) => {
    // Urut bulan
    const bulanKeys = Object.keys(absensi).sort((a, b) => Number(a) - Number(b));

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
                            const tanggalList = Object.entries(absensi[bulanKey]).sort(([a], [b]) => (a < b ? -1 : 1));
                            const firstDate = tanggalList[0]?.[0];
                            return (
                                <div key={bulanKey} className="flex-1 min-w-0 text-center font-bold">
                                    {getBulanLabel(firstDate, `Bulan ${bulanKey}`)}
                                </div>
                            );
                        })}
                    </div>
                    {/* Grid absensi per bulan */}
                    <div className="flex gap-8">
                        {bulanGroup.map((bulanKey) => {
                            const tanggalList = Object.entries(absensi[bulanKey]).sort(([a], [b]) => (a < b ? -1 : 1));
                            const cells = tanggalList.slice(0, maxCol * maxRow);
                            const rows = [];
                            for (let i = 0; i < cells.length; i += maxCol) {
                                rows.push(cells.slice(i, i + maxCol));
                            }
                            const isMore = tanggalList.length > maxCol * maxRow;
                            return (
                                <div key={bulanKey} className="flex flex-col gap-2 items-start flex-1 min-w-0">
                                    {rows.map((row, rIdx) => (
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
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};