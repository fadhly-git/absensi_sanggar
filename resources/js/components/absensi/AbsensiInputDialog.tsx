import React, { useEffect, useState } from "react";
import type { Siswa } from "@/types/siswa";

interface Props {
    open: boolean;
    onClose: () => void;
    siswaList: Siswa[];
    tanggal: string;
    setTanggal: (tgl: string) => void;
    onSubmit: (absensi: { id: number; formattedDate: string; keterangan?: string; bonus?: boolean }[]) => void;
}

export function AbsensiInputDialog({ open, onClose, siswaList, tanggal, setTanggal, onSubmit }: Props) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<{ id: number; nama: string; alamat: string; keterangan?: string; bonus?: boolean }[]>([]);

    useEffect(() => {
        if (!open) {
            setSearch("");
            setSelected([]);
        }
    }, [open]);

    const filteredSiswa = siswaList.filter(s =>
        s.nama.toLowerCase().includes(search.toLowerCase()) ||
        (s.alamat?.toLowerCase() || "").includes(search.toLowerCase())
    );

    const addSiswa = (s: Siswa) => {
        if (!selected.find(sel => sel.id === s.id)) {
            setSelected([...selected, { id: s.id, nama: s.nama, alamat: s.alamat }]);
        }
    };

    const removeSiswa = (id: number) => {
        setSelected(selected.filter(s => s.id !== id));
    };

    const setKeterangan = (id: number, keterangan: string) => {
        setSelected(selected.map(s => s.id === id ? { ...s, keterangan } : s));
    };

    const setBonus = (id: number, bonus: boolean) => {
        setSelected(selected.map(s => s.id === id ? { ...s, bonus } : s));
    };

    const handleSubmit = () => {
        onSubmit(selected.map(s => ({
            id: s.id,
            formattedDate: tanggal,
            keterangan: s.keterangan,
            bonus: s.bonus
        })));
        onClose();
    };

    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg p-6 min-w-[380px] max-w-lg w-full">
                <h2 className="text-xl font-bold mb-2">Tambah Data</h2>
                <div className="flex gap-4 mb-3">
                    <div className="flex-1">
                        <div className="text-xs mb-1">Cari Siswa</div>
                        <input
                            className="input input-bordered w-full"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari nama/alamat..."
                        />
                        <div className="h-32 overflow-y-auto border mt-2 rounded">
                            {filteredSiswa.map(s => (
                                <div key={s.id} className="flex items-center justify-between px-2 py-1 border-b last:border-0">
                                    <span>{s.nama} <span className="text-xs text-gray-400">{s.alamat}</span></span>
                                    <button className="btn btn-xs btn-success" onClick={() => addSiswa(s)}>Add</button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="text-xs mb-1">Pilih Tanggal</div>
                        <input
                            type="date"
                            className="input input-bordered w-full"
                            value={tanggal}
                            onChange={e => setTanggal(e.target.value)}
                        />
                    </div>
                </div>
                {selected.length > 0 && (
                    <div className="border rounded mb-2 p-2">
                        <div className="font-medium text-xs mb-1">Daftar Siswa Akan Diabsen</div>
                        <table className="table-auto w-full">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Keterangan</th>
                                    <th>Bonus</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {selected.map(s => (
                                    <tr key={s.id}>
                                        <td className="text-xs">{s.nama}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="input input-bordered input-xs"
                                                value={s.keterangan || ""}
                                                onChange={e => setKeterangan(s.id, e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={!!s.bonus}
                                                onChange={e => setBonus(s.id, e.target.checked)}
                                            />
                                        </td>
                                        <td>
                                            <button className="btn btn-xs btn-danger" onClick={() => removeSiswa(s.id)}>X</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-2">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={selected.length === 0 || !tanggal}>Submit</button>
                </div>
            </div>
        </div>
    );
}