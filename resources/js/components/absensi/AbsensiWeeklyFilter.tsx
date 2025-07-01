import React from "react";

interface Props {
    filter: {
        periode: string;
        mode: "tahun" | "bulan";
        search?: string;
    };
    setFilter: (f: Partial<Props["filter"]>) => void;
    onExport: () => void;
    onAdd: () => void;
}

export function AbsensiWeeklyFilter({ filter, setFilter, onExport, onAdd }: Props) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
                <span>Tahun</span>
                <input
                    type="radio"
                    checked={filter.mode === "tahun"}
                    onChange={() => setFilter({ mode: "tahun" })}
                />
                <span>Bulan</span>
                <input
                    type="radio"
                    checked={filter.mode === "bulan"}
                    onChange={() => setFilter({ mode: "bulan" })}
                />
            </div>
            <input
                type={filter.mode === "tahun" ? "number" : "month"}
                value={filter.periode}
                onChange={e => setFilter({ periode: e.target.value })}
                className="input input-bordered"
                style={{ width: 120 }}
            />
            <input
                placeholder="Filter names..."
                className="input input-bordered"
                value={filter.search || ""}
                onChange={e => setFilter({ search: e.target.value })}
                style={{ width: 180 }}
            />
            <button className="btn btn-outline" onClick={onExport}>Export Data</button>
            <button className="btn btn-primary" onClick={onAdd}>Tambah Data</button>
        </div>
    );
}