import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    FileSpreadsheet,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { orderService } from '@/services/orderService';
import { OrderFormDialog } from '@/components/event/order-form-dialog';
import { OrderDetailDialog } from '@/components/event/order-detail-dialog';
import { OrderExportDialog } from '@/components/event/order-export-dialog';
import { OrderStatCards } from '@/components/event/order-stat-cards';
import type { Order, OrderFormData, OrderStatus } from '@/types/order';
import type { BreadcrumbItem } from '@/types';
import { getMetaValue } from '@/lib/utils';

interface OrdersResponse {
    data: Order[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number | null;
        to?: number | null;
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {title: 'Event', href: 'atmin.event.orders'},
    {title: 'Orders', href: 'orders'},
];

const STATUS_OPTIONS: {label: string; value: OrderStatus | 'all'}[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Processing', value: 'processing' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
];

interface PageProps {
    filters?: {
        status?: OrderStatus;
        search?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function OrdersPage({ filters: initialFilters }: PageProps){
    const [isExporting, setIsExporting] = useState(false);
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState(initialFilters?.search || '');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(
        initialFilters?.status || 'all'
    );
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Fetch orders with react-query
    const { data, isLoading, error, refetch } = useQuery<OrdersResponse, Error>({
        queryKey: ['orders', page, search, statusFilter],
        queryFn: () =>
            orderService.getAll(page, {
                status: statusFilter === 'all' ? undefined : statusFilter,
                search: search || undefined,
            }),
        placeholderData: keepPreviousData,
    });
    const lastPage = getMetaValue(data?.meta?.last_page) ?? 1;
    const total = getMetaValue(data?.meta?.total) ?? 0;

    // Fetch statistics
    const { data: stats } = useQuery({
        queryKey: ['order-statistics'],
        queryFn: () => orderService.getStatistics(),
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: OrderFormData) => orderService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order-statistics'] });
            toast.success('Pesanan berhasil ditambahkan');
            setIsFormOpen(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Gagal menambahkan pesanan');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: OrderFormData }) =>
            orderService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order-statistics'] });
            toast.success('Pesanan berhasil diperbarui');
            setIsFormOpen(false);
            setSelectedOrder(null);
        },
        onError: () => {
            toast.error('Gagal memperbarui pesanan');
        },
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
            orderService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order-statistics'] });
            toast.success('Status pesanan berhasil diubah');
        },
        onError: () => {
            toast.error('Gagal mengubah status');

        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => orderService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order-statistics'] });
            toast.success('Pesanan berhasil dihapus');
        },
        onError: () => {
            toast.error('Gagal menghapus pesanan');
        },
    });

    const handleCreate = () => {
        setSelectedOrder(null);
        setIsFormOpen(true);
    };

    const handleEdit = (order: Order) => {
        setSelectedOrder(order);
        setIsFormOpen(true);
    };

    const handleView = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const handleDelete = useCallback(
        (id: number) => {
            if (confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
                deleteMutation.mutate(id);
            }
        },
        [deleteMutation]
    );

    const handleSubmit = useCallback(
        (data: OrderFormData) => {
            if (selectedOrder) {
                updateMutation.mutate({ id: selectedOrder.id, data });
            } else {
                createMutation.mutate(data);
            }
        },
        [selectedOrder, createMutation, updateMutation]
    );

