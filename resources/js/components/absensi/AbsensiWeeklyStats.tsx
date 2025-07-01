import React from "react";

interface Props {
    total: number;
    naik: number;
    persentase: number;
}

export function AbsensiWeeklyStats({ total, naik, persentase }: Props) {
    return (
        <div className="flex items-center gap-6 mb-4">
            <div>
                <div className="text-lg font-bold">{total} orang</div>
                <div className="text-xs text-gray-500">
                    Siswa berangkat {naik >= 0 ? <span className="text-green-500">Naik {naik} orang</span> : <span className="text-red-500">Turun {Math.abs(naik)} orang</span>}
                </div>
            </div>
            <div className="text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-semibold">
                +{persentase.toFixed(2)}%
            </div>
        </div>
    );
}