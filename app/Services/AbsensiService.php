<?php

namespace App\Services;

use App\Http\Requests\StoreAbsensiRequest;
use App\Models\Absensi;
use App\Models\Siswa;
use Illuminate\Support\Facades\Cache;
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

            // Cek siswa yang sudah absen di tanggal ini
            $sudahAbsenIds = Absensi::where('tanggal', $tanggal)
                ->whereIn('id_siswa', $siswaIds)
                ->pluck('id_siswa')
                ->toArray();

            if (!empty($sudahAbsenIds)) {
                // Bisa throw error atau skip siswa yang sudah absen
                throw new \Exception('Beberapa siswa sudah absen di tanggal ini: ' . implode(', ', $sudahAbsenIds));
                // Atau: $dataToInsert = array_filter($dataToInsert, fn($d) => !in_array($d['id_siswa'], $sudahAbsenIds));
            }

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

            Log::info('sUCCES' . $totalInserted . '' . $tanggal);

            Cache::tags(['absensi', 'report', 'stats'])->flush();

            return [
                'total_inserted' => $totalInserted,
                'tanggal' => $tanggal
            ];
        });
    }

    /**
     * Get siswa list yang efisien
     */
    public function getActiveSiswaForAbsensi(string $tanggal): array
    {
        return Siswa::select(['id', 'nama', 'alamat'])
            ->where('status', 1)
            ->whereNull('deleted_at')
            ->whereDoesntHave('absensis', function ($q) use ($tanggal) {
                $q->where('tanggal', $tanggal);
            })
            ->orderBy('nama')
            ->get()
            ->toArray();
    }

    public function deleteAbsensi($id)
    {
        Absensi::findOrFail($id)->delete();
        Cache::tags(['absensi', 'report', 'stats'])->flush();
    }
}