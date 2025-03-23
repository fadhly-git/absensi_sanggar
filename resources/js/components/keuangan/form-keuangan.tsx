import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { DatePickerDemo } from '../daftar-hadir/tambahdaftar';

type FieldType = 'keterangan' | 'amount' | 'displayAmount';

export function KeuanganTabs() {
    // State untuk menyimpan data uang masuk dan uang keluar
    const [uangMasukFields, setUangMasukFields] = useState([{ keterangan: '', amount: '', displayAmount: '' }]);
    const [uangKeluarFields, setUangKeluarFields] = useState([{ keterangan: '', amount: '', displayAmount: '' }]);
    const [date, setDate] = useState<Date | undefined>(undefined); // Menambahkan tipe undefined
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;

    // Fungsi untuk memformat angka menjadi format ribuan (1.000)
    const formatNumber = (value: number) => {
        return 'Rp. ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Fungsi untuk menambahkan field baru
    const addField = (type: 'masuk' | 'keluar') => {
        if (type === 'masuk') {
            setUangMasukFields([...uangMasukFields, { keterangan: '', amount: '', displayAmount: '' }]);
        } else if (type === 'keluar') {
            setUangKeluarFields([...uangKeluarFields, { keterangan: '', amount: '', displayAmount: '' }]);
        }
    };

    // Fungsi untuk menghapus field
    const removeField = (type: 'masuk' | 'keluar', index: number) => {
        if (type === 'masuk') {
            const updatedFields = uangMasukFields.filter((_, i) => i !== index);
            setUangMasukFields(updatedFields);
        } else if (type === 'keluar') {
            const updatedFields = uangKeluarFields.filter((_, i) => i !== index);
            setUangKeluarFields(updatedFields);
        }
    };

    const handleInputChange = (type: 'masuk' | 'keluar', index: number, field: string, value: string) => {
        if (field === 'amount') {
            // Hapus semua karakter selain angka untuk mendapatkan nilai asli
            const rawValue = value.replace(/\D/g, '');
            // Format angka untuk ditampilkan
            const formattedValue = formatNumber(Number(rawValue));
            if (type === 'masuk') {
                const updatedFields = [...uangMasukFields];
                updatedFields[index].amount = rawValue; // Simpan nilai asli
                updatedFields[index].displayAmount = formattedValue; // Simpan format tampilan
                setUangMasukFields(updatedFields);
            } else if (type === 'keluar') {
                const updatedFields = [...uangKeluarFields];
                updatedFields[index].amount = rawValue; // Simpan nilai asli
                updatedFields[index].displayAmount = formattedValue; // Simpan format tampilan
                setUangKeluarFields(updatedFields);
            }
        } else {
            // Untuk field lain (misalnya keterangan)
            if (type === 'masuk') {
                const updatedFields = [...uangMasukFields];
                updatedFields[index][field as FieldType] = value;
                setUangMasukFields(updatedFields);
            } else if (type === 'keluar') {
                const updatedFields = [...uangKeluarFields];
                updatedFields[index][field as FieldType] = value;
                setUangKeluarFields(updatedFields);
            }
        }
    };

    // Fungsi untuk submit form
    const handleSubmit = async (type: 'masuk' | 'keluar') => {
        const data = type === 'masuk' ? uangMasukFields : uangKeluarFields;

        // Validasi data
        if (!data.every((item) => item.keterangan && item.amount)) {
            toast.error('Mohon isi semua field!');
            return;
        }

        // Pastikan tanggal telah dipilih
        if (!formattedDate) {
            toast.error('Mohon pilih tanggal terlebih dahulu!');
            return;
        }

        try {
            // Kirim data ke backend menggunakan axios
            const response = await axios.post('/api/keuangan/store', {
                type,
                tanggal: formattedDate,
                data,
            });

            if (response.data.success) {
                toast.success('Data berhasil disimpan!');
            } else {
                toast.error('Gagal menyimpan data: ', { description: response.data.message });
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat menyimpan data.', {
                description: String(error),
            });
        } finally {
            // Reset form
            setUangMasukFields([{ keterangan: '', amount: '', displayAmount: '' }]);
            setUangKeluarFields([{ keterangan: '', amount: '', displayAmount: '' }]);
            setDate(undefined);
        }
    };

    return (
        <>
            <Toaster />
            <Drawer>
                <DrawerTrigger asChild>
                    <Button>Tambah Data</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-xl">
                        <DrawerHeader>
                            <DrawerTitle>Tambah Data Keuangan</DrawerTitle>
                            <DrawerDescription>Isi form di bawah ini untuk menambahkan data keuangan.</DrawerDescription>
                        </DrawerHeader>
                        <div className="mb-12 p-4">
                            <div className="flex items-center justify-center space-x-2">
                                <Tabs defaultValue="masuk" className="w-[600px]">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="masuk">Uang Masuk</TabsTrigger>
                                        <TabsTrigger value="keluar">Uang Keluar</TabsTrigger>
                                    </TabsList>

                                    {/* Tab Uang Masuk */}
                                    <TabsContent value="masuk">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Uang Masuk</CardTitle>
                                                <CardDescription>Catat pemasukan Anda di sini.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <Label>Tanggal</Label>
                                                <DatePickerDemo date={date} setDate={setDate} />
                                                {uangMasukFields.map((field, index) => (
                                                    <div key={index} className="flex items-end gap-2">
                                                        <div className="flex-1 space-y-1">
                                                            <Label>Keterangan</Label>
                                                            <Input
                                                                value={field.keterangan}
                                                                onChange={(e) => handleInputChange('masuk', index, 'keterangan', e.target.value)}
                                                                placeholder="Contoh: Gaji Bulanan"
                                                            />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <Label>Jumlah</Label>
                                                            <Input
                                                                type="text" // Gunakan type text agar tidak terbatas pada input number
                                                                value={field.displayAmount || ''}
                                                                onChange={(e) => handleInputChange('masuk', index, 'amount', e.target.value)}
                                                                placeholder="5.000.000"
                                                            />
                                                        </div>
                                                        <Button variant="destructive" onClick={() => removeField('masuk', index)}>
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button variant="success" onClick={() => addField('masuk')}>
                                                    Tambah Field
                                                </Button>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="ml-auto" onClick={() => handleSubmit('masuk')}>
                                                    Simpan Uang Masuk
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </TabsContent>

                                    {/* Tab Uang Keluar */}
                                    <TabsContent value="keluar">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Uang Keluar</CardTitle>
                                                <CardDescription>Catat pengeluaran Anda di sini.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <Label>Tanggal</Label>
                                                <DatePickerDemo date={date} setDate={setDate} />
                                                {uangKeluarFields.map((field, index) => (
                                                    <div key={index} className="flex items-end gap-2">
                                                        <div className="flex-1 space-y-1">
                                                            <Label>Keterangan</Label>
                                                            <Input
                                                                value={field.keterangan}
                                                                onChange={(e) => handleInputChange('keluar', index, 'keterangan', e.target.value)}
                                                                placeholder="Contoh: Bayar Tagihan"
                                                            />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <Label>Jumlah</Label>
                                                            <Input
                                                                type="text" // Gunakan type text agar tidak terbatas pada input number
                                                                value={field.displayAmount || ''}
                                                                onChange={(e) => handleInputChange('keluar', index, 'amount', e.target.value)}
                                                                placeholder="2.000.000"
                                                            />
                                                        </div>
                                                        <Button variant="destructive" onClick={() => removeField('keluar', index)}>
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button variant="success" onClick={() => addField('keluar')}>
                                                    Tambah Field
                                                </Button>
                                            </CardContent>
                                            <CardFooter className="flex items-end justify-end">
                                                <Button onClick={() => handleSubmit('keluar')}>Simpan Uang Keluar</Button>
                                            </CardFooter>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
