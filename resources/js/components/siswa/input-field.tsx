import { Button } from '@/components/ui/button';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast, Toaster } from 'sonner';
import { z } from 'zod';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
    nama: z.string().min(2, {
        message: 'Nama minimal 2 karakter',
    }),
    alamat: z.string().min(2).max(255),
    status: z.number(),
});

interface DialogProps {
    success: () => void;
}

export function DialogDemo({ success }: DialogProps) {
    const [loading, setLoading] = useState(false);
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama: '',
            alamat: '',
            status: 1,
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        axios
            .post('/api/atmin/siswa/store', values)
            .then(() => {
                setLoading(false);
                success();
                form.reset();
                toast.success('Data successfully submitted.', {
                    description: 'Event has been created successfully.',
                });
            })
            .catch((error) => {
                setLoading(false);
                toast.warning('There was an error submitting the data', {
                    description: error.message,
                });
            });
    }
    return (
        <>
            <Toaster />
            <Drawer>
                <DrawerTrigger asChild>
                    <Button>Siswa baru</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Tambah siswa</DialogTitle>
                            <DialogDescription>Tambah data siswa disini. Klik simpan jika selesai.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="nama"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama</FormLabel>
                                            <FormControl>
                                                <Input placeholder="nama" {...field} value={field.value} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="alamat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Alamat</FormLabel>
                                            <FormControl>
                                                <Input placeholder="alamat" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value === 1} onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button className="mb-4 ml-auto flex items-end" type="submit" disabled={loading}>
                                    {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Simpan
                                </Button>
                            </form>
                        </Form>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
