import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    CellContext,
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    HeaderContext,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import axios from 'axios';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import styles from './AttendanceTable.module.css';
import { DataTableColumnHeader } from './DataTableColumnHeader';

interface CellProps {
    date: string;
    params: string;
}

// Tipe data untuk siswa
export type Siswa = {
    siswa_id: number;
    siswa_nama: string;
    siswa_alamat: string;
    siswa_status: number;
    [key: string]: string | number; // Untuk mendukung kolom dinamis (tanggal)
};

export function DataTableDH({ date, params }: CellProps) {
    const [data, setData] = React.useState<Siswa[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    // Fetch data menggunakan Axios
    React.useEffect(() => {
        axios
            .get('/api/absensi/index?date=' + date + '&params=' + params) // Panggil endpoint API
            .then((response) => {
                setData(response.data); // Set data ke state
                setLoading(false);
                setError(null);
            })
            .catch((error) => {
                setError(error as Error);
                setLoading(false);
            });
    }, [date, params]);

    // Generate kolom dinamis berdasarkan data
    const columns: ColumnDef<Siswa>[] = React.useMemo(() => {
        if (data.length === 0) return [];

        const dynamicColumns = Object.keys(data[0])
            .filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))
            .map((dateKey) => ({
                accessorKey: dateKey,
                header: ({ column }: HeaderContext<Siswa, unknown>) => <DataTableColumnHeader column={column} title={dateKey} />,
                cell: ({ row }: CellContext<Siswa, unknown>) => <div dangerouslySetInnerHTML={{ __html: row.getValue(dateKey) as string }} />,
            }));

        return [
            {
                accessorKey: 'siswa_nama',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
            },
            {
                accessorKey: 'siswa_alamat',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Alamat" />,
            },
            ...dynamicColumns,
        ];
    }, [data]);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

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

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className={styles.tableContainer}>
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter names..."
                    value={(table.getColumn('siswa_nama')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('siswa_nama')?.setFilterValue(event.target.value)}
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
            <div className={styles.tableWrapper}>
                <Table className={styles.table}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
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
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        let cellColor = '';

                                        if (/^\d{4}-\d{2}-\d{2}$/.test(cell.column.id)) {
                                            const cellValue = cell.getValue() as string;
                                            if (cellValue === 'Tidak') {
                                                cellColor = 'bg-red-500 text-white';
                                            } else if (cellValue === 'Iya') {
                                                cellColor = 'bg-green-400 text-slate-600';
                                            } else if (cellValue === 'Bonus') {
                                                cellColor = 'bg-white text-black';
                                            }
                                        }

                                        return (
                                            <TableCell className={cellColor} key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        );
                                    })}
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
        </div>
    );
}
