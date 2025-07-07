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
                throw new \Exception('Beberapa siswa sudah absen di tanggal ini: ' . implode(', ', $sudahAbsenIds));
            }

            // Hapus data lama hanya untuk siswa yang akan diupdate
            Absensi::where('tanggal', $tanggal)
                ->whereIn('id_siswa', $siswaIds)
                ->delete();

            // --- BONUS LOGIC START ---
            foreach ($dataToInsert as &$data) {
                // Hitung total absensi sebelum hari ini
                $count = Absensi::where('id_siswa', $data['id_siswa'])
                    ->where('tanggal', '<', $tanggal)
                    ->count();

                // Jika absensi ke-(kelipatan 21), set bonus true
                $nextCount = $count + 1; // +1 karena absensi hari ini
                $data['bonus'] = ($nextCount % 21 === 0);
            }
            unset($data);
            // --- BONUS LOGIC END ---

            // Bulk insert dengan chunk untuk performa
            $chunks = array_chunk($dataToInsert, 100);
            $totalInserted = 0;

            foreach ($chunks as $chunk) {
                Absensi::insert($chunk);
                $totalInserted += count($chunk);
            }

            Log::info('success' . $totalInserted . '' . $tanggal);

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
        return Siswa::with('user')
            ->select([
                'siswas.id as id',
                'siswas.alamat',
                'siswas.user_id'
            ])
            ->where('status', 1)
            ->whereNull('siswas.deleted_at')
            ->whereDoesntHave('absensis', function ($q) use ($tanggal) {
                $q->where('tanggal', $tanggal);
            })
            ->join('users', 'siswas.user_id', '=', 'users.id')
            ->orderBy('users.name')
            ->get()
            ->map(function ($siswa) {
                return [
                    'id' => $siswa->id,
                    'nama' => $siswa->user->name ? $siswa->user->name : 'Data Tidak Tersedia atau Terhapus',
                    'alamat' => $siswa->alamat,
                    'status_text' => $siswa->status ? 'Aktif' : 'Tidak Aktif'
                ];
            })
            ->toArray();
    }

    public function deleteAbsensi($id)
    {
        Absensi::findOrFail($id)->delete();
        Cache::tags(['absensi', 'report', 'stats'])->flush();
    }
}