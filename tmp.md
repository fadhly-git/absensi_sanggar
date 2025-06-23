'''(import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  CellContext,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  HeaderContext,
  useReactTable,
} from '@tanstack/react-table';
import styles from './AttendanceTable.module.css';
import { DataTableColumnHeader } from './DataTableColumnHeader';

export type Siswa = {
  siswa_id: number;
  siswa_nama: string;
  siswa_alamat: string;
  siswa_status: number;
  [key: string]: string | number; // Untuk mendukung kolom dinamis (tanggal)
};

interface CellProps {
  datas: Siswa[];
  loading: boolean;
  error: Error | null;
}

export function DataTableDH({ datas, loading, error }: CellProps) {
  const [data, setData] = React.useState<Siswa[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const rowsPerPage = 10; // Jumlah baris per halaman

  React.useEffect(() => {
    setData(datas);
  }, [datas]);

  const columns: ColumnDef<Siswa>[] = React.useMemo(() => {
    if (data.length === 0) return [];

    const dynamicColumns = Object.keys(data[0])
      .filter((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))
      .map((dateKey) => ({
        accessorKey: dateKey,
        header: ({ column }: HeaderContext<Siswa, unknown>) => (
          <DataTableColumnHeader column={column} title={dateKey} />
        ),
        cell: ({ row }: CellContext<Siswa, unknown>) => (
          <div
            className="text-center"
            dangerouslySetInnerHTML={{
              __html: row.getValue(dateKey) as string,
            }}
          />
        ),
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const currentData = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [data, currentPage]);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <h1 className="text-xl font-bold capitalize mb-4">Tabel Daftar Hadir</h1>
      <div className="mx-2 flex items-center gap-2 py-4">
        <Input placeholder="Filter names..." className="max-w-sm" />
      </div>
      <div className={styles.tableWrapper + ' rounded-md border'}>
        <Table className={styles.table}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {currentData.length ? (
              currentData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Object.keys(row).map((key, cellIndex) => {
                    const cellValue = row[key];
                    return (
                      <TableCell
                        key={cellIndex}
                        className={
                          typeof cellValue === 'string' && cellValue.includes('Tidak')
                            ? 'bg-red-500 text-white'
                            : cellValue.includes('Iya')
                            ? 'bg-green-400 text-slate-600'
                            : ''
                        }
                      >
                        {typeof cellValue === 'string' ? (
                          <span dangerouslySetInnerHTML={{ __html: cellValue }} />
                        ) : (
                          cellValue
                        )}
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
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button variant="outline" onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button variant="outline" onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
})
'''
