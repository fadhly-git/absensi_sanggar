import { DatePicker } from '@/components/costum-date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createTransaction, NewTransactionPayload } from '@/services/keuanganApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

type FieldType = 'keterangan' | 'amount' | 'displayAmount';

export function KeuanganTabs() {
    const [uangMasukFields, setUangMasukFields] = useState([{ keterangan: '', amount: '', displayAmount: '' }]);
    const [uangKeluarFields, setUangKeluarFields] = useState([{ keterangan: '', amount: '', displayAmount: '' }]);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: (response) => {
            toast.success(response.message || 'Data berhasil disimpan!');
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['saldo'] });
            setIsDrawerOpen(false); // Tutup drawer setelah sukses
            // Reset form
            setUangMasukFields([{ keterangan: '', amount: '', displayAmount: '' }]);
            setUangKeluarFields([{ keterangan: '', amount: '', displayAmount: '' }]);
        },
        onError: (error) => {
            toast.error(error.message || 'Terjadi kesalahan saat menyimpan data.');
        },
    });

    const formatNumber = (value: string) => 'Rp. ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    const addField = (type: 'masuk' | 'keluar') => {
        const newField = { keterangan: '', amount: '', displayAmount: '' };
        if (type === 'masuk') setUangMasukFields(prev => [...prev, newField]);
        else setUangKeluarFields(prev => [...prev, newField]);
    };

    const removeField = (type: 'masuk' | 'keluar', index: number) => {
        if (type === 'masuk') setUangMasukFields(prev => prev.filter((_, i) => i !== index));
        else setUangKeluarFields(prev => prev.filter((_, i) => i !== index));
    };

    const handleInputChange = (type: 'masuk' | 'keluar', index: number, field: string, value: string) => {
        const fields = type === 'masuk' ? [...uangMasukFields] : [...uangKeluarFields];
        const setter = type === 'masuk' ? setUangMasukFields : setUangKeluarFields;

        if (field === 'amount') {
            const rawValue = value.replace(/\D/g, '');
            fields[index].amount = rawValue;
            fields[index].displayAmount = rawValue ? formatNumber(rawValue) : '';
        } else {
            fields[index][field as FieldType] = value;
        }
        setter(fields);
    };

    const handleSubmit = (type: 'masuk' | 'keluar') => {
        const data = type === 'masuk' ? uangMasukFields : uangKeluarFields;
        const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;

        if (!data.every(item => item.keterangan && item.amount) || !formattedDate) {
            toast.error('Mohon isi semua field dan tanggal!');
            return;
        }

        const payload: NewTransactionPayload = {
            type,
            tanggal: formattedDate,
            data: data.map(item => ({ keterangan: item.keterangan, amount: item.amount })),
        };
        mutation.mutate(payload);
    };

    return (
        <>
            <Toaster />
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild><Button>Tambah Data</Button></DrawerTrigger>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-xl">
                        <DrawerHeader>
                            <DrawerTitle>Tambah Data Keuangan</DrawerTitle>
                            <DrawerDescription>Isi form di bawah untuk menambahkan data.</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4">
                            <Tabs defaultValue="masuk" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="masuk">Uang Masuk</TabsTrigger>
                                    <TabsTrigger value="keluar">Uang Keluar</TabsTrigger>
                                </TabsList>
                                <Card className="mt-4">
                                    <CardHeader>
                                        <Label>Tanggal</Label>
                                        <DatePicker date={date} setDate={setDate} />
                                    </CardHeader>
                                    <TabsContent value="masuk">
                                        <CardContent className="space-y-4">
                                            {uangMasukFields.map((field, index) => (
                                                <div key={index} className="flex items-end gap-2">
                                                    <div className="flex-1"> <Label>Keterangan</Label> <Input value={field.keterangan} onChange={e => handleInputChange('masuk', index, 'keterangan', e.target.value)} /> </div>
                                                    <div className="flex-1"> <Label>Jumlah</Label> <Input value={field.displayAmount} onChange={e => handleInputChange('masuk', index, 'amount', e.target.value)} /> </div>
                                                    <Button variant="destructive" onClick={() => removeField('masuk', index)}>Hapus</Button>
                                                </div>
                                            ))}
                                            <Button variant="outline" onClick={() => addField('masuk')}>Tambah Field</Button>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="ml-auto" onClick={() => handleSubmit('masuk')} disabled={mutation.isPending}>
                                                {mutation.isPending && <LoaderCircle className='mr-2 h-4 w-4 animate-spin' />} Simpan Uang Masuk
                                            </Button>
                                        </CardFooter>
                                    </TabsContent>
                                    <TabsContent value="keluar">
                                        <CardContent className="space-y-4">
                                            {uangKeluarFields.map((field, index) => (
                                                <div key={index} className="flex items-end gap-2">
                                                    <div className="flex-1"> <Label>Keterangan</Label> <Input value={field.keterangan} onChange={e => handleInputChange('keluar', index, 'keterangan', e.target.value)} /> </div>
                                                    <div className="flex-1"> <Label>Jumlah</Label> <Input value={field.displayAmount} onChange={e => handleInputChange('keluar', index, 'amount', e.target.value)} /> </div>
                                                    <Button variant="destructive" onClick={() => removeField('keluar', index)}>Hapus</Button>
                                                </div>
                                            ))}
                                            <Button variant="outline" onClick={() => addField('keluar')}>Tambah Field</Button>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="ml-auto" onClick={() => handleSubmit('keluar')} disabled={mutation.isPending}>
                                                {mutation.isPending && <LoaderCircle className='mr-2 h-4 w-4 animate-spin' />} Simpan Uang Keluar
                                            </Button>
                                        </CardFooter>
                                    </TabsContent>
                                </Card>
                            </Tabs>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}