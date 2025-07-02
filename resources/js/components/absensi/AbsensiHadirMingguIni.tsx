import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// For collapsible
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AbsensiHadir {
    id: number;
    nama: string;
    alamat: string;
    tanggal: string;
    keterangan?: string;
    bonus?: boolean;
}

interface Props {
    startDate: string;
    endDate: string;
    onEdit: (absensi: AbsensiHadir) => void;
    onDeleted?: () => void;
}

export const AbsensiHadirMingguIni: React.FC<Props> = ({
    startDate,
    endDate,
    onEdit,
    onDeleted,
}) => {
    const [data, setData] = useState<AbsensiHadir[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Table states
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");
    const [tanggalFilter, setTanggalFilter] = useState(""); // filter tanggal

    // Collapsible state for mobile
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get("/api/admin/absensi/hadir-minggu-ini", {
                params: { start_date: startDate, end_date: endDate },
            });
            setData(res.data.data || []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Gagal memuat data");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [startDate, endDate]);

    const handleDelete = React.useCallback(async () => {
        if (deleteId === null) return;
        try {
            await apiClient.delete(`/api/admin/absensi/${deleteId}`);
            setData((d) => d.filter((item) => item.id !== deleteId));
            if (onDeleted) onDeleted();
            toast.success("Absensi berhasil dihapus");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Gagal menghapus absensi");
            toast.error(
                "Gagal menghapus absensi: " +
                (err instanceof Error ? err.message : "Terjadi kesalahan")
            );
        }
        setDeleteId(null);
    }, [deleteId, onDeleted]);

    // Table columns
    const columns = React.useMemo<ColumnDef<AbsensiHadir>[]>(
        () => [
            {
                accessorKey: "nama",
                header: "Nama",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "alamat",
                header: "Alamat",
                cell: (info) => info.getValue(),
            },
            {
                accessorKey: "tanggal",
                header: "Tanggal",
                cell: (info) =>
                    new Date(info.getValue() as string).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                    }),
                sortingFn: (rowA, rowB, columnId) => {
                    const ta = new Date(rowA.getValue(columnId)).getTime();
                    const tb = new Date(rowB.getValue(columnId)).getTime();
                    return ta - tb;
                },
                filterFn: (row, columnId, filterValue) => {
                    if (!filterValue) return true;
                    const tanggal = new Date(row.getValue(columnId));
                    const filter = new Date(filterValue as string);
                    return (
                        tanggal.getFullYear() === filter.getFullYear() &&
                        tanggal.getMonth() === filter.getMonth() &&
                        tanggal.getDate() === filter.getDate()
                    );
                },
            },
            {
                accessorKey: "keterangan",
                header: "Keterangan",
                cell: (info) => info.getValue() || "-",
                filterFn: (row, columnId, filterValue) => {
                    const val = row.getValue(columnId);
                    return String(val || "")
                        .toLowerCase()
                        .includes((filterValue as string).toLowerCase());
                },
            },
            {
                id: "aksi",
                header: "Aksi",
                cell: ({ row }) => (
                    <div className="flex gap-2 w-full justify-center">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(row.original)}
                        >
                            Edit
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setDeleteId(row.original.id)}
                                >
                                    Hapus
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Absensi?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah Anda yakin ingin menghapus absensi{" "}
                                        <b>{row.original.nama}</b> pada tanggal{" "}
                                        <b>
                                            {new Date(row.original.tanggal).toLocaleDateString(
                                                "id-ID"
                                            )}
                                        </b>
                                        ? Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                        Batal
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
        ],
        [onEdit, handleDelete]
    );

    // Gabungkan filter tanggal ke columnFilters
    useEffect(() => {
        setColumnFilters((filters) => [
            ...filters.filter((f) => f.id !== "tanggal"),
            ...(tanggalFilter ? [{ id: "tanggal", value: tanggalFilter }] : []),
        ]);
    }, [tanggalFilter]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        globalFilterFn: (row, columnId, filterValue) => {
            // Simple global filter: search in nama, alamat, keterangan
            const v = filterValue?.toLowerCase() ?? "";
            return (
                row.original.nama.toLowerCase().includes(v) ||
                row.original.alamat.toLowerCase().includes(v) ||
                (row.original.keterangan || "").toLowerCase().includes(v)
            );
        },
    });

    if (loading) return <div className="p-4">Memuat data...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 mt-4 border container w-full mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Absensi Siswa Hadir Minggu Ini</h2>
                <Button
                    variant="outline"
                    size={"sm"}
                    onClick={() => {
                        setGlobalFilter("");
                        setTanggalFilter("");
                        table.setColumnFilters([]);
                    }}
                >
                    Reset Filter
                </Button>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                <Input
                    placeholder="Cari nama/alamat/keterangan..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full md:w-64"
                />
                <Input
                    type="date"
                    value={tanggalFilter}
                    onChange={(e) => setTanggalFilter(e.target.value)}
                    className="w-full md:w-48"
                    max={endDate}
                    min={startDate}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Kolom
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Visibilitas Kolom</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {table
                            .getAllLeafColumns()
                            .filter((col) => col.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    checked={column.getIsVisible()}
                                    onCheckedChange={() => column.toggleVisibility()}
                                >
                                    {column.columnDef.header as string}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="hidden md:block">
                {table.getRowModel().rows.length === 0 ? (
                    <div className="text-gray-400">Belum ada siswa hadir minggu ini.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            className={
                                                header.column.getCanSort()
                                                    ? "cursor-pointer select-none"
                                                    : ""
                                            }
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: " ▲",
                                                desc: " ▼",
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 gap-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} data
                    </div>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            {"<<"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            {"<"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            {">"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            {">>"}
                        </Button>
                    </div>
                </div>
                <div className="flex flex-row justify-end mt-1">
                    <span className="text-sm">
                        Halaman{" "}
                        <strong>
                            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                        </strong>
                    </span>
                </div>
            </div>
            {/* Mobile Card Mode with Collapsible */}
            <div className="md:hidden flex flex-col gap-3">
                {table.getRowModel().rows.length === 0 ? (
                    <div className="text-gray-400">Belum ada siswa hadir minggu ini.</div>
                ) : (
                    <>
                        {table.getRowModel().rows.map((row) => {
                            const absen = row.original;
                            const isOpen = !!openRows[absen.id];
                            return (
                                <Collapsible
                                    key={absen.id}
                                    open={isOpen}
                                    onOpenChange={(open) =>
                                        setOpenRows((prev) => ({
                                            ...prev,
                                            [absen.id]: open,
                                        }))
                                    }
                                >
                                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex flex-col gap-1 shadow border">
                                        <CollapsibleTrigger asChild>
                                            <button
                                                className="flex items-center justify-between w-full outline-none"
                                                type="button"
                                            >
                                                <div className="flex flex-col text-left">
                                                    <span className="block text-xs text-gray-400">Nama</span>
                                                    <span className="font-bold">
                                                        {absen.nama}
                                                    </span>
                                                </div>
                                                {isOpen ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                                )}
                                            </button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="mt-2 flex flex-col gap-1">
                                                <div>
                                                    <span className="block text-xs text-gray-400">Alamat</span>
                                                    <span className="text-gray-800 dark:text-gray-200">
                                                        {absen.alamat}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs text-gray-400">Tanggal</span>
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {new Date(absen.tanggal).toLocaleDateString("id-ID", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs text-gray-400">Keterangan</span>
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {absen.keterangan || "-"}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2 mt-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => onEdit(absen)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                className="flex-1"
                                                                onClick={() => setDeleteId(absen.id)}
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Hapus Absensi?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Apakah Anda yakin ingin menghapus absensi{" "}
                                                                    <b>{absen.nama}</b> pada tanggal{" "}
                                                                    <b>
                                                                        {new Date(absen.tanggal).toLocaleDateString("id-ID")}
                                                                    </b>
                                                                    ? Tindakan ini tidak dapat dibatalkan.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel onClick={() => setDeleteId(null)}>
                                                                    Batal
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={handleDelete}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Hapus
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                </Collapsible>
                            );
                        })}
                        {/* Pagination for mobile */}
                        <div className="flex items-center justify-between mt-4 gap-2">
                            <div className="flex-1 text-sm text-muted-foreground">
                                {table.getFilteredRowModel().rows.length} data
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {"<<"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    {"<"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    {">"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                >
                                    {">>"}
                                </Button>
                            </div>
                            <span className="text-sm">
                                Halaman{" "}
                                <strong>
                                    {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                                </strong>
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}