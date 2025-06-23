import { CardDH } from '@/components/card-dh';
import { CustomMonthPicker, CustomYearPicker } from '@/components/month-picker';
import { InsertDataDH } from '@/components/daftar-hadir/tambahdaftar';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Siswa } from '@/pages/table/data-table';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Switch } from '@/components/ui/switch';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { DataTableDH } from './table/data-table';
import { ExportButton } from '@/components/daftar-hadir/export-data';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Daftar Hadir',
        href: 'daftar-hadir',
    },
];

export type DataSiswa = {
    id: number;
    nama: string;
    alamat: string;
    status: number;
};

export type DataDH = {
    masuk: number;
    keluar: number;
};

export default function DaftarHadir() {
    // const [params, setParams] = useState('bulan');
    // const [state, setState] = useState(true);
    const year = new Date().getFullYear().toString();
    const month = new Date().getMonth() + 1;
    const monthString = month < 10 ? `${year}-0${month}` : `${year}-${month}`;
    const [date, setDate] = useState(monthString);
    const [count, setCount] = useState<DataDH>({ masuk: 0, keluar: 0 });
    const [state, setState] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [data, setData] = useState<Siswa[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    // const [search, setSearch] = useState('');
    const [params, setParams] = useState('bulan');
    const limit = 35; // Batas data per halaman

    useEffect(() => {
        axios
            .get('/api/atmin/absensi/get-count-absensi')
            .then((response) => {
                setCount(response.data);
                // console.log(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchValue]);

    // Update params when switch changes
    useEffect(() => {
        setParams(state ? 'bulan' : 'tahun');
    }, [state]);

    const fetchData = useCallback(
        async (page: number) => {
            setLoading(true);
            try {
                const response = await axios.get('/api/get-absensi/index', {
                    params: {
                        periode: date,
                        mode: params,
                        page,
                        limit,
                        search: debouncedSearch || undefined,
                    },
                });
                setData(response.data.data);
                setCurrentPage(response.data.currentPage);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        },
        [date, params, limit, debouncedSearch],
    );

    useEffect(() => {
        fetchData(currentPage); // Always start from page 1 when filters change
    }, [fetchData, currentPage]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => Number(prev) + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => Number(prev) - 1);
        }
    };

    // Stable switch handler
    const handleSwitchChange = useCallback((checked: boolean) => {
        setState(checked);
    }, []);

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Daftar Hadir" />
                <div className="flex h-full flex-col gap-2 rounded-xl p-4">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="px-2 font-bold">Tahun</div>
                            <Switch checked={state} onCheckedChange={handleSwitchChange} />
                            <div className="px-2 font-bold">Bulan</div>
                        </div>
                        <div>
                            {state ? <CustomMonthPicker onMonthChange={setDate} /> : <CustomYearPicker onYearChange={(year) => setDate(year)} />}
                        </div>
                    </div>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-auto overflow-hidden rounded-xl border">
                            <div className="flex justify-end gap-3 lg:gap-6">
                                <ExportButton priode={date} mode={params}/>
                                <InsertDataDH />
                            </div>
                            <CardDH jumlah_siswa_m={Number(count.masuk)} jumlah_siswa_s={Number(count.keluar)} />
                        </div>
                    </div>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                        <div className="border-sidebar-border dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                            <DataTableDH datas={data} loading={loading} error={error} setSearch={setSearchValue} />
                            <div className="flex items-center justify-between p-4">
                                <Button
                                    variant={'outline'}
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-md hover:bg-primary hover:text-primary-foreground"
                                >
                                    Previous
                                </Button>
                                <span>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button onClick={handleNextPage} disabled={currentPage === totalPages} className="py- rounded-md px-4">
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
