import { DataDH } from '@/pages/daftar-hadir';
import { saldo } from '@/pages/keuangan';
import { siswa } from '@/pages/siswa';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { CardDH } from './card-dh';
import { CardSaldo } from './card-saldo';
import { CarAllSiswa, cardTS } from './siswa/card-all-siswa';
import { CardSiswa } from './siswa/card-siswa';

// Setup axios interceptor for authentication
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token'); // Get token from localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Attach token to Authorization header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export function SectionCards() {
    const [count, setCount] = useState<DataDH>({ masuk: 0, keluar: 0 });
    const [saldo, setSaldo] = useState<saldo>({ saldo_terakhir: 0, saldo_sebelumnya: 0 });
    const [siswa, setSiswa] = useState<siswa>({ siswa_aktif: 0, siswa_nonaktif: 0 });
    const [total_siswa, setTotalSiswa] = useState<cardTS>({ total_siswa: 0 });

    useEffect(() => {
        axios
            .get('/api/atmin/absensi/get-count-absensi')
            .then((response) => {
                setCount(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        axios
            .get('/api/atmin/keuangan/get-saldo')
            .then((response) => {
                setSaldo(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

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

    useEffect(() => {
        axios
            .get('/api/atmin/siswa/get-count-all')
            .then((response) => {
                setTotalSiswa(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <CardSaldo saldo_sebelumnya={Number(saldo?.saldo_sebelumnya)} saldo_terakhir={Number(saldo?.saldo_terakhir)} />
            <CarAllSiswa total_siswa={total_siswa?.total_siswa} />
            <CardSiswa siswa_aktif={siswa?.siswa_aktif} siswa_nonaktif={siswa?.siswa_nonaktif} />
            <CardDH jumlah_siswa_m={Number(count?.masuk)} jumlah_siswa_s={Number(count.keluar)} />
        </div>
    );
}
