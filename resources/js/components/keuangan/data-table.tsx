import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { KeuanganMskEditTabs } from './form-edit';
import { KeuanganKlrEditTabs } from './form-edit-klr';

export type DataKeuangan = {
    id: number;
    keterangan: string;
    jumlah: number;
    tanggal: string;
};

export const formatNumber = (value: number) => {
    if (value == null) {
        return '0'; // Fallback jika nilai adalah null atau undefined
    } // Konversi nilai ke string
    return 'Rp' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const columns: ColumnDef<DataKeuangan>[] = [
    {
        accessorKey: 'tanggal',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Tanggal
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => <div className="w-fit">{row.getValue('tanggal')}</div>,
    },
    {
        accessorKey: 'keterangan',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Keterangan
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => <div>{row.getValue('keterangan')}</div>,
    },
    {
        accessorKey: 'jumlah',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Jumlah
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => <div>{formatNumber(row.getValue('jumlah'))}</div>,
    },
];

interface DataTableKeuanganProps {
    datas: DataKeuangan[];
    type: string;
    success: boolean;
    setSuccess: () => void;
}

export function DataTableKeuangan({ datas, type, setSuccess, success }: DataTableKeuanganProps) {
    const [data, setData] = useState<DataKeuangan[]>([]);

    useEffect(() => {
        setData(datas);
    }, [datas, success]);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openKlr, setOpenKlr] = React.useState(false);
    const [selectedData, setSelectedData] = React.useState<DataKeuangan | null>(null);

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const handleMskRowClick = (row: DataKeuangan) => {
        setSelectedData(row);
        setOpenEdit(true);
    };

    const handleKlrRowClick = (row: DataKeuangan) => {
        setSelectedData(row);
        setOpenKlr(true);
    };

    return (
        <>
            <KeuanganMskEditTabs open={openEdit} openDialog={() => setOpenEdit(false)} success={setSuccess} data={selectedData} />
            <KeuanganKlrEditTabs open={openKlr} openDialog={() => setOpenKlr(false)} success={setSuccess} data={selectedData} />
            <div className="mx-2 w-auto items-center justify-center lg:mx-4">
                <div className="w-fit">
                    <h1 className="mt-6 text-xl font-bold capitalize">Tabel Keuangan {type}</h1>
                </div>
                <div className="mx-2 flex items-center gap-2 py-4">
                    <Input
                        placeholder="Filter keterangan..."
                        value={(table.getColumn('keterangan')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('keterangan')?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="capitalize">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        className="mx-auto capitalize"
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        onClick={() => (type === 'masuk' ? handleMskRowClick(row.original) : handleKlrRowClick(row.original))}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    {/* <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Next
                    </Button>
                </div> */}
                </div>
            </div>
        </>
    );
}
