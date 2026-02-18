import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInput } from '@/components/atoms/currency-input';
import { productFormSchema } from '@/schemas/product-schema';
import type { Product, ProductFormData, SizeChart } from '@/types/product';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

interface ProductFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ProductFormData) => void;
    product: Product | null;
    isLoading: boolean;
}

export function ProductFormDialog({
    open,
    onClose,
    onSubmit,
    product,
    isLoading,
}: ProductFormDialogProps) {
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        po_deadline: new Date().toISOString().split('T')[0],
        size_charts: [],
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description || '',
                po_deadline: product.po_deadline,
                size_charts: product.size_charts,
            });
            if (product.image_url) {
                setImagePreview(`${product.image_url}`);
            }
        } else {
            setFormData({
                name: '',
                description: '',
                po_deadline: new Date().toISOString().split('T')[0],
                size_charts: [],
            });
            setImagePreview(null);
        }
    }, [product, open]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData({ ...formData, image: undefined });
        setImagePreview(null);
    };

    const addSizeChart = () => {
        setFormData({
            ...formData,
            size_charts: [
                ...formData.size_charts,
                {
                    category: 'kids',
                    size_label: '',
                    width_cm: 0,
                    length_cm: 0,
                    price_short_sleeve: 0,
                    price_long_sleeve: 0,
                },
            ],
        });
    };

    const removeSizeChart = (index: number) => {
        setFormData({
            ...formData,
            size_charts: formData.size_charts.filter((_, i) => i !== index),
        });
    };

    const updateSizeChart = (
        index: number,
        field: keyof SizeChart,
        value: string | number,
    ) => {
        const updated = [...formData.size_charts];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, size_charts: updated });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            // Validasi dengan Zod schema
            productFormSchema.parse(formData);
            onSubmit(formData);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    newErrors[path] = err.message;
                });
                setErrors(newErrors);
                // Scroll to first error
                const firstErrorElement = document.querySelector(
                    '[data-error="true"]',
                );
                if (firstErrorElement) {
                    firstErrorElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="flex h-[90vh] max-w-full flex-col p-0 sm:max-w-4xl">
                {/* Fixed Header */}
                <div className="flex-shrink-0 border-b bg-background px-4 py-4 sm:px-6">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-lg sm:text-xl">
                            {product ? 'Edit Produk' : 'Tambah Produk Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            Isi form di bawah untuk{' '}
                            {product ? 'mengubah' : 'menambahkan'} produk event
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                    <form
                        id="product-form"
                        onSubmit={handleSubmit}
                        className="space-y-4 sm:space-y-6"
                    >
                        {/* Basic Info */}
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-medium"
                                >
                                    Nama Produk{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        });
                                        setErrors({ ...errors, name: '' });
                                    }}
                                    placeholder="Contoh: Kaos Event 2025"
                                    className="mt-1.5"
                                    data-error={!!errors.name}
                                    required
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor="description"
                                    className="text-sm font-medium"
                                >
                                    Deskripsi
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Deskripsi produk..."
                                    className="mt-1.5 min-h-[80px]"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor="po_deadline"
                                    className="text-sm font-medium"
                                >
                                    Deadline PO{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="po_deadline"
                                    type="date"
                                    value={new Date(
                                        formData.po_deadline,
                                    )
                                        .toISOString()
                                        .split('T')[0]}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            po_deadline: e.target.value,
                                        });
                                        setErrors({
                                            ...errors,
                                            po_deadline: '',
                                        });
                                    }}
                                    className="mt-1.5"
                                    data-error={!!errors.po_deadline}
                                    required
                                />
                                <InputError
                                    message={errors.po_deadline}
                                    className="mt-1"
                                />
                            </div>
                            {/* Image Upload */}
                            <div>
                                <Label className="text-sm font-medium">
                                    Gambar Produk
                                </Label>
                                <div className="mt-1.5">
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-48 w-full max-w-xs rounded-lg border object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8"
                                                onClick={removeImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex w-full items-center justify-center">
                                            <label
                                                htmlFor="image-upload"
                                                className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 transition-colors hover:bg-gray-100"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="mb-3 h-8 w-8 text-gray-400 sm:h-10 sm:w-10" />
                                                    <p className="mb-2 text-xs text-gray-500 sm:text-sm">
                                                        <span className="font-semibold">
                                                            Klik untuk upload
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG (MAX. 2MB)
                                                    </p>
                                                </div>
                                                <input
                                                    id="image-upload"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Size Charts */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                    Ukuran & Harga{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Button
                                    type="button"
                                    onClick={addSizeChart}
                                    size="sm"
                                    variant="outline"
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    Tambah Ukuran
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {formData.size_charts.length === 0 ? (
                                    <Card className="border-dashed">
                                        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                            <p className="mb-3 text-sm text-muted-foreground">
                                                Belum ada ukuran yang
                                                ditambahkan
                                            </p>
                                            <Button
                                                type="button"
                                                onClick={addSizeChart}
                                                size="sm"
                                            >
                                                <Plus className="mr-1 h-4 w-4" />
                                                Tambah Ukuran Pertama
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    formData.size_charts.map((chart, index) => (
                                        <Card key={index} className="relative">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <CardTitle className="text-sm font-medium">
                                                        Ukuran #{index + 1}
                                                    </CardTitle>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() =>
                                                            removeSizeChart(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <Label className="text-xs">
                                                            Kategori
                                                        </Label>
                                                        <Select
                                                            value={
                                                                chart.category
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                updateSizeChart(
                                                                    index,
                                                                    'category',
                                                                    value as
                                                                        | 'kids'
                                                                        | 'adults',
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="mt-1">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="kids">
                                                                    Anak
                                                                </SelectItem>
                                                                <SelectItem value="adults">
                                                                    Dewasa
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">
                                                            Label Ukuran
                                                        </Label>
                                                        <Input
                                                            value={
                                                                chart.size_label
                                                            }
                                                            onChange={(e) =>
                                                                updateSizeChart(
                                                                    index,
                                                                    'size_label',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="S, M, L, XL"
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs">
                                                            Lebar (cm)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={
                                                                chart.width_cm
                                                            }
                                                            onChange={(e) =>
                                                                updateSizeChart(
                                                                    index,
                                                                    'width_cm',
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">
                                                            Panjang (cm)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={
                                                                chart.length_cm
                                                            }
                                                            onChange={(e) =>
                                                                updateSizeChart(
                                                                    index,
                                                                    'length_cm',
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>
                                               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <Label className="text-xs">
                                                            Harga Lengan Pendek
                                                            (Rp)
                                                        </Label>

                                                      <CurrencyInput
                                                           value={chart.price_short_sleeve}
                                                           onValueChange={(val) => {
                                                               updateSizeChart(
                                                                   index,
                                                                   'price_short_sleeve',
                                                                   val,
                                                               );
                                                               setErrors({
                                                                   ...errors,
                                                                   [`size_charts.${index}.price_short_sleeve`]:
                                                                       '',
                                                               });
                                                           }}
                                                           placeholder="0"
                                                           className="mt-1"
                                                           data-error={
                                                               !!errors[
                                                                   `size_charts.${index}.price_short_sleeve`
                                                               ]
                                                           }
                                                       />
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `size_charts.${index}.price_short_sleeve`
                                                                ]
                                                            }
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">
                                                            Harga Lengan Panjang
                                                            (Rp)
                                                        </Label>

                                                      <CurrencyInput
                                                           value={chart.price_long_sleeve}
                                                           onValueChange={(val) => {
                                                               updateSizeChart(
                                                                   index,
                                                                   'price_long_sleeve',
                                                                   val,
                                                               );
                                                               setErrors({
                                                                   ...errors,
                                                                   [`size_charts.${index}.price_long_sleeve`]:
                                                                       '',
                                                               });
                                                           }}
                                                           placeholder="0"
                                                           className="mt-1"
                                                           data-error={
                                                               !!errors[
                                                                   `size_charts.${index}.price_long_sleeve`
                                                               ]
                                                           }
                                                       />
                                                        <InputError
                                                            message={
                                                                errors[
                                                                    `size_charts.${index}.price_long_sleeve`
                                                                ]
                                                            }
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </form>
                </div>
                <div className="flex-shrink-0 border-t bg-background px-4 py-4 sm:px-6">
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3 sm:items-center sm:justify-beetween">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                onClick={addSizeChart}
                                size="sm"
                                variant="outline"
                                disabled={isLoading}
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                Tambah Ukuran
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                                className="w-full sm:w-auto sm:min-w-[100px]"
                            >
                                Batal
                            </Button>
                        </div>
                        <Button
                            type="submit"
                            form="product-form"
                            disabled={isLoading}
                            className="w-full sm:flex-1"
                        >
                            {isLoading
                                ? 'Menyimpan...'
                                : product
                                  ? 'Simpan Perubahan'
                                  : 'Tambah Produk'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
