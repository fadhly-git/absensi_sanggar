import {
    ColumnDef, ColumnFiltersState, SortingState, VisibilityState,
    flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, Edit, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { type DataKeuangan, deleteTransaction } from '@/services/keuanganApi';
import { KeuanganMskEditTabs } from './form-edit';
import { KeuanganKlrEditTabs } from './form-edit-klr';

interface DataTableKeuanganProps {
    datas: DataKeuangan[];
    type: 'masuk' | 'keluar';
    isLoading: boolean;
}

const formatNumber = (value: number) => {
    if (value == null) return 'Rp 0';
    return 'Rp ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export function DataTableKeuangan({ datas, type, isLoading }: DataTableKeuanganProps) {
    const queryClient = useQueryClient();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<DataKeuangan | null>(null);

    const deleteMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: (response) => {
            toast.success(response.message || 'Data berhasil dihapus!');
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['saldo'] });
        },
        onError: (error) => {
            toast.error(error.message || 'Gagal menghapus data.');
        },
    });

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (data: DataKeuangan) => {
        setSelectedData(data);
        setIsEditDialogOpen(true);
    };

    const columns: ColumnDef<DataKeuangan>[] = [
        { accessorKey: 'tanggal', header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>Tanggal <ArrowUpDown className="ml-2 h-4 w-4" /></Button> },
        { accessorKey: 'keterangan', header: 'Keterangan' },
        { accessorKey: 'jumlah', header: () => <div className="text-right">Jumlah</div>, cell: ({ row }) => <div className="text-right font-medium">{formatNumber(row.getValue('jumlah'))}</div> },
        {
            id: 'actions',
            header: () => <div className="text-center">Aksi</div>,
            cell: ({ row }) => (
                <div className="text-center space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(row.original)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(row.original.id)} disabled={deleteMutation.isPending && deleteMutation.variables === row.original.id}><Trash2 className="h-4 w-4" /></Button>
                </div>
            ),
        },
    ];

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
    });

    return (
        <>
            {type === 'masuk'
                ? <KeuanganMskEditTabs open={isEditDialogOpen} openDialog={() => setIsEditDialogOpen(false)} data={selectedData} />
                : <KeuanganKlrEditTabs open={isEditDialogOpen} openDialog={() => setIsEditDialogOpen(false)} data={selectedData} />
            }
            <div className="mx-2 w-auto items-center justify-center lg:mx-4">
                <div className="w-fit"><h1 className="mt-6 text-xl font-bold capitalize">Tabel Keuangan {type}</h1></div>
                <div className="mx-2 flex items-center gap-2 py-4">
                    <Input placeholder="Filter keterangan..." value={(table.getColumn('keterangan')?.getFilterValue() as string) ?? ''} onChange={(event) => table.getColumn('keterangan')?.setFilterValue(event.target.value)} className="max-w-sm" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" className="ml-auto">Columns <ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table.getAllColumns().filter(column => column.getCanHide()).map(column => (<DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>{column.id}</DropdownMenuCheckboxItem>))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (<TableRow key={headerGroup.id}>{headerGroup.headers.map(header => (<TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>))}</TableRow>))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={columns.length}><Skeleton className="h-8 w-full" /></TableCell></TableRow>) :
                                (table.getRowModel().rows?.length ? table.getRowModel().rows.map(row => (<TableRow key={row.id}>{row.getVisibleCells().map(cell => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>)) :
                                    <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Tidak ada hasil.</TableCell></TableRow>)}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}