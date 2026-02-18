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
import { ChevronDown, LoaderCircle } from 'lucide-react';
import * as React from 'react';
import styles from './AttendanceTable.module.css';
import { DataTableColumnHeader } from './DataTableColumnHeader';

export type Siswa = {
    siswa_id: number;
    siswa_nama: string;
    siswa_alamat: string;
    siswa_status: number;
    [key: string]: string | number;
};

interface CellProps {
    datas: Siswa[];
    loading: boolean;
    error: Error | null;
    setSearch: (value: string) => void;
}

export function DataTableDH({ datas, loading, error, setSearch }: CellProps) {
    // console.log('DataTableDH', loading);
    const [data, setData] = React.useState<Siswa[]>([]);
    const [tempText, setTempText] = React.useState<string>('');

    React.useEffect(() => {
        if (datas.length > 0) {
            setData(datas);
        }
    }, [datas]);

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
        getCoreRowModel: React.useMemo(() => getCoreRowModel(), []),
        getSortedRowModel: React.useMemo(() => getSortedRowModel(), []),
        getFilteredRowModel: React.useMemo(() => getFilteredRowModel(), []),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const handleFilterChange = ()=> {
        setSearch(tempText);
    };

    React.useEffect(() => {
        setSearch(tempText);
    }, [tempText, setSearch]);

    // if (loading) {
    //     return <div className='flex items-center justify-center'> <LoaderCircle className="h-40 w-40 animate-spin" /></div>;
    // }

    if (error) {
        return (
            <div className="mt-12 font-bold items-center text-center text-red-500 text-lg">
                <p>Error: {error.message}</p>
                <p>Silakan muat ulang halaman atau hubungi administrator.</p>
            </div>
        );
    }

    if (data.length === 0) {
        return <div className="mt-12 font-bold items-center text-center text-red-500 text-lg">No data available</div>;
    }

    return (
        <div className={styles.tableContainer}>
            <div className="w-fit px-4">
                <h1 className="mt-6 text-xl font-bold capitalize">Tabel Daftar Hadir</h1>
            </div>
            <div className="mx-2 flex items-center gap-2 py-4">
                <Input
                    placeholder="Filter names..."
                    value={tempText}
                    onChange={(e) => setTempText(e.target.value)}
                    className="max-w-sm"
                />
                <Button onClick={handleFilterChange} variant="outline" className='text-sm'>
                    Apply Filter
                </Button>
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
            <div className={styles.tableWrapper + ' rounded-md border'}>
                <Table className={styles.table + ' table-auto'}>
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
                        {loading === true ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className='flex items-center justify-center h-64'> <LoaderCircle className="h-40 w-40 animate-spin" /></div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
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
        </div>
    );
}
