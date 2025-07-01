import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { apiClient } from "@/lib/api/client";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface AbsensiHadir {
    id: number;
    nama: string;
    alamat: string;
    tanggal: string;
    keterangan?: string;
    bonus?: boolean;
}

interface Props {
    startDate: string;
    endDate: string;
    onEdit: (absensi: AbsensiHadir) => void;
    onDeleted?: () => void;
}

export const AbsensiHadirMingguIni: React.FC<Props> = ({ startDate, endDate, onEdit, onDeleted }) => {
    const [data, setData] = useState<AbsensiHadir[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get("/api/admin/absensi/hadir-minggu-ini", {
                params: { start_date: startDate, end_date: endDate }
            });
            setData(res.data.data || []);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Gagal memuat data");
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [startDate, endDate]);

    const handleDelete = async () => {
        if (deleteId === null) return;
        try {
            await apiClient.delete(`/api/admin/absensi/${deleteId}`);
            setData(d => d.filter(item => item.id !== deleteId));
            if (onDeleted) onDeleted();
            toast.success("Absensi berhasil dihapus");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Gagal menghapus absensi");
            }
            toast.error("Gagal menghapus absensi: " + (err instanceof Error ? err.message : "Terjadi kesalahan"));
        }
        setDeleteId(null);
    };

    if (loading) return <div className="p-4">Memuat data...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 mt-4 border">
            <h3 className="font-semibold mb-2">Siswa Hadir Minggu Ini</h3>
            {data.length === 0 ? (
                <div className="text-gray-400">Belum ada siswa hadir minggu ini.</div>
            ) : (
                <table className="w-full text-sm border">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">Nama</th>
                            <th className="border px-2 py-1">Alamat</th>
                            <th className="border px-2 py-1">Tanggal</th>
                            <th className="border px-2 py-1">Keterangan</th>
                            <th className="border px-2 py-1">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(absen => (
                            <tr key={absen.id}>
                                <td className="border px-2 py-1">{absen.nama}</td>
                                <td className="border px-2 py-1">{absen.alamat}</td>
                                <td className="border px-2 py-1">{new Date(absen.tanggal).toLocaleDateString("id-ID", { year: "numeric", month: "numeric", day: "numeric" })}</td>
                                <td className="border px-2 py-1">{absen.keterangan || "-"}</td>
                                <td className="border px-2 py-1 flex gap-2 w-fit">
                                    <Button size="sm" variant="outline" onClick={() => onEdit(absen)}>Edit</Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => setDeleteId(absen.id)}
                                            >
                                                Hapus
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Hapus Absensi?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Apakah Anda yakin ingin menghapus absensi <b>{absen.nama}</b> pada tanggal <b>{new Date(absen.tanggal).toLocaleDateString("id-ID")}</b>? Tindakan ini tidak dapat dibatalkan.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                                    Batal
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDelete}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Hapus
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};