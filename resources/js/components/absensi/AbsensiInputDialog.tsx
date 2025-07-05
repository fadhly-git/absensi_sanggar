import React, { useEffect, useState } from "react";
import type { Siswa } from "@/types/siswa";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Props {
    open: boolean;
    onClose: () => void;
    siswaList: Siswa[];
    tanggal: string;
    setTanggal: (tgl: string) => void;
    onSubmit: (absensi: { id: number; formattedDate: string; keterangan?: string; bonus?: boolean }[]) => void;
}

export function AbsensiInputDialog({
    open,
    onClose,
    siswaList,
    tanggal,
    setTanggal,
    onSubmit
}: Props) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<
        { id: number; nama: string; alamat: string; keterangan?: string; bonus?: boolean }[]
    >([]);

    useEffect(() => {
        if (!open) {
            setSearch("");
            setSelected([]);
        }
    }, [open]);

    const filteredSiswa = siswaList.filter(
        (s) =>
            s.nama.toLowerCase().includes(search.toLowerCase()) ||
            (s.alamat?.toLowerCase() || "").includes(search.toLowerCase())
    );

    const addSiswa = (s: Siswa) => {
        if (!selected.find((sel) => sel.id === s.id)) {
            setSelected([...selected, { id: s.id, nama: s.nama, alamat: s.alamat }]);
        }
    };

    const removeSiswa = (id: number) => {
        setSelected(selected.filter((s) => s.id !== id));
    };

    const setKeterangan = (id: number, keterangan: string) => {
        setSelected(selected.map((s) => (s.id === id ? { ...s, keterangan } : s)));
    };

    const setBonus = (id: number, bonus: boolean) => {
        setSelected(selected.map((s) => (s.id === id ? { ...s, bonus } : s)));
    };

    const handleSubmit = () => {
        onSubmit(
            selected.map((s) => ({
                id: s.id,
                formattedDate: tanggal,
                keterangan: s.keterangan,
                bonus: s.bonus
            }))
        );
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="!max-w-5xl h-fit max-h-screen w-full">
                <DialogHeader>
                    <DialogTitle>Tambah Absensi Siswa</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col md:flex-row gap-6 mt-2">
                    {/* Kolom Kiri: Cari siswa */}
                    <div className="md:w-2/3 w-full">
                        <Label htmlFor="search" className="mb-1 block text-base font-medium">
                            Cari Siswa
                        </Label>
                        <Input
                            id="search"
                            className="mb-1"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama/alamat..."
                        />
                        <div className="h-96 m-2 w-full overflow-y-auto border rounded bg-muted/40">
                            {filteredSiswa.length === 0 ? (
                                <div className="text-gray-400 text-center py-4 text-base">
                                    Tidak ditemukan
                                </div>
                            ) : (
                                filteredSiswa.map((s) => (
                                    <div
                                        key={s.id}
                                        className="flex items-center justify-between px-2 py-1 border-b last:border-0 hover:bg-muted/70 transition"
                                    >
                                        <span>
                                            <span className="font-medium">{s.nama}</span>{" "}
                                            <span className="text-base text-gray-500">{s.alamat}</span>
                                        </span>
                                        <Button size="sm" className="ml-2" onClick={() => addSiswa(s)}>
                                            Tambah
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    {/* Kolom Kanan: Pilih tanggal */}
                    <div className="md:w-1/3 w-full">
                        <Label htmlFor="tanggal" className="mb-1 block text-base font-medium">
                            Pilih Tanggal
                        </Label>
                        <Input
                            id="tanggal"
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                        />
                    </div>
                </div>

                {/* Daftar siswa yang dipilih */}
                <div className="border rounded mb-2 p-2 bg-muted/30 mt-4 min-h-[4rem]">
                    <div className="font-medium text-base mb-1 text-primary">
                        Daftar Siswa Akan Diabsen
                    </div>
                    <div className="max-h-24 md:max-h-44 overflow-auto">
                        {selected.length === 0 ? (
                            <div className="text-center text-gray-400 py-6 text-base">
                                Belum ada siswa dipilih.
                            </div>
                        ) : (
                            <table className="table-auto w-full text-base">
                                <thead>
                                    <tr className="bg-muted">
                                        <th className="py-1 px-2 text-left">Nama</th>
                                        <th className="py-1 px-2 text-left">Keterangan</th>
                                        <th className="py-1 px-2 text-center">Bonus</th>
                                        <th className="py-1 px-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selected.map((s) => (
                                        <tr key={s.id} className="border-t">
                                            <td className="py-1 px-2">{s.nama}</td>
                                            <td className="py-1 px-2">
                                                <Input
                                                    type="text"
                                                    size={8}
                                                    className="h-8"
                                                    value={s.keterangan || ""}
                                                    onChange={(e) => setKeterangan(s.id, e.target.value)}
                                                    placeholder="(Opsional)"
                                                />
                                            </td>
                                            <td className="py-1 px-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={!!s.bonus}
                                                    onChange={(e) => setBonus(s.id, e.target.checked)}
                                                    className="accent-primary h-4 w-4"
                                                />
                                            </td>
                                            <td className="py-1 px-2 text-center">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeSiswa(s.id)}
                                                    className="px-2"
                                                    title="Hapus"
                                                >
                                                    ✕
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="hover:cursor-pointer" type="button">
                            Batal
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleSubmit}
                        disabled={selected.length === 0 || !tanggal}
                        className="bg-primary hover:bg-primary/90 hover:cursor-pointer"
                    >
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function DebugA({ open,
    onClose,
    siswaList,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="!max-w-5xl h-full w-full overflow-auto">
                <pre>{JSON.stringify(siswaList, null, 2)}</pre>
            </DialogContent>
        </Dialog>
    );
}