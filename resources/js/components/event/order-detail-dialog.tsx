/* eslint-disable @typescript-eslint/no-explicit-any */
// resources/js/components/event/order-detail-dialog.tsx

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Calendar, Package } from 'lucide-react';
import type { Order } from '@/types/order';

interface OrderDetailDialogProps {
    open: boolean;
    onClose: () => void;
    order: Order | null;
}

export function OrderDetailDialog({
    open,
    onClose,
    order,
}: OrderDetailDialogProps) {
    if (!order) return null;

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'paid':
                return 'info';
            case 'processing':
                return 'default';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="flex h-[90vh] max-w-full flex-col p-0 sm:max-w-2xl">
                {/* Header */}
                <div className="flex-shrink-0 border-b bg-background px-4 py-4 sm:px-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <span className="font-mono">{order.invoice_code}</span>
                            <Badge variant={getStatusBadgeVariant(order.status) as any}>
                                {order.status_label}
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4">
                    {/* Buyer Info */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Informasi Pembeli
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Nama</span>
                                <span className="text-sm font-medium">
                                    {order.buyer_name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Tipe</span>
                                <Badge variant="outline">{order.buyer_type_label}</Badge>
                            </div>
                            {order.guest_phone && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        HP
                                    </span>
                                    <span className="text-sm font-medium">
                                        {order.guest_phone}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Tanggal Pesan
                                </span>
                                <span className="text-sm">{order.created_at_formatted}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Item Pesanan ({order.items_count} item)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {order.items.map((item, index) => (
                                <div key={item.id}>
                                    {index > 0 && <Separator className="my-3" />}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {item.product_name}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {item.category_label}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.size_label}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.sleeve_type_label}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <span className="text-sm font-semibold">
                                                {item.subtotal_formatted}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                                            <div>
                                                Dimensi: {item.width_cm} x {item.length_cm} cm
                                            </div>
                                            <div className="text-right">
                                                {item.quantity} x {item.price_formatted}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Total */}
                    <Card className="bg-primary/5">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total ({order.total_quantity} pcs)
                                    </p>
                                    <p className="text-2xl font-bold text-primary">
                                        {order.total_amount_formatted}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
