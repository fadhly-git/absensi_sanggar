import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Impor komponen UI dan tipe data yang Anda gunakan
import { CardSaldo } from '@/components/card-saldo';
import { CustomMonthPicker, CustomYearPicker } from '@/components/month-picker';
import { DataTableKeuangan } from '@/components/keuangan/data-table';
import { KeuanganTabs } from '@/components/keuangan/form-keuangan';
import { ExportButtonFinancial } from '@/components/keuangan/export-data';
import { Switch } from '@/components/ui/switch';
import { type BreadcrumbItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

// Impor fungsi API yang sudah kita buat
import { fetchSaldo, fetchTransactions } from '@/services/keuanganApi';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Keuangan', href: route('keuangan.index') }, // Sesuaikan nama route jika perlu
];

export default function Keuangan() {
    const [isMonthView, setIsMonthView] = useState(false);
    const [date, setDate] = useState(new Date().getFullYear().toString());
    const params = isMonthView ? 'month' : 'year';

    // Query 1: Mengambil data saldo, dengan caching.
    const { data: saldo, isLoading: isSaldoLoading } = useQuery({
        queryKey: ['saldo'],
        queryFn: fetchSaldo,
    });

    // Query 2: Mengambil data uang masuk.
    const { data: uangMasuk, isLoading: isMasukLoading } = useQuery({
        queryKey: ['transactions', 'masuk', date, params],
        queryFn: () => fetchTransactions('masuk', date, params),
    });

    // Query 3: Mengambil data uang keluar.
    const { data: uangKeluar, isLoading: isKeluarLoading } = useQuery({
        queryKey: ['transactions', 'keluar', date, params],
        queryFn: () => fetchTransactions('keluar', date, params),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Keuangan" />
            <div className="flex h-full flex-col gap-4 p-4">
                <div className="mb-3 flex w-full justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className='flex items-center gap-2'>
                            <div className="px-2 font-bold">Tahun</div>
                            <Switch checked={isMonthView} onCheckedChange={setIsMonthView} />
                            <div className="px-2 font-bold">Bulan</div>
                        </div>
                        <div>
                            {isMonthView ? (
                                <CustomMonthPicker onMonthChange={setDate} />
                            ) : (
                                <CustomYearPicker onYearChange={setDate} />
                            )}
                        </div>
                    </div>
                </div>
                <div className="border rounded-xl p-4">
                    <div className="flex justify-end gap-2">
                        <ExportButtonFinancial date={date} param={params} />
                        <KeuanganTabs />
                    </div>
                    {isSaldoLoading ? <Skeleton className="h-20 w-1/2 mt-2" /> : (
                        <CardSaldo 
                            saldo_sebelumnya={Number(saldo?.saldo_sebelumnya ?? 0)} 
                            saldo_terakhir={Number(saldo?.saldo_terakhir ?? 0)} 
                        />
                    )}
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    <div className="border rounded-xl">
                        <DataTableKeuangan datas={uangMasuk ?? []} type="masuk" isLoading={isMasukLoading} />
                    </div>
                    <div className="border rounded-xl">
                        <DataTableKeuangan datas={uangKeluar ?? []} type="keluar" isLoading={isKeluarLoading} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}