import GuestLayout from '@/layouts/guest-layout';
import { DataTableDH } from '@/pages/table/data-table';
import { Head } from '@inertiajs/react';
import React from 'react';

const App: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = React.useState('2024-3');

    const handleMonthChange = (month: string) => {
        setSelectedMonth(month);
    };
    return (
        <>
            <Head title="Attendance" />
            <GuestLayout onMonthChange={handleMonthChange}>
                <div className="flex h-full max-w-screen flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                        <DataTableDH date="2025" params="tahun" />
                    </div>
                </div>
            </GuestLayout>
        </>
    );
};

export default App;
