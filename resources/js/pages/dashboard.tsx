// import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Cookies from 'js-cookie';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: 'atmin/dashboard',
    },
];

export default function Dashboard() {
    useEffect(() => {
        const token = Cookies.get('auth_token');
        if (token) {
            // Simpan token ke localStorage atau gunakan langsung
            localStorage.setItem('auth_token', token);
            // console.log('Token saved to localStorage:', token);
        }
    }, []);
    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <SectionCards />
                            <div className="px-4 lg:px-6">
                                {/* <ChartAreaInteractive /> */}
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
