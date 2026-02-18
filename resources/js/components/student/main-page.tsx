// resources/js/components/student/main-page.tsx
import { useAbsensiRiwayat } from '@/hooks/useAbsensiRiwayat';
import { useEffect, useState } from 'react';
import { AbsensiGrid } from './absensi-grid';

interface MainPageProps {
    userId: number;
}

export function MainPage({ userId }: MainPageProps) {
    const tahun = new Date().getFullYear();
    const { data, isLoading } = useAbsensiRiwayat(userId, 'tahun', 7, tahun);

    const [bulanPerBaris, setBulanPerBaris] = useState(2);

    useEffect(() => {
        const updateBulanPerBaris = () => {
            setBulanPerBaris(window.innerWidth < 1024 ? 2 : 3);
        };

        updateBulanPerBaris();
        window.addEventListener('resize', updateBulanPerBaris);
        return () => window.removeEventListener('resize', updateBulanPerBaris);
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Riwayat Absensi Tahun {tahun}</h3>
            <AbsensiGrid
                absensi={data?.absensi ?? data ?? {}}
                isLoading={isLoading}
                maxCol={3}
                maxRow={3}
                bulanPerBaris={bulanPerBaris}
            />
        </div>
    );
}
