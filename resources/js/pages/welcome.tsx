import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { CustomMonthPicker, CustomYearPicker } from '@/components/month-picker';
import { DataTableDH } from '@/pages/table/data-table';
import GuestLayout from '@/layouts/guest-layout';
import { Head } from '@inertiajs/react';
import { Siswa } from '@/pages/table/data-table';

const App: React.FC = () => {
    const limit = 35;
    const [data, setData] = useState<Siswa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [params, setParams] = useState('bulan');
    const [state, setState] = useState(true);

    const year = new Date().getFullYear().toString();
    const month = new Date().getMonth() + 1;
    const monthString = month < 10 ? `${year}-0${month}` : `${year}-${month}`;
    const [date, setDate] = useState(monthString);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
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

    // Fetch data function
    const fetchData = useCallback(async (page: number) => {
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
    }, [date, params, limit, debouncedSearch]);

    // Fetch data when dependencies change
    useEffect(() => {
        fetchData(currentPage); // Always start from page 1 when filters change
    }, [fetchData, currentPage]);

    // Handle page changes
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => Number(prev) + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => Number(prev) - 1);
        }
    };

    // Stable switch handler
    const handleSwitchChange = useCallback((checked: boolean) => {
        setState(checked);
    }, []);

    return (
        <>
            <Head title="Attendance" />
            <GuestLayout>
                <div className="flex h-full max-w-screen flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="mb-3 flex w-full justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className='flex items-center gap-2'>
                                <div className="px-2 font-bold">Tahun</div>
                                <Switch checked={state} onCheckedChange={handleSwitchChange} />
                                <div className="px-2 font-bold">Bulan</div>
                            </div>
                            <div>
                                {state ?
                                    <CustomMonthPicker onMonthChange={setDate} /> :
                                    <CustomYearPicker onYearChange={(year) => setDate(year)} />
                                }
                            </div>
                        </div>
                    </div>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                        <div className="border-sidebar-border dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                            <DataTableDH
                                datas={data}
                                loading={loading}
                                error={error}
                                setSearch={setSearchValue}
                            />
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
                                <Button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-md"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </GuestLayout>
        </>
    );
};

export default App;
