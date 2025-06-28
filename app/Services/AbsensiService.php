<?php

namespace App\Services;

use App\Http\Requests\StoreAbsensiRequest;
use App\Models\Absensi;
use Illuminate\Support\Facades\DB;

class AbsensiService
{
    /**
     * Menyimpan data absensi dari request.
     * Logika ini dipindahkan dari controller.
     *
     * @param StoreAbsensiRequest $request
     * @return void
     */
    public function saveFromRequest(StoreAbsensiRequest $request): void
    {
        // Di sini kita asumsikan StoreAbsensiRequest sudah melakukan semua validasi
        // dan persiapan data yang diperlukan, seperti yang terlihat pada kode controller Anda.
        
        // Kode Anda menggunakan method `getAbsensiDataForInsert()` pada request,
        // kita akan teruskan pola itu. Pastikan method itu ada di StoreAbsensiRequest.
        // Jika tidak ada, kita bisa gunakan $request->validated()['data']
        $dataToInsert = $request->getAbsensiDataForInsert();

        if (empty($dataToInsert)) {
            // Sebaiknya throw exception agar bisa ditangkap di controller
            throw new \InvalidArgumentException('Tidak ada data untuk disimpan.');
        }

        // Gunakan transaksi untuk memastikan semua data berhasil disimpan atau tidak sama sekali.
        DB::transaction(function () use ($dataToInsert) {
            // Hapus data lama pada tanggal yang sama untuk menghindari duplikat
            // (Ini adalah praktik yang baik jika form absensi bersifat 'timpa')
            $tanggal = $dataToInsert[0]['tanggal'];
            Absensi::where('tanggal', $tanggal)->delete();

            // Lakukan bulk insert untuk performa maksimal
            Absensi::insert($dataToInsert);
        });
    }
}