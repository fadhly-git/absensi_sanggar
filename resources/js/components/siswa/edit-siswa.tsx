import { DialogAlert } from '@/components/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    nama: z.string(),
    alamat: z.string(),
    status: z.number(),
});

interface DataSiswa {
    id: number;
    nama: string;
    alamat: string;
    status: number;
}

interface DataS {
    open: boolean;
    openDialog: () => void;
    data: DataSiswa | null;
    success: () => void;
}

export function DialogEditSiswa({ open, openDialog, data, success }: DataS) {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(false);
    const [remove, setRemove] = useState(false);
    const [id, setId] = useState(data?.id);
    const [nama, setNama] = useState(data?.nama);
    const [alamat, setAlamat] = useState(data?.alamat);
    const [status, setStatus] = useState(data?.status);

    useEffect(() => {
        setId(data?.id);
        setNama(data?.nama);
        setAlamat(data?.alamat);
        setStatus(data?.status);
    }, [data?.nama, data?.alamat, data?.status, data?.id]);

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama: '',
            alamat: '',
            status: 1,
        },
    });

    const HandleDelete = () => {
        setLoading(true);
        axios
            .delete('/api/atmin/siswa/delete/' + id)
            .then(() => {
                setLoading(false);
                success();
                toast.success('Data has been deleted.', {
                    description: 'Data has been deleted successfully.',
                });
                openDialog();
            })
            .catch((error) => {
                setLoading(false);
                toast.error('There was an error deleting the data', {
                    description: error,
                });
            });
    };

    const HandleDeleteClick = () => {
        setAlert(true);
    };

    if (remove) {
        HandleDelete();
        setRemove(false);
    }

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        values.alamat = alamat || '';
        values.nama = nama || '';
        values.status = status == 1 ? 1 : 0;
        axios
            .put(`/api/atmin/siswa/update/` + id, values)
            .then(() => {
                setLoading(false);
                success();
                toast.success('Data berhasil diupdate.', {
                    description: 'Data has been update successfully.',
                });
                openDialog();
            })
            .catch((error) => {
                setLoading(false);
                toast.error('There was an error submitting the data', {
                    description: error,
                });
            });
    }
    return (
        <>
            <DialogAlert type="delete" open={alert} openDialog={() => setAlert(!alert)} remove={() => setRemove(!remove)} />
            <Toaster />
            <Dialog open={open} onOpenChange={openDialog}>
                <DialogContent className="sm:max-w-[425px]" aria-describedby='"dialog-description">'>
                    <DialogHeader>
                        <DialogTitle>Edit siswa</DialogTitle>
                        <DialogDescription>Edit data siswa disini. Klik simpan jika selesai.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="nama"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Nama</FormLabel>
                                        <FormControl>
                                            <Input placeholder="nama" value={nama} onChange={(e) => setNama(e.target.value)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="alamat"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Alamat</FormLabel>
                                        <FormControl>
                                            <Input placeholder="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <Switch checked={status === 1} onCheckedChange={(checked) => setStatus(checked ? 1 : 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button variant="destructive" type="button" onClick={() => HandleDeleteClick()} disabled={loading}>
                                    {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Hapus
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
