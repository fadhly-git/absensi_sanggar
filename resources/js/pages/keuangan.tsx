import { CustomMonthPicker, CustomYearPicker } from '@/components/components/month-picker';
import { DataTableKeuangan } from '@/components/keuangan/data-table';
import { KeuanganTabs } from '@/components/keuangan/form-keuangan';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

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
export default function Keuangan() {
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
                    <div className="mb-3 flex w-full max-w-screen items-center">
                        <div className="flex-1 text-center">
                            <div className="flex items-center justify-center">
                                <span className="px-2 font-bold">Tahun</span>
                                <Switch checked={state} onCheckedChange={setState} />
                                <span className="px-2 font-bold">Bulan</span>
                                {state ? <CustomMonthPicker onMonthChange={onMonthChange} /> : <CustomYearPicker onYearChange={onYearChange} />}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <KeuanganTabs />
                        </div>
                    </div>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                            <DataTableKeuangan />
                        </div>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    </div>
                    <div className="flex h-full max-w-screen flex-1 flex-col gap-4 rounded-xl">
                        <div className="border-sidebar-border/70 dark:border-sidebar-bsorder relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                            <DataTableKeuangan />
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
