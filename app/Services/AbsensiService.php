<?php

namespace App\Services;

use App\Http\Requests\StoreAbsensiRequest;
use App\Models\Absensi;
use App\Models\Siswa;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AbsensiService
{
    /**
     * Bulk save absensi dengan optimasi
     */
    public function saveFromRequest(StoreAbsensiRequest $request): array
    {
        $dataToInsert = $request->getAbsensiDataForInsert();

        if (empty($dataToInsert)) {
            throw new \InvalidArgumentException('Tidak ada data untuk disimpan.');
        }

        return DB::transaction(function () use ($dataToInsert) {
            $tanggal = $dataToInsert[0]['tanggal'];
            $siswaIds = collect($dataToInsert)->pluck('id_siswa')->toArray();

            // Hapus data lama hanya untuk siswa yang akan diupdate
            Absensi::where('tanggal', $tanggal)
                ->whereIn('id_siswa', $siswaIds)
                ->delete();

            // Bulk insert dengan chunk untuk performa
            $chunks = array_chunk($dataToInsert, 100);
            $totalInserted = 0;

            foreach ($chunks as $chunk) {
                Absensi::insert($chunk);
                $totalInserted += count($chunk);
            }

            return [
                'total_inserted' => $totalInserted,
                'tanggal' => $tanggal
            ];
        });
    }

    /**
     * Get siswa list yang efisien
     */
    public function getActiveSiswaForAbsensi(): array
    {
        return Siswa::select(['id', 'nama', 'alamat'])
            ->where('status', 1)
            ->whereNull('deleted_at')
            ->orderBy('nama')
            ->get()
            ->toArray();
    }
}