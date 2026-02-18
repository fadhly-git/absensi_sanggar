/* eslint-disable @typescript-eslint/no-explicit-any */
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Image as ImageIcon, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ProductService } from '@/services/productService';
import { ProductFormDialog } from '@/components/event/product-form-dialog';
import type { PaginatedProductResponse, Product, ProductFormData } from '@/types/product';
import type { BreadcrumbItem } from '@/types';
import { getMetaValue } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Event', href: 'atmin.event.products' },
    { title: 'Produk', href: 'products' },
];

export default function ProductsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isActiveFilter, setIsActiveFilter] = useState<'all' | '1' | '0'>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Fetch products
    const perPage = 9;

    const { data, isLoading, error } = useQuery<PaginatedProductResponse, Error>({
        queryKey: ['products', page, search, isActiveFilter],
        queryFn: () =>
            ProductService.getAll(page, perPage, {
                search: search || undefined,
                is_active: isActiveFilter === 'all' ? undefined : isActiveFilter,
            }),
        placeholderData: keepPreviousData,
    })

    const lastPage = getMetaValue(data?.meta?.last_page) ?? 1;
    const total = getMetaValue(data?.meta?.total) ?? 0;

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: ProductFormData) => ProductService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Produk berhasil ditambahkan');
            setIsFormOpen(false);
        },
        onError: (error) => {
            console.log('error', error);
            toast.error('Gagal menambahkan produk');
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProductFormData }) =>
            ProductService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Produk berhasil diperbarui');
            setIsFormOpen(false);
            setSelectedProduct(null);
        },
        onError: () => {
            toast.error('Gagal memperbarui produk');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => ProductService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Produk berhasil dihapus');
        },
        onError: () => {
            toast.error('Gagal menghapus produk');
        },
    });

    const handleCreate = () => {
        setSelectedProduct(null);
        setIsFormOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const handleDelete = useCallback((id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            deleteMutation.mutate(id);
        }
    }, [deleteMutation]);

    const handleSubmit = useCallback((data: ProductFormData) => {
        if (selectedProduct) {
            updateMutation.mutate({ id: selectedProduct.id, data });
        } else {
            createMutation.mutate(data);
        }
    }, [selectedProduct, createMutation, updateMutation]);

    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Produk Event" />
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <div className="text-red-500 text-lg font-semibold">
                        Terjadi kesalahan saat memuat data
                    </div>
                    <Button onClick={() => window.location.reload()}>
                        Muat Ulang
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produk Event" />

            <div className="flex flex-col gap-4 p-4 md:p-6 bg-background">
                {/* Header - Mobile First */}
                    <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="w-full sm:w-auto">
                            <h1 className="text-xl sm:text-2xl font-bold">Produk Event</h1>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Kelola produk untuk event sanggar
                            </p>
                        </div>

                        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                            <div className="w-full sm:w-64">
                                <Input
                                    placeholder="Cari produk..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="w-full"
                                />
                            </div>

                            {/*  */}
                            <Select value={isActiveFilter} onValueChange={(v) => { setIsActiveFilter(v as any); setPage(1); }}>
                                <SelectTrigger className="w-full sm:w-auto">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="1">Aktif</SelectItem>
                                    <SelectItem value="0">Nonaktif</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button onClick={handleCreate} size="sm" className="w-full sm:w-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Produk
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Products Grid - Mobile First */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <div className="aspect-video bg-gray-200 rounded-t-lg" />
                                <CardContent className="p-4">
                                    <div className="h-4 bg-gray-200 rounded mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : data?.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                            <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-3 sm:mb-4" />
                            <p className="text-base sm:text-lg font-semibold mb-2">Belum ada produk</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-4 text-center">
                                Mulai dengan menambahkan produk pertama Anda
                            </p>
                            <Button onClick={handleCreate} size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Produk
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {data?.data.map((product) => (
                                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    {/* Product Image */}
                                    <div className="aspect-video bg-gray-100 relative">
                                        {product.image_url ? (
                                            <img
                                                src={`${product.image_url}`}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                                            </div>
                                        )}
                                        <Badge
                                            className="absolute top-2 right-2 text-xs"
                                            variant={product.is_active ? 'default' : 'secondary'}
                                        >
                                            {product.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </div>

                                    <CardHeader className="p-3 sm:p-4">
                                        <CardTitle className="text-base sm:text-lg line-clamp-1">
                                            {product.name}
                                        </CardTitle>
                                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                                            {product.description || 'Tidak ada deskripsi'}
                                        </p>
                                    </CardHeader>

                                    <CardContent className="p-3 sm:p-4 pt-0">
                                        <div className="flex flex-col gap-2 mb-3 sm:mb-4">
                                            <div className="flex items-center text-xs sm:text-sm">
                                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-muted-foreground" />
                                                <span className="font-medium">Deadline:</span>
                                                <span className="ml-2 text-muted-foreground">
                                                    {new Date(product.po_deadline).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="text-xs sm:text-sm">
                                                <span className="font-medium">Ukuran:</span>
                                                <span className="ml-2 text-muted-foreground">
                                                    {product.size_charts.length} varian
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs sm:text-sm"
                                                onClick={() => handleEdit(product)}
                                            >
                                                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="flex-1 text-xs sm:text-sm"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                Hapus
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination - Mobile First */}
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
                                                disabled={page === 1}
                                                className="hidden sm:flex"
                                            >
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>

                                            {/* Previous Page */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
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
                                                onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                                                disabled={page === lastPage}
                                            >
                                                <span className="hidden sm:inline mr-1">Next</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>

                                            {/* Last Page */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(lastPage)}
                                                disabled={page === lastPage}
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
            <ProductFormDialog
                open={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedProduct(null);
                }}
                onSubmit={handleSubmit}
                product={selectedProduct}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </AppLayout>
    );
}
