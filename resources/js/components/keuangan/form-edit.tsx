import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { LoaderCircle } from 'lucide-react';

// Impor dari service API, bukan dari data-table
import { type DataKeuangan, type UpdateTransactionPayload, updateTransaction } from '@/services/keuanganApi'; 
import { DatePicker } from '../costum-date-picker';

interface UangMasukField {
    open: boolean;
    openDialog: () => void;
    data: DataKeuangan | null;
}

// Fungsi format angka bisa kita letakkan di sini atau di file utils terpisah
const formatNumberDisplay = (value: string) => 'Rp. ' + value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function KeuanganMskEditTabs({ open, openDialog, data }: UangMasukField) {
    const [keterangan, setKeterangan] = useState('');
    const [amount, setAmount] = useState('');
    const [displayAmount, setDisplayAmount] = useState('');
    const [date, setDate] = useState<Date | undefined>();

    const queryClient = useQueryClient();

    useEffect(() => {
        if (data) {
            setKeterangan(data.keterangan);
            setAmount(String(data.jumlah));
            setDisplayAmount(formatNumberDisplay(String(data.jumlah)));
            setDate(new Date(data.tanggal));
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: updateTransaction,
        onSuccess: (response) => {
            toast.success(response.message || 'Data berhasil diperbarui!');
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['saldo'] });
            openDialog(); // Tutup dialog
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal memperbarui data.');
        },
    });

    const handleAmountChange = (value: string) => {
        const rawValue = value.replace(/\D/g, '');
        setAmount(rawValue);
        setDisplayAmount(rawValue ? formatNumberDisplay(rawValue) : '');
    };

    const handleSubmit = () => {
        const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;

        if (!keterangan || !amount || !formattedDate || !data) {
            toast.error('Mohon lengkapi semua field!');
            return;
        }

        const payload: UpdateTransactionPayload = {
            type: 'masuk',
            tanggal: formattedDate,
            data: [{ amount, keterangan }],
        };

        mutation.mutate({ id: data.id, payload });
    };

    return (
        <Drawer open={open} onOpenChange={openDialog}>
            <DrawerContent>
                <div className="mx-auto w-full max-w-xl p-4">
                    <DrawerHeader>
                        <DrawerTitle>Edit Data Uang Masuk</DrawerTitle>
                        <DrawerDescription>Ubah data transaksi yang sudah ada.</DrawerDescription>
                    </DrawerHeader>
                    <div className="space-y-4 p-4">
                        <div><Label>Tanggal</Label><DatePicker date={date} setDate={setDate} /></div>
                        <div><Label>Keterangan</Label><Input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} /></div>
                        <div><Label>Jumlah</Label><Input value={displayAmount} onChange={(e) => handleAmountChange(e.target.value)} /></div>
                        <div className="flex justify-end">
                            <Button onClick={handleSubmit} disabled={mutation.isPending}>
                                {mutation.isPending && <LoaderCircle className='mr-2 h-4 w-4 animate-spin' />}
                                Perbarui Data
                            </Button>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}