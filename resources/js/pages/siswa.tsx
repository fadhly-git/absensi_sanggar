import { CardSiswa } from '@/components/siswa/card-siswa';
import { DataTableSiswa } from '@/components/siswa/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Siswa',
        href: '/siswa',
    },
];

export type siswa = {
    siswa_aktif: number;
    siswa_nonaktif: number;
};

export default function Siswa() {
    const [siswa, setSiswa] = useState<siswa>({ siswa_aktif: 0, siswa_nonaktif: 0 });

    useEffect(() => {
        axios
            .get('/api/atmin/siswa/get-siswa-aktif')
            .then((response) => {
                setSiswa(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);
    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Siswa" />
                <div className="flex h-full flex-col gap-2 rounded-xl p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-auto overflow-hidden rounded-xl border">
                            <CardSiswa siswa_aktif={Number(siswa.siswa_aktif)} siswa_nonaktif={Number(siswa.siswa_nonaktif)} />
                        </div>
                    </div>
                    <div className="grid auto-rows-min gap-4 md:grid-cols-1">
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border">
                            <DataTableSiswa />
                        </div>
                    </div>
                </div>
                {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    </div> */}
            </AppLayout>
        </>
    );
}