    const handleStatusChange = useCallback(
        (orderId: number, status: OrderStatus) => {
            updateStatusMutation.mutate({ id: orderId, status });
        },
        [updateStatusMutation]
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        refetch();
    };

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

    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Pesanan Event" />
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <div className="text-red-500 text-lg font-semibold">
                        Terjadi kesalahan saat memuat data
                    </div>
                    <Button onClick={() => refetch()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Muat Ulang
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pesanan Event" />

            <div className="flex flex-col gap-4 p-4 md:p-6 bg-background">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold">Pesanan Event</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Kelola pesanan kaos event
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                            onClick={() => setIsExporting(true)}
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                        >
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Export Excel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            size="sm"
                            className="w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Pesanan
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                {stats && <OrderStatCards stats={stats} />}

                {/* Filters */}
                <Card>
                    <CardContent className="p-3 sm:p-4">
                        <form
                            onSubmit={handleSearch}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari invoice atau nama..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value as OrderStatus | 'all');
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit" variant="secondary" size="sm">
                                <Search className="w-4 h-4 mr-2" />
                                Cari
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Orders List - Mobile First Card Layout */}
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-4">
                                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/3" />
                                    <div className="h-3 bg-gray-200 rounded mb-2 w-1/2" />
                                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : data?.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                            <FileSpreadsheet className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-3 sm:mb-4" />
                            <p className="text-base sm:text-lg font-semibold mb-2">
                                Belum ada pesanan
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-4 text-center">
                                Mulai dengan menambahkan pesanan pertama
                            </p>
                            <Button onClick={handleCreate} size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Pesanan
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="space-y-3">
                            {data?.data.map((order: Order) => (
                                <Card
                                    key={order.id}
                                    className="overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <CardContent className="p-4">
                                        {/* Header Row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-sm font-semibold">
                                                    {order.invoice_code}
                                                </span>
                                                <Badge
                                                    variant={getStatusBadgeVariant(
                                                        order.status
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    ) as any}
                                                    className="text-xs"
                                                >
                                                    {order.status_label}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {order.created_at_formatted}
                                            </span>
                                        </div>

                                        {/* Info Row */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Pembeli
                                                </p>
                                                <p className="font-medium truncate">
                                                    {order.buyer_name}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs mt-1"
                                                >
                                                    {order.buyer_type_label}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Jumlah Item
                                                </p>
                                                <p className="font-medium">
                                                    {order.total_quantity} pcs
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Total
                                                </p>
                                                <p className="font-semibold text-primary">
                                                    {order.total_amount_formatted}
                                                </p>
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    Ubah Status
                                                </p>
                                                <Select
                                                    value={order.status}
                                                    onValueChange={(value: string) => {
                                                        handleStatusChange(
                                                            order.id,
                                                            value as OrderStatus
                                                        );
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STATUS_OPTIONS.filter(
                                                            (o) => o.value !== 'all'
                                                        ).map((option) => (
                                                            <SelectItem
                                                                key={option.value}
                                                                value={option.value}
                                                            >
                                                                {option.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 sm:flex-none text-xs"
                                                onClick={() => handleView(order)}
                                            >
                                                <Eye className="w-3 h-3 mr-1" />
                                                Detail
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 sm:flex-none text-xs"
                                                onClick={() => handleEdit(order)}
                                            >
                                                <Edit className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="flex-1 sm:flex-none text-xs"
                                                onClick={() => handleDelete(order.id)}
                                            >
                                                <Trash2 className="w-3 h-3 mr-1" />
                                                Hapus
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {data && lastPage > 1 && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        {/* Info */}
                                        <div className="text-sm text-muted-foreground">
                                            Halaman {page} dari {lastPage} ({total} total)
                                        </div>

                                        {/* Pagination Controls */}
                                        <div className="flex items-center gap-1">
                                            {/* First Page */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(1)}
                                                disabled={page === 1 || isLoading}
                                                className="hidden sm:flex"
                                            >
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>

                                            {/* Previous Page */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page === 1 || isLoading}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                <span className="hidden sm:inline ml-1">Prev</span>
                                            </Button>

                                            {/* Page Numbers */}
                                            <div className="flex items-center gap-1">
                                                {(() => {
                                                    const currentPage = page;
                                                    const lastP = lastPage;
                                                    const pages: (number | string)[] = [];

                                                    if (lastPage <= 7) {
                                                        for (let i = 1; i <= lastPage; i++) {
                                                            pages.push(i);
                                                        }
                                                    } else {
                                                        pages.push(1);

                                                        if (currentPage > 3) {
                                                            pages.push('...');
                                                        }

                                                        const start = Math.max(2, currentPage - 1);
                                                        const end = Math.min(lastP - 1, currentPage + 1);

                                                        for (let i = start; i <= end; i++) {
                                                            pages.push(i);
                                                        }

                                                        if (currentPage < lastP - 2) {
                                                            pages.push('...');
                                                        }

                                                        pages.push(lastP);
                                                    }

                                                    return pages.map((pageNum, index) => {
                                                        if (pageNum === '...') {
                                                            return (
                                                                <span
                                                                    key={`ellipsis-${index}`}
                                                                    className="px-2 text-muted-foreground hidden sm:inline"
                                                                >
                                                                    ...
                                                                </span>
                                                            );
                                                        }

                                                        return (
                                                            <Button
                                                                key={pageNum}
                                                                variant={pageNum === currentPage ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => setPage(pageNum as number)}
                                                                disabled={isLoading}
                                                                className="hidden sm:flex min-w-[2.5rem]"
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        );
                                                    });
                                                })()}
                                            </div>

                                            {/* Next Page */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                                                disabled={page === lastPage || isLoading}
                                            >
                                                <span className="hidden sm:inline mr-1">Next</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>

                                            {/* Last Page */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(lastPage)}
                                                disabled={page === lastPage || isLoading}
                                                className="hidden sm:flex"
                                            >
                                                <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Mobile: Current page indicator */}
                                        <div className="sm:hidden text-sm font-medium">
                                            {page} / {lastPage}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>

            {/* Form Dialog */}
            <OrderFormDialog
                open={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedOrder(null);
                }}
                onSubmit={handleSubmit}
                order={selectedOrder}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            {/* Detail Dialog */}
            <OrderDetailDialog
                open={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedOrder(null);
                }}
                order={selectedOrder}
            />

            <OrderExportDialog
                open={isExporting}
                onClose={() => setIsExporting(false)}
            />
        </AppLayout>
    );
}
