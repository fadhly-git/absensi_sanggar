import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import StudentLayout from '@/layouts/student-layout';
import StudentSettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <StudentLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan tampilan" />

            <StudentSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Pengaturan tampilan" description="Perbarui pengaturan tampilan akun Anda" />
                    <AppearanceTabs />
                </div>
            </StudentSettingsLayout>
        </StudentLayout>
    );
}
