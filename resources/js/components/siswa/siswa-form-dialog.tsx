import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Siswa, SiswaFormData } from '@/types/siswa';

const siswaSchema = z.object({
    nama: z.string()
        .min(2, 'Nama minimal 2 karakter')
        .max(255, 'Nama maksimal 255 karakter')
        .regex(/^[a-zA-Z\s]+$/, 'Nama hanya boleh berisi huruf dan spasi'),
    alamat: z.string()
        .min(5, 'Alamat minimal 5 karakter')
        .max(1000, 'Alamat maksimal 1000 karakter'),
    status: z.boolean(),
});

interface SiswaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    siswa?: Siswa | null;
    onSubmit: (data: SiswaFormData) => void;
    isLoading: boolean;
}

export function SiswaFormDialog({
    open,
    onOpenChange,
    siswa,
    onSubmit,
    isLoading,
}: SiswaFormDialogProps) {
    const form = useForm<SiswaFormData>({
        resolver: zodResolver(siswaSchema),
        defaultValues: {
            nama: '',
            alamat: '',
            status: true,
        },
    });

    useEffect(() => {
        if (siswa) {
            form.reset({
                nama: siswa.nama,
                alamat: siswa.alamat,
                status: siswa.status,
            });
        } else {
            form.reset({
                nama: '',
                alamat: '',
                status: true,
            });
        }
    }, [siswa, form]);

    const handleSubmit = (data: SiswaFormData) => {
        onSubmit(data);
    };

    const handleClose = () => {
        form.reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {siswa ? 'Edit Siswa' : 'Tambah Siswa Baru'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="nama"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Lengkap *</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Masukkan nama lengkap"
                                            disabled={isLoading}
                                        />
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
                                    <FormLabel>Alamat Lengkap *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Masukkan alamat lengkap (jalan, RT/RW, kelurahan, kecamatan, kota)"
                                            rows={4}
                                            disabled={isLoading}
                                            className="resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Status Aktif</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            Siswa dapat mengikuti kegiatan sanggar dan dicatat absensinya
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Menyimpan...' : siswa ? 'Update' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}