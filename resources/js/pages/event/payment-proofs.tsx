import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import axios from '@/lib/api/axios';
import { getMetaValue } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Clock,
    Eye,
    FileImage,
    RefreshCw,
    Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Order {
    id: number;
    invoice_code: string;
    buyer_name: string;
    buyer_type_label: string;
    total_amount_formatted: string;
    status: string;
    status_label: string;
    status_color: string;
    payment_proof: string | null;
    created_at: string;
    items_count: number;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PageProps {
    filters?: {
        status?: string;
        has_proof?: string;
        search?: string;
    };
}

export default function PaymentProofs({ filters }: PageProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [hasProof, setHasProof] = useState(filters?.has_proof || 'all');

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');
    const [updating, setUpdating] = useState(false);

    // Fetch orders
    const fetchOrders = async (page = 1) => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page };
            if (search) params.search = search;
            if (status && status !== 'all') params.status = status;
            if (hasProof === 'with_proof') params.has_proof = '1';
            if (hasProof === 'no_proof') params.has_proof = '0';

            console.log('Fetching with params:', params);

            const response = await axios.get(
                '/pengurus/event/payment-proofs/api',
                { params },
            );
            setOrders(response.data.data);
            const rawMeta = response.data.meta;
            setMeta({
                current_page: getMetaValue(rawMeta.current_page),
                last_page: getMetaValue(rawMeta.last_page),
                per_page: getMetaValue(rawMeta.per_page),
                total: getMetaValue(rawMeta.total),
            });
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasProof, status]);

    // Handle search
    const handleSearch = () => {
        fetchOrders(1);
    };

    // Handle update status
    const handleUpdateStatus = async () => {
        if (!selectedOrder || !newStatus) return;

        setUpdating(true);
        try {
            await axios.patch(
                `/pengurus/event/payment-proofs/${selectedOrder.id}/verify`,
                {
                    status: newStatus,
                },
            );

            // Refresh data
            fetchOrders(meta?.current_page || 1);
            setShowStatusDialog(false);
            setSelectedOrder(null);
            setNewStatus('');
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const openStatusDialog = (order: Order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setShowStatusDialog(true);
    };

    const getStatusBadgeVariant = (color: string) => {
        switch (color) {
            case 'success':
                return 'default';
            case 'warning':
                return 'secondary';
            case 'info':
                return 'outline';
            default:
                return 'outline';
        }
    };

    return (
        <AppLayout>
            <Head title="Bukti Pembayaran" />

            <div className="flex flex-col gap-4 bg-background p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Bukti Pembayaran</h1>
                        <p className="mt-1 text-muted-foreground">
                            Kelola dan verifikasi bukti pembayaran pesanan
                        </p>
                    </div>
                    <Button
                        onClick={() => fetchOrders(meta?.current_page || 1)}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari invoice atau nama pembeli..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && handleSearch()
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <Select
                                value={status}
                                onValueChange={(value) => {
                                    setStatus(value);
                                    fetchOrders(1);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Status
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Menunggu Pembayaran
                                    </SelectItem>
                                    <SelectItem value="paid">
                                        Sudah Dibayar
                                    </SelectItem>
                                    <SelectItem value="processing">
                                        Diproses
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Selesai
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Dibatalkan
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={hasProof}
                                onValueChange={(value) => {
                                    setHasProof(value);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="with_proof">
                                        Ada Bukti
                                    </SelectItem>
                                    <SelectItem value="no_proof">
                                        Belum Upload
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleSearch} disabled={loading}>
                                <Search className="mr-2 h-4 w-4" />
                                Cari
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('all');
                                    setHasProof('all');
                                    fetchOrders(1);
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders List */}
                <div className="grid gap-4">
                    {loading ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    Memuat data...
                                </p>
                            </CardContent>
                        </Card>
                    ) : orders.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <FileImage className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    Tidak ada pesanan ditemukan
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        orders.map((order: Order) => (
                            <Card key={order.id}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-6 md:flex-row">
                                        {/* Payment Proof Image */}
                                        <div className="flex-shrink-0">
                                            {order.payment_proof ? (
                                                <div className="group relative">
                                                    <img
                                                        src={
                                                            order.payment_proof
                                                        }
                                                        alt="Bukti Pembayaran"
                                                        className="h-32 w-32 rounded-lg border-2 border-border object-cover"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            setSelectedImage(
                                                                order.payment_proof,
                                                            )
                                                        }
                                                        className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                                    >
                                                        <Eye className="h-6 w-6 text-white" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                                                    <FileImage className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Order Info */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        {order.invoice_code}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.buyer_name} •{' '}
                                                        {order.buyer_type_label}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={getStatusBadgeVariant(
                                                        order.status_color,
                                                    )}
                                                >
                                                    {order.status_label}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="font-semibold text-primary">
                                                    {
                                                        order.total_amount_formatted
                                                    }
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {order.items_count} item
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {format(
                                                        new Date(
                                                            order.created_at,
                                                        ),
                                                        'dd MMM yyyy HH:mm',
                                                        {
                                                            locale: id,
                                                        },
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 pt-2">
                                                {order.payment_proof ? (
                                                    <>
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-green-50 dark:bg-green-900/20"
                                                        >
                                                            <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
                                                            Bukti Terupload
                                                        </Badge>
                                                        {order.status ===
                                                            'pending' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    openStatusDialog(
                                                                        order,
                                                                    )
                                                                }
                                                            >
                                                                Konfirmasi
                                                                Pembayaran
                                                            </Button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-yellow-50 dark:bg-yellow-900/20"
                                                    >
                                                        <Clock className="mr-1 h-3 w-3 text-yellow-600" />
                                                        Belum Upload
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                {/* Info */}
                                <div className="text-sm text-muted-foreground">
                                    Halaman {meta.current_page} dari{' '}
                                    {meta.last_page} ({meta.total} total)
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex items-center gap-1">
                                    {/* First Page */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchOrders(1)}
                                        disabled={
                                            meta.current_page === 1 || loading
                                        }
                                        className="hidden sm:flex"
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>

                                    {/* Previous Page */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            fetchOrders(meta.current_page - 1)
                                        }
                                        disabled={
                                            meta.current_page === 1 || loading
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="ml-1 hidden sm:inline">
                                            Prev
                                        </span>
                                    </Button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {(() => {
                                            const currentPage =
                                                meta.current_page;
                                            const lastPage = meta.last_page;
                                            const pages: (number | string)[] =
                                                [];

                                            if (lastPage <= 7) {
                                                // Show all pages if 7 or less
                                                for (
                                                    let i = 1;
                                                    i <= lastPage;
                                                    i++
                                                ) {
                                                    pages.push(i);
                                                }
                                            } else {
                                                // Always show first page
                                                pages.push(1);

                                                if (currentPage > 3) {
                                                    pages.push('...');
                                                }

                                                // Show pages around current page
                                                const start = Math.max(
                                                    2,
                                                    currentPage - 1,
                                                );
                                                const end = Math.min(
                                                    lastPage - 1,
                                                    currentPage + 1,
                                                );

                                                for (
                                                    let i = start;
                                                    i <= end;
                                                    i++
                                                ) {
                                                    pages.push(i);
                                                }

                                                if (
                                                    currentPage <
                                                    lastPage - 2
                                                ) {
                                                    pages.push('...');
                                                }

                                                // Always show last page
                                                pages.push(lastPage);
                                            }

                                            return pages.map((page, index) => {
                                                if (page === '...') {
                                                    return (
                                                        <span
                                                            key={`ellipsis-${index}`}
                                                            className="hidden px-2 text-muted-foreground sm:inline"
                                                        >
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={
                                                            page === currentPage
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            fetchOrders(
                                                                page as number,
                                                            )
                                                        }
                                                        disabled={loading}
                                                        className="hidden min-w-[2.5rem] sm:flex"
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            });
                                        })()}
                                    </div>

                                    {/* Next Page */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            fetchOrders(meta.current_page + 1)
                                        }
                                        disabled={
                                            meta.current_page ===
                                                meta.last_page || loading
                                        }
                                    >
                                        <span className="mr-1 hidden sm:inline">
                                            Next
                                        </span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>

                                    {/* Last Page */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            fetchOrders(meta.last_page)
                                        }
                                        disabled={
                                            meta.current_page ===
                                                meta.last_page || loading
                                        }
                                        className="hidden sm:flex"
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Mobile: Current page indicator */}
                                <div className="text-sm font-medium sm:hidden">
                                    {meta.current_page} / {meta.last_page}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Image Preview Dialog */}
            <Dialog
                open={!!selectedImage}
                onOpenChange={() => setSelectedImage(null)}
            >
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Bukti Pembayaran</DialogTitle>
                        <DialogDescription>
                            Klik di luar untuk menutup
                        </DialogDescription>
                    </DialogHeader>
                    {selectedImage && (
                        <div className="mt-4">
                            <div className="relative">
                                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedImage(null)}
                                        className="pointer-events-auto bg-card text-background"
                                    >
                                        Tutup
                                    </Button>
                                </div>
                                <img
                                    src={selectedImage || undefined}
                                    alt="Bukti Pembayaran"
                                    className="h-auto max-h-[60vh] w-full rounded-lg object-contain"
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Status Update Dialog */}
            <AlertDialog
                open={showStatusDialog}
                onOpenChange={setShowStatusDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Update Status Pesanan
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedOrder && (
                                <div className="mt-4 space-y-2">
                                    <p className="font-medium text-foreground">
                                        {selectedOrder.invoice_code}
                                    </p>
                                    <p>{selectedOrder.buyer_name}</p>
                                    <p className="text-sm">
                                        {selectedOrder.total_amount_formatted}
                                    </p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="my-4">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih status baru" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">
                                    Menunggu Pembayaran
                                </SelectItem>
                                <SelectItem value="paid">
                                    Sudah Dibayar
                                </SelectItem>
                                <SelectItem value="processing">
                                    Diproses
                                </SelectItem>
                                <SelectItem value="completed">
                                    Selesai
                                </SelectItem>
                                <SelectItem value="cancelled">
                                    Dibatalkan
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={updating}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUpdateStatus}
                            disabled={updating}
                        >
                            {updating ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
