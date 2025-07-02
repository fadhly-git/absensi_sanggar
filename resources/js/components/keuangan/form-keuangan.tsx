/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/costum-date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createTransaction, type NewTransactionPayload } from '@/services/keuanganApi';

// Types
interface TransactionField {
    keterangan: string;
    amount: string;
    displayAmount: string;
}

type TransactionType = 'masuk' | 'keluar';

// Utility functions
const formatCurrency = (value: string): string => {
    const number = value.replace(/\D/g, '');
    return number ? `Rp ${number.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` : '';
};

const validateFields = (fields: TransactionField[]): boolean => {
    return fields.every(field => field.keterangan.trim() && field.amount);
};

// Custom hook for form state management
const useTransactionForm = () => {
    const [fields, setFields] = useState<Record<TransactionType, TransactionField[]>>({
        masuk: [{ keterangan: '', amount: '', displayAmount: '' }],
        keluar: [{ keterangan: '', amount: '', displayAmount: '' }]
    });
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isOpen, setIsOpen] = useState(false);

    const resetForm = useCallback(() => {
        setFields({
            masuk: [{ keterangan: '', amount: '', displayAmount: '' }],
            keluar: [{ keterangan: '', amount: '', displayAmount: '' }]
        });
        setDate(new Date());
    }, []);

    return { fields, setFields, date, setDate, isOpen, setIsOpen, resetForm };
};

const TransactionFieldInput = React.memo(({
    field,
    index,
    type,
    onChange,
    onRemove,
    canRemove
}: {
    field: TransactionField;
    index: number;
    type: TransactionType;
    onChange: (index: number, fieldName: string, value: string) => void;
    onRemove: (index: number) => void;
    canRemove: boolean;
}) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
        {/* Keterangan */}
        <div className="flex items-center justify-between mb-1">
            <Label htmlFor={`keterangan-${type}-${index}`}>Keterangan</Label>
            {canRemove && (
                <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:bg-red-100"
                    aria-label="Hapus field"
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
            )}
        </div>
        <Input
            id={`keterangan-${type}-${index}`}
            value={field.keterangan}
            onChange={(e) => onChange(index, 'keterangan', e.target.value)}
            placeholder="Masukkan keterangan"
            autoComplete="off"
            className="mb-3 bg-white"
        />
        {/* Jumlah */}
        <div className="flex items-center justify-between mb-1">
            <Label htmlFor={`amount-${type}-${index}`}>Jumlah</Label>
        </div>
        <Input
            id={`amount-${type}-${index}`}
            inputMode="numeric"
            pattern="[0-9]*"
            value={field.displayAmount}
            onChange={(e) => onChange(index, 'amount', e.target.value)}
            placeholder="0"
            autoComplete="off"
            className="bg-white"
        />
    </div>
));

