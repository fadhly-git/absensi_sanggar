/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useCallback } from 'react';
import {
    ColumnDef, flexRender, getCoreRowModel,
    getFilteredRowModel, getPaginationRowModel,
    getSortedRowModel, useReactTable,
    ColumnFiltersState, SortingState, VisibilityState
} from '@tanstack/react-table';
import { ArrowUpDown, Edit, Trash2, Search } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { type DataKeuangan, deleteTransaction } from '@/services/keuanganApi';
import { KeuanganMskEditTabs } from './form-edit';
import { KeuanganKlrEditTabs } from './form-edit-klr';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
} from '@/components/ui/alert-dialog';

// Helper: format number
const formatNumber = (value: number) => {
    if (value == null) return 'Rp 0';
    return 'Rp ' + value.toLocaleString('id-ID');
};

export interface DataTableKeuanganProps {
    datas: DataKeuangan[];
    type: 'masuk' | 'keluar';
    isLoading: boolean;
}

const TableSkeleton = React.memo(() => (
    <>
        {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            </TableRow>
        ))}
    </>
));

export const DataTableKeuangan = React.memo(({
    datas,
    type,
    isLoading
}: DataTableKeuanganProps) => {
    const queryClient = useQueryClient();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<DataKeuangan | null>(null);

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const deleteMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: (response) => {
            toast.success(response.message || 'Data berhasil dihapus!');
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['saldo'] });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Gagal menghapus data.');
        },
    });

    const handleDelete = useCallback((id: number) => {
        setDeleteId(id);
        setIsDeleteDialogOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (deleteId !== null) {
            deleteMutation.mutate(deleteId);
            setIsDeleteDialogOpen(false);
            setDeleteId(null);
        }
    }, [deleteId, deleteMutation]);

    const handleEdit = useCallback((data: DataKeuangan) => {
        setSelectedData(data);
        setIsEditDialogOpen(true);
    }, []);

    const closeEditDialog = useCallback(() => {
        setIsEditDialogOpen(false);
        setSelectedData(null);
    }, []);

    const columns: ColumnDef<DataKeuangan>[] = useMemo(() => [
        {
            accessorKey: 'tanggal',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="hover:bg-muted-foreground"
                >
                    Tanggal
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium">
                    {new Date(row.getValue('tanggal')).toLocaleDateString('id-ID')}
                </div>
            ),
        },
        {
            accessorKey: 'keterangan',
            header: 'Keterangan',
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate" title={row.getValue('keterangan')}>
                    {row.getValue('keterangan')}
                </div>
            ),
        },
        {
            accessorKey: 'jumlah',
            header: () => <div className="text-right">Jumlah</div>,
            cell: ({ row }) => (
                <div className={`text-right font-semibold ${type === 'masuk' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {formatNumber(row.getValue('jumlah'))}
                </div>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-center">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        aria-label="Edit"
                        onClick={() => handleEdit(row.original)}
                        className="h-8 w-8 p-0 rounded-full focus:ring-2 focus:ring-blue-400"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        aria-label="Hapus"
                        onClick={() => handleDelete(row.original.id)}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 p-0 rounded-full focus:ring-2 focus:ring-red-400"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ], [type, handleEdit, handleDelete, deleteMutation.isPending]);

    const table = useReactTable({
        data: datas,
        columns,
        state: { sorting, columnFilters, columnVisibility },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    const totalAmount = useMemo(() =>
        datas.reduce((sum, item) => sum + item.jumlah, 0),
        [datas]
    );

    // --- Mobile Card View

    return (
        <div className="space-y-4">
            {/* AlertDialog Konfirmasi Hapus */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Edit Dialogs */}
            {type === 'masuk' ? (
                <KeuanganMskEditTabs
                    open={isEditDialogOpen}
                    openDialog={closeEditDialog}
                    data={selectedData}
                />
            ) : (
                <KeuanganKlrEditTabs
                    open={isEditDialogOpen}
                    openDialog={closeEditDialog}
                    data={selectedData}
                />
            )}

            {/* Filter & Summary */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Cari keterangan..."
                        value={(table.getColumn('keterangan')?.getFilterValue() as string) ?? ''}
                        onChange={(event) =>
                            table.getColumn('keterangan')?.setFilterValue(event.target.value)
                        }
                        className="pl-10 max-w-sm"
                    />
                </div>
                <div className={`text-sm font-semibold px-3 py-1 rounded-full ${type === 'masuk'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    Total: {formatNumber(totalAmount)}
                </div>
            </div>

            {/* Mobile Card Mode */}
            <div className="block md:hidden space-y-3">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="rounded-xl border bg-white dark:bg-gray-900 px-4 py-4 shadow flex flex-col gap-2">
                            <Skeleton className="h-4 w-1/2 mb-2" />
                            <Skeleton className="h-3 w-2/3 mb-2" />
                            <Skeleton className="h-4 w-1/3" />
                        </div>
                    ))
                ) : (datas.length === 0 ? (
                    <div className="rounded-xl border bg-white dark:bg-gray-900 px-4 py-6 text-center text-gray-400">
                        Tidak ada data {type}
                    </div>
                ) : (
                    datas.map((row) => (
                        <div
                            key={row.id}
                            className="rounded-xl border bg-white dark:bg-gray-900 px-4 py-4 shadow flex flex-col gap-2"
                        >
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="text-xs text-gray-400">Tanggal</div>
                                <div className="font-bold text-right text-primary">
                                    {new Date(row.tanggal).toLocaleDateString('id-ID')}
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">Keterangan</div>
                            <div className="font-medium truncate">{row.keterangan}</div>
                            <div className="flex items-center justify-between my-1">
                                <div className="text-xs text-gray-400">Jumlah</div>
                                <div className={`font-semibold ${type === 'masuk'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}>
                                    {formatNumber(row.jumlah)}
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleEdit(row)}
                                >
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleDelete(row.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> Hapus
                                </Button>
                            </div>
                        </div>
                    ))
                ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block rounded-md border bg-background">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id} className="bg-background">
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())
                                        }
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton />
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow
                                    key={row.id}
                                    className="hover:bg-muted-foreground transition-colors"
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-foreground"
                                >
                                    Tidak ada data {type}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="text-sm text-gray-700">
                    Menampilkan {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} - {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} dari {table.getFilteredRowModel().rows.length} data
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Sebelumnya
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Selanjutnya
                    </Button>
                </div>
            </div>
        </div>
    );
});