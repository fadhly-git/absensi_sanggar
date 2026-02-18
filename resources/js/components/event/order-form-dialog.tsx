/* eslint-disable @typescript-eslint/no-explicit-any */
// resources/js/components/event/order-form-dialog.tsx

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, User, Users, Minus } from 'lucide-react';
import { orderService } from '@/services/orderService';
import type {
    Order,
    OrderFormData,
    OrderFormItem,
    SizeChart,
    SleeveType,
} from '@/types/order';

interface OrderFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: OrderFormData) => void;
    order: Order | null;
    isLoading: boolean;
}

export function OrderFormDialog({
    open,
    onClose,
    onSubmit,
    order,
    isLoading,
}: OrderFormDialogProps) {
    const [buyerType, setBuyerType] = useState<'student' | 'guest'>('student');
    const [studentId, setStudentId] = useState<number | null>(null);
    const [studentSearch, setStudentSearch] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [items, setItems] = useState<OrderFormItem[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch students
    const { data: students = [] } = useQuery({
        queryKey: ['students', studentSearch],
        queryFn: () => orderService.getStudents(studentSearch),
        enabled: open && buyerType === 'student',
    });

    // Fetch products with sizes
    const { data: products = [] } = useQuery({
        queryKey: ['products-with-sizes'],
        queryFn: () => orderService.getProducts(),
        enabled: open,
    });

    useEffect(() => {
        if (!open) return;

        if (order && products.length > 0) {
            setBuyerType(order.student_id ? 'student' : 'guest');
            setStudentId(order.student_id);
            setGuestName(order.guest_name || '');
            setGuestPhone(order.guest_phone || '');
            // Convert order items to form items (need to find size_chart_id)
            const formItems: OrderFormItem[] = order.items.map((item) => {
                const product = products.find((p) => p.id === item.product_id);
                const sizeChart = product?.size_charts.find(
                    (sc) =>
                        sc.size_label === item.size_label &&
                        sc.category === item.category
                );
                return {
                    id: item.id,
                    product_id: item.product_id,
                    size_chart_id: sizeChart?.id || 0,
                    sleeve_type: item.sleeve_type,
                    quantity: item.quantity,
                };
            });
            setItems(formItems);
        } else if (!order && open) {
            resetForm();
        }
    }, [order, open]);

    const resetForm = () => {
        setBuyerType('student');
        setStudentId(null);
        setStudentSearch('');
        setGuestName('');
        setGuestPhone('');
        setItems([]);
        setErrors({});
    };

    const addItem = () => {
        setItems([
            ...items,
            {
                product_id: 0,
                size_chart_id: 0,
                sleeve_type: 'short',
                quantity: 1,
            },
        ]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof OrderFormItem, value: any) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };

        // Reset size_chart_id when product changes
        if (field === 'product_id') {
            updated[index].size_chart_id = 0;
        }

        setItems(updated);
    };

    const getProductSizeCharts = (productId: number): SizeChart[] => {
        const product = products.find((p) => p.id === productId);
        return product?.size_charts || [];
    };

    const getSizeChartPrice = (
        sizeChart: SizeChart | undefined,
        sleeveType: SleeveType
    ): number => {
        if (!sizeChart) return 0;
        return sleeveType === 'long'
            ? sizeChart.price_long_sleeve
            : sizeChart.price_short_sleeve;
    };

    const calculateTotal = (): number => {
        return items.reduce((total, item) => {
            const sizeChart = getProductSizeCharts(item.product_id).find(
                (sc) => sc.id === item.size_chart_id
            );
            const price = getSizeChartPrice(sizeChart, item.sleeve_type);
            return total + price * item.quantity;
        }, 0);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const newErrors: Record<string, string> = {};

        if (buyerType === 'student' && !studentId) {
            newErrors.student = 'Pilih siswa terlebih dahulu';
        }
        if (buyerType === 'guest') {
            if (!guestName.trim()) newErrors.guest_name = 'Nama tamu wajib diisi';
            if (!guestPhone.trim()) newErrors.guest_phone = 'Nomor HP wajib diisi';
        }
        if (items.length === 0) {
            newErrors.items = 'Minimal harus ada 1 item pesanan';
        }
        items.forEach((item, index) => {
            if (!item.product_id) {
                newErrors[`items.${index}.product_id`] = 'Pilih produk';
            }
            if (!item.size_chart_id) {
                newErrors[`items.${index}.size_chart_id`] = 'Pilih ukuran';
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const formData: OrderFormData = {
            student_id: buyerType === 'student' ? studentId : null,
            guest_name: buyerType === 'guest' ? guestName : undefined,
            guest_phone: buyerType === 'guest' ? guestPhone : undefined,
            items: items,
        };

        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="flex h-[90vh] max-w-full flex-col p-0 sm:max-w-3xl">
                {/* Fixed Header */}
                <div className="flex-shrink-0 border-b bg-background px-4 py-4 sm:px-6">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-lg sm:text-xl">
                            {order ? 'Edit Pesanan' : 'Tambah Pesanan Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            {order
                                ? `Edit pesanan ${order.invoice_code}`
                                : 'Isi form untuk membuat pesanan baru'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                    <form
                        id="order-form"
                        onSubmit={handleSubmit}
                        className="space-y-4 sm:space-y-6"
                    >
                        {/* Buyer Type Selection */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">
                                Tipe Pembeli <span className="text-red-500">*</span>
                            </Label>
                            <RadioGroup
                                value={buyerType}
                                onValueChange={(value) =>
                                    setBuyerType(value as 'student' | 'guest')
                                }
                                className="grid grid-cols-2 gap-3"
                            >
                                <Label
                                    htmlFor="student"
                                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                        buyerType === 'student'
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    <RadioGroupItem value="student" id="student" />
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm font-medium">Siswa</span>
                                    </div>
                                </Label>
                                <Label
                                    htmlFor="guest"
                                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                        buyerType === 'guest'
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    <RadioGroupItem value="guest" id="guest" />
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span className="text-sm font-medium">Umum</span>
                                    </div>
                                </Label>
                            </RadioGroup>
                        </div>

                        {/* Student Selection */}
                        {buyerType === 'student' && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Pilih Siswa <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Ketik nama siswa..."
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    className="mb-2"
                                />
                                <div className="max-h-48 overflow-y-auto border rounded-lg">
                                    {students.length === 0 ? (
                                        <p className="p-4 text-sm text-muted-foreground text-center">
                                            {studentSearch
                                                ? 'Siswa tidak ditemukan'
                                                : 'Ketik untuk mencari siswa'}
                                        </p>
                                    ) : (
                                        students.map((student) => (
                                            <div
                                                key={student.id}
                                                className={`p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                                                    studentId === student.id
                                                        ? 'bg-primary/10'
                                                        : 'hover:bg-muted'
                                                }`}
                                                onClick={() => setStudentId(student.id)}
                                            >
                                                <p className="font-medium text-sm">
                                                    {student.name}
                                                </p>
                                                <Badge variant="outline" className="text-xs mt-1">
                                                    {student.status}
                                                </Badge>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {errors.student && (
                                    <p className="text-xs text-red-500">{errors.student}</p>
                                )}
                            </div>
                        )}

                        {/* Guest Info */}
                        {buyerType === 'guest' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="Nama lengkap"
                                        className="mt-1.5"
                                    />
                                    {errors.guest_name && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.guest_name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">
                                        Nomor HP <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={guestPhone}
                                        onChange={(e) => setGuestPhone(e.target.value)}
                                        type='tel'
                                        placeholder="08xxxxxxxxxx"
                                        className="mt-1.5"
                                    />
                                    {errors.guest_phone && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.guest_phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">
                                    Item Pesanan <span className="text-red-500">*</span>
                                </Label>
                                <Button
                                    type="button"
                                    onClick={addItem}
                                    size="sm"
                                    variant="outline"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Tambah Item
                                </Button>
                            </div>

                            {errors.items && (
                                <p className="text-xs text-red-500">{errors.items}</p>
                            )}

                            {items.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Belum ada item pesanan
                                        </p>
                                        <Button
                                            type="button"
                                            onClick={addItem}
                                            size="sm"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Tambah Item Pertama
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {items.map((item, index) => {
                                        const sizeCharts = getProductSizeCharts(
                                            item.product_id
                                        );
                                        const selectedSizeChart = sizeCharts.find(
                                            (sc) => sc.id === item.size_chart_id
                                        );
                                        const itemPrice = getSizeChartPrice(
                                            selectedSizeChart,
                                            item.sleeve_type
                                        );
                                        const subtotal = itemPrice * item.quantity;

                                        return (
                                            <Card key={index}>
                                                <CardHeader className="p-3 pb-2">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-sm">
                                                            Item #{index + 1}
                                                        </CardTitle>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-3 pt-0 space-y-3">
                                                    {/* Product Selection */}
                                                    <div>
                                                        <Label className="text-xs">Produk</Label>
                                                        <Select
                                                            value={
                                                                item.product_id
                                                                    ? item.product_id.toString()
                                                                    : ''
                                                            }
                                                            onValueChange={(value) =>
                                                                updateItem(
                                                                    index,
                                                                    'product_id',
                                                                    parseInt(value)
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="mt-1">
                                                                <SelectValue placeholder="Pilih produk" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {products.map((product) => (
                                                                    <SelectItem
                                                                        key={product.id}
                                                                        value={product.id.toString()}
                                                                    >
                                                                        {product.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors[`items.${index}.product_id`] && (
                                                            <p className="text-xs text-red-500 mt-1">
                                                                {errors[`items.${index}.product_id`]}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Size Selection */}
                                                    {item.product_id > 0 && (
                                                        <div>
                                                            <Label className="text-xs">
                                                                Ukuran
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    item.size_chart_id
                                                                        ? item.size_chart_id.toString()
                                                                        : ''
                                                                }
                                                                onValueChange={(value) =>
                                                                    updateItem(
                                                                        index,
                                                                        'size_chart_id',
                                                                        parseInt(value)
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="mt-1">
                                                                    <SelectValue placeholder="Pilih ukuran" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {sizeCharts.map((sc) => (
                                                                        <SelectItem
                                                                            key={sc.id}
                                                                            value={sc.id.toString()}
                                                                        >
                                                                            {sc.size_label} -{' '}
                                                                            {sc.category_label} (
                                                                            {sc.width_cm}x{sc.length_cm}{' '}
                                                                            cm)
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {errors[
                                                                `items.${index}.size_chart_id`
                                                            ] && (
                                                                <p className="text-xs text-red-500 mt-1">
                                                                    {
                                                                        errors[
                                                                            `items.${index}.size_chart_id`
                                                                        ]
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Sleeve Type & Quantity */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label className="text-xs">
                                                                Tipe Lengan
                                                            </Label>
                                                            <Select
                                                                value={item.sleeve_type}
                                                                onValueChange={(value) =>
                                                                    updateItem(
                                                                        index,
                                                                        'sleeve_type',
                                                                        value as SleeveType
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger className="mt-1">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="short">
                                                                        Pendek
                                                                    </SelectItem>
                                                                    <SelectItem value="long">
                                                                        Panjang
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">
                                                                Jumlah
                                                            </Label>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-9 w-9"
                                                                    onClick={() =>
                                                                        updateItem(
                                                                            index,
                                                                            'quantity',
                                                                            Math.max(
                                                                                1,
                                                                                item.quantity - 1
                                                                            )
                                                                        )
                                                                    }
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </Button>
                                                                <Input
                                                                    type="number"
                                                                    value={item.quantity}
                                                                    onChange={(e) =>
                                                                        updateItem(
                                                                            index,
                                                                            'quantity',
                                                                            Math.max(
                                                                                1,
                                                                                parseInt(
                                                                                    e.target.value
                                                                                ) || 1
                                                                            )
                                                                        )
                                                                    }
                                                                    className="text-center"
                                                                    min={1}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-9 w-9"
                                                                    onClick={() =>
                                                                        updateItem(
                                                                            index,
                                                                            'quantity',
                                                                            item.quantity + 1
                                                                        )
                                                                    }
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Item Subtotal */}
                                                    {selectedSizeChart && (
                                                        <div className="flex justify-between items-center pt-2 border-t">
                                                            <span className="text-xs text-muted-foreground">
                                                                Subtotal
                                                            </span>
                                                            <span className="font-semibold text-sm">
                                                                {formatCurrency(subtotal)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        {items.length > 0 && (
                            <Card className="bg-primary/5">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Total Pembayaran</span>
                                        <span className="text-xl font-bold text-primary">
                                            {formatCurrency(calculateTotal())}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </form>
                </div>

                {/* Fixed Footer */}
                <div className="flex-shrink-0 border-t bg-background px-4 py-4 sm:px-6">
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full sm:w-auto sm:min-w-[100px]"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="order-form"
                            disabled={isLoading}
                            className="w-full sm:flex-1"
                        >
                            {isLoading
                                ? 'Menyimpan...'
                                : order
                                  ? 'Simpan Perubahan'
                                  : 'Buat Pesanan'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