// Tab content component
const TransactionTabContent = React.memo(({
    type,
    fields,
    onFieldChange,
    onAddField,
    onRemoveField,
    onSubmit,
    isLoading
}: {
    type: TransactionType;
    fields: TransactionField[];
    onFieldChange: (index: number, fieldName: string, value: string) => void;
    onAddField: () => void;
    onRemoveField: (index: number) => void;
    onSubmit: () => void;
    isLoading: boolean;
}) => {
    const isValid = useMemo(() => validateFields(fields), [fields]);
    const typeLabel = type === 'masuk' ? 'Masuk' : 'Keluar';
    const buttonColor = type === 'masuk' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

    return (
        <TabsContent value={type} className="mt-0">
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <TransactionFieldInput
                        key={index}
                        field={field}
                        index={index}
                        type={type}
                        onChange={onFieldChange}
                        onRemove={onRemoveField}
                        canRemove={fields.length > 1}
                    />
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={onAddField}
                    className="w-full hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Field
                </Button>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={onSubmit}
                    disabled={!isValid || isLoading}
                    className={`ml-auto mt-2 ${buttonColor}`}
                >
                    {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Uang {typeLabel}
                </Button>
            </CardFooter>
        </TabsContent>
    );
});

// Main component
export function KeuanganTabs() {
    const { fields, setFields, date, setDate, isOpen, setIsOpen, resetForm } = useTransactionForm();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: (response) => {
            toast.success(response?.message || 'Data berhasil disimpan!');
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['saldo'] });
            resetForm();
            setIsOpen(false);
        },
        onError: (error: any) => {
            console.error('Transaction error:', error);

            // Handle different error types
            if (error?.response?.status === 422) {
                // Validation errors
                const validationErrors = error.response.data?.errors;
                if (validationErrors) {
                    Object.entries(validationErrors).forEach(([field, messages]: [string, any]) => {
                        toast.error(`${field}: ${Array.isArray(messages) ? messages[0] : messages}`);
                    });
                } else {
                    toast.error(error.response.data?.message || 'Data tidak valid');
                }
            } else if (error?.response?.status === 500) {
                toast.error('Terjadi kesalahan server. Silakan coba lagi.');
            } else {
                toast.error(error?.message || error?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
            }
        },
    });

    const handleFieldChange = useCallback((type: TransactionType, index: number, fieldName: string, value: string) => {
        setFields(prev => {
            const newFields = [...prev[type]];

            if (fieldName === 'amount') {
                const rawValue = value.replace(/\D/g, '');
                newFields[index] = {
                    ...newFields[index],
                    amount: rawValue,
                    displayAmount: formatCurrency(rawValue)
                };
            } else {
                newFields[index] = {
                    ...newFields[index],
                    [fieldName]: value
                };
            }

            return { ...prev, [type]: newFields };
        });
    }, [setFields]);

    const handleAddField = useCallback((type: TransactionType) => {
        setFields(prev => ({
            ...prev,
            [type]: [...prev[type], { keterangan: '', amount: '', displayAmount: '' }]
        }));
    }, [setFields]);

    const handleRemoveField = useCallback((type: TransactionType, index: number) => {
        setFields(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    }, [setFields]);

    const handleSubmit = useCallback((type: TransactionType) => {
        const typeFields = fields[type];

        // Validate fields
        if (!validateFields(typeFields)) {
            toast.error('Mohon isi semua field!');
            return;
        }

        // Validate date
        if (!date) {
            toast.error('Tanggal transaksi harus diisi!');
            return;
        }

        // Prepare payload
        const payload: NewTransactionPayload = {
            type,
            tanggal: format(date, 'yyyy-MM-dd'),
            data: typeFields.map(field => ({
                keterangan: field.keterangan.trim(),
                amount: field.amount // Keep as string, backend will handle conversion
            }))
        };

        console.log('Submitting payload:', payload);
        mutation.mutate(payload);
    }, [fields, date, mutation]);

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Data
                </Button>
            </DrawerTrigger>

            <DrawerContent>
                <div className="mx-auto w-full max-w-2xl">
                    <DrawerHeader>
                        <DrawerTitle className='w-full items-center flex justify-center text-lg'>Tambah Data Keuangan</DrawerTitle>
                        <DrawerDescription className='text-center text-base text-muted-foreground'>
                            Pilih tab dan isi form untuk menambahkan transaksi keuangan
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 pb-8">
                        <Tabs defaultValue="masuk" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="masuk" className="text-green-700">
                                    💰 Uang Masuk
                                </TabsTrigger>
                                <TabsTrigger value="keluar" className="text-red-700">
                                    💸 Uang Keluar
                                </TabsTrigger>
                            </TabsList>

                            <Card className="mt-4">
                                <CardHeader>
                                    <Label htmlFor="transaction-date">Tanggal Transaksi</Label>
                                    <DatePicker
                                        date={date}
                                        setDate={setDate}
                                    />
                                </CardHeader>

                                <TransactionTabContent
                                    type="masuk"
                                    fields={fields.masuk}
                                    onFieldChange={(index, fieldName, value) =>
                                        handleFieldChange('masuk', index, fieldName, value)
                                    }
                                    onAddField={() => handleAddField('masuk')}
                                    onRemoveField={(index) => handleRemoveField('masuk', index)}
                                    onSubmit={() => handleSubmit('masuk')}
                                    isLoading={mutation.isPending}
                                />

                                <TransactionTabContent
                                    type="keluar"
                                    fields={fields.keluar}
                                    onFieldChange={(index, fieldName, value) =>
                                        handleFieldChange('keluar', index, fieldName, value)
                                    }
                                    onAddField={() => handleAddField('keluar')}
                                    onRemoveField={(index) => handleRemoveField('keluar', index)}
                                    onSubmit={() => handleSubmit('keluar')}
                                    isLoading={mutation.isPending}
                                />
                            </Card>
                        </Tabs>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}