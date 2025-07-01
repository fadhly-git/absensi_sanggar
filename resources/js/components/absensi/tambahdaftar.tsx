import { DatePicker } from '@/components/costum-date-picker';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { format } from 'date-fns';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

export type DataSiswa = {
    id: number;
    nama: string;
    alamat: string;
    status: number;
    created_at: string;
    updated_at: string;
};

export type DataSiswaWithBonus = DataSiswa & {
    tanggal: string;
    bonus: boolean;
    keterangan: string;
};

export const columns: ColumnDef<DataSiswaWithBonus>[] = [
    {
        accessorKey: 'nama',
        header: 'Nama',
        cell: ({ row }) => <div>{row.getValue('nama')}</div>,
    },
    {
        accessorKey: 'alamat',
        header: 'Alamat',
        cell: ({ row }) => <div>{row.getValue('alamat')}</div>,
    },
    {
        accessorKey: 'bonus',
        header: 'Bonus',
        cell: ({ row }) => (
            <Switch
                checked={row.getValue('bonus')}
                onCheckedChange={(e) => {
                    row.original.bonus = e;
                    row.getValue('bonus'); // Trigger re-render
                }}
            />
        ),
    },
    {
        accessorKey: 'keterangan',
        header: 'Keterangan',
        cell: ({ row }) => (
            <Input
                value={row.getValue('keterangan')}
                onChange={(e) => {
                    row.original.keterangan = e.target.value;
                    row.getValue('keterangan'); // Trigger re-render
                }}
            />
        ),
    },
];

export function InsertDataDH() {
    const [data, setData] = useState<DataSiswaWithBonus[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState<DataSiswaWithBonus[]>([]);
    const [selectedData, setSelectedData] = useState<DataSiswaWithBonus[]>([]);

    const today = new Date(); // Get today's date as a Date object
    const [date, setDates] = useState<Date | undefined>(today); // Menambahkan tipe undefined
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;
    const [success, setSuccess] = useState(false);

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('submit');

    useEffect(() => {
        if (searchTerm) {
            const filtered = data.filter((item) => item.nama.toLowerCase().includes(searchTerm.toLowerCase()));
            setFilteredData(filtered);
        } else {
            setFilteredData(data);
        }
    }, [searchTerm, data]);

    const handleDateChange = (formattedDate: string | null) => {
        axios
            .get('/api/atmin/absensi/get-siswa?date=' + formattedDate) // Mengambil data siswa berdasarkan tanggal
            .then((response) => {
                const dataWithBonus = response.data.map((item: DataSiswa) => ({ ...item, bonus: false, keterangan: '' }));
                setData(dataWithBonus);
                setFilteredData(dataWithBonus); // Set initial filtered data
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    };

    useEffect(() => {
        if (formattedDate) {
            handleDateChange(formattedDate);
        }
        if (success) {
            handleDateChange(formattedDate);
        }
    }, [formattedDate, success]);

    const handleAddData = (row: DataSiswaWithBonus) => {
        const rowDataWithFormattedDate = {
            ...row,
            formattedDate, // Menambahkan formattedDate ke dalam data
        };
        setSelectedData([...selectedData, rowDataWithFormattedDate]);
        setFilteredData(filteredData.filter((item) => item.id !== row.id));
    };

    const handleCancel = () => {
        setFilteredData([...filteredData, ...selectedData]);
        setSelectedData([]);
    };

    const handleSubmit = () => {
        if (selectedData.length === 0) {
            toast.warning('Mohon pilih siswa terlebih dahulu.');
            // alert('Please select at least one student.');
            return;
        }

        setStatus('loading');
        setLoading(true);
        if (!date) {
            toast.warning('Mohon pilih tanggal terlebih dahulu.');
            setLoading(false);
            // alert('Please select a date first.');
            return;
        }
        axios
            .post('/api/atmin/absensi/store-absensi', { data: selectedData }) // Mengirim data tanggal dan siswa
            .then(() => {
                toast.success('Data berhasil disimpan', {
                    description: 'Data berhasil disimpan',
                });
                setSuccess(true);
                setLoading(false);
                setStatus('success');
                setTimeout(() => {
                    setStatus('submit');
                }, 2000);
            })
            .catch((error) => {
                setLoading(false);
                toast.error('Gagal menyimpan data', {
                    description: 'Terjadi kesalahan saat menyimpan data' + error.message,
                });
                console.error('Error saving data:', error);
            });
        setSelectedData([]);
    };

    return (
        <>
            <Toaster />
            <Drawer>
                <DrawerTrigger asChild>
                    <Button aria-hidden={'false'}>Tambah Data</Button>
                </DrawerTrigger>
                <DrawerContent className="w-full h-auto">
                    <div className="mx-auto h-auto w-full max-w-3xl">
                        <DrawerTitle>
                            <p className="text-xl font-bold">Tambah Data</p>
                        </DrawerTitle>
                        <DrawerDescription>tambah data daftar hadir</DrawerDescription>
                        {!date && (
                            <div className="w-full">
                                <h1 className="mt-6 text-xl font-bold">Pilih Tanggal</h1>
                                <DatePicker date={date} setDate={setDates} />
                            </div>
                        )}

                        {/* Input pencarian dan tabel siswa hanya muncul jika tanggal sudah dipilih */}
                        {date && (
                            <>
                                <div className="mb-2 grid w-full grid-cols-2 items-center gap-4">
                                    {/* Cari Siswa */}
                                    <div className="flex flex-col items-start">
                                        <h1 className="mt-6 text-base lg:text-xl font-bold">Cari Siswa</h1>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="Cari nama..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="max-w-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Pilih Tanggal */}
                                    <div className="flex flex-col">
                                        <h1 className="mt-6 text-base lg:text-xl font-bold">Pilih Tanggal</h1>
                                        <DatePicker date={date} setDate={setDates} />
                                    </div>
                                </div>
                                <div className="h-64 max-w-3xl table-auto overflow-y-auto rounded-md border">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-2 text-left">Nama</th>
                                                <th className="px-4 py-2 text-left">Alamat</th>
                                                <th className="px-4 py-2 text-left">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.length ? (
                                                filteredData.map((row) => (
                                                    <tr key={row.id} className="border-b">
                                                        <td className="w-fit px-4 capitalize">{row.nama}</td>
                                                        <td className="px-2 capitalize">{row.alamat}</td>
                                                        <td className="px-2 py-2">
                                                            <Button variant="success" onClick={() => handleAddData(row)}>
                                                                Add
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="p-2 text-center">
                                                        No results.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
                                Cancel
                            </Button>
                            <Button variant="default" size="sm" onClick={handleSubmit} disabled={loading}>
                                {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                {status}
                            </Button>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
