import React from "react";
import styles from "./AttendanceTable.module.css"; // Assuming you have a CSS module for styling
interface AbsensiWeeklyRow {
    siswa_id: number;
    siswa_nama: string;
    siswa_alamat: string;
    [tanggal: string]: string | number | undefined;
}
interface Props {
    data: AbsensiWeeklyRow[];
    sundays: string[];
    isLoading?: boolean;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    H: { label: "Hadir", color: "bg-green-500" },
    B: { label: "Bonus", color: "bg-blue-500" },
    T: { label: "Tidak", color: "bg-red-500" }
};

export const AbsensiWeeklyTable: React.FC<Props> = ({ data, sundays, isLoading }) => {
    if (isLoading) {
        return <div className="p-6 text-center">Loading...</div>;
    }
    if (!data || data.length === 0) {
        return <div className="p-6 text-center text-gray-400">Tidak ada data absensi untuk periode ini.</div>;
    }
    return (
        <div className={styles.tableContainer + " max-w-7xl"}>
            <div className={styles.tableWrapper + " min-w-max text-sm relative"}>
                <table className={styles.table} style={{ tableLayout: 'auto', minWidth: 'max-content' }}>
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-20 bg-white px-3 py-2 font-semibold border-b min-w-[160px]">Nama</th>
                            <th className="sticky left-[160px] z-20 bg-white px-3 py-2 font-semibold border-b min-w-[120px]">Alamat</th>
                            {sundays.map((tgl) => (
                                <th key={tgl} className="px-3 py-2 font-semibold bg-gray-50 border-b min-w-[110px]">{tgl}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={row.siswa_id || idx} className="border-b last:border-b-0">
                                <td className="sticky left-0 z-10 bg-white px-3 py-2 border-r min-w-[160px]">{row.siswa_nama}</td>
                                <td className="sticky left-[160px] z-10 bg-white px-3 py-2 border-r min-w-[120px] dark:bg-black dark:text-white">{row.siswa_alamat}</td>
                                {sundays.map((tgl) => {
                                    const val = row[tgl] as string | undefined;
                                    const status = STATUS_MAP[val ?? "T"];
                                    return (
                                        <td key={tgl} className="px-3 py-2 text-center">
                                            <span
                                                className={[
                                                    "inline-flex items-center rounded-full px-5 py-1 font-semibold text-white",
                                                    status.color
                                                ].join(' ')}
                                                style={{ minWidth: 90, justifyContent: 'center' }}
                                            >
                                                {status.label}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};