import { CustomMonthPicker, CustomYearPicker } from '@/components/components/month-picker';
import { DataDH } from '@/components/daftar-hadir/tambahdaftar';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { DataTableDH } from './table/data-table';

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

export default function DaftarHadir() {
    const [params, setParams] = useState('');
    const [state, setState] = useState(false);
    const year = new Date().getFullYear().toString();
    const [date, setDate] = useState(year);

    useEffect(() => {
        if (!state) {
            setParams('tahun');
        } else {
            setParams('bulan');
        }
    }, [state]);

    const onMonthChange = (month: string) => {
        setDate(month);
    };

    const onYearChange = (year: string) => {
        setDate(year);
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-col justify-center gap-2 rounded-xl p-4">
                    <div className="mb-3 flex w-full items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="px-2 font-bold">Tahun</span>
                            <Switch checked={state} onCheckedChange={setState} />
                            <span className="px-2 font-bold">Bulan</span>
                            {state ? <CustomMonthPicker onMonthChange={onMonthChange} /> : <CustomYearPicker onYearChange={onYearChange} />}
                            <div className="flex justify-end">
                                <DataDH />
                            </div>
                        </div>
                    </div>
                    <div className="flex h-full max-w-screen flex-1 flex-col gap-4 rounded-xl">
                        <div className="border-sidebar-border/70 dark:border-sidebar-bsorder relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                            <DataTableDH date={date} params={params} />
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
