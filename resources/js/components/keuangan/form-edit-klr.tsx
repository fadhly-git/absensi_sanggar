import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { DatePicker } from '@/components/costum-date-picker';
import { DataKeuangan, formatNumber } from './data-table';

interface UangMasukField {
    open: boolean;
    openDialog: () => void;
    data: DataKeuangan | null;
    success: () => void;
}

export function KeuanganKlrEditTabs({ open, openDialog, data, success }: UangMasukField) {
    // State untuk menyimpan data uang masuk dan uang keluar
    const [uangMasukFields, setUangMasukFields] = useState([{ keterangan: '', amount: '', displayAmount: '' }]);
    const [id, setId] = useState(data?.id);
    const [keterangan, setKeterangan] = useState(data?.keterangan);
    const [jumlah, setJumlah] = useState(data?.jumlah);
    const [tanggal, setTanggal] = useState<Date | undefined>(data?.tanggal ? new Date(data.tanggal) : undefined);
    const [formattedValue, setFormattedValue] = useState(formatNumber(Number(data?.jumlah)));

    useEffect(() => {
        setId(data?.id);
        setKeterangan(data?.keterangan);
        setJumlah(data?.jumlah);
        setTanggal(data?.tanggal ? new Date(data.tanggal) : undefined);
        setFormattedValue(formatNumber(Number(data?.jumlah)));
    }, [data?.keterangan, data?.jumlah, data?.tanggal, data?.id]);

    useEffect(() => {
        setUangMasukFields([{ keterangan: keterangan || '', amount: jumlah?.toString() || '', displayAmount: formattedValue || '' }]);
    }, [keterangan, jumlah, formattedValue]);

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`/api/atmin/keuangan/delete/${id}`);
            if (response.data.success) {
                toast.success('Data berhasil dihapus!');
            } else {
                toast.error('Gagal menghapus data: ', { description: response.data.message });
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat menghapus data.', {
                description: String(error),
            });
        } finally {
            success();
            setTimeout(() => {
                openDialog();
            }, 5000);
        }
    };

    // Fungsi untuk submit form
    const handleSubmit = async (type: 'masuk' | 'keluar') => {
        setUangMasukFields([{ keterangan: keterangan || '', amount: jumlah?.toString() || '', displayAmount: formattedValue || '' }]);
        const data = uangMasukFields;

        // Validasi data
        if (!data.every((item) => item.keterangan && item.amount)) {
            toast.error('Mohon isi semua field!');
            return;
        }

        // Pastikan tanggal telah dipilih
        if (!tanggal) {
            toast.error('Mohon pilih tanggal terlebih dahulu!');
            return;
        }

        try {
            // Kirim data ke backend menggunakan axios
            const response = await axios.put(`/api/atmin/keuangan/update/${id}`, {
                type,
                tanggal: format(tanggal, 'yyyy-MM-dd'),
                data,
            });

            if (response.data.success) {
                openDialog();
                toast.success('Data berhasil diupdate!');
            } else {
                toast.error('Gagal mengupdate data: ', { description: response.data.message });
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat mengupdate data.', {
                description: String(error),
            });
        } finally {
            // Reset form
            setUangMasukFields([{ keterangan: '', amount: '', displayAmount: '' }]);
            success();
            setTimeout(() => {
                openDialog();
            }, 5000);
        }
    };

    return (
        <>
            <Toaster />
            <Drawer open={open} onClose={openDialog}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-xl">
                        <DrawerHeader>
                            <DrawerTitle>Edit Data Keuangan</DrawerTitle>
                            <DrawerDescription>Isi form di bawah ini untuk mengedit data keuangan.</DrawerDescription>
                        </DrawerHeader>
                        {data === null ? (
                            <div>error</div>
                        ) : (
                            <div className="mb-12 p-4">
                                <div className="flex items-center justify-center space-x-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Uang Keluar</CardTitle>
                                            <CardDescription>Edit pengeluaran Anda di sini.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Label>Tanggal</Label>
                                            <DatePicker date={tanggal ? new Date(tanggal) : undefined} setDate={setTanggal} />
                                            <div className="flex items-end gap-2">
                                                <div className="flex-1 space-y-1">
                                                    <Label>Keterangan</Label>
                                                    <Input
                                                        value={keterangan || ''}
                                                        onChange={(e) => setKeterangan(e.target.value)}
                                                        placeholder="Contoh: Gaji Bulanan"
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <Label>Jumlah</Label>
                                                    <Input
                                                        type="text" // Gunakan type text agar tidak terbatas pada input number
                                                        value={formattedValue || ''}
                                                        onChange={(e) => {
                                                            const rawValue = e.target.value.replace(/\D/g, '');
                                                            setJumlah(Number(rawValue));
                                                            setFormattedValue(formatNumber(Number(rawValue)));
                                                        }}
                                                        placeholder="5.000.000"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="destructive" onClick={() => handleDelete()}>
                                                Hapus
                                            </Button>
                                            <Button className="ml-auto" onClick={() => handleSubmit('keluar')}>
                                                Simpan Uang Masuk
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
