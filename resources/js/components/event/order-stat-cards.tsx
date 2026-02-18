// resources/js/components/event/order-stat-cards.tsx

import { Card, CardContent } from '@/components/ui/card';
import {
    ShoppingCart,
    Clock,
    CreditCard,
    Package,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import type { OrderStatistics } from '@/types/order';

interface OrderStatCardsProps {
    stats: OrderStatistics;
}

export function OrderStatCards({ stats }: OrderStatCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const statItems = [
        {
            label: 'Total Pesanan',
            value: stats.total_orders,
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            label: 'Pending',
            value: stats.pending_count,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
        },
        {
            label: 'Sudah Bayar',
            value: stats.paid_count,
            icon: CreditCard,
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-100',
        },
        {
            label: 'Diproses',
            value: stats.processing_count,
            icon: Package,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            label: 'Selesai',
            value: stats.completed_count,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            label: 'Batal',
            value: stats.cancelled_count,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {statItems.map((item) => (
                <Card key={item.label}>
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`p-2 rounded-lg ${item.bgColor}`}>
                                <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                            </div>
                            <div>
                                <p className="text-lg sm:text-xl font-bold">{item.value}</p>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Card className="col-span-2 sm:col-span-3 lg:col-span-6">
                <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Pendapatan</span>
                        <span className="text-lg sm:text-xl font-bold text-green-600">
                            {formatCurrency(stats.total_revenue)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
