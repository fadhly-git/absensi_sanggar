import { CardSaldo } from '@/components/card-saldo';
import { CustomMonthPicker, CustomYearPicker } from '@/components/month-picker';
import { DataTableKeuangan } from '@/components/keuangan/data-table';
import { KeuanganTabs } from '@/components/keuangan/form-keuangan';
import { ExportButtonFinancial } from '@/components/keuangan/export-data';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Keuangan',
        href: 'keuangan',
    },
];

export type saldo = {
    saldo_terakhir: number;
    saldo_sebelumnya: number;
};

export type DataKeuangan = {
    id: number;
    tanggal: string;
    keterangan: string;
    jumlah: number;
};

export default function Keuangan() {
    const [params, setParams] = useState('');
    const [state, setState] = useState(false);
    const [saldo, setSaldo] = useState<saldo>({ saldo_terakhir: 0, saldo_sebelumnya: 0 });
    const [uangMasuk, setUangMasuk] = useState<DataKeuangan[]>([]);
    const [uangKeluar, setUangKeluar] = useState<DataKeuangan[]>([]);
    const year = new Date().getFullYear().toString();
    const [date, setDate] = useState(year);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!state) {
            setParams('year');
        } else {
            setParams('month');
        }
    }, [state]);

    useEffect(() => {
        setSaldo({ saldo_terakhir: 0, saldo_sebelumnya: 0 });
        if (success) {
            axios
                .get('/api/atmin/keuangan/get-saldo')
                .then((response) => {
                    setSaldo(response.data);
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            axios
                .get('/api/atmin/keuangan/get-saldo')
                .then((response) => {
                    setSaldo(response.data);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [success]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseMsk = await axios.get(`/api/atmin/keuangan/index?date=${date}&params=${params}&type=masuk`);
                setUangMasuk(responseMsk.data);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Error fetching uang masuk:', error.response);
                } else {
                    console.error('Error fetching uang masuk:', error);
                }
            }

            try {
                const responseKlr = await axios.get(`/api/atmin/keuangan/index?date=${date}&params=${params}&type=keluar`);
                setUangKeluar(responseKlr.data);
            } catch (error) {
                console.error('Error fetching uang keluar:', error);
            }
        };

        if (params === 'month') {
            const [year, month] = date.split('-');
            if (!year || !month || month.length !== 2 || year.length !== 4) {
                return;
            } else {
                fetchData();
            }
        } else if (params === 'year') {
            fetchData();
        }
    }, [date, params, success]);

    const formattedUangMasuk = uangMasuk.map((item) => ({
        ...item,
        jumlah: Number(item.jumlah),
    }));

    const onMonthChange = (month: string) => {
        setDate(month);
    };

    const onYearChange = (year: string) => {
        setDate(year);
    };
    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Keuangan" />
                <div className="flex h-full flex-col gap-2 rounded-xl p-4">
                    <div className="mb-3 flex w-full justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className='flex items-center gap-2'>
                                <div className="px-2 font-bold">Tahun</div> {/* Tidak perlu w-fit, biarkan flex mengatur */}
                                <Switch checked={state} onCheckedChange={setState} />
                                <div className="px-2 font-bold">Bulan</div> {/* Hapus w-full */}
                            </div>
                            <div>
                                {state ? <CustomMonthPicker onMonthChange={onMonthChange} /> : <CustomYearPicker onYearChange={onYearChange} />}
                            </div>
                        </div>
                    </div>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-auto overflow-hidden rounded-xl border">
                            <div className="flex justify-end">
                                <ExportButtonFinancial date={date} param={params} />
                                <KeuanganTabs success={() => setSuccess(!success)} />
                            </div>
                            <CardSaldo saldo_sebelumnya={Number(saldo?.saldo_sebelumnya)} saldo_terakhir={Number(saldo?.saldo_terakhir)} />
                        </div>
                    </div>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                            <DataTableKeuangan datas={formattedUangMasuk} type="masuk" setSuccess={() => setSuccess(!success)} success={success} />
                        </div>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                            <DataTableKeuangan datas={uangKeluar} type="keluar" setSuccess={() => setSuccess(!success)} success={success} />
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
