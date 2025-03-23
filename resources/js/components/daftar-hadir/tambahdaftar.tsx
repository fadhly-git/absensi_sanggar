import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
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

export function DataDH() {
    const [data, setData] = useState<DataSiswaWithBonus[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState<DataSiswaWithBonus[]>([]);
    const [selectedData, setSelectedData] = useState<DataSiswaWithBonus[]>([]);
    const [date, setDate] = useState<Date | undefined>(undefined); // Menambahkan tipe undefined
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;
    const [success, setSuccess] = useState(false);

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
            .get('/api/absensi/get-s?date=' + formattedDate) // Mengambil data siswa berdasarkan tanggal
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
        if (!date) {
            alert('Please select a date first.');
            return;
        }
        axios
            .post('/api/absensi/store', { data: selectedData }) // Mengirim data tanggal dan siswa
            .then(() => {
                toast.success('Data berhasil disimpan', {
                    description: 'Data berhasil disimpan',
                });
                setSuccess(true);
            })
            .catch((error) => {
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
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Tambah Data</Button>
                </DialogTrigger>
                <DialogContent className="min-w-[820px]">
                    <DialogTitle>Tambah Data</DialogTitle>
                    <div className="w-full">
                        <h1 className="mt-6 text-xl font-bold">Pilih Tanggal</h1>
                        <DatePickerDemo date={date} setDate={setDate} />
                    </div>

                    {/* Input pencarian dan tabel siswa hanya muncul jika tanggal sudah dipilih */}
                    {date && (
                        <>
                            <div className="w-full">
                                <h1 className="mt-6 text-xl font-bold">Cari Siswa</h1>
                                <div className="mx-2 flex items-center gap-2 py-4">
                                    <Input
                                        placeholder="Cari nama..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="max-w-sm"
                                    />
                                </div>
                            </div>
                            <div className="w-3xl rounded-md border">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-4 py-2 text-left">Nama</th>
                                            <th className="px-4 py-2 text-left">Alamat</th>
                                            <th className="px-4 py-2 text-left">Bonus</th>
                                            <th className="px-4 py-2 text-left">Keterangan</th>
                                            <th className="px-4 py-2 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length ? (
                                            filteredData.map((row) => (
                                                <tr key={row.id} className="border-b">
                                                    <td className="w-fit px-4 capitalize">{row.nama}</td>
                                                    <td className="px-4 capitalize">{row.alamat}</td>
                                                    <td className="px-4">
                                                        <Switch
                                                            checked={row.bonus}
                                                            onCheckedChange={(checked) => {
                                                                const newData = filteredData.map((item) =>
                                                                    item.id === row.id ? { ...item, bonus: checked } : item,
                                                                );
                                                                setFilteredData(newData);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            value={row.keterangan}
                                                            onChange={(e) => {
                                                                const newData = filteredData.map((item) =>
                                                                    item.id === row.id ? { ...item, keterangan: e.target.value } : item,
                                                                );
                                                                setFilteredData(newData);
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <Button onClick={() => handleAddData(row)}>Add</Button>
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
                        <Button variant="outline" size="sm" onClick={handleSubmit}>
                            Submit
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function DatePickerDemo({ date, setDate }: { date: Date | undefined; setDate: React.Dispatch<React.SetStateAction<Date | undefined>> }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant={'outline'} className={cn('w-[240px] justify-start text-left font-normal', !date && 'text-muted-foreground')}>
                    <CalendarIcon />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
        </Popover>
    );
}
